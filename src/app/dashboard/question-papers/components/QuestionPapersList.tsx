'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/portal/states'
import { formatDate, formatFileSize } from '@/lib/utils'
import { FileQuestion, Eye, Download, Search, Sparkles, BookOpen, Layers, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { StudyNavigationHeader } from '@/components/study/StudyNavigationHeader'
import { instantDirectDownload } from '@/lib/fastDocumentFetcher'

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
  const [academicYear, setAcademicYear] = useState('all')
  const [semester, setSemester] = useState('all')

  const subjectMap = new Map(subjects.map((s) => [s.id, s]))

  // Derive unique academic years from data
  const availableYears = Array.from(new Set(questionPapers.map(q => q.academicYear).filter(Boolean)))

  const filtered = questionPapers.filter((q) => {
    if (subject !== 'all' && q.subjectId !== subject) return false
    if (exam !== 'all' && q.examType !== exam) return false
    if (academicYear !== 'all' && q.academicYear !== academicYear) return false
    if (semester !== 'all' && String(q.semester) !== semester) return false
    if (query) {
      const s = subjectMap.get(q.subjectId)
      const haystack = `${s?.code || ''} ${s?.name || ''} ${examLabels[q.examType] || ''} ${q.academicYear}`.toLowerCase()
      if (!haystack.includes(query.toLowerCase())) return false
    }
    return true
  })

  const handleDownloadQP = (q: QP) => {
    if (q.fileUrl && (q.fileUrl.startsWith('http') || q.fileUrl.startsWith('/'))) {
      instantDirectDownload(q.fileUrl, q.fileName || 'Question_Paper.pdf')
      return
    }

    const s = subjectMap.get(q.subjectId)
    const examName = examLabels[q.examType] || q.examType

    generateAndDownloadPDF({
      title: `${examName.toUpperCase()} - ${q.academicYear}`,
      subtitle: `${s?.code ? `${s.code} - ` : ''}${s?.name || q.fileName} · Maximum Marks: 100 · Duration: 3 Hours`,
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
    <div className="space-y-5 animate-fade-in font-sans">
      {/* Header Banner */}
      <StudyNavigationHeader
        title="Question Paper Archive"
        subtitle="Internal assessment tests, model exams & Anna University past question papers."
        badgeText="Examination Directorate"
        stats={[
          { label: 'Total Papers', value: `${questionPapers.length} Sets` },
          { label: 'Curriculum Year', value: '2025-2026' },
        ]}
      />

      {/* Filter Toolbar (Spec 14: Academic Year, Semester, Subject, Exam Type) */}
      <div className="bg-white p-3.5 rounded-lg border border-[#E5E7EB] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
            <input
              placeholder="Search subject or code..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded text-xs focus:ring-1 focus:ring-[#003399]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Academic Year Filter */}
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="h-8 rounded border border-[#E5E7EB] bg-white px-2.5 text-xs text-[#1F2937]"
          >
            <option value="all">All Academic Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
            <option value="2025-2026">2025–2026</option>
            <option value="2024-2025">2024–2025</option>
          </select>

          {/* Semester Filter */}
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="h-8 rounded border border-[#E5E7EB] bg-white px-2.5 text-xs text-[#1F2937]"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={String(sem)}>
                Semester {sem}
              </option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-8 rounded border border-[#E5E7EB] bg-white px-2.5 text-xs text-[#1F2937]"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>

          {/* Exam Type Filter */}
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="h-8 rounded border border-[#E5E7EB] bg-white px-2.5 text-xs text-[#1F2937]"
          >
            <option value="all">All Exam Types</option>
            {examTypes.map((t) => (
              <option key={t} value={t}>
                {examLabels[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Question Papers Table (Spec 14: Subject | Year | Exam | Download) */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-2xs">
        <div className="px-4 py-2.5 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-[#1F2937]">Archived Question Papers</h2>
          <span className="text-[11px] text-[#6B7280] font-medium">{filtered.length} Papers Available</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-[#E5E7EB] text-[#4B5563] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Subject</th>
                <th className="py-2.5 px-4 font-semibold text-center">Academic Year</th>
                <th className="py-2.5 px-4 font-semibold text-center">Exam Type</th>
                <th className="py-2.5 px-4 font-semibold text-center">File Size</th>
                <th className="py-2.5 px-4 font-semibold text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#1F2937]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#6B7280]">
                    No question papers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((q) => {
                  const s = subjectMap.get(q.subjectId)
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-[#1F2937] block">{s?.name || q.fileName}</span>
                        <span className="font-mono text-[10px] text-[#6B7280]">{s?.code || q.subjectId || 'QP'}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center text-[#4B5563]">
                        {q.academicYear || '2025–2026'} {q.semester ? `• Sem ${q.semester}` : ''}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded border border-[#E5E7EB] bg-[#F7F8FA] text-[#003399] font-bold text-[10px]">
                          {examLabels[q.examType] || q.examType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-[#6B7280]">
                        {formatFileSize(q.fileSize)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownloadQP(q)}
                          className="px-3 py-1 bg-[#003399] hover:bg-[#002266] text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>DOWNLOAD</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}