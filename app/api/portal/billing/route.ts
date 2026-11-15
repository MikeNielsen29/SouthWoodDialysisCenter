import { NextResponse } from 'next/server'
import { guardRole } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await guardRole(['Super Admin', 'Admin'], '/admin')
  if (guard instanceof NextResponse) return guard
  if (!process.env.GS_WEBAPP_URL?.trim()) {
    return NextResponse.json({ records: [] })
  }
  try {
    const records = await callSheets('billing.list', { limit: 50 })
    return NextResponse.json({ records: Array.isArray(records) ? records : [] })
  } catch {
    return NextResponse.json({ records: [] })
  }
}
