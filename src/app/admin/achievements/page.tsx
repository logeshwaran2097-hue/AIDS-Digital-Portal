import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAchievementsView, AchievementRecord } from './components/AdminAchievementsView'

export const dynamic = 'force-dynamic'

export default async function AdminAchievementsPage() {
  const session = await requireRoleSession(['admin'])

  const dbAchievements = await prisma.achievement.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const achievementsList: AchievementRecord[] = dbAchievements.map((a: any) => ({
    id: a.id,
    title: a.title,
    description: a.description || null,
    recipientName: a.recipientName || a.studentName || 'Student',
    category: a.category || 'COMPETITION',
    date: a.date ? (typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0]) : (a.createdAt ? a.createdAt.toISOString().split('T')[0] : ''),
    awardName: a.awardName || null,
    prizeAmount: a.prizeAmount || null,
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAchievementsView initialAchievements={achievementsList} />
      </div>
    </PortalLayout>
  )
}
