import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyStudentsView, StudentRosterItem } from './components/FacultyStudentsView'

export const dynamic = 'force-dynamic'

export default async function FacultyStudentsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const studentsFromDb = await prisma.student.findMany({
    orderBy: { registerNumber: 'asc' },
  }).catch(() => [])

  const usersFromDb = await prisma.user.findMany({
    where: { role: 'student' },
  }).catch(() => [])

  const userMap = new Map(usersFromDb.map((u) => [u.id, u]))

  const mappedStudents: StudentRosterItem[] = studentsFromDb.map((s, idx) => {
    const matchedUser = userMap.get(s.userId)
    return {
      id: s.id,
      name: matchedUser?.name || s.registerNumber,
      registerNumber: s.registerNumber,
      email: matchedUser?.email || `${s.registerNumber.toLowerCase()}@vsb.edu.in`,
      phone: matchedUser?.phone || '+91 90252 10001',
      year: s.year,
      semester: s.semester,
      section: s.section,
      cgpa: 8.5,
      attendance: 90.0,
      arrears: 0,
      parentPhone: '+91 98421 23456',
    }
  })

  return (
    <PortalLayout role="faculty" userName={user?.name || session.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyStudentsView initialStudents={mappedStudents} />
      </div>
    </PortalLayout>
  )
}
