import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminFilesView, FileItem } from './components/AdminFilesView'

export const dynamic = 'force-dynamic'

export default async function AdminFilesPage() {
  const session = await requireRoleSession(['admin'])

  const [resources, questionPapers, projects, announcements] = await Promise.all([
    prisma.resource.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.questionPaper.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
  ])

  const filesList: FileItem[] = [
    ...resources.map((r) => ({
      id: r.id,
      fileName: r.fileName || `${r.name.replace(/\s+/g, '_')}.pdf`,
      originalName: r.name,
      fileType: r.fileType || 'pdf',
      fileSize: r.fileSize || 4500000,
      fileUrl: r.fileUrl || '/resources',
      module: 'resources',
      uploadedByName: r.uploadedByName || 'Faculty Instructor',
      createdAt: r.createdAt ? r.createdAt.toISOString().split('T')[0] : '',
    })),
    ...questionPapers.map((qp) => ({
      id: qp.id,
      fileName: qp.fileName || `QP_${qp.examType}_${qp.year}.pdf`,
      originalName: `${qp.examType} Question Paper — Year ${qp.year} (Sem ${qp.semester})`,
      fileType: qp.fileType || 'pdf',
      fileSize: qp.fileSize || 3200000,
      fileUrl: qp.fileUrl || '/question-papers',
      module: 'question-papers',
      uploadedByName: 'Exam Cell / COE',
      createdAt: qp.createdAt ? qp.createdAt.toISOString().split('T')[0] : '',
    })),
    ...projects.map((p) => ({
      id: p.id,
      fileName: `Project_${p.title.slice(0, 20).replace(/\s+/g, '_')}.pdf`,
      originalName: `Capstone: ${p.title} (${p.domain})`,
      fileType: 'pdf',
      fileSize: 5800000,
      fileUrl: p.documentation || '/admin/projects',
      module: 'projects',
      uploadedByName: p.guideName || 'Research Team',
      createdAt: p.createdAt ? p.createdAt.toISOString().split('T')[0] : '',
    })),
    ...announcements.filter((a) => a.attachmentUrl).map((a) => ({
      id: a.id,
      fileName: `Circular_${a.title.slice(0, 20).replace(/\s+/g, '_')}.pdf`,
      originalName: `Official Notice: ${a.title}`,
      fileType: 'pdf',
      fileSize: 1200000,
      fileUrl: a.attachmentUrl || '/announcements',
      module: 'announcements',
      uploadedByName: a.createdByName || 'System Administrator',
      createdAt: a.createdAt ? a.createdAt.toISOString().split('T')[0] : '',
    })),
  ]

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminFilesView initialFiles={filesList} />
      </div>
    </PortalLayout>
  )
}
