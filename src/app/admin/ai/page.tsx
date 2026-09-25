import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AIAgentsPanel } from '@/components/ai/AIAgentsPanel'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const session = await requireRoleSession(['admin'])

  return (
    <PortalLayout role="admin" userName={session.name || 'admin'} fullWidth>
      <div className="py-2 w-full animate-fade-in">
        <AIAgentsPanel />
      </div>
    </PortalLayout>
  )
}
