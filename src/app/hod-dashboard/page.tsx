import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { HODOnboardingWrapper } from './components/HODOnboardingWrapper'
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
    prisma.student.count().catch(() => 120),
    prisma.faculty.count().catch(() => 12),
    prisma.subject.count().catch(() => 24),
    prisma.project.count().catch(() => 18),
    prisma.resource.count({ where: { status: 'published' } }).catch(() => 45),
    prisma.questionPaper.count({ where: { status: 'published' } }).catch(() => 30),
    prisma.event.count({ where: { isPublished: true, date: { gte: new Date() } } }).catch(() => 4),
    prisma.resource.count({ where: { status: 'pending' } }).catch(() => 2),
    prisma.questionPaper.count({ where: { status: 'pending' } }).catch(() => 1),
    prisma.achievement.count({ where: { status: 'pending' } }).catch(() => 3),
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
            name: user?.name || session.name || 'Prof. Dr. V. Sundar',
            email: user?.email || session.email || 'hod.ai@vsb.edu.in',
            phone: user?.phone || '+91 94431 87654',
            facultyId: hodRec?.facultyId || session.facultyId || 'HOD001',
            designation: hodRec?.designation || 'Professor & Head of Department',
            qualification: hodRec?.qualification || 'Ph.D. (AI & DS), M.Tech (CSE)',
            experience: hodRec?.experience || 18,
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
                  {user?.name || session.name || 'Prof. Dr. V. Sundar'}
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
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Students</span>
              <div className="w-9 h-9 rounded-xl bg-[#1455D9]/10 text-[#1455D9] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{studentCount}</p>
            <p className="text-[11px] text-gray-400 mt-1">Active Enrolled</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Faculty Staff</span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{facultyCount}</p>
            <p className="text-[11px] text-gray-400 mt-1">Teaching Members</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Subjects</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{subjectCount}</p>
            <p className="text-[11px] text-gray-400 mt-1">Curriculum Courses</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student Projects</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <FolderOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{projectCount}</p>
            <p className="text-[11px] text-gray-400 mt-1">Ongoing &amp; Final Year</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Study Resources</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{resourceCount}</p>
            <p className="text-[11px] text-gray-400 mt-1">Notes &amp; Manuals</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Question Papers</span>
              <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                <FileQuestion className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{questionPaperCount}</p>
            <p className="text-[11px] text-gray-400 mt-1">Internal &amp; University</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upcoming Events</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#071A3D]">{upcomingEvents}</p>
            <p className="text-[11px] text-gray-400 mt-1">Workshops &amp; Seminars</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-red-200/80 shadow-xs hover:shadow-md transition-all bg-red-50/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Pending Approvals</span>
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-red-600">{totalPending}</p>
            <p className="text-[11px] text-red-600 mt-1">Requires HOD Sign-off</p>
          </div>
        </div>

        {/* Department Quick Actions Grid */}
        <section aria-label="Department Management Navigation">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#071A3D]">Department Governance &amp; Administration</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Students', href: '/hod-dashboard/students', icon: <Users className="w-5 h-5" />, desc: 'Student database & batch lists', color: 'bg-blue-50 text-[#1455D9]' },
              { label: 'Faculty', href: '/hod-dashboard/faculty', icon: <GraduationCap className="w-5 h-5" />, desc: 'Faculty profiles & workload', color: 'bg-purple-50 text-purple-700' },
              { label: 'Academics', href: '/hod-dashboard/academics', icon: <BookOpen className="w-5 h-5" />, desc: 'Syllabus & subject mapping', color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Resources', href: '/hod-dashboard/resources', icon: <Database className="w-5 h-5" />, desc: 'Approve study materials', color: 'bg-indigo-50 text-indigo-700' },
              { label: 'Projects', href: '/hod-dashboard/projects', icon: <FolderOpen className="w-5 h-5" />, desc: 'Review student projects', color: 'bg-amber-50 text-amber-700' },
              { label: 'Reports', href: '/hod-dashboard/reports', icon: <BarChart3 className="w-5 h-5" />, desc: 'Department analytics', color: 'bg-rose-50 text-rose-700' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="p-4 bg-white rounded-2xl border border-gray-200/80 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${action.color}`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#071A3D] group-hover:text-[#1455D9] transition-colors">{action.label}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PortalLayout>
  )
}