import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentAttendanceView } from './components/StudentAttendanceView'

export const dynamic = 'force-dynamic'

export default async function StudentAttendancePage() {
  const session = await getSession()
  if (!session || session.role !== 'student') redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const student = await prisma.student.findUnique({ where: { userId: session.userId } })

  if (!user || !student) redirect('/login')

  return (
    <PortalLayout role="student" userName={user.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentAttendanceView student={student} user={user} />
      </div>
    </PortalLayout>
  )
}
