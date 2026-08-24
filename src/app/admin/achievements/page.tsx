import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAchievementsView, AchievementRecord } from './components/AdminAchievementsView'

export const dynamic = 'force-dynamic'

export default async function AdminAchievementsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const dbAchievements = await prisma.achievement.findMany({
    orderBy: { date: 'desc' },
  })

  const achievementsList: AchievementRecord[] = dbAchievements.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    recipientName: a.recipientName || 'B.Tech AI & DS Scholar',
    category: a.category,
    date: a.date.toISOString().split('T')[0],
    awardName: a.awardName || 'Gold Medal & Trophy',
    prizeAmount: '₹50,000 Cash Prize',
  }))

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="admin" userName={adminUser?.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAchievementsView initialAchievements={achievementsList} />
      </div>
    </PortalLayout>
  )
}
