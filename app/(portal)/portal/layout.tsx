import { redirect } from 'next/navigation'
import { requireUserOrRedirect } from '@/lib/auth/session'
import { Header, Footer } from './shared'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireUserOrRedirect('/portal')

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
