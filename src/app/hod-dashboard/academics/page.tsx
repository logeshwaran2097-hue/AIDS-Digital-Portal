import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODAcademicsView } from './components/HODAcademicsView'

export const dynamic = 'force-dynamic'

export default async function HODAcademicsPage() {
  const session = await getSession()
  if (!session || session.role !== 'hod') redirect('/login')

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODAcademicsView />
      </div>
    </PortalLayout>
  )
}

