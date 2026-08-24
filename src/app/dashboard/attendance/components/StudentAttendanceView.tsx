'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Calendar,
  Percent,
  TrendingUp,
  FileCheck,
  Send,
  Plus,
  Sparkles,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

interface SubjectAttendance {
  code: string
  name: string
  faculty: string
  conducted: number
  attended: number
  percent: number
  status: 'Safe' | 'Warning' | 'Critical'
}

const subjectsList: SubjectAttendance[] = [
  { code: 'AD2301', name: 'Data Structures & Algorithms', faculty: 'Prof. R. Meena', conducted: 38, attended: 36, percent: 94.7, status: 'Safe' },
  { code: 'AD2302', name: 'Database Management Systems', faculty: 'Dr. K. Mohan', conducted: 37, attended: 34, percent: 91.9, status: 'Safe' },
  { code: 'AD2303', name: 'Discrete Mathematics', faculty: 'Prof. T. Lakshmi', conducted: 36, attended: 32, percent: 88.9, status: 'Safe' },
  { code: 'AD2304', name: 'Operating Systems', faculty: 'Prof. R. Meena', conducted: 32, attended: 30, percent: 93.8, status: 'Safe' },
  { code: 'AD2305', name: 'Machine Learning Foundations', faculty: 'Dr. S. Karthik', conducted: 37, attended: 36, percent: 97.3, status: 'Safe' },
  { code: 'AD2306', name: 'Artificial Intelligence & Expert Systems', faculty: 'Prof. T. Lakshmi', conducted: 32, attended: 29, percent: 90.6, status: 'Safe' },
  { code: 'AD2307', name: 'Data Science Tools & Laboratory', faculty: 'Dr. S. Karthik & Dr. K. Mohan', conducted: 18, attended: 18, percent: 100.0, status: 'Safe' },
]

// Calendar Days simulation for August 2026
const AUGUST_DAYS = [
  { day: 1, status: 'WEEKEND' }, { day: 2, status: 'WEEKEND' },
  { day: 3, status: 'PRESENT' }, { day: 4, status: 'PRESENT' }, { day: 5, status: 'PRESENT' }, { day: 6, status: 'PRESENT' }, { day: 7, status: 'PRESENT' },
  { day: 8, status: 'WEEKEND' }, { day: 9, status: 'WEEKEND' },
  { day: 10, status: 'PRESENT' }, { day: 11, status: 'PRESENT' }, { day: 12, status: 'OD' }, { day: 13, status: 'PRESENT' }, { day: 14, status: 'PRESENT' },
  { day: 15, status: 'HOLIDAY', note: 'Independence Day' }, { day: 16, status: 'WEEKEND' },
  { day: 17, status: 'PRESENT' }, { day: 18, status: 'PRESENT' }, { day: 19, status: 'ABSENT', note: 'Unexcused' }, { day: 20, status: 'PRESENT' }, { day: 21, status: 'PRESENT' },
  { day: 22, status: 'WEEKEND' }, { day: 23, status: 'WEEKEND' },
  { day: 24, status: 'PRESENT' }, { day: 25, status: 'PRESENT' }, { day: 26, status: 'PRESENT' }, { day: 27, status: 'PRESENT' }, { day: 28, status: 'OD', note: 'Hackathon OD' },
  { day: 29, status: 'WEEKEND' }, { day: 30, status: 'WEEKEND' },
  { day: 31, status: 'PRESENT' },
]

export function StudentAttendanceView({
  student,
  user,
}: {
  student: { registerNumber: string; year: number; semester: number; section: string }
  user: { name: string }
}) {
  const [showODModal, setShowODModal] = useState(false)
  const [odSubmitted, setOdSubmitted] = useState(false)

  const handleDownloadReport = () => {
    const sections = [
      {
        heading: 'CUMULATIVE ATTENDANCE SUMMARY',
        body: [
          'Total Working Days Conducted: 68 Days',
          'Total Days Present: 63 Days (92.5%)',
          'On-Duty Approved Days: 2 Days (Hackathon & Paper Presentation)',
          'Total Absent Days: 3 Days',
          'Eligibility Status: ELIGIBLE FOR SEMESTER EXAMINATIONS (Anna University >75% Criterion Met)',
        ],
      },
      {
        heading: 'COURSE-WISE ATTENDANCE BREAKDOWN',
        body: subjectsList.map(
          (s) => `${s.code} - ${s.name}: ${s.attended}/${s.conducted} Periods (${s.percent.toFixed(1)}%) - Instructor: ${s.faculty}`
        ),
      },
    ]

    generateAndDownloadPDF({
      title: 'OFFICIAL STUDENT ATTENDANCE REPORT',
      subtitle: `${user.name} (${student.registerNumber}) · Year ${student.year} · Semester ${student.semester} · Section ${student.section}`,
      author: 'Office of Head of Department (AI & DS)',
      category: 'Attendance Record',
      sections,
      fileName: `Attendance_Report_${student.registerNumber}`,
    })
  }

  const handleODSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOdSubmitted(true)
    setTimeout(() => {
      setOdSubmitted(false)
      setShowODModal(false)
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Government Biometric Sync
            </span>
            <span className="text-xs text-gray-300 font-medium">· Anna University Norms</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student Attendance &amp; Leave Log</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {user.name} ({student.registerNumber}) · Year {student.year} · Semester {student.semester} (Section {student.section})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowODModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Apply On-Duty / Leave
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Report (PDF)
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs bg-gradient-to-br from-blue-50/60 to-white flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Overall Attendance</p>
            <p className="text-3xl font-black text-[#1455D9] mt-1">92.5%</p>
            <p className="text-[10px] text-green-700 font-bold mt-0.5">Compliant (&gt;75% Req)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black text-base shadow-md">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Conducted Days</p>
          <p className="text-3xl font-black text-[#071A3D] mt-1">68 Days</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Working Days Total</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Present &amp; OD</p>
          <p className="text-3xl font-black text-green-600 mt-1">65 Days</p>
          <p className="text-[10px] text-green-700 font-medium mt-0.5">63 Regular + 2 OD</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-red-200/80 shadow-xs bg-red-50/20">
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Absenteeism</p>
          <p className="text-3xl font-black text-red-600 mt-1">3 Days</p>
          <p className="text-[10px] text-red-700 font-medium mt-0.5">Safe Limit: 17 Days</p>
        </div>
      </div>

      {/* Course-Wise Attendance Table */}
      <Card className="rounded-3xl border-gray-200 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-black text-base text-[#071A3D]">Subject-Wise Attendance Register</h3>
              <p className="text-xs text-gray-400">Class period tracking recorded by course faculty</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
              All 7 Subjects Above 75% Cut-Off
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 font-bold">Course Code &amp; Name</th>
                  <th className="py-2.5 font-bold">Faculty Instructor</th>
                  <th className="py-2.5 font-bold text-center">Conducted</th>
                  <th className="py-2.5 font-bold text-center">Attended</th>
                  <th className="py-2.5 font-bold text-center">Percentage</th>
                  <th className="py-2.5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {subjectsList.map((s) => (
                  <tr key={s.code} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1455D9] px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/60">
                          {s.code}
                        </span>
                        <span className="font-bold text-[#071A3D]">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{s.faculty}</td>
                    <td className="py-3 text-center text-gray-500">{s.conducted} Hrs</td>
                    <td className="py-3 text-center font-bold text-green-700">{s.attended} Hrs</td>
                    <td className="py-3 text-center">
                      <span className="font-black text-[#1455D9]">{s.percent.toFixed(1)}%</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                        Eligible (Safe)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Attendance Heatmap & Calendar Log (August 2026) */}
      <Card className="rounded-3xl border-gray-200 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-black text-base text-[#071A3D]">Monthly Attendance Log (August 2026)</h3>
              <p className="text-xs text-gray-400">Daily roll call audit logged by department biometric registers</p>
            </div>

            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Present (63)
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> On-Duty OD (2)
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-3 h-3 rounded-full bg-red-500" /> Absent (3)
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-3 h-3 rounded-full bg-gray-200" /> Weekend / Holiday
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-bold text-gray-400 uppercase text-[10px] py-1">
                {day}
              </div>
            ))}

            {AUGUST_DAYS.map((d, i) => {
              const isPresent = d.status === 'PRESENT'
              const isAbsent = d.status === 'ABSENT'
              const isOD = d.status === 'OD'
              const isWeekend = d.status === 'WEEKEND' || d.status === 'HOLIDAY'

              return (
                <div
                  key={i}
                  className={cn(
                    'p-2 rounded-2xl border text-center flex flex-col justify-between min-h-[58px] transition-all',
                    isPresent && 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900',
                    isAbsent && 'bg-red-50 border-red-200 text-red-900 font-bold',
                    isOD && 'bg-amber-50 border-amber-200 text-amber-900 font-bold',
                    isWeekend && 'bg-gray-50/60 border-gray-100 text-gray-400'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{d.day}</span>
                    {isPresent && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isAbsent && <XCircle className="w-3 h-3 text-red-600" />}
                    {isOD && <Sparkles className="w-3 h-3 text-amber-600" />}
                  </div>

                  <span className="text-[9px] font-bold uppercase truncate mt-1">
                    {d.status === 'PRESENT' && 'Present'}
                    {d.status === 'ABSENT' && 'Absent'}
                    {d.status === 'OD' && 'On-Duty'}
                    {d.status === 'HOLIDAY' && 'Holiday'}
                    {d.status === 'WEEKEND' && 'Weekend'}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* On-Duty / Medical Leave Modal */}
      {showODModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Apply On-Duty (OD) / Leave</h3>
                <p className="text-xs text-gray-500">Submit requests for Hackathons, Symposiums or Medical Leave</p>
              </div>
              <button onClick={() => setShowODModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {odSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#071A3D]">OD Application Submitted!</h4>
                <p className="text-xs text-gray-500">
                  Your request has been forwarded to Class Advisor &amp; HOD for approval.
                </p>
              </div>
            ) : (
              <form onSubmit={handleODSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Leave / OD Type</label>
                  <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold">
                    <option>On-Duty (Hackathon / Technical Competition)</option>
                    <option>On-Duty (Paper Presentation / Conference)</option>
                    <option>Medical Leave (Medical Certificate Attached)</option>
                    <option>Sports / Cultural OD</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">From Date</label>
                    <input type="date" defaultValue="2026-08-28" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">To Date</label>
                    <input type="date" defaultValue="2026-08-28" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Event / Reason Details</label>
                  <textarea rows={3} placeholder="Provide event name, venue and registration confirmation..." className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button type="button" onClick={() => setShowODModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]">Submit Request</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
