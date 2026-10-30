import { NextResponse } from 'next/server'
import { getSiteContent } from '@/lib/content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const content = await getSiteContent()
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const lines: string[] = []
  lines.push('# Southwood Dialysis Center')
  lines.push('')
  lines.push('> Kidney care you can trust, since 2024.')
  lines.push('')
  lines.push('## Site')
  lines.push(`- ${site}`)
  lines.push(`- ${site}/about`)
  lines.push(`- ${site}/services`)
  lines.push(`- ${site}/news`)
  lines.push(`- ${site}/contact`)
  lines.push('')

  if (content.services?.length) {
    lines.push('## Services')
    for (const service of content.services) {
      if (!service.title) continue
      lines.push(`- ${service.title}: ${String((service as { summary?: string }).summary || 'See service page.')}`)
    }
    lines.push('')
  }

  if (content.news?.length) {
    lines.push('## Recent news')
    for (const item of content.news.slice(0, 6)) {
      if (!item.title) continue
      const publishedAt = (item as { published_at?: string }).published_at
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString('en-PH') : ''
      lines.push(`- ${date ? date + ' — ' : ''}${item.title}`)
    }
    lines.push('')
  }

  const pages = (content.pages as unknown) as Array<{ status?: string; slug?: string }> | undefined
  if (pages?.length) {
    lines.push('## Pages')
    for (const page of pages.filter((p) => p.status === 'published' && p.slug)) {
      lines.push(`- ${site}/${page.slug}`)
    }
    lines.push('')
  }

  lines.push('## Contact')
  lines.push('- Phone: +1 (555) 014-2800')
  lines.push('- Email: care@southwooddialysis.com')
  lines.push('- Address: 123 Kidney Avenue, Southwood District')
  lines.push('- Hours: Mon–Sat, 6:00 AM – 8:00 PM; Sunday: on-call only')
  lines.push('')
  lines.push('## Notes')
  lines.push('- This site does not use stock photos.')
  lines.push('- Patient data is handled under the Data Privacy Act of 2012 (RA 10173) and the E-Commerce Act of 2000 (RA 8792).')
  lines.push('- The patient portal is private; public pages are listed above only.')

  return new NextResponse(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  })
}
