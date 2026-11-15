import { PageHeader } from '@/components/sections/pageheader'
import { ServicesSection } from '@/components/sections/servicessection'
import { ProcessSection } from '@/components/sections/processsection'
import { CtaSection } from '@/components/sections/ctasection'
import { generateSeoMetadata } from '@/lib/seo'

export default function ServicesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Services"
        title="Treatment that fits "
        emphasis="your week."
        lead="From in-centre hemodialysis to at-home programmes, each service comes with the same care team and the same clear answers."
      />
      <ServicesSection />
      <ProcessSection />
      <CtaSection />
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
