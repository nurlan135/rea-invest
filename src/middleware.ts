import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin səhifələri yoxlayın
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // API route-ları üçün rate limiting (optional)
    if (pathname.startsWith('/api/')) {
      // Rate limiting logic buraya əlavə edilə bilər
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/properties/:path*',
    '/transactions/:path*',
    '/agents/:path*',
    '/customers/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/api/properties/:path*',
    '/api/transactions/:path*',
    '/api/contacts/:path*',
    '/api/analytics/:path*',
    '/api/export/:path*',
    '/api/admin/:path*'
  ]
}