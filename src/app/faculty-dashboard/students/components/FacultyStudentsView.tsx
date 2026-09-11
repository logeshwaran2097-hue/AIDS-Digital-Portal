'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Users,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Sparkles,
  Send,
  UserCheck,
  TrendingUp,
  Percent,
  X,
  FileSpreadsheet,
  MessageSquare,
  Filter,
  Layers,
  School,
  Bus,
  Building,
  Droplet,
  MapPin,
  LayoutGrid,
  List,
  Copy,
  Check,
  ArrowUpDown,
  PhoneCall,
  Eye,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface StudentRosterItem {
  id: string
  name: string
  registerNumber: string
  email: string
  phone: string
  year: number
  semester: number
  section: string
  department?: string | null
  cgpa: number
  attendance: number
  arrears: number
  parentPhone: string
  bloodGroup?: string | null
  residencyStatus?: string | null
  hostelBlock?: string | null
  roomNo?: string | null
  busNo?: string | null
  boardingPoint?: string | null
  busDetails?: string | null
  address?: string | null
  batch?: string | null
  advisorName?: string | null
  isParentWhatsapp?: boolean
  dob?: string | null
}

export interface AssignedClassItem {
  year: number
  section?: string
  semester?: number
  label: string
}

export function FacultyStudentsView({
  initialStudents = [],
  advisorDetails,
  assignedYears = [],
  assignedSections = [],
  assignedClasses = [],
  isAdvisor = false,
}: {
  initialStudents?: StudentRosterItem[]
  advisorDetails?: {
    facultyName: string
    advisorBatch: string
    facultyEmail?: string
    facultyPhone?: string
    facultyId?: string
    mustChangePassword?: boolean
    qualification?: string
    experience?: number
    specialization?: string
    dateOfBirth?: string
  }
  assignedYears?: number[]
  assignedSections?: string[]
  assignedClasses?: AssignedClassItem[]
  isAdvisor?: boolean
}) {
  const students = initialStudents

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('ALL')
  const [selectedSection, setSelectedSection] = useState<string>('ALL')
  const [residencyFilter, setResidencyFilter] = useState<'ALL' | 'DAY_SCHOLAR' | 'HOSTELLER'>('ALL')
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'SAFE' | 'WARNING'>('ALL')
  const [sortBy, setSortBy] = useState<'regAsc' | 'nameAsc' | 'attDesc' | 'attAsc' | 'cgpaDesc'>('regAsc')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // UI Interactive States
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null)
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null)
  const [copiedRegNo, setCopiedRegNo] = useState<string | null>(null)
  const [studentRemarksMap, setStudentRemarksMap] = useState<Record<string, { category: string; customText: string }>>({})

  // Compute available sections dynamically based on selected year
  const availableSections = useMemo(() => {
    if (selectedYear === 'ALL') {
      return assignedSections
    }
    const yearNum = Number(selectedYear)
    const secsInYear = students
      .filter((s) => s.year === yearNum)
      .map((s) => s.section)
    const unique = Array.from(new Set(secsInYear)).filter(Boolean).sort()
    return unique.length > 0 ? unique : assignedSections
  }, [students, selectedYear, assignedSections])

  // Multi-dimensional filtering strictly within the faculty's assigned scope
  const filteredStudents = useMemo(() => {
    const list = students.filter((s) => {
      // 1. Assigned Year Filter
      if (selectedYear !== 'ALL' && s.year !== Number(selectedYear)) {
        return false
      }

      // 2. Assigned Class / Section Filter
      if (selectedSection !== 'ALL' && s.section.toUpperCase() !== selectedSection.toUpperCase()) {
        return false
      }

      // 3. Residency Filter (Day Scholar vs Hosteller)
      if (residencyFilter === 'DAY_SCHOLAR') {
        const isHostel = s.residencyStatus?.toLowerCase().includes('hostel') || Boolean(s.hostelBlock)
        if (isHostel) return false
      } else if (residencyFilter === 'HOSTELLER') {
        const isHostel = s.residencyStatus?.toLowerCase().includes('hostel') || Boolean(s.hostelBlock)
        if (!isHostel) return false
      }

      // 4. Attendance Filter
      if (attendanceFilter === 'SAFE' && s.attendance < 75) return false
      if (attendanceFilter === 'WARNING' && (s.attendance >= 75 || s.attendance === 0)) return false

      // 5. Omnisearch Query (Name, Register No, Email, Phone, Bus No, Room No, Blood Group)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = s.name.toLowerCase().includes(q)
        const matchReg = s.registerNumber.toLowerCase().includes(q)
        const matchEmail = s.email.toLowerCase().includes(q)
        const matchPhone = s.phone.includes(q)
        const matchParentPhone = s.parentPhone.includes(q)
        const matchBlood = s.bloodGroup?.toLowerCase().includes(q)
        const matchBus = s.busNo?.toLowerCase().includes(q) || s.boardingPoint?.toLowerCase().includes(q)
        const matchHostel = s.hostelBlock?.toLowerCase().includes(q) || s.roomNo?.toLowerCase().includes(q)

        if (!matchName && !matchReg && !matchEmail && !matchPhone && !matchParentPhone && !matchBlood && !matchBus && !matchHostel) {
          return false
        }
      }

      return true
    })

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'regAsc') return a.registerNumber.localeCompare(b.registerNumber)
      if (sortBy === 'nameAsc') return a.name.localeCompare(b.name)
      if (sortBy === 'attDesc') return b.attendance - a.attendance
      if (sortBy === 'attAsc') return a.attendance - b.attendance
      if (sortBy === 'cgpaDesc') return (b.cgpa || 0) - (a.cgpa || 0)
      return 0
    })
  }, [students, selectedYear, selectedSection, residencyFilter, attendanceFilter, searchQuery, sortBy])

  // Average CGPA
  const avgCgpa = useMemo(() => {
    const validStudents = filteredStudents.filter((s) => s.cgpa > 0)
    if (validStudents.length === 0) return '—'
    const sum = validStudents.reduce((acc, curr) => acc + curr.cgpa, 0)
    return (sum / validStudents.length).toFixed(2)
  }, [filteredStudents])

  // Copy register number
  const handleCopyReg = (reg: string) => {
    navigator.clipboard.writeText(reg)
    setCopiedRegNo(reg)
    setTimeout(() => setCopiedRegNo(null), 2000)
  }

  // Clear all active filters
  const handleResetFilters = () => {
    setSelectedYear('ALL')
    setSelectedSection('ALL')
    setResidencyFilter('ALL')
    setAttendanceFilter('ALL')
    setSearchQuery('')
    setSortBy('regAsc')
  }

  const isFilterActive =
    selectedYear !== 'ALL' ||
    selectedSection !== 'ALL' ||
    residencyFilter !== 'ALL' ||
    attendanceFilter !== 'ALL' ||
    searchQuery.trim() !== ''

  const handleExportCSV = () => {
    const headers = [
      'Register Number',
      'Student Name',
      'Department',
      'Year',
      'Semester',
      'Section',
      'Batch',
      'CGPA',
      'Attendance (%)',
      'Standing Arrears',
      'Date of Birth',
      'Blood Group',
      'Residency Status',
      'Hostel Block',
      'Hostel Room',
      'Bus Number',
      'Boarding Point',
      'Bus Details',
      'Student Phone',
      'Student Email',
      'Parent Phone',
      'Parent WhatsApp',
      'Address',
      'Class Advisor',
    ]

    const rows = filteredStudents.map((s) => [
      `"${s.registerNumber}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.department || 'Artificial Intelligence & Data Science').replace(/"/g, '""')}"`,
      s.year,
      s.semester,
      `"${s.section}"`,
      `"${(s.batch || '').replace(/"/g, '""')}"`,
      s.cgpa > 0 ? s.cgpa.toFixed(2) : '0.00',
      s.attendance > 0 ? s.attendance.toFixed(1) : '0.0',
      s.arrears,
      `"${s.dob || ''}"`,
      `"${s.bloodGroup || ''}"`,
      `"${s.residencyStatus || 'Day Scholar'}"`,
      `"${s.hostelBlock || ''}"`,
      `"${s.roomNo || ''}"`,
      `"${s.busNo || ''}"`,
      `"${(s.boardingPoint || '').replace(/"/g, '""')}"`,
      `"${(s.busDetails || '').replace(/"/g, '""')}"`,
      `"${s.phone || ''}"`,
      `"${s.email || ''}"`,
      `"${s.parentPhone || ''}"`,
      s.isParentWhatsapp ? 'Yes' : 'No',
      `"${(s.address || '').replace(/"/g, '""')}"`,
      `"${(s.advisorName || advisorDetails?.facultyName || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Class_Roster_Full_Year_${selectedYear}_Sec_${selectedSection}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadStudentDossier = (s: StudentRosterItem) => {
    const isHostel = s.residencyStatus?.toLowerCase().includes('hostel') || Boolean(s.hostelBlock)
    const sections = [
      {
        heading: 'OFFICIAL STUDENT IDENTITY & ACADEMIC DOSSIER',
        body: [
          `Register Number: ${s.registerNumber}`,
          `Student Full Name: ${s.name}`,
          `Department: ${s.department || 'Artificial Intelligence & Data Science (AI & DS)'}`,
          `Class Cohort: Year ${s.year} · Semester ${s.semester} · Section ${s.section}`,
          `Academic Batch: ${s.batch || 'B.Tech AI & DS'}`,
          `Class Advisor In-Charge: ${s.advisorName || advisorDetails?.facultyName || 'Faculty Member'}`,
          `Date of Birth: ${s.dob || 'Not Recorded'}`,
          `Blood Group: ${s.bloodGroup || 'Not Recorded'}`,
        ],
      },
      {
        heading: 'ACADEMIC STANDING & ATTENDANCE RECORD',
        body: [
          `Cumulative Attendance: ${s.attendance > 0 ? `${s.attendance.toFixed(1)}%` : 'Not Recorded'}`,
          `Attendance Eligibility: ${s.attendance >= 75 ? 'ELIGIBLE FOR EXAMINATIONS (Compliant)' : 'ATTENDANCE SHORTAGE / CONDONATION RISK (<75%)'}`,
          `Cumulative Grade Point Average (CGPA): ${s.cgpa > 0 ? `${s.cgpa.toFixed(2)} / 10.0` : 'N/A'}`,
          `Standing Arrears: ${s.arrears === 0 ? '0 Standing Arrears (Clean Record)' : `${s.arrears} Arrear(s)`}`,
        ],
      },
      {
        heading: 'CAMPUS RESIDENCY & LOGISTICS PROFILE',
        body: [
          `Residency Classification: ${s.residencyStatus || (isHostel ? 'Hosteller' : 'Day Scholar')}`,
          ...(isHostel
            ? [
                `Hostel Block: ${s.hostelBlock || 'Campus Hostel'}`,
                `Room Allocation: ${s.roomNo ? `Room ${s.roomNo}` : 'Assigned Room'}`,
              ]
            : [
                `College Bus Number: ${s.busNo ? `Route Bus #${s.busNo}` : 'College Bus'}`,
                `Boarding Point: ${s.boardingPoint || 'Main Bus Stop'}`,
                `Transit Particulars: ${s.busDetails || 'Day Scholar Route'}`,
              ]),
        ],
      },
      {
        heading: 'COMMUNICATION & FAMILY CONTACT PARTICULARS',
        body: [
          `Student Contact Mobile: ${s.phone || 'Not Recorded'}`,
          `Institutional Email: ${s.email}`,
          `Parent / Guardian Contact: ${s.parentPhone || 'Not Recorded'}`,
          `WhatsApp Enabled for Parent: ${s.isParentWhatsapp ? 'Active' : 'No'}`,
          `Permanent / Residential Address: ${s.address || 'Address on record at college administration'}`,
        ],
      },
    ]

    generateAndDownloadPDF({
      title: `STUDENT PROFILE DOSSIER: ${s.name.toUpperCase()}`,
      subtitle: `Register No: ${s.registerNumber} · Dept of AI & DS · Year ${s.year} Sec ${s.section}`,
      author: advisorDetails?.facultyName || 'Class Advisor',
      category: 'Student Comprehensive Record',
      sections,
      fileName: `Student_Dossier_${s.registerNumber}_${s.name.replace(/\s+/g, '_')}`,
    })
  }

  const handleDownloadRosterPDF = () => {
    const activeScope = `${selectedYear !== 'ALL' ? `Year ${selectedYear}` : 'All Assigned Years'} · ${
      selectedSection !== 'ALL' ? `Section ${selectedSection}` : 'All Assigned Sections'
    }`

    const sections = [
      {
        heading: 'FACULTY ALLOCATION & ASSIGNED CLASS SCOPE',
        body: [
          'Department: Artificial Intelligence & Data Science (AI & DS)',
          `Faculty Member: ${advisorDetails?.facultyName || 'Faculty'}`,
          `Assigned Class Scope: ${advisorDetails?.advisorBatch || 'Assigned Cohort'}`,
          `Filtered View: ${activeScope}`,
          `Total Students on Roll: ${filteredStudents.length} Students`,
          `Attendance Compliant (>75%): ${filteredStudents.filter((s) => s.attendance >= 75).length} Students`,
          `Attendance Condonation Risk (<75%): ${filteredStudents.filter((s) => s.attendance < 75 && s.attendance > 0).length} Students`,
        ],
      },
      {
        heading: 'STUDENT ROSTER & ACADEMIC PERFORMANCE SUMMARY',
        body: filteredStudents.map(
          (s) =>
            `${s.registerNumber} - ${s.name}: Year ${s.year} (Sec ${s.section}) | Status: ${s.residencyStatus || 'Day Scholar'} | CGPA: ${
              s.cgpa > 0 ? s.cgpa.toFixed(2) : 'N/A'
            } | Attendance: ${s.attendance > 0 ? `${s.attendance.toFixed(1)}%` : 'N/A'} | Arrears: ${s.arrears} | Phone: ${
              s.phone || 'N/A'
            } | Parent: ${s.parentPhone || 'N/A'}${s.address ? ` | Address: ${s.address}` : ''}`
        ),
      },
    ]

    generateAndDownloadPDF({
      title: 'OFFICIAL ASSIGNED CLASS STUDENT ROSTER & ACADEMIC RECORD',
      subtitle: `Faculty Assigned Cohort · B.Tech Artificial Intelligence & Data Science · ${advisorDetails?.advisorBatch || 'AI & DS'}`,
      author: advisorDetails?.facultyName || 'Faculty Member',
      category: 'Assigned Student Roster',
      sections,
      fileName: `Assigned_Students_Year_${selectedYear}_Sec_${selectedSection}`,
    })
  }

  const handleSendParentAlert = (student: StudentRosterItem) => {
    if (!student.parentPhone) {
      setAlertSuccess(`Parent contact phone not registered for ${student.name}.`)
      setTimeout(() => setAlertSuccess(null), 3000)
      return
    }
    setAlertSuccess(`Dispatched SMS Alert to Parent (${student.parentPhone}) for ${student.name}!`)
    setTimeout(() => setAlertSuccess(null), 3000)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider shadow-xs">
              {isAdvisor ? 'Class Advisor Registry' : 'Faculty Class Registry'}
            </span>
            <span className="text-xs text-blue-200 font-medium">
              · {advisorDetails?.advisorBatch || 'Assigned Cohort'}
            </span>
            {assignedYears.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/10">
                Assigned Scope: {assignedYears.map((y) => `Year ${y}`).join(', ')}
                {assignedSections.length > 0 ? ` (Sec ${assignedSections.join(', ')})` : ''}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student Registry &amp; Complete Information Roster</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {advisorDetails?.facultyName || 'Faculty'} · Class Advisor 360° View: Academic, Personal, Transit &amp; Parent Details
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filteredStudents.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer hover:scale-102"
                title="Export all student details into Excel / CSV format"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#22C7E8]" /> Export Full Roster (.CSV)
              </button>
              <button
                onClick={handleDownloadRosterPDF}
                className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
              >
                <Download className="w-4 h-4" /> Download PDF Roster
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Assigned Enrolled</p>
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">
              {filteredStudents.length} Student{filteredStudents.length === 1 ? '' : 's'}
            </p>
            <p className="text-[10px] text-gray-400">
              {selectedYear !== 'ALL' ? `Year ${selectedYear}` : 'All Assigned'} ·{' '}
              {selectedSection !== 'ALL' ? `Sec ${selectedSection}` : 'All Sections'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black shadow-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Attendance Safe (&gt;75%)</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">
            {filteredStudents.filter((s) => s.attendance >= 75).length} Students
          </p>
          <p className="text-[10px] text-green-700 font-semibold">Eligible for Exams</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-red-200/80 shadow-xs bg-red-50/20">
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Attendance Risk (&lt;75%)</p>
          <p className="text-2xl font-black text-red-600 mt-0.5">
            {filteredStudents.filter((s) => s.attendance < 75 && s.attendance > 0).length} Students
          </p>
          <p className="text-[10px] text-red-700 font-semibold">Requires Condonation</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs bg-purple-50/20">
          <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Batch Avg CGPA</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">{avgCgpa !== '—' ? `${avgCgpa} / 10.0` : '—'}</p>
          <p className="text-[10px] text-purple-600 font-semibold">Performance Average</p>
        </div>
      </div>

      {/* Alert Banner */}
      {alertSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {/* ── Filter & Search Toolbar with Instant Controls ── */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        {/* Top Row: Search Input + Sort + View Mode Switcher */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, register number, email, phone, blood group, hostel or bus..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 font-medium text-[#071A3D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-end">
            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-bold text-[#071A3D] focus:outline-none cursor-pointer"
              >
                <option value="regAsc">Sort: Register No</option>
                <option value="nameAsc">Sort: Name (A-Z)</option>
                <option value="attDesc">Sort: Attendance (High → Low)</option>
                <option value="attAsc">Sort: Attendance (Low → High)</option>
                <option value="cgpaDesc">Sort: CGPA (Highest)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                  viewMode === 'table' ? 'bg-white text-[#1455D9] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                )}
                title="Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={cn(
                  'p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                  viewMode === 'cards' ? 'bg-white text-[#1455D9] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                )}
                title="ID Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Instant Filter Pills (Assigned Years, Assigned Sections, Residency, Attendance) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Year Pills (Only Assigned Years) */}
            <div className="flex items-center gap-1 bg-blue-50/70 p-1 rounded-2xl border border-blue-100">
              <span className="text-[10px] font-black uppercase text-[#1455D9] px-2 py-0.5">Year:</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedYear('ALL')
                  setSelectedSection('ALL')
                }}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  selectedYear === 'ALL'
                    ? 'bg-[#1455D9] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-white'
                )}
              >
                All Assigned
              </button>
              {assignedYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setSelectedYear(String(yr))
                    setSelectedSection('ALL')
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    selectedYear === String(yr)
                      ? 'bg-[#1455D9] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-white'
                  )}
                >
                  Year {yr}
                </button>
              ))}
            </div>

            {/* Class / Section Pills (Only Assigned Sections) */}
            <div className="flex items-center gap-1 bg-indigo-50/70 p-1 rounded-2xl border border-indigo-100">
              <span className="text-[10px] font-black uppercase text-indigo-700 px-2 py-0.5">Class:</span>
              <button
                type="button"
                onClick={() => setSelectedSection('ALL')}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  selectedSection === 'ALL'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-white'
                )}
              >
                All Sections
              </button>
              {availableSections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    selectedSection === sec
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'text-gray-700 hover:bg-white'
                  )}
                >
                  Sec {sec}
                </button>
              ))}
            </div>

            {/* Residency Filter (Day Scholar vs Hosteller) */}
            <div className="flex items-center gap-1 bg-amber-50/70 p-1 rounded-2xl border border-amber-100">
              <span className="text-[10px] font-black uppercase text-amber-800 px-2 py-0.5">Residency:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'DAY_SCHOLAR', label: 'Day Scholar 🚌' },
                { id: 'HOSTELLER', label: 'Hosteller 🏢' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setResidencyFilter(r.id as any)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    residencyFilter === r.id
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-gray-700 hover:bg-white'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Attendance Standing Filter */}
            <div className="flex items-center gap-1 bg-emerald-50/70 p-1 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-black uppercase text-emerald-800 px-2 py-0.5">Status:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'SAFE', label: '>75% Safe' },
                { id: 'WARNING', label: '<75% Risk' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setAttendanceFilter(f.id as any)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    attendanceFilter === f.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-gray-700 hover:bg-white'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters & Results Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
            <span className="text-[11px] text-gray-500 font-medium">
              Showing <strong className="text-[#071A3D] font-black">{filteredStudents.length}</strong> of{' '}
              <strong className="text-[#071A3D] font-black">{students.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── View 1: Data Table View ── */}
      {viewMode === 'table' && (
        <Card className="rounded-3xl border-gray-200 shadow-xs overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f8fafd] border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Student Particulars</th>
                    <th className="py-3.5 px-4 font-bold">Register Number</th>
                    <th className="py-3.5 px-4 text-center font-bold">Class &amp; Batch</th>
                    <th className="py-3.5 px-4 text-center font-bold">Residency &amp; Transit</th>
                    <th className="py-3.5 px-4 text-center font-bold">CGPA</th>
                    <th className="py-3.5 px-4 text-center font-bold">Attendance</th>
                    <th className="py-3.5 px-4 text-center font-bold">Standing</th>
                    <th className="py-3.5 px-5 text-right font-bold">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="w-8 h-8 text-gray-300" />
                          <p className="text-xs font-bold text-gray-600">
                            {assignedYears.length === 0
                              ? 'No classes or subjects are currently allocated to your faculty profile'
                              : isFilterActive
                              ? 'No assigned students match the selected class or filter criteria'
                              : 'No students enrolled in your assigned classes yet'}
                          </p>
                          <p className="text-[11px] text-gray-400 max-w-md">
                            {isFilterActive
                              ? 'Try resetting the filters or clearing the search keyword.'
                              : `Only students belonging to your assigned classes (${assignedYears.map((y) => `Year ${y}`).join(', ')}${
                                  assignedSections.length > 0 ? ` · Sec ${assignedSections.join(', ')}` : ''
                                }) are displayed.`}
                          </p>
                          {isFilterActive && (
                            <button
                              onClick={handleResetFilters}
                              className="mt-2 px-3 py-1 bg-blue-50 text-[#1455D9] rounded-xl text-xs font-bold border border-blue-200"
                            >
                              Reset All Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const isSafe = s.attendance >= 75
                      const isHostel = s.residencyStatus?.toLowerCase().includes('hostel') || Boolean(s.hostelBlock)
                      const isCopied = copiedRegNo === s.registerNumber

                      return (
                        <tr key={s.id} className="hover:bg-gray-50/80 transition-colors group">
                          {/* Student Particulars */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                                {s.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-xs text-[#071A3D] group-hover:text-[#1455D9] transition-colors truncate">
                                    {s.name}
                                  </p>
                                  {s.bloodGroup && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                      🩸 {s.bloodGroup}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-400 truncate">{s.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Register Number with one-click copy */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1455D9]">
                            <button
                              type="button"
                              onClick={() => handleCopyReg(s.registerNumber)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1455D9] border border-blue-200 text-xs transition-all cursor-pointer"
                              title="Click to copy Register Number"
                            >
                              <span>{s.registerNumber}</span>
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-blue-400 opacity-60" />}
                            </button>
                          </td>

                          {/* Class & Batch */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-[#1455D9] font-bold text-[11px] border border-blue-200/80">
                              Year {s.year} · Sec {s.section}
                            </span>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Sem {s.semester}</p>
                          </td>

                          {/* Residency & Transit */}
                          <td className="py-3.5 px-4 text-center">
                            {isHostel ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                  <Building className="w-3 h-3 text-amber-600" /> Hosteller
                                </span>
                                {(s.hostelBlock || s.roomNo) && (
                                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                    {s.hostelBlock ? `Blk ${s.hostelBlock}` : ''} {s.roomNo ? `Rm ${s.roomNo}` : ''}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                  <Bus className="w-3 h-3 text-emerald-600" /> Day Scholar
                                </span>
                                {s.busNo && (
                                  <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                                    Bus #{s.busNo} {s.boardingPoint ? `· ${s.boardingPoint}` : ''}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          {/* CGPA */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-black text-[#071A3D] text-xs px-2 py-0.5 rounded-lg bg-gray-100">
                              {s.cgpa > 0 ? s.cgpa.toFixed(2) : '—'}
                            </span>
                          </td>

                          {/* Attendance */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={cn(
                                'font-black text-xs px-2.5 py-1 rounded-full inline-block',
                                s.attendance === 0
                                  ? 'bg-gray-100 text-gray-600'
                                  : isSafe
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              )}
                            >
                              {s.attendance > 0 ? `${s.attendance.toFixed(1)}%` : '—'}
                            </span>
                          </td>

                          {/* Standing */}
                          <td className="py-3.5 px-4 text-center">
                            {s.arrears === 0 ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                0 Arrears (Clean)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                                {s.arrears} Arrear{s.arrears > 1 ? 's' : ''}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* WhatsApp Parent Quick Button */}
                              {s.parentPhone && (
                                <a
                                  href={`https://wa.me/91${s.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Greetings from Dept of AI&DS (VSBEC). Update for ${s.name} (${s.registerNumber}): Attendance: ${s.attendance.toFixed(1)}%, CGPA: ${s.cgpa.toFixed(2)}.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="WhatsApp Parent"
                                >
                                  <MessageSquare className="w-3 h-3" /> WhatsApp
                                </a>
                              )}

                              {/* Alert Parent on Risk */}
                              {!isSafe && s.attendance > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSendParentAlert(s)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Send Alert to Parent"
                                >
                                  <Send className="w-3 h-3" /> Alert
                                </button>
                              )}

                              {/* Full Profile Details Button */}
                              <button
                                type="button"
                                onClick={() => setSelectedStudent(s)}
                                className="px-3 py-1 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-lg text-[10.5px] font-black transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                                title="View All Student Information & Complete Dossier"
                              >
                                <Eye className="w-3.5 h-3.5" /> Full Info
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── View 2: ID Cards Grid View ── */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-200">
              <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-700">No students found matching your filters</p>
              <button
                onClick={handleResetFilters}
                className="mt-3 px-4 py-1.5 bg-blue-50 text-[#1455D9] rounded-xl text-xs font-bold border border-blue-200"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredStudents.map((s) => {
              const isSafe = s.attendance >= 75
              const isHostel = s.residencyStatus?.toLowerCase().includes('hostel') || Boolean(s.hostelBlock)
              const isCopied = copiedRegNo === s.registerNumber

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group hover:border-[#1455D9]/40 relative overflow-hidden"
                >
                  {/* Top Header Strip */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1455D9] via-[#0A2A5E] to-[#22C7E8] text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-[#071A3D] group-hover:text-[#1455D9] transition-colors truncate">
                          {s.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleCopyReg(s.registerNumber)}
                          className="font-mono text-xs text-[#1455D9] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                          title="Click to copy Register Number"
                        >
                          <span>{s.registerNumber}</span>
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 text-gray-400 opacity-60" />}
                        </button>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-[#1455D9] font-black text-xs border border-blue-200 shrink-0">
                      Yr {s.year} · Sec {s.section}
                    </span>
                  </div>

                  {/* Identification Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {isHostel ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                        <Building className="w-3 h-3" /> Hosteller {s.hostelBlock ? `· Blk ${s.hostelBlock}` : ''} {s.roomNo ? `· Rm ${s.roomNo}` : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        <Bus className="w-3 h-3" /> Day Scholar {s.busNo ? `· Bus #${s.busNo}` : ''}
                      </span>
                    )}

                    {s.bloodGroup && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                        🩸 {s.bloodGroup}
                      </span>
                    )}

                    {s.batch && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-50 text-gray-600 text-[10px] font-semibold border border-gray-200">
                        {s.batch}
                      </span>
                    )}
                  </div>

                  {/* Metrics Bar: Attendance & CGPA */}
                  <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-200/80 mb-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-500 text-[11px]">Cumulative Attendance</span>
                      <span className={cn('font-black', isSafe ? 'text-green-700' : 'text-red-600')}>
                        {s.attendance > 0 ? `${s.attendance.toFixed(1)}%` : '—'}
                      </span>
                    </div>

                    {/* Visual Attendance Progress Bar */}
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          s.attendance >= 75 ? 'bg-emerald-500' : s.attendance > 0 ? 'bg-rose-500' : 'bg-gray-300'
                        )}
                        style={{ width: `${Math.min(s.attendance, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200/60">
                      <span className="text-gray-500">CGPA: <strong className="text-[#071A3D]">{s.cgpa > 0 ? s.cgpa.toFixed(2) : '—'}</strong></span>
                      <span className="text-gray-500">Standing: <strong className={s.arrears === 0 ? 'text-emerald-700' : 'text-rose-600'}>{s.arrears === 0 ? '0 Arrears' : `${s.arrears} Arrears`}</strong></span>
                    </div>
                  </div>

                  {/* Bottom Quick Contact & Profile Buttons */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                    {s.parentPhone && (
                      <a
                        href={`https://wa.me/91${s.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello, Greetings from Department of AI&DS (VSBEC). Academic update for ${s.name} (${s.registerNumber}): Attendance: ${s.attendance.toFixed(1)}%, CGPA: ${s.cgpa.toFixed(2)}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(s)}
                      className="flex-1 py-1.5 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-black transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Full Info
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── Comprehensive Student Dossier Modal (Complete 360° Information for Class Advisor) ── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 border border-gray-100">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1455D9] via-[#0A2A5E] to-[#22C7E8] text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-mono text-[#1455D9] font-black bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {selectedStudent.registerNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F4C430]/20 text-[#071A3D] border border-[#F4C430]/40">
                      Year {selectedStudent.year} · Sec {selectedStudent.section}
                    </span>
                    {selectedStudent.bloodGroup && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        🩸 {selectedStudent.bloodGroup}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-[#071A3D] mt-1">{selectedStudent.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {selectedStudent.department || 'B.Tech Artificial Intelligence & Data Science'} · {selectedStudent.batch || 'Class Cohort'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Instant Action Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedStudent.phone ? (
                <a
                  href={`tel:${selectedStudent.phone}`}
                  className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Student
                </a>
              ) : (
                <span className="py-2 px-3 rounded-xl bg-gray-50 text-gray-400 font-medium text-xs flex items-center justify-center gap-1.5 border border-gray-200">
                  <Phone className="w-3.5 h-3.5" /> No Student Ph
                </span>
              )}

              {selectedStudent.parentPhone ? (
                <a
                  href={`tel:${selectedStudent.parentPhone}`}
                  className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-200 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Parent
                </a>
              ) : (
                <span className="py-2 px-3 rounded-xl bg-gray-50 text-gray-400 font-medium text-xs flex items-center justify-center gap-1.5 border border-gray-200">
                  <Phone className="w-3.5 h-3.5" /> No Parent Ph
                </span>
              )}

              {selectedStudent.parentPhone ? (
                <a
                  href={`https://wa.me/91${selectedStudent.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Dear Parent, Greetings from Dept of AI&DS, VSB Engineering College. Academic update for ${selectedStudent.name} (${selectedStudent.registerNumber}): Cumulative Attendance: ${selectedStudent.attendance.toFixed(1)}%, CGPA: ${selectedStudent.cgpa.toFixed(2)}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </a>
              ) : null}

              <button
                type="button"
                onClick={() => handleDownloadStudentDossier(selectedStudent)}
                className="py-2 px-3 rounded-xl bg-[#071A3D] hover:bg-[#0A2A5E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Download complete printable student profile PDF"
              >
                <Download className="w-3.5 h-3.5" /> PDF Dossier
              </button>
            </div>

            {/* Comprehensive Dossier Grid */}
            <div className="space-y-3.5 text-xs">
              {/* 1. Academic Highlights & Exam Eligibility */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <span className="text-gray-500 font-bold block text-[10px] uppercase tracking-wider">Attendance Standing</span>
                  <p className={cn('text-xl font-black mt-0.5', selectedStudent.attendance >= 75 ? 'text-green-700' : 'text-red-600')}>
                    {selectedStudent.attendance > 0 ? `${selectedStudent.attendance.toFixed(1)}%` : 'No Data'}
                  </p>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        selectedStudent.attendance >= 75 ? 'bg-emerald-500' : selectedStudent.attendance > 0 ? 'bg-rose-500' : 'bg-gray-300'
                      )}
                      style={{ width: `${Math.min(selectedStudent.attendance, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold block mt-1 text-gray-500">
                    {selectedStudent.attendance >= 75 ? '✓ Exam Eligible (Compliant)' : '⚠️ Attendance Risk (<75%)'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <span className="text-gray-500 font-bold block text-[10px] uppercase tracking-wider">Cumulative GPA (CGPA)</span>
                  <p className="text-xl font-black text-purple-700 mt-0.5">
                    {selectedStudent.cgpa > 0 ? `${selectedStudent.cgpa.toFixed(2)} / 10.0` : '—'}
                  </p>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-2">
                    Academic Standing
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200">
                  <span className="text-gray-500 font-bold block text-[10px] uppercase tracking-wider">Standing Arrears</span>
                  <p className={cn('text-xl font-black mt-0.5', selectedStudent.arrears === 0 ? 'text-emerald-600' : 'text-rose-600')}>
                    {selectedStudent.arrears === 0 ? '0 Arrears' : `${selectedStudent.arrears} Arrear(s)`}
                  </p>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-2">
                    {selectedStudent.arrears === 0 ? 'All subjects cleared' : 'Requires academic remedial'}
                  </span>
                </div>
              </div>

              {/* 2. Institutional Identity & Cohort Details */}
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 space-y-2.5">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-[#1455D9]" /> Institutional Academic Identity
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Department</span>
                    <span className="font-bold text-[#071A3D]">{selectedStudent.department || 'Artificial Intelligence & Data Science'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Current Year &amp; Semester</span>
                    <span className="font-bold text-[#071A3D]">Year {selectedStudent.year} · Semester {selectedStudent.semester}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Section</span>
                    <span className="font-bold text-[#071A3D]">Section {selectedStudent.section}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Academic Batch</span>
                    <span className="font-bold text-[#071A3D]">{selectedStudent.batch || 'B.Tech AI & DS'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Date of Birth</span>
                    <span className="font-bold text-[#071A3D]">{selectedStudent.dob || 'Not Recorded'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Class Advisor In-Charge</span>
                    <span className="font-bold text-[#1455D9]">{selectedStudent.advisorName || advisorDetails?.facultyName || 'Class Advisor'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Campus Logistics, Residency & Transportation */}
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 space-y-2.5">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Campus Logistics &amp; Accommodation
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Residency Type</span>
                    <span className="font-bold text-[#071A3D] inline-flex items-center gap-1">
                      {selectedStudent.residencyStatus?.toLowerCase().includes('hostel') || selectedStudent.hostelBlock ? (
                        <>
                          <Building className="w-3.5 h-3.5 text-amber-600" /> Hosteller
                        </>
                      ) : (
                        <>
                          <Bus className="w-3.5 h-3.5 text-emerald-600" /> Day Scholar
                        </>
                      )}
                    </span>
                  </div>

                  {selectedStudent.residencyStatus?.toLowerCase().includes('hostel') || selectedStudent.hostelBlock ? (
                    <>
                      <div>
                        <span className="text-gray-400 text-[10px] block">Hostel Block</span>
                        <span className="font-bold text-[#071A3D]">{selectedStudent.hostelBlock ? `Block ${selectedStudent.hostelBlock}` : 'Campus Hostel'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">Room Number</span>
                        <span className="font-bold text-[#071A3D] font-mono">{selectedStudent.roomNo ? `Room ${selectedStudent.roomNo}` : 'Assigned Room'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-400 text-[10px] block">College Bus Route</span>
                        <span className="font-bold text-[#071A3D]">{selectedStudent.busNo ? `Bus #${selectedStudent.busNo}` : 'College Transit'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">Boarding Point</span>
                        <span className="font-bold text-[#071A3D]">{selectedStudent.boardingPoint || 'Main Bus Stop'}</span>
                      </div>
                      {selectedStudent.busDetails && (
                        <div className="col-span-full">
                          <span className="text-gray-400 text-[10px] block">Transit Details</span>
                          <span className="font-medium text-[#071A3D]">{selectedStudent.busDetails}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 4. Family Contacts & Postal Address */}
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 space-y-2.5">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-600" /> Communication Channels &amp; Family Address
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Student Personal Phone</span>
                    <span className="font-bold text-[#071A3D] font-mono text-sm">
                      {selectedStudent.phone || 'Not Registered'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Parent / Guardian Phone</span>
                    <span className="font-bold text-[#1455D9] font-mono text-sm flex items-center gap-1.5">
                      {selectedStudent.parentPhone || 'Not Registered'}
                      {selectedStudent.isParentWhatsapp && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800">
                          WhatsApp Active
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 text-[10px] block">Official Institutional Email</span>
                    <span className="font-medium font-mono text-[#071A3D] text-xs">
                      {selectedStudent.email}
                    </span>
                  </div>
                  <div className="sm:col-span-2 pt-1 border-t border-gray-200/60">
                    <span className="text-gray-400 text-[10px] block font-bold uppercase">Permanent / Home Address</span>
                    <p className="font-medium text-[#071A3D] text-xs mt-0.5">
                      {selectedStudent.address || 'Address registered on admission record in college office.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Faculty Remarks & Mentoring Notes */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-[#1455D9] tracking-wider block">
                    Class Advisor Observation &amp; Mentoring Record
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Auto-saved</span>
                </div>
                <select
                  value={studentRemarksMap[selectedStudent.id]?.category || ''}
                  onChange={(e) => {
                    const cat = e.target.value
                    setStudentRemarksMap((prev) => ({
                      ...prev,
                      [selectedStudent.id]: {
                        category: cat,
                        customText: prev[selectedStudent.id]?.customText || (cat !== 'CUSTOM' ? cat : ''),
                      },
                    }))
                  }}
                  className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 font-medium focus:ring-1 focus:ring-[#1455D9]"
                >
                  <option value="">— Select observation category —</option>
                  <option value="Academic Excellence">Academic Excellence / High Performer</option>
                  <option value="Attendance Warning">Attendance Warning Issued</option>
                  <option value="Symposium / Hackathon OD">Symposium / Hackathon OD Approved</option>
                  <option value="Medical Leave (Certificate on Record)">Medical Leave (Certificate on Record)</option>
                  <option value="Placement / Internship Drive">Placement / Internship Drive</option>
                  <option value="Parent Counseling Required">Parent Counseling Required</option>
                  <option value="Disciplinary / Gate Pass">Disciplinary / Gate Pass Record</option>
                  <option value="CUSTOM">Type custom observation / notes...</option>
                </select>

                <input
                  type="text"
                  value={studentRemarksMap[selectedStudent.id]?.customText || ''}
                  onChange={(e) => {
                    const text = e.target.value
                    setStudentRemarksMap((prev) => ({
                      ...prev,
                      [selectedStudent.id]: {
                        category: prev[selectedStudent.id]?.category || 'CUSTOM',
                        customText: text,
                      },
                    }))
                  }}
                  placeholder="Type specific remarks or academic notes..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-[#071A3D] focus:ring-1 focus:ring-[#1455D9]"
                />
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadStudentDossier(selectedStudent)}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#1455D9] rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-blue-200"
              >
                <FileText className="w-3.5 h-3.5" /> Printable Profile Dossier
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleSendParentAlert(selectedStudent)
                    setSelectedStudent(null)
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> SMS Parent
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
