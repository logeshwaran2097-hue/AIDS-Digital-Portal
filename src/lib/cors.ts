import { NextRequest, NextResponse } from 'next/server'

/**
 * Returns list of allowed origins based on environment and request host
 */
export function getAllowedOrigins(requestHost?: string | null): string[] {
  const configured = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  const allowed = new Set<string>(configured)

  // In production, allow own host origin if host is present
  if (requestHost) {
    allowed.add(`https://${requestHost}`)
    if (process.env.NODE_ENV !== 'production') {
      allowed.add(`http://${requestHost}`)
    }
  }

  // Development defaults
  if (process.env.NODE_ENV !== 'production') {
    allowed.add('http://localhost:3000')
    allowed.add('http://localhost:3001')
    allowed.add('http://127.0.0.1:3000')
    allowed.add('http://127.0.0.1:3001')
  }

  return Array.from(allowed)
}

/**
 * Checks whether an incoming origin header is authorized
 */
export function isOriginAllowed(origin: string | null, requestHost?: string | null): boolean {
  if (!origin) return true // Same-origin direct requests don't always have Origin header

  const allowedList = getAllowedOrigins(requestHost)
  return allowedList.includes(origin)
}

/**
 * Applies strict CORS headers to a response. Never uses wildcard '*' on API responses.
 */
export function applyCorsHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (origin && isOriginAllowed(origin, host)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range'
    )
    response.headers.set('Access-Control-Max-Age', '86400')
    response.headers.set('Vary', 'Origin')
  }

  return response
}

/**
 * Handles CORS OPTIONS preflight requests
 */
export function handleCorsPreflight(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (origin && isOriginAllowed(origin, host)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
      },
    })
  }

  return new NextResponse(null, { status: 403 })
}
