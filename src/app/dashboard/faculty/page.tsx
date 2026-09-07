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

  return (
    <PortalLayout role="student" userName={user?.name || session.name || 'Student'} >
      <FacultyList 
        users={facultyRows} 
        details={facultyDetails} 
        student={student}
        classAdvisors={classAdvisors}
      />
    </PortalLayout>
  )
}