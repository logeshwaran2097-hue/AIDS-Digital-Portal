import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminQuestionPapersView, QPRecord } from './components/AdminQuestionPapersView'

export const dynamic = 'force-dynamic'

export default async function AdminQuestionPapersPage() {
  const session = await requireRoleSession(['admin'])

  const dbPapers = await prisma.questionPaper.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const subjectMap: Record<string, { code: string; name: string }> = {
    '1': { code: 'AD2301', name: 'Data Structures & Algorithms' },
    '2': { code: 'AD2302', name: 'Database Management Systems' },
    '3': { code: 'AD2303', name: 'Discrete Mathematics' },
    '4': { code: 'AD2304', name: 'Operating Systems' },
    '5': { code: 'AD2305', name: 'Machine Learning Foundations' },
    '6': { code: 'AD2306', name: 'Artificial Intelligence & Expert Systems' },
  }

  const papersList: QPRecord[] = dbPapers.map((p, idx) => {
    const sub = subjectMap[p.subjectId] || {
      code: `AD230${(idx % 6) + 1}`,
      name: ['Data Structures', 'Database Management', 'Discrete Mathematics', 'Operating Systems', 'Machine Learning', 'AI Systems'][idx % 6],
    }

    return {
      id: p.id,
      subjectCode: sub.code,
      subjectName: sub.name,
      examType: p.examType,
      academicYear: p.academicYear,
      year: p.year,
      semester: p.semester,
      fileName: p.fileName,
      fileSize: p.fileSize,
      uploadedByName: p.uploadedByName || 'Dr. S. Karthik',
      status: p.status,
    }
  })

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminQuestionPapersView initialPapers={papersList} />
      </div>
    </PortalLayout>
  )
}
