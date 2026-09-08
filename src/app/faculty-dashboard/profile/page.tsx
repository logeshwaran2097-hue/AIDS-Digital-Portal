import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyProfileView, FacultyProfileData } from './components/FacultyProfileView'

export const dynamic = 'force-dynamic'

export default async function FacultyProfilePage() {
  const session = await requireRoleSession(['faculty'])

  const [user, faculty] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.faculty.findUnique({ where: { userId: session.userId } }),
  ])

  const key = `faculty_settings_${session.userId}`
  const userSettings = await prisma.systemSettings.findUnique({ where: { key } }).catch(() => null)
  let preferences: any = {}
  if (userSettings?.value) {
    try {
      preferences = JSON.parse(userSettings.value)
    } catch {}
  }

  const isAdvisor =
    faculty?.facultyType === 'advisor' ||
    faculty?.facultyType === 'both'

  let studentCount = 0
  if (isAdvisor) {
    if (faculty?.advisorYear && faculty?.advisorSec) {
      studentCount = await prisma.student.count({
        where: {
          year: faculty.advisorYear,
          section: faculty.advisorSec,
        },
      })
    } else if (faculty?.advisorBatch) {
      studentCount = await prisma.student.count()
    }
  }

  let parsedSubjects: string[] = []
  if (faculty?.subjects) {
    try {
      parsedSubjects = JSON.parse(faculty.subjects)
    } catch {
      parsedSubjects = []
    }
  }

  const dbSubjects = await prisma.subject.findMany({
    where: parsedSubjects.length > 0 ? { code: { in: parsedSubjects } } : undefined,
  }).catch(() => [])

  const allocatedCourseList = dbSubjects.length > 0
    ? dbSubjects.map(s => `${s.code} - ${s.name} (${s.credits} Credits)`)
    : (faculty?.subjectName ? [faculty.subjectName] : [])

  const defaultRoleTitle = isAdvisor
    ? 'Assistant Professor & Class Advisor'
    : (faculty?.facultyType === 'lab_faculty' ? 'Assistant Professor & Lab In-charge' : 'Assistant Professor')

  const profileData: FacultyProfileData = {
    name: user?.name || session.name || 'Faculty Member',
    facultyId: faculty?.facultyId || session.facultyId || 'FACULTY',
    designation: faculty?.designation || defaultRoleTitle,
    qualification: faculty?.qualification?.trim() || preferences?.qualification || 'M.E. / M.Tech (Computer Science & Engineering)',
    experience: faculty?.experience ?? preferences?.experience ?? 5,
    specialization: faculty?.specialization?.trim() || preferences?.specialization || 'Artificial Intelligence & Machine Learning',
    email: user?.email || session.email || 'faculty@vsb.edu.in',
    phone: user?.phone || '',
    cabin: preferences?.cabin || 'Staff Room 2 · AI & DS Block (Desk #4)',
    officeHours: preferences?.officeHours || (faculty?.classTime ? `Lecture/Lab: ${faculty.classTime}` : '09:00 AM - 04:30 PM (Working Days)'),
    publicationsCount: preferences?.publicationsCount || 0,
    citationsCount: preferences?.citationsCount || 0,
    allocatedCourses: allocatedCourseList,
    isAdvisor,
    advisorBatch: isAdvisor
      ? (faculty?.advisorBatch || (faculty?.advisorYear ? `Year ${faculty.advisorYear} - Section ${faculty.advisorSec || 'A'} (Sem ${faculty.advisorSem || 3})` : 'Class Advisor'))
      : undefined,
    advisorYear: isAdvisor ? (faculty?.advisorYear || undefined) : undefined,
    advisorSem: isAdvisor ? (faculty?.advisorSem || undefined) : undefined,
    advisorSec: isAdvisor ? (faculty?.advisorSec || undefined) : undefined,
    facultyType: faculty?.facultyType || (isAdvisor ? 'advisor' : 'subject_handler'),
    studentCount,
  }

  const roleBadgeLabel = isAdvisor
    ? 'Class Advisor'
    : faculty?.facultyType === 'lab_faculty'
    ? 'Lab Handler'
    : 'Faculty Member'

  return (
    <PortalLayout
      role="faculty"
      userName={user?.name || 'Faculty'}
      userEmail={user?.email || session.email}
      roleBadgeLabel={roleBadgeLabel}
      isAdvisor={isAdvisor}
    >
      <div className="py-2 animate-fade-in">
        <FacultyProfileView data={profileData} />
      </div>
    </PortalLayout>
  )
}
