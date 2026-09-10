import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODEventsView, HODEventItem } from './components/HODEventsView'

export const dynamic = 'force-dynamic'

export default async function HODEventsPage() {
  const session = await requireRoleSession(['hod'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const hodName = user?.name || session.name || 'Head of Department'

  const dbEvents = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  }).catch(() => [])


  const mappedEvents: HODEventItem[] = dbEvents.map((e: any) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    category: e.category,
    date: e.date
      ? typeof e.date === 'string'
        ? e.date
        : new Date(e.date).toISOString().split('T')[0]
      : '',
    time: e.time || '09:30 AM - 04:30 PM',
    venue: e.venue || 'AI & DS Lab',
    registrationUrl: e.registrationUrl || null,
    registrationInfo: e.registrationInfo || 'ALL',
    createdByName: e.createdByName || hodName,
    status: e.status || 'published',
    isPublished: Boolean(e.isPublished),
  }))

  return (
    <PortalLayout role="hod" userName={hodName}>
      <div className="py-2 animate-fade-in">
        <HODEventsView initialEvents={mappedEvents} hodName={hodName} />
      </div>
    </PortalLayout>
  )
}
