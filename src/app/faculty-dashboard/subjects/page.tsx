import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultySubjectsView } from './components/FacultySubjectsView'

export const dynamic = 'force-dynamic'

export default async function FacultySubjectsPage() {
  const session = await getSession()
  if (!session || session.role !== 'faculty') redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="faculty" userName={user?.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultySubjectsView />
      </div>
    </PortalLayout>
  )
}
