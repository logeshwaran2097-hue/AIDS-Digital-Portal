import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentAttendanceView } from './components/StudentAttendanceView'

export const dynamic = 'force-dynamic'

export default async function StudentAttendancePage() {
  const session = await requireRoleSession(['student'])

  const user = (await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)) || {
    id: session.userId,
    name: session.name || 'Student',
    email: session.email || 'student@vsb.edu.in',
    role: 'student',
    status: 'active',
  }

  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (await prisma.student.findUnique({ where: { registerNumber: session.registerNumber || '922525243103' } }).catch(() => null)) || {
      id: 'student-default',
      userId: session.userId,
      registerNumber: session.registerNumber || '922525243103',
      dateOfBirth: new Date('2006-02-09'),
      department: 'Artificial Intelligence & Data Science',
      year: 2,
      semester: 4,
      section: 'A',
    }

  const semesters = await prisma.semester.findMany({
    where: { number: student.semester },
    select: { id: true },
  }).catch(() => [])
  const semesterIds = semesters.map((s) => s.id)

  const subjects = await prisma.subject.findMany({
    where: semesterIds.length > 0 ? { semesterId: { in: semesterIds } } : undefined,
    orderBy: { code: 'asc' },
  }).catch(() => [])

  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: {
      OR: [
        { studentId: student.id },
        { registerNumber: student.registerNumber },
      ],
    },
    include: {
      session: true,
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const totalSessions = attendanceRecords.length
  const presentSessions = attendanceRecords.filter((r) => r.status === 'P' || r.status === 'OD').length
  const odSessions = attendanceRecords.filter((r) => r.status === 'OD').length
  const absentSessions = attendanceRecords.filter((r) => r.status === 'A' || r.status === 'L').length
  const percentage = totalSessions > 0 ? Number(((presentSessions / totalSessions) * 100).toFixed(1)) : 0

  const subjectBreakdown = subjects.map((sub) => {
    const subRecords = attendanceRecords.filter(
      (r) => r.session?.subjectCode === sub.code || r.session?.subjectName === sub.name
    )
    const subTotal = subRecords.length
    const subPresent = subRecords.filter((r) => r.status === 'P' || r.status === 'OD').length
    const subPercent = subTotal > 0 ? Number(((subPresent / subTotal) * 100).toFixed(1)) : 0
    return {
      code: sub.code,
      name: sub.name,
      faculty: 'Assigned Course Faculty',
      conducted: subTotal,
      attended: subPresent,
      percent: subPercent,
      status: (subTotal === 0 || subPercent >= 75 ? 'Safe' : 'Warning') as 'Safe' | 'Warning' | 'Critical',
    }
  })

  const history = attendanceRecords.map((r) => ({
    id: r.id,
    date: r.session?.date || r.createdAt.toISOString().split('T')[0],
    subjectCode: r.session?.subjectCode || 'Course Session',
    subjectName: r.session?.subjectName || 'Theory / Practical',
    hour: r.session?.hour || 'Period 1',
    status: r.status,
    takenByName: r.session?.takenByName || 'Faculty Instructor',
    remarks: r.remarks || '',
  }))

  return (
    <PortalLayout role="student" userName={user.name || session.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentAttendanceView
          student={student as any}
          user={user as any}
          stats={{
            totalSessions,
            presentSessions,
            absentSessions,
            odSessions,
            percentage,
            subjectBreakdown,
            history,
          }}
        />
      </div>
    </PortalLayout>
  )
}
