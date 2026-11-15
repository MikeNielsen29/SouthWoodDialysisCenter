import { Card, Empty, Field, FileText, Notice, Pill, Select, Submit, Table } from '@/components/admin/ui'
import { load } from '@/lib/admin/data'
import { InquirySchema } from '@/lib/sheets/types'
import { updateInquiryAction } from '../actions'

export const dynamic = 'force-dynamic'

function age(value: string): string {
  if (!value) return ''
  const now = Date.now()
  const then = new Date(value).getTime()
  if (isNaN(then)) return ''
  const seconds = Math.floor((now - then) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

export default async function InquiriesPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const raw = await load('inquiries.list', InquirySchema.array(), { limit: 50 })
  const data = Array.isArray(raw) ? raw : []
  const error = typeof raw === 'object' && raw !== null && 'error' in raw ? String((raw as { error?: string }).error) : ''

  return (
    <div className="space-y-6">
      <header>
        <h1 className="display text-[28px] leading-tight">Inquiry inbox</h1>
        <p className="mt-1 text-sm text-ink-muted">Messages submitted through the website contact form.</p>
      </header>

      {searchParams.ok ? <Notice variant="info">{searchParams.ok}</Notice> : null}
      {searchParams.error ? <Notice variant="warning">{searchParams.error}</Notice> : null}
      {error ? <Notice variant="warning">{error}</Notice> : null}

      {data.length === 0 ? (
        <Empty description="No inquiries yet." />
      ) : (
        <Table>
          <div className="border-b border-ink/5 bg-sand-50/80">
            <div className="grid gap-3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted sm:grid-cols-[auto_1fr_auto_auto_1fr]">
              <div className="font-medium">Name</div>
              <div className="font-medium">Subject</div>
              <div className="font-medium">Status</div>
              <div className="font-medium">Age</div>
              <div className="font-medium">Message</div>
            </div>
          </div>
          <div className="divide-y divide-ink/5">
            {data.map((inquiry) => (
              <div key={inquiry.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[auto_1fr_auto_auto_1fr] align-top">
                <div className="font-medium text-ink">{inquiry.name}</div>
                <div className="text-ink-soft">{inquiry.subject || '—'}</div>
                <div className="select-none">
                  <form action={updateInquiryAction}>
                    <input type="hidden" name="id" value={inquiry.id} />
                    <input type="hidden" name="notes" value={inquiry.notes || ''} />
                    <Select name="status" defaultValue={inquiry.status} className="w-auto">
                      <option value="New">New</option>
                      <option value="Read">Read</option>
                      <option value="Closed">Closed</option>
                    </Select>
                    <Submit type="submit" className="mt-2 w-auto px-2 py-1 text-[11px]">
                      Save
                    </Submit>
                  </form>
                </div>
                <div className="text-ink-muted text-[12px]">{age(inquiry.created_at)}</div>
                <div className="text-ink-soft">
                  <p className="text-[13px] leading-relaxed">{inquiry.message || '—'}</p>
                  {inquiry.email && <p className="mt-1 text-[11px] text-ink-muted">{inquiry.email}</p>}
                </div>
              </div>
            ))}
          </div>
        </Table>
      )}
    </div>
  )
}
