/**
 * Single Source of Truth for Application Versioning & Release Notes
 * Digital Portal of AI & DS - V.S.B. Engineering College
 */

export const APP_VERSION = '2.8.14'
export const APP_VERSION_LABEL = `v${APP_VERSION}`

export const APP_RELEASE_DATE = '2026-09-20'

export const APP_RELEASE_HIGHLIGHTS = [
  'Comprehensive Admin Student Table View: Expanded the desktop table from 8 columns to 15 dedicated columns showing every available student field — Register Number, Name, Date of Birth, Blood Group, Email/Phone/Parent Contact, Class Advisor, Year/Semester, Section, Batch, Residency & Transport (with boarding point and address), CGPA, Attendance (color-coded above/below 75%), Activity Status, and Actions. Admins now have complete visibility into all student data at a glance without needing to open individual dossiers.',
  'Streamlined Professional Digital Portal PDF Attestation: Redesigned the institutional Digital Portal Document attestation block across all generated PDFs (Student Progression Reports, Attendance Registers, Analytics Dossiers, Bus Passes, Gate Passes) into an ultra-clean, simple, and executive 24mm authenticated electronic copy declaration. Replaced bulky legal paragraphs with a concise 2-sentence statutory verification note, subtle brand accent, and compact metadata strip.',
  'Cohort Attendance Analytical Diagrams Suite: Implemented a high-definition visual analytics dashboard in the Administrative Reports view featuring an interactive Vector SVG Donut Diagram with statutory compliance sectors (Eligible ≥ 75%, Condonation Buffer 65%–74.9%, and Critical Shortage < 65%), a 5-tier Frequency Histogram with a 75% cutoff marker, a proportional Macro Day Allocation Stream (Present, OD, ML, Absent), and Section-wise comparative attendance analytics.',
  'Institutional OD & Leave Governance Registry: Enhanced administrative oversight across student On-Duty and Leave records, streamlined department-wide registry views, and established strict statutory role demarcation between Class Advisors and Institutional Executive Officers.',
  'Hackathon Duration-Based Daily Proofs (24h, 36h, 48h & Multi-Day): Dynamically generates daily proof checkpoints for hackathons and multi-day OD events (e.g. Day 1 Kickoff & Check-in, Day 2 Overnight Sprint & Mid-Evaluation, Day 3 Final Prototype & Jury Demo). Students can upload live geo-tagged proofs for each day individually, with full Sunday exclusion and multi-photo dossier inspection across Student, Class Advisor, and HOD dashboards.',
  'Sunday Exclusion in Academic Leave & OD Calculation: Sundays are strictly excluded from leave duration counts and attendance allocations across all applications, review modals, official dossiers, dashboards, and sync engines (e.g., Friday to Monday now accurately equals 3 academic working days instead of 4).',
  'Universal Digital Portal Document Description & Attestation: Added a standardized, institutional-grade Digital Portal Document description block to the end of every generated PDF (College Bus Pass, Hostel Gate Pass, Attendance Reports, Bar Chart Analytics, Academic Records). Explicitly declares that the document is an authenticated Digital Portal E-Copy and NOT an original physical certificate, with IT Act digital signature exemption and real-time QR verification details.',
  'College Bus Pass Pure Verification: Removed all placeholder data, mock vehicle registration numbers, fake driver/faculty incharge phone directories, and arbitrary arrival/departure schedules from the College Bus Transportation Pass view, presenting only authentic onboarding verified student transit credentials',
  'Event Proofs Workflow Streamlined: Removed redundant "4. Attendance Credit (Awaiting Advisor)" milestone from the student Event Proofs dossier view, maintaining a clean 3-step proof lifecycle (Pre-Registered, Geo-Tag Photo, Certificate) now that attendance is automatically allocated upon OD sanction',
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
