/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.5.6'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-18'

export const APP_RELEASE_HIGHLIGHTS = [
  'Faculty Registration Hardening: Fixed unrecognized key errors on faculty registration modal (isClassAdvisor, hasTheory, allocationType, lab sessions)',
  'Flexible Allocation & Advisory Schema: Added full support for mentor, classroom lecture, and lab handler roles with non-blocking schema passthrough',
  'Student Enrollment Resilience: Full support for optional email entry with automatic fallback to institutional college addresses',
  'Automated Default Update Propagation: Every newly deployed release is automatically broadcast and set as default for all desktop and mobile portal clients',
  'Universal Optional Email Validator: Schema preprocessing handles blank strings, whitespace, and null gracefully across all endpoints',
  'Data Integrity Hardening: Cleaned obsolete placeholder data from production code across OD, Events, and Proof Document modules',
  'PWA Standalone Display: Seamless installed app header presentation with automatic install-prompt suppression',
  'Profile Photo Synchronization: Instant persistence to database, real-time navbar & sidebar avatar sync across devices',
  'Production Security Hardening: Strict HSTS, nosniff, SAMEORIGIN, Permissions-Policy, and hardened Content-Security-Policy (CSP)',
]
