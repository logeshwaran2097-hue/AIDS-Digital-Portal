/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.4.0'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-18'

export const APP_RELEASE_HIGHLIGHTS = [
  'Enterprise Authentication Security: Strict bcrypt password hashing, removal of plaintext and DOB bypasses across all roles',
  'Server-Side Session Revocation: Instant JWT invalidation via unique JTI tracking on logout',
  'Sliding-Window Rate Limiting: Comprehensive DDoS and brute-force protection across authentication, OTP, and verification routes',
  'Cryptographic Single-Use OTPs: HMAC-signed verification tokens with instant post-validation invalidation and 10-minute expiry',
  'Account Enumeration Protection: Generic credentials error responses preventing user discovery',
]
