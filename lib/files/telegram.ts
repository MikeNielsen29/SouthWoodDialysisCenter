import crypto from 'crypto'

export const ALLOWED_MIME = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const FILE_ENCRYPTION_KEY_BASE64 = process.env.FILE_ENCRYPTION_KEY ?? ''
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? ''

export function isTelegramConfigured() {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)
}

export function isFileEncryptionConfigured() {
  return Boolean(FILE_ENCRYPTION_KEY_BASE64)
}

export async function encryptBuffer(buffer: Buffer) {
  if (!isFileEncryptionConfigured()) {
    throw new Error('FILE_ENCRYPTION_KEY is not configured')
  }

  const key = Buffer.from(FILE_ENCRYPTION_KEY_BASE64, 'base64')
  if (key.length !== 32) {
    throw new Error('FILE_ENCRYPTION_KEY must be a 32-byte base64 value')
  }

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    encrypted,
    iv,
    tag,
  }
}

export async function decryptBuffer(payload: { encrypted: Buffer; iv: Buffer; tag: Buffer }) {
  if (!isFileEncryptionConfigured()) {
    throw new Error('FILE_ENCRYPTION_KEY is not configured')
  }

  const key = Buffer.from(FILE_ENCRYPTION_KEY_BASE64, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, payload.iv)
  decipher.setAuthTag(payload.tag)

  const decrypted = Buffer.concat([decipher.update(payload.encrypted), decipher.final()])
  return decrypted
}

export async function uploadDocument(file: Buffer, title: string) {
  if (!isTelegramConfigured()) {
    return null
  }

  const encrypted = await encryptBuffer(file)
  const payload = Buffer.concat([
    encrypted.iv,
    encrypted.tag,
    encrypted.encrypted,
  ])

  const form = new FormData()
  form.append('chat_id', TELEGRAM_CHAT_ID)
  form.append('document', new Blob([payload]), `${title}.enc`)

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
    method: 'POST',
    body: form,
  })

  const result = (await response.json()) as any
  if (!result.ok || !result.result?.document?.file_id) {
    return null
  }

  return {
    telegram_file_id: result.result.document.file_id,
    telegram_message_id: String(result.result.message_id),
  }
}

export async function downloadFile(fileId: string) {
  if (!isTelegramConfigured()) {
    return null
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  })

  const result = (await response.json()) as any
  if (!result.ok || !result.result?.file_path) {
    return null
  }

  const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${result.result.file_path}`
  const fileResponse = await fetch(downloadUrl)
  if (!fileResponse.ok) {
    return null
  }

  return Buffer.from(await fileResponse.arrayBuffer())
}
