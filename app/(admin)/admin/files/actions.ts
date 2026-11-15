'use server'

import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { getSession } from '@/lib/auth/session'
import { uploadPatientFile, fileUploadProblem } from '@/lib/patient-files'
import { logAudit, type AuditEntry } from '@/lib/audit'

function back(flash: string): never {
  redirect(`/admin/files?${flash}`)
}

export async function uploadPatientFileAction(formData: FormData): Promise<void> {
  if (!isSheetsConfigured()) back('error=' + encodeURIComponent('Backend not configured'))

  const session = await getSession()
  if (!session) redirect('/login?returnTo=/admin/files')

  const problem = fileUploadProblem()
  if (problem) back('error=' + encodeURIComponent(problem))

  const file = formData.get('file')
  const patient_cn = String(formData.get('patient_cn') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()

  if (!(file instanceof File) || file.size === 0) {
    back('error=' + encodeURIComponent('Choose a file to upload.'))
  }
  if (!patient_cn) {
    back('error=' + encodeURIComponent('Enter the patient control number.'))
  }

  const result = await uploadPatientFile({
    file,
    patient_cn,
    title: title || file.name,
    uploaded_by: session.cn,
  })

  if (!result.ok) back('error=' + encodeURIComponent(result.error))

  await logAudit({
    actor_id: session.cn,
    actor_role: session.role,
    action: 'files.upload',
    entity: 'Files',
    entity_id: result.id,
    meta_json: JSON.stringify({ patient_cn, title }),
    ip_hash: '',
    created_at: new Date().toISOString(),
  } as AuditEntry)

  revalidateTag('content')
  back('uploaded=1')
}

export async function releasePatientFileAction(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session) redirect('/login?returnTo=/admin/files')

  const id = String(formData.get('id') ?? '').trim()
  if (!id) back('error=' + encodeURIComponent('Missing file id.'))

  try {
    await callSheets('files.release', { id })
  } catch {
    back('error=' + encodeURIComponent('Could not release the file.'))
  }

  await logAudit({
    actor_id: session.cn,
    actor_role: session.role,
    action: 'files.release',
    entity: 'Files',
    entity_id: id,
    meta_json: '',
    ip_hash: '',
    created_at: new Date().toISOString(),
  } as AuditEntry)

  revalidateTag('content')
  back('released=1')
}
