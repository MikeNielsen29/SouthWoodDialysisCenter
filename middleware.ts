import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/auth/jwt'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value
  const isAuth = await verifySession(session ?? '')

  const protectedPaths = ['/admin', '/portal']
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtected && !isAuth) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
}

export const runtime = 'nodejs'
