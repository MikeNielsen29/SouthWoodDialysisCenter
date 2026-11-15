/**
 * Section lists are stored in the existing `body` field, one entry per line:
 *   Title | Copy
 * A line without a pipe is a plain item (used for the commitment list).
 */
export interface SectionListItem {
  title: string
  copy: string
}

export function parseSectionList(body?: string): SectionListItem[] {
  return (body || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split('|')
      return {
        title: (title || '').trim(),
        copy: rest.join('|').trim(),
      }
    })
    .filter((item) => item.title)
}
