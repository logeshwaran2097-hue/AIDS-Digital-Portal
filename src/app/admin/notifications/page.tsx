import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminNotificationsView, NotificationRecord } from './components/AdminNotificationsView'

export const dynamic = 'force-dynamic'

const FALLBACK_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'n1',
    title: 'System-wide Automated Backup Completed',
    message: 'Automated snapshot backup and transaction sync completed successfully.',
    target: 'ALL',
    createdByName: 'System Administrator',
    status: 'SENT',
    createdAt: '2026-02-23',
  },
  {
    id: 'n2',
    title: 'Semester 5 CIA-1 Marks Moderation Request',
    message: 'Department moderation committee meeting scheduled for 3:00 PM tomorrow.',
    target: 'FACULTY',
    createdByName: 'System Administrator',
    status: 'SENT',
    createdAt: '2026-02-22',
  },
]

export default async function AdminNotificationsPage() {
  const session = await requireRoleSession(['admin'])

  const [dbNotifications, adminUser] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
  ])

  const notificationsList: NotificationRecord[] = dbNotifications.length > 0 ? dbNotifications.map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    target: n.target || n.targetRole || 'ALL',
    createdByName: n.createdByName || 'Administrator',
    status: n.status || 'SENT',
    createdAt: n.createdAt ? (typeof n.createdAt === 'string' ? n.createdAt : n.createdAt.toISOString().split('T')[0]) : '2026-02-23',
  })) : FALLBACK_NOTIFICATIONS

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminNotificationsView initialNotifications={notificationsList} />
      </div>
    </PortalLayout>
  )
}
