import type { Metadata } from 'next'
import Link from 'next/link'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { getSettings } from '@/lib/content'
import { Header, Footer } from '../shared'
import { PrivacyHeading } from './privacy-heading'
import { PrivacyBody } from './privacy-body'

export const metadata: Metadata = {
  title: 'Privacy notice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PortalPrivacyPage() {
  const session = await requireUserOrRedirect('/portal/privacy')
  const settings = await getSettings()

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <PrivacyHeading />
          <div className="mt-6">
            <PrivacyBody />
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-ink-muted">
            <p>SDC Patient Portal</p>
            <Link href="/portal" className="hover:text-brand-700 transition-colors">Back to dashboard</Link>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  )
}
