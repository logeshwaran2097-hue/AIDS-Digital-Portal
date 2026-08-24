import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminHODView, HODRecord } from './components/AdminHODView'

export const dynamic = 'force-dynamic'

const FALLBACK_HOD: HODRecord[] = [
  { id: 'h1', facultyId: 'HOD-001', name: 'Prof. Dr. V. Sundar', email: 'hod.aids@vsb.edu.in', phone: '+91 98421 54321', dateOfBirth: '1980-01-01', department: 'Artificial Intelligence & Data Science', status: 'active' }
]

export default async function AdminHODPage() {
  const session = await requireRoleSession(['admin'])

  const dbHODs = await prisma.hOD.findMany().catch(() => [])
  const userIds = dbHODs.map((h) => h.userId)
  const dbUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
  }).catch(() => [])

  const userMap = new Map(dbUsers.map((u) => [u.id, u]))

  const hodList: HODRecord[] = dbHODs.length > 0 ? dbHODs.map((h) => {
    const user = userMap.get(h.userId)
    return {
      id: h.id,
      facultyId: h.facultyId,
      name: user?.name || 'Prof. Dr. V. Sundar',
      email: user?.email || 'hod.aids@vsb.edu.in',
      phone: user?.phone || '+91 98421 54321',
      dateOfBirth: h.dateOfBirth ? h.dateOfBirth.toISOString().split('T')[0] : null,
      department: h.department || 'Artificial Intelligence & Data Science',
      status: user?.status || 'active',
    }
  }) : FALLBACK_HOD

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminHODView initialHOD={hodList} />
      </div>
    </PortalLayout>
  )
}
