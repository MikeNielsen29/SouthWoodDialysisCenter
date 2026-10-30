import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-sand-50">
      <div className="shell flex h-[60px] items-center justify-between gap-4">
        <Link href="/admin" className="font-display text-lg text-ink">
          Admin
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/admin/settings" className="text-sm text-ink-soft hover:text-brand-700">
            Settings
          </Link>
          <a href="/logout" className="text-sm text-ink-soft hover:text-ember-600">
            Sign out
          </a>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-sand-50 py-4">
      <div className="shell text-xs text-ink-muted">
        Southwood Dialysis Center Admin &mdash; internal use only.
      </div>
    </footer>
  )
}
