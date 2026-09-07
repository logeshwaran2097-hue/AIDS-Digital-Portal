import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyEventsView, FacultyEventItem } from './components/FacultyEventsView'

export const dynamic = 'force-dynamic'

export default async function FacultyEventsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const facultyName = user?.name || session.name || 'Faculty Member'
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
    createdByName: e.createdByName || facultyName,
    status: e.status,
    isPublished: e.isPublished,
  }))

  const faculty = (await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (session.facultyId ? await prisma.faculty.findUnique({ where: { facultyId: session.facultyId } }).catch(() => null) : null)

  const isAdvisor =
    faculty?.facultyType === 'advisor' ||
    faculty?.facultyType === 'both' ||
    Boolean(faculty?.advisorBatch || (faculty?.advisorYear && faculty?.advisorSec))

  return (
    <PortalLayout
      role="faculty"
      userName={facultyName}
      userEmail={user?.email || session.email}
      roleBadgeLabel={isAdvisor ? 'Class Advisor' : 'Faculty Member'}
      isAdvisor={isAdvisor}
    >
      <div className="py-2 animate-fade-in">
        <FacultyEventsView initialEvents={mappedEvents} facultyName={facultyName} />
      </div>
    </PortalLayout>
  )
}
