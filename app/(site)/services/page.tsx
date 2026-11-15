import { PageHeader } from '@/components/sections/pageheader'
import { ServicesSection } from '@/components/sections/servicessection'
import { ProcessSection } from '@/components/sections/processsection'
import { CtaSection } from '@/components/sections/ctasection'
import { generateSeoMetadata } from '@/lib/seo'
import { getPublishedSections } from '@/lib/site-content'

export default async function ServicesPage() {
  const content = await getPublishedSections('services')
  const header = content.header

  return (
    <main>
      <PageHeader
        eyebrow={header?.eyebrow || 'Services'}
        title={header?.heading || 'Treatment that fits '}
        emphasis={header?.emphasis || 'your week.'}
        lead={
          header?.body ||
          'From in-centre hemodialysis to at-home programmes, each service comes with the same care team and the same clear answers.'
        }
      />
      <ServicesSection />
      <ProcessSection />
      <CtaSection content={content.cta} />
    </main>
  )
}

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
