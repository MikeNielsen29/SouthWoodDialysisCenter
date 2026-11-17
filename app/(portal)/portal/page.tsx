import type { Metadata } from 'next'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { getSettings } from '@/lib/content'
import Link from 'next/link'
import { callSheets } from '@/lib/sheets/client'
import {
  AppointmentsList,
  FilesListWithFiles,
  BillingListWithRecords,
  EmergencyPanel,
  TestimonialForm,
} from './shared'
import { requestAppointmentAction, cancelAppointmentAction, submitTestimonialAction } from './actions'

export const metadata: Metadata = {
  title: 'Patient dashboard',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>

async function loadRows(action: string, payload: Record<string, unknown>): Promise<Row[]> {
  try {
    const rows = await callSheets<unknown>(action, payload)
    return Array.isArray(rows)
      ? rows.filter((row): row is Row => Boolean(row) && typeof row === 'object')
      : []
  } catch {
    return []
  }
}

export default async function PortalPage() {
  const session = await requireUserOrRedirect('/portal')
  const settings = await getSettings()
  const [appointments, files, billing] = await Promise.all([
    loadRows('appointments.list', { patient_cn: session.cn }),
    loadRows('files.list', { patient_cn: session.cn }),
    loadRows('billing.list', { patient_cn: session.cn }),
  ])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">
            Welcome back, {session.full_name || session.cn}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your appointments, files, and billing at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/portal/privacy"
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs text-ink-muted transition hover:border-brand-300 hover:text-brand-700"
          >
            Privacy notice
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs text-ink-muted transition hover:border-brand-300 hover:text-brand-700"
          >
            Leave portal
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <AppointmentsList
            session={session}
            onRequestAppointment={requestAppointmentAction}
            onCancelAppointment={cancelAppointmentAction}
            appointments={appointments.map((row) => ({
              id: String(row.id ?? ''),
              scheduled_at: String(row.scheduled_at ?? ''),
              status: String(row.status ?? ''),
              chair: String(row.chair ?? ''),
            }))}
          />
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <EmergencyPanel settings={settings} />
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <FilesListWithFiles
            files={files
              .filter((row) => String(row.status ?? '') === 'Released')
              .map((row) => ({
                id: String(row.id ?? ''),
                title: String(row.title ?? ''),
                category: String(row.category ?? ''),
              }))}
          />
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
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
        </section>
        <div className="lg:col-span-2">
          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <TestimonialForm
              session={session}
              onSubmit={submitTestimonialAction}
            />
          </section>
        </div>
      </div>
    </div>
  )
}
