import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentAttendanceView } from './components/StudentAttendanceView'

export const dynamic = 'force-dynamic'

export default async function StudentAttendancePage() {
  const session = await requireRoleSession(['student'])

  const user = (await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)) || {
    id: session.userId,
    name: session.name || 'Student',
    email: session.email || 'student@vsb.edu.in',
    role: 'student',
    status: 'active',
  }

  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (await prisma.student.findUnique({ where: { registerNumber: session.registerNumber || '23AD001' } }).catch(() => null)) || {
      id: 'student-default',
      userId: session.userId,
      registerNumber: session.registerNumber || '23AD001',
      dateOfBirth: new Date('2004-05-15'),
      department: 'Artificial Intelligence & Data Science',
      year: 3,
      semester: 5,
      section: 'A',
    }

  return (
    <PortalLayout role="student" userName={user.name || session.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentAttendanceView student={student as any} user={user as any} />
      </div>
    </PortalLayout>
  )
}
