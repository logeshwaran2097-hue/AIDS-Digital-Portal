import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { GovernmentAttendanceSystem } from './components/GovernmentAttendanceSystem'

export const dynamic = 'force-dynamic'

export default async function AttendancePage() {
  const session = await getSession()
  if (!session || session.role !== 'faculty') redirect('/login')

  return (
    <PortalLayout role="faculty" userName={session.name || 'Faculty Member'}>
      <div className="py-2 animate-fade-in">
        <GovernmentAttendanceSystem />
      </div>
    </PortalLayout>
  )
}

