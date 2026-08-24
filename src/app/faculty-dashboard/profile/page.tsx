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

  const profileData: FacultyProfileData = {
    name: user?.name || 'Dr. S. Karthik',
    facultyId: faculty?.facultyId || 'AI001',
    designation: faculty?.designation || 'Professor',
    qualification: faculty?.qualification || 'Ph.D. in Computer Science & Engineering',
    experience: faculty?.experience || 18,
    specialization: faculty?.specialization || 'Machine Learning, Deep Learning, Edge AI',
    email: user?.email || 'karthik.ai@vsb.edu.in',
    phone: user?.phone || '+91 98421 11223',
    cabin: 'Room 201 (AI & DS Faculty Block)',
    officeHours: 'Mon - Fri: 03:30 PM - 04:30 PM',
    publicationsCount: 24,
    citationsCount: 680,
    allocatedCourses: [
      'AD2305 - Machine Learning Foundations (4 Credits · Sem 3)',
      'AD2301 - Data Structures & Algorithms (4 Credits · Sem 3)',
      'AD2307 - Data Science Tools & Laboratory (2 Credits · Sem 3)',
    ],
  }

  return (
    <PortalLayout role="faculty" userName={user?.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyProfileView data={profileData} />
      </div>
    </PortalLayout>
  )
}
