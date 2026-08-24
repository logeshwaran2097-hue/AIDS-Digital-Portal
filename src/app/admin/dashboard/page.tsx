import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminDashboardView, AdminDashboardData } from './components/AdminDashboardView'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const stats = await prisma.$transaction([
    prisma.student.count(),
    prisma.faculty.count(),
    prisma.hOD.count(),
    prisma.admin.count(),
    prisma.subject.count(),
    prisma.resource.count(),
    prisma.questionPaper.count(),
    prisma.project.count(),
    prisma.event.count(),
    prisma.announcement.count(),
    prisma.achievement.count(),
  ])

  const [
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
  ] = stats

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  const adminData: AdminDashboardData = {
    user: {
      name: user?.name || 'System Administrator',
      email: user?.email || 'admin@vsb.edu.in',
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
    <PortalLayout role="admin" userName={user?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminDashboardView data={adminData} />
      </div>
    </PortalLayout>
  )
}