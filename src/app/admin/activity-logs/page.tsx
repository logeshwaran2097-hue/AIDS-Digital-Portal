import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminActivityLogsView, LogRecord } from './components/AdminActivityLogsView'

export const dynamic = 'force-dynamic'

export default async function AdminActivityLogsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const dbLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const logsList: LogRecord[] = dbLogs.map((l) => ({
    id: l.id,
    userName: l.userName || 'System User',
    action: l.action,
    module: l.module,
    details: l.details,
    status: l.status,
    createdAt: l.createdAt.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminActivityLogsView initialLogs={logsList} />
      </div>
    </PortalLayout>
  )
}
