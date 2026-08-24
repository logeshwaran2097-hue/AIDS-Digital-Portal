import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminEventsView, EventRecord } from './components/AdminEventsView'

export const dynamic = 'force-dynamic'

const FALLBACK_EVENTS: EventRecord[] = [
  { id: 'e1', name: 'National Level AI & Data Science Symposium 2026', description: 'Flagship technical fest featuring paper presentations, coding sprints, and project expos.', category: 'Symposium', date: '2026-03-15', time: '09:00 AM - 04:30 PM', venue: 'Main Auditorium & AI Labs', organizer: 'Department of AI & DS', status: 'published' },
  { id: 'e2', name: 'Hands-on Generative AI & LLM Workshop', description: 'Practical session on fine-tuning LLaMA 3 models and building agentic workflows with LangChain.', category: 'Workshop', date: '2026-03-22', time: '10:00 AM - 03:00 PM', venue: 'High Performance Computing Lab', organizer: 'Department of AI & DS', status: 'published' },
]

export default async function AdminEventsPage() {
  const session = await requireRoleSession(['admin'])

  const dbEvents = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  }).catch(() => [])

  const eventsList: EventRecord[] = dbEvents.length > 0 ? dbEvents.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    category: e.category,
    date: e.date ? e.date.toISOString().split('T')[0] : '2026-03-15',
    time: e.time,
    venue: e.venue,
    organizer: 'Department of AI & DS',
    status: e.status || 'published',
  })) : FALLBACK_EVENTS

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminEventsView initialEvents={eventsList} />
      </div>
    </PortalLayout>
  )
}
