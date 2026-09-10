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
  attendancePct: number
  statusNote?: string
  advisorName?: string | null
  isLive?: boolean
  date?: string
}

export const DEFAULT_DEPARTMENT_CLASSES: ClassAttendanceStat[] = [
  { className: 'II AIDS A', year: 2, section: 'A', totalStudents: 0, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'II AIDS B', year: 2, section: 'B', totalStudents: 0, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'II AIDS C', year: 2, section: 'C', totalStudents: 0, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'II AIDS D', year: 2, section: 'D', totalStudents: 0, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'III AIDS A', year: 3, section: 'A', totalStudents: 0, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'III AIDS B', year: 3, section: 'B', totalStudents: 0, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'III AIDS C', year: 3, section: 'C', totalStudents: 0, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'III AIDS D', year: 3, section: 'D', totalStudents: 0, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'IV AIDS A', year: 4, section: 'A', totalStudents: 0, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
  { className: 'IV AIDS B', year: 4, section: 'B', totalStudents: 0, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending', advisorName: null },
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

  const filteredData = useMemo(() => {
    if (yearFilter === 'ALL') return data
    const yr = Number(yearFilter)
    return data.filter((c) => c.year === yr)
  }, [data, yearFilter])

  // Summary Metrics
  const summary = useMemo(() => {
    const totalEnrolled = filteredData.reduce((acc, c) => acc + c.totalStudents, 0)
    const totalPresent = filteredData.reduce((acc, c) => acc + c.presentAvg, 0)
    const avgPct =
      totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 10000) / 100 : 0
    const topClass = [...filteredData].sort((a, b) => b.attendancePct - a.attendancePct)[0]
    const compliantCount = filteredData.filter((c) => c.attendancePct >= 75).length
    const shortageCount = filteredData.filter((c) => c.attendancePct < 75).length

    return {
      totalEnrolled,
      totalPresent,
      avgPct,
      topClass,
      compliantCount,
      shortageCount,
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
      'Present Count',
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
      `${c.attendancePct}%`,
      `"${c.statusNote || (c.attendancePct >= 75 ? 'Advisor Verified' : 'Shortage Alert')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Advisor_Attendance_Breakdown_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const yTicks = [100, 80, 60, 40, 20, 0]

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white p-6 sm:p-7 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Advisor Attendance Intelligence
            </span>
            <span className="text-xs text-blue-200 font-medium">· Morning Roll-Call Verified</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Department Attendance Report &amp; Analytics
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time visual bar chart &amp; class-wise roll audit updated directly from Class Advisors' morning attendance submissions.
          </p>
        </div>

        {/* Action Buttons: Export PDF, CSV, Print, Refresh */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-[#F4C430] hover:bg-[#e5b729] text-[#071A3D] text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            title="Download Official Advisor Attendance PDF Report"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Export Advisor Report (PDF)'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-white shadow-xs active:scale-95"
            title="Download CSV Spreadsheet"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-white shadow-xs active:scale-95"
            title="Print Attendance Report"
          >
            <Printer className="w-4 h-4 text-blue-200" />
            <span>Print</span>
          </button>

          <button
            onClick={fetchLiveAttendance}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center justify-center transition-all cursor-pointer text-white shadow-xs disabled:opacity-50"
            title="Sync Latest Advisor Attendance"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#F4C430]' : ''}`} />
          </button>

          {/* Year Filter Pill Tabs */}
          <div className="flex items-center gap-1 bg-black/25 backdrop-blur-md p-1 rounded-2xl border border-white/15 ml-1">
            <button
              onClick={() => setYearFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === 'ALL'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              All (10)
            </button>
            <button
              onClick={() => setYearFilter('2')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === '2'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              II Yr
            </button>
            <button
              onClick={() => setYearFilter('3')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === '3'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              III Yr
            </button>
            <button
              onClick={() => setYearFilter('4')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
          <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Present (Avg)</p>
          <p className="text-2xl font-black text-[#1455D9] mt-0.5">{summary.totalPresent}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">{summary.avgPct}% Department Average</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs bg-emerald-50/20">
          <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Top Performing Class</p>
          <p className="text-xl font-black text-emerald-700 mt-0.5 truncate">
            {summary.topClass ? `${summary.topClass.className}` : 'N/A'}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {summary.topClass ? `${summary.topClass.attendancePct}% Attendance` : ''}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Regulation 75% Status</p>
          <p className="text-xl font-black text-amber-900 mt-0.5">
            {summary.compliantCount} Eligible / {summary.shortageCount} Low
          </p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Exam Eligibility Threshold</p>
        </div>
      </div>

      {/* Grid Layout: Chart & Table */}
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. CLASS-WISE AVERAGE BAR CHART (SEAMLESS PORTAL UI/UX BACKGROUND) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-[#071A3D]">
                  Class-wise Average (Bar Chart)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] border border-blue-200 text-[10px] font-bold">
                  Advisor Roll-Call Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
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
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
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
              <div className="absolute left-0 top-0 bottom-20 sm:bottom-24 w-8 sm:w-10 flex flex-col justify-between items-end pr-2 text-xs font-mono text-slate-400 font-medium select-none">
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

              {/* Benchmark 75% Line */}
              <div
                className="absolute left-10 sm:left-12 right-4 border-b border-rose-400/70 border-dashed pointer-events-none z-0"
                style={{ bottom: 'calc(20px + (100% - 20px) * 0.75)' }}
              />

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
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-tight whitespace-nowrap shadow-2xs ${
                            isPending
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
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
                              ? 'bg-slate-200 border-t-2 border-slate-400'
                              : c.attendancePct >= 75
                              ? 'bg-[#1455D9] hover:bg-blue-600 group-hover:scale-y-[1.02] origin-bottom'
                              : 'bg-rose-500 hover:bg-rose-600 group-hover:scale-y-[1.02] origin-bottom'
                          }`}
                          style={{
                            height: `${heightPct}%`,
                            minHeight: isPending ? '3px' : heightPct > 0 ? '5px' : '0px',
                          }}
                        />
                      </div>

                      {/* Clean Angled Label Underneath */}
                      <div className="absolute -bottom-20 sm:-bottom-22 left-1/2 flex flex-col items-start pointer-events-none origin-top-left -rotate-45">
                        <span className="text-[11px] font-bold text-slate-600 group-hover:text-[#1455D9] transition-colors whitespace-nowrap">
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
        {/* 2. CLASS BREAKDOWN TABLE (SEAMLESS PORTAL UI/UX BACKGROUND) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-[#071A3D]">
                  Class Breakdown &amp; Advisor Roster
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Active Department Register
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
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
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 font-mono">
                {filteredData.length} Classes Listed
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#071A3D] text-white">
                <tr className="text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4 font-bold">CLASS NAME</th>
                  <th className="py-3.5 px-4 font-bold">CLASS ADVISOR</th>
                  <th className="py-3.5 px-4 font-bold text-center">TOTAL STUDENTS</th>
                  <th className="py-3.5 px-4 font-bold text-center">PRESENT (AVG)</th>
                  <th className="py-3.5 px-4 font-bold text-center">ATTENDANCE %</th>
                  <th className="py-3.5 px-4 font-bold text-right">STUDENT DIRECTORY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
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
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
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
                      <span className="font-semibold text-[#071A3D]">{row.advisorName || 'Faculty Advisor'}</span>
                    </td>

                    <td className="py-4 px-4 text-center text-slate-800 font-mono text-sm font-bold">
                      {row.totalStudents}
                    </td>

                    <td className="py-4 px-4 text-center text-slate-800 font-mono text-sm font-bold">
                      {row.presentAvg}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`font-bold font-mono text-xs px-2.5 py-1 rounded-full ${
                          row.attendancePct === 0
                            ? 'text-slate-500 bg-slate-100'
                            : row.attendancePct >= 75
                            ? 'text-emerald-800 bg-emerald-100'
                            : 'text-rose-800 bg-rose-100'
                        }`}
                      >
                        {row.attendancePct}%
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/hod-dashboard/students`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-[#1455D9] hover:text-white text-[#1455D9] border border-blue-200 text-xs font-bold transition shadow-2xs"
                      >
                        <span>View Class Roll</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 text-[#071A3D] font-bold bg-slate-50">
                  <td className="py-4 px-4 text-sm font-black text-[#071A3D]" colSpan={2}>
                    DEPARTMENT COHORT SUMMARY
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-sm text-slate-800">
                    {summary.totalEnrolled} Students
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-sm text-slate-800">
                    {summary.totalPresent} Present
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-sm font-black text-emerald-700">
                    {summary.avgPct}%
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={handleExportPDF}
                      className="text-xs text-[#1455D9] hover:underline font-bold cursor-pointer"
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
