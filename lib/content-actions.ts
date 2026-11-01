'use server'

import { revalidateTag } from 'next/cache'
import { isSheetsConfigured } from '@/lib/sheets/client'

export async function saveSettingsAction(formData: FormData) {
  if (!isSheetsConfigured()) {
    return { ok: false as const, error: 'Backend not configured' }
  }

  const payload = {
    hotline: (formData.get('hotline') as string | null)?.trim() || '',
    address: (formData.get('address') as string | null)?.trim() || '',
    hours: (formData.get('hours') as string | null)?.trim() || '',
    email: (formData.get('email') as string | null)?.trim() || '',
    facebook: (formData.get('facebook') as string | null)?.trim() || '',
    instagram: (formData.get('instagram') as string | null)?.trim() || '',
    x: (formData.get('x') as string | null)?.trim() || '',
    linkedin: (formData.get('linkedin') as string | null)?.trim() || '',
    disclaimer: (formData.get('disclaimer') as string | null)?.trim() || '',
    consentVersion: (formData.get('consent_version') as string | null)?.trim() || '1',
  }

  revalidateTag('content')
  return { ok: true as const }
}
