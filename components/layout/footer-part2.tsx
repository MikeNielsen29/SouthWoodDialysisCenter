import Link from 'next/link'

export function FooterBottom() {
  return (
    <div className="flex flex-col items-center justify-between gap-4 pb-12 pt-8 text-[13px] text-sand-100/45 sm:flex-row">
      <p>© {new Date().getFullYear()} Southwood Dialysis Center. All rights reserved.</p>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <Link href="/privacy-policy" className="transition-colors hover:text-sand-50">
          Privacy Policy
        </Link>
        <Link href="/terms-of-service" className="transition-colors hover:text-sand-50">
          Terms of Service
        </Link>
        <Link href="/contact" className="transition-colors hover:text-sand-50">
          Sitemap
        </Link>
      </div>
    </div>
  )
}
