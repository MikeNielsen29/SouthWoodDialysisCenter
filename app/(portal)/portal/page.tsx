import type { Metadata } from 'next'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { getSettings } from '@/lib/content'
import Link from 'next/link'
import { Header, Footer } from './shared'
import { AppointmentsList, FilesList, BillingList, EmergencyPanel, TestimonialForm } from './shared'
import { requestAppointmentAction, cancelAppointmentAction, submitTestimonialAction } from './actions'

export const metadata: Metadata = {
  title: 'Patient dashboard',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PortalPage() {
  const session = await requireUserOrRedirect('/portal')
  const settings = await getSettings()

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
          />
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <EmergencyPanel settings={settings} />
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <FilesList session={session} />
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <BillingList />
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
