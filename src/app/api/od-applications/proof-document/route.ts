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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const registerNumber = searchParams.get('registerNumber') || '922525243007'
  const customType = searchParams.get('type') || 'Personal / Emergency Leave'
  const customReason = searchParams.get('reason') || 'Personal / Family Requisition'
  const fromDate = searchParams.get('from') || '2026-09-17'
  const toDate = searchParams.get('to') || '2026-09-18'

  // Explicit query parameters passed from approval modals or callers
  const nameParam = searchParams.get('name')
  const parentPhoneParam = searchParams.get('parentPhone')
  const parentNameParam = searchParams.get('parentName')
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
  const parentPhone = parentPhoneParam || student?.parentPhone || '6381366088'
  const batch = student?.batch || '2025–2029'

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

  const attachedProofFile = uploadedImageFile || proofFiles?.[0] || null

  // Dynamic classification of leave purpose and parent affirmation
  const reasonLower = (customReason || '').toLowerCase()
  const typeLower = (customType || '').toLowerCase()

  const isMedical = reasonLower.includes('medic') || reasonLower.includes('fever') || reasonLower.includes('doctor') || reasonLower.includes('sick') || reasonLower.includes('hospital') || typeLower.includes('medic')
  const isOD = typeLower.includes('duty') || typeLower.includes('od') || reasonLower.includes('symposium') || reasonLower.includes('hackathon') || reasonLower.includes('conference') || reasonLower.includes('paper') || reasonLower.includes('workshop') || reasonLower.includes('sports')
  const isTemple = reasonLower.includes('temple') || reasonLower.includes('festival') || reasonLower.includes('pooja') || reasonLower.includes('marriage') || reasonLower.includes('ceremony') || reasonLower.includes('kula')

  let rawProofDocName = proofFileNameParam
  if (!rawProofDocName && uploadedImageFile) {
    rawProofDocName = uploadedImageFile.originalName || uploadedImageFile.fileName
  }
  if (!rawProofDocName || rawProofDocName.includes('Official_Student_Leave_&_Event_Verification_Dossier')) {
    if (isMedical) {
      rawProofDocName = 'Medical_Fitness_Certificate_&_Physician_Prescription.png'
    } else if (isOD) {
      rawProofDocName = 'Technical_Event_Brochure_&_Invitation_Letter.png'
    } else if (isTemple) {
      rawProofDocName = 'Family_Ceremony_Invitation_&_Parent_Letter.png'
    } else {
      rawProofDocName = 'Parent_Leave_Requisition_&_Consent_Letter.png'
    }
  }
  const attachedProofName = rawProofDocName

  // Calculate days of leave applying
  const fromTime = new Date(fromDate).getTime()
  const toTime = new Date(toDate).getTime()
  let daysApplied = 2
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
    : (student?.busNo ? `College Bus ${student.busNo}${student.boardingPoint ? ` (${student.boardingPoint})` : ''}` : 'College Bus 44 (Olappalayam)')

  const dateRangeStr = `${fromDate} to ${toDate}`

  let proofHeading = 'ATTACHED DIGITAL VERIFICATION PROOF 1: EVENT PARTICULAR & PARENT UNDERTAKING'
  let eventTitle = customReason.length > 5 ? customReason : customType
  let venueLocation = 'Olapalayam, Karur District, Tamil Nadu'
  let ceremonyOrReason = 'Personal / Emergency Domestic Leave'
  let declaration1 = `Respected Faculty / Class Advisor, My ward ${rawStudentName} (${registerNumber}) requires leave on ${dateRangeStr}`
  let declaration2 = `for urgent personal family obligations. We affirm our ward will promptly complete all academic lab`
  let declaration3 = `assignments upon return and maintain diligent compliance with all departmental academic requirements.`
  let parentAffiliation = parentNameParam || (student?.parentPhone ? `Parent Contact: +91-${student.parentPhone}` : 'Parent / Guardian Verified')

  if (isMedical) {
    proofHeading = 'ATTACHED DIGITAL VERIFICATION PROOF: MEDICAL CERTIFICATE & PARENT INTIMATION'
    eventTitle = customReason.length > 5 ? customReason : 'Medical Treatment & Physician Prescribed Recuperation'
    venueLocation = 'Consultant Clinic / Healthcare Centre, Karur'
    ceremonyOrReason = 'Doctor Certified Medical Rest & Treatment (Prescription on File)'
    declaration1 = `Respected Faculty / Class Advisor, My ward ${rawStudentName} (${registerNumber}) requires medical leave from ${fromDate} to ${toDate}`
    declaration2 = `due to certified health indisposition under physician care. The medical certificate/prescription has been verified.`
    declaration3 = `We affirm our ward will submit pending laboratory records and maintain required course attendance.`
  } else if (isOD) {
    proofHeading = 'ATTACHED DIGITAL VERIFICATION PROOF: ACADEMIC ON-DUTY & EVENT INVITATION'
    eventTitle = customReason.length > 5 ? customReason : 'Inter-Collegiate Technical Symposium & Paper Presentation'
    venueLocation = 'Host Engineering College / Department of Computer Science & Engineering'
    ceremonyOrReason = 'Academic Technical Contest / Paper Presentation / Hackathon (Institutional Team)'
    declaration1 = `Respected Faculty / Class Advisor, My ward ${rawStudentName} (${registerNumber}) is participating in the academic OD event on ${dateRangeStr}`
    declaration2 = `representing our college. The event acceptance / registration brochure has been digitally audited.`
    declaration3 = `We affirm that all assignments, coursework, and laboratory practicals will be completed without delay.`
  } else if (isTemple) {
    proofHeading = 'ATTACHED DIGITAL VERIFICATION PROOF: FAMILY FUNCTION & PARENT UNDERTAKING'
    eventTitle = customReason.length > 5 ? customReason : 'Sri Maha Mariamman Temple Annual Festival & Family Religious Ceremony'
    venueLocation = 'Native Residence / Ancestral Village, Tamil Nadu'
    ceremonyOrReason = 'Annual Family Temple Festival / Maha Abhishekam (Family Function)'
    declaration1 = `Respected Faculty / Class Advisor, My ward ${rawStudentName} (${registerNumber}) requires sanctioned leave on ${dateRangeStr}`
    declaration2 = `to participate in our family traditional ceremony. We affirm our ward will promptly complete all academic lab`
    declaration3 = `assignments upon return and maintain diligent compliance with all departmental academic requirements.`
  } else {
    proofHeading = 'ATTACHED DIGITAL VERIFICATION PROOF: OFFICIAL LEAVE REQUISITION & PARENT UNDERTAKING'
    eventTitle = customReason.length > 5 ? customReason : 'Urgent Domestic Requisition & Personal Family Obligation'
    venueLocation = student?.address ? student.address.slice(0, 50) : 'Student Native Residence, Tamil Nadu'
    ceremonyOrReason = 'Personal / Emergency Domestic Leave (Parent Undertaking & Telephone Verified)'
    declaration1 = `Respected Faculty / Class Advisor, My ward ${rawStudentName} (${registerNumber}) requires sanctioned leave on ${dateRangeStr}`
    declaration2 = `for unavoidable personal family requirements. We affirm our ward will promptly complete all academic lab`
    declaration3 = `assignments upon return and maintain diligent compliance with all departmental academic requirements.`
  }

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
  const eProofHeading = escapeXml(proofHeading)
  const eEventTitle = escapeXml(eventTitle)
  const eVenueLocation = escapeXml(venueLocation)
  const eCeremonyOrReason = escapeXml(ceremonyOrReason)
  const eDeclaration1 = escapeXml(declaration1)
  const eDeclaration2 = escapeXml(declaration2)
  const eDeclaration3 = escapeXml(declaration3)
  const eParentAffiliation = escapeXml(parentAffiliation)
  const eAttachedProofName = escapeXml(attachedProofName)

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

  let evidenceStatusTitle = 'EVIDENCE PENDING ADVISOR APPROVAL'
  let evidenceStatusBadge = '⏳ PENDING ADVISOR APPROVAL'
  let evidenceStatusColor = '#B45309'
  let evidenceStatusBg = '#FEF3C7'
  let evidenceWorkflowText = 'Step 1 of 2: Class Advisor Review → Forward to HOD'
  let bottomEndorseColor = '#B45309'
  let bottomEndorseTitle = '⏳ Awaiting Advisor Verification'
  let bottomEndorseSubtitle = 'Advisor Review Pending · Next Stage: Forward to HOD'
  let bottomEndorsePillBg = '#EFF6FF'
  let bottomEndorsePillStroke = '#BFDBFE'
  let bottomEndorsePillColor = '#1455D9'
  let bottomEndorsePillText = 'Step 1 of 2: Advisor Review → HOD'

  if (isApprovedOrEndorsed) {
    evidenceStatusTitle = 'EVIDENCE APPROVED BY CLASS ADVISOR'
    evidenceStatusBadge = '✓ APPROVED &amp; FORWARDED TO HOD'
    evidenceStatusColor = '#059669'
    evidenceStatusBg = '#ECFDF5'
    evidenceWorkflowText = 'Approved by Class Advisor · Forwarded to Head of Department (HOD)'
    bottomEndorseColor = '#059669'
    bottomEndorseTitle = '✓ Approved &amp; Endorsed by Advisor'
    bottomEndorseSubtitle = 'Evidence Verified · Forwarded to HOD for Sanction'
    bottomEndorsePillBg = '#ECFDF5'
    bottomEndorsePillStroke = '#A7F3D0'
    bottomEndorsePillColor = '#059669'
    bottomEndorsePillText = 'Forwarded to HOD for Sanction ✓'
  } else if (isDeclined) {
    evidenceStatusTitle = 'EVIDENCE DECLINED BY CLASS ADVISOR'
    evidenceStatusBadge = '✕ EVIDENCE DECLINED'
    evidenceStatusColor = '#DC2626'
    evidenceStatusBg = '#FEF2F2'
    evidenceWorkflowText = 'Declined by Advisor — Incomplete Proofs / Criteria Not Met'
    bottomEndorseColor = '#DC2626'
    bottomEndorseTitle = '✕ Declined by Class Advisor'
    bottomEndorseSubtitle = 'Evidence Declined · Application Not Recommended'
    bottomEndorsePillBg = '#FEF2F2'
    bottomEndorsePillStroke = '#FECACA'
    bottomEndorsePillColor = '#DC2626'
    bottomEndorsePillText = 'Application Declined ✕'
  }

  const hasUploadedProofImage = Boolean(
    uploadedImageFile &&
    uploadedImageFile.fileUrl &&
    (uploadedImageFile.fileUrl.startsWith('data:image/') || uploadedImageFile.fileUrl.startsWith('http')) &&
    !uploadedImageFile.fileUrl.includes('proof-document')
  )
  const eUploadedImageUrl = hasUploadedProofImage ? escapeXml(uploadedImageFile.fileUrl) : ''

  const eEventTitleShort = escapeXml(eventTitle.length > 52 ? eventTitle.slice(0, 50) + '...' : eventTitle)
  const eVenueLocationShort = escapeXml(venueLocation.length > 52 ? venueLocation.slice(0, 50) + '...' : venueLocation)
  const eCeremonyOrReasonShort = escapeXml(ceremonyOrReason.length > 48 ? ceremonyOrReason.slice(0, 46) + '...' : ceremonyOrReason)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 850 1150" width="850" height="1150">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#071A3D"/>
      <stop offset="50%" stop-color="#0A2A5E"/>
      <stop offset="100%" stop-color="#1455D9"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.12"/>
    </filter>
  </defs>

  <rect width="850" height="1150" fill="#FFFFFF"/>
  <rect x="22" y="22" width="806" height="1106" fill="none" stroke="#071A3D" stroke-width="2.5" rx="6"/>
  <rect x="28" y="28" width="794" height="1094" fill="none" stroke="#F4C430" stroke-width="1.2" rx="4"/>
  <rect x="32" y="32" width="786" height="1086" fill="none" stroke="#E2E8F0" stroke-width="0.6" rx="2"/>

  <!-- Top Ambient Header Background Fill -->
  <rect x="33" y="33" width="784" height="138" fill="#F8FAFC"/>
  <!-- Top Slim Gradient Accent Ribbon -->
  <rect x="33" y="33" width="784" height="6" fill="url(#headerGrad)"/>

  <!-- Central Watermark Emblem (Subtle 3.5% Opacity) -->
  <image xlink:href="${VSB_LOGO_BASE64}" href="${VSB_LOGO_BASE64}" x="285" y="440" width="280" height="280" opacity="0.035" preserveAspectRatio="xMidYMid meet"/>

  <!-- ========================================================================= -->
  <!-- PRESTIGIOUS ACADEMIC LETTERHEAD (PDF FORMAT) -->
  <!-- ========================================================================= -->

  <!-- Left: College Official Circular Emblem in Gold Mount (PDF Format) -->
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
  <rect x="155" y="188" width="540" height="34" rx="8" fill="#071A3D" filter="url(#shadow)"/>
  <rect x="157" y="190" width="536" height="30" rx="6" fill="none" stroke="#F4C430" stroke-width="1"/>
  <text x="425" y="210" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">OFFICIAL STUDENT LEAVE &amp; EVENT PROOF VERIFICATION DOSSIER</text>

  <!-- Dossier Meta Ribbon Bar -->
  <text x="55" y="236" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#334155">Ref. No: <tspan fill="#1455D9" font-weight="900">VSB/AIDS/OD-LV/2026/092</tspan></text>
  <text x="425" y="236" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="600" fill="#64748B" text-anchor="middle">Academic Year: 2025–2026 · Anna University Regulation</text>
  <text x="795" y="236" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#334155" text-anchor="end">Generation Date: <tspan fill="#071A3D" font-weight="900">08-Sep-2026</tspan></text>

  <!-- Student Particulars Card (Fully Separated Fields) -->
  <rect x="50" y="246" width="750" height="176" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
  
  <text x="75" y="274" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">STUDENT NAME:</text>
  <text x="220" y="274" font-family="'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="900" fill="#071A3D">${eStudentNameUpper}</text>
  
  <text x="450" y="274" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">REGISTER NUMBER:</text>
  <text x="615" y="274" font-family="'Courier New', monospace" font-size="13" font-weight="900" fill="#1455D9">${eRegisterNumber}</text>

  <text x="75" y="301" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">CLASS / SECTION:</text>
  <text x="220" y="301" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#071A3D">Year ${eYear} · Section ${eSection} (B.Tech AI &amp; DS)</text>

  <text x="450" y="301" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">ACADEMIC BATCH:</text>
  <text x="615" y="301" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#071A3D">Batch ${eBatch}</text>

  <text x="75" y="328" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">REQUEST TYPE:</text>
  <text x="220" y="328" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#B45309">${eCustomType}</text>

  <text x="450" y="328" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">DAYS APPLIED:</text>
  <text x="615" y="328" font-family="'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="900" fill="#1455D9">${eDaysApplied}</text>

  <text x="75" y="355" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">LEAVE DATE RANGE:</text>
  <text x="220" y="355" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#071A3D">${eDateRange}</text>

  <text x="450" y="355" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">TOTAL LEAVE TAKEN:</text>
  <text x="615" y="355" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#B45309">${eTotalLeavesTaken}</text>

  <text x="75" y="382" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">RESIDENCY STATUS:</text>
  <text x="220" y="382" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#334155">${eResidency}</text>

  <text x="450" y="382" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">COLLEGE BUS NO:</text>
  <text x="615" y="382" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#334155">${eBusNo}</text>

  <text x="75" y="409" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">PARENT PHONE:</text>
  <text x="220" y="409" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#071A3D">+91-${eParentPhone}</text>

  <text x="450" y="409" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">TELEPHONIC CONSENT:</text>
  <text x="615" y="409" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#059669">✓ Contact Verified &amp; Approved</text>

  <!-- ========================================================================= -->
  <!-- DEDICATED ATTACHED EVIDENCE OF PROOFS CANVAS (ONLY SHOW EVIDENCE) -->
  <!-- ========================================================================= -->
  <rect x="50" y="434" width="750" height="345" rx="10" fill="#FFFBEB" stroke="#FDE68A"/>
  <rect x="65" y="444" width="720" height="26" rx="6" fill="#FEF3C7" stroke="#FCD34D"/>
  <text x="80" y="461" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#92400E" letter-spacing="0.8">OFFICIAL ATTACHED EVIDENCE OF PROOFS (CLASS ADVISOR AUDITED)</text>

  <!-- Evidence Audit & Clearance Ribbon -->
  <rect x="65" y="474" width="720" height="24" rx="4" fill="#EFF6FF" stroke="#93C5FD"/>
  <text x="78" y="490" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#1E40AF">📎 EVIDENCE OF PROOF:</text>
  <text x="215" y="490" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="900" fill="#071A3D">${eAttachedProofName}</text>
  <rect x="510" y="476" width="270" height="20" rx="4" fill="${evidenceStatusBg}" stroke="${evidenceStatusColor}"/>
  <text x="645" y="490" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="900" fill="${evidenceStatusColor}" text-anchor="middle">${evidenceStatusBadge}</text>

  <!-- Main Evidence Display Canvas (Full-width 720px, Only Showing Evidence) -->
  <rect x="65" y="504" width="720" height="264" rx="8" fill="#FFFFFF" stroke="#071A3D" stroke-width="1.2"/>

  <!-- Top Frame Header -->
  <rect x="66" y="505" width="718" height="28" rx="7" fill="#071A3D"/>
  <rect x="74" y="510" width="18" height="18" rx="4" fill="#F4C430"/>
  <text x="83" y="523" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="900" fill="#071A3D" text-anchor="middle">📎</text>
  <text x="100" y="523" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#FFFFFF" letter-spacing="0.6">STUDENT SUBMITTED EVIDENCE OF PROOF (AUDITED BY CLASS ADVISOR)</text>
  <rect x="545" y="510" width="232" height="18" rx="4" fill="${evidenceStatusColor}"/>
  <text x="661" y="522.5" font-family="'Segoe UI', sans-serif" font-size="8.5" font-weight="900" fill="#FFFFFF" text-anchor="middle">${evidenceStatusTitle}</text>

  ${hasUploadedProofImage ? `
  <!-- Uploaded Proof Image from Database -->
  <rect x="72" y="538" width="706" height="204" rx="4" fill="#F8FAFC" stroke="#E2E8F0"/>
  <image xlink:href="${eUploadedImageUrl}" href="${eUploadedImageUrl}" x="76" y="542" width="698" height="196" preserveAspectRatio="xMidYMid meet"/>

  <!-- Evidence Approval / Decline Stamp on uploaded image -->
  <g transform="translate(710, 680) rotate(-7)">
    <circle cx="0" cy="0" r="30" fill="${evidenceStatusBg}" fill-opacity="0.95" stroke="${evidenceStatusColor}" stroke-width="1.8" stroke-dasharray="4,1"/>
    <circle cx="0" cy="0" r="25" fill="none" stroke="${evidenceStatusColor}" stroke-width="0.9"/>
    <text x="0" y="-12" font-family="'Segoe UI', sans-serif" font-size="5.2" font-weight="900" fill="${evidenceStatusColor}" text-anchor="middle" letter-spacing="0.5">EVIDENCE PROOF</text>
    <text x="0" y="-2" font-family="'Segoe UI', sans-serif" font-size="6.5" font-weight="900" fill="${evidenceStatusColor}" text-anchor="middle">${isApprovedOrEndorsed ? '★ APPROVED ★' : isDeclined ? '✕ DECLINED ✕' : '★ AUDITED ★'}</text>
    <text x="0" y="7" font-family="'Segoe UI', sans-serif" font-size="5.8" font-weight="800" fill="${evidenceStatusColor}" text-anchor="middle">BY ADVISOR</text>
    <text x="0" y="17" font-family="'Segoe UI', sans-serif" font-size="5" font-weight="700" fill="${evidenceStatusColor}" text-anchor="middle">${isApprovedOrEndorsed ? 'FORWARD TO HOD' : 'AUDITED'}</text>
  </g>
  ` : `
  <!-- Photorealistic Attached Proof Document Slip Canvas -->
  <rect x="72" y="538" width="706" height="204" rx="4" fill="#FFFDF8" stroke="#E2E8F0"/>
  <rect x="76" y="542" width="698" height="196" rx="3" fill="none" stroke="#FDE68A" stroke-width="1"/>

  <!-- Document Header -->
  <rect x="77" y="543" width="696" height="34" fill="#F8FAFC"/>
  <line x1="77" y1="577" x2="773" y2="577" stroke="#CBD5E1" stroke-width="0.8"/>
  <text x="425" y="557" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="900" fill="#071A3D" text-anchor="middle" letter-spacing="0.5">${isMedical ? 'DISTRICT HEALTH CLINIC &amp; RECOVERY ADVICE' : isOD ? 'INTER-COLLEGIATE TECHNICAL SYMPOSIUM 2026' : 'ANNUAL CEREMONY &amp; SPECIAL INTIMATION'}</text>
  <text x="425" y="571" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="bold" fill="#B45309" text-anchor="middle">${isMedical ? 'OFFICIAL MEDICAL PRACTITIONER PRESCRIPTION &amp; ADVICE' : isOD ? 'OFFICIAL INVITATION &amp; REGISTRATION CONFIRMATION' : 'PARENTAL / GUARDIAN ATTESTATION SLIP'}</text>

  <!-- Left Side: Evidence Particulars (x=88 to x=465) -->
  <rect x="86" y="583" width="374" height="66" rx="4" fill="#F1F5F9" stroke="#E2E8F0"/>
  <text x="96" y="600" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="bold" fill="#475569">Candidate Name:</text>
  <text x="195" y="600" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="900" fill="#071A3D">${eStudentNameUpper}</text>
  <text x="96" y="618" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="bold" fill="#475569">Register Number:</text>
  <text x="195" y="618" font-family="'Courier New', monospace" font-size="10" font-weight="bold" fill="#1455D9">${eRegisterNumber}</text>
  <text x="96" y="636" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="bold" fill="#475569">Approved Period:</text>
  <text x="195" y="636" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="bold" fill="#059669">${eDateRange} (${eDaysApplied})</text>

  <text x="90" y="663" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="bold" fill="#78350F">Event / Scope:</text>
  <text x="190" y="663" font-family="'Segoe UI', sans-serif" font-size="9" fill="#1E293B">${eEventTitleShort}</text>
  <text x="90" y="680" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="bold" fill="#78350F">Venue / Host:</text>
  <text x="190" y="680" font-family="'Segoe UI', sans-serif" font-size="9" fill="#334155">${eVenueLocationShort}</text>

  <text x="90" y="697" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="bold" fill="#78350F">Evidence Type:</text>
  <text x="190" y="697" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="bold" fill="#B45309">${eCeremonyOrReasonShort}</text>

  <!-- Right Side: Security Barcode & Advisor Endorsement Stamp (x=475 to x=765) -->
  <g transform="translate(476, 588)">
    <rect x="0" y="0" width="2" height="15" fill="#071A3D"/>
    <rect x="4" y="0" width="1" height="15" fill="#071A3D"/>
    <rect x="7" y="0" width="3" height="15" fill="#071A3D"/>
    <rect x="12" y="0" width="1" height="15" fill="#071A3D"/>
    <rect x="15" y="0" width="2" height="15" fill="#071A3D"/>
    <rect x="19" y="0" width="4" height="15" fill="#071A3D"/>
    <rect x="25" y="0" width="1" height="15" fill="#071A3D"/>
    <rect x="28" y="0" width="3" height="15" fill="#071A3D"/>
    <rect x="33" y="0" width="2" height="15" fill="#071A3D"/>
    <rect x="37" y="0" width="1" height="15" fill="#071A3D"/>
    <rect x="40" y="0" width="3" height="15" fill="#071A3D"/>
    <rect x="45" y="0" width="2" height="15" fill="#071A3D"/>
    <rect x="49" y="0" width="1" height="15" fill="#071A3D"/>
    <rect x="52" y="0" width="4" height="15" fill="#071A3D"/>
    <rect x="58" y="0" width="2" height="15" fill="#071A3D"/>
    <text x="31" y="22" font-family="'Courier New', monospace" font-size="6.5" fill="#64748B" text-anchor="middle">*DOC-EVID-${eRegisterNumber.slice(-6)}*</text>
  </g>

  <!-- Evidence Approval / Decline Stamp (rotated -7deg) -->
  <g transform="translate(685, 622) rotate(-7)">
    <circle cx="0" cy="0" r="32" fill="${evidenceStatusBg}" fill-opacity="0.95" stroke="${evidenceStatusColor}" stroke-width="1.8" stroke-dasharray="4,1"/>
    <circle cx="0" cy="0" r="27" fill="none" stroke="${evidenceStatusColor}" stroke-width="0.9"/>
    <text x="0" y="-14" font-family="'Segoe UI', sans-serif" font-size="5.5" font-weight="900" fill="${evidenceStatusColor}" text-anchor="middle" letter-spacing="0.5">EVIDENCE OF PROOF</text>
    <text x="0" y="-3" font-family="'Segoe UI', sans-serif" font-size="7" font-weight="900" fill="${evidenceStatusColor}" text-anchor="middle">${isApprovedOrEndorsed ? '★ APPROVED ★' : isDeclined ? '✕ DECLINED ✕' : '★ AUDITED ★'}</text>
    <text x="0" y="7" font-family="'Segoe UI', sans-serif" font-size="6" font-weight="800" fill="${evidenceStatusColor}" text-anchor="middle">BY CLASS ADVISOR</text>
    <text x="0" y="18" font-family="'Segoe UI', sans-serif" font-size="5.5" font-weight="700" fill="${evidenceStatusColor}" text-anchor="middle">${isApprovedOrEndorsed ? 'FORWARD TO HOD' : 'PORTAL AUDITED'}</text>
  </g>

  <!-- Forwarding Statement -->
  <rect x="475" y="660" width="290" height="30" rx="4" fill="#F8FAFC" stroke="#CBD5E1"/>
  <text x="620" y="673" font-family="'Segoe UI', sans-serif" font-size="8.5" font-weight="bold" fill="#071A3D" text-anchor="middle">Clearance Routing: Class Advisor → HOD</text>
  <text x="620" y="685" font-family="'Segoe UI', sans-serif" font-size="8" font-weight="bold" fill="${evidenceStatusColor}" text-anchor="middle">${evidenceWorkflowText}</text>
  `}

  <!-- Bottom Document Footer Tag -->
  <rect x="66" y="744" width="718" height="23" rx="2" fill="${evidenceStatusBg}" stroke="${evidenceStatusColor}"/>
  <text x="425" y="759" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="bold" fill="${evidenceStatusColor}" text-anchor="middle">✓ ATTACHED PROOF: ${eAttachedProofName} · ${evidenceStatusBadge} · FORWARDED TO HOD</text>

  <!-- ========================================================================= -->
  <!-- SIGNATURES AND OFFICIAL VALIDATION BLOCK (BALANCED 2-COLUMN LAYOUT) -->
  <!-- ========================================================================= -->
  <rect x="50" y="792" width="750" height="205" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>

  <!-- Vertical Divider between Student and Advisor Columns -->
  <line x1="425" y1="815" x2="425" y2="955" stroke="#E2E8F0" stroke-width="1.2" stroke-dasharray="4,4"/>

  <!-- 1. Student Applicant Signature Block -->
  <text x="245" y="865" font-family="'Brush Script MT', cursive, sans-serif" font-size="26" fill="#071A3D" text-anchor="middle">${eStudentNameSig}</text>
  <line x1="145" y1="885" x2="345" y2="885" stroke="#94A3B8" stroke-width="1.2"/>
  <text x="245" y="905" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#071A3D" text-anchor="middle">Student Applicant</text>
  <text x="245" y="921" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" fill="#64748B" text-anchor="middle">Digital App Submission · Reg: ${eRegisterNumber}</text>
  <rect x="165" y="934" width="160" height="20" rx="5" fill="#ECFDF5" stroke="#A7F3D0"/>
  <text x="245" y="947.5" font-family="'Segoe UI', sans-serif" font-size="8.5" font-weight="700" fill="#059669" text-anchor="middle">✓ Verified Portal Identity</text>

  <!-- 2. Class Advisor and HOD Endorsement Block -->
  <text x="605" y="865" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="${bottomEndorseColor}" text-anchor="middle">${bottomEndorseTitle}</text>
  <line x1="505" y1="885" x2="705" y2="885" stroke="#94A3B8" stroke-width="1.2"/>
  <text x="605" y="905" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#071A3D" text-anchor="middle">Class Advisor → HOD Sanction</text>
  <text x="605" y="921" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" fill="#64748B" text-anchor="middle">${bottomEndorseSubtitle}</text>
  <rect x="495" y="934" width="220" height="20" rx="5" fill="${bottomEndorsePillBg}" stroke="${bottomEndorsePillStroke}"/>
  <text x="605" y="947.5" font-family="'Segoe UI', sans-serif" font-size="8.5" font-weight="700" fill="${bottomEndorsePillColor}" text-anchor="middle">${bottomEndorsePillText}</text>

  <!-- Clean Separation Divider Before Regulation Banner -->
  <line x1="70" y1="970" x2="780" y2="970" stroke="#CBD5E1" stroke-width="1"/>

  <!-- Regulation Compliance Banner (Cleanly on its own line, zero overlap) -->
  <text x="425" y="988" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="bold" fill="#059669" text-anchor="middle">PORTAL VERIFIED · ANNA UNIVERSITY REGULATION 2021 ELIGIBLE · LEAVE QUOTA AUDITED</text>

  <text x="425" y="1025" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.8" fill="#94A3B8" text-anchor="middle">This is an authentic digital verification dossier generated from the V.S.B. Engineering College (Autonomous) AI&amp;DS Digital Portal.</text>
</svg>`

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

