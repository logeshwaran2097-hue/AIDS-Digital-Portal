import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminFacultyView, FacultyRecord } from './components/AdminFacultyView'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

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
      email: user?.email || '',
      phone: user?.phone || null,
      dateOfBirth: dobString,
      designation: f.designation || 'Faculty Member',
      qualification: f.qualification || '',
      experience: f.experience ?? 0,
      specialization: f.specialization || '',
      subjects: f.subjects || '[]',
      subjectName: f.subjectName || null,
      classDay: f.classDay || null,
      classPeriod: f.classPeriod || null,
      classTime: f.classTime || null,
      advisorBatch: f.advisorBatch || null,
      advisorYear: f.advisorYear || null,
      advisorSem: f.advisorSem || null,
      advisorSec: f.advisorSec || null,
      facultyType: f.facultyType || 'teaching',
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
