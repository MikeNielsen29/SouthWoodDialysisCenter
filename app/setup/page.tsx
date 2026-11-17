import Link from 'next/link'
import type { Metadata } from 'next'
import { z } from 'zod'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { createAdminAction } from './actions'

export const metadata: Metadata = {
  title: 'First-time setup',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const AnyArray = z.array(z.unknown())

export default async function SetupPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string }
}) {
  const expected = process.env.SETUP_TOKEN
  const token = searchParams.token || ''
  const tokenOk = expected ? token === expected : true

  let userCount: number | null = null
  if (isSheetsConfigured() && tokenOk) {
    try {
      const usersRaw = await callSheets('users.list', {})
      const users = Array.isArray(usersRaw) ? usersRaw : []
      userCount = users.length
    } catch {
      userCount = null
    }
  }

  const ready = tokenOk && userCount === 0

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-5 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-ink/10 bg-white p-8 shadow-lift">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
          Southwoods Bicutan Dialysis and Medical Center
        </Link>
        <h1 className="display mt-4 text-[28px] leading-tight">First-time setup</h1>

        {!tokenOk ? (
          <p className="mt-4 text-sm text-ember-700">The setup token is missing or incorrect.</p>
        ) : !isSheetsConfigured() ? (
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            The database is not connected. Add the CloudBase URL and access key to the
            environment, deploy the CloudBase service, then run{' '}
            <strong>CloudBase → Run setup</strong>.
          </p>
        ) : userCount === null ? (
          <p className="mt-4 text-sm text-ember-700">
            Could not reach the database. Check the CloudBase service and the access key.
          </p>
        ) : userCount > 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            This site already has {userCount} account{userCount === 1 ? '' : 's'}. Sign in instead,
            or ask a Super Admin to create more users from the dashboard.
          </p>
        ) : null}

        {searchParams.error ? (
          <p role="alert" className="mt-4 rounded-xl bg-ember-100/60 px-4 py-3 text-sm text-ember-700">
            {searchParams.error}
          </p>
        ) : null}

        {ready ? (
          <>
            {!expected ? (
              <p className="mt-6 rounded-xl bg-sand-100 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
                No <code className="rounded bg-white px-1">SETUP_TOKEN</code> is configured, so
                this page stays open only while the site has no accounts. It locks itself as
                soon as the first administrator exists.
              </p>
            ) : null}
            <form action={createAdminAction} className="mt-6 space-y-4">
            <input type="hidden" name="token" value={token} />
            <div>
              <label htmlFor="cn" className="block text-[13px] font-medium text-ink">
                Control number
              </label>
              <input
                id="cn"
                name="cn"
                required
                className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="SDC-ADMIN"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-[13px] font-medium text-ink">
                Full name
              </label>
              <input
                id="name"
                name="name"
                required
                className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-ink">
                Email (receives sign-in codes)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={10}
                className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-900 px-4 py-3 text-sm font-semibold text-sand-50 transition-colors hover:bg-brand-800"
            >
              Create administrator
            </button>
          </form>
          </>
        ) : null}
      </div>
    </main>
  )
}
