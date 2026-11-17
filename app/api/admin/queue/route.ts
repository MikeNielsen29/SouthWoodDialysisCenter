import { NextResponse } from 'next/server'
import { guardRole } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'
import { logAdminAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const STATES = ['Waiting', 'Ongoing', 'Completed']

export async function GET() {
  const guard = await guardRole(['Super Admin', 'Admin'], '/admin')
  if (guard instanceof NextResponse) return guard

  if (!process.env.GS_WEBAPP_URL?.trim()) {
    return NextResponse.json({ entries: [] })
  }

  try {
    const rows = await callSheets('queue.list', {})
    return NextResponse.json({ entries: Array.isArray(rows) ? rows : [] })
  } catch {
    return NextResponse.json({ entries: [] })
  }
}

export async function POST(request: Request) {
  const guard = await guardRole(['Super Admin', 'Admin'], '/admin')
  if (guard instanceof NextResponse) return guard

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const id = String(body?.id ?? '').trim()
  const state = String(body?.state ?? '').trim()

  if (!id || !STATES.includes(state)) {
    return NextResponse.json({ error: 'Invalid queue update' }, { status: 400 })
  }

  try {
    await callSheets('queue.update', { id, state })
    await logAdminAction(guard, 'queue.updated', 'queue', id, { state })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not update the queue' }, { status: 502 })
  }
}
