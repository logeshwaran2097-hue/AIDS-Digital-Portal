import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAdminsView, AdminUserRecord } from './components/AdminAdminsView'

export const dynamic = 'force-dynamic'

export default async function AdminAdminsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const dbAdmins = await prisma.admin.findMany({
    orderBy: { createdAt: 'asc' },
  })

  const adminList: AdminUserRecord[] = dbAdmins.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    status: a.status,
    createdAt: a.createdAt.toISOString().split('T')[0],
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAdminsView initialAdmins={adminList} />
      </div>
    </PortalLayout>
  )
}
