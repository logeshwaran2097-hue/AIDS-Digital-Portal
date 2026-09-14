import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cachedDbQuery } from '@/lib/dbCache'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminDashboardView, AdminDashboardData } from './components/AdminDashboardView'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function AdminDashboardPage() {
  const session = await requireRoleSession(['admin'])

  const [
    studentCount, facultyCount, hodCount, adminCount,
    subjectCount, resourceCount, questionPaperCount,
    projectCount, eventCount, announcementCount, achievementCount,
    odProofCount, user
  ] = await cachedDbQuery(
    `admin_dashboard_kpis_${session.userId}`,
    () => Promise.all([
      prisma.student.count().catch(() => 0),
      prisma.faculty.count().catch(() => 0),
      prisma.hOD.count().catch(() => 0),
      prisma.admin.count().catch(() => 1),
      prisma.subject.count().catch(() => 0),
      prisma.resource.count().catch(() => 0),
      prisma.questionPaper.count().catch(() => 0),
      prisma.project.count().catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.announcement.count().catch(() => 0),
      prisma.achievement.count().catch(() => 0),
      prisma.oDProof.count().catch(() => 0),
      prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    ]),
    8000,
    ['admin', 'students', 'faculty', 'resources', 'projects', 'announcements', 'events', 'od_proofs']
  )

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
    odProofCount,
  }

  return (
    <PortalLayout role="admin" userName={user?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminDashboardView data={adminData} />
      </div>
    </PortalLayout>
  )
}