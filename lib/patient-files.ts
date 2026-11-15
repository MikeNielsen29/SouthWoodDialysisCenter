/**
 * Patient lab files: encrypted in memory, stored in the Telegram bot chat,
 * decrypted only when a permitted user downloads them.
 *
 * SERVER ONLY — never import this from a client component.
 */

import crypto from 'crypto'
import { callSheets } from './sheets/client'
import {
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
  decryptBuffer,
  downloadFile,
  isFileEncryptionConfigured,
  isTelegramConfigured,
  uploadDocument,
} from './files/telegram'

export interface PatientFileRow {
  id: string
  patient_cn: string
  title: string
  category: string
  telegram_file_id: string
  mime: string
  size_bytes: string
  iv: string
  auth_tag: string
  uploaded_by: string
  uploaded_at: string
  status: string
}

export function fileUploadProblem(): string | null {
  if (!isTelegramConfigured()) {
    return 'Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.'
  }
  if (!isFileEncryptionConfigured()) {
    return 'FILE_ENCRYPTION_KEY must be a 32-byte base64 value.'
  }
  return null
}

export async function uploadPatientFile(input: {
  file: File
  patient_cn: string
  title: string
  uploaded_by: string
  category?: 'lab' | 'image'
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const problem = fileUploadProblem()
  if (problem) return { ok: false, error: problem }

  if (!ALLOWED_MIME.includes(input.file.type)) {
    return { ok: false, error: 'File type not allowed (PDF, PNG, JPEG, WebP).' }
  }
  if (input.file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'File is larger than 10 MB.' }
  }

  const buffer = Buffer.from(await input.file.arrayBuffer())
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex')

  const uploaded = await uploadDocument(buffer, input.title)
  if (!uploaded) {
    return { ok: false, error: 'Telegram rejected the upload. Check the bot token and chat id.' }
  }

  const registered = await callSheets('files.register', {
    patient_cn: input.patient_cn,
    title: input.title,
    category: input.category ?? (input.file.type.startsWith('application/pdf') ? 'lab' : 'image'),
    telegram_file_id: uploaded.telegram_file_id,
    telegram_message_id: uploaded.telegram_message_id,
    mime: input.file.type,
    size_bytes: input.file.size,
    checksum_sha256: checksum,
    iv: uploaded.iv,
    auth_tag: uploaded.auth_tag,
    encrypted: true,
    uploaded_by: input.uploaded_by,
    status: 'Released',
  })

  const id =
    registered && typeof registered === 'object'
      ? String((registered as { id?: string }).id ?? '')
      : ''

  if (!id) return { ok: false, error: 'Could not register the file.' }
  return { ok: true, id }
}

/** Returns the decrypted bytes for a Files row, or null when unavailable. */
export async function readPatientFile(row: PatientFileRow): Promise<Buffer | null> {
  if (!row.telegram_file_id) return null

  const stored = await downloadFile(row.telegram_file_id)
  if (!stored) return null

  if (!row.iv || !row.auth_tag) return stored
  if (!isFileEncryptionConfigured()) return null

  // uploadDocument stored iv(16) + tag(16) + ciphertext.
  const iv = Buffer.from(row.iv, 'base64')
  const tag = Buffer.from(row.auth_tag, 'base64')
  const ciphertext = stored.subarray(iv.length + tag.length)

  try {
    return await decryptBuffer({ encrypted: ciphertext, iv, tag })
  } catch {
    return null
  }
}
