import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const KNOWN_CURRICULUM_SUBJECTS: Record<string, string> = {
  AD3301: 'Design and Analysis of Algorithms',
  AD3391: 'Database Design and Management',
  CS3351: 'Digital Principles and Computer Organization',
  MA2301: 'Discrete Mathematics & Graph Theory',
  AD3491: 'Fundamentals of Data Science',
  AL3452: 'Operating Systems',
  AD3501: 'Deep Learning Architectures & Neural Nets',
  CW3551: 'Cloud Computing Architecture and DevOps',
  AD3701: 'Natural Language Processing',
  AD2501: 'Deep Learning Architectures & Neural Nets',
  AD2502: 'Big Data Technologies & Ecosystems',
  AD2503: 'Cloud Computing Architecture and DevOps',
  AD2504: 'Software Engineering and Agile Methodologies',
  AD2701: 'Reinforcement Learning and Robotics',
  AD2702: 'Edge AI and IoT Analytics',
  AD2703: 'Business Intelligence and Data Mining',
  AD2704: 'Professional Ethics & AI Governance',
  AD3311: 'Artificial Intelligence Laboratory',
  AD3381: 'Database Design & Management Lab',
  CS3361: 'Data Science & Analytics Laboratory',
  AD3511: 'Deep Learning & Neural Networks Lab',
  AD3512: 'Cloud Infrastructure & DevOps Lab',
  AD3711: 'Natural Language Processing Laboratory',
  AD3712: 'Edge AI & Robotics System Lab',
}

const PERIOD_BELL_TIMINGS: Record<string, string> = {
  'Period 1': 'Period 1 (09:15 AM - 10:00 AM)',
  'Period 2': 'Period 2 (10:00 AM - 10:45 AM)',
  'Period 3': 'Period 3 (11:00 AM - 11:45 AM)',
  'Period 4': 'Period 4 (11:45 AM - 12:30 PM)',
  'Period 5': 'Period 5 (01:20 PM - 02:05 PM)',
  'Period 6': 'Period 6 (02:05 PM - 02:50 PM)',
  'Period 7': 'Period 7 (03:05 PM - 03:50 PM)',
  'Period 8': 'Period 8 (03:50 PM - 04:30 PM)',
  'Hour 1': 'Hour 1 (09:00 - 09:50)',
  'Hour 2': 'Hour 2 (09:50 - 10:40)',
  'Hour 3': 'Hour 3 (10:55 - 11:45)',
  'Hour 4': 'Hour 4 (11:45 - 12:35)',
  'Hour 5': 'Hour 5 (01:25 - 02:15)',
  'Hour 6': 'Hour 6 (02:15 - 03:05)',
  'Hour 7': 'Hour 7 (03:15 - 04:05)',
  'Lab Session (FN)': 'Lab Session FN (09:15 AM - 12:30 PM)',
  'Lab Session (AN)': 'Lab Session AN (01:20 PM - 04:30 PM)',
  'Full Lab Session (3 Hours)': 'Full Lab Session (3 Hours)',
}

const ALL_STANDARD_PERIODS = [
  'Period 1 (09:15 AM - 10:00 AM)',
  'Period 2 (10:00 AM - 10:45 AM)',
  'Period 3 (11:00 AM - 11:45 AM)',
  'Period 4 (11:45 AM - 12:30 PM)',
  'Period 5 (01:20 PM - 02:05 PM)',
  'Period 6 (02:05 PM - 02:50 PM)',
  'Period 7 (03:05 PM - 03:50 PM)',
  'Period 8 (03:50 PM - 04:30 PM)',
  'Hour 1 (09:00 - 09:50)',
  'Hour 2 (09:50 - 10:40)',
  'Hour 3 (10:55 - 11:45)',
  'Hour 4 (11:45 - 12:35)',
  'Hour 5 (01:25 - 02:15)',
  'Hour 6 (02:15 - 03:05)',
  'Hour 7 (03:15 - 04:05)',
  'Lab Session FN (09:15 AM - 12:30 PM)',
  'Lab Session AN (01:20 PM - 04:30 PM)',
  'Full Lab Session (3 Hours)',
]

// GET: Return real subjects assigned to the logged-in faculty + real class advisor info + assigned timetable periods
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let assignedSubjectCodes: string[] = []
    let assignedSubjectName: string | null = null
    let rawPeriods: string[] = []
    let isAdvisor = false
    let advisorClass: { year: number; section: string; semester: number; label: string } | null = null
    let facultyRecord: any = null

    if (session.role === 'faculty' || session.role === 'hod' || session.role === 'admin') {
      facultyRecord = await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)
      if (facultyRecord) {
        assignedSubjectName = facultyRecord.subjectName || null

        // 1. Robust Subject Parsing (handles JSON array, JSON string, or comma-separated string)
        if (facultyRecord.subjects) {
          try {
            const parsed = JSON.parse(facultyRecord.subjects)
            if (Array.isArray(parsed)) {
              assignedSubjectCodes = parsed.map(String).map((s) => s.trim()).filter(Boolean)
            } else if (typeof parsed === 'string' && parsed.trim()) {
              assignedSubjectCodes = parsed.split(',').map((s) => s.trim()).filter(Boolean)
            }
          } catch {
            assignedSubjectCodes = String(facultyRecord.subjects).split(',').map((s) => s.trim()).filter(Boolean)
          }
        }

        // 2. Parse Period / Hour allocation set by Admin
        if (facultyRecord.classPeriod) {
          rawPeriods = String(facultyRecord.classPeriod).split(',').map((p) => p.trim()).filter(Boolean)
        }

        const advisorRecord = await prisma.classAdvisor.findFirst({
          where: { facultyId: facultyRecord.id },
        }).catch(() => null)

        const isAdvisorRole = facultyRecord.facultyType === 'advisor' || facultyRecord.facultyType === 'both'
        if (advisorRecord && isAdvisorRole) {
          isAdvisor = true
          advisorClass = {
            year: advisorRecord.year,
            section: advisorRecord.section,
            semester: advisorRecord.semester,
            label: `Year ${advisorRecord.year} - Section ${advisorRecord.section} (Sem ${advisorRecord.semester})`,
          }
        } else if (isAdvisorRole && (facultyRecord.advisorBatch || facultyRecord.advisorYear)) {
          isAdvisor = true
          advisorClass = {
            year: facultyRecord.advisorYear || 2,
            section: facultyRecord.advisorSec || 'A',
            semester: facultyRecord.advisorSem || 3,
            label: facultyRecord.advisorBatch || `Year ${facultyRecord.advisorYear || 2} - Section ${facultyRecord.advisorSec || 'A'}`,
          }
        }
      }
    }

    const allDbSubjects = await prisma.subject.findMany({
      orderBy: { code: 'asc' },
    }).catch(() => [])

    const dbSubjectMap = new Map(allDbSubjects.map((s) => [s.code.toUpperCase(), s]))

    // Resolve Admin Allocated Subjects
    const adminAssignedSubjects: Array<{ id: string; code: string; name: string; credits: number }> = []

    // If explicit codes were saved
    assignedSubjectCodes.forEach((code, idx) => {
      const upperCode = code.toUpperCase()
      const inDb = dbSubjectMap.get(upperCode)
      if (inDb) {
        adminAssignedSubjects.push({
          id: inDb.id,
          code: inDb.code,
          name: inDb.name,
          credits: inDb.credits,
        })
      } else {
        const knownName = KNOWN_CURRICULUM_SUBJECTS[upperCode] || assignedSubjectName || 'Curriculum Course'
        adminAssignedSubjects.push({
          id: `assigned-${idx + 1}`,
          code: upperCode,
          name: knownName,
          credits: 4,
        })
      }
    })

    // If only subjectName was saved without code, or code wasn't included yet
    if (adminAssignedSubjects.length === 0 && assignedSubjectName) {
      // Try to find code from known subjects
      let foundCode = 'AD3301'
      for (const [c, n] of Object.entries(KNOWN_CURRICULUM_SUBJECTS)) {
        if (n.toLowerCase() === assignedSubjectName.toLowerCase()) {
          foundCode = c
          break
        }
      }
      adminAssignedSubjects.push({
        id: 'assigned-0',
        code: foundCode,
        name: assignedSubjectName,
        credits: 4,
      })
    }

    // Standard fallback subjects catalog if Admin hasn't allocated any yet
    const fallbackSubjects = [
      { id: 'sub-1', code: 'AD3301', name: 'Design and Analysis of Algorithms', credits: 4 },
      { id: 'sub-2', code: 'AD3391', name: 'Database Design and Management', credits: 3 },
      { id: 'sub-3', code: 'CS3351', name: 'Digital Principles and Computer Organization', credits: 4 },
      { id: 'sub-4', code: 'AD3491', name: 'Fundamentals of Data Science', credits: 3 },
      { id: 'sub-5', code: 'AL3452', name: 'Operating Systems', credits: 3 },
      { id: 'sub-6', code: 'AD3501', name: 'Deep Learning Architectures & Neural Nets', credits: 3 },
      { id: 'sub-7', code: 'CW3551', name: 'Cloud Computing Architecture and DevOps', credits: 3 },
      { id: 'sub-8', code: 'AD3701', name: 'Natural Language Processing', credits: 3 },
    ]

    const allAvailableSubjects = allDbSubjects.length > 0
      ? allDbSubjects.map((s) => ({ id: s.id, code: s.code, name: s.name, credits: s.credits }))
      : fallbackSubjects

    const hasAdminAssignedSubjects = adminAssignedSubjects.length > 0
    const resolvedSubjects = hasAdminAssignedSubjects ? adminAssignedSubjects : allAvailableSubjects

    // Format Admin Assigned Periods
    const adminAssignedPeriods: string[] = []
    rawPeriods.forEach((rp) => {
      const timing = PERIOD_BELL_TIMINGS[rp]
      if (timing) {
        adminAssignedPeriods.push(timing)
      } else if (rp.includes('(') && rp.includes(')')) {
        adminAssignedPeriods.push(rp)
      } else {
        adminAssignedPeriods.push(`${rp} (Scheduled)`)
      }
    })

    const hasAdminAssignedPeriods = adminAssignedPeriods.length > 0

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
      subjects: resolvedSubjects,
      allSubjects: allAvailableSubjects,
      hasAdminAssignedSubjects,
      assignedPeriods: adminAssignedPeriods,
      allPeriods: ALL_STANDARD_PERIODS,
      hasAdminAssignedPeriods,
      classOptions,
      isAdvisor,
      advisorClass,
    })
  } catch (error: any) {
    console.error('Faculty subjects API error:', error)
    return NextResponse.json({
      success: false,
      subjects: [],
      allSubjects: [],
      hasAdminAssignedSubjects: false,
      assignedPeriods: [],
      allPeriods: ALL_STANDARD_PERIODS,
      hasAdminAssignedPeriods: false,
      classOptions: [],
      isAdvisor: false,
      advisorClass: null,
      message: error?.message || 'Failed to fetch attendance subjects',
    }, { status: 500 })
  }
}
