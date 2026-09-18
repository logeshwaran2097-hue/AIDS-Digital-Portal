/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.5.3'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-18'

export const APP_RELEASE_HIGHLIGHTS = [
  'Data Integrity Hardening: Removed all hardcoded placeholder data from production code — no fake phone numbers, register numbers, or student names in API responses',
  'Events Portal Clean-up: Registration form placeholders updated to contextual labels; event card academic year now dynamic from actual event date',
  'OD Applications Accuracy: Parent phone number fallbacks replaced with null — no fake contact numbers shown when parent phone is unregistered',
  'Proof Document API: Removed hardcoded fallback register number and student name; API now requires valid input parameters',
  'PWA Standalone App Header Polish: Seamless presentation when launched as an installed app with top accreditation badge and install button hidden',
  'Smart Install Persistence: Automatic detection and suppression of app install prompts once the portal is installed',
  'Zero-Flash Standalone Display: CSS media query integration hiding app install triggers before first frame paint',
  'Profile Photo Synchronization: Instant persistence to database, real-time navbar & sidebar avatar sync, and caching consistency across devices',
  'Production Deployment Hardening: Strict HSTS, nosniff, SAMEORIGIN, Permissions-Policy, and hardened Content-Security-Policy (CSP)',
]
