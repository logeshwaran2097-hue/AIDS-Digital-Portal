import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultySettingsView } from './components/FacultySettingsView'

export const dynamic = 'force-dynamic'

export default async function FacultySettingsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const faculty = await prisma.faculty.findUnique({ where: { userId: session.userId } })

  return (
    <PortalLayout role="faculty" userName={user?.name || session.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultySettingsView
          userName={user?.name || session.name || 'Faculty Member'}
          facultyId={faculty?.facultyId || session.facultyId || 'FACULTY'}
          designation={faculty?.designation || 'Faculty Member'}
        />
      </div>
    </PortalLayout>
  )
}
