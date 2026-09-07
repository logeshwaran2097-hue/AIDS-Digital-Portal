import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AboutPortalView } from '@/components/about/AboutPortalView'

export const dynamic = 'force-dynamic'

export default async function StudentAboutPage() {
  const session = await requireRoleSession(['student'])

  return (
    <PortalLayout role="student" userName={session.name || 'Student'}>
      <AboutPortalView role="student" />
    </PortalLayout>
  )
}
