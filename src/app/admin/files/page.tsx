import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminFilesView, FileItem } from './components/AdminFilesView'

export const dynamic = 'force-dynamic'

export default async function AdminFilesPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const dbFiles = await prisma.fileRecord.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const filesList: FileItem[] = dbFiles.map((f) => ({
    id: f.id,
    fileName: f.fileName,
    originalName: f.originalName,
    fileType: f.fileType,
    fileSize: f.fileSize,
    fileUrl: f.fileUrl,
    module: f.module,
    uploadedByName: f.uploadedByName || 'System Administrator',
    createdAt: f.createdAt.toISOString().split('T')[0],
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminFilesView initialFiles={filesList} />
      </div>
    </PortalLayout>
  )
}
