/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.7.1'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-18'

export const APP_RELEASE_HIGHLIGHTS = [
  'Edit Student Profile Modernization: Redesigned modal with pinned sticky footer, custom select dropdown styling, and sleek segmented tab navigation.',
  'PWA & Version Sync Engine: Resolved recurring update loop and preserved active user sessions upon portal updates.',
  'Full-Stack Zero-Trust Access Control: Global Next.js Edge Middleware verifying RBAC authentication on every request with strict HTTP security headers.',
  'Universal Sliding-Window Rate Limiter: In-memory sliding-window limiter enforcing 429 Retry-After protection across auth, AI, and administrative endpoints.',
  'Strict Input Validation & Masked Secrets: Reusable Zod schemas guarding student records and profile updates with isolated credentials.',
]


