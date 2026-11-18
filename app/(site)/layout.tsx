import type { ReactNode } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getSettings } from '@/lib/content'

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings()

  return (
    <div className="flex min-h-screen flex-col">
      <Header hotline={settings.hotline} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
