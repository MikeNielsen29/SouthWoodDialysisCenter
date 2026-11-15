'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { passwordProblem } from '@/lib/auth/password'
import { logAudit } from '@/lib/audit'
import type { AuditEntry } from '@/lib/sheets/types'

const AnyArray = z.array(z.unknown())

function tokenMatches(candidate: string): boolean {
  const expected = process.env.SETUP_TOKEN
  // Without a configured token the page is still gated by "no accounts exist":
  // createAdminAction refuses as soon as the Users tab has a single row.
  if (!expected) return true
  return candidate === expected
}

export async function createAdminAction(formData: FormData): Promise<void> {
  const token = String(formData.get('token') || '')
  if (!tokenMatches(token)) redirect('/setup?error=Invalid+setup+token')

  if (!isSheetsConfigured()) {
    redirect('/setup?error=Database+is+not+connected+yet')
  }

  let existing: unknown[] = []
  try {
    const raw = await callSheets('users.list', {})
    existing = Array.isArray(raw) ? raw : []
  } catch {
    redirect('/setup?error=Could+not+reach+the+database.+Run+the+Apps+Script+setup+first.')
  }
  if (existing.length > 0) redirect('/setup?error=This+site+already+has+an+administrator')

  const cn = String(formData.get('cn') || '').trim()
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')

  if (!cn || !name || !email) redirect('/setup?error=Fill+in+every+field')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect('/setup?error=Enter+a+valid+email')

  const problem = passwordProblem(password)
  if (problem) redirect(`/setup?error=${encodeURIComponent(problem)}`)

  try {
    await callSheets('users.create', {
      cn,
      full_name: name,
      email,
      role: 'Super Admin',
      // Hashed inside the CloudBase service, which is also where sign-in is verified.
      password,
      must_change_password: false,
      otp_required: false,
    })
  } catch {
    redirect('/setup?error=Could+not+create+the+account')
  }

  await logAudit({
    id: crypto.randomUUID(),
    actor_id: cn,
    actor_role: 'Super Admin',
    action: 'setup.admin_created',
    entity: 'user',
    entity_id: cn,
    meta_json: JSON.stringify({ email }),
    ip_hash: '',
    created_at: new Date().toISOString(),
  } as AuditEntry)

  redirect('/login?created=1')
}
