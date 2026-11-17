import { requireRoleOrRedirect } from '@/lib/auth/session'
import { AdminNav } from '@/components/admin/nav'
import { Header, Footer } from '@/components/admin/layout-components'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRoleOrRedirect(
    ['Super Admin', 'Admin', 'Page Editor'],
    '/admin'
  )

  return (
    <div className="flex min-h-screen bg-sand-100/50">
      <AdminNav role={session.role} name={session.full_name || session.cn} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
