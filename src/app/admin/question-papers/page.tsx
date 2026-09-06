import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminQuestionPapersView, QPRecord } from './components/AdminQuestionPapersView'

export const dynamic = 'force-dynamic'

export default async function AdminQuestionPapersPage() {
  const session = await requireRoleSession(['admin'])

  const [dbPapers, dbSubjects, adminUser] = await Promise.all([
    prisma.questionPaper.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
    prisma.subject.findMany().catch(() => []),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
  ])

  const subjectMap = new Map(dbSubjects.map((s) => [s.id, s]))
  const subjectCodeMap = new Map(dbSubjects.map((s) => [s.code, s]))

  const papersList: QPRecord[] = dbPapers.map((p) => {
    const sub = subjectMap.get(p.subjectId) || subjectCodeMap.get(p.subjectId)

    return {
      id: p.id,
      subjectCode: sub?.code || p.subjectId || 'N/A',
      subjectName: sub?.name || p.fileName || 'Course Paper',
      examType: p.examType,
      academicYear: p.academicYear,
      year: p.year,
      semester: p.semester,
      fileName: p.fileName,
      fileSize: p.fileSize,
      uploadedByName: p.uploadedByName || 'Faculty Member',
      status: p.status,
    }
  })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminQuestionPapersView initialPapers={papersList} />
      </div>
    </PortalLayout>
  )
}
