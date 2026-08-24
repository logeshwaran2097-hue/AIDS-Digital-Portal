import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentProjectsView } from './components/StudentProjectsView'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const session = await getSession()
  if (!session || session.role !== 'student') redirect('/login')

  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="student" userName={user?.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentProjectsView projects={projects} />
      </div>
    </PortalLayout>
  )
}