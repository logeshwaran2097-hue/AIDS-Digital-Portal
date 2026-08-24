import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyQuestionPapersView, FacultyQPItem } from './components/FacultyQuestionPapersView'

export const dynamic = 'force-dynamic'

export default async function FacultyQuestionPapersPage() {
  const session = await getSession()
  if (!session || session.role !== 'faculty') redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const subjects = await prisma.subject.findMany({
    orderBy: { code: 'asc' },
    select: { id: true, code: true, name: true },
  })
  const subjectMap = new Map(subjects.map((s) => [s.id, s]))

  const papersFromDb = await prisma.questionPaper.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const mappedPapers: FacultyQPItem[] = papersFromDb.map((p) => {
    const s = subjectMap.get(p.subjectId)
    return {
      id: p.id,
      subjectId: p.subjectId,
      subjectCode: s?.code || 'AD2301',
      subjectName: s?.name || 'Department Course Subject',
      examType: p.examType,
      academicYear: p.academicYear,
      year: p.year,
      semester: p.semester,
      fileName: p.fileName,
      fileSize: p.fileSize,
      uploadedByName: p.uploadedByName || 'Dr. S. Karthik',
      createdAt: p.createdAt,
    }
  })

  return (
    <PortalLayout role="faculty" userName={user?.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyQuestionPapersView initialPapers={mappedPapers} subjects={subjects} />
      </div>
    </PortalLayout>
  )
}
