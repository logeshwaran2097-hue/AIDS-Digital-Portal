import Link from 'next/link'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Sparkles,
  Inbox,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  FileText,
  BookOpen,
  Lock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { HODAttendanceApprovals } from './components/HODAttendanceApprovals'

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
      take: 10,
    }).catch(() => []),
    prisma.resource.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }).catch(() => []),
  ])

  const totalPendingAction = pendingPapers.length + pendingResources.length

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="space-y-8 animate-fade-in pb-10">
        {/* Executive Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#051330] via-[#071A3D] to-[#1455D9] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
          <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#F4C430]/20 via-[#22C7E8]/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#F4C430] shrink-0 shadow-lg ring-4 ring-[#F4C430]/20">
                <Bell className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-[#F4C430] to-[#E5B520] text-[#071A3D] text-[10px] font-black uppercase tracking-wider shadow-xs">
                    Executive Communications Hub
                  </span>
                  {totalPendingAction > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-rose-200 text-[10px] font-extrabold animate-pulse">
                      {totalPendingAction} Action Required
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Notifications &amp; Department Approvals
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Real-time academic alerts, question paper vetting requests, study material publication approvals, and official circulars.
                </p>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 text-center min-w-[100px]">
                <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Pending Review</p>
                <p className="text-xl font-black text-[#F4C430] mt-0.5">{totalPendingAction}</p>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 text-center min-w-[100px]">
                <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Total Notices</p>
                <p className="text-xl font-black text-white mt-0.5">{notifications.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Action Items (Pending Question Papers & Resources) */}
        {totalPendingAction > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h2 className="text-base sm:text-lg font-black text-[#071A3D] tracking-tight">
                  Action Required: Approvals Awaiting HOD Vetting
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {totalPendingAction} {totalPendingAction === 1 ? 'item' : 'items'} awaiting sign-off
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPapers.map((qp) => (
                <Card
                  key={qp.id}
                  className="rounded-2xl border-amber-200/90 bg-gradient-to-br from-white via-amber-50/30 to-white shadow-[0_4px_20px_-4px_rgba(245,158,11,0.12)] hover:border-amber-300 transition-all group"
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shrink-0 shadow-md">
                      <FileQuestion className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 text-[10px] font-black uppercase tracking-wider">
                          Question Paper Vetting
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(qp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-[#071A3D] mt-2 line-clamp-1">
                        {qp.fileName}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {qp.examType || 'Internal Assessment Test'} · Uploaded by {qp.uploadedByName || 'Faculty Member'}
                      </p>
                      <div className="mt-3.5 pt-3 border-t border-amber-100 flex items-center justify-between">
                        <span className="text-[11px] text-amber-800 font-bold">Requires HOD Approval</span>
                        <Link
                          href="/hod-dashboard/question-papers"
                          className="inline-flex items-center gap-1.5 text-xs font-black text-[#1455D9] hover:text-[#0D3FA8] transition-colors group-hover:translate-x-0.5 duration-200"
                        >
                          <span>Review &amp; Approve</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {pendingResources.map((res) => (
                <Card
                  key={res.id}
                  className="rounded-2xl border-blue-200/90 bg-gradient-to-br from-white via-blue-50/30 to-white shadow-[0_4px_20px_-4px_rgba(20,85,217,0.12)] hover:border-blue-300 transition-all group"
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center shrink-0 shadow-md">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300/80 text-[10px] font-black uppercase tracking-wider">
                          Study Material Review
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(res.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-[#071A3D] mt-2 line-clamp-1">
                        {res.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {res.resourceType || 'Lecture Notes'} · Uploaded by {res.uploadedByName || 'Faculty Member'}
                      </p>
                      <div className="mt-3.5 pt-3 border-t border-blue-100 flex items-center justify-between">
                        <span className="text-[11px] text-blue-800 font-bold">Publishing Sign-off Needed</span>
                        <Link
                          href="/hod-dashboard/resources"
                          className="inline-flex items-center gap-1.5 text-xs font-black text-[#1455D9] hover:text-[#0D3FA8] transition-colors group-hover:translate-x-0.5 duration-200"
                        >
                          <span>Review Material</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Section: Attendance Unlock Approvals */}
        <HODAttendanceApprovals />

        {/* Section 2: Department Notifications Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-[#071A3D] tracking-tight">
              Official Department Broadcasts &amp; Notices
            </h2>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-[11px]">
              Live Real-Time Feed
            </Badge>
          </div>

          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const isLockNotice = n.title?.includes('Attendance Locked') || n.title?.includes('🔒')
                const isUnlockNotice = n.title?.includes('Unlock') || n.title?.includes('🔓')

                return (
                  <Card
                    key={n.id}
                    className={cn(
                      'rounded-2xl border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_2px_12px_-2px_rgba(7,26,61,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(20,85,217,0.08)] transition-all',
                      isLockNotice && 'border-amber-300 bg-amber-50/20 hover:border-amber-400',
                      isUnlockNotice && 'border-blue-300 bg-blue-50/20 hover:border-blue-400'
                    )}
                  >
                    <CardContent className="p-5 flex items-start gap-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border',
                          isLockNotice
                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                            : isUnlockNotice
                            ? 'bg-blue-100 border-blue-300 text-[#1455D9]'
                            : 'bg-gradient-to-tr from-[#1455D9]/15 to-[#22C7E8]/15 border-[#1455D9]/20 text-[#1455D9]'
                        )}
                      >
                        {isLockNotice ? (
                          <Lock className="w-5 h-5" />
                        ) : isUnlockNotice ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : (
                          <Sparkles className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#071A3D]">{n.title}</h3>
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                              isLockNotice
                                ? 'bg-amber-100 text-amber-900 border border-amber-300/80'
                                : isUnlockNotice
                                ? 'bg-blue-100 text-blue-900 border border-blue-300/80'
                                : 'bg-slate-100 text-slate-700'
                            )}
                          >
                            {isLockNotice ? 'Locked Roll Call' : isUnlockNotice ? 'Unlock Intimation' : 'Notice'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-line">{n.message}</p>
                        <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-400 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                          {n.createdByName && (
                            <>
                              <span>·</span>
                              <span className="text-slate-600 font-semibold">By {n.createdByName}</span>
                            </>
                          )}
                          {n.target && (
                            <>
                              <span>·</span>
                              <span className="text-slate-500 font-semibold">Audience: {n.target}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : totalPendingAction === 0 ? (
              <div className="p-12 text-center bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-[#071A3D]">Executive Queue All Caught Up</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                  There are no pending approvals or unread circulars at this moment. New faculty submissions and department intimations will appear here in real-time.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
