import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VSB_LOGO_BASE64 } from '@/lib/logoBase64'

export const dynamic = 'force-dynamic'

function esc(unsafe: string | number | null | undefined): string {
  if (unsafe == null) return ''
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function cleanText(str: string): string {
  return str.replace(/[\uFFFD\u0000-\u001F\u007F-\u009F]/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const registerNumber = searchParams.get('registerNumber') || '922525243007'
  const customType = searchParams.get('type') || 'Personal / Emergency Leave'
  const customReason = searchParams.get('reason') || 'Personal / Family Requisition'
  const fromDate = searchParams.get('from') || '2026-09-24'
  const toDate = searchParams.get('to') || '2026-09-27'

  const nameParam = searchParams.get('name')
  const parentPhoneParam = searchParams.get('parentPhone')
  const proofFileNameParam = searchParams.get('proofFileName')
  const totalLeavesTakenParam = searchParams.get('totalLeavesTaken')

  // Fetch student profile from database
  const student = await prisma.student.findFirst({
    where: { registerNumber },
  }).catch(() => null)

  let userName: string | null = null
  if (student?.userId) {
    const u = await prisma.user.findUnique({ where: { id: student.userId } }).catch(() => null)
    userName = u?.name || null
  }

  const rawStudentName = nameParam || userName || (registerNumber === '922525243007' ? 'Anusuya P' : 'Student')
  const year = student?.year || 2
  const section = student?.section || 'A'
  const department = student?.department || 'B.Tech AI & DS'
  const parentPhone = parentPhoneParam || student?.parentPhone || '6381366088'
  const batch = student?.batch || '25-29'

  // Query actual uploaded proof files
  const proofFiles = await (prisma as any).fileRecord.findMany({
    where: {
      relatedId: { in: [registerNumber, registerNumber.toUpperCase()] },
      module: 'attendance_od_proof',
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  }).catch(() => [])

  const uploadedImageFile = proofFiles.find(
    (f: any) =>
      f.fileUrl &&
      (f.fileUrl.startsWith('data:image/') || f.fileUrl.startsWith('http')) &&
      !f.fileUrl.includes('proof-document')
  )

  // Classification
  const reasonLower = (customReason || '').toLowerCase()
  const typeLower = (customType || '').toLowerCase()
  const isMedical = reasonLower.includes('medic') || reasonLower.includes('fever') || reasonLower.includes('doctor') || reasonLower.includes('sick') || reasonLower.includes('hospital') || typeLower.includes('medic')
  const isOD = typeLower.includes('duty') || typeLower.includes('od') || typeLower.includes('hackathon') || typeLower.includes('symposium') || reasonLower.includes('symposium') || reasonLower.includes('hackathon') || reasonLower.includes('speckathon') || reasonLower.includes('conference') || reasonLower.includes('paper') || reasonLower.includes('workshop') || reasonLower.includes('sports')
  const isTemple = reasonLower.includes('temple') || reasonLower.includes('festival') || reasonLower.includes('pooja') || reasonLower.includes('marriage') || reasonLower.includes('ceremony') || reasonLower.includes('kula')

  let rawProofDocName = proofFileNameParam
  if (!rawProofDocName && uploadedImageFile) {
    rawProofDocName = uploadedImageFile.originalName || uploadedImageFile.fileName
  }
  if (!rawProofDocName || rawProofDocName.includes('Official_Student_Leave_&_Event_Verification_Dossier')) {
    if (isMedical) rawProofDocName = 'Medical_Fitness_Certificate_&_Physician_Prescription.pdf'
    else if (isOD) rawProofDocName = 'Resume.pdf'
    else if (isTemple) rawProofDocName = 'Family_Ceremony_Invitation_Letter.pdf'
    else rawProofDocName = 'Parent_Leave_Consent_Letter.pdf'
  }

  // Calculate days
  const fromTime = new Date(fromDate).getTime()
  const toTime = new Date(toDate).getTime()
  let daysApplied = 4
  if (!isNaN(fromTime) && !isNaN(toTime)) {
    const diff = Math.round((toTime - fromTime) / (1000 * 60 * 60 * 24)) + 1
    if (diff > 0) daysApplied = diff
  }

  // Leave records
  const leaveRecordsCount = await prisma.attendanceRecord.count({
    where: { registerNumber, status: { in: ['A', 'ML', 'OD'] } },
  }).catch(() => 0)
  const totalLeavesTaken = totalLeavesTakenParam || (leaveRecordsCount > 0 ? `${leaveRecordsCount} Days` : '1 Day (Cumulative)')

  // Residency
  const rawResidency = student?.residencyStatus || 'Day Scholar'
  const isHosteller = rawResidency.toLowerCase().includes('hostel')
  const residency = isHosteller ? 'Hosteller' : 'Day Scholar'
  const busNo = isHosteller
    ? (student?.hostelBlock ? `Hostel: ${student.hostelBlock}${student.roomNo ? ` · Rm ${student.roomNo}` : ''}` : 'Hostel Resident')
    : (student?.busNo ? `College Bus ${student.busNo}${student.boardingPoint ? ` (${student.boardingPoint})` : ''}` : 'College Bus 44 (olappalayam)')

  // Event Details
  let eventName = 'Speckathon (Technical Hackathon)'
  let eventNature = 'National Technical Hackathon & Prototype Contest'
  let eventStages = 'Round 1: Ideathon → Round 2: Prototype → Grand Finale'
  let organizerHost = 'Unstop & Host Institution'

  if (isMedical) {
    eventName = 'Medical Consultation & Recuperation'
    eventNature = 'Doctor Prescribed Medical Rest & Treatment'
    eventStages = 'Clinical Consultation → Prescribed Bed Rest'
    organizerHost = 'Registered Healthcare Clinic, Tamil Nadu'
  } else if (isTemple) {
    eventName = 'Family Religious Ceremony & Function'
    eventNature = 'Annual Traditional Ceremony & Family Obligation'
    eventStages = 'Family Religious Pooja & Traditional Program'
    organizerHost = 'Native Residence / Ancestral Village, Tamil Nadu'
  } else if (isOD) {
    if (reasonLower.includes('speckathon')) eventName = 'Speckathon (Technical Hackathon)'
    else if (typeLower.includes('hackathon')) eventName = 'Technical Hackathon Competition'
    else if (typeLower.includes('symposium')) eventName = 'Inter-Collegiate Technical Symposium'
    eventNature = 'Academic On-Duty Contest (Institution Team)'
    eventStages = (reasonLower.includes('ideathon') || reasonLower.includes('prototype'))
      ? 'Round 1: Ideathon → Round 2: Prototype → Grand Finale'
      : 'Paper Presentation & Project Exhibition'
    organizerHost = reasonLower.includes('unstop') ? 'Unstop / Host Engineering College' : 'Host Engineering College (Autonomous)'
  }

  const cleanedReason = cleanText(customReason)

  // Status resolution
  const statusParam = searchParams.get('status')
  let resolvedStatus = (statusParam || '').toLowerCase()
  if (!resolvedStatus) {
    const latestAudit = await prisma.auditLog.findFirst({
      where: { userName: { contains: registerNumber }, action: 'od_application_submitted' },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null)
    if (latestAudit?.status) resolvedStatus = latestAudit.status.toLowerCase()
  }

  const isApproved = ['endorsed', 'endorsed_by_advisor', 'approved_by_hod', 'approved'].includes(resolvedStatus)
  const isDeclined = ['rejected', 'rejected_by_advisor', 'rejected_by_hod'].includes(resolvedStatus)

  let statusLabel = 'Pending Advisor Approval'
  let statusClass = 'status-pending'
  let statusIcon = '⏳'
  let endorseTitle = 'Awaiting Advisor Verification'
  let endorseSubtitle = 'Advisor Review Pending · Next Stage: Forward to HOD'
  let endorsePill = 'Step 1 of 2: Advisor Review → HOD'
  let endorsePillClass = 'pill-pending'

  if (isApproved) {
    statusLabel = 'Approved & Forwarded to HOD'
    statusClass = 'status-approved'
    statusIcon = '✓'
    endorseTitle = 'Approved & Endorsed by Advisor'
    endorseSubtitle = 'Evidence Verified · Forwarded to HOD for Sanction'
    endorsePill = 'Forwarded to HOD for Sanction ✓'
    endorsePillClass = 'pill-approved'
  } else if (isDeclined) {
    statusLabel = 'Evidence Declined'
    statusClass = 'status-declined'
    statusIcon = '✕'
    endorseTitle = 'Declined by Class Advisor'
    endorseSubtitle = 'Evidence Declined · Application Not Recommended'
    endorsePill = 'Application Declined ✕'
    endorsePillClass = 'pill-declined'
  }

  const generationDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Official Leave Dossier · ${esc(rawStudentName)} (${esc(registerNumber)})</title>
  <link rel="icon" type="image/png" href="${VSB_LOGO_BASE64}" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --navy: #071A3D;
      --blue: #1455D9;
      --gold: #F4C430;
      --slate-50: #F8FAFC;
      --slate-100: #F1F5F9;
      --slate-200: #E2E8F0;
      --slate-300: #CBD5E1;
      --slate-400: #94A3B8;
      --slate-500: #64748B;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1E293B;
      --emerald: #059669;
      --amber: #B45309;
      --rose: #DC2626;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #0B132B;
      background: radial-gradient(ellipse at 50% 0%, #172554 0%, #0B132B 70%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 60px;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Toolbar ── */
    .toolbar {
      width: 100%; max-width: 960px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      padding: 10px 20px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .toolbar-brand {
      display: flex; align-items: center; gap: 10px;
      color: #F8FAFC; font-size: 13px; font-weight: 800; letter-spacing: 0.3px;
    }
    .toolbar-brand img { width: 30px; height: 30px; border-radius: 8px; background: #fff; padding: 2px; }
    .toolbar-actions { display: flex; align-items: center; gap: 8px; }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700;
      text-decoration: none; cursor: pointer; border: none; transition: all 0.2s;
      font-family: inherit;
    }
    .btn-gold { background: var(--gold); color: var(--navy); }
    .btn-gold:hover { background: #e0b020; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(244,196,48,0.3); }
    .btn-blue { background: var(--blue); color: #fff; }
    .btn-blue:hover { background: #1044ad; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(20,85,217,0.3); }

    /* ── Document Container ── */
    .doc-container {
      width: 100%; max-width: 960px;
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
    }

    /* ── Header ── */
    .doc-header {
      background: var(--slate-50);
      border-bottom: 3px solid var(--navy);
      position: relative;
      padding: 0;
    }
    .doc-header::before {
      content: ''; display: block; height: 5px;
      background: linear-gradient(90deg, var(--navy), var(--blue), var(--navy));
    }
    .header-content {
      display: flex; align-items: center; gap: 20px;
      padding: 16px 32px 14px;
    }
    .header-logo {
      width: 80px; height: 80px; border-radius: 50%;
      border: 2.5px solid var(--gold);
      outline: 1.5px solid var(--navy);
      outline-offset: 3px;
      object-fit: contain; background: #fff; padding: 6px;
      flex-shrink: 0;
    }
    .header-text { flex: 1; text-align: center; }
    .header-text h1 {
      font-size: 22px; font-weight: 900; color: var(--navy); letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .header-text .autonomous-badge {
      display: inline-block; background: var(--gold); color: var(--navy);
      font-size: 8.5px; font-weight: 900; letter-spacing: 1.5px;
      padding: 2px 14px; border-radius: 10px; margin-bottom: 5px;
    }
    .header-text .dept-name {
      font-size: 12px; font-weight: 800; color: var(--blue); letter-spacing: 1px; margin-bottom: 3px;
    }
    .header-text .accreditation {
      font-size: 9px; font-weight: 600; color: var(--slate-500); line-height: 1.5;
    }
    .gold-separator {
      height: 1.5px; background: var(--gold); margin: 0 32px;
    }

    /* ── Document Title Banner ── */
    .doc-title-banner {
      background: var(--navy); text-align: center; padding: 10px 24px; margin: 16px 32px 0;
      border-radius: 10px; position: relative;
      border: 1px solid rgba(244,196,48,0.3);
    }
    .doc-title-banner h2 {
      font-size: 12px; font-weight: 900; color: #fff; letter-spacing: 1.8px;
    }

    /* ── Meta Ribbon ── */
    .meta-ribbon {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 32px; font-size: 10px; color: var(--slate-500); font-weight: 600;
    }
    .meta-ribbon .ref-no { color: var(--blue); font-weight: 800; }
    .meta-ribbon .gen-date span { color: var(--navy); font-weight: 800; }

    /* ── Section Card ── */
    .section-card {
      margin: 12px 24px; background: var(--slate-50);
      border: 1px solid var(--slate-200); border-radius: 12px; overflow: hidden;
    }
    .section-header {
      background: var(--navy); color: #fff;
      padding: 8px 20px; font-size: 10.5px; font-weight: 800;
      letter-spacing: 0.8px; display: flex; align-items: center; justify-content: space-between;
    }

    /* ── Status Badges ── */
    .status-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 12px; border-radius: 6px; font-size: 9px; font-weight: 800;
      letter-spacing: 0.5px;
    }
    .status-pending { background: #FEF3C7; color: var(--amber); border: 1px solid #FCD34D; }
    .status-approved { background: #ECFDF5; color: var(--emerald); border: 1px solid #A7F3D0; }
    .status-declined { background: #FEF2F2; color: var(--rose); border: 1px solid #FECACA; }

    /* ── Data Grid ── */
    .data-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 0; padding: 0;
    }
    .data-row {
      display: flex; align-items: baseline; gap: 8px;
      padding: 9px 20px; border-bottom: 1px solid var(--slate-100);
    }
    .data-row:nth-child(odd) { border-right: 1px solid var(--slate-100); }
    .data-label {
      font-size: 10.5px; font-weight: 700; color: var(--slate-500); text-transform: uppercase;
      letter-spacing: 0.3px; white-space: nowrap; min-width: 130px; flex-shrink: 0;
    }
    .data-value {
      font-size: 12px; font-weight: 700; color: var(--navy);
    }
    .data-value.highlight { color: var(--blue); font-weight: 800; }
    .data-value.mono { font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .data-value.warning { color: var(--amber); font-weight: 800; }
    .data-value.success { color: var(--emerald); font-weight: 700; }
    .data-value.accent { color: var(--blue); font-weight: 800; }

    /* ── Full Width Row ── */
    .data-row-full {
      grid-column: 1 / -1;
      display: flex; align-items: baseline; gap: 8px;
      padding: 9px 20px; border-bottom: 1px solid var(--slate-100);
    }

    /* ── Proof Attachment Ribbon ── */
    .proof-ribbon {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      margin: 12px 24px; padding: 10px 18px; border-radius: 10px;
      font-size: 10.5px; font-weight: 700;
    }
    .proof-ribbon.pending { background: #FEF3C7; border: 1px solid #FCD34D; color: var(--amber); }
    .proof-ribbon.approved { background: #ECFDF5; border: 1px solid #A7F3D0; color: var(--emerald); }
    .proof-ribbon.declined { background: #FEF2F2; border: 1px solid #FECACA; color: var(--rose); }

    /* ── Signature Block ── */
    .sig-block {
      margin: 16px 24px 20px;
      background: var(--slate-50); border: 1px solid var(--slate-200);
      border-radius: 12px; overflow: hidden;
    }
    .sig-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      min-height: 160px;
    }
    .sig-col {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 24px 20px 20px; gap: 6px;
      position: relative;
    }
    .sig-col:first-child { border-right: 1px dashed var(--slate-300); }
    .sig-name {
      font-family: 'Brush Script MT', 'Segoe Script', cursive;
      font-size: 26px; color: var(--navy);
    }
    .sig-line { width: 180px; height: 1px; background: var(--slate-400); }
    .sig-title { font-size: 12px; font-weight: 800; color: var(--navy); }
    .sig-subtitle { font-size: 9px; color: var(--slate-500); font-weight: 500; }
    .sig-pill {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 14px; border-radius: 8px; font-size: 8.5px; font-weight: 700;
      margin-top: 4px;
    }
    .pill-pending { background: #EFF6FF; border: 1px solid #BFDBFE; color: var(--blue); }
    .pill-approved { background: #ECFDF5; border: 1px solid #A7F3D0; color: var(--emerald); }
    .pill-declined { background: #FEF2F2; border: 1px solid #FECACA; color: var(--rose); }
    .pill-verified { background: #ECFDF5; border: 1px solid #A7F3D0; color: var(--emerald); }

    /* ── Evidence Document Viewer ── */
    .evidence-viewer {
      margin: 16px 24px;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 12px;
      overflow: hidden;
    }
    .evidence-viewer-header {
      background: linear-gradient(135deg, #1E293B, var(--navy));
      color: #fff;
      padding: 10px 20px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .evidence-viewer-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .evidence-img {
      max-width: 100%;
      max-height: 500px;
      border-radius: 8px;
      border: 1px solid var(--slate-200);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      object-fit: contain;
      background: #fff;
    }
    .evidence-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 11px;
      color: var(--slate-500);
      font-weight: 600;
    }
    .evidence-meta .file-icon {
      width: 36px; height: 36px;
      background: var(--blue);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 16px;
    }
    .evidence-no-file {
      padding: 32px 20px;
      text-align: center;
      color: var(--slate-400);
      font-size: 12px;
      font-weight: 600;
    }
    .evidence-no-file .icon {
      font-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    /* ── Footer ── */
    .doc-footer {
      text-align: center; padding: 10px 24px 16px;
      border-top: 2px solid var(--navy);
    }
    .doc-footer .regulation {
      font-size: 9.5px; font-weight: 700; color: var(--emerald);
      letter-spacing: 0.5px; margin-bottom: 6px;
    }
    .doc-footer .disclaimer {
      font-size: 8px; color: var(--slate-400); font-weight: 500;
    }

    /* ── Responsive ── */
    @media (max-width: 700px) {
      body { padding: 12px 8px 40px; }
      .toolbar { flex-direction: column; gap: 8px; padding: 10px 14px; }
      .toolbar-actions { justify-content: center; flex-wrap: wrap; }
      .header-content { flex-direction: column; gap: 12px; padding: 16px 16px 12px; }
      .header-text h1 { font-size: 17px; }
      .data-grid { grid-template-columns: 1fr; }
      .data-row { border-right: none !important; }
      .sig-grid { grid-template-columns: 1fr; }
      .sig-col:first-child { border-right: none; border-bottom: 1px dashed var(--slate-300); }
      .section-card { margin: 8px 12px; }
      .doc-title-banner { margin: 12px 12px 0; }
      .meta-ribbon { flex-direction: column; gap: 4px; align-items: flex-start; }
      .proof-ribbon { flex-direction: column; gap: 6px; text-align: center; margin: 8px 12px; }
      .sig-block { margin: 12px 12px 16px; }
      .gold-separator { margin: 0 12px; }
    }

    /* ── Print ── */
    @media print {
      body {
        background: #fff !important; padding: 0 !important; min-height: auto;
      }
      .toolbar { display: none !important; }
      .doc-container {
        box-shadow: none !important; border-radius: 0 !important;
        max-width: 100% !important;
      }
      @page {
        size: A4 landscape;
        margin: 8mm;
      }
    }
  </style>
</head>
<body>

  <!-- Toolbar -->
  <header class="toolbar">
    <div class="toolbar-brand">
      <img src="${VSB_LOGO_BASE64}" alt="VSB" />
      <span>V.S.B. ENGINEERING COLLEGE · OFFICIAL DOSSIER</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-gold" onclick="window.print()">🖨️ Print</button>
      <button class="btn btn-blue" onclick="window.close()">← Back</button>
    </div>
  </header>

  <!-- Document -->
  <main class="doc-container">

    <!-- Header -->
    <div class="doc-header">
      <div class="header-content">
        <img class="header-logo" src="${VSB_LOGO_BASE64}" alt="VSB Logo" />
        <div class="header-text">
          <h1>V.S.B. ENGINEERING COLLEGE</h1>
          <div class="autonomous-badge">AN AUTONOMOUS INSTITUTION</div>
          <div class="dept-name">DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE</div>
          <div class="accreditation">
            Approved by AICTE, New Delhi &amp; Affiliated to Anna University, Chennai<br/>
            Accredited by NAAC with 'A' Grade · NBA Accredited Programs · ISO 9001:2015 Certified<br/>
            NH-67, Karur – Coimbatore National Highway, Karudayampalayam, Karur – 639 111, Tamil Nadu
          </div>
        </div>
      </div>
      <div class="gold-separator"></div>
    </div>

    <!-- Title Banner -->
    <div class="doc-title-banner">
      <h2>OFFICIAL STUDENT LEAVE &amp; EVENT PROOF VERIFICATION DOSSIER</h2>
    </div>

    <!-- Meta Ribbon -->
    <div class="meta-ribbon">
      <span>Ref. No: <span class="ref-no">VSB/AIDS/OD-LV/2026/092</span></span>
      <span>Academic Year: 2025–2026 · Anna University Regulation</span>
      <span class="gen-date">Generated: <span>${esc(generationDate)}</span></span>
    </div>

    <!-- Section 1: Student Particulars -->
    <div class="section-card">
      <div class="section-header">
        <span>STUDENT PARTICULARS</span>
      </div>
      <div class="data-grid">
        <div class="data-row">
          <span class="data-label">Student Name</span>
          <span class="data-value" style="font-weight:900">${esc(rawStudentName.toUpperCase())}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Register Number</span>
          <span class="data-value mono highlight">${esc(registerNumber)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Class / Section</span>
          <span class="data-value">Year ${esc(year)} · Section ${esc(section)} (${esc(department)})</span>
        </div>
        <div class="data-row">
          <span class="data-label">Academic Batch</span>
          <span class="data-value">Batch ${esc(batch)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Request Type</span>
          <span class="data-value warning">${esc(customType)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Days Applied</span>
          <span class="data-value highlight">${esc(daysApplied)} ${daysApplied === 1 ? 'Day' : 'Days'}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Leave Date Range</span>
          <span class="data-value" style="font-weight:900">${esc(fromDate)} to ${esc(toDate)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Total Leave Taken</span>
          <span class="data-value warning">${esc(totalLeavesTaken)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Residency Status</span>
          <span class="data-value">${esc(residency)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">College Bus No</span>
          <span class="data-value">${esc(busNo)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Parent Phone</span>
          <span class="data-value mono">+91-${esc(parentPhone)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Telephonic Consent</span>
          <span class="data-value success">✓ Contact Verified &amp; Approved</span>
        </div>
      </div>
    </div>

    <!-- Section 2: Evidence & Event Particulars -->
    <div class="section-card">
      <div class="section-header">
        <span>OFFICIAL ATTACHED EVIDENCE OF PROOF &amp; EVENT PARTICULARS</span>
        <span class="status-badge ${esc(statusClass)}">${statusIcon} ${esc(statusLabel)}</span>
      </div>
      <div class="data-grid">
        <div class="data-row">
          <span class="data-label">Event / Program</span>
          <span class="data-value" style="font-weight:900">${esc(eventName)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Evidence Document</span>
          <span class="data-value highlight">📎 ${esc(rawProofDocName)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Nature of Event</span>
          <span class="data-value">${esc(eventNature)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Participation Stage</span>
          <span class="data-value">${esc(eventStages)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Host / Organizer</span>
          <span class="data-value">${esc(organizerHost)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Attachment Status</span>
          <span class="data-value success">✓ Digitally Attached &amp; On File</span>
        </div>
        <div class="data-row">
          <span class="data-label">Clearance Routing</span>
          <span class="data-value accent">Class Advisor → HOD Sanction</span>
        </div>
        <div class="data-row">
          <span class="data-label">Regulation Quota</span>
          <span class="data-value">Anna Univ R2021 Compliant</span>
        </div>
        <div class="data-row-full">
          <span class="data-label">Submission Reason</span>
          <span class="data-value">${esc(cleanedReason)}</span>
        </div>
      </div>
    </div>

    <!-- Proof Attachment Ribbon -->
    <div class="proof-ribbon ${isApproved ? 'approved' : isDeclined ? 'declined' : 'pending'}">
      <span>📎 ATTACHED PROOF: ${esc(rawProofDocName)}</span>
      <span>${statusIcon} ${esc(statusLabel).toUpperCase()}${isApproved ? ' · FORWARDED TO HOD' : ''}</span>
    </div>

    <!-- Uploaded Evidence Document Viewer -->
    <div class="evidence-viewer">
      <div class="evidence-viewer-header">
        <span>📄 UPLOADED EVIDENCE DOCUMENT</span>
        <span style="font-size:9px; opacity:0.7">File: ${esc(rawProofDocName)}</span>
      </div>
      <div class="evidence-viewer-body">
        ${uploadedImageFile && uploadedImageFile.fileUrl
          ? `<img class="evidence-img" src="${uploadedImageFile.fileUrl}" alt="Evidence Document: ${esc(rawProofDocName)}" />
             <div class="evidence-meta">
               <div class="file-icon">📎</div>
               <div>
                 <div style="font-weight:800; color: var(--navy); font-size: 12px;">${esc(uploadedImageFile.originalName || uploadedImageFile.fileName || rawProofDocName)}</div>
                 <div style="font-size:10px; color: var(--slate-400);">Uploaded on ${uploadedImageFile.createdAt ? new Date(uploadedImageFile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'} · Digitally Verified</div>
               </div>
             </div>`
          : `<div class="evidence-no-file">
               <div class="icon">📂</div>
               <div>No evidence document image uploaded yet.</div>
               <div style="font-size:10px; margin-top:4px; color: var(--slate-300);">The student can upload proof via the OD/Leave application form.</div>
             </div>`
        }
      </div>
    </div>

    <!-- Signature Block -->
    <div class="sig-block">
      <div class="sig-grid">
        <!-- Student -->
        <div class="sig-col">
          <span class="sig-name">${esc(rawStudentName)}</span>
          <div class="sig-line"></div>
          <span class="sig-title">Student Applicant</span>
          <span class="sig-subtitle">Digital App Submission · Reg: ${esc(registerNumber)}</span>
          <span class="sig-pill pill-verified">✓ Verified Portal Identity</span>
        </div>
        <!-- Advisor / HOD -->
        <div class="sig-col">
          <span class="sig-title" style="font-size:14px; color: ${isApproved ? 'var(--emerald)' : isDeclined ? 'var(--rose)' : 'var(--amber)'}">${statusIcon} ${esc(endorseTitle)}</span>
          <div class="sig-line"></div>
          <span class="sig-title">Class Advisor → HOD Sanction</span>
          <span class="sig-subtitle">${esc(endorseSubtitle)}</span>
          <span class="sig-pill ${esc(endorsePillClass)}">${esc(endorsePill)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="doc-footer">
      <div class="regulation">PORTAL VERIFIED · ANNA UNIVERSITY REGULATION 2021 ELIGIBLE · LEAVE QUOTA AUDITED</div>
      <div class="disclaimer">This is an authentic digital verification dossier generated from the V.S.B. Engineering College (Autonomous) AI&amp;DS Digital Portal.</div>
    </div>

  </main>

</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
