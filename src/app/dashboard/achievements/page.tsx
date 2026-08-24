import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Trophy, Award, Calendar, ExternalLink, Star, Users, Medal } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AchievementsPage() {
  const session = await requireRoleSession(['student'])

  const achievements = await prisma.achievement.findMany({
    orderBy: { date: 'desc' },
  })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  return (
    <PortalLayout role="student" userName={user?.name || 'Student'}>
      <div className="space-y-6 animate-fade-in">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Hall of Fame
              </span>
              <span className="text-xs text-gray-300">· V.S.B. Engineering College</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Student &amp; Faculty Achievements</h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              National hackathon victories, research publications &amp; university honors
            </p>
          </div>

          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Awards Won</p>
            <p className="text-base font-black text-[#F4C430]">{achievements.length} Honors</p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((item: any) => (
            <Card
              key={item.id}
              className="rounded-3xl border-gray-200 hover:shadow-xl transition-all bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-bold border border-blue-200/60">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">{formatDate(item.date)}</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4C430]/20 text-[#b58b10] flex items-center justify-center shrink-0 shadow-xs">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-[#1455D9] mt-0.5">{item.awardName || item.eventName}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#1455D9]" />
                    <span>{item.recipientName}</span>
                  </span>

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
