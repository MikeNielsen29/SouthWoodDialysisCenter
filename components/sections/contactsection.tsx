import Link from 'next/link'
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'

const details = [
  {
    icon: MapPin,
    label: 'Visit us',
    lines: ['123 Kidney Avenue', 'Southwood District'],
  },
  {
    icon: Phone,
    label: 'Call us',
    lines: ['(555) 014-2800', 'Mon–Sat, 6:00 AM – 8:00 PM'],
    href: 'tel:+15550142800',
  },
  {
    icon: Mail,
    label: 'Email',
    lines: ['care@southwooddialysis.com'],
    href: 'mailto:care@southwooddialysis.com',
  },
  {
    icon: Clock,
    label: 'Centre hours',
    lines: ['Mon–Sat: 6:00 AM – 8:00 PM', 'Sunday: on-call only'],
  },
]

const fieldClass =
  'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:outline-none'

export function ContactSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <Reveal>
            <h2 className="display text-[26px] leading-tight sm:text-[30px]">
              Talk to a real person.
            </h2>
            <p className="lead mt-4">
              Call us during opening hours, or send a request and we will get back to
              you within one working day. No referral is needed to ask a question.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {details.map((detail, index) => {
              const Icon = detail.icon
              const content = (
                <>
                  <Icon className="h-4 w-4 text-ember-500" aria-hidden />
                  <span className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    {detail.label}
                  </span>
                  {detail.lines.map((line) => (
                    <span key={line} className="mt-1 block text-sm text-ink-soft">
                      {line}
                    </span>
                  ))}
                </>
              )

              return (
                <Reveal key={detail.label} delay={index * 60}>
                  {detail.href ? (
                    <a
                      href={detail.href}
                      className="block h-full rounded-2xl border border-ink/10 bg-white/70 p-5 transition-colors hover:border-brand-200 hover:bg-white"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="block h-full rounded-2xl border border-ink/10 bg-white/70 p-5">
                      {content}
                    </div>
                  )}
                </Reveal>
              )
            })}
          </div>
        </div>

        <Reveal delay={100}>
          <div className="rounded-4xl border border-ink/10 bg-white p-7 shadow-soft sm:p-9">
            <h3 className="font-display text-[22px] text-ink">Request an appointment</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Fill this in and your email app will open with the details ready to send.
            </p>

            <form
              action="mailto:care@southwooddialysis.com"
              method="post"
              encType="text/plain"
              className="mt-6 space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">
                    Full name
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Juan Dela Cruz"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">
                    Phone number
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(555) 000-0000"
                    className={fieldClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">
                  Email address
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className={fieldClass}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-ink-soft">
                  How can we help?
                </span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about your situation, preferred schedule, or any questions."
                  className={`${fieldClass} resize-none`}
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-medium text-sand-50 transition-colors hover:bg-brand-900"
              >
                Send request
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>

              <p className="text-center text-[12px] text-ink-muted">
                Prefer to talk?{' '}
                <Link href="tel:+15550142800" className="font-medium text-brand-700">
                  (555) 014-2800
                </Link>
              </p>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
