import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentResourcesView } from './components/StudentResourcesView'
import { resourceSelectOptions } from '@/lib/resourceSelect'

export const dynamic = 'force-dynamic'

export default async function ResourcesPage() {
  const session = await requireRoleSession(['student'])

  const [dbResources, subjects] = await Promise.all([
    prisma.resource.findMany({
      select: resourceSelectOptions,
      orderBy: { createdAt: 'desc' },
    }) as any,
    prisma.subject.findMany({
      select: { id: true, name: true, code: true }
    })
  ]);

  const subjectMap = new Map(subjects.map((s) => [s.id, s]))

  const mappedResources = dbResources.map((r: any) => ({
    ...r,
    subject: r.subjectId ? subjectMap.get(r.subjectId) || null : null,
  }))

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="student" userName={user?.name || 'Student'}>
      <div className="py-2 animate-fade-in">
        <StudentResourcesView resources={mappedResources} />
      </div>
    </PortalLayout>
  )
}
