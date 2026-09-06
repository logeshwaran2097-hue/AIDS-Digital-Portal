import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyProfileView, FacultyProfileData } from './components/FacultyProfileView'

export const dynamic = 'force-dynamic'

export default async function FacultyProfilePage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const faculty = await prisma.faculty.findUnique({ where: { userId: session.userId } })

  const isAdvisor =
    faculty?.facultyType === 'advisor' ||
    faculty?.facultyType === 'both' ||
    (!faculty?.facultyType && Boolean(faculty?.advisorBatch))

  let studentCount = 0
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

  const profileData: FacultyProfileData = {
    name: user?.name || session.name || 'Faculty Member',
    facultyId: faculty?.facultyId || session.facultyId || 'FACULTY',
    designation: faculty?.designation || (isAdvisor ? 'Assistant Professor & Class Advisor' : 'Faculty Member'),
    qualification: faculty?.qualification || 'Post Graduate / Doctorate',
    experience: faculty?.experience || 0,
    specialization: faculty?.specialization || 'Artificial Intelligence & Data Science',
    email: user?.email || session.email || 'faculty@vsb.edu.in',
    phone: user?.phone || '',
    cabin: 'Staff Room 2 · AI & DS Block (Desk #4)',
    officeHours: faculty?.classTime ? `Lecture/Lab: ${faculty.classTime}` : '09:00 AM - 04:30 PM (Working Days)',
    publicationsCount: 0,
    citationsCount: 0,
    allocatedCourses: allocatedCourseList,
    isAdvisor,
    advisorBatch: faculty?.advisorBatch || (faculty?.advisorYear ? `Year ${faculty.advisorYear} - Sem ${faculty.advisorSem || 3} - Sec ${faculty.advisorSec || 'A'}` : 'AI & DS Department'),
    advisorYear: faculty?.advisorYear || 2,
    advisorSem: faculty?.advisorSem || 3,
    advisorSec: faculty?.advisorSec || 'A',
    facultyType: faculty?.facultyType || (isAdvisor ? 'advisor' : 'faculty'),
    studentCount,
  }

  return (
    <PortalLayout role="faculty" userName={user?.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyProfileView data={profileData} />
      </div>
    </PortalLayout>
  )
}
