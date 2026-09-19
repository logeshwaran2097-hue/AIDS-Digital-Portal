/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.5.7'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-19'

export const APP_RELEASE_HIGHLIGHTS = [
  'Comprehensive API Validation Fix: Resolved all "Unrecognized key(s)" errors across student, faculty, HOD, and profile endpoints',
  'Schema Passthrough Migration: Converted 10+ form-facing Zod schemas from .strict() to .passthrough() preventing UI payload rejections',
  'Student Onboarding Fix: Complete profile, OD application, and onboarding OTP schemas now accept all UI form state gracefully',
  'Faculty & HOD Settings Hardening: Settings and profile update schemas no longer reject extra preference fields',
  'Bulk Import Resilience: CSV import schema accepts additional columns without validation failures',
  'Email Validation Stability: Optional email preprocessing handles blank, null, and whitespace values across all endpoints',
  'Production Security Hardening: Strict HSTS, nosniff, SAMEORIGIN, Permissions-Policy, and hardened CSP headers maintained',
]
