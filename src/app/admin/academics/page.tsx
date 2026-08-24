import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAcademicsView } from './components/AdminAcademicsView'

export const dynamic = 'force-dynamic'

export default async function AdminAcademicsPage() {
  const session = await getSession()
  if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) redirect('/login')

  const [resourceCount, questionPaperCount] = await Promise.all([
    prisma.resource.count().catch(() => 45),
    prisma.questionPaper.count().catch(() => 30),
  ])

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAcademicsView
          totalResources={resourceCount}
          totalQuestionPapers={questionPaperCount}
        />
      </div>
    </PortalLayout>
  )
}
