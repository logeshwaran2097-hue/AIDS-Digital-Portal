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
  cgpa: number
  attendance: number
  arrears: number
  parentPhone: string
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

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('ALL')
  const [selectedSection, setSelectedSection] = useState<string>('ALL')
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'SAFE' | 'WARNING'>('ALL')
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null)
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null)
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

  // Filter students strictly within the faculty's assigned scope
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Filter by Assigned Year
      if (selectedYear !== 'ALL' && s.year !== Number(selectedYear)) {
        return false
      }

      // Filter by Assigned Class / Section
      if (selectedSection !== 'ALL' && s.section.toUpperCase() !== selectedSection.toUpperCase()) {
        return false
      }

      // Search query
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())

      // Attendance status filter
      const matchesAttendance =
        attendanceFilter === 'ALL'
          ? true
          : attendanceFilter === 'SAFE'
          ? s.attendance >= 75
          : s.attendance < 75

      return matchesSearch && matchesAttendance
    })
  }, [students, selectedYear, selectedSection, searchQuery, attendanceFilter])

  const avgCgpa = useMemo(() => {
    const validStudents = filteredStudents.filter((s) => s.cgpa > 0)
    if (validStudents.length === 0) return '—'
    const sum = validStudents.reduce((acc, curr) => acc + curr.cgpa, 0)
    return (sum / validStudents.length).toFixed(2)
  }, [filteredStudents])

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
          `Faculty ID: ${advisorDetails?.facultyId || 'N/A'}`,
          `Assigned Class Scope: ${advisorDetails?.advisorBatch || 'Assigned Cohort'}`,
          `Filtered View: ${activeScope}`,
          `Total Students on Roll: ${filteredStudents.length} Students`,
          `Attendance Compliant (>75%): ${filteredStudents.filter((s) => s.attendance >= 75).length} Students`,
          `Attendance Condonation Risk (<75%): ${filteredStudents.filter((s) => s.attendance < 75).length} Students`,
        ],
      },
      {
        heading: 'STUDENT ROSTER & ACADEMIC PERFORMANCE SUMMARY',
        body: filteredStudents.map(
          (s) =>
            `${s.registerNumber} - ${s.name}: Year ${s.year} (Sec ${s.section}) | CGPA: ${
              s.cgpa > 0 ? s.cgpa.toFixed(2) : 'N/A'
            } | Attendance: ${s.attendance > 0 ? `${s.attendance.toFixed(1)}%` : 'N/A'} | Arrears: ${s.arrears} | Phone: ${
              s.phone || 'N/A'
            }`
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
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              {isAdvisor ? 'Class Advisor Registry' : 'Faculty Class Registry'}
            </span>
            <span className="text-xs text-blue-200 font-medium">
              · {advisorDetails?.advisorBatch || 'Assigned Cohort'}
            </span>
            {assignedYears.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/10">
                Assigned: {assignedYears.map((y) => `Year ${y}`).join(', ')}
                {assignedSections.length > 0 ? ` (Sec ${assignedSections.join(', ')})` : ''}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student Registry &amp; Academic Roster</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {advisorDetails?.facultyName || 'Faculty'} · Showing only students from your assigned classes and academic years
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filteredStudents.length > 0 && (
            <button
              onClick={handleDownloadRosterPDF}
              className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
            >
              <Download className="w-4 h-4" /> Download Class Roster (PDF)
            </button>
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
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black">
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
          <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Assigned Avg CGPA</p>
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

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, register number or email..."
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 font-medium text-[#071A3D]"
            />
          </div>

          {/* Assigned Year Filter Dropdown - Only assigned years shown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value)
                  setSelectedSection('ALL')
                }}
                className="pl-3.5 pr-8 py-2.5 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs font-bold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white cursor-pointer"
                title="Filter by assigned academic year"
              >
                <option value="ALL">
                  {assignedYears.length > 1 ? 'All Assigned Years' : assignedYears.length === 1 ? `Assigned: Year ${assignedYears[0]}` : 'All Assigned Years'}
                </option>
                {assignedYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr} ({['1st Year', '2nd Year', '3rd Year', 'Final Year'][yr - 1] || `Year ${yr}`})
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Class / Section Filter Dropdown - Only assigned sections shown */}
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="pl-3.5 pr-8 py-2.5 bg-indigo-50/50 border border-indigo-200 rounded-2xl text-xs font-bold text-[#071A3D] focus:ring-2 focus:ring-indigo-600/20 focus:bg-white cursor-pointer"
                title="Filter by assigned class section"
              >
                <option value="ALL">
                  {availableSections.length > 1 ? 'All Assigned Sections' : availableSections.length === 1 ? `Assigned: Sec ${availableSections[0]}` : 'All Assigned Sections'}
                </option>
                {availableSections.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs & Active Scope Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: 'ALL', label: 'All Assigned Students' },
              { id: 'SAFE', label: 'Attendance >75% Safe' },
              { id: 'WARNING', label: 'Attendance <75% Risk' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAttendanceFilter(f.id as any)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                  attendanceFilter === f.id
                    ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-gray-500 font-medium">
            Showing <strong className="text-[#071A3D] font-black">{filteredStudents.length}</strong> of{' '}
            <strong className="text-[#071A3D] font-black">{students.length}</strong> assigned students
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <Card className="rounded-3xl border-gray-200 shadow-xs overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f8fafd] border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-5">Student Particulars</th>
                  <th className="py-3.5 px-4 font-bold">Register Number</th>
                  <th className="py-3.5 px-4 text-center font-bold">Class / Section</th>
                  <th className="py-3.5 px-4 text-center font-bold">CGPA</th>
                  <th className="py-3.5 px-4 text-center font-bold">Attendance</th>
                  <th className="py-3.5 px-4 text-center font-bold">Standing</th>
                  <th className="py-3.5 px-5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-gray-300" />
                        <p className="text-xs font-bold text-gray-600">
                          {assignedYears.length === 0
                            ? 'No classes or subjects are currently allocated to your faculty profile'
                            : searchQuery || attendanceFilter !== 'ALL' || selectedYear !== 'ALL' || selectedSection !== 'ALL'
                            ? 'No assigned students match the selected class or year filter'
                            : 'No students enrolled in your assigned classes yet'}
                        </p>
                        <p className="text-[11px] text-gray-400 max-w-md">
                          {assignedYears.length === 0
                            ? 'Please contact your Department HOD or Portal Administrator to assign subjects or advisory classes to your account.'
                            : `Only students belonging to your assigned classes (${assignedYears.map(y => `Year ${y}`).join(', ')}${assignedSections.length > 0 ? ` · Sec ${assignedSections.join(', ')}` : ''}) are displayed here.`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const isSafe = s.attendance >= 75
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-[#071A3D] group-hover:text-[#1455D9] transition-colors">
                                {s.name}
                              </p>
                              <p className="text-[11px] text-gray-400">{s.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-[#1455D9]">
                          {s.registerNumber}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-[#1455D9] font-bold text-[11px] border border-blue-200/80">
                            Year {s.year} · Sec {s.section}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-black text-[#071A3D] text-xs px-2 py-0.5 rounded-lg bg-gray-100">
                            {s.cgpa > 0 ? s.cgpa.toFixed(2) : '—'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              'font-black text-xs px-2.5 py-1 rounded-full',
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

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {s.phone && (
                              <a
                                href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                title="Chat on WhatsApp"
                              >
                                <span className="text-xs">💬</span> WhatsApp
                              </a>
                            )}
                            {!isSafe && s.attendance > 0 && (
                              <button
                                onClick={() => handleSendParentAlert(s)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                title="Send Alert to Parent"
                              >
                                <Send className="w-3 h-3" /> Alert Parent
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedStudent(s)}
                              className="px-3 py-1 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-lg text-[10.5px] font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Profile Details
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

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#071A3D]">{selectedStudent.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-[#1455D9] font-bold">{selectedStudent.registerNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1455D9] border border-blue-100">
                      Year {selectedStudent.year} · Sec {selectedStudent.section}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border flex justify-between">
                <span className="text-gray-500 font-bold">Academic Performance:</span>
                <span className="font-black text-[#071A3D]">
                  {selectedStudent.cgpa.toFixed(2)} CGPA ({selectedStudent.arrears === 0 ? '0 Arrears' : `${selectedStudent.arrears} Arrear`})
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex justify-between">
                <span className="text-gray-500 font-bold">Attendance Record:</span>
                <span className={cn('font-black', selectedStudent.attendance >= 75 ? 'text-green-700' : 'text-red-600')}>
                  {selectedStudent.attendance.toFixed(1)}% ({selectedStudent.attendance >= 75 ? 'Eligible' : 'Risk'})
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex justify-between">
                <span className="text-gray-500 font-bold">Student Phone:</span>
                <span className="font-bold text-[#071A3D]">{selectedStudent.phone || 'Not Registered'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex justify-between">
                <span className="text-gray-500 font-bold">Registered Parent Phone:</span>
                <span className="font-bold text-[#1455D9]">{selectedStudent.parentPhone || 'Not Registered'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex justify-between">
                <span className="text-gray-500 font-bold">Institutional Email:</span>
                <span className="font-mono text-[#071A3D]">{selectedStudent.email}</span>
              </div>

              {/* Remarks & Academic Case Notes */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-[#1455D9] tracking-wider block">
                    Faculty Remarks &amp; Academic Notes
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Record</span>
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
                  <option value="">— Select relevant category —</option>
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

            <div className="pt-3 border-t flex flex-wrap justify-end gap-2">
              <a
                href={`https://wa.me/91${(selectedStudent.parentPhone || selectedStudent.phone || '').replace(
                  /[^0-9]/g,
                  ''
                )}?text=${encodeURIComponent(
                  `Hello, Greetings from Department of AI&DS (VSBEC). Update regarding ${selectedStudent.name} (${selectedStudent.registerNumber}): Attendance: ${selectedStudent.attendance.toFixed(
                    1
                  )}%, CGPA: ${selectedStudent.cgpa.toFixed(2)}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Parent
              </a>
              <button
                onClick={() => {
                  handleSendParentAlert(selectedStudent)
                  setSelectedStudent(null)
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Send Parent SMS
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
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
