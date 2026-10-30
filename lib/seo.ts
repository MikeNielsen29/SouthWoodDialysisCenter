import { Metadata } from 'next'

interface SeoData {
  title: string
  description: string
  canonical?: string
  icons?: Metadata['icons']
  openGraph?: {
    title?: string
    description?: string
    images?: string[]
    url?: string
    siteName?: string
  }
  twitterCard?: 'summary' | 'summary_large_image' | 'large_image' | 'player'
}

/**
 * Generate SEO metadata for a page
 * @param data - SEO data configuration
 * @returns Metadata object for Next.js
 */
export function generateSeoMetadata(data: SeoData): Metadata {
  const {
    title,
    description,
    canonical,
    icons = {
      icon: '/SBDC.png',
    },
    openGraph,
    twitterCard = 'summary_large_image',
  } = data

  const baseMetadata: Metadata = {
    title,
    description,
    openGraph: {
      title: openGraph?.title || title,
      description: openGraph?.description || description,
      url: openGraph?.url,
      siteName: openGraph?.siteName || 'Southwood Dialysis Center',
      images: openGraph?.images || [],
    },
    tweets: twitterCard,
    icons,
  }

  // Add canonical tag if provided
  if (canonical) {
    baseMetadata.appLinks = {
      ...baseMetadata.appLinks,
      canonical,
    }
  }

  return baseMetadata
}

/**
 * Page-specific SEO configurations
 */

// Home page SEO
export const homeSeo = generateSeoMetadata({
  title: 'Southwood Dialysis Center - Comprehensive Kidney Care',
  description:
    'Providing comprehensive dialysis treatment and compassionate care for kidney disease patients since 2024. State-of-art facilities and expert medical team.',
  canonical: '/home',
  openGraph: {
    title: 'Southwood Dialysis Center - Comprehensive Kidney Care',
    description:
      'Providing comprehensive dialysis treatment and compassionate care for kidney disease patients since 2024.',
    images: ['/og-home.jpg'],
    url: '/home',
    siteName: 'Southwood Dialysis Center',
  },
  twitterCard: 'summary_large_image',
})

// About page SEO
export const aboutSeo = generateSeoMetadata({
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

// Services page SEO
export const servicesSeo = generateSeoMetadata({
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

// News page SEO
export const newsSeo = generateSeoMetadata({
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

// Contact page SEO
export const contactSeo = generateSeoMetadata({
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

// Export a function to get SEO metadata by page
export function getPageSeo(page: string): Metadata {
  const seoMap: Record<string, Metadata> = {
    home: homeSeo,
    about: aboutSeo,
    services: servicesSeo,
    news: newsSeo,
    contact: contactSeo,
  }

  return seoMap[page] || homeSeo
}