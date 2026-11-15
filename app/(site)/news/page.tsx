import { PageHeader } from '@/components/sections/pageheader'
import { NewsSection } from '@/components/sections/newsection'
import { CtaSection } from '@/components/sections/ctasection'
import { generateSeoMetadata } from '@/lib/seo'

export default function NewsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="News"
        title="What's happening at "
        emphasis="Southwood."
        lead="Centre updates, patient workshops, and practical health notes from our clinical team."
      />
      <NewsSection />
      <CtaSection />
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
