import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminFacultyView, FacultyRecord } from './components/AdminFacultyView'

export const dynamic = 'force-dynamic'

export default async function AdminFacultyPage() {
  const session = await requireRoleSession(['admin'])

  const dbFaculty = await prisma.faculty.findMany({
    orderBy: { facultyId: 'asc' },
  }).catch(() => [])

  const userIds = dbFaculty.map((f) => f.userId)
  const dbUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
  }).catch(() => [])

  const userMap = new Map(dbUsers.map((u) => [u.id, u]))

  const facultyList: FacultyRecord[] = dbFaculty.map((f: any) => {
    const user = userMap.get(f.userId)
    const dobString = f.dateOfBirth ? (typeof f.dateOfBirth === 'string' ? f.dateOfBirth : f.dateOfBirth.toISOString().split('T')[0]) : null
    return {
      id: f.id,
      facultyId: f.facultyId,
      name: user?.name || f.facultyId,
      email: user?.email || `${f.facultyId.toLowerCase()}@vsb.edu.in`,
      phone: user?.phone || '+91 98421 12345',
      dateOfBirth: dobString,
      designation: f.designation || 'Assistant Professor',
      qualification: f.qualification || 'M.Tech / Ph.D.',
      experience: f.experience || 5,
      specialization: f.specialization || 'Artificial Intelligence',
      subjects: f.subjects || '["AD2301", "AD2302"]',
      advisorBatch: f.advisorBatch || 'Year II - Sem 4 - Sec A',
      advisorYear: f.advisorYear || 2,
      advisorSem: f.advisorSem || 4,
      advisorSec: f.advisorSec || 'A',
      facultyType: f.facultyType || 'both',
      status: user?.status || 'active',
    }
  })

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminFacultyView initialFaculty={facultyList} />
      </div>
    </PortalLayout>
  )
}
