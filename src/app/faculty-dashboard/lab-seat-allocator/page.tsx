import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import LabSeatAllocatorView from '@/components/laboratory/LabSeatAllocatorView'

export const dynamic = 'force-dynamic'

export default async function FacultyLabSeatAllocatorPage() {
  const session = await requireRoleSession(['faculty', 'hod', 'admin'])
  const user = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)
  const facultyName = user?.name || session.name || 'Faculty'

  return (
    <PortalLayout role={session.role as any} userName={facultyName}>
      <LabSeatAllocatorView isFacultyMode={true} />
    </PortalLayout>
  )
}
