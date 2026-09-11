'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Users,
  Award,
  Calendar,
  CalendarDays,
  Phone,
  MessageCircle,
  ExternalLink,
  Download,
  Printer,
  ShieldCheck,
  Building,
  GraduationCap,
  Eye,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Paperclip,
  Check,
  X,
  LayoutGrid,
  Table as TableIcon,
  Sun,
  Lightbulb,
  Cpu,
  Trophy,
  ArrowRight,
  Info,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { AdvisorODReviewModal } from '@/components/od/AdvisorODReviewModal'

export interface TrackedApplication {
  id: string
  studentName: string
  registerNumber: string
  year: number
  semester: number
  section: string
  batch?: string
  residencyStatus?: string
  busNo?: string | null
  parentPhone?: string
  attendanceRate: number
  applicationType: string
  fromDate: string
  toDate: string
  days: string
  eventName: string
  reason: string
  proofs?: string
  files?: any[]
  status: string
  statusLabel: string
  statusBadge: string
  remarks?: string
  createdAt: string
  dossierUrl: string
}

interface ODApplicationsDashboardViewProps {
  viewRole: 'advisor' | 'hod' | 'student' | 'admin'
  advisorClassInfo?: {
    year?: number
    section?: string
    batch?: string
  } | null
}

/**
 * Clean and parse Hackathon multi-round stages from reason text.
 * Replaces unicode replacement diamonds and extracts structured stage cards.
 */
function parseHackathonStages(rawReason: string) {
  if (!rawReason) return null
  const cleaned = rawReason
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '')
    .replace(/Unstop\s*$/i, '')
    .trim()

  const hasRound1 = /round\s*1|ideathon/i.test(cleaned)
  const hasRound2 = /round\s*2|prototype/i.test(cleaned)
  const hasRound3 = /round\s*3|finale|grand finale/i.test(cleaned)

  if (!hasRound1 && !hasRound2 && !hasRound3) {
    return {
      isMultiStage: false,
      cleanedText: cleaned,
      stages: [],
    }
  }

  const round1Match = cleaned.match(/(?:Round 1|1️⃣ Round 1)[^\n]*\n([\s\S]*?)(?=(?:Round 2|2️⃣ Round 2|$))/i)
  const round2Match = cleaned.match(/(?:Round 2|2️⃣ Round 2)[^\n]*\n([\s\S]*?)(?=(?:Round 3|3️⃣ Grand Finale|3️⃣ Round 3|$))/i)
  const round3Match = cleaned.match(/(?:Round 3|3️⃣ Grand Finale|3️⃣ Round 3)[^\n]*\n([\s\S]*?)(?=$)/i)

  return {
    isMultiStage: true,
    cleanedText: cleaned,
    stages: [
      {
        num: 1,
        title: 'Round 1 – Ideathon',
        icon: '💡',
        badge: 'Top 20 Teams Advance',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        summary: 'Problem statement selection, innovation deck (max 12-slide PPT) covering tech stack, feasibility & impact.',
        raw: round1Match ? round1Match[1].trim() : '',
      },
      {
        num: 2,
        title: 'Round 2 – Prototype Development',
        icon: '⚙️',
        badge: 'Top 10 Teams to Finale',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        summary: 'Working prototype development, GitHub source repository, live video demonstration & system presentation.',
        raw: round2Match ? round2Match[1].trim() : '',
      },
      {
        num: 3,
        title: 'Round 3 – Grand Finale',
        icon: '🏆',
        badge: 'Jury Evaluation & Awards',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        summary: 'Live stage presentation before industry judges: 7 minutes pitch + 5 minutes Q&A on architecture & viability.',
        raw: round3Match ? round3Match[1].trim() : '',
      },
    ],
  }
}

export function ODApplicationsDashboardView({
  viewRole,
  advisorClassInfo,
}: ODApplicationsDashboardViewProps) {
  const [applications, setApplications] = useState<TrackedApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [selectedODModal, setSelectedODModal] = useState<any | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  // Decline Dialog State
  const [declineTarget, setDeclineTarget] = useState<TrackedApplication | null>(null)
  const [declineRemarks, setDeclineRemarks] = useState('')

  // Fetch all applications
  const fetchApplications = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true)
      else setLoading(true)

      const res = await fetch(`/api/od-applications?role=${viewRole}`, { cache: 'no-store' })
      const data = await res.json()

      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications)
      } else {
        setApplications([])
      }
    } catch (err) {
      console.error('Error loading OD applications:', err)
      toast.error('Could not load OD applications. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [viewRole])

  // Endorse by Advisor
  const handleAdvisorEndorse = async (app: TrackedApplication) => {
    try {
      setActionLoadingId(app.id)
      const res = await fetch('/api/od-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'endorse',
          registerNumber: app.registerNumber,
          studentName: app.studentName,
          eventName: app.eventName,
          dates: `${app.fromDate} to ${app.toDate}`,
          remarks: 'Verified student credentials, attendance criteria (>75%), and event legitimacy.',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Endorsed ${app.studentName}'s application! Forwarded to HOD for sanction.`)
        // Optimistic update
        setApplications((prev) =>
          prev.map((item) =>
            item.id === app.id
              ? {
                  ...item,
                  status: 'endorsed_by_advisor',
                  statusLabel: 'Endorsed by Advisor (Sent to HOD)',
                  statusBadge: 'endorsed',
                }
              : item
          )
        )
      } else {
        toast.error(data.message || 'Failed to endorse application.')
      }
    } catch {
      toast.error('Network error endorsing application.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Sanction by HOD
  const handleHODSanction = async (app: TrackedApplication) => {
    try {
      setActionLoadingId(app.id)
      const res = await fetch('/api/od-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hod_approve',
          registerNumber: app.registerNumber,
          studentName: app.studentName,
          eventName: app.eventName,
          dates: `${app.fromDate} to ${app.toDate}`,
          remarks: 'Officially sanctioned and OD attendance credited by Head of Department.',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Official sanction granted for ${app.studentName}! OD attendance credited.`)
        // Optimistic update
        setApplications((prev) =>
          prev.map((item) =>
            item.id === app.id
              ? {
                  ...item,
                  status: 'approved_by_hod',
                  statusLabel: 'Sanctioned by HOD',
                  statusBadge: 'approved',
                }
              : item
          )
        )
      } else {
        toast.error(data.message || 'Failed to sanction application.')
      }
    } catch {
      toast.error('Network error sanctioning application.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Submit Decline
  const handleConfirmDecline = async () => {
    if (!declineTarget) return
    if (!declineRemarks.trim()) {
      toast.error('Please specify reason for declining.')
      return
    }

    try {
      setActionLoadingId(declineTarget.id)
      const action = viewRole === 'hod' ? 'hod_reject' : 'reject'
      const res = await fetch('/api/od-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          registerNumber: declineTarget.registerNumber,
          studentName: declineTarget.studentName,
          eventName: declineTarget.eventName,
          dates: `${declineTarget.fromDate} to ${declineTarget.toDate}`,
          remarks: declineRemarks.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Application declined. Notice dispatched to ${declineTarget.studentName}.`)
        const newStatus = viewRole === 'hod' ? 'rejected_by_hod' : 'rejected_by_advisor'
        const newLabel = viewRole === 'hod' ? 'Declined by HOD' : 'Declined by Advisor'
        setApplications((prev) =>
          prev.map((item) =>
            item.id === declineTarget.id
              ? {
                  ...item,
                  status: newStatus,
                  statusLabel: newLabel,
                  statusBadge: 'rejected',
                  remarks: declineRemarks.trim(),
                }
              : item
          )
        )
        setDeclineTarget(null)
        setDeclineRemarks('')
      } else {
        toast.error(data.message || 'Failed to decline application.')
      }
    } catch {
      toast.error('Network error declining application.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = applications.length
    const pendingAdvisor = applications.filter((a) => a.status === 'pending_advisor_approval').length
    const awaitingHOD = applications.filter((a) => a.status === 'endorsed_by_advisor').length
    const approved = applications.filter((a) => a.status === 'approved_by_hod' || a.status === 'approved').length
    const rejected = applications.filter(
      (a) => a.status === 'rejected_by_advisor' || a.status === 'rejected_by_hod' || a.status === 'rejected'
    ).length
    const hackathons = applications.filter((a) => a.applicationType.includes('Hackathon')).length
    return { total, pendingAdvisor, awaitingHOD, approved, rejected, hackathons }
  }, [applications])

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = app.studentName.toLowerCase().includes(q)
        const matchesReg = app.registerNumber.toLowerCase().includes(q)
        const matchesEvent = app.eventName.toLowerCase().includes(q)
        const matchesReason = app.reason?.toLowerCase().includes(q)
        if (!matchesName && !matchesReg && !matchesEvent && !matchesReason) return false
      }

      // Status
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PENDING_ADVISOR' && app.status !== 'pending_advisor_approval') return false
        if (statusFilter === 'AWAITING_HOD' && app.status !== 'endorsed_by_advisor') return false
        if (statusFilter === 'APPROVED' && app.status !== 'approved_by_hod' && app.status !== 'approved') return false
        if (
          statusFilter === 'REJECTED' &&
          app.status !== 'rejected_by_advisor' &&
          app.status !== 'rejected_by_hod' &&
          app.status !== 'rejected'
        )
          return false
      }

      // Type
      if (typeFilter !== 'ALL') {
        if (!app.applicationType.toLowerCase().includes(typeFilter.toLowerCase())) return false
      }

      return true
    })
  }, [applications, searchQuery, statusFilter, typeFilter])

  const getBadgeColor = (type: string) => {
    if (type.includes('Hackathon') || type.includes('Competition')) {
      return 'bg-amber-100 text-amber-900 border-amber-300'
    }
    if (type.includes('Medical')) {
      return 'bg-purple-100 text-purple-900 border-purple-300'
    }
    if (type.includes('Paper') || type.includes('Conference')) {
      return 'bg-blue-100 text-blue-900 border-blue-300'
    }
    if (type.includes('Internship') || type.includes('Project')) {
      return 'bg-indigo-100 text-indigo-900 border-indigo-300'
    }
    return 'bg-rose-100 text-rose-900 border-rose-300'
  }

  return (
    <div className="space-y-5">
      {/* ── Official Institutional Top Bar (Matching Attendance Register Prestige) ── */}
      <div className="bg-[#071A3D] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-blue-900/30 relative overflow-hidden">
        {/* Glow ambient decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1455D9]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E7B93E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Institutional Tags */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-black/40 text-[#E7B93E] text-[10px] font-black uppercase tracking-wider border border-[#E7B93E]/40 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Govt. of Tamil Nadu · EMIS Portal
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/15">
                AU Norm 75% Regs Verified
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                Live Synchronized
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchApplications(true)}
                disabled={refreshing}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/15 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/15 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print Register</span>
              </button>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Student OD &amp; Leave Applications Register
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 font-medium mt-1">
              Class Advisor Section Advisory · Official Institutional Student Representation &amp; Absence Records · B.Tech AI &amp; DS
            </p>
          </div>
        </div>
      </div>

      {/* ── Mode Banner / Class Jurisdiction ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl shadow-md p-3.5 px-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold shrink-0">
            <Sun className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wide">
                Class Advisor Review Desk
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-white/25 text-white">
                Advisory Jurisdiction
              </span>
            </div>
            <p className="text-[11px] text-amber-100 font-medium hidden sm:block">
              Review event requisitions, parent telephone checks, and cumulative attendance before endorsing to HOD
            </p>
          </div>
        </div>

        {advisorClassInfo && (
          <span className="text-xs font-bold bg-black/20 px-3.5 py-1 rounded-xl text-amber-100 border border-white/10 shrink-0">
            Year {advisorClassInfo.year || 2} Section {advisorClassInfo.section || 'A'} (Sem 3)
          </span>
        )}
      </div>

      {/* ── Real-Time KPI Stats Summary ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Roster */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Applications
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#071A3D]">{metrics.total}</span>
              <span className="text-[11px] text-gray-400 font-medium">On File</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Advisor Review */}
        <div
          className={cn(
            'p-4 rounded-2xl border shadow-xs flex items-center justify-between transition-all',
            metrics.pendingAdvisor > 0
              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/40'
              : 'bg-white border-gray-200'
          )}
        >
          <div>
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
              Pending Advisor
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-700">{metrics.pendingAdvisor}</span>
              <span className="text-[11px] text-amber-600 font-bold">Action Needed</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Awaiting HOD */}
        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#1455D9] uppercase tracking-wider block">
              Forwarded to HOD
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#1455D9]">{metrics.awaitingHOD}</span>
              <span className="text-[11px] text-blue-600 font-medium">Endorsed</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-[#1455D9] flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
        </div>

        {/* Sanctioned by HOD */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Sanctioned &amp; Credited
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">{metrics.approved}</span>
              <span className="text-[11px] text-emerald-700 font-medium">Attendance OK</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Search, Filters & View Mode Controls ─────────────────────────── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, register number, or event title..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 focus:bg-white focus:border-[#1455D9] outline-none transition-all cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Hackathon">Technical Hackathon / Competition OD</option>
              <option value="Paper">Paper Presentation / Conference</option>
              <option value="Internship">Internship / Project Work</option>
              <option value="Medical">Medical Leave (ML)</option>
              <option value="Personal">Personal / Emergency Leave</option>
            </select>

            {/* View Mode Toggle */}
            <div className="bg-gray-100 p-1 rounded-2xl flex items-center gap-1 border border-gray-200 shrink-0">
              <button
                onClick={() => setViewMode('cards')}
                className={cn(
                  'p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
                  viewMode === 'cards'
                    ? 'bg-white text-[#1455D9] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                )}
                title="Detailed Dossier Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
                  viewMode === 'table'
                    ? 'bg-white text-[#1455D9] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                )}
                title="Master Register Table"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Applications', count: metrics.total },
            { id: 'PENDING_ADVISOR', label: 'Pending Advisor', count: metrics.pendingAdvisor },
            { id: 'AWAITING_HOD', label: 'Awaiting HOD', count: metrics.awaitingHOD },
            { id: 'APPROVED', label: 'Sanctioned', count: metrics.approved },
            { id: 'REJECTED', label: 'Declined', count: metrics.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer',
                statusFilter === tab.id
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px]',
                  statusFilter === tab.id ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Applications Content ─────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-gray-200 shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1455D9] animate-spin" />
          <p className="text-xs text-gray-500 font-bold">Retrieving official OD &amp; Leave applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-gray-200 shadow-xs flex flex-col items-center justify-center gap-3 text-center">
          <FileText className="w-12 h-12 text-gray-300" />
          <h3 className="text-base font-bold text-gray-800">No OD &amp; Leave Applications Found</h3>
          <p className="text-xs text-gray-500 max-w-md">
            {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'No applications match your active filters. Try clearing filters or search term.'
              : 'There are currently no active OD or leave applications on record for this section.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* ── Detailed Cards View ────────────────────────────────────────── */
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const isAttendanceEligible = app.attendanceRate >= 75.0
            const isAdvisorPending = app.status === 'pending_advisor_approval'
            const isHODPending = app.status === 'endorsed_by_advisor'
            const isSanctioned = app.status === 'approved_by_hod' || app.status === 'approved'
            const isRejected = app.status === 'rejected_by_advisor' || app.status === 'rejected_by_hod' || app.status === 'rejected'

            const parsedScope = parseHackathonStages(app.reason)
            const isExpanded = expandedCardId === app.id

            return (
              <div
                key={app.id}
                className={cn(
                  'bg-white rounded-3xl border transition-all shadow-xs hover:shadow-md relative overflow-hidden',
                  isAdvisorPending
                    ? 'border-amber-300 border-l-6 border-l-amber-500'
                    : isHODPending
                    ? 'border-indigo-300 border-l-6 border-l-indigo-600'
                    : isSanctioned
                    ? 'border-emerald-300 border-l-6 border-l-emerald-600'
                    : 'border-rose-200 border-l-6 border-l-rose-500'
                )}
              >
                {/* 1. Header Bar: Student Particulars + Live Status Badge */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-gray-50/50 to-white">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Student Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                      {app.studentName.charAt(0)}
                    </div>

                    {/* Name, Roll & Badges */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-[#071A3D] leading-tight">
                          {app.studentName}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-mono font-bold border border-gray-200">
                          {app.registerNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
                          Year {app.year} · Sec {app.section}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2.5 text-xs text-gray-500 font-semibold flex-wrap">
                        <span>
                          {app.residencyStatus || 'Day Scholar'}{' '}
                          {app.busNo ? `(Bus Route ${app.busNo})` : ''}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          Attendance:
                          <strong
                            className={cn(
                              'font-black',
                              isAttendanceEligible ? 'text-emerald-600' : 'text-rose-600'
                            )}
                          >
                            {app.attendanceRate}%
                          </strong>
                          {isAttendanceEligible ? (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full font-bold">
                              Eligible (&ge;75%)
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-full font-bold">
                              Defaulter Alert
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={cn(
                        'px-3.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border shadow-2xs',
                        isAdvisorPending
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : isHODPending
                          ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                          : isSanctioned
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      )}
                    >
                      {isAdvisorPending && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
                      {isHODPending && <Building className="w-3.5 h-3.5 text-indigo-600" />}
                      {isSanctioned && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{app.statusLabel}</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* 2. Structured Requisition Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Event & Category Card */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-1.5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                        Permission Type &amp; Event
                      </span>
                      <span
                        className={cn(
                          'inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black border',
                          getBadgeColor(app.applicationType)
                        )}
                      >
                        {app.applicationType}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-600 shrink-0" />
                        <h4 className="text-sm font-black text-[#071A3D] truncate">
                          {app.eventName || 'Academic Permission'}
                        </h4>
                      </div>
                    </div>

                    {/* Inclusive Dates & Duration */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-1.5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                        Inclusive Dates &amp; Days
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1455D9] flex items-center justify-center shrink-0">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-[#071A3D] block">
                            {app.fromDate} &rarr; {app.toDate}
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-md border border-blue-200 inline-block">
                            Duration: {app.days}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Parent Contact & Quick Verification */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-1.5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                        Parent Contact &amp; Verification
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`tel:+91${(app.parentPhone || '6381366088').replace(/\D/g, '')}`}
                          className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs font-bold hover:bg-gray-100 flex items-center gap-1.5 shadow-2xs transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{app.parentPhone || '6381366088'}</span>
                        </a>
                        <a
                          href={`https://wa.me/91${(app.parentPhone || '6381366088').replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                            `Dear Parent, This is from V.S.B. Engineering College regarding your ward ${app.studentName}'s OD/Leave request for "${app.eventName}".`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            e.preventDefault()
                            const num = (app.parentPhone || '6381366088').replace(/\D/g, '').slice(-10)
                            const msg = encodeURIComponent(`Dear Parent, This is from V.S.B. Engineering College regarding your ward ${app.studentName}'s OD/Leave request for "${app.eventName}".`)
                            window.open(`https://wa.me/91${num}?text=${msg}`, '_blank')
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* 3. Event Representation Justification & Multi-Round Steps */}
                  {parsedScope?.isMultiStage ? (
                    /* Multi-Stage Hackathon Roadmap View */
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-blue-100 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-black text-[#071A3D] uppercase tracking-wider">
                            Hackathon Competition Stages &amp; Representation Scope
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedCardId(isExpanded ? null : app.id)}
                          className="text-[11px] font-bold text-[#1455D9] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Show Less' : 'Full Criteria & Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* 3 Stage Step Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {parsedScope.stages.map((stg) => (
                          <div
                            key={stg.num}
                            className="bg-white rounded-xl p-3.5 border border-gray-200/80 shadow-2xs space-y-2 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                                  <span>{stg.icon}</span>
                                  <span>{stg.title}</span>
                                </span>
                              </div>
                              <span className={cn('inline-block px-2 py-0.5 rounded text-[10px] font-black border', stg.badgeColor)}>
                                {stg.badge}
                              </span>
                              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                {stg.summary}
                              </p>
                            </div>

                            {isExpanded && stg.raw && (
                              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-700 whitespace-pre-line leading-normal bg-gray-50 p-2 rounded-lg font-mono">
                                {stg.raw}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : app.reason ? (
                    /* Clean Standard Reason Quote Card */
                    <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-200/80 space-y-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                        Student Requisition Justification
                      </span>
                      <p className="text-xs text-gray-800 leading-relaxed font-medium">
                        &ldquo;{parsedScope?.cleanedText || app.reason}&rdquo;
                      </p>
                    </div>
                  ) : null}

                  {/* 4. Official Lifecycle Stepper */}
                  <div className="bg-white rounded-2xl p-3.5 border border-gray-200/80 space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                      Application Lifecycle &amp; Authorization Pipeline
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {/* Step 1 */}
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-950 block text-[11px]">1. Student Requisition</span>
                          <span className="text-[10px] text-emerald-700">Submitted with proofs</span>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div
                        className={cn(
                          'p-2.5 rounded-xl border flex items-center gap-2',
                          isAdvisorPending
                            ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400/40'
                            : isRejected && app.status === 'rejected_by_advisor'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-emerald-50 border-emerald-200'
                        )}
                      >
                        {isAdvisorPending ? (
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                        ) : isRejected && app.status === 'rejected_by_advisor' ? (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-gray-900 block text-[11px]">2. Advisor Review</span>
                          <span className="text-[10px] text-gray-600">
                            {isAdvisorPending
                              ? 'Pending Roll Call Review'
                              : isRejected && app.status === 'rejected_by_advisor'
                              ? 'Declined by Advisor'
                              : 'Endorsed by Advisor'}
                          </span>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div
                        className={cn(
                          'p-2.5 rounded-xl border flex items-center gap-2',
                          isHODPending
                            ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400/40'
                            : isSanctioned
                            ? 'bg-emerald-50 border-emerald-200'
                            : isRejected && app.status === 'rejected_by_hod'
                            ? 'bg-rose-50 border-rose-200'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        )}
                      >
                        {isHODPending ? (
                          <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : isSanctioned ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-gray-900 block text-[11px]">3. HOD Authorization</span>
                          <span className="text-[10px] text-gray-600">
                            {isSanctioned ? 'Sanction Granted' : isHODPending ? 'Awaiting Sanction' : 'Pending Advisor'}
                          </span>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div
                        className={cn(
                          'p-2.5 rounded-xl border flex items-center gap-2',
                          isSanctioned
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        )}
                      >
                        {isSanctioned ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-gray-900 block text-[11px]">4. Roll Call Sync</span>
                          <span className="text-[10px] text-gray-600">
                            {isSanctioned ? 'OD Attendance Credited' : 'Pending Sanction'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Documents & Action Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Official Verification Dossier */}
                      <Link
                        href={app.dossierUrl}
                        target="_blank"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#1455D9] text-white text-xs font-black flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>Official Verification Dossier</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </Link>

                      {/* Audit & Review Modal */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedODModal({
                            id: app.id,
                            title: `[OD Application] ${app.studentName} (${app.registerNumber})`,
                            message: app.reason || app.eventName,
                            registerNumber: app.registerNumber,
                          })
                        }
                        className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-600" />
                        <span>Audit &amp; Review Modal</span>
                      </button>
                    </div>

                    {/* Workflow Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Advisor Controls */}
                      {(viewRole === 'advisor' || viewRole === 'admin') && isAdvisorPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => setDeclineTarget(app)}
                            disabled={actionLoadingId === app.id}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAdvisorEndorse(app)}
                            disabled={actionLoadingId === app.id}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === app.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Endorse &amp; Forward to HOD</span>
                          </button>
                        </>
                      )}

                      {/* Already Endorsed Notice for Advisor */}
                      {isHODPending && (
                        <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-indigo-600" />
                          <span>Endorsed by Advisor · Forwarded to HOD</span>
                        </span>
                      )}

                      {/* HOD Controls */}
                      {(viewRole === 'hod' || viewRole === 'admin') && isHODPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => setDeclineTarget(app)}
                            disabled={actionLoadingId === app.id}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleHODSanction(app)}
                            disabled={actionLoadingId === app.id}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === app.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            <span>Sanction &amp; Credit Attendance</span>
                          </button>
                        </>
                      )}

                      {/* Sanction Granted Notice */}
                      {isSanctioned && (
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Sanction Granted · Attendance Credited</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Master Register Table View ──────────────────────────────────── */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 pl-5">#</th>
                  <th className="p-3.5">Student Particulars</th>
                  <th className="p-3.5">Class / Sec</th>
                  <th className="p-3.5">Category &amp; Event</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5 text-center">Att. %</th>
                  <th className="p-3.5">Parent Contact</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredApplications.map((app, idx) => {
                  const isEligible = app.attendanceRate >= 75
                  return (
                    <tr key={app.id} className="hover:bg-blue-50/30 transition-all">
                      <td className="p-3.5 pl-5 font-bold text-gray-400">{idx + 1}</td>
                      <td className="p-3.5">
                        <div>
                          <span className="font-bold text-[#071A3D] text-xs sm:text-sm block">
                            {app.studentName}
                          </span>
                          <span className="text-[11px] font-mono text-gray-500">{app.registerNumber}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[11px]">
                          Yr {app.year} · Sec {app.section}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div>
                          <span className="font-bold text-[#071A3D] block">{app.eventName}</span>
                          <span className="text-[10px] text-gray-500">{app.applicationType}</span>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-gray-800 block text-[11px]">
                          {app.fromDate} &rarr; {app.toDate}
                        </span>
                        <span className="text-[10px] text-blue-700 font-bold">{app.days}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[11px] font-black',
                            isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          )}
                        >
                          {app.attendanceRate}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        <a
                          href={`tel:${app.parentPhone || '6381366088'}`}
                          className="text-gray-700 font-mono hover:text-[#1455D9] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{app.parentPhone || '6381366088'}</span>
                        </a>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-black',
                            app.status === 'pending_advisor_approval'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : app.status === 'endorsed_by_advisor'
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                              : app.status === 'approved_by_hod' || app.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          )}
                        >
                          {app.statusLabel}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={app.dossierUrl}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-blue-50 text-[#1455D9] hover:bg-blue-100 transition-all"
                            title="View Verification Dossier"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedODModal({
                                id: app.id,
                                title: `[OD Application] ${app.studentName} (${app.registerNumber})`,
                                message: app.reason || app.eventName,
                                registerNumber: app.registerNumber,
                              })
                            }
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
                            title="Open Audit Modal"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Decline Confirmation Modal ───────────────────────────────────── */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 bg-[#071126]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Decline OD Application</h3>
                <p className="text-xs text-gray-500">
                  {declineTarget.studentName} ({declineTarget.registerNumber})
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Please enter the official reason for declining this request. This remark will be dispatched to the
              student and permanently logged.
            </p>

            <textarea
              rows={3}
              value={declineRemarks}
              onChange={(e) => setDeclineRemarks(e.target.value)}
              placeholder="E.g., Incomplete competition brochure, attendance below 75% threshold, or overlapping exam date."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeclineTarget(null)
                  setDeclineRemarks('')
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={actionLoadingId === declineTarget.id || !declineRemarks.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Advisor Audit & Review Modal Integration ─────────────────────── */}
      {selectedODModal && (
        <AdvisorODReviewModal
          isOpen={Boolean(selectedODModal)}
          onClose={() => setSelectedODModal(null)}
          notification={selectedODModal}
          onStatusUpdated={(notifId, status) => {
            fetchApplications()
          }}
        />
      )}
    </div>
  )
}
