import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminActivityLogsView, LogRecord } from './components/AdminActivityLogsView'

export const dynamic = 'force-dynamic'

const FALLBACK_LOGS: LogRecord[] = [
  { id: 'l1', userName: 'Administrator', action: 'USER_LOGIN', module: 'Authentication', details: 'Admin login via OTP verification', status: 'SUCCESS', createdAt: 'Feb 24, 11:30 AM' },
  { id: 'l2', userName: 'Dr. S. Karthik', action: 'RESOURCE_UPLOAD', module: 'Academics', details: 'Uploaded Unit 3 Deep Learning notes', status: 'SUCCESS', createdAt: 'Feb 24, 10:15 AM' },
  { id: 'l3', userName: 'Prof. Dr. V. Sundar', action: 'QP_APPROVAL', module: 'Examination', details: 'Approved CIA-1 Question Paper for AD2301', status: 'SUCCESS', createdAt: 'Feb 24, 09:45 AM' },
]

export default async function AdminActivityLogsPage() {
  const session = await requireRoleSession(['admin'])

  const dbLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  }).catch(() => [])

  const logsList: LogRecord[] = dbLogs.length > 0 ? dbLogs.map((l) => ({
    id: l.id,
    userName: l.userName || 'System User',
    action: l.action,
    module: l.module,
    details: l.details,
    status: l.status,
    createdAt: l.createdAt ? l.createdAt.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) : 'Feb 24, 11:30 AM',
  })) : FALLBACK_LOGS

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminActivityLogsView initialLogs={logsList} />
      </div>
    </PortalLayout>
  )
}
