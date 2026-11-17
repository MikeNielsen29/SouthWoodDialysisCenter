import type { Metadata } from 'next'
import Link from 'next/link'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { PrivacyHeading } from './privacy-heading'
import { PrivacyBody } from './privacy-body'

export const metadata: Metadata = {
  title: 'Privacy notice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PortalPrivacyPage() {
  await requireUserOrRedirect('/portal/privacy')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PrivacyHeading />
      <div className="mt-6">
        <PrivacyBody />
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-ink-muted">
        <p>Southwoods Bicutan Patient Portal</p>
        <Link href="/portal" className="hover:text-brand-700 transition-colors">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
