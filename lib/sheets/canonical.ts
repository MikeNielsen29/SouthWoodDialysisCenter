/**
 * Deterministic JSON serialisation, byte-for-byte identical to `canonical_()`
 * in the CloudBase service. Both sides sign the same string, so any
 * change here must be mirrored there (and vice versa).
 */
export function canonicalJson(value: unknown): string {
  if (value === null || value === undefined) return 'null'

  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJson).join(',') + ']'
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))

    return (
      '{' +
      entries
        .map(([key, entryValue]) => JSON.stringify(key) + ':' + canonicalJson(entryValue))
        .join(',') +
      '}'
    )
  }

  if (typeof value === 'number') return Number.isFinite(value) ? JSON.stringify(value) : 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'

  return JSON.stringify(String(value))
}
