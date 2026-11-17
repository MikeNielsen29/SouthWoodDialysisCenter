import type { Metadata } from 'next'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { logoutAction } from '@/app/login/actions'
import { Notice } from '@/components/admin/ui'
import { changeStaffPasswordAction } from './actions'

export const metadata: Metadata = {
  title: 'My profile',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string }
}) {
  const session = await requireUserOrRedirect('/admin/profile')

  return (
    <div className="mx-auto max-w-[760px] px-4 py-8 sm:px-6">
      <h1 className="font-display text-xl text-ink">My profile</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Signed in as {session.full_name || session.cn} · {session.role}
      </p>

      {searchParams.error ? (
        <div className="mt-5">
          <Notice variant="warning">{searchParams.error}</Notice>
        </div>
      ) : searchParams.saved ? (
        <div className="mt-5">
          <Notice variant="info">Password updated.</Notice>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-base text-ink">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">Name</dt>
              <dd className="mt-0.5 text-ink">{session.full_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">CN</dt>
              <dd className="mt-0.5 text-ink">{session.cn}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">Email</dt>
              <dd className="mt-0.5 text-ink">{session.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">Role</dt>
              <dd className="mt-0.5 text-ink">{session.role}</dd>
            </div>
          </dl>
          <form action={logoutAction} className="mt-6">
            <button
              type="submit"
              className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm text-ink-soft transition hover:border-ember-300 hover:text-ember-700"
            >
              Sign out
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-base text-ink">Change password</h2>
          <form action={changeStaffPasswordAction} className="mt-4 space-y-3">
            <label className="block text-sm text-ink-soft">
              Current password
              <input
                name="current"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="block text-sm text-ink-soft">
              New password
              <input
                name="password"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="block text-sm text-ink-soft">
              Confirm new password
              <input
                name="confirm"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-brand-900 px-3 py-2 text-sm font-medium text-sand-50 transition hover:bg-brand-800"
            >
              Save password
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
