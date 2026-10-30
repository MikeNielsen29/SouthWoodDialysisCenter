import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export const SESSION_COOKIE = 'session'
export const ADMIN_ROLES = ['Super Admin', 'Admin']
export const STAFF_ROLES = ['Super Admin', 'Admin', 'Page Editor']
export type Role = 'Super Admin' | 'Admin' | 'Page Editor' | 'Patient'

function getSecret(): string {
  return process.env.JWT_SECRET || 'southwood-dialysis-secret-key'
}

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function signSession(payload: Record<string, string | undefined>): Promise<string> {
  const ts = Math.floor(Date.now() / 1000).toString()
  const clean: Record<string, string> = {}
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined) clean[k] = v
  }
  const input = `${ts}\n${JSON.stringify(clean)}`
  return hmacSha256Hex(getSecret(), input)
}

export async function verifySession(token: string): Promise<boolean> {
  if (!token) return false
  try {
    const secret = getSecret()
    const decoded = await hmacSha256Hex(secret, token)
    return decoded.length > 0
  } catch {
    return false
  }
}

export async function guardRole(allowedRoles: string[], redirectTo: string): Promise<NextResponse | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  const isAuth = await verifySession(token ?? '')
  if (!isAuth) {
    return redirect(redirectTo)
  }
  return null
}

export async function requireRoleOrRedirect(roles: string[], redirectTo: string): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value
  const isAuth = await verifySession(token ?? '')
  if (!isAuth) {
    redirect(redirectTo)
  }
}

export async function requireUserOrRedirect(redirectTo: string): Promise<{ cn: string; role: string } | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  const isAuth = await verifySession(token ?? '')
  if (!isAuth) {
    redirect(redirectTo)
  }
  return null
}
