import type { ReactNode } from 'react'

export function AuditListView({ audit, isLoading, state, error }: {
  audit?: any[]
  isLoading?: boolean
  state?: any
  error?: string
}) {
  return (
    <div>
      {error && <p className="text-sm text-ember-700 bg-ember-50 rounded p-2">{error}</p>}
      {isLoading ? (
        <p className="text-sm text-ink-muted">Loading audit records…</p>
      ) : audit && audit.length > 0 ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Time</th>
              <th className="pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Actor</th>
              <th className="pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Action</th>
              <th className="pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {audit.map((entry) => (
              <tr key={entry.id} className="hover:bg-sand-50/40">
                <td className="pr-4 text-ink-muted text-xs whitespace-nowrap">{entry.created_at ? new Date(entry.created_at).toLocaleString('en-PH') : '—'}</td>
                <td className="pr-4 text-ink font-medium">{entry.actor_cn || entry.actor?.cn || '—'}</td>
                <td className="pr-4 text-ink">{entry.action || '—'}</td>
                <td className="pr-4">
                  {entry.result === 'ok' ? (
                    <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">ok</span>
                  ) : entry.result === 'error' ? (
                    <span className="inline-flex rounded-full bg-ember-50 px-2 py-0.5 text-[11px] font-medium text-ember-700">error</span>
                  ) : (
                    <span className="text-ink-muted text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-ink-muted">No audit entries yet.</p>
      )}
    </div>
  )
}
