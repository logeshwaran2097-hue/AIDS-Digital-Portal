import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminNotificationsView, NotificationRecord } from './components/AdminNotificationsView'

export const dynamic = 'force-dynamic'

const FALLBACK_NOTIFICATIONS: NotificationRecord[] = [
  { id: 'n1', title: 'System-wide Nightly Backup Completed', message: 'Automated snapshot backup and transaction sync completed successfully.', type: 'info', targetRole: 'all', priority: 'low', sentAt: '2026-02-23', status: 'sent' },
  { id: 'n2', title: 'Semester 5 CIA-1 Marks Moderation Request', message: 'Department moderation committee meeting scheduled for 3:00 PM tomorrow.', type: 'alert', targetRole: 'faculty', priority: 'high', sentAt: '2026-02-22', status: 'sent' },
]

export default async function AdminNotificationsPage() {
  const session = await requireRoleSession(['admin'])

  const dbNotifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const notificationsList: NotificationRecord[] = dbNotifications.length > 0 ? dbNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type || 'info',
    targetRole: n.targetRole || 'all',
    priority: n.priority || 'medium',
    sentAt: n.createdAt ? n.createdAt.toISOString().split('T')[0] : '2026-02-23',
    status: 'sent',
  })) : FALLBACK_NOTIFICATIONS

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminNotificationsView initialNotifications={notificationsList} />
      </div>
    </PortalLayout>
  )
}
