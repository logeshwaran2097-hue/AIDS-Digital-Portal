import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAcademicsView, SubjectItem } from './components/AdminAcademicsView'

export const dynamic = 'force-dynamic'

export default async function AdminAcademicsPage() {
  const session = await requireRoleSession(['admin'])

  const [resourceCount, questionPaperCount, dbSubjects, adminUser] = await Promise.all([
    prisma.resource.count().catch(() => 0),
    prisma.questionPaper.count().catch(() => 0),
    prisma.subject.findMany({ orderBy: { code: 'asc' } }).catch(() => []),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
  ])

  const subjects: SubjectItem[] = dbSubjects.map((s) => {
    // Extract sem from code (e.g. AD2301 -> 3, AD2401 -> 4, AD2501 -> 5) or default to 1
    const match = s.code.match(/[A-Za-z]+[0-9]([1-8])/)
    const sem = match ? parseInt(match[1], 10) : 1
    return {
      id: s.id,
      code: s.code,
      name: s.name,
      credits: s.credits,
      category: s.description?.includes('Practical') ? 'Laboratory Course (PC)' : 'Professional Core (PC)',
      facultyInCharge: 'Department Faculty',
      semester: sem,
      year: Math.ceil(sem / 2),
      description: s.description,
      units: [
        { number: 1, title: 'Unit I: Fundamental Principles & Foundations', hours: 9 },
        { number: 2, title: 'Unit II: Mathematical Formulations & Architecture', hours: 9 },
        { number: 3, title: 'Unit III: Analytical Methods & Algorithms', hours: 9 },
        { number: 4, title: 'Unit IV: Advanced System Engineering', hours: 9 },
        { number: 5, title: 'Unit V: Industrial Applications & Case Studies', hours: 9 },
      ],
    }
  })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAcademicsView
          totalResources={resourceCount}
          totalQuestionPapers={questionPaperCount}
          initialSubjects={subjects}
        />
      </div>
    </PortalLayout>
  )
}
