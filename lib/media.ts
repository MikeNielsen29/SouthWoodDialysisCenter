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

interface VaultApiResponse {
  ok: boolean
  description: string
  data: unknown
}

async function callVault(path: string, init?: RequestInit): Promise<VaultApiResponse> {
  let response: Response
  try {
    response = await fetch(api(path), { cache: 'no-store', ...init })
  } catch {
    throw new Error('Could not reach the Media Vault. Check the hosting network access and try again.')
  }

  let payload: { ok?: unknown; description?: unknown; result?: unknown }
  try {
    payload = (await response.json()) as typeof payload
  } catch {
    throw new Error('The Media Vault returned an unreadable response.')
  }

  return {
    ok: payload.ok === true,
    description: typeof payload.description === 'string' ? payload.description.trim() : '',
    data: payload.result ?? null,
  }
}

export interface MediaVaultCheck {
  ok: boolean
  error?: string
}

/** Verifies the bot token first, then verifies the storage chat separately. */
export async function checkMediaVault(): Promise<MediaVaultCheck> {
  if (!isMediaConfigured()) {
    return { ok: false, error: 'The Media Vault is not configured. Ask an administrator.' }
  }

  const bot = await callVault('getMe')
  if (!bot.ok) {
    return {
      ok: false,
      error: bot.description
        ? `The Media Vault bot token was rejected: ${bot.description}`
        : 'The Media Vault bot token was rejected',
    }
  }

  const chat = await callVault(`getChat?chat_id=${encodeURIComponent(VAULT_CHAT)}`)
  if (!chat.ok) {
    return {
      ok: false,
      error: chat.description
        ? `The Media Vault storage chat was rejected: ${chat.description}`
        : 'The Media Vault storage chat was rejected',
    }
  }

  return { ok: true }
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

  const telegram = await callVault('sendDocument', { method: 'POST', body: form })
  const document = (telegram.data as { document?: { file_id?: string; file_size?: number } } | null)
    ?.document
  if (!telegram.ok || !document?.file_id) {
    throw new Error(
      telegram.description
        ? `The Media Vault rejected the image: ${telegram.description}`
        : 'The Media Vault rejected the image'
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
