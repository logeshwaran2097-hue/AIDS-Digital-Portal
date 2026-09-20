import { prisma } from '@/lib/prisma'
import { cachedDbQuery } from '@/lib/dbCache'

export async function syncSanctionedODsForStudent(regNo: string, studentInfo?: any) {
  if (!regNo) return []
  const activeReg = regNo.trim().toUpperCase()

  return cachedDbQuery(
    `sync_sanctioned_ods_${activeReg}`,
    async () => syncSanctionedODsDirect(activeReg, studentInfo),
    4000,
    ['od_proofs', 'attendance']
  )
}

async function syncSanctionedODsDirect(activeReg: string, studentInfo?: any) {
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

  // 2, 3, 4. Fetch auditLogs, attendance records, and existing proofs in parallel!
  const [auditLogs, odAttendance, existingProofs] = await Promise.all([
    prisma.auditLog.findMany({
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
    }).catch(() => []),
    prisma.attendanceRecord.findMany({
      where: {
        registerNumber: activeReg,
        status: 'OD',
      },
      take: 30,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.oDProof.findMany({
      where: { registerNumber: activeReg },
      orderBy: { createdAt: 'desc' },
    }).catch(() => [] as any[]),
  ])

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

    if (isExecutiveSanction) {
      allocateSanctionedAttendance({
        registerNumber: activeReg,
        studentName: studentUserName,
        fromDate: eventDate,
        toDate: eventDate,
        eventName,
        applicationType: category,
        sanctionedBy: 'Head of Department',
      }).catch(() => {})
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

export interface AllocateSanctionedAttendanceParams {
  registerNumber: string
  studentName?: string
  fromDate?: string
  toDate?: string
  dates?: string
  applicationType?: string
  eventName?: string
  sanctionedBy?: string
}

/**
 * Automatically allocates attendance records for all applied days
 * when an OD / Leave application is sanctioned by HOD or Executive authority.
 * Creates or updates AttendanceSession and AttendanceRecord with 'OD' or 'ML' status.
 */
export async function allocateSanctionedAttendance(params: AllocateSanctionedAttendanceParams) {
  const { registerNumber, studentName, applicationType, eventName, sanctionedBy } = params
  if (!registerNumber) return { success: false, allocatedDays: 0, dates: [] }

  const regUpper = registerNumber.trim().toUpperCase()

  // 1. Resolve student info
  const student = await prisma.student.findFirst({
    where: { registerNumber: regUpper },
  }).catch(() => null)

  if (!student) {
    console.warn(`[allocateSanctionedAttendance] Student not found for ${regUpper}`)
    return { success: false, allocatedDays: 0, dates: [] }
  }

  // 2. Resolve fromDate and toDate
  let from = params.fromDate
  let to = params.toDate

  if ((!from || !to) && params.dates) {
    const match = params.dates.match(/([0-9]{4}-[0-9]{2}-[0-9]{2})\s*(?:to|-|→)\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i)
    if (match) {
      from = from || match[1]
      to = to || match[2]
    } else {
      const singleMatch = params.dates.match(/([0-9]{4}-[0-9]{2}-[0-9]{2})/)
      if (singleMatch) {
        from = from || singleMatch[1]
        to = to || singleMatch[1]
      }
    }
  }

  if (!from) from = new Date().toISOString().split('T')[0]
  if (!to) to = from

  // 3. Build array of calendar dates
  const fromTime = new Date(from).getTime()
  const toTime = new Date(to).getTime()
  const startDate = new Date(fromTime <= toTime ? from : to)
  const endDate = new Date(fromTime <= toTime ? to : from)

  const dateList: string[] = []
  const cursor = new Date(startDate)
  let loopLimit = 45

  while (cursor <= endDate && loopLimit-- > 0) {
    const dayOfWeek = cursor.getDay() // 0 = Sunday
    const dStr = cursor.toISOString().split('T')[0]
    // Sundays are not calculated in academic attendance: strictly skip Sundays
    if (dayOfWeek !== 0) {
      dateList.push(dStr)
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  // 4. Determine status: OD or ML (both count as attendance credited in academic portal)
  const typeLower = (applicationType || '').toLowerCase()
  let attendanceStatus = 'OD'
  if (typeLower.includes('medical') || typeLower.includes('ml')) {
    attendanceStatus = 'ML'
  } else if (typeLower.includes('leave')) {
    // Sanctioned leave granted as official attendance credit
    attendanceStatus = 'OD'
  }

  let studentDisplayName = studentName
  if (!studentDisplayName && student.userId) {
    try {
      const u = await prisma.user.findUnique({ where: { id: student.userId } })
      if (u?.name) studentDisplayName = u.name
    } catch {}
  }
  if (!studentDisplayName) studentDisplayName = student.registerNumber

  const reviewerName = sanctionedBy || 'Head of Department'
  const remarksText = `Officially sanctioned by ${reviewerName}: ${eventName || applicationType || 'On-Duty Attendance Credited'}`

  let recordsAllocated = 0

  for (const dateStr of dateList) {
    try {
      // Find existing sessions for this class on this date
      const existingSessions = await prisma.attendanceSession.findMany({
        where: {
          year: student.year || 2,
          section: student.section || 'B',
          date: dateStr,
        },
      }).catch(() => [])

      if (existingSessions.length > 0) {
        for (const sess of existingSessions) {
          const existingRec = await prisma.attendanceRecord.findFirst({
            where: {
              sessionId: sess.id,
              registerNumber: regUpper,
            },
          })

          if (existingRec) {
            await prisma.attendanceRecord.update({
              where: { id: existingRec.id },
              data: {
                status: attendanceStatus,
                remarks: remarksText,
              },
            })
          } else {
            await prisma.attendanceRecord.create({
              data: {
                sessionId: sess.id,
                studentId: student.id,
                registerNumber: regUpper,
                studentName: studentDisplayName,
                gender: 'M',
                status: attendanceStatus,
                remarks: remarksText,
              },
            })
          }
          recordsAllocated++
        }
      } else {
        // Create an official Roll Call session for this date to record the sanctioned attendance
        const sessionKeyHour = 'Official Roll Call'
        const subjectCode = 'OD-CREDIT'
        let session = await prisma.attendanceSession.findFirst({
          where: {
            sessionType: 'morning',
            subjectCode,
            year: student.year || 2,
            section: student.section || 'B',
            semester: student.semester || 3,
            date: dateStr,
            hour: sessionKeyHour,
          },
        })

        if (!session) {
          session = await prisma.attendanceSession.create({
            data: {
              sessionType: 'morning',
              subjectCode,
              subjectName: eventName || applicationType || 'Sanctioned Academic Activity',
              year: student.year || 2,
              section: student.section || 'B',
              semester: student.semester || 3,
              academicYear: student.batch || '2025-2029',
              periodType: 'Theory',
              date: dateStr,
              hour: sessionKeyHour,
              takenByFacultyId: student.advisorName || 'HOD',
              takenByName: reviewerName,
              isLocked: true,
            },
          })
        }

        const existingRec = await prisma.attendanceRecord.findFirst({
          where: {
            sessionId: session.id,
            registerNumber: regUpper,
          },
        })

        if (existingRec) {
          await prisma.attendanceRecord.update({
            where: { id: existingRec.id },
            data: {
              status: attendanceStatus,
              remarks: remarksText,
            },
          })
        } else {
          await prisma.attendanceRecord.create({
            data: {
              sessionId: session.id,
              studentId: student.id,
              registerNumber: regUpper,
              studentName: studentDisplayName,
              gender: 'M',
              status: attendanceStatus,
              remarks: remarksText,
            },
          })
        }
        recordsAllocated++
      }
    } catch (err) {
      console.warn(`[allocateSanctionedAttendance] Failed on date ${dateStr}:`, err)
    }
  }

  // 5. Update or create corresponding ODProof entry with attendanceCredited: true
  try {
    const existingProof = await prisma.oDProof.findFirst({
      where: {
        registerNumber: regUpper,
        eventDate: from,
      },
    })

    if (existingProof) {
      await prisma.oDProof.update({
        where: { id: existingProof.id },
        data: {
          status: 'verified',
          attendanceCredited: true,
          verifiedByName: reviewerName,
          verifiedAt: new Date(),
          advisorRemarks: `HOD Sanctioned: Attendance credited for ${dateList.length} day(s).`,
        },
      })
    } else {
      await prisma.oDProof.create({
        data: {
          studentId: student.id,
          registerNumber: regUpper,
          studentName: studentDisplayName,
          year: student.year || 2,
          section: student.section || 'B',
          semester: student.semester || 3,
          eventName: eventName || applicationType || 'Sanctioned Academic Activity',
          category: typeLower.includes('hackathon')
            ? 'Hackathon'
            : typeLower.includes('paper')
            ? 'Paper Presentation'
            : typeLower.includes('internship')
            ? 'Internship'
            : 'Academic Activity',
          eventDate: from,
          venueCollege: 'Official Academic Host',
          status: 'verified',
          attendanceCredited: true,
          verifiedByName: reviewerName,
          verifiedAt: new Date(),
          advisorRemarks: `HOD Sanctioned: Attendance credited for ${dateList.length} day(s).`,
        },
      })
    }
  } catch (err) {
    console.warn('[allocateSanctionedAttendance] ODProof note:', err)
  }

  // 6. Invalidate caches for attendance and reports
  try {
    const { invalidateCache } = await import('@/lib/dbCache')
    invalidateCache('attendance')
    invalidateCache('attendance_global_report')
    invalidateCache(`sync_sanctioned_ods_${regUpper}`)
    invalidateCache('od_proofs')
  } catch {}

  return { success: true, allocatedDays: dateList.length, dates: dateList, recordsAllocated }
}

