import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import QuestionPapersList from './components/QuestionPapersList'

export const dynamic = 'force-dynamic'

export default async function QuestionPapersPage() {
  const session = await requireRoleSession(['student'])

  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (await prisma.student.findUnique({ where: { registerNumber: session.registerNumber || '23AD001' } }).catch(() => null)) || {
      id: 'student-default',
      userId: session.userId,
      registerNumber: session.registerNumber || '23AD001',
      dateOfBirth: new Date('2004-05-15'),
      department: 'Artificial Intelligence & Data Science',
      year: 3,
      semester: 5,
      section: 'A',
    }

  const semesters = await prisma.semester.findMany({ where: { number: student.semester }, select: { id: true } }).catch(() => [])
  const semesterIds = semesters.map((s) => s.id)
  let subjects = await prisma.subject.findMany({
    where: semesterIds.length > 0 ? { semesterId: { in: semesterIds } } : undefined,
  }).catch(() => [])

  if (subjects.length === 0) {
    subjects = await prisma.subject.findMany({ take: 10 }).catch(() => [])
  }

  const subjectIds = subjects.map((s) => s.id)

  let questionPapers = await prisma.questionPaper.findMany({
    where: { status: 'published', subjectId: { in: subjectIds } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  if (questionPapers.length === 0) {
    questionPapers = await prisma.questionPaper.findMany({
      where: { status: 'published' },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }).catch(() => [])
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="student" userName={user?.name || session.name || 'Student'} >
      <QuestionPapersList questionPapers={questionPapers} subjects={subjects} />
    </PortalLayout>
  )
}