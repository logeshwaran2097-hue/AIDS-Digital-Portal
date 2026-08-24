import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODProjectsView } from './components/HODProjectsView'

export const dynamic = 'force-dynamic'

export default async function HODProjectsPage() {
  const session = await getSession()
  if (!session || session.role !== 'hod') redirect('/login')

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODProjectsView projects={projects} />
      </div>
    </PortalLayout>
  )
}

