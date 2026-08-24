import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AIChatbot } from '@/components/AIChatbot'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const session = await getSession()
  if (!session || session.role !== 'hod') redirect('/login')

  return (
    <PortalLayout role="hod" userName={session.name || 'hod'}>
      <div className="py-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-[#071A3D]">AI Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">Department management assistant powered by AI</p>
        </div>
        <AIChatbot />
      </div>
    </PortalLayout>
  )
}

