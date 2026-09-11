import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { ODApplicationsDashboardView } from '@/components/od/ODApplicationsDashboardView'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Institutional OD & Leave Registry | V.S.B. AI & DS Admin Portal',
  description: 'Administrative master control registry for student OD and leave permissions.',
}

export default async function AdminODApplicationsPage() {
  const session = await requireRoleSession(['admin'])

  return (
    <PortalLayout
      role="admin"
      userName={session.name || 'Portal Administrator'}
      userEmail={session.email}
      roleBadgeLabel="System Administrator"
    >
      <div className="py-2 animate-fade-in">
        <ODApplicationsDashboardView viewRole="admin" />
      </div>
    </PortalLayout>
  )
}
