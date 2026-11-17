'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { STAFF_ROLES } from '@/lib/auth/jwt'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { logAdminAction } from '@/lib/audit'
import { MAX_MEDIA_BYTES, MEDIA_MIME, isMediaConfigured, uploadMedia } from '@/lib/media'

async function requireStaff() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/media')
  if (!STAFF_ROLES.includes(session.role)) redirect('/admin')
  return session
}

type SiteImageUpload = { ok: true; path: string } | { ok: false; error: string }

/**
 * Same pipeline as the media library, but returns the path instead of
 * redirecting so the content editor can drop it straight into a section.
 */
export async function uploadSiteImageAction(formData: FormData): Promise<SiteImageUpload> {
  const session = await getSession()
  if (!session || !STAFF_ROLES.includes(session.role)) {
    return { ok: false, error: 'Your session expired. Sign in again.' }
  }

  const file = formData.get('image')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Choose an image first.' }
  }
  if (!(MEDIA_MIME as readonly string[]).includes(file.type)) {
    return { ok: false, error: 'Use a PNG, JPEG or WebP image.' }
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return { ok: false, error: 'Images must be 8 MB or smaller.' }
  }
  if (!isMediaConfigured()) {
    return { ok: false, error: 'The Media Vault is not configured. Ask an administrator.' }
  }
  if (!isSheetsConfigured()) {
    return { ok: false, error: 'The database is not connected.' }
  }

  const filename = (file.name || 'image').replace(/[^A-Za-z0-9._-]/g, '-').slice(-80)

  try {
    const uploaded = await uploadMedia(Buffer.from(await file.arrayBuffer()), filename, file.type)
    const row = (await callSheets('media.create', {
      vault_file_id: uploaded.fileId,
      name: filename,
      alt: '',
      mime: file.type,
      size_bytes: String(uploaded.size),
      uploaded_by: session.cn,
    })) as { id?: string } | null

    if (!row?.id) {
      return { ok: false, error: 'Uploaded, but the library row could not be saved.' }
    }
    return { ok: true, path: `/api/media/${uploaded.fileId}` }
  } catch {
    return { ok: false, error: 'The upload failed. Check the vault credentials.' }
  }
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
        'The Media Vault is not configured. Ask an administrator to finish the storage setup.'
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
    redirect('/admin/media?error=The%20Media%20Vault%20rejected%20the%20image')
  }

  try {
    await callSheets('media.create', {
      vault_file_id: uploaded.fileId,
      name: filename,
      alt,
      mime: file.type,
      size_bytes: String(uploaded.size),
      uploaded_by: session.cn,
    })
  } catch {
    redirect('/admin/media?error=Image%20reached%20the%20vault%20but%20the%20library%20row%20could%20not%20be%20saved')
  }

  redirect('/admin/media?uploaded=1')
}

export async function updateMediaAltAction(formData: FormData): Promise<void> {
  const session = await requireStaff()

  const id = String(formData.get('id') ?? '').trim()
  const alt = String(formData.get('alt') ?? '').trim()
  if (!id) redirect('/admin/media?error=Missing image')

  try {
    await callSheets('media.update', { id, alt })
    await logAdminAction(session, 'media.alt_updated', 'media', id, { alt })
  } catch {
    redirect('/admin/media?error=Could not save the alt text')
  }

  redirect('/admin/media?updated=1')
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
