import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRecord {
  count: number
  resetAt: number
}

interface RateLimitStore {
  records: Map<string, RateLimitRecord>
}

const globalForRateLimit = globalThis as unknown as {
  __rateLimitStore?: RateLimitStore
}

if (!globalForRateLimit.__rateLimitStore) {
  globalForRateLimit.__rateLimitStore = {
    records: new Map(),
  }
}

const store = globalForRateLimit.__rateLimitStore!

/**
 * Extract client IP address accurately from headers
 */
export function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',')
    if (ips[0]) return ips[0].trim()
  }
  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) return xRealIp.trim()
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp.trim()
  return '127.0.0.1'
}

export interface RateLimitOptions {
  windowSeconds: number
  maxRequests: number
  keyPrefix: string
}

/**
 * Checks rate limit for a given key.
 * Returns { allowed: boolean, remaining: number, resetInSeconds: number }
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now()
  const fullKey = `${options.keyPrefix}:${key}`
  const existing = store.records.get(fullKey)

  // Prune / reset expired entry
  if (!existing || now >= existing.resetAt) {
    store.records.set(fullKey, {
      count: 1,
      resetAt: now + options.windowSeconds * 1000,
    })
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetInSeconds: options.windowSeconds,
    }
  }

  // Increment count
  existing.count += 1
  const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))

  if (existing.count > options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    }
  }

  return {
    allowed: true,
    remaining: options.maxRequests - existing.count,
    resetInSeconds,
  }
}

/**
 * Creates a standard 429 Too Many Requests response with Retry-After header
 */
export function rateLimitResponse(
  message = 'Too many requests. Please try again later.',
  resetInSeconds = 60
): NextResponse {
  const res = NextResponse.json(
    {
      success: false,
      message,
      retryAfterSeconds: resetInSeconds,
    },
    { status: 429 }
  )
  res.headers.set('Retry-After', String(resetInSeconds))
  return res
}
