import Image from 'next/image'
import { generateSeoMetadata, getPageSeo } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/sections/herosection'
import { AboutSection } from '@/components/sections/aboutsection'
import { ServicesSection } from '@/components/sections/servicessection'
import { NewsSection } from '@/components/sections/newsection'
import { TestimonialsSection } from '@/components/sections/testimonialssection'

export const revalidate = 60 // SEO: sitemap-friendly

export default function HomePage() {
  const seo = getPageSeo('home')
  return (
    <main className="min-h-screen">
      {/* SEO Metadata is injected via Next.js metadata */}
      <Section />
      <AboutSection />
      <ServicesSection />
      <NewsSection />
      <TestimonialsSection />
    </main>
  )
}

// Export metadata for Next.js metadata injector
export const metadata = generateSeoMetadata({
  title: 'Southwood Dialysis Center - Comprehensive Kidney Care',
  description:
    'Providing comprehensive dialysis treatment and compassionate care for kidney disease patients since 2024. State-of-art facilities and expert medical team.',
  canonical: '/home',
  openGraph: {
    title: 'Southwood Dialysis Center - Comprehensive Kidney Care',
    description:
      'Providing comprehensive dialysis treatment and compassionate care for kidney disease patients since 2024.',
    images: ['/og-home.jpg'],
    url: '/home',
    siteName: 'Southwood Dialysis Center',
  },
  twitterCard: 'summary_large_image',
})