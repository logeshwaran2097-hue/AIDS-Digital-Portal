import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { ODApplicationsDashboardView } from '@/components/od/ODApplicationsDashboardView'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'HOD Student OD & Leave Sanctions | V.S.B. AI & DS Portal',
  description: 'Department Head authorization portal for student OD and leave permissions.',
}

export default async function HODODApplicationsPage() {
  const session = await requireRoleSession(['hod'])

  return (
    <PortalLayout
      role="hod"
      userName={session.name || 'Head of Department'}
      userEmail={session.email}
      roleBadgeLabel="Head of Department"
    >
      <div className="py-2 animate-fade-in">
        <ODApplicationsDashboardView viewRole="hod" />
      </div>
    </PortalLayout>
  )
}
