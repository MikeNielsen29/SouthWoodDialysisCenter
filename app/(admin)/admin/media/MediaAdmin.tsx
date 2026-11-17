'use client'

import { useState } from 'react'
import { deleteMediaAction, updateMediaAltAction, uploadMediaAction } from './actions'
import { Field, Input, Notice, Submit } from '@/components/admin/ui'

export type MediaRow = {
  id: string
  vault_file_id: string
  name?: string
  alt?: string
  mime?: string
  size_bytes?: string
  uploaded_by?: string
  created_at?: string
}

function sizeLabel(bytes?: string) {
  const value = Number(bytes || 0)
  if (!value) return ''
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaAdmin({
  media,
  flash,
}: {
  media: MediaRow[]
  flash?: { tone: 'ok' | 'error'; message: string }
}) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copyPath(row: MediaRow) {
    const path = `/api/media/${row.vault_file_id}`
    try {
      await navigator.clipboard.writeText(path)
      setCopied(row.id)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      window.prompt('Copy this path', path)
    }
  }

  return (
    <div className="space-y-6">
      {flash ? <Notice variant={flash.tone === 'ok' ? 'info' : 'warning'}>{flash.message}</Notice> : null}

      <section className="rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-display text-base text-ink">Upload an image</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Images are stored in the Media Vault and served through this site. Nothing is kept in
          the repository. PNG, JPEG or WebP up to 8 MB.
        </p>

        <form action={uploadMediaAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Image file">
            <Input name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
          </Field>
          <Field label="Alt text (for accessibility)">
            <Input name="alt" placeholder="Dialysis station at Southwoods Bicutan" />
          </Field>
          <div className="sm:col-span-2">
            <Submit type="submit">Upload image</Submit>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-ink/10 bg-white">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
          <h2 className="font-display text-base text-ink">Library</h2>
          <span className="text-xs text-ink-muted">{media.length} images</span>
        </div>

        {media.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-muted">
            No images yet. Upload one above and use its path in the content editor.
          </p>
        ) : (
          <ul className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((row) => {
              const path = `/api/media/${row.vault_file_id}`
              return (
                <li key={row.id} className="overflow-hidden rounded-lg border border-ink/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={path}
                    alt={row.alt || row.name || 'Site image'}
                    className="h-40 w-full bg-sand-100 object-cover"
                    loading="lazy"
                  />
                  <div className="space-y-2 p-3">
                    <p className="truncate text-sm font-medium text-ink">{row.name || 'image'}</p>
                    <p className="text-[11px] text-ink-muted">{sizeLabel(row.size_bytes)}</p>
                    <form action={updateMediaAltAction} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={row.id} />
                      <input
                        name="alt"
                        defaultValue={row.alt || ''}
                        placeholder="Alt text"
                        className="min-w-0 flex-1 rounded-md border border-ink/15 px-2 py-1 text-[11px] text-ink"
                      />
                      <button
                        type="submit"
                        className="shrink-0 rounded-md border border-ink/15 px-2 py-1 text-[11px] text-ink-soft transition hover:border-brand-400 hover:text-brand-700"
                      >
                        Save
                      </button>
                    </form>
                    <code className="block truncate rounded bg-sand-50 px-2 py-1 text-[11px] text-ink-soft">
                      {path}
                    </code>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyPath(row)}
                        className="rounded-md border border-ink/15 px-2 py-1 text-xs text-ink-soft transition hover:border-brand-400 hover:text-brand-700"
                      >
                        {copied === row.id ? 'Copied' : 'Copy path'}
                      </button>
                      <form action={deleteMediaAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          onClick={(event) => {
                            if (!window.confirm('Remove this image from the library?')) {
                              event.preventDefault()
                            }
                          }}
                          className="rounded-md border border-ember-200 px-2 py-1 text-xs text-ember-700 transition hover:bg-ember-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
