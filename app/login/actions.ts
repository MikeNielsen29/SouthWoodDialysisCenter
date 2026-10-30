'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { hashPassword, passwordProblem, verifyPassword } from '@/lib/auth/password'
import { DEV_OTP, generateOtp, hashOtp, devOtpActive, OTP_TTL_MS } from '@/lib/auth/otp'
import { signSession, type Role } from '@/lib/auth/jwt'
import {
  clearOtpCookie,
  clearSessionCookie,
  getSession,
  getOtpChallenge,
  setOtpCookie,
  setSessionCookie,
} from '@/lib/auth/session'
import { isMailConfigured, sendMail } from '@/lib/mail'
import { logAudit } from '@/lib/audit'

/** Row shape returned by `auth.findUser` (strings, per Sheets conventions). */
type UserRow = {
  id: string
  cn: string
  full_name?: string
  email?: string
  role: Role
  password_hash?: string
  is_active?: string
  must_change_password?: string
  otp_required?: string
  locked_until?: string
}

const CredentialsSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your control number or email').max(254),
  password: z.string().min(1, 'Enter your password').max(200),
  next: z.string().max(512).optional().default(''),
})

const OtpSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  next: z.string().max(512).optional().default(''),
})

const ChangePasswordSchema = z.object({
  current: z.string().min(1).max(200),
  password: z.string().max(200),
})

/** Only same-site paths may be used as a redirect target (no open redirects). */
function safeNext(next: string): string {
  return next.startsWith('/') && !next.startsWith('//') ? next : ''
}

function homeFor(role: Role): string {
  return role === 'Patient' ? '/portal' : '/admin'
}

function hashWithPepper(value: string): string {
  const pepper = process.env.HASH_PEPPER || ''
  return createHash('sha256').update(`${value}:${pepper}`).digest('hex')
}

async function requestMeta(): Promise<{ ip_hash: string; ua_hash: string }> {
  const h = headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || ''
  const ua = h.get('user-agent') || ''
  return { ip_hash: ip ? hashWithPepper(ip) : '', ua_hash: ua ? hashWithPepper(ua) : '' }
}

function fail(next: string, message: string, step?: 'otp'): never {
  const params = new URLSearchParams()
  params.set('error', message)
  if (next) params.set('next', next)
  if (step) params.set('step', step)
  redirect(`/login?${params.toString()}`)
}

async function recordAttempt(identifier: string, success: boolean): Promise<void> {
  if (!isSheetsConfigured()) return
  const { ip_hash, ua_hash } = await requestMeta()
  try {
    await callSheets('auth.recordAttempt', { identifier, ip_hash, ua_hash, success })
  } catch {
    console.error('[auth] could not record login attempt')
  }
}

async function findUser(identifier: string): Promise<UserRow | null> {
  const raw = await callSheets('auth.findUser', { cn: identifier })
  return (raw as UserRow | null) ?? null
}

/**
 * Step 1 — password. On success a one-time code is created and the user is
 * moved to the OTP step (§7.1). Generic errors: never reveal whether the
 * account exists.
 */
export async function loginAction(formData: FormData): Promise<void> {
  const parsed = CredentialsSchema.safeParse({
    identifier: formData.get('cn') ?? '',
    password: formData.get('password') ?? '',
    next: formData.get('next') ?? '',
  })
  if (!parsed.success) fail('', 'Enter your control number and password')

  const { identifier, password } = parsed.data
  const next = safeNext(parsed.data.next)

  if (!isSheetsConfigured()) {
    fail(
      next,
      'The database is not connected yet. Add GS_WEBAPP_URL and GS_SHARED_SECRET to the environment.'
    )
  }

  let user: UserRow | null = null
  try {
    user = await findUser(identifier)
  } catch {
    fail(next, 'Could not reach the database. Please try again later.')
  }

  const generic = 'Incorrect control number/email or password.'
  if (!user || user.is_active === 'FALSE') {
    await recordAttempt(identifier, false)
    fail(next, generic)
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    await recordAttempt(identifier, false)
    fail(next, 'Too many failed attempts. This account is locked for 15 minutes.')
  }

  const passwordOk = await verifyPassword(password, user.password_hash || '')
  if (!passwordOk) {
    try {
      await callSheets('auth.registerFailure', { id: user.id })
    } catch {
      console.error('[auth] could not register failure')
    }
    await recordAttempt(identifier, false)
    fail(next, generic)
  }

  // Password accepted.
  try {
    await callSheets('auth.clearFailures', { id: user.id })
  } catch {
    console.error('[auth] could not clear failures')
  }
  await recordAttempt(identifier, true)

  const otpRequired = user.otp_required !== 'FALSE'

  if (!otpRequired) {
    await issueSession(user, next)
    return
  }

  const code = devOtpActive() ? DEV_OTP : generateOtp()
  try {
    await callSheets('auth.setOtp', {
      user_id: user.id,
      code_hash: hashOtp(code),
      purpose: 'login',
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    })
  } catch {
    fail(next, 'Could not create a verification code. Please try again later.')
  }

  if (!devOtpActive()) {
    if (!isMailConfigured() || !user.email) {
      fail(next, 'Email is not configured for verification codes.')
    }
    const sent = await sendMail(
      user.email,
      'Your Southwood sign-in code',
      `<p>Your sign-in code is:</p><p style="font-size:28px;letter-spacing:8px;font-weight:700">${code}</p><p>It expires in 10 minutes. If you did not request this, ignore this email.</p>`
    )
    if (!sent.ok) {
      fail(next, 'We could not send the code. Please try again later.')
    }
  }

  await setOtpCookie({
    sub: user.id,
    cn: user.cn,
    role: user.role,
    full_name: user.full_name,
    email: user.email,
  })

  const params = new URLSearchParams({ step: 'otp' })
  if (next) params.set('next', next)
  redirect(`/login?${params.toString()}`)
}

/** Step 2 — verify the one-time code and issue the session. */
export async function verifyOtpAction(formData: FormData): Promise<void> {
  const parsed = OtpSchema.safeParse({
    code: formData.get('code') ?? '',
    next: formData.get('next') ?? '',
  })
  if (!parsed.success) fail('', 'Enter the 6-digit code', 'otp')

  const next = safeNext(parsed.data.next)
  const challenge = await getOtpChallenge()
  if (!challenge || !challenge.sub) {
    fail(next, 'Your sign-in attempt expired. Please sign in again.')
  }

  let valid = false
  try {
    const result = await callSheets('auth.consumeOtp', {
      user_id: challenge.sub,
      code_hash: hashOtp(parsed.data.code),
    })
    valid = Boolean((result as { valid?: boolean } | null)?.valid)
  } catch {
    fail(next, 'Could not verify the code. Please try again later.')
  }

  if (!valid) {
    fail(next, 'Invalid or expired code.', 'otp')
  }

  await clearOtpCookie()

  // Refresh role/active state before issuing the session.
  let user: UserRow | null
  try {
    user = await findUser(challenge.cn)
  } catch {
    user = null
  }
  if (!user || user.is_active === 'FALSE') {
    fail(next, 'Incorrect control number/email or password.')
  }

  await issueSession(user, next)
}

async function issueSession(user: UserRow, next: string): Promise<void> {
  const token = await signSession({
    sub: user.id,
    cn: user.cn,
    role: user.role,
    full_name: user.full_name,
    email: user.email,
  })
  await setSessionCookie(token)

  try {
    await callSheets('auth.touchLogin', { id: user.id })
  } catch {
    console.error('[auth] could not update last_login_at')
  }

  const { ip_hash } = await requestMeta()
  await logAudit({
    id: crypto.randomUUID(),
    actor_id: user.id,
    actor_role: user.role,
    action: 'auth.login',
    entity: 'user',
    entity_id: user.id,
    meta_json: JSON.stringify({ cn: user.cn }),
    ip_hash,
    created_at: new Date().toISOString(),
  })

  if (user.must_change_password === 'TRUE') {
    redirect(`/login/password?next=${encodeURIComponent(safeNext(next) || homeFor(user.role))}`)
  }

  redirect(safeNext(next) || homeFor(user.role))
}

export async function logoutAction(): Promise<void> {
  const session = await getSession()
  await clearSessionCookie()
  await clearOtpCookie()

  if (session) {
    const { ip_hash } = await requestMeta()
    await logAudit({
      id: crypto.randomUUID(),
      actor_id: session.sub,
      actor_role: session.role,
      action: 'auth.logout',
      entity: 'user',
      entity_id: session.sub,
      meta_json: '{}',
      ip_hash,
      created_at: new Date().toISOString(),
    })
  }

  redirect('/')
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const parsed = ChangePasswordSchema.safeParse({
    current: formData.get('current') ?? '',
    password: formData.get('password') ?? '',
  })
  if (!parsed.success) {
    redirect(`/login/password?error=${encodeURIComponent('Enter your current and new password')}`)
  }

  const session = await getSession()
  if (!session) redirect('/login')

  const backTo = '/login/password'
  if (!isSheetsConfigured()) {
    redirect(`${backTo}?error=${encodeURIComponent('The database is not connected yet.')}`)
  }

  let user: UserRow | null = null
  try {
    user = await findUser(session.cn)
  } catch {
    user = null
  }
  if (!user) {
    redirect(`${backTo}?error=${encodeURIComponent('Could not find your account.')}`)
  }

  const currentOk = await verifyPassword(parsed.data.current, user.password_hash || '')
  if (!currentOk) {
    redirect(`${backTo}?error=${encodeURIComponent('Current password is incorrect.')}`)
  }

  const problem = passwordProblem(parsed.data.password)
  if (problem) {
    redirect(`${backTo}?error=${encodeURIComponent(problem)}`)
  }

  try {
    await callSheets('auth.setPasswordHash', {
      id: user.id,
      password_hash: await hashPassword(parsed.data.password),
    })
  } catch {
    redirect(`${backTo}?error=${encodeURIComponent('Could not save the new password.')}`)
  }

  // Re-issue the session so the `ver` claim matches the new credentials.
  const token = await signSession({
    sub: user.id,
    cn: user.cn,
    role: user.role,
    full_name: user.full_name,
    email: user.email,
  })
  await setSessionCookie(token)

  const { ip_hash } = await requestMeta()
  await logAudit({
    id: crypto.randomUUID(),
    actor_id: user.id,
    actor_role: user.role,
    action: 'auth.password_changed',
    entity: 'user',
    entity_id: user.id,
    meta_json: '{}',
    ip_hash,
    created_at: new Date().toISOString(),
  })

  redirect(homeFor(user.role))
}
