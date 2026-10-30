import { NextResponse } from 'next/server'
import { guardUser } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const guard = await guardUser('/portal/files')
  if (guard instanceof NextResponse) return guard
  const session = guard

  if (!process.env.GS_WEBAPP_URL?.trim()) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
  }

  try {const file = await callSheets('files.get', { id}) as { patient_cn?: string; status?: string; telegram_file_id?: string; title?: string; mime?: string } | null
    if (!file || file.patient_cn !== session.cn) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    if (file.status !== 'Released') {
      return NextResponse.json({ error: 'File not released' }, { status: 403 })
    }
    if (!file.telegram_file_id) {
      return NextResponse.json({ error: 'No file attached' }, { status: 500 })
    }

    const { downloadFile } = await import('@/lib/files/telegram')
    if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) {
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 503 })
    }

    const downloaded = await downloadFile(file.telegram_file_id)
    if (!downloaded) {
      return NextResponse.json({ error: 'Download failed' }, { status: 500 })
    }

    const buffer = Buffer.from(downloaded)
    return new NextResponse(buffer, {
      headers: {
        'content-type': file.mime || 'application/pdf',
        'content-disposition': `attachment; filename="${file.title || 'file'}.pdf"`,
        'content-length': String(buffer.length),
        'cache-control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
