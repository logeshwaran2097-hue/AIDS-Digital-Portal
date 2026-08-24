import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import FacultyList from './components/FacultyList'

export const dynamic = 'force-dynamic'

export default async function FacultyPage() {
  const session = await getSession()
  if (!session || session.role !== 'student') redirect('/login')
  const facultyRows = await prisma.user.findMany({
    where: { role: 'faculty' },
    select: { id: true, name: true, email: true, phone: true, profileImage: true },
    orderBy: { name: 'asc' },
  })
  const facultyDetails = await prisma.faculty.findMany({})
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  return (
    <PortalLayout role="student" userName={user?.name || 'Student'} >
      <FacultyList users={facultyRows} details={facultyDetails} />
    </PortalLayout>
  )
}