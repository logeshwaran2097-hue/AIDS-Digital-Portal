'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import {
  BookOpen,
  FileText,
  FlaskConical,
  HelpCircle,
  ListChecks,
  Download,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  ChevronRight,
  Printer,
  Copy,
  Check,
} from 'lucide-react'
import { EmptyState } from '@/components/portal/states'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

interface Subject {
  id: string
  code: string
  name: string
  credits: number
  description: string | null
}
interface Unit {
  id: string
  subjectId: string
  number: number
  title: string
  topics: string
  order: number
}
interface Note {
  id: string
  subjectId: string
  title: string
  content: string | null
  fileUrl: string | null
  uploaderName: string | null
}
interface LabManual {
  id: string
  subjectId: string
  title: string
  experimentNumber: number
  experimentName: string
  fileUrl: string | null
  description: string | null
}
interface ImportantQuestion {
  id: string
  subjectId: string
  question: string
  marks: number | null
}
interface Syllabus {
  id: string
  subjectId: string
  content: string
}

export default function StudyDetailsView({
  student,
  subjects,
  units,
  notes,
  labManuals,
  importantQuestions,
  syllabi,
}: {
  student: { year: number; semester: number; section: string }
  subjects: Subject[]
  units: Unit[]
  notes: Note[]
  labManuals: LabManual[]
  importantQuestions: ImportantQuestion[]
  syllabi: Syllabus[]
}) {
  const [selected, setSelected] = useState(subjects[0]?.id || 'none')
  const [iqFilter, setIqFilter] = useState<'ALL' | 2 | 16>('ALL')
  const [copiedQ, setCopiedQ] = useState<string | null>(null)

  const current = subjects.find((s) => s.id === selected)
  const subjectUnits = units.filter((u) => u.subjectId === selected)
  const subjectNotes = notes.filter((n) => n.subjectId === selected)
  const subjectLabs = labManuals.filter((l) => l.subjectId === selected)
  const subjectIQ = importantQuestions.filter((i) => i.subjectId === selected)
  const subjectSyllabus = syllabi.find((s) => s.subjectId === selected)

  const filteredIQ = subjectIQ.filter((q) => {
    if (iqFilter === 'ALL') return true
    return q.marks === iqFilter
  })

  const copyQuestion = (q: string) => {
    navigator.clipboard.writeText(q)
    setCopiedQ(q)
    setTimeout(() => setCopiedQ(null), 2000)
  }

  // 1. Download Complete Course Pack
  const handleDownloadCoursePack = () => {
    if (!current) return
    const sections = subjectUnits.map((u) => {
      let tArr: string[] = []
      try {
        tArr = JSON.parse(u.topics)
      } catch (e) {
        tArr = [u.topics]
      }
      return {
        heading: `UNIT ${u.number}: ${u.title.toUpperCase()}`,
        body: tArr,
      }
    })

    generateAndDownloadPDF({
      title: `${current.code} - ${current.name}`,
      subtitle: `Regulation 2021 (Autonomous) · Year ${student.year} · Semester ${student.semester}`,
      subjectCode: current.code,
      author: 'Department of AI & DS Faculty',
      category: 'Course Curriculum & Syllabus Pack',
      sections: sections.length > 0 ? sections : undefined,
      content: subjectSyllabus?.content,
      fileName: `${current.code}_Complete_Course_Pack`,
    })
  }

  // 2. Download Lecture Note PDF
  const handleDownloadNote = (n: Note) => {
    if (!current) return
    generateAndDownloadPDF({
      title: n.title,
      subtitle: `${current.code} - ${current.name} · Lecture Handout`,
      subjectCode: current.code,
      author: n.uploaderName || 'Faculty Member',
      category: 'Lecture Notes',
      content: `This document contains the official lecture study notes, core derivations, and code snippets for ${current.name}.\n\nCourse: ${current.code} - ${current.name}\nRegulation: Autonomous R-2021\nDepartment: Artificial Intelligence & Data Science\n\nKey Concepts Covered:\n• Comprehensive conceptual breakdowns\n• Algorithmic implementations and derivations\n• University examination review problems\n• Solved examples and reference walkthroughs`,
      fileName: `${current.code}_${n.title.replace(/\s+/g, '_')}`,
    })
  }

  // 3. Download Lab Manual PDF
  const handleDownloadLab = (l: LabManual) => {
    if (!current) return
    generateAndDownloadPDF({
      title: `Experiment ${l.experimentNumber}: ${l.experimentName || l.title}`,
      subtitle: `${current.code} - ${current.name} · Laboratory Practical Manual`,
      subjectCode: current.code,
      author: 'Department Laboratory In-Charge',
      category: 'Laboratory Manual',
      content: `EXPERIMENT OBJECTIVE:\n${l.description || 'Implement the specified algorithmic workflow and verify outputs with edge test cases.'}\n\nSOFTWARE TOOLS & ENVIRONMENT:\n• Python 3.10+, JupyterLab, C++ Compiler, Linux Environment\n\nPROCEDURE & STEPS:\n1. Initialize development environment and load required libraries.\n2. Formulate data structures and input validation schemas.\n3. Execute the algorithm and verify edge cases.\n4. Record execution runtime, memory overhead, and output graphs.\n\nRESULT:\nThe practical experiment was executed successfully and outputs verified with expected results.`,
      fileName: `${current.code}_Exp${l.experimentNumber}_Lab_Manual`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Academic Curriculum
            </span>
            <span className="text-xs text-gray-300 font-medium">· Regulation 2021</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Course Study Details &amp; Materials</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Year {student.year} · Semester {student.semester} · Section {student.section} · {subjects.length} Enrolled Courses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCoursePack}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Course Pack
          </button>
        </div>
      </div>

      {/* Modern Interactive Subject Selector Cards */}
      {subjects.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Select Course to View Materials:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
            {subjects.map((s) => {
              const isSelected = selected === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className={cn(
                    'p-3.5 rounded-2xl text-left transition-all flex flex-col justify-between border group relative overflow-hidden cursor-pointer',
                    isSelected
                      ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-lg shadow-[#1455D9]/25 ring-2 ring-[#1455D9]/30 scale-[1.02]'
                      : 'bg-white text-[#071A3D] border-gray-200 hover:border-[#1455D9]/40 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={cn('text-xs font-black font-mono', isSelected ? 'text-[#F4C430]' : 'text-[#1455D9]')}>
                      {s.code}
                    </span>
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.2 rounded-md', isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600')}>
                      {s.credits} Cr
                    </span>
                  </div>
                  <p className={cn('text-[11px] font-bold line-clamp-2 leading-tight', isSelected ? 'text-white' : 'text-[#071A3D]')}>
                    {s.name}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <EmptyState title="No subjects available" description="Subjects will appear once the department publishes academic information." icon="📚" />
      )}

      {current && (
        <div className="space-y-6">
          {/* Active Course Overview Card */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#071A3D] text-white text-xs font-black font-mono">
                    {current.code}
                  </span>
                  <Badge variant="role">{current.credits} Credits</Badge>
                  <span className="px-2.5 py-0.5 rounded-lg bg-green-100 text-green-800 text-[10px] font-bold">
                    Autonomous R-2021
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#071A3D] mt-1">{current.name}</h2>
                {current.description && (
                  <p className="text-xs text-gray-500 font-medium">{current.description}</p>
                )}
              </div>

              {/* Course Stats Metrics */}
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-2 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Units</p>
                  <p className="text-sm font-black text-[#1455D9]">{subjectUnits.length || 5} Units</p>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Notes</p>
                  <p className="text-sm font-black text-purple-600">{subjectNotes.length} PDFs</p>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Labs</p>
                  <p className="text-sm font-black text-emerald-600">{subjectLabs.length} Exps</p>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs defaultValue="syllabus" className="w-full">
              <TabsList className="w-full sm:w-auto flex-wrap h-auto bg-gray-100/80 p-1.5 rounded-2xl gap-1">
                <TabsTrigger value="syllabus" className="gap-1.5 text-xs font-bold rounded-xl data-[state=active]:bg-[#1455D9] data-[state=active]:text-white">
                  <BookOpen className="h-4 w-4" /> Syllabus Breakdown
                </TabsTrigger>
                <TabsTrigger value="units" className="gap-1.5 text-xs font-bold rounded-xl data-[state=active]:bg-[#1455D9] data-[state=active]:text-white">
                  <ListChecks className="h-4 w-4" /> Units ({subjectUnits.length})
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-1.5 text-xs font-bold rounded-xl data-[state=active]:bg-[#1455D9] data-[state=active]:text-white">
                  <FileText className="h-4 w-4" /> Lecture Notes ({subjectNotes.length})
                </TabsTrigger>
                <TabsTrigger value="lab" className="gap-1.5 text-xs font-bold rounded-xl data-[state=active]:bg-[#1455D9] data-[state=active]:text-white">
                  <FlaskConical className="h-4 w-4" /> Lab Manuals ({subjectLabs.length})
                </TabsTrigger>
                <TabsTrigger value="important" className="gap-1.5 text-xs font-bold rounded-xl data-[state=active]:bg-[#1455D9] data-[state=active]:text-white">
                  <HelpCircle className="h-4 w-4" /> Important Qs ({subjectIQ.length})
                </TabsTrigger>
              </TabsList>

              {/* 1. SYLLABUS TAB */}
              <TabsContent value="syllabus" className="pt-4 space-y-4">
                {subjectUnits.length > 0 ? (
                  <div className="space-y-3">
                    {subjectUnits.map((u) => {
                      let topicsArray: string[] = []
                      try {
                        topicsArray = JSON.parse(u.topics)
                      } catch (e) {
                        topicsArray = [u.topics]
                      }

                      return (
                        <div
                          key={u.id}
                          className="p-5 rounded-3xl bg-gray-50/70 border border-gray-200/80 hover:bg-white hover:shadow-md transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="px-3 py-1 bg-[#1455D9] text-white rounded-xl font-black text-xs">
                                UNIT {u.number}
                              </span>
                              <h3 className="text-sm font-bold text-[#071A3D]">{u.title}</h3>
                            </div>
                            <span className="text-[11px] text-gray-400 font-semibold">9-10 Hours</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {topicsArray.map((topic, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-xl bg-white border border-gray-200/80 text-[#071A3D] text-[11px] font-medium shadow-2xs"
                              >
                                • {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="rounded-3xl border-gray-200">
                    <CardContent className="whitespace-pre-wrap text-xs text-gray-700 leading-relaxed p-6 font-mono">
                      {subjectSyllabus?.content || 'Syllabus is being updated.'}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* 2. UNITS TAB */}
              <TabsContent value="units" className="pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {subjectUnits.map((u) => {
                    let topicsArray: string[] = []
                    try {
                      topicsArray = JSON.parse(u.topics)
                    } catch (e) {
                      topicsArray = [u.topics]
                    }

                    return (
                      <Card key={u.id} className="rounded-3xl border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between">
                        <CardContent className="p-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="role">Unit {u.number}</Badge>
                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              Completed (100%)
                            </span>
                          </div>
                          <h3 className="font-bold text-base text-[#071A3D]">{u.title}</h3>
                          <ul className="space-y-1.5 text-xs text-gray-600 pt-1">
                            {topicsArray.map((t, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              {/* 3. NOTES TAB */}
              <TabsContent value="notes" className="pt-4 space-y-3">
                {subjectNotes.length === 0 ? (
                  <EmptyState title="No notes available" description="Faculty notes for this subject will appear here." icon="📝" />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {subjectNotes.map((n) => (
                      <div
                        key={n.id}
                        className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-[#1455D9]/10 text-[#1455D9] flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-[#071A3D] truncate">{n.title}</h4>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Uploaded by {n.uploaderName || 'Faculty'} · PDF Document
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadNote(n)}
                          className="px-3 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* 4. LAB MANUALS TAB */}
              <TabsContent value="lab" className="pt-4">
                {subjectLabs.length === 0 ? (
                  <div className="p-8 bg-gray-50 rounded-3xl border text-center text-gray-500 text-xs">
                    This course is a Theory Subject. For laboratory experiments, select the Laboratory course above.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {subjectLabs.map((l) => (
                      <Card key={l.id} className="rounded-3xl border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between">
                        <CardContent className="p-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="info">Experiment {l.experimentNumber}</Badge>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Practical</span>
                          </div>
                          <h3 className="font-bold text-sm text-[#071A3D]">{l.experimentName || l.title}</h3>
                          {l.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{l.description}</p>
                          )}
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => handleDownloadLab(l)}
                              className="text-xs text-[#1455D9] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Experiment Guide
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* 5. IMPORTANT QUESTIONS TAB */}
              <TabsContent value="important" className="pt-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {[
                      { l: 'All Questions', v: 'ALL' },
                      { l: 'Part-A (2-Marks)', v: 2 },
                      { l: 'Part-B (16-Marks)', v: 16 },
                    ].map((btn) => (
                      <button
                        key={String(btn.v)}
                        onClick={() => setIqFilter(btn.v as any)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer',
                          iqFilter === btn.v
                            ? 'bg-[#071A3D] text-white border-[#071A3D]'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        {btn.l}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-gray-400 font-semibold">{filteredIQ.length} Questions</span>
                </div>

                <div className="space-y-3">
                  {filteredIQ.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-3xl bg-white border border-gray-200 shadow-2xs hover:shadow-md transition-all flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-[#071A3D] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#071A3D] leading-relaxed">{q.question}</p>
                          <span className="text-[10px] text-gray-400 mt-1 inline-block">Anna University Question Bank</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={q.marks === 16 ? 'role' : 'info'}
                          className="font-bold text-[10px]"
                        >
                          {q.marks} Marks
                        </Badge>
                        <button
                          onClick={() => copyQuestion(q.question)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#1455D9] hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Copy Question"
                        >
                          {copiedQ === q.question ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}