import { PageHeader } from '@/components/sections/pageheader'
import { AboutSection } from '@/components/sections/aboutsection'
import { TestimonialsSection } from '@/components/sections/testimonialssection'
import { CtaSection } from '@/components/sections/ctasection'
import { GallerySection } from '@/components/sections/gallerysection'
import { generateSeoMetadata } from '@/lib/seo'
import { getPublishedSections } from '@/lib/site-content'
import { getPublicContent } from '@/lib/public-data'

export default async function AboutPage() {
  const [content, data] = await Promise.all([
    getPublishedSections('about'),
    getPublicContent(),
  ])
  const header = content.header

  return (
    <main>
      <PageHeader
        eyebrow={header?.eyebrow || 'About us'}
        title={header?.heading || 'Kidney care with a '}
        emphasis={header?.emphasis || 'human pace.'}
        lead={
          header?.body ||
          'A small team, three modern stations, and a schedule built around patients rather than queues.'
        }
      />
      <GallerySection content={content.gallery} />
      <AboutSection content={content.about} />
      <TestimonialsSection items={data.testimonials} content={content.stories} />
      <CtaSection content={content.cta} />
    </main>
  )
}

export const metadata = generateSeoMetadata({
  title: 'About Southwood Dialysis Center',
  description:
    'Learn about our mission, values, team, and comprehensive kidney dialysis services.',
  canonical: '/about',
  openGraph: {
    title: 'About Southwood Dialysis Center',
    description:
      'Learn about our mission, values, team, and comprehensive kidney dialysis services.',
    images: ['/og-about.jpg'],
    url: '/about',
  },
  twitterCard: 'summary',
})
