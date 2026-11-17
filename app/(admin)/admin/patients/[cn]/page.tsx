import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { Notice } from '@/components/admin/ui'

export const metadata: Metadata = {
  title: 'Patient record',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>

async function rows(action: string, payload: Record<string, unknown>): Promise<Row[]> {
  try {
    const result = await callSheets<unknown>(action, payload)
    return Array.isArray(result)
      ? result.filter((row): row is Row => Boolean(row) && typeof row === 'object')
      : []
  } catch {
    return []
  }
}

function text(row: Row, key: string): string {
  return String(row[key] ?? '')
}

export default async function PatientRecordPage({ params }: { params: { cn: string } }) {
  await requireRoleOrRedirect(['Super Admin', 'Admin'], '/admin')
  const cn = decodeURIComponent(params.cn)

  if (!isSheetsConfigured()) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-8">
        <Notice variant="warning">The database is not connected yet.</Notice>
      </div>
    )
  }

  const [users, appointments, files, billing] = await Promise.all([
    rows('users.list', {}),
    rows('appointments.list', { patient_cn: cn }),
    rows('files.list', { patient_cn: cn }),
    rows('billing.list', { patient_cn: cn }),
  ])

  const patient = users.find((row) => text(row, 'cn') === cn)
  if (!patient) notFound()

  const fullName = text(patient, 'full_name') || 'Unnamed patient'
  const outstanding = billing
    .filter((row) => text(row, 'status') !== 'Paid' && text(row, 'status') !== 'Void')
    .reduce((sum, row) => sum + (parseInt(text(row, 'amount_php') || '0', 10) || 0), 0)

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
      <Link href="/admin/patients" className="text-sm text-brand-700 hover:underline">
        ← All patients
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl text-ink">{fullName}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {cn} · {text(patient, 'email') || 'no email'}
            {text(patient, 'phone') ? ` · ${text(patient, 'phone')}` : ''}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-sand-100 px-2.5 py-1 text-ink-soft">
            {text(patient, 'is_active') === 'TRUE' ? 'Active account' : 'Inactive account'}
          </span>
          <span className="rounded-full bg-ember-50 px-2.5 py-1 text-ember-800">
            ₱{outstanding.toLocaleString('en-PH')} outstanding
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-base text-ink">Appointments</h2>
          {appointments.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No appointments yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink/5 text-sm">
              {appointments.map((row) => (
                <li key={text(row, 'id')} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-ink">{text(row, 'scheduled_at')}</p>
                    <p className="text-xs text-ink-muted">
                      {text(row, 'chair') ? `Chair ${text(row, 'chair')}` : 'No chair'}
                    </p>
                  </div>
                  <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs text-ink-soft">
                    {text(row, 'status')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-base text-ink">Lab files</h2>
          {files.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No files uploaded yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink/5 text-sm">
              {files.map((row) => (
                <li key={text(row, 'id')} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-ink">{text(row, 'title')}</p>
                    <p className="text-xs text-ink-muted">
                      {text(row, 'category')} · {text(row, 'uploaded_at')}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-sand-100 px-2 py-0.5 text-xs text-ink-soft">
                    {text(row, 'status')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5 lg:col-span-2">
          <h2 className="font-display text-base text-ink">Billing</h2>
          {billing.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No invoices yet.</p>
          ) : (
            <table className="mt-3 w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <tr>
                  <th className="pb-2 font-semibold">Invoice</th>
                  <th className="pb-2 font-semibold">Description</th>
                  <th className="pb-2 font-semibold">Issued</th>
                  <th className="pb-2 text-right font-semibold">Amount</th>
                  <th className="pb-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {billing.map((row) => (
                  <tr key={text(row, 'id')}>
                    <td className="py-2.5 text-ink">{text(row, 'invoice_no')}</td>
                    <td className="py-2.5 text-ink-soft">{text(row, 'description') || '—'}</td>
                    <td className="py-2.5 text-xs text-ink-muted">{text(row, 'issued_at')}</td>
                    <td className="py-2.5 text-right text-ink">
                      ₱{(parseInt(text(row, 'amount_php') || '0', 10) || 0).toLocaleString('en-PH')}
                    </td>
                    <td className="py-2.5 text-right text-ink-soft">{text(row, 'status')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
