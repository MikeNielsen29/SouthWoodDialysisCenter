import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { getSettings } from '@/lib/content'
import { UserTable } from './UserTable'

export const metadata: Metadata = {
  title: 'User management',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function UserManagementPage() {
  await requireRoleOrRedirect(['Super Admin'], '/admin')
  const settings = await getSettings()

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto flex max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl text-ink">User management</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Super admins can create, reset, and deactivate staff and patient accounts.
            </p>
          </div>
          <a
            href="/admin/settings?tab=users"
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs text-ink-muted transition hover:border-brand-300 hover:text-brand-700"
          >
            Back to settings
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="rounded-xl border border-ink/10 bg-white p-5">
            <UserTable />
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl border border-ink/10 bg-white p-5 text-sm text-ink-muted">
              <p className="font-medium text-ink mb-2">What you can do here</p>
              <ul className="space-y-2">
                <li>Create new staff or patient accounts.</li>
                <li>Reset a user&apos;s password, which sends a one-time login code.</li>
                <li>Deactivate accounts that should no longer sign in.</li>
              </ul>
              <p className="mt-4 text-xs text-ink-muted">
                Passwords are never stored in plain text. Resets use the same email OTP flow as self-service sign-in.
              </p>
            </div>

            <div className="rounded-xl border border-ink/10 bg-white p-5 text-sm">
              <p className="font-medium text-ink mb-1">Need help?</p>
              <p className="text-ink-muted">
                If a user reports they cannot sign in, check that their email on file is correct before resetting.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
