import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import StudyAssistantView from '@/components/study/StudyAssistantView'

export const dynamic = 'force-dynamic'

export default async function StudyAssistantPage() {
  const session = await requireRoleSession(['student', 'faculty', 'hod', 'admin'])
  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const studentName = user?.name || session.name || 'Logeshwaran G'

  return (
    <PortalLayout role={session.role as any} userName={studentName}>
      <StudyAssistantView />
    </PortalLayout>
  )
}
