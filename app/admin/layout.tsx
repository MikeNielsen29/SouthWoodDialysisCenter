import Sidebar from '@/components/admin/sidebar'
import { useAuth } from '@/lib/auth'
import { Image } from 'next/image'

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const { user, session, logout } = useAuth()

  useEffect(() => {
    if (!session) {
      const router = useRouter()
      router.replace('/admin/login')
    }
  }, [session])

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Header */}
        <header className="bg-orange-50 border-b border-neutral-200 px-6 py-3 lg:hidden">
          <div className="flex items-center gap-4">
            <Image src="/logo.svg" alt="Southwood" width={30} height={30} className="blur-lg" />
            <span className="font-bold text-orange-600">Southwood Dialysis</span>
            <button
              onClick={() => session ? session.collapsed ? 'show' : 'hide' : ''}
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 5v14l14-7L9 5z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Top Bar */}
        <div className="bg-white border-b border-neutral-200 lg:block px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/logo.svg" alt="Southwood" width={30} height={30} className="blur-lg" />
              <span className="font-bold text-orange-600">Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-600 text-sm">
                {user.name || 'Super Admin'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="px-3 py-1.5 text-sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:w-full overflow-x-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}