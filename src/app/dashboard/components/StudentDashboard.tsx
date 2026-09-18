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
  { label: 'Attendance', href: '/dashboard/attendance', icon: <CalendarDays className="h-5 w-5" />, bg: 'bg-gradient-to-br from-[#00F5FF]/25 via-[#00A8FF]/15 to-transparent text-[#00F5FF] border border-[#00F5FF]/40 shadow-[0_0_15px_rgba(0,245,255,0.4)]' },
  { label: 'Faculty', href: '/dashboard/faculty', icon: <Users className="h-5 w-5" />, bg: 'bg-gradient-to-br from-[#A855F7]/25 via-[#6366F1]/15 to-transparent text-[#C084FC] border border-[#A855F7]/40 shadow-[0_0_15px_rgba(168,85,247,0.4)]' },
  { label: 'Study Details', href: '/dashboard/study', icon: <BookOpen className="h-5 w-5" />, bg: 'bg-gradient-to-br from-[#38BDF8]/25 via-[#0284C7]/15 to-transparent text-[#38BDF8] border border-[#38BDF8]/40 shadow-[0_0_15px_rgba(56,189,248,0.4)]' },
  { label: 'Question Papers', href: '/dashboard/question-papers', icon: <FileQuestion className="h-5 w-5" />, bg: 'bg-gradient-to-br from-[#FB923C]/25 via-[#EA580C]/15 to-transparent text-[#FDBA74] border border-[#FB923C]/40 shadow-[0_0_15px_rgba(251,146,60,0.4)]' },
  { label: 'Projects', href: '/dashboard/projects', icon: <FolderOpen className="h-5 w-5" />, bg: 'bg-gradient-to-br from-[#60A5FA]/25 via-[#2563EB]/15 to-transparent text-[#93C5FD] border border-[#60A5FA]/40 shadow-[0_0_15px_rgba(96,165,250,0.4)]' },
  { label: 'Events', href: '/dashboard/events', icon: <CalendarDays className="h-5 w-5" />, bg: 'bg-gradient-to-br from-[#F43F5E]/25 via-[#BE123C]/15 to-transparent text-[#FB7185] border border-[#F43F5E]/40 shadow-[0_0_15px_rgba(244,63,94,0.4)]' },
  { label: 'Resources', href: '/dashboard/resources', icon: <Database className="h-5 w-5" />, bg: 'bg-gradient-to-br from-[#22D3EE]/25 via-[#0891B2]/15 to-transparent text-[#67E8F9] border border-[#22D3EE]/40 shadow-[0_0_15px_rgba(34,211,238,0.4)]' },
  { label: 'Achievements', href: '/dashboard/achievements', icon: <Trophy className="h-5 w-5" />, bg: 'bg-gradient-to-br from-[#F59E0B]/30 via-[#D97706]/20 to-transparent text-[#FDE68A] border border-[#F59E0B]/50 shadow-[0_0_18px_rgba(245,158,11,0.5)]' },
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

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/attendance"
              className="lux-button-gold px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <CalendarDays className="w-4 h-4 text-[#071328]" />
              <span>Full Attendance Dossier</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Attendance Health & Chronometer Overview */}
      <section aria-label="Attendance Overview">
        <div className="lux-glass-card rounded-3xl p-6 sm:p-7 border border-white/80 shadow-[0_16px_40px_rgba(7,26,61,0.06)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-[#1455D9] border border-blue-200/80 text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1455D9] animate-pulse" />
                  {att.totalSessions > 0 ? "Biometric Ledger Verified" : "Enrolled Academic Term"}
                </span>
                <span className="text-xs text-slate-500 font-semibold">· Semester {data.student.semester} Compliance</span>
              </div>
              <h2 className="text-xl font-black text-[#071A3D] mt-2 flex items-center gap-2.5 tracking-tight">
                <div className="p-2 rounded-2xl bg-gradient-to-tr from-[#1748A8] to-[#1455D9] text-white shadow-md border border-white/40">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <span>Attendance &amp; Academic Health Chronometer</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {att.totalSessions > 0 ? (
                <span className={cn(
                  "px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 border shadow-xs transition-all",
                  isEligible
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                )}>
                  {isEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  {isEligible ? "Executive Exam Eligible (>75% Norm)" : "Attendance Condonation Alert (<75%)"}
                </span>
              ) : (
                <span className="px-3.5 py-1.5 bg-blue-50 text-[#1455D9] border border-blue-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#1455D9] animate-pulse" />
                  <span>Active Term Ingestion</span>
                </span>
              )}
            </div>
          </div>

          {/* Metric Cards Row - Jewelry Chronometer Complications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Cumulative Total */}
            <div className="lux-kpi-cyan lux-specular-sweep p-5 rounded-3xl flex items-center justify-between transition-all duration-300">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#22C7E8] animate-ping" />
                  <p className="text-[10px] text-cyan-800 font-black uppercase tracking-widest">Cumulative Total</p>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-[#0284C7] font-mono tracking-tight">
                  {att.percentage.toFixed(1)}%
                </p>
                <p className="text-[11px] text-cyan-700 font-semibold pt-0.5">
                  {att.totalSessions > 0 ? (att.percentage >= 75 ? `Safe Margin (+${(att.percentage - 75).toFixed(1)}%)` : `Shortage (${(75 - att.percentage).toFixed(1)}%)`) : 'Zero Sessions'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#0284C7] border border-cyan-200 flex items-center justify-center font-black shadow-xs shrink-0">
                <Percent className="w-5 h-5 text-[#0284C7]" />
              </div>
            </div>

            {/* Working Sessions */}
            <div className="lux-kpi-amber lux-specular-sweep p-5 rounded-3xl flex items-center justify-between transition-all duration-300">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#F59E0B]" />
                  <p className="text-[10px] text-amber-800 font-black uppercase tracking-widest">Working Sessions</p>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-[#D97706] font-mono tracking-tight">
                  {att.totalSessions} <span className="text-sm font-sans text-amber-700/70 font-bold">Hrs</span>
                </p>
                <p className="text-[11px] text-amber-700 font-semibold pt-0.5">{att.totalSessions > 0 ? 'Total Academic Days' : 'Term Started'}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center font-black shadow-xs shrink-0">
                <Clock className="w-5 h-5 text-[#D97706]" />
              </div>
            </div>

            {/* Present & OD */}
            <div className="lux-kpi-emerald lux-specular-sweep p-5 rounded-3xl flex items-center justify-between transition-all duration-300">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#34D399]" />
                  <p className="text-[10px] text-emerald-800 font-black uppercase tracking-widest">Present &amp; OD</p>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-[#059669] font-mono tracking-tight">
                  {att.presentSessions} <span className="text-sm font-sans text-emerald-700/70 font-bold">Hrs</span>
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold pt-0.5">{att.odSessions > 0 ? `+ ${att.odSessions} Authorized OD` : 'Attended Sessions'}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-200 flex items-center justify-center font-black shadow-xs shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              </div>
            </div>

            {/* Absences */}
            <div className="lux-kpi-rose lux-specular-sweep p-5 rounded-3xl flex items-center justify-between transition-all duration-300">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#FB7185]" />
                  <p className="text-[10px] text-rose-800 font-black uppercase tracking-widest">Absences</p>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-[#E11D48] font-mono tracking-tight">
                  {att.absentSessions} <span className="text-sm font-sans text-rose-700/70 font-bold">Hrs</span>
                </p>
                <p className="text-[11px] text-rose-700 font-semibold pt-0.5">{att.totalSessions > 0 ? 'Logged Absences' : 'Perfect Record'}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#E11D48] border border-rose-200 flex items-center justify-center font-black shadow-xs shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#E11D48]" />
              </div>
            </div>
          </div>

          {/* Subject-Wise Attendance Progress */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Curriculum Matrix Progress:</p>
              <Link href="/dashboard/attendance" className="text-xs text-[#1455D9] font-bold hover:underline flex items-center gap-1">
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
                    <div key={sub.code} className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 space-y-2.5 hover:shadow-lg hover:border-blue-400/50 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-[#1455D9] px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                          {sub.code}
                        </span>
                        <span className={cn('text-xs font-black font-mono', isSafe ? 'text-emerald-600' : 'text-rose-600')}>
                          {percent.toFixed(1)}%
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[#071A3D] line-clamp-1">{sub.name}</p>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                          <div
                            className={cn('h-full rounded-full transition-all duration-500', isSafe ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-red-400')}
                            style={{ width: `${Math.min(100, Math.max(sub.conducted === 0 ? 0 : 5, percent))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium font-mono">
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
              <div className="py-8 px-6 text-center rounded-2xl border border-slate-200/80 bg-white/60 space-y-2 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#1455D9] flex items-center justify-center mx-auto shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="font-black text-sm text-[#071A3D] flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Semester Curriculum Roll Active</span>
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Official course periods synchronized with biometric attendance ledger.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Luxury Search Bar - Translucent White Crystal */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1455D9] transition-colors pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search subjects, notes, question papers, events, or resources..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-md text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-[#1455D9] shadow-sm placeholder:text-slate-400 transition-all text-[#071A3D] font-medium"
        />
      </div>

      {/* Sculpted 3D Luxury Quick Navigation Tiles - Floating Jewel Plaque */}
      <section aria-label="Quick Navigation">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {quickAccess.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className="lux-tile-jewel lux-specular-sweep flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl group text-center space-y-3 cursor-pointer select-none"
            >
              <div className={cn('p-3.5 rounded-2xl transition-all group-hover:scale-115 group-hover:rotate-3 duration-300 shadow-md ring-1 ring-white/40', item.bg)}>
                {item.icon}
              </div>
              <span className="text-xs font-black tracking-wide text-[#071A3D] group-hover:text-[#1455D9] transition-colors line-clamp-1">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Split Columns: Events & Announcements */}
      <div className="grid gap-6 md:grid-cols-2 lux-speed-defer">
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
            <Card className="rounded-3xl">
              <CardContent className="py-10 text-center text-sm text-slate-400">
                No upcoming events scheduled.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {liveEvents.slice(0, 2).map((e) => (
                <Card key={e.id} className="rounded-3xl hover:shadow-xl transition-all">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="role" className="capitalize text-[10px]">
                          {e.category}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-medium">{formatDate(e.date)}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[#071A3D] truncate">{e.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#1455D9]" /> {e.time}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> {e.venue}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 text-[#1455D9] border border-blue-200 rounded-2xl shrink-0 flex flex-col items-center justify-center min-w-[52px] shadow-xs">
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
              <Megaphone className="h-5 w-5 text-amber-600" />
              <span>Latest Announcements</span>
            </h2>
            <Link href="/dashboard/announcements" className="text-xs font-semibold text-[#1455D9] hover:underline inline-flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {liveAnnouncements.length === 0 ? (
            <Card className="rounded-3xl">
              <CardContent className="py-10 text-center text-sm text-slate-400">
                No announcements published yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {liveAnnouncements.slice(0, 2).map((a) => (
                <Card key={a.id} className="rounded-3xl hover:shadow-xl transition-all">
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="info" className="capitalize text-[10px]">
                          {a.category}
                        </Badge>
                        <span className="text-[11px] text-slate-400">{formatDate(a.createdAt)}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[#071A3D] truncate">{a.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{a.content}</p>
                    </div>
                    <Link
                      href="/dashboard/announcements"
                      className="p-2 rounded-xl text-slate-400 hover:text-[#1455D9] hover:bg-slate-100 transition-colors shrink-0"
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
      <section aria-label="Recent Study Resources" className="space-y-4 lux-speed-defer">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#071A3D] flex items-center gap-2">
            <Database className="h-5 w-5 text-[#1455D9]" />
            <span>Recent Study Resources</span>
          </h2>
          <Link href="/dashboard/resources" className="text-xs font-semibold text-[#1455D9] hover:underline inline-flex items-center gap-1">
            Browse All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.resources.length === 0 ? (
          <Card className="rounded-3xl">
            <CardContent className="py-8 text-center text-sm text-slate-400">
              No recent resources uploaded.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.resources.slice(0, 3).map((r) => (
              <Card key={r.id} className="rounded-3xl hover:shadow-xl transition-all">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#071A3D] truncate">{r.name}</p>
                    <p className="text-[11px] text-slate-400 uppercase mt-0.5">
                      {r.resourceType?.replace(/_/g, ' ')} · {(r.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Link
                    href="/dashboard/resources"
                    className="p-2.5 rounded-xl bg-blue-50 text-[#1455D9] border border-blue-200 hover:bg-[#1455D9] hover:text-white transition-all shrink-0 shadow-xs"
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