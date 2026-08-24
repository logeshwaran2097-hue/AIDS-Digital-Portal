import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODQuestionPapersView } from './components/HODQuestionPapersView'

export const dynamic = 'force-dynamic'

export default async function HODQuestionPapersPage() {
  const session = await requireRoleSession(['hod'])

  const papers = await prisma.questionPaper.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODQuestionPapersView papers={papers} />
      </div>
    </PortalLayout>
  )
}

