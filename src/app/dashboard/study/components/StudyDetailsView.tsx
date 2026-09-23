'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  ChevronDown,
  Printer,
  Copy,
  Check,
  Bot,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { EmptyState } from '@/components/portal/states'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { STUDY_DATABASE } from '@/data/studyDatabase'

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
  const [iqFilter, setIqFilter] = useState<'ALL' | 2 | 8 | 16>('ALL')
  const [copiedQ, setCopiedQ] = useState<string | null>(null)

  // AI Question Generator Agent State
  const [aiGenMark, setAiGenMark] = useState<'2' | '8' | '16'>('2')
  const [aiGenUnitId, setAiGenUnitId] = useState<string>('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [expandedAiQ, setExpandedAiQ] = useState<Record<string, boolean>>({})
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<{
    id: string
    question: string
    answer: string
    marks: number
    unitTitle: string
  }[]>([])

  const current = subjects.find((s) => s.id === selected)
  const subjectUnits = units.filter((u) => u.subjectId === selected)
  const subjectNotes = notes.filter((n) => n.subjectId === selected)
  const subjectLabs = labManuals.filter((l) => l.subjectId === selected)
  const subjectIQ = importantQuestions.filter((i) => i.subjectId === selected)
  const subjectSyllabus = syllabi.find((s) => s.subjectId === selected)

  // Combine DB questions and AI generated questions
  const allAvailableIQ = [
    ...subjectIQ,
    ...aiGeneratedQuestions.map(aq => ({
      id: aq.id,
      subjectId: selected,
      question: aq.question,
      marks: aq.marks,
      answer: aq.answer,
      unitTitle: aq.unitTitle,
      status: 'published',
      createdAt: new Date(),
    }))
  ]

  const filteredIQ = allAvailableIQ.filter((q) => {
    if (iqFilter === 'ALL') return true
    return q.marks === iqFilter
  })

  const handleGenerateAIQuestion = async () => {
    if (!current) return
    setIsAiLoading(true)
    const targetUnit = subjectUnits.find(u => u.id === aiGenUnitId) || subjectUnits[0]
    const unitTitle = targetUnit ? `Unit ${targetUnit.number}: ${targetUnit.title}` : 'Full Syllabus'
    const partLabel = aiGenMark === '2' ? 'Part A (2-Mark Short Answer)' : aiGenMark === '8' ? 'Part B (8-Mark Descriptive)' : 'Part C (16-Mark Comprehensive Analytical)'
    
    const prompt = `You are an Anna University R-2021 Chief Examiner for ${current.code} - ${current.name}.
Generate 1 authentic university examination question and detailed model answer for ${unitTitle}.
Format: ${partLabel}.

Please structure strictly as:
QUESTION: [Exam-style question]
ANSWER: [Comprehensive model answer with formulas/points/pseudocode]`

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          sessionId: `study-details-${current.code}`,
        }),
      })
      const data = await res.json()
      let text = data?.success && data?.answer ? data.answer : ''
      const isInvalid = !text || /bell timings|refreshment break|dining break|institutional/i.test(text)

      let q = ''
      let a = ''

      if (!isInvalid && text.includes('QUESTION:') && text.includes('ANSWER:')) {
        const parts = text.split('ANSWER:')
        q = parts[0].replace('QUESTION:', '').trim()
        a = parts[1].trim()
      } else if (!isInvalid && text.length > 40) {
        const lines = text.split('\n')
        q = lines[0].replace(/^#+\s*|\*\*Q:\*\*\s*|Q:\s*/i, '').trim()
        a = lines.slice(1).join('\n').trim()
      }

      // If invalid or empty, draw authentic question from STUDY_DATABASE
      if (!q || !a || /bell timings|refreshment break|dining break|institutional/i.test(q + a)) {
        const matchedSub = STUDY_DATABASE.find(s => s.code.toLowerCase() === current.code.toLowerCase() || s.name.toLowerCase().includes(current.name.toLowerCase())) || STUDY_DATABASE[0]
        const matchedU = matchedSub.units.find(u => targetUnit && (u.unitNo === targetUnit.number || u.title.toLowerCase().includes(targetUnit.title.toLowerCase()))) || matchedSub.units[0]
        const pool = aiGenMark === '2' ? matchedU.partA : aiGenMark === '8' ? matchedU.partB : matchedU.partC
        const chosen = pool[Math.floor(Math.random() * pool.length)] || pool[0]
        q = chosen.q
        const markBreakdown = aiGenMark === '2'
          ? '\n\n[Mark Scheme: 2 Marks — Precise Technical Definition / Equation (1 Mark), Key Terms / Asymptotic Complexity (1 Mark)]'
          : aiGenMark === '8'
          ? '\n\n[Mark Scheme: 8 Marks — Algorithm Formulation / Principle (3 Marks), Step-by-Step Derivation / Trace (3 Marks), Diagram / Illustrative Example (2 Marks)]'
          : '\n\n[Mark Scheme: 16 Marks — Comprehensive Architecture & Mathematical Formulation (6 Marks), Algorithmic Derivation & Proof (6 Marks), Step-by-Step Numerical Trace & Evaluation Matrix (4 Marks)]'
        a = chosen.a + markBreakdown
      }

      const newId = `ai-q-${Date.now()}`
      setAiGeneratedQuestions(prev => [
        {
          id: newId,
          question: q,
          answer: a,
          marks: Number(aiGenMark),
          unitTitle,
        },
        ...prev,
      ])
      setExpandedAiQ(prev => ({ ...prev, [newId]: true }))
    } catch (err) {
      // Local fallback
      const matchedSub = STUDY_DATABASE.find(s => s.code.toLowerCase() === current.code.toLowerCase()) || STUDY_DATABASE[0]
      const matchedU = matchedSub.units[0]
      const pool = aiGenMark === '2' ? matchedU.partA : aiGenMark === '8' ? matchedU.partB : matchedU.partC
      const chosen = pool[0]
      const newId = `ai-q-${Date.now()}`
      setAiGeneratedQuestions(prev => [
        {
          id: newId,
          question: chosen.q,
          answer: chosen.a,
          marks: Number(aiGenMark),
          unitTitle,
        },
        ...prev,
      ])
      setExpandedAiQ(prev => ({ ...prev, [newId]: true }))
    } finally {
      setIsAiLoading(false)
    }
  }

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
    if ((n as any).fileUrl && ((n as any).fileUrl.startsWith('/uploads/') || (n as any).fileUrl.startsWith('data:') || (n as any).fileUrl.startsWith('http'))) {
      const link = document.createElement('a')
      link.href = (n as any).fileUrl
      link.download = (n as any).fileName || n.title + '.pdf'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }
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
    if ((l as any).fileUrl && ((l as any).fileUrl.startsWith('/uploads/') || (l as any).fileUrl.startsWith('data:') || (l as any).fileUrl.startsWith('http'))) {
      const link = document.createElement('a')
      link.href = (l as any).fileUrl
      link.download = (l as any).fileName || l.title + '.pdf'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { l: 'All Questions', v: 'ALL' },
                      { l: 'Part-A (2-Marks)', v: 2 },
                      { l: 'Part-B (8-Marks)', v: 8 },
                      { l: 'Part-C (16-Marks)', v: 16 },
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAiPanel(!showAiPanel)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                      <span>{showAiPanel ? 'Close AI Generator' : 'AI Question Generator Agent'}</span>
                    </button>
                    <span className="text-xs text-gray-400 font-semibold">{filteredIQ.length} Questions</span>
                  </div>
                </div>

                {/* AI Question Generator Agent Panel */}
                {showAiPanel && (
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-[#071A3D] via-[#0E2C66] to-[#1455D9] text-white shadow-xl space-y-4 border border-blue-400/20 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                          <Bot className="w-4 h-4 text-cyan-300" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">AI Question & Solution Agent</h4>
                          <p className="text-[11px] text-cyan-200">
                            Generate authentic Anna University R-2021 Part A (2M), Part B (8M), or Part C (16M) questions on demand
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard/study-assistant"
                        className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-white font-semibold transition-colors"
                      >
                        <span>Open Full AI Tutor</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-cyan-200 block">Exam Mark Pattern:</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { l: 'Part A (2M)', v: '2' },
                            { l: 'Part B (8M)', v: '8' },
                            { l: 'Part C (16M)', v: '16' },
                          ].map((btn) => (
                            <button
                              key={btn.v}
                              type="button"
                              onClick={() => setAiGenMark(btn.v as any)}
                              className={cn(
                                'py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer',
                                aiGenMark === btn.v
                                  ? 'bg-white text-[#071A3D] border-white shadow-md'
                                  : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                              )}
                            >
                              {btn.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-5 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-cyan-200 block">Target Unit:</label>
                        <select
                          value={aiGenUnitId}
                          onChange={(e) => setAiGenUnitId(e.target.value)}
                          className="w-full bg-[#051330] text-white p-2 rounded-xl text-xs font-semibold border border-white/20 focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="">Full Course Scope ({current.name})</option>
                          {subjectUnits.map((u) => (
                            <option key={u.id} value={u.id}>Unit {u.number}: {u.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3 flex items-end">
                        <button
                          onClick={handleGenerateAIQuestion}
                          disabled={isAiLoading}
                          className="w-full py-2.5 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-[#071A3D] font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isAiLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-[#071A3D] border-t-transparent rounded-full animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Generate with AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                {filteredIQ.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white border border-dashed border-gray-300 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm">No Questions In This Mark Category</h4>
                      <p className="text-xs text-slate-500">
                        Generate official Anna University Part A (2M), Part B (8M), or Part C (16M) questions instantly using our AI Question Agent!
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowAiPanel(true)
                          if (iqFilter !== 'ALL') setAiGenMark(String(iqFilter) as any)
                        }}
                        className="px-4 py-2 rounded-xl bg-[#071A3D] text-white text-xs font-bold hover:bg-[#1455D9] transition-colors cursor-pointer"
                      >
                        Generate with AI Agent
                      </button>
                      <Link
                        href="/dashboard/study-assistant"
                        className="px-4 py-2 rounded-xl border border-gray-200 text-slate-700 text-xs font-bold hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>Open AI Study Assistant</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredIQ.map((q: any, idx) => (
                      <div
                        key={q.id}
                        className="p-5 rounded-3xl bg-white border border-gray-200 shadow-2xs hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-gray-100 text-[#071A3D] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#071A3D] leading-relaxed">{q.question}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-400">
                                  {q.unitTitle ? `${q.unitTitle} • ` : ''}Anna University Question Bank
                                </span>
                                {q.id.startsWith('ai-q-') && (
                                  <span className="px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 text-[9px] font-bold">
                                    AI Generated
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={q.marks === 16 ? 'role' : q.marks === 8 ? 'warning' : 'info'}
                              className="font-bold text-[10px]"
                            >
                              {q.marks === 2 ? 'Part-A (2M)' : q.marks === 8 ? 'Part-B (8M)' : 'Part-C (16M)'}
                            </Badge>
                            <button
                              onClick={() => copyQuestion(q.answer ? `Q: ${q.question}\n\nAns:\n${q.answer}` : q.question)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#1455D9] hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Copy Question & Answer"
                            >
                              {copiedQ === q.question ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            {q.answer && (
                              <button
                                onClick={() => setExpandedAiQ(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                              >
                                <span>{expandedAiQ[q.id] ? 'Hide' : 'Answer'}</span>
                                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", expandedAiQ[q.id] && "rotate-180")} />
                              </button>
                            )}
                          </div>
                        </div>

                        {q.answer && expandedAiQ[q.id] && (
                          <div className="pt-2 border-t border-gray-100 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl whitespace-pre-line leading-relaxed border border-slate-200">
                            <strong className="text-blue-700 block mb-1">Model University Answer & Solution:</strong>
                            {q.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}