import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AIAgentsPanel } from '@/components/ai/AIAgentsPanel'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const session = await requireRoleSession(['admin'])

  return (
    <PortalLayout role="admin" userName={session.name || 'admin'}>
      <div className="py-4">
        <AIAgentsPanel />
      </div>
    </PortalLayout>
  )
}
