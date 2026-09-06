import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultySubjectsView } from './components/FacultySubjectsView'

export const dynamic = 'force-dynamic'

export default async function FacultySubjectsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const faculty = (await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (await prisma.faculty.findUnique({ where: { facultyId: session.facultyId || '' } }).catch(() => null))

  let parsedSubjectCodes: string[] = []
  if (faculty?.subjects) {
    try {
      parsedSubjectCodes = JSON.parse(faculty.subjects)
    } catch {
      parsedSubjectCodes = []
    }
  }

  const dbSubjects = await prisma.subject.findMany({
    where: parsedSubjectCodes.length > 0 ? { code: { in: parsedSubjectCodes } } : undefined,
    orderBy: { code: 'asc' },
  }).catch(() => [])

  // Query units, syllabus, resources, and notes for these subjects
  const subjectIds = dbSubjects.map(s => s.id)
  const [dbUnits, dbSyllabi, dbNotes, dbResources, dbQuestions] = await Promise.all([
    prisma.unit.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { number: 'asc' } }).catch(() => []),
    prisma.syllabus.findMany({ where: { subjectId: { in: subjectIds } } }).catch(() => []),
    prisma.note.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.resource.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.importantQuestion.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
  ])

  const initialCourses = dbSubjects.map(sub => {
    const unitsForSub = dbUnits.filter(u => u.subjectId === sub.id)
    const syllabusForSub = dbSyllabi.find(s => s.subjectId === sub.id)
    const notesForSub = dbNotes.filter(n => n.subjectId === sub.id)
    const questionsForSub = dbQuestions.filter(q => q.subjectId === sub.id)

    let parsedUnits: any[] = []

    if (unitsForSub.length > 0) {
      const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
      parsedUnits = unitsForSub.map(u => {
        let topicsArr: string[] = []
        try { topicsArr = JSON.parse(u.topics || '[]') } catch { topicsArr = [] }
        const rIndex = u.number - 1
        const rLabel = rIndex >= 0 && rIndex < romanNumerals.length ? romanNumerals[rIndex] : String(u.number)
        return {
          unit: `Unit ${rLabel}`,
          title: u.title,
          hours: 9,
          topics: topicsArr,
          status: 'In-Progress' as const,
        }
      })
    } else if (syllabusForSub?.content) {
      try {
        const parsedContent = JSON.parse(syllabusForSub.content)
        if (Array.isArray(parsedContent.units)) {
          parsedUnits = parsedContent.units
        }
      } catch {}
    }

    return {
      code: sub.code,
      name: sub.name,
      regulation: 'Regulation 2021 (Autonomous)',
      credits: sub.credits,
      year: faculty?.advisorYear || 2,
      semester: faculty?.advisorSem || 3,
      section: faculty?.advisorSec || 'A',
      enrolledStudents: 68,
      hoursTaught: 36,
      attendanceRate: '96.5%',
      units: parsedUnits,
      notes: notesForSub.map(n => ({
        unit: 'Study Notes',
        title: n.title,
        fileName: `${sub.code}_Notes.pdf`,
        fileSize: '2.5 MB',
        uploadedDate: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB') : 'Recently',
      })),
      labs: [],
      questions: questionsForSub.map(q => ({
        type: (q.marks && q.marks > 5 ? '16_mark' : '2_mark') as '2_mark' | '16_mark',
        q: q.question,
        bloom: 'K2 (Understand)',
      })),
    }
  })


  return (
    <PortalLayout role="faculty" userName={user?.name || session.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultySubjectsView initialCourses={initialCourses} />
      </div>
    </PortalLayout>
  )
}
