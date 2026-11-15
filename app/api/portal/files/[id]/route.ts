import { NextResponse } from 'next/server'
import { guardUser } from '@/lib/auth/session'
import { callSheets } from '@/lib/sheets/client'
import { readPatientFile, type PatientFileRow } from '@/lib/patient-files'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await guardUser('/portal/files')
  if (guard instanceof NextResponse) return guard
  const session = guard

  if (!process.env.GS_WEBAPP_URL?.trim()) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
  }

  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing file id' }, { status: 400 })

  try {
    const file = (await callSheets('files.get', { id })) as PatientFileRow | null
    if (!file || file.patient_cn !== session.cn) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    if (file.status !== 'Released') {
      return NextResponse.json({ error: 'File not released' }, { status: 403 })
    }
    if (!file.vault_file_id) {
      return NextResponse.json({ error: 'No file attached' }, { status: 500 })
    }

    const buffer = await readPatientFile(file)
    if (!buffer) {
      return NextResponse.json({ error: 'Download failed' }, { status: 500 })
    }

    const filename = `${file.title || 'file'}`.replace(/[^\w.\- ]+/g, '_')
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'content-type': file.mime || 'application/octet-stream',
        'content-disposition': `attachment; filename="${filename}"`,
        'content-length': String(buffer.length),
        'cache-control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
