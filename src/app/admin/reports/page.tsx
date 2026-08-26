import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminReportsView, StudentAttendanceRecord } from './components/AdminReportsView'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
  const session = await requireRoleSession(['admin'])

  const [
    studentCount,
    facultyCount,
    subjectCount,
    projectCount,
    eventCount,
    achievementCount,
    adminUser,
    dbStudents,
    dbAttendanceRecords,
  ] = await Promise.all([
    prisma.student.count().catch(() => 0),
    prisma.faculty.count().catch(() => 0),
    prisma.subject.count().catch(() => 0),
    prisma.project.count().catch(() => 0),
    prisma.event.count().catch(() => 0),
    prisma.achievement.count().catch(() => 0),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    prisma.student.findMany({ orderBy: { registerNumber: 'asc' } }).catch(() => []),
    prisma.attendanceRecord.findMany().catch(() => []),
  ])

  // Get user names for enrolled students
  const userIds = dbStudents.map((s) => s.userId)
  const dbUsers =
    userIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: userIds } } }).catch(() => [])
      : []
  const userMap = new Map(dbUsers.map((u) => [u.id, u]))

  // Group attendance records by student register number
  const attendanceByRegNo = new Map<string, { present: number; absent: number; od: number; ml: number }>()
  dbAttendanceRecords.forEach((rec) => {
    const reg = rec.registerNumber.toUpperCase()
    if (!attendanceByRegNo.has(reg)) {
      attendanceByRegNo.set(reg, { present: 0, absent: 0, od: 0, ml: 0 })
    }
    const current = attendanceByRegNo.get(reg)!
    const st = rec.status.toUpperCase()
    if (st === 'P') current.present++
    else if (st === 'A') current.absent++
    else if (st === 'OD') current.od++
    else if (st === 'ML') current.ml++
  })

  // Map to StudentAttendanceRecord
  const studentsList: StudentAttendanceRecord[] = dbStudents.map((s) => {
    const user = userMap.get(s.userId)
    const att = attendanceByRegNo.get(s.registerNumber.toUpperCase()) || {
      present: 0,
      absent: 0,
      od: 0,
      ml: 0,
    }
    const totalWorking = att.present + att.absent + att.od + att.ml
    const effectiveAttended = att.present + att.od + att.ml
    const pct = totalWorking > 0 ? Math.round((effectiveAttended / totalWorking) * 1000) / 10 : 0

    return {
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
      cgpa: 0.0,
      status: pct >= 75 ? 'ELIGIBLE' : 'SHORTAGE',
    }
  })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminReportsView
          studentCount={studentCount}
          facultyCount={facultyCount}
          subjectCount={subjectCount}
          projectCount={projectCount}
          eventCount={eventCount}
          achievementCount={achievementCount}
          initialStudents={studentsList}
        />
      </div>
    </PortalLayout>
  )
}

