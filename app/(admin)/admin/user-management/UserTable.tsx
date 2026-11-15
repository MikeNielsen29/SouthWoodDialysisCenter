'use client'

import { useEffect, useState } from 'react'

interface UserRow {
  id: string
  cn: string
  full_name: string
  email: string
  phone: string
  role: string
  is_active: string
  must_change_password: string
  failed_count: string
  locked_until: string
  last_login_at: string
  created_at: string
}

export function UserTable() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data?.users && Array.isArray(data.users)) {
          setUsers(data.users as UserRow[])
        } else {
          setError('Could not load users.')
        }
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-ink-muted">
        Loading users…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-ember-200 bg-ember-50 p-4 text-sm text-ember-800">
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-ink">All accounts</h2>
        <p className="text-xs text-ink-muted">User management actions are not wired yet.</p>
      </div>

      {users.length === 0 ? (
        <div className="mt-4 rounded-lg border border-ink/10 bg-sand-100/60 p-5 text-sm text-ink-muted text-center">
          No accounts yet.
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-ink/10">
          <table className="min-w-full divide-y divide-ink/10">
            <thead className="bg-sand-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-sand-50/40">
                  <td className="px-4 py-3 text-sm text-ink font-medium">
                    {user.full_name || user.cn}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-soft">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink-soft">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.is_active === 'TRUE' ? (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink-muted">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
