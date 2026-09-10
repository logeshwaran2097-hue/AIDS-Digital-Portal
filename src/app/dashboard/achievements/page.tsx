import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { StudentAchievementsView, AchievementItem } from './components/StudentAchievementsView'

export const dynamic = 'force-dynamic'

export default async function AchievementsPage() {
  const session = await requireRoleSession(['student'])

  const [dbAchievements, user] = await Promise.all([
    prisma.achievement.findMany({
      where: {
        OR: [
          { status: 'published' },
          { status: 'approved' },
          // Also show student their own submissions
          { recipientName: session.name },
        ],
      },
      orderBy: { date: 'desc' },
    }).catch(() => []),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
  ])

  const initialAchievements: AchievementItem[] = dbAchievements.map((a: any) => ({
    id: a.id,
    title: a.title,
    description: a.description || '',
    category: a.category || 'Hackathon & Coding',
    recipientType: a.recipientType,
    recipientName: a.recipientName,
    eventName: a.eventName,
    awardName: a.awardName,
    certificateUrl: a.certificateUrl,
    date: a.date ? (typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0]) : '',
    status: a.status,
  }))

  return (
    <PortalLayout role="student" userName={user?.name || session.name || 'Student'}>
      <StudentAchievementsView
        initialAchievements={initialAchievements}
        userName={user?.name || session.name || 'Student'}
      />
    </PortalLayout>
  )
}
