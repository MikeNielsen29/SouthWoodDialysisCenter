export const ALLOWED_MIME = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
]

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function isFileEncryptionConfigured(): boolean {
  return Boolean(process.env.FILE_ENCRYPTION_KEY?.trim())
}

export async function encryptBuffer(buffer: Buffer): Promise<Buffer> {
  return buffer
}

export async function downloadFile(fileId: string): Promise<Buffer | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  if (!token) return null
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`, {
      cache: 'no-store',
    })
    const data = await res.json()
    if (!data.ok || !data.result?.file_path) return null
    const fileRes = await fetch(
      `https://api.telegram.org/file/bot${token}/${data.result.file_path}`,
      { cache: 'no-store' }
    )
    const buf = Buffer.from(await fileRes.arrayBuffer())
    return buf
  } catch {
    return null
  }
}
