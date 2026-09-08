import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyProjectsView, FacultyProjectItem } from './components/FacultyProjectsView'

export const dynamic = 'force-dynamic'

export default async function FacultyProjectsPage() {
  const session = await requireRoleSession(['faculty'])

  const dbProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const projectsList: FacultyProjectItem[] = dbProjects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    problemStatement: p.problemStatement,
    proposedSolution: p.proposedSolution,
    technologies: p.technologies || 'Python, PyTorch',
    domain: p.domain || 'AI & Data Science',
    year: p.year || 3,
    status: p.status || 'Active',
    guideName: p.guideName || 'Faculty Guide',
    guideEmail: p.guideEmail || null,
    teamMembers: p.teamMembers || 'Student Team',
    results: p.results || null,
    createdAt: p.createdAt || new Date(),
  }))

  const [user, faculty] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null),
  ])
  const facultyName = user?.name || session.name || 'Faculty Member'
  const isAdvisor = faculty?.facultyType === 'advisor' || faculty?.facultyType === 'both'
  const roleBadgeLabel = isAdvisor
    ? 'Class Advisor'
    : faculty?.facultyType === 'lab_faculty'
    ? 'Lab Handler'
    : 'Faculty Member'

  return (
    <PortalLayout
      role="faculty"
      userName={facultyName}
      userEmail={user?.email || session.email}
      roleBadgeLabel={roleBadgeLabel}
      isAdvisor={isAdvisor}
    >
      <div className="py-2 animate-fade-in">
        <FacultyProjectsView initialProjects={projectsList} facultyName={facultyName} />
      </div>
    </PortalLayout>
  )
}
