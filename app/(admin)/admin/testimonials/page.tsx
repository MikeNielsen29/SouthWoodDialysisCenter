import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { getSettings } from '@/lib/content'
import { Card, Empty, Field, FileText, Notice, Pill, Select, Submit, Table, TableHead, TableRows, TableRow, TableHeadCell, TableData } from '@/components/admin/ui'
import { load } from '@/lib/admin/data'
import { TestimonialSchema } from '@/lib/sheets/types'
import { moderateTestimonialAction } from '../actions'

export const metadata: Metadata = {
  title: 'Testimonials',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function TestimonialsPage() {
  await requireRoleOrRedirect(['Super Admin', 'Admin'], '/admin')
  const settings = await getSettings()
  const raw = await load('testimonials.listAll', TestimonialSchema.array(), { limit: 50 })
  const data = Array.isArray(raw) ? raw : []
  const error = typeof raw === 'object' && raw !== null && 'error' in raw ? String((raw as { error?: string }).error) : ''

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl text-ink">Testimonials</h1>
            <p className="mt-1 text-sm text-ink-muted">Review and moderate patient testimonials.</p>
          </div>
        </div>

        {error ? <Notice variant="warning">{error}</Notice> : null}

        {data.length === 0 ? (
          <Empty description="No testimonials yet." />
        ) : (
          <Table>
            <TableHead>
              <div className="border-b border-ink/5">
                <div className="grid grid-cols-[48px_160px_1fr_120px_120px] gap-3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  <TableHeadCell>Rating</TableHeadCell>
                  <TableHeadCell>Patient</TableHeadCell>
                  <TableHeadCell>Testimonial</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Action</TableHeadCell>
                </div>
              </div>
            </TableHead>
            <TableRows>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableData className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < item.rating ? 'text-ember-600' : 'text-ink-200'}>
                        <span className="text-lg leading-none">★</span>
                      </span>
                    ))}
                  </TableData>
                  <TableData className="font-medium">{item.display_name || item.patient_cn || '—'}</TableData>
                  <TableData className="text-ink-soft">{item.body}</TableData>
                  <TableData className="select-none">
                    <form action={moderateTestimonialAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <Select name="status" defaultValue={item.status} className="w-auto">
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </Select>
                    </form>
                  </TableData>
                  <TableData>
                    <form action={moderateTestimonialAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <Submit className="w-auto">Save</Submit>
                    </form>
                  </TableData>
                </TableRow>
              ))}
            </TableRows>
          </Table>
        )}

        <div className="mt-6 border-t border-ink/10 pt-6 text-xs text-ink-muted">
          <p>Testimonials are submitted by patients through the portal and are moderated here before they appear on the public site.</p>
        </div>
      </div>
    </div>
  )
}
