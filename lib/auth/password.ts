async function sha256Hex(input: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashPassword(password: string): Promise<string> {
  return sha256Hex(`${password}:${process.env.HASH_PEPPER || ''}`)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false
  const computed = await sha256Hex(`${password}:${process.env.HASH_PEPPER || ''}`)
  return computed === hash
}

export function passwordProblem(password: string): string | null {
  if (!password || password.length < 8) return 'Password must be at least 8 characters'
  return null
}
