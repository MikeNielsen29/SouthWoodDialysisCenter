import { NextResponse } from 'next/server'
import { guardRole } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'
import { logAdminAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await guardRole(['Super Admin', 'Admin'], '/admin')
  if (guard instanceof NextResponse) return guard

  if (!process.env.GS_WEBAPP_URL?.trim()) {
    return NextResponse.json({ shifts: [] })
  }

  try {
    const rows = await callSheets('shifts.list', {})
    return NextResponse.json({ shifts: Array.isArray(rows) ? rows : [] })
  } catch {
    return NextResponse.json({ shifts: [] })
  }
}

export async function POST(request: Request) {
  const guard = await guardRole(['Super Admin', 'Admin'], '/admin')
  if (guard instanceof NextResponse) return guard

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const staffCn = String(body?.staff_cn ?? '').trim()
  const startsAt = String(body?.starts_at ?? '').trim()
  const endsAt = String(body?.ends_at ?? '').trim()
  const station = String(body?.station ?? '').trim()

  if (!staffCn || !startsAt || !endsAt || endsAt <= startsAt) {
    return NextResponse.json({ error: 'Pick a staff member and a valid time range' }, { status: 400 })
  }

  try {
    const created = await callSheets<{ id?: string }>('shifts.create', {
      staff_cn: staffCn,
      starts_at: startsAt,
      ends_at: endsAt,
      station,
    })
    await logAdminAction(guard, 'shifts.created', 'shift', String(created?.id ?? staffCn), {
      starts_at: startsAt,
      ends_at: endsAt,
      station,
    })
    return NextResponse.json({ ok: true, id: created?.id ?? null })
  } catch {
    return NextResponse.json({ error: 'Could not create the shift' }, { status: 502 })
  }
}
