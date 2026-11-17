import Link from 'next/link'
import { getSettings } from '@/lib/content'
import { logoutAction } from '@/app/login/actions'

export async function Header() {
  const settings = await getSettings()

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold">
              SD
            </span>
            <span className="font-display text-sm text-ink">Southwoods Bicutan Admin</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="rounded-lg border border-ink/10 bg-sand-100 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
            >
              View site
            </Link>
            <Link
              href="/admin/profile"
              className="text-ink-soft hover:text-ink transition-colors"
            >
              Profile
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs font-medium text-ink-muted transition-colors hover:text-ember-700"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </div>
    </header>
  )
}

export async function Footer({ settings }: { settings?: Awaited<ReturnType<typeof getSettings>> }) {
  return (
    <footer className="border-t border-ink/10 bg-white px-4 py-4 text-xs text-ink-muted sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p>Southwoods Bicutan Dialysis and Medical Center · Admin</p>
      </div>
    </footer>
  )
}
