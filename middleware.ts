import { NextResponse } from 'next/server'

const publicPages = ['/login', '/register', '/']
const protectedPages = ['/portal', '/admin']

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

// Middleware to protect routes and enforce role-based access
export function middleware(request) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl
  const isLoggedIn = request.cookies.get('session')?.value
  const userRole = request.cookies.get('userRole')?.value

  // Redirect logged-in users away from auth pages
  if (publicPages.some((page) => pathname.startsWith(page))) {
    if (isLoggedIn) {
      if (pathname === '/login' || pathname === '/register') {
        const redirectUrl = pathname === '/login' ? '/portal' : '/'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
    return response
  }

  // Protect admin and portal routes
  if (protectedPages.some((page) => pathname.startsWith(page))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based access control
    if (pathname.startsWith('/admin') && userRole !== 'Super Admin') {
      const portalUrl = new URL('/portal', request.url)
      return NextResponse.redirect(portalUrl)
    }

    if (pathname.startsWith('/portal') && !['Patient', 'Admin'].includes(userRole)) {
      const adminUrl = new URL('/admin', request.url)
      return NextResponse.redirect(adminUrl)
    }
  }

  return response
}
