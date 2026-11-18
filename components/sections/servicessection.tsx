import Link from 'next/link'
import {
  Ambulance,
  ArrowRight,
  Droplets,
  GraduationCap,
  HeartHandshake,
  Salad,
  ShieldPlus,
} from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const defaultServices = [
  {
    icon: Droplets,
    title: 'Hemodialysis',
    description:
      'Advanced dialysis machines and purified water systems, run by certified technicians in a calm treatment bay.',
  },
  {
    icon: HeartHandshake,
    title: 'Peritoneal Dialysis',
    description:
      'A flexible at-home programme with hands-on training, so treatment fits around your daily routine.',
  },
  {
    icon: ShieldPlus,
    title: 'Preventive Care',
    description:
      'Kidney function screening and early intervention for patients managing diabetes and hypertension.',
  },
  {
    icon: Salad,
    title: 'Renal Nutrition',
    description:
      'Personalised meal plans from registered dietitians specialising in renal nutrition and fluid balance.',
  },
  {
    icon: GraduationCap,
    title: 'Patient Education',
    description:
      'Workshops for patients and families on dialysis, medication, and living well with kidney disease.',
  },
  {
    icon: Ambulance,
    title: 'Urgent Support',
    description:
      'Same-day assessment and an on-call clinical line for unexpected symptoms between sessions.',
  },
]

const iconMap: Record<string, typeof Droplets> = {
  droplets: Droplets,
  kidney: Droplets,
  heart: HeartHandshake,
  hearthandshake: HeartHandshake,
  shield: ShieldPlus,
  shieldplus: ShieldPlus,
  salad: Salad,
  nutrition: Salad,
  education: GraduationCap,
  graduationcap: GraduationCap,
  ambulance: Ambulance,
  urgent: Ambulance,
}

function iconFor(name: string) {
  return iconMap[name.toLowerCase().replace(/[^a-z]/g, '')] ?? Droplets
}

function anchorFor(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ServicesSection({
  items,
  content,
  basePath = '/services',
}: {
  items?: { title: string; summary: string; icon: string }[]
  content?: { eyebrow?: string; heading?: string; emphasis?: string; body?: string }
  basePath?: string
}) {
  const services =
    items && items.length > 0
      ? items.map((item) => ({
          icon: iconFor(item.icon),
          title: item.title,
          description: item.summary,
        }))
      : defaultServices

  return (
    <section className="relative py-20 sm:py-24 lg:py-28">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-xl">
            <span className="eyebrow">{content?.eyebrow || 'What we offer'}</span>
            <h2 className="display mt-5 text-[32px] leading-[1.1] sm:text-[42px]">
              {content?.heading || 'Complete kidney care,'}
              <span className="italic text-brand-700">
                {' '}
                {content?.emphasis || 'under one roof.'}
              </span>
            </h2>
          </Reveal>

          <Reveal delay={80} className="md:pb-2">
            <p className="lead max-w-sm">
              {content?.body ||
                'Six core programmes, one care team — designed around how treatment actually fits into your week.'}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon
            const anchor = anchorFor(service.title)
            return (
              <Reveal key={service.title} delay={index * 60}>
                <Link
                  id={anchor}
                  href={`${basePath}#${anchor}`}
                  className="group relative flex h-full scroll-mt-28 flex-col rounded-2xl border border-ink/10 bg-white/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:bg-white hover:shadow-lift target:border-brand-400 target:ring-2 target:ring-brand-400/40"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-sand-50">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="font-display text-sm text-ink/25">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-[21px] leading-snug text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                    {service.description}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
