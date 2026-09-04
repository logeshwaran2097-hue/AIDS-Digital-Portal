import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyNotificationsView } from './components/FacultyNotificationsView'

export const dynamic = 'force-dynamic'

export default async function FacultyNotificationsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  const dbNotifs = await prisma.notification.findMany({
    where: {
      status: 'published',
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  }).catch(() => [])

  const initialNotifs = dbNotifs.map((n) => {
    let isRead = false
    try {
      const readArray: string[] = JSON.parse(n.readBy || '[]')
      isRead = readArray.includes(session.userId)
    } catch {
      isRead = false
    }

    return {
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
      type: (n.target === 'faculty' ? 'urgent' : 'academic') as 'urgent' | 'academic' | 'event' | 'system',
      isRead,
    }
  })

  return (
    <PortalLayout role="faculty" userName={user?.name || session.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyNotificationsView initialNotifications={initialNotifs} />
      </div>
    </PortalLayout>
  )
}
