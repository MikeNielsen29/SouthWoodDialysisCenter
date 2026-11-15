import { PageHeader } from '@/components/sections/pageheader'
import { ContactSection } from '@/components/sections/contactsection'
import { GallerySection } from '@/components/sections/gallerysection'
import { generateSeoMetadata } from '@/lib/seo'
import { getPublishedSections } from '@/lib/site-content'

export default async function ContactPage() {
  const content = await getPublishedSections('contact')
  const header = content.header

  return (
    <main>
      <PageHeader
        eyebrow={header?.eyebrow || 'Contact'}
        title={header?.heading || 'Book a visit or '}
        emphasis={header?.emphasis || 'ask us anything.'}
        lead={
          header?.body ||
          'We answer the phone during opening hours and reply to requests within one working day.'
        }
      />
      <GallerySection content={content.gallery} />
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
