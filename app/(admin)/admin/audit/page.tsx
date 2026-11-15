import type { Metadata } from 'next'
import { load } from '@/lib/admin/data'
import { AuditEntrySchema } from '@/lib/sheets/types'
import {
  Empty,
  Input,
  Submit,
  Table,
  TableData,
  TableHead,
  TableHeadCell,
  TableRow,
  TableRows,
} from '@/components/admin/ui'

export const metadata: Metadata = {
  title: 'Audit log',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface AuditEntry {
  id?: string
  actor_id?: string
  actor_role?: string
  action?: string
  entity?: string
  entity_id?: string
  meta_json?: string
  created_at?: string
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const auditRaw = await load('audit.list', AuditEntrySchema.array(), { limit: 200 })
  const rows: AuditEntry[] = (auditRaw as AuditEntry[] | null) ?? []

  const q = (searchParams.q ?? '').trim()
  const needle = q.toLowerCase()
  const audit = needle
    ? rows.filter((entry) =>
        [entry.actor_id, entry.action, entry.entity, entry.entity_id]
          .map((value) => String(value ?? '').toLowerCase())
          .some((value) => value.includes(needle))
      )
    : rows

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-xl text-ink">Audit log</h1>
        <p className="mt-1 text-sm text-ink-muted">
          A record of sensitive actions taken in the admin panel. Showing the latest 200
          entries.
        </p>
      </div>

      <form className="mb-5 flex flex-col gap-2 sm:flex-row" action="/admin/audit">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Filter by actor, action or entity"
          className="sm:max-w-sm"
        />
        <Submit type="submit">Filter</Submit>
      </form>

      {audit.length === 0 ? (
        <Empty description={q ? 'No entries match that filter.' : 'No audit entries yet.'} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Time</TableHeadCell>
              <TableHeadCell>Actor</TableHeadCell>
              <TableHeadCell>Action</TableHeadCell>
              <TableHeadCell>Entity</TableHeadCell>
              <TableHeadCell>Entity ID</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableRows>
            {audit.map((entry, index) => (
              <TableRow key={entry.id || index}>
                <TableData className="whitespace-nowrap text-xs text-ink-muted">
                  {entry.created_at ? new Date(entry.created_at).toLocaleString('en-PH') : '—'}
                </TableData>
                <TableData className="font-medium text-ink">
                  {entry.actor_id || '—'}
                  {entry.actor_role ? (
                    <span className="ml-1 text-xs font-normal text-ink-muted">
                      ({entry.actor_role})
                    </span>
                  ) : null}
                </TableData>
                <TableData>{entry.action || '—'}</TableData>
                <TableData>{entry.entity || '—'}</TableData>
                <TableData className="max-w-[180px] truncate text-xs text-ink-muted">
                  {entry.entity_id || '—'}
                </TableData>
              </TableRow>
            ))}
          </TableRows>
        </Table>
      )}
    </div>
  )
}
