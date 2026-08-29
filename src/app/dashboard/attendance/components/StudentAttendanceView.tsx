'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Percent,
  Plus,
  Sparkles,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { ApplyODPermissionModal } from './ApplyODPermissionModal'

export interface SubjectAttendanceItem {
  code: string
  name: string
  faculty: string
  conducted: number
  attended: number
  percent: number
  status: 'Safe' | 'Warning' | 'Critical'
}

export interface AttendanceHistoryItem {
  id: string
  date: string
  subjectCode: string
  subjectName: string
  hour: string
  status: string
  takenByName: string
  remarks: string
}

export interface AttendanceStatsData {
  totalSessions: number
  presentSessions: number
  absentSessions: number
  odSessions: number
  percentage: number
  subjectBreakdown: SubjectAttendanceItem[]
  history: AttendanceHistoryItem[]
}

export function StudentAttendanceView({
  student,
  user,
  stats,
}: {
  student: { registerNumber: string; year: number; semester: number; section: string }
  user: { name: string }
  stats: AttendanceStatsData
}) {
  const [showODModal, setShowODModal] = useState(false)
  const [odSubmitted, setOdSubmitted] = useState(false)

  const isCompliant = stats.totalSessions === 0 || stats.percentage >= 75

  const handleDownloadReport = () => {
    const sections = [
      {
        heading: '1. CUMULATIVE ATTENDANCE SUMMARY',
        body: [
          `Total Working Sessions Conducted: ${stats.totalSessions} Sessions`,
          `Total Sessions Present: ${stats.presentSessions} Sessions (${stats.percentage.toFixed(1)}%)`,
          `On-Duty (OD) Approved: ${stats.odSessions} Sessions`,
          `Total Absent Sessions: ${stats.absentSessions} Sessions`,
          `Eligibility Status: ${
            isCompliant
              ? 'ELIGIBLE FOR SEMESTER EXAMINATIONS (Anna University >75% Criterion Met)'
              : 'ATTENDANCE SHORTAGE (<75% Condonation / Remedial Required)'
          }`,
        ],
      },
      {
        heading: '2. COURSE-WISE ATTENDANCE BREAKDOWN',
        body: stats.subjectBreakdown.map(
          (s) =>
            `${s.code} - ${s.name}: ${s.attended}/${s.conducted} Periods (${s.percent.toFixed(1)}%) — Status: ${s.conducted === 0 ? 'Enrolled' : s.status}`
        ),
      },
    ]

    generateAndDownloadPDF({
      title: 'OFFICIAL STUDENT ATTENDANCE REPORT',
      subtitle: `${user.name} (${student.registerNumber}) · Year ${student.year} · Semester ${student.semester} · Section ${student.section}`,
      author: 'Office of Head of Department (AI & DS)',
      category: 'Official Academic Attendance Record',
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
              Biometric Attendance Sync
            </span>
            <span className="text-xs text-gray-300 font-medium">· Anna University 75% Rule</span>
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
            <p className="text-3xl font-black text-[#1455D9] mt-1">{stats.percentage.toFixed(1)}%</p>
            <p className={cn("text-[10px] font-bold mt-0.5", isCompliant ? "text-green-700" : "text-red-700")}>
              {stats.totalSessions > 0 ? (isCompliant ? 'Compliant (>75% Req)' : 'Attendance Shortage (<75%)') : 'Term Enrolled'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black text-base shadow-md">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Conducted Sessions</p>
          <p className="text-3xl font-black text-[#071A3D] mt-1">{stats.totalSessions} Sessions</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{stats.totalSessions > 0 ? 'Total Logged by Staff' : 'Term Started'}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Present &amp; OD</p>
          <p className="text-3xl font-black text-green-600 mt-1">{stats.presentSessions} Sessions</p>
          <p className="text-[10px] text-green-700 font-medium mt-0.5">
            {stats.odSessions > 0 ? `${stats.presentSessions - stats.odSessions} Regular + ${stats.odSessions} OD` : 'Regular Present'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-red-200/80 shadow-xs bg-red-50/20">
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Absenteeism</p>
          <p className="text-3xl font-black text-red-600 mt-1">{stats.absentSessions} Sessions</p>
          <p className="text-[10px] text-red-700 font-medium mt-0.5">
            {stats.totalSessions > 0 ? `${stats.absentSessions} Unexcused` : 'Zero Absences'}
          </p>
        </div>
      </div>

      {/* Course-Wise Attendance Table */}
      <Card className="rounded-3xl border-gray-200 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-black text-base text-[#071A3D]">Subject-Wise Attendance Register</h3>
              <p className="text-xs text-gray-400">Class period tracking recorded by course faculty in real-time</p>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold",
              isCompliant ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
              {stats.totalSessions > 0 ? (isCompliant ? 'Good Academic Standing' : 'Below 75% Cut-Off') : 'Semester Enrolled'}
            </span>
          </div>

          {stats.subjectBreakdown.length > 0 ? (
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
                  {stats.subjectBreakdown.map((s) => {
                    const isSafe = s.conducted === 0 || s.percent >= 75
                    return (
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
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                            isSafe ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          )}>
                            {s.conducted === 0 ? 'Enrolled' : (isSafe ? 'Eligible (Safe)' : 'Shortage (<75%)')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">
              No subjects registered in the current curriculum.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance History Log */}
      <Card className="rounded-3xl border-gray-200 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-black text-base text-[#071A3D]">Live Class Period Log</h3>
              <p className="text-xs text-gray-400">Chronological attendance marked by faculty handlers</p>
            </div>
            <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
              {stats.history.length} Sessions Recorded
            </span>
          </div>

          {stats.history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5 font-bold">Date</th>
                    <th className="py-2.5 font-bold">Subject Code &amp; Name</th>
                    <th className="py-2.5 font-bold">Period / Hour</th>
                    <th className="py-2.5 font-bold">Faculty</th>
                    <th className="py-2.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {stats.history.map((h) => {
                    const isPresent = h.status === 'P'
                    const isOD = h.status === 'OD'
                    const isAbsent = h.status === 'A' || h.status === 'L'
                    return (
                      <tr key={h.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 font-mono font-bold text-[#071A3D]">{h.date}</td>
                        <td className="py-3 text-[#071A3D] font-bold">
                          {h.subjectCode} — {h.subjectName}
                        </td>
                        <td className="py-3 text-gray-600">{h.hour}</td>
                        <td className="py-3 text-gray-600">{h.takenByName}</td>
                        <td className="py-3 text-right">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                            isPresent && "bg-green-100 text-green-800",
                            isOD && "bg-amber-100 text-amber-800",
                            isAbsent && "bg-red-100 text-red-800"
                          )}>
                            {isPresent && 'Present'}
                            {isOD && 'On-Duty (OD)'}
                            {isAbsent && 'Absent'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-500">No Attendance Sessions Recorded Yet</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Faculty period attendance entries will appear here in real-time as they are marked.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Proof-Based On-Duty (OD) / Leave Modal */}
      <ApplyODPermissionModal
        isOpen={showODModal}
        onClose={() => setShowODModal(false)}
        student={student}
        userName={user.name}
      />
    </div>
  )
}

