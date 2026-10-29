import { AboutSection } from '@/components/sections/aboutsection'
import { generateSeoMetadata, getPageSeo } from '@/lib/seo'

export default function AboutPage() {
  const seo = getPageSeo('about')
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <AboutSection />
    </main>
  )
}

// Export metadata for Next.js metadata injector
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