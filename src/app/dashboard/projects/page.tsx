import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentProjectsView } from './components/StudentProjectsView'
import { FALLBACK_PROJECTS } from '@/lib/projectData'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const session = await requireRoleSession(['student'])

  const dbProjects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => [])
  const projects = dbProjects.length > 0 ? dbProjects : FALLBACK_PROJECTS
  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="student" userName={user?.name || session.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentProjectsView projects={projects} />
      </div>
    </PortalLayout>
  )
}