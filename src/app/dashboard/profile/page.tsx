import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentProfileView } from './components/StudentProfileView'

export const dynamic = 'force-dynamic'

export default async function StudentProfilePage() {
  const session = await requireRoleSession(['student'])

  let user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  let student = await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)

  if (!student && session.registerNumber) {
    student = await prisma.student.findUnique({ where: { registerNumber: session.registerNumber.trim().toUpperCase() } }).catch(() => null)
  }

  if (!student && user?.email) {
    const emailPrefix = user.email.split('@')[0].toUpperCase()
    student = await prisma.student.findFirst({
      where: {
        OR: [
          { registerNumber: emailPrefix },
          { registerNumber: emailPrefix.toLowerCase() },
        ],
      },
    }).catch(() => null)
  }

  if (student && user && student.userId !== user.id) {
    await prisma.student.update({
      where: { id: student.id },
      data: { userId: user.id },
    }).catch(() => {})
  }

  const finalUser = user || {
    id: session.userId,
    name: session.name || (student ? `Student (${student.registerNumber})` : 'Student'),
    email: session.email || (student ? `${student.registerNumber.toLowerCase()}@student.vsb.edu.in` : 'student@vsb.edu.in'),
    phone: '',
    role: 'student',
    status: 'active',
  }

  const finalStudent = student || {
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
    <PortalLayout role="student" userName={finalUser.name || session.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentProfileView
          user={finalUser as any}
          student={{
            ...finalStudent,
            advisorName: (finalStudent as any).advisorName || null,
            batch: (finalStudent as any).batch || null,
          } as any}
        />
      </div>
    </PortalLayout>
  )
}
