import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminProjectsView, ProjectRecord } from './components/AdminProjectsView'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const session = await requireRoleSession(['admin'])

  const dbProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const projectsList: ProjectRecord[] = dbProjects.map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    domain: p.domain || 'AI & Data Science',
    year: p.year || 4,
    semester: p.semester || 7,
    guideName: p.guideName || 'Faculty Guide',
    teamMembers: p.teamMembers || 'Student Team',
    status: p.status || 'Active',
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminProjectsView initialProjects={projectsList} />
      </div>
    </PortalLayout>
  )
}
