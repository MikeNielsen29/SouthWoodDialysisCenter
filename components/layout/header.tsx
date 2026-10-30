"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Southwood Dialysis Center logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
              <span className="text-xl font-bold tracking-wider">
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Southwood
                </span>
                <span className="text-teal-600">Dialysis Center</span>
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-neutral-600 hover:text-orange-600 font-medium transition-colors">Home</Link>
            <Link href="/about" className="text-neutral-600 hover:text-orange-600 font-medium transition-colors">About</Link>
            <Link href="/services" className="text-neutral-600 hover:text-orange-600 font-medium transition-colors">Services</Link>
            <Link href="/news" className="text-neutral-600 hover:text-orange-600 font-medium transition-colors">News</Link>
            <Link href="/contact" className="text-neutral-600 hover:text-orange-600 font-medium transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3 md:hidden">
            <button className="p-2 rounded-md hover:bg-neutral-100 transition-colors" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}