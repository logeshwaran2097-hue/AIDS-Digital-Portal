import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODSettingsView } from './components/HODSettingsView'

export const dynamic = 'force-dynamic'

export default async function HODSettingsPage() {
  const session = await requireRoleSession(['hod'])

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODSettingsView />
      </div>
    </PortalLayout>
  )
}

