import { Quote, Star } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const defaultTestimonials = [
  {
    quote:
      'Since starting hemodialysis at Southwood my energy has come back. The team explains everything, and the bay is always spotless.',
    name: 'Maria S.',
    detail: 'Patient since 2024',
    initials: 'MS',
    tone: 'bg-brand-700',
  },
  {
    quote:
      'The home peritoneal programme gave me my mornings back. I train, I work, and I still see my family in the evening.',
    name: 'James W.',
    detail: 'Patient since 2023',
    initials: 'JW',
    tone: 'bg-ember-500',
  },
  {
    quote:
      'What stayed with me is how unhurried they are. Nobody rushes you out, and the same nurses greet you by name.',
    name: 'Robert K.',
    detail: 'Patient since 2024',
    initials: 'RK',
    tone: 'bg-brand-500',
  },
]

const tones = ['bg-brand-700', 'bg-ember-500', 'bg-brand-500']

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'P'
  )
}

function yearOf(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear())
}

export function TestimonialsSection({
  items,
  content,
}: {
  items?: { display_name: string; rating: string; body: string; created_at: string }[]
  content?: { eyebrow?: string; heading?: string; body?: string }
}) {
  const testimonials =
    items && items.length > 0
      ? items.slice(0, 3).map((item, index) => ({
          quote: item.body,
          name: item.display_name || 'Patient',
          detail: yearOf(item.created_at)
            ? `Patient since ${yearOf(item.created_at)}`
            : 'Verified patient',
          initials: initialsOf(item.display_name || 'Patient'),
          tone: tones[index % tones.length],
        }))
      : defaultTestimonials

  return (
    <section className="py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">{content?.eyebrow || 'Patient stories'}</span>
          <h2 className="display mt-5 text-[32px] leading-[1.1] sm:text-[42px]">
            {content?.heading || 'In their own words.'}
          </h2>
          <p className="lead mt-4">
            {content?.body || 'Real feedback from people who sit in our chairs every week.'}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={`${item.name}-${index}`} delay={index * 70}>
              <figure className="relative flex h-full flex-col rounded-2xl border border-ink/10 bg-white/80 p-7 transition-shadow duration-300 hover:shadow-lift">
                <Quote
                  className="h-7 w-7 text-ember-200"
                  aria-hidden
                  strokeWidth={2.5}
                />

                <blockquote className="mt-4 flex-1 font-display text-[19px] leading-[1.45] text-ink">
                  “{item.quote}”
                </blockquote>

                <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-5">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white ${item.tone}`}
                    aria-hidden
                  >
                    {item.initials}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-ink-muted">{item.detail}</p>
                  </div>
                  <span className="flex gap-0.5 text-ember-500" aria-label="5 out of 5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" aria-hidden />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
