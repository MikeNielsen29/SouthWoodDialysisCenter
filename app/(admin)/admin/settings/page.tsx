import type { Metadata } from 'next'
import { Notice, Submit } from '@/components/admin/ui'
import { runBackupAction } from './actions'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { getSettings, saveSettingsAction, type Settings } from '@/lib/content'
import { SettingsForm } from './SettingsForm'

export const metadata: Metadata = {
  title: 'Site settings',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { backup?: string }
}) {
  await requireRoleOrRedirect(['Super Admin', 'Admin'], '/admin')
  const settings = await getSettings()

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="font-display text-xl text-ink">Site settings</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Edit the contact details, hours, social links and disclaimer shown on the public site.
          </p>
        </div>

        {searchParams.backup === 'ok' ? (
          <Notice variant="info">Backup saved to the clinic backup vault.</Notice>
        ) : null}
        {searchParams.backup === 'error' ? (
          <Notice variant="warning">Backup failed. Check the CloudBase service logs.</Notice>
        ) : null}

        <div className="rounded-xl border border-ink/10 bg-white p-5">
          <SettingsForm initial={settings as Settings} />
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-5">
          <p className="font-medium text-ink">Backup</p>
          <p className="mt-1 text-sm text-ink-muted">
            Copies every table into the backup vault so a bad edit can always be undone.
          </p>
          <form action={runBackupAction} className="mt-3">
            <Submit type="submit">Run backup now</Submit>
          </form>
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-5 text-sm text-ink-muted">
          <p className="font-medium text-ink mb-2">Tips</p>
          <ul className="space-y-2">
            <li>Changes are saved to CloudBase and shown on the public site immediately.</li>
            <li>The disclaimer and consent version appear in the patient portal privacy notice.</li>
            <li>Social links can be left blank if the clinic does not use that platform.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
