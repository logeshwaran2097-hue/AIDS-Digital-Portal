import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AboutPortalView } from '@/components/about/AboutPortalView'

export const dynamic = 'force-dynamic'

export default async function AdminAboutPage() {
  const session = await requireRoleSession(['admin'])

  return (
    <PortalLayout role="admin" userName={session.name || 'System Administrator'}>
      <AboutPortalView role="admin" />
    </PortalLayout>
  )
}
