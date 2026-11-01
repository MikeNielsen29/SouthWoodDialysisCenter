import { createHash, randomInt } from 'node:crypto'
import { isMailConfigured } from '@/lib/mail'

/** Six digits, uniformly random (crypto-backed). */
export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

/** Codes are stored hashed with the server pepper; the plaintext never reaches Sheets. */
export function hashOtp(code: string): string {
  const pepper = process.env.HASH_PEPPER || ''
  return createHash('sha256').update(`${code}:${pepper}`).digest('hex')
}

export const OTP_TTL_MS = 10 * 60 * 1000
export const OTP_MAX_ATTEMPTS = 5

/**
 * Local development convenience: without an email provider the only way to log
 * in is the fixed code below. It is impossible in production, and disabled as
 * soon as RESEND_API_KEY is set.
 */
export const DEV_OTP = '000000'

export function devOtpActive(): boolean {
  return process.env.NODE_ENV !== 'production' && !isMailConfigured()
}
