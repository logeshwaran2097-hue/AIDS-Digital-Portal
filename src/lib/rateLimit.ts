import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'

export interface RateLimitConfig {
  endpoint: string
  limit?: number
  maxRequests?: number
  windowSeconds: number
  identifier?: string // user ID, email, account, or register number
}

export interface RateLimitOptions {
  windowSeconds: number
  maxRequests: number
  keyPrefix: string
}

export interface RateLimitResult {
  allowed: boolean
  success: boolean
  limit: number
  remaining: number
  reset: number // epoch ms
  resetInSeconds: number // seconds until reset
  retryAfter: number // seconds until reset
  type: 'ip' | 'user'
  identifier: string
}

/**
 * Robust Client IP Extraction for serverless & reverse proxy environments.
 * Checks x-forwarded-for, cf-connecting-ip, x-real-ip.
 */
export function getClientIp(req: Request | NextRequest): string {
  if (!req || !req.headers) return '127.0.0.1'

  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim()
    if (firstIp) return firstIp
  }

  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  if (cfConnectingIp?.trim()) return cfConnectingIp.trim()

  const realIp = req.headers.get('x-real-ip')
  if (realIp?.trim()) return realIp.trim()

  return '127.0.0.1'
}

/**
 * Upstash Redis / Redis REST API integration if configured.
 */
async function checkUpstashRedis(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ count: number; ttl: number } | null> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!upstashUrl || !upstashToken) return null

  try {
    const response = await fetch(`${upstashUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, windowSeconds, 'NX'],
        ['TTL', key],
      ]),
    })

    if (!response.ok) return null
    const data = await response.json()
    const count = data[0]?.result || 1
    const ttl = data[2]?.result || windowSeconds
    return { count, ttl }
  } catch (err) {
    console.warn('[RateLimit] Upstash Redis check error, falling back to DB:', err)
    return null
  }
}

/**
 * Shared PostgreSQL / Prisma Rate Limiting Store.
 * Coordinates rate limiting state across distributed serverless lambdas.
 */
async function checkDatabaseStore(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ count: number; ttl: number }> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000)

  try {
    const existing = await prisma.rateLimit.findUnique({
      where: { key },
    })

    if (!existing || existing.expiresAt <= now) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          expiresAt,
        },
        update: {
          count: 1,
          expiresAt,
        },
      })
      return { count: 1, ttl: windowSeconds }
    }

    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        count: { increment: 1 },
      },
    })

    const remainingTtlSeconds = Math.max(
      1,
      Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000)
    )

    return { count: updated.count, ttl: remainingTtlSeconds }
  } catch (err) {
    // If DB has temporary query collision, fallback gracefully
    return { count: 1, ttl: windowSeconds }
  }
}

/**
 * Log repeated rate limit violations directly to security AuditLog.
 */
export async function logSecurityViolation(params: {
  endpoint: string
  ip: string
  identifier?: string
  limit: number
  windowSeconds: number
  violationCount: number
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userName: params.identifier || `IP:${params.ip}`,
        action: 'RATE_LIMIT_EXCEEDED',
        module: 'SECURITY',
        ipAddress: params.ip,
        details: JSON.stringify({
          endpoint: params.endpoint,
          limit: params.limit,
          windowSeconds: params.windowSeconds,
          violationCount: params.violationCount,
          severity: params.violationCount > 3 ? 'HIGH' : 'MEDIUM',
        }),
        status: 'blocked',
      },
    })
  } catch (err) {
    console.error('[RateLimit] Failed to record security violation log:', err)
  }
}

async function handleViolation(
  key: string,
  endpoint: string,
  ip: string,
  identifier: string | undefined,
  limit: number,
  windowSeconds: number
) {
  try {
    const violationKey = `viol:${key}`
    const violationData = await checkDatabaseStore(violationKey, 999999, 3600) // 1 hr window
    if (violationData.count >= 1) {
      await logSecurityViolation({
        endpoint,
        ip,
        identifier,
        limit,
        windowSeconds,
        violationCount: violationData.count,
      })
    }
  } catch {
    // non-fatal
  }
}

/**
 * Core Rate Limiter:
 * Evaluates BOTH client IP and user/account identifier.
 * Works across serverless instances using PostgreSQL / Upstash Redis.
 */
export async function checkRateLimit(
  reqOrKey: Request | NextRequest | string,
  optionsOrLimit: number | RateLimitConfig | RateLimitOptions,
  windowSecondsArg?: number,
  prefixArg?: string,
  identifierArg?: string
): Promise<RateLimitResult> {
  let endpoint = 'global'
  let limit = 10
  let windowSeconds = 60
  let identifier: string | undefined = identifierArg
  let clientIp = '127.0.0.1'

  if (typeof reqOrKey === 'object' && reqOrKey !== null && 'headers' in reqOrKey) {
    clientIp = getClientIp(reqOrKey)

    if (typeof optionsOrLimit === 'object') {
      const cfg = optionsOrLimit as RateLimitConfig
      endpoint = cfg.endpoint
      limit = cfg.limit || (optionsOrLimit as any).maxRequests || 10
      windowSeconds = cfg.windowSeconds || 60
      identifier = cfg.identifier || identifier
    } else if (typeof optionsOrLimit === 'number') {
      limit = optionsOrLimit
      windowSeconds = windowSecondsArg || 60
      endpoint = prefixArg || 'api'
    }
  } else if (typeof reqOrKey === 'string') {
    clientIp = reqOrKey
    if (typeof optionsOrLimit === 'object') {
      const opt = optionsOrLimit as RateLimitOptions
      endpoint = opt.keyPrefix || 'api'
      limit = opt.maxRequests || 10
      windowSeconds = opt.windowSeconds || 60
    }
  }

  const now = Date.now()

  // 1. Evaluate Client IP Limit
  const ipKey = `rl:ip:${endpoint}:${clientIp}`
  let ipData = await checkUpstashRedis(ipKey, limit, windowSeconds)
  if (!ipData) {
    ipData = await checkDatabaseStore(ipKey, limit, windowSeconds)
  }

  if (ipData.count > limit) {
    await handleViolation(ipKey, endpoint, clientIp, identifier, limit, windowSeconds)

    return {
      allowed: false,
      success: false,
      limit,
      remaining: 0,
      reset: now + ipData.ttl * 1000,
      resetInSeconds: ipData.ttl,
      retryAfter: ipData.ttl,
      type: 'ip',
      identifier: clientIp,
    }
  }

  // 2. Evaluate User / Account Limit (if identifier provided)
  if (identifier && identifier.trim() !== '') {
    const userKey = `rl:usr:${endpoint}:${identifier.trim().toLowerCase()}`
    let userData = await checkUpstashRedis(userKey, limit, windowSeconds)
    if (!userData) {
      userData = await checkDatabaseStore(userKey, limit, windowSeconds)
    }

    if (userData.count > limit) {
      await handleViolation(userKey, endpoint, clientIp, identifier, limit, windowSeconds)

      return {
        allowed: false,
        success: false,
        limit,
        remaining: 0,
        reset: now + userData.ttl * 1000,
        resetInSeconds: userData.ttl,
        retryAfter: userData.ttl,
        type: 'user',
        identifier,
      }
    }
  }

  const remaining = Math.max(0, limit - ipData.count)
  return {
    allowed: true,
    success: true,
    limit,
    remaining,
    reset: now + ipData.ttl * 1000,
    resetInSeconds: ipData.ttl,
    retryAfter: 0,
    type: 'ip',
    identifier: clientIp,
  }
}

/**
 * Standard HTTP 429 JSON Response with Retry-After and X-RateLimit-* headers.
 */
export function rateLimitResponse(
  rateLimitOrMessage?: any,
  resetInSecondsArg?: number
): NextResponse {
  let message = 'Too many requests. Please try again later.'
  let retryAfter = 60
  let limit = 5

  if (typeof rateLimitOrMessage === 'object' && rateLimitOrMessage !== null) {
    retryAfter = rateLimitOrMessage.retryAfter || rateLimitOrMessage.resetInSeconds || 60
    limit = rateLimitOrMessage.limit || 5
    const typeLabel = rateLimitOrMessage.type === 'user' ? 'this account' : 'your IP address'
    message = `Rate limit exceeded for ${typeLabel}. Please try again in ${retryAfter} seconds.`
  } else if (typeof rateLimitOrMessage === 'string') {
    message = rateLimitOrMessage
    if (typeof resetInSecondsArg === 'number') {
      retryAfter = resetInSecondsArg
    }
  }

  const res = NextResponse.json(
    {
      success: false,
      error: 'Too Many Requests',
      message,
      retryAfter,
      retryAfterSeconds: retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil((Date.now() + retryAfter * 1000) / 1000)),
      },
    }
  )

  return res
}

export const rateLimitExceededResponse = rateLimitResponse

/**
 * Hard Monthly Spend Cap & Quota Manager for Paid APIs (AI, SMS, Email).
 */
export type PaidService = 'gemini_ai' | 'sms' | 'email'

const DEFAULT_MONTHLY_CAPS: Record<PaidService, number> = {
  gemini_ai: 2000, // 2,000 queries per month
  sms: 500,        // 500 SMS / WhatsApp dispatches per month
  email: 2500,     // 2,500 outgoing emails per month
}

export async function checkApiUsageQuota(
  service: PaidService,
  units: number = 1,
  limitOverride?: number
): Promise<{ allowed: boolean; usedCount: number; hardLimit: number; period: string }> {
  const period = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  let configuredLimit = limitOverride || DEFAULT_MONTHLY_CAPS[service]
  if (!limitOverride) {
    if (service === 'gemini_ai' && process.env.MONTHLY_AI_BUDGET_CAP) {
      configuredLimit = parseInt(process.env.MONTHLY_AI_BUDGET_CAP) || configuredLimit
    } else if (service === 'sms' && process.env.MONTHLY_SMS_BUDGET_CAP) {
      configuredLimit = parseInt(process.env.MONTHLY_SMS_BUDGET_CAP) || configuredLimit
    } else if (service === 'email' && process.env.MONTHLY_EMAIL_BUDGET_CAP) {
      configuredLimit = parseInt(process.env.MONTHLY_EMAIL_BUDGET_CAP) || configuredLimit
    }
  }

  try {
    const existing = await prisma.apiUsageQuota.findUnique({
      where: {
        service_period: {
          service,
          period,
        },
      },
    })

    const effectiveLimit = limitOverride !== undefined
      ? limitOverride
      : (existing ? existing.hardLimit : configuredLimit)

    const record = await prisma.apiUsageQuota.upsert({
      where: {
        service_period: {
          service,
          period,
        },
      },
      create: {
        service,
        period,
        usedCount: units,
        hardLimit: effectiveLimit,
      },
      update: {
        usedCount: { increment: units },
        ...(limitOverride !== undefined ? { hardLimit: limitOverride } : {}),
      },
    })

    if (record.usedCount > record.hardLimit) {
      await prisma.auditLog.create({
        data: {
          userName: 'SYSTEM',
          action: 'API_QUOTA_EXCEEDED',
          module: 'BILLING',
          details: `Hard monthly spending quota reached for [${service}] in period ${period}. Used: ${record.usedCount}/${record.hardLimit}`,
          status: 'blocked',
        },
      }).catch(() => {})

      return {
        allowed: false,
        usedCount: record.usedCount,
        hardLimit: record.hardLimit,
        period,
      }
    }

    return {
      allowed: true,
      usedCount: record.usedCount,
      hardLimit: record.hardLimit,
      period,
    }
  } catch (err) {
    console.error('[RateLimit] Error checking API usage quota:', err)
    return {
      allowed: true,
      usedCount: 0,
      hardLimit: configuredLimit,
      period,
    }
  }
}

/**
 * Standard HTTP 429 Quota Exceeded Response for Paid APIs.
 */
export function quotaExceededResponse(
  service: PaidService,
  hardLimit: number,
  period: string
): NextResponse {
  const serviceNames: Record<PaidService, string> = {
    gemini_ai: 'AI Assistant (Google Gemini)',
    sms: 'SMS / WhatsApp Carrier Gateway',
    email: 'Transactional Email Service',
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Monthly Quota Exceeded',
      message: `The hard monthly quota for ${serviceNames[service]} (${hardLimit} requests in ${period}) has been reached. Operations are temporarily paused to prevent unexpected costs.`,
      service,
      period,
      hardLimit,
    },
    {
      status: 429,
      headers: {
        'Retry-After': '86400',
        'X-RateLimit-Limit': String(hardLimit),
        'X-RateLimit-Remaining': '0',
      },
    }
  )
}
