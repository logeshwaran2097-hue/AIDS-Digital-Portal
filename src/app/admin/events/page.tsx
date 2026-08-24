import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminEventsView, EventRecord } from './components/AdminEventsView'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const session = await requireRoleSession(['admin'])

  const dbEvents = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  })

  const eventsList: EventRecord[] = dbEvents.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    category: e.category,
    date: e.date.toISOString().split('T')[0],
    time: e.time,
    venue: e.venue,
    organizer: 'Department of AI & DS',
    status: e.status || 'published',
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminEventsView initialEvents={eventsList} />
      </div>
    </PortalLayout>
  )
}
