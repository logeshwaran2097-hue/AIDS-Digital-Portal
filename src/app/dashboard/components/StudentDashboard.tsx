'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  FileQuestion,
  FolderOpen,
  Users,
  CalendarDays,
  Database,
  Trophy,
  Megaphone,
  ArrowRight,
  Clock,
  MapPin,
  Search,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Percent,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { StudentOnboardingModal } from '@/components/auth/StudentOnboardingModal'

interface DashboardData {
  user: {
    name: string
    email: string
    phone?: string | null
    emailVerified?: boolean
    mustChangePassword?: boolean
    profileImage?: string | null
  }
  student: {
    registerNumber: string
    department: string
    year: number
    semester: number
    section: string
    dateOfBirth?: Date | string
  }
  announcements: { id: string; title: string; category: string; content: string; createdAt: Date }[]
  events: { id: string; name: string; description: string | null; date: Date; time: string; venue: string; category: string }[]
  resources: { id: string; name: string; resourceType: string; fileName: string; fileSize: number }[]
  achievements: { id: string; title: string; description: string; category: string; date: Date }[]
  questionPapers: { id: string; examType: string; academicYear: string; fileName: string }[]
  projects: { id: string; title: string; domain: string; year: number; status: string }[]
  notifications: { id: string; title: string; message: string; createdAt: Date }[]
  subjects: { id: string; code: string; name: string; credits: number }[]
}

const quickAccess = [
  { label: 'Attendance', href: '/dashboard/attendance', icon: <CalendarDays className="h-5 w-5" />, bg: 'bg-[#00D2D3]/10 text-[#00a8a9] hover:bg-[#00D2D3]/20 border-[#00D2D3]/20' },
  { label: 'Faculty', href: '/dashboard/faculty', icon: <Users className="h-5 w-5" />, bg: 'bg-[#6C5CE7]/10 text-[#6C5CE7] hover:bg-[#6C5CE7]/20 border-[#6C5CE7]/20' },
  { label: 'Study Details', href: '/dashboard/study', icon: <BookOpen className="h-5 w-5" />, bg: 'bg-[#1455D9]/10 text-[#1455D9] hover:bg-[#1455D9]/20 border-[#1455D9]/20' },
  { label: 'Question Papers', href: '/dashboard/question-papers', icon: <FileQuestion className="h-5 w-5" />, bg: 'bg-[#FF9F43]/10 text-[#e67e22] hover:bg-[#FF9F43]/20 border-[#FF9F43]/20' },
  { label: 'Projects', href: '/dashboard/projects', icon: <FolderOpen className="h-5 w-5" />, bg: 'bg-[#2878E8]/10 text-[#2878E8] hover:bg-[#2878E8]/20 border-[#2878E8]/20' },
  { label: 'Events', href: '/dashboard/events', icon: <CalendarDays className="h-5 w-5" />, bg: 'bg-[#FF6B6B]/10 text-[#ee5253] hover:bg-[#FF6B6B]/20 border-[#FF6B6B]/20' },
  { label: 'Resources', href: '/dashboard/resources', icon: <Database className="h-5 w-5" />, bg: 'bg-[#2878E8]/10 text-[#2878E8] hover:bg-[#2878E8]/20 border-[#2878E8]/20' },
  { label: 'Achievements', href: '/dashboard/achievements', icon: <Trophy className="h-5 w-5" />, bg: 'bg-[#F4C430]/15 text-[#b8860b] hover:bg-[#F4C430]/25 border-[#F4C430]/30' },
]

const subjectAttendanceData = [
  { code: 'AD2301', name: 'Data Structures & Algorithms', attended: 36, total: 38, percent: 94.7, color: 'text-[#1455D9]', bg: 'bg-blue-500' },
  { code: 'AD2302', name: 'Database Management Systems', attended: 34, total: 37, percent: 91.9, color: 'text-purple-600', bg: 'bg-purple-500' },
  { code: 'AD2303', name: 'Discrete Mathematics', attended: 32, total: 36, percent: 88.9, color: 'text-amber-600', bg: 'bg-amber-500' },
  { code: 'AD2304', name: 'Operating Systems', attended: 30, total: 32, percent: 93.8, color: 'text-emerald-600', bg: 'bg-emerald-500' },
  { code: 'AD2305', name: 'Machine Learning Foundations', attended: 36, total: 37, percent: 97.3, color: 'text-[#1455D9]', bg: 'bg-blue-500' },
  { code: 'AD2306', name: 'Artificial Intelligence & Expert Systems', attended: 29, total: 32, percent: 90.6, color: 'text-rose-600', bg: 'bg-rose-500' },
  { code: 'AD2307', name: 'Data Science Tools & Laboratory', attended: 18, total: 18, percent: 100.0, color: 'text-green-600', bg: 'bg-green-500' },
]

export default function StudentDashboard({ data }: { data: DashboardData }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(data.user)

  const isInitialNeedsOnboarding = Boolean(
    data.user?.mustChangePassword ||
    data.user?.emailVerified === false ||
    data.user?.email?.includes('@student.vsb.edu.in')
  )
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(isInitialNeedsOnboarding)

  const handleOnboardingComplete = (updatedUser: any) => {
    setIsOnboardingOpen(false)
    if (updatedUser) {
      setCurrentUser((prev) => ({ ...prev, ...updatedUser }))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* First-Time Student Setup & Verification Modal */}
      <StudentOnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
        initialData={{
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || '',
          registerNumber: data.student.registerNumber,
          department: data.student.department,
          year: data.student.year,
          semester: data.student.semester,
          section: data.student.section,
          dateOfBirth: data.student.dateOfBirth
            ? new Date(data.student.dateOfBirth).toISOString().split('T')[0]
            : undefined,
        }}
      />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#22C7E8]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-[#22C7E8]/40 flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-[#F4C430] shrink-0 shadow-lg">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300 font-medium">Hello,</span>
                <span className="text-sm font-semibold text-[#22C7E8]">Student 👋</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold truncate mt-0.5">{currentUser.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                <span className="rounded-lg bg-white/15 px-2.5 py-1 font-semibold tracking-wide border border-white/10 font-mono">
                  {data.student.registerNumber}
                </span>
                <span className="rounded-lg bg-[#22C7E8]/20 text-[#22C7E8] px-2.5 py-1 font-semibold border border-[#22C7E8]/30">
                  Year {data.student.year} · Sem {data.student.semester}
                </span>
                <span className="rounded-lg bg-white/15 px-2.5 py-1">
                  Section {data.student.section}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/attendance"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs"
            >
              <CalendarDays className="w-4 h-4 text-[#22C7E8]" /> View Full Attendance Log
            </Link>
          </div>
        </div>
      </div>

      {/* Live Attendance Health & Progress Ring Section */}
      <section aria-label="Attendance Overview">
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-wider">
                  Government Biometric Record
                </span>
                <span className="text-xs text-gray-400 font-semibold">· Semester 3 Compliance</span>
              </div>
              <h2 className="text-lg font-black text-[#071A3D] mt-1 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#1455D9]" /> Attendance &amp; Academic Health
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Exam Eligible (&gt;75% Norm)
              </span>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-blue-100/40 border border-blue-200/60 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cumulative</p>
                <p className="text-2xl font-black text-[#1455D9] mt-0.5">92.5%</p>
                <p className="text-[10px] text-blue-700 font-medium">Safe Margin (+17.5%)</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black text-sm shadow-md">
                <Percent className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-green-50/70 border border-green-200/60">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Working Days</p>
              <p className="text-2xl font-black text-green-700 mt-0.5">68 Days</p>
              <p className="text-[10px] text-green-800 font-semibold">Total Conducted</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Present</p>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">63 Days</p>
              <p className="text-[10px] text-emerald-800 font-semibold">+ 2 On-Duty (OD)</p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/60">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Absenteeism</p>
              <p className="text-2xl font-black text-red-600 mt-0.5">3 Days</p>
              <p className="text-[10px] text-red-700 font-semibold">Allowed: Up to 17 Days</p>
            </div>
          </div>

          {/* Subject-Wise Attendance Progress */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Subject-Wise Attendance Breakdown:</p>
              <Link href="/dashboard/attendance" className="text-xs text-[#1455D9] font-bold hover:underline">
                View All Details →
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjectAttendanceData.map((sub) => (
                <div key={sub.code} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 space-y-2 hover:bg-white hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#1455D9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200/60">
                      {sub.code}
                    </span>
                    <span className={cn('text-xs font-black', sub.color)}>
                      {sub.percent.toFixed(1)}%
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#071A3D] line-clamp-1">{sub.name}</p>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', sub.bg)} style={{ width: `${sub.percent}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                      <span>{sub.attended} / {sub.total} Periods Attended</span>
                      <span className="text-green-600 font-bold">&gt;75% Ok</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search subjects, notes, question papers, events..."
          className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1455D9]/30 focus:border-[#1455D9] shadow-xs placeholder:text-gray-400"
        />
      </div>

      {/* Quick Action Icon Grid */}
      <section aria-label="Quick Navigation">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickAccess.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-2xl border bg-white text-[#071A3D] hover:shadow-md transition-all duration-200 group text-center space-y-2',
                'hover:border-[#1455D9]/40'
              )}
            >
              <div className={cn('p-3 rounded-2xl transition-transform group-hover:scale-110 duration-200 border', item.bg)}>
                {item.icon}
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-[#1455D9] transition-colors line-clamp-1">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Split Columns: Events & Announcements */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Events */}
        <section aria-label="Upcoming Events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#071A3D] flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[#1455D9]" />
              <span>Upcoming Events</span>
            </h2>
            <Link href="/dashboard/events" className="text-xs font-semibold text-[#1455D9] hover:underline inline-flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {data.events.length === 0 ? (
            <Card className="rounded-2xl border-gray-200">
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No upcoming events scheduled.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.events.slice(0, 2).map((e) => (
                <Card key={e.id} className="rounded-2xl border-gray-200 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="role" className="capitalize text-[10px]">
                          {e.category}
                        </Badge>
                        <span className="text-[11px] text-gray-400 font-medium">{formatDate(e.date)}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[#071A3D] truncate">{e.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#1455D9]" /> {e.time}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-red-400" /> {e.venue}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-[#1455D9]/10 text-[#1455D9] rounded-2xl shrink-0 flex flex-col items-center justify-center min-w-[52px]">
                      <Calendar className="w-5 h-5 mb-0.5" />
                      <span className="text-[10px] font-bold">Event</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Latest Announcements */}
        <section aria-label="Latest Announcements" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#071A3D] flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-[#b8860b]" />
              <span>Latest Announcements</span>
            </h2>
            <Link href="/dashboard/announcements" className="text-xs font-semibold text-[#1455D9] hover:underline inline-flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {data.announcements.length === 0 ? (
            <Card className="rounded-2xl border-gray-200">
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No announcements published yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.announcements.slice(0, 2).map((a) => (
                <Card key={a.id} className="rounded-2xl border-gray-200 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="info" className="capitalize text-[10px]">
                          {a.category}
                        </Badge>
                        <span className="text-[11px] text-gray-400">{formatDate(a.createdAt)}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[#071A3D] truncate">{a.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{a.content}</p>
                    </div>
                    <Link
                      href="/dashboard/announcements"
                      className="p-2 rounded-xl text-gray-400 hover:text-[#1455D9] hover:bg-[#1455D9]/10 transition-colors shrink-0"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recent Resources Section */}
      <section aria-label="Recent Study Resources" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#071A3D] flex items-center gap-2">
            <Database className="h-5 w-5 text-[#2878E8]" />
            <span>Recent Study Resources</span>
          </h2>
          <Link href="/dashboard/resources" className="text-xs font-semibold text-[#1455D9] hover:underline inline-flex items-center gap-1">
            Browse All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.resources.length === 0 ? (
          <Card className="rounded-2xl border-gray-200">
            <CardContent className="py-8 text-center text-sm text-gray-500">
              No recent resources uploaded.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.resources.slice(0, 3).map((r) => (
              <Card key={r.id} className="rounded-2xl border-gray-200 hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#071A3D] truncate">{r.name}</p>
                    <p className="text-[11px] text-gray-400 uppercase mt-0.5">
                      {r.resourceType?.replace(/_/g, ' ')} · {(r.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Link
                    href="/dashboard/resources"
                    className="p-2 rounded-xl bg-[#1455D9]/10 text-[#1455D9] hover:bg-[#1455D9] hover:text-white transition-all shrink-0"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}