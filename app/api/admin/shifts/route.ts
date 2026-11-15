import { NextResponse } from 'next/server'
import { guardRole } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'

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
