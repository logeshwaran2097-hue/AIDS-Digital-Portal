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
  const studentName = user?.name || session.name || ''
  const registerNumber = student?.registerNumber || userReg || ''

  // Fetch real subjects added by Admin from database
  const rawDbSubjects = await prisma.subject.findMany({
    orderBy: { code: 'asc' },
  }).catch(() => [])

  const adminSubjects = rawDbSubjects.map((s) => {
    let sem = 1
    let category = 'Professional Core (PC)'
    let facultyInCharge = ''
    let courseType: 'Theory' | 'Laboratory' | 'Theory cum Laboratory' = 'Theory'
    let exactCredits = Number(s.credits) || 3

    if (s.description && s.description.startsWith('{')) {
      try {
        const meta = JSON.parse(s.description)
        if (meta.semester) sem = Number(meta.semester)
        if (meta.category) category = meta.category
        if (meta.facultyInCharge) facultyInCharge = meta.facultyInCharge
        if (meta.courseType) courseType = meta.courseType
        if (meta.exactCredits !== undefined) exactCredits = Number(meta.exactCredits)
      } catch {}
    } else {
      const match = s.code.match(/[A-Za-z]+[0-9]([1-8])/)
      sem = match ? parseInt(match[1], 10) : 1
    }

    return {
      id: s.id,
      code: s.code,
      name: s.name,
      credits: exactCredits,
      category,
      facultyInCharge,
      courseType,
      semester: sem,
      year: Math.ceil(sem / 2),
      description: s.description,
    }
  })

  return (
    <PortalLayout role={session.role as any} userName={studentName}>
      <GPACalculatorMarksheetView
        studentName={studentName}
        registerNumber={registerNumber}
        studentYear={student?.year || 2}
        currentSemester={student?.semester || 3}
        initialCgpa={student?.cgpa ?? null}
        adminSubjects={adminSubjects}
      />
    </PortalLayout>
  )
}
