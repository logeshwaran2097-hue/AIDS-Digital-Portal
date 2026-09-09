import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyProjectsView, FacultyProjectItem } from './components/FacultyProjectsView'

export const dynamic = 'force-dynamic'

export default async function FacultyProjectsPage() {
  const session = await requireRoleSession(['faculty'])

  const [user, faculty] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null),
  ])

  const facultyName = user?.name || session.name || 'Faculty Member'
  const facultyEmail = user?.email || session.email || ''
  const isAdvisor =
    faculty?.facultyType === 'advisor' ||
    faculty?.facultyType === 'both' ||
    Boolean(faculty?.advisorBatch || (faculty?.advisorYear && faculty?.advisorSec))

  const advisorYear = faculty?.advisorYear || 2
  const advisorSec = faculty?.advisorSec || 'B'
  const advisorBatch = faculty?.advisorBatch || `Year ${advisorYear} · Sec ${advisorSec}`

  // Collect students in the advisor's assigned class to match team members
  const classStudents = isAdvisor
    ? await prisma.student.findMany({
        where: {
          year: advisorYear,
          section: advisorSec,
        },
        select: { registerNumber: true, userId: true },
      }).catch(() => [])
    : []

  const classUserIds = classStudents.map((s) => s.userId)
  const classUsers = classUserIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: classUserIds } },
        select: { name: true },
      }).catch(() => [])
    : []

  const classNamesLower = classUsers.map((u) => u.name.toLowerCase().trim()).filter(Boolean)
  const classRegsLower = classStudents.map((s) => s.registerNumber.toLowerCase().trim()).filter(Boolean)

  // Query ONLY projects belonging to:
  // 1. Advisor's assigned class cohort (Year 2 Sec B)
  // 2. Mentoring projects where this faculty is the designated guide
  const whereConditions: any[] = []
  if (isAdvisor) {
    whereConditions.push({ year: advisorYear })
  }
  if (facultyEmail) {
    whereConditions.push({ guideEmail: { equals: facultyEmail, mode: 'insensitive' } })
  }
  if (facultyName) {
    whereConditions.push({ guideName: { contains: facultyName, mode: 'insensitive' } })
  }

  const dbProjects = await prisma.project.findMany({
    where: whereConditions.length > 0 ? { OR: whereConditions } : undefined,
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const projectsList: FacultyProjectItem[] = dbProjects.map((p) => {
    const pMembersLower = (p.teamMembers || '').toLowerCase()
    const isStudentInClass =
      classRegsLower.some((reg) => pMembersLower.includes(reg)) ||
      classNamesLower.some((nm) => pMembersLower.includes(nm))

    const isClassProj = (isAdvisor && p.year === advisorYear) || isStudentInClass
    const isMentorProj =
      (p.guideName || '').toLowerCase().includes(facultyName.toLowerCase()) ||
      Boolean(p.guideEmail && p.guideEmail.toLowerCase() === facultyEmail.toLowerCase())

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      problemStatement: p.problemStatement,
      proposedSolution: p.proposedSolution,
      technologies: p.technologies || 'Python, PyTorch',
      domain: p.domain || 'AI & Data Science',
      year: p.year || advisorYear,
      status: p.status || 'Active',
      guideName: p.guideName || facultyName,
      guideEmail: p.guideEmail || facultyEmail,
      teamMembers: p.teamMembers || 'Student Team',
      results: p.results || null,
      createdAt: p.createdAt || new Date(),
      isClassProject: isClassProj,
      isMentoredByMe: isMentorProj,
    }
  })

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
        <FacultyProjectsView
          initialProjects={projectsList}
          facultyName={facultyName}
          facultyEmail={facultyEmail}
          isAdvisor={isAdvisor}
          advisorYear={advisorYear}
          advisorSec={advisorSec}
          advisorBatch={advisorBatch}
        />
      </div>
    </PortalLayout>
  )
}
