import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentProjectsView } from './components/StudentProjectsView'

export const dynamic = 'force-dynamic'

export default async function StudentProjectsPage() {
  const session = await requireRoleSession(['student'])

  const [dbProjects, user, student] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null),
  ])

  const studentYear = student?.year || 2
  const studentSem = student?.semester || 3
  
  // Calculate dynamic batch based on student year
  // In current academic term:
  // Year 4 -> Batch 2022 - 2026
  // Year 3 -> Batch 2023 - 2027
  // Year 2 -> Batch 2024 - 2028
  // Year 1 -> Batch 2025 - 2029
  const startYear = 2026 - studentYear
  const endYear = startYear + 4
  const activeBatch = `${startYear} - ${endYear}`
  const romanYear = ['I', 'II', 'III', 'IV'][studentYear - 1] || 'II'
  const batchLabel = `${romanYear} Year (Semester ${studentSem})`

  return (
    <PortalLayout role="student" userName={user?.name || session.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentProjectsView
          projects={dbProjects}
          activeBatch={activeBatch}
          batchLabel={batchLabel}
        />
      </div>
    </PortalLayout>
  )
}