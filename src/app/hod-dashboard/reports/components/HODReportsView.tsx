'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Download,
  Users,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Calendar,
  Trophy,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  FileText,
  Filter,
  UserMinus,
  CheckCircle2,
  PieChart,
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Printer,
} from 'lucide-react'
import { generateAttendanceBarGraphPDF, generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { StudentAttendanceRecord } from '@/app/admin/reports/components/AdminReportsView'

export function HODReportsView({
  studentCount = 0,
  facultyCount = 0,
  subjectCount = 0,
  projectCount = 0,
  eventCount = 0,
  achievementCount = 0,
  initialStudents = [],
}: {
  studentCount?: number
  facultyCount?: number
  subjectCount?: number
  projectCount?: number
  eventCount?: number
  achievementCount?: number
  initialStudents?: StudentAttendanceRecord[]
}) {
  // Filters State
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL')
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL')
  const [selectedSection, setSelectedSection] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SHORTAGE' | 'ELIGIBLE' | 'OD_ONLY' | 'ML_ONLY'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('2026-01-05')
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [datePreset, setDatePreset] = useState<'semester' | 'month' | 'last30' | 'custom'>('semester')
  const [chartMode, setChartMode] = useState<'students' | 'days'>('students')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMessage, setGeneratedMessage] = useState('')

  // Live real-time student and morning attendance sync from advisors
  const [studentsList, setStudentsList] = useState<StudentAttendanceRecord[]>(initialStudents || [])

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/attendance?all=true', { cache: 'no-store' })
        const data = await res.json()
        if (data.success && Array.isArray(data.students) && data.students.length > 0) {
          setStudentsList(data.students)
        }
      } catch {}
    }

    const interval = setInterval(fetchLatest, 3000)
    return () => clearInterval(interval)
  }, [])

  // Quick Preset Setter
  const handlePresetSelect = (preset: 'semester' | 'month' | 'last30' | 'custom') => {
    setDatePreset(preset)
    const today = new Date().toISOString().split('T')[0]
    if (preset === 'semester') {
      setStartDate('2026-01-05')
      setEndDate(today)
    } else if (preset === 'month') {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      setStartDate(firstDay)
      setEndDate(today)
    } else if (preset === 'last30') {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      setStartDate(d.toISOString().split('T')[0])
      setEndDate(today)
    }
  }

  // Calculate Working Days dynamically
  const calculatedWorkingDays = useMemo(() => {
    try {
      const d1 = new Date(startDate)
      const d2 = new Date(endDate)
      const diffTime = Math.abs(d2.getTime() - d1.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      const estimatedWorking = Math.max(1, Math.round(diffDays * (6 / 7)))
      return estimatedWorking || 48
    } catch {
      return 48
    }
  }, [startDate, endDate])

  // Cascading Semester Options Based on Selected Year
  const availableSemesters = useMemo(() => {
    if (selectedYear === 1) return [1, 2]
    if (selectedYear === 2) return [3, 4]
    if (selectedYear === 3) return [5, 6]
    if (selectedYear === 4) return [7, 8]
    return [1, 2, 3, 4, 5, 6, 7, 8]
  }, [selectedYear])

  // Filtered Students (ALWAYS ABSENTS FIRST)
  const filteredStudents = useMemo(() => {
    return (studentsList || []).filter((s) => {
      const matchesYear = selectedYear === 'ALL' || s.year === selectedYear
      const matchesSemester = selectedSemester === 'ALL' || s.semester === selectedSemester
      const matchesSection = selectedSection === 'ALL' || s.section === selectedSection
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.regNo.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesStatus = true
      if (statusFilter === 'SHORTAGE') matchesStatus = s.status === 'SHORTAGE'
      if (statusFilter === 'ELIGIBLE') matchesStatus = s.status === 'ELIGIBLE'
      if (statusFilter === 'OD_ONLY') matchesStatus = s.odDays > 0
      if (statusFilter === 'ML_ONLY') matchesStatus = s.mlDays > 0

      return matchesYear && matchesSemester && matchesSection && matchesSearch && matchesStatus
    }).sort((a, b) => b.absentDays - a.absentDays || a.percentage - b.percentage)
  }, [studentsList, selectedYear, selectedSemester, selectedSection, statusFilter, searchQuery])

  // Summary Metrics
  const summary = useMemo(() => {
    const totalWorking = calculatedWorkingDays
    const totalStudents = filteredStudents.length || 1
    const totalPresents = filteredStudents.reduce((acc, s) => acc + s.presentDays, 0)
    const totalODs = filteredStudents.reduce((acc, s) => acc + s.odDays, 0)
    const totalMLs = filteredStudents.reduce((acc, s) => acc + s.mlDays, 0)
    const totalAbsents = filteredStudents.reduce((acc, s) => acc + s.absentDays, 0)
    const shortageCount = filteredStudents.filter((s) => s.status === 'SHORTAGE').length
    const eligibleCount = filteredStudents.filter((s) => s.status === 'ELIGIBLE').length
    const odClaimantsCount = filteredStudents.filter((s) => s.odDays > 0).length
    const mlClaimantsCount = filteredStudents.filter((s) => s.mlDays > 0).length
    const studentsWithAbsentsCount = filteredStudents.filter((s) => s.absentDays > 0).length

    // Average days per student
    const avgPresentDays = Math.round((totalPresents / totalStudents) * 10) / 10
    const avgODDays = Math.round((totalODs / totalStudents) * 10) / 10
    const avgMLDays = Math.round((totalMLs / totalStudents) * 10) / 10
    const avgAbsentDays = Math.round((totalAbsents / totalStudents) * 10) / 10

    const avgPct =
      filteredStudents.length > 0
        ? Math.round((filteredStudents.reduce((acc, s) => acc + s.percentage, 0) / filteredStudents.length) * 10) / 10
        : 0

    return {
      totalStudents: filteredStudents.length,
      totalWorking,
      totalPresents,
      totalODs,
      totalMLs,
      totalAbsents,
      shortageCount,
      eligibleCount,
      odClaimantsCount,
      mlClaimantsCount,
      studentsWithAbsentsCount,
      avgPresentDays,
      avgODDays,
      avgMLDays,
      avgAbsentDays,
      avgPct,
    }
  }, [filteredStudents, calculatedWorkingDays])

  // 5 Clean Categories for Bar Chart (Total Students, Presents, Absents, On-Duty, Medical Leave)
  const verticalBarCategories = useMemo(() => {
    if (chartMode === 'students') {
      return [
        { label: 'Category A', title: 'Total Students', short: 'Total Students', value: summary.totalStudents, unit: 'Students', color: '#1455D9' }, // Royal Blue
        { label: 'Category B', title: 'Presents (P)', short: 'Presents (P)', value: summary.eligibleCount, unit: 'Students', color: '#16A34A' }, // Green
        { label: 'Category C', title: 'Absents (A)', short: 'Absents (A)', value: summary.shortageCount, unit: 'Students', color: '#DC2626' }, // Red
        { label: 'Category D', title: 'On-Duty (OD)', short: 'On-Duty (OD)', value: summary.odClaimantsCount, unit: 'Students', color: '#0284C7' }, // Cyan
        { label: 'Category E', title: 'Medical (ML)', short: 'Medical (ML)', value: summary.mlClaimantsCount, unit: 'Students', color: '#EAB308' }, // Amber
      ]
    } else {
      return [
        { label: 'Category A', title: 'Presents (P)', short: 'Presents (P)', value: summary.avgPresentDays, unit: 'Days', color: '#16A34A' }, // Green
        { label: 'Category B', title: 'Absents (A)', short: 'Absents (A)', value: summary.avgAbsentDays, unit: 'Days', color: '#DC2626' }, // Red
        { label: 'Category C', title: 'On-Duty (OD)', short: 'On-Duty (OD)', value: summary.avgODDays, unit: 'Days', color: '#0284C7' }, // Cyan
        { label: 'Category D', title: 'Medical (ML)', short: 'Medical (ML)', value: summary.avgMLDays, unit: 'Days', color: '#EAB308' }, // Amber
      ]
    }
  }, [chartMode, summary])

  // Dynamic Y-Axis Scale Computation
  const dynamicMax = Math.max(...verticalBarCategories.map((c) => c.value), 10)
  const numSteps = 8
  const rawStep = dynamicMax / numSteps
  let stepVal = Math.ceil(rawStep)
  if (stepVal > 10) stepVal = Math.ceil(stepVal / 5) * 5
  else stepVal = Math.max(1, stepVal)

  const chartMaxY = stepVal * numSteps

  const dynamicYTicks = useMemo(() => {
    const ticks = []
    for (let i = numSteps; i >= 0; i--) {
      ticks.push(i * stepVal)
    }
    return ticks
  }, [stepVal, numSteps])

  // 1. Download Bar Graph & Vector Diagram PDF
  const handleDownloadBarGraphPDF = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const yearLabel = selectedYear === 'ALL' ? 'All 4 Academic Years' : `Year ${selectedYear}`
      const semLabel = selectedSemester === 'ALL' ? 'All Semesters' : `Semester ${selectedSemester}`
      const secLabel = selectedSection === 'ALL' ? 'All Sections' : `Section ${selectedSection}`

      generateAttendanceBarGraphPDF({
        title: 'HOD EXECUTIVE VISUAL ATTENDANCE AUDIT & BAR GRAPH REPORT',
        subtitle: 'V.S.B. Engineering College · Department of AI & DS · Head of Department',
        scope: `${yearLabel} · ${semLabel} · ${secLabel}`,
        dateRange: `${startDate} to ${endDate}`,
        totalStudents: summary.totalStudents,
        totalWorking: summary.totalWorking,
        totalPresents: summary.eligibleCount,
        totalODs: summary.odClaimantsCount,
        totalMLs: summary.mlClaimantsCount,
        totalAbsents: summary.shortageCount,
        avgPct: summary.avgPct,
        eligibleCount: summary.eligibleCount,
        shortageCount: summary.shortageCount,
        fileName: `HOD_Attendance_BarGraph_Report_${selectedYear}_${startDate}_${endDate}`,
      })

      setIsGenerating(false)
      setGeneratedMessage('HOD Bar Chart PDF downloaded successfully!')
      setTimeout(() => setGeneratedMessage(''), 4000)
    }, 500)
  }

  // 2. Download Tabular PDF
  const handleDownloadTablePDF = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const yearLabel = selectedYear === 'ALL' ? 'All 4 Academic Years' : `Year ${selectedYear}`
      const semLabel = selectedSemester === 'ALL' ? 'All Semesters' : `Semester ${selectedSemester}`
      const secLabel = selectedSection === 'ALL' ? 'All Sections' : `Section ${selectedSection}`

      generateAndDownloadPDF({
        title: 'HOD EXECUTIVE DEPARTMENT ATTENDANCE AUDIT REPORT',
        subtitle: `V.S.B. Engineering College · Department of AI & DS · Period: ${startDate} to ${endDate}`,
        author: 'Office of the Head of Department',
        category: 'Official Attendance Audit & Defaulter Registry',
        sections: [
          {
            heading: '1. EXECUTIVE ATTENDANCE METRICS',
            body: [
              `Scope: ${yearLabel} · ${semLabel} · ${secLabel}`,
              `Audit Period: ${startDate} to ${endDate} (${summary.totalWorking} Working Days)`,
              `Total Evaluated Students: ${filteredStudents.length} Students`,
              `Eligible for Exams (>= 75%): ${summary.eligibleCount} Candidates`,
              `Attendance Shortage (< 75%): ${summary.shortageCount} Defaulters`,
              `Cohort Average Attendance: ${summary.avgPct}%`,
            ],
          },
          {
            heading: '2. CANDIDATE ATTENDANCE ROSTER (HIGHEST ABSENTS FIRST)',
            body: filteredStudents.map(
              (s, idx) =>
                `${idx + 1}. [${s.regNo}] ${s.name} (${s.section}) — Working: ${summary.totalWorking}D | Present: ${s.presentDays}D | OD: ${s.odDays}D | ML: ${s.mlDays}D | Absents: ${s.absentDays}D (${s.percentage}%) -> ${s.status === 'ELIGIBLE' ? 'ELIGIBLE' : 'ATTENDANCE SHORTAGE (< 75%)'}`
            ),
          },
        ],
        fileName: `HOD_Attendance_Report_${selectedYear}_${startDate}_${endDate}_2026`,
      })

      setIsGenerating(false)
      setGeneratedMessage('HOD Table PDF report downloaded successfully!')
      setTimeout(() => setGeneratedMessage(''), 4000)
    }, 500)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              HOD Executive Directorate
            </span>
            <span className="text-xs text-gray-300 font-medium">· Real-Time Advisor Morning Attendance Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Department Reports &amp; Visual Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Live student attendance across 4 Academic Years &amp; 4 Sections (A, B, C, D) updating automatically when advisors post morning attendance.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            onClick={handleDownloadTablePDF}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Table PDF
          </button>
          <button
            onClick={handleDownloadBarGraphPDF}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#18A0B8] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" /> Bar Chart PDF
          </button>
        </div>
      </div>

      {generatedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{generatedMessage}</span>
          </div>
        </div>
      )}

      {/* TOP KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-black uppercase text-gray-400">Total Enrolled</span>
          <p className="text-2xl font-black text-[#1455D9] mt-0.5">{summary.totalStudents} Students</p>
          <span className="text-[10px] text-gray-500 font-semibold">Active in Selection</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/30">
          <span className="text-[10px] font-black uppercase text-emerald-700">Eligible (&gt;= 75%)</span>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">{summary.eligibleCount} Students</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{summary.avgPct}% Avg Attendance</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs bg-red-50/30">
          <span className="text-[10px] font-black uppercase text-red-700">Shortage (&lt; 75%)</span>
          <p className="text-2xl font-black text-red-700 mt-0.5">{summary.shortageCount} Defaulters</p>
          <span className="text-[10px] text-red-600 font-semibold">Action Required</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/30">
          <span className="text-[10px] font-black uppercase text-blue-700">Working Scope</span>
          <p className="text-2xl font-black text-blue-700 mt-0.5">{summary.totalWorking} Days</p>
          <span className="text-[10px] text-blue-600 font-semibold">{startDate} to {endDate}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5-COLUMN BAR CHART: TOTAL STUDENTS | PRESENTS | ABSENTS | OD | ML         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Bar Chart</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1455D9] text-white text-[10px] font-black uppercase">
                {selectedYear === 'ALL' ? 'All 4 Years' : `Year ${selectedYear}`}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Live breakdown: <strong>Total Students</strong>, <strong>Presents (P)</strong>, <strong>Absents (A)</strong>, <strong>On-Duty (OD)</strong> &amp; <strong>Medical (ML)</strong>
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => setChartMode('students')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chartMode === 'students' ? 'bg-[#071A3D] text-white shadow-xs' : 'text-gray-600 hover:text-[#071A3D]'
              }`}
            >
              👥 By Student Count
            </button>
            <button
              onClick={() => setChartMode('days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chartMode === 'days' ? 'bg-[#071A3D] text-white shadow-xs' : 'text-gray-600 hover:text-[#071A3D]'
              }`}
            >
              📅 By Days / Student
            </button>
          </div>
        </div>

        {/* Legend Box */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${chartMode === 'students' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-2 sm:gap-3 bg-gray-50/80 p-2.5 sm:p-3.5 rounded-2xl border border-gray-100 text-xs`}>
          {verticalBarCategories.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-bold text-gray-800 text-[10px] sm:text-[11px] truncate">
                {cat.label}: <strong>{cat.short}</strong>
              </span>
            </div>
          ))}
        </div>

        {/* Canvas Column Bar Chart with Dynamic Y-Axis */}
        <div className="relative pt-4 pb-1 px-1 sm:px-2 bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <div className="flex items-end gap-1.5 sm:gap-3 h-72 sm:h-80 pl-8 sm:pl-12 pr-2 sm:pr-4 pb-7 sm:pb-8 relative border-b-2 border-l-2 border-gray-300 min-w-[290px]">
            {/* Dynamic Y-Axis Tick Numbers */}
            <div className="absolute left-0 top-0 bottom-7 sm:bottom-8 w-8 sm:w-12 flex flex-col justify-between items-end pr-1 sm:pr-2.5 text-[9px] sm:text-[11px] font-mono text-gray-400 font-bold select-none">
              {dynamicYTicks.map((tick) => (
                <span key={tick} className="leading-none">
                  {tick}
                </span>
              ))}
            </div>

            {/* Horizontal Reference Grid Lines */}
            <div className="absolute left-8 sm:left-12 right-2 sm:right-4 top-0 bottom-7 sm:bottom-8 flex flex-col justify-between pointer-events-none">
              {dynamicYTicks.map((tick) => (
                <div key={tick} className="w-full border-b border-gray-100" />
              ))}
            </div>

            {/* Solid Vertical Columns */}
            <div className="w-full h-full flex items-end justify-between gap-1.5 sm:gap-6 md:gap-8 relative z-10">
              {verticalBarCategories.map((cat, idx) => {
                const heightPct = Math.min(100, Math.max(3, (cat.value / chartMaxY) * 100))
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                    {/* Value Badge above Column */}
                    <span
                      className="text-[9px] sm:text-xs md:text-sm font-black mb-1 font-mono transition-transform group-hover:scale-110 text-center leading-none whitespace-nowrap"
                      style={{ color: cat.color }}
                    >
                      {cat.value} {chartMode === 'students' ? 'Stud' : 'Days'}
                    </span>

                    {/* The Solid Vertical Column Bar */}
                    <div
                      className="w-full rounded-t-sm transition-all duration-700 shadow-xs group-hover:brightness-110 cursor-pointer"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: cat.color,
                      }}
                      title={`${cat.short}: ${cat.value} ${cat.unit}`}
                    />

                    {/* Bottom Category Label */}
                    <span className="text-[9px] sm:text-xs font-black text-gray-800 mt-1.5 text-center leading-tight line-clamp-2 max-w-full">
                      {cat.short}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            Active Scope: <strong className="text-gray-800">{selectedYear === 'ALL' ? 'All 4 Batches' : `Year ${selectedYear}`}</strong> · Period: <strong className="text-gray-800">{startDate}</strong> to <strong className="text-gray-800">{endDate}</strong> ({summary.totalWorking} Working Days)
          </span>

          <button
            onClick={handleDownloadBarGraphPDF}
            className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-102"
          >
            <Download className="w-4 h-4 text-[#F4C430]" /> Download Bar Chart PDF
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS & ATTENDANCE SUMMARY */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-5">
        {/* Step 1: Academic Year Cards */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#1455D9]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                Step 1: Choose Academic Cadre (Year)
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedYear('ALL')
                setSelectedSemester('ALL')
                setSelectedSection('ALL')
                setStatusFilter('ALL')
                setSearchQuery('')
              }}
              className="text-[11px] font-bold text-[#1455D9] hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <button
              onClick={() => {
                setSelectedYear('ALL')
                setSelectedSemester('ALL')
              }}
              className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                selectedYear === 'ALL'
                  ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-md ring-2 ring-[#071A3D]/20'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase block opacity-80">All 4 Batches</span>
              <p className="text-xs font-black mt-0.5">All Years</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-1 inline-block ${
                selectedYear === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {(studentsList || []).length} Students
              </span>
            </button>

            {[
              { year: 1, name: 'Year I', label: '1st Year (Freshman)', sems: [1, 2] },
              { year: 2, name: 'Year II', label: '2nd Year (Sophomore)', sems: [3, 4] },
              { year: 3, name: 'Year III', label: '3rd Year (Junior)', sems: [5, 6] },
              { year: 4, name: 'Year IV', label: '4th Year (Senior)', sems: [7, 8] },
            ].map((y) => {
              const isSelected = selectedYear === y.year
              const yCount = (studentsList || []).filter((s) => s.year === y.year).length
              return (
                <button
                  key={y.year}
                  onClick={() => {
                    setSelectedYear(y.year)
                    setSelectedSemester('ALL')
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1455D9] to-[#0A2A5E] text-white border-[#1455D9] shadow-md ring-2 ring-[#1455D9]/30 scale-101'
                      : 'bg-gray-50 hover:bg-blue-50/60 border-gray-200 text-gray-700'
                  }`}
                >
                  <span className={`text-[10px] font-extrabold uppercase block ${
                    isSelected ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {y.name}
                  </span>
                  <p className="text-xs font-black mt-0.5">{y.label}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-1 inline-block ${
                    isSelected ? 'bg-[#F4C430] text-[#071A3D]' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {yCount} Students
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Clean 3-Column Dropdowns + Search Bar */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* 1. Semester Scope */}
            <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-200/80 space-y-1">
              <label className="block font-bold text-[#071A3D] text-[11px] uppercase tracking-wider">
                1. Semester Scope
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-[#1455D9] bg-white focus:outline-none focus:border-[#1455D9] shadow-2xs"
              >
                <option value="ALL">
                  {selectedYear === 'ALL' ? 'All 8 Semesters' : `All Sems in Year ${selectedYear}`}
                </option>
                {availableSemesters.map((s) => (
                  <option key={s} value={s}>
                    Semester {s} (Year {Math.ceil(s / 2)})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Section Scope (All 4 Sections: A, B, C & D) */}
            <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-200/80 space-y-1">
              <label className="block font-bold text-[#071A3D] text-[11px] uppercase tracking-wider">
                2. Classroom Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9] shadow-2xs"
              >
                <option value="ALL">All 4 Sections (A, B, C &amp; D)</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>

            {/* 3. Attendance Status */}
            <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-200/80 space-y-1">
              <label className="block font-bold text-[#071A3D] text-[11px] uppercase tracking-wider">
                3. Attendance Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9] shadow-2xs"
              >
                <option value="ALL">All Status Candidates</option>
                <option value="SHORTAGE">Shortage (&lt; 75%) Only</option>
                <option value="ELIGIBLE">Eligible (&gt;= 75%) Only</option>
                <option value="OD_ONLY">On-Duty Claimants</option>
                <option value="ML_ONLY">Medical Leave Claimants</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT ATTENDANCE REGISTER TABLE */}
      <Card className="rounded-3xl border border-gray-200 bg-white shadow-md overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/50">
          <div>
            <h3 className="font-black text-base text-[#071A3D]">Candidate Attendance Audit Register</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredStudents.length} candidates in active scope (Sorted by highest absents first)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by student name or register no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs bg-white w-full sm:w-64 focus:ring-2 focus:ring-[#1455D9] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">Register No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Year / Sem</th>
                <th className="p-3.5">Sec</th>
                <th className="p-3.5 text-center text-emerald-300">Present (P)</th>
                <th className="p-3.5 text-center text-cyan-300">OD</th>
                <th className="p-3.5 text-center text-yellow-300">ML</th>
                <th className="p-3.5 text-center text-red-300">Absent (A)</th>
                <th className="p-3.5 text-center">Attendance %</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-gray-400 font-bold">
                    No students match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.regNo || idx} className="hover:bg-blue-50/40 transition-colors font-medium">
                    <td className="p-3.5 text-gray-400 text-[11px]">{idx + 1}</td>
                    <td className="p-3.5 font-mono font-bold text-[#1455D9]">{s.regNo}</td>
                    <td className="p-3.5 font-bold text-[#071A3D]">{s.name}</td>
                    <td className="p-3.5 text-gray-600">Year {s.year} (Sem {s.semester})</td>
                    <td className="p-3.5 font-bold text-purple-700">{s.section}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-700">{s.presentDays}D</td>
                    <td className="p-3.5 text-center font-bold text-cyan-700">{s.odDays}D</td>
                    <td className="p-3.5 text-center font-bold text-yellow-700">{s.mlDays}D</td>
                    <td className="p-3.5 text-center font-black text-red-600">{s.absentDays}D</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                        s.percentage >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {s.percentage}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        s.status === 'ELIGIBLE'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {s.status === 'ELIGIBLE' ? 'ELIGIBLE' : 'SHORTAGE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
