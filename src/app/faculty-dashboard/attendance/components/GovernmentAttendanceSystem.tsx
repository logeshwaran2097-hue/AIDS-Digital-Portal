'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Save,
  Search,
  ShieldCheck,
  Printer,
  Info,
  Sun,
  BookOpen,
  RefreshCw,
  Lock,
  Unlock,
  GraduationCap,
  Calendar,
  BarChart3,
  Loader2,
  Smartphone,
  Table,
  Award,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────
interface StudentRecord {
  id: string
  registerNumber: string
  name: string
  gender: 'M' | 'F'
  section: string
  year: number
  semester: number
  cumulativeAttendance: number
  status: 'P' | 'A' | 'OD' | 'ML' | 'L'
  remarks: string
}

interface Subject {
  id: string
  code: string
  name: string
  credits: number
}

interface ClassOption {
  year: number
  section: string
  semester: number
  label: string
}

interface ExistingSession {
  id: string
  isLocked: boolean
  takenByName: string
}

type AttendanceMode = 'morning' | 'subject'
type StatusFilter = 'ALL' | 'P' | 'A' | 'OD' | 'DEF'
type ViewMode = 'card' | 'table'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const HOUR_OPTIONS = [
  'Hour 1 (09:00 - 09:50)',
  'Hour 2 (09:50 - 10:40)',
  'Hour 3 (10:55 - 11:45)',
  'Hour 4 (11:45 - 12:35)',
  'Hour 5 (01:25 - 02:15)',
  'Hour 6 (02:15 - 03:05)',
  'Hour 7 (03:15 - 04:05)',
  'Full Lab Session (3 Hours)',
]

const REMARK_OPTIONS = [
  '',
  'Uninformed Absence',
  'Medical Leave (Certificate Provided)',
  'Symposium / Hackathon OD',
  'Sports / NCC / NSS OD',
  'Placement / Internship Drive',
  'Family Emergency / Permission',
  'Late Entry / Gate Pass',
]

export function GovernmentAttendanceSystem() {
  // Metadata
  const [mode, setMode] = useState<AttendanceMode>('morning')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classOptions, setClassOptions] = useState<ClassOption[]>([])
  const [isAdvisor, setIsAdvisor] = useState(false)
  const [advisorClass, setAdvisorClass] = useState<ClassOption | null>(null)

  // Session fields
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassOption | null>(null)
  const [hour, setHour] = useState(HOUR_OPTIONS[0])
  const [periodType, setPeriodType] = useState<'Theory' | 'Practical' | 'Tutorial'>('Theory')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])

  // Real-time live clock
  const [currentTime, setCurrentTime] = useState<string>('')

  // Attendance data
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [existingSession, setExistingSession] = useState<ExistingSession | null>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [showLegend, setShowLegend] = useState(false)

  // Auto-detect view mode based on screen width on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) {
        setViewMode('table')
      } else {
        setViewMode('card')
      }
    }
  }, [])

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // ── Load faculty metadata on mount ────────────────────────────────────────
  useEffect(() => {
    fetch('/api/attendance/subjects')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSubjects(data.subjects || [])
          setClassOptions(data.classOptions || [])
          setIsAdvisor(data.isAdvisor || false)

          if (data.advisorClass) {
            const ac: ClassOption = {
              year: data.advisorClass.year,
              section: data.advisorClass.section,
              semester: data.advisorClass.semester,
              label: `Year ${data.advisorClass.year} - Section ${data.advisorClass.section} (Sem ${data.advisorClass.semester})`,
            }
            setAdvisorClass(ac)
            setSelectedClass(ac)
          } else if (data.classOptions?.length > 0) {
            setSelectedClass(data.classOptions[0])
          }

          if (data.subjects?.length > 0) {
            setSelectedSubject(data.subjects[0])
          }
        }
      })
      .catch(console.error)
  }, [])

  // ── Load students when class/subject/date/hour changes ───────────────────
  const loadStudents = useCallback(async () => {
    if (!selectedClass) return
    setLoading(true)
    setDataLoaded(false)
    try {
      const params = new URLSearchParams({
        year: String(selectedClass.year),
        section: selectedClass.section,
        semester: String(selectedClass.semester),
        date,
        sessionType: mode,
        ...(mode === 'subject' && selectedSubject ? { subjectCode: selectedSubject.code, hour } : {}),
      })
      const res = await fetch(`/api/attendance?${params}`)
      const data = await res.json()
      if (data.success) {
        setStudents(data.students || [])
        setExistingSession(data.existingSession || null)
        setIsLocked(data.existingSession?.isLocked || false)
        setDataLoaded(true)
        setLastSyncedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
      } else {
        showToast('error', data.message || 'Failed to load student data')
      }
    } catch {
      showToast('error', 'Network error — could not fetch students')
    } finally {
      setLoading(false)
    }
  }, [selectedClass, date, mode, selectedSubject, hour])

  // Auto-load when dependencies change
  useEffect(() => {
    if (selectedClass) {
      loadStudents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, date, mode, selectedSubject, hour])

  // ── Real-time stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = students.length
    const present = students.filter((s) => s.status === 'P').length
    const absent = students.filter((s) => s.status === 'A').length
    const od = students.filter((s) => s.status === 'OD').length
    const ml = students.filter((s) => s.status === 'ML').length
    const late = students.filter((s) => s.status === 'L').length
    const effectivePresent = present + od + ml
    const percentage = total > 0 ? ((effectivePresent / total) * 100).toFixed(1) : '0'
    const defaulters = students.filter((s) => s.cumulativeAttendance < 75)
    return { total, present, absent, od, ml, late, percentage, defaulters }
  }, [students])

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchFilter.toLowerCase().trim()
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.registerNumber.toLowerCase().includes(q)
      if (!matchesSearch) return false
      if (statusFilter === 'P') return s.status === 'P'
      if (statusFilter === 'A') return s.status === 'A'
      if (statusFilter === 'OD') return s.status === 'OD' || s.status === 'ML'
      if (statusFilter === 'DEF') return s.cumulativeAttendance < 75
      return true
    })
  }, [students, searchFilter, statusFilter])

  // ── Actions ────────────────────────────────────────────────────────────────
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15)
      } catch {}
    }
  }

  const setStudentStatus = (id: string, status: 'P' | 'A' | 'OD' | 'ML' | 'L') => {
    if (isLocked) return
    triggerHaptic()
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
  }

  const setStudentRemarks = (id: string, remarks: string) => {
    if (isLocked) return
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, remarks } : s)))
  }

  const markAll = (status: 'P' | 'A') => {
    if (isLocked) return
    triggerHaptic()
    setStudents((prev) => prev.map((s) => ({ ...s, status })))
    showToast('info', `Marked all ${students.length} students as ${status === 'P' ? 'Present' : 'Absent'}`)
  }

  const showToast = (type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSave = async (lock = false) => {
    if (!selectedClass) return showToast('error', 'Please select a class first')
    if (mode === 'subject' && !selectedSubject) return showToast('error', 'Please select a subject')
    if (students.length === 0) return showToast('error', 'No students found for this class')

    setSaving(true)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: mode,
          subjectCode: selectedSubject?.code,
          subjectName: selectedSubject?.name,
          year: selectedClass.year,
          section: selectedClass.section,
          semester: selectedClass.semester,
          academicYear: '2025-2026',
          hour: mode === 'subject' ? hour : undefined,
          periodType,
          date,
          students: students.map((s) => ({
            id: s.id,
            registerNumber: s.registerNumber,
            name: s.name,
            gender: s.gender,
            status: s.status,
            remarks: s.remarks,
            cumulativeAttendance: s.cumulativeAttendance,
          })),
          isLocked: lock,
        }),
      })
      const data = await res.json()
      if (data.success) {
        if (lock) setIsLocked(true)
        setLastSyncedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
        showToast(
          'success',
          lock
            ? 'Attendance locked & dispatched to University & Parent Portal ✓'
            : 'Real-time attendance saved successfully ✓'
        )
      } else {
        showToast('error', data.message || 'Failed to save attendance')
      }
    } catch {
      showToast('error', 'Network error — could not save to portal')
    } finally {
      setSaving(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-20 sm:pb-8">

      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            'fixed top-4 right-4 left-4 sm:left-auto z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border backdrop-blur-md',
            toast.type === 'success'
              ? 'bg-[#071A3D]/95 border-emerald-500/40 text-white'
              : toast.type === 'error'
              ? 'bg-red-950/95 border-red-500/40 text-white'
              : 'bg-[#0A2540]/95 border-cyan-400/40 text-white'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-cyan-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* ── Government Header Banner ────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#061838] via-[#0A2656] to-[#114BB8] text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-white/10 relative overflow-hidden">
        {/* Background decorative glowing accents */}
        <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/15 via-blue-500/5 to-transparent pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#F4C430]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Top Bar: Official Seals & Live Real-Time Clock */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider shadow-xs">
                <Building2 className="w-3 h-3" />
                Govt. Of Tamil Nadu · EMIS Portal
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-[10px] font-bold border border-cyan-400/30">
                <ShieldCheck className="w-3 h-3 text-cyan-300" />
                AU Norm 75% Regs
              </span>
              {isAdvisor && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/25 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  <Award className="w-3 h-3" />
                  Class Advisor
                </span>
              )}
            </div>

            {/* Live Real-time Sync & Clock */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-200/90 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="font-sans text-[10px] font-bold text-white uppercase tracking-wider hidden sm:inline">
                Live IST:
              </span>
              <span className="font-bold">{currentTime || '09:00:00 AM'}</span>
            </div>
          </div>

          {/* Title & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Online Real-Time Attendance Register
              </h1>
              <p className="text-xs text-blue-100/80 mt-1 flex items-center gap-2 flex-wrap">
                <span>
                  {mode === 'morning'
                    ? '☀ Morning Roll Call · Section Advisory'
                    : `📘 Subject: ${selectedSubject?.code || 'AD2301'} — ${selectedSubject?.name || 'Data Structures'}`}
                </span>
                <span className="text-blue-300">•</span>
                <span className="text-[#F4C430] font-semibold">B.Tech AI &amp; DS</span>
                {lastSyncedAt && (
                  <>
                    <span className="text-blue-300">•</span>
                    <span className="text-emerald-300 text-[11px]">Synced at {lastSyncedAt}</span>
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowLegend(true)}
                className="px-3 py-2 rounded-xl bg-[#F4C430]/20 hover:bg-[#F4C430]/30 active:scale-95 text-[#F4C430] text-xs font-bold flex items-center gap-1.5 transition-all border border-[#F4C430]/30 shadow-xs"
                title="View Attendance Status Meanings & Guidelines"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Code Meanings</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/15 shadow-xs"
                title="Print Official Attendance Sheet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print Roll</span>
              </button>
              <button
                type="button"
                onClick={loadStudents}
                disabled={loading}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/15 shadow-xs"
                title="Refresh student list"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mode Switcher (Morning Roll Call vs Subject-Wise) ───────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-1.5 flex gap-1.5">
        <button
          type="button"
          onClick={() => {
            setMode('morning')
            setIsLocked(false)
            setDataLoaded(false)
          }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all',
            mode === 'morning'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
          )}
        >
          <Sun className="w-4 h-4 shrink-0" />
          <span>Morning Roll Call</span>
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-bold hidden sm:inline',
              mode === 'morning' ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            Advisor
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('subject')
            setIsLocked(false)
            setDataLoaded(false)
          }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all',
            mode === 'subject'
              ? 'bg-[#1455D9] text-white shadow-md shadow-[#1455D9]/20'
              : 'text-gray-600 hover:bg-blue-50 hover:text-[#1455D9]'
          )}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>Subject Period</span>
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-bold hidden sm:inline',
              mode === 'subject' ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            Faculty
          </span>
        </button>
      </div>

      {/* ── Real-Time KPI Stats Summary ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Total Strength */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Roster</span>
            <Users className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#071A3D]">{stats.total}</span>
            <span className="text-[10px] text-gray-400 block">Enrolled</span>
          </div>
        </div>

        {/* Present (P) */}
        <div className="bg-emerald-50/70 p-3 sm:p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Present (P)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600">{stats.present}</span>
            <span className="text-[10px] font-bold text-emerald-700">
              {stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>

        {/* Absent (A) */}
        <div className="bg-red-50/70 p-3 sm:p-4 rounded-2xl border border-red-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Absent (A)</span>
            <XCircle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-red-600">{stats.absent}</span>
            <span className="text-[10px] font-bold text-red-700">
              {stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>

        {/* On Duty (OD / ML) */}
        <div className="bg-blue-50/70 p-3 sm:p-4 rounded-2xl border border-blue-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#1455D9] uppercase tracking-wider">OD / Leave</span>
            <Award className="w-3.5 h-3.5 text-[#1455D9]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#1455D9]">{stats.od + stats.ml}</span>
            <span className="text-[10px] text-blue-600 font-bold">Duty/ML</span>
          </div>
        </div>

        {/* Session Rate */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Session Rate</span>
            <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={cn(
                'text-xl sm:text-2xl font-black',
                parseFloat(stats.percentage) >= 75 ? 'text-emerald-600' : 'text-amber-600'
              )}
            >
              {stats.percentage}%
            </span>
            <span className="text-[9px] text-gray-400">Min 75%</span>
          </div>
        </div>

        {/* Defaulters (<75%) */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'DEF' ? 'ALL' : 'DEF')}
          className={cn(
            'p-3 sm:p-4 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all',
            statusFilter === 'DEF'
              ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400'
              : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/80'
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider',
                statusFilter === 'DEF' ? 'text-white' : 'text-amber-900'
              )}
            >
              Defaulters (&lt;75%)
            </span>
            <AlertTriangle
              className={cn('w-3.5 h-3.5', statusFilter === 'DEF' ? 'text-white' : 'text-amber-600')}
            />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={cn(
                'text-xl sm:text-2xl font-black',
                statusFilter === 'DEF' ? 'text-white' : 'text-amber-700'
              )}
            >
              {stats.defaulters.length}
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold',
                statusFilter === 'DEF' ? 'text-amber-100' : 'text-amber-600'
              )}
            >
              Condonation
            </span>
          </div>
        </div>
      </div>

      {/* ── Selection / Filter Controls Card ────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div
          className={cn(
            'grid gap-3',
            mode === 'subject'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6'
              : 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4'
          )}
        >
          {/* Class Selector */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#1455D9]" /> Class / Section
            </label>
            <select
              value={selectedClass ? `${selectedClass.year}-${selectedClass.section}-${selectedClass.semester}` : ''}
              onChange={(e) => {
                const opt = classOptions.find(
                  (c) => `${c.year}-${c.section}-${c.semester}` === e.target.value
                )
                setSelectedClass(opt || null)
                setDataLoaded(false)
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white transition-all"
            >
              {classOptions.length === 0 && <option value="">No classes found</option>}
              {classOptions.map((c) => (
                <option key={`${c.year}-${c.section}-${c.semester}`} value={`${c.year}-${c.section}-${c.semester}`}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject (only in subject mode) */}
          {mode === 'subject' && (
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#1455D9]" /> Subject &amp; Code
              </label>
              <select
                value={selectedSubject?.code || ''}
                onChange={(e) => {
                  const sub = subjects.find((s) => s.code === e.target.value)
                  setSelectedSubject(sub || null)
                  setDataLoaded(false)
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white transition-all truncate"
              >
                {subjects.length === 0 && <option value="">No subjects assigned</option>}
                {subjects.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Hour / Period (only in subject mode) */}
          {mode === 'subject' && (
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1455D9]" /> Period / Hour
              </label>
              <select
                value={hour}
                onChange={(e) => {
                  setHour(e.target.value)
                  setDataLoaded(false)
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white transition-all"
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Session Type */}
          {mode === 'subject' && (
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-1 block">Type</label>
              <div className="flex bg-gray-100 p-1 rounded-xl h-[38px]">
                {(['Theory', 'Practical', 'Tutorial'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPeriodType(t)}
                    className={cn(
                      'flex-1 text-[10px] font-bold rounded-lg transition-all',
                      periodType === t ? 'bg-white text-[#1455D9] shadow-xs' : 'text-gray-500 hover:text-gray-800'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#1455D9]" /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setDataLoaded(false)
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white transition-all"
            />
          </div>

          {/* Load Students Button (if in morning mode or right-aligned) */}
          {mode === 'morning' && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={loadStudents}
                disabled={loading || !selectedClass}
                className="w-full px-4 py-2.5 bg-[#1455D9] hover:bg-[#0e44b5] disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {loading ? 'Fetching...' : 'Load Roster'}
              </button>
            </div>
          )}
        </div>

        {/* Existing session warning */}
        {existingSession && (
          <div
            className={cn(
              'flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl text-xs font-semibold border',
              existingSession.isLocked
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            )}
          >
            <div className="flex items-center gap-2">
              {existingSession.isLocked ? (
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-[#1455D9] shrink-0" />
              )}
              <span>
                {existingSession.isLocked
                  ? `Attendance locked by ${existingSession.takenByName}. Unlock to make adjustments.`
                  : `Previously saved session by ${existingSession.takenByName} loaded.`}
              </span>
            </div>
            {existingSession.isLocked && (
              <button
                type="button"
                onClick={() => setIsLocked(false)}
                className="self-start sm:self-auto px-3 py-1 bg-amber-600 text-white rounded-xl text-[11px] font-bold hover:bg-amber-700 transition-colors flex items-center gap-1 shadow-xs"
              >
                <Unlock className="w-3 h-3" /> Unlock Register
              </button>
            )}
          </div>
        )}

        {/* ── Action Toolbar: Quick Mark, Filter Tabs, Search & View Switcher ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {/* Quick Mark Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => markAll('P')}
              disabled={isLocked || !dataLoaded}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark All Present</span>
            </button>
            <button
              type="button"
              onClick={() => markAll('A')}
              disabled={isLocked || !dataLoaded}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <XCircle className="w-4 h-4" />
              <span>Mark All Absent</span>
            </button>
          </div>

          {/* Filter Pills, Search and View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {(
                [
                  { id: 'ALL', label: 'All', count: stats.total },
                  { id: 'P', label: 'P', count: stats.present },
                  { id: 'A', label: 'A', count: stats.absent },
                  { id: 'OD', label: 'OD/ML', count: stats.od + stats.ml },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id as StatusFilter)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1',
                    statusFilter === f.id
                      ? 'bg-white text-[#1455D9] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <span>{f.label}</span>
                  <span className="text-[9px] opacity-75 font-mono">({f.count})</span>
                </button>
              ))}
            </div>

            {/* View Mode Toggle (Mobile Cards vs Desktop Table) */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={cn(
                  'p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1',
                  viewMode === 'card'
                    ? 'bg-white text-[#1455D9] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                )}
                title="Mobile Card View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1',
                  viewMode === 'table'
                    ? 'bg-white text-[#1455D9] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                )}
                title="Table Register View"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-48 min-w-[160px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search Reg No / Name..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white transition-all"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Student Attendance Roster Display ──────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Roster Header */}
        <div className="p-3.5 sm:p-4 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldCheck className="w-5 h-5 text-[#1455D9]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
              {mode === 'morning'
                ? `Morning Roll Call — ${selectedClass?.label || 'Selected Class'}`
                : `${selectedSubject?.code || 'AD2301'} — ${selectedSubject?.name || 'Subject'} (${hour})`}
            </span>
            {isLocked && (
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 font-semibold">
            {loading ? 'Fetching students...' : `Showing ${filteredStudents.length} of ${students.length} students`}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#1455D9] animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading official student roll...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && students.length === 0 && (
          <div className="p-10 sm:p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Users className="w-12 h-12 opacity-30" />
            <p className="text-sm font-bold text-gray-600">No students found</p>
            <p className="text-xs text-center max-w-sm">
              Please select a class and click &quot;Load Roster&quot; to fetch students registered for this course/section.
            </p>
          </div>
        )}

        {/* ── CARD VIEW (Optimized for Mobile, fast thumbs & big tap targets) ── */}
        {!loading && students.length > 0 && viewMode === 'card' && (
          <div className="p-3 sm:p-4 space-y-3 bg-gray-50/50">
            {filteredStudents.map((s, idx) => {
              const isDefaulter = s.cumulativeAttendance < 75
              return (
                <div
                  key={s.id}
                  className={cn(
                    'bg-white rounded-2xl border p-3.5 transition-all shadow-xs flex flex-col gap-3',
                    s.status === 'P'
                      ? 'border-emerald-200 hover:border-emerald-300 border-l-4 border-l-emerald-500'
                      : s.status === 'A'
                      ? 'border-rose-200 hover:border-rose-300 border-l-4 border-l-rose-500 bg-rose-50/20'
                      : s.status === 'OD'
                      ? 'border-blue-200 hover:border-blue-300 border-l-4 border-l-blue-500 bg-blue-50/20'
                      : s.status === 'ML'
                      ? 'border-purple-200 hover:border-purple-300 border-l-4 border-l-purple-500 bg-purple-50/20'
                      : 'border-amber-200 hover:border-amber-300 border-l-4 border-l-amber-500'
                  )}
                >
                  {/* Top Row: Roll No, Name, Cumulative % Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-xs',
                          s.gender === 'F' ? 'bg-purple-600' : 'bg-[#1455D9]'
                        )}
                      >
                        {s.name.charAt(0)}
                      </div>

                      {/* Name & Roll */}
                      <div className="min-w-0">
                        <div className="font-bold text-[#071A3D] text-sm leading-tight truncate">
                          {s.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 font-mono">
                          <span className="font-bold text-gray-700">{s.registerNumber}</span>
                          <span>•</span>
                          <span>Sec {s.section || 'A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cumulative % Badge */}
                    <div className="shrink-0">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs border',
                          s.cumulativeAttendance >= 80
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : s.cumulativeAttendance >= 75
                            ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                        )}
                        title={`Cumulative attendance: ${s.cumulativeAttendance}%`}
                      >
                        {s.cumulativeAttendance}%
                        {isDefaulter && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Large Tactile Real-Time Status Selector Buttons */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {(
                      [
                        { id: 'P', label: 'Present' },
                        { id: 'A', label: 'Absent' },
                        { id: 'OD', label: 'OD' },
                        { id: 'ML', label: 'ML' },
                        { id: 'L', label: 'Late' },
                      ] as const
                    ).map((st) => {
                      const isSelected = s.status === st.id
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStudentStatus(s.id, st.id)}
                          disabled={isLocked}
                          className={cn(
                            'py-2 px-1 rounded-xl font-black text-xs transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5 disabled:cursor-not-allowed',
                            isSelected
                              ? st.id === 'P'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.03] ring-2 ring-emerald-400'
                                : st.id === 'A'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.03] ring-2 ring-rose-400'
                                : st.id === 'OD'
                                ? 'bg-[#1455D9] text-white shadow-md shadow-blue-600/30 scale-[1.03] ring-2 ring-blue-400'
                                : st.id === 'ML'
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-[1.03] ring-2 ring-purple-400'
                                : 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-[1.03] ring-2 ring-amber-400'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          <span className="text-xs font-black">{st.id}</span>
                          <span className="text-[9px] font-medium opacity-85 leading-none hidden xs:inline sm:inline">
                            {st.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Bottom Row: Remarks Selector (Shown on card) */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
                      Remark:
                    </span>
                    <select
                      value={s.remarks}
                      onChange={(e) => setStudentRemarks(s.id, e.target.value)}
                      disabled={isLocked}
                      className={cn(
                        'flex-1 bg-gray-50 border rounded-xl px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#1455D9] disabled:cursor-not-allowed',
                        s.status === 'A' && !s.remarks
                          ? 'border-rose-300 text-rose-800 bg-rose-50/40'
                          : 'border-gray-200 text-gray-700'
                      )}
                    >
                      {REMARK_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r || '— Select remark (Optional) —'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── TABLE VIEW (Full Register for Desktop / Tablet) ───────────────── */}
        {!loading && students.length > 0 && viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#071A3D] text-white">
                <tr>
                  <th className="py-3 px-4 font-bold w-[70px]">#</th>
                  <th className="py-3 px-4 font-bold w-[140px]">Register No</th>
                  <th className="py-3 px-4 font-bold min-w-[180px]">Student Name</th>
                  <th className="py-3 px-3 font-bold text-center w-[110px]">Cumulative %</th>
                  <th className="py-3 px-4 font-bold text-center w-[280px]">Real-Time Status</th>
                  <th className="py-3 px-4 font-bold min-w-[200px]">Official Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((s, idx) => {
                  const isDefaulter = s.cumulativeAttendance < 75
                  return (
                    <tr
                      key={s.id}
                      className={cn(
                        'hover:bg-blue-50/50 transition-colors',
                        s.status === 'A'
                          ? 'bg-rose-50/30'
                          : s.status === 'OD' || s.status === 'ML'
                          ? 'bg-blue-50/25'
                          : idx % 2 === 0
                          ? 'bg-white'
                          : 'bg-gray-50/30'
                      )}
                    >
                      {/* S.No */}
                      <td className="py-3 px-4 font-mono text-gray-500 font-bold text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Roll No */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#071A3D] font-mono text-xs">{s.registerNumber}</div>
                        <div className="text-[10px] text-gray-400">Sec {s.section || 'A'}</div>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-xs',
                              s.gender === 'F' ? 'bg-purple-600' : 'bg-[#1455D9]'
                            )}
                          >
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#071A3D] text-xs leading-tight">{s.name}</div>
                            <div className="text-[10px] text-gray-400">B.Tech AI &amp; DS</div>
                          </div>
                        </div>
                      </td>

                      {/* Cumulative % */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] border',
                            s.cumulativeAttendance >= 80
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : s.cumulativeAttendance >= 75
                              ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                          )}
                        >
                          {s.cumulativeAttendance}%
                          {isDefaulter && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        </span>
                      </td>

                      {/* Status Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {(['P', 'A', 'OD', 'ML', 'L'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setStudentStatus(s.id, st)}
                              disabled={isLocked}
                              className={cn(
                                'px-2.5 py-1.5 rounded-lg font-black text-xs transition-all disabled:cursor-not-allowed active:scale-95',
                                s.status === st
                                  ? st === 'P'
                                    ? 'bg-emerald-600 text-white shadow-xs scale-105 ring-1 ring-emerald-400'
                                    : st === 'A'
                                    ? 'bg-rose-600 text-white shadow-xs scale-105 ring-1 ring-rose-400'
                                    : st === 'OD'
                                    ? 'bg-[#1455D9] text-white shadow-xs scale-105 ring-1 ring-blue-400'
                                    : st === 'ML'
                                    ? 'bg-purple-600 text-white shadow-xs scale-105 ring-1 ring-purple-400'
                                    : 'bg-amber-500 text-white shadow-xs scale-105 ring-1 ring-amber-400'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              )}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-4">
                        <select
                          value={s.remarks}
                          onChange={(e) => setStudentRemarks(s.id, e.target.value)}
                          disabled={isLocked}
                          className={cn(
                            'w-full bg-gray-50 border rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#1455D9] disabled:cursor-not-allowed',
                            s.status === 'A' && !s.remarks
                              ? 'border-rose-300 text-rose-800 bg-rose-50/40'
                              : 'border-gray-200 text-gray-700'
                          )}
                        >
                          {REMARK_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r || '— Select remark —'}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer Submission Bar ────────────────────────────────────────── */}
        {students.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Info className="w-4 h-4 text-[#1455D9] shrink-0" />
              <span>
                Absentees ({stats.absent}) will be auto-dispatched via SMS/Email to Parent &amp; HOD Dashboard upon Lock.
              </span>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isLocked ? (
                <button
                  type="button"
                  onClick={() => setIsLocked(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold border bg-amber-100 text-amber-900 border-amber-300 flex items-center justify-center gap-1.5 hover:bg-amber-200 transition-colors shadow-xs"
                >
                  <Unlock className="w-4 h-4" /> Unlock Register
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSave(false)}
                    disabled={saving || !dataLoaded}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold border bg-white text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={saving || !dataLoaded}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-[#1455D9] hover:bg-[#0e44b5] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-[#1455D9]/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Submit &amp; Lock to Portal
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Defaulters Warning Panel ────────────────────────────────────────── */}
      {stats.defaulters.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-black text-amber-900">
              Attendance Defaulters Alert ({stats.defaulters.length} students below 75% norm)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {stats.defaulters.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-amber-200 rounded-2xl p-3 flex items-center gap-3 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[#071A3D] text-xs truncate">{s.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{s.registerNumber}</div>
                </div>
                <span className="shrink-0 px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[11px] font-black border border-rose-200">
                  {s.cumulativeAttendance}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Status Guide Strip ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1455D9] shrink-0" />
          <span className="text-xs font-bold text-[#071A3D]">Attendance Status Meanings:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> P = Present (வருகை)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600" /> A = Absent (வராமை)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#1455D9]" /> OD = On Duty (பணி நிமித்தம்)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-600" /> ML = Medical Leave (மருத்துவ விடுப்பு)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-600" /> L = Late (தாமதம்)
          </span>
          <button
            type="button"
            onClick={() => setShowLegend(true)}
            className="text-[11px] text-[#1455D9] font-bold hover:underline ml-auto"
          >
            View Full Guide →
          </button>
        </div>
      </div>

      {/* ── Status Guide & Meaning Details Modal ────────────────────────────── */}
      {showLegend && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#071A3D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#22C7E8]" />
                <div>
                  <h3 className="text-base font-black">Official Attendance Status Guide</h3>
                  <p className="text-[11px] text-blue-200">Anna University &amp; Govt. of Tamil Nadu DOTE Norms</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs divide-y divide-gray-100">
              {/* P */}
              <div className="pt-2 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  P
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-emerald-800 text-sm">Present (வருகை)</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">100% Credit</span>
                  </div>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    Student was physically present and attentive in the classroom/lab during this hour. Counts towards the minimum 75% attendance quota.
                  </p>
                </div>
              </div>

              {/* A */}
              <div className="pt-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  A
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-rose-800 text-sm">Absent (வராமை)</h4>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px]">Parent SMS Alert</span>
                  </div>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    Student was absent without prior sanctioned on-duty permission. Dispatches automated SMS/Email alert to Parent and alerts HOD Dashboard.
                  </p>
                </div>
              </div>

              {/* OD */}
              <div className="pt-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1455D9] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  OD
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#1455D9] text-sm">On Duty (பணி நிமித்தம்)</h4>
                    <span className="px-2 py-0.5 bg-blue-100 text-[#1455D9] rounded-full font-bold text-[10px]">100% Credit</span>
                  </div>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    Student was officially representing the Department/College in Symposia, Hackathons, Paper Presentations, Sports, NSS/NCC, or Placement Drives with approval.
                  </p>
                </div>
              </div>

              {/* ML */}
              <div className="pt-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  ML
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-purple-800 text-sm">Medical Leave (மருத்துவ விடுப்பு)</h4>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-bold text-[10px]">Condonation Valid</span>
                  </div>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    Absence due to severe medical illness supported by registered medical practitioner certificate. Valid for 65%–74% condonation approval.
                  </p>
                </div>
              </div>

              {/* L */}
              <div className="pt-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  L
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-800 text-sm">Late Entry (தாமதம்)</h4>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">Gate Pass</span>
                  </div>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    Student entered class late with an authorized gate pass or genuine transport/health delay.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="px-5 py-2 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Understood / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
