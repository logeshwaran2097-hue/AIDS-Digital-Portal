import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODReportsView } from './components/HODReportsView'

export const dynamic = 'force-dynamic'

export default async function HODReportsPage() {
  const session = await getSession()
  if (!session || session.role !== 'hod') redirect('/login')

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODReportsView />
      </div>
    </PortalLayout>
  )
}

