import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyEventsView, FacultyEventItem } from './components/FacultyEventsView'

export const dynamic = 'force-dynamic'

export default async function FacultyEventsPage() {
  const session = await getSession()
  if (!session || session.role !== 'faculty') redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const eventsFromDb = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  })

  const mappedEvents: FacultyEventItem[] = eventsFromDb.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    category: e.category,
    date: e.date,
    time: e.time,
    venue: e.venue,
    registrationUrl: e.registrationUrl,
    registrationInfo: e.registrationInfo,
    createdByName: e.createdByName || 'Dr. S. Karthik',
    status: e.status,
    isPublished: e.isPublished,
  }))

  return (
    <PortalLayout role="faculty" userName={user?.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyEventsView initialEvents={mappedEvents} />
      </div>
    </PortalLayout>
  )
}
