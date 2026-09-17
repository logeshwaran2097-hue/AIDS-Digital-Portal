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
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="lux-sapphire-card relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-[#D4AF37]/30 shadow-lux-sapphire flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-radial from-[#D4AF37]/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#030712] text-[10px] font-black uppercase tracking-wider shadow-lux-gold">
              Biometric Attendance Sync
            </span>
            <span className="text-xs text-blue-200 font-medium">· Anna University 75% Rule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Student Attendance &amp; Leave Log</h1>
          <p className="text-xs sm:text-sm text-blue-100/85 mt-1 font-medium">
            {user.name} ({student.registerNumber}) · Year {student.year} · Semester {student.semester} (Section {student.section})
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={() => setShowODModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" /> Apply On-Duty / Leave
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#f3d37a] to-[#c59c27] text-[#030712] text-xs font-black flex items-center gap-1.5 transition-all shadow-lux-gold shrink-0 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-[#030712]" /> Download Report (PDF)
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="lux-glass-card lux-specular-sweep p-5 rounded-3xl border border-blue-500/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Attendance</p>
            <p className="text-3xl font-black text-[#1E66E8] mt-1">{stats.percentage.toFixed(1)}%</p>
            <p className={cn("text-[10px] font-bold mt-0.5", isCompliant ? "text-emerald-500" : "text-rose-500")}>
              {stats.totalSessions > 0 ? (isCompliant ? 'Compliant (>75% Req)' : 'Attendance Shortage (<75%)') : 'Term Enrolled'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0E3A94] to-[#1E66E8] text-white flex items-center justify-center font-black text-base shadow-lux-sapphire border border-white/20">
            <Percent className="w-6 h-6 text-[#D4AF37]" />
          </div>
        </div>

        <div className="lux-glass-card lux-specular-sweep p-5 rounded-3xl border border-white/10 shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Conducted Sessions</p>
          <p className="text-3xl font-black text-[#071A3D] dark:text-white mt-1">{stats.totalSessions} <span className="text-sm font-semibold text-slate-400">Sessions</span></p>
          <p className="text-[10px] text-slate-400 mt-0.5">{stats.totalSessions > 0 ? 'Total Logged by Staff' : 'Term Started'}</p>
        </div>

        <div className="lux-glass-card lux-specular-sweep p-5 rounded-3xl border border-emerald-500/20 shadow-xs">
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Present &amp; OD</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.presentSessions} <span className="text-sm font-semibold text-emerald-600/70">Sessions</span></p>
          <p className="text-[10px] text-emerald-600/80 font-medium mt-0.5">
            {stats.odSessions > 0 ? `${stats.presentSessions - stats.odSessions} Regular + ${stats.odSessions} OD` : 'Regular Present'}
          </p>
        </div>

        <div className="lux-glass-card lux-specular-sweep p-5 rounded-3xl border border-rose-500/20 shadow-xs">
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Absenteeism</p>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.absentSessions} <span className="text-sm font-semibold text-rose-600/70">Sessions</span></p>
          <p className="text-[10px] text-rose-600/80 font-medium mt-0.5">
            {stats.totalSessions > 0 ? `${stats.absentSessions} Unexcused` : 'Zero Absences'}
          </p>
        </div>
      </div>

      {/* ── On-Duty & Leave Application Tracker ── */}
      <div className="lux-glass-card rounded-3xl border border-white/10 shadow-xs overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1455D9] shadow-2xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-[#071A3D]">OD &amp; Leave Application Tracker</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-bold">
                    Live Status
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Track clearance workflow: Class Advisor Endorsement → HOD Sanction → Attendance Roll Sync
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={fetchTrackedApplications}
                disabled={loadingTracked}
                title="Refresh application status"
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-[#1455D9] hover:bg-blue-50 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loadingTracked && "animate-spin text-[#1455D9]")} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setShowODModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0f44b3] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Apply OD / Leave
              </button>
            </div>
          </div>

          {/* List of Tracked Requests */}
          {loadingTracked && trackedApplications.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
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
                    className="p-4 rounded-2xl border border-gray-200/80 bg-gradient-to-r from-slate-50/50 via-white to-blue-50/20 hover:border-blue-200 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[#1455D9] text-xs font-black shadow-2xs">
                          {app.applicationType}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {app.fromDate} → {app.toDate} {app.days ? `(${app.days})` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5',
                            isPending && 'bg-amber-50 border border-amber-200 text-amber-800',
                            isEndorsed && 'bg-blue-50 border border-blue-200 text-[#1455D9]',
                            isApproved && 'bg-emerald-50 border border-emerald-200 text-emerald-800',
                            isDeclined && 'bg-red-50 border border-red-200 text-red-800'
                          )}
                        >
                          {isPending && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
                          {isEndorsed && <CheckCircle2 className="w-3.5 h-3.5 text-[#1455D9]" />}
                          {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {isDeclined && <XCircle className="w-3.5 h-3.5 text-red-600" />}
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
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          title="View verification slip in popup"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#1455D9]" />
                          <span>Verification Slip</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-gray-100 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#071A3D]">Event / Activity:</span>
                        <span className="text-gray-700 font-medium">{app.eventName}</span>
                      </div>
                      {app.reason && (
                        <div className="text-gray-500 text-[11px] italic">
                          "{app.reason}"
                        </div>
                      )}
                      {app.proofs && (
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-0.5">
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                          <span>Submitted Verification: {app.proofs}</span>
                        </div>
                      )}
                    </div>

                    {/* Stage Progress Visualizer */}
                    <div className="pt-1">
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>1. Application Submitted</span>
                        </div>
                        <div
                          className={cn(
                            'p-2 rounded-xl border flex items-center justify-center gap-1',
                            isEndorsed || isApproved
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : isDeclined
                              ? 'bg-red-50 border-red-200 text-red-800'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          )}
                        >
                          {isEndorsed || isApproved ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : isDeclined ? (
                            <XCircle className="w-3 h-3 text-red-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>2. Class Advisor Review</span>
                        </div>
                        <div
                          className={cn(
                            'p-2 rounded-xl border flex items-center justify-center gap-1',
                            isApproved
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : isDeclined
                              ? 'bg-gray-100 border-gray-200 text-gray-400'
                              : 'bg-gray-50 border-gray-200 text-gray-500'
                          )}
                        >
                          {isApproved ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-gray-400" />
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
            <div className="py-8 text-center text-xs text-gray-500 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 space-y-2">
              <CalendarDays className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-700">No On-Duty or Leave Applications Submitted Yet</p>
              <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                When you apply for On-Duty (OD) or leave, you can track class advisor endorsement and HOD sanction status right here in real-time.
              </p>
              <button
                onClick={() => setShowODModal(true)}
                className="mt-2 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] border border-blue-200 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Submit Permission Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Course-Wise Attendance Table */}
      <div className="lux-glass-card rounded-3xl border border-white/10 shadow-xs">
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-black text-base text-[#071A3D]">Subject-Wise Attendance Register</h3>
              <p className="text-xs text-gray-400">Class period tracking recorded by course faculty in real-time</p>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold",
              isCompliant ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
              {stats.totalSessions > 0 ? (isCompliant ? 'Good Academic Standing' : 'Below 75% Cut-Off') : 'Semester Enrolled'}
            </span>
          </div>

          {stats.subjectBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5 font-bold">Course Code &amp; Name</th>
                    <th className="py-2.5 font-bold">Faculty Instructor</th>
                    <th className="py-2.5 font-bold text-center">Conducted</th>
                    <th className="py-2.5 font-bold text-center">Attended</th>
                    <th className="py-2.5 font-bold text-center">Percentage</th>
                    <th className="py-2.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {stats.subjectBreakdown.map((s) => {
                    const isSafe = s.conducted === 0 || s.percent >= 75
                    return (
                      <tr key={s.code} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#1455D9] px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/60">
                              {s.code}
                            </span>
                            <span className="font-bold text-[#071A3D]">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600">{s.faculty}</td>
                        <td className="py-3 text-center text-gray-500">{s.conducted} Hrs</td>
                        <td className="py-3 text-center font-bold text-green-700">{s.attended} Hrs</td>
                        <td className="py-3 text-center">
                          <span className="font-black text-[#1455D9]">{s.percent.toFixed(1)}%</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                            isSafe ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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
            <div className="py-8 text-center text-xs text-gray-400">
              No subjects registered in the current curriculum.
            </div>
          )}
        </div>
      </div>

      {/* Date-Wise Attendance History Log */}
      <div className="lux-glass-card rounded-3xl border border-white/10 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-7 space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1455D9]" />
                <h3 className="font-black text-base sm:text-lg text-[#071A3D]">Date-Wise Attendance History</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Chronological day-by-day class attendance marked by faculty handlers</p>
            </div>

            {/* View Switcher & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setHistoryViewMode('date_wise')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                    historyViewMode === 'date_wise'
                      ? "bg-white text-[#071A3D] shadow-xs"
                      : "text-gray-500 hover:text-[#071A3D]"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date-Wise View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryViewMode('flat_table')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                    historyViewMode === 'flat_table'
                      ? "bg-white text-[#071A3D] shadow-xs"
                      : "text-gray-500 hover:text-[#071A3D]"
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
                    className="px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:text-[#1455D9] hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    onClick={collapseAllDates}
                    className="px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    Collapse All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/70 p-3 rounded-2xl border border-gray-100 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historyDateSearch}
                onChange={(e) => setHistoryDateSearch(e.target.value)}
                placeholder="Search date (e.g. 2026-09-12), subject, faculty..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-gray-400 mr-1 flex items-center gap-1">
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
                      ? "bg-[#071A3D] text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
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
                      className="rounded-2xl border border-gray-200/90 bg-white overflow-hidden transition-all shadow-xs hover:border-blue-200"
                    >
                      {/* Date Header Accordion Bar */}
                      <div
                        onClick={() => toggleDateExpanded(group.date)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80 transition-colors gap-3 border-b border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex flex-col items-center justify-center font-black text-xs shrink-0 ring-2",
                            isPerfect && "bg-emerald-50 text-emerald-700 ring-emerald-100",
                            hasOD && "bg-amber-50 text-amber-700 ring-amber-100",
                            hasAbsent && "bg-red-50 text-red-700 ring-red-100"
                          )}>
                            <span className="text-[10px] leading-none uppercase font-bold">
                              {group.date.split('-')[2]}
                            </span>
                            <span className="text-[9px] leading-none font-semibold text-slate-500 mt-0.5">
                              {new Date(group.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm sm:text-base text-[#071A3D]">
                                {group.formattedDate}
                              </h4>
                              <span className="text-[11px] font-mono text-gray-400">({group.date})</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              {group.total} Periods Conducted • <strong className="text-emerald-700">{group.present} Present</strong>
                              {group.od > 0 && <> • <strong className="text-amber-700">{group.od} OD</strong></>}
                              {group.absent > 0 && <> • <strong className="text-red-700">{group.absent} Absent</strong></>}
                            </p>
                          </div>
                        </div>

                        {/* Right Summary Badges & Chevron */}
                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5",
                              isPerfect && "bg-emerald-50 text-emerald-800 border border-emerald-200",
                              hasOD && "bg-amber-50 text-amber-900 border border-amber-200",
                              hasAbsent && "bg-red-50 text-red-900 border border-red-200"
                            )}
                          >
                            {isPerfect && (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>100% Present</span>
                              </>
                            )}
                            {hasOD && !hasAbsent && (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>{group.od} Period OD • {group.pct}%</span>
                              </>
                            )}
                            {hasAbsent && (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                                <span>{group.absent} Absent • {group.pct}% Attended</span>
                              </>
                            )}
                          </span>

                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle Date Periods"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#071A3D]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Periods List */}
                      {isExpanded && (
                        <div className="p-4 bg-slate-50/40 divide-y divide-gray-100 space-y-2">
                          {group.sessions.map((s) => {
                            const isPresent = s.status === 'P'
                            const isOD = s.status === 'OD'
                            const isAbsent = s.status === 'A' || s.status === 'L'

                            return (
                              <div
                                key={s.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 rounded-xl bg-white border border-gray-100 hover:border-blue-200 transition-all gap-2 text-xs"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-20 px-2 py-1 rounded-lg bg-gray-100 text-[#071A3D] font-mono font-bold text-[11px] text-center shrink-0">
                                    {s.hour.split(' ')[0]} {s.hour.split(' ')[1]}
                                  </span>

                                  <div>
                                    <div className="font-bold text-[#071A3D] text-xs sm:text-sm">
                                      <span className="text-blue-700 font-mono mr-1.5">{s.subjectCode}</span>
                                      <span>{s.subjectName}</span>
                                    </div>
                                    <div className="text-gray-400 text-[11px] flex items-center gap-2 mt-0.5">
                                      <span>Faculty: <strong className="text-gray-600">{s.takenByName}</strong></span>
                                      <span>•</span>
                                      <span className="font-mono text-gray-500">{s.hour.includes('(') ? s.hour.substring(s.hour.indexOf('(')) : s.hour}</span>
                                      {s.remarks && (
                                        <>
                                          <span>•</span>
                                          <span className="text-amber-700 font-medium italic">Remarks: {s.remarks}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="self-end sm:self-center shrink-0">
                                  <span
                                    className={cn(
                                      "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1",
                                      isPresent && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                                      isOD && "bg-amber-100 text-amber-900 border border-amber-200",
                                      isAbsent && "bg-red-100 text-red-800 border border-red-200"
                                    )}
                                  >
                                    {isPresent && (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Present</span>
                                      </>
                                    )}
                                    {isOD && (
                                      <>
                                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                        <span>On-Duty (OD)</span>
                                      </>
                                    )}
                                    {isAbsent && (
                                      <>
                                        <XCircle className="w-3.5 h-3.5 text-red-600" />
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
              <div className="py-12 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-gray-600 text-sm">No Attendance Matches Found</p>
                <p className="text-[11px] text-gray-400 mt-1">Try clearing your date or status filters above.</p>
              </div>
            )
          ) : (
            /* Flat Table View Option */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5 font-bold">Date</th>
                    <th className="py-2.5 font-bold">Subject Code &amp; Name</th>
                    <th className="py-2.5 font-bold">Period / Hour</th>
                    <th className="py-2.5 font-bold">Faculty</th>
                    <th className="py-2.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {stats.history.map((h) => {
                    const isPresent = h.status === 'P'
                    const isOD = h.status === 'OD'
                    const isAbsent = h.status === 'A' || h.status === 'L'
                    return (
                      <tr key={h.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 font-mono font-bold text-[#071A3D]">{h.date}</td>
                        <td className="py-3 text-[#071A3D] font-bold">
                          {h.subjectCode} — {h.subjectName}
                        </td>
                        <td className="py-3 text-gray-600">{h.hour}</td>
                        <td className="py-3 text-gray-600">{h.takenByName}</td>
                        <td className="py-3 text-right">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                            isPresent && "bg-green-100 text-green-800",
                            isOD && "bg-amber-100 text-amber-800",
                            isAbsent && "bg-red-100 text-red-800"
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

