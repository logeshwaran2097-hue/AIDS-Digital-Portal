'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  FileText,
  FileQuestion,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface QPRecord {
  id: string
  subjectCode: string
  subjectName: string
  examType: string
  academicYear: string
  year: number
  semester: number
  fileName: string
  fileSize: number
  uploadedByName?: string | null
  status: string
}

export function AdminQuestionPapersView({ initialPapers }: { initialPapers: QPRecord[] }) {
  const [papers, setPapers] = useState<QPRecord[]>(initialPapers)
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL')
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [examTypeFilter, setExamTypeFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedQP, setSelectedQP] = useState<QPRecord | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    subjectCode: 'AD3401',
    subjectName: 'Data Structures & Algorithms',
    examType: 'Internal Assessment Test 1 (IAT 1)',
    academicYear: '2025-2026',
    year: 2,
    semester: 4,
    uploadedByName: 'Prof. Dr. S. Karthik',
  })

  // 8 Semesters Definition
  const allSemesters = [
    { sem: 1, year: 1, yearName: 'Year I', label: 'Semester 1', tag: 'Freshman - Odd' },
    { sem: 2, year: 1, yearName: 'Year I', label: 'Semester 2', tag: 'Freshman - Even' },
    { sem: 3, year: 2, yearName: 'Year II', label: 'Semester 3', tag: 'Sophomore - Odd' },
    { sem: 4, year: 2, yearName: 'Year II', label: 'Semester 4', tag: 'Sophomore - Even' },
    { sem: 5, year: 3, yearName: 'Year III', label: 'Semester 5', tag: 'Junior - Odd' },
    { sem: 6, year: 3, yearName: 'Year III', label: 'Semester 6', tag: 'Junior - Even' },
    { sem: 7, year: 4, yearName: 'Year IV', label: 'Semester 7', tag: 'Senior - Odd' },
    { sem: 8, year: 4, yearName: 'Year IV', label: 'Semester 8', tag: 'Final Year - Capstone' },
  ]

  const getSemCount = (semNumber: number) => {
    return papers.filter((p) => p.semester === semNumber).length
  }

  const filteredPapers = papers.filter((p) => {
    const pYear = p.year || Math.ceil(p.semester / 2)
    const matchesYear = selectedYear === 'ALL' || pYear === selectedYear
    const matchesSemester = selectedSemester === 'ALL' || p.semester === selectedSemester
    const matchesExam = examTypeFilter === 'ALL' || p.examType.includes(examTypeFilter)
    const matchesSearch =
      p.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.examType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.uploadedByName && p.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesYear && matchesSemester && matchesExam && matchesSearch
  })

  const handleExportCatalogPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — QUESTION PAPERS ARCHIVE',
      subtitle: `V.S.B. Engineering College · Autonomous Institution · ${selectedSemester === 'ALL' ? 'Complete Archive' : `Semester ${selectedSemester} Archive`}`,
      author: 'Office of the Super Administrator',
      category: 'Official Examination Question Paper Registry',
      sections: [
        {
          heading: '1. EXAMINATION ARCHIVE INVENTORY',
          body: [
            `Total Filtered Question Papers: ${filteredPapers.length} Official Exam Sets`,
            'Coverage: IAT-1, IAT-2, Model Examinations & Anna University End-Semester Exams',
            'Syllabus Scheme: Anna University Regulation 2021 (Autonomous)',
            'Standard: Bloom\'s Taxonomy (Part-A Short Answers, Part-B Long Analytical, Part-C Case Study)',
          ],
        },
        {
          heading: '2. CATALOG OF EXAMINATION QUESTION SETS',
          body: filteredPapers.map(
            (p, idx) =>
              `${idx + 1}. [${p.subjectCode}] ${p.subjectName} — ${p.examType} (Sem ${p.semester}, Year ${p.year}) | Verified by: ${p.uploadedByName || 'COE Department'}`
          ),
        },
      ],
      fileName: `VSB_AI_DS_Question_Papers_${selectedSemester === 'ALL' ? 'Complete' : `Sem_${selectedSemester}`}_2026`,
    })
  }

  const handleDownloadSinglePaper = (qp: QPRecord) => {
    generateAndDownloadPDF({
      title: `${qp.subjectCode} — ${qp.subjectName.toUpperCase()}`,
      subtitle: `V.S.B. Engineering College · Autonomous · ${qp.examType} · ${qp.academicYear} · Semester ${qp.semester}`,
      author: qp.uploadedByName || 'Controller of Examinations',
      category: 'Question Paper Blueprint',
      sections: [
        {
          heading: 'PART A — SHORT ANSWER QUESTIONS (10 × 2 = 20 MARKS)',
          body: [
            '1. State the fundamental core definitions and theoretical frameworks for the course.',
            '2. Explain the complexity and optimization formulations related to Unit 1 and Unit 2.',
            '3. Outline the mathematical model and governing equations.',
            '4. Differentiate between deterministic and probabilistic approaches in this domain.',
            '5. State the boundary conditions and analytical assumptions.',
          ],
        },
        {
          heading: 'PART B — DESCRIPTIVE ANALYTICAL QUESTIONS (5 × 13 = 65 MARKS)',
          body: [
            '11. (a) Derive and explain the comprehensive architectural workflow with schematic diagrams.',
            '12. (a) Formulate the algorithmic solution and analyze asymptotic time and space bounds.',
            '13. (a) Provide an in-depth mathematical walkthrough for standard engineering case scenarios.',
          ],
        },
        {
          heading: 'PART C — APPLICATION / CASE STUDY (1 × 15 = 15 MARKS)',
          body: [
            '16. Design and evaluate a scalable real-time AI & DS pipeline addressing modern industrial constraints. Justify design decisions and fault-tolerance mechanisms.',
          ],
        },
      ],
      fileName: `QP_${qp.subjectCode}_${qp.examType.slice(0, 10).replace(/\s+/g, '_')}_2026`,
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subjectCode || !formData.subjectName) {
      alert('Please fill in Course Code and Name')
      return
    }

    const newQP: QPRecord = {
      id: 'qp_' + Date.now(),
      subjectCode: formData.subjectCode.toUpperCase(),
      subjectName: formData.subjectName,
      examType: formData.examType,
      academicYear: formData.academicYear,
      year: Number(formData.year),
      semester: Number(formData.semester),
      fileName: `${formData.subjectCode}_${formData.examType.replace(/\s+/g, '_')}.pdf`,
      fileSize: 4200000,
      uploadedByName: formData.uploadedByName,
      status: 'approved',
    }

    setPapers([newQP, ...papers])
    setIsAddModalOpen(false)
    setFormData({
      subjectCode: '',
      subjectName: '',
      examType: 'Internal Assessment Test 1 (IAT 1)',
      academicYear: '2025-2026',
      year: 2,
      semester: 4,
      uploadedByName: 'Prof. Dr. S. Karthik',
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this question paper from the archive?')) {
      setPapers(papers.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Examination Bank &amp; COE Archive
            </span>
            <span className="text-xs text-gray-300 font-medium">· Year-Wise &amp; Sem-Wise Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Question Papers &amp; Blueprints</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Browse {papers.length} official IAT, Model &amp; University semester question papers
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportCatalogPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Archive (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Upload Question Paper
          </button>
        </div>
      </div>

      {/* 2-STEP HIERARCHICAL YEAR -> SEMESTER SELECTOR */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
        {/* Step 1: Choose Academic Year */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1455D9] text-white text-[11px] font-black flex items-center justify-center">1</span>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                Step 1: Choose Academic Year
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-gray-500">
              {selectedYear === 'ALL' ? 'Browsing across all 4 Academic Years' : `Selected: Year ${selectedYear}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={() => {
                setSelectedYear('ALL')
                setSelectedSemester('ALL')
              }}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                selectedYear === 'ALL'
                  ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-md ring-2 ring-[#071A3D]/30'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase block opacity-80">All 4 Years</span>
              <p className="text-xs font-black mt-0.5">All Years</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-1 inline-block ${
                selectedYear === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {papers.length} Papers
              </span>
            </button>

            {[
              { year: 1, name: 'Year I', label: '1st Year (Freshman)', sems: [1, 2] },
              { year: 2, name: 'Year II', label: '2nd Year (Sophomore)', sems: [3, 4] },
              { year: 3, name: 'Year III', label: '3rd Year (Junior)', sems: [5, 6] },
              { year: 4, name: 'Year IV', label: '4th Year (Senior)', sems: [7, 8] },
            ].map((y) => {
              const isSelected = selectedYear === y.year
              const yCount = papers.filter((p) => (p.year || Math.ceil(p.semester / 2)) === y.year).length
              return (
                <button
                  key={y.year}
                  onClick={() => {
                    setSelectedYear(y.year)
                    setSelectedSemester('ALL')
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1455D9] to-[#0A2A5E] text-white border-[#1455D9] shadow-md ring-2 ring-[#1455D9]/30 scale-101'
                      : 'bg-gray-50 hover:bg-blue-50/60 border-gray-200 text-gray-700'
                  }`}
                >
                  <span className={`text-[10px] font-extrabold uppercase block ${
                    isSelected ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {y.name}
                  </span>
                  <p className="text-xs font-black mt-0.5">{y.label}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-1 inline-block ${
                    isSelected ? 'bg-[#F4C430] text-[#071A3D]' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {yCount} {yCount === 1 ? 'Paper' : 'Papers'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Choose Semester */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F4C430] text-[#071A3D] text-[11px] font-black flex items-center justify-center">2</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                Step 2: Choose Semester {selectedYear !== 'ALL' ? `(Year ${selectedYear})` : '(All 8 Semesters)'}
              </h3>
            </div>
            {selectedSemester !== 'ALL' && (
              <button
                onClick={() => setSelectedSemester('ALL')}
                className="text-[11px] font-bold text-[#1455D9] hover:underline cursor-pointer"
              >
                Clear Semester Filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSemester('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedSemester === 'ALL'
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {selectedYear === 'ALL' ? 'All 8 Semesters' : `All Semesters in Year ${selectedYear}`}
            </button>

            {allSemesters
              .filter((s) => selectedYear === 'ALL' || s.year === selectedYear)
              .map((s) => {
                const count = getSemCount(s.sem)
                const isSelected = selectedSemester === s.sem
                return (
                  <button
                    key={s.sem}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSemester('ALL')
                      } else {
                        setSelectedSemester(s.sem)
                        setSelectedYear(s.year)
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-sm ring-2 ring-[#071A3D]/20'
                        : 'bg-white hover:bg-blue-50 border-gray-200 text-[#071A3D]'
                    }`}
                  >
                    <span>{s.label} ({s.yearName})</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-[#F4C430] text-[#071A3D]' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Question Sets</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{filteredPapers.length} Sets</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">
            {selectedSemester === 'ALL' ? 'All 8 Semesters' : `Semester ${selectedSemester}`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Exam Scheme</p>
          <p className="text-xl font-black text-purple-700 mt-0.5">Bloom&apos;s OBE</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Part A, B &amp; C Scheme</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Filter</p>
          <p className="text-lg font-black text-amber-700 mt-0.5">
            {selectedSemester === 'ALL' ? 'All Semesters' : `Semester ${selectedSemester}`}
          </p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">
            {selectedYear === 'ALL' ? 'All 4 Years' : `Year ${selectedYear} Exams`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Department</p>
          <p className="text-2xl font-black text-green-700 mt-0.5">B.Tech AI &amp; DS</p>
          <p className="text-[10px] text-green-700 font-medium mt-1">Anna University · Reg 2021</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subject code, name, exam type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                setSelectedYear(val)
                setSelectedSemester('ALL')
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Years (I - IV)</option>
              <option value={1}>Year I (Freshman)</option>
              <option value={2}>Year II (Sophomore)</option>
              <option value={3}>Year III (Junior)</option>
              <option value={4}>Year IV (Senior)</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => {
                const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                setSelectedSemester(val)
                if (val !== 'ALL') {
                  setSelectedYear(Math.ceil(val / 2))
                }
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#1455D9] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">
                {selectedYear === 'ALL' ? 'All 8 Semesters' : `All Sems in Year ${selectedYear}`}
              </option>
              {allSemesters
                .filter((s) => selectedYear === 'ALL' || s.year === selectedYear)
                .map((s) => (
                  <option key={s.sem} value={s.sem}>
                    {s.label} ({s.yearName})
                  </option>
                ))}
            </select>
          </div>

          {/* Exam Type Filter */}
          <select
            value={examTypeFilter}
            onChange={(e) => setExamTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Exam Types</option>
            <option value="IAT 1">IAT 1</option>
            <option value="IAT 2">IAT 2</option>
            <option value="Model">Model Exam</option>
            <option value="University">University Exam</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
            Showing {filteredPapers.length} of {papers.length}
          </span>
        </div>
      </div>

      {/* Question Papers Cards Grid / Empty State */}
      {filteredPapers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredPapers.map((qp) => (
            <div
              key={qp.id}
              className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1455D9] to-[#071A3D] text-white flex items-center justify-center font-black text-sm shadow-md">
                      <FileQuestion className="w-6 h-6 text-[#F4C430]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#1455D9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                          {qp.subjectCode}
                        </span>
                        <span className="text-[10px] font-black text-purple-700 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 uppercase">
                          Sem {qp.semester} (Year {qp.year || Math.ceil(qp.semester / 2)})
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#071A3D] mt-1 line-clamp-2">{qp.subjectName}</h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800 shrink-0">
                    {qp.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-sans">Examination:</span>
                    <span className="text-[#071A3D] font-bold">{qp.examType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-sans">Academic Year:</span>
                    <span className="text-[#1455D9] font-bold">{qp.academicYear}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-sans">Verified By:</span>
                    <span className="text-gray-700 font-sans">{qp.uploadedByName || 'COE Department'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleDownloadSinglePaper(qp)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Blueprint PDF
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedQP(qp)
                      setIsViewModalOpen(true)
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(qp.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <FileQuestion className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Question Papers in Current Selection</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            {selectedSemester !== 'ALL'
              ? `No question papers recorded for Semester ${selectedSemester} yet.`
              : 'The examination archive is clean and ready for real exam papers.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Upload Question Paper
          </button>
        </div>
      )}

      {/* MODAL: ADD QP */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Upload Question Paper</h3>
                <p className="text-xs text-gray-500">Bloom&apos;s Taxonomy Autonomous Standard</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AD3401"
                    value={formData.subjectCode}
                    onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Semester (1 - 8) *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => {
                      const sem = Number(e.target.value)
                      setFormData({ ...formData, semester: sem, year: Math.ceil(sem / 2) })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem} (Year {Math.ceil(sem / 2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence Principles"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Exam Type</label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Internal Assessment Test 1 (IAT 1)">IAT 1</option>
                    <option value="Internal Assessment Test 2 (IAT 2)">IAT 2</option>
                    <option value="Model Examination">Model Exam</option>
                    <option value="Anna University End-Semester">Anna University End-Sem</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Prepared By / Faculty In-Charge</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. S. Karthik, Associate Professor"
                  value={formData.uploadedByName}
                  onChange={(e) => setFormData({ ...formData, uploadedByName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Save Question Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW QP */}
      {isViewModalOpen && selectedQP && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1455D9]">
                  {selectedQP.subjectCode} · Sem {selectedQP.semester} (Year {selectedQP.year})
                </span>
                <h3 className="text-lg font-black text-[#071A3D] mt-2">{selectedQP.subjectName}</h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Exam Type:</span>
                  <span className="font-bold text-[#071A3D]">{selectedQP.examType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Academic Year:</span>
                  <span className="font-bold text-[#1455D9]">{selectedQP.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Target Semester:</span>
                  <span className="font-bold text-purple-700">
                    Semester {selectedQP.semester} (Year {selectedQP.year})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Verified By:</span>
                  <span className="text-gray-700 font-sans">{selectedQP.uploadedByName || 'Department COE'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                onClick={() => handleDownloadSinglePaper(selectedQP)}
                className="px-4 py-2 rounded-xl bg-[#1455D9] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Paper PDF
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs hover:bg-gray-200 cursor-pointer"
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
