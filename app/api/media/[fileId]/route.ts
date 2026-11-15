import { NextResponse } from 'next/server'
import { fetchMedia } from '@/lib/media'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Public image proxy. The browser asks for /api/media/<vault_file_id> and
 * this route fetches the bytes with the bot token, which stays on the server.
 */
export async function GET(
  _request: Request,
  { params }: { params: { fileId: string } }
) {
  const fileId = decodeURIComponent(params.fileId ?? '')
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(fileId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const media = await fetchMedia(fileId)
    if (!media) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return new NextResponse(new Uint8Array(media.buffer), {
      headers: {
        'content-type': media.mime,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
