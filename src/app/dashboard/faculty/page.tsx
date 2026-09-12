import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import FacultyList from './components/FacultyList'

export const dynamic = 'force-dynamic'

export default async function FacultyPage() {
  const session = await requireRoleSession(['student'])
  const userReg = session.registerNumber || (session.email ? session.email.split('@')[0].toUpperCase() : '')

  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (userReg ? await prisma.student.findUnique({ where: { registerNumber: userReg } }).catch(() => null) : null)

  const facultyRows = await prisma.user.findMany({
    where: { role: 'faculty' },
    select: { id: true, name: true, email: true, phone: true, profileImage: true },
    orderBy: { name: 'asc' },
  })
  const facultyDetails = await prisma.faculty.findMany({})
  const classAdvisors = await prisma.classAdvisor.findMany({}).catch(() => [])
  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  const studentData = student
    ? {
        ...student,
        name: user?.name || session.name || 'Student',
      }
    : {
        id: session.userId,
        userId: session.userId,
        name: user?.name || session.name || 'Student',
        registerNumber: userReg || '',
        department: 'B.Tech AI & DS',
        year: 2,
        semester: 4,
        section: 'B',
      }

  return (
    <PortalLayout 
      role="student" 
      userName={user?.name || session.name || 'Student'} 
      userEmail={user?.email || session.email}
      profileImage={(user as any)?.profileImage}
    >
      <FacultyList 
        users={facultyRows} 
        details={facultyDetails} 
        student={studentData}
        classAdvisors={classAdvisors}
      />
    </PortalLayout>
  )
}