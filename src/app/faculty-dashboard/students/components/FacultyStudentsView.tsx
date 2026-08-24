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

const DEFAULT_STUDENTS: StudentRosterItem[] = [
  { id: '1', name: 'K. Aishwarya', registerNumber: '23AD001', email: '23ad001@vsb.edu.in', phone: '+91 90252 10001', year: 2, semester: 3, section: 'A', cgpa: 8.84, attendance: 92.5, arrears: 0, parentPhone: '+91 98421 23456' },
  { id: '2', name: 'R. Deepak', registerNumber: '23AD002', email: '23ad002@vsb.edu.in', phone: '+91 90252 10002', year: 2, semester: 3, section: 'A', cgpa: 8.62, attendance: 85.0, arrears: 0, parentPhone: '+91 98421 23457' },
  { id: '3', name: 'S. Kavitha', registerNumber: '23AD003', email: '23ad003@vsb.edu.in', phone: '+91 90252 10003', year: 2, semester: 3, section: 'A', cgpa: 7.95, attendance: 78.4, arrears: 0, parentPhone: '+91 98421 23458' },
  { id: '4', name: 'M. Praveen', registerNumber: '23AD004', email: '23ad004@vsb.edu.in', phone: '+91 90252 10004', year: 2, semester: 3, section: 'A', cgpa: 7.20, attendance: 71.0, arrears: 1, parentPhone: '+91 98421 23459' },
  { id: '5', name: 'T. Divya', registerNumber: '23AD005', email: '23ad005@vsb.edu.in', phone: '+91 90252 10005', year: 2, semester: 3, section: 'A', cgpa: 8.91, attendance: 88.2, arrears: 0, parentPhone: '+91 98421 23460' },
  { id: '6', name: 'N. Sandhiya', registerNumber: '23AD006', email: '23ad006@vsb.edu.in', phone: '+91 90252 10006', year: 2, semester: 3, section: 'A', cgpa: 9.12, attendance: 95.6, arrears: 0, parentPhone: '+91 98421 23461' },
  { id: '7', name: 'V. Karthikeyan', registerNumber: '23AD007', email: '23ad007@vsb.edu.in', phone: '+91 90252 10007', year: 2, semester: 3, section: 'A', cgpa: 8.35, attendance: 89.0, arrears: 0, parentPhone: '+91 98421 23462' },
  { id: '8', name: 'P. Sneha', registerNumber: '23AD008', email: '23ad008@vsb.edu.in', phone: '+91 90252 10008', year: 2, semester: 3, section: 'A', cgpa: 8.48, attendance: 91.2, arrears: 0, parentPhone: '+91 98421 23463' },
]

export function FacultyStudentsView({ initialStudents }: { initialStudents?: StudentRosterItem[] }) {
  const students = initialStudents && initialStudents.length > 0 ? initialStudents : DEFAULT_STUDENTS

  const [searchQuery, setSearchQuery] = useState('')
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'SAFE' | 'WARNING'>('ALL')
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null)
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null)

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesAttendance =
        attendanceFilter === 'ALL'
          ? true
          : attendanceFilter === 'SAFE'
          ? s.attendance >= 75
          : s.attendance < 75

      return matchesSearch && matchesAttendance
    })
  }, [students, searchQuery, attendanceFilter])

  const handleDownloadRosterPDF = () => {
    const sections = [
      {
        heading: 'CLASS BATCH & ADVISOR DETAILS',
        body: [
          'Department: Artificial Intelligence & Data Science (AI & DS)',
          'Academic Batch: Year II / Semester 3 (Section A) · Regulation 2021',
          'Faculty Class Advisor: Dr. S. Karthik (Professor - Room 201)',
          `Total Students on Roll: ${students.length} Students`,
          `Attendance Compliant (>75%): ${students.filter((s) => s.attendance >= 75).length} Students`,
          `Attendance Condonation Risk (<75%): ${students.filter((s) => s.attendance < 75).length} Students`,
        ],
      },
      {
        heading: 'STUDENT ROSTER & ACADEMIC PERFORMANCE SUMMARY',
        body: filteredStudents.map(
          (s) =>
            `${s.registerNumber} - ${s.name}: CGPA: ${s.cgpa.toFixed(2)} | Attendance: ${s.attendance.toFixed(1)}% | Arrears: ${s.arrears} | Phone: ${s.phone}`
        ),
      },
    ]

    generateAndDownloadPDF({
      title: 'OFFICIAL STUDENT BATCH ROSTER & ATTENDANCE STATEMENT',
      subtitle: 'Class Advisor Roster · B.Tech Artificial Intelligence & Data Science · Semester 3 (Section A)',
      author: 'Dr. S. Karthik (Class Advisor)',
      category: 'Student Batch Registry',
      sections,
      fileName: 'Class_Roster_Year2_Sem3_SecA',
    })
  }

  const handleSendParentAlert = (student: StudentRosterItem) => {
    setAlertSuccess(`Dispatched Automated SMS Alert to Parent (${student.parentPhone}) for ${student.name}!`)
    setTimeout(() => setAlertSuccess(null), 3000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Class Advisor Registry
            </span>
            <span className="text-xs text-gray-300 font-medium">· Year II / Semester 3 (Section A)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student Registry &amp; Academic Roster</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Dr. S. Karthik · Monitor student attendance, CGPA rankings, arrears &amp; parent communications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadRosterPDF}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Download className="w-4 h-4" /> Download Class Roster (PDF)
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Enrolled</p>
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">{students.length} Students</p>
            <p className="text-[10px] text-gray-400">Semester 3 Sec-A</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Attendance Safe (&gt;75%)</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">
            {students.filter((s) => s.attendance >= 75).length} Students
          </p>
          <p className="text-[10px] text-green-700 font-semibold">Eligible for Exams</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-red-200/80 shadow-xs bg-red-50/20">
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Attendance Risk (&lt;75%)</p>
          <p className="text-2xl font-black text-red-600 mt-0.5">
            {students.filter((s) => s.attendance < 75).length} Students
          </p>
          <p className="text-[10px] text-red-700 font-semibold">Requires Condonation</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs bg-purple-50/20">
          <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Batch Avg CGPA</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">8.42 / 10.0</p>
          <p className="text-[10px] text-purple-600 font-semibold">First Class Distinction</p>
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
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, register number or email..."
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: 'ALL', label: 'All Students' },
            { id: 'SAFE', label: 'Attendance >75% Safe' },
            { id: 'WARNING', label: 'Attendance <75% Risk' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setAttendanceFilter(f.id as any)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                attendanceFilter === f.id
                  ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              )}
            >
              {f.label}
            </button>
          ))}
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
                  <th className="py-3.5 px-4 text-center font-bold">CGPA</th>
                  <th className="py-3.5 px-4 text-center font-bold">Attendance</th>
                  <th className="py-3.5 px-4 text-center font-bold">Standing</th>
                  <th className="py-3.5 px-5 text-right font-bold">Class Advisor Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredStudents.map((s, i) => {
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
                        <span className="font-black text-[#071A3D] text-xs px-2 py-0.5 rounded-lg bg-gray-100">
                          {s.cgpa.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={cn(
                            'font-black text-xs px-2.5 py-1 rounded-full',
                            isSafe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          )}
                        >
                          {s.attendance.toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {s.arrears === 0 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            0 Arrears (Clean)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                            {s.arrears} Arrear
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isSafe && (
                            <button
                              onClick={() => handleSendParentAlert(s)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Send SMS to Parent"
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
                })}
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
                  <p className="text-xs font-mono text-[#1455D9] font-bold">{selectedStudent.registerNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border flex justify-between">
                <span className="text-gray-500 font-bold">Academic Performance:</span>
                <span className="font-black text-[#071A3D]">{selectedStudent.cgpa.toFixed(2)} CGPA ({selectedStudent.arrears === 0 ? '0 Arrears' : `${selectedStudent.arrears} Arrear`})</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex justify-between">
                <span className="text-gray-500 font-bold">Attendance Record:</span>
                <span className={cn('font-black', selectedStudent.attendance >= 75 ? 'text-green-700' : 'text-red-600')}>
                  {selectedStudent.attendance.toFixed(1)}% ({selectedStudent.attendance >= 75 ? 'Eligible' : 'Risk'})
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex justify-between">
                <span className="text-gray-500 font-bold">Student Phone:</span>
                <span className="font-bold text-[#071A3D]">{selectedStudent.phone}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex justify-between">
                <span className="text-gray-500 font-bold">Registered Parent Phone:</span>
                <span className="font-bold text-[#1455D9]">{selectedStudent.parentPhone}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex justify-between">
                <span className="text-gray-500 font-bold">Institutional Email:</span>
                <span className="font-mono text-[#071A3D]">{selectedStudent.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  handleSendParentAlert(selectedStudent)
                  setSelectedStudent(null)
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Send Parent SMS
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
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
