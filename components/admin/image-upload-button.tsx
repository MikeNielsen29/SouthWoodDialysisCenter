'use client'

import { useRef, useState, useTransition } from 'react'
import { ImagePlus } from 'lucide-react'
import { uploadSiteImageAction } from '@/app/(admin)/admin/media/actions'

export function ImageUploadButton({
  onUploaded,
  label = 'Upload image',
}: {
  onUploaded: (path: string) => void
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const data = new FormData()
    data.set('image', file)

    startTransition(async () => {
      const result = await uploadSiteImageAction(data)
      if (result.ok) {
        setError('')
        onUploaded(result.path)
      } else {
        setError(result.error)
      }
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs font-medium text-ink-soft transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
      >
        <ImagePlus className="h-3.5 w-3.5" aria-hidden />
        {pending ? 'Uploading…' : label}
      </button>
      {error ? <p className="mt-1 text-[11px] text-ember-700">{error}</p> : null}
    </div>
  )
}
