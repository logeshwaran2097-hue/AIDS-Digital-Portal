import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cachedDbQuery } from '@/lib/dbCache'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODProjectsView } from './components/HODProjectsView'

export const dynamic = 'force-dynamic'

export default async function HODProjectsPage() {
  const session = await requireRoleSession(['hod'])

  const dbProjects = await cachedDbQuery(
    'hod_projects_list',
    () => prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    8000,
    ['projects']
  )

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODProjectsView projects={dbProjects} />
      </div>
    </PortalLayout>
  )
}
