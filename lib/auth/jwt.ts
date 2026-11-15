import { SignJWT, jwtVerify } from 'jose'
import type { Role } from '@/lib/sheets/types'

export type { Role }

export const ADMIN_ROLES: Role[] = ['Super Admin', 'Admin', 'Page Editor']
export const STAFF_ROLES: Role[] = ['Super Admin', 'Admin']
export const PUBLIC_ROLES: Role[] = ['Patient']
export const ALL_ROLES: Role[] = ['Super Admin', 'Admin', 'Page Editor', 'Patient']

export const SESSION_COOKIE = 'session'
export const OTP_COOKIE = 'otp_challenge'
export const SESSION_HOURS = 8
export const OTP_CHALLENGE_MINUTES = 15

/** HS256 signing key. Shared by middleware (edge) and server components. */
export function sessionSecret(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    process.env.GS_SHARED_SECRET?.trim() ||
    'development-only-session-secret-do-not-deploy'
  return new TextEncoder().encode(secret)
}

/** A real secret must be configured before sessions mean anything. */
export function isConfigured(): boolean {
  return Boolean(process.env.SESSION_SECRET?.trim() || process.env.GS_SHARED_SECRET?.trim())
}

export type SessionClaims = {
  sub: string
  cn: string
  role: Role
  full_name?: string
  email?: string
  ver?: number
}

/** Signs an 8-hour HS256 session token (§7.1). Edge-safe: jose only. */
export async function signSession(claims: SessionClaims): Promise<string> {
  return await new SignJWT({ cn: claims.cn, role: claims.role, full_name: claims.full_name, email: claims.email, ver: claims.ver ?? 1 })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(sessionSecret())
}

/** Returns the claims when the token is valid and unexpired, otherwise null. */
export async function verifySession(token: string | null | undefined): Promise<SessionClaims | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ['HS256'] })
    if (!payload.sub || typeof payload.cn !== 'string' || typeof payload.role !== 'string') {
      return null
    }
    return payload as unknown as SessionClaims
  } catch {
    return null
  }
}

/**
 * Short-lived token that ties an in-flight OTP to the user who proved their
 * password. Verified between the login and OTP steps; never a session.
 */
export async function signOtpChallenge(claims: SessionClaims): Promise<string> {
  return await new SignJWT({ cn: claims.cn, role: claims.role, full_name: claims.full_name, email: claims.email, purpose: 'otp' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${OTP_CHALLENGE_MINUTES}m`)
    .sign(sessionSecret())
}

export async function verifyOtpChallenge(token: string | null | undefined): Promise<SessionClaims | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ['HS256'] })
    if (payload.purpose !== 'otp' || !payload.sub || typeof payload.cn !== 'string') return null
    return payload as unknown as SessionClaims
  } catch {
    return null
  }
}
