import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET: Return subjects assigned to the logged-in faculty + class advisor info
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Fetch faculty record to get assigned subjects
    let assignedSubjectCodes: string[] = []
    let isAdvisor = false
    let advisorClass = null

    if (session.role === 'faculty' || session.role === 'hod') {
      const faculty = await prisma.faculty.findUnique({ where: { userId: session.userId } })
      if (faculty) {
        try {
          assignedSubjectCodes = JSON.parse(faculty.subjects || '[]')
        } catch {
          assignedSubjectCodes = []
        }

        // Check if this faculty is a class advisor
        const advisorRecord = await prisma.classAdvisor.findFirst({
          where: { facultyId: faculty.id },
        })
        if (advisorRecord) {
          isAdvisor = true
          advisorClass = {
            year: advisorRecord.year,
            section: advisorRecord.section,
            semester: advisorRecord.semester,
            academicYear: advisorRecord.academicYear,
          }
        }
      }
    }

    // Fetch subjects from DB
    const allSubjects = await prisma.subject.findMany({
      orderBy: { code: 'asc' },
    })

    // Filter to faculty's subjects if we have codes, else return all
    const subjects =
      assignedSubjectCodes.length > 0
        ? allSubjects.filter((s) => assignedSubjectCodes.includes(s.code))
        : allSubjects

    // Also fetch class info options (years, sections, semesters)
    const distinctStudents = await prisma.student.findMany({
      select: { year: true, section: true, semester: true },
      distinct: ['year', 'section', 'semester'],
      orderBy: [{ year: 'asc' }, { section: 'asc' }],
    })

    const classOptions = distinctStudents.map((s) => ({
      year: s.year,
      section: s.section,
      semester: s.semester,
      label: `Year ${s.year} - Section ${s.section} (Sem ${s.semester})`,
    }))

    return NextResponse.json({
      success: true,
      subjects: subjects.map((s) => ({
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
    return NextResponse.json({ success: false, message: 'Failed to fetch subjects' }, { status: 500 })
  }
}
