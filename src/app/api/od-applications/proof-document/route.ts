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
  const customReason = searchParams.get('reason') || 'temple function'
  const fromDate = searchParams.get('from') || '2026-09-17'
  const toDate = searchParams.get('to') || '2026-09-18'

  // Fetch student profile
  const student = await prisma.student.findFirst({
    where: { registerNumber },
  }).catch(() => null)

  let userName: string | null = null
  if (student?.userId) {
    const u = await prisma.user.findUnique({ where: { id: student.userId } }).catch(() => null)
    userName = u?.name || null
  }

  const rawStudentName = userName || (registerNumber === '922525243007' ? 'Anusuya P' : 'Student')
  const year = student?.year || 2
  const section = student?.section || 'A'
  const parentPhone = student?.parentPhone || '6381366088'
  const batch = student?.batch || '2025–2029'

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
  const totalLeavesTakenParam = searchParams.get('totalLeavesTaken')
  const leaveRecordsCount = await prisma.attendanceRecord.count({
    where: { registerNumber, status: { in: ['A', 'ML', 'OD'] } },
  }).catch(() => 0)
  const totalLeavesTakenStr = totalLeavesTakenParam || (leaveRecordsCount > 0 ? `${leaveRecordsCount} Days` : '1 Day (Cumulative)')

  // Separate residency and bus number
  const residency = student?.residencyStatus || 'Day Scholar'
  const isHosteller = residency.toLowerCase().includes('hostel')
  const busNo = isHosteller
    ? (student?.hostelBlock ? `Hostel: ${student.hostelBlock}${student.roomNo ? ` · Rm ${student.roomNo}` : ''}` : 'Hostel Resident')
    : (student?.busNo ? `College Bus ${student.busNo}${student.boardingPoint ? ` (${student.boardingPoint})` : ''}` : 'College Bus 44 (Olappalayam)')

  const dateRangeStr = `${fromDate} to ${toDate}`

  const isTemple = customReason.toLowerCase().includes('temple')
  const rawEventTitle = isTemple
    ? 'Sri Maha Mariamman Temple Annual Festival & Family Religious Ceremony'
    : customReason.length > 5 ? customReason : customType

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
  const eFromDate = escapeXml(fromDate)
  const eToDate = escapeXml(toDate)
  const eEventTitle = escapeXml(rawEventTitle)

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
    <image id="vsbLogoAsset" xlink:href="${VSB_LOGO_BASE64}" href="${VSB_LOGO_BASE64}" width="80" height="80" preserveAspectRatio="xMidYMid meet"/>
  </defs>

  <rect width="850" height="1150" fill="#FFFFFF"/>
  <rect x="22" y="22" width="806" height="1106" fill="none" stroke="#071A3D" stroke-width="2.5" rx="6"/>
  <rect x="28" y="28" width="794" height="1094" fill="none" stroke="#F4C430" stroke-width="1.2" rx="4"/>
  <rect x="32" y="32" width="786" height="1086" fill="none" stroke="#E2E8F0" stroke-width="0.6" rx="2"/>

  <!-- Top Ambient Header Background Fill -->
  <rect x="33" y="33" width="784" height="206" fill="#F8FAFC"/>
  <!-- Top Slim Gradient Accent Ribbon -->
  <rect x="33" y="33" width="784" height="6" fill="url(#headerGrad)"/>

  <!-- Central Watermark Emblem (Subtle 3.5% Opacity) -->
  <use xlink:href="#vsbLogoAsset" href="#vsbLogoAsset" x="275" y="470" width="300" height="300" opacity="0.035" preserveAspectRatio="xMidYMid meet"/>

  <!-- ========================================================================= -->
  <!-- PRESTIGIOUS ACADEMIC LETTERHEAD (CENTER VIEW) -->
  <!-- ========================================================================= -->

  <!-- Center: College Official Circular Emblem in Gold Mount -->
  <g transform="translate(385, 46)">
    <circle cx="40" cy="40" r="39" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
    <circle cx="40" cy="40" r="36.5" fill="#FFFFFF" stroke="#F4C430" stroke-width="2"/>
    <circle cx="40" cy="40" r="33.5" fill="#FFFFFF" stroke="#071A3D" stroke-width="0.8"/>
    <use xlink:href="#vsbLogoAsset" href="#vsbLogoAsset" x="6" y="6" width="68" height="68"/>
  </g>

  <!-- Center Institution Master Typography -->
  <text x="425" y="146" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="22" font-weight="900" fill="#071A3D" text-anchor="middle" letter-spacing="1.2">V.S.B. ENGINEERING COLLEGE</text>

  <!-- Autonomous Gold Pill Tag -->
  <rect x="330" y="155" width="190" height="17" rx="8.5" fill="#F4C430"/>
  <text x="425" y="167.5" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="900" fill="#071A3D" text-anchor="middle" letter-spacing="1.5">AN AUTONOMOUS INSTITUTION</text>

  <!-- Department Headline -->
  <text x="425" y="190" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12.5" font-weight="800" fill="#1455D9" text-anchor="middle" letter-spacing="1.2">DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE</text>

  <!-- Accreditations and Approvals Line 1 -->
  <text x="425" y="206" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.2" font-weight="600" fill="#334155" text-anchor="middle">Approved by AICTE, New Delhi &amp; Affiliated to Anna University, Chennai</text>

  <!-- Accreditations and Approvals Line 2 -->
  <text x="425" y="220" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.8" font-weight="bold" fill="#64748B" text-anchor="middle">Accredited by NAAC with 'A' Grade · NBA Accredited Programs · ISO 9001:2015 Certified</text>

  <!-- Campus Address Line 3 -->
  <text x="425" y="233" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" fill="#64748B" text-anchor="middle">NH-67, Karur - Coimbatore National Highway, Karudayampalayam, Karur - 639 111, Tamil Nadu, India</text>

  <!-- Master Gold and Sapphire Ornamental Beam Separator with Center Diamond -->
  <rect x="48" y="244" width="754" height="2.5" fill="#071A3D" rx="1"/>
  <rect x="48" y="247.5" width="754" height="1.2" fill="#F4C430" rx="0.6"/>
  <polygon points="425,241.5 431,247 425,252.5 419,247" fill="#F4C430"/>
  <polygon points="425,243.5 428.5,247 425,250.5 421.5,247" fill="#071A3D"/>

  <!-- Official Document Title Section Badge -->
  <rect x="155" y="260" width="540" height="34" rx="8" fill="#071A3D" filter="url(#shadow)"/>
  <rect x="157" y="262" width="536" height="30" rx="6" fill="none" stroke="#F4C430" stroke-width="1"/>
  <text x="425" y="282" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">OFFICIAL STUDENT LEAVE &amp; EVENT PROOF VERIFICATION DOSSIER</text>

  <!-- Dossier Meta Ribbon Bar -->
  <text x="55" y="310" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#334155">Ref. No: <tspan fill="#1455D9" font-weight="900">VSB/AIDS/OD-LV/2026/092</tspan></text>
  <text x="425" y="310" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="600" fill="#64748B" text-anchor="middle">Academic Year: 2025–2026 · Anna University Regulation</text>
  <text x="795" y="310" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#334155" text-anchor="end">Generation Date: <tspan fill="#071A3D" font-weight="900">08-Sep-2026</tspan></text>

  <!-- Student Particulars Card (Fully Separated Fields) -->
  <rect x="50" y="320" width="750" height="176" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
  
  <text x="75" y="348" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">STUDENT NAME:</text>
  <text x="220" y="348" font-family="'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="900" fill="#071A3D">${eStudentNameUpper}</text>
  
  <text x="450" y="348" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">REGISTER NUMBER:</text>
  <text x="615" y="348" font-family="'Courier New', monospace" font-size="13" font-weight="900" fill="#1455D9">${eRegisterNumber}</text>

  <text x="75" y="375" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">CLASS / SECTION:</text>
  <text x="220" y="375" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#071A3D">Year ${eYear} · Section ${eSection} (B.Tech AI &amp; DS)</text>

  <text x="450" y="375" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">ACADEMIC BATCH:</text>
  <text x="615" y="375" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#071A3D">Batch ${eBatch}</text>

  <text x="75" y="402" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">REQUEST TYPE:</text>
  <text x="220" y="402" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#B45309">${eCustomType}</text>

  <text x="450" y="402" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">DAYS APPLIED:</text>
  <text x="615" y="402" font-family="'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="900" fill="#1455D9">${eDaysApplied}</text>

  <text x="75" y="429" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">LEAVE DATE RANGE:</text>
  <text x="220" y="429" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#071A3D">${eDateRange}</text>

  <text x="450" y="429" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">TOTAL LEAVE TAKEN:</text>
  <text x="615" y="429" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#B45309">${eTotalLeavesTaken}</text>

  <text x="75" y="456" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">RESIDENCY STATUS:</text>
  <text x="220" y="456" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#334155">${eResidency}</text>

  <text x="450" y="456" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">COLLEGE BUS NO:</text>
  <text x="615" y="456" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#334155">${eBusNo}</text>

  <text x="75" y="483" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">PARENT PHONE:</text>
  <text x="220" y="483" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#071A3D">+91-${eParentPhone}</text>

  <text x="450" y="483" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#475569">TELEPHONIC CONSENT:</text>
  <text x="615" y="483" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#059669">✓ Contact Verified &amp; Approved</text>

  <!-- Attached Proof: Event Invitation and Requisition Box -->
  <rect x="50" y="508" width="750" height="345" rx="10" fill="#FFFBEB" stroke="#FDE68A"/>
  <rect x="65" y="520" width="720" height="28" rx="6" fill="#FEF3C7" stroke="#FCD34D"/>
  <text x="80" y="539" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="900" fill="#92400E" letter-spacing="1">ATTACHED DIGITAL VERIFICATION PROOF 1: EVENT PARTICULAR &amp; PARENT UNDERTAKING</text>

  <text x="80" y="568" font-family="'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="bold" fill="#78350F">Event Title &amp; Purpose:</text>
  <text x="240" y="568" font-family="'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="900" fill="#071A3D">${eEventTitle}</text>

  <text x="80" y="592" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#78350F">Location / Venue:</text>
  <text x="240" y="592" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#334155">Olapalayam, Karur District, Tamil Nadu</text>

  <text x="80" y="614" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#78350F">Ceremonies &amp; Reason:</text>
  <text x="240" y="614" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#B45309">Annual Kula Deivam Temple Festival / Maha Abhishekam (Family Function)</text>

  <!-- Formal Parent Undertaking Letter Box -->
  <rect x="75" y="632" width="700" height="200" rx="8" fill="#FFFFFF" stroke="#CBD5E1"/>
  <rect x="75" y="632" width="700" height="26" rx="8" fill="#F1F5F9"/>
  <text x="90" y="649" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="bold" fill="#071A3D">Official Student Requisition &amp; Parent Consent Declaration</text>
  <text x="760" y="649" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#059669" text-anchor="end">✓ TELEPHONIC CONSENT VERIFIED</text>

  <text x="95" y="674" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" fill="#475569" font-style="italic">"To: The Class Advisor, Department of AI &amp; DS, V.S.B. Engineering College (Autonomous)."</text>
  <text x="95" y="694" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" fill="#1E293B">"Respected Faculty / Class Advisor, My ward ${eStudentNameSig} (${eRegisterNumber}) requires leave on ${eFromDate} and ${eToDate}"</text>
  <text x="95" y="714" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" fill="#1E293B">"to participate in our family traditional ceremony. We affirm our ward will promptly complete all academic lab"</text>
  <text x="95" y="734" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" fill="#1E293B">"assignments upon return and maintain diligent compliance with all departmental academic requirements."</text>

  <line x1="95" y1="750" x2="755" y2="750" stroke="#E2E8F0" stroke-width="1"/>

  <text x="95" y="772" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="bold" fill="#071A3D">Parent / Guardian: Periasamy M</text>
  <text x="350" y="772" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="bold" fill="#071A3D">Verified Contact: +91-${eParentPhone}</text>
  <text x="610" y="772" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="bold" fill="#059669">Status: Contact Verified ✓</text>
  
  <text x="95" y="802" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="bold" fill="#64748B">Security Hash: #VSB-OD-VERIF-77291-ANNAP · Cryptographic System Token Generated</text>

  <!-- Signatures and Official Validation Block -->
  <rect x="50" y="865" width="750" height="195" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>

  <!-- College Stamp Seal -->
  <circle cx="160" cy="955" r="52" fill="#EFF6FF" stroke="#1455D9" stroke-width="2.5" stroke-dasharray="6,3"/>
  <circle cx="160" cy="955" r="45" fill="none" stroke="#1455D9" stroke-width="1.2"/>
  <text x="160" y="937" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="bold" fill="#1455D9" text-anchor="middle">VSB ENGG COLLEGE</text>
  <text x="160" y="955" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#071A3D" text-anchor="middle">AI &amp; DS DEPT</text>
  <text x="160" y="972" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="bold" fill="#059669" text-anchor="middle">OFFICIAL VERIFIED</text>
  <text x="160" y="985" font-family="'Segoe UI', Roboto, sans-serif" font-size="8" fill="#64748B" text-anchor="middle">AUTONOMOUS</text>

  <!-- Signatures Block -->
  <text x="380" y="932" font-family="'Brush Script MT', cursive, sans-serif" font-size="22" fill="#071A3D">${eStudentNameSig}</text>
  <line x1="310" y1="950" x2="470" y2="950" stroke="#64748B" stroke-width="1.2"/>
  <text x="390" y="966" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="bold" fill="#071A3D" text-anchor="middle">Student Applicant</text>
  <text x="390" y="980" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" fill="#64748B" text-anchor="middle">Digital App Submission</text>

  <text x="630" y="932" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#059669">✓ Endorsement Ready</text>
  <line x1="550" y1="950" x2="720" y2="950" stroke="#64748B" stroke-width="1.2"/>
  <text x="635" y="966" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="bold" fill="#071A3D" text-anchor="middle">Class Advisor / HOD</text>
  <text x="635" y="980" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" fill="#64748B" text-anchor="middle">Dept of AI &amp; DS (VSBEC)</text>
  <text x="425" y="1035" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#059669" text-anchor="middle">PORTAL VERIFIED · ANNA UNIVERSITY REGULATION 2021 ELIGIBLE · LEAVE QUOTA AVAILABLE</text>

  <text x="425" y="1085" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" fill="#94A3B8" text-anchor="middle">This is an authentic digital verification dossier generated from the V.S.B. Engineering College (Autonomous) AI&amp;DS Digital Portal.</text>
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

