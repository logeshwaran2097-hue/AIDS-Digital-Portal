import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODStudentsView, DBStudent, ClassMeta } from './components/HODStudentsView'

export const dynamic = 'force-dynamic'

const DEPARTMENT_CLASS_DEFINITIONS = [
  { className: 'II AIDS A', year: 2, section: 'A', semester: 3 },
  { className: 'II AIDS B', year: 2, section: 'B', semester: 3 },
  { className: 'II AIDS C', year: 2, section: 'C', semester: 3 },
  { className: 'II AIDS D', year: 2, section: 'D', semester: 3 },
  { className: 'III AIDS A', year: 3, section: 'A', semester: 5 },
  { className: 'III AIDS B', year: 3, section: 'B', semester: 5 },
  { className: 'III AIDS C', year: 3, section: 'C', semester: 5 },
  { className: 'III AIDS D', year: 3, section: 'D', semester: 5 },
  { className: 'IV AIDS A', year: 4, section: 'A', semester: 7 },
  { className: 'IV AIDS B', year: 4, section: 'B', semester: 7 },
]

export default async function HODStudentsPage() {
  const session = await requireRoleSession(['hod'])

  // Fetch all students, users, faculties, morning attendance sessions, and student attendance records
  const db = prisma as any
  const [students, studentUsers, faculties, facultyUsers, sessions, allRecords] = await Promise.all([
    prisma.student.findMany({ orderBy: [{ year: 'asc' }, { section: 'asc' }, { registerNumber: 'asc' }] }).catch(() => []),
    prisma.user.findMany({ where: { role: 'student' }, select: { id: true, name: true, email: true, phone: true } }).catch(() => []),
    prisma.faculty.findMany({ where: { advisorYear: { not: null }, advisorSec: { not: null } } }).catch(() => []),
    prisma.user.findMany({ where: { role: 'faculty' }, select: { id: true, name: true, email: true } }).catch(() => []),
    db.attendanceSession
      ? db.attendanceSession.findMany({ where: { sessionType: 'morning' }, orderBy: { date: 'desc' } }).catch(() => [])
      : [],
    db.attendanceRecord ? db.attendanceRecord.findMany().catch(() => []) : [],
  ])

  // Aggregate attendance per student register number
  const attendanceByRegNo = new Map<string, { present: number; absent: number; od: number; ml: number }>()
  allRecords.forEach((rec: any) => {
    const reg = (rec.registerNumber || '').toUpperCase().trim()
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

  // Build lookup maps
  const studentUserMap = new Map<string, any>(studentUsers.map((u: any) => [u.id, u]))
  const facultyUserMap = new Map<string, any>(facultyUsers.map((u: any) => [u.id, u]))

  // Map advisor names to Year-Section
  const advisorMap = new Map<string, string>()
  faculties.forEach((f: any) => {
    if (f.advisorYear && f.advisorSec) {
      const u = facultyUserMap.get(f.userId)
      const advisorName = u?.name
        ? (u.name.toLowerCase().startsWith('dr') || u.name.toLowerCase().startsWith('prof') ? u.name : `Prof. ${u.name}`)
        : f.facultyId
      advisorMap.set(`${f.advisorYear}-${f.advisorSec.toUpperCase()}`, advisorName)
    }
  })

  // Format purely real students from DB with attendance metrics
  const initialStudents: DBStudent[] = students.map((s: any) => {
    const u: any = studentUserMap.get(s.userId)
    const key = `${s.year}-${(s.section || 'A').toUpperCase()}`
    const matchedAdvisor = advisorMap.get(key)
    const reg = (s.registerNumber || '').toUpperCase().trim()
    const att = attendanceByRegNo.get(reg) || { present: 0, absent: 0, od: 0, ml: 0 }
    const totalWorking = att.present + att.absent + att.od + att.ml
    const effectiveAttended = att.present + att.od + att.ml
    const pct = totalWorking > 0 ? Math.round((effectiveAttended / totalWorking) * 1000) / 10 : 0

    return {
      id: s.id,
      registerNumber: s.registerNumber,
      name: u?.name || s.registerNumber,
      email: u?.email || `${s.registerNumber.toLowerCase()}@vsb.ac.in`,
      year: s.year,
      semester: s.semester,
      section: (s.section || 'A').toUpperCase(),
      batch: s.batch,
      advisorName: s.advisorName || matchedAdvisor || 'Unassigned',
      parentPhone: s.parentPhone || u?.phone || null,
      residencyStatus: s.residencyStatus || 'Day Scholar',
      busNo: s.busNo || null,
      boardingPoint: s.boardingPoint || null,
      hostelBlock: s.hostelBlock || null,
      roomNo: s.roomNo || null,
      cgpa: s.cgpa || null,
      isDbVerified: true,
      attendancePct: pct,
      totalDays: totalWorking,
      presentDays: effectiveAttended,
      absentDays: att.absent,
    }
  })

  // Build department classes with 100% real database data
  const departmentClasses: ClassMeta[] = DEPARTMENT_CLASS_DEFINITIONS.map((cls) => {
    const key = `${cls.year}-${cls.section.toUpperCase()}`
    const dbAdvisor = advisorMap.get(key)
    const realStudentCount = initialStudents.filter(
      (s) => s.year === cls.year && s.section === cls.section
    ).length

    const latestSession = (sessions as any[]).find(
      (sess) => sess.year === cls.year && (sess.section || 'A').toUpperCase() === cls.section.toUpperCase()
    )

    let totalStudents = realStudentCount
    let presentCount = 0
    let attendancePct = 0
    let advisorName = dbAdvisor || 'Unassigned'

    if (latestSession) {
      totalStudents = latestSession.totalStudents || realStudentCount
      presentCount = (latestSession.presentCount || 0) + (latestSession.odCount || 0) + (latestSession.mlCount || 0)
      attendancePct = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 10000) / 100 : 0
      if (latestSession.takenByName) {
        advisorName = latestSession.takenByName
      }
    }

    return {
      className: cls.className,
      year: cls.year,
      section: cls.section,
      semester: cls.semester,
      totalStudents,
      advisorName,
      attendancePct,
      presentCount,
    }
  })

  const facultyAdvisors = Array.from(advisorMap.entries()).map(([k, v]) => {
    const [yr, sec] = k.split('-')
    return { year: Number(yr), section: sec, advisorName: v }
  })

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <HODStudentsView
        initialStudents={initialStudents}
        facultyAdvisors={facultyAdvisors}
        departmentClasses={departmentClasses}
      />
    </PortalLayout>
  )
}
