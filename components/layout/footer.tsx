import Link from 'next/link'
import { Facebook, Instagram, Twitter, LinkedIn } from 'lucide-react'
import { FooterLinks } from './footer-part1'
import { FooterBottom } from './footer-part2'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 py-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <FooterLinks />
        <FooterBottom />
      </div>
    </footer>
  )
}