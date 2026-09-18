import { NextResponse } from 'next/server'
import { prisma } from './prisma'

export interface SecurityEventData {
  type: 'AUTH_FAILED' | 'ACCESS_DENIED' | 'RATE_LIMIT' | 'SERVER_ERROR' | 'SUSPICIOUS_ACTIVITY'
  action: string
  module: 'AUTH' | 'AUTHZ' | 'SECURITY' | 'SYSTEM' | 'GATEWAY'
  userName?: string
  ipAddress?: string
  details?: Record<string, any> | string
  status?: 'failure' | 'error' | 'warning'
}

/**
 * Centrally logs security events to stdout (with structured [SECURITY_EVENT] tag for log drains)
 * and asynchronously records an entry in the database AuditLog table.
 */
export async function logSecurityEvent(event: SecurityEventData): Promise<void> {
  const timestamp = new Date().toISOString()
  const detailString =
    typeof event.details === 'string'
      ? event.details
      : event.details
      ? JSON.stringify(event.details)
      : null

  // Structured log for cloud providers (Render, CloudWatch, Datadog, etc.)
  console.warn(
    `[SECURITY_EVENT] [${timestamp}] [${event.type}] [${event.action}] IP=${event.ipAddress || 'unknown'} User=${event.userName || 'anonymous'} Module=${event.module} - ${detailString || ''}`
  )

  try {
    await prisma.auditLog.create({
      data: {
        userName: event.userName || (event.ipAddress ? `IP:${event.ipAddress}` : 'Anonymous'),
        action: event.action,
        module: event.module,
        ipAddress: event.ipAddress || null,
        details: detailString,
        status: event.status || 'failure',
      },
    })
  } catch (err) {
    // Fail silently without blocking request pipeline if database is under heavy load
    console.error('[SECURITY_LOGGER_ERROR] Failed to persist audit log to database:', err)
  }
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(params: {
  role: string
  identifier: string
  ip: string
  userAgent?: string
  reason?: string
}): Promise<void> {
  await logSecurityEvent({
    type: 'AUTH_FAILED',
    action: `LOGIN_FAILED_${params.role.toUpperCase()}`,
    module: 'AUTH',
    userName: params.identifier,
    ipAddress: params.ip,
    status: 'failure',
    details: {
      role: params.role,
      identifier: params.identifier,
      reason: params.reason || 'Invalid credentials',
      userAgent: params.userAgent || 'unknown',
    },
  })
}

/**
 * Log 403 Forbidden / Authorization failure
 */
export async function logForbiddenAccess(params: {
  path: string
  ip: string
  role?: string
  userId?: string
  userName?: string
  reason?: string
}): Promise<void> {
  await logSecurityEvent({
    type: 'ACCESS_DENIED',
    action: 'FORBIDDEN_403',
    module: 'AUTHZ',
    userName: params.userName || params.userId,
    ipAddress: params.ip,
    status: 'failure',
    details: {
      path: params.path,
      attemptedRole: params.role || 'unauthenticated',
      reason: params.reason || 'Insufficient permissions',
    },
  })
}

/**
 * Safe production error response generator.
 * Hides stack traces and database internal messages from end users while logging details server-side.
 */
export function safeErrorResponse(
  error: unknown,
  fallbackMessage = 'An unexpected internal error occurred. Please try again later.',
  status = 500,
  context?: { path?: string; method?: string; ip?: string }
): NextResponse {
  const isProd = process.env.NODE_ENV === 'production'
  const errMessage = error instanceof Error ? error.message : String(error)
  const errStack = error instanceof Error ? error.stack : undefined

  // Always log complete error with stack trace server-side
  console.error(
    `[SERVER_ERROR_500] ${context?.method || 'REQ'} ${context?.path || 'unknown'} - ${errMessage}`,
    errStack || ''
  )

  // Asynchronously record server exception in AuditLog
  logSecurityEvent({
    type: 'SERVER_ERROR',
    action: 'INTERNAL_SERVER_ERROR_500',
    module: 'SYSTEM',
    ipAddress: context?.ip,
    status: 'error',
    details: {
      path: context?.path,
      method: context?.method,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: errMessage,
    },
  }).catch(() => {})

  // Return sanitized response to client (never expose raw error or stack trace in production)
  return NextResponse.json(
    {
      success: false,
      message: isProd ? fallbackMessage : (errMessage || fallbackMessage),
    },
    { status }
  )
}
