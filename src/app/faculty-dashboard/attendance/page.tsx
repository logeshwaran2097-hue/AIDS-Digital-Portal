import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { GovernmentAttendanceSystem } from './components/GovernmentAttendanceSystem'

export const dynamic = 'force-dynamic'

export default async function AttendancePage() {
  const session = await requireRoleSession(['faculty'])

  const faculty = (await prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null)) ||
    (session.facultyId ? await prisma.faculty.findUnique({ where: { facultyId: session.facultyId } }).catch(() => null) : null)

  const isAdvisor =
    faculty?.facultyType === 'advisor' ||
    faculty?.facultyType === 'both' ||
    Boolean(faculty?.advisorBatch || (faculty?.advisorYear && faculty?.advisorSec))

  return (
    <PortalLayout
      role="faculty"
      userName={session.name || 'Faculty Member'}
      userEmail={session.email}
      roleBadgeLabel={isAdvisor ? 'Class Advisor' : 'Faculty Member'}
      isAdvisor={isAdvisor}
    >
      <div className="py-2 animate-fade-in">
        <GovernmentAttendanceSystem />
      </div>
    </PortalLayout>
  )
}

