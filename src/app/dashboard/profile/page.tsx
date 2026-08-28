import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentProfileView } from './components/StudentProfileView'

export const dynamic = 'force-dynamic'

export default async function StudentProfilePage() {
  const session = await requireRoleSession(['student'])

  const user = (await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)) || {
    id: session.userId,
    name: session.name || 'Student',
    email: session.email || 'student@vsb.edu.in',
    phone: '+91 98765 43210',
    role: 'student',
    status: 'active',
  }

  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (await prisma.student.findUnique({ where: { registerNumber: session.registerNumber || '922525243103' } }).catch(() => null)) || {
      id: 'student-default',
      userId: session.userId,
      registerNumber: session.registerNumber || '922525243103',
      dateOfBirth: new Date('2006-02-09'),
      department: 'Artificial Intelligence & Data Science',
      year: 2,
      semester: 4,
      section: 'A',
    }

  return (
    <PortalLayout role="student" userName={user.name || session.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentProfileView
          user={user as any}
          student={{
            ...student,
            advisorName: (student as any).advisorName || null,
            batch: (student as any).batch || null,
          } as any}
        />
      </div>
    </PortalLayout>
  )
}
