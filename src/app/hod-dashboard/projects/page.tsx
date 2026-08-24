import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODProjectsView } from './components/HODProjectsView'
import { FALLBACK_PROJECTS } from '@/lib/projectData'

export const dynamic = 'force-dynamic'

export default async function HODProjectsPage() {
  const session = await requireRoleSession(['hod'])

  const dbProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const projects = dbProjects.length > 0 ? dbProjects : FALLBACK_PROJECTS

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODProjectsView projects={projects} />
      </div>
    </PortalLayout>
  )
}
