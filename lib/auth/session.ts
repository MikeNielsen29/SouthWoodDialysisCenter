import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import {
  OTP_COOKIE,
  SESSION_COOKIE,
  signOtpChallenge,
  verifyOtpChallenge,
  verifySession,
  type SessionClaims,
  type Role,
} from './jwt'

export type SessionUser = SessionClaims & { role: Role; isPatient: boolean }

/** Thrown by requireUser/requireRole; API routes return it as 401/403. */
export class AuthError extends Error {
  readonly status: 401 | 403

  constructor(status: 401 | 403, message: string) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}

export async function getSession(): Promise<SessionClaims | null> {
  return verifySession(await getToken())
}

export async function requireUser(nextPath: string): Promise<SessionUser> {
  const claims = await getSession()
  if (!claims) {
    throw new AuthError(401, `Unauthenticated: sign in to continue (${nextPath})`)
  }
  return { ...claims, isPatient: claims.role === 'Patient' }
}

export async function requireRole(allowed: Role[], nextPath: string): Promise<SessionUser> {
  const claims = await getSession()
  if (!claims) {
    throw new AuthError(401, `Unauthenticated: sign in to continue (${nextPath})`)
  }
  if (!allowed.includes(claims.role)) {
    throw new AuthError(403, `Forbidden: role ${claims.role} cannot access ${nextPath}`)
  }
  return { ...claims, isPatient: claims.role === 'Patient' }
}

/**
 * Server-component guard: unauthenticated or wrong role redirects to the login
 * page instead of throwing into the error boundary (middleware already covers
 * the anonymous case; this is the second, role-aware layer of §7.3).
 */
export async function requireUserOrRedirect(nextPath: string): Promise<SessionUser> {
  try {
    return await requireUser(nextPath)
  } catch {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&error=forbidden`)
  }
}

export async function requireRoleOrRedirect(
  allowed: Role[],
  nextPath: string
): Promise<SessionUser> {
  try {
    return await requireRole(allowed, nextPath)
  } catch (error) {
    if (error instanceof AuthError && error.status === 403) {
      redirect(`/login?next=${encodeURIComponent(nextPath)}&error=forbidden`)
    }
    redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  }
}

/**
 * Route Handler guard: returns a 401/403 JSON response instead of throwing, so
 * API routes answer with a status code rather than a redirect (§7.3).
 */
export async function guardRole(
  allowed: Role[],
  nextPath: string
): Promise<SessionUser | NextResponse> {
  try {
    return await requireRole(allowed, nextPath)
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 401
    return NextResponse.json({ error: 'Something went wrong' }, { status })
  }
}

/** Route Handler guard for any authenticated user; 401 JSON instead of a throw. */
export async function guardUser(nextPath: string): Promise<SessionUser | NextResponse> {
  try {
    return await requireUser(nextPath)
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 401 })
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function clearPendingCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('pending_session')
}

/** Stores the signed OTP challenge between the password and code steps. */
export async function setOtpCookie(claims: SessionClaims): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(OTP_COOKIE, await signOtpChallenge(claims), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })
}

export async function clearOtpCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(OTP_COOKIE)
}

export async function getOtpChallenge(): Promise<SessionClaims | null> {
  const cookieStore = await cookies()
  return verifyOtpChallenge(cookieStore.get(OTP_COOKIE)?.value ?? null)
}

/** Re-exports for server actions that issue sessions after a valid OTP. */
export { signSession } from './jwt'
