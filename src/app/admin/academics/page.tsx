import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAcademicsView } from './components/AdminAcademicsView'

export const dynamic = 'force-dynamic'

export default async function AdminAcademicsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const [resourceCount, questionPaperCount] = await prisma.$transaction([
    prisma.resource.count(),
    prisma.questionPaper.count(),
  ])

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAcademicsView
          totalResources={resourceCount}
          totalQuestionPapers={questionPaperCount}
        />
      </div>
    </PortalLayout>
  )
}
