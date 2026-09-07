import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AboutPortalView } from '@/components/about/AboutPortalView'

export const dynamic = 'force-dynamic'

export default async function HODAboutPage() {
  const session = await requireRoleSession(['hod'])

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <AboutPortalView role="hod" />
    </PortalLayout>
  )
}
