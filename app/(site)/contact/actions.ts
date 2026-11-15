'use server'

import { redirect } from 'next/navigation'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { getSettings } from '@/lib/content'
import { isMailConfigured, sendMail } from '@/lib/mail'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function submitInquiryAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!name || !email || !message) {
    redirect('/contact?error=missing#request')
  }

  if (!isSheetsConfigured()) {
    redirect('/contact?error=backend#request')
  }

  let saved = false
  try {
    await callSheets('inquiries.create', {
      name,
      email,
      phone,
      subject: 'Website appointment request',
      message,
    })
    saved = true
  } catch {
    saved = false
  }

  if (!saved) {
    redirect('/contact?error=backend#request')
  }

  if (isMailConfigured()) {
    const settings = await getSettings()
    await sendMail(
      settings.email,
      `New website request from ${name}`,
      `<h2>New appointment request</h2>
       <p><strong>Name:</strong> ${escapeHtml(name)}</p>
       <p><strong>Email:</strong> ${escapeHtml(email)}</p>
       <p><strong>Phone:</strong> ${escapeHtml(phone || '—')}</p>
       <p><strong>Message:</strong></p>
       <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
       <p>Open the admin dashboard → Inquiries to mark it handled.</p>`
    )
  }

  redirect('/contact?sent=1#request')
}
