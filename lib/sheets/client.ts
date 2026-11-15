import { z } from 'zod'
import { canonicalJson } from './canonical'

/**
 * Signed client for the Google Apps Script backend (google-apps-script/Code.gs).
 *
 * SERVER ONLY. Importing this module pulls in Web Crypto API, and the shared
 * secret must never reach the browser.
 *
 * The script always answers HTTP 200, so success is decided by the `ok` field
 * in the JSON body, never by `res.ok`.
 */

const REQUEST_TIMEOUT_MS = 8_000
const MAX_ATTEMPTS = 3

/** Error codes where retrying the same call can legitimately succeed. */
const RETRYABLE_CODES = new Set(['BUSY', 'INTERNAL', 'NETWORK', 'BAD_RESPONSE'])

export class SheetsError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'SheetsError'
    this.code = code
  }
}

export class SheetsConfigError extends Error {
  constructor(message = 'Sheets backend is not configured') {
    super(message)
    this.name = 'SheetsConfigError'
  }
}

/** Shape returned by `health_()` in Code.gs. */
const HealthSchema = z.object({
  schemaVersion: z.union([z.string(), z.number(), z.null()]).optional().nullable(),
  installedAt: z.string().nullable().optional(),
  lastSetupAt: z.string().nullable().optional(),
  lastBackupAt: z.string().nullable().optional(),
  spreadsheet: z.string().optional(),
  timeZone: z.string().optional(),
  tabs: z.record(z.union([z.number(), z.null()])).optional(),
  missingTabs: z.array(z.string()).optional(),
  configured: z.record(z.boolean()).optional(),
})

export type Health = z.infer<typeof HealthSchema>

function getConfig(): { url: string; secret: string } {
  const url = process.env.GS_WEBAPP_URL?.trim()
  const secret = process.env.GS_SHARED_SECRET?.trim()

  if (!url || !secret) {
    throw new SheetsConfigError(
      'Missing GS_WEBAPP_URL or GS_SHARED_SECRET. Add them in Settings → Environment.'
    )
  }

  return { url, secret }
}

/** Cheap check used by pages to decide whether live data is available at all. */
export function isSheetsConfigured(): boolean {
  return Boolean(process.env.GS_WEBAPP_URL?.trim() && process.env.GS_SHARED_SECRET?.trim())
}

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sign(secret: string, ts: string, action: string, payload: unknown): Promise<string> {
  const input = `${ts}\n${action}\n${canonicalJson(payload)}`
  return hmacSha256Hex(secret, input)
}

const SuccessEnvelopeSchema = z.object({
  ok: z.literal(true),
  data: z.unknown(),
})

const ErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }),
})

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function post(
  url: string,
  secret: string,
  action: string,
  payload: Record<string, unknown>
): Promise<unknown> {
  const ts = Math.floor(Date.now() / 1000).toString()
  const body = JSON.stringify({
    action,
    payload,
    auth: { key: secret, ts, nonce: crypto.randomUUID(), sig: await sign(secret, ts, action, payload) },
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    })

    if (response.status >= 500) {
      throw new SheetsError('NETWORK', `Backend responded with ${response.status}`)
    }

    const raw = await response.text()

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Apps Script returns an HTML error page when the deployment is broken.
      throw new SheetsError('BAD_RESPONSE', 'Backend did not return JSON')
    }

    const failure = ErrorEnvelopeSchema.safeParse(parsed)
    if (failure.success) {
      throw new SheetsError(failure.data.error.code, failure.data.error.message)
    }

    const success = SuccessEnvelopeSchema.safeParse(parsed)
    if (!success.success) {
      throw new SheetsError('BAD_RESPONSE', 'Unexpected response shape')
    }

    return success.data.data
  } catch (error) {
    if (error instanceof SheetsError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new SheetsError('NETWORK', 'Backend timed out')
    }
    throw new SheetsError('NETWORK', 'Could not reach the backend')
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Calls an Apps Script action and optionally validates the payload.
 * Retries transient failures with a short backoff; never retries auth errors.
 */
export async function callSheets<T>(
  action: string,
  payload: Record<string, unknown> = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const { url, secret } = getConfig()

  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const data = await post(url, secret, action, payload)

      if (!schema) return data as T

      const parsed = schema.safeParse(data)
      if (!parsed.success) {
        // Details stay server-side: they can contain row contents.
        console.error(`[sheets] invalid response for ${action}`)
        throw new SheetsError('INVALID_DATA', 'Backend returned unexpected data')
      }
      return parsed.data
    } catch (error) {
      lastError = error

      const code = error instanceof SheetsError ? error.code : 'NETWORK'
      const isRetryable = RETRYABLE_CODES.has(code) || code === 'EXPIRED'

      if (!isRetryable || attempt === MAX_ATTEMPTS) break

      await sleep(250 * attempt)
    }
  }

  if (lastError instanceof SheetsError) throw lastError
  throw new SheetsError('NETWORK', 'Could not reach the backend')
}

/**
 * Read helper for admin/portal screens: returns `null` while the backend is
 * not configured so pages can fall back to their local defaults.
 */
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

/** Diagnostics for the admin dashboard: schema version, tab counts, backup age. */
export function getSystemHealth(): Promise<Health> {
  return callSheets('system.health', {}, HealthSchema)
}

export { isSheetsConfigured as isConfigured }
