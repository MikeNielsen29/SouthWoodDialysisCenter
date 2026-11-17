"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Menu, Phone, X } from 'lucide-react'
import { buttonClasses } from '@/components/ui/button-styles'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-brand-900 text-sand-100/80 lg:block">
        <div className="shell flex h-9 items-center justify-between text-[12px]">
          <p className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-ember-400" aria-hidden />
            <span>Mon–Sat · 6:00 AM – 8:00 PM</span>
          </p>
          <p className="flex items-center gap-6">
            <span>Kidney care you can trust, since 2024</span>
            <a
              href="tel:+15550142800"
              className="flex items-center gap-2 font-medium text-sand-50 transition-colors hover:text-ember-400"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              (555) 014-2800
            </a>
          </p>
        </div>
      </div>

      <div className="border-b border-ink/10 bg-sand-50/85 backdrop-blur-md">
        <div className="shell flex h-[68px] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Southwoods Bicutan Dialysis and Medical Center home">
            <span className="flex h-10 w-10 items-center justify-center">
              <Image
                src="/favicon.png"
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-contain"
                priority
              />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[19px] tracking-tight text-ink">
                Southwoods Bicutan
              </span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Dialysis and Medical Center
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {nav.map((item) => {
              const active =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                    active
                      ? 'text-brand-800'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-[2px] rounded-full bg-ember-500" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link href="/contact" className={buttonClasses('primary', 'sm')}>
              Book Appointment
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-brand-700 hover:text-brand-700 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden border-b border-ink/10 bg-sand-50 transition-[max-height,opacity] duration-300 md:hidden ${
          open ? 'max-h-[420px] opacity-100' : 'invisible max-h-0 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <nav className="shell flex flex-col gap-1 py-5" aria-label="Mobile">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-3 text-[15px] text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className={buttonClasses('primary', 'md', 'mt-2 w-full')}
          >
            Book Appointment
          </Link>
          <a
            href="tel:+15550142800"
            className="mt-1 flex items-center justify-center gap-2 py-3 text-sm text-ink-muted"
          >
            <Phone className="h-4 w-4" aria-hidden />
            (555) 014-2800
          </a>
        </nav>
      </div>
    </header>
  )
}
