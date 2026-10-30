'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand-50 p-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ember-100">
          <AlertTriangle className="h-6 w-6 text-ember-600" />
        </div>
        <h1 className="font-display text-2xl text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-muted">
          We could not load this page. Please try again in a moment.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-sand-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
