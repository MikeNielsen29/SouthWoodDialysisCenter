import { NextResponse } from 'next/server'
import { guardRole } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'

export const dynamic = 'force-dynamic'

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
