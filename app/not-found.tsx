import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand-50 p-6 text-center">
      <div className="max-w-sm">
        <p className="text-sm font-medium text-ink-muted uppercase tracking-wider">404</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            Go home
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-sand-50"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  )
}
