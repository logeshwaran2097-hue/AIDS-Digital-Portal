'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/portal/states'
import { formatDate, formatFileSize } from '@/lib/utils'
import { FileQuestion, Eye, Download, Search, Sparkles, BookOpen, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

interface QP {
  id: string
  subjectId: string
  examType: string
  academicYear: string
  year: number
  semester: number
  fileName: string
  fileUrl: string
  fileSize: number
  classPercentage: number | null
  createdAt: Date
}
interface Subject {
  id: string
  code: string
  name: string
}

const examTypes = ['internal_test_1', 'internal_test_2', 'model_examination', 'university_examination', 'previous_year']
const examLabels: Record<string, string> = {
  internal_test_1: 'Internal Test 1 (IAT-1)',
  internal_test_2: 'Internal Test 2 (IAT-2)',
  model_examination: 'Model Examination',
  university_examination: 'University Exam',
  previous_year: 'Previous Year (AU)',
}

export default function QuestionPapersList({ questionPapers, subjects }: { questionPapers: QP[]; subjects: Subject[] }) {
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('all')
  const [exam, setExam] = useState('all')

  const subjectMap = new Map(subjects.map((s) => [s.id, s]))

  const filtered = questionPapers.filter((q) => {
    if (subject !== 'all' && q.subjectId !== subject) return false
    if (exam !== 'all' && q.examType !== exam) return false
    if (query) {
      const s = subjectMap.get(q.subjectId)
      const haystack = `${s?.code || ''} ${s?.name || ''} ${examLabels[q.examType] || ''} ${q.academicYear}`.toLowerCase()
      if (!haystack.includes(query.toLowerCase())) return false
    }
    return true
  })

  const handleDownloadQP = (q: QP) => {
    const s = subjectMap.get(q.subjectId)
    const examName = examLabels[q.examType] || q.examType

    generateAndDownloadPDF({
      title: `${examName.toUpperCase()} - ${q.academicYear}`,
      subtitle: `${s?.code || 'AD2301'} - ${s?.name || 'Department Subject'} · Maximum Marks: 100 · Duration: 3 Hours`,
      subjectCode: s?.code,
      author: 'Office of the Controller of Examinations (Autonomous)',
      category: examName,
      sections: [
        {
          heading: 'PART - A (10 x 2 = 20 Marks) — Answer ALL Questions',
          body: [
            '1. Define the fundamental principles and asymptotic notation relevant to this course domain.',
            '2. Differentiate between the primary data structures / algorithmic models discussed in Unit I.',
            '3. State the necessary preconditions and invariants required for system state execution.',
            '4. Explain the key mechanisms utilized in concurrency and transaction synchronization.',
            '5. Illustrate the standard memory allocation strategy and boundary condition checks.',
            '6. Define the role of cost-based heuristics in optimization pipelines.',
            '7. List the primary metrics utilized to evaluate model precision, recall, and loss convergence.',
            '8. State the four necessary conditions for architectural deadlock to occur.',
            '9. Outline the structure of standard indexing schemes (B+ Trees / Hash Buckets).',
            '10. Differentiate between supervised regression and unsupervised clustering paradigms.',
          ],
        },
        {
          heading: 'PART - B (5 x 13 = 65 Marks) — Answer Either (a) or (b) from each question',
          body: [
            '11. (a) Formulate the end-to-end mathematical framework and derive the complete algorithmic workflow with neat architectural diagrams. (13 Marks)\n\t\t\tOR\n\t(b) Discuss the design considerations, worst-case complexity analysis, and trace execution on sample inputs. (13 Marks)',
            '12. (a) Explain the state space search mechanism and prove optimality using admissible heuristic functions. (13 Marks)\n\t\t\tOR\n\t(b) Construct the normalized 3NF database schema and verify functional dependency preservation. (13 Marks)',
            '13. (a) Derive the weight update equations for the backpropagation neural network architecture. (13 Marks)\n\t\t\tOR\n\t(b) Trace the shortest path computation using Dijkstra algorithm on a 6-node weighted graph. (13 Marks)',
            '14. (a) Discuss process synchronization using counting semaphores with the Producer-Consumer problem. (13 Marks)\n\t\t\tOR\n\t(b) Explain demand paging and trace page faults for LRU, FIFO, and Optimal replacement policies. (13 Marks)',
            '15. (a) Design a distributed Big Data pipeline using Apache Spark / PySpark with resilient transformations. (13 Marks)\n\t\t\tOR\n\t(b) Formulate the Soft Margin Support Vector Machine (SVM) optimization with RBF kernel trick. (13 Marks)',
          ],
        },
        {
          heading: 'PART - C (1 x 15 = 15 Marks) — Comprehensive Case Study & Application Question',
          body: [
            '16. Design and architect an enterprise AI & Data Engineering solution for Real-Time Traffic Congestion Optimization in a smart city. Specify the data ingestion pipeline, feature transformation layer, neural network architecture, and deployment framework on edge servers. (15 Marks)',
          ],
        },
      ],
      fileName: `${s?.code || 'QP'}_${examName.replace(/[^a-zA-Z0-9]/g, '_')}_${q.academicYear}`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Examination Bank
            </span>
            <span className="text-xs text-gray-300">· Anna University &amp; Autonomous</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Question Paper Archive</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Internal assessment tests, model exams &amp; Anna University past question papers
          </p>
        </div>

        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
          <p className="text-[10px] text-gray-300 uppercase font-bold">Total Papers</p>
          <p className="text-base font-black text-[#F4C430]">{questionPapers.length} Question Sets</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
          <input
            placeholder="Search by subject code, title or exam..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9]/20"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-[#071A3D] md:w-56"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} — {s.name}
            </option>
          ))}
        </select>
        <select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-[#071A3D] md:w-52"
        >
          <option value="all">All Exam Types</option>
          {examTypes.map((t) => (
            <option key={t} value={t}>
              {examLabels[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Question Papers Grid */}
      {filtered.length === 0 ? (
        <EmptyState title="No question papers available" description="Question papers will appear here once published." icon="📄" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q) => {
            const s = subjectMap.get(q.subjectId)
            return (
              <Card
                key={q.id}
                className="rounded-3xl border-gray-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-mono font-black border border-blue-200/60">
                      {s?.code || 'AD2301'}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold">{q.academicYear}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug line-clamp-1">
                      {s?.name || 'Course Subject'}
                    </h3>
                    <p className="text-xs font-semibold text-purple-700 mt-1">
                      {examLabels[q.examType] || q.examType.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <FileQuestion className="w-3.5 h-3.5 text-[#1455D9]" /> {formatFileSize(q.fileSize)}
                      </span>
                      <span>Uploaded {formatDate(q.createdAt)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                      Verified Paper
                    </span>

                    <button
                      onClick={() => handleDownloadQP(q)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
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
    </div>
  )
}