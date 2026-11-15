import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requestPasswordResetAction } from './actions'

export const metadata: Metadata = {
  title: 'Reset password · Southwood Dialysis Center',
  robots: { index: false, follow: false },
}

const fieldClass =
  'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:outline-none'

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string }
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-5 py-12 sm:px-8">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to sign in
        </Link>

        <h1 className="display mt-8 text-[30px] leading-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter the control number or email on your record. If we find the account we
          email a temporary password to the address we already have.
        </p>

        {searchParams.sent ? (
          <p
            role="status"
            className="mt-5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800"
          >
            If that account exists, the temporary password is on its way. Check your
            inbox, then sign in and change it.
          </p>
        ) : null}

        {searchParams.error ? (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-ember-200 bg-ember-50 px-4 py-3 text-sm text-ember-800"
          >
            Enter your control number or email.
          </p>
        ) : null}

        <form action={requestPasswordResetAction} className="mt-6 space-y-4">
          <label htmlFor="identifier" className="block text-[13px] font-medium text-ink">
            Control number or email
          </label>
          <input
            id="identifier"
            name="identifier"
            required
            autoComplete="username"
            placeholder="SDC-2026-0001 or you@example.com"
            className={fieldClass}
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-800 px-5 py-3 text-sm font-medium text-sand-50 transition-colors hover:bg-brand-900"
          >
            Email me a temporary password
          </button>
        </form>

        <p className="mt-6 text-xs leading-relaxed text-ink-muted">
          No email on file, or nothing arrives? Call the clinic and the front desk will
          reset it for you.
        </p>
      </div>
    </main>
  )
}
