import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Megaphone, Calendar, User, FileText, Pin, AlertCircle, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function AnnouncementsPage() {
  const session = await requireRoleSession(['student'])

  const announcements = await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
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
                Official Bulletins
              </span>
              <span className="text-xs text-gray-300">· V.S.B. Engineering College</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Department Announcements &amp; Notices</h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Examination circulars, placement training updates, and technical symposium notices
            </p>
          </div>

          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Total Notices</p>
            <p className="text-base font-black text-[#F4C430]">{announcements.length} Published</p>
          </div>
        </div>

        {/* Announcements Feed */}
        <div className="space-y-4">
          {announcements.map((item: any) => {
            const isExam = item.category === 'Examination'
            const isPlacement = item.category === 'Placement'

            return (
              <Card
                key={item.id}
                className="rounded-3xl border-gray-200 hover:shadow-xl transition-all bg-white overflow-hidden group hover:border-[#1455D9]/40"
              >
                <CardContent className="p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isExam
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isPlacement
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-blue-50 text-[#1455D9] border-blue-200'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-[#1455D9] flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5 text-[#F4C430]" /> Official Department Notice
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mt-2 whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium flex items-center gap-1.5 text-gray-700">
                      <User className="w-3.5 h-3.5 text-[#1455D9]" />
                      <span>Issued by: {item.createdByName || 'HOD Office'}</span>
                    </span>

                    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                      Active Circular
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </PortalLayout>
  )
}
