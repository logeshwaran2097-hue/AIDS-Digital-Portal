import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentResourcesView } from './components/StudentResourcesView'

export const dynamic = 'force-dynamic'

export default async function ResourcesPage() {
  const session = await getSession()
  if (!session || session.role !== 'student') redirect('/login')

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="student" userName={user?.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentResourcesView resources={resources} />
      </div>
    </PortalLayout>
  )
}
