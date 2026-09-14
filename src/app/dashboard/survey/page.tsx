import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import PortalFeedbackSurvey from '@/components/survey/PortalFeedbackSurveyModal'

export const dynamic = 'force-dynamic'

export default async function SurveyPage() {
  const session = await requireRoleSession(['student', 'faculty', 'hod', 'admin'])
  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const studentName = user?.name || session.name || 'User'

  return (
    <PortalLayout role={session.role as any} userName={studentName}>
      <div className="py-6 px-2 sm:px-4">
        <PortalFeedbackSurvey
          isModal={false}
          userName={studentName}
          role={session.role}
        />
      </div>
    </PortalLayout>
  )
}
