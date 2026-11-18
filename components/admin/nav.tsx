'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactElement } from 'react'
import type { Role } from '@/lib/auth/jwt'
import { navigationForRole } from '@/components/admin/navigation'

const LAYOUT_DASHBOARD = () => (
  <svg className={undefined} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="10" width="7" height="9" rx="1" />
    <rect x="3" y="13" width="7" height="8" rx="1" />
  </svg>
)
const STETHOSCOPE = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3 8 8 0 0 0 7 0V6a3 3 0 0 0-3-3Z" />
    <path d="M18 3a9 9 0 0 0-9 9v0a9 9 0 0 0 9 9H18a9 9 0 0 0 0-18Z" />
    <circle cx="18" cy="11" r="7" />
    <circle cx="6" cy="9" r="2" />
  </svg>
)
const PACKAGE = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4 19 7.5l-2-2L16 6l-.5-.5L14 5l-3-3L8 5l-1 1L6 6l3 3l-.5.5L5 7.5 2 9l2.5 2L6 11l2 2l3-3l-1-1l.5-.5 2-.5l1.5.5Z" />
  </svg>
)
const NEWSPAPER = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="2" />
    <path d="M6 12h12" />
    <path d="M6 16h8" />
    <path d="M6 8h8" />
  </svg>
)
const USERS = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="8" r="4" />
    <path d="M4 21v-1.5C4 15.5 7 13 10 12c0 2 1.5 3.5 2.5 4.5" />
    <circle cx="18" cy="8" r="4" />
    <path d="M20 21v-1.5c0-2.5-1.8-4.5-4-5.5" />
  </svg>
)
const INBOX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 5h12l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h1" />
    <path d="m14 4-1 6 1 6" />
  </svg>
)
const STAR = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
    <path d="M12 2l2.5 5 5.05.94-3.8 3.7 1.1 5.2L12 16.42l-4.9 2.7 1.1-5.2L4.45 8.4l5.05-.94Z" />
  </svg>
)
const CALENDAR_CLOCK = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M3 10h18" />
    <path d="M16 4v5c0 1-1 2-2 2H10" />
    <path d="M15 12v2" />
    <path d="M9 12v2" />
    <path d="M5 16h14" />
  </svg>
)
const FILE_STACK = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 4V1h-4" />
    <path d="m16 13-7-7 4-4v8l-4 4" />
    <path d="M9 19h10" />
    <path d="M9 20v4" />
  </svg>
)
const SETTINGS = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2 3 21" />
    <path d="M21 21L3 3" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
)
const SCROLL_TEXT = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 5h-12a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" />
    <path d="M7 5v0" />
    <path d="M21 3v4" />
    <path d="M18 7a2 2 0 1 1 4 0v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2a2 2 0 0 1 3 1" />
    <path d="M12 4v2" />
  </svg>
)

const ICONS: Record<string, (className?: string) => ReactElement> = {
  '/admin': LAYOUT_DASHBOARD,
  '/admin/content': STETHOSCOPE,
  '/admin/services': PACKAGE,
  '/admin/news': NEWSPAPER,
  '/admin/media': FILE_STACK,
  '/admin/patients': USERS,
  '/admin/operations': CALENDAR_CLOCK,
  '/admin/files': FILE_STACK,
  '/admin/inquiries': INBOX,
  '/admin/testimonials': STAR,
  '/admin/user-management': USERS,
  '/admin/settings': SETTINGS,
  '/admin/audit': SCROLL_TEXT,
}

export function AdminNav({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname()
  const groups = navigationForRole(role)

  return (
    <nav className="sticky top-0 flex h-screen w-16 shrink-0 flex-col overflow-y-auto border-r border-sand-50/10 bg-brand-950 px-2 py-5 lg:w-60 lg:px-3">
      <p className="hidden px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sand-100/35 lg:block">Administration</p>
      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <section key={group.title} aria-label={group.title}>
            <p className="hidden px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sand-100/35 lg:block">
              {group.title}
            </p>
            <ul className="mt-1.5 space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href
                const Icon = ICONS[item.href] ?? LAYOUT_DASHBOARD
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={item.label}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center justify-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors lg:justify-start ${
                        active
                          ? 'bg-sand-50/10 text-sand-50'
                          : 'text-sand-100/60 hover:bg-sand-50/5 hover:text-sand-50'
                      }`}
                    >
                      <span className="shrink-0 text-sand-300">{Icon()}</span>
                      <span className="hidden lg:inline">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-auto hidden px-3 pt-6 text-[11px] text-sand-100/30 lg:block">
        <p className="truncate">{name}</p>
        <p className="mt-0.5">{role}</p>
      </div>
    </nav>
  )
}
