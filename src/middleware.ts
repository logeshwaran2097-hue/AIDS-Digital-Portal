import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const DEFAULT_SECRET = 'your-super-secret-key-change-in-production-min-32-chars'
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || DEFAULT_SECRET
)

// In-memory sliding-window rate limit store for middleware
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_AUTH_REQUESTS_PER_MIN = 8
const MAX_API_REQUESTS_PER_MIN = 120

function isRateLimited(ip: string, isAuth: boolean): { limited: boolean; retryAfter: number } {
  const now = Date.now()
  const key = isAuth ? `auth:${ip}` : `api:${ip}`
  const limit = isAuth ? MAX_AUTH_REQUESTS_PER_MIN : MAX_API_REQUESTS_PER_MIN

  const timestamps = rateLimitMap.get(key) || []
  const validTimestamps = timestamps.filter((t) => t > now - RATE_LIMIT_WINDOW_MS)

  if (validTimestamps.length >= limit) {
    const oldestInWindow = validTimestamps[0] || now
    const retryAfter = Math.max(1, Math.ceil((oldestInWindow + RATE_LIMIT_WINDOW_MS - now) / 1000))
    rateLimitMap.set(key, validTimestamps)
    return { limited: true, retryAfter }
  }

  validTimestamps.push(now)
  rateLimitMap.set(key, validTimestamps)
  return { limited: false, retryAfter: 0 }
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    '127.0.0.1'
  )
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Defensive HTTP Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIp(request)

  // 1. Skip static assets, Next.js internal paths, and service workers
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/sw') ||
    pathname.startsWith('/workbox') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

  // 2. Global Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
    const isAuthRoute = pathname.startsWith('/api/auth/')
    const { limited, retryAfter } = isRateLimited(ip, isAuthRoute)

    if (limited) {
      const rateLimitResponse = NextResponse.json(
        {
          success: false,
          error: 'Too Many Requests',
          message: `Too many requests from this IP. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
      return addSecurityHeaders(rateLimitResponse)
    }
  }

  // 3. Verify Session JWT Token from cookies
  const token = request.cookies.get('auth-token')?.value
  let user: { role: string; userId: string; email: string } | null = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      user = payload as unknown as { role: string; userId: string; email: string }
    } catch {
      user = null
    }
  }

  // 4. Role-Based Access Control (RBAC) Route Guards

  // A. Admin Portal & APIs (/admin/* and /api/admin/*)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Allow admin login page
    if (pathname === '/admin/login') {
      if (user && (user.role === 'admin' || user.role === 'super_admin')) {
        return addSecurityHeaders(NextResponse.redirect(new URL('/admin/dashboard', request.url)))
      }
      return addSecurityHeaders(NextResponse.next())
    }

    // Require admin / super_admin role
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      if (pathname.startsWith('/api/admin')) {
        return addSecurityHeaders(
          NextResponse.json(
            { success: false, error: 'Unauthorized. Administrator access required.' },
            { status: 401 }
          )
        )
      }
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return addSecurityHeaders(NextResponse.redirect(loginUrl))
    }
  }

  // B. HOD Dashboard & APIs (/hod-dashboard/* and /api/hod/*)
  if (pathname.startsWith('/hod-dashboard') || pathname.startsWith('/api/hod')) {
    if (!user || (user.role !== 'hod' && user.role !== 'admin' && user.role !== 'super_admin')) {
      if (pathname.startsWith('/api/')) {
        return addSecurityHeaders(
          NextResponse.json(
            { success: false, error: 'Unauthorized. Head of Department access required.' },
            { status: 401 }
          )
        )
      }
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('role', 'hod')
      loginUrl.searchParams.set('callbackUrl', pathname)
      return addSecurityHeaders(NextResponse.redirect(loginUrl))
    }
  }

  // C. Faculty Dashboard & APIs (/faculty-dashboard/* and /api/faculty/*)
  if (pathname.startsWith('/faculty-dashboard') || pathname.startsWith('/api/faculty')) {
    const isFacultyAuthorized =
      user &&
      ['faculty', 'advisor', 'hod', 'admin', 'super_admin'].includes(user.role)

    if (!isFacultyAuthorized) {
      if (pathname.startsWith('/api/')) {
        return addSecurityHeaders(
          NextResponse.json(
            { success: false, error: 'Unauthorized. Faculty access required.' },
            { status: 401 }
          )
        )
      }
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('role', 'faculty')
      loginUrl.searchParams.set('callbackUrl', pathname)
      return addSecurityHeaders(NextResponse.redirect(loginUrl))
    }
  }

  // D. Student Dashboard (/dashboard/*)
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('role', 'student')
      loginUrl.searchParams.set('callbackUrl', pathname)
      return addSecurityHeaders(NextResponse.redirect(loginUrl))
    }
  }

  // E. Redirect authenticated users away from /login if already logged in
  if (pathname === '/login') {
    if (user) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        return addSecurityHeaders(NextResponse.redirect(new URL('/admin/dashboard', request.url)))
      }
      if (user.role === 'hod') {
        return addSecurityHeaders(NextResponse.redirect(new URL('/hod-dashboard', request.url)))
      }
      if (user.role === 'faculty' || user.role === 'advisor') {
        return addSecurityHeaders(NextResponse.redirect(new URL('/faculty-dashboard', request.url)))
      }
      if (user.role === 'student') {
        return addSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
      }
    }
  }

  // 5. Proceed with security headers applied to all responses
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
