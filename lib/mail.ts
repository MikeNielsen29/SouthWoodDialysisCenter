/**
 * Outbound email via Resend (server-side only — the API key never reaches the
 * browser). Used for login OTP and appointment reminders (§4 decision 4).
 */
export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.MAIL_FROM?.trim())
}

export async function sendMail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean }> {
  if (!isMailConfigured()) return { ok: false }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [to],
        subject,
        html,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      // Details stay server-side.
      console.error(`[mail] resend responded with ${response.status}`)
      return { ok: false }
    }
    return { ok: true }
  } catch {
    console.error('[mail] could not reach resend')
    return { ok: false }
  }
}
