import { createHash } from 'node:crypto'

const HASH_PEPPER = process.env.HASH_PEPPER || ''

export async function hashPassword(password: string): Promise<string> {
  return createHash('sha256').update(`${password}:${HASH_PEPPER}`).digest('hex')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false
  const computed = createHash('sha256').update(`${password}:${HASH_PEPPER}`).digest('hex')
  return computed === hash
}

export function passwordProblem(password: string): string | null {
  if (!password || password.length < 8) return 'Password must be at least 8 characters'
  return null
}
