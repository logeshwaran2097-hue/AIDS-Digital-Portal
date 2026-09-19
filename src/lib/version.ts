/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.8.3'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-19'

export const APP_RELEASE_HIGHLIGHTS = [
  'Multi-Tab Concurrent Role Session Isolation: Enabled dedicated role-scoped cookies (auth-token-student, auth-token-admin, auth-token-faculty, auth-token-hod) with contextual referrer inspection so multiple roles can remain logged in concurrently in separate tabs without data collision or session overwriting',
  'Automatic Roll Call Attendance Allocation: When an OD or Leave requisition is sanctioned by HOD or Executive authority, attendance is automatically allocated and credited for all applied calendar dates directly to the student academic roll and daily attendance sessions',
  'Evidence & Requisition Dossier Alignment: Renamed default leave evidence file to Official_Student_Requisition_Letter.pdf matching the official student requisition letter and evidence header',
  'Seamless Background Auto-Verification: Cleaned frontend UI by removing manual verification card and drafting button; all date syncing, proof validation, and 2-sentence institutional statement drafting now occur entirely in the background',
  'Enlarged Statement Viewport: Expanded Reason & Academic Explanation textarea to 4 rows with vertical resizability and relaxed line-height so the complete sentences are visible without scrolling',
  'Autonomous OD & Leave Reason Agent: Implemented dedicated agent architecture with dynamic date synchronization, category adaptation (Personal Leave, Medical Leave, Hackathons, Symposia, Internships), and total exclusion of student directory privacy notices and exam syllabus notes',
  'OD & Leave Reason AI Drafting: Fixed statement generator returning Anna University syllabus notes by adding exclusion guards and category-tailored formal statements for Personal Leave, Medical Leave, and On-Duty requests',
  'OD & Leave Applications: Fixed validation schema issue causing "Invalid input" error when submitting On-Duty or Personal/Family Leave applications',
  'Transit UI Enhancement: Updated transit badge and dossier labels to "Bus No." and removed "#" prefix symbol across student rosters and pass views',
  'Student Onboarding & Verification Flow: Streamlined Step 3 verification review with permanent password attestation card, simplified declaration, and removed administrative contact alert box',
  'Instant Portal Redirection: Resolved portal transition hang by preserving persistent role sessions and immediate navigation to student dashboard',
]
