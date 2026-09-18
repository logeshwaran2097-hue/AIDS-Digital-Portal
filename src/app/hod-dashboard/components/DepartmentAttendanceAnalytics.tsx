'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Clock,
  ShieldCheck,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { generateAdvisorMorningAttendancePDF } from '@/lib/pdfGenerator'

export interface ClassAttendanceStat {
  className: string
  year: number
  section: string
  totalStudents: number
  presentAvg: number
  absentCount?: number
  attendancePct: number
  statusNote?: string
  advisorName?: string | null
  isLive?: boolean
  date?: string
}

export const DEFAULT_DEPARTMENT_CLASSES: ClassAttendanceStat[] = [
  { className: 'II AIDS A', year: 2, section: 'A', totalStudents: 0, presentAvg: 0, absentCount: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'II AIDS B', year: 2, section: 'B', totalStudents: 0, presentAvg: 0, absentCount: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'II AIDS C', year: 2, section: 'C', totalStudents: 0, presentAvg: 0, absentCount: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'II AIDS D', year: 2, section: 'D', totalStudents: 0, presentAvg: 0, absentCount: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'III AIDS A', year: 3, section: 'A', totalStudents: 0, presentAvg: 0, absentCount: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'III AIDS B', year: 3, section: 'B', totalStudents: 0, presentAvg: 0, absentCount: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'III AIDS C', year: 3, section: 'C', totalStudents: 0, presentAvg: 0, absentCount: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'III AIDS D', year: 3, section: 'D', totalStudents: 0, presentAvg: 0, absentCount: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'IV AIDS A', year: 4, section: 'A', totalStudents: 0, presentAvg: 0, absentCount: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'IV AIDS B', year: 4, section: 'B', totalStudents: 0, presentAvg: 0, absentCount: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
]

interface Props {
  initialData?: ClassAttendanceStat[]
}

export function DepartmentAttendanceAnalytics({ initialData }: Props) {
  const [data, setData] = useState<ClassAttendanceStat[]>(
    initialData && initialData.length > 0 ? initialData : DEFAULT_DEPARTMENT_CLASSES
  )
  const [yearFilter, setYearFilter] = useState<'ALL' | '2' | '3' | '4'>('ALL')
  const [hoveredClass, setHoveredClass] = useState<ClassAttendanceStat | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  // Live real-time sync with Advisor Morning Attendance API
  const fetchLiveAttendance = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const res = await fetch('/api/hod/class-attendance', { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.classes) && json.classes.length > 0) {
        setData(json.classes)
        setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      }
    } catch (err) {
      console.error('Error fetching advisor morning attendance:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchLiveAttendance()
    const interval = setInterval(fetchLiveAttendance, 25000)
    return () => clearInterval(interval)
  }, [fetchLiveAttendance])

  const [showOnlyEnrolled, setShowOnlyEnrolled] = useState<boolean>(true)

  const enrolledClassesCount = useMemo(() => {
    return data.filter((c) => c.totalStudents > 0).length
  }, [data])

  const filteredData = useMemo(() => {
    let list = data
    if (showOnlyEnrolled && enrolledClassesCount > 0) {
      list = list.filter((c) => c.totalStudents > 0)
    }
    if (yearFilter !== 'ALL') {
      const yr = Number(yearFilter)
      list = list.filter((c) => c.year === yr)
    }
    return list
  }, [data, showOnlyEnrolled, enrolledClassesCount, yearFilter])

  // Summary Metrics
  const summary = useMemo(() => {
    const totalEnrolled = filteredData.reduce((acc, c) => acc + c.totalStudents, 0)
    const totalPresent = filteredData.reduce((acc, c) => acc + c.presentAvg, 0)
    const totalAbsent = filteredData.reduce((acc, c) => {
      const abs = c.absentCount !== undefined
        ? c.absentCount
        : (c.attendancePct > 0 ? Math.max(0, c.totalStudents - c.presentAvg) : 0)
      return acc + abs
    }, 0)
    const avgPct =
      totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 10000) / 100 : 0
    const activeWithStudents = filteredData.filter((c) => c.totalStudents > 0)
    const topClass = (activeWithStudents.length > 0 ? activeWithStudents : filteredData)
      .slice()
      .sort((a, b) => b.attendancePct - a.attendancePct)[0]

    return {
      totalEnrolled,
      totalPresent,
      totalAbsent,
      avgPct,
      topClass,
    }
  }, [filteredData])

  // Export Official Advisor Attendance Report (PDF)
  const handleExportPDF = () => {
    try {
      setIsExporting(true)
      generateAdvisorMorningAttendancePDF({
        classes: filteredData,
        date: new Date().toISOString().split('T')[0],
        fileName: `Advisor_Morning_Attendance_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      })
    } catch (err) {
      console.error('Failed to generate PDF:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // Export CSV of Class Breakdown
  const handleExportCSV = () => {
    const headers = [
      'Class Code',
      'Year',
      'Section',
      'Class Advisor',
      'Total Enrolled',
      'No. of Presents',
      'No. of Absentees',
      'Attendance %',
      'Status Note',
    ]

    const rows = filteredData.map((c) => [
      `"${c.className}"`,
      c.year,
      `"${c.section}"`,
      `"${c.advisorName || 'Class Advisor'}"`,
      c.totalStudents,
      c.presentAvg,
      c.absentCount !== undefined ? c.absentCount : (c.attendancePct > 0 ? Math.max(0, c.totalStudents - c.presentAvg) : 0),
      `${c.attendancePct}%`,
      `"${c.statusNote || 'Operational'}"`,
    ].join(','))

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Department_Attendance_Roll_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Y-axis tick marks for visual scale (100 down to 0)
  const yTicks = [100, 80, 60, 40, 20, 0]

  return (
    <div className="space-y-6">
      {/* Visual Analytics Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider shadow-xs">
              Advisor Attendance Intelligence
            </span>
            <span className="text-xs text-blue-200 font-medium">· Morning Roll-Call Verified</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Department Attendance Report &amp; Analytics
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
            Real-time visual bar chart &amp; class-wise roll audit updated directly from Class Advisors' morning attendance submissions.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-[#F4C430] hover:bg-[#e5b726] text-[#071A3D] text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Download Official Advisor Morning Attendance PDF Report"
          >
            <Download className="w-4 h-4 text-[#071A3D]" />
            <span>{isExporting ? 'Generating PDF...' : 'Export Advisor Report (PDF)'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-white shadow-xs active:scale-95"
            title="Download CSV spreadsheet"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>CSV</span>
          </button>

          <button
            onClick={fetchLiveAttendance}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center justify-center transition-all cursor-pointer text-white shadow-xs disabled:opacity-50"
            title="Sync Latest Advisor Attendance"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#F4C430]' : ''}`} />
          </button>

          {/* Enrolled vs All Toggle Pill */}
          <div className="flex items-center gap-1 bg-black/25 backdrop-blur-md p-1 rounded-2xl border border-white/15">
            <button
              onClick={() => setShowOnlyEnrolled(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showOnlyEnrolled
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="Display only classes with students enrolled by admin"
            >
              Enrolled ({enrolledClassesCount})
            </button>
            <button
              onClick={() => setShowOnlyEnrolled(false)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !showOnlyEnrolled
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="Display all 10 academic sections"
            >
              All ({data.length})
            </button>
          </div>

          {/* Year Filter Pill Tabs */}
          <div className="flex items-center gap-1 bg-black/25 backdrop-blur-md p-1 rounded-2xl border border-white/15">
            <button
              onClick={() => setYearFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === 'ALL'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setYearFilter('2')}
              className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === '2'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              II Yr
            </button>
            <button
              onClick={() => setYearFilter('3')}
              className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === '3'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              III Yr
            </button>
            <button
              onClick={() => setYearFilter('4')}
              className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === '4'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              IV Yr
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Enrolled</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{summary.totalEnrolled}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Students across active classes</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs bg-blue-50/20">
          <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">No. of Presents</p>
          <p className="text-2xl font-black text-[#1455D9] mt-0.5">{summary.totalPresent}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">{summary.avgPct}% Department Average</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-xs bg-rose-50/20">
          <p className="text-[10px] text-rose-700 font-bold uppercase tracking-wider">No. of Absentees</p>
          <p className="text-2xl font-black text-rose-700 mt-0.5">{summary.totalAbsent}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Leave, OD &amp; Absent Today</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs bg-emerald-50/20">
          <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Top Performing Class</p>
          <p className="text-xl font-black text-emerald-700 mt-0.5 truncate">
            {summary.topClass && summary.topClass.totalStudents > 0 ? `${summary.topClass.className}` : 'N/A'}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {summary.topClass && summary.topClass.totalStudents > 0 ? `${summary.topClass.attendancePct}% Attendance` : 'Awaiting Submissions'}
          </p>
        </div>
      </div>

      {/* Grid Layout: Chart & Table */}
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. CLASS-WISE AVERAGE BAR CHART (HARMONIZED WITH DASHBOARD LIGHT THEME) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_25px_-4px_rgba(7,26,61,0.06)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-black">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-[#071A3D]">
                  Class-wise Average (Bar Chart)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] border border-blue-200 text-[10px] font-bold">
                  Advisor Roll-Call Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Department attendance distribution across active academic sections (Updated from morning register)
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastSyncTime && (
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Last updated: {lastSyncTime}</span>
                </div>
              )}
              <button
                onClick={handleExportPDF}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#071A3D] rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#1455D9]" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Canvas Chart Area */}
          <div className="relative pt-6 pb-2 px-1 sm:px-2 overflow-x-auto xl:overflow-x-visible">
            <div className="flex items-end h-80 sm:h-92 pl-10 sm:pl-12 pr-4 pb-20 sm:pb-24 relative border-b border-l border-slate-200 min-w-[620px] lg:min-w-0">
              {/* Y-Axis Labels: 100, 80, 60, 40, 20, 0 */}
              <div className="absolute left-0 top-0 bottom-20 sm:bottom-24 w-8 sm:w-10 flex flex-col justify-between items-end pr-2 text-xs font-mono text-slate-400 font-bold select-none">
                {yTicks.map((tick) => (
                  <span key={tick} className="leading-none">
                    {tick}
                  </span>
                ))}
              </div>

              {/* Horizontal Gridlines */}
              <div className="absolute left-10 sm:left-12 right-4 top-0 bottom-20 sm:bottom-24 flex flex-col justify-between pointer-events-none">
                {yTicks.map((tick) => (
                  <div key={tick} className="w-full border-b border-slate-100" />
                ))}
              </div>


              {/* Solid Vertical Bars */}
              <div className="w-full h-full flex items-end justify-around gap-1.5 sm:gap-3 relative z-10">
                {filteredData.map((c, idx) => {
                  const heightPct = Math.min(100, Math.max(0, c.attendancePct))
                  const isPending = c.attendancePct === 0

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                      onMouseEnter={() => setHoveredClass(c)}
                      onMouseLeave={() => setHoveredClass(null)}
                    >
                      {/* Floating Percentage Indicator Above Bar */}
                      <div className="mb-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black tracking-tight whitespace-nowrap shadow-2xs ${
                            isPending
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : c.attendancePct >= 75
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isPending ? 'Pending' : `${c.attendancePct}%`}
                        </span>
                      </div>

                      {/* Bar Column with Rounded Top Corners */}
                      <div className="w-full max-w-[42px] sm:max-w-[50px] flex flex-col justify-end h-full">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 shadow-sm ${
                            isPending
                              ? 'bg-slate-200 border-t-2 border-slate-300 group-hover:bg-slate-300'
                              : c.attendancePct >= 75
                              ? 'bg-gradient-to-t from-[#0A2A5E] to-[#1455D9] group-hover:from-[#071A3D] group-hover:to-blue-600 shadow-blue-500/20'
                              : 'bg-gradient-to-t from-rose-600 to-rose-400 group-hover:from-rose-700 group-hover:to-rose-500 shadow-rose-500/20'
                          }`}
                          style={{
                            height: `${heightPct}%`,
                            minHeight: isPending ? '3px' : heightPct > 0 ? '4px' : '0px',
                          }}
                        />
                      </div>

                      {/* Clean Angled Label Underneath */}
                      <div className="absolute -bottom-20 sm:-bottom-22 left-1/2 flex flex-col items-start pointer-events-none origin-top-left -rotate-45">
                        <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#1455D9] transition-colors whitespace-nowrap">
                          {c.className}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. CLASS BREAKDOWN TABLE (HARMONIZED WITH DASHBOARD LIGHT THEME) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_25px_-4px_rgba(7,26,61,0.06)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-black">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-[#071A3D]">
                  Class Breakdown &amp; Advisor Roster
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Active Department Register
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Detailed section roster, allocated Class Advisors, enrolled headcount, average attendees and live attendance rates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#071A3D] border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#1455D9]" />
                <span>Export Dossier (PDF)</span>
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600">
                {filteredData.length} Classes Listed
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-bold">CLASS NAME</th>
                  <th className="py-3.5 px-4 font-bold">CLASS ADVISOR</th>
                  <th className="py-3.5 px-4 font-bold text-center">TOTAL STUDENTS</th>
                  <th className="py-3.5 px-4 font-bold text-center">NO. OF PRESENTS</th>
                  <th className="py-3.5 px-4 font-bold text-center">NO. OF ABSENTEES</th>
                  <th className="py-3.5 px-4 font-bold text-center">ATTENDANCE %</th>
                  <th className="py-3.5 px-4 font-bold text-right">STUDENT DIRECTORY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium bg-white">
                {filteredData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="py-4 px-4 font-bold text-[#071A3D] text-sm group-hover:text-[#1455D9] transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{row.className}</span>
                        {row.statusNote && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              row.attendancePct === 0
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {row.statusNote}
                          </span>
                        )}
                        {!row.statusNote && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              row.attendancePct >= 75
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {row.attendancePct >= 75 ? 'Advisor Verified' : 'Shortage Alert'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-700 text-sm">
                      <span className="font-semibold text-slate-900">{row.advisorName || 'Faculty Advisor'}</span>
                    </td>

                    <td className="py-4 px-4 text-center text-slate-700 font-mono text-sm font-semibold">
                      {row.totalStudents}
                    </td>

                    <td className="py-4 px-4 text-center text-slate-700 font-mono text-sm font-semibold">
                      {row.presentAvg}
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-sm font-semibold">
                      {(() => {
                        const abs = row.absentCount !== undefined
                          ? row.absentCount
                          : (row.attendancePct > 0 ? Math.max(0, row.totalStudents - row.presentAvg) : 0)

                        if (abs > 0) {
                          return (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-rose-700 bg-rose-50 border border-rose-200 text-xs font-bold font-mono">
                              {abs}
                            </span>
                          )
                        }
                        return <span className="text-slate-400 font-medium">0</span>
                      })()}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`font-bold font-mono text-sm px-2.5 py-1 rounded-lg ${
                          row.attendancePct === 0
                            ? 'text-slate-400 bg-slate-100'
                            : row.attendancePct >= 75
                            ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                            : 'text-rose-800 bg-rose-50 border border-rose-200'
                        }`}
                      >
                        {row.attendancePct}%
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/hod-dashboard/students`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-[#1455D9] text-[#1455D9] hover:text-white border border-blue-200/80 text-xs font-bold transition shadow-2xs"
                      >
                        <span>View Class Roll</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 text-slate-800 font-bold bg-slate-50/80">
                  <td className="py-4 px-4 text-sm font-black text-[#071A3D]" colSpan={2}>
                    DEPARTMENT COHORT SUMMARY
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-sm">
                    {summary.totalEnrolled} Students
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-sm">
                    {summary.totalPresent} Presents
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-sm text-rose-600 font-bold">
                    {summary.totalAbsent} Absentees
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-sm text-emerald-700">
                    {summary.avgPct}%
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={handleExportPDF}
                      className="text-xs text-[#1455D9] hover:underline font-bold"
                    >
                      Export Full Report PDF →
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
