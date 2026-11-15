import { PageHeader } from '@/components/sections/pageheader'
import { NewsSection } from '@/components/sections/newsection'
import { CtaSection } from '@/components/sections/ctasection'
import { generateSeoMetadata } from '@/lib/seo'
import { getPublishedSections } from '@/lib/site-content'

export default async function NewsPage() {
  const content = await getPublishedSections('news')
  const header = content.header

  return (
    <main>
      <PageHeader
        eyebrow={header?.eyebrow || 'News'}
        title={header?.heading || "What's happening at "}
        emphasis={header?.emphasis || 'Southwood.'}
        lead={
          header?.body ||
          'Centre updates, patient workshops, and practical health notes from our clinical team.'
        }
      />
      <NewsSection />
      <CtaSection content={content.cta} />
    </main>
  )
}

export const metadata = generateSeoMetadata({
  title: 'News & Updates | Southwood Dialysis Center',
  description:
    'Stay informed with the latest news, health tips, and center updates from Southwood Dialysis Center.',
  canonical: '/news',
  openGraph: {
    title: 'News & Updates | Southwood Dialysis Center',
    description:
      'Stay informed with the latest news, health tips, and center updates.',
    images: ['/og-news.jpg'],
    url: '/news',
  },
  twitterCard: 'summary',
})
