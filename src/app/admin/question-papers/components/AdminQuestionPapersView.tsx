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
  const [searchQuery, setSearchQuery] = useState('')
  const [examTypeFilter, setExamTypeFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    subjectCode: 'AD2301',
    subjectName: 'Data Structures & Algorithms',
    examType: 'Internal Assessment Test 1 (IAT 1)',
    academicYear: '2025-2026',
    year: 2,
    semester: 4,
    uploadedByName: 'Prof. Dr. S. Karthik',
  })

  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      p.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.examType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesExam = examTypeFilter === 'ALL' || p.examType.includes(examTypeFilter)
    return matchesSearch && matchesExam
  })

  const handleExportCatalogPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — QUESTION PAPERS ARCHIVE',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official Examination Question Paper Registry',
      sections: [
        {
          heading: '1. EXAMINATION ARCHIVE INVENTORY',
          body: [
            `Total Approved Question Papers: ${papers.length} Official Exam Sets`,
            'Coverage: IAT-1, IAT-2, Model Examinations & Anna University End-Semester Exams',
            'Syllabus Scheme: Anna University Regulation 2021 (Autonomous)',
            'Standard: Bloom\'s Taxonomy (Part-A Short Answers, Part-B Long Analytical, Part-C Case Study)',
          ],
        },
        {
          heading: '2. CATALOG OF EXAMINATION QUESTION SETS',
          body: papers.map(
            (p, idx) =>
              `${idx + 1}. [${p.subjectCode}] ${p.subjectName} — ${p.examType} (Sem ${p.semester}, ${p.academicYear}) | Verified by: ${p.uploadedByName || 'COE Department'}`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Question_Papers_Archive_2026',
    })
  }

  const handleDownloadSinglePaper = (qp: QPRecord) => {
    generateAndDownloadPDF({
      title: `${qp.subjectCode} — ${qp.subjectName.toUpperCase()}`,
      subtitle: `V.S.B. Engineering College · Autonomous · ${qp.examType} · ${qp.academicYear}`,
      author: qp.uploadedByName || 'Controller of Examinations',
      category: 'Question Paper Blueprint',
      sections: [
        {
          heading: 'PART A — SHORT ANSWER QUESTIONS (10 × 2 = 20 MARKS)',
          body: [
            '1. State the asymptotic time complexity of AVL tree balance operations.',
            '2. Define collision resolution techniques in hash tables.',
            '3. Differentiate between static and dynamic queue data structures.',
            '4. Explain the primary properties of a Directed Acyclic Graph (DAG).',
            '5. What is the Master Theorem for divide-and-conquer recurrences?',
          ],
        },
        {
          heading: 'PART B — DESCRIPTIVE ANALYTICAL QUESTIONS (5 × 13 = 65 MARKS)',
          body: [
            '11. (a) Illustrate the step-by-step construction of a B-Tree of order 5 with suitable key insertions.',
            '12. (a) Explain Dijkstra\'s Shortest Path algorithm on a weighted graph with 7 vertices. Trace distance arrays.',
            '13. (a) Formulate the 0/1 Knapsack Problem using Dynamic Programming. Analyze its time and space bounds.',
          ],
        },
        {
          heading: 'PART C — APPLICATION / CASE STUDY (1 × 15 = 15 MARKS)',
          body: [
            '16. Design a scalable real-time memory index for a geospatial autonomous vehicle routing engine. Justify chosen data structures and cache eviction policies.',
          ],
        },
      ],
      fileName: `${qp.subjectCode}_${qp.examType.replace(/\s+/g, '_')}_2026`,
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newQP: QPRecord = {
      id: 'qp_' + Date.now(),
      subjectCode: formData.subjectCode,
      subjectName: formData.subjectName,
      examType: formData.examType,
      academicYear: formData.academicYear,
      year: formData.year,
      semester: formData.semester,
      fileName: `${formData.subjectCode}_${formData.examType.replace(/\s+/g, '_')}.pdf`,
      fileSize: 1240000,
      uploadedByName: formData.uploadedByName,
      status: 'approved',
    }

    setPapers([newQP, ...papers])
    setIsAddModalOpen(false)
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
              Examination Bank &amp; Blueprints
            </span>
            <span className="text-xs text-gray-300 font-medium">· COE Standard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Question Papers &amp; Blueprints</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Access {papers.length} verified internal assessment tests, model exams &amp; Anna University papers
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
            <Plus className="w-4 h-4" /> + Upload Paper
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Question Sets</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{papers.length} Sets</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">COE Certified</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Internal Tests (IAT)</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">
            {papers.filter((p) => p.examType.includes('IAT')).length} Papers
          </p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">IAT 1 &amp; IAT 2</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Model Exams</p>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">
            {papers.filter((p) => p.examType.includes('Model')).length} Papers
          </p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">100-Mark Scheme</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">University Papers</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">
            {papers.filter((p) => p.examType.includes('University')).length} Papers
          </p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">Past 5 Years</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subject code, subject title, exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={examTypeFilter}
            onChange={(e) => setExamTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Exam Categories</option>
            <option value="IAT">Internal Assessment Tests (IAT)</option>
            <option value="Model">Model Examinations</option>
            <option value="University">University Past Papers</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
            Showing {filteredPapers.length} Papers
          </span>
        </div>
      </div>

      {/* Papers Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredPapers.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-[#1455D9] text-white flex items-center justify-center font-black text-sm shadow-md">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-black text-[#1455D9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                      {p.subjectCode}
                    </span>
                    <h3 className="font-bold text-sm text-[#071A3D] mt-1">{p.subjectName}</h3>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-[10px] font-black uppercase border border-purple-200 shrink-0">
                  {p.examType}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-sans">Academic Year:</span>
                  <span className="text-[#071A3D] font-bold font-sans">{p.academicYear} · Sem {p.semester}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-sans">Faculty Examiner:</span>
                  <span className="text-[#1455D9] font-sans font-bold">{p.uploadedByName || 'COE Department'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-sans">Scheme:</span>
                  <span className="text-green-700 font-sans font-bold">Bloom&apos;s Taxonomy (Part A/B/C)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleDownloadSinglePaper(p)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Paper (PDF)
              </button>

              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete Paper"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD QUESTION PAPER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Upload Question Paper</h3>
                <p className="text-xs text-gray-500">Controller of Examinations Archive</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Subject Code</label>
                  <select
                    value={formData.subjectCode}
                    onChange={(e) => {
                      const code = e.target.value
                      const map: Record<string, string> = {
                        AD2301: 'Data Structures & Algorithms',
                        AD2302: 'Database Management Systems',
                        AD2303: 'Discrete Mathematics',
                        AD2304: 'Operating Systems',
                        AD2305: 'Machine Learning Foundations',
                        AD2306: 'Artificial Intelligence & Expert Systems',
                      }
                      setFormData({ ...formData, subjectCode: code, subjectName: map[code] || 'Course' })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="AD2301">AD2301 - Data Structures</option>
                    <option value="AD2302">AD2302 - DBMS</option>
                    <option value="AD2303">AD2303 - Discrete Maths</option>
                    <option value="AD2304">AD2304 - Operating Systems</option>
                    <option value="AD2305">AD2305 - Machine Learning</option>
                    <option value="AD2306">AD2306 - AI & Expert Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Exam Type</label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Internal Assessment Test 1 (IAT 1)">IAT 1</option>
                    <option value="Internal Assessment Test 2 (IAT 2)">IAT 2</option>
                    <option value="Model Examination">Model Examination</option>
                    <option value="University Exam (Nov/Dec)">University Nov/Dec</option>
                    <option value="University Exam (Apr/May)">University Apr/May</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
    </div>
  )
}
