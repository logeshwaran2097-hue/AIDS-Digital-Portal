import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { DepartmentAttendanceAnalytics } from '../components/DepartmentAttendanceAnalytics'

export const dynamic = 'force-dynamic'

export default async function HODAttendancePage() {
  const session = await requireRoleSession(['hod'])
  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="hod" userName={user?.name || session.name || 'Head of Department'}>
      <div className="py-2 animate-fade-in">
        <DepartmentAttendanceAnalytics />
      </div>
    </PortalLayout>
  )
}
