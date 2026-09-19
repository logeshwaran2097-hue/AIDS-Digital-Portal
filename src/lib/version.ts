/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.7.4'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-19'

export const APP_RELEASE_HIGHLIGHTS = [
  'OD & Leave Applications: Fixed validation schema issue causing "Invalid input" error when submitting On-Duty or Personal/Family Leave applications',
  'Transit UI Enhancement: Updated transit badge and dossier labels to "Bus No." and removed "#" prefix symbol across student rosters and pass views',
  'Student Onboarding & Verification Flow: Streamlined Step 3 verification review with permanent password attestation card, simplified declaration, and removed administrative contact alert box',
  'Instant Portal Redirection: Resolved portal transition hang by preserving persistent role sessions and immediate navigation to student dashboard',
]
