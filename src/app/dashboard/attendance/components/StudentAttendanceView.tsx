'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Percent,
  Plus,
  Sparkles,
  BookOpen,
  Info,
  ShieldCheck,
  FileText,
  ExternalLink,
  Eye,
  RefreshCw,
  FileDown,
  Printer,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Filter,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { ApplyODPermissionModal } from './ApplyODPermissionModal'
import { DossierPopupModal } from '@/components/od/DossierPopupModal'

export interface SubjectAttendanceItem {
  code: string
  name: string
  faculty: string
  conducted: number
  attended: number
  percent: number
  status: 'Safe' | 'Warning' | 'Critical'
}

export interface AttendanceHistoryItem {
  id: string
  date: string
  subjectCode: string
  subjectName: string
  hour: string
  status: string
  takenByName: string
  remarks: string
}

export interface AttendanceStatsData {
  totalSessions: number
  presentSessions: number
  absentSessions: number
  odSessions: number
  percentage: number
  subjectBreakdown: SubjectAttendanceItem[]
  history: AttendanceHistoryItem[]
}

export interface TrackedODApplication {
  id: string
  applicationType: string
  fromDate: string
  toDate: string
  days?: string
  eventName: string
  reason?: string
  proofs?: string
  status: string
  statusLabel: string
  statusBadge: string
  createdAt?: string
  dossierUrl: string
}

export function StudentAttendanceView({
  student,
  user,
  stats,
}: {
  student: { registerNumber: string; year: number; semester: number; section: string }
  user: { name: string }
  stats: AttendanceStatsData
}) {
  const [showODModal, setShowODModal] = useState(false)
  const [odSubmitted, setOdSubmitted] = useState(false)
  const [trackedApplications, setTrackedApplications] = useState<TrackedODApplication[]>([])
  const [loadingTracked, setLoadingTracked] = useState(false)
  const [viewingDossier, setViewingDossier] = useState<{
    url: string
    title: string
    studentName?: string
    registerNumber?: string
  } | null>(null)

  // Date-wise history states
  const [historyViewMode, setHistoryViewMode] = useState<'date_wise' | 'flat_table'>('date_wise')
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})
  const [historyDateSearch, setHistoryDateSearch] = useState('')
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'P' | 'OD' | 'A'>('all')

  const toggleDateExpanded = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }))
  }

  const expandAllDates = (dates: string[]) => {
    const next: Record<string, boolean> = {}
    dates.forEach((d) => (next[d] = true))
    setExpandedDates(next)
  }

  const collapseAllDates = () => {
    setExpandedDates({})
  }

  // Grouped history by date (sorted descending)
  const groupedHistory = React.useMemo(() => {
    const map: Record<string, AttendanceHistoryItem[]> = {}
    stats.history.forEach((item) => {
      if (!map[item.date]) map[item.date] = []
      map[item.date].push(item)
    })

    const sortedDates = Object.keys(map).sort((a, b) => b.localeCompare(a))

    return sortedDates.map((date) => {
      const getHourOrder = (h: string) => {
        const num = parseInt(h.replace(/\D/g, '') || '0', 10)
        return num || 0
      }
      const sortedSessions = [...map[date]].sort((a, b) => getHourOrder(a.hour) - getHourOrder(b.hour))
      const total = sortedSessions.length
      const present = sortedSessions.filter((s) => s.status === 'P').length
      const od = sortedSessions.filter((s) => s.status === 'OD').length
      const absent = sortedSessions.filter((s) => s.status === 'A' || s.status === 'L').length
      const pct = total > 0 ? Math.round(((present + od) / total) * 100) : 0

      let formattedDate = date
      try {
        const d = new Date(date + 'T00:00:00')
        formattedDate = d.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      } catch {}

      return {
        date,
        formattedDate,
        sessions: sortedSessions,
        total,
        present,
        od,
        absent,
        pct,
      }
    })
  }, [stats.history])

  // Filtered grouped dates based on search and status
  const filteredGroupedHistory = React.useMemo(() => {
    return groupedHistory
      .map((group) => {
        let matchingSessions = group.sessions

        if (historyStatusFilter !== 'all') {
          matchingSessions = matchingSessions.filter((s) => {
            if (historyStatusFilter === 'P') return s.status === 'P'
            if (historyStatusFilter === 'OD') return s.status === 'OD'
            if (historyStatusFilter === 'A') return s.status === 'A' || s.status === 'L'
            return true
          })
        }

        if (historyDateSearch.trim()) {
          const q = historyDateSearch.toLowerCase().trim()
          const dateMatches = group.date.toLowerCase().includes(q) || group.formattedDate.toLowerCase().includes(q)
          if (!dateMatches) {
            matchingSessions = matchingSessions.filter(
              (s) =>
                s.subjectCode.toLowerCase().includes(q) ||
                s.subjectName.toLowerCase().includes(q) ||
                s.takenByName.toLowerCase().includes(q) ||
                s.hour.toLowerCase().includes(q)
            )
          }
        }

        return {
          ...group,
          sessions: matchingSessions,
        }
      })
      .filter((group) => group.sessions.length > 0)
  }, [groupedHistory, historyStatusFilter, historyDateSearch])

  const fetchTrackedApplications = useCallback(async () => {
    if (!student.registerNumber) return
    setLoadingTracked(true)
    try {
      const res = await fetch(`/api/od-applications?registerNumber=${encodeURIComponent(student.registerNumber)}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.trackedApplications)) {
        setTrackedApplications(data.trackedApplications)
      }
    } catch (err) {
      console.error('Failed to fetch tracked applications:', err)
    } finally {
      setLoadingTracked(false)
    }
  }, [student.registerNumber])

  useEffect(() => {
    fetchTrackedApplications()
  }, [fetchTrackedApplications])

  const isCompliant = stats.totalSessions === 0 || stats.percentage >= 75

  const handleDownloadReport = () => {
    const coursesToReport = stats.subjectBreakdown && stats.subjectBreakdown.length > 0 ? stats.subjectBreakdown : []

    const sections = [
      {
        heading: '1. CUMULATIVE ATTENDANCE SUMMARY',
        body: [
          `Total Working Sessions Conducted: ${stats.totalSessions} Sessions`,
          `Total Sessions Attended (Present): ${stats.presentSessions} Sessions`,
          `Cumulative Attendance Percentage: ${stats.percentage.toFixed(1)}%`,
          `On-Duty (OD) Authorized: ${stats.odSessions} Sessions`,
          `Total Absent Sessions: ${stats.absentSessions} Sessions`,
          `Eligibility Status: ${
            isCompliant
              ? 'ELIGIBLE FOR SEMESTER EXAMINATIONS (Anna University >75% Criterion Met)'
              : 'ATTENDANCE SHORTAGE (<75% Condonation / Remedial Required)'
          }`,
        ],
      },
      {
        heading: '2. COURSE-WISE ATTENDANCE BREAKDOWN',
        body: coursesToReport.length > 0
          ? coursesToReport.map(
              (s) =>
                `${s.code} · ${s.name}: ${s.conducted > 0 ? `${s.attended}/${s.conducted} Periods (${s.percent.toFixed(1)}%)` : 'Enrolled (100% Safe)'}`
            )
          : ['No course attendance sessions recorded yet by faculty.'],
      },
    ]

    generateAndDownloadPDF({
      title: 'OFFICIAL STUDENT ATTENDANCE REPORT',
      subtitle: `${user.name} (${student.registerNumber}) · Year ${student.year} · Semester ${student.semester} · Section ${student.section}`,
      author: 'Office of Head of Department (AI & DS)',
      category: 'Official Academic Attendance Record',
      sections,
      fileName: `Attendance_Report_${student.registerNumber}`,
    })
  }

  const handleODSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOdSubmitted(true)
    setTimeout(() => {
      setOdSubmitted(false)
      setShowODModal(false)
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header Banner: Executive Royal Sapphire & Gold Foil Crest */}
      <div className="lux-sapphire-card relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-[#D4AF37]/50 shadow-[0_20px_50px_rgba(3,10,32,0.85)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Ambient Radial Auroras */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.22)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-72 h-72 rounded-full bg-[radial-gradient(circle,_rgba(34,197,232,0.25)_0%,_transparent_70%)] pointer-events-none" />
        
        {/* Subtle Decorative Geometric Micro-Grid */}
        <div className="absolute right-12 bottom-3 opacity-15 pointer-events-none hidden md:block">
          <svg width="140" height="90" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 45H50L75 15H120L135 45" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="50" cy="45" r="3" fill="#D4AF37" />
            <circle cx="75" cy="15" r="3" fill="#22C7E8" />
            <circle cx="120" cy="15" r="3" fill="#D4AF37" />
          </svg>
        </div>

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37]/25 via-[#FDE68A]/20 to-[#D4AF37]/25 text-[#FDE68A] text-[10px] font-black uppercase tracking-wider border border-[#D4AF37]/50 shadow-[0_0_12px_rgba(212,175,55,0.3)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
              Biometric Attendance Sync
            </span>
            <span className="text-xs text-cyan-200/90 font-semibold tracking-wide">· Anna University 75% Rule Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            Student Attendance &amp; Leave Log
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 font-medium flex items-center gap-2 flex-wrap pt-0.5">
            <span className="text-white font-bold">{user.name}</span>
            <span className="text-[#D4AF37] font-mono font-bold">({student.registerNumber})</span>
            <span className="text-blue-200">· Year {student.year} · Semester {student.semester}</span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[11px] font-semibold">Section {student.section}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setShowODModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#D4AF37]/60 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Plus className="w-4 h-4 text-[#FDE68A]" />
            <span>Apply On-Duty / Leave</span>
          </button>
          <button
            onClick={handleDownloadReport}
            className="lux-button-gold px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4 text-[#071328]" />
            <span>Download Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* KPI Chronometer Complications (Jewelry-Grade Radiance) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Overall Attendance Gauge */}
        <div className="lux-kpi-cyan lux-specular-sweep p-5 sm:p-6 rounded-3xl flex items-center justify-between relative overflow-hidden group transition-all duration-300">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22C7E8] animate-ping" />
              <p className="text-[10px] text-cyan-200/80 font-black uppercase tracking-widest">Overall Attendance</p>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white dark:text-cyan-300 drop-shadow-[0_0_15px_rgba(34,197,232,0.4)]">
              {stats.percentage.toFixed(1)}<span className="text-xl font-sans text-cyan-300/70 font-bold">%</span>
            </p>
            <div className="pt-1">
              <span className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs",
                stats.totalSessions > 0
                  ? (isCompliant
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-400/40")
                  : "bg-cyan-500/20 text-cyan-300 border-cyan-400/30"
              )}>
                {stats.totalSessions > 0 ? (isCompliant ? '✓ Safe Margin (>75%)' : '⚠ Shortage (<75%)') : 'Term Enrolled'}
              </span>
            </div>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#1748A8] via-[#1455D9] to-[#0A3C9F] text-white flex items-center justify-center font-black text-base shadow-[0_0_20px_rgba(20,85,217,0.5)] border border-cyan-400/40 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Percent className="w-6 h-6 text-[#FDE68A]" />
          </div>
        </div>

        {/* Conducted Sessions */}
        <div className="lux-kpi-amber lux-specular-sweep p-5 sm:p-6 rounded-3xl flex items-center justify-between relative overflow-hidden group transition-all duration-300">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              <p className="text-[10px] text-amber-200/80 font-black uppercase tracking-widest">Conducted Sessions</p>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white dark:text-amber-200 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              {stats.totalSessions} <span className="text-base font-sans font-bold text-amber-300/70">Hrs</span>
            </p>
            <p className="text-[10px] text-amber-300/80 font-semibold pt-1">
              {stats.totalSessions > 0 ? 'Official Faculty Register' : 'Term Roll Active'}
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#78350F] to-[#D97706] text-white flex items-center justify-center font-black text-base shadow-[0_0_20px_rgba(217,119,6,0.4)] border border-amber-400/40 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Clock className="w-6 h-6 text-[#FFF0B8]" />
          </div>
        </div>

        {/* Present & OD */}
        <div className="lux-kpi-emerald lux-specular-sweep p-5 sm:p-6 rounded-3xl flex items-center justify-between relative overflow-hidden group transition-all duration-300">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
              <p className="text-[10px] text-emerald-200/80 font-black uppercase tracking-widest">Present &amp; OD</p>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white dark:text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
              {stats.presentSessions} <span className="text-base font-sans font-bold text-emerald-300/70">Hrs</span>
            </p>
            <p className="text-[10px] text-emerald-300/90 font-semibold pt-1">
              {stats.odSessions > 0 ? `${stats.presentSessions - stats.odSessions} Reg + ${stats.odSessions} OD` : 'Full Attendance'}
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#059669] text-white flex items-center justify-center font-black text-base shadow-[0_0_20px_rgba(5,150,105,0.4)] border border-emerald-400/40 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <CheckCircle2 className="w-6 h-6 text-[#A7F3D0]" />
          </div>
        </div>

        {/* Absenteeism */}
        <div className="lux-kpi-rose lux-specular-sweep p-5 sm:p-6 rounded-3xl flex items-center justify-between relative overflow-hidden group transition-all duration-300">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#FB7185]" />
              <p className="text-[10px] text-rose-200/80 font-black uppercase tracking-widest">Absenteeism</p>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white dark:text-rose-300 drop-shadow-[0_0_15px_rgba(251,113,133,0.4)]">
              {stats.absentSessions} <span className="text-base font-sans font-bold text-rose-300/70">Hrs</span>
            </p>
            <p className="text-[10px] text-rose-300/90 font-semibold pt-1">
              {stats.totalSessions > 0 ? `${stats.absentSessions} Unexcused` : 'Clean Attendance'}
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#881337] to-[#E11D48] text-white flex items-center justify-center font-black text-base shadow-[0_0_20px_rgba(225,29,72,0.4)] border border-rose-400/40 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <XCircle className="w-6 h-6 text-[#FECDD3]" />
          </div>
        </div>
      </div>

      {/* ── On-Duty & Leave Application Tracker ── */}
      <div className="lux-glass-card rounded-3xl border border-[#D4AF37]/25 dark:border-white/15 shadow-xl overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1748A8]/40 to-cyan-500/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,197,232,0.3)] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-[#071A3D] dark:text-white">OD &amp; Leave Application Tracker</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    Live Institutional Workflow
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Track clearance workflow: Class Advisor Endorsement → HOD Sanction → Attendance Roll Sync
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={fetchTrackedApplications}
                disabled={loadingTracked}
                title="Refresh application status"
                className="p-2.5 px-3.5 rounded-xl border border-white/15 text-slate-600 dark:text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loadingTracked && "animate-spin text-cyan-400")} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setShowODModal(true)}
                className="lux-button-primary px-4 py-2.5 rounded-xl text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-[#FDE68A]" /> Apply OD / Leave
              </button>
            </div>
          </div>

          {/* List of Tracked Requests */}
          {loadingTracked && trackedApplications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#1455D9]" />
              <span>Checking your submitted applications...</span>
            </div>
          ) : trackedApplications.length > 0 ? (
            <div className="space-y-3">
              {trackedApplications.map((app) => {
                const isEndorsed = app.status === 'endorsed_by_advisor'
                const isApproved = app.status === 'approved_by_hod' || app.status === 'approved'
                const isDeclined = app.status === 'rejected_by_advisor' || app.status === 'declined' || app.status === 'rejected'
                const isPending = !isEndorsed && !isApproved && !isDeclined

                return (
                  <div
                    key={app.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-r from-slate-50/70 via-white to-blue-50/20 dark:from-slate-900/60 dark:via-slate-900/80 dark:to-blue-950/20 hover:border-blue-300 dark:hover:border-blue-500/40 transition-all space-y-3.5 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-[#1455D9] dark:text-cyan-400 text-xs font-black shadow-2xs">
                          {app.applicationType}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold bg-slate-100/90 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/10">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>
                            {app.fromDate} → {app.toDate} {app.days ? `(${app.days})` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border',
                            isPending && 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/25 text-amber-800 dark:text-amber-300',
                            isEndorsed && 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500/25 text-[#1455D9] dark:text-cyan-300',
                            isApproved && 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/25 text-emerald-800 dark:text-emerald-300',
                            isDeclined && 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/25 text-rose-800 dark:text-rose-300'
                          )}
                        >
                          {isPending && <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />}
                          {isEndorsed && <CheckCircle2 className="w-3.5 h-3.5 text-[#1455D9] dark:text-cyan-400" />}
                          {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                          {isDeclined && <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                          <span>{app.statusLabel}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setViewingDossier({
                              url: app.dossierUrl,
                              title: `Official Verification Slip · ${user.name}`,
                              studentName: user.name,
                              registerNumber: student.registerNumber,
                            })
                          }
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                          title="View verification slip in popup"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#1455D9] dark:text-cyan-400" />
                          <span>Verification Slip</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-950/50 p-3 sm:p-3.5 rounded-xl border border-slate-200/70 dark:border-white/10 text-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#071A3D] dark:text-white">Event / Activity:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{app.eventName}</span>
                      </div>
                      {app.reason && (
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] italic">
                          "{app.reason}"
                        </div>
                      )}
                      {app.proofs && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Submitted Verification: {app.proofs}</span>
                        </div>
                      )}
                    </div>

                    {/* Stage Progress Visualizer */}
                    <div className="pt-1">
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                        <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>1. Application Submitted</span>
                        </div>
                        <div
                          className={cn(
                            'p-2 rounded-xl border flex items-center justify-center gap-1',
                            isEndorsed || isApproved
                              ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/25 text-emerald-800 dark:text-emerald-300'
                              : isDeclined
                              ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/25 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/25 text-amber-800 dark:text-amber-300'
                          )}
                        >
                          {isEndorsed || isApproved ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : isDeclined ? (
                            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          )}
                          <span>2. Class Advisor Review</span>
                        </div>
                        <div
                          className={cn(
                            'p-2 rounded-xl border flex items-center justify-center gap-1',
                            isApproved
                              ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/25 text-emerald-800 dark:text-emerald-300'
                              : isDeclined
                              ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-white/10 text-slate-400'
                              : 'bg-slate-100/80 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                          )}
                        >
                          {isApproved ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-400" />
                          )}
                          <span>3. HOD Sanction &amp; Roll Sync</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 px-6 text-center rounded-3xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#0A1A3A]/70 via-[#061228]/85 to-[#020612] relative overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-5">
              {/* Subtle gold watermark glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(212,175,55,0.14)_0%,_transparent_70%)] pointer-events-none" />
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#1748A8] via-[#0D2D6C] to-[#D4AF37]/40 border-2 border-[#D4AF37]/60 text-[#FDE68A] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(212,175,55,0.35)] relative z-10">
                <ShieldCheck className="w-8 h-8 text-[#FDE68A]" />
              </div>
              <div className="space-y-1.5 relative z-10">
                <p className="font-black text-base sm:text-lg text-white tracking-wide">
                  Institutional OD &amp; Leave Ledger Synchronized
                </p>
                <p className="text-xs text-blue-200/80 max-w-lg mx-auto leading-relaxed">
                  Submit official event permissions, symposiums, hackathons, sports exemptions, or medical leave. Your submissions undergo live Class Advisor verification and HOD executive sanction.
                </p>
              </div>

              {/* 3-Step Clearance Progression Strip */}
              <div className="flex items-center justify-center gap-2 max-w-md mx-auto text-[10px] font-bold text-slate-300 py-1">
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-400/30 text-cyan-300">1. Apply</span>
                <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300">2. Advisor Verify</span>
                <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">3. HOD Sanction</span>
              </div>

              <div className="pt-2 relative z-10">
                <button
                  onClick={() => setShowODModal(true)}
                  className="lux-button-gold px-5 py-2.5 rounded-2xl text-xs font-black inline-flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#071328]" />
                  <span>Submit Permission Request</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course-Wise Attendance Table: Executive Academic Register */}
      <div className="lux-glass-card rounded-3xl border border-white/15 dark:border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-black text-base sm:text-lg text-[#071A3D] dark:text-white">Subject-Wise Attendance Register</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 dark:text-cyan-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider">
                  Curriculum Roll
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Class period tracking recorded by course faculty in real-time</p>
            </div>
            <span className={cn(
              "px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs self-start sm:self-auto",
              isCompliant
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                : "bg-rose-500/20 text-rose-300 border-rose-400/40"
            )}>
              {stats.totalSessions > 0 ? (isCompliant ? '✓ Good Academic Standing' : '⚠ Below 75% Cut-Off') : 'Semester Enrolled'}
            </span>
          </div>

          {stats.subjectBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 dark:text-slate-400 uppercase text-[10px] font-black tracking-wider bg-white/[0.02]">
                    <th className="py-3 px-3 font-black">Course Code &amp; Name</th>
                    <th className="py-3 font-black">Faculty Instructor</th>
                    <th className="py-3 font-black text-center">Conducted</th>
                    <th className="py-3 font-black text-center">Attended</th>
                    <th className="py-3 font-black text-center">Percentage</th>
                    <th className="py-3 px-3 font-black text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {stats.subjectBreakdown.map((s) => {
                    const isSafe = s.conducted === 0 || s.percent >= 75
                    return (
                      <tr key={s.code} className="hover:bg-blue-500/10 dark:hover:bg-white/[0.04] transition-all group">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-cyan-400 px-2.5 py-1 rounded-xl bg-blue-950/70 border border-cyan-500/30 shadow-xs">
                              {s.code}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-white group-hover:text-cyan-300 transition-colors">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-300 font-medium">{s.faculty}</td>
                        <td className="py-3.5 text-center text-slate-600 dark:text-slate-400 font-mono font-bold">{s.conducted} Hrs</td>
                        <td className="py-3.5 text-center font-bold text-emerald-400 font-mono">{s.attended} Hrs</td>
                        <td className="py-3.5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-black font-mono text-cyan-300 text-sm">{s.percent.toFixed(1)}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all", isSafe ? "bg-emerald-400" : "bg-rose-400")}
                                style={{ width: `${Math.min(s.percent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs",
                            isSafe
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                              : "bg-rose-500/20 text-rose-300 border-rose-400/40"
                          )}>
                            {s.conducted === 0 ? 'Enrolled' : (isSafe ? 'Eligible (Safe)' : 'Shortage (<75%)')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 px-6 text-center rounded-3xl border border-white/10 bg-gradient-to-b from-blue-950/30 via-slate-900/40 to-[#030816] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1748A8]/40 to-cyan-500/30 text-cyan-300 border border-cyan-400/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,232,0.25)]">
                <BookOpen className="w-7 h-7" />
              </div>
              <p className="font-black text-base text-[#071A3D] dark:text-white">Curriculum Matrix Synchronized</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Academic Year 2025-2026 courses active. Individual subject lecture attendance will populate automatically as faculty handlers submit period roll-calls.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Date-Wise Attendance History Log: Chronological Digital Ledger */}
      <div className="lux-glass-card rounded-3xl border border-white/15 dark:border-white/10 shadow-xl overflow-hidden">
        <div className="p-5 sm:p-7 space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-cyan-300 shadow-2xs">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-black text-base sm:text-lg text-[#071A3D] dark:text-white">Date-Wise Attendance History</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chronological day-by-day class attendance marked by faculty handlers</p>
            </div>

            {/* View Switcher & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-slate-900/80 p-1 rounded-2xl border border-white/10 flex items-center gap-1 text-xs font-bold shadow-xs">
                <button
                  type="button"
                  onClick={() => setHistoryViewMode('date_wise')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
                    historyViewMode === 'date_wise'
                      ? "bg-gradient-to-r from-[#1748A8] to-[#1455D9] text-white shadow-[0_0_12px_rgba(20,85,217,0.4)] border border-cyan-400/30"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date-Wise View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryViewMode('flat_table')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
                    historyViewMode === 'flat_table'
                      ? "bg-gradient-to-r from-[#1748A8] to-[#1455D9] text-white shadow-[0_0_12px_rgba(20,85,217,0.4)] border border-cyan-400/30"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>All Periods Table</span>
                </button>
              </div>

              {historyViewMode === 'date_wise' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => expandAllDates(filteredGroupedHistory.map((g) => g.date))}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#1455D9] dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    onClick={collapseAllDates}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    Collapse All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historyDateSearch}
                onChange={(e) => setHistoryDateSearch(e.target.value)}
                placeholder="Search date (e.g. 2026-09-12), subject, faculty..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/15 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1455D9]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter:
              </span>
              {[
                { id: 'all', label: 'All' },
                { id: 'P', label: 'Present' },
                { id: 'OD', label: 'On-Duty' },
                { id: 'A', label: 'Absent' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setHistoryStatusFilter(f.id as any)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    historyStatusFilter === f.id
                      ? "bg-[#071A3D] dark:bg-[#1E66E8] text-white shadow-xs"
                      : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Date-Wise History Cards */}
          {historyViewMode === 'date_wise' ? (
            filteredGroupedHistory.length > 0 ? (
              <div className="space-y-4">
                {filteredGroupedHistory.map((group, idx) => {
                  const isExpanded = expandedDates[group.date] ?? (idx === 0) // Default expand the latest date
                  const isPerfect = group.absent === 0 && group.od === 0 && group.present > 0
                  const hasOD = group.od > 0
                  const hasAbsent = group.absent > 0

                  return (
                    <div
                      key={group.date}
                      className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/70 overflow-hidden transition-all shadow-xs hover:border-blue-300 dark:hover:border-blue-500/40"
                    >
                      {/* Date Header Accordion Bar */}
                      <div
                        onClick={() => toggleDateExpanded(group.date)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors gap-3 border-b border-slate-100 dark:border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex flex-col items-center justify-center font-black text-xs shrink-0 ring-2",
                            isPerfect && "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-800/40",
                            hasOD && "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 ring-amber-100 dark:ring-amber-800/40",
                            hasAbsent && "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 ring-rose-100 dark:ring-rose-800/40"
                          )}>
                            <span className="text-[10px] leading-none uppercase font-bold">
                              {group.date.split('-')[2]}
                            </span>
                            <span className="text-[9px] leading-none font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                              {new Date(group.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm sm:text-base text-[#071A3D] dark:text-white">
                                {group.formattedDate}
                              </h4>
                              <span className="text-[11px] font-mono text-slate-400">({group.date})</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              {group.total} Periods Conducted • <strong className="text-emerald-700 dark:text-emerald-400">{group.present} Present</strong>
                              {group.od > 0 && <> • <strong className="text-amber-700 dark:text-amber-400">{group.od} OD</strong></>}
                              {group.absent > 0 && <> • <strong className="text-rose-700 dark:text-rose-400">{group.absent} Absent</strong></>}
                            </p>
                          </div>
                        </div>

                        {/* Right Summary Badges & Chevron */}
                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border",
                              isPerfect && "bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-500/25",
                              hasOD && "bg-amber-500/10 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-500/25",
                              hasAbsent && "bg-rose-500/10 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border-rose-500/25"
                            )}
                          >
                            {isPerfect && (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>100% Present</span>
                              </>
                            )}
                            {hasOD && !hasAbsent && (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>{group.od} Period OD • {group.pct}%</span>
                              </>
                            )}
                            {hasAbsent && (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                <span>{group.absent} Absent • {group.pct}% Attended</span>
                              </>
                            )}
                          </span>

                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            aria-label="Toggle Date Periods"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#071A3D] dark:text-white" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Periods List */}
                      {isExpanded && (
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 divide-y divide-slate-100 dark:divide-white/5 space-y-2.5">
                          {group.sessions.map((s) => {
                            const isPresent = s.status === 'P'
                            const isOD = s.status === 'OD'
                            const isAbsent = s.status === 'A' || s.status === 'L'

                            return (
                              <div
                                key={s.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/40 transition-all gap-2 text-xs shadow-2xs"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-20 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#071A3D] dark:text-slate-200 font-mono font-bold text-[11px] text-center shrink-0">
                                    {s.hour.split(' ')[0]} {s.hour.split(' ')[1]}
                                  </span>

                                  <div>
                                    <div className="font-bold text-[#071A3D] dark:text-white text-xs sm:text-sm">
                                      <span className="text-blue-600 dark:text-cyan-400 font-mono mr-1.5">{s.subjectCode}</span>
                                      <span>{s.subjectName}</span>
                                    </div>
                                    <div className="text-slate-400 dark:text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                                      <span>Faculty: <strong className="text-slate-600 dark:text-slate-300">{s.takenByName}</strong></span>
                                      <span>•</span>
                                      <span className="font-mono text-slate-500 dark:text-slate-400">{s.hour.includes('(') ? s.hour.substring(s.hour.indexOf('(')) : s.hour}</span>
                                      {s.remarks && (
                                        <>
                                          <span>•</span>
                                          <span className="text-amber-700 dark:text-amber-400 font-medium italic">Remarks: {s.remarks}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="self-end sm:self-center shrink-0">
                                  <span
                                    className={cn(
                                      "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border",
                                      isPresent && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
                                      isOD && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
                                      isAbsent && "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25"
                                    )}
                                  >
                                    {isPresent && (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Present</span>
                                      </>
                                    )}
                                    {isOD && (
                                      <>
                                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        <span>On-Duty (OD)</span>
                                      </>
                                    )}
                                    {isAbsent && (
                                      <>
                                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                        <span>Absent</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">No Attendance Matches Found</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Try clearing your date or status filters above.</p>
              </div>
            )
          ) : (
            /* Flat Table View Option */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/10 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-wider">
                    <th className="py-2.5 font-black">Date</th>
                    <th className="py-2.5 font-black">Subject Code &amp; Name</th>
                    <th className="py-2.5 font-black">Period / Hour</th>
                    <th className="py-2.5 font-black">Faculty</th>
                    <th className="py-2.5 font-black text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                  {stats.history.map((h) => {
                    const isPresent = h.status === 'P'
                    const isOD = h.status === 'OD'
                    const isAbsent = h.status === 'A' || h.status === 'L'
                    return (
                      <tr key={h.id} className="hover:bg-blue-50/40 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 font-mono font-bold text-[#071A3D] dark:text-white">{h.date}</td>
                        <td className="py-3 text-[#071A3D] dark:text-white font-bold">
                          <span className="text-[#1455D9] dark:text-cyan-400 mr-1.5 font-mono">{h.subjectCode}</span>
                          <span>— {h.subjectName}</span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 font-mono">{h.hour}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{h.takenByName}</td>
                        <td className="py-3 text-right">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                            isPresent && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
                            isOD && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
                            isAbsent && "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25"
                          )}>
                            {isPresent && 'Present'}
                            {isOD && 'On-Duty (OD)'}
                            {isAbsent && 'Absent'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Proof-Based On-Duty (OD) / Leave Modal */}
      <ApplyODPermissionModal
        isOpen={showODModal}
        onClose={() => {
          setShowODModal(false)
          fetchTrackedApplications()
        }}
        student={student}
        userName={user.name}
      />

      {/* Official Leave & OD Verification Slip Popup Modal (No new tab on mobile!) */}
      {viewingDossier && (
        <DossierPopupModal
          isOpen={Boolean(viewingDossier)}
          onClose={() => setViewingDossier(null)}
          dossierUrl={viewingDossier.url}
          title={viewingDossier.title}
          studentName={viewingDossier.studentName}
          registerNumber={viewingDossier.registerNumber}
        />
      )}
    </div>
  )
}

