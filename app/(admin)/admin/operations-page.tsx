import { Empty } from '@/components/admin/ui'

export const dynamic = 'force-dynamic'

export default async function OperationsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-xl text-ink mb-2">Operations</h1>
      <p className="text-sm text-ink-muted mb-6">Manage appointments, queue, billing, and shifts.</p>
      <Empty description="Operations management is not wired yet." />
    </div>
  )
}
