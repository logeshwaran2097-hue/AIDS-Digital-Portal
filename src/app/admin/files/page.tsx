import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminFilesView, FileItem } from './components/AdminFilesView'

export const dynamic = 'force-dynamic'

const FALLBACK_FILES: FileItem[] = [
  { id: 'f1', fileName: 'AD2301-Unit-3-Deep-Learning.pdf', originalName: 'Unit-3-Deep-Learning-Notes.pdf', fileType: 'application/pdf', fileSize: 4200000, fileUrl: '#', module: 'Study Resources', uploadedByName: 'Dr. S. Karthik', createdAt: '2026-02-24' },
  { id: 'f2', fileName: 'CIA-1-Question-Paper-Set-A.pdf', originalName: 'CIA-1-Model-Question-Paper.pdf', fileType: 'application/pdf', fileSize: 1800000, fileUrl: '#', module: 'Question Papers', uploadedByName: 'Mrs. R. Priya', createdAt: '2026-02-23' },
]

export default async function AdminFilesPage() {
  const session = await requireRoleSession(['admin'])

  const dbFiles = await prisma.fileRecord.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const filesList: FileItem[] = dbFiles.length > 0 ? dbFiles.map((f) => ({
    id: f.id,
    fileName: f.fileName,
    originalName: f.originalName,
    fileType: f.fileType,
    fileSize: f.fileSize,
    fileUrl: f.fileUrl,
    module: f.module,
    uploadedByName: f.uploadedByName || 'System Administrator',
    createdAt: f.createdAt ? f.createdAt.toISOString().split('T')[0] : '2026-02-24',
  })) : FALLBACK_FILES

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminFilesView initialFiles={filesList} />
      </div>
    </PortalLayout>
  )
}
