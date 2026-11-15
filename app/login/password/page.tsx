import Link from 'next/link'
import type { Metadata } from 'next'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { changePasswordAction } from '../actions'

export const metadata: Metadata = {
  title: 'Change password',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const session = await requireUserOrRedirect('/login/password')

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-ink-muted hover:text-brand-700">
          Southwood Dialysis Center
        </Link>

        <h1 className="display mt-6 text-[30px] leading-tight">Choose a new password</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Signed in as <strong className="text-ink">{session.cn}</strong>. Use at least 10
          characters with letters and numbers.
        </p>

        {searchParams.error ? (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-ember-400/40 bg-ember-100/50 px-4 py-3 text-sm text-ember-700"
          >
            {searchParams.error}
          </p>
        ) : null}

        <form action={changePasswordAction} className="mt-7 space-y-4">
          <div>
            <label htmlFor="current" className="block text-[13px] font-medium text-ink">
              Current password
            </label>
            <input
              id="current"
              name="current"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-ink">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-brand-900 px-4 py-3 text-sm font-semibold text-sand-50 transition-colors hover:bg-brand-800"
          >
            Save password
          </button>
        </form>
      </div>
    </main>
  )
}
