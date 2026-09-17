'use client'

import React, { useState, useEffect } from 'react'
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
    id?: string
    name: string
    email: string
    phone?: string | null
    emailVerified?: boolean
    mustChangePassword?: boolean
    profileImage?: string | null
  }
  student: {
    id?: string
    userId?: string
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
  attendanceStats?: {
    totalSessions: number
    presentSessions: number
    absentSessions: number
    odSessions: number
    percentage: number
    subjectBreakdown: {
      code: string
      name: string
      conducted: number
      attended: number
      percent: number
    }[]
  }
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

export default function StudentDashboard({ data }: { data: DashboardData }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(data.user)
  const [liveAnnouncements, setLiveAnnouncements] = useState(data.announcements)
  const [liveEvents, setLiveEvents] = useState(data.events)

  // Real-time live sync for student announcements and events
  React.useEffect(() => {
    const fetchFreshContent = async () => {
      try {
        const [annRes, evRes] = await Promise.all([
          fetch('/api/announcements', { cache: 'no-store' }),
          fetch('/api/events', { cache: 'no-store' }),
        ])
        const [annData, evData] = await Promise.all([annRes.json(), evRes.json()])

        if (annData.success && Array.isArray(annData.announcements)) {
          setLiveAnnouncements(
            annData.announcements.map((a: any) => ({
              id: a.id,
              title: a.title,
              category: a.category,
              content: a.content,
              createdAt: new Date(a.createdAt),
            }))
          )
        }

        if (evData.success && Array.isArray(evData.events)) {
          setLiveEvents(
            evData.events.map((e: any) => ({
              id: e.id,
              name: e.name,
              description: e.description,
              date: new Date(e.date),
              time: e.time,
              venue: e.venue,
              category: e.category,
            }))
          )
        }
      } catch {}
    }

    const interval = setInterval(fetchFreshContent, 45000)
    return () => clearInterval(interval)
  }, [])

  const studentKey = data.student?.registerNumber || currentUser.email || 'student'
  const regNo = (data.student?.registerNumber || '').trim().toUpperCase()
  const userEmail = (currentUser.email || '').trim().toLowerCase()
  const userId = currentUser.id || ''
  const isInitialNeedsOnboarding = Boolean(data.user?.mustChangePassword)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isCompletedLocally =
      (regNo && (localStorage.getItem(`vsb_student_onboarding_done_${regNo}`) === 'true' || sessionStorage.getItem(`vsb_student_onboarding_done_${regNo}`) === 'true')) ||
      (userEmail && (localStorage.getItem(`vsb_student_onboarding_done_${userEmail}`) === 'true' || sessionStorage.getItem(`vsb_student_onboarding_done_${userEmail}`) === 'true')) ||
      (userId && (localStorage.getItem(`vsb_student_onboarding_done_${userId}`) === 'true' || sessionStorage.getItem(`vsb_student_onboarding_done_${userId}`) === 'true')) ||
      localStorage.getItem(`vsb_student_onboarding_done_${studentKey}`) === 'true' ||
      sessionStorage.getItem(`vsb_student_onboarding_done_${studentKey}`) === 'true'

    if (!isCompletedLocally && isInitialNeedsOnboarding) {
      setIsOnboardingOpen(true)
    } else {
      setIsOnboardingOpen(false)
      // Once completed or mustChangePassword is false, mark it locally so it never appears again
      if (typeof window !== 'undefined') {
        if (regNo) localStorage.setItem(`vsb_student_onboarding_done_${regNo}`, 'true')
        if (userEmail) localStorage.setItem(`vsb_student_onboarding_done_${userEmail}`, 'true')
        if (userId) localStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
        localStorage.setItem(`vsb_student_onboarding_done_${studentKey}`, 'true')
      }
    }
  }, [studentKey, isInitialNeedsOnboarding, regNo, userEmail, userId])

  const handleOnboardingComplete = (updatedUser: any) => {
    setIsOnboardingOpen(false)
    if (typeof window !== 'undefined') {
      if (regNo) {
        localStorage.setItem(`vsb_student_onboarding_done_${regNo}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${regNo}`, 'true')
      }
      if (userEmail) {
        localStorage.setItem(`vsb_student_onboarding_done_${userEmail}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${userEmail}`, 'true')
      }
      if (userId) {
        localStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
      }
      localStorage.setItem(`vsb_student_onboarding_done_${studentKey}`, 'true')
      sessionStorage.setItem(`vsb_student_onboarding_done_${studentKey}`, 'true')
    }
    if (updatedUser) {
      setCurrentUser((prev) => ({ ...prev, ...updatedUser, mustChangePassword: false }))
    }
  }

  const handleOnboardingClose = () => {
    setIsOnboardingOpen(false)
    if (typeof window !== 'undefined') {
      if (regNo) {
        localStorage.setItem(`vsb_student_onboarding_done_${regNo}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${regNo}`, 'true')
      }
      if (userEmail) {
        localStorage.setItem(`vsb_student_onboarding_done_${userEmail}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${userEmail}`, 'true')
      }
      if (userId) {
        localStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
      }
      localStorage.setItem(`vsb_student_onboarding_done_${studentKey}`, 'true')
      sessionStorage.setItem(`vsb_student_onboarding_done_${studentKey}`, 'true')
    }
  }

  const att = data.attendanceStats || {
    totalSessions: 0,
    presentSessions: 0,
    absentSessions: 0,
    odSessions: 0,
    percentage: 0,
    subjectBreakdown: [],
  }

  const isEligible = att.totalSessions === 0 || att.percentage >= 75
  const displaySubjects = (att.subjectBreakdown && att.subjectBreakdown.length > 0)
    ? att.subjectBreakdown
    : data.subjects.map(s => ({
        code: s.code,
        name: s.name,
        conducted: 0,
        attended: 0,
        percent: 0,
      }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* First-Time Student Setup & Verification Modal */}
      <StudentOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleOnboardingClose}
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
          advisorName: (data.student as any).advisorName || undefined,
          batch: (data.student as any).batch || undefined,
          parentPhone: (data.student as any).parentPhone || undefined,
          profileImage: currentUser.profileImage || undefined,
        }}
      />

      {/* Executive Centurion Academic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl lux-sapphire-card p-5 sm:p-8 text-white shadow-2xl border border-white/15">
        {/* Ambient Radial Golden & Sapphire Auroras */}
        <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.15)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-80 h-80 rounded-full bg-[radial-gradient(circle,_rgba(30,102,232,0.25)_0%,_transparent_70%)] pointer-events-none" />

        {/* Micro Circuit Lines & Watermark */}
        <div className="absolute right-6 bottom-4 opacity-10 pointer-events-none hidden md:block">
          <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60H60L90 20H150L170 60" stroke="#D4AF37" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="60" cy="60" r="4" fill="#D4AF37" />
            <circle cx="90" cy="20" r="4" fill="#D4AF37" />
            <circle cx="150" cy="20" r="4" fill="#D4AF37" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {currentUser.profileImage ? (
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#1E66E8] opacity-75 blur-xs group-hover:opacity-100 transition-opacity" />
                <img
                  src={currentUser.profileImage}
                  alt={currentUser.name}
                  className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-[#D4AF37]/80 shadow-2xl"
                />
              </div>
            ) : (
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#1E66E8] opacity-70 blur-xs" />
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#06163A]/90 backdrop-blur-md border-2 border-[#D4AF37]/80 flex items-center justify-center text-2xl sm:text-3xl font-black text-[#F3E5AB] shadow-2xl">
                  {currentUser.name.charAt(0)}
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-slate-300 font-medium">Welcome back,</span>
                <span className="text-xs sm:text-sm font-bold text-[#F3E5AB] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                  Executive Student Suite
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white truncate mt-1 tracking-tight drop-shadow-sm">
                {currentUser.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span className="rounded-xl bg-black/40 text-white px-3 py-1 font-mono font-bold tracking-wider border border-[#D4AF37]/40 shadow-inner flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  {data.student.registerNumber}
                </span>
                <span className="rounded-xl bg-blue-500/20 text-cyan-200 px-3 py-1 font-bold border border-cyan-400/30 shadow-xs">
                  Year {data.student.year} · Sem {data.student.semester}
                </span>
                <span className="rounded-xl bg-white/10 px-3 py-1 font-semibold border border-white/15 text-slate-200">
                  Section {data.student.section}
                </span>
                {(data.student as any).advisorName && (
                  <span className="rounded-xl bg-[#D4AF37]/15 text-[#F3E5AB] px-3 py-1 font-bold border border-[#D4AF37]/30 shadow-xs flex items-center gap-1.5">
                    <span className="text-[#D4AF37]">Advisor:</span> {(data.student as any).advisorName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/attendance"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-white/15 to-white/10 hover:from-white/25 hover:to-white/15 border border-white/25 backdrop-blur-md text-xs font-bold text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <CalendarDays className="w-4 h-4 text-[#F3E5AB]" />
              <span>Full Attendance Dossier</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Attendance Health & Chronometer Overview */}
      <section aria-label="Attendance Overview">
        <div className="lux-glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/70 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider",
                  att.totalSessions > 0 ? "lux-badge-emerald" : "lux-badge-sapphire"
                )}>
                  {att.totalSessions > 0 ? "Biometric Ledger Verified" : "Enrolled Academic Term"}
                </span>
                <span className="text-xs text-slate-400 font-semibold">· Semester {data.student.semester} Compliance</span>
              </div>
              <h2 className="text-xl font-black text-[#071A3D] dark:text-white mt-1.5 flex items-center gap-2.5 tracking-tight">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-[#1E66E8] to-[#1455D9] text-white shadow-md">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span>Attendance &amp; Academic Health Chronometer</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {att.totalSessions > 0 ? (
                <span className={cn(
                  "px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 border shadow-xs transition-all",
                  isEligible
                    ? "bg-emerald-50/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-rose-50/90 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                )}>
                  {isEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  {isEligible ? "Executive Exam Eligible (>75% Norm)" : "Attendance Condonation Alert (<75%)"}
                </span>
              ) : (
                <span className="px-3.5 py-1.5 bg-blue-50/90 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Active Term Ingestion</span>
                </span>
              )}
            </div>
          </div>

          {/* Metric Cards Row - Chronometer Inspired */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B1E48]/5 via-[#1E66E8]/10 to-transparent border border-blue-200/80 dark:border-blue-500/20 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Cumulative Total</p>
                <p className="text-3xl font-black text-[#1455D9] dark:text-[#38BDF8] mt-1 font-mono tracking-tight">{att.percentage.toFixed(1)}%</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mt-0.5">
                  {att.totalSessions > 0 ? (att.percentage >= 75 ? `Safe Margin (+${(att.percentage - 75).toFixed(1)}%)` : `Shortage (${(75 - att.percentage).toFixed(1)}%)`) : 'Zero Sessions'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0E3A94] to-[#1E66E8] text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/20">
                <Percent className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 dark:from-emerald-950/20 dark:to-transparent border border-emerald-200/80 dark:border-emerald-700/30 shadow-xs">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Working Sessions</p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono tracking-tight">{att.totalSessions}</p>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">{att.totalSessions > 0 ? 'Total Institutional Days' : 'Term Started'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50/70 to-cyan-100/30 dark:from-cyan-950/20 dark:to-transparent border border-cyan-200/80 dark:border-cyan-700/30 shadow-xs">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Present &amp; OD</p>
              <p className="text-3xl font-black text-[#0284C7] dark:text-cyan-300 mt-1 font-mono tracking-tight">{att.presentSessions}</p>
              <p className="text-[11px] text-cyan-800 dark:text-cyan-400 font-semibold mt-0.5">{att.odSessions > 0 ? `+ ${att.odSessions} Authorized OD` : 'Attended Sessions'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-rose-100/30 dark:from-rose-950/20 dark:to-transparent border border-rose-200/80 dark:border-rose-700/30 shadow-xs">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Absences</p>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono tracking-tight">{att.absentSessions}</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold mt-0.5">{att.totalSessions > 0 ? 'Logged Absences' : 'Perfect Record'}</p>
            </div>
          </div>

          {/* Subject-Wise Attendance Progress */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Curriculum Matrix Progress:</p>
              <Link href="/dashboard/attendance" className="text-xs text-[#1455D9] dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                <span>View Complete Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {displaySubjects.length > 0 ? (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {displaySubjects.map((sub) => {
                  const percent = sub.percent
                  const isSafe = sub.conducted === 0 || percent >= 75
                  return (
                    <div key={sub.code} className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-2.5 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-[#1455D9] dark:text-blue-300 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800">
                          {sub.code}
                        </span>
                        <span className={cn('text-xs font-black font-mono', isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                          {percent.toFixed(1)}%
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[#071A3D] dark:text-slate-200 line-clamp-1">{sub.name}</p>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
                          <div
                            className={cn('h-full rounded-full transition-all duration-500', isSafe ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-red-400')}
                            style={{ width: `${Math.min(100, Math.max(sub.conducted === 0 ? 0 : 5, percent))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium font-mono">
                          <span>{sub.attended} / {sub.conducted} Periods</span>
                          <span className={isSafe ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                            {sub.conducted === 0 ? 'Enrolled' : (isSafe ? '>75% Safe' : '<75% Warning')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                No subjects registered for the current semester.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Luxury Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1455D9] transition-colors pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search subjects, notes, question papers, events, or resources..."
          className="w-full pl-12 pr-4 py-3.5 lux-glass-card rounded-2xl border border-slate-200/90 dark:border-white/10 text-sm focus:outline-none focus:ring-4 focus:ring-[#1455D9]/20 focus:border-[#1455D9] shadow-sm placeholder:text-slate-400 transition-all text-[#071A3D] dark:text-white"
        />
      </div>

      {/* Sculpted 3D Luxury Quick Navigation Tiles */}
      <section aria-label="Quick Navigation">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {quickAccess.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-2xl lux-glass-card border border-slate-200/80 dark:border-white/10 text-[#071A3D] dark:text-white hover:shadow-xl transition-all duration-300 group text-center space-y-2 lux-specular-sweep hover:-translate-y-1'
              )}
            >
              <div className={cn('p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300 border shadow-xs', item.bg)}>
                {item.icon}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1455D9] dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
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

          {liveEvents.length === 0 ? (
            <Card className="rounded-2xl border-gray-200">
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No upcoming events scheduled.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {liveEvents.slice(0, 2).map((e) => (
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

          {liveAnnouncements.length === 0 ? (
            <Card className="rounded-2xl border-gray-200">
              <CardContent className="py-10 text-center text-sm text-gray-500">
                No announcements published yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {liveAnnouncements.slice(0, 2).map((a) => (
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