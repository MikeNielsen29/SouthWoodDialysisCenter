import { NextResponse } from 'next/server'
import { guardRole } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'
import { logAdminAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const STATUSES = ['Requested', 'Confirmed', 'Completed', 'Cancelled', 'No-show']

export async function GET() {
  const guard = await guardRole(['Super Admin', 'Admin'], '/admin')
  if (guard instanceof NextResponse) return guard

  if (!process.env.GS_WEBAPP_URL?.trim()) {
    return NextResponse.json({ appointments: [] })
  }

  try {
    const rows = await callSheets('appointments.list', {})
    return NextResponse.json({ appointments: Array.isArray(rows) ? rows : [] })
  } catch {
    return NextResponse.json({ appointments: [] })
  }
}

export async function POST(request: Request) {
  const guard = await guardRole(['Super Admin', 'Admin'], '/admin')
  if (guard instanceof NextResponse) return guard

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const id = String(body?.id ?? '').trim()
  const status = String(body?.status ?? '').trim()
  const chair = body?.chair === undefined ? undefined : String(body.chair).trim()

  if (!id || (status && !STATUSES.includes(status))) {
    return NextResponse.json({ error: 'Invalid appointment update' }, { status: 400 })
  }

  try {
    await callSheets('appointments.update', {
      id,
      ...(status ? { status } : {}),
      ...(chair !== undefined ? { chair } : {}),
    })
    await logAdminAction(guard, 'appointments.updated', 'appointment', id, { status, chair })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not update the appointment' }, { status: 502 })
  }
}
