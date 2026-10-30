import type { Metadata } from 'next'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { getSettings } from '@/lib/content'
import Link from 'next/link'
import { Header, Footer, TestimonialForm, Notice } from '../shared'
import { submitTestimonialAction } from '../actions'

export const metadata: Metadata = {
  title: 'Share your experience',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PortalTestimonialsPage() {
  const session = await requireUserOrRedirect('/portal/testimonials')
  const settings = await getSettings()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Share your experience</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Tell us about your care at Southwood. Reviews are reviewed before they appear.
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
        <TestimonialForm session={session} onSubmit={submitTestimonialAction} />
      </section>

      <Notice variant="info">
        Your review helps other patients and families understand what to expect. Staff may review submissions before they are published.
      </Notice>
    </div>
  )
}
