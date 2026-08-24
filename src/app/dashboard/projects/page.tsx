import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentProjectsView } from './components/StudentProjectsView'

export const dynamic = 'force-dynamic'

export default async function StudentProjectsPage() {
  const session = await requireRoleSession(['student'])

  const dbProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="student" userName={user?.name || session.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentProjectsView projects={dbProjects} />
      </div>
    </PortalLayout>
  )
}