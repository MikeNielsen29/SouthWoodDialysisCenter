import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { Card, Empty, Notice, Pill, Table, TableData, TableHead, TableHeadCell, TableRow, TableRows } from '@/components/admin/ui'
import { load } from '@/lib/admin/data'
import { TestimonialSchema } from '@/lib/sheets/types'
import { moderateTestimonialAction } from '../actions'

export const metadata: Metadata = {
  title: 'Testimonials',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface TestimonialRow {
  id?: string
  patient_cn?: string
  display_name?: string
  rating?: string | number
  body?: string
  status?: string
  created_at?: string
}

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: { ok?: string; error?: string }
}) {
  await requireRoleOrRedirect(['Super Admin', 'Admin'], '/admin')

  const raw = await load('testimonials.list', TestimonialSchema.array(), { limit: 100 })
  const data = (Array.isArray(raw) ? raw : []) as TestimonialRow[]

  const pending = data.filter((item) => (item.status || 'Pending') === 'Pending')
  const reviewed = data.filter((item) => (item.status || 'Pending') !== 'Pending')

  function row(item: TestimonialRow, index: number) {
    const rating = Math.max(0, Math.min(5, Number(item.rating) || 0))
    return (
      <TableRow key={item.id || index}>
        <TableData className="whitespace-nowrap">
          <span className="text-ember-500" aria-label={`${rating} out of 5`}>
            {'★'.repeat(rating)}
            <span className="text-ink-200">{'★'.repeat(5 - rating)}</span>
          </span>
        </TableData>
        <TableData className="font-medium">
          {item.display_name || item.patient_cn || '—'}
          {item.patient_cn ? (
            <span className="block text-[11px] font-normal text-ink-muted">{item.patient_cn}</span>
          ) : null}
        </TableData>
        <TableData className="max-w-[380px] text-ink-soft">
          <p className="whitespace-pre-line text-[13px] leading-relaxed">{item.body || '—'}</p>
        </TableData>
        <TableData>
          <Pill variant={item.status === 'Approved' ? 'brand' : 'default'}>
            {item.status || 'Pending'}
          </Pill>
        </TableData>
        <TableData>
          {item.status === 'Pending' ? (
            <div className="flex items-center gap-2">
              <form action={moderateTestimonialAction}>
                <input type="hidden" name="id" value={item.id || ''} />
                <input type="hidden" name="status" value="Approved" />
                <button
                  type="submit"
                  className="rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-medium text-sand-50 transition hover:bg-brand-900"
                >
                  Approve
                </button>
              </form>
              <form action={moderateTestimonialAction}>
                <input type="hidden" name="id" value={item.id || ''} />
                <input type="hidden" name="status" value="Rejected" />
                <button
                  type="submit"
                  className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-ember-300 hover:text-ember-700"
                >
                  Reject
                </button>
              </form>
            </div>
          ) : (
            <span className="text-[11px] text-ink-muted">Reviewed</span>
          )}
        </TableData>
      </TableRow>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-xl text-ink">Testimonials</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Patients submit reviews from their own portal account. Your role here is to
          approve or reject them — edits are not allowed, so the words stay the
          patient&apos;s own.
        </p>
      </div>

      {searchParams.ok ? <Notice variant="info">{searchParams.ok}</Notice> : null}
      {searchParams.error ? <Notice variant="warning">{searchParams.error}</Notice> : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">Waiting</p>
          <p className="mt-1 font-display text-2xl text-ink">{pending.length}</p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">Approved</p>
          <p className="mt-1 font-display text-2xl text-ink">
            {data.filter((item) => item.status === 'Approved').length}
          </p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">Rejected</p>
          <p className="mt-1 font-display text-2xl text-ink">
            {data.filter((item) => item.status === 'Rejected').length}
          </p>
        </div>
      </div>

      <Card>
        <h2 className="mb-4 font-display text-base text-ink">Waiting for review</h2>
        {pending.length === 0 ? (
          <Empty description="No reviews waiting." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Rating</TableHeadCell>
                <TableHeadCell>Patient</TableHeadCell>
                <TableHeadCell>Review</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Decision</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableRows>{pending.map(row)}</TableRows>
          </Table>
        )}
      </Card>

      <div className="mt-6">
        <Card>
          <h2 className="mb-4 font-display text-base text-ink">Reviewed</h2>
          {reviewed.length === 0 ? (
            <Empty description="Nothing reviewed yet." />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Rating</TableHeadCell>
                  <TableHeadCell>Patient</TableHeadCell>
                  <TableHeadCell>Review</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Decision</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableRows>{reviewed.map(row)}</TableRows>
            </Table>
          )}
        </Card>
      </div>
    </div>
  )
}
