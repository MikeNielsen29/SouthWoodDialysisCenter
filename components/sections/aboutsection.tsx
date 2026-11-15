import Link from 'next/link'
import { ArrowRight, Check, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import { buttonClasses } from '@/components/ui/button-styles'
import { Reveal } from '@/components/ui/reveal'
import { parseSectionList } from '@/lib/section-list'

const commitments = [
  'Nephrologist-led treatment plans',
  'Certified dialysis technicians on every shift',
  'Evening and early-morning slots',
]

const values = [
  {
    icon: ShieldCheck,
    title: 'Quality',
    copy: 'Protocol-driven care and rigorous water safety checks.',
  },
  {
    icon: HeartHandshake,
    title: 'Compassion',
    copy: 'Small team, familiar faces, unhurried sessions.',
  },
  {
    icon: Sparkles,
    title: 'Clarity',
    copy: 'Plain-language explanations at every step.',
  },
]

export function AboutSection({
  content,
  valuesContent,
  promiseContent,
}: {
  content?: { eyebrow?: string; heading?: string; emphasis?: string; body?: string }
  valuesContent?: { body?: string }
  promiseContent?: { eyebrow?: string; heading?: string; emphasis?: string; body?: string }
}) {
  const valueItems = parseSectionList(valuesContent?.body)
  const commitmentItems = parseSectionList(promiseContent?.body)
  const shownValues = valueItems.length
    ? valueItems.map((item, index) => ({
        icon: values[index % values.length]?.icon ?? ShieldCheck,
        title: item.title,
        copy: item.copy,
      }))
    : values
  const shownCommitments = commitmentItems.length
    ? commitmentItems.map((item) => item.title)
    : commitments
  const paragraphs = (content?.body || '')
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <section className="relative bg-sand-100/70 py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div>
            <Reveal>
              <span className="eyebrow">{content?.eyebrow || 'About Southwood'}</span>
              <h2 className="display mt-5 text-[32px] leading-[1.1] sm:text-[42px]">
                {content?.heading || 'A neighbourhood centre with'}
                <span className="italic text-brand-700">
                  {' '}
                  {content?.emphasis || 'hospital-grade care.'}
                </span>
              </h2>
            </Reveal>

            <Reveal delay={80}>
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p key={index} className={index === 0 ? 'lead mt-6' : 'lead mt-4'}>
                    {paragraph}
                  </p>
                ))
              ) : (
                <>
                  <p className="lead mt-6">
                    Southwood Dialysis Center opened in 2024 with a simple idea: kidney
                    care should feel calm, familiar, and close to home. Three modern
                    stations, a small clinical team, and schedules built around patients
                    rather than queues.
                  </p>
                  <p className="lead mt-4">
                    From your first assessment to your weekly sessions, the same
                    nephrologists and technicians follow your progress — so nothing about
                    your care gets lost between visits.
                  </p>
                </>
              )}
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-10 grid gap-6 border-t border-ink/10 pt-8 sm:grid-cols-3">
                {shownValues.map((value) => {
                  const Icon = value.icon
                  return (
                    <div key={value.title}>
                      <Icon className="h-5 w-5 text-ember-500" aria-hidden />
                      <p className="mt-3 font-display text-[17px] text-ink">
                        {value.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                        {value.copy}
                      </p>
                    </div>
                  )
                })}
              </div>
            </Reveal>

            <Reveal delay={200}>
              <Link href="/about" className={buttonClasses('outline', 'md', 'mt-9')}>
                More about our team
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={120} className="relative">
            <div className="grain relative rounded-4xl border border-ink/10 bg-sand-50 p-8 shadow-soft sm:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                {promiseContent?.eyebrow || 'Our promise'}
              </p>
              <blockquote className="display mt-5 text-[26px] leading-[1.25] sm:text-[30px]">
                “{promiseContent?.heading || 'Care that respects your time, your privacy, and your dignity.'}”
              </blockquote>

              <div className="mt-8 space-y-3 border-t border-ink/10 pt-6">
                {shownCommitments.map((item) => (
                  <p key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
                    </span>
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="relative -mt-6 ml-6 rounded-2xl bg-brand-900 p-6 text-sand-100 shadow-lift sm:ml-10">
              <div className="grid grid-cols-3 divide-x divide-sand-50/15 text-center">
                <div>
                  <p className="font-display text-xl text-sand-50">2024</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-sand-100/60">
                    Opened
                  </p>
                </div>
                <div>
                  <p className="font-display text-xl text-sand-50">3</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-sand-100/60">
                    Stations
                  </p>
                </div>
                <div>
                  <p className="font-display text-xl text-sand-50">12</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-sand-100/60">
                    Care staff
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
