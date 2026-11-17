import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, MailCheck, ShieldCheck } from 'lucide-react'
import { devOtpActive } from '@/lib/auth/otp'
import { isSheetsConfigured } from '@/lib/sheets/client'
import { loginAction, verifyOtpAction } from './actions'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: {
    step?: string
    cn?: string
    next?: string
    error?: string
    created?: string
    reset?: string
  }
}

export default function LoginPage({ searchParams }: Props) {
  const step = searchParams.step === 'otp' ? 'otp' : 'password'
  const next = searchParams.next || ''
  const error = searchParams.error || ''
  const configured = isSheetsConfigured()

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-900 px-12 py-14 text-sand-50 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-700/60 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-ember-500/20 blur-3xl" />
        </div>

        <Link href="/" className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-sand-50/10">
            <Image src="/SBDC.png" alt="" width={44} height={44} className="h-full w-full object-contain" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[19px] tracking-tight">Southwoods Bicutan</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-sand-100/50">
              Dialysis and Medical Center
            </span>
          </span>
        </Link>

        <div className="relative max-w-sm">
          <span className="eyebrow text-ember-400">Secure access</span>
          <h1 className="display mt-5 text-[clamp(1.9rem,3vw,2.6rem)] leading-[1.1]">
            Your results, appointments and care team in one place.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-sand-100/60">
            Patients sign in with the control number issued at the clinic. Staff accounts use the
            same form and are routed to the administration dashboard.
          </p>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-sand-100/40">
          <ShieldCheck className="h-4 w-4 text-ember-400" aria-hidden />
          Protected under RA 10173 and RA 8792. Sessions expire after 8 hours.
        </p>
      </aside>

      <main className="flex items-center justify-center bg-sand-50 px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to website
          </Link>

          <h2 className="display mt-8 text-[30px] leading-tight">
            {step === 'otp' ? 'Enter your code' : 'Sign in'}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            {step === 'otp'
              ? 'We sent a 6-digit code to the email address on your record.'
              : 'Use your control number and password to continue.'}
          </p>

          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-ember-400/40 bg-ember-100/50 px-4 py-3 text-sm text-ember-700"
            >
              {error}
            </p>
          ) : null}

          {!configured ? (
            <p className="mt-5 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink-soft">
              The database is not connected yet. Finish the CloudBase setup, then reload this
              page.
            </p>
          ) : null}

          {searchParams.created ? (
            <p className="mt-5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              Administrator account created. Sign in to continue.
            </p>
          ) : null}

          {step === 'password' ? (
            <form action={loginAction} className="mt-7 space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <label htmlFor="cn" className="block text-[13px] font-medium text-ink">
                  Control number or email
                </label>
                <input
                  id="cn"
                  name="cn"
                  required
                  autoComplete="username"
                  autoFocus
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="e.g. SDC-0001 or name@email.com"
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
                  autoComplete="current-password"
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <Link
                  href="/login/forgot"
                  className="mt-2 inline-block text-[12px] font-medium text-brand-700 transition-colors hover:text-brand-900"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-900 px-4 py-3 text-sm font-semibold tracking-wide text-sand-50 transition-colors hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Continue
              </button>
            </form>
          ) : (
            <form action={verifyOtpAction} className="mt-7 space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <label htmlFor="code" className="block text-[13px] font-medium text-ink">
                  Verification code
                </label>
                <input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  autoFocus
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-center font-display text-2xl tracking-[0.5em] text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-900 px-4 py-3 text-sm font-semibold tracking-wide text-sand-50 transition-colors hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Verify and sign in
              </button>

              <p className="flex items-center gap-2 text-xs text-ink-muted">
                <MailCheck className="h-4 w-4" aria-hidden />
                The code expires 10 minutes after it was sent.
              </p>
            </form>
          )}

          {devOtpActive() && step === 'otp' ? (
            <p className="mt-5 rounded-xl border border-ink/10 bg-white px-4 py-3 text-xs text-ink-soft">
              Development mode: email is not configured, so the code is <strong>000000</strong>.
              This path is disabled in production.
            </p>
          ) : null}

          <p className="mt-8 text-xs leading-relaxed text-ink-muted">
            By signing in you agree to the{' '}
            <Link href="/terms-of-service" className="underline decoration-ink/20 hover:text-brand-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="underline decoration-ink/20 hover:text-brand-700">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  )
}
