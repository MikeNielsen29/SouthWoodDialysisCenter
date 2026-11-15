import { ContentEditor, type SavedSections } from '@/components/admin/content-editor'
import { Notice } from '@/components/admin/ui'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import type { SectionFields } from '@/lib/site-sections'

export const dynamic = 'force-dynamic'

function str(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

async function loadSections(): Promise<{ saved: SavedSections; error?: string }> {
  if (!isSheetsConfigured()) {
    return {
      saved: {},
      error:
        'The database is not connected yet. Finish the CloudBase setup, then reload.',
    }
  }

  try {
    const rows = await callSheets<unknown>('content.listSections', {})
    if (!Array.isArray(rows)) return { saved: {} }

    const saved: SavedSections = {}
    for (const raw of rows) {
      if (!raw || typeof raw !== 'object') continue
      const row = raw as Record<string, unknown>
      const pageSlug = str(row.page_slug)
      const sectionKey = str(row.section_key)
      if (!pageSlug || !sectionKey) continue

      saved[`${pageSlug}:${sectionKey}`] = {
        eyebrow: str(row.eyebrow),
        heading: str(row.heading),
        emphasis: str(row.emphasis),
        body: str(row.body),
        image_url: str(row.image_url),
        image_alt: str(row.image_alt),
        cta_label: str(row.cta_label),
        cta_href: str(row.cta_href),
        sort_order: str(row.sort_order) || '0',
        status: str(row.status) === 'draft' ? 'draft' : 'published',
      } satisfies SectionFields
    }

    return { saved }
  } catch {
    return {
      saved: {},
      error:
        'Could not read the content table. Check that the CloudBase service is live and the access key matches.',
    }
  }
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: { page?: string; section?: string; saved?: string; error?: string }
}) {
  const { saved, error } = await loadSections()

  const flash = searchParams.error
    ? { tone: 'error' as const, message: searchParams.error }
    : searchParams.saved
      ? {
          tone: 'ok' as const,
          message: 'Section saved. Published pages now use this copy.',
        }
      : undefined

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-xl text-ink">Content editor</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Edit the copy of each public page. Save a section as published and the live page switches
          to your words; keep it as a draft and the shipped copy stays in place.
        </p>
      </div>

      {error ? (
        <div className="mb-5">
          <Notice variant="warning">{error}</Notice>
        </div>
      ) : null}

      <ContentEditor
        saved={saved}
        initialPage={searchParams.page}
        initialSection={searchParams.section}
        flash={flash}
      />
    </div>
  )
}
