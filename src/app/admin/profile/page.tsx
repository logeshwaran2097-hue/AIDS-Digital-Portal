import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminProfileView, AdminProfileData } from './components/AdminProfileView'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const session = await requireRoleSession(['admin'])

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  const profileData: AdminProfileData = {
    id: session.userId,
    name: adminUser?.name || session.name || 'System Administrator',
    email: session.email || 'admin@vsb.edu.in',
    role: 'Super Administrator',
    phone: '+91 94433 12345',
    department: 'Department of Artificial Intelligence & Data Science',
    lastLogin: 'Active (Just now)',
  }

  return (
    <PortalLayout role="admin" userName={profileData.name}>
      <div className="py-2 animate-fade-in">
        <AdminProfileView initialProfile={profileData} />
      </div>
    </PortalLayout>
  )
}
