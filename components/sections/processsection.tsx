import Link from 'next/link'
import { ArrowRight, CalendarCheck, ClipboardList, Stethoscope } from 'lucide-react'
import { buttonClasses } from '@/components/ui/button-styles'
import { Reveal } from '@/components/ui/reveal'

const steps = [
  {
    icon: CalendarCheck,
    step: '01',
    title: 'Book a consultation',
    copy: 'Call us or send a request online. We confirm your slot within one working day and explain what to bring.',
  },
  {
    icon: Stethoscope,
    step: '02',
    title: 'Assessment & plan',
    copy: 'A nephrologist reviews your history, orders labs if needed, and designs a schedule that fits your week.',
  },
  {
    icon: ClipboardList,
    step: '03',
    title: 'Start treatment',
    copy: 'Meet your care team, settle into your station, and begin sessions with the same faces each visit.',
  },
]

export function ProcessSection() {
  return (
    <section className="relative overflow-hidden bg-brand-950 py-20 text-sand-100 sm:py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_85%_0%,rgba(208,124,60,0.18)_0%,transparent_60%)]"
      />

      <div className="shell relative">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <span className="eyebrow text-ember-400">How it works</span>
            <h2 className="display mt-5 text-[32px] leading-[1.1] text-sand-50 sm:text-[42px]">
              Three steps to
              <span className="italic text-ember-400"> your first session.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-sand-100/65">
              No referrals required to start the conversation. We will walk you
              through insurance, transport, and scheduling before you commit to
              anything.
            </p>

            <Link
              href="/contact"
              className={buttonClasses('light', 'lg', 'mt-8')}
            >
              Talk to our care team
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>

          <div className="relative">
            <div
              aria-hidden
              className="absolute left-[27px] top-3 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-ember-500/60 via-sand-50/20 to-transparent sm:block"
            />
            <ol className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <Reveal key={step.step} delay={index * 90} as="li">
                    <div className="flex gap-5">
                      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sand-50/15 bg-sand-50/[0.06] text-ember-400 backdrop-blur-sm">
                        <Icon className="h-6 w-6" aria-hidden />
                      </span>
                      <div className="pt-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sand-100/40">
                          Step {step.step}
                        </p>
                        <h3 className="mt-1.5 font-display text-[21px] text-sand-50">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-sand-100/60">
                          {step.copy}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
