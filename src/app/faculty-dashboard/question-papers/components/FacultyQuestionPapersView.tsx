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
  Award,
  Users,
  Clock,
  Shield,
  X,
  Sliders,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'

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
  createdAt: Date | string
}

export function FacultyQuestionPapersView({
  initialPapers,
  subjects,
  facultyName = 'Faculty Member',
  isAdvisor = false,
  advisorBatch = 'Year II - Sem 3 - Sec A',
  advisorYear = 2,
  advisorSem = 3,
  advisorSec = 'A',
}: {
  initialPapers: FacultyQPItem[]
  subjects: { id: string; code: string; name: string }[]
  facultyName?: string
  isAdvisor?: boolean
  advisorBatch?: string
  advisorYear?: number
  advisorSem?: number
  advisorSec?: string
}) {
  const [papers, setPapers] = useState<FacultyQPItem[]>(initialPapers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExamType, setSelectedExamType] = useState('ALL')
  const [selectedSubject, setSelectedSubject] = useState('ALL')
  const [selectedSemester, setSelectedSemester] = useState<string>(isAdvisor ? String(advisorSem) : 'ALL')
  const [cohortFilterOnly, setCohortFilterOnly] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Upload Form State
  const [uploadSubjectId, setUploadSubjectId] = useState(subjects[0]?.id || '')
  const [uploadExamType, setUploadExamType] = useState('Internal Test 1 (IAT 1)')
  const [uploadAcademicYear, setUploadAcademicYear] = useState('2025-2026')
  const [uploadSemester, setUploadSemester] = useState<number>(advisorSem || 3)
  const [uploadYear, setUploadYear] = useState<number>(advisorYear || 2)
  const [uploadSection, setUploadSection] = useState<string>(advisorSec || 'A')

  const examTypes = [
    'ALL',
    'Internal Test 1 (IAT 1)',
    'Internal Test 2 (IAT 2)',
    'Model Examination',
    'Anna University Examination (Nov/Dec)',
  ]

  // Dynamic KPI Stats calculated from actual records
  const totalCount = papers.length
  const iatCount = useMemo(
    () => papers.filter((p) => p.examType.toLowerCase().includes('iat')).length,
    [papers]
  )
  const modelCount = useMemo(
    () => papers.filter((p) => p.examType.toLowerCase().includes('model')).length,
    [papers]
  )
  const univCount = useMemo(
    () =>
      papers.filter(
        (p) =>
          p.examType.toLowerCase().includes('university') ||
          p.examType.toLowerCase().includes('nov') ||
          p.examType.toLowerCase().includes('dec')
      ).length,
    [papers]
  )

  const cohortPaperCount = useMemo(
    () => papers.filter((p) => p.semester === advisorSem || p.year === advisorYear).length,
    [papers, advisorSem, advisorYear]
  )

  // Filtered Papers
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

      const matchesSem =
        selectedSemester === 'ALL' || p.semester === Number(selectedSemester)

      const matchesCohort =
        !cohortFilterOnly || (p.semester === advisorSem && p.year === advisorYear)

      return matchesSearch && matchesExam && matchesSub && matchesSem && matchesCohort
    })
  }, [papers, searchQuery, selectedExamType, selectedSubject, selectedSemester, cohortFilterOnly, advisorSem, advisorYear])

  const handleDownloadQP = (p: FacultyQPItem) => {
    generateAndDownloadPDF({
      title: `${p.examType.toUpperCase()} — ${p.academicYear}`,
      subtitle: `${p.subjectCode} - ${p.subjectName} · Maximum Marks: 100 · Duration: 3 Hours · Sem ${p.semester}`,
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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadSubjectId || !uploadExamType) {
      toast.error('Please select subject and exam type.')
      return
    }

    setIsSubmitting(true)
    try {
      const selectedSub = subjects.find((s) => s.id === uploadSubjectId)
      const res = await fetch('/api/question-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: uploadSubjectId,
          examType: uploadExamType,
          academicYear: uploadAcademicYear,
          semester: Number(uploadSemester),
          year: Number(uploadYear),
          section: uploadSection,
          uploadedByName: isAdvisor ? `${facultyName} (Class Advisor)` : facultyName,
        }),
      })

      const result = await res.json()
      if (res.ok && result.success && result.questionPaper) {
        const newPaper: FacultyQPItem = {
          id: result.questionPaper.id,
          subjectId: uploadSubjectId,
          subjectCode: selectedSub?.code || 'AD2301',
          subjectName: selectedSub?.name || 'Course Subject',
          examType: uploadExamType,
          academicYear: uploadAcademicYear,
          year: Number(uploadYear),
          semester: Number(uploadSemester),
          fileName: result.questionPaper.fileName,
          fileSize: result.questionPaper.fileSize || 2500000,
          uploadedByName: isAdvisor ? `${facultyName} (Class Advisor)` : facultyName,
          createdAt: new Date(),
        }

        setPapers([newPaper, ...papers])
        setShowUploadModal(false)
        toast.success(`Question paper for ${selectedSub?.code || 'Course'} archived successfully!`)
      } else {
        toast.error(result.message || 'Failed to archive question paper.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error uploading question paper.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            {isAdvisor ? (
              <span className="px-3 py-1 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Award className="w-3.5 h-3.5 text-[#071A3D]" />
                Class Advisor Examination Desk
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Examination &amp; Question Bank
              </span>
            )}
            {isAdvisor && (
              <span className="px-3 py-1 rounded-full bg-[#22C7E8]/20 border border-[#22C7E8]/40 text-[#22C7E8] text-[10px] font-bold">
                Cohort: {advisorBatch}
              </span>
            )}
            <span className="text-xs text-gray-300 font-medium">· Office of COE &amp; Autonomous</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isAdvisor ? 'Class Question Papers & Assessment Bank' : 'Question Paper Archive & Assessment'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
            {facultyName} · Manage, preview, and export internal assessment tests (IAT-1, IAT-2), model exams, and Anna University past papers.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Upload Question Paper
          </button>
        </div>
      </div>

      {/* Advisor Quick Filter Tabs (If Advisor) */}
      {isAdvisor && (
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setCohortFilterOnly(false)
                setSelectedSemester('ALL')
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                !cohortFilterOnly && selectedSemester === 'ALL'
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Layers className="w-3.5 h-3.5" /> All Department Papers ({totalCount})
            </button>

            <button
              onClick={() => {
                setCohortFilterOnly(true)
                setSelectedSemester(String(advisorSem))
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                cohortFilterOnly || selectedSemester === String(advisorSem)
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Users className="w-3.5 h-3.5" /> My Class Cohort (Sem {advisorSem} · {advisorBatch})
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#071A3D] text-[9px] font-black">
                {cohortPaperCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium pr-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Autonomous Regulation 2024</span>
          </div>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Papers</p>
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">{totalCount} Sets</p>
            <p className="text-[10px] text-gray-400">Archived in Bank</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black shadow-xs">
            <FileQuestion className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Internal Tests (IAT)</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">{iatCount} Papers</p>
          <p className="text-[10px] text-green-700 font-semibold">IAT-1 &amp; IAT-2</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs bg-purple-50/20">
          <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Model Exams</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">{modelCount} Papers</p>
          <p className="text-[10px] text-purple-600 font-semibold">Pre-University Trials</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Anna University Past</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">{univCount} Papers</p>
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

        {/* Semester Filter */}
        <select
          value={selectedSemester}
          onChange={(e) => {
            setSelectedSemester(e.target.value)
            setCohortFilterOnly(false)
          }}
          className="h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-[#071A3D] md:w-44"
        >
          <option value="ALL">All Semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3 {isAdvisor && advisorSem === 3 ? '(My Class)' : ''}</option>
          <option value="4">Semester 4</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
          <option value="7">Semester 7</option>
          <option value="8">Semester 8</option>
        </select>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-[#071A3D] md:w-56"
        >
          <option value="ALL">All Subjects ({subjects.length})</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} — {s.name}
            </option>
          ))}
        </select>

        {/* Exam Type Filter */}
        <select
          value={selectedExamType}
          onChange={(e) => setSelectedExamType(e.target.value)}
          className="h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-[#071A3D] md:w-52"
        >
          {examTypes.map((et) => (
            <option key={et} value={et}>
              {et}
            </option>
          ))}
        </select>
      </div>

      {/* Question Papers Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs space-y-3">
          <FileQuestion className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">No Question Papers Match Your Filter</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Try resetting your subject or exam type filters, or click &quot;+ Upload Question Paper&quot; above to archive a new assessment paper.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedExamType('ALL')
                setSelectedSubject('ALL')
                setSelectedSemester('ALL')
                setCohortFilterOnly(false)
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const isIAT = p.examType.toLowerCase().includes('iat')
            const isModel = p.examType.toLowerCase().includes('model')
            const isUniv =
              p.examType.toLowerCase().includes('university') ||
              p.examType.toLowerCase().includes('nov') ||
              p.examType.toLowerCase().includes('dec')

            return (
              <Card
                key={p.id}
                className="rounded-3xl border-gray-200 shadow-xs hover:border-[#1455D9] transition-all bg-white flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                        isIAT && 'bg-blue-100 text-blue-800',
                        isModel && 'bg-purple-100 text-purple-800',
                        isUniv && 'bg-amber-100 text-amber-800',
                        !isIAT && !isModel && !isUniv && 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {p.examType}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 font-bold">
                      Sem {p.semester} · {p.academicYear}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#071A3D] line-clamp-1">{p.subjectCode}</h3>
                    <p className="text-xs text-gray-600 font-medium line-clamp-2 mt-0.5">{p.subjectName}</p>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-gray-100 text-[11px] text-gray-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#1455D9]" />
                        {(p.fileSize / (1024 * 1024)).toFixed(1)} MB PDF
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                        100 Marks · 3 Hrs
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>By {p.uploadedByName || facultyName}</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> COE Verified
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-400 font-bold">Anna Univ Pattern</span>
                    <button
                      onClick={() => handleDownloadQP(p)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer hover:scale-105"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Upload Question Paper Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Upload &amp; Archive Question Paper</h3>
                <p className="text-xs text-gray-500">
                  {isAdvisor ? `Upload paper for ${advisorBatch} or department archive` : 'Add paper to department archive'}
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#071A3D] block mb-1">Subject *</label>
                <select
                  value={uploadSubjectId}
                  onChange={(e) => setUploadSubjectId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#071A3D] block mb-1">Exam Type *</label>
                <select
                  value={uploadExamType}
                  onChange={(e) => setUploadExamType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                >
                  <option value="Internal Test 1 (IAT 1)">Internal Test 1 (IAT 1)</option>
                  <option value="Internal Test 2 (IAT 2)">Internal Test 2 (IAT 2)</option>
                  <option value="Model Examination">Model Examination</option>
                  <option value="Anna University Examination (Nov/Dec)">Anna University Examination (Nov/Dec)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#071A3D] block mb-1">Semester</label>
                  <select
                    value={uploadSemester}
                    onChange={(e) => setUploadSemester(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#071A3D]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#071A3D] block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={uploadAcademicYear}
                    onChange={(e) => setUploadAcademicYear(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#071A3D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#071A3D] block mb-1">Section (Optional)</label>
                <input
                  type="text"
                  value={uploadSection}
                  onChange={(e) => setUploadSection(e.target.value)}
                  placeholder="e.g. A"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-[11px] text-gray-700 space-y-1">
                <span className="font-bold text-[#1455D9] block">Standard Autonomous PDF Template:</span>
                <p>
                  Upon archiving, students can immediately download this question paper formatted with Anna University Part A, Part B, and Part C assessment questions.
                </p>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    'Archiving...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Archive Question Paper
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
