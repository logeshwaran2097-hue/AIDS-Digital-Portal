import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAnnouncementsView, AnnouncementRecord } from './components/AdminAnnouncementsView'

export const dynamic = 'force-dynamic'

const FALLBACK_ANNOUNCEMENTS: AnnouncementRecord[] = [
  {
    id: 'a1',
    title: 'Anna University Odd Semester Model Examination Schedule',
    content: 'Model practical and theory examinations for 3rd and 4th year AI & DS students begin from next Monday.',
    category: 'ACADEMIC',
    target: 'ALL',
    createdByName: 'Department Administrator',
    isPublished: true,
    createdAt: '2026-02-20',
  },
  {
    id: 'a2',
    title: 'Internal Assessment Test - 1 Marks Upload Deadline',
    content: 'All faculty members are requested to complete mark entries into the portal before 5:00 PM Friday.',
    category: 'EXAMINATION',
    target: 'FACULTY',
    createdByName: 'Department Administrator',
    isPublished: true,
    createdAt: '2026-02-18',
  },
]

export default async function AdminAnnouncementsPage() {
  const session = await requireRoleSession(['admin'])

  const [dbAnnouncements, adminUser] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
  ])

  const announcementsList: AnnouncementRecord[] = dbAnnouncements.length > 0 ? dbAnnouncements.map((a: any) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category || 'ACADEMIC',
    target: a.target || a.targetAudience || 'ALL',
    targetSpecific: a.targetSpecific || null,
    createdByName: a.createdByName || 'System Administrator',
    isPublished: a.isPublished !== undefined ? a.isPublished : true,
    createdAt: a.createdAt ? (typeof a.createdAt === 'string' ? a.createdAt : a.createdAt.toISOString().split('T')[0]) : '2026-02-20',
  })) : FALLBACK_ANNOUNCEMENTS

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAnnouncementsView initialAnnouncements={announcementsList} />
      </div>
    </PortalLayout>
  )
}
