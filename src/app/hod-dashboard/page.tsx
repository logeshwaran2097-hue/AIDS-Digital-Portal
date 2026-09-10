import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODOnboardingWrapper } from './components/HODOnboardingWrapper'
import { HODAttendanceApprovals } from './notifications/components/HODAttendanceApprovals'
import { DepartmentAttendanceAnalytics } from './components/DepartmentAttendanceAnalytics'
import {
  Users,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Database,
  FileQuestion,
  CalendarDays,
  AlertCircle,
  BarChart3,
  ShieldCheck,
  Trophy,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HODDashboardPage() {
  const session = await requireRoleSession(['hod'])

  const [
    studentCount,
    facultyCount,
    subjectCount,
    projectCount,
    resourceCount,
    questionPaperCount,
    upcomingEvents,
    pendingResources,
    pendingQP,
    pendingAchievements,
    user,
    hodRec,
  ] = await Promise.all([
    prisma.student.count().catch(() => 0),
    prisma.faculty.count().catch(() => 0),
    prisma.subject.count().catch(() => 0),
    prisma.project.count().catch(() => 0),
    prisma.resource.count({ where: { status: 'published' } }).catch(() => 0),
    prisma.questionPaper.count({ where: { status: 'published' } }).catch(() => 0),
    prisma.event.count({ where: { isPublished: true, date: { gte: new Date() } } }).catch(() => 0),
    prisma.resource.count({ where: { status: 'pending' } }).catch(() => 0),
    prisma.questionPaper.count({ where: { status: 'pending' } }).catch(() => 0),
    prisma.achievement.count({ where: { status: 'pending' } }).catch(() => 0),
    prisma.user.findUnique({ where: { id: session.userId } }).catch(() => null),
    prisma.hOD.findFirst({ where: { OR: [{ userId: session.userId }, { facultyId: session.facultyId || '' }] } }).catch(() => null),
  ])

  const totalPending = pendingResources + pendingQP + pendingAchievements

  return (
    <PortalLayout role="hod" userName={user?.name || session.name || 'Head of Department'}>
      <div className="space-y-8 animate-fade-in">
        {/* HOD Onboarding & Security Wizard */}
        <HODOnboardingWrapper
          initialMustChangePassword={Boolean(user?.mustChangePassword)}
          hodData={{
            name: user?.name || session.name || 'Head of Department',
            email: user?.email || session.email || '',
            phone: user?.phone || '',
            facultyId: hodRec?.facultyId || session.facultyId || '',
            designation: hodRec?.designation || 'Head of Department',
            qualification: hodRec?.qualification || '',
            experience: hodRec?.experience ?? 0,
            department: hodRec?.department || 'Artificial Intelligence & Data Science',
          }}
        />

        {/* HOD Executive Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#F4C430]/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-[#F4C430] flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-[#F4C430] shrink-0 shadow-lg">
                {user?.name?.charAt(0) || session.name?.charAt(0) || 'H'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-300 font-medium">Department Portal ·</span>
                  <span className="text-xs sm:text-sm font-bold text-[#F4C430]">Head of Department</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white truncate mt-1">
                  {user?.name || session.name || 'Head of Department'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  Department of Artificial Intelligence &amp; Data Science · V.S.B. Engineering College
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
                <p className="text-[10px] text-gray-300 uppercase tracking-wider font-bold">Academic Year</p>
                <p className="text-base font-black text-[#F4C430]">2025-26</p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-slate-50/60 to-white border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(7,26,61,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(20,85,217,0.12)] hover:border-blue-200/90 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1455D9] to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{studentCount}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Active Enrolled</p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-slate-50/60 to-white border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(7,26,61,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(147,51,234,0.12)] hover:border-purple-200/90 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Staff</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{facultyCount}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Teaching Members</p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-slate-50/60 to-white border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(7,26,61,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(245,158,11,0.12)] hover:border-amber-200/90 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Subjects</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{subjectCount}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Curriculum Courses</p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-slate-50/60 to-white border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(7,26,61,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(6,182,212,0.12)] hover:border-cyan-200/90 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Projects</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <FolderOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{projectCount}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Ongoing &amp; Final Year</p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-slate-50/60 to-white border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(7,26,61,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(20,85,217,0.12)] hover:border-blue-200/90 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Study Resources</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{resourceCount}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Notes &amp; Manuals</p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-slate-50/60 to-white border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(7,26,61,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(16,185,129,0.12)] hover:border-emerald-200/90 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question Papers</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <FileQuestion className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{questionPaperCount}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Internal &amp; University</p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-slate-50/60 to-white border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(7,26,61,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(244,63,94,0.12)] hover:border-rose-200/90 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Events</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{upcomingEvents}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Workshops &amp; Seminars</p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200/90 shadow-[0_4px_20px_-2px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_28px_-4px_rgba(245,158,11,0.15)] hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Pending Approvals</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-900">{totalPending}</p>
            <p className="text-[11px] text-amber-700 font-bold mt-1">Requires HOD Sign-off</p>
          </div>
        </div>

        {/* Department Attendance Analytics: Class-wise Average & Class Breakdown */}
        <section aria-label="Department Attendance Analytics">
          <DepartmentAttendanceAnalytics />
        </section>

        {/* Attendance Register Unlock Approvals for HOD */}
        <section aria-label="Attendance Register Unlock Approvals">
          <HODAttendanceApprovals />
        </section>

        {/* Department Quick Actions Grid */}
        <section aria-label="Department Management Navigation">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-[#071A3D] tracking-tight">Department Governance &amp; Administration</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { label: 'Students', href: '/hod-dashboard/students', icon: <Users className="w-5 h-5" />, desc: 'Student database & batch lists', color: 'bg-blue-50 text-[#1455D9] group-hover:bg-[#1455D9] group-hover:text-white' },
              { label: 'Faculty', href: '/hod-dashboard/faculty', icon: <GraduationCap className="w-5 h-5" />, desc: 'Faculty profiles & workload', color: 'bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white' },
              { label: 'OD & Proofs', href: '/hod-dashboard/od-proofs', icon: <ShieldCheck className="w-5 h-5" />, desc: 'Verify geo-tags & certificates', color: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white' },
              { label: 'Achievements', href: '/hod-dashboard/achievements', icon: <Trophy className="w-5 h-5" />, desc: 'Department honors & awards', color: 'bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white' },
              { label: 'Projects', href: '/hod-dashboard/projects', icon: <FolderOpen className="w-5 h-5" />, desc: 'Review student projects', color: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white' },
              { label: 'Reports', href: '/hod-dashboard/reports', icon: <BarChart3 className="w-5 h-5" />, desc: 'Department analytics & PDF', color: 'bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 hover:border-blue-300/80 shadow-[0_2px_12px_-2px_rgba(7,26,61,0.04)] hover:shadow-[0_10px_24px_-4px_rgba(20,85,217,0.1)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${action.color} shadow-2xs`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#071A3D] group-hover:text-[#1455D9] transition-colors">{action.label}</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-1">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PortalLayout>
  )
}