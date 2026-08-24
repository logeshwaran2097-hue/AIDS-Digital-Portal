import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAnnouncementsView, AnnouncementRecord } from './components/AdminAnnouncementsView'

export const dynamic = 'force-dynamic'

export default async function AdminAnnouncementsPage() {
  const session = await requireRoleSession(['admin'])

  const [dbAnnouncements, adminUser] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
  ])

  const announcementsList: AnnouncementRecord[] = dbAnnouncements.map((a: any) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category || 'ACADEMIC',
    target: a.target || a.targetAudience || 'ALL',
    targetSpecific: a.targetSpecific || null,
    createdByName: a.createdByName || 'System Administrator',
    isPublished: a.isPublished !== undefined ? a.isPublished : true,
    createdAt: a.createdAt ? (typeof a.createdAt === 'string' ? a.createdAt : a.createdAt.toISOString().split('T')[0]) : '',
  }))

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAnnouncementsView initialAnnouncements={announcementsList} />
      </div>
    </PortalLayout>
  )
}
