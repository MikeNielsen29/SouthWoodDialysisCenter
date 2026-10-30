import type { Metadata } from 'next'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { getSettings } from '@/lib/content'
import Link from 'next/link'
import { Header, Footer, Notice } from '../shared'
import { requestAppointmentAction } from '../actions'

export const metadata: Metadata = {
  title: 'My appointments',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PortalAppointmentsPage() {
  const session = await requireUserOrRedirect('/portal/appointments')
  const settings = await getSettings()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
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

      <section className="rounded-xl border border-ink/10 bg-white p-5 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base text-ink">Request an appointment</h2>
          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
            {session.cn}
          </span>
        </div>

        <RequestAppointmentForm session={session} />

        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Upcoming</p>
          <p className="text-sm text-ink-muted">No appointments on file yet.</p>
        </div>
      </section>

      <Notice variant="info">
        For urgent symptoms between sessions, use the urgent help panel on the dashboard or call the on-call line.
      </Notice>
    </div>
  )
}

function RequestAppointmentForm({ session }: { session: any }) {
  return (
    <form action={requestAppointmentAction} className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Date and time</label>
          <input
            name="scheduled_at"
            type="datetime-local"
            defaultValue={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Notes</label>
          <input
            name="notes"
            placeholder="Any updates since last visit"
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <RequestAppointmentButton />
      </div>
    </form>
  )
}

function RequestAppointmentButton() {
  return (
    <button
      type="submit"
      className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
    >
      Request appointment
    </button>
  )
}
