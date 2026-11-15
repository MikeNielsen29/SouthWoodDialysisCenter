import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { Header, Footer, FilesListWithFiles, Notice } from '../shared'
import { fetchMyFilesAction } from '../actions'

export const metadata: Metadata = { title: 'My files' }

export const dynamic = 'force-dynamic'

export default async function FilesPage() {
  await requireUserOrRedirect('/portal')
  const result = await fetchMyFilesAction()

  const files = Array.isArray(result) ? result : []
  const error = ''

  return (
    <div className="min-h-screen bg-sand-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-ink">My files</h1>
          <p className="mt-1 text-sm text-ink-muted">Lab results and documents shared with you by the clinic.</p>
        </div>

        {error ? <Notice variant="warning">{error}</Notice> : null}

        <FilesListWithFiles files={files} />
      </main>
      <Footer />
    </div>
  )
}
