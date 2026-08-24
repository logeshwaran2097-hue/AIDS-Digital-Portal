import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyStudentsView, StudentRosterItem } from './components/FacultyStudentsView'

export const dynamic = 'force-dynamic'

export default async function FacultyStudentsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const studentsFromDb = await prisma.student.findMany({
    orderBy: { registerNumber: 'asc' },
  })
  const usersFromDb = await prisma.user.findMany({
    where: { role: 'student' },
  })
  const userMap = new Map(usersFromDb.map((u) => [u.id, u]))

  const mappedStudents: StudentRosterItem[] = studentsFromDb.map((s, idx) => {
    const matchedUser = userMap.get(s.userId)
    return {
      id: s.id,
      name: matchedUser?.name || `Student ${s.registerNumber}`,
      registerNumber: s.registerNumber,
      email: matchedUser?.email || `${s.registerNumber.toLowerCase()}@vsb.edu.in`,
      phone: matchedUser?.phone || `+91 90252 1000${idx + 1}`,
      year: s.year,
      semester: s.semester,
      section: s.section,
      cgpa: 8.84 - idx * 0.18,
      attendance: idx === 3 ? 71.0 : 92.5 - idx * 2.1,
      arrears: idx === 3 ? 1 : 0,
      parentPhone: `+91 98421 ${23456 + idx}`,
    }
  })

  return (
    <PortalLayout role="faculty" userName={user?.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyStudentsView initialStudents={mappedStudents} />
      </div>
    </PortalLayout>
  )
}
