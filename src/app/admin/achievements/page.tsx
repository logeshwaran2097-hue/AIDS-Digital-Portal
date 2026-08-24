import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAchievementsView, AchievementRecord } from './components/AdminAchievementsView'

export const dynamic = 'force-dynamic'

const FALLBACK_ACHIEVEMENTS: AchievementRecord[] = [
  { id: 'ac1', title: '1st Prize - Smart India Hackathon 2025 (Hardware & AI Edition)', studentName: 'K. Aishwarya & Team', category: 'Hackathon', year: '3rd Year', prize: '₹1,00,000 Cash Prize', status: 'approved', date: '2025-12-15' },
  { id: 'ac2', title: 'Best Research Paper Award - IEEE International Conference on AI', studentName: 'M. Harish (under Dr. S. Karthik)', category: 'Publication', year: '3rd Year', prize: 'Gold Medal & Certificate', status: 'approved', date: '2025-11-28' },
]

export default async function AdminAchievementsPage() {
  const session = await requireRoleSession(['admin'])

  const dbAchievements = await prisma.achievement.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const achievementsList: AchievementRecord[] = dbAchievements.length > 0 ? dbAchievements.map((a) => ({
    id: a.id,
    title: a.title,
    studentName: a.studentName || 'AI & DS Student',
    category: a.category || 'Academic Excellence',
    year: a.year || '2025-26',
    prize: a.prize || 'Award & Certificate',
    status: a.status || 'approved',
    date: a.createdAt ? a.createdAt.toISOString().split('T')[0] : '2025-12-15',
  })) : FALLBACK_ACHIEVEMENTS

  const adminUser = await prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null)

  return (
    <PortalLayout role="admin" userName={adminUser?.name || session.name || 'Administrator'}>
      <div className="py-2 animate-fade-in">
        <AdminAchievementsView initialAchievements={achievementsList} />
      </div>
    </PortalLayout>
  )
}
