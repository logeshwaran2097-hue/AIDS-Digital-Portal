import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminFilesView, FileItem } from './components/AdminFilesView'

export const dynamic = 'force-dynamic'

export default async function AdminFilesPage() {
  const session = await requireRoleSession(['admin'])

  const dbFiles = await prisma.fileRecord.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const filesList: FileItem[] = dbFiles.map((f) => ({
    id: f.id,
    fileName: f.fileName,
    originalName: f.originalName,
    fileType: f.fileType,
    fileSize: f.fileSize,
    fileUrl: f.fileUrl,
    module: f.module,
    uploadedByName: f.uploadedByName || 'System Administrator',
    createdAt: f.createdAt ? f.createdAt.toISOString().split('T')[0] : '',
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminFilesView initialFiles={filesList} />
      </div>
    </PortalLayout>
  )
}
