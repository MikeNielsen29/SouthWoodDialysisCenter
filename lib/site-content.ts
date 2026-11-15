import { callSheets, isSheetsConfigured } from './sheets/client'
import { findPage, type SectionFields } from './site-sections'

function str(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

/**
 * Published sections for one page, keyed by section_key.
 *
 * Returns `{}` when the backend is not configured, unreachable, or has no rows
 * for the page — callers then keep rendering the shipped copy from
 * `lib/site-sections.ts`. Rows saved as `draft` are ignored on purpose.
 */
export async function getPublishedSections(
  slug: string
): Promise<Record<string, SectionFields>> {
  const def = findPage(slug)
  if (!def || !isSheetsConfigured()) return {}

  try {
    const rows = await callSheets<unknown>('content.listSections', { page_slug: slug })
    if (!Array.isArray(rows)) return {}

    const out: Record<string, SectionFields> = {}
    for (const raw of rows) {
      if (!raw || typeof raw !== 'object') continue
      const row = raw as Record<string, unknown>
      const key = str(row.section_key)
      if (!key) continue
      if (str(row.status || 'published') !== 'published') continue
      if (!def.sections.some((section) => section.key === key)) continue

      out[key] = {
        eyebrow: str(row.eyebrow),
        heading: str(row.heading),
        emphasis: str(row.emphasis),
        body: str(row.body),
        image_url: str(row.image_url),
        image_alt: str(row.image_alt),
        cta_label: str(row.cta_label),
        cta_href: str(row.cta_href),
        sort_order: str(row.sort_order) || '0',
        status: 'published',
      }
    }
    return out
  } catch {
    return {}
  }
}

/** Merge saved values over the shipped defaults for one section. */
export function sectionOrDefaults(
  slug: string,
  sectionKey: string,
  saved: Record<string, SectionFields>
): SectionFields | undefined {
  const def = findPage(slug)?.sections.find((section) => section.key === sectionKey)
  if (!def) return undefined
  return { ...def.defaults, ...(saved[sectionKey] || {}) }
}
