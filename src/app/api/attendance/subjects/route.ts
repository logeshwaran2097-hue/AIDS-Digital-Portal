import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const DEFAULT_CLASSES = [
  { year: 3, section: 'A', semester: 5, label: 'Year 3 - Section A (Sem 5)' },
  { year: 3, section: 'B', semester: 5, label: 'Year 3 - Section B (Sem 5)' },
  { year: 2, section: 'A', semester: 3, label: 'Year 2 - Section A (Sem 3)' },
  { year: 2, section: 'B', semester: 3, label: 'Year 2 - Section B (Sem 3)' },
  { year: 4, section: 'A', semester: 7, label: 'Year 4 - Section A (Sem 7)' },
]

const DEFAULT_SUBJECTS = [
  { id: 'sub-1', code: 'AD2301', name: 'Machine Learning', credits: 4 },
  { id: 'sub-2', code: 'AD2302', name: 'Deep Learning Architectures', credits: 4 },
  { id: 'sub-3', code: 'AD2303', name: 'Natural Language Processing', credits: 3 },
  { id: 'sub-4', code: 'AD2304', name: 'Computer Vision & Edge AI', credits: 3 },
  { id: 'sub-5', code: 'AD2305', name: 'Big Data Analytics', credits: 3 },
]

// GET: Return subjects assigned to the logged-in faculty + class advisor info
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let assignedSubjectCodes: string[] = []
    let isAdvisor = true
    let advisorClass = DEFAULT_CLASSES[0]

    if (session.role === 'faculty' || session.role === 'hod' || session.role === 'admin') {
      const faculty = await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)
      if (faculty) {
        try {
          assignedSubjectCodes = JSON.parse(faculty.subjects || '[]')
        } catch {
          assignedSubjectCodes = []
        }

        const advisorRecord = await prisma.classAdvisor.findFirst({
          where: { facultyId: faculty.id },
        }).catch(() => null)

        if (advisorRecord) {
          advisorClass = {
            year: advisorRecord.year,
            section: advisorRecord.section,
            semester: advisorRecord.semester,
            label: `Year ${advisorRecord.year} - Section ${advisorRecord.section} (Sem ${advisorRecord.semester})`,
          }
        }
      }
    }

    const allSubjects = await prisma.subject.findMany({
      orderBy: { code: 'asc' },
    }).catch(() => [])

    const resolvedSubjects = allSubjects.length > 0
      ? (assignedSubjectCodes.length > 0 ? allSubjects.filter((s) => assignedSubjectCodes.includes(s.code)) : allSubjects)
      : DEFAULT_SUBJECTS

    const distinctStudents = await prisma.student.findMany({
      select: { year: true, section: true, semester: true },
      distinct: ['year', 'section', 'semester'],
      orderBy: [{ year: 'asc' }, { section: 'asc' }],
    }).catch(() => [])

    const classOptions = distinctStudents.length > 0
      ? distinctStudents.map((s) => ({
          year: s.year,
          section: s.section,
          semester: s.semester,
          label: `Year ${s.year} - Section ${s.section} (Sem ${s.semester})`,
        }))
      : DEFAULT_CLASSES

    return NextResponse.json({
      success: true,
      subjects: resolvedSubjects.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        credits: s.credits,
      })),
      classOptions,
      isAdvisor,
      advisorClass,
    })
  } catch (error) {
    console.error('Faculty subjects API error:', error)
    return NextResponse.json({
      success: true,
      subjects: DEFAULT_SUBJECTS,
      classOptions: DEFAULT_CLASSES,
      isAdvisor: true,
      advisorClass: DEFAULT_CLASSES[0],
    })
  }
}
