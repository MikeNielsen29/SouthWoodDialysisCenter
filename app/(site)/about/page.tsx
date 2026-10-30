import { PageHeader } from '@/components/sections/pageheader'
import { AboutSection } from '@/components/sections/aboutsection'
import { TestimonialsSection } from '@/components/sections/testimonialssection'
import { CtaSection } from '@/components/sections/ctasection'
import { generateSeoMetadata } from '@/lib/seo'

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        eyebrow="About us"
        title="Kidney care with a "
        emphasis="human pace."
        lead="A small team, three modern stations, and a schedule built around patients rather than queues."
      />
      <AboutSection />
      <TestimonialsSection />
      <CtaSection />
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
