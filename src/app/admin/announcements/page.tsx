import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAnnouncementsView, AnnouncementRecord } from './components/AdminAnnouncementsView'

export const dynamic = 'force-dynamic'

const FALLBACK_ANNOUNCEMENTS: AnnouncementRecord[] = [
  { id: 'a1', title: 'Anna University Odd Semester Model Examination Schedule', content: 'Model practical and theory examinations for 3rd and 4th year AI & DS students begin from next Monday.', priority: 'high', targetAudience: 'all', category: 'Academics', publishedDate: '2026-02-20', status: 'published' },
  { id: 'a2', title: 'Internal Assessment Test - 1 Marks Upload Deadline', content: 'All faculty members are requested to complete mark entries into the portal before 5:00 PM Friday.', priority: 'medium', targetAudience: 'faculty', category: 'Examination', publishedDate: '2026-02-18', status: 'published' },
]

export default async function AdminAnnouncementsPage() {
  const session = await requireRoleSession(['admin'])

  const dbAnnouncements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const announcementsList: AnnouncementRecord[] = dbAnnouncements.length > 0 ? dbAnnouncements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    priority: a.priority || 'normal',
    targetAudience: a.targetAudience || 'all',
    category: a.category || 'General',
    publishedDate: a.createdAt ? a.createdAt.toISOString().split('T')[0] : '2026-02-20',
    status: a.status || 'published',
  })) : FALLBACK_ANNOUNCEMENTS

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAnnouncementsView initialAnnouncements={announcementsList} />
      </div>
    </PortalLayout>
  )
}
