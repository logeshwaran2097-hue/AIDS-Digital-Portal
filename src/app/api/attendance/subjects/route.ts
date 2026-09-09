import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Master institutional periods and timings (VSB Engineering College Autonomous Scheme)
const INSTITUTIONAL_PERIODS = [
  { id: 'P1', name: 'Period 1', time: '09:15 AM - 10:00 AM' },
  { id: 'P2', name: 'Period 2', time: '10:00 AM - 10:45 AM' },
  { id: 'P3', name: 'Period 3', time: '11:00 AM - 11:45 AM' },
  { id: 'P4', name: 'Period 4', time: '11:45 AM - 12:30 PM' },
  { id: 'P5', name: 'Period 5', time: '01:20 PM - 02:05 PM' },
  { id: 'P6', name: 'Period 6', time: '02:05 PM - 02:50 PM' },
  { id: 'P7', name: 'Period 7', time: '03:05 PM - 03:50 PM' },
  { id: 'P8', name: 'Period 8', time: '03:50 PM - 04:30 PM' },
  { id: 'FN_LAB', name: 'Forenoon Lab Session', time: '09:15 AM - 12:30 PM' },
  { id: 'AN_LAB', name: 'Afternoon Lab Session', time: '01:20 PM - 04:30 PM' },
]



function parsePeriods(classPeriod: string | null | undefined, classTime: string | null | undefined): string[] {
  if (!classPeriod || !classPeriod.trim()) return []

  const rawPeriods = classPeriod.split(',').map((p) => p.trim()).filter(Boolean)
  const times = classTime ? classTime.split(',').map((t) => t.trim()).filter(Boolean) : []

  return rawPeriods.map((rawP, idx) => {
    if (rawP.includes('(') && rawP.includes(')')) {
      return rawP
    }

    const matched = INSTITUTIONAL_PERIODS.find(
      (ip) =>
        ip.name.toLowerCase() === rawP.toLowerCase() ||
        ip.id.toLowerCase() === rawP.toLowerCase() ||
        ip.name.replace(/\s+/g, '').toLowerCase() === rawP.replace(/\s+/g, '').toLowerCase()
    )

    if (matched) {
      return `${matched.name} (${matched.time})`
    }

    if (times[idx]) {
      return `${rawP} (${times[idx]})`
    }

    return rawP
  })
}

// GET: Return subjects and periods assigned to the logged-in faculty + class advisor info
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let assignedSubjectCodes: string[] = []
    let customSubjectName: string | null = null
    let faculty: any = null
    let isAdvisor = false
    let advisorClass: { year: number; section: string; semester: number; label: string } | null = null

    let advisorClasses: { year: number; section: string; semester: number; label: string }[] = []

    if (session.role === 'faculty' || session.role === 'hod' || session.role === 'admin') {
      faculty = await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)
      if (faculty) {
        if (faculty.subjects) {
          try {
            const parsed = JSON.parse(faculty.subjects)
            if (Array.isArray(parsed)) {
              assignedSubjectCodes = parsed.map((s: any) => String(s).trim()).filter(Boolean)
            } else if (typeof parsed === 'string' && parsed.trim()) {
              assignedSubjectCodes = parsed.split(',').map((s) => s.trim()).filter(Boolean)
            }
          } catch {
            assignedSubjectCodes = faculty.subjects.split(',').map((s: string) => s.trim()).filter(Boolean)
          }
        }

        if (faculty.subjectName && faculty.subjectName.trim()) {
          customSubjectName = faculty.subjectName.trim()
        }

        const advisorRecords = await prisma.classAdvisor.findMany({
          where: { facultyId: faculty.id },
          orderBy: [{ year: 'asc' }, { section: 'asc' }],
        }).catch(() => [])

        const isAdvisorRole = faculty.facultyType === 'advisor' || faculty.facultyType === 'both'

        if (advisorRecords.length > 0 && isAdvisorRole) {
          isAdvisor = true
          advisorClasses = advisorRecords.map((ar) => ({
            year: ar.year,
            section: ar.section,
            semester: ar.semester,
            label: `Year ${ar.year} - Section ${ar.section} (Sem ${ar.semester})`,
          }))
          advisorClass = advisorClasses[0]
        } else if (isAdvisorRole && (faculty.advisorBatch || faculty.advisorYear)) {
          isAdvisor = true
          advisorClass = {
            year: faculty.advisorYear || 2,
            section: faculty.advisorSec || 'A',
            semester: faculty.advisorSem || 3,
            label: faculty.advisorBatch || `Year ${faculty.advisorYear || 2} - Section ${faculty.advisorSec || 'A'}`,
          }
          advisorClasses = [advisorClass]
        }
      }
    }

    const allSubjects = await prisma.subject.findMany({
      orderBy: { code: 'asc' },
    }).catch(() => [])

    let resolvedSubjects: any[] = []
    const hasAssignedSubjects = assignedSubjectCodes.length > 0 || !!customSubjectName

    if (hasAssignedSubjects) {
      if (assignedSubjectCodes.length > 0) {
        resolvedSubjects = assignedSubjectCodes.map((code, idx) => {
          const matchedDb = allSubjects.find((s) => s.code.toUpperCase() === code.toUpperCase())
          const name = (idx === 0 && customSubjectName) ? customSubjectName : (matchedDb?.name || code)
          const credits = matchedDb?.credits || 4
          const id = matchedDb?.id || `assigned-${code}`
          return { id, code: code.toUpperCase(), name, credits }
        })
      } else if (customSubjectName) {
        const matchedDb = allSubjects.find((s) => s.name.toLowerCase() === customSubjectName!.toLowerCase())
        resolvedSubjects = [{
          id: matchedDb?.id || 'assigned-custom',
          code: matchedDb?.code || 'SUB001',
          name: customSubjectName,
          credits: matchedDb?.credits || 4,
        }]
      }
    } else {
      resolvedSubjects = allSubjects
    }

    // Resolve assigned periods / hours based on Admin allocation
    const assignedPeriods = parsePeriods(faculty?.classPeriod, faculty?.classTime)
    const allInstitutionalPeriodOptions = INSTITUTIONAL_PERIODS.map((p) => `${p.name} (${p.time})`)
    const hasAssignedPeriods = assignedPeriods.length > 0
    const hourOptions = hasAssignedPeriods ? assignedPeriods : allInstitutionalPeriodOptions

    const distinctStudents = await prisma.student.findMany({
      select: { year: true, section: true, semester: true },
      distinct: ['year', 'section', 'semester'],
      orderBy: [{ year: 'asc' }, { section: 'asc' }],
    }).catch(() => [])

    let classOptions = distinctStudents.map((s) => ({
      year: s.year,
      section: s.section,
      semester: s.semester,
      label: `Year ${s.year} - Section ${s.section} (Sem ${s.semester})`,
    }))

    if (classOptions.length === 0) {
      classOptions = [
        { year: 2, section: 'A', semester: 3, label: 'Year 2 - Section A (Sem 3)' },
        { year: 2, section: 'B', semester: 3, label: 'Year 2 - Section B (Sem 3)' },
        { year: 3, section: 'A', semester: 5, label: 'Year 3 - Section A (Sem 5)' },
        { year: 3, section: 'B', semester: 5, label: 'Year 3 - Section B (Sem 5)' },
        { year: 4, section: 'A', semester: 7, label: 'Year 4 - Section A (Sem 7)' },
        { year: 4, section: 'B', semester: 7, label: 'Year 4 - Section B (Sem 7)' },
        { year: 1, section: 'A', semester: 1, label: 'Year 1 - Section A (Sem 1)' },
        { year: 1, section: 'B', semester: 1, label: 'Year 1 - Section B (Sem 1)' },
      ]
    }

    return NextResponse.json({
      success: true,
      subjects: resolvedSubjects.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        credits: s.credits,
      })),
      hasAssignedSubjects,
      allCurriculumSubjects: allSubjects.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        credits: s.credits,
      })),
      hourOptions,
      hasAssignedPeriods,
      allPeriodOptions: allInstitutionalPeriodOptions,
      classOptions,
      isAdvisor,
      advisorClass,
      advisorClasses,
      assignedClassDay: faculty?.classDay || null,
      assignedClassTime: faculty?.classTime || null,
    })
  } catch (error: any) {
    console.error('Faculty subjects API error:', error)
    return NextResponse.json({
      success: false,
      subjects: [],
      hasAssignedSubjects: false,
      allCurriculumSubjects: [],
      hourOptions: [],
      hasAssignedPeriods: false,
      allPeriodOptions: [],
      classOptions: [],
      isAdvisor: false,
      advisorClass: null,
      message: error?.message || 'Failed to fetch attendance subjects and periods',
    }, { status: 500 })
  }
}
