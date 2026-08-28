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

  const defaultBatches: Record<number, string> = {
    1: '2025 - 2029',
    2: '2024 - 2028',
    3: '2023 - 2027',
    4: '2022 - 2026',
  }

  const defaultAdvisors: Record<number, string> = {
    1: 'Dr. R. Ramanathan (Professor · AI & DS)',
    2: 'Dr. S. Karthik (Professor · AI & DS)',
    3: 'Dr. M. Sowmya (Associate Professor)',
    4: 'Dr. K. Meenakshi (Associate Professor)',
  }

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
      batch: (s as any).batch || defaultBatches[s.year] || '2024 - 2028',
      section: s.section,
      advisorName: (s as any).advisorName || defaultAdvisors[s.year] || 'Dr. S. Karthik (Professor · AI & DS)',
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
