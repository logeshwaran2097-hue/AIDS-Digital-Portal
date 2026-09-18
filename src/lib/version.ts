/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.5.5'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-18'

export const APP_RELEASE_HIGHLIGHTS = [
  'Student Enrollment Fix: Seamless registration with optional email — candidates can now be registered directly without triggering "Invalid email" error',
  'Automatic Default Email Generation: When optional email is omitted, students are automatically assigned their official college email ({regNo}@student.vsb.edu.in)',
  'Universal Optional Email Validator: Schema preprocessing handles blank strings, whitespace, and null gracefully across all user and candidate endpoints',
  'Onboarding Rate-Limit Resilience: Cleared stale rate-limit locks, fixed async await in email-check endpoint, and improved dynamic error feedback',
  'Data Integrity Hardening: Removed placeholder data from production code — no fake phone numbers, register numbers, or student names in API responses',
  'OD Applications Accuracy: Real-time parent contact verification and safe null fallback when parent phone is unregistered',
  'PWA Standalone Display: Seamless installed app header presentation with automatic install-prompt suppression',
  'Profile Photo Synchronization: Instant persistence to database, real-time navbar & sidebar avatar sync across devices',
  'Production Security Hardening: Strict HSTS, nosniff, SAMEORIGIN, Permissions-Policy, and hardened Content-Security-Policy (CSP)',
]
