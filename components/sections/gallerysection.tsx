export type GalleryContent = {
  image_url?: string
  body?: string
}

/** One path per line (commas work too). Only local paths or https URLs pass. */
function imagePaths(value?: string): string[] {
  return (value || '')
    .split(/[\n,]+/)
    .map((path) => path.trim())
    .filter((path) => path.startsWith('/') || path.startsWith('https://'))
    .slice(0, 12)
}

export function GallerySection({ content }: { content?: GalleryContent }) {
  const images = imagePaths(content?.image_url)
  if (images.length === 0) return null

  return (
    <section className="pb-16 pt-2 sm:pb-20">
      <div className="shell">
        {content?.body ? (
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-ink-muted">{content.body}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((src, index) => (
            <figure
              key={`${src}-${index}`}
              className="overflow-hidden rounded-2xl border border-ink/10 bg-sand-100 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Southwood Dialysis Center — photo ${index + 1}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
