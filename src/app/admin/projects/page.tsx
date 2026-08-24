import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminProjectsView, ProjectRecord } from './components/AdminProjectsView'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const dbProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const guides = ['Dr. S. Karthik', 'Mrs. R. Priya', 'Mr. S. Arun', 'Dr. M. Sowmya']
  const domains = [
    'Computer Vision & Deep Learning',
    'Natural Language Processing (NLP)',
    'Healthcare & Predictive Analytics',
    'Applied LLMs & GenAI',
    'Graph Neural Networks & Smart Cities',
    'Blockchain & Decentralized Identity',
  ]

  const projectsList: ProjectRecord[] = dbProjects.map((p, idx) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    domain: domains[idx % domains.length],
    guideName: guides[idx % guides.length],
    teamMembers: `23AD00${(idx * 2) + 1} & 23AD00${(idx * 2) + 2}`,
    status: p.status || 'Approved & Active',
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminProjectsView initialProjects={projectsList} />
      </div>
    </PortalLayout>
  )
}
