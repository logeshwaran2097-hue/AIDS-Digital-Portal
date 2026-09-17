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
  const initialHostelBlock = student?.hostelBlock || 'Boys Hostel I'
  const initialRoomNo = student?.roomNo || 'Room 204'
  const initialResidencyStatus = student?.residencyStatus || (student?.busNo || student?.busDetails ? 'Day Scholar' : 'Hostel')
  const initialBusNo = student?.busNo || (student?.busDetails ? student.busDetails.match(/bus\s*(\d+)/i)?.[1] : null) || '5'
  const initialBusDetails = student?.busDetails || 'Route 05 - Namakkal Central'
  const initialBoardingPoint = student?.boardingPoint || 'Vkl'

  return (
    <PortalLayout role={session.role as any} userName={studentName} residencyStatus={initialResidencyStatus}>
      <DigitalPassView
        studentName={studentName}
        registerNumber={registerNumber}
        department={department}
        year={year}
        section={section}
        role={session.role}
        initialHostelBlock={initialHostelBlock}
        initialRoomNo={initialRoomNo}
        initialResidencyStatus={initialResidencyStatus}
        initialBusNo={initialBusNo}
        initialBusDetails={initialBusDetails}
        initialBoardingPoint={initialBoardingPoint}
      />
    </PortalLayout>
  )
}
