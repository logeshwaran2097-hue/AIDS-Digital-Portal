import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminStudentsView, StudentRecord } from './components/AdminStudentsView'

export const dynamic = 'force-dynamic'

export default async function AdminStudentsPage() {
  const session = await requireRoleSession(['admin'])

  const dbStudents = await prisma.student.findMany({
    orderBy: { registerNumber: 'asc' },
  })

  const userIds = dbStudents.map((s) => s.userId)
  const dbUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
  })

  const userMap = new Map(dbUsers.map((u) => [u.id, u]))

  const studentsList: StudentRecord[] = dbStudents.map((s) => {
    const user = userMap.get(s.userId)
    return {
      id: s.id,
      registerNumber: s.registerNumber,
      name: user?.name || s.registerNumber,
      email: user?.email || `${s.registerNumber.toLowerCase()}@vsb.edu.in`,
      phone: user?.phone || '+91 98765 43210',
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.toISOString().split('T')[0] : null,
      year: s.year,
      semester: s.semester,
      section: s.section,
      status: user?.status || 'active',
    }
  })

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminStudentsView initialStudents={studentsList} />
      </div>
    </PortalLayout>
  )
}
