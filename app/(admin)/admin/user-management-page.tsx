import { Empty, Notice } from '@/components/admin/ui'
import { load } from '@/lib/admin/data'
import { UserSchema } from '@/lib/sheets/types'

export default async function UserManagementPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const raw = await load('users.list', UserSchema.array())
  const data = Array.isArray(raw) ? raw : []
  const error = typeof raw === 'object' && raw !== null && 'error' in raw ? String((raw as { error?: string }).error) : ''

  return (
    <div className="space-y-6">
      <header>
        <h1 className="display text-[28px] leading-tight">Users</h1>
        <p className="mt-1 text-sm text-ink-muted">Staff and patient accounts.</p>
      </header>

      {searchParams.ok ? <Notice variant="info">{searchParams.ok}</Notice> : null}
      {searchParams.error ? <Notice variant="warning">{searchParams.error}</Notice> : null}
      {error ? <Notice variant="warning">{error}</Notice> : null}

      {data.length === 0 ? (
        <Empty description="No users yet." />
      ) : (
        <ul className="space-y-3">
          {data.map((user) => (
            <li key={user.id} className="rounded-xl border border-ink/10 bg-white p-4 text-sm">
              {user.full_name || user.cn || '—'} &middot; {user.role}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
