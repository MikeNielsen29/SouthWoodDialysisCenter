import { NewsSection } from '@/components/sections/newsection'
import { generateSeoMetadata, getPageSeo } from '@/lib/seo'

export default function NewsPage() {
  const seo = getPageSeo('news')
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <NewsSection />
    </main>
  )
}

// Export metadata for Next.js metadata injector
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