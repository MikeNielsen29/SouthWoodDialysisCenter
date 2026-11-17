import { NextResponse } from 'next/server'
import { guardRole } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'
import { logAdminAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const STATUSES = ['Unpaid', 'Paid', 'Partial', 'Void']

export async function GET() {
  const guard = await guardRole(['Super Admin', 'Admin'], '/admin')
  if (guard instanceof NextResponse) return guard

  if (!process.env.GS_WEBAPP_URL?.trim()) {
    return NextResponse.json({ records: [] })
  }

  try {
    const rows = await callSheets('billing.list', {})
    return NextResponse.json({ records: Array.isArray(rows) ? rows : [] })
  } catch {
    return NextResponse.json({ records: [] })
  }
}

export async function POST(request: Request) {
  const guard = await guardRole(['Super Admin', 'Admin'], '/admin')
  if (guard instanceof NextResponse) return guard

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const id = String(body?.id ?? '').trim()
  const status = String(body?.status ?? '').trim()

  if (!id || !STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid billing update' }, { status: 400 })
  }

  try {
    await callSheets('billing.update', { id, status })
    await logAdminAction(guard, 'billing.updated', 'billing', id, { status })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not update the invoice' }, { status: 502 })
  }
}
