import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminFacultyView, FacultyRecord } from './components/AdminFacultyView'

export const dynamic = 'force-dynamic'

export default async function AdminFacultyPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const dbFaculty = await prisma.faculty.findMany({
    orderBy: { facultyId: 'asc' },
  })

  const userIds = dbFaculty.map((f) => f.userId)
  const dbUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
  })

  const userMap = new Map(dbUsers.map((u) => [u.id, u]))

  const facultyList: FacultyRecord[] = dbFaculty.map((f) => {
    const user = userMap.get(f.userId)
    return {
      id: f.id,
      facultyId: f.facultyId,
      name: user?.name || f.facultyId,
      email: user?.email || `${f.facultyId.toLowerCase()}@vsb.edu.in`,
      phone: user?.phone || '+91 94432 10987',
      dateOfBirth: f.dateOfBirth ? f.dateOfBirth.toISOString().split('T')[0] : null,
      designation: f.designation || 'Assistant Professor',
      qualification: f.qualification || 'M.E., Ph.D.',
      experience: f.experience || 10,
      specialization: f.specialization || 'Artificial Intelligence',
      subjects: f.subjects || 'CS3491 Artificial Intelligence',
      status: user?.status || 'active',
    }
  })

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminFacultyView initialFaculty={facultyList} />
      </div>
    </PortalLayout>
  )
}
