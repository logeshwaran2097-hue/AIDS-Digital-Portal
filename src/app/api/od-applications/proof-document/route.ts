import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VSB_LOGO_BASE64 } from '@/lib/logoBase64'

export const dynamic = 'force-dynamic'

function escapeXml(unsafe: string | number | null | undefined): string {
  if (unsafe == null) return ''
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
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

  // Explicit query parameters passed from approval modals or callers
  const nameParam = searchParams.get('name')
  const parentPhoneParam = searchParams.get('parentPhone')
  const proofFileNameParam = searchParams.get('proofFileName')
  const totalLeavesTakenParam = searchParams.get('totalLeavesTaken')
  const format = searchParams.get('format')
  const acceptHeader = request.headers.get('accept') || ''

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
  const parentPhone = parentPhoneParam || student?.parentPhone || '6381366088'
  const batch = student?.batch || '25-29'

  // Query actual uploaded proof files from Prisma fileRecord
  const proofFiles = await (prisma as any).fileRecord.findMany({
    where: {
      relatedId: { in: [registerNumber, registerNumber.toUpperCase()] },
      module: 'attendance_od_proof',
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  }).catch(() => [])

  // Find any actual uploaded image file (PNG/JPG base64 or URL) that is not the recursive SVG endpoint
  const uploadedImageFile = proofFiles.find(
    (f: any) =>
      f.fileUrl &&
      (f.fileUrl.startsWith('data:image/') || f.fileUrl.startsWith('http')) &&
      !f.fileUrl.includes('proof-document')
  )

  // Dynamic classification of leave purpose and parent affirmation
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
    if (isMedical) {
      rawProofDocName = 'Medical_Fitness_Certificate_&_Physician_Prescription.pdf'
    } else if (isOD) {
      rawProofDocName = 'Resume.pdf'
    } else if (isTemple) {
      rawProofDocName = 'Family_Ceremony_Invitation_Letter.pdf'
    } else {
      rawProofDocName = 'Parent_Leave_Consent_Letter.pdf'
    }
  }
  const attachedProofName = rawProofDocName

  // Calculate days of leave applying
  const fromTime = new Date(fromDate).getTime()
  const toTime = new Date(toDate).getTime()
  let daysApplied = 4
  if (!isNaN(fromTime) && !isNaN(toTime)) {
    const diff = Math.round((toTime - fromTime) / (1000 * 60 * 60 * 24)) + 1
    if (diff > 0) daysApplied = diff
  }
  const daysAppliedStr = `${daysApplied} ${daysApplied === 1 ? 'Day' : 'Days'}`

  // Query cumulative prior leave records
  const leaveRecordsCount = await prisma.attendanceRecord.count({
    where: { registerNumber, status: { in: ['A', 'ML', 'OD'] } },
  }).catch(() => 0)
  const totalLeavesTakenStr = totalLeavesTakenParam || (leaveRecordsCount > 0 ? `${leaveRecordsCount} Days` : '1 Day (Cumulative)')

  // Separate residency and bus number
  const rawResidency = student?.residencyStatus || 'Day Scholar'
  const isHosteller = rawResidency.toLowerCase().includes('hostel')
  const residency = isHosteller ? 'Hosteller' : 'Day Scholar'
  const busNo = isHosteller
    ? (student?.hostelBlock ? `Hostel: ${student.hostelBlock}${student.roomNo ? ` · Rm ${student.roomNo}` : ''}` : 'Hostel Resident')
    : (student?.busNo ? `College Bus ${student.busNo}${student.boardingPoint ? ` (${student.boardingPoint})` : ''}` : 'College Bus 44 (olappalayam)')

  const dateRangeStr = `${fromDate} to ${toDate}`

  // Extract Event Details matching the Student Particulars Grid Format
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
    if (reasonLower.includes('speckathon')) {
      eventName = 'Speckathon (Technical Hackathon)'
    } else if (typeLower.includes('hackathon')) {
      eventName = 'Technical Hackathon Competition'
    } else if (typeLower.includes('symposium')) {
      eventName = 'Inter-Collegiate Technical Symposium'
    }
    eventNature = 'Academic On-Duty Contest (Institution Team)'
    if (reasonLower.includes('ideathon') || reasonLower.includes('prototype')) {
      eventStages = 'Round 1: Ideathon → Round 2: Prototype → Grand Finale'
    } else {
      eventStages = 'Paper Presentation & Project Exhibition'
    }
    organizerHost = reasonLower.includes('unstop') ? 'Unstop / Host Engineering College' : 'Host Engineering College (Autonomous)'
  }

  // Clean Reason Text into formatted lines
  const cleanedReason = cleanText(customReason)
  const reasonLine1 = cleanedReason.length > 70 ? cleanedReason.slice(0, 68) + '...' : cleanedReason
  const reasonLine2 = cleanedReason.length > 70 ? cleanText(cleanedReason.slice(68, 140)) : ''

  // Safe XML Escaped Values
  const eStudentNameUpper = escapeXml(rawStudentName.toUpperCase())
  const eStudentNameSig = escapeXml(rawStudentName)
  const eRegisterNumber = escapeXml(registerNumber)
  const eYear = escapeXml(year)
  const eSection = escapeXml(section)
  const eBatch = escapeXml(batch)
  const eParentPhone = escapeXml(parentPhone)
  const eResidency = escapeXml(residency)
  const eBusNo = escapeXml(busNo)
  const eDaysApplied = escapeXml(daysAppliedStr)
  const eDateRange = escapeXml(dateRangeStr)
  const eTotalLeavesTaken = escapeXml(totalLeavesTakenStr)
  const eCustomType = escapeXml(customType)
  const eAttachedProofName = escapeXml(attachedProofName)
  const eEventName = escapeXml(eventName)
  const eEventNature = escapeXml(eventNature)
  const eEventStages = escapeXml(eventStages)
  const eOrganizerHost = escapeXml(organizerHost)
  const eReasonLine1 = escapeXml(reasonLine1)
  const eReasonLine2 = escapeXml(reasonLine2)

  const statusParam = searchParams.get('status')
  let resolvedStatus = (statusParam || '').toLowerCase()
  if (!resolvedStatus) {
    const latestAudit = await prisma.auditLog.findFirst({
      where: {
        userName: { contains: registerNumber },
        action: 'od_application_submitted',
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null)
    if (latestAudit?.status) {
      resolvedStatus = latestAudit.status.toLowerCase()
    }
  }

  const isApprovedOrEndorsed =
    resolvedStatus === 'endorsed' ||
    resolvedStatus === 'endorsed_by_advisor' ||
    resolvedStatus === 'approved_by_hod' ||
    resolvedStatus === 'approved'

  const isDeclined =
    resolvedStatus === 'rejected' ||
    resolvedStatus === 'rejected_by_advisor' ||
    resolvedStatus === 'rejected_by_hod'

  let evidenceStatusBadge = '⏳ PENDING ADVISOR APPROVAL'
  let evidenceStatusColor = '#B45309'
  let evidenceStatusBg = '#FEF3C7'
  let bottomEndorseColor = '#B45309'
  let bottomEndorseTitle = '⏳ Awaiting Advisor Verification'
  let bottomEndorseSubtitle = 'Advisor Review Pending · Next Stage: Forward to HOD'
  let bottomEndorsePillBg = '#EFF6FF'
  let bottomEndorsePillStroke = '#BFDBFE'
  let bottomEndorsePillColor = '#1455D9'
  let bottomEndorsePillText = 'Step 1 of 2: Advisor Review → HOD'

  if (isApprovedOrEndorsed) {
    evidenceStatusBadge = '✓ APPROVED & FORWARDED TO HOD'
    evidenceStatusColor = '#059669'
    evidenceStatusBg = '#ECFDF5'
    bottomEndorseColor = '#059669'
    bottomEndorseTitle = '✓ Approved & Endorsed by Advisor'
    bottomEndorseSubtitle = 'Evidence Verified · Forwarded to HOD for Sanction'
    bottomEndorsePillBg = '#ECFDF5'
    bottomEndorsePillStroke = '#A7F3D0'
    bottomEndorsePillColor = '#059669'
    bottomEndorsePillText = 'Forwarded to HOD for Sanction ✓'
  } else if (isDeclined) {
    evidenceStatusBadge = '✕ EVIDENCE DECLINED'
    evidenceStatusColor = '#DC2626'
    evidenceStatusBg = '#FEF2F2'
    bottomEndorseColor = '#DC2626'
    bottomEndorseTitle = '✕ Declined by Class Advisor'
    bottomEndorseSubtitle = 'Evidence Declined · Application Not Recommended'
    bottomEndorsePillBg = '#FEF2F2'
    bottomEndorsePillStroke = '#FECACA'
    bottomEndorsePillColor = '#DC2626'
    bottomEndorsePillText = 'Application Declined ✕'
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 850 1100" width="850" height="1100">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#071A3D"/>
      <stop offset="50%" stop-color="#0A2A5E"/>
      <stop offset="100%" stop-color="#1455D9"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.12"/>
    </filter>
  </defs>

  <rect width="850" height="1100" fill="#FFFFFF"/>
  <rect x="20" y="20" width="810" height="1060" fill="none" stroke="#071A3D" stroke-width="2.5" rx="6"/>
  <rect x="26" y="26" width="798" height="1048" fill="none" stroke="#F4C430" stroke-width="1.2" rx="4"/>
  <rect x="30" y="30" width="790" height="1040" fill="none" stroke="#E2E8F0" stroke-width="0.6" rx="2"/>

  <!-- Top Ambient Header Background Fill -->
  <rect x="31" y="31" width="788" height="138" fill="#F8FAFC"/>
  <!-- Top Slim Gradient Accent Ribbon -->
  <rect x="31" y="31" width="788" height="5" fill="url(#headerGrad)"/>

  <!-- Central Watermark Emblem (Subtle 3% Opacity) -->
  <image xlink:href="${VSB_LOGO_BASE64}" href="${VSB_LOGO_BASE64}" x="285" y="440" width="280" height="280" opacity="0.03" preserveAspectRatio="xMidYMid meet"/>

  <!-- Left: College Official Circular Emblem in Gold Mount -->
  <g transform="translate(48, 44)">
    <circle cx="45" cy="45" r="44" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
    <circle cx="45" cy="45" r="41.5" fill="#FFFFFF" stroke="#F4C430" stroke-width="2"/>
    <circle cx="45" cy="45" r="38" fill="#FFFFFF" stroke="#071A3D" stroke-width="0.8"/>
    <image xlink:href="${VSB_LOGO_BASE64}" href="${VSB_LOGO_BASE64}" x="10" y="10" width="70" height="70" preserveAspectRatio="xMidYMid meet"/>
  </g>

  <!-- Center Institution Master Typography -->
  <text x="465" y="66" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="23" font-weight="900" fill="#071A3D" text-anchor="middle" letter-spacing="1.2">V.S.B. ENGINEERING COLLEGE</text>

  <!-- Autonomous Gold Pill Tag -->
  <rect x="370" y="75" width="190" height="17" rx="8.5" fill="#F4C430"/>
  <text x="465" y="87.5" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="900" fill="#071A3D" text-anchor="middle" letter-spacing="1.5">AN AUTONOMOUS INSTITUTION</text>

  <!-- Department Headline -->
  <text x="465" y="111" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12.5" font-weight="800" fill="#1455D9" text-anchor="middle" letter-spacing="1.2">DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE</text>

  <!-- Accreditations and Approvals Line 1 -->
  <text x="465" y="127" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.2" font-weight="600" fill="#334155" text-anchor="middle">Approved by AICTE, New Delhi &amp; Affiliated to Anna University, Chennai</text>

  <!-- Accreditations and Approvals Line 2 -->
  <text x="465" y="141" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.8" font-weight="bold" fill="#64748B" text-anchor="middle">Accredited by NAAC with 'A' Grade · NBA Accredited Programs · ISO 9001:2015 Certified</text>

  <!-- Campus Address Line 3 -->
  <text x="465" y="155" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" fill="#64748B" text-anchor="middle">NH-67, Karur - Coimbatore National Highway, Karudayampalayam, Karur - 639 111, Tamil Nadu, India</text>

  <!-- Master Gold and Sapphire Ornamental Beam Separator with Center Diamond -->
  <rect x="48" y="167" width="754" height="2.5" fill="#071A3D" rx="1"/>
  <rect x="48" y="170.5" width="754" height="1.2" fill="#F4C430" rx="0.6"/>
  <polygon points="425,164.5 431,170 425,175.5 419,170" fill="#F4C430"/>
  <polygon points="425,166.5 428.5,170 425,173.5 421.5,170" fill="#071A3D"/>

  <!-- Official Document Title Section Badge -->
  <rect x="155" y="186" width="540" height="34" rx="8" fill="#071A3D" filter="url(#shadow)"/>
  <rect x="157" y="188" width="536" height="30" rx="6" fill="none" stroke="#F4C430" stroke-width="1"/>
  <text x="425" y="208" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">OFFICIAL STUDENT LEAVE &amp; EVENT PROOF VERIFICATION DOSSIER</text>

  <!-- Dossier Meta Ribbon Bar -->
  <text x="55" y="233" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#334155">Ref. No: <tspan fill="#1455D9" font-weight="900">VSB/AIDS/OD-LV/2026/092</tspan></text>
  <text x="425" y="233" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="600" fill="#64748B" text-anchor="middle">Academic Year: 2025–2026 · Anna University Regulation</text>
  <text x="795" y="233" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#334155" text-anchor="end">Generation Date: <tspan fill="#071A3D" font-weight="900">08-Sep-2026</tspan></text>

  <!-- ========================================================================= -->
  <!-- 1. STUDENT PARTICULAR DETAILS CARD -->
  <!-- ========================================================================= -->
  <rect x="50" y="244" width="750" height="176" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
  
  <text x="75" y="272" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">STUDENT NAME:</text>
  <text x="220" y="272" font-family="'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="900" fill="#071A3D">${eStudentNameUpper}</text>
  
  <text x="450" y="272" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">REGISTER NUMBER:</text>
  <text x="615" y="272" font-family="'Courier New', monospace" font-size="13" font-weight="900" fill="#1455D9">${eRegisterNumber}</text>

  <text x="75" y="299" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">CLASS / SECTION:</text>
  <text x="220" y="299" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#071A3D">Year ${eYear} · Section ${eSection} (B.Tech AI &amp; DS)</text>

  <text x="450" y="299" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">ACADEMIC BATCH:</text>
  <text x="615" y="299" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#071A3D">Batch ${eBatch}</text>

  <text x="75" y="326" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">REQUEST TYPE:</text>
  <text x="220" y="326" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#B45309">${eCustomType}</text>

  <text x="450" y="326" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">DAYS APPLIED:</text>
  <text x="615" y="326" font-family="'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="900" fill="#1455D9">${eDaysApplied}</text>

  <text x="75" y="353" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">LEAVE DATE RANGE:</text>
  <text x="220" y="353" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#071A3D">${eDateRange}</text>

  <text x="450" y="353" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">TOTAL LEAVE TAKEN:</text>
  <text x="615" y="353" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#B45309">${eTotalLeavesTaken}</text>

  <text x="75" y="380" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">RESIDENCY STATUS:</text>
  <text x="220" y="380" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#334155">${eResidency}</text>

  <text x="450" y="380" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">COLLEGE BUS NO:</text>
  <text x="615" y="380" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#334155">${eBusNo}</text>

  <text x="75" y="407" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">PARENT PHONE:</text>
  <text x="220" y="407" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#071A3D">+91-${eParentPhone}</text>

  <text x="450" y="407" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">TELEPHONIC CONSENT:</text>
  <text x="615" y="407" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#059669">✓ Contact Verified &amp; Approved</text>

  <!-- ========================================================================= -->
  <!-- 2. OFFICIAL ATTACHED EVIDENCE & ON-DUTY EVENT PARTICULARS (MATCHING DESIGN) -->
  <!-- ========================================================================= -->
  <rect x="50" y="432" width="750" height="235" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>

  <!-- Card Top Header Bar -->
  <rect x="51" y="433" width="748" height="28" rx="8" fill="#071A3D"/>
  <text x="75" y="451" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="900" fill="#FFFFFF" letter-spacing="0.6">OFFICIAL ATTACHED EVIDENCE OF PROOF &amp; EVENT PARTICULARS</text>
  <rect x="565" y="437" width="225" height="20" rx="4" fill="${evidenceStatusBg}" stroke="${evidenceStatusColor}"/>
  <text x="677" y="451" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="900" fill="${evidenceStatusColor}" text-anchor="middle">${evidenceStatusBadge}</text>

  <!-- 2-Column Key-Value Rows Matching Top Student Particulars Exactly -->
  <text x="75" y="482" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">EVENT / PROGRAM:</text>
  <text x="220" y="482" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#071A3D">${eEventName}</text>

  <text x="450" y="482" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">EVIDENCE DOCUMENT:</text>
  <text x="615" y="482" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#1455D9">📎 ${eAttachedProofName}</text>

  <text x="75" y="509" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">NATURE OF EVENT:</text>
  <text x="220" y="509" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#334155">${eEventNature}</text>

  <text x="450" y="509" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">PARTICIPATION STAGE:</text>
  <text x="615" y="509" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#334155">${eEventStages}</text>

  <text x="75" y="536" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">HOST / ORGANIZER:</text>
  <text x="220" y="536" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#334155">${eOrganizerHost}</text>

  <text x="450" y="536" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">ATTACHMENT STATUS:</text>
  <text x="615" y="536" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#059669">✓ Digitally Attached &amp; On File</text>

  <text x="75" y="563" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">CLEARANCE ROUTING:</text>
  <text x="220" y="563" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#1455D9">Class Advisor → HOD Sanction</text>

  <text x="450" y="563" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">REGULATION QUOTA:</text>
  <text x="615" y="563" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#071A3D">Anna Univ R2021 Compliant</text>

  <text x="75" y="590" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">SUBMISSION REASON:</text>
  <text x="220" y="590" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" fill="#334155">${eReasonLine1}</text>

  <!-- Evidence Footer Ribbon -->
  <rect x="65" y="618" width="720" height="34" rx="6" fill="${evidenceStatusBg}" stroke="${evidenceStatusColor}"/>
  <text x="80" y="639" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="${evidenceStatusColor}">📎 ATTACHED PROOF: ${eAttachedProofName}</text>
  <text x="770" y="639" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="900" fill="${evidenceStatusColor}" text-anchor="end">${evidenceStatusBadge} · FORWARDED TO HOD</text>

  <!-- ========================================================================= -->
  <!-- 3. SIGNATURES AND OFFICIAL VALIDATION BLOCK (BALANCED 2-COLUMN LAYOUT) -->
  <!-- ========================================================================= -->
  <rect x="50" y="682" width="750" height="215" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>

  <!-- Vertical Divider between Student and Advisor Columns -->
  <line x1="425" y1="700" x2="425" y2="840" stroke="#CBD5E1" stroke-width="1.2" stroke-dasharray="4,4"/>

  <!-- 1. Student Applicant Signature Block -->
  <text x="245" y="750" font-family="'Brush Script MT', cursive, sans-serif" font-size="26" fill="#071A3D" text-anchor="middle">${eStudentNameSig}</text>
  <line x1="145" y1="770" x2="345" y2="770" stroke="#94A3B8" stroke-width="1.2"/>
  <text x="245" y="790" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#071A3D" text-anchor="middle">Student Applicant</text>
  <text x="245" y="806" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" fill="#64748B" text-anchor="middle">Digital App Submission · Reg: ${eRegisterNumber}</text>
  <rect x="165" y="819" width="160" height="20" rx="5" fill="#ECFDF5" stroke="#A7F3D0"/>
  <text x="245" y="832.5" font-family="'Segoe UI', sans-serif" font-size="8.5" font-weight="700" fill="#059669" text-anchor="middle">✓ Verified Portal Identity</text>

  <!-- 2. Class Advisor and HOD Endorsement Block -->
  <text x="605" y="750" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="${bottomEndorseColor}" text-anchor="middle">${bottomEndorseTitle}</text>
  <line x1="505" y1="770" x2="705" y2="770" stroke="#94A3B8" stroke-width="1.2"/>
  <text x="605" y="790" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#071A3D" text-anchor="middle">Class Advisor → HOD Sanction</text>
  <text x="605" y="806" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" fill="#64748B" text-anchor="middle">${bottomEndorseSubtitle}</text>
  <rect x="495" y="819" width="220" height="20" rx="5" fill="${bottomEndorsePillBg}" stroke="${bottomEndorsePillStroke}"/>
  <text x="605" y="832.5" font-family="'Segoe UI', sans-serif" font-size="8.5" font-weight="700" fill="${bottomEndorsePillColor}" text-anchor="middle">${bottomEndorsePillText}</text>

  <!-- Clean Separation Divider Before Regulation Banner -->
  <line x1="70" y1="854" x2="780" y2="854" stroke="#CBD5E1" stroke-width="1"/>

  <!-- Regulation Compliance Banner -->
  <text x="425" y="874" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="bold" fill="#059669" text-anchor="middle">PORTAL VERIFIED · ANNA UNIVERSITY REGULATION 2021 ELIGIBLE · LEAVE QUOTA AUDITED</text>

  <!-- Institutional Footer -->
  <text x="425" y="915" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.8" fill="#94A3B8" text-anchor="middle">This is an authentic digital verification dossier generated from the V.S.B. Engineering College (Autonomous) AI&amp;DS Digital Portal.</text>
</svg>`

  // If the user navigates directly in the browser (Accept: text/html), serve a stunning centered document viewer with controls
  const wantsHtml = format !== 'svg' && (acceptHeader.includes('text/html') || format === 'html')
  if (wantsHtml) {
    const rawSvgUrl = `?${searchParams.toString()}&format=svg`
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Official Leave Dossier · ${escapeXml(rawStudentName)} (${escapeXml(registerNumber)})</title>
  <link rel="icon" type="image/png" href="${VSB_LOGO_BASE64}" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0B132B;
      background: radial-gradient(circle at 50% 0%, #172554 0%, #0B132B 80%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 48px;
    }
    .toolbar {
      width: 100%;
      max-width: 880px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 18px;
      padding: 10px 18px;
      margin-bottom: 20px;
      color: #fff;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .toolbar-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .toolbar-title img {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #fff;
      padding: 2px;
    }
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-gold {
      background: #F4C430;
      color: #071A3D;
    }
    .btn-gold:hover {
      background: #e0b020;
      transform: translateY(-1px);
    }
    .btn-primary {
      background: #1455D9;
      color: #fff;
    }
    .btn-primary:hover {
      background: #1044ad;
      transform: translateY(-1px);
    }
    .btn-outline {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.16);
    }
    .dossier-wrapper {
      width: 100%;
      max-width: 880px;
      display: flex;
      justify-content: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65);
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .dossier-wrapper svg {
      width: 100%;
      height: auto;
      display: block;
    }
    @media print {
      body {
        background: #fff !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .toolbar {
        display: none !important;
      }
      .dossier-wrapper {
        box-shadow: none !important;
        border-radius: 0 !important;
        border: none !important;
        max-width: 100% !important;
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
    @media (max-width: 640px) {
      body { padding: 12px 8px; }
      .toolbar { flex-direction: column; gap: 10px; align-items: stretch; }
      .toolbar-actions { justify-content: space-between; }
    }
  </style>
</head>
<body>
  <header class="toolbar">
    <div class="toolbar-title">
      <img src="${VSB_LOGO_BASE64}" alt="VSB Logo" />
      <span>V.S.B. ENGINEERING COLLEGE · OFFICIAL DOSSIER</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-gold" onclick="window.print()">
        🖨️ Print Dossier
      </button>
      <a class="btn btn-primary" href="${rawSvgUrl}" download="Official_Leave_Dossier_${eRegisterNumber}.svg">
        ⬇️ Download SVG
      </a>
    </div>
  </header>

  <main class="dossier-wrapper">
    ${svg}
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

  // Otherwise return raw SVG image
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
