'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { STAFF_ROLES } from '@/lib/auth/jwt'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { MAX_MEDIA_BYTES, MEDIA_MIME, isMediaConfigured, uploadMedia } from '@/lib/media'

async function requireStaff() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/media')
  if (!STAFF_ROLES.includes(session.role)) redirect('/admin')
  return session
}

export async function uploadMediaAction(formData: FormData): Promise<void> {
  const session = await requireStaff()
  const file = formData.get('image')
  const alt = (formData.get('alt') as string | null)?.trim() || ''

  if (!(file instanceof File) || file.size === 0) {
    redirect('/admin/media?error=Choose an image first')
  }
  if (!(MEDIA_MIME as readonly string[]).includes(file.type)) {
    redirect('/admin/media?error=Use a PNG, JPEG or WebP image')
  }
  if (file.size > MAX_MEDIA_BYTES) {
    redirect('/admin/media?error=Images must be 8 MB or smaller')
  }
  if (!isMediaConfigured()) {
    redirect(
      `/admin/media?error=${encodeURIComponent(
        'Telegram is not configured. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.'
      )}`
    )
  }
  if (!isSheetsConfigured()) {
    redirect('/admin/media?error=Backend not configured')
  }

  const filename = (file.name || 'image').replace(/[^A-Za-z0-9._-]/g, '-').slice(-80)

  let uploaded: { fileId: string; size: number }
  try {
    uploaded = await uploadMedia(Buffer.from(await file.arrayBuffer()), filename, file.type)
  } catch {
    redirect('/admin/media?error=Telegram rejected the image')
  }

  try {
    await callSheets('media.create', {
      telegram_file_id: uploaded.fileId,
      name: filename,
      alt,
      mime: file.type,
      size_bytes: String(uploaded.size),
      uploaded_by: session.cn,
    })
  } catch {
    redirect('/admin/media?error=Image reached Telegram but the library row could not be saved')
  }

  redirect('/admin/media?uploaded=1')
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  await requireStaff()

  const id = (formData.get('id') as string | null)?.trim() || ''
  if (!id) redirect('/admin/media?error=Missing image')

  try {
    await callSheets('media.delete', { id })
  } catch {
    redirect('/admin/media?error=Could not delete the image')
  }

  redirect('/admin/media?deleted=1')
}
