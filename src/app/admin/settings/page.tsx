import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminSettingsView } from './components/AdminSettingsView'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminSettingsView />
      </div>
    </PortalLayout>
  )
}
