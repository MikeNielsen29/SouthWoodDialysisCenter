import { generateSeoMetadata } from '@/lib/seo'
import { getPublishedSections } from '@/lib/site-content'
import { getPublicContent } from '@/lib/public-data'
import { Section } from '@/components/sections/herosection'
import { AboutSection } from '@/components/sections/aboutsection'
import { ServicesSection } from '@/components/sections/servicessection'
import { ProcessSection } from '@/components/sections/processsection'
import { NewsSection } from '@/components/sections/newsection'
import { TestimonialsSection } from '@/components/sections/testimonialssection'
import { CtaSection } from '@/components/sections/ctasection'
import { GallerySection } from '@/components/sections/gallerysection'

export const revalidate = 60 // SEO: sitemap-friendly

export default async function HomePage() {
  const [content, data] = await Promise.all([
    getPublishedSections('home'),
    getPublicContent(),
  ])

  return (
    <main>
      <Section content={content.hero} />
      <GallerySection content={content.gallery} />
      <ServicesSection items={data.services} />
      <AboutSection content={content.about} />
      <ProcessSection content={content.process} />
      <TestimonialsSection items={data.testimonials} />
      <NewsSection articles={data.news} />
      <CtaSection content={content.cta} />
    </main>
  )
}

// Export metadata for Next.js metadata injector
export const metadata = generateSeoMetadata({
  title: 'Southwood Dialysis Center - Comprehensive Kidney Care',
  description:
    'Providing comprehensive dialysis treatment and compassionate care for kidney disease patients since 2024. State-of-art facilities and expert medical team.',
  canonical: '/',
  openGraph: {
    title: 'Southwood Dialysis Center - Comprehensive Kidney Care',
    description:
      'Providing comprehensive dialysis treatment and compassionate care for kidney disease patients since 2024.',
    images: ['/og-home.jpg'],
    url: '/',
    siteName: 'Southwood Dialysis Center',
  },
  twitterCard: 'summary_large_image',
})
