import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyAnnouncementsView, FacultyAnnouncementItem } from './components/FacultyAnnouncementsView'

export const dynamic = 'force-dynamic'

export default async function FacultyAnnouncementsPage() {
  const session = await requireRoleSession(['faculty'])

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const facultyName = user?.name || session.name || 'Faculty Member'
  const announcementsFromDb = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const mappedAnnouncements: FacultyAnnouncementItem[] = announcementsFromDb.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category,
    target: a.target,
    targetYear: a.targetYear,
    targetSemester: a.targetSemester,
    createdByName: a.createdByName || facultyName,
    isPublished: a.isPublished,
    publishedAt: a.publishedAt,
    createdAt: a.createdAt,
  }))

  return (
    <PortalLayout role="faculty" userName={facultyName}>
      <div className="py-2 animate-fade-in">
        <FacultyAnnouncementsView initialAnnouncements={mappedAnnouncements} facultyName={facultyName} />
      </div>
    </PortalLayout>
  )
}
