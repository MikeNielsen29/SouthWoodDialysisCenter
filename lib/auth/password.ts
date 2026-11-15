import bcrypt from 'bcryptjs'

const COMMON_PASSWORDS = [
  'password123',
  'password1234',
  '1234567890',
  '12345678901',
  'qwertyuiop',
  'letmein123',
  'admin12345',
  'iloveyou12',
  'southwood1',
]

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  if (!hashed) return false
  return bcrypt.compare(plain, hashed)
}

/**
 * Policy from §7.2: at least 10 characters, no obvious common passwords.
 * Returns '' when the password is acceptable.
 */
export function passwordProblem(password: string): string {
  if (password.length < 10) return 'Password must be at least 10 characters'
  if (password !== password.trim()) return 'Password must not start or end with a space'
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return 'That password is too common — choose another'
  }
  return ''
}
