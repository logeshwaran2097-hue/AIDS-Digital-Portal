/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.5.0'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-18'

export const APP_RELEASE_HIGHLIGHTS = [
  'Production Deployment Hardening: Strict HSTS, nosniff, SAMEORIGIN, Permissions-Policy, and hardened Content-Security-Policy (CSP)',
  'Central Edge Security Middleware: Automatic HTTPS enforcement and sensitive route probe defense',
  'Domain-Restricted CORS Architecture: Zero wildcard allowance on authenticated API routes with origin whitelisting',
  'Strict Server-Side Zod Validation: Mass-assignment prevention with .strict() schemas across all API routes',
  'Real-Time Security Incident Telemetry: Structured monitoring of 401 failed logins, 403 forbidden access, 429 rate limits, and 500 server errors',
  'Production Error Masking: Server-side stack trace logging with sanitized, safe client error boundaries',
  'Profile Media Lifecycle: Instant one-click profile photo removal with real-time multi-tab sync and database cache purging',
]
