import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import type { AuditEntry } from '@/lib/sheets/types'

/**
 * Appends an AuditLog row (§7.4). Failures are logged server-side and never
 * break the action the user is performing.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  if (!isSheetsConfigured()) return
  try {
    await callSheets('audit.append', { ...entry })
  } catch {
    console.error('[audit] could not append audit row')
  }
}

export type { AuditEntry }

/** A one-line audit call for admin writes, with the actor taken from the session. */
export async function logAdminAction(
  user: { cn: string; role: string },
  action: string,
  entity: string,
  entityId: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  await logAudit({
    id: crypto.randomUUID(),
    actor_id: user.cn,
    actor_role: user.role,
    action,
    entity,
    entity_id: entityId,
    meta_json: JSON.stringify(meta),
    ip_hash: '',
    created_at: new Date().toISOString(),
  })
}
