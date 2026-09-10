import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODEventsView, HODEventItem } from './components/HODEventsView'

export const dynamic = 'force-dynamic'

export default async function HODEventsPage() {
  const session = await requireRoleSession(['hod'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const hodName = user?.name || session.name || 'Head of Department'

  let dbEvents = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  }).catch(() => [])

  // If no events exist yet in the database, automatically seed official department events
  if (dbEvents.length === 0) {
    const initialEvents = [
      {
        name: 'National AI & Data Science Symposium — Mirai 2k26',
        description:
          'Flagship annual technical symposium featuring paper presentations, live project exhibitions, ML coding sprint, and reverse engineering challenges with cash prizes worth ₹50,000.',
        category: 'Symposium',
        date: new Date('2026-09-22T09:30:00Z'),
        time: '09:30 AM - 04:30 PM',
        venue: 'VSB Central Auditorium & AI Seminar Hall',
        registrationInfo: 'ALL',
        registrationUrl: 'https://forms.gle/vsb-aids-mirai2k26',
        createdByName: 'Dr. Head of Department',
        status: 'published',
        isPublished: true,
      },
      {
        name: 'Smart India Hackathon (SIH) 2026 — Internal Department HackFest',
        description:
          '36-hour intense hardware & software prototype building competition for shortlisting AI & DS teams for national ministry problem statements.',
        category: 'Hackathon',
        date: new Date('2026-09-28T09:00:00Z'),
        time: '09:00 AM - 09:00 PM (36 Hours)',
        venue: 'AI & DS High Performance Computing Lab 3',
        registrationInfo: 'ALL',
        registrationUrl: 'https://sih.gov.in',
        createdByName: 'Dr. Head of Department',
        status: 'published',
        isPublished: true,
      },
      {
        name: 'Deep Learning & Large Language Models Hands-on Bootcamp',
        description:
          'Intensive practical training on PyTorch, HuggingFace transformers, fine-tuning LLMs with LoRA/QLoRA, and building retrieval-augmented generation (RAG) pipelines.',
        category: 'Workshop',
        date: new Date('2026-10-05T10:00:00Z'),
        time: '10:00 AM - 04:00 PM',
        venue: 'Advanced AI Research Lab',
        registrationInfo: 'Semesters 3, 5, 7',
        registrationUrl: 'https://forms.gle/dl-llm-bootcamp',
        createdByName: 'Prof. Raja (Class Advisor)',
        status: 'published',
        isPublished: true,
      },
      {
        name: 'Industry Keynote: Scalable Cloud AI Architectures & MLOps in Production',
        description:
          'Guest lecture by Senior Principal AI Engineer from Google Cloud on production ML model deployments, Kubernetes inference pipelines, and latency optimization.',
        category: 'Guest Lecture',
        date: new Date('2026-10-12T14:00:00Z'),
        time: '02:00 PM - 04:30 PM',
        venue: 'VSB Mechanical / Computing Seminar Complex',
        registrationInfo: 'ALL',
        registrationUrl: null,
        createdByName: 'Dr. Head of Department',
        status: 'published',
        isPublished: true,
      },
    ]

    await prisma.event.createMany({ data: initialEvents }).catch(() => {})
    dbEvents = await prisma.event.findMany({ orderBy: { date: 'asc' } }).catch(() => [])
  }

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
