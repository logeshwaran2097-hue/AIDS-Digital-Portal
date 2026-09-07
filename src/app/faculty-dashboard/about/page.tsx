import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AboutPortalView } from '@/components/about/AboutPortalView'

export const dynamic = 'force-dynamic'

export default async function FacultyAboutPage() {
  const session = await requireRoleSession(['faculty'])

  return (
    <PortalLayout role="faculty" userName={session.name || 'Faculty Member'}>
      <AboutPortalView role="faculty" />
    </PortalLayout>
  )
}
