'use server'

import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/session'
import { passwordProblem } from '@/lib/auth/password'
import { callSheets, isSheetsConfigured, SheetsError } from '@/lib/sheets/client'
import { logAdminAction } from '@/lib/audit'

export async function changeStaffPasswordAction(formData: FormData): Promise<void> {
  const session = await requireUser('/admin/profile')
  const current = String(formData.get('current') ?? '')
  const next = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (!current || !next) {
    redirect('/admin/profile?error=' + encodeURIComponent('Fill in both password fields.'))
  }
  if (next !== confirm) {
    redirect('/admin/profile?error=' + encodeURIComponent('New passwords do not match.'))
  }
  if (!isSheetsConfigured()) {
    redirect('/admin/profile?error=' + encodeURIComponent('The database is not connected yet.'))
  }

  const problem = passwordProblem(next)
  if (problem) {
    redirect('/admin/profile?error=' + encodeURIComponent(problem))
  }

  try {
    await callSheets('auth.changePassword', {
      identifier: session.cn,
      current,
      next,
    })
  } catch (error) {
    const code = error instanceof SheetsError ? error.code : 'NETWORK'
    const message =
      code === 'INVALID_CREDENTIALS'
        ? 'Current password is incorrect.'
        : code === 'BAD_REQUEST'
          ? 'The new password is not accepted.'
          : 'Could not save the new password.'
    redirect('/admin/profile?error=' + encodeURIComponent(message))
  }

  await logAdminAction(session, 'auth.password_changed', 'user', session.sub)

  redirect('/admin/profile?saved=1')
}
