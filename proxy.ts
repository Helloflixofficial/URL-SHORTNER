import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const role = (session.user as { role?: string }).role
    if (role !== 'admin' && role !== 'owner') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Member dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/links') || pathname.startsWith('/campaigns') || pathname.startsWith('/withdrawals') || pathname.startsWith('/invoices') || pathname.startsWith('/settings')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === '/login' || pathname === '/register') && session?.user) {
    const role = (session.user as { role?: string }).role
    if (role === 'admin' || role === 'owner') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/links/:path*',
    '/campaigns/:path*',
    '/withdrawals/:path*',
    '/invoices/:path*',
    '/settings/:path*',
    '/login',
    '/register',
  ],
}
