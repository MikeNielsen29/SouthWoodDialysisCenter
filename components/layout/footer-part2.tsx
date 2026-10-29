import Link from 'next/link'

export function FooterBottom() {
  return (
    <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-neutral-500 text-sm">
        <Link href="/privacy-policy" className="text-neutral-400 hover:text-teal-400 transition-colors">
          Privacy Policy
        </Link>
        <Link href="/terms-of-service" className="text-neutral-400 hover:text-teal-400 transition-colors">
          Terms of Service
        </Link>
      </p>
      <p className="text-neutral-500 text-sm">
        <a href="#" className="text-neutral-400 hover:text-teal-400 transition-colors">
          Sitemap
        </a>
        <a href="/robots.txt" className="text-neutral-400 hover:text-teal-400 transition-colors">
          robots.txt
        </a>
      </p>
    </div>
  )
}