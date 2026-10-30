'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { hashPassword, passwordProblem } from '@/lib/auth/password'
import { ADMIN_ROLES, STAFF_ROLES } from '@/lib/auth/jwt'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { logAudit } from '@/lib/audit'
import {
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
  encryptBuffer,
  isFileEncryptionConfigured,
} from '@/lib/files/telegram'
import type { AuditEntry } from '@/lib/sheets/types'

export async function savePageAction(formData: FormData) {
  if (!isSheetsConfigured()) {
    return { ok: false as const, error: 'Backend not configured' }
  }

  const slug = formData.get('slug') as string | null
  if (!slug) {
    return { ok: false as const, error: 'Missing page slug' }
  }

  const payload = {
    slug,
    title: (formData.get('title') as string | null)?.trim() || '',
    meta_title: (formData.get('meta_title') as string | null)?.trim() || '',
    meta_description: (formData.get('meta_description') as string | null)?.trim() || '',
    h1: (formData.get('h1') as string | null)?.trim() || '',
    og_image: (formData.get('og_image') as string | null)?.trim() || '',
    status: (formData.get('status') as string | null) || 'published',
    body: (formData.get('body') as string | null)?.trim() || '',
  }

  const updated = await callSheets('pages.update', payload)

  if (!updated || typeof updated !== 'object') {
    return { ok: false as const, error: 'Could not save page' }
  }

  await logAudit({
    actor_id: 'admin',
    actor_role: 'Admin',
    action: 'content.page_saved',
    entity: 'page',
    entity_id: slug,
    meta_json: JSON.stringify({ title: payload.title }),
    ip_hash: '',
    created_at: new Date().toISOString(),
  } as AuditEntry)

  revalidateTag('content')
  return { ok: true as const }
}

export async function saveSectionAction(formData: FormData) {
  if (!isSheetsConfigured()) {
    return { ok: false as const, error: 'Backend not configured' }
  }

  const payload = {
    page_slug: (formData.get('page_slug') as string | null)?.trim() || '',
    section_key: (formData.get('section_key') as string | null)?.trim() || '',
    sort_order: (formData.get('sort_order') as string | null)?.trim() || '0',
    eyebrow: (formData.get('eyebrow') as string | null)?.trim() || '',
    heading: (formData.get('heading') as string | null)?.trim() || '',
    body: (formData.get('body') as string | null)?.trim() || '',
    cta_label: (formData.get('cta_label') as string | null)?.trim() || '',
    cta_href: (formData.get('cta_href') as string | null)?.trim() || '',
    status: (formData.get('status') as string | null) || 'published',
  }

  const updated = await callSheets('sections.update', payload)

  if (!updated || typeof updated !== 'object') {
    return { ok: false as const, error: 'Could not save section' }
  }

  revalidateTag('content')
  return { ok: true as const }
}

export async function saveServiceAction(formData: FormData) {
  if (!isSheetsConfigured()) {
    return { ok: false as const, error: 'Backend not configured' }
  }

  const id = formData.get('id') as string | null
  const slug = (formData.get('slug') as string | null)?.trim() || ''

  if (!id && !slug) {
    return { ok: false as const, error: 'Missing service id or slug' }
  }

  const payload = {
    id: (id || undefined) as string | undefined,
    slug,
    title: (formData.get('title') as string | null)?.trim() || '',
    summary: (formData.get('summary') as string | null)?.trim() || '',
    icon: (formData.get('icon') as string | null)?.trim() || '',
    sort_order: (formData.get('sort_order') as string | null)?.trim() || '0',
    status: (formData.get('status') as string | null) || 'published',
  }

  const updated = await callSheets('services.upsert', payload)

  if (!updated || typeof updated !== 'object') {
    return { ok: false as const, error: 'Could not save service' }
  }

  revalidateTag('content')
  return { ok: true as const }
}

export async function deleteServiceAction(formData: FormData) {
  if (!isSheetsConfigured()) {
    return { ok: false as const, error: 'Backend not configured' }
  }

  const id = formData.get('id') as string | null
  if (!id) {
    return { ok: false as const, error: 'Missing service id' }
  }

  const updated = await callSheets('services.delete', { id })

  if (!updated || typeof updated !== 'object') {
    return { ok: false as const, error: 'Could not delete service' }
  }

  revalidateTag('content')
  return { ok: true as const }
}

export async function saveNewsAction(formData: FormData) {
  if (!isSheetsConfigured()) {
    return { ok: false as const, error: 'Backend not configured' }
  }

  const id = formData.get('id') as string | null
  const slug = (formData.get('slug') as string | null)?.trim() || ''

  if (!id && !slug) {
    return { ok: false as const, error: 'Missing news id or slug' }
  }

  const payload = {
    id: (id || undefined) as string | undefined,
    slug,
    title: (formData.get('title') as string | null)?.trim() || '',
    excerpt: (formData.get('excerpt') as string | null)?.trim() || '',
    body: (formData.get('body') as string | null)?.trim() || '',
    cover_url: (formData.get('cover_url') as string | null)?.trim() || '',
    cover_alt: (formData.get('cover_alt') as string | null)?.trim() || '',
    published_at: (formData.get('published_at') as string | null)?.trim() || '',
    status: (formData.get('status') as string | null) || 'published',
  }

  const updated = await callSheets('news.upsert', payload)

  if (!updated || typeof updated !== 'object') {
    return { ok: false as const, error: 'Could not save news' }
  }

  revalidateTag('content')
  return { ok: true as const }
}

export async function updateInquiryAction(formData: FormData) {
  if (!isSheetsConfigured()) {
    return { ok: false as const, error: 'Backend not configured' }
  }

  const id = formData.get('id') as string | null
  if (!id) {
    return { ok: false as const, error: 'Missing inquiry id' }
  }

  const status = (formData.get('status') as string | null) || 'Read'
  const notes = (formData.get('notes') as string | null)?.trim() || ''

  const updated = await callSheets('inquiries.update', { id, status, notes })

  if (!updated || typeof updated !== 'object') {
    return { ok: false as const, error: 'Could not update inquiry' }
  }

  revalidateTag('content')
  return { ok: true as const }
}

export async function moderateTestimonialAction(formData: FormData) {
  if (!isSheetsConfigured()) {
    return { ok: false as const, error: 'Backend not configured' }
  }

  const id = formData.get('id') as string | null
  if (!id) {
    return { ok: false as const, error: 'Missing testimonial id' }
  }

  const status = (formData.get('status') as string | null) || 'Approved'

  const updated = await callSheets('testimonials.moderate', { id, status })

  if (!updated || typeof updated !== 'object') {
    return { ok: false as const, error: 'Could not moderate testimonial' }
  }

  revalidateTag('content')
  return { ok: true as const }
}

export async function uploadFileAction(formData: FormData) {
  if (!isSheetsConfigured()) {
    return { ok: false as const, error: 'Backend not configured' }
  }

  if (!isFileEncryptionConfigured()) {
    return { ok: false as const, error: 'File encryption not configured' }
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return { ok: false as const, error: 'No file selected' }
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return { ok: false as const, error: 'File type not allowed' }
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false as const, error: 'File too large' }
  }

  const checksum = typeof crypto !== 'undefined' && typeof crypto.subtle === 'object'
    ? 'unavailable-in-browser-check'
    : 'unavailable'

  const patient_cn = (formData.get('patient_cn') as string | null)?.trim() || ''
  if (!patient_cn) {
    return { ok: false as const, error: 'Missing patient CN' }
  }

  const title = (formData.get('title') as string | null)?.trim() || file.name

  type RegisterResponse = { id?: string }
  const registered = await callSheets('files.register', {
    patient_cn,
    title,
    category: file.type.startsWith('application/pdf') ? 'lab' : 'image',
    mime: file.type,
    size_bytes: file.size,
    checksum_sha256: checksum,
    encrypted: true,
  })

  if (!registered || typeof registered !== 'object') {
    return { ok: false as const, error: 'Could not register file' }
  }

  revalidateTag('content')
  return { ok: true as const, file_id: ((registered as RegisterResponse).id || 'unknown') as string }
}

