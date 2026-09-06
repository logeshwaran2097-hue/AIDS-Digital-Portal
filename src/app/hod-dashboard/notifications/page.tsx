import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Bell, CheckCircle2, AlertTriangle, FileQuestion, Sparkles, Inbox } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function HODNotificationsPage() {
  const session = await requireRoleSession(['hod'])

  const [notifications, pendingPapers, pendingResources] = await Promise.all([
    prisma.notification.findMany({
      where: {
        OR: [
          { target: 'all' },
          { target: 'hod' },
          { target: { contains: 'HOD' } },
          { target: { contains: 'Faculty' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }).catch(() => []),
    prisma.questionPaper.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }).catch(() => []),
    prisma.resource.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }).catch(() => []),
  ])

  // Build real-time alerts list
  const alerts = [
    ...pendingPapers.map((qp) => ({
      id: `qp-${qp.id}`,
      title: 'Question Paper Approval Pending',
      desc: `${qp.fileName} (${qp.examType || 'Internal'}) uploaded for HOD review.`,
      time: new Date(qp.createdAt).toLocaleDateString(),
      type: 'approval',
      badge: 'Action Required',
      color: 'bg-amber-100 text-amber-800',
    })),
    ...pendingResources.map((res) => ({
      id: `res-${res.id}`,
      title: 'Study Material Review Required',
      desc: `${res.name} (${res.resourceType || 'Study Material'}) awaiting HOD publishing approval.`,
      time: new Date(res.createdAt).toLocaleDateString(),
      type: 'approval',
      badge: 'Review Pending',
      color: 'bg-amber-100 text-amber-800',
    })),
    ...notifications.map((n) => ({
      id: `notif-${n.id}`,
      title: n.title,
      desc: n.message,
      time: new Date(n.createdAt).toLocaleDateString(),
      type: 'info',
      badge: 'Notice',
      color: 'bg-blue-100 text-blue-800',
    })),
  ]

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Communications
              </span>
            </div>
            <h1 className="text-2xl font-black">Department Notifications &amp; Broadcasts</h1>
            <p className="text-xs text-gray-300 mt-1">
              System alerts, urgent circulars, leave approvals and examination intimations
            </p>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((al) => (
              <Card key={al.id} className="rounded-3xl border-gray-200 hover:shadow-md transition-all">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="mt-1 shrink-0">
                    {al.type === 'approval' && (
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <FileQuestion className="w-5 h-5" />
                      </div>
                    )}
                    {al.type === 'alert' && (
                      <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    )}
                    {al.type === 'success' && (
                      <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    {al.type === 'info' && (
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#1455D9] flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-[#071A3D]">{al.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${al.color}`}>
                        {al.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{al.desc}</p>
                    <span className="text-[10px] text-gray-400 font-semibold mt-2 block">{al.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#071A3D]">No Notifications</h3>
              <p className="text-xs text-gray-400 mt-1">
                You are all caught up! Real-time alerts and pending approvals will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}
