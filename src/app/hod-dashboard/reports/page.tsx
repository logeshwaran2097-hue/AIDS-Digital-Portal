import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODReportsView } from './components/HODReportsView'

export const dynamic = 'force-dynamic'

export default async function HODReportsPage() {
  const session = await requireRoleSession(['hod'])

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODReportsView />
      </div>
    </PortalLayout>
  )
}

