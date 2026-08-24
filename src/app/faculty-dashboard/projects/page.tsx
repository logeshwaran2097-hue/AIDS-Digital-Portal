import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyProjectsView, FacultyProjectItem } from './components/FacultyProjectsView'

export const dynamic = 'force-dynamic'

export default async function FacultyProjectsPage() {
  const session = await getSession()
  if (!session || session.role !== 'faculty') redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const projectsFromDb = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const mappedProjects: FacultyProjectItem[] = projectsFromDb.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    problemStatement: p.problemStatement,
    proposedSolution: p.proposedSolution,
    technologies: p.technologies,
    domain: p.domain,
    year: p.year,
    status: p.status,
    guideName: p.guideName || 'Dr. S. Karthik (Professor)',
    guideEmail: p.guideEmail,
    teamMembers: p.teamMembers,
    results: p.results,
    createdAt: p.createdAt,
  }))

  return (
    <PortalLayout role="faculty" userName={user?.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyProjectsView initialProjects={mappedProjects} />
      </div>
    </PortalLayout>
  )
}
