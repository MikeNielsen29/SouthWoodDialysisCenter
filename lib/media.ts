/**
 * Public-site media lives in the Telegram bot's private chat: it is free,
 * permanent, and keeps the repo and the spreadsheet free of binaries.
 *
 * SERVER ONLY. The bot token never leaves this module.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? ''

export const MEDIA_MIME = ['image/png', 'image/jpeg', 'image/webp'] as const
export const MAX_MEDIA_BYTES = 8 * 1024 * 1024

export function isMediaConfigured(): boolean {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)
}

function api(method: string): string {
  return `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`
}

/** Sends the image as a document so Telegram stores the exact bytes. */
export async function uploadMedia(
  file: Buffer,
  filename: string,
  mime: string
): Promise<{ fileId: string; size: number }> {
  if (!isMediaConfigured()) throw new Error('Telegram is not configured')

  const form = new FormData()
  form.append('chat_id', TELEGRAM_CHAT_ID)
  form.append('document', new Blob([new Uint8Array(file)], { type: mime }), filename)
  form.append('caption', `Website media · ${filename}`)

  const response = await fetch(api('sendDocument'), { method: 'POST', body: form })
  const result = (await response.json()) as {
    ok?: boolean
    result?: { document?: { file_id?: string; file_size?: number } }
  }

  const document = result.result?.document
  if (!result.ok || !document?.file_id) {
    throw new Error('Telegram rejected the image')
  }

  return { fileId: document.file_id, size: Number(document.file_size ?? file.length) }
}

/** Streams the stored bytes back for the public proxy route. */
export async function fetchMedia(
  fileId: string
): Promise<{ buffer: Buffer; mime: string } | null> {
  if (!isMediaConfigured()) return null

  const infoResponse = await fetch(
    api(`getFile?file_id=${encodeURIComponent(fileId)}`),
    { cache: 'no-store' }
  )
  const info = (await infoResponse.json()) as {
    ok?: boolean
    result?: { file_path?: string }
  }
  if (!info.ok || !info.result?.file_path) return null

  const fileResponse = await fetch(
    `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${info.result.file_path}`,
    { cache: 'no-store' }
  )
  if (!fileResponse.ok) return null

  const mime = fileResponse.headers.get('content-type') || 'image/jpeg'
  return { buffer: Buffer.from(await fileResponse.arrayBuffer()), mime }
}
