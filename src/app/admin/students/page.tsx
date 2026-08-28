import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminStudentsView, StudentRecord } from './components/AdminStudentsView'

export const dynamic = 'force-dynamic'

export default async function AdminStudentsPage() {
  const session = await requireRoleSession(['admin'])

  const dbStudents = await prisma.student.findMany({
    orderBy: { registerNumber: 'asc' },
  }).catch(() => [])

  const userIds = dbStudents.map((s) => s.userId)
  const dbUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
  }).catch(() => [])

  const userMap = new Map(dbUsers.map((u) => [u.id, u]))

  const studentsList: StudentRecord[] = dbStudents.map((s) => {
    const user = userMap.get(s.userId)
    return {
      id: s.id,
      userId: s.userId,
      registerNumber: s.registerNumber,
      name: user?.name || s.registerNumber,
      email: user?.email || `${s.registerNumber.toLowerCase()}@student.vsb.edu.in`,
      phone: user?.phone || '',
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.toISOString().split('T')[0] : null,
      year: s.year,
      semester: s.semester,
      batch: (s as any).batch || '',
      section: s.section,
      advisorName: (s as any).advisorName || '',
      status: user?.status || 'active',
    }
  })

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminStudentsView initialStudents={studentsList} />
      </div>
    </PortalLayout>
  )
}
