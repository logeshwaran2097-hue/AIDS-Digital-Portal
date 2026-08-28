import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminEventsView, EventRecord } from './components/AdminEventsView'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const session = await requireRoleSession(['admin'])

  const dbEvents = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  }).catch(() => [])

  const eventsList: EventRecord[] = dbEvents.map((e) => {
    let sem: any = (e as any).registrationInfo || 'ALL'
    const semNum = sem.replace('sem', '')
    const yrNum = semNum !== 'ALL' && !isNaN(Number(semNum)) ? Math.ceil(Number(semNum) / 2) : 'ALL'
    const yrKey = yrNum !== 'ALL' ? `year${yrNum}` : 'ALL'
    return {
      id: e.id,
      name: e.name,
      description: e.description,
      category: e.category,
      semester: sem,
      semesterLabel: sem === 'ALL' ? 'All 8 Semesters' : `Semester ${semNum} (Yr ${yrNum})`,
      academicYear: yrKey,
      registrationInfo: e.registrationInfo,
      date: e.date ? (typeof e.date === 'string' ? e.date : e.date.toISOString().split('T')[0]) : '',
      time: e.time,
      venue: e.venue,
      organizer: e.createdByName || 'Department of AI & DS',
      status: e.status || 'published',
    }
  })

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminEventsView initialEvents={eventsList} />
      </div>
    </PortalLayout>
  )
}
