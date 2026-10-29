import Link from 'next/link'
import { Facebook, Instagram, Twitter, LinkedIn } from 'lucide-react'

export function FooterLinks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {/* Left Column - Logo & Info */}
      <div className="md:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <Image
            src="/logo.svg"
            alt="Southwood Dialysis Center logo"
            width={40}
            height={40}
            className="blur-lg"
          />
          <span className="text-xl font-bold tracking-wider">
            <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Southwood
            </span>
            <span className="text-teal-400">
              Dialysis Center
            </span>
          </span>
        </div>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Providing comprehensive dialysis treatment and compassionate care for kidney disease patients since 2024.
        </p>
      </div>

      {/* Navigation Links */}
      <nav>
        <h4 className="text-neutral-300 font-medium mb-4">Navigation</h4>
        <ul className="space-y-2">
          <li>
            <Link href="/home" className="text-neutral-400 hover:text-teal-400 transition-colors text-sm">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-neutral-400 hover:text-teal-400 transition-colors text-sm">
              About
            </Link>
          </li>
          <li>
            <Link href="/services" className="text-neutral-400 hover:text-teal-400 transition-colors text-sm">
              Services
            </Link>
          </li>
          <li>
            <Link href="/news" className="text-neutral-400 hover:text-teal-400 transition-colors text-sm">
              News
            </Link>
          </li>
        </ul>
      </nav>

      {/* Contact Info */}
      <div>
        <h4 className="text-neutral-300 font-medium mb-4">Contact</h4>
        <ul className="space-y-2 text-neutral-400 text-sm">
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 3h20v2H2V3zm0 6h20v2H2v-2zm0 6h20v2H2v-2zm0 6h20v2H2v-2z" />
            </svg>
            <span>123 Kidney Avenue, Medical City</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.02 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.02-8.67L2 5a2 2 0 0 1 2-2h3.08" />
            </svg>
            <span>+63 2 777 8888</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zM2 10h4v2H2v-2zm0 4h12v2H2v-2zm0 4h4v2H2v-2z" />
            </svg>
            <span>info@southwood-dc.com</span>
          </li>
        </ul>
      </div>

      {/* Follow Us */}
      <div>
        <h4 className="text-neutral-300 font-medium mb-4">Follow Us</h4>
        <div className="flex gap-3">
          <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-600 hover:border-teal-400 hover:bg-teal-100 transition-colors">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-600 hover:border-teal-400 hover:bg-teal-100 transition-colors">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-600 hover:border-teal-400 hover:bg-teal-100 transition-colors">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-600 hover:border-teal-400 hover:bg-teal-100 transition-colors">
            <LinkedIn className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}