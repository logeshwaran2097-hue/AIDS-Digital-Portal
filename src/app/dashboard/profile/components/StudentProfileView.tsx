'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  Building,
  Award,
  ShieldCheck,
  QrCode,
  Download,
  CheckCircle2,
  Sparkles,
  MapPin,
  Heart,
  TrendingUp,
  Percent,
} from 'lucide-react'
import { downloadStudentCardPDF } from '@/lib/pdfGenerator'

export function StudentProfileView({
  user,
  student,
}: {
  user: { name: string; email: string; phone?: string | null }
  student: {
    registerNumber: string
    department: string
    year: number
    semester: number
    section: string
    dateOfBirth?: Date | string | null
  }
}) {
  const handleDownloadCard = () => {
    downloadStudentCardPDF({
      name: user.name,
      registerNumber: student.registerNumber || '23AD001',
      department: student.department || 'Artificial Intelligence & Data Science',
      year: student.year || 2,
      semester: student.semester || 3,
      section: student.section || 'A',
      email: user.email,
      phone: user.phone || '+91 90252 10001',
      dob: student.dateOfBirth ? formatDate(student.dateOfBirth) : '15/07/2005',
      cgpa: '8.84',
      attendance: '92.5%',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Hero Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 bottom-0 w-80 h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#22C7E8]/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xl border-4 border-white/20 shrink-0">
              {user.name.charAt(0) || 'K'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                  Official Student Record
                </span>
                <span className="text-xs text-green-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled &amp; Active
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black mt-1">{user.name}</h1>
              <p className="text-xs sm:text-sm text-gray-300 font-mono mt-0.5">
                Reg. No: <span className="text-[#22C7E8] font-bold">{student.registerNumber}</span> · B.Tech (Artificial Intelligence &amp; Data Science)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={handleDownloadCard}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Student ID Card (PDF)
            </button>
          </div>
        </div>

        {/* KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Academic CGPA</p>
            <p className="text-xl font-black text-[#F4C430] mt-0.5">8.84 / 10.0</p>
            <p className="text-[10px] text-gray-300">First Class with Distinction</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Attendance Record</p>
            <p className="text-xl font-black text-green-400 mt-0.5">92.5%</p>
            <p className="text-[10px] text-green-300">Compliant (&gt;75% Req)</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Department Standing</p>
            <p className="text-xl font-black text-[#22C7E8] mt-0.5">Rank 4 / 68</p>
            <p className="text-[10px] text-gray-300">Top 6% in Batch</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Arrear Status</p>
            <p className="text-xl font-black text-emerald-300 mt-0.5">0 Arrears</p>
            <p className="text-[10px] text-gray-300">All Semesters Cleared</p>
          </div>
        </div>
      </div>

      {/* Profile Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Academic Credentials */}
        <Card className="rounded-3xl border-gray-200 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-[#1455D9]/10 text-[#1455D9] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#071A3D]">Academic &amp; Institutional Record</h3>
                <p className="text-[11px] text-gray-400">Department curriculum &amp; batch registration</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Degree &amp; Program:</span>
                <span className="font-black text-[#071A3D]">B.Tech Artificial Intelligence &amp; Data Science</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Academic Regulation:</span>
                <span className="font-black text-[#1455D9]">R-2021 (Autonomous System)</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Academic Batch:</span>
                <span className="font-black text-[#071A3D]">2023 - 2027 (4 Year Program)</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Current Semester &amp; Section:</span>
                <span className="font-black text-[#071A3D]">Year {student.year} · Semester {student.semester} · Section {student.section}</span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <span className="font-bold text-[#1455D9]">Assigned Faculty Advisor:</span>
                <span className="font-black text-[#071A3D]">Dr. S. Karthik (Professor)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Personal & Contact Info */}
        <Card className="rounded-3xl border-gray-200 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#071A3D]">Personal &amp; Contact Records</h3>
                <p className="text-[11px] text-gray-400">Official student registry contact details</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Institutional Email:</span>
                <span className="font-mono font-bold text-[#1455D9]">{user.email}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Contact Number:</span>
                <span className="font-bold text-[#071A3D]">{user.phone || '+91 90252 10001'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Date of Birth:</span>
                <span className="font-bold text-[#071A3D]">{student.dateOfBirth ? formatDate(student.dateOfBirth) : '15/07/2005'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Blood Group:</span>
                <span className="font-bold text-red-600">O +ve</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Residency Status:</span>
                <span className="font-bold text-[#071A3D]">Day Scholar (College Bus Route 14)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
