import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentSettingsView } from './components/StudentSettingsView'

export const dynamic = 'force-dynamic'

export default async function StudentSettingsPage() {
  const session = await requireRoleSession(['student'])

  const user = (await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)) || {
    id: session.userId,
    name: session.name || 'Student',
    email: session.email || '',
    phone: '',
    role: 'student',
    status: 'active',
  }

  const userReg = session.registerNumber || (session.email ? session.email.split('@')[0].toUpperCase() : '')

  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (userReg ? await prisma.student.findUnique({ where: { registerNumber: userReg } }).catch(() => null) : null) || {
      id: 'student-default',
      userId: session.userId,
      registerNumber: userReg,
      dateOfBirth: null,
      department: 'Artificial Intelligence & Data Science',
      year: 1,
      semester: 1,
      section: 'A',
    }

  return (
    <PortalLayout role="student" userName={user.name || session.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentSettingsView user={user as any} student={student as any} />
      </div>
    </PortalLayout>
  )
}
