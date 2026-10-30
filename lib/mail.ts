export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

export async function sendMail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!isMailConfigured()) {
    return { ok: false, error: 'Mail not configured' }
  }
  return { ok: true }
}
