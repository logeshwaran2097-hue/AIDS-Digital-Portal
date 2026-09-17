/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.7.0'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-18'

export const APP_RELEASE_HIGHLIGHTS = [
  'Full-Stack Zero-Trust Access Control: Global Next.js Edge Middleware verifying RBAC authentication on every request with strict HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).',
  'Universal Sliding-Window Rate Limiter: In-memory sliding-window limiter enforcing 429 Retry-After protection across auth, AI, and administrative endpoints.',
  'Eliminated Backdoors & Secret Isolation: Removed hardcoded bypass passwords (welcome123, abc123), master OTP bypasses (123456/999999), and dev OTP leaks in API responses.',
  'Masked API Keys & Isolated Secrets: Removed Fast2SMS keys from client DOM and route fallbacks, enforcing strictly isolated environment variables and masked secret returns.',
  'Strict Input Validation: Reusable Zod schemas guarding student records, auth requests, profile updates, and AI prompts.',
]


