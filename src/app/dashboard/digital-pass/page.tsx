import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import DigitalPassView from '@/components/pass/DigitalPassView'

export const dynamic = 'force-dynamic'

export default async function DigitalPassPage() {
  const session = await requireRoleSession(['student', 'faculty', 'hod', 'admin'])

  const userReg = session.registerNumber || (session.email ? session.email.split('@')[0].toUpperCase() : '')

  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (userReg ? await prisma.student.findUnique({ where: { registerNumber: userReg } }).catch(() => null) : null)

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  const studentName = user?.name || session.name || 'Logeshwaran G'
  const registerNumber = student?.registerNumber || userReg || '922525243103'
  const department = student?.department || 'Artificial Intelligence & Data Science'
  const year = student?.year || 2
  const section = student?.section || 'B'

  return (
    <PortalLayout role={session.role as any} userName={studentName}>
      <DigitalPassView
        studentName={studentName}
        registerNumber={registerNumber}
        department={department}
        year={year}
        section={section}
        role={session.role}
      />
    </PortalLayout>
  )
}
