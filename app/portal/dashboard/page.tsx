import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const { user, session, logout } = useAuth()

  useEffect(() => {
    if (!session) {
      router.replace('/portal/login')
    }
  }, [session, router])

  if (!user) {
    return <div className="min-h-screen">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-neutral-200 bg-orange-50 py-3 px-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Southwood" width={30} height={30} className="blur-lg" />
            <span className="font-bold text-orange-600">{user.name || 'Patient Portal'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-600 text-sm">CN: {user.controlNumber}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Appointments placeholder */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h3 className="text-xl font-bold text-orange-600 mb-4">Upcoming Appointments</h3>
            <p className="text-neutral-500">Appointments will appear here</p>
          </div>

          {/* Lab Results placeholder */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h3 className="text-xl font-bold text-teal-600 mb-4">Lab Results</h3>
            <p className="text-neutral-500">Lab results will appear here</p>
          </div>
        </div>
      </div>
    </main>
  )
}