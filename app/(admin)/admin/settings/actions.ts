'use server'

import { redirect } from 'next/navigation'
import { callSheets } from '@/lib/sheets/client'
import { getSession } from '@/lib/auth/session'
import { logAudit, type AuditEntry } from '@/lib/audit'

export async function runBackupAction(): Promise<void> {
  const session = await getSession()
  if (!session) redirect('/login?returnTo=/admin/settings')

  try {
    await callSheets('system.backup', {})
  } catch {
    redirect('/admin/settings?backup=error')
  }

  await logAudit({
    actor_id: session.cn,
    actor_role: session.role,
    action: 'system.backup',
    entity: 'Settings',
    entity_id: 'backup',
    meta_json: '',
    ip_hash: '',
    created_at: new Date().toISOString(),
  } as AuditEntry)

  redirect('/admin/settings?backup=ok')
}
