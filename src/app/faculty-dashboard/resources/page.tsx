import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyResourcesView, ResourceItem } from './components/FacultyResourcesView'

export const dynamic = 'force-dynamic'

export default async function FacultyResourcesPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const facultyName = user?.name || session.name || 'Faculty Member'
  const resourcesFromDb = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const mappedResources: ResourceItem[] = resourcesFromDb.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    fileName: r.fileName,
    fileSize: r.fileSize,
    resourceType: r.resourceType,
    uploadedByName: r.uploadedByName || facultyName,
    createdAt: r.createdAt,
  }))

  return (
    <PortalLayout role="faculty" userName={facultyName}>
      <div className="py-2 animate-fade-in">
        <FacultyResourcesView initialResources={mappedResources} facultyName={facultyName} />
      </div>
    </PortalLayout>
  )
}
