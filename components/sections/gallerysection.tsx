export type GalleryContent = {
  image_url?: string
  body?: string
}

/**
 * One image per line (commas work too). Each line is `path` or `path | alt`.
 * Only local paths or https URLs pass.
 */
function imageEntries(value?: string): { src: string; alt: string }[] {
  return (value || '')
    .split(/\n+/)
    .flatMap((line) => line.split(','))
    .map((line) => {
      const [src, ...rest] = line.split('|')
      return { src: (src || '').trim(), alt: rest.join('|').trim() }
    })
    .filter((entry) => entry.src.startsWith('/') || entry.src.startsWith('https://'))
    .slice(0, 12)
}

export function GallerySection({ content }: { content?: GalleryContent }) {
  const images = imageEntries(content?.image_url)
  if (images.length === 0) return null

  return (
    <section className="pb-16 pt-2 sm:pb-20">
      <div className="shell">
        {content?.body ? (
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-ink-muted">{content.body}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <figure
              key={`${image.src}-${index}`}
              className="overflow-hidden rounded-2xl border border-ink/10 bg-sand-100 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt || `Southwoods Bicutan Dialysis and Medical Center — photo ${index + 1}`}
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
