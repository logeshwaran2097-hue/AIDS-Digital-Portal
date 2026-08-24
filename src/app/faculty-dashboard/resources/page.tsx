import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyResourcesView, ResourceItem } from './components/FacultyResourcesView'

export const dynamic = 'force-dynamic'

export default async function FacultyResourcesPage() {
  const session = await getSession()
  if (!session || session.role !== 'faculty') redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
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
    uploadedByName: r.uploadedByName || 'Dr. S. Karthik',
    createdAt: r.createdAt,
  }))

  return (
    <PortalLayout role="faculty" userName={user?.name || 'Faculty'}>
      <div className="py-2 animate-fade-in">
        <FacultyResourcesView initialResources={mappedResources} />
      </div>
    </PortalLayout>
  )
}
