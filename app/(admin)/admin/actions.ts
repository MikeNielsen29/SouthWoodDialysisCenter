'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { hashPassword, passwordProblem } from '@/lib/auth/password'
import { ADMIN_ROLES, STAFF_ROLES } from '@/lib/auth/jwt'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { getSession } from '@/lib/auth/session'
import { logAudit } from '@/lib/audit'
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

  const updated = await callSheets('content.upsertPage', payload)

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

export async function saveSectionAction(formData: FormData): Promise<void> {
  const pageSlug = (formData.get('page_slug') as string | null)?.trim() || ''
  const sectionKey = (formData.get('section_key') as string | null)?.trim() || ''
  const back = `/admin/content?page=${encodeURIComponent(pageSlug)}&section=${encodeURIComponent(
    sectionKey
  )}`

  if (!isSheetsConfigured()) {
    redirect(`${back}&error=${encodeURIComponent('Backend not configured')}`)
  }

  const payload = {
    page_slug: pageSlug,
    section_key: sectionKey,
    sort_order: (formData.get('sort_order') as string | null)?.trim() || '0',
    eyebrow: (formData.get('eyebrow') as string | null)?.trim() || '',
    heading: (formData.get('heading') as string | null)?.trim() || '',
    emphasis: (formData.get('emphasis') as string | null)?.trim() || '',
    body: (formData.get('body') as string | null)?.trim() || '',
    image_url: (formData.get('image_url') as string | null)?.trim() || '',
    image_alt: (formData.get('image_alt') as string | null)?.trim() || '',
    cta_label: (formData.get('cta_label') as string | null)?.trim() || '',
    cta_href: (formData.get('cta_href') as string | null)?.trim() || '',
    status: (formData.get('status') as string | null) || 'published',
  }

  try {
    await callSheets('content.upsertSection', payload)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not save the section'
    redirect(`${back}&error=${encodeURIComponent(message)}`)
  }

  await logAudit({
    actor_id: 'admin',
    actor_role: 'Admin',
    action: 'content.section_saved',
    entity: 'section',
    entity_id: `${pageSlug}:${sectionKey}`,
    meta_json: JSON.stringify({ status: payload.status }),
    ip_hash: '',
    created_at: new Date().toISOString(),
  } as AuditEntry)

  revalidateTag('content')
  redirect(`${back}&saved=1`)
}

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

const USER_ROLES = ['Super Admin', 'Admin', 'Page Editor', 'Patient'] as const

async function requireSuperAdmin() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/user-management')
  if (session.role !== 'Super Admin') redirect('/admin')
  return session
}

function backToUsers(params: string): never {
  redirect(`/admin/user-management?${params}`)
}

function roleFrom(value: FormDataEntryValue | null): (typeof USER_ROLES)[number] | null {
  const role = String(value || '')
  return (USER_ROLES as readonly string[]).includes(role)
    ? (role as (typeof USER_ROLES)[number])
    : null
}

export async function createUserAction(formData: FormData): Promise<void> {
  await requireSuperAdmin()

  const cn = (formData.get('cn') as string | null)?.trim() || ''
  const fullName = (formData.get('full_name') as string | null)?.trim() || ''
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() || ''
  const role = roleFrom(formData.get('role'))
  const password = String(formData.get('password') || '')

  if (!cn || !fullName || !email) backToUsers('error=Fill in every field')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) backToUsers('error=Enter a valid email')
  if (!role) backToUsers('error=Choose a valid role')

  const problem = passwordProblem(password)
  if (problem) backToUsers(`error=${encodeURIComponent(problem)}`)

  if (!isSheetsConfigured()) backToUsers('error=Backend not configured')

  try {
    await callSheets('users.create', {
      cn,
      full_name: fullName,
      email,
      role,
      password,
      otp_required: false,
      must_change_password: true,
    })
  } catch {
    backToUsers('error=Could not create the account')
  }

  backToUsers(`created=${encodeURIComponent(cn)}`)
}

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  await requireSuperAdmin()

  const id = (formData.get('id') as string | null)?.trim() || ''
  const role = roleFrom(formData.get('role'))
  if (!id || !role) backToUsers('error=Choose a valid role')

  try {
    await callSheets('users.update', { id, patch: { role } })
  } catch {
    backToUsers('error=Could not change the role')
  }

  backToUsers('updated=role')
}

export async function toggleUserActiveAction(formData: FormData): Promise<void> {
  await requireSuperAdmin()

  const id = (formData.get('id') as string | null)?.trim() || ''
  const active = String(formData.get('is_active') || '') === 'TRUE'
  if (!id) backToUsers('error=Missing account')

  try {
    await callSheets('users.update', { id, patch: { is_active: active ? 'TRUE' : 'FALSE' } })
  } catch {
    backToUsers('error=Could not update the account')
  }

  backToUsers('updated=status')
}

export async function resetUserPasswordAction(formData: FormData): Promise<void> {
  await requireSuperAdmin()

  const id = (formData.get('id') as string | null)?.trim() || ''
  if (!id) backToUsers('error=Missing account')

  let password = ''
  try {
    const result = await callSheets<{ password?: string }>('users.resetPassword', { id })
    password = String(result?.password || '')
  } catch {
    backToUsers('error=Could not reset the password')
  }
  if (!password) backToUsers('error=Could not reset the password')

  // Shown once on the next render, never placed in the URL.
  const store = await cookies()
  store.set('temp_password', password, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 180,
    path: '/admin/user-management',
  })

  backToUsers('reset=1')
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const session = await requireSuperAdmin()

  const id = (formData.get('id') as string | null)?.trim() || ''
  if (!id) backToUsers('error=Missing account')
  if (id === session.sub) backToUsers('error=You cannot delete your own account')

  try {
    await callSheets('users.delete', { id, actor_id: session.sub })
  } catch {
    backToUsers('error=The account could not be deleted')
  }

  await logAudit({
    actor_id: session.sub,
    actor_role: session.role,
    action: 'users.deleted',
    entity: 'user',
    entity_id: id,
    meta_json: '{}',
    ip_hash: '',
    created_at: new Date().toISOString(),
  } as AuditEntry)

  backToUsers('deleted=1')
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

  const updated = await callSheets('content.upsertService', payload)

  if (!updated || typeof updated !== 'object') {
    return { ok: false as const, error: 'Could not save service' }
  }

  revalidateTag('content')
  redirect('/admin/services?ok=Service%20saved')
}

export async function deleteServiceAction(formData: FormData) {
  if (!isSheetsConfigured()) {
    return { ok: false as const, error: 'Backend not configured' }
  }

  const id = formData.get('id') as string | null
  if (!id) {
    return { ok: false as const, error: 'Missing service id' }
  }

  const updated = await callSheets('content.deleteService', { id })

  if (!updated || typeof updated !== 'object') {
    return { ok: false as const, error: 'Could not delete service' }
  }

  revalidateTag('content')
  redirect('/admin/services?ok=Service%20deleted')
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

  const updated = await callSheets('content.upsertNews', payload)

  if (!updated || typeof updated !== 'object') {
    return { ok: false as const, error: 'Could not save news' }
  }

  revalidateTag('content')
  redirect('/admin/news?ok=Article%20saved')
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
  redirect('/admin/inquiries?ok=Inquiry%20updated')
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
  redirect('/admin/testimonials?ok=Testimonial%20updated')
}



