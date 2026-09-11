'use client'

import React, { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Bus,
  Home,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  X,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react'

export interface DBStudent {
  id: string
  registerNumber: string
  name: string
  email: string
  year: number
  semester: number
  section: string
  batch?: string | null
  advisorName?: string | null
  parentPhone?: string | null
  residencyStatus?: string | null
  busNo?: string | null
  boardingPoint?: string | null
  hostelBlock?: string | null
  roomNo?: string | null
  cgpa?: number | null
  isDbVerified?: boolean
  attendancePct?: number
  totalDays?: number
  presentDays?: number
  absentDays?: number
}

export interface ClassMeta {
  className: string
  year: number
  section: string
  semester: number
  totalStudents: number
  advisorName: string
  attendancePct: number
  presentCount: number
}

interface Props {
  initialStudents: DBStudent[]
  facultyAdvisors: { year: number; section: string; advisorName: string }[]
  departmentClasses: ClassMeta[]
}

export function HODStudentsView({ initialStudents, facultyAdvisors, departmentClasses }: Props) {
  // Navigation & Filter States
  const [selectedClass, setSelectedClass] = useState<string>('ALL')
  const [yearFilter, setYearFilter] = useState<'ALL' | '2' | '3' | '4'>('ALL')
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [residencyFilter, setResidencyFilter] = useState<'ALL' | 'day_scholar' | 'hosteller'>('ALL')
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'good' | 'shortage'>('ALL')
  const [activeStudentModal, setActiveStudentModal] = useState<DBStudent | null>(null)
  const [copiedReg, setCopiedReg] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'attendance'>('table')
  const [activeAttendanceClass, setActiveAttendanceClass] = useState<string>('II AIDS A')

  // Real department roster strictly from DB (strictly only Admin-enrolled students)
  const fullRoster = useMemo(() => {
    return initialStudents
      .filter((s) => s.isDbVerified !== false)
      .map((s) => {
      const cls = departmentClasses.find(
        (c) => c.year === s.year && c.section.toUpperCase() === (s.section || 'A').toUpperCase()
      )
      return {
        ...s,
        isDbVerified: true,
        advisorName: s.advisorName || cls?.advisorName || 'Unassigned',
        attendancePct: s.attendancePct ?? cls?.attendancePct ?? 0,
        totalDays: s.totalDays ?? 0,
        presentDays: s.presentDays ?? 0,
        absentDays: s.absentDays ?? 0,
      }
    })
  }, [departmentClasses, initialStudents])

  // 10 Department Class Pills for Attendance View
  const attendanceClassPills = useMemo(() => [
    'II AIDS A',
    'II AIDS B',
    'II AIDS C',
    'II AIDS D',
    'III AIDS A',
    'III AIDS B',
    'III AIDS C',
    'III AIDS D',
    'IV AIDS A',
    'IV AIDS B',
  ], [])

  // Filter students for Attendance View by active class pill & search
  const attendanceStudents = useMemo(() => {
    return fullRoster.filter((s) => {
      const cls = departmentClasses.find((c) => c.className === activeAttendanceClass)
      if (cls && (s.year !== cls.year || (s.section || 'A').toUpperCase() !== cls.section.toUpperCase())) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = s.name.toLowerCase().includes(q)
        const matchesReg = s.registerNumber.toLowerCase().includes(q)
        if (!matchesName && !matchesReg) return false
      }
      return true
    })
  }, [fullRoster, activeAttendanceClass, departmentClasses, searchQuery])

  // Filter students based on current selection
  const filteredStudents = useMemo(() => {
    return fullRoster.filter((s) => {
      // Class selector filter
      if (selectedClass !== 'ALL') {
        const cls = departmentClasses.find((c) => c.className === selectedClass)
        if (cls && (s.year !== cls.year || s.section.toUpperCase() !== cls.section.toUpperCase())) {
          return false
        }
      }

      // Year filter
      if (yearFilter !== 'ALL' && s.year !== Number(yearFilter)) {
        return false
      }

      // Section filter
      if (sectionFilter !== 'ALL' && s.section.toUpperCase() !== sectionFilter) {
        return false
      }

      // Residency filter
      if (residencyFilter === 'day_scholar' && !s.residencyStatus?.toLowerCase().includes('day scholar')) {
        return false
      }
      if (residencyFilter === 'hosteller' && !s.residencyStatus?.toLowerCase().includes('hostel')) {
        return false
      }

      // Attendance filter
      if (attendanceFilter === 'good' && (s.attendancePct ?? 0) < 75) {
        return false
      }
      if (attendanceFilter === 'shortage' && (s.attendancePct ?? 0) >= 75) {
        return false
      }

      // Search query filter (name, regNo, phone, residency)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = s.name.toLowerCase().includes(q)
        const matchReg = s.registerNumber.toLowerCase().includes(q)
        const matchPhone = s.parentPhone?.includes(q)
        const matchResidency = s.residencyStatus?.toLowerCase().includes(q)
        const matchClass = `${s.year} ${s.section}`.toLowerCase().includes(q)
        if (!matchName && !matchReg && !matchPhone && !matchResidency && !matchClass) {
          return false
        }
      }

      return true
    })
  }, [
    fullRoster,
    selectedClass,
    yearFilter,
    sectionFilter,
    residencyFilter,
    attendanceFilter,
    searchQuery,
    departmentClasses,
  ])

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = filteredStudents.length
    const goodAtt = filteredStudents.filter((s) => (s.attendancePct ?? 0) >= 75).length
    const shortage = total - goodAtt
    const dayScholars = filteredStudents.filter((s) => s.residencyStatus?.toLowerCase().includes('day scholar')).length
    const hostellers = total - dayScholars
    const avgAtt =
      total > 0
        ? Math.round((filteredStudents.reduce((acc, s) => acc + (s.attendancePct ?? 0), 0) / total) * 10) / 10
        : 0

    return { total, goodAtt, shortage, dayScholars, hostellers, avgAtt }
  }, [filteredStudents])

  // Copy register number to clipboard
  const handleCopy = (reg: string) => {
    navigator.clipboard.writeText(reg)
    setCopiedReg(reg)
    setTimeout(() => setCopiedReg(null), 2000)
  }

  // Export filtered roll to CSV
  const handleExportCSV = () => {
    const activeTitle = selectedClass === 'ALL' ? 'Department_AI_DS_Students' : `${selectedClass.replace(/\s+/g, '_')}_Roll`
    const headers = [
      'Roll No',
      'Register Number',
      'Student Name',
      'Year',
      'Semester',
      'Section',
      'Class Advisor',
      'Attendance %',
      'Status',
      'Residency',
      'Bus/Room No',
      'Parent Contact',
      'Student Email',
    ]

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.registerNumber,
      `"${s.name}"`,
      s.year,
      s.semester,
      s.section,
      `"${s.advisorName || 'Class Advisor'}"`,
      `${s.attendancePct ?? 0}%`,
      (s.attendancePct ?? 0) >= 75 ? 'Eligible' : 'Shortage Alert',
      `"${s.residencyStatus || 'Day Scholar'}"`,
      `"${s.busNo ? `Bus ${s.busNo}` : s.roomNo ? `Room ${s.roomNo}` : '-'}"`,
      s.parentPhone || '-',
      s.email,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${activeTitle}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#F4C430] text-[#071A3D] text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Class-Wise Directory
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold">
              10 Department Sections
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Student Enrollment &amp; Class Roster</h1>
          <p className="text-sm text-blue-100/80 mt-1 max-w-2xl font-medium">
            B.Tech Artificial Intelligence &amp; Data Science · Class-wise student records, morning attendance status,
            hostel/transport transit, and advisor assignments.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm backdrop-blur-sm"
          >
            <Download className="w-4 h-4 text-[#F4C430]" />
            Export Class Roll (CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-[#F4C430] hover:bg-[#e5b729] text-[#071A3D] rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md"
          >
            <Printer className="w-4 h-4" />
            Print Roll Sheet
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-[#1455D9]" />
          </div>
          <p className="text-2xl font-black text-[#071A3D]">{metrics.total}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Across filtered roll</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Classes</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700">{departmentClasses.length}</p>
          <p className="text-[10px] text-purple-600 font-bold mt-0.5">II, III, IV AIDS (A-D)</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Class Avg Att.</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{metrics.avgAtt}%</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Department Average</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">≥75% Eligible</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-black text-green-700">{metrics.goodAtt}</p>
          <p className="text-[10px] text-green-600 font-bold mt-0.5">Exam Clearance OK</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">&lt;75% Shortage</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600">{metrics.shortage}</p>
          <p className="text-[10px] text-rose-600 font-bold mt-0.5">Counseling Required</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Transit Types</span>
            <Bus className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-gray-800">{metrics.dayScholars}</span>
            <span className="text-[11px] text-gray-500 font-bold">Bus</span>
            <span className="text-gray-300 mx-0.5">/</span>
            <span className="text-lg font-black text-gray-800">{metrics.hostellers}</span>
            <span className="text-[11px] text-gray-500 font-bold">Hostel</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Student Commute</p>
        </div>
      </div>

      {/* Class Selector Bar: 10 Departmental Sections */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#1455D9]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#071A3D]">Select Department Class</h2>
            <span className="text-xs bg-blue-50 text-[#1455D9] px-2 py-0.5 rounded-full font-bold">
              {selectedClass === 'ALL' ? 'Showing All 10 Classes' : selectedClass}
            </span>
          </div>

          {/* Quick Year Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => {
                setYearFilter('ALL')
                setSelectedClass('ALL')
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                yearFilter === 'ALL' && selectedClass === 'ALL'
                  ? 'bg-[#071A3D] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Years
            </button>
            <button
              onClick={() => {
                setYearFilter('2')
                setSelectedClass('ALL')
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                yearFilter === '2' && selectedClass === 'ALL'
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              II Year (4 Sec)
            </button>
            <button
              onClick={() => {
                setYearFilter('3')
                setSelectedClass('ALL')
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                yearFilter === '3' && selectedClass === 'ALL'
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              III Year (4 Sec)
            </button>
            <button
              onClick={() => {
                setYearFilter('4')
                setSelectedClass('ALL')
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                yearFilter === '4' && selectedClass === 'ALL'
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              IV Year (2 Sec)
            </button>
          </div>
        </div>

        {/* 10 Class Pills with Real Attendance & Strength */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {departmentClasses.map((cls) => {
            const isSelected = selectedClass === cls.className
            const isPending = cls.attendancePct === 0

            return (
              <button
                key={cls.className}
                onClick={() => {
                  if (isSelected) {
                    setSelectedClass('ALL')
                  } else {
                    setSelectedClass(cls.className)
                    setYearFilter(String(cls.year) as any)
                    setSectionFilter('ALL')
                  }
                }}
                className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-md ring-2 ring-blue-500/50 scale-[1.02]'
                    : 'bg-gray-50/70 hover:bg-blue-50/50 border-gray-200/80 text-gray-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-black tracking-tight ${
                        isSelected ? 'text-[#F4C430]' : 'text-[#071A3D]'
                      }`}
                    >
                      {cls.className}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPending
                          ? 'bg-amber-400'
                          : cls.attendancePct >= 75
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                    Sem {cls.semester} · {cls.totalStudents} Stud.
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-gray-200/20 flex items-center justify-between">
                  <span
                    className={`text-[11px] font-black ${
                      isSelected
                        ? 'text-white'
                        : isPending
                        ? 'text-amber-600'
                        : cls.attendancePct >= 75
                        ? 'text-emerald-700'
                        : 'text-rose-600'
                    }`}
                  >
                    {isPending ? 'Pending' : `${cls.attendancePct}%`}
                  </span>
                  <span className={`text-[9px] ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                    {cls.presentCount}/{cls.totalStudents}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Class Cards Overview: Displayed if viewing "ALL" */}
      {selectedClass === 'ALL' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1455D9]" />
              Class Section Overview &amp; Assigned Advisors
            </h3>
            <span className="text-xs text-gray-400 font-medium">Click any class card to view its student roster</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5">
            {departmentClasses
              .filter((c) => (yearFilter === 'ALL' ? true : c.year === Number(yearFilter)))
              .map((c) => {
                const isPending = c.attendancePct === 0
                return (
                  <div
                    key={c.className}
                    onClick={() => {
                      setSelectedClass(c.className)
                      setYearFilter(String(c.year) as any)
                    }}
                    className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-[#071A3D] group-hover:text-[#1455D9] transition">
                          {c.className}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-amber-100 text-amber-800'
                              : c.attendancePct >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPending ? 'Reg Pending' : `${c.attendancePct}% Att.`}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Class Advisor:</span>
                          <span className="font-bold text-[#071A3D] truncate max-w-[130px]">{c.advisorName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Enrolled:</span>
                          <span className="font-mono font-bold text-gray-900">{c.totalStudents} Students</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Semester:</span>
                          <span className="font-medium text-gray-700">Semester {c.semester}</span>
                        </div>
                      </div>

                      {/* Mini Attendance Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isPending
                                ? 'bg-amber-400'
                                : c.attendancePct >= 75
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(5, c.attendancePct)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1455D9] group-hover:translate-x-1 transition-transform">
                      <span>View Class Roll</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Main Student Directory Table Container */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 bg-gray-50/80 border-b border-gray-200 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-black">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-[#071A3D]">
                    {viewMode === 'attendance'
                      ? `${activeAttendanceClass} Attendance Register`
                      : selectedClass === 'ALL'
                      ? 'Department Student Roll'
                      : `${selectedClass} Roll`}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1455D9]/10 text-[#1455D9] text-xs font-bold font-mono">
                    {viewMode === 'attendance' ? attendanceStudents.length : filteredStudents.length} Students
                  </span>
                  {viewMode !== 'attendance' && selectedClass !== 'ALL' && (
                    <button
                      onClick={() => setSelectedClass('ALL')}
                      className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 ml-1"
                    >
                      (Clear Class Filter)
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {viewMode === 'attendance'
                    ? `Showing live attendance audit register for ${activeAttendanceClass}`
                    : `Showing ${filteredStudents.length} students matching active filters`}
                </p>
              </div>
            </div>

            {/* Quick Actions & View Mode Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative min-w-[220px] sm:min-w-[260px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Name, Reg No, Bus, Room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1455D9] focus:outline-none placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="inline-flex bg-gray-200/70 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    viewMode === 'table' ? 'bg-white text-[#071A3D] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    viewMode === 'cards' ? 'bg-white text-[#071A3D] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('attendance')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    viewMode === 'attendance'
                      ? 'bg-[#071A3D] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Attendance View</span>
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Filter Dropdowns (Shown for Table and Cards mode) */}
          {viewMode !== 'attendance' && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60 text-xs">
              <div className="flex items-center gap-1.5 text-gray-500 font-bold mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

            {/* Section Filter */}
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Sections (A-D)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>

            {/* Residency Filter */}
            <select
              value={residencyFilter}
              onChange={(e) => setResidencyFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Residency Types</option>
              <option value="day_scholar">Day Scholar (College Bus)</option>
              <option value="hosteller">Hosteller (Campus Hostel)</option>
            </select>

            {/* Attendance Clearance Filter */}
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Attendance Levels</option>
              <option value="good">≥75% Exam Eligible</option>
              <option value="shortage">&lt;75% Attendance Shortage</option>
            </select>

            {(sectionFilter !== 'ALL' ||
              residencyFilter !== 'ALL' ||
              attendanceFilter !== 'ALL' ||
              searchQuery ||
              selectedClass !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedClass('ALL')
                  setYearFilter('ALL')
                  setSectionFilter('ALL')
                  setResidencyFilter('ALL')
                  setAttendanceFilter('ALL')
                  setSearchQuery('')
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 ml-auto"
              >
                Reset All Filters
              </button>
            )}
          </div>
          )}
        </div>

              {/* View Mode 1: Attendance Roll Register (Matching Uploaded Screenshot) */}
              {viewMode === 'attendance' ? (
                <div className="bg-[#0B132B] text-white">
                  {/* Horizontal Class Pills Bar */}
                  <div className="flex items-center gap-2 overflow-x-auto py-3.5 px-4 sm:px-6 bg-[#071A3D] border-b border-slate-800 scrollbar-none">
                    {attendanceClassPills.map((pill) => {
                      const isActive = activeAttendanceClass === pill
                      return (
                        <button
                          key={pill}
                          onClick={() => setActiveAttendanceClass(pill)}
                          className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                            isActive
                              ? 'bg-white text-[#071A3D] font-black shadow-md scale-[1.02]'
                              : 'bg-[#0D1B2A]/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 font-semibold'
                          }`}
                        >
                          {pill}
                        </button>
                      )
                    })}
                  </div>

                  {/* Attendance Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-[#071A3D]/95 border-b border-slate-800 text-slate-400 uppercase text-[10.5px] font-bold tracking-wider select-none">
                        <tr>
                          <th className="py-4 px-6 text-left font-bold tracking-wider">REG NO</th>
                          <th className="py-4 px-6 text-left font-bold tracking-wider">STUDENT NAME</th>
                          <th className="py-4 px-6 text-center font-bold tracking-wider">TOTAL DAYS</th>
                          <th className="py-4 px-6 text-center font-bold tracking-wider">PRESENT DAYS</th>
                          <th className="py-4 px-6 text-center font-bold tracking-wider">ABSENT DAYS</th>
                          <th className="py-4 px-6 text-center font-bold tracking-wider">ATTENDANCE %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-200">
                        {attendanceStudents.length > 0 ? (
                          attendanceStudents.map((s) => {
                            const attPct = s.attendancePct ?? 0
                            const isGood = attPct >= 75
                            const isCopied = copiedReg === s.registerNumber

                            return (
                              <tr
                                key={s.id}
                                className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                onClick={() => setActiveStudentModal(s)}
                              >
                                {/* Reg No */}
                                <td className="py-4 px-6 font-mono font-bold text-white whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span className="group-hover:text-blue-400 transition-colors">{s.registerNumber}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCopy(s.registerNumber)
                                      }}
                                      title="Copy Register Number"
                                      className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition opacity-0 group-hover:opacity-100"
                                    >
                                      {isCopied ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                {/* Student Name */}
                                <td className="py-4 px-6 whitespace-nowrap">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">
                                      {s.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-100">{s.name}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">{s.email}</p>
                                    </div>
                                  </div>
                                </td>

                                {/* Total Days */}
                                <td className="py-4 px-6 text-center font-mono font-bold text-slate-300">
                                  {s.totalDays ?? 0}
                                </td>

                                {/* Present Days */}
                                <td className="py-4 px-6 text-center font-mono font-bold text-emerald-400">
                                  {s.presentDays ?? 0}
                                </td>

                                {/* Absent Days */}
                                <td className="py-4 px-6 text-center font-mono font-bold text-rose-400">
                                  {s.absentDays ?? 0}
                                </td>

                                {/* Attendance % */}
                                <td className="py-4 px-6 text-center whitespace-nowrap">
                                  <span
                                    className={`px-3 py-1 rounded-full font-mono text-xs font-black inline-block ${
                                      isGood
                                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                                        : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                                    }`}
                                  >
                                    {attPct}%
                                  </span>
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-16 text-center">
                              <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-slate-400">
                                <Users className="w-10 h-10 text-slate-600 stroke-1" />
                                <p className="font-bold text-sm text-slate-300">
                                  No students enrolled yet in {activeAttendanceClass}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Students will appear here once registered under this section.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#071A3D] text-white">
                      <tr>
                        <th className="py-3.5 px-3 font-bold text-center w-12">#</th>
                        <th className="py-3.5 px-4 font-bold">Reg. Number</th>
                        <th className="py-3.5 px-4 font-bold">Student Name &amp; Email</th>
                        <th className="py-3.5 px-3 font-bold text-center">Class / Section</th>
                        <th className="py-3.5 px-3 font-bold text-center">Semester</th>
                        <th className="py-3.5 px-4 font-bold text-center">Attendance %</th>
                        <th className="py-3.5 px-4 font-bold">Residency / Transit</th>
                        <th className="py-3.5 px-4 font-bold">Parent Contact</th>
                        <th className="py-3.5 px-3 font-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((s, index) => {
                          const attPct = s.attendancePct ?? 0
                          const isGood = attPct >= 75
                          const isCopied = copiedReg === s.registerNumber

                          return (
                            <tr
                              key={s.id}
                              className="hover:bg-blue-50/40 transition-colors"
                            >
                              <td className="py-3.5 px-3 text-center text-gray-400 font-mono font-medium">
                                {index + 1}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-[#1455D9] whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span>{s.registerNumber}</span>
                                  <button
                                    onClick={() => handleCopy(s.registerNumber)}
                                    title="Copy Register Number"
                                    className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition"
                                  >
                                    {isCopied ? (
                                      <Check className="w-3.5 h-3.5 text-green-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
                                    {s.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-[#071A3D]">{s.name}</span>
                                      {s.isDbVerified && (
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[9px] border border-emerald-300">
                                          Admin Enrolled
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-mono">{s.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                <span className="px-2 py-1 rounded-lg bg-blue-50 text-[#1455D9] font-black text-xs border border-blue-100">
                                  {s.year === 2 ? 'II' : s.year === 3 ? 'III' : 'IV'} AIDS {s.section}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-center font-bold text-gray-700">
                                Sem {s.semester}
                              </td>
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                  <span
                                    className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${
                                      isGood
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {attPct}%
                                  </span>
                                </div>
                                <div className="w-16 h-1 bg-gray-100 rounded-full mx-auto mt-1 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isGood ? 'bg-green-500' : 'bg-rose-500'}`}
                                    style={{ width: `${Math.min(100, attPct)}%` }}
                                  />
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 font-medium">
                                  {s.residencyStatus === 'Hosteller' ? (
                                    <>
                                      <Home className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                      <span>Hostel ({s.hostelBlock || 'Block'} - Rm {s.roomNo || 'N/A'})</span>
                                    </>
                                  ) : (
                                    <>
                                      <Bus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                      <span>
                                        {s.busNo ? `Bus ${s.busNo} (${s.boardingPoint || 'Route'})` : 'Day Scholar'}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {s.parentPhone ? (
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={`tel:${s.parentPhone}`}
                                      className="font-mono text-gray-700 hover:text-[#1455D9] font-medium flex items-center gap-1"
                                    >
                                      <Phone className="w-3 h-3 text-gray-400" />
                                      <span>{s.parentPhone}</span>
                                    </a>
                                    <a
                                      href={`https://wa.me/91${s.parentPhone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Chat on WhatsApp"
                                      className="text-green-600 hover:text-green-700 p-0.5 rounded"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Not Provided</span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <button
                                  onClick={() => setActiveStudentModal(s)}
                                  className="p-1.5 bg-gray-100 hover:bg-[#1455D9] text-gray-600 hover:text-white rounded-lg transition"
                                  title="View Full Student Profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="py-16 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-gray-400">
                              <Users className="w-10 h-10 text-gray-300 stroke-1" />
                              <p className="font-bold text-sm text-gray-600">
                                {selectedClass !== 'ALL'
                                  ? `No students enrolled yet in ${selectedClass}`
                                  : 'No students found'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* View Mode 2: Student Cards Grid */
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => {
                      const attPct = s.attendancePct ?? 0
                      const isGood = attPct >= 75
                      return (
                        <div
                          key={s.id}
                          onClick={() => setActiveStudentModal(s)}
                          className="p-4 rounded-2xl border border-gray-200/90 hover:border-blue-300 hover:shadow-md transition cursor-pointer bg-white flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[#071A3D] text-white flex items-center justify-center font-black text-xs">
                                  {s.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-[#071A3D] truncate max-w-[130px]">{s.name}</p>
                                  <p className="font-mono text-[11px] font-bold text-[#1455D9]">{s.registerNumber}</p>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  isGood ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {attPct}%
                              </span>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Class:</span>
                                <span className="font-bold text-[#071A3D]">
                                  {s.year === 2 ? 'II' : s.year === 3 ? 'III' : 'IV'} AIDS {s.section} (Sem {s.semester})
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Advisor:</span>
                                <span className="font-medium text-gray-800 truncate max-w-[120px]">{s.advisorName}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Parent:</span>
                                <span className="font-mono text-gray-700">{s.parentPhone || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#1455D9] font-bold">
                            <span>View Full Profile</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-gray-400">
                        <Users className="w-10 h-10 text-gray-300 stroke-1" />
                        <p className="font-bold text-sm text-gray-600">
                          {selectedClass !== 'ALL'
                            ? `No students enrolled yet in ${selectedClass}`
                            : 'No students match your criteria'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {selectedClass !== 'ALL'
                            ? 'Students can be registered or imported into this section via the Admin portal.'
                            : 'Try adjusting your search query or filter selection.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

      {/* Student Profile Drawer / Modal */}
      {activeStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-6 relative">
              <button
                onClick={() => setActiveStudentModal(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black text-2xl shadow-inner">
                  {activeStudentModal.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black">{activeStudentModal.name}</h3>
                    {activeStudentModal.isDbVerified && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 font-black text-[10px] border border-emerald-300">
                        Admin Enrolled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-200 font-mono mt-0.5">{activeStudentModal.registerNumber}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Class & Section Highlight */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 text-center">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Class</span>
                  <p className="text-sm font-black text-[#071A3D] mt-0.5">
                    {activeStudentModal.year === 2 ? 'II' : activeStudentModal.year === 3 ? 'III' : 'IV'} AIDS {activeStudentModal.section}
                  </p>
                </div>
                <div className="border-x border-gray-200">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Semester</span>
                  <p className="text-sm font-black text-[#071A3D] mt-0.5">Sem {activeStudentModal.semester}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Attendance</span>
                  <p
                    className={`text-sm font-black mt-0.5 ${
                      (activeStudentModal.attendancePct ?? 0) >= 75 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {activeStudentModal.attendancePct ?? 0}%
                  </p>
                </div>
              </div>

              {/* Information Rows */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Class Advisor:</span>
                  <span className="font-bold text-[#071A3D]">{activeStudentModal.advisorName || 'Assigned Faculty'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Student Email:</span>
                  <span className="font-mono text-gray-800">{activeStudentModal.email}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Parent Contact:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-800">{activeStudentModal.parentPhone || 'Not Set'}</span>
                    {activeStudentModal.parentPhone && (
                      <a
                        href={`https://wa.me/91${activeStudentModal.parentPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 p-1 bg-emerald-50 rounded"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Residency:</span>
                  <span className="font-semibold text-gray-800">{activeStudentModal.residencyStatus || 'Day Scholar'}</span>
                </div>

                {(activeStudentModal.busNo || activeStudentModal.boardingPoint || (activeStudentModal.residencyStatus && activeStudentModal.residencyStatus.toLowerCase().includes('day scholar'))) && (
                  <div className="p-2.5 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#1455D9]">
                      <Bus className="w-3.5 h-3.5 text-[#1455D9]" />
                      <span>College Transit / Bus Details</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-gray-700 text-[11px]">
                      <div>
                        <span className="text-gray-400 text-[10px] block">Bus Route / No.</span>
                        <span className="font-bold text-[#071A3D]">{activeStudentModal.busNo ? `Bus #${activeStudentModal.busNo}` : 'College Transit'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">Boarding Point</span>
                        <span className="font-bold text-[#071A3D]">{activeStudentModal.boardingPoint || 'Main Bus Stop'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {(activeStudentModal.hostelBlock || activeStudentModal.roomNo || (activeStudentModal.residencyStatus && activeStudentModal.residencyStatus.toLowerCase().includes('hostel'))) && (
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Home className="w-3.5 h-3.5 text-amber-700" />
                      <span>Campus Hostel Accommodation</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-gray-700 text-[11px]">
                      <div>
                        <span className="text-gray-400 text-[10px] block">Hostel Block</span>
                        <span className="font-bold text-[#071A3D]">{activeStudentModal.hostelBlock ? `Block ${activeStudentModal.hostelBlock}` : 'Campus Hostel'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">Room Number</span>
                        <span className="font-bold text-[#071A3D] font-mono">{activeStudentModal.roomNo ? `Room ${activeStudentModal.roomNo}` : 'Assigned Room'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeStudentModal.cgpa && (
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Cumulative CGPA:</span>
                    <span className="font-bold text-blue-700">{activeStudentModal.cgpa} / 10.0</span>
                  </div>
                )}
              </div>

              {/* Attendance Status Alert */}
              <div
                className={`p-3 rounded-2xl flex items-center gap-2.5 ${
                  (activeStudentModal.attendancePct ?? 0) >= 75
                    ? 'bg-green-50 text-green-900 border border-green-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {(activeStudentModal.attendancePct ?? 0) >= 75 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-[11px] font-medium">
                      Attendance criteria fulfilled (≥75%). Eligible for end-semester examinations.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-[11px] font-medium">
                      Attendance shortage (&lt;75%). Class advisor counseling and parent notification recommended.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setActiveStudentModal(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
