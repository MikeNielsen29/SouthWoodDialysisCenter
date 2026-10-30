"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/useAuth'

export function Sidebar() {
  const { user, session } = useAuth()

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: 'Layout' },
    { label: 'Content Management', href: '/admin/content', icon: 'Text' },
    { label: 'User Accounts', href: '/admin/users', icon: 'Users' },
    { label: 'Inquiries', href: '/admin/inquiries', icon: 'MessageCircle' },
    { label: 'Testimonials', href: '/admin/testimonials', icon: 'Star' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'ChartSquare' },
    { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
  ]

  return (
    <nav className="bg-neutral-950 h-screen w-64 lg:w-auto border-right border-neutral-700">
      <div className="p-4 border-b border-neutral-700">
        <Image
          src="/SBDC.png"
          alt="Southwood Dialysis"
          width={28}
          height={28}
          className="blur-lg object-contain mx-auto mb-6"
        />
        <span className="text-orange-400 font-bold text-sm">Admin</span>
      </div>

      <nav className="px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ${session?.route === item.href ? 'bg-orange-500 text-white' : ''}
                `}
                onClick={() => session?.setRoute?.(item.href)}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M" />
                </svg>
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-700">
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 text-xs hover:text-white transition-colors"
        >
          Version 1.0
        </a>
      </div>
    </nav>
  )
}
