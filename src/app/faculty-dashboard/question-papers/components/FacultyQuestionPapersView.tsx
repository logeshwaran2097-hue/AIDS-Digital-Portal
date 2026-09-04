'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  FileQuestion,
  Search,
  Download,
  Upload,
  Plus,
  BookOpen,
  FileText,
  CheckCircle2,
  Filter,
  Sparkles,
  Layers,
  GraduationCap,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface FacultyQPItem {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  examType: string
  academicYear: string
  year: number
  semester: number
  fileName: string
  fileSize: number
  uploadedByName?: string | null
  createdAt: Date
}

export function FacultyQuestionPapersView({
  initialPapers,
  subjects,
}: {
  initialPapers: FacultyQPItem[]
  subjects: { id: string; code: string; name: string }[]
}) {
  const [papers, setPapers] = useState<FacultyQPItem[]>(initialPapers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExamType, setSelectedExamType] = useState('ALL')
  const [selectedSubject, setSelectedSubject] = useState('ALL')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const examTypes = ['ALL', 'Internal Test 1 (IAT 1)', 'Internal Test 2 (IAT 2)', 'Model Examination', 'University Exam (Nov/Dec)']

  const filtered = useMemo(() => {
    return papers.filter((p) => {
      const matchesSearch =
        p.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.examType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.academicYear.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesExam =
        selectedExamType === 'ALL' ||
        p.examType.toLowerCase().includes(selectedExamType.toLowerCase()) ||
        (selectedExamType.includes('IAT 1') && p.examType.toLowerCase().includes('iat 1')) ||
        (selectedExamType.includes('IAT 2') && p.examType.toLowerCase().includes('iat 2')) ||
        (selectedExamType.includes('Model') && p.examType.toLowerCase().includes('model'))

      const matchesSub =
        selectedSubject === 'ALL' || p.subjectId === selectedSubject || p.subjectCode === selectedSubject

      return matchesSearch && matchesExam && matchesSub
    })
  }, [papers, searchQuery, selectedExamType, selectedSubject])

  const handleDownloadQP = (p: FacultyQPItem) => {
    generateAndDownloadPDF({
      title: `${p.examType.toUpperCase()} - ${p.academicYear}`,
      subtitle: `${p.subjectCode} - ${p.subjectName} · Maximum Marks: 100 · Duration: 3 Hours`,
      subjectCode: p.subjectCode,
      author: 'Office of the Controller of Examinations (Autonomous)',
      category: p.examType,
      sections: [
        {
          heading: 'PART - A (10 x 2 = 20 Marks) — Answer ALL Questions',
          body: [
            '1. Define the fundamental principles and asymptotic complexity notation.',
            '2. Differentiate between primary algorithms and data models discussed in Unit I.',
            '3. State the necessary preconditions and invariants required for execution.',
            '4. Explain the key mechanisms utilized in concurrency synchronization.',
            '5. Illustrate the standard memory allocation strategy and boundary checks.',
            '6. Define the role of cost-based heuristics in optimization pipelines.',
            '7. List the primary metrics utilized to evaluate model precision, recall, and loss.',
            '8. State the four necessary conditions for architectural deadlock to occur.',
            '9. Outline the structure of standard indexing schemes (B+ Trees / Hash Buckets).',
            '10. Differentiate between supervised regression and unsupervised clustering.',
          ],
        },
        {
          heading: 'PART - B (5 x 13 = 65 Marks) — Answer Either (a) or (b) from each question',
          body: [
            '11. (a) Formulate the end-to-end mathematical framework and derive the complete algorithmic workflow with neat diagrams. (13 Marks)\n\t\t\tOR\n\t(b) Discuss the design considerations, worst-case complexity analysis, and sample inputs. (13 Marks)',
            '12. (a) Explain state space search mechanism and prove optimality using admissible heuristics. (13 Marks)\n\t\t\tOR\n\t(b) Construct normalized 3NF database schema and verify functional dependency preservation. (13 Marks)',
            '13. (a) Derive weight update equations for backpropagation neural network architecture. (13 Marks)\n\t\t\tOR\n\t(b) Trace shortest path computation using Dijkstra algorithm on a 6-node graph. (13 Marks)',
            '14. (a) Discuss process synchronization using counting semaphores with Producer-Consumer problem. (13 Marks)\n\t\t\tOR\n\t(b) Explain demand paging and trace page faults for LRU, FIFO, and Optimal policies. (13 Marks)',
            '15. (a) Design distributed Big Data pipeline using Apache Spark with resilient transformations. (13 Marks)\n\t\t\tOR\n\t(b) Formulate Soft Margin Support Vector Machine (SVM) optimization with RBF kernel. (13 Marks)',
          ],
        },
        {
          heading: 'PART - C (1 x 15 = 15 Marks) — Comprehensive Application Question',
          body: [
            '16. Design and architect an enterprise AI & Data Engineering solution for Real-Time Traffic Congestion Optimization in a smart city. Specify the data ingestion pipeline, feature transformation layer, and neural network model. (15 Marks)',
          ],
        },
      ],
      fileName: `${p.subjectCode}_${p.examType.replace(/[^a-zA-Z0-9]/g, '_')}_${p.academicYear}`,
    })
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUploadSuccess(true)
    setTimeout(() => {
      setUploadSuccess(false)
      setShowUploadModal(false)
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Examination &amp; Question Bank
            </span>
            <span className="text-xs text-gray-300 font-medium">· Office of COE &amp; Autonomous</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Question Paper Archive &amp; Assessment</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Dr. S. Karthik · Manage and publish internal assessment tests, model exams &amp; Anna University papers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Upload Question Paper
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Papers</p>
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">{papers.length} Sets</p>
            <p className="text-[10px] text-gray-400">Archived in Bank</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black">
            <FileQuestion className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Internal Tests (IAT)</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">6 Papers</p>
          <p className="text-[10px] text-green-700 font-semibold">IAT-1 &amp; IAT-2</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs bg-purple-50/20">
          <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Model Exams</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">2 Papers</p>
          <p className="text-[10px] text-purple-600 font-semibold">Pre-University Trials</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Anna University Past</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">2 Papers</p>
          <p className="text-[10px] text-amber-700 font-semibold">Nov/Dec Verified</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject code, title or academic year..."
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 font-medium"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-[#071A3D] md:w-56"
        >
          <option value="ALL">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} — {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedExamType}
          onChange={(e) => setSelectedExamType(e.target.value)}
          className="h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-[#071A3D] md:w-52"
        >
          <option value="ALL">All Exam Types</option>
          <option value="IAT 1">Internal Test 1 (IAT-1)</option>
          <option value="IAT 2">Internal Test 2 (IAT-2)</option>
          <option value="Model">Model Examination</option>
          <option value="University">University Examination</option>
        </select>
      </div>

      {/* Question Papers Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-3xl border-gray-200 bg-white">
          <CardContent className="p-12 text-center space-y-3">
            <FileQuestion className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-sm text-[#071A3D]">No Question Papers Archived</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchQuery || selectedExamType !== 'ALL' || selectedSubject !== 'ALL'
                ? 'No question papers matching your search filters.'
                : 'Upload IAT, Model or University exam question papers using the button above.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
          <Card
            key={p.id}
            className="rounded-3xl border-gray-200 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-mono font-black border border-blue-200/60">
                  {p.subjectCode}
                </span>
                <span className="text-[11px] text-gray-400 font-semibold">{p.academicYear}</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug line-clamp-1">
                  {p.subjectName}
                </h3>
                <p className="text-xs font-semibold text-purple-700 mt-1">
                  {p.examType}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <FileQuestion className="w-3.5 h-3.5 text-[#1455D9]" /> {(p.fileSize / (1024 * 1024)).toFixed(1)} MB
                  </span>
                  <span>Uploaded by {p.uploadedByName || 'Dr. S. Karthik'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                  COE Verified
                </span>

                <button
                  onClick={() => handleDownloadQP(p)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Upload Paper Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Upload Question Paper</h3>
                <p className="text-xs text-gray-500">Add assessment paper to department archive</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {uploadSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#071A3D]">Question Paper Archived!</h4>
                <p className="text-xs text-gray-500">The paper is now verified and available for student download.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Subject</label>
                  <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold">
                    {subjects.map((s) => (
                      <option key={s.id}>{s.code} — {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Exam Type</label>
                  <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold">
                    <option>Internal Test 1 (IAT 1)</option>
                    <option>Internal Test 2 (IAT 2)</option>
                    <option>Model Examination</option>
                    <option>Anna University Examination (Nov/Dec)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Academic Year</label>
                  <input type="text" defaultValue="2025-2026" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold" />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">PDF File</label>
                  <input type="file" accept=".pdf" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]">Upload &amp; Verify</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
