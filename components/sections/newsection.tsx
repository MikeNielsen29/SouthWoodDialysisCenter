import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const defaultNews = [
  {
    date: '15 Jan 2024',
    category: 'Facilities',
    title: 'New water treatment system installed',
    description:
      'Our dialysis bays now run on a newer purification system that meets the latest standards for water quality.',
    accent: 'from-brand-800 to-brand-950',
  },
  {
    date: '8 Jan 2024',
    category: 'Events',
    title: 'Wellness workshop: nutrition & kidney health',
    description:
      'A free session with our renal dietitian covering sodium, potassium, and fluid balance — plus practical meal ideas.',
    accent: 'from-ember-500 to-ember-700',
  },
  {
    date: '20 Dec 2023',
    category: 'Team',
    title: 'Continuous training & certification update',
    description:
      'All technicians completed refresher certification on cannulation technique and infection control this quarter.',
    accent: 'from-sand-300 to-sand-200',
  },
]

const accents = ['from-brand-800 to-brand-950', 'from-ember-500 to-ember-700', 'from-sand-300 to-sand-200']

function formatDate(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function NewsSection({
  articles,
  content,
}: {
  articles?: { title: string; excerpt: string; published_at: string }[]
  content?: { eyebrow?: string; heading?: string; body?: string }
}) {
  const news =
    articles && articles.length > 0
      ? articles.slice(0, 3).map((article, index) => ({
          date: formatDate(article.published_at),
          category: 'Update',
          title: article.title,
          description: article.excerpt,
          accent: accents[index % accents.length],
        }))
      : defaultNews

  return (
    <section className="bg-sand-100/70 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <span className="eyebrow">{content?.eyebrow || 'Latest news'}</span>
            <h2 className="display mt-5 text-[32px] leading-[1.1] sm:text-[42px]">
              {content?.heading || 'News & updates.'}
            </h2>
            {content?.body ? <p className="lead mt-4">{content.body}</p> : null}
          </Reveal>

          <Reveal delay={80}>
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-900"
            >
              View all articles
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {news.map((item, index) => {
            const muted = index === 2
            return (
              <Reveal key={`${item.title}-${index}`} delay={index * 70}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-sand-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div
                    className={`relative h-36 bg-gradient-to-br ${item.accent} p-5`}
                  >
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        muted
                          ? 'bg-brand-900/10 text-brand-900'
                          : 'bg-sand-50/15 text-sand-50'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span
                      aria-hidden
                      className={`absolute -bottom-6 right-3 font-display text-[76px] leading-none ${
                        muted ? 'text-brand-900/10' : 'text-sand-50/15'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <time className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                      {item.date}
                    </time>
                    <h3 className="mt-2 font-display text-[20px] leading-snug text-ink transition-colors group-hover:text-brand-700">
                      {item.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                      {item.description}
                    </p>
                    <Link
                      href="/news"
                      className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-700"
                    >
                      Read article
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
