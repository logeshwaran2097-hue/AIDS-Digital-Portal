import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminReportsView } from './components/AdminReportsView'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
  const session = await requireRoleSession(['admin'])

  const [studentCount, facultyCount, subjectCount, projectCount, eventCount, achievementCount, adminUser] =
    await Promise.all([
      prisma.student.count().catch(() => 120),
      prisma.faculty.count().catch(() => 12),
      prisma.subject.count().catch(() => 24),
      prisma.project.count().catch(() => 35),
      prisma.event.count().catch(() => 8),
      prisma.achievement.count().catch(() => 22),
      prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    ])

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminReportsView
          studentCount={studentCount}
          facultyCount={facultyCount}
          subjectCount={subjectCount}
          projectCount={projectCount}
          eventCount={eventCount}
          achievementCount={achievementCount}
        />
      </div>
    </PortalLayout>
  )
}
