import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyProjectsView, FacultyProjectItem } from './components/FacultyProjectsView'
import { FALLBACK_PROJECTS } from '@/lib/projectData'

export const dynamic = 'force-dynamic'

export default async function FacultyProjectsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const projectsFromDb = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const sourceProjects = projectsFromDb.length > 0 ? projectsFromDb : FALLBACK_PROJECTS

  const mappedProjects: FacultyProjectItem[] = sourceProjects.map((p) => ({
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
    guideEmail: (p as any).guideEmail || 'karthik.ai@vsb.edu.in',
    teamMembers: p.teamMembers,
    results: (p as any).results || null,
    createdAt: p.createdAt,
  }))

  return (
    <PortalLayout role="faculty" userName={user?.name || session.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyProjectsView initialProjects={mappedProjects} />
      </div>
    </PortalLayout>
  )
}
