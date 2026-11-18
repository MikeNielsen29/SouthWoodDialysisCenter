/**
 * Media Vault: public-site images live in the clinic's private storage chat,
 * which keeps both the repository and CloudBase free of binaries.
 *
 * SERVER ONLY. The vault token never leaves this module.
 */

const VAULT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? ''
const VAULT_CHAT = process.env.TELEGRAM_CHAT_ID?.trim() ?? ''

export const MEDIA_MIME = ['image/png', 'image/jpeg', 'image/webp'] as const
export const MAX_MEDIA_BYTES = 8 * 1024 * 1024

export function isMediaConfigured(): boolean {
  return Boolean(VAULT_TOKEN && VAULT_CHAT)
}

function api(method: string): string {
  return `https://api.telegram.org/bot${VAULT_TOKEN}/${method}`
}

/** Sends the image as a document so the vault keeps the exact bytes. */
export async function uploadMedia(
  file: Buffer,
  filename: string,
  mime: string
): Promise<{ fileId: string; size: number }> {
  if (!isMediaConfigured()) throw new Error('Media Vault is not configured')

  const form = new FormData()
  form.append('chat_id', VAULT_CHAT)
  form.append('document', new Blob([new Uint8Array(file)], { type: mime }), filename)
  form.append('caption', `Website media · ${filename}`)

  let response: Response
  try {
    response = await fetch(api('sendDocument'), { method: 'POST', body: form })
  } catch {
    throw new Error('Could not reach the Media Vault. Check the hosting network access and try again.')
  }

  let result: {
    ok?: boolean
    description?: unknown
    result?: { document?: { file_id?: string; file_size?: number } }
  }
  try {
    result = (await response.json()) as typeof result
  } catch {
    throw new Error('The Media Vault returned an unreadable response.')
  }

  const document = result.result?.document
  if (!result.ok || !document?.file_id) {
    const reason = typeof result.description === 'string' ? result.description.trim() : ''
    throw new Error(
      reason ? `The Media Vault rejected the image: ${reason}` : 'The Media Vault rejected the image'
    )
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
    `https://api.telegram.org/file/bot${VAULT_TOKEN}/${info.result.file_path}`,
    { cache: 'no-store' }
  )
  if (!fileResponse.ok) return null

  const mime = fileResponse.headers.get('content-type') || 'image/jpeg'
  return { buffer: Buffer.from(await fileResponse.arrayBuffer()), mime }
}
