import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface ClassDefinition {
  className: string
  year: number
  section: string
}

const DEPARTMENT_CLASSES: ClassDefinition[] = [
  { className: 'II AIDS A', year: 2, section: 'A' },
  { className: 'II AIDS B', year: 2, section: 'B' },
  { className: 'II AIDS C', year: 2, section: 'C' },
  { className: 'II AIDS D', year: 2, section: 'D' },
  { className: 'III AIDS A', year: 3, section: 'A' },
  { className: 'III AIDS B', year: 3, section: 'B' },
  { className: 'III AIDS C', year: 3, section: 'C' },
  { className: 'III AIDS D', year: 3, section: 'D' },
  { className: 'IV AIDS A', year: 4, section: 'A' },
  { className: 'IV AIDS B', year: 4, section: 'B' },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const today = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Fetch morning attendance sessions from database
    const db = prisma as any
    const [sessions, students, faculties, facultyUsers] = await Promise.all([
      db.attendanceSession
        ? db.attendanceSession.findMany({
            where: { sessionType: 'morning' },
            orderBy: { date: 'desc' },
          }).catch(() => [])
        : [],
      prisma.student.findMany({
        select: { year: true, section: true },
      }).catch(() => []),
      prisma.faculty.findMany({
        where: { advisorYear: { not: null }, advisorSec: { not: null } },
      }).catch(() => []),
      prisma.user.findMany({
        where: { role: 'faculty' },
        select: { id: true, name: true },
      }).catch(() => []),
    ])

    const facultyUserMap = new Map(facultyUsers.map((u: any) => [u.id, u.name]))
    const advisorMap = new Map<string, string>()
    faculties.forEach((f: any) => {
      if (f.advisorYear && f.advisorSec) {
        const name = facultyUserMap.get(f.userId)
        const displayAdvisor = name
          ? (name.toLowerCase().startsWith('prof') || name.toLowerCase().startsWith('dr') ? name : `Prof. ${name}`)
          : f.facultyId
        advisorMap.set(`${f.advisorYear}-${f.advisorSec.toUpperCase()}`, displayAdvisor)
      }
    })

    const headcountMap = new Map<string, number>()
    students.forEach((s) => {
      const key = `${s.year}-${(s.section || 'A').toUpperCase()}`
      headcountMap.set(key, (headcountMap.get(key) || 0) + 1)
    })

    // Map each class purely from actual database data
    const result = DEPARTMENT_CLASSES.map((cls) => {
      const key = `${cls.year}-${cls.section.toUpperCase()}`
      const dbCount = headcountMap.get(key) || 0
      const assignedAdvisor = advisorMap.get(key) || 'Not Allocated'

      // Find today's session first, or latest morning session for this class
      const todaySession = sessions.find(
        (s: any) => s.year === cls.year && (s.section || 'A').toUpperCase() === cls.section.toUpperCase() && s.date === today
      )
      const latestSession = todaySession || sessions.find(
        (s: any) => s.year === cls.year && (s.section || 'A').toUpperCase() === cls.section.toUpperCase()
      )

      if (latestSession) {
        const total = dbCount
        const presents = Math.min(dbCount, (latestSession.presentCount || 0) + (latestSession.odCount || 0) + (latestSession.mlCount || 0))
        const absents = typeof latestSession.absentCount === 'number'
          ? Math.min(dbCount, latestSession.absentCount)
          : Math.max(0, total - presents)
        const pct = total > 0 ? Math.round((presents / total) * 10000) / 100 : 0
        const isPending = (latestSession.presentCount || 0) === 0 && (latestSession.absentCount || 0) === 0

        return {
          className: cls.className,
          year: cls.year,
          section: cls.section,
          totalStudents: total,
          presentAvg: presents,
          absentCount: isPending ? 0 : absents,
          attendancePct: pct,
          statusNote: isPending
            ? 'Register Pending'
            : latestSession.takenByName
            ? `Posted by ${latestSession.takenByName}`
            : 'Advisor Morning Verified',
          advisorName: latestSession.takenByName || assignedAdvisor,
          isLive: true,
          date: latestSession.date,
        }
      }

      // No session exists in DB yet — strictly show real database enrolled headcount and 0%
      return {
        className: cls.className,
        year: cls.year,
        section: cls.section,
        totalStudents: dbCount,
        presentAvg: 0,
        absentCount: 0,
        attendancePct: 0,
        statusNote: dbCount === 0 ? 'No Students Enrolled' : 'Register Pending',
        advisorName: assignedAdvisor,
        isLive: false,
        date: today,
      }
    })

    return NextResponse.json({
      success: true,
      classes: result,
      date: today,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching HOD class attendance:', error)
    return NextResponse.json({
      success: false,
      classes: DEPARTMENT_CLASSES.map((cls) => ({
        className: cls.className,
        year: cls.year,
        section: cls.section,
        totalStudents: 0,
        presentAvg: 0,
        absentCount: 0,
        attendancePct: 0,
        statusNote: 'Register Pending',
        advisorName: 'Not Allocated',
        isLive: false,
      })),
    })
  }
}
