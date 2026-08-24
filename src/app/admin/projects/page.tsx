import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminProjectsView, ProjectRecord } from './components/AdminProjectsView'
import { FALLBACK_PROJECTS } from '@/lib/projectData'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const session = await requireRoleSession(['admin'])

  const dbProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const sourceProjects = dbProjects.length > 0 ? dbProjects : FALLBACK_PROJECTS

  const guides = ['Dr. S. Karthik', 'Mrs. R. Priya', 'Mr. S. Arun', 'Dr. M. Sowmya']
  const domains = [
    'Computer Vision & Deep Learning',
    'Natural Language Processing (NLP)',
    'Healthcare & Predictive Analytics',
    'Applied LLMs & GenAI',
    'Graph Neural Networks & Smart Cities',
    'Blockchain & Decentralized Identity',
  ]

  const projectsList: ProjectRecord[] = sourceProjects.map((p, idx) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    domain: p.domain || domains[idx % domains.length],
    guideName: p.guideName || guides[idx % guides.length],
    teamMembers: p.teamMembers || `23AD00${(idx * 2) + 1} & 23AD00${(idx * 2) + 2}`,
    status: p.status || 'Approved & Active',
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminProjectsView initialProjects={projectsList} />
      </div>
    </PortalLayout>
  )
}
