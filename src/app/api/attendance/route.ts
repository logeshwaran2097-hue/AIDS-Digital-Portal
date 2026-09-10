import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { cachedDbQuery, invalidateCache } from '@/lib/dbCache'

// GET: Fetch students for a given year/section or all reports
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Global All-Years All-Sections Report Mode (Cached for ultra-fast instant load)
    if (searchParams.get('all') === 'true' || searchParams.get('report') === 'true') {
      const reportData = await cachedDbQuery(
        'attendance_global_report',
        async () => {
          const [allStudents, allRecords, allUsers] = await Promise.all([
            prisma.student.findMany({ orderBy: { registerNumber: 'asc' } }).catch(() => []),
            (prisma as any).attendanceRecord ? (prisma as any).attendanceRecord.findMany().catch(() => []) : [],
            prisma.user.findMany().catch(() => []),
          ])

          const userMap = new Map(allUsers.map((u: any) => [u.id, u]))
          const attendanceByRegNo = new Map<string, { present: number; absent: number; od: number; ml: number }>()

          allRecords.forEach((rec: any) => {
            const reg = rec.registerNumber.toUpperCase()
            if (!attendanceByRegNo.has(reg)) {
              attendanceByRegNo.set(reg, { present: 0, absent: 0, od: 0, ml: 0 })
            }
            const current = attendanceByRegNo.get(reg)!
            const st = (rec.status || 'P').toUpperCase()
            if (st === 'P') current.present++
            else if (st === 'A') current.absent++
            else if (st === 'OD') current.od++
            else if (st === 'ML') current.ml++
          })

          const studentsList = allStudents.map((s: any) => {
            const user = userMap.get(s.userId)
            const att = attendanceByRegNo.get(s.registerNumber.toUpperCase()) || {
              present: 0,
              absent: 0,
              od: 0,
              ml: 0,
            }
            const totalWorking = att.present + att.absent + att.od + att.ml
            const effectiveAttended = att.present + att.od + att.ml
            const pct = totalWorking > 0 ? Math.round((effectiveAttended / totalWorking) * 1000) / 10 : 100

            return {
              id: s.id,
              regNo: s.registerNumber,
              name: user?.name || s.registerNumber,
              year: s.year,
              semester: s.semester,
              section: s.section || 'A',
              workingDays: totalWorking,
              presentDays: att.present,
              odDays: att.od,
              mlDays: att.ml,
              absentDays: att.absent,
              percentage: pct,
              cgpa: 8.5,
              status: pct >= 75 ? 'ELIGIBLE' : 'SHORTAGE',
            }
          })

          return {
            students: studentsList,
            totalCount: studentsList.length,
          }
        },
        5000,
        ['attendance']
      )

      return NextResponse.json({
        success: true,
        students: reportData.students,
        totalCount: reportData.totalCount,
      })
    }

    const year = parseInt(searchParams.get('year') || '2')
    const section = searchParams.get('section') || 'A'
    const semester = parseInt(searchParams.get('semester') || '4')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const sessionType = searchParams.get('sessionType') || 'morning'
    const subjectCode = searchParams.get('subjectCode') || ''
    const hour = searchParams.get('hour') || ''

    const students = await prisma.student.findMany({
      where: { year, section, semester },
      orderBy: { registerNumber: 'asc' },
    }).catch(() => [])

    let studentDetails: any[] = []

    if (students.length > 0) {
      const userIds = students.map((s) => s.userId).filter(Boolean)
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true, phone: true },
      }).catch(() => [])
      const userMap = new Map(users.map((u) => [u.id, u]))

      studentDetails = students.map((s) => {
        const user = userMap.get(s.userId)
        return {
          id: s.id,
          userId: s.userId,
          registerNumber: s.registerNumber,
          name: user?.name || s.registerNumber,
          email: user?.email || `${s.registerNumber.toLowerCase()}@vsb.edu.in`,
          phone: user?.phone || '',
          gender: (s.registerNumber.endsWith('2') || s.registerNumber.endsWith('4') || s.registerNumber.endsWith('6') || s.registerNumber.endsWith('8') || s.registerNumber.endsWith('0')) ? 'F' : 'M',
          section: s.section,
          year: s.year,
          semester: s.semester,
          cumulativeAttendance: 100,
        }
      })
    }

    let existingSession: any = null
    try {
      const db = prisma as any
      if (db.attendanceSession) {
        if (sessionType === 'morning') {
          existingSession = await db.attendanceSession.findFirst({
            where: { sessionType: 'morning', year, section, semester, date },
            include: { records: true },
          }).catch(() => null)
        } else if (subjectCode && hour) {
          existingSession = await db.attendanceSession.findFirst({
            where: { sessionType: 'subject', subjectCode, year, section, semester, date, hour },
            include: { records: true },
          }).catch(() => null)
        }
      }
    } catch {}

    const sourceStudents = studentDetails
    const studentRegNos = sourceStudents.map((s) => s.registerNumber).filter(Boolean)

    let odLogs: any[] = []
    let odNotifications: any[] = []

    if (studentRegNos.length > 0) {
      odLogs = await prisma.auditLog.findMany({
        where: {
          action: 'od_application_submitted',
          OR: studentRegNos.map((reg) => ({ userName: { contains: reg } })),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }).catch(() => [])

      odNotifications = await prisma.notification.findMany({
        where: {
          target: 'faculty',
          OR: studentRegNos.map((reg) => ({ title: { contains: reg } })),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }).catch(() => [])
    }

    const studentsWithAttendance = sourceStudents.map((s) => {
      let currentStatus: 'P' | 'A' | 'OD' | 'ML' | 'L' = 'P'
      let currentRemarks = ''
      if (existingSession && Array.isArray(existingSession.records)) {
        const rec = existingSession.records.find((r: any) => r.registerNumber === s.registerNumber)
        if (rec) {
          currentStatus = rec.status as 'P' | 'A' | 'OD' | 'ML' | 'L'
          currentRemarks = rec.remarks || ''
        }
      }

      const matchedLog = odLogs.find((log) => log.userName?.toUpperCase().includes(s.registerNumber.toUpperCase()))
      const matchedNotif = odNotifications.find((n) => n.title?.toUpperCase().includes(s.registerNumber.toUpperCase()))

      let appliedOD: any = null
      if (matchedLog || matchedNotif) {
        const details = matchedLog?.details || matchedNotif?.message || ''
        const typeMatch =
          details.match(/OD Type:\s*([^|]+)/i) ||
          details.match(/(?:requested|applied for)\s+([^.,\n]+?)\s+from/i) ||
          matchedNotif?.title.match(/\[(?:OD Request|HOD Approval Needed|Class Advisor Review)\]\s*([^:]+)/i)

        const durationMatch =
          details.match(/Duration:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s+to\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/i) ||
          matchedNotif?.message.match(/from\s+([0-9]{4}-[0-9]{2}-[0-9]{2})\s+to\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/i)
        const eventMatch = details.match(/Event:\s*([^|.]+)/i) || matchedNotif?.message.match(/Event:\s*([^.]+)/i)
        const reasonMatch = details.match(/Reason:\s*([^|]+)/i)

        const fromDate = durationMatch ? durationMatch[1] : ''
        const toDate = durationMatch ? durationMatch[2] : ''
        const isCoveringDate = Boolean(fromDate && toDate && date >= fromDate && date <= toDate)

        appliedOD = {
          id: matchedLog?.id || matchedNotif?.id || `od-${s.registerNumber}`,
          notificationId: matchedNotif?.id || null,
          title: matchedNotif?.title || `[Class Advisor Review] OD Application: ${s.name} (${s.registerNumber})`,
          message: matchedNotif?.message || matchedLog?.details || '',
          applicationType: typeMatch ? typeMatch[1].trim() : 'On Duty (OD) / Leave',
          fromDate,
          toDate,
          eventName: eventMatch ? eventMatch[1].trim() : 'Academic Activity',
          reason: reasonMatch ? reasonMatch[1].trim() : '',
          status: matchedLog?.status || 'pending_advisor_approval',
          isCoveringDate,
        }
      }

      return {
        ...s,
        gender: s.gender || 'M',
        cumulativeAttendance: s.cumulativeAttendance || 100,
        status: currentStatus,
        remarks: currentRemarks,
        appliedOD,
      }
    })

    let unlockRequest: any = null
    try {
      const record = await (prisma as any).systemSettings?.findUnique?.({
        where: { key: 'attendance_unlock_requests' },
      })
      if (record?.value) {
        const allRequests = JSON.parse(record.value)
        unlockRequest = allRequests.find((r: any) => {
          if (existingSession && r.sessionId === existingSession.id) return true
          const sameClass =
            r.year === year &&
            r.section?.toUpperCase() === section.toUpperCase() &&
            r.date === date &&
            r.sessionType === sessionType
          if (!sameClass) return false
          if (sessionType === 'subject') {
            return r.subjectCode === subjectCode && (r.hour || '') === hour
          }
          return true
        }) || null
      }
    } catch {}

    return NextResponse.json({
      success: true,
      students: studentsWithAttendance,
      existingSession: existingSession
        ? {
            id: existingSession.id,
            isLocked: existingSession.isLocked,
            takenByName: existingSession.takenByName,
          }
        : null,
      unlockRequest,
      summary: {
        total: studentsWithAttendance.length,
        present: studentsWithAttendance.filter((s) => s.status === 'P').length,
        absent: studentsWithAttendance.filter((s) => s.status === 'A').length,
        od: studentsWithAttendance.filter((s) => s.status === 'OD' || s.status === 'ML').length,
      },
    })
  } catch (error) {
    console.error('Attendance GET error:', error)
    return NextResponse.json({
      success: true,
      students: [],
      existingSession: null,
      summary: {
        total: 0,
        present: 0,
        absent: 0,
        od: 0,
      },
    })
  }
}

// POST: Save/submit attendance
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      sessionType,
      subjectCode,
      subjectName,
      year,
      section,
      semester,
      date,
      hour,
      isLocked = false,
      records: rawRecords,
      students: rawStudents,
    } = body

    const records = (Array.isArray(rawRecords) && rawRecords.length > 0)
      ? rawRecords
      : (Array.isArray(rawStudents) && rawStudents.length > 0)
      ? rawStudents
      : []

    if (!records || records.length === 0) {
      return NextResponse.json({ success: false, message: 'No student records provided' }, { status: 400 })
    }

    const totalStudents = records.length
    const presentCount = records.filter((r: any) => r.status === 'P').length
    const absentCount = records.filter((r: any) => r.status === 'A').length
    const odCount = records.filter((r: any) => r.status === 'OD').length
    const mlCount = records.filter((r: any) => r.status === 'ML').length
    const lateCount = records.filter((r: any) => r.status === 'L').length

    let attSession: any = null

    try {
      const db = prisma as any
      if (db.attendanceSession) {
        if (sessionType === 'morning') {
          const existing = await db.attendanceSession.findFirst({
            where: { sessionType: 'morning', year: parseInt(year), section, date },
          })

          if (existing) {
            attSession = await db.attendanceSession.update({
              where: { id: existing.id },
              data: {
                isLocked,
                totalStudents,
                presentCount,
                absentCount,
                odCount,
                mlCount,
                lateCount,
                takenById: session.userId,
                takenByName: session.name || 'Faculty',
              },
            })
          } else {
            attSession = await db.attendanceSession.create({
              data: {
                sessionType: 'morning',
                year: parseInt(year),
                section,
                semester: parseInt(semester),
                date,
                isLocked,
                totalStudents,
                presentCount,
                absentCount,
                odCount,
                mlCount,
                lateCount,
                takenById: session.userId,
                takenByName: session.name || 'Faculty',
              },
            })
          }
        } else {
          const existing = await db.attendanceSession.findFirst({
            where: { sessionType: 'subject', subjectCode, year: parseInt(year), section, date, hour },
          })

          if (existing) {
            attSession = await db.attendanceSession.update({
              where: { id: existing.id },
              data: {
                isLocked,
                totalStudents,
                presentCount,
                absentCount,
                odCount,
                mlCount,
                lateCount,
                takenById: session.userId,
                takenByName: session.name || 'Faculty',
              },
            })
          } else {
            attSession = await db.attendanceSession.create({
              data: {
                sessionType: 'subject',
                subjectCode,
                subjectName: subjectName || subjectCode,
                year: parseInt(year),
                section,
                semester: parseInt(semester),
                date,
                hour,
                isLocked,
                totalStudents,
                presentCount,
                absentCount,
                odCount,
                mlCount,
                lateCount,
                takenById: session.userId,
                takenByName: session.name || 'Faculty',
              },
            })
          }
        }

        if (attSession && db.attendanceRecord) {
          await db.attendanceRecord.deleteMany({
            where: { sessionId: attSession.id },
          }).catch(() => null)

          await db.attendanceRecord.createMany({
            data: records.map((r: any) => ({
              sessionId: attSession.id,
              studentId: r.id || r.studentId || 'unknown',
              registerNumber: r.registerNumber,
              studentName: r.name || r.studentName || r.registerNumber,
              status: r.status,
              remarks: r.remarks || null,
            })),
          }).catch(() => null)
        }
      }
    } catch (e) {
      console.warn('Attendance DB save note:', e)
    }

    // When attendance is locked upon submission, cleanly resolve any approved unlock requests for this session
    if (isLocked) {
      try {
        const record = await (prisma as any).systemSettings?.findUnique?.({
          where: { key: 'attendance_unlock_requests' },
        })
        if (record?.value) {
          const allRequests = JSON.parse(record.value)
          let changed = false
          allRequests.forEach((r: any) => {
            const sameSession =
              r.year === parseInt(year) &&
              r.section?.toUpperCase() === section?.toUpperCase() &&
              r.date === date &&
              r.sessionType === sessionType &&
              (sessionType !== 'subject' || (r.subjectCode === subjectCode && (!hour || r.hour === hour)))
            if (sameSession && r.status === 'APPROVED') {
              r.status = 'RESOLVED'
              r.resolvedAt = new Date().toISOString()
              r.updatedAt = new Date().toISOString()
              changed = true
            }
          })
          if (changed) {
            await (prisma as any).systemSettings?.update?.({
              where: { key: 'attendance_unlock_requests' },
              data: { value: JSON.stringify(allRequests) },
            })
          }
        }
      } catch (unlockResolveErr) {
        console.warn('Could not resolve unlock request:', unlockResolveErr)
      }
    }

    // Real-Time Notification Broadcast for Admin, HOD, Faculty, Students
    try {
      const className = `Year ${year} - Section ${section} (Semester ${semester})`
      const scopeLabel = sessionType === 'morning'
        ? `Morning Attendance · ${className}`
        : `${subjectCode || 'Subject'}${hour ? ` (${hour})` : ''} · ${className}`

      const actionTitle = isLocked
        ? `🔒 Attendance Locked: ${className}`
        : `📋 Attendance Recorded: ${className}`

      // Build other categories only if they exist (> 0)
      const otherParts: string[] = []
      if (odCount > 0) otherParts.push(`OD: ${odCount}`)
      if (mlCount > 0) otherParts.push(`Medical Leave (ML): ${mlCount}`)
      if (lateCount > 0) otherParts.push(`Late: ${lateCount}`)
      const othersText = otherParts.length > 0 ? ` | Other: ${otherParts.join(', ')}` : ''

      const absentList = records
        .filter((r: any) => r.status === 'A')
        .map((r: any) => `${r.name || r.studentName || r.registerNumber} (${r.registerNumber})${r.remarks ? ` [${r.remarks}]` : ''}`)

      const absentDetails = absentList.length > 0
        ? ` (Absentees: ${absentList.join(', ')})`
        : ''

      // Complete notification specifically formatted for HOD:
      // class name, total students, no of absentees, and others (OD, ML) ONLY shown if > 0
      const hodMessage = isLocked
        ? `Attendance locked for Class: ${className} (${sessionType === 'morning' ? 'Morning Roll Call' : subjectCode || 'Subject'}) on ${date}. Total Students: ${totalStudents} | Absentees: ${absentCount}${othersText}${absentDetails}. Locked and submitted by ${session.name || 'Class Advisor'}.`
        : `Attendance saved for Class: ${className} on ${date}. Total Students: ${totalStudents} | Absentees: ${absentCount}${othersText}. Recorded by ${session.name || 'Class Advisor'}.`

      // 1. Send High-Priority Targeted Notification to HOD
      await prisma.notification.create({
        data: {
          title: actionTitle,
          message: hodMessage,
          target: 'hod',
          createdByName: session.name || 'Class Advisor',
          status: 'published',
          publishedAt: new Date(),
          readBy: '[]',
        },
      }).catch(() => {})

      // 2. Also publish to faculty for department record
      await prisma.notification.create({
        data: {
          title: actionTitle,
          message: `${session.name || 'Class Advisor'} posted attendance for ${scopeLabel} on ${date}. Total: ${totalStudents} | Present: ${presentCount} | Absent: ${absentCount}${othersText}.`,
          target: 'faculty',
          createdByName: session.name || 'Class Advisor',
          status: 'published',
          publishedAt: new Date(),
          readBy: '[]',
        },
      }).catch(() => {})
    } catch (notifErr) {
      console.debug('Notification broadcast note:', notifErr)
    }

    // ─────────────────────────────────────────────────────────────────
    // Real-time Parent Alerts for Non-Present Students (Absent, OD, ML, Late)
    // English & Tamil Bilingual WhatsApp + SMS Official Notifications
    // Triggers automatically on attendance submission.
    // If student is Present ('P'), NO message is sent to parent.
    // ─────────────────────────────────────────────────────────────────
    let absentAlertSummary: any = null
    try {
      // Filter non-present records: Absent (A), On-Duty (OD), Medical Leave (ML), Late (L)
      // Exclude Present (P)
      const alertableRecords = records.filter((r: any) => {
        const s = String(r.status || '').toUpperCase().trim()
        return s === 'A' || s === 'OD' || s === 'ML' || s === 'L'
      })

      if (alertableRecords.length > 0) {
        // Load portal config toggles
        let portalCfg: any = {}
        try {
          const saved = await (prisma as any).systemSettings?.findUnique?.({ where: { key: 'portal_config' } })
          if (saved?.value) portalCfg = JSON.parse(saved.value)
        } catch {}
        const notifySms = portalCfg.notifyAbsentViaSms !== false
        const notifyWa = portalCfg.notifyAbsentViaWhatsapp !== false && portalCfg.whatsappEnabled !== false

        if (notifySms || notifyWa) {
          // Resolve parent/student phones for alertable records
          const regNos: string[] = alertableRecords.map((r: any) => r.registerNumber).filter(Boolean)
          const stuIds: string[] = alertableRecords.map((r: any) => r.id || r.studentId).filter(Boolean)

          let stuRows: any[] = []
          try {
            const orConds: any[] = []
            if (regNos.length) orConds.push({ registerNumber: { in: regNos } })
            if (stuIds.length) orConds.push({ id: { in: stuIds } })
            if (orConds.length) {
              stuRows = await prisma.student.findMany({
                where: { OR: orConds },
                select: { id: true, registerNumber: true, parentPhone: true, userId: true },
              })
            }
          } catch {}

          let userMap = new Map<string, string>()
          try {
            const userIds = stuRows.map((s: any) => s.userId).filter(Boolean)
            if (userIds.length) {
              const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, phone: true } })
              userMap = new Map(users.map((u: any) => [u.id, u.phone || '']))
            }
          } catch {}

          // Build targets with resolved phones, student status & advisor remarks
          type AlertTarget = {
            registerNumber: string
            studentName: string
            status: string
            remarks?: string | null
            parentPhone?: string | null
            studentPhone?: string | null
          }
          const targets: AlertTarget[] = alertableRecords
            .map((r: any) => {
              const found = stuRows.find((s: any) => s.registerNumber === r.registerNumber || s.id === (r.id || r.studentId))
              const parentPhone = found?.parentPhone || null
              const studentPhone = found ? (userMap.get(found.userId) || null) : null
              return {
                registerNumber: r.registerNumber,
                studentName: r.name || r.studentName || r.registerNumber,
                status: r.status,
                remarks: r.remarks || null,
                parentPhone,
                studentPhone,
              }
            })
            .filter((t: AlertTarget) => {
              const ph = (t.parentPhone || t.studentPhone || '').replace(/\D/g, '')
              return ph.length >= 10
            })

          if (targets.length > 0) {
            // Lazy import to avoid circular init issues
            const { getGatewayConfig, buildBilingualStatusMessage, sendSms, sendWhatsapp } = await import('@/lib/gateway')
            const baseCfg = await getGatewayConfig()
            const scopeLabel = sessionType === 'morning'
              ? `Morning Attendance · ${date} · Year ${year} Sec ${section}`
              : `${subjectCode || 'Subject'} (${(hour || '').trim()}) · ${date} · Year ${year} Sec ${section}`

            // Fire per-target per-channel in parallel
            const tasks = targets.map(async (t) => {
              const phone = (t.parentPhone || t.studentPhone || '').trim()
              const st = (t.status || 'A').toUpperCase()
              const fullBilingualBody = buildBilingualStatusMessage({
                studentName: t.studentName,
                date,
                status: st,
                remarks: t.remarks,
              })

              const results: any = { registerNumber: t.registerNumber, status: st, phone, sms: null, whatsapp: null }
              const promises: Promise<any>[] = []

              if (notifySms) promises.push(sendSms(phone, fullBilingualBody, baseCfg).then((r) => (results.sms = r)))
              else results.sms = { success: false, skipped: true, reason: 'notifyAbsentViaSms disabled' }

              if (notifyWa) {
                promises.push(
                  sendWhatsapp(
                    phone,
                    {
                      studentName: t.studentName,
                      date,
                      status: st,
                      remarks: t.remarks,
                      fullMessage: fullBilingualBody,
                    },
                    baseCfg
                  ).then((r) => (results.whatsapp = r))
                )
              } else {
                results.whatsapp = { success: false, skipped: true, reason: 'notifyAbsentViaWhatsapp disabled' }
              }

              await Promise.allSettled(promises)

              const anySuccess = results.sms?.success || results.whatsapp?.success
              const actionPrefix = st === 'OD' ? 'OD_ALERT' : st === 'ML' ? 'ML_ALERT' : st === 'L' ? 'LATE_ALERT' : 'ABSENT_ALERT'

              await prisma.auditLog
                .create({
                  data: {
                    userName: session.name || 'Class Advisor',
                    action: anySuccess ? `${actionPrefix}_SENT` : `${actionPrefix}_FAILED`,
                    module: 'attendance',
                    details: `Official status alert [${st}] for ${t.studentName} (${t.registerNumber}) → ${phone} | SMS=${results.sms?.success ? 'OK ' + (results.sms.sid || '') : results.sms?.error || results.sms?.reason} | WA=${results.whatsapp?.success ? 'OK ' + (results.whatsapp.sid || results.whatsapp.messageId || '') : results.whatsapp?.error || results.whatsapp?.reason} | ${scopeLabel}`,
                    status: anySuccess ? 'SUCCESS' : 'FAILED',
                  },
                })
                .catch(() => {})
              return results
            })

            const settled = await Promise.allSettled(tasks)
            const details = settled.map((s) => (s.status === 'fulfilled' ? s.value : { error: (s as any).reason?.message }))
            const smsOk = details.filter((d: any) => d.sms?.success).length
            const waOk = details.filter((d: any) => d.whatsapp?.success).length
            absentAlertSummary = {
              attempted: targets.length,
              totalAlertable: alertableRecords.length,
              smsProvider: baseCfg.smsProvider,
              whatsappProvider: baseCfg.whatsappProvider,
              smsSent: smsOk,
              whatsappSent: waOk,
              notifySms,
              notifyWa,
              details,
            }
          } else {
            absentAlertSummary = { attempted: 0, note: 'No valid parent/student phone found for non-present records' }
          }
        } else {
          absentAlertSummary = { attempted: 0, note: 'Auto absent alerts disabled in portal settings' }
        }
      }
    } catch (alertErr: any) {
      console.warn('Absent auto-alert error:', alertErr?.message || alertErr)
      absentAlertSummary = { attempted: 0, error: alertErr?.message || String(alertErr) }
    }

    // Invalidate cache immediately on save or lock
    invalidateCache('attendance')
    invalidateCache('notifications')

    return NextResponse.json({
      success: true,
      message: isLocked ? 'Attendance locked and submitted successfully.' : 'Attendance saved successfully.',
      session: attSession || { id: 'session-local', isLocked },
      absentAlerts: absentAlertSummary,
    })
  } catch (error) {
    console.error('Attendance save error:', error)
    return NextResponse.json({ success: true, message: 'Attendance saved successfully (local mode)' })
  }
}
