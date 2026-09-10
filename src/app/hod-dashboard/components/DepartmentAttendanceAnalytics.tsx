'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
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
} from 'lucide-react'

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
  { className: 'II AIDS A', year: 2, section: 'A', totalStudents: 64, presentAvg: 48, attendancePct: 75.0 },
  { className: 'II AIDS B', year: 2, section: 'B', totalStudents: 64, presentAvg: 52, attendancePct: 81.25 },
  { className: 'II AIDS C', year: 2, section: 'C', totalStudents: 60, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending' },
  { className: 'II AIDS D', year: 2, section: 'D', totalStudents: 64, presentAvg: 43, attendancePct: 67.19 },
  { className: 'III AIDS A', year: 3, section: 'A', totalStudents: 65, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending' },
  { className: 'III AIDS B', year: 3, section: 'B', totalStudents: 61, presentAvg: 10, attendancePct: 16.39 },
  { className: 'III AIDS C', year: 3, section: 'C', totalStudents: 61, presentAvg: 16, attendancePct: 26.23 },
  { className: 'III AIDS D', year: 3, section: 'D', totalStudents: 63, presentAvg: 0, attendancePct: 0.0, statusNote: 'Register Pending' },
  { className: 'IV AIDS A', year: 4, section: 'A', totalStudents: 60, presentAvg: 53, attendancePct: 88.33 },
  { className: 'IV AIDS B', year: 4, section: 'B', totalStudents: 65, presentAvg: 63, attendancePct: 96.92 },
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
    // Poll every 25 seconds for live advisor updates
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

  // Y-axis tick steps for chart: 100, 80, 60, 40, 20, 0
  const yTicks = [100, 80, 60, 40, 20, 0]

  // Formatted Section Label matching user specifications
  const getSectionLabel = (c: ClassAttendanceStat) => {
    if (c.attendancePct === 0) {
      return `${c.className} (0% - Register Pending)`
    }
    return `${c.className} (${c.attendancePct}%)`
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white p-5 sm:p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              HOD Department Oversight
            </span>
            <span className="text-xs text-blue-200 font-medium">· Advisor Morning Attendance Sync</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Department Attendance Roster &amp; Analytics
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time visual bar chart &amp; section breakdown updated live when Class Advisors submit morning attendance
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0 self-start sm:self-auto">
          {/* Refresh Button */}
          <button
            onClick={fetchLiveAttendance}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh advisor morning attendance data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#F4C430] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>

          {/* Year Filter Pill Tabs */}
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md p-1 rounded-2xl border border-white/15">
            <button
              onClick={() => setYearFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === 'ALL'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              All Classes (10)
            </button>
            <button
              onClick={() => setYearFilter('2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === '2'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              II Year
            </button>
            <button
              onClick={() => setYearFilter('3')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === '3'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              III Year
            </button>
            <button
              onClick={() => setYearFilter('4')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                yearFilter === '4'
                  ? 'bg-[#F4C430] text-[#071A3D] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              IV Year
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Enrolled</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{summary.totalEnrolled}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Students in selection</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs bg-blue-50/20">
          <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Present (Avg)</p>
          <p className="text-2xl font-black text-[#1455D9] mt-0.5">{summary.totalPresent}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">{summary.avgPct}% Department Avg</p>
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

      {/* Grid Layout: Chart & Table matching User Reference Images */}
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. CLASS-WISE AVERAGE BAR CHART (EXACT MATCH TO USER'S SCREENSHOT 1) */}
        {/* ========================================================================= */}
        <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Class-wise Average
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-[#60A5FA] border border-blue-500/30 text-[10px] font-bold">
                  Live Advisor Sync
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Department attendance distribution across active academic sections (Updated from Advisor morning roll-call)
              </p>
            </div>
            {lastSyncTime && (
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Last updated: {lastSyncTime}</span>
              </div>
            )}
          </div>

          {/* Canvas Chart Area */}
          <div className="relative pt-6 pb-4 px-1 sm:px-3 overflow-x-auto">
            <div className="flex items-end h-80 sm:h-92 pl-10 sm:pl-12 pr-4 pb-24 sm:pb-28 relative border-b border-l border-neutral-800 min-w-[720px]">
              {/* Y-Axis Labels: 100, 80, 60, 40, 20, 0 */}
              <div className="absolute left-0 top-0 bottom-24 sm:bottom-28 w-8 sm:w-10 flex flex-col justify-between items-end pr-2 text-xs font-mono text-neutral-400 font-medium select-none">
                {yTicks.map((tick) => (
                  <span key={tick} className="leading-none">
                    {tick}
                  </span>
                ))}
              </div>

              {/* Horizontal Gridlines */}
              <div className="absolute left-10 sm:left-12 right-4 top-0 bottom-24 sm:bottom-28 flex flex-col justify-between pointer-events-none">
                {yTicks.map((tick) => (
                  <div key={tick} className="w-full border-b border-neutral-800/80" />
                ))}
              </div>

              {/* Solid Vertical Bars */}
              <div className="w-full h-full flex items-end justify-around gap-2 sm:gap-4 relative z-10">
                {filteredData.map((c, idx) => {
                  const heightPct = Math.min(100, Math.max(0, c.attendancePct))
                  const label = getSectionLabel(c)
                  const isPending = c.attendancePct === 0

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                      onMouseEnter={() => setHoveredClass(c)}
                      onMouseLeave={() => setHoveredClass(null)}
                    >
                      {/* Bar Column with Rounded Top Corners */}
                      <div className="w-full max-w-[48px] sm:max-w-[56px] flex flex-col justify-end h-full">
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 shadow-md ${
                            isPending
                              ? 'bg-neutral-800 border-t-2 border-neutral-600'
                              : 'bg-[#4F83F0] hover:bg-[#60A5FA] group-hover:brightness-110'
                          }`}
                          style={{
                            height: `${heightPct}%`,
                            minHeight: isPending ? '2px' : heightPct > 0 ? '4px' : '0px',
                          }}
                        />
                      </div>

                      {/* Angled Class Label with Percentage (Matching user specifications) */}
                      <div className="absolute -bottom-24 sm:-bottom-26 left-1/2 flex items-start justify-start pointer-events-none">
                        <span
                          className={`text-[10px] sm:text-[11px] font-semibold transform -rotate-40 origin-top-left whitespace-nowrap transition-colors select-none ${
                            isPending
                              ? 'text-neutral-500 group-hover:text-amber-400'
                              : 'text-neutral-400 group-hover:text-white'
                          }`}
                        >
                          {label}
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
        {/* 2. CLASS BREAKDOWN TABLE (EXACT MATCH TO USER'S SCREENSHOT 2) */}
        {/* ========================================================================= */}
        <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Class Breakdown
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Active Department Register
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Detailed section roster, enrolled headcount, average attendees and live attendance percentages
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300">
                {filteredData.length} Classes Shown
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4 font-bold">CLASS NAME</th>
                  <th className="py-3.5 px-4 font-bold">TOTAL STUDENTS</th>
                  <th className="py-3.5 px-4 font-bold">PRESENT (AVG)</th>
                  <th className="py-3.5 px-4 font-bold text-right">ATTENDANCE %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 font-medium">
                {filteredData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-neutral-800/40 transition-colors group"
                  >
                    <td className="py-4 px-4 font-bold text-white text-sm group-hover:text-[#60A5FA] transition-colors">
                      {row.className}
                      {row.statusNote && (
                        <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-normal ${
                          row.attendancePct === 0
                            ? 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {row.statusNote}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-neutral-300 font-mono text-sm">
                      {row.totalStudents}
                    </td>
                    <td className="py-4 px-4 text-neutral-300 font-mono text-sm">
                      {row.presentAvg}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-bold font-mono text-sm ${
                        row.attendancePct === 0
                          ? 'text-neutral-500'
                          : row.attendancePct >= 75
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}>
                        {row.attendancePct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-700 text-white font-bold bg-neutral-900/50">
                  <td className="py-4 px-4 text-sm font-black text-[#F4C430]">
                    DEPARTMENT COHORT SUMMARY
                  </td>
                  <td className="py-4 px-4 font-mono text-sm">
                    {summary.totalEnrolled} Students
                  </td>
                  <td className="py-4 px-4 font-mono text-sm">
                    {summary.totalPresent} Present
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-sm text-emerald-400">
                    {summary.avgPct}%
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
