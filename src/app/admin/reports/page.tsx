import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminReportsView } from './components/AdminReportsView'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const [studentCount, facultyCount, subjectCount, projectCount, eventCount, achievementCount] =
    await prisma.$transaction([
      prisma.student.count(),
      prisma.faculty.count(),
      prisma.subject.count(),
      prisma.project.count(),
      prisma.event.count(),
      prisma.achievement.count(),
    ])

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
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
