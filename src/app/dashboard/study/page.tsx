import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import StudyDetailsView from './components/StudyDetailsView'

export const dynamic = 'force-dynamic'

export default async function StudyPage() {
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
    orderBy: { code: 'asc' },
  }).catch(() => [])

  if (subjects.length === 0) {
    subjects = await prisma.subject.findMany({ take: 10, orderBy: { code: 'asc' } }).catch(() => [])
  }

  const subjectIds = subjects.map((s) => s.id)

  const [allUnits, allNotes, allLabManuals, allImportantQuestions, syllabi] = await Promise.all([
    prisma.unit.findMany({ where: subjectIds.length > 0 ? { subjectId: { in: subjectIds } } : undefined, orderBy: { number: 'asc' } }).catch(() => []),
    prisma.note.findMany({ where: { status: 'published', ...(subjectIds.length > 0 ? { subjectId: { in: subjectIds } } : {}) }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.labManual.findMany({ where: { status: 'published', ...(subjectIds.length > 0 ? { subjectId: { in: subjectIds } } : {}) }, orderBy: { experimentNumber: 'asc' } }).catch(() => []),
    prisma.importantQuestion.findMany({ where: { status: 'published', ...(subjectIds.length > 0 ? { subjectId: { in: subjectIds } } : {}) } }).catch(() => []),
    prisma.syllabus.findMany({ where: subjectIds.length > 0 ? { subjectId: { in: subjectIds } } : undefined }).catch(() => []),
  ])

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="student" userName={user?.name || session.name || 'Student'} >
      <StudyDetailsView
        student={student as any}
        subjects={subjects}
        units={allUnits}
        notes={allNotes}
        labManuals={allLabManuals}
        importantQuestions={allImportantQuestions}
        syllabi={syllabi}
      />
    </PortalLayout>
  )
}