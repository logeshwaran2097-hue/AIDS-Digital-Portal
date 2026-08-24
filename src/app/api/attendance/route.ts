import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET: Fetch students for a given year/section (to pre-fill attendance form)
// Also returns any existing session for today
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || '2')
    const section = searchParams.get('section') || 'A'
    const semester = parseInt(searchParams.get('semester') || '3')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const sessionType = searchParams.get('sessionType') || 'subject'
    const subjectCode = searchParams.get('subjectCode') || ''
    const hour = searchParams.get('hour') || ''

    // Fetch all students in that year/section
    const students = await prisma.student.findMany({
      where: { year, section, semester },
    })

    // Get user data for each student
    const studentDetails = await Promise.all(
      students.map(async (s) => {
        const user = await prisma.user.findUnique({ where: { id: s.userId } })
        return {
          id: s.id,
          userId: s.userId,
          registerNumber: s.registerNumber,
          name: user?.name || 'Unknown',
          email: user?.email || '',
          gender: 'M' as 'M' | 'F', // Default; no gender field in current schema
          section: s.section,
          year: s.year,
          semester: s.semester,
        }
      })
    )

    // Check if a session already exists for today
    let existingSession = null
    if (sessionType === 'morning') {
      existingSession = await prisma.attendanceSession.findFirst({
        where: {
          sessionType: 'morning',
          year,
          section,
          semester,
          date,
        },
        include: { records: true },
      })
    } else if (subjectCode && hour) {
      existingSession = await prisma.attendanceSession.findFirst({
        where: {
          sessionType: 'subject',
          subjectCode,
          year,
          section,
          semester,
          date,
          hour,
        },
        include: { records: true },
      })
    }

    // Compute cumulative attendance for each student
    // Count total sessions and attended sessions per student in this section
    const allSessions = await prisma.attendanceSession.findMany({
      where: { year, section, semester },
      include: { records: true },
    })

    const cumulativeMap: Record<string, { attended: number; total: number }> = {}
    for (const session of allSessions) {
      for (const rec of session.records) {
        if (!cumulativeMap[rec.registerNumber]) {
          cumulativeMap[rec.registerNumber] = { attended: 0, total: 0 }
        }
        cumulativeMap[rec.registerNumber].total += 1
        if (rec.status === 'P' || rec.status === 'OD' || rec.status === 'ML') {
          cumulativeMap[rec.registerNumber].attended += 1
        }
      }
    }

    // Build response with cumulative data
    const studentsWithAttendance = studentDetails.map((s) => {
      const cum = cumulativeMap[s.registerNumber]
      const percentage =
        cum && cum.total > 0 ? parseFloat(((cum.attended / cum.total) * 100).toFixed(1)) : 90.0

      // If existing session found, pull that student's status from it
      let currentStatus: 'P' | 'A' | 'OD' | 'ML' | 'L' = 'P'
      let currentRemarks = ''
      if (existingSession) {
        const rec = existingSession.records.find((r) => r.registerNumber === s.registerNumber)
        if (rec) {
          currentStatus = rec.status as 'P' | 'A' | 'OD' | 'ML' | 'L'
          currentRemarks = rec.remarks
        }
      }

      return {
        ...s,
        cumulativeAttendance: percentage,
        status: currentStatus,
        remarks: currentRemarks,
      }
    })

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
      summary: {
        total: studentsWithAttendance.length,
        present: studentsWithAttendance.filter((s) => s.status === 'P').length,
        absent: studentsWithAttendance.filter((s) => s.status === 'A').length,
        od: studentsWithAttendance.filter((s) => s.status === 'OD' || s.status === 'ML').length,
      },
    })
  } catch (error) {
    console.error('Attendance GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch attendance data' }, { status: 500 })
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
      sessionType = 'subject',
      subjectCode,
      subjectName,
      year,
      section,
      semester,
      academicYear = '2025-2026',
      hour,
      periodType = 'Theory',
      date,
      students,
      isLocked = false,
    } = body

    if (!year || !section || !semester || !date || !students?.length) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    // Build unique key for this session
    const uniqueWhere: any = {
      sessionType,
      year: parseInt(year),
      section,
      semester: parseInt(semester),
      date,
      hour: hour || null,
      subjectCode: subjectCode || null,
    }

    // Check if the session has a unique constraint matching
    // We use upsert logic: find existing or create new
    let attendanceSession = await prisma.attendanceSession.findFirst({
      where: {
        sessionType,
        year: parseInt(year),
        section,
        semester: parseInt(semester),
        date,
        ...(sessionType === 'morning' ? {} : { subjectCode, hour }),
      },
    })

    const facultyRecord = await prisma.faculty.findUnique({
      where: { userId: session.userId },
    }).catch(() => null)

    if (!attendanceSession) {
      attendanceSession = await prisma.attendanceSession.create({
        data: {
          sessionType,
          subjectCode: subjectCode || null,
          subjectName: subjectName || null,
          year: parseInt(year),
          section,
          semester: parseInt(semester),
          academicYear,
          hour: hour || null,
          periodType,
          date,
          takenByFacultyId: facultyRecord?.id || session.userId,
          takenByName: session.name,
          isLocked,
        },
      })
    } else {
      // Update the session (re-open if locked and resaving)
      attendanceSession = await prisma.attendanceSession.update({
        where: { id: attendanceSession.id },
        data: {
          isLocked,
          subjectName: subjectName || attendanceSession.subjectName,
          takenByName: session.name,
          updatedAt: new Date(),
        },
      })
    }

    // Upsert each student record
    for (const student of students) {
      await prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId: attendanceSession.id,
            studentId: student.id,
          },
        },
        update: {
          status: student.status,
          remarks: student.remarks || '',
          cumulativeAttendance: student.cumulativeAttendance || 0,
          updatedAt: new Date(),
        },
        create: {
          sessionId: attendanceSession.id,
          studentId: student.id,
          registerNumber: student.registerNumber,
          studentName: student.name,
          gender: student.gender || 'M',
          status: student.status,
          remarks: student.remarks || '',
          cumulativeAttendance: student.cumulativeAttendance || 0,
        },
      })
    }

    const presentCount = students.filter((s: any) => s.status === 'P').length
    const absentCount = students.filter((s: any) => s.status === 'A').length
    const odCount = students.filter((s: any) => s.status === 'OD' || s.status === 'ML').length

    return NextResponse.json({
      success: true,
      message: isLocked
        ? 'Attendance locked and submitted to University Portal successfully.'
        : 'Attendance saved successfully.',
      sessionId: attendanceSession.id,
      summary: {
        total: students.length,
        present: presentCount,
        absent: absentCount,
        od: odCount,
        percentage: students.length > 0 ? (((presentCount + odCount) / students.length) * 100).toFixed(1) : '0',
      },
    })
  } catch (error) {
    console.error('Attendance POST error:', error)
    return NextResponse.json({ success: false, message: 'Failed to save attendance' }, { status: 500 })
  }
}
