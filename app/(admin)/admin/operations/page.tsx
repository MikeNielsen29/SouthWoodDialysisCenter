import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { getSettings } from '@/lib/content'
import { QueueBoard } from './QueueBoard'
import { AppointmentsBoard } from './AppointmentsBoard'
import { BillingBoard } from './BillingBoard'
import { ShiftsBoard } from './ShiftsBoard'

export const metadata: Metadata = {
  title: 'Operations',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function OperationsPage() {
  await requireRoleOrRedirect(['Super Admin', 'Admin'], '/admin')
  const settings = await getSettings()

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto flex max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="font-display text-xl text-ink">Operations</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage today’s queue, appointments, billing, and staff shifts.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <QueueBoard />
          </section>
          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <AppointmentsBoard />
          </section>
          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <BillingBoard />
          </section>
          <section className="rounded-xl border border-ink/10 bg-white p-5">
            <ShiftsBoard />
          </section>
        </div>
      </div>
    </div>
  )
}
