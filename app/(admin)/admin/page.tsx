import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import Link from 'next/link'
import { Stat } from '@/components/admin/ui'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface Stats {
  patients: number
  staff: number
  appointmentsThisMonth: number
  upcoming: number
  pendingTestimonials: number
  newInquiries: number
  averageRating: number
  files: number
  revenueThisMonth: number
}

const EMPTY_STATS: Stats = {
  patients: 0,
  staff: 0,
  appointmentsThisMonth: 0,
  upcoming: 0,
  pendingTestimonials: 0,
  newInquiries: 0,
  averageRating: 0,
  files: 0,
  revenueThisMonth: 0,
}

function num(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

async function loadStats(): Promise<Stats> {
  if (!isSheetsConfigured()) return EMPTY_STATS

  try {
    const raw = await callSheets<Record<string, unknown>>('analytics.summary', {})
    if (!raw || typeof raw !== 'object') return EMPTY_STATS

    return {
      patients: num(raw.patients),
      staff: num(raw.staff),
      appointmentsThisMonth: num(raw.appointmentsThisMonth),
      upcoming: num(raw.upcoming),
      pendingTestimonials: num(raw.pendingTestimonials),
      newInquiries: num(raw.newInquiries),
      averageRating: num(raw.averageRating),
      files: num(raw.files),
      revenueThisMonth: num(raw.revenueThisMonth),
    }
  } catch {
    return EMPTY_STATS
  }
}

export default async function AdminOverviewPage() {
  await requireRoleOrRedirect(['Super Admin', 'Admin'], '/admin')
  const stats = await loadStats()


  return (
    <div className="min-h-screen bg-sand-50">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-ink">Admin overview</h1>
            <p className="mt-1 text-sm text-ink-muted">Southwoods Bicutan Dialysis and Medical Center</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/settings"
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              Settings
            </Link>
            <Link
              href="/admin/content"
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              Content
            </Link>
            <Link
              href="/admin/services"
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              Services
            </Link>
            <Link
              href="/admin/news"
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              News
            </Link>
            <Link
              href="/admin/inquiries"
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              Inquiries
            </Link>
            <Link
              href="/admin/testimonials"
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              Testimonials
            </Link>
            <Link
              href="/admin/audit"
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              Audit
            </Link>
            <Link
              href="/admin/user-management"
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              Users
            </Link>
            <Link
              href="/admin/operations"
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              Operations
            </Link>
            <Link
              href="/admin/files"
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              Files
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Patients" value={stats.patients} />
          <Stat label="Staff" value={stats.staff} />
          <Stat label="Appointments this month" value={stats.appointmentsThisMonth} />
          <Stat label="Upcoming" value={stats.upcoming} />
          <Stat label="Pending testimonials" value={stats.pendingTestimonials} />
          <Stat label="New inquiries" value={stats.newInquiries} />
          <Stat label="Average rating" value={`${stats.averageRating.toFixed(1)} / 5`} />
          <Stat label="Files" value={stats.files} />
          <Stat label="Revenue this month" value={`₱${stats.revenueThisMonth.toLocaleString('en-PH')}`} />
        </div>
      </main>
    </div>
  )
}
