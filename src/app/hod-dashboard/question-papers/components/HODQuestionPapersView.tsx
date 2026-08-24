'use client'

import React, { useState, useMemo } from 'react'
import {
  FileQuestion,
  Download,
  Filter,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  BookOpen,
  FileText,
  Eye,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn, formatDate } from '@/lib/utils'

interface QuestionPaperRecord {
  id: string
  examType: string
  academicYear: string
  semester: number | null
  year: number | null
  fileName: string
  fileUrl: string
  status: string
  uploadedByName: string | null
  createdAt: Date
}

export function HODQuestionPapersView({ papers }: { papers: QuestionPaperRecord[] }) {
  const [selectedSemester, setSelectedSemester] = useState<number>(0)
  const [selectedExamType, setSelectedExamType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      const matchesSemester = selectedSemester === 0 || p.semester === selectedSemester
      const matchesExamType =
        selectedExamType === 'ALL' ||
        p.examType.toLowerCase().includes(selectedExamType.toLowerCase())

      const matchesSearch =
        p.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.examType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.uploadedByName && p.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesSemester && matchesExamType && matchesSearch
    })
  }, [papers, selectedSemester, selectedExamType, searchQuery])

  // Count by exam types
  const counts = useMemo(() => {
    const total = papers.length
    const iat = papers.filter((p) => p.examType.includes('Internal')).length
    const model = papers.filter((p) => p.examType.includes('Model')).length
    const univ = papers.filter((p) => p.examType.includes('University')).length
    return { total, iat, model, univ }
  }, [papers])

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Examination Bank
            </span>
          </div>
          <h1 className="text-2xl font-black">Question Paper Archive &amp; Repository</h1>
          <p className="text-xs text-gray-300 mt-1">
            Internal Assessment Tests (IAT-1, IAT-2), Model Examinations &amp; Anna University End Semester Question Papers
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" /> Upload Question Paper
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Question Papers</p>
          <p className="text-2xl font-black text-[#071A3D] mt-1">{counts.total}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Archived Across Semesters</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
          <p className="text-xs font-bold text-[#1455D9] uppercase tracking-wider">Internal Tests (IAT)</p>
          <p className="text-2xl font-black text-[#1455D9] mt-1">{counts.iat}</p>
          <p className="text-[10px] text-blue-600 mt-0.5">IAT-1 &amp; IAT-2 Papers</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs bg-purple-50/20">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Model Exams</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{counts.model}</p>
          <p className="text-[10px] text-purple-600 mt-0.5">Full Syllabus Tests</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-green-200 shadow-xs bg-green-50/20">
          <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Anna University Papers</p>
          <p className="text-2xl font-black text-green-600 mt-1">{counts.univ}</p>
          <p className="text-[10px] text-green-600 mt-0.5">Nov/Dec &amp; Apr/May</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        {/* Semester Tab Pills */}
        <div>
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
            Filter by Semester:
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
            {[
              { label: 'All Semesters', value: 0 },
              { label: 'Semester 5 (Active)', value: 5 },
              { label: 'Semester 4', value: 4 },
              { label: 'Semester 3', value: 3 },
              { label: 'Semester 2', value: 2 },
              { label: 'Semester 1', value: 1 },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedSemester(tab.value)}
                className={cn(
                  'px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0',
                  selectedSemester === tab.value
                    ? 'bg-[#1455D9] text-white shadow-md shadow-[#1455D9]/25 scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Type Buttons & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { l: 'All Exam Types', v: 'ALL' },
              { l: 'Internal Test (IAT)', v: 'Internal' },
              { l: 'Model Exam', v: 'Model' },
              { l: 'University Exam', v: 'University' },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setSelectedExamType(opt.v)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border',
                  selectedExamType === opt.v
                    ? 'bg-[#071A3D] text-white border-[#071A3D]'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                )}
              >
                {opt.l}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paper or subject..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9]/20"
            />
          </div>
        </div>
      </div>

      {/* Question Papers Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-[#1455D9]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#071A3D]">
              Archived Question Papers ({filteredPapers.length} Results)
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">B.Tech AI &amp; DS</span>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No question papers found matching your filter. Click "Upload Question Paper" to add new papers.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#071A3D] text-white">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Paper File &amp; Subject</th>
                  <th className="py-3.5 px-3 font-bold text-center">Exam Category</th>
                  <th className="py-3.5 px-3 font-bold text-center">Academic Year</th>
                  <th className="py-3.5 px-3 font-bold text-center">Sem</th>
                  <th className="py-3.5 px-4 font-bold">Uploaded By</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPapers.map((p, idx) => (
                  <tr key={p.id} className={cn('hover:bg-blue-50/30 transition-colors', idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20')}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#1455D9]/10 text-[#1455D9] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[#071A3D]">{p.fileName.replace('.pdf', '')}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{p.fileName}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <Badge
                        variant={p.examType.includes('University') ? 'role' : 'info'}
                        className="text-[10px] whitespace-nowrap"
                      >
                        {p.examType}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-gray-700">
                      {p.academicYear}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-[#1455D9]">
                      Sem {p.semester || 5}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{p.uploadedByName || 'Faculty Member'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                        Published
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => alert(`Downloading official Question Paper: ${p.fileName}`)}
                        className="px-3 py-1 bg-[#1455D9]/10 hover:bg-[#1455D9] text-[#1455D9] hover:text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#071A3D]">Upload Question Paper</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-600 block mb-1">Subject</label>
                <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs">
                  <option>AD2301 - Machine Learning</option>
                  <option>AD2305 - Deep Learning</option>
                  <option>AD2201 - Data Structures</option>
                  <option>AD2202 - Database Systems</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-600 block mb-1">Exam Type</label>
                  <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs">
                    <option>Internal Test 1 (IAT 1)</option>
                    <option>Internal Test 2 (IAT 2)</option>
                    <option>Model Examination</option>
                    <option>Anna University Exam</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-600 block mb-1">Semester</label>
                  <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-600 block mb-1">Academic Year</label>
                <input type="text" defaultValue="2025-2026" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="font-bold text-gray-600 block mb-1">Upload PDF File</label>
                <input type="file" accept=".pdf" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
              <button
                onClick={() => {
                  alert('Question paper successfully published to Student & Faculty portals!')
                  setShowUploadModal(false)
                }}
                className="px-4 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]"
              >
                Publish Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
