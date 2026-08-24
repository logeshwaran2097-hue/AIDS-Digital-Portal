import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { CalendarDays, MapPin, Clock, Plus, Users, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HODEventsPage() {
  const session = await requireRoleSession(['hod'])

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  })

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Department Activities
              </span>
            </div>
            <h1 className="text-2xl font-black">Events, Workshops &amp; Hackathons</h1>
            <p className="text-xs text-gray-300 mt-1">
              Organize and review upcoming technical symposiums, coding challenges &amp; industry guest lectures
            </p>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e: any) => (
            <Card key={e.id} className="rounded-3xl border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="role" className="text-[10px] font-bold">
                    {e.category}
                  </Badge>
                  <span className="text-xs text-gray-400 font-semibold">{formatDate(e.date)}</span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#071A3D] leading-snug">{e.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-3 mt-1.5 leading-relaxed">{e.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                  <p className="flex items-center gap-1.5 text-[#1455D9] font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0" /> {e.time}
                  </p>
                  <p className="flex items-center gap-1.5 text-gray-600 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-red-500" /> {e.venue}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                    Published
                  </span>
                  {e.registrationUrl && (
                    <a
                      href={e.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#1455D9] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      Register Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  )
}
