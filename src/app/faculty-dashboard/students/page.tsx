import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyStudentsView, StudentRosterItem } from './components/FacultyStudentsView'

export const dynamic = 'force-dynamic'

export default async function FacultyStudentsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const faculty = (await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (await prisma.faculty.findUnique({ where: { facultyId: session.facultyId || '' } }).catch(() => null))

  // If faculty is advisor for a specific class, filter for their class, else show all department students
  const filter = faculty?.advisorYear && faculty?.advisorSec ? {
    year: faculty.advisorYear,
    section: faculty.advisorSec,
  } : undefined

  const studentsFromDb = await prisma.student.findMany({
    where: filter,
    orderBy: { registerNumber: 'asc' },
  }).catch(() => [])

  const userIds = studentsFromDb.map(s => s.userId)
  const usersFromDb = await prisma.user.findMany({
    where: { id: { in: userIds } },
  }).catch(() => [])

  const userMap = new Map(usersFromDb.map((u) => [u.id, u]))

  const mappedStudents: StudentRosterItem[] = studentsFromDb.map((s) => {
    const matchedUser = userMap.get(s.userId)
    const rawAttendance = s.attendance ? parseFloat(s.attendance.replace(/[^0-9.]/g, '')) : 0
    return {
      id: s.id,
      name: matchedUser?.name || s.registerNumber,
      registerNumber: s.registerNumber,
      email: matchedUser?.email || `${s.registerNumber.toLowerCase()}@vsb.edu.in`,
      phone: matchedUser?.phone || '',
      year: s.year,
      semester: s.semester,
      section: s.section,
      cgpa: s.cgpa || 0,
      attendance: isNaN(rawAttendance) ? 0 : rawAttendance,
      arrears: 0,
      parentPhone: s.parentPhone || '',
    }
  })

  const advisorDetails = {
    facultyName: user?.name || session.name || 'Faculty Advisor',
    facultyEmail: user?.email || session.email || '',
    facultyPhone: user?.phone || '',
    facultyId: faculty?.facultyId || session.facultyId || '',
    advisorBatch: faculty?.advisorBatch || (faculty?.advisorYear ? `Year ${faculty.advisorYear} (Sec ${faculty.advisorSec || 'A'})` : 'AI & DS Department'),
    mustChangePassword: Boolean(user?.mustChangePassword),
    qualification: faculty?.qualification || '',
    experience: faculty?.experience || 0,
    specialization: faculty?.specialization || '',
    dateOfBirth: faculty?.dateOfBirth ? faculty.dateOfBirth.toISOString() : undefined,
  }

  return (
    <PortalLayout role="faculty" userName={user?.name || session.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyStudentsView initialStudents={mappedStudents} advisorDetails={advisorDetails} />
      </div>
    </PortalLayout>
  )
}
