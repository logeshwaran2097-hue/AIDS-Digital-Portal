import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyStudentsView, StudentRosterItem } from './components/FacultyStudentsView'

export const dynamic = 'force-dynamic'

/**
 * Parses Anna University AI&DS course codes or text to deduce Semester & Year of study.
 * E.g., AD3301 -> Sem 3 (Year 2), CS3452 -> Sem 4 (Year 2), AD3501 -> Sem 5 (Year 3), AD3701 -> Sem 7 (Year 4)
 */
function parseSubjectCode(rawCode: string): { year: number; semester: number } | null {
  if (!rawCode) return null
  const code = rawCode.trim().toUpperCase()

  // Standard Anna University 4-digit code: prefix + regulation + semester (1-8) + sequence
  const match = code.match(/^[A-Z]{2,4}[0-9]([1-8])[0-9]{2}/)
  if (match) {
    const semester = parseInt(match[1], 10)
    const year = Math.ceil(semester / 2)
    return { year, semester }
  }

  // Explicit patterns: e.g. "Sem 3", "Semester 5", "Year 2"
  const semMatch = code.match(/SEM(?:ESTER)?\s*([1-8])/i)
  if (semMatch) {
    const semester = parseInt(semMatch[1], 10)
    return { year: Math.ceil(semester / 2), semester }
  }

  const yrMatch = code.match(/YEAR\s*([1-4])/i)
  if (yrMatch) {
    const year = parseInt(yrMatch[1], 10)
    return { year, semester: year * 2 - 1 }
  }

  return null
}

export default async function FacultyStudentsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const faculty =
    (await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (session.facultyId ? await prisma.faculty.findUnique({ where: { facultyId: session.facultyId } }).catch(() => null) : null)

  const isAdvisor =
    faculty?.facultyType === 'advisor' ||
    faculty?.facultyType === 'both'

  if (!isAdvisor) {
    redirect('/faculty-dashboard')
  }

  // Collect exclusively the faculty's assigned classes / cohorts:
  // Key format: `${year}_${section || 'ALL'}`
  const assignedClassesMap = new Map<
    string,
    { year: number; section?: string; semester?: number; label: string }
  >()

  // 1. Direct Advisor Allocation on Faculty record
  if (faculty?.advisorYear) {
    const sec = faculty.advisorSec ? faculty.advisorSec.trim().toUpperCase() : undefined
    const sem = faculty.advisorSem || (faculty.advisorYear * 2 - 1)
    const key = `${faculty.advisorYear}_${sec || 'ALL'}`
    assignedClassesMap.set(key, {
      year: faculty.advisorYear,
      section: sec,
      semester: sem,
      label: `Year ${faculty.advisorYear}${sec ? ` · Sec ${sec}` : ''} (Sem ${sem})`,
    })
  }

  // 2. ClassAdvisor Table entries
  if (faculty?.facultyId) {
    const classAdvisorRecords = await prisma.classAdvisor.findMany({
      where: { facultyId: faculty.facultyId },
    }).catch(() => [])

    for (const car of classAdvisorRecords) {
      const sec = car.section ? car.section.trim().toUpperCase() : undefined
      const key = `${car.year}_${sec || 'ALL'}`
      assignedClassesMap.set(key, {
        year: car.year,
        section: sec,
        semester: car.semester,
        label: `Year ${car.year}${sec ? ` · Sec ${sec}` : ''} (Sem ${car.semester})`,
      })
    }
  }

  // 3. Assigned Theory / Lab Subjects
  let subjectsArr: string[] = []
  try {
    subjectsArr = JSON.parse(faculty?.subjects || '[]')
  } catch {
    subjectsArr = (faculty?.subjects || '').split(',').map((s) => s.trim()).filter(Boolean)
  }

  for (const sub of subjectsArr) {
    const semYear = parseSubjectCode(sub)
    if (semYear) {
      const sec = faculty?.advisorSec ? faculty.advisorSec.trim().toUpperCase() : undefined
      const key = `${semYear.year}_${sec || 'ALL'}`
      if (!assignedClassesMap.has(key)) {
        assignedClassesMap.set(key, {
          year: semYear.year,
          section: sec,
          semester: semYear.semester,
          label: `Year ${semYear.year}${sec ? ` · Sec ${sec}` : ''} (${sub})`,
        })
      }
    }
  }

  // 4. Past Attendance Sessions Conducted by this Faculty
  if (faculty?.facultyId) {
    const conductedSessions = await prisma.attendanceSession.findMany({
      where: { takenByFacultyId: faculty.facultyId },
      select: { year: true, section: true, semester: true },
      distinct: ['year', 'section'],
    }).catch(() => [])

    for (const cs of conductedSessions) {
      const sec = cs.section ? cs.section.trim().toUpperCase() : undefined
      const key = `${cs.year}_${sec || 'ALL'}`
      if (!assignedClassesMap.has(key)) {
        assignedClassesMap.set(key, {
          year: cs.year,
          section: sec,
          semester: cs.semester,
          label: `Year ${cs.year}${sec ? ` · Sec ${sec}` : ''} (Sem ${cs.semester})`,
        })
      }
    }
  }

  const assignedClassesList = Array.from(assignedClassesMap.values())

  // Query ONLY students belonging to the assigned classes/years
  let studentsFromDb: any[] = []
  if (assignedClassesList.length > 0) {
    const orConditions = assignedClassesList.map((ac) => {
      const cond: { year: number; section?: string } = { year: ac.year }
      if (ac.section) {
        cond.section = ac.section
      }
      return cond
    })

    studentsFromDb = await prisma.student.findMany({
      where: { OR: orConditions },
      orderBy: [
        { year: 'asc' },
        { section: 'asc' },
        { registerNumber: 'asc' },
      ],
    }).catch(() => [])
  }

  // Derive unique assigned years & sections strictly from the faculty's assigned scope
  const assignedYears = Array.from(new Set(assignedClassesList.map((ac) => ac.year))).sort((a, b) => a - b)

  const assignedSectionsSet = new Set<string>()
  for (const ac of assignedClassesList) {
    if (ac.section) {
      assignedSectionsSet.add(ac.section)
    } else {
      studentsFromDb
        .filter((s) => s.year === ac.year)
        .forEach((s) => {
          if (s.section) assignedSectionsSet.add(s.section)
        })
    }
  }
  const assignedSections = Array.from(assignedSectionsSet).sort()

  const userIds = studentsFromDb.map((s) => s.userId)
  const usersFromDb = await prisma.user.findMany({
    where: { id: { in: userIds } },
  }).catch(() => [])

  const userMap = new Map(usersFromDb.map((u) => [u.id, u]))

  const mappedStudents: StudentRosterItem[] = studentsFromDb.map((s) => {
    const matchedUser = userMap.get(s.userId)
    const rawAttendance = s.attendance ? parseFloat(s.attendance.replace(/[^0-9.]/g, '')) : 0
    return {
      id: s.id,
      name: matchedUser?.name || s.registerNumber,
      registerNumber: s.registerNumber,
      email: matchedUser?.email || `${s.registerNumber.toLowerCase()}@vsb.edu.in`,
      phone: matchedUser?.phone || '',
      year: s.year,
      semester: s.semester,
      section: s.section,
      cgpa: s.cgpa || 0,
      attendance: isNaN(rawAttendance) ? 0 : rawAttendance,
      arrears: 0,
      parentPhone: s.parentPhone || '',
      bloodGroup: s.bloodGroup || null,
      residencyStatus: s.residencyStatus || 'Day Scholar',
      hostelBlock: s.hostelBlock || null,
      roomNo: s.roomNo || null,
      busNo: s.busNo || null,
      boardingPoint: s.boardingPoint || null,
      batch: s.batch || (s.year ? `${2026 - s.year + 1}-${2026 - s.year + 5}` : null),
      advisorName: s.advisorName || null,
      isParentWhatsapp: s.isParentWhatsapp || Boolean(s.parentPhone),
      dob: s.dateOfBirth ? s.dateOfBirth.toISOString().split('T')[0] : null,
    }
  })

  // Format descriptive cohort label
  let cohortLabel = faculty?.advisorBatch || ''
  if (!cohortLabel && assignedClassesList.length > 0) {
    cohortLabel = assignedClassesList.map((ac) => ac.label).join(', ')
  } else if (!cohortLabel) {
    cohortLabel = 'AI & DS Department'
  }

  const advisorDetails = {
    facultyName: user?.name || session.name || 'Faculty Member',
    facultyEmail: user?.email || session.email || '',
    facultyPhone: user?.phone || '',
    facultyId: faculty?.facultyId || session.facultyId || '',
    advisorBatch: cohortLabel,
    mustChangePassword: Boolean(user?.mustChangePassword),
    qualification: faculty?.qualification || '',
    experience: faculty?.experience || 0,
    specialization: faculty?.specialization || '',
    dateOfBirth: faculty?.dateOfBirth ? faculty.dateOfBirth.toISOString() : undefined,
  }

  return (
    <PortalLayout
      role="faculty"
      userName={user?.name || session.name || 'Faculty'}
      userEmail={user?.email || session.email}
      roleBadgeLabel={isAdvisor ? 'Class Advisor' : 'Faculty Member'}
      isAdvisor={isAdvisor}
    >
      <div className="py-2 animate-fade-in">
        <FacultyStudentsView
          initialStudents={mappedStudents}
          advisorDetails={advisorDetails}
          assignedYears={assignedYears}
          assignedSections={assignedSections}
          assignedClasses={assignedClassesList}
          isAdvisor={isAdvisor}
        />
      </div>
    </PortalLayout>
  )
}
