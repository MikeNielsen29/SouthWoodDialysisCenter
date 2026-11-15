import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { Notice } from '@/components/admin/ui'
import { UserAdmin, type ManagedUser } from './UserAdmin'

export const metadata: Metadata = {
  title: 'User management',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

async function loadUsers(): Promise<{ users: ManagedUser[]; error?: string }> {
  if (!isSheetsConfigured()) {
    return {
      users: [],
      error:
        'The database is not connected yet. Finish the CloudBase setup, then reload.',
    }
  }

  try {
    const rows = await callSheets<unknown>('users.list', {})
    if (!Array.isArray(rows)) return { users: [] }

    const users: ManagedUser[] = rows
      .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
      .map((row) => ({
        id: String(row.id ?? ''),
        cn: String(row.cn ?? ''),
        full_name: String(row.full_name ?? ''),
        email: String(row.email ?? ''),
        role: String(row.role ?? 'Patient'),
        is_active: String(row.is_active ?? 'TRUE'),
        must_change_password: String(row.must_change_password ?? 'FALSE'),
        last_login_at: String(row.last_login_at ?? ''),
        created_at: String(row.created_at ?? ''),
      }))
      .filter((user) => user.id)

    return { users }
  } catch {
    return {
      users: [],
      error:
        'Could not read the accounts. Check that the CloudBase service is live and the access key matches.',
    }
  }
}

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: {
    created?: string
    updated?: string
    deleted?: string
    reset?: string
    error?: string
  }
}) {
  await requireRoleOrRedirect(['Super Admin'], '/admin')

  const { users, error } = await loadUsers()
  const store = await cookies()
  const tempPassword = searchParams.reset ? store.get('temp_password')?.value : undefined

  const flash = searchParams.error
    ? { tone: 'error' as const, message: searchParams.error }
    : searchParams.created
      ? { tone: 'ok' as const, message: `Account ${searchParams.created} created.` }
      : searchParams.updated
        ? {
            tone: 'ok' as const,
            message:
              searchParams.updated === 'role'
                ? 'Role updated.'
                : 'Account status updated.',
          }
        : searchParams.deleted
          ? { tone: 'ok' as const, message: 'Account deleted.' }
          : searchParams.reset
            ? { tone: 'ok' as const, message: 'Password reset. The temporary password is below.' }
            : undefined

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-xl text-ink">User management</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Create staff and patient accounts, change roles, reset passwords, deactivate access, or
          delete an account. Everything here is restricted to Super Admin.
        </p>
      </div>

      {error ? (
        <div className="mb-5">
          <Notice variant="warning">{error}</Notice>
        </div>
      ) : null}

      <UserAdmin users={users} flash={flash} tempPassword={tempPassword} />
    </div>
  )
}
