import { PageHeader } from '@/components/sections/pageheader'
import { ContactSection } from '@/components/sections/contactsection'
import { generateSeoMetadata } from '@/lib/seo'

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Contact"
        title="Book a visit or "
        emphasis="ask us anything."
        lead="We answer the phone during opening hours and reply to requests within one working day."
      />
      <ContactSection />
    </main>
  )
}

export const metadata = generateSeoMetadata({
  title: 'Contact Us | Southwood Dialysis Center',
  description:
    'Contact Southwood Dialysis Center for inquiries, appointments, or general information. Visit us at 123 Kidney Avenue.',
  canonical: '/contact',
  openGraph: {
    title: 'Contact Us | Southwood Dialysis Center',
    description:
      'Contact Southwood Dialysis Center for inquiries, appointments, or general information.',
    images: ['/og-contact.jpg'],
    url: '/contact',
  },
  twitterCard: 'summary',
})
