import { ServicesSection } from '@/components/sections/servicessection'
import { generateSeoMetadata, getPageSeo } from '@/lib/seo'

export default function ServicesPage() {
  const seo = getPageSeo('services')
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <ServicesSection />
    </main>
  )
}

// Export metadata for Next.js metadata injector
export const metadata = generateSeoMetadata({
  title: 'Services | Southwood Dialysis Center',
  description:
    'We offer comprehensive dialysis and supportive care services including hemodialysis, peritoneal dialysis, and kidney transplant evaluation.',
  canonical: '/services',
  openGraph: {
    title: 'Services | Southwood Dialysis Center',
    description:
      'We offer comprehensive dialysis and supportive care services including hemodialysis, peritoneal dialysis, and kidney transplant evaluation.',
    images: ['/og-services.jpg'],
    url: '/services',
  },
  twitterCard: 'summary_large_image',
})