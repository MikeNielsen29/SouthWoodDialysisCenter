'use client'

import {
  createUserAction,
  deleteUserAction,
  resetUserPasswordAction,
  toggleUserActiveAction,
  updateUserRoleAction,
} from '@/app/(admin)/admin/actions'
import { Field, Input, Notice, Select, Submit } from '@/components/admin/ui'

export type ManagedUser = {
  id: string
  cn: string
  full_name?: string
  email?: string
  role: string
  is_active?: string
  must_change_password?: string
  last_login_at?: string
  created_at?: string
}

const ROLES = [
  { value: 'Super Admin', hint: 'Everything, including accounts, settings and the audit log' },
  { value: 'Admin', hint: 'Operations, inquiries, files and page content' },
  { value: 'Page Editor', hint: 'Page content, services and news only' },
  { value: 'Patient', hint: 'Patient portal only' },
]

export function UserAdmin({
  users,
  tempPassword,
  flash,
}: {
  users: ManagedUser[]
  tempPassword?: string
  flash?: { tone: 'ok' | 'error'; message: string }
}) {
  return (
    <div className="space-y-6">
      {flash ? <Notice variant={flash.tone === 'ok' ? 'info' : 'warning'}>{flash.message}</Notice> : null}

      {tempPassword ? (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
          <p className="text-sm font-medium text-brand-800">Temporary password (shown once)</p>
          <p className="mt-2 select-all font-mono text-lg tracking-wide text-ink">{tempPassword}</p>
          <p className="mt-2 text-xs text-brand-800/80">
            Send this to the user. They will be asked to choose a new password at their next
            sign-in. This banner disappears when you leave the page.
          </p>
        </div>
      ) : null}

      <section className="rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-display text-base text-ink">Create an account</h2>
        <p className="mt-1 text-xs text-ink-muted">
          The control number is what the user signs in with, alongside their password.
        </p>

        <form action={createUserAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Control number">
            <Input name="cn" required placeholder="SDC-0001" />
          </Field>
          <Field label="Full name">
            <Input name="full_name" required placeholder="Juan Dela Cruz" />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required placeholder="name@example.com" />
          </Field>
          <Field label="Role">
            <Select name="role" defaultValue="Patient">
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.value}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Temporary password" className="sm:col-span-2">
            <Input name="password" type="text" required minLength={10} placeholder="At least 10 characters" />
          </Field>
          <div className="sm:col-span-2">
            <Submit type="submit">Create account</Submit>
          </div>
        </form>

        <ul className="mt-4 grid gap-1.5 text-[11px] text-ink-muted sm:grid-cols-2">
          {ROLES.map((role) => (
            <li key={role.value}>
              <span className="font-medium text-ink-soft">{role.value}</span> — {role.hint}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-ink/10 bg-white">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
          <h2 className="font-display text-base text-ink">All accounts</h2>
          <span className="text-xs text-ink-muted">{users.length} total</span>
        </div>

        {users.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-muted">
            No accounts yet. Create the first one above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink/10">
              <thead className="bg-sand-50/80">
                <tr>
                  {['Account', 'Role', 'Status', 'Last sign-in', 'Actions'].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {users.map((user) => {
                  const active = String(user.is_active).toUpperCase() !== 'FALSE'
                  return (
                    <tr key={user.id} className="align-top hover:bg-sand-50/40">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-ink">{user.full_name || user.cn}</p>
                        <p className="text-xs text-ink-muted">{user.cn}</p>
                        <p className="text-xs text-ink-muted">{user.email}</p>
                        {String(user.must_change_password).toUpperCase() === 'TRUE' ? (
                          <p className="mt-1 text-[11px] text-ember-700">Must change password</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <form action={updateUserRoleAction} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={user.id} />
                          <Select name="role" defaultValue={user.role} className="w-36">
                            {ROLES.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.value}
                              </option>
                            ))}
                          </Select>
                          <button
                            type="submit"
                            className="rounded-md border border-ink/15 px-2 py-1 text-xs text-ink-soft transition hover:border-brand-400 hover:text-brand-700"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-3">
                        {active ? (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink-muted">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted">
                        {user.last_login_at ? String(user.last_login_at).slice(0, 10) : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <form action={resetUserPasswordAction}>
                            <input type="hidden" name="id" value={user.id} />
                            <button
                              type="submit"
                              className="rounded-md border border-ink/15 px-2 py-1 text-xs text-ink-soft transition hover:border-brand-400 hover:text-brand-700"
                            >
                              Reset password
                            </button>
                          </form>

                          <form action={toggleUserActiveAction}>
                            <input type="hidden" name="id" value={user.id} />
                            <input type="hidden" name="is_active" value={active ? 'FALSE' : 'TRUE'} />
                            <button
                              type="submit"
                              className="rounded-md border border-ink/15 px-2 py-1 text-xs text-ink-soft transition hover:border-brand-400 hover:text-brand-700"
                            >
                              {active ? 'Deactivate' : 'Activate'}
                            </button>
                          </form>

                          <form action={deleteUserAction}>
                            <input type="hidden" name="id" value={user.id} />
                            <button
                              type="submit"
                              onClick={(event) => {
                                if (
                                  !window.confirm(
                                    `Delete ${user.full_name || user.cn}? This cannot be undone.`
                                  )
                                ) {
                                  event.preventDefault()
                                }
                              }}
                              className="rounded-md border border-ember-200 px-2 py-1 text-xs text-ember-700 transition hover:border-ember-400 hover:bg-ember-50"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-[11px] leading-relaxed text-ink-muted">
        The last Super Admin cannot be deleted, and you cannot delete the account you are signed in
        with. Deactivated accounts keep their data but cannot sign in.
      </p>
    </div>
  )
}
