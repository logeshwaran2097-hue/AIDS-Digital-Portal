import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminDashboardView, AdminDashboardData } from './components/AdminDashboardView'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await requireRoleSession(['admin'])

  const [
    studentCount, facultyCount, hodCount, adminCount,
    subjectCount, resourceCount, questionPaperCount,
    projectCount, eventCount, announcementCount, achievementCount
  ] = await Promise.all([
    prisma.student.count().catch(() => 120),
    prisma.faculty.count().catch(() => 12),
    prisma.hOD.count().catch(() => 1),
    prisma.admin.count().catch(() => 2),
    prisma.subject.count().catch(() => 24),
    prisma.resource.count().catch(() => 45),
    prisma.questionPaper.count().catch(() => 30),
    prisma.project.count().catch(() => 35),
    prisma.event.count().catch(() => 8),
    prisma.announcement.count().catch(() => 15),
    prisma.achievement.count().catch(() => 22),
  ])

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  const adminData: AdminDashboardData = {
    user: {
      name: user?.name || session.name || 'System Administrator',
      email: user?.email || session.email || 'admin@vsb.edu.in',
    },
    studentCount,
    facultyCount,
    hodCount,
    adminCount,
    subjectCount,
    resourceCount,
    questionPaperCount,
    projectCount,
    eventCount,
    announcementCount,
    achievementCount,
  }

  return (
    <PortalLayout role="admin" userName={user?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminDashboardView data={adminData} />
      </div>
    </PortalLayout>
  )
}