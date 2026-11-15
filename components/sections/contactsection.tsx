import Link from 'next/link'
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { submitInquiryAction } from '@/app/(site)/contact/actions'

interface ContactSettings {
  hotline?: string
  email?: string
  address?: string
  hours?: string
}

const fieldClass =
  'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:outline-none'

export function ContactSection({
  settings,
  content,
  formContent,
  sent,
  error,
}: {
  settings?: ContactSettings
  content?: { heading?: string; body?: string; cta_label?: string }
  formContent?: { heading?: string; body?: string; cta_label?: string }
  sent?: boolean
  error?: string
}) {
  const addressLines = (settings?.address?.trim() || '123 Kidney Avenue\nSouthwood District')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const hourLines = (settings?.hours?.trim() || 'Mon–Sat: 6:00 AM – 8:00 PM\nSunday: on-call only')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const hotline = settings?.hotline?.trim() || '(555) 014-2800'
  const email = settings?.email?.trim() || 'care@southwooddialysis.com'

  const details = [
    { icon: MapPin, label: 'Visit us', lines: addressLines },
    { icon: Phone, label: 'Call us', lines: [hotline, hourLines[0]].filter(Boolean), href: `tel:${hotline.replace(/[^\d+]/g, '')}` },
    { icon: Mail, label: 'Email', lines: [email], href: `mailto:${email}` },
    { icon: Clock, label: 'Centre hours', lines: hourLines },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <Reveal>
            <h2 className="display text-[26px] leading-tight sm:text-[30px]">
              {content?.heading || 'Talk to a real person.'}
            </h2>
            <p className="lead mt-4">
              {content?.body ||
                'Call us during opening hours, or send a request and we will get back to you within one working day. No referral is needed to ask a question.'}
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
          <div id="request" className="rounded-4xl border border-ink/10 bg-white p-7 shadow-soft sm:p-9">
            <h3 className="font-display text-[22px] text-ink">
              {formContent?.heading || 'Request an appointment'}
            </h3>
            <p className="mt-2 text-sm text-ink-muted">
              {formContent?.body ||
                'Send it online and our team will call you back within one working day.'}
            </p>

            {sent ? (
              <p role="status" className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
                Thank you — your request is in. We will get back to you within one
                working day.
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="mt-4 rounded-xl border border-ember-200 bg-ember-50 px-4 py-3 text-sm text-ember-800">
                We could not send that. Please call us instead — the number is on this page.
              </p>
            ) : null}

            <form action={submitInquiryAction} className="mt-6 space-y-4">
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
                {formContent?.cta_label || content?.cta_label || 'Send request'}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>

              <p className="text-center text-[12px] text-ink-muted">
                Prefer to talk?{' '}
                <Link href={`tel:${hotline.replace(/[^\d+]/g, '')}`} className="font-medium text-brand-700">
                  {hotline}
                </Link>
              </p>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
