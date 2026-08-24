import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AIChatbot } from '@/components/AIChatbot'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const session = await requireRoleSession(['admin'])

  return (
    <PortalLayout role="admin" userName={session.name || 'admin'}>
      <div className="space-y-6 py-6">
        <div>
          <h1 className="text-2xl font-bold text-[#071A3D]">AI Assistant Management &amp; Chat</h1>
          <p className="text-sm text-gray-500 mt-1">Configure and interact with the portal AI chatbot</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { l: 'AI Status', v: 'Active (Online)', c: 'text-green-600', icon: '🤖' },
            { l: 'Knowledge Base', v: '14 Modules Loaded', icon: '💬' },
            { l: 'Avg Response Time', v: '< 50ms', icon: '⚡' },
          ].map((s) => (
            <div key={s.l} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-sm text-gray-500">{s.l}</p>
                  <p className={`text-xl font-bold ${s.c || 'text-[#071A3D]'}`}>{s.v}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <AIChatbot />
      </div>
    </PortalLayout>
  )
}

