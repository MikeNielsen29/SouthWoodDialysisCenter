import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE } from './jwt'

export type SessionUser = {
  sub: string
  cn: string
  role: string
  full_name?: string
  email?: string
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    return { sub: token, cn: token, role: 'Patient', full_name: undefined, email: undefined }
  } catch {
    return null
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
}

export function setOtpCookie(data: { sub: string; cn: string; role: string; full_name?: string; email?: string }): void {
  // No-op server-side cookie placeholder
}

export function getOtpChallenge(): { sub: string; cn: string; role: string } | null {
  return null
}

export function clearOtpCookie(): void {
  // No-op placeholder
}

export async function requireUser(redirectTo: string): Promise<SessionUser> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) {
    redirect(redirectTo)
  }
  return { sub: token, cn: token, role: 'Patient', full_name: undefined, email: undefined }
}

export async function requireUserOrRedirect(redirectTo: string): Promise<SessionUser> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) {
    redirect(redirectTo)
  }
  return { sub: token, cn: token, role: 'Patient', full_name: undefined, email: undefined }
}

export async function guardUser(redirectTo: string): Promise<SessionUser | NextResponse> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) {
    return redirect(redirectTo)
  }
  return { sub: token, cn: token, role: 'Patient', full_name: undefined, email: undefined }
}

export async function requireRoleOrRedirect(roles: string[], redirectTo: string): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) {
    redirect(redirectTo)
  }
}

export async function guardRole(roles: string[], redirectTo: string): Promise<SessionUser | NextResponse> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) {
    return redirect(redirectTo)
  }
  return { sub: token, cn: token, role: 'Patient', full_name: undefined, email: undefined }
}
