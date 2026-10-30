'use client'

import { useState } from 'react'
import { saveSettingsAction } from '@/lib/content'

interface Settings {
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

export function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    try {
      const result: { ok?: boolean; error?: string } = await saveSettingsAction()
      if (result?.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(result?.error || 'Could not save settings.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {saved ? (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
          Settings saved.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-ember-200 bg-ember-50 p-4 text-sm text-ember-800">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Hotline</label>
          <input
            name="hotline"
            defaultValue={values.hotline}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="+1 (555) 014-2800"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={values.email}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="care@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink mb-1">Address</label>
        <textarea
          name="address"
          defaultValue={values.address}
          rows={2}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder="123 Kidney Avenue&#10;Southwood District"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink mb-1">Hours</label>
        <textarea
          name="hours"
          defaultValue={values.hours}
          rows={2}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder="Mon–Sat, 6:00 AM – 8:00 PM&#10;Sunday: on-call only"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Facebook</label>
          <input
            name="facebook"
            defaultValue={values.facebook}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="https://facebook.com/southwooddialysis"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Instagram</label>
          <input
            name="instagram"
            defaultValue={values.instagram}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="https://instagram.com/southwooddialysis"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-ink mb-1">X (Twitter)</label>
          <input
            name="x"
            defaultValue={values.x}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="https://x.com/southwooddc"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink mb-1">LinkedIn</label>
          <input
            name="linkedin"
            defaultValue={values.linkedin}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="https://linkedin.com/company/southwood-dialysis"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink mb-1">Disclaimer</label>
        <textarea
          name="disclaimer"
          defaultValue={values.disclaimer}
          rows={4}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <p className="mt-1 text-[11px] text-ink-muted">
          Shown in the footer and portal privacy notice.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink mb-1">Consent version</label>
        <input
          name="consent_version"
          defaultValue={values.consentVersion}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder="1"
        />
        <p className="mt-1 text-[11px] text-ink-muted">
          Bump this when the privacy notice is revised so returning users can re-consent.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  )
}
