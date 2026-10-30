import type { Metadata } from 'next'
import { load } from '@/lib/admin/data'
import { AuditEntrySchema } from '@/lib/sheets/types'
import { Table, TableHead, TableRows, TableRow, TableHeadCell, TableData, Empty } from '@/components/admin/ui'

export const metadata: Metadata = {
  title: 'Audit log',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface AuditEntry {
  id?: string
  action?: string
  created_at?: string
  actor_cn?: string
  actor?: { cn?: string }
  entity?: string
  entity_id?: string
  result?: string
}

export default async function AuditLogPage() {
  const auditRaw = await load('audit.list', AuditEntrySchema.array(), { limit: 100 })
  const audit: AuditEntry[] = (auditRaw as AuditEntry[] | null) ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-xl text-ink">Audit log</h1>
        <p className="mt-1 text-sm text-ink-muted">
          A record of sensitive actions taken in the admin panel.
        </p>
      </div>

      {audit.length === 0 ? (
        <Empty description="No audit entries yet." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Time</TableHeadCell>
              <TableHeadCell>Actor</TableHeadCell>
              <TableHeadCell>Action</TableHeadCell>
              <TableHeadCell>Entity</TableHeadCell>
              <TableHeadCell>Entity ID</TableHeadCell>
              <TableHeadCell>Result</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableRows>
            {audit.map((entry) => (
              <TableRow key={entry.id}>
                <TableData className="whitespace-nowrap text-xs text-ink-muted">
                  {entry.created_at ? new Date(entry.created_at).toLocaleString('en-PH') : '—'}
                </TableData>
                <TableData className="font-medium text-ink">
                  {entry.actor_cn || entry.actor?.cn || '—'}
                </TableData>
                <TableData>{entry.action || '—'}</TableData>
                <TableData className="text-xs text-ink-muted">{entry.entity || '—'}</TableData>
                <TableData className="text-xs text-ink-muted font-mono">{entry.entity_id || '—'}</TableData>
                <TableData>
                  {entry.result === 'ok' ? (
                    <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">ok</span>
                  ) : entry.result === 'error' ? (
                    <span className="inline-flex rounded-full bg-ember-50 px-2 py-0.5 text-[11px] font-medium text-ember-700">error</span>
                  ) : (
                    <span className="text-ink-muted text-xs">—</span>
                  )}
                </TableData>
              </TableRow>
            ))}
          </TableRows>
        </Table>
      )}
    </div>
  )
}
