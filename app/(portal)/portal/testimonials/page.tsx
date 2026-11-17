import type { Metadata } from 'next'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import Link from 'next/link'
import { TestimonialForm, Notice } from '../shared'
import { submitTestimonialAction } from '../actions'

export const metadata: Metadata = {
  title: 'Share your experience',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface MyTestimonial {
  id: string
  rating: string
  body: string
  status: string
  created_at: string
}

async function loadMine(cn: string): Promise<MyTestimonial[]> {
  if (!isSheetsConfigured()) return []
  try {
    const rows = await callSheets<unknown>('testimonials.list', { patient_cn: cn })
    if (!Array.isArray(rows)) return []
    return rows
      .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
      .map((row) => ({
        id: String(row.id ?? ''),
        rating: String(row.rating ?? '5'),
        body: String(row.body ?? ''),
        status: String(row.status ?? 'Pending'),
        created_at: String(row.created_at ?? ''),
      }))
      .filter((row) => row.id)
  } catch {
    return []
  }
}

function statusTone(status: string): string {
  if (status === 'Approved') return 'bg-brand-50 text-brand-700'
  if (status === 'Rejected') return 'bg-ink/5 text-ink-muted'
  return 'bg-ember-100 text-ember-700'
}

export default async function PortalTestimonialsPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string }
}) {
  const session = await requireUserOrRedirect('/portal/testimonials')
  const mine = await loadMine(session.cn)
  const isPatient = session.role === 'Patient'

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-ink">Share your experience</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Tell us about your care at Southwoods Bicutan. Every review is read by the clinic
              before it appears on the public site.
            </p>
          </div>
          <Link
            href="/portal"
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs text-ink-muted transition hover:border-brand-300 hover:text-brand-700"
          >
            Back to dashboard
          </Link>
        </div>

        <section className="rounded-xl border border-ink/10 bg-white p-5 mb-6">
          {isPatient ? (
            <TestimonialForm session={session} onSubmit={submitTestimonialAction} />
          ) : (
            <p className="text-sm text-ink-muted">
              Reviews can only be submitted from a patient account.
            </p>
          )}
        </section>

        {searchParams.sent ? (
          <Notice variant="info">
            Thank you — your review is submitted and waiting for clinic review.
          </Notice>
        ) : null}
        {searchParams.error ? (
          <Notice variant="warning">{searchParams.error}</Notice>
        ) : null}

        <section className="mt-6">
          <h2 className="font-display text-base text-ink">Your submitted reviews</h2>
          {mine.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">You have not submitted a review yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {mine.map((item) => (
                <li key={item.id} className="rounded-xl border border-ink/10 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ember-500" aria-label={`${item.rating} out of 5`}>
                      {'★'.repeat(Math.max(0, Math.min(5, Number(item.rating))))}
                      <span className="text-ink-200">
                        {'★'.repeat(5 - Math.max(0, Math.min(5, Number(item.rating))))}
                      </span>
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusTone(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
                  {item.created_at ? (
                    <p className="mt-2 text-[11px] text-ink-muted">
                      {new Date(item.created_at).toLocaleDateString('en-PH')}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
    </div>
  )
}
