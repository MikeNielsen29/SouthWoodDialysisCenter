import { callSheets, isSheetsConfigured } from '../sheets/client'

export async function load(
  action: string,
  _schema?: unknown,
  options?: { limit?: number }
): Promise<unknown> {
  if (!isSheetsConfigured()) return null
  const payload: Record<string, unknown> = {}
  if (options?.limit) payload.limit = options.limit
  return await callSheets(action, payload)
}

export { load as default }
