import type { Metadata } from 'next'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'
import Link from 'next/link'
import { BillingListWithRecords } from '../shared'

export const metadata: Metadata = {
  title: 'My billing',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>

async function loadBilling(cn: string): Promise<Row[]> {
  try {
    const rows = await callSheets<unknown>('billing.list', { patient_cn: cn })
    return Array.isArray(rows)
      ? rows.filter((row): row is Row => Boolean(row) && typeof row === 'object')
      : []
  } catch {
    return []
  }
}

export default async function PortalBillingPage() {
  const session = await requireUserOrRedirect('/portal/billing')
  const billing = await loadBilling(session.cn)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">My billing</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Statements issued to {session.full_name || session.cn}.
          </p>
        </div>
        <Link
          href="/portal"
          className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs text-ink-muted transition hover:border-brand-300 hover:text-brand-700"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="rounded-xl border border-ink/10 bg-white p-5">
        <BillingListWithRecords
          records={billing.map((row) => ({
            id: String(row.id ?? ''),
            invoice_no: String(row.invoice_no ?? ''),
            description: String(row.description ?? ''),
            amount_php: String(row.amount_php ?? '0'),
            status: String(row.status ?? ''),
            issued_at: String(row.issued_at ?? ''),
          }))}
        />
      </div>
    </div>
  )
}
