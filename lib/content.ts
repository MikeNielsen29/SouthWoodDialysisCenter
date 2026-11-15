'use server'

import { callSheets, isSheetsConfigured } from './sheets/client'

export interface Settings {
  hotline: string
  email: string
  address: string
  hours: string
  facebook: string
  instagram: string
  x: string
  linkedin: string
  disclaimer: string
  consentVersion: string
}

const defaultSettings: Settings = {
  hotline: '+1 (555) 014-2800',
  email: 'care@southwooddialysis.com',
  address: '123 Kidney Avenue\nSouthwood District',
  hours: 'Mon-Sat, 6:00 AM - 8:00 PM\nSunday: on-call only',
  facebook: 'https://facebook.com/southwooddialysis',
  instagram: 'https://instagram.com/southwooddialysis',
  x: 'https://x.com/southwooddc',
  linkedin: 'https://linkedin.com/company/southwood-dialysis',
  disclaimer: 'Patient data is handled under the Data Privacy Act of 2012 (RA 10173).',
  consentVersion: '1',
}

interface SiteContent {
  pages?: unknown[]
  sections?: unknown[]
  services?: unknown[]
  news?: unknown[]
  testimonials?: unknown[]
  inquiries?: unknown[]
  settings?: unknown
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!isSheetsConfigured()) {
    return {
      pages: [],
      sections: [],
      services: [],
      news: [],
      testimonials: [],
      inquiries: [],
      settings: defaultSettings,
    }
  }
  try {
    const data = await callSheets('site.content')
    return (data as SiteContent) || {
      pages: [],
      sections: [],
      services: [],
      news: [],
      testimonials: [],
      inquiries: [],
      settings: defaultSettings,
    }
  } catch {
    return {
      pages: [],
      sections: [],
      services: [],
      news: [],
      testimonials: [],
      inquiries: [],
      settings: defaultSettings,
    }
  }
}

export async function getSettings(): Promise<Settings> {
  if (!isSheetsConfigured()) return defaultSettings
  try {
    const data = await callSheets('settings.get')
    return (data as Settings) || defaultSettings
  } catch {
    return defaultSettings
  }
}

export async function saveSettingsAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  if (!isSheetsConfigured()) {
    return { ok: false, error: 'Backend not configured' }
  }
  const payload: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      payload[key] = value
    }
  }
  try {
    await callSheets('settings.update', payload)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save settings' }
  }
}
