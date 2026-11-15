import crypto from 'crypto'

export const ALLOWED_MIME = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const FILE_VAULT_KEY_BASE64 = process.env.FILE_VAULT_KEY ?? ''
const VAULT_TOKEN = process.env.MEDIA_VAULT_TOKEN ?? ''
const VAULT_CHAT = process.env.MEDIA_VAULT_CHAT ?? ''

export function isVaultConfigured() {
  return Boolean(VAULT_TOKEN && VAULT_CHAT)
}

export function isFileEncryptionConfigured() {
  if (!FILE_VAULT_KEY_BASE64) return false
  try {
    return Buffer.from(FILE_VAULT_KEY_BASE64, 'base64').length === 32
  } catch {
    return false
  }
}

export async function encryptBuffer(buffer: Buffer) {
  if (!isFileEncryptionConfigured()) {
    throw new Error('The file vault key is not configured')
  }

  const key = Buffer.from(FILE_VAULT_KEY_BASE64, 'base64')
  if (key.length !== 32) {
    throw new Error('The file vault key must be a 32-byte base64 value')
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
    throw new Error('The file vault key is not configured')
  }

  const key = Buffer.from(FILE_VAULT_KEY_BASE64, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, payload.iv)
  decipher.setAuthTag(payload.tag)

  const decrypted = Buffer.concat([decipher.update(payload.encrypted), decipher.final()])
  return decrypted
}

export async function uploadDocument(file: Buffer, title: string) {
  if (!isVaultConfigured()) {
    return null
  }

  const encrypted = await encryptBuffer(file)
  const payload = Buffer.concat([
    encrypted.iv,
    encrypted.tag,
    encrypted.encrypted,
  ])

  const form = new FormData()
  form.append('chat_id', VAULT_CHAT)
  form.append('document', new Blob([payload]), `${title}.enc`)

  const response = await fetch(`https://api.telegram.org/bot${VAULT_TOKEN}/sendDocument`, {
    method: 'POST',
    body: form,
  })

  const result = (await response.json()) as any
  if (!result.ok || !result.result?.document?.file_id) {
    return null
  }

  return {
    vault_file_id: result.result.document.file_id,
    vault_message_id: String(result.result.message_id),
    iv: encrypted.iv.toString('base64'),
    auth_tag: encrypted.tag.toString('base64'),
  }
}

export async function downloadFile(fileId: string) {
  if (!isVaultConfigured()) {
    return null
  }

  const response = await fetch(`https://api.telegram.org/bot${VAULT_TOKEN}/getFile`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  })

  const result = (await response.json()) as any
  if (!result.ok || !result.result?.file_path) {
    return null
  }

  const downloadUrl = `https://api.telegram.org/file/bot${VAULT_TOKEN}/${result.result.file_path}`
  const fileResponse = await fetch(downloadUrl)
  if (!fileResponse.ok) {
    return null
  }

  return Buffer.from(await fileResponse.arrayBuffer())
}
