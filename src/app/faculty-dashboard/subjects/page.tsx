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

  let effectiveSubjects = [...dbSubjects]
  if (effectiveSubjects.length === 0 && (faculty?.subjectName || parsedSubjectCodes.length > 0)) {
    const subCode = parsedSubjectCodes[0] || (faculty?.facultyType === 'lab_faculty' ? 'AD2311' : 'AD3301')
    const subName = faculty?.subjectName || (faculty?.facultyType === 'lab_faculty' ? 'Object Oriented Programming Laboratory' : 'Department Course')
    effectiveSubjects = [
      {
        id: 'alloc-' + (faculty?.facultyId || 'sub'),
        code: subCode,
        name: subName,
        credits: faculty?.facultyType === 'lab_faculty' ? 2 : 4,
        description: 'Laboratory Practical & Applied Curriculum',
        yearId: null,
        semesterId: null,
        academicYearId: 'cmtmnsw30000apv1wxafyfv59',
      } as any
    ]
  }

  const subjectIds = effectiveSubjects.map(s => s.id)
  const subjectCodes = effectiveSubjects.map(s => s.code)
  const [dbUnits, dbSyllabi, dbNotes, dbResources, dbQuestions, dbAttendanceSessions, totalStudentsCount] = await Promise.all([
    prisma.unit.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { number: 'asc' } }).catch(() => []),
    prisma.syllabus.findMany({ where: { subjectId: { in: subjectIds } } }).catch(() => []),
    prisma.note.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.resource.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.importantQuestion.findMany({ where: { subjectId: { in: subjectIds } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.attendanceSession.findMany({
      where: { subjectCode: { in: subjectCodes } },
      include: { records: true },
    }).catch(() => []),
    prisma.student.count({
      where: faculty?.advisorYear && faculty?.advisorSec ? {
        year: faculty.advisorYear,
        section: faculty.advisorSec,
      } : undefined,
    }).catch(() => 0),
  ])

  const initialCourses = effectiveSubjects.map(sub => {
    const unitsForSub = dbUnits.filter(u => u.subjectId === sub.id)
    const syllabusForSub = dbSyllabi.find(s => s.subjectId === sub.id)
    const notesForSub = dbNotes.filter(n => n.subjectId === sub.id)
    const questionsForSub = dbQuestions.filter(q => q.subjectId === sub.id)
    const subSessions = dbAttendanceSessions.filter(s => s.subjectCode === sub.code)
    const hoursTaught = subSessions.length
    let attendanceRate = '—'
    if (subSessions.length > 0) {
      let totalRecs = 0
      let presentRecs = 0
      for (const sess of subSessions) {
        for (const rec of sess.records) {
          totalRecs++
          if (rec.status === 'P' || rec.status === 'OD') presentRecs++
        }
      }
      if (totalRecs > 0) {
        attendanceRate = `${((presentRecs / totalRecs) * 100).toFixed(1)}%`
      }
    }

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
      enrolledStudents: totalStudentsCount,
      hoursTaught,
      attendanceRate,
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
