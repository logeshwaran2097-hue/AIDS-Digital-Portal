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
    designation: faculty?.designation || 'Faculty Member',
    qualification: faculty?.qualification || 'Post Graduate / Doctorate',
    experience: faculty?.experience || 0,
    specialization: faculty?.specialization || 'Artificial Intelligence & Data Science',
    email: user?.email || session.email || 'faculty@vsb.edu.in',
    phone: user?.phone || '',
    cabin: 'AI & DS Faculty Block',
    officeHours: faculty?.classTime ? `Lecture/Lab: ${faculty.classTime}` : '09:00 AM - 04:30 PM (Working Days)',
    publicationsCount: 0,
    citationsCount: 0,
    allocatedCourses: allocatedCourseList,
  }

  return (
    <PortalLayout role="faculty" userName={user?.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyProfileView data={profileData} />
      </div>
    </PortalLayout>
  )
}
