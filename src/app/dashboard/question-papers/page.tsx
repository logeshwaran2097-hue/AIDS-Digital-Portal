import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import QuestionPapersList from './components/QuestionPapersList'

export const dynamic = 'force-dynamic'

export default async function QuestionPapersPage() {
  const session = await getSession()
  if (!session || session.role !== 'student') redirect('/login')

  const student = await prisma.student.findUnique({ where: { userId: session.userId } })
  if (!student) redirect('/login')

  const semesters = await prisma.semester.findMany({ where: { number: student.semester }, select: { id: true } })
  const semesterIds = semesters.map((s) => s.id)
  const subjects = await prisma.subject.findMany({ where: { semesterId: { in: semesterIds } } })
  const subjectIds = subjects.map((s) => s.id)

  const questionPapers = await prisma.questionPaper.findMany({
    where: { status: 'published', subjectId: { in: subjectIds } },
    orderBy: { createdAt: 'desc' },
  })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="student" userName={user?.name || 'Student'} >
      <QuestionPapersList questionPapers={questionPapers} subjects={subjects} />
    </PortalLayout>
  )
}