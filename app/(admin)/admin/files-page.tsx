import { Empty } from '@/components/admin/ui'
import { getSettings } from '@/lib/content'

export const dynamic = 'force-dynamic'

export default async function FilesPage() {
  const settings = await getSettings()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-xl text-ink mb-2">Files</h1>
      <p className="text-sm text-ink-muted mb-6">Lab files and document upload management.</p>
      <Empty description="File management is not wired yet." />
    </div>
  )
}
