import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyDashboardView } from './components/FacultyDashboardView'

export const dynamic = 'force-dynamic'

export default async function FacultyDashboardPage() {
  const session = await requireRoleSession(['faculty'])

  const faculty = (await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (await prisma.faculty.findUnique({ where: { facultyId: session.facultyId || 'FAC-001' } }).catch(() => null))

  const user = (await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)) || {
    id: session.userId,
    name: session.name || 'Faculty Member',
    email: session.email || 'faculty@vsb.edu.in',
    phone: '+91 98765 43210',
    role: 'faculty',
    status: 'active',
  }

  let parsedSubjectCodes: string[] = []
  if (faculty?.subjects) {
    try {
      parsedSubjectCodes = JSON.parse(faculty.subjects)
    } catch {
      parsedSubjectCodes = []
    }
  }

  // Fetch real subjects allocated to this faculty member from DB
  const dbSubjects = await prisma.subject.findMany({
    where: parsedSubjectCodes.length > 0 ? { code: { in: parsedSubjectCodes } } : undefined,
    orderBy: { code: 'asc' },
  }).catch(() => [])

  // If faculty has advisor batch, count students in that batch, else count total students in department
  const advisorBatchFilter = faculty?.advisorYear && faculty?.advisorSec ? {
    year: faculty.advisorYear,
    section: faculty.advisorSec,
  } : undefined

  const totalStudents = await prisma.student.count({
    where: advisorBatchFilter,
  }).catch(() => 0)

  const totalSubjectsCount = parsedSubjectCodes.length > 0 ? parsedSubjectCodes.length : (faculty ? 0 : await prisma.subject.count().catch(() => 0))
  const resourcesCount = await prisma.resource.count({
    where: faculty?.id ? { uploadedById: faculty.id } : undefined,
  }).catch(() => 0)
  const questionPapersCount = await prisma.questionPaper.count({
    where: faculty?.id ? { uploadedById: faculty.id } : undefined,
  }).catch(() => 0)

  // Fetch real attendance average if sessions exist
  const attendanceSessions = await prisma.attendanceSession.findMany({
    where: faculty?.id ? { takenByFacultyId: faculty.id } : undefined,
    include: { records: true },
    take: 20,
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  let attendanceAvg = '0.0%'
  if (attendanceSessions.length > 0) {
    let totalRecs = 0
    let presentRecs = 0
    for (const sess of attendanceSessions) {
      for (const rec of sess.records) {
        totalRecs++
        if (rec.status === 'P' || rec.status === 'OD') presentRecs++
      }
    }
    if (totalRecs > 0) {
      attendanceAvg = `${((presentRecs / totalRecs) * 100).toFixed(1)}%`
    }
  }

  const assignedSubjects = dbSubjects.map((s) => ({
    code: s.code,
    name: s.name,
    batch: faculty?.advisorBatch || (faculty?.advisorYear ? `Year ${faculty.advisorYear} (Sec ${faculty.advisorSec || 'A'})` : 'B.Tech AI & DS'),
    students: totalStudents,
    hoursConducted: attendanceSessions.filter(sess => sess.subjectCode === s.code).length,
    nextClass: faculty?.classDay && faculty?.classTime ? `${faculty.classDay}, ${faculty.classTime}` : 'Not scheduled',
    attendanceAvg: attendanceAvg !== '0.0%' ? attendanceAvg : '—',
  }))

  const timetableSlots = faculty?.classDay && faculty?.classTime ? [
    {
      time: faculty.classTime,
      subject: `${faculty.subjectName || (dbSubjects[0]?.name) || 'Allocated Course'}`,
      room: faculty.classPeriod || 'LH / Lab',
      type: 'Scheduled Session',
      status: 'Upcoming',
    }
  ] : []

  const facultyData = {
    user: {
      name: user.name || session.name || 'Faculty Member',
      email: user.email || session.email || 'faculty@vsb.edu.in',
      phone: user.phone || '',
      mustChangePassword: Boolean((user as any)?.mustChangePassword),
    },
    faculty: faculty
      ? {
          facultyId: faculty.facultyId,
          designation: faculty.designation || 'Assistant Professor',
          qualification: faculty.qualification || 'M.Tech / Ph.D',
          experience: faculty.experience || 0,
          specialization: faculty.specialization || 'AI & Data Science',
          subjects: faculty.subjects || '[]',
          advisorBatch: faculty.advisorBatch || null,
          advisorYear: faculty.advisorYear || null,
          advisorSem: faculty.advisorSem || null,
          advisorSec: faculty.advisorSec || null,
          facultyType: faculty.facultyType || 'both',
        }
      : null,
    totalStudents,
    totalSubjects: totalSubjectsCount,
    resourcesCount,
    questionPapersCount,
    attendanceAvg,
    assignedSubjects,
    todayTimetable: timetableSlots,
  }

  return (
    <PortalLayout role="faculty" userName={user.name || session.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyDashboardView data={facultyData} />
      </div>
    </PortalLayout>
  )
}