import { NextRequest, NextResponse } from 'next/server'
import { isOriginAllowed, applyCorsHeaders, handleCorsPreflight } from './lib/cors'

// Paths blocked from public production access (Swagger, GraphQL playground, debug endpoints)
const BLOCKED_PATHS = [
  /^\/docs(\/.*)?$/i,
  /^\/swagger(\/.*)?$/i,
  /^\/swagger-ui(\/.*)?$/i,
  /^\/api-docs(\/.*)?$/i,
  /^\/graphql(\/.*)?$/i,
  /^\/graphiql(\/.*)?$/i,
  /^\/_debug(\/.*)?$/i,
  /^\/\.git(\/.*)?$/i,
  /^\/\.env(\..*)?$/i,
]

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const host = request.headers.get('host') || 'localhost'
  const isProd = process.env.NODE_ENV === 'production'

  // 1. Force HTTPS in production when behind reverse proxies (Render, Cloudflare, Vercel, AWS)
  const forwardedProto = request.headers.get('x-forwarded-proto')
  if (isProd && forwardedProto === 'http') {
    const httpsUrl = `https://${host}${pathname}${search}`
    return NextResponse.redirect(httpsUrl, 301)
  }

  // 2. Block sensitive/debug routes, API docs, and playgrounds
  for (const pattern of BLOCKED_PATHS) {
    if (pattern.test(pathname)) {
      return new NextResponse('Not Found', { status: 404 })
    }
  }

  // 3. Handle CORS Preflight for API requests
  if (pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    return handleCorsPreflight(request)
  }

  // 4. Admin route gate: if navigating to /admin pages without an auth cookie, redirect to /login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/api')) {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.cookies.get('__Secure-auth-token')?.value ||
      request.cookies.get('authToken')?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Continue request pipeline
  const response = NextResponse.next()

  // 5. Apply strict CORS headers on API endpoints
  if (pathname.startsWith('/api/')) {
    applyCorsHeaders(response, request)
  }

  // 6. Enforce production security headers on all responses
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), geolocation=(self), microphone=(), payment=(), usb=()'
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json, sw.js (PWA files)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
}
