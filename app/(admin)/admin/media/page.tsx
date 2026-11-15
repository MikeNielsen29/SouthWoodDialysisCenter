import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { Notice } from '@/components/admin/ui'
import { MediaAdmin, type MediaRow } from './MediaAdmin'

export const metadata: Metadata = {
  title: 'Media library',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

async function loadMedia(): Promise<{ media: MediaRow[]; error?: string }> {
  if (!isSheetsConfigured()) {
    return { media: [], error: 'The database is not connected yet.' }
  }

  try {
    const rows = await callSheets<unknown>('media.list', {})
    if (!Array.isArray(rows)) return { media: [] }

    const media: MediaRow[] = rows
      .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
      .map((row) => ({
        id: String(row.id ?? ''),
        vault_file_id: String(row.vault_file_id ?? ''),
        name: String(row.name ?? ''),
        alt: String(row.alt ?? ''),
        mime: String(row.mime ?? ''),
        size_bytes: String(row.size_bytes ?? ''),
        uploaded_by: String(row.uploaded_by ?? ''),
        created_at: String(row.created_at ?? ''),
      }))
      .filter((row) => row.id && row.vault_file_id)

    return { media }
  } catch {
    return {
      media: [],
      error:
        'Could not read the Media table. Re-deploy the CloudBase service so the media actions exist, then reload.',
    }
  }
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams: { uploaded?: string; deleted?: string; error?: string }
}) {
  await requireRoleOrRedirect(['Super Admin', 'Admin'], '/admin')

  const { media, error } = await loadMedia()

  const flash = searchParams.error
    ? { tone: 'error' as const, message: searchParams.error }
    : searchParams.uploaded
      ? { tone: 'ok' as const, message: 'Image uploaded. Copy its path into a section field.' }
      : searchParams.deleted
        ? { tone: 'ok' as const, message: 'Image removed from the library.' }
        : undefined

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-xl text-ink">Media library</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Photos for the public site live in the Media Vault. Upload here, then paste the
          <code className="mx-1 rounded bg-sand-100 px-1">/api/media/…</code> path into a section&apos;s
          image field.
        </p>
      </div>

      {error ? (
        <div className="mb-5">
          <Notice variant="warning">{error}</Notice>
        </div>
      ) : null}

      <MediaAdmin media={media} flash={flash} />
    </div>
  )
}
