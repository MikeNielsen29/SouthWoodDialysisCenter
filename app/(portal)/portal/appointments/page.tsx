import type { Metadata } from 'next'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'
import Link from 'next/link'
import { Notice } from '../shared'
import { requestAppointmentAction, cancelAppointmentAction } from '../actions'

export const metadata: Metadata = {
  title: 'My appointments',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>

async function loadAppointments(cn: string): Promise<Row[]> {
  try {
    const rows = await callSheets<unknown>('appointments.list', { patient_cn: cn })
    return Array.isArray(rows)
      ? rows.filter((row): row is Row => Boolean(row) && typeof row === 'object')
      : []
  } catch {
    return []
  }
}

export default async function PortalAppointmentsPage({
  searchParams,
}: {
  searchParams: { requested?: string; cancelled?: string; error?: string }
}) {
  const session = await requireUserOrRedirect('/portal/appointments')
  const appointments = await loadAppointments(session.cn)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">My appointments</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Request, view, and cancel your dialysis appointments.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/portal"
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs text-ink-muted transition hover:border-brand-300 hover:text-brand-700"
          >
            Back to dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs text-ink-muted transition hover:border-brand-300 hover:text-brand-700"
          >
            Leave portal
          </Link>
        </div>
      </div>

      {searchParams.error ? (
        <div className="mb-5">
          <Notice variant="warning">{searchParams.error}</Notice>
        </div>
      ) : searchParams.requested ? (
        <div className="mb-5">
          <Notice variant="info">Request sent. The clinic will confirm your schedule.</Notice>
        </div>
      ) : searchParams.cancelled ? (
        <div className="mb-5">
          <Notice variant="info">Appointment cancelled.</Notice>
        </div>
      ) : null}

      <section className="mb-6 rounded-xl border border-ink/10 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base text-ink">Request an appointment</h2>
          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
            {session.cn}
          </span>
        </div>

        <form action={requestAppointmentAction} className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Date and time</label>
              <input
                name="scheduled_at"
                type="datetime-local"
                required
                defaultValue={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16)}
                className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Notes</label>
              <input
                name="notes"
                placeholder="Any updates since last visit"
                className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
            >
              Request appointment
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-ink/10 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base text-ink">Your appointments</h2>
          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
            {appointments.length} total
          </span>
        </div>

        {appointments.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No appointments on file yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink/5">
            {appointments.map((row) => {
              const id = String(row.id ?? '')
              const status = String(row.status ?? '')
              return (
                <li key={id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-ink">{String(row.scheduled_at ?? '')}</p>
                    <p className="text-xs text-ink-muted">
                      {status}
                      {row.chair ? ` · Chair ${String(row.chair)}` : ''}
                    </p>
                  </div>
                  {status === 'Requested' || status === 'Confirmed' ? (
                    <form action={cancelAppointmentAction}>
                      <input type="hidden" name="id" value={id} />
                      <button
                        type="submit"
                        className="rounded-md border border-ink/15 px-2.5 py-1 text-xs text-ink-soft transition hover:border-ember-300 hover:text-ember-700"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="mt-5">
        <Notice variant="info">
          For urgent symptoms between sessions, use the urgent help panel on the dashboard or call
          the on-call line.
        </Notice>
      </div>
    </div>
  )
}
