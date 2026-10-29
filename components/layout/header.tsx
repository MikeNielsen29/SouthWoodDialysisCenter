import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

interface HeaderProps {
  hasMenu?: boolean
  onMenuToggle?: () => void
  showSocial?: boolean
}

export function Header({
  hasMenu = false,
  onMenuToggle,
  showSocial = true,
}: HeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Site Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Southwood Dialysis Center logo"
                width={40}
                height={40}
                className="blur-lg"
                priority
              />
              <span className="text-xl font-bold tracking-wider">
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Southwood
                </span>
                <span className="text-teal-600">
                  Dialysis Center
                </span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/home"
              className="text-neutral-600 hover:text-orange-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-neutral-600 hover:text-orange-600 font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/services"
              className="text-neutral-600 hover:text-orange-600 font-medium transition-colors"
            >
              Services
            </Link>
            <Link
              href="/news"
              className="text-neutral-600 hover:text-orange-600 font-medium transition-colors"
            >
              News
            </Link>
            <Link
              href="/contact"
              className="text-neutral-600 hover:text-orange-600 font-medium transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Menu & Social Icons */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Social Media Icons */}
            <div className="flex gap-2">
              {showSocial && (
                <div className="flex gap-2">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-neutral-100 transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      <circle cx="9" cy="21" r="1" />
                      <path d="M13.5 3H6a2 2 0 0 0-2 2v3h3v8h7v-8h3L13.5 3z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-neutral-100 transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M16 8v-4h-2v4h-4v4h2v4h4v-4h2v-4h-4V8h2zm1-1h2v6h-2v-6zm-6 6h2v2H10v-2zm6 2h2v4h-2v-4zm-6 2h2v4H4v-4zm2-4h2v2H8v-2zm8-2h2v2h-2v-2zm-2-6h2v2h-2V8z"
                    />
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-neutral-100 transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M16 8v-4h-2v4h-4v4h2v4h4v-4h2v-4h-4V8h2zm1-1h2v6h-2v-6zm-6 6h2v2H10v-2zm6 2h2v4h-2v-4zm-6 2h2v4H4v-4zm2-4h2v2H8v-2z"
                    />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}