import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import EventsList from './components/EventsList'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const session = await getSession()
  if (!session || session.role !== 'student') redirect('/login')
  const events = await prisma.event.findMany({ where: { isPublished: true }, orderBy: { date: 'asc' } })
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  return (
    <PortalLayout role="student" userName={user?.name || 'Student'} >
      <EventsList events={events} />
    </PortalLayout>
  )
}