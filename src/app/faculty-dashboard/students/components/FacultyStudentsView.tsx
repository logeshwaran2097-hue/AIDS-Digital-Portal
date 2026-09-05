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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { StaffOnboardingModal } from '@/components/auth/StaffOnboardingModal'

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

export function FacultyStudentsView({
  initialStudents = [],
  advisorDetails,
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
}) {
  const students = initialStudents

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(Boolean(advisorDetails?.mustChangePassword))
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

  const avgCgpa = useMemo(() => {
    const validStudents = students.filter(s => s.cgpa > 0)
    if (validStudents.length === 0) return '—'
    const sum = validStudents.reduce((acc, curr) => acc + curr.cgpa, 0)
    return (sum / validStudents.length).toFixed(2)
  }, [students])

  const handleDownloadRosterPDF = () => {
    const sections = [
      {
        heading: 'CLASS BATCH & ADVISOR DETAILS',
        body: [
          'Department: Artificial Intelligence & Data Science (AI & DS)',
          `Academic Batch: ${advisorDetails?.advisorBatch || 'B.Tech AI & DS'}`,
          `Faculty Class Advisor: ${advisorDetails?.facultyName || 'Class Advisor'}`,
          `Total Students on Roll: ${students.length} Students`,
          `Attendance Compliant (>75%): ${students.filter((s) => s.attendance >= 75).length} Students`,
          `Attendance Condonation Risk (<75%): ${students.filter((s) => s.attendance < 75).length} Students`,
        ],
      },
      {
        heading: 'STUDENT ROSTER & ACADEMIC PERFORMANCE SUMMARY',
        body: filteredStudents.map(
          (s) =>
            `${s.registerNumber} - ${s.name}: CGPA: ${s.cgpa > 0 ? s.cgpa.toFixed(2) : 'N/A'} | Attendance: ${s.attendance > 0 ? `${s.attendance.toFixed(1)}%` : 'N/A'} | Arrears: ${s.arrears} | Phone: ${s.phone || 'N/A'}`
        ),
      },
    ]

    generateAndDownloadPDF({
      title: 'OFFICIAL STUDENT BATCH ROSTER & ATTENDANCE STATEMENT',
      subtitle: `Class Advisor Roster · B.Tech Artificial Intelligence & Data Science · ${advisorDetails?.advisorBatch || 'Official Batch'}`,
      author: advisorDetails?.facultyName || 'Class Advisor',
      category: 'Student Batch Registry',
      sections,
      fileName: 'Class_Roster_AI_DS',
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
      {/* Advisor Onboarding Wizard if required */}
      <StaffOnboardingModal
        isOpen={isOnboardingOpen}
        role="advisor"
        initialData={{
          name: advisorDetails?.facultyName || '',
          email: '', // Start empty so user enters their email
          phone: advisorDetails?.facultyPhone || '',
          facultyId: advisorDetails?.facultyId || '',
          designation: 'Class Advisor',
          advisorBatch: advisorDetails?.advisorBatch || null,
          qualification: advisorDetails?.qualification || '',
          experience: advisorDetails?.experience || 0,
          specialization: advisorDetails?.specialization || '',
          dateOfBirth: advisorDetails?.dateOfBirth || undefined,
        }}
        onComplete={() => {
          setIsOnboardingOpen(false)
        }}
      />
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Class Advisor Registry
            </span>
            <span className="text-xs text-gray-300 font-medium">· {advisorDetails?.advisorBatch || 'AI & DS Student Batch'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student Registry &amp; Academic Roster</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {advisorDetails?.facultyName || 'Faculty Advisor'} · Monitor student attendance, CGPA rankings, arrears &amp; parent communications
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://chat.whatsapp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 border border-emerald-400/30"
          >
            <span className="text-sm">💬</span> AI&amp;DS WhatsApp Group
          </a>
          {students.length > 0 && (
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
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Enrolled</p>
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">{students.length} Student{students.length === 1 ? '' : 's'}</p>
            <p className="text-[10px] text-gray-400">{advisorDetails?.advisorBatch || 'Registered'}</p>
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
            {students.filter((s) => s.attendance < 75 && s.attendance > 0).length} Students
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
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-gray-300" />
                        <p className="text-xs font-bold text-gray-600">
                          {searchQuery || attendanceFilter !== 'ALL'
                            ? 'No students matching the current filter criteria'
                            : 'No students enrolled in this batch yet'}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Students added by the Admin or Department will appear in this class roster.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, i) => {
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
                            {s.cgpa > 0 ? s.cgpa.toFixed(2) : '—'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              'font-black text-xs px-2.5 py-1 rounded-full',
                              s.attendance === 0 ? 'bg-gray-100 text-gray-600' : isSafe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

            <div className="pt-3 border-t flex flex-wrap justify-end gap-2">
              <a
                href={`https://wa.me/91${(selectedStudent.parentPhone || selectedStudent.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, Greetings from Department of AI&DS (VSBEC). Update regarding ${selectedStudent.name} (${selectedStudent.registerNumber}): Attendance: ${selectedStudent.attendance.toFixed(1)}%, CGPA: ${selectedStudent.cgpa.toFixed(2)}.`)}`}
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
