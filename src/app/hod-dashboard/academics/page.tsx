import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODAcademicsView } from './components/HODAcademicsView'

export const dynamic = 'force-dynamic'

export default async function HODAcademicsPage() {
  const session = await requireRoleSession(['hod'])

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODAcademicsView />
      </div>
    </PortalLayout>
  )
}

