import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AIChatbot } from '@/components/AIChatbot'

export const dynamic = 'force-dynamic'

export default async function AIAssistantPage() {
  const session = await requireRoleSession(['student'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="student" userName={user?.name || 'Student'}>
      <div className="py-4 space-y-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[#071A3D] tracking-tight">AI & DS Virtual Assistant</h1>
          <p className="text-sm text-gray-600 mt-1">Get instantaneous answers about curriculum, exams, faculty, and college policies</p>
        </div>
        <AIChatbot />
      </div>
    </PortalLayout>
  )
}

