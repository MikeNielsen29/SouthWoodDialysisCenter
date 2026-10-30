export const DEV_OTP = '123456'
export const OTP_TTL_MS = 10 * 60 * 1000

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function hashOtp(code: string): string {
  return code
}

export function devOtpActive(): boolean {
  return process.env.NODE_ENV !== 'production'
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
