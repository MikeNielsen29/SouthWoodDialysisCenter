import type { Metadata } from 'next'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { FilesListWithFiles } from '../shared'
import { fetchMyFilesAction } from '../actions'

export const metadata: Metadata = {
  title: 'My files',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function FilesPage() {
  await requireUserOrRedirect('/portal/files')
  const files = await fetchMyFilesAction()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink">My files</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Lab results and documents shared with you by the clinic.
        </p>
      </div>

      <div className="rounded-xl border border-ink/10 bg-white p-5">
        <FilesListWithFiles files={files} />
      </div>
    </div>
  )
}
