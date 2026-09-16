import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import GPACalculatorMarksheetView from '@/components/academics/GPACalculatorMarksheetView'

export const dynamic = 'force-dynamic'

export default async function GPACalculatorPage() {
  const session = await requireRoleSession(['student', 'faculty', 'hod', 'admin'])

  const userReg = session.registerNumber || (session.email ? session.email.split('@')[0].toUpperCase() : '')
  const student = (await prisma.student.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (userReg ? await prisma.student.findUnique({ where: { registerNumber: userReg } }).catch(() => null) : null)

  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const studentName = user?.name || session.name || 'Logeshwaran G'
  const registerNumber = student?.registerNumber || userReg || '922525243103'

  return (
    <PortalLayout role={session.role as any} userName={studentName}>
      <GPACalculatorMarksheetView
        studentName={studentName}
        registerNumber={registerNumber}
        studentYear={student?.year || 2}
        currentSemester={student?.semester || 3}
        initialCgpa={student?.cgpa ?? null}
      />
    </PortalLayout>
  )
}
