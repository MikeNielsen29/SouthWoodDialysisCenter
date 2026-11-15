'use server'

import { redirect } from 'next/navigation'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'

export async function requestPasswordResetAction(formData: FormData): Promise<void> {
  const identifier = String(formData.get('identifier') ?? '').trim()

  if (!identifier) {
    redirect('/login/forgot?error=missing')
  }

  if (isSheetsConfigured()) {
    try {
      await callSheets('auth.requestReset', { identifier })
    } catch {
      // Response stays generic on purpose.
    }
  }

  redirect('/login/forgot?sent=1')
}
