import { getPublishedSections } from '@/lib/site-content'
import { getSettings } from '@/lib/content'
import { getPublicContent } from '@/lib/public-data'
import type { Settings } from '@/lib/content'
import { FooterLinks } from './footer-part1'
import { FooterBottom } from './footer-part2'

export async function Footer() {
  const [content, settings, data] = await Promise.all([
    getPublishedSections('global'),
    getSettings(),
    getPublicContent(),
  ])

  return (
    <footer className="bg-brand-950 pt-16">
      <div className="shell">
        <FooterLinks
          tagline={content.footer?.body}
          settings={settings}
          services={data.services.map((service) => service.title)}
        />
        <FooterBottom />
      </div>
    </footer>
  )
}
