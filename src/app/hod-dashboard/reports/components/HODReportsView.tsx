'use client'

import React, { useState } from 'react'
import {
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function HODReportsView() {
  const [activeReport, setActiveReport] = useState<'student' | 'faculty' | 'academic'>('student')
  const [selectedYear, setSelectedYear] = useState('All Years')
  const [selectedSemester, setSelectedSemester] = useState('Odd Semester')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Department Analytics
            </span>
          </div>
          <h1 className="text-2xl font-black">HOD Executive Reports &amp; Analytics</h1>
          <p className="text-xs text-gray-300 mt-1">
            Comprehensive student performance, faculty workload, and academic audit reports
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/15"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={() => alert('Official Department Report exported (Excel/PDF).')}
            className="px-3.5 py-2 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Report Navigation Tabs (Clickable!) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveReport('student')}
          className={cn(
            'p-5 rounded-2xl border text-left transition-all flex items-start gap-4 shadow-xs',
            activeReport === 'student'
              ? 'bg-white border-[#1455D9] ring-2 ring-[#1455D9]/20 shadow-md'
              : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300'
          )}
        >
          <div className={cn('p-3 rounded-2xl shrink-0', activeReport === 'student' ? 'bg-[#1455D9] text-white' : 'bg-blue-50 text-[#1455D9]')}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#071A3D]">Student Reports</h3>
            <p className="text-xs text-gray-500 mt-1">Attendance %, CGPA distribution, Year-wise strength</p>
            <span className="text-[10px] font-bold text-[#1455D9] mt-2 inline-block">● 240 Students Enrolled</span>
          </div>
        </button>

        <button
          onClick={() => setActiveReport('faculty')}
          className={cn(
            'p-5 rounded-2xl border text-left transition-all flex items-start gap-4 shadow-xs',
            activeReport === 'faculty'
              ? 'bg-white border-[#6C5CE7] ring-2 ring-[#6C5CE7]/20 shadow-md'
              : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300'
          )}
        >
          <div className={cn('p-3 rounded-2xl shrink-0', activeReport === 'faculty' ? 'bg-[#6C5CE7] text-white' : 'bg-purple-50 text-[#6C5CE7]')}>
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#071A3D]">Faculty Reports</h3>
            <p className="text-xs text-gray-500 mt-1">Teaching hours, subject allocation, research papers</p>
            <span className="text-[10px] font-bold text-purple-600 mt-2 inline-block">● 4 Full-Time Faculty</span>
          </div>
        </button>

        <button
          onClick={() => setActiveReport('academic')}
          className={cn(
            'p-5 rounded-2xl border text-left transition-all flex items-start gap-4 shadow-xs',
            activeReport === 'academic'
              ? 'bg-white border-[#00D2D3] ring-2 ring-[#00D2D3]/20 shadow-md'
              : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300'
          )}
        >
          <div className={cn('p-3 rounded-2xl shrink-0', activeReport === 'academic' ? 'bg-[#00a8a9] text-white' : 'bg-cyan-50 text-[#00a8a9]')}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#071A3D]">Academic &amp; QP Reports</h3>
            <p className="text-xs text-gray-500 mt-1">Subject pass %, study resources, question papers</p>
            <span className="text-[10px] font-bold text-teal-600 mt-2 inline-block">● 24 Subjects Active</span>
          </div>
        </button>
      </div>

      {/* Dynamic Report Content based on active tab */}
      {activeReport === 'student' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Year-wise strength */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { year: 'I Year (2025 Batch)', count: 60, avgAtt: '91.2%', defaulters: 2 },
              { year: 'II Year (2024 Batch)', count: 60, avgAtt: '86.5%', defaulters: 4 },
              { year: 'III Year (2023 Batch)', count: 60, avgAtt: '88.0%', defaulters: 3 },
              { year: 'IV Year (2022 Batch)', count: 60, avgAtt: '92.4%', defaulters: 1 },
            ].map((y) => (
              <div key={y.year} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <p className="text-xs font-bold text-gray-500">{y.year}</p>
                <p className="text-2xl font-black text-[#071A3D] mt-1">{y.count} Students</p>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Avg Attendance:</span>
                  <span className="font-bold text-green-600">{y.avgAtt}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-500">Defaulters (&lt;75%):</span>
                  <span className="font-bold text-red-500">{y.defaulters}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Student Detailed Performance Table */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#071A3D] uppercase tracking-wider">
                Student Attendance &amp; Academic Standing Register
              </h3>
              <Badge variant="info">Semester V (Odd)</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#071A3D] text-white">
                  <tr>
                    <th className="py-3 px-4 font-bold">Reg. No.</th>
                    <th className="py-3 px-4 font-bold">Student Name</th>
                    <th className="py-3 px-3 font-bold text-center">Year / Section</th>
                    <th className="py-3 px-3 font-bold text-center">Attendance %</th>
                    <th className="py-3 px-3 font-bold text-center">CGPA</th>
                    <th className="py-3 px-4 font-bold text-center">Eligibility Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { r: '23AD001', n: 'K. Aishwarya', y: 'III / A', a: '92.5%', cgpa: '8.84', s: 'Eligible', color: 'bg-green-100 text-green-800' },
                    { r: '23AD002', n: 'R. Deepak', y: 'III / A', a: '85.0%', cgpa: '8.21', s: 'Eligible', color: 'bg-green-100 text-green-800' },
                    { r: '23AD003', n: 'S. Kavitha', y: 'III / B', a: '78.2%', cgpa: '7.95', s: 'Eligible', color: 'bg-green-100 text-green-800' },
                    { r: '23AD004', n: 'M. Praveen', y: 'III / A', a: '68.5%', cgpa: '7.12', s: 'Condonation Required', color: 'bg-amber-100 text-amber-800' },
                    { r: '23AD005', n: 'T. Divya', y: 'III / B', a: '88.0%', cgpa: '8.45', s: 'Eligible', color: 'bg-green-100 text-green-800' },
                    { r: '23AD006', n: 'B. Karthik', y: 'III / A', a: '74.0%', cgpa: '7.60', s: 'Condonation Required', color: 'bg-amber-100 text-amber-800' },
                    { r: '23AD007', n: 'N. Sandhiya', y: 'III / B', a: '95.0%', cgpa: '9.10', s: 'Eligible (Distinction)', color: 'bg-green-100 text-green-800' },
                    { r: '23AD008', n: 'G. Vignesh', y: 'III / A', a: '61.2%', cgpa: '6.80', s: 'Lack of Attendance (Detained)', color: 'bg-red-100 text-red-800' },
                  ].map((row) => (
                    <tr key={row.r} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#071A3D]">{row.r}</td>
                      <td className="py-3 px-4 font-bold text-gray-800">{row.n}</td>
                      <td className="py-3 px-3 text-center">{row.y}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#1455D9]">{row.a}</td>
                      <td className="py-3 px-3 text-center font-bold">{row.cgpa}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold', row.color)}>
                          {row.s}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'faculty' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-xs font-bold text-[#071A3D] uppercase tracking-wider">
                Faculty Workload &amp; Academic Allocation
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#071A3D] text-white">
                  <tr>
                    <th className="py-3 px-4 font-bold">Faculty Name</th>
                    <th className="py-3 px-4 font-bold">Designation</th>
                    <th className="py-3 px-4 font-bold">Subjects Handled</th>
                    <th className="py-3 px-3 font-bold text-center">Weekly Hours</th>
                    <th className="py-3 px-3 font-bold text-center">Projects Guided</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { n: 'Dr. S. Karthik', d: 'Professor', s: 'AD2301 (ML), AD2305 (DL)', h: '16 hrs', p: 4, st: 'Optimal Workload' },
                    { n: 'Prof. R. Meena', d: 'Assoc. Professor', s: 'AD2201 (DS), AD2303 (Big Data)', h: '18 hrs', p: 3, st: 'Optimal Workload' },
                    { n: 'Dr. K. Mohan', d: 'Asst. Professor', s: 'AD2304 (NLP), AD2202 (DBMS)', h: '18 hrs', p: 3, st: 'Optimal Workload' },
                    { n: 'Prof. T. Lakshmi', d: 'Asst. Professor', s: 'AD2302 (AI), AD2204 (Networks)', h: '16 hrs', p: 2, st: 'Optimal Workload' },
                  ].map((f) => (
                    <tr key={f.n} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-bold text-[#071A3D]">{f.n}</td>
                      <td className="py-3.5 px-4 text-gray-600">{f.d}</td>
                      <td className="py-3.5 px-4 font-medium text-[#1455D9]">{f.s}</td>
                      <td className="py-3.5 px-3 text-center font-bold">{f.h}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-purple-700">{f.p} Batches</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                          {f.st}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'academic' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-xs font-bold text-[#071A3D] uppercase tracking-wider">
                Subject Course Audit &amp; Resource Coverage
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#071A3D] text-white">
                  <tr>
                    <th className="py-3 px-4 font-bold">Course Code &amp; Title</th>
                    <th className="py-3 px-3 font-bold text-center">Sem / Credits</th>
                    <th className="py-3 px-3 font-bold text-center">Units Completed</th>
                    <th className="py-3 px-3 font-bold text-center">Study Notes</th>
                    <th className="py-3 px-3 font-bold text-center">Question Papers</th>
                    <th className="py-3 px-4 font-bold text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { c: 'AD2301 - Machine Learning', s: 'Sem 5 / 4 Cr', u: '5/5 Units', n: '12 Files', qp: '4 Papers', st: 'Complete (100%)' },
                    { c: 'AD2305 - Deep Learning', s: 'Sem 5 / 4 Cr', u: '4/5 Units', n: '8 Files', qp: '3 Papers', st: 'On Track (80%)' },
                    { c: 'AD2201 - Data Structures', s: 'Sem 3 / 3 Cr', u: '5/5 Units', n: '15 Files', qp: '5 Papers', st: 'Complete (100%)' },
                    { c: 'AD2202 - Database Systems', s: 'Sem 3 / 3 Cr', u: '4/5 Units', n: '10 Files', qp: '3 Papers', st: 'On Track (80%)' },
                  ].map((c) => (
                    <tr key={c.c} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-bold text-[#071A3D]">{c.c}</td>
                      <td className="py-3.5 px-3 text-center">{c.s}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-green-600">{c.u}</td>
                      <td className="py-3.5 px-3 text-center font-medium text-blue-600">{c.n}</td>
                      <td className="py-3.5 px-3 text-center font-medium text-purple-600">{c.qp}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                          {c.st}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
