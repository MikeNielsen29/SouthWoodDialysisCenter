'use server'

import { revalidateTag } from 'next/cache'
import { requireUser } from '@/lib/auth/session'
import { load } from '@/lib/sheets/client'
import { logAudit } from '@/lib/audit'

export async function requestAppointmentAction(formData: FormData) {
  const user = await requireUser('/portal')
  const data = {
    patient_cn: formData.get('patient_cn') as string | null,
    date: formData.get('date') as string | null,
    time: formData.get('time') as string | null,
    notes: formData.get('notes') as string | null,
  }
  if (!data.patient_cn || !data.date || !data.time) {
    return { ok: false as const, error: 'Missing required fields' }
  }
  await logAudit({
    id: crypto.randomUUID(),
    actor_id: data.patient_cn || user.cn,
    actor_role: 'Patient',
    action: 'portal.appointment_requested',
    entity: 'appointment',
    entity_id: 'new',
    meta_json: JSON.stringify(data),
    ip_hash: '',
    created_at: new Date().toISOString(),
  })
  revalidateTag('content')
  return { ok: true as const }
}

export async function cancelAppointmentAction(formData: FormData) {
  const user = await requireUser('/portal')
  const id = formData.get('id') as string | null
  if (!id) {
    return { ok: false as const, error: 'Missing appointment id' }
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
  })
  return { ok: true as const }
}

export async function submitTestimonialAction(formData: FormData) {
  const user = await requireUser('/portal')
  const testimonial = {
    patient_cn: formData.get('patient_cn') as string | null,
    rating: Number(formData.get('rating')) || 5,
    display_name: (formData.get('display_name') as string | null)?.trim() || '',
    body: (formData.get('body') as string | null)?.trim() || '',
  }
  if (!testimonial.patient_cn || !testimonial.body) {
    return { ok: false as const, error: 'Missing required fields' }
  }
  await logAudit({
    id: crypto.randomUUID(),
    actor_id: testimonial.patient_cn || user.cn,
    actor_role: 'Patient',
    action: 'portal.testimonial_submitted',
    entity: 'testimonial',
    entity_id: 'new',
    meta_json: JSON.stringify(testimonial),
    ip_hash: '',
    created_at: new Date().toISOString(),
  })
  revalidateTag('content')
  return { ok: true as const }
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
