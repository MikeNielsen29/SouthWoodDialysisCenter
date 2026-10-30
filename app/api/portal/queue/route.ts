import { NextResponse } from 'next/server'
import { guardRole } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await guardRole(['Super Admin', 'Admin'], '/admin')
  if (guard instanceof NextResponse) return guard
  if (!process.env.GS_WEBAPP_URL?.trim()) {
    return NextResponse.json({ entries: [] })
  }
  try {
    const entries = await callSheets('queue.list', { limit: 50 })
    return NextResponse.json({ entries: Array.isArray(entries) ? entries : [] })
  } catch {
    return NextResponse.json({ entries: [] })
  }
}
