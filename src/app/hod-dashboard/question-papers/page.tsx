import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODQuestionPapersView } from './components/HODQuestionPapersView'

export const dynamic = 'force-dynamic'

const FALLBACK_QP = [
  {
    id: 'qp1',
    examType: 'IAT-1',
    academicYear: '2025-2026',
    semester: 5,
    year: 3,
    fileName: 'AD2301-Machine-Learning-IAT1.pdf',
    fileUrl: '#',
    status: 'approved',
    uploadedByName: 'Dr. S. Karthik',
    createdAt: new Date('2025-09-20'),
  },
  {
    id: 'qp2',
    examType: 'Model Exam',
    academicYear: '2025-2026',
    semester: 5,
    year: 3,
    fileName: 'AD2302-Deep-Learning-Model.pdf',
    fileUrl: '#',
    status: 'approved',
    uploadedByName: 'Mrs. R. Priya',
    createdAt: new Date('2025-10-15'),
  },
]

export default async function HODQuestionPapersPage() {
  const session = await requireRoleSession(['hod'])

  const dbPapers = await prisma.questionPaper.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const papers: any[] = dbPapers.length > 0 ? dbPapers : FALLBACK_QP

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODQuestionPapersView papers={papers} />
      </div>
    </PortalLayout>
  )
}
