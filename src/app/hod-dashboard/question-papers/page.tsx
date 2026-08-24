import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODQuestionPapersView } from './components/HODQuestionPapersView'

export const dynamic = 'force-dynamic'

const FALLBACK_QP = [
  { id: 'qp1', title: 'AD2301 Machine Learning - IAT 1 Question Paper', subjectCode: 'AD2301', subjectName: 'Machine Learning', semester: 5, year: 2025, examType: 'IAT-1', facultyName: 'Dr. S. Karthik', status: 'approved', createdAt: new Date('2025-09-20') },
  { id: 'qp2', title: 'AD2302 Deep Learning Architectures - Model Exam Paper', subjectCode: 'AD2302', subjectName: 'Deep Learning', semester: 5, year: 2025, examType: 'Model Exam', facultyName: 'Mrs. R. Priya', status: 'approved', createdAt: new Date('2025-10-15') },
]

export default async function HODQuestionPapersPage() {
  const session = await requireRoleSession(['hod'])

  const dbPapers = await prisma.questionPaper.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const papers = dbPapers.length > 0 ? dbPapers : FALLBACK_QP

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <HODQuestionPapersView papers={papers} />
      </div>
    </PortalLayout>
  )
}
