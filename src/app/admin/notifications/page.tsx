import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminNotificationsView, NotificationRecord } from './components/AdminNotificationsView'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const session = await requireRoleSession(['admin'])

  const [dbNotifications, adminUser] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
  ])

  const notificationsList: NotificationRecord[] = dbNotifications.map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    target: n.target || n.targetRole || 'ALL',
    createdByName: n.createdByName || 'Administrator',
    status: n.status || 'SENT',
    createdAt: n.createdAt ? (typeof n.createdAt === 'string' ? n.createdAt : n.createdAt.toISOString().split('T')[0]) : '',
  }))

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminNotificationsView initialNotifications={notificationsList} />
      </div>
    </PortalLayout>
  )
}
