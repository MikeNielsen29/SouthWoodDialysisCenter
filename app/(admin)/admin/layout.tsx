import { requireRoleOrRedirect } from '@/lib/auth/session'
import { Header, Footer } from '@/components/admin/layout-components'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect(['Super Admin', 'Admin', 'Page Editor'], '/admin')

  return (
    <div className="flex min-h-screen flex-col bg-sand-100/50">
      <Header />
      <main className="flex-1 overflow-auto">{children}</main>
      <Footer />
    </div>
  )
}
