import { Card, Field, Input, Labeled, Notice, Submit, Textarea } from '@/components/admin/ui'
import { getSettings, saveSettingsAction } from '@/lib/content'

export const dynamic = 'force-dynamic'

export default async function AdminSettings() {
  const settings = await getSettings()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-xl text-ink mb-2">Settings</h1>
      <p className="text-sm text-ink-muted mb-6">Edit clinic contact details, hours, social links, and disclaimer.</p>

      <Card>
        <form action={saveSettingsAction} className="space-y-5">
          <Field label="Hotline">
            <Input name="hotline" defaultValue={settings.hotline} placeholder="+1 (555) 014-2800" />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={settings.email} placeholder="care@example.com" />
          </Field>
          <Field label="Address">
            <Textarea name="address" rows={2} defaultValue={settings.address} placeholder="123 Kidney Avenue&#10;Southwood District" />
          </Field>
          <Field label="Hours">
            <Textarea name="hours" rows={2} defaultValue={settings.hours} placeholder="Mon-Sat, 6:00 AM - 8:00 PM&#10;Sunday: on-call only" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Facebook">
              <Input name="facebook" defaultValue={settings.facebook} placeholder="https://facebook.com/southwooddialysis" />
            </Field>
            <Field label="Instagram">
              <Input name="instagram" defaultValue={settings.instagram} placeholder="https://instagram.com/southwooddialysis" />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="X (Twitter)">
              <Input name="x" defaultValue={settings.x} placeholder="https://x.com/southwooddc" />
            </Field>
            <Field label="LinkedIn">
              <Input name="linkedin" defaultValue={settings.linkedin} placeholder="https://linkedin.com/company/southwood-dialysis" />
            </Field>
          </div>
          <Field label="Disclaimer">
            <Textarea name="disclaimer" rows={4} defaultValue={settings.disclaimer} />
            <p className="text-[11px] text-ink-muted">Shown in the footer and portal privacy notice.</p>
          </Field>
          <Field label="Consent version">
            <Input name="consent_version" defaultValue={settings.consentVersion} placeholder="1" />
            <p className="text-[11px] text-ink-muted">Bump this when the privacy notice is revised so returning users can re-consent.</p>
          </Field>
          <div className="flex justify-end">
            <Submit>Save settings</Submit>
          </div>
        </form>
      </Card>

      <div className="mt-5 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
        Changes are saved to the spreadsheet and shown on the public site immediately.
      </div>
    </div>
  )
}
