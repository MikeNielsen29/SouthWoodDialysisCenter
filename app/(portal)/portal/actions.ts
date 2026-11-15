'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/session'
import { load, callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { logAudit, type AuditEntry } from '@/lib/audit'

export async function requestAppointmentAction(formData: FormData): Promise<void> {
  const user = await requireUser('/portal/appointments')
  const date = String(formData.get('date') ?? '').trim()
  const time = String(formData.get('time') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()

  if (!date || !time) {
    redirect('/portal/appointments?error=' + encodeURIComponent('Pick a date and time.'))
  }

  if (!isSheetsConfigured()) {
    redirect('/portal/appointments?error=' + encodeURIComponent('The database is not connected.'))
  }

  try {
    await callSheets('appointments.create', {
      patient_cn: user.cn,
      scheduled_at: `${date}T${time}`,
      status: 'Requested',
      notes,
    })
  } catch {
    redirect(
      '/portal/appointments?error=' + encodeURIComponent('We could not send the request.')
    )
  }

  await logAudit({
    id: crypto.randomUUID(),
    actor_id: user.cn,
    actor_role: 'Patient',
    action: 'portal.appointment_requested',
    entity: 'appointment',
    entity_id: user.cn,
    meta_json: JSON.stringify({ date, time }),
    ip_hash: '',
    created_at: new Date().toISOString(),
  } as AuditEntry)

  revalidateTag('content')
  redirect('/portal/appointments?requested=1')
}

export async function cancelAppointmentAction(formData: FormData): Promise<void> {
  const user = await requireUser('/portal/appointments')
  const id = String(formData.get('id') ?? '').trim()
  if (!id) {
    redirect('/portal/appointments?error=' + encodeURIComponent('Missing appointment.'))
  }

  // Only the patient's own appointments can be cancelled.
  let mine: { id?: string }[] = []
  try {
    const rows = await callSheets<unknown>('appointments.list', { patient_cn: user.cn })
    mine = Array.isArray(rows) ? (rows as { id?: string }[]) : []
  } catch {
    mine = []
  }
  if (!mine.some((row) => row.id === id)) {
    redirect('/portal/appointments?error=' + encodeURIComponent('Appointment not found.'))
  }

  try {
    await callSheets('appointments.update', { id, status: 'Cancelled' })
  } catch {
    redirect('/portal/appointments?error=' + encodeURIComponent('Could not cancel.'))
  }

  await logAudit({
    id: crypto.randomUUID(),
    actor_id: user.cn,
    actor_role: 'Patient',
    action: 'portal.appointment_cancelled',
    entity: 'appointment',
    entity_id: id,
    meta_json: '{}',
    ip_hash: '',
    created_at: new Date().toISOString(),
  } as AuditEntry)

  revalidateTag('content')
  redirect('/portal/appointments?cancelled=1')
}

export async function submitTestimonialAction(formData: FormData): Promise<void> {
  const user = await requireUser('/portal/testimonials')

  // Only verified patients write testimonials; staff accounts never do.
  if (user.role !== 'Patient') {
    redirect('/portal?error=' + encodeURIComponent('Only patient accounts can share a review.'))
  }

  const rating = Number(formData.get('rating'))
  const body = String(formData.get('body') ?? '').trim()

  if (!(rating >= 1 && rating <= 5) || body.length < 10) {
    redirect(
      '/portal/testimonials?error=' +
        encodeURIComponent('Choose a rating and write at least a sentence.')
    )
  }

  if (!isSheetsConfigured()) {
    redirect(
      '/portal/testimonials?error=' +
        encodeURIComponent('The database is not connected. Please try again later.')
    )
  }

  try {
    await callSheets('testimonials.create', {
      patient_cn: user.cn,
      display_name: user.full_name || user.cn,
      rating,
      body,
    })
  } catch {
    redirect(
      '/portal/testimonials?error=' +
        encodeURIComponent('We could not save your review. Please try again.')
    )
  }

  await logAudit({
    id: crypto.randomUUID(),
    actor_id: user.cn,
    actor_role: 'Patient',
    action: 'portal.testimonial_submitted',
    entity: 'testimonial',
    entity_id: user.cn,
    meta_json: JSON.stringify({ rating }),
    ip_hash: '',
    created_at: new Date().toISOString(),
  } as AuditEntry)

  revalidateTag('content')
  redirect('/portal/testimonials?sent=1')
}

export async function fetchMyFilesAction() {
  await requireUser('/portal')
  const files = await load('files.listMine', undefined, { limit: 50 })
  return files as { id: string; title: string; category: string }[]
}

export async function downloadFileAction(formData: FormData) {
  await requireUser('/portal')
  const id = formData.get('id') as string | null
  if (!id) {
    return { ok: false as const, error: 'Missing file id' }
  }
  revalidateTag('content')
  return { ok: true as const, file_id: id }
}
