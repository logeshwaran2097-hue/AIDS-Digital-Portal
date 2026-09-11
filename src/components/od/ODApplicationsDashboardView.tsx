'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
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
  Send,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Paperclip,
  Check,
  X,
  Layers,
  LayoutGrid,
  Table as TableIcon,
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
    <div className="space-y-6">
      {/* ── Official Institutional Top Bar ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A3D] via-[#0D2D6C] to-[#1455D9] text-white p-6 sm:p-8 shadow-xl border border-blue-900/40">
        {/* Glow ambient decorations */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold tracking-wider uppercase border border-white/15 backdrop-blur-md">
                Govt. of Tamil Nadu · EMIS Integration
              </span>
              <span className="px-3 py-1 rounded-full bg-[#E7B93E]/20 text-[#FCE182] text-[11px] font-black tracking-wide border border-[#E7B93E]/40 flex items-center gap-1.5 backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-[#E7B93E]" />
                Official OD &amp; Leave Registry
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student OD &amp; Leave Applications Register
            </h1>
            <p className="text-blue-100/80 text-xs sm:text-sm font-medium leading-relaxed">
              Official institutional portal for reviewing, auditing, and sanctioning student On-Duty (OD)
              permissions, hackathon representations, paper presentations, internships, and medical leave applications.
            </p>

            {advisorClassInfo && (
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-amber-200">
                <GraduationCap className="w-4 h-4 text-[#E7B93E]" />
                <span>
                  Allocated Advisory Section:{' '}
                  <strong>
                    Year {advisorClassInfo.year || 2} - Section {advisorClassInfo.section || 'A'}
                  </strong>{' '}
                  ({advisorClassInfo.batch || 'Batch 2025-2029'})
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => fetchApplications(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all backdrop-blur-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all backdrop-blur-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Register</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Metric Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Applications
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#071A3D]">{metrics.total}</span>
              <span className="text-[11px] text-gray-400 font-medium">On Record</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Advisor Review */}
        <div
          className={cn(
            'bg-white rounded-2xl p-4 sm:p-5 border shadow-xs flex items-center justify-between transition-all',
            metrics.pendingAdvisor > 0
              ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/20'
              : 'border-gray-200'
          )}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                Pending Advisor
              </span>
              {metrics.pendingAdvisor > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-700">{metrics.pendingAdvisor}</span>
              <span className="text-[11px] text-amber-600 font-semibold">Requires Review</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Forwarded to HOD */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
              Awaiting HOD Sanction
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-700">{metrics.awaitingHOD}</span>
              <span className="text-[11px] text-indigo-600 font-medium">Endorsed by Advisor</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Officially Sanctioned */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-xs flex items-center justify-between bg-emerald-50/20">
          <div>
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
              Sanctioned &amp; Credited
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">{metrics.approved}</span>
              <span className="text-[11px] text-emerald-600 font-medium">OD Granted</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Search, Filters & View Mode Controls ─────────────────────────── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, register no, event title, or reason..."
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

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 focus:bg-white focus:border-[#1455D9] outline-none transition-all cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Hackathon">Hackathon / Competition OD</option>
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
              : 'There are currently no active OD or leave applications submitted by students in this section.'}
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

            return (
              <div
                key={app.id}
                className={cn(
                  'bg-white rounded-3xl border p-5 sm:p-6 transition-all shadow-xs hover:shadow-md space-y-4 relative overflow-hidden',
                  isAdvisorPending
                    ? 'border-amber-300 border-l-6 border-l-amber-500 bg-gradient-to-r from-amber-50/30 to-white'
                    : isHODPending
                    ? 'border-indigo-300 border-l-6 border-l-indigo-600 bg-gradient-to-r from-indigo-50/25 to-white'
                    : isSanctioned
                    ? 'border-emerald-300 border-l-6 border-l-emerald-600 bg-gradient-to-r from-emerald-50/25 to-white'
                    : 'border-rose-200 border-l-6 border-l-rose-500'
                )}
              >
                {/* 1. Student Particulars & Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-start gap-3.5">
                    {/* Student Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1455D9] to-[#0D2D6C] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                      {app.studentName.charAt(0)}
                    </div>

                    {/* Student Particulars */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-[#071A3D]">{app.studentName}</h3>
                        <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-800 text-xs font-mono font-bold border border-gray-200">
                          {app.registerNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
                          Year {app.year} · Sec {app.section} (Sem {app.semester})
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 font-semibold flex-wrap">
                        <span>
                          Residency:{' '}
                          <strong className="text-gray-700">
                            {app.residencyStatus || 'Day Scholar'}{' '}
                            {app.busNo ? `(Bus Route ${app.busNo})` : ''}
                          </strong>
                        </span>
                        <span>·</span>
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

                {/* 2. Application Particulars & Multi-Round Scope Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/80">
                  {/* Event & Category */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                      Permission Category &amp; Event
                    </span>
                    <div className="space-y-1">
                      <span
                        className={cn(
                          'inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-black border',
                          getBadgeColor(app.applicationType)
                        )}
                      >
                        {app.applicationType}
                      </span>
                      <h4 className="text-sm font-black text-[#071A3D] flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{app.eventName || 'Academic Representation'}</span>
                      </h4>
                    </div>
                  </div>

                  {/* Schedule & Duration */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                      Duration &amp; Inclusive Dates
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1455D9] flex items-center justify-center shrink-0">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#071A3D] block">
                          {app.fromDate} &rarr; {app.toDate}
                        </span>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-md border border-blue-200 inline-block mt-0.5">
                          Total {app.days}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Verification & Contacts */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                      Parent Contact &amp; Verification
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`tel:${app.parentPhone || '6381366088'}`}
                        className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs font-bold hover:bg-gray-100 flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{app.parentPhone || '6381366088'}</span>
                      </a>
                      <a
                        href={`https://wa.me/91${app.parentPhone?.replace(/\D/g, '') || '6381366088'}?text=${encodeURIComponent(
                          `Dear Parent, This is from V.S.B. Engineering College regarding your ward ${app.studentName}'s OD/Leave application for "${app.eventName}".`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Multi-Stage Reason Breakdown */}
                {app.reason && (
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-1.5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Student Representation Justification &amp; Event Stages
                    </span>
                    <div className="whitespace-pre-line leading-relaxed text-gray-800 bg-gray-50/60 p-3 rounded-xl border border-gray-100 font-mono text-[11px]">
                      {app.reason}
                    </div>
                  </div>
                )}

                {/* 4. Official Verification Dossier & Action Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Verification Dossier Button */}
                    <Link
                      href={app.dossierUrl}
                      target="_blank"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#1455D9] text-white text-xs font-black flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Official Verification Dossier</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </Link>

                    {/* Review In Modal */}
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
                      className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-600" />
                      <span>Audit &amp; Review Modal</span>
                    </button>
                  </div>

                  {/* Role-Based Workflow Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Class Advisor Action: Endorse & Forward */}
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

                    {/* HOD Action: Final Sanction */}
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
                          <span>Sanction &amp; Credit OD Attendance</span>
                        </button>
                      </>
                    )}

                    {/* Completed Badges */}
                    {isSanctioned && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Official Sanction Granted</span>
                      </span>
                    )}
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
