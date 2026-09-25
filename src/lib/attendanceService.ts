import { prisma } from '@/lib/prisma'
import { cachedDbQuery } from '@/lib/dbCache'
import { ClassAttendanceStat } from '@/app/hod-dashboard/components/DepartmentAttendanceAnalytics'

export const DEPARTMENT_CLASSES = [
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

export async function getDepartmentClassAttendance(dateParam?: string): Promise<ClassAttendanceStat[]> {
  const targetDate = dateParam || new Date().toISOString().split('T')[0]

  return cachedDbQuery(
    `hod_class_attendance_${targetDate}`,
    async () => {
      const db = prisma as any
      const [sessions, students, faculties, facultyUsers] = await Promise.all([
        db.attendanceSession
          ? db.attendanceSession.findMany({
              where: { sessionType: 'morning' },
              orderBy: { date: 'desc' },
            }).catch(() => [])
          : [],
        prisma.student.findMany({
          select: { year: true, section: true, advisorName: true, attendance: true },
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

      // Extract advisor names stored on students
      students.forEach((s) => {
        const key = `${s.year}-${(s.section || 'A').toUpperCase()}`
        if (s.advisorName && !advisorMap.has(key)) {
          const adv = s.advisorName.toLowerCase().startsWith('prof') || s.advisorName.toLowerCase().startsWith('dr')
            ? s.advisorName
            : `Prof. ${s.advisorName}`
          advisorMap.set(key, adv)
        }
      })

      const headcountMap = new Map<string, number>()
      students.forEach((s) => {
        const key = `${s.year}-${(s.section || 'A').toUpperCase()}`
        headcountMap.set(key, (headcountMap.get(key) || 0) + 1)
      })

      return DEPARTMENT_CLASSES.map((cls) => {
        const key = `${cls.year}-${cls.section.toUpperCase()}`
        const dbCount = headcountMap.get(key) || 0
        const assignedAdvisor = advisorMap.get(key) || 'Not Allocated'

        const todaySession = sessions.find(
          (s: any) => s.year === cls.year && (s.section || 'A').toUpperCase() === cls.section.toUpperCase() && s.date === targetDate
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
          date: targetDate,
        }
      })
    },
    8000,
    ['attendance', 'students', 'faculty']
  )
}
