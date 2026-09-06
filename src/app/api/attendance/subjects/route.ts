import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET: Return real subjects assigned to the logged-in faculty + real class advisor info
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let assignedSubjectCodes: string[] = []
    let isAdvisor = false
    let advisorClass: { year: number; section: string; semester: number; label: string } | null = null

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
          isAdvisor = true
          advisorClass = {
            year: advisorRecord.year,
            section: advisorRecord.section,
            semester: advisorRecord.semester,
            label: `Year ${advisorRecord.year} - Section ${advisorRecord.section} (Sem ${advisorRecord.semester})`,
          }
        } else if (faculty.advisorBatch || faculty.advisorYear) {
          isAdvisor = true
          advisorClass = {
            year: faculty.advisorYear || 1,
            section: faculty.advisorSec || 'A',
            semester: faculty.advisorSem || 1,
            label: faculty.advisorBatch || `Year ${faculty.advisorYear || 1} - Section ${faculty.advisorSec || 'A'}`,
          }
        }
      }
    }

    const allSubjects = await prisma.subject.findMany({
      orderBy: { code: 'asc' },
    }).catch(() => [])

    const resolvedSubjects = assignedSubjectCodes.length > 0
      ? allSubjects.filter((s) => assignedSubjectCodes.includes(s.code))
      : allSubjects

    const distinctStudents = await prisma.student.findMany({
      select: { year: true, section: true, semester: true },
      distinct: ['year', 'section', 'semester'],
      orderBy: [{ year: 'asc' }, { section: 'asc' }],
    }).catch(() => [])

    const classOptions = distinctStudents.map((s) => ({
      year: s.year,
      section: s.section,
      semester: s.semester,
      label: `Year ${s.year} - Section ${s.section} (Sem ${s.semester})`,
    }))

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
  } catch (error: any) {
    console.error('Faculty subjects API error:', error)
    return NextResponse.json({
      success: false,
      subjects: [],
      classOptions: [],
      isAdvisor: false,
      advisorClass: null,
      message: error?.message || 'Failed to fetch attendance subjects',
    }, { status: 500 })
  }
}
