import Image from 'next/image'
import Link from 'next/link'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

const explore = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About us' },
  { href: '/services', label: 'Services' },
  { href: '/news', label: 'News & updates' },
  { href: '/contact', label: 'Contact' },
]

const defaultServices = [
  'Hemodialysis',
  'Peritoneal dialysis',
  'Preventive care',
  'Renal nutrition',
  'Patient education',
]

interface FooterSettings {
  hotline: string
  email: string
  address: string
  hours: string
}

export function FooterLinks({
  tagline,
  settings,
  services,
}: {
  tagline?: string
  settings?: FooterSettings
  services?: string[]
}) {
  const serviceNames = services && services.length > 0 ? services.slice(0, 5) : defaultServices
  const hotline = settings?.hotline || '(555) 014-2800'
  const email = settings?.email || 'care@southwooddialysis.com'
  const addressLines = (settings?.address || '123 Kidney Avenue\nSouthwood District')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const hourLines = (settings?.hours || 'Mon–Sat, 6:00 AM – 8:00 PM\nSunday: on-call only')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="grid gap-10 border-b border-sand-50/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
      <div>
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-sand-50/10">
            <Image
              src="/favicon.png"
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[19px] tracking-tight text-sand-50">
              Southwoods Bicutan
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-sand-100/50">
              Dialysis and Medical Center
            </span>
          </span>
        </Link>

        <p className="mt-5 max-w-xs text-sm leading-relaxed text-sand-100/60">
          {tagline ||
            'Calm, comprehensive kidney care for our community — with the same care team at every visit.'}
        </p>

        <a
          href={`tel:${hotline.replace(/[^\d+]/g, '')}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-sand-50/15 px-4 py-2 text-sm text-sand-50 transition-colors hover:border-ember-400 hover:text-ember-400"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden />
          {hotline}
        </a>
      </div>

      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sand-100/40">
          Explore
        </h4>
        <ul className="mt-4 space-y-2.5">
          {explore.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm text-sand-100/70 transition-colors hover:text-sand-50"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sand-100/40">
          Services
        </h4>
        <ul className="mt-4 space-y-2.5">
          {serviceNames.map((service) => (
            <li key={service}>
              <Link
                href="/services"
                className="text-sm text-sand-100/70 transition-colors hover:text-sand-50"
              >
                {service}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sand-100/40">
          Visit us
        </h4>
        <ul className="mt-4 space-y-3.5 text-sm text-sand-100/70">
          <li className="flex gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember-400" aria-hidden />
            <span>
              {addressLines.map((line, index) => (
                <span key={line} className="block">
                  {line}
                  {index < addressLines.length - 1 ? null : null}
                </span>
              ))}
            </span>
          </li>
          <li className="flex gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ember-400" aria-hidden />
            <span>
              {hourLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
          </li>
          <li className="flex gap-2.5">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ember-400" aria-hidden />
            <a
              href={`mailto:${email}`}
              className="transition-colors hover:text-sand-50"
            >
              {email}
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
