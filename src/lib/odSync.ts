import { prisma } from '@/lib/prisma'

export async function syncSanctionedODsForStudent(regNo: string, studentInfo?: any) {
  if (!regNo) return []

  const activeReg = regNo.trim().toUpperCase()

  // 1. Fetch student info if not provided
  let student = studentInfo
  if (!student) {
    student = await prisma.student.findFirst({
      where: { registerNumber: activeReg },
    }).catch(() => null)
  }

  let studentUserName = student?.user?.name || student?.name || 'Student'
  if (student?.userId && !student?.user?.name) {
    try {
      const u = await prisma.user.findUnique({ where: { id: student.userId } })
      if (u?.name) studentUserName = u.name
    } catch {}
  }

  // 2. Fetch all audit logs for this student relating to OD applications / sanctions
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { userName: { contains: activeReg } },
        { details: { contains: activeReg } },
      ],
      AND: [
        {
          OR: [
            { action: 'od_application_submitted' },
            { action: { contains: 'od' } },
            { details: { contains: 'OD' } },
            { details: { contains: 'On-Duty' } },
            { details: { contains: 'sanction' } },
          ],
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  }).catch(() => [])

  // 3. Fetch attendance records marked as 'OD'
  const odAttendance = await prisma.attendanceRecord.findMany({
    where: {
      registerNumber: activeReg,
      status: 'OD',
    },
    take: 30,
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  // 4. Existing proofs
  const existingProofs: any[] = await prisma.oDProof.findMany({
    where: { registerNumber: activeReg },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [] as any[])

  // 5. Parse and sync each audit log
  for (const log of auditLogs) {
    const details = log.details || ''
    
    // Check if executive sanction log
    const isExecutiveSanction =
      log.action.includes('sanction') ||
      details.includes('HOD granted executive sanction') ||
      details.includes('Super Admin sanctioned') ||
      log.status === 'approved_by_hod' ||
      log.status === 'approved'

    const isAdvisorSigned =
      details.includes('Advisor signed off') ||
      details.includes('Endorsed by Class Advisor') ||
      log.status === 'endorsed_by_advisor'

    // Extract event name
    let eventName = ''
    const eventMatch = details.match(/Event:\s*([^.|]+)/i)
    if (eventMatch && eventMatch[1].trim()) {
      eventName = eventMatch[1].trim()
    } else {
      const typeMatch = details.match(/OD Type:\s*([^|]+)/i)
      eventName = typeMatch ? typeMatch[1].trim() : 'External Academic / Hackathon Event'
    }

    // Extract dates
    let eventDate = new Date().toISOString().split('T')[0]
    const durationMatch = details.match(/Duration:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i)
    if (durationMatch) {
      eventDate = durationMatch[1]
    } else if (log.createdAt) {
      eventDate = new Date(log.createdAt).toISOString().split('T')[0]
    }

    // Extract category
    let category = 'Hackathon'
    if (/symposium/i.test(details) || /symposium/i.test(eventName)) category = 'Symposium'
    else if (/workshop/i.test(details) || /workshop/i.test(eventName)) category = 'Workshop'
    else if (/paper/i.test(details) || /conference/i.test(eventName)) category = 'Paper Presentation'
    else if (/project|expo/i.test(details) || /expo/i.test(eventName)) category = 'Project Expo'
    else if (/sports/i.test(details)) category = 'Sports'
    else if (/internship|industrial/i.test(details)) category = 'Internship'

    // Check if proof already exists
    const alreadyExists = existingProofs.find(
      (p) =>
        (p.odRequestId && p.odRequestId === log.id) ||
        (p.eventName.toLowerCase() === eventName.toLowerCase() && p.eventDate === eventDate)
    )

    if (!alreadyExists) {
      try {
        const created = await prisma.oDProof.create({
          data: {
            studentId: student?.id || null,
            registerNumber: activeReg,
            studentName: studentUserName,
            year: student?.year || 2,
            section: student?.section || 'B',
            semester: student?.semester || 3,
            odRequestId: log.id,
            eventName,
            category,
            eventDate,
            venueCollege: 'Academic Host Venue',
            status: isExecutiveSanction ? 'verified' : isAdvisorSigned ? 'under_review' : 'pending_proofs',
            advisorRemarks: isExecutiveSanction
              ? 'HOD Sanctioned: Officially sanctioned for On-Duty attendance credit.'
              : isAdvisorSigned
              ? 'Advisor Endorsed: Recommended for attendance credit upon proof submission.'
              : 'Sanctioned OD Event: Please upload live venue geo-tag photo & completion certificate.',
            attendanceCredited: Boolean(isExecutiveSanction),
            verifiedByName: isExecutiveSanction ? 'Head of Department' : isAdvisorSigned ? 'Class Advisor' : null,
            verifiedAt: isExecutiveSanction ? new Date() : null,
          },
        })
        existingProofs.unshift(created)
      } catch (err) {
        console.warn('Could not auto-create ODProof from audit log:', err)
      }
    } else if (isExecutiveSanction && alreadyExists.status !== 'verified') {
      try {
        const updated = await prisma.oDProof.update({
          where: { id: alreadyExists.id },
          data: {
            status: 'verified',
            attendanceCredited: true,
            verifiedByName: 'Head of Department',
            verifiedAt: new Date(),
            advisorRemarks: 'HOD Sanctioned: Officially sanctioned for On-Duty attendance credit.',
          },
        })
        const idx = existingProofs.findIndex((p) => p.id === alreadyExists.id)
        if (idx !== -1) existingProofs[idx] = updated
      } catch {}
    }
  }

  // 6. Sync from attendance records with status 'OD'
  for (const att of odAttendance) {
    const attDateStr = new Date(att.createdAt).toISOString().split('T')[0]
    const alreadyExists = existingProofs.find((p) => p.eventDate === attDateStr)
    if (!alreadyExists) {
      try {
        const created = await prisma.oDProof.create({
          data: {
            studentId: student?.id || null,
            registerNumber: activeReg,
            studentName: studentUserName,
            year: student?.year || 2,
            section: student?.section || 'B',
            semester: student?.semester || 3,
            eventName: 'Sanctioned On-Duty Attendance',
            category: 'Academic Event',
            eventDate: attDateStr,
            venueCollege: 'Official College / External Venue',
            status: 'verified',
            advisorRemarks: 'Attendance Record: On-Duty (OD) attendance officially credited on attendance roll.',
            attendanceCredited: true,
            verifiedByName: 'Class Advisor',
            verifiedAt: new Date(),
          },
        })
        existingProofs.unshift(created)
      } catch {}
    }
  }

  return existingProofs
}
