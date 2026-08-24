import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyDashboardView } from './components/FacultyDashboardView'

export const dynamic = 'force-dynamic'

export default async function FacultyDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'faculty') redirect('/login')

  const faculty = await prisma.faculty.findUnique({ where: { userId: session.userId } })
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) redirect('/login')

  const totalStudents = await prisma.student.count()
  const totalSubjects = await prisma.subject.count()
  const resourcesCount = await prisma.resource.count({
    where: { uploadedById: faculty?.id },
  })
  const questionPapersCount = await prisma.questionPaper.count()

  const facultyData = {
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    faculty: faculty
      ? {
          facultyId: faculty.facultyId,
          designation: faculty.designation,
          qualification: faculty.qualification,
          experience: faculty.experience,
          specialization: faculty.specialization,
          subjects: faculty.subjects,
        }
      : null,
    totalStudents: totalStudents || 68,
    totalSubjects: totalSubjects || 7,
    resourcesCount: resourcesCount || 8,
    questionPapersCount: questionPapersCount || 12,
  }

  return (
    <PortalLayout role="faculty" userName={user.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyDashboardView data={facultyData} />
      </div>
    </PortalLayout>
  )
}