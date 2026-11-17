import { PageHeader } from '@/components/sections/pageheader'
import { NewsSection } from '@/components/sections/newsection'
import { CtaSection } from '@/components/sections/ctasection'
import { GallerySection } from '@/components/sections/gallerysection'
import { generateSeoMetadata } from '@/lib/seo'
import { getPublishedSections } from '@/lib/site-content'
import { getPublicContent } from '@/lib/public-data'

export default async function NewsPage() {
  const [content, data] = await Promise.all([
    getPublishedSections('news'),
    getPublicContent(),
  ])
  const header = content.header

  return (
    <main>
      <PageHeader
        eyebrow={header?.eyebrow || 'News'}
        title={header?.heading || "What's happening at "}
        emphasis={header?.emphasis || 'Southwoods Bicutan.'}
        lead={
          header?.body ||
          'Centre updates, patient workshops, and practical health notes from our clinical team.'
        }
      />
      <GallerySection content={content.gallery} />
      <NewsSection articles={data.news} content={content.news} />
      <CtaSection content={content.cta} />
    </main>
  )
}

export const metadata = generateSeoMetadata({
  title: 'News & Updates | Southwoods Bicutan Dialysis and Medical Center',
  description:
    'Stay informed with the latest news, health tips, and center updates from Southwoods Bicutan Dialysis and Medical Center.',
  canonical: '/news',
  openGraph: {
    title: 'News & Updates | Southwoods Bicutan Dialysis and Medical Center',
    description:
      'Stay informed with the latest news, health tips, and center updates.',
    images: ['/og-news.jpg'],
    url: '/news',
  },
  twitterCard: 'summary',
})
