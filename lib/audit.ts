import type { AuditEntry } from './sheets/types'

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const { callSheets } = await import('./sheets/client')
    await callSheets('audit.log', entry)
  } catch {
    // Audit failures must not break the user flow
  }
}
