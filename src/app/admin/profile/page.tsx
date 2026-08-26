import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminProfileView, AdminProfileData } from './components/AdminProfileView'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const session = await requireRoleSession(['admin'])

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  // Fetch recent 5 audit logs performed by admin
  const recentLogs = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  const profileData: AdminProfileData = {
    id: session.userId,
    adminId: 'VSB-ADM-001',
    name: adminUser?.name || session.name || 'System Administrator',
    email: session.email || 'admin@vsb.edu.in',
    role: 'Super Administrator (Tier-0)',
    phone: adminUser?.phone || '+91 94433 12345',
    department: 'Department of Artificial Intelligence & Data Science',
    designation: 'Director of Digital Governance & Super Administrator',
    officeLocation: 'Main Administrative Block · Cabin A-101',
    joiningDate: '01 June 2021',
    lastLogin: 'Active (Just now)',
    recentLogs: recentLogs.map((l) => ({
      id: l.id,
      action: l.action,
      module: l.module,
      details: l.details,
      createdAt: l.createdAt.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: l.status,
    })),
  }

  return (
    <PortalLayout role="admin" userName={profileData.name}>
      <div className="py-2 animate-fade-in">
        <AdminProfileView initialProfile={profileData} />
      </div>
    </PortalLayout>
  )
}
