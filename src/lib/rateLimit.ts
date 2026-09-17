import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRecord {
  timestamps: number[]
}

interface RateLimitConfig {
  limit: number
  windowMs: number // in milliseconds
}

// In-memory sliding-window store
const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodically clean up entries with no timestamps in the current window (every 2 minutes)
const CLEANUP_INTERVAL_MS = 2 * 60 * 1000
let lastCleanup = Date.now()

function cleanupStore(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  const oldestAllowed = now - windowMs
  rateLimitStore.forEach((record, key) => {
    const valid = record.timestamps.filter((ts: number) => ts > oldestAllowed)
    if (valid.length === 0) {
      rateLimitStore.delete(key)
    } else {
      record.timestamps = valid
    }
  })
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number // Epoch time in seconds
  retryAfter: number // Seconds to wait
}

/**
 * Extracts a client IP from request headers or socket
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }
  return '127.0.0.1'
}

/**
 * Core sliding-window rate limit checker
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const { limit, windowMs } = config
  const now = Date.now()
  cleanupStore(windowMs)

  const record = rateLimitStore.get(key) || { timestamps: [] }
  const windowStart = now - windowMs

  // Keep only timestamps within the sliding window
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart)
  const remaining = Math.max(0, limit - activeTimestamps.length)
  const oldestInWindow = activeTimestamps[0] || now
  const resetEpoch = Math.ceil((oldestInWindow + windowMs) / 1000)
  const retryAfter = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000))

  if (activeTimestamps.length >= limit) {
    rateLimitStore.set(key, { timestamps: activeTimestamps })
    return {
      allowed: false,
      limit,
      remaining: 0,
      reset: resetEpoch,
      retryAfter,
    }
  }

  // Record this request
  activeTimestamps.push(now)
  rateLimitStore.set(key, { timestamps: activeTimestamps })

  return {
    allowed: true,
    limit,
    remaining: limit - activeTimestamps.length,
    reset: resetEpoch,
    retryAfter: 0,
  }
}

// Preset configurations
export const RATE_LIMIT_CONFIGS = {
  auth: { limit: 5, windowMs: 60 * 1000 },       // 5 requests per minute
  ai: { limit: 10, windowMs: 60 * 1000 },         // 10 requests per minute
  admin: { limit: 30, windowMs: 60 * 1000 },      // 30 requests per minute
  api: { limit: 100, windowMs: 60 * 1000 },       // 100 requests per minute
  strict: { limit: 3, windowMs: 60 * 1000 },      // 3 requests per minute (e.g. password resets)
} as const

/**
 * Helper to enforce rate limiting on an incoming NextRequest.
 * If exceeded, returns a ready-to-return 429 NextResponse.
 * If allowed, returns null.
 */
export function rateLimit(
  req: NextRequest,
  type: keyof typeof RATE_LIMIT_CONFIGS = 'api',
  customKey?: string
): NextResponse | null {
  const ip = getClientIp(req)
  const key = customKey ? `${type}:${customKey}` : `${type}:${ip}`
  const config = RATE_LIMIT_CONFIGS[type] || RATE_LIMIT_CONFIGS.api

  const result = checkRateLimit(key, config)

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please wait ${result.retryAfter} seconds before retrying.`,
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.reset),
        },
      }
    )
  }

  return null
}
