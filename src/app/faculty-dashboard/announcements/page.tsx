import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyAnnouncementsView, FacultyAnnouncementItem } from './components/FacultyAnnouncementsView'

export const dynamic = 'force-dynamic'

export default async function FacultyAnnouncementsPage() {
  const session = await requireRoleSession(['faculty'])

  const [user, faculty, announcementsFromDb, distinctClasses] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.faculty.findUnique({ where: { userId: session.userId } }).catch(() => null),
    prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.student.findMany({
      select: { year: true, section: true, semester: true },
      distinct: ['year', 'section', 'semester'],
      orderBy: [{ year: 'asc' }, { section: 'asc' }],
    }).catch(() => []),
  ])

  const facultyName = user?.name || session.name || 'Faculty Member'
  const isAdvisor = faculty?.facultyType === 'advisor' || faculty?.facultyType === 'both'
  const advisorBatch =
    faculty?.advisorBatch ||
    (isAdvisor && faculty?.advisorYear
      ? `Year ${faculty.advisorYear} - Section ${faculty.advisorSec || 'A'} (Sem ${faculty.advisorSem || 3})`
      : null)

  const mappedAnnouncements: FacultyAnnouncementItem[] = announcementsFromDb.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category,
    target: a.target,
    targetYear: a.targetYear,
    targetSemester: a.targetSemester,
    attachmentUrl: a.attachmentUrl || null,
    createdByName: a.createdByName || facultyName,
    isPublished: a.isPublished,
    publishedAt: a.publishedAt,
    createdAt: a.createdAt,
  }))

  const roleBadgeLabel = isAdvisor
    ? 'Class Advisor'
    : faculty?.facultyType === 'lab_faculty'
    ? 'Lab Handler'
    : 'Faculty Member'

  return (
    <PortalLayout
      role="faculty"
      userName={facultyName}
      userEmail={user?.email || session.email}
      roleBadgeLabel={roleBadgeLabel}
      isAdvisor={isAdvisor}
    >
      <div className="py-2 animate-fade-in">
        <FacultyAnnouncementsView
          initialAnnouncements={mappedAnnouncements}
          facultyName={facultyName}
          isAdvisor={isAdvisor}
          advisorBatch={advisorBatch}
          advisorYear={faculty?.advisorYear || null}
          advisorSem={faculty?.advisorSem || null}
          advisorSec={faculty?.advisorSec || null}
          allocatedClasses={distinctClasses}
        />
      </div>
    </PortalLayout>
  )
}
