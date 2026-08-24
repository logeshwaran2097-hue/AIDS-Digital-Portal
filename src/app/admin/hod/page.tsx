import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminHODView, HODRecord } from './components/AdminHODView'

export const dynamic = 'force-dynamic'

export default async function AdminHODPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const dbHODs = await prisma.hOD.findMany()
  const userIds = dbHODs.map((h) => h.userId)
  const dbUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
  })

  const userMap = new Map(dbUsers.map((u) => [u.id, u]))

  const hodList: HODRecord[] = dbHODs.map((h) => {
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
  })

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminHODView initialHOD={hodList} />
      </div>
    </PortalLayout>
  )
}
