import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminResourcesView, ResourceRecord } from './components/AdminResourcesView'

export const dynamic = 'force-dynamic'

export default async function AdminResourcesPage() {
  const session = await requireRoleSession(['admin'])

  const dbResources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const resourcesList: ResourceRecord[] = dbResources.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    fileName: r.fileName,
    fileType: r.fileType,
    fileSize: r.fileSize,
    fileUrl: r.fileUrl,
    uploadedByName: r.uploadedByName || 'Faculty Lead',
    status: r.status,
    resourceType: r.resourceType,
    semester: r.semester,
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminResourcesView initialResources={resourcesList} />
      </div>
    </PortalLayout>
  )
}
