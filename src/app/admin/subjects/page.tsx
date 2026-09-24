import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminSubjectsView, SubjectItem } from './components/AdminSubjectsView'

export const dynamic = 'force-dynamic'

export default async function AdminSubjectsPage() {
  const session = await requireRoleSession(['admin'])

  const [dbSubjects, adminUser] = await Promise.all([
    prisma.subject.findMany({ orderBy: { code: 'asc' } }).catch(() => []),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
  ])

  const subjects: SubjectItem[] = dbSubjects.map((s) => {
    const match = s.code.match(/[A-Za-z]+[0-9]([1-8])/)
    const sem = match ? parseInt(match[1], 10) : 1
    return {
      id: s.id,
      code: s.code,
      name: s.name,
      credits: s.credits,
      category: (s as any).category || 'Professional Core (PC)',
      facultyInCharge: (s as any).facultyInCharge || '',
      courseType: (s as any).courseType || 'Theory',
      semester: sem,
      year: Math.ceil(sem / 2),
      description: s.description,
      units: [],
    }
  })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminSubjectsView initialSubjects={subjects} />
      </div>
    </PortalLayout>
  )
}
