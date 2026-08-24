import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { AdminAchievementsView, AchievementRecord } from './components/AdminAchievementsView'

export const dynamic = 'force-dynamic'

const FALLBACK_ACHIEVEMENTS: AchievementRecord[] = [
  {
    id: 'ac1',
    title: '1st Prize - Smart India Hackathon 2025 (Hardware & AI Edition)',
    description: 'National winning project on IoT-enabled real-time crop disease classification.',
    recipientName: 'K. Aishwarya & Team',
    category: 'HACKATHON',
    date: '2025-12-15',
    awardName: '1st Prize Winner',
    prizeAmount: '₹1,00,000',
  },
  {
    id: 'ac2',
    title: 'Best Research Paper Award - IEEE International Conference on AI',
    description: 'Transformer-based neural architectures for edge computing devices.',
    recipientName: 'M. Harish (under Dr. S. Karthik)',
    category: 'PUBLICATION',
    date: '2025-11-28',
    awardName: 'Best Paper Gold Medal',
    prizeAmount: '₹25,000',
  },
]

export default async function AdminAchievementsPage() {
  const session = await requireRoleSession(['admin'])

  const dbAchievements = await prisma.achievement.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const achievementsList: AchievementRecord[] = dbAchievements.length > 0 ? dbAchievements.map((a: any) => ({
    id: a.id,
    title: a.title,
    description: a.description || 'Department Academic & Innovation Award',
    recipientName: a.recipientName || a.studentName || 'AI & DS Scholar',
    category: a.category || 'COMPETITION',
    date: a.date ? (typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0]) : (a.createdAt ? a.createdAt.toISOString().split('T')[0] : '2025-12-15'),
    awardName: a.awardName || 'Certificate of Excellence',
    prizeAmount: a.prizeAmount || null,
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
