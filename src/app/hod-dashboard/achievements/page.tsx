import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Trophy, Award, Star, Medal, Calendar, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HODAchievementsPage() {
  const session = await getSession()
  if (!session || session.role !== 'hod') redirect('/login')

  const achievements = await prisma.achievement.findMany({
    orderBy: { date: 'desc' },
  })

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Hall of Fame
              </span>
            </div>
            <h1 className="text-2xl font-black">Student &amp; Faculty Achievements</h1>
            <p className="text-xs text-gray-300 mt-1">
              National hackathons, research publications, competitive coding awards &amp; symposium trophies
            </p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((ac: any) => (
            <Card key={ac.id} className="rounded-3xl border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="role" className="text-[10px] font-bold">
                    {ac.category}
                  </Badge>
                  <span className="text-xs text-gray-400 font-semibold">{formatDate(ac.date)}</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#F4C430]/20 text-[#c79a14] flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#071A3D] leading-snug">{ac.title}</h3>
                    <p className="text-xs font-semibold text-[#1455D9] mt-0.5">{ac.awardName || ac.eventName}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{ac.description}</p>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700">{ac.recipientName}</span>
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                    Verified
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  )
}
