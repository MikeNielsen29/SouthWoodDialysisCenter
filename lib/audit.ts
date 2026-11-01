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
