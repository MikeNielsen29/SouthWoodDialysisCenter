import { MetadataRoute } from 'next'
import { getSiteContent } from '@/lib/content'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getSiteContent()
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const pages = (content.pages as unknown) as Array<{ status?: string; slug?: string }> | undefined
  const publishedPages = Array.isArray(pages) ? pages.filter((p) => p.status === 'published' && p.slug) : []
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${base}/news`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]

  const pageRoutes: MetadataRoute.Sitemap = publishedPages.map((page) => ({
    url: `${base}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...pageRoutes]
}
