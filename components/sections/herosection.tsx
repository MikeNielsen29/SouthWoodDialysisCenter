import Link from 'next/link'
import { ArrowRight, Droplets, HeartPulse, ShieldCheck, Star } from 'lucide-react'
import { buttonClasses } from '@/components/ui/button-styles'
import { Reveal } from '@/components/ui/reveal'
import { parseSectionList } from '@/lib/section-list'

const defaultStats = [
  { value: '2024', label: 'Established' },
  { value: '5,000+', label: 'Patients treated' },
  { value: '3', label: 'Dialysis stations' },
  { value: '24/7', label: 'Support line' },
]

function parseKeyed(body?: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of (body || '').split(/\n+/)) {
    const at = line.indexOf('=')
    if (at <= 0) continue
    out[line.slice(0, at).trim().toLowerCase()] = line.slice(at + 1).trim()
  }
  return out
}

function CarePanel({
  rating = 0,
  extra = {},
  overlay = false,
}: {
  rating?: number
  extra?: Record<string, string>
  overlay?: boolean
}) {
  const stars = Math.round(Math.min(5, Math.max(0, rating)))
  const satisfaction = rating > 0 ? Math.round((rating / 5) * 100) : 98

  return (
    <div
      className={
        overlay
          ? 'relative isolate flex h-full flex-col justify-between overflow-y-auto p-8 sm:p-10'
          : 'relative isolate overflow-hidden rounded-4xl bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-8 shadow-lift sm:p-10'
      }
    >
      {/* Concentric rings */}
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -right-24 -top-28 h-[360px] w-[360px] text-sand-50/10"
      >
        {[40, 80, 120, 160, 200].map((r) => (
          <circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-sand-50/15 bg-sand-50/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-sand-100/80">
          <ShieldCheck className="h-3.5 w-3.5 text-ember-400" aria-hidden />
          {extra.badge || 'Accredited care'}
        </span>
        <span
          className="flex items-center gap-1 text-ember-400"
          aria-label={`Rated ${stars || 5} out of 5`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < (stars || 5) ? 'fill-current' : 'opacity-30'}`}
              aria-hidden
            />
          ))}
        </span>
      </div>

      <div className="relative mt-10 flex items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sand-50/10 ring-1 ring-inset ring-sand-50/15">
          <HeartPulse className="h-8 w-8 text-ember-400" aria-hidden />
        </div>
        <div>
          <p className="font-display text-[22px] leading-snug text-sand-50">
            {extra.panel_title || 'Every session, monitored closely.'}
          </p>
          <p className="mt-1 text-sm text-sand-100/60">
            {extra.panel_body || 'Advanced water treatment & certified technicians'}
          </p>
        </div>
      </div>

      <div className="relative mt-10 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-sand-50/10 bg-sand-50/[0.06] p-4 backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-sand-100/50">
            Satisfaction
          </p>
          <p className="mt-1 font-display text-2xl text-sand-50">{satisfaction}%</p>
          <div className="mt-3 flex items-end gap-1" aria-hidden>
            {[40, 55, 48, 70, 84, 96].map((h, i) => (
              <span
                key={i}
                className="w-2 rounded-sm bg-ember-500/70"
                style={{ height: `${h * 0.32}px` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-sand-50/10 bg-sand-50/[0.06] p-4 backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-sand-100/50">
            {extra.sessions_label || 'Sessions weekly'}
          </p>
          <p className="mt-1 font-display text-2xl text-sand-50">{extra.sessions || '120+'}</p>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-sand-100/60">
            <Droplets className="h-3.5 w-3.5 text-ember-400" aria-hidden />
            {extra.sessions_note || 'Gentle, steady care'}
          </p>
        </div>
      </div>
    </div>
  )
}

export type HeroContent = {
  eyebrow?: string
  heading?: string
  emphasis?: string
  body?: string
  image_url?: string
  image_alt?: string
  cta_label?: string
  cta_href?: string
}

export function Section({
  content,
  extraContent,
  statsContent,
  rating = 0,
}: {
  content?: HeroContent
  extraContent?: { body?: string }
  statsContent?: { body?: string }
  rating?: number
}) {
  const extra = parseKeyed(extraContent?.body)
  const savedStats = parseSectionList(statsContent?.body)
  const statItems = savedStats.length
    ? savedStats.map((item) => ({ value: item.title, label: item.copy }))
    : defaultStats
  const eyebrow = content?.eyebrow?.trim() || 'Kidney care · Since 2024'
  const heading = content?.heading?.trim() || 'Dialysis care that'
  const emphasis = content?.emphasis ?? 'feels personal.'
  const body =
    content?.body?.trim() ||
    'Compassionate, state-of-the-art dialysis treatment in a calm environment. Our nephrologists and certified technicians focus on one thing — helping you feel like yourself again.'
  const ctaLabel = content?.cta_label?.trim() || 'Book an appointment'
  const ctaHref = content?.cta_href?.trim() || '/contact'
  const imageUrl = content?.image_url?.trim() || ''
  const imageAlt = content?.image_alt?.trim() || 'Southwoods Bicutan Dialysis and Medical Center'
  return (
    <section className="relative overflow-hidden">
      {/* Soft wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,#EDE4D6_0%,transparent_55%),radial-gradient(100%_70%_at_0%_100%,#DCECE7_0%,transparent_60%)]"
      />

      <div className="shell relative pb-16 pt-14 sm:pt-20 lg:pb-20 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Reveal>
              <span className="eyebrow">{eyebrow}</span>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="display mt-6 text-balance text-[40px] leading-[1.04] sm:text-[56px] lg:text-[64px]">
                {heading}
                {emphasis ? (
                  <span className="block italic text-brand-700">{emphasis}</span>
                ) : null}
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="lead mt-6 max-w-xl">{body}</p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href={ctaHref} className={buttonClasses('primary', 'lg')}>
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/services" className={buttonClasses('outline', 'lg')}>
                  Explore services
                </Link>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2" aria-hidden>
                  {['MS', 'JW', 'RK', 'AL'].map((initials, i) => (
                    <span
                      key={initials}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-sand-50 ${
                        ['bg-brand-700 text-sand-50', 'bg-ember-500 text-white', 'bg-brand-500 text-sand-50', 'bg-sand-300 text-brand-900'][i]
                      }`}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-ink-muted">
                  {extra.social || (
                    <>
                      <span className="font-medium text-ink">5,000+ patients</span> cared for
                      across the region
                    </>
                  )}
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:pl-4">
            {imageUrl ? (
              <figure className="relative isolate aspect-[4/3] overflow-hidden rounded-4xl border border-ink/10 bg-brand-950 shadow-lift sm:aspect-[16/10] lg:aspect-[4/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/75 to-brand-950/35"
                />
                <figcaption className="absolute inset-0">
                  <CarePanel rating={rating} extra={extra} overlay />
                </figcaption>
              </figure>
            ) : (
              <CarePanel rating={rating} extra={extra} />
            )}
          </Reveal>
        </div>
      </div>

      {/* Stat strip */}
      <div className="relative border-y border-ink/10 bg-sand-50/60">
        <div className="shell grid grid-cols-2 divide-ink/10 sm:grid-cols-4 sm:divide-x">
          {statItems.map((stat) => (
            <div key={stat.label} className="px-2 py-6 first:pl-0 sm:px-6">
              <p className="font-display text-[26px] leading-none text-brand-800">
                {stat.value}
              </p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
