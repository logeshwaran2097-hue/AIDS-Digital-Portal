'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  BookOpen,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Code2,
  FileQuestion,
  Search,
  Plus,
  ArrowRight,
  UserCheck,
  Check,
  Eye,
  Edit3,
  Trash2,
  Save,
  X,
  FileUp,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

interface CourseSubject {
  code: string
  name: string
  regulation: string
  credits: number
  year: number
  semester: number
  section: string
  enrolledStudents: number
  hoursTaught: number
  attendanceRate: string
  units: {
    unit: string
    title: string
    hours: number
    topics: string[]
    status: 'Completed' | 'In-Progress'
  }[]
  notes: {
    unit: string
    title: string
    fileName: string
    fileSize: string
    uploadedDate: string
  }[]
  labs: {
    expNo: number
    title: string
    tools: string
    guideFile: string
  }[]
  questions: {
    type: '2_mark' | '16_mark'
    q: string
    bloom: string
  }[]
}

export function FacultySubjectsView({
  initialCourses = [],
}: {
  initialCourses?: CourseSubject[]
}) {
  const [courses, setCourses] = useState<CourseSubject[]>(initialCourses)
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'syllabus' | 'notes' | 'labs' | 'questions'>('syllabus')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadTargetCode, setUploadTargetCode] = useState(
    courses[0]?.code ? `${courses[0].code} - ${courses[0].name}` : ''
  )
  const [uploadUnitTitle, setUploadUnitTitle] = useState(
    courses[0]?.units?.[0]
      ? `${courses[0].units[0].unit} - ${courses[0].units[0].title}`
      : 'Unit I - Introduction & Foundations'
  )
  const [uploadDocTitle, setUploadDocTitle] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  // Syllabus Upload & Extraction State
  const [showSyllabusUploadModal, setShowSyllabusUploadModal] = useState(false)
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null)
  const [uploadingSyllabus, setUploadingSyllabus] = useState(false)
  const [syllabusError, setSyllabusError] = useState<string | null>(null)
  const [syllabusSuccessMsg, setSyllabusSuccessMsg] = useState<string | null>(null)

  // Syllabus Editing State
  const [isEditingSyllabus, setIsEditingSyllabus] = useState(false)
  const [editableUnits, setEditableUnits] = useState<CourseSubject['units']>([])
  const [savingSyllabus, setSavingSyllabus] = useState(false)

  const currentCourse = courses[selectedCourseIndex] || courses[0] || null

  const startEditingSyllabus = () => {
    if (!currentCourse) return
    setEditableUnits(JSON.parse(JSON.stringify(currentCourse.units || [])))
    setIsEditingSyllabus(true)
  }

  const cancelEditingSyllabus = () => {
    setIsEditingSyllabus(false)
    setEditableUnits([])
  }

  const handleUnitTitleChange = (unitIdx: number, newTitle: string) => {
    setEditableUnits((prev) => prev.map((u, i) => (i === unitIdx ? { ...u, title: newTitle } : u)))
  }

  const handleUnitHoursChange = (unitIdx: number, newHours: number) => {
    setEditableUnits((prev) => prev.map((u, i) => (i === unitIdx ? { ...u, hours: newHours } : u)))
  }

  const handleTopicChange = (unitIdx: number, topicIdx: number, newTopic: string) => {
    setEditableUnits((prev) =>
      prev.map((u, i) => {
        if (i !== unitIdx) return u
        const nextTopics = [...u.topics]
        nextTopics[topicIdx] = newTopic
        return { ...u, topics: nextTopics }
      })
    )
  }

  const handleAddTopic = (unitIdx: number) => {
    setEditableUnits((prev) =>
      prev.map((u, i) => {
        if (i !== unitIdx) return u
        return { ...u, topics: [...u.topics, 'New Topic Concept'] }
      })
    )
  }

  const handleRemoveTopic = (unitIdx: number, topicIdx: number) => {
    setEditableUnits((prev) =>
      prev.map((u, i) => {
        if (i !== unitIdx) return u
        return { ...u, topics: u.topics.filter((_, tIdx) => tIdx !== topicIdx) }
      })
    )
  }

  const handleAddUnit = () => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
    const nextNum = editableUnits.length + 1
    const rIndex = nextNum - 1
    const rLabel = rIndex >= 0 && rIndex < romanNumerals.length ? romanNumerals[rIndex] : String(nextNum)
    setEditableUnits((prev) => [
      ...prev,
      {
        unit: `Unit ${rLabel}`,
        title: `Advanced Module ${nextNum}`,
        hours: 9,
        topics: ['Overview & Scope', 'Theoretical Formulations', 'Practical Applications'],
        status: 'In-Progress',
      },
    ])
  }

  const handleRemoveUnit = (unitIdx: number) => {
    setEditableUnits((prev) => prev.filter((_, i) => i !== unitIdx))
  }

  const handleSaveSyllabus = async () => {
    if (!currentCourse) return
    setSavingSyllabus(true)
    try {
      const res = await fetch('/api/faculty/syllabus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectCode: currentCourse.code,
          units: editableUnits,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save syllabus')
      }

      setCourses((prev) =>
        prev.map((c) => {
          if (c.code.toUpperCase() === currentCourse.code.toUpperCase()) {
            return { ...c, units: editableUnits }
          }
          return c
        })
      )
      setIsEditingSyllabus(false)
    } catch (err: any) {
      alert(err.message || 'Error saving syllabus')
    } finally {
      setSavingSyllabus(false)
    }
  }

  const handleSyllabusUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!syllabusFile || !currentCourse) return

    setUploadingSyllabus(true)
    setSyllabusError(null)

    try {
      const formData = new FormData()
      formData.append('file', syllabusFile)
      formData.append('subjectCode', currentCourse.code)
      formData.append('subjectName', currentCourse.name)

      const res = await fetch('/api/faculty/syllabus', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to extract syllabus')
      }

      setCourses((prev) =>
        prev.map((c) => {
          if (c.code.toUpperCase() === currentCourse.code.toUpperCase()) {
            return { ...c, units: data.units }
          }
          return c
        })
      )
      setShowSyllabusUploadModal(false)
      setSyllabusFile(null)
      setSyllabusSuccessMsg(data.message || 'Syllabus successfully extracted!')
      setTimeout(() => setSyllabusSuccessMsg(null), 4000)
    } catch (err: any) {
      setSyllabusError(err.message || 'Error processing syllabus file')
    } finally {
      setUploadingSyllabus(false)
    }
  }

  const handleStartBlankTemplate = async () => {
    if (!currentCourse) return
    const defaultTemplate: CourseSubject['units'] = [
      { unit: 'Unit I', title: 'Foundational Principles & Concepts', hours: 9, topics: ['Basic Concept Overview', 'Theoretical Framework', 'Core Equations'], status: 'In-Progress' },
      { unit: 'Unit II', title: 'Architectural Framework & Design', hours: 9, topics: ['System Components', 'Data Structures & Formulations', 'State Representations'], status: 'In-Progress' },
      { unit: 'Unit III', title: 'Methodologies & Implementation', hours: 9, topics: ['Algorithmic Workflow', 'Analysis & Optimization', 'Benchmark Verification'], status: 'In-Progress' },
      { unit: 'Unit IV', title: 'Advanced Systems & Models', hours: 9, topics: ['Complexity Reduction', 'Specialized Frameworks', 'Scalability'], status: 'In-Progress' },
      { unit: 'Unit V', title: 'Applications & Emerging Trends', hours: 9, topics: ['Industry Case Studies', 'Modern Toolkits', 'Project Realization'], status: 'In-Progress' },
    ]

    try {
      const res = await fetch('/api/faculty/syllabus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectCode: currentCourse.code,
          units: defaultTemplate,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message)

      setCourses((prev) =>
        prev.map((c) => {
          if (c.code.toUpperCase() === currentCourse.code.toUpperCase()) {
            return { ...c, units: defaultTemplate }
          }
          return c
        })
      )
      setEditableUnits(defaultTemplate)
      setIsEditingSyllabus(true)
    } catch (err: any) {
      alert(err.message || 'Could not create template')
    }
  }

  const openUploadModal = () => {
    if (currentCourse) {
      setUploadTargetCode(`${currentCourse.code} - ${currentCourse.name}`)
      if (currentCourse.units && currentCourse.units.length > 0) {
        setUploadUnitTitle(`${currentCourse.units[0].unit} - ${currentCourse.units[0].title}`)
      }
    }
    setShowUploadModal(true)
  }

  const handleDownloadCoursePack = () => {
    if (!currentCourse) return
    const sections = currentCourse.units.map((u) => ({
      heading: `${u.unit.toUpperCase()}: ${u.title.toUpperCase()}`,
      body: u.topics.map((t) => `${t} (Completed: ${u.status === 'Completed' ? 'Yes' : 'In-Progress'})`),
    }))

    generateAndDownloadPDF({
      title: `${currentCourse.code} - ${currentCourse.name}`,
      subtitle: `${currentCourse.regulation} · Year ${currentCourse.year} Semester ${currentCourse.semester} · Credits: ${currentCourse.credits}`,
      subjectCode: currentCourse.code,
      author: 'Department Course Faculty',
      category: 'Official Course Pack & Lesson Plan',
      sections,
      fileName: `${currentCourse.code}_Faculty_Course_Pack`,
    })
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadDocTitle.trim() || !uploadTargetCode.trim()) return

    const rawTarget = uploadTargetCode.trim()
    const codePart = rawTarget.split(' - ')[0].trim().toUpperCase()
    const namePart = rawTarget.includes(' - ')
      ? rawTarget.split(' - ').slice(1).join(' - ').trim()
      : rawTarget

    const rawUnit = uploadUnitTitle.trim()
    const unitLabel = rawUnit.includes(' - ')
      ? rawUnit.split(' - ')[0].trim()
      : rawUnit || 'Unit I'

    // Add note to courses state
    const newNote = {
      unit: unitLabel,
      title: uploadDocTitle.trim(),
      fileName: uploadFile ? uploadFile.name : `${codePart}_${uploadDocTitle.replace(/\s+/g, '_')}.pdf`,
      fileSize: uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB` : '2.4 MB',
      uploadedDate: 'Just now',
    }

    setCourses((prev) => {
      const existingIdx = prev.findIndex((c) => c.code.toUpperCase() === codePart)
      if (existingIdx >= 0) {
        return prev.map((c, idx) => {
          if (idx === existingIdx) {
            return {
              ...c,
              notes: [newNote, ...c.notes],
            }
          }
          return c
        })
      } else {
        // Faculty typed a new subject not yet in list - create it dynamically!
        const newCourse: CourseSubject = {
          code: codePart,
          name: namePart || codePart,
          regulation: 'Regulation 2021 (Autonomous)',
          credits: 3,
          year: 2,
          semester: 3,
          section: 'A',
          enrolledStudents: 68,
          hoursTaught: 1,
          attendanceRate: '100%',
          units: [
            {
              unit: unitLabel,
              title: rawUnit || 'Introduction & Foundations',
              hours: 9,
              topics: ['Fundamental Concepts', 'Core Principles', 'Architecture Overview'],
              status: 'In-Progress',
            },
          ],
          notes: [newNote],
          labs: [],
          questions: [],
        }
        return [...prev, newCourse]
      }
    })

    setUploadSuccess(true)
    setTimeout(() => {
      setUploadSuccess(false)
      setShowUploadModal(false)
      setUploadDocTitle('')
      setUploadFile(null)
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Curriculum &amp; Course Workspace
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">My Allocated Subjects &amp; Syllabus</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Department Course Curriculum · Manage lesson plans, lecture materials, lab manuals, and question banks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openUploadModal}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#22C7E8]" /> Upload Material (PDF)
          </button>
          <button
            onClick={handleDownloadCoursePack}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Download className="w-4 h-4" /> Download Course Pack
          </button>
        </div>
      </div>

      {/* Course Selection Ribbon & Details */}
      {courses.length === 0 ? (
        <Card className="rounded-3xl border-gray-200 bg-white">
          <CardContent className="p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-sm text-[#071A3D]">No Allocated Subjects in Your Registry</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Subjects assigned to you by the Head of the Department (HOD) or Admin will automatically display their syllabus units, notes, and question banks here.
            </p>
            <div className="pt-2">
              <Link
                href="/faculty-dashboard"
                className="px-4 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5] transition-colors inline-flex items-center gap-1.5"
              >
                Back to Dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Course Selection Ribbon */}
          <div className="grid gap-3 sm:grid-cols-3">
            {courses.map((course, idx) => {
              const isSelected = selectedCourseIndex === idx
              return (
                <button
                  key={course.code}
                  onClick={() => setSelectedCourseIndex(idx)}
                  className={cn(
                    'p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden group',
                    isSelected
                      ? 'bg-gradient-to-br from-[#071A3D] to-[#1455D9] text-white border-[#1455D9] shadow-lg scale-[1.02]'
                      : 'bg-white text-[#071A3D] border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xs'
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-lg text-xs font-mono font-black',
                        isSelected ? 'bg-white/20 text-[#F4C430]' : 'bg-blue-50 text-[#1455D9]'
                      )}
                    >
                      {course.code}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        isSelected ? 'bg-emerald-400/20 text-emerald-300' : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {course.credits} Credits
                    </span>
                  </div>

                  <h3 className="font-bold text-sm leading-snug line-clamp-1">{course.name}</h3>

                  <div
                    className={cn(
                      'mt-3 pt-2 border-t flex items-center justify-between text-[11px]',
                      isSelected ? 'border-white/15 text-gray-300' : 'border-gray-100 text-gray-400'
                    )}
                  >
                    <span>{course.enrolledStudents} Enrolled</span>
                    <span className={cn('font-bold', isSelected ? 'text-emerald-300' : 'text-green-700')}>
                      {course.attendanceRate} Attd.
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {currentCourse && (
            <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
        <CardContent className="p-6 space-y-6">
          {/* Course Banner Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-black text-[#1455D9] px-2 py-0.5 rounded-md bg-blue-50">
                  {currentCourse.code}
                </span>
                <span className="text-xs text-gray-400 font-semibold">{currentCourse.regulation}</span>
              </div>
              <h2 className="text-xl font-black text-[#071A3D]">{currentCourse.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Year {currentCourse.year} · Semester {currentCourse.semester} · Section {currentCourse.section} · {currentCourse.hoursTaught} Periods Taught
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/faculty-dashboard/attendance"
                className="px-3.5 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <UserCheck className="w-4 h-4" /> Roll Call Attendance
              </Link>
            </div>
          </div>

          {/* Action Tabs Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 pb-2">
            {[
              { id: 'syllabus', label: '5-Unit Syllabus & Lessons', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'notes', label: 'Lecture Materials & PDFs', icon: <FileText className="w-4 h-4" /> },
              { id: 'labs', label: 'Laboratory Manuals', icon: <Code2 className="w-4 h-4" /> },
              { id: 'questions', label: 'Question Bank & Bloom\'s', icon: <FileQuestion className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer',
                  activeTab === tab.id
                    ? 'bg-[#071A3D] text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-[#071A3D]'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: 5-Unit Syllabus */}
          {activeTab === 'syllabus' && (
            <div className="space-y-4">
              {syllabusSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syllabusSuccessMsg}</span>
                </div>
              )}

              {/* State A: No Syllabus Uploaded Yet */}
              {(!currentCourse.units || currentCourse.units.length === 0) && !isEditingSyllabus && (
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-blue-50/40 via-white to-gray-50 border-2 border-dashed border-blue-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#1455D9] flex items-center justify-center mx-auto shadow-inner">
                    <FileUp className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-lg font-black text-[#071A3D]">No Syllabus Uploaded Yet</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Upload the official syllabus document (<span className="font-bold text-[#1455D9]">.PDF</span> or <span className="font-bold text-blue-700">.DOCX</span>) for <span className="font-bold text-[#071A3D]">{currentCourse.code} — {currentCourse.name}</span>. The system will automatically extract all 5 units, teaching hours, and topic bullet points.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSyllabusError(null)
                        setSyllabusFile(null)
                        setShowSyllabusUploadModal(true)
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> Upload Syllabus (PDF / DOCX)
                    </button>
                    <button
                      onClick={handleStartBlankTemplate}
                      className="px-4 py-2.5 rounded-2xl bg-white hover:bg-gray-100 text-[#071A3D] border border-gray-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" /> Start with Blank 5-Unit Template
                    </button>
                  </div>
                </div>
              )}

              {/* State B: View Mode with Uploaded Units */}
              {currentCourse.units && currentCourse.units.length > 0 && !isEditingSyllabus && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#071A3D]">Unit-Wise Detailed Lesson Plan</h3>
                      <span className="text-xs text-green-700 font-bold bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                        {currentCourse.units.length} Units Structured (100%)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={startEditingSyllabus}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" /> Edit Syllabus
                      </button>
                      <button
                        onClick={() => {
                          setSyllabusError(null)
                          setSyllabusFile(null)
                          setShowSyllabusUploadModal(true)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] border border-blue-200 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" /> Replace File (PDF/DOCX)
                      </button>
                      <button
                        onClick={handleDownloadCoursePack}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Export PDF
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentCourse.units.map((u, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2.5 hover:border-gray-200 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#1455D9] font-bold text-xs font-mono">
                              {u.unit}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-[#071A3D]">{u.title}</h4>
                          </div>
                          <span className="text-xs text-gray-400 font-semibold">{u.hours} Teaching Hours</span>
                        </div>

                        <div className="grid gap-1.5 sm:grid-cols-2 pt-1 border-t border-gray-200/60">
                          {u.topics.map((t, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-2 text-xs text-gray-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="line-clamp-2">{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* State C: Live Interactive Syllabus Editor */}
              {isEditingSyllabus && (
                <div className="space-y-4 p-5 rounded-3xl bg-amber-50/40 border border-amber-200 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/70">
                    <div>
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-amber-700" />
                        <h3 className="font-black text-sm text-[#071A3D]">Live Syllabus &amp; Lesson Plan Editor</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                          Editing: {currentCourse.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Modify unit titles, allocate teaching hours, and add or delete topic bullet points.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelEditingSyllabus}
                        disabled={savingSyllabus}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-bold cursor-pointer transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSyllabus}
                        disabled={savingSyllabus}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                      >
                        {savingSyllabus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{savingSyllabus ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Units List Editor */}
                  <div className="space-y-4">
                    {editableUnits.map((u, uIdx) => (
                      <div key={uIdx} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] font-bold text-xs font-mono shrink-0">
                              {u.unit}
                            </span>
                            <input
                              type="text"
                              value={u.title}
                              onChange={(e) => handleUnitTitleChange(uIdx, e.target.value)}
                              placeholder="Unit Title..."
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#071A3D] focus:bg-white focus:border-[#1455D9] focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={1}
                                max={60}
                                value={u.hours}
                                onChange={(e) => handleUnitHoursChange(uIdx, parseInt(e.target.value, 10) || 9)}
                                className="w-16 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center text-[#071A3D] focus:bg-white focus:border-[#1455D9] focus:outline-none"
                              />
                              <span className="text-[11px] text-gray-500 font-semibold">Hours</span>
                            </div>

                            {editableUnits.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveUnit(uIdx)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Unit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Topics for this unit */}
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Topics &amp; Sub-modules ({u.topics.length})
                          </span>

                          <div className="space-y-1.5">
                            {u.topics.map((top, tIdx) => (
                              <div key={tIdx} className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-gray-400 w-4 text-right shrink-0">{tIdx + 1}.</span>
                                <input
                                  type="text"
                                  value={top}
                                  onChange={(e) => handleTopicChange(uIdx, tIdx, e.target.value)}
                                  placeholder="Topic description..."
                                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-2.5 py-1 text-xs text-gray-700 focus:bg-white focus:border-[#1455D9] focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTopic(uIdx, tIdx)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors cursor-pointer shrink-0"
                                  title="Remove topic"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddTopic(uIdx)}
                            className="text-[11px] font-bold text-[#1455D9] hover:text-[#0e44b5] flex items-center gap-1 pt-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Topic
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Unit & Save Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAddUnit}
                      className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:border-[#1455D9] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#1455D9]" /> Add Another Unit
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelEditingSyllabus}
                        disabled={savingSyllabus}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-bold cursor-pointer transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSyllabus}
                        disabled={savingSyllabus}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                      >
                        {savingSyllabus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{savingSyllabus ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Lecture Materials */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#071A3D]">Uploaded Notes &amp; Handouts</h3>
                <button
                  onClick={openUploadModal}
                  className="px-3 py-1.5 bg-[#1455D9] text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#0e44b5] cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload Material
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {currentCourse.notes.map((n, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                        {n.unit}
                      </span>
                      <p className="font-bold text-xs text-[#071A3D] truncate">{n.title}</p>
                      <p className="text-[10px] text-gray-400">{n.fileName} · {n.fileSize} · {n.uploadedDate}</p>
                    </div>

                    <button
                      onClick={handleDownloadCoursePack}
                      className="p-2 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-[#1455D9] hover:text-white transition-all shrink-0 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Laboratory Manuals */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#071A3D]">Practical Experiments &amp; Lab Guidelines</h3>
                <span className="text-xs text-gray-400">Autonomous Laboratory Schedule</span>
              </div>

              <div className="space-y-3">
                {currentCourse.labs.map((l) => (
                  <div key={l.expNo} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black">
                        Experiment {l.expNo}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-[#071A3D]">{l.title}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">Tools: {l.tools}</p>
                    </div>

                    <button
                      onClick={handleDownloadCoursePack}
                      className="px-3 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Guide PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Question Bank & Bloom's Taxonomy */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#071A3D]">Important 2-Mark &amp; 16-Mark Question Archive</h3>
                <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  CO-PO Mapped
                </span>
              </div>

              <div className="space-y-3">
                {currentCourse.questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-md text-[10px] font-black',
                          q.type === '2_mark' ? 'bg-blue-50 text-[#1455D9]' : 'bg-purple-50 text-purple-700'
                        )}
                      >
                        {q.type === '2_mark' ? 'PART-A (2 Marks)' : 'PART-B (16 Marks)'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">{q.bloom}</span>
                    </div>
                    <p className="text-xs font-bold text-[#071A3D]">{q.q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      )}
      </>
      )}

      {/* Upload Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Upload Lecture Material</h3>
                <p className="text-xs text-gray-500">
                  Publish notes or lab guide for {currentCourse?.code || uploadTargetCode || 'Curriculum Subject'}
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#071A3D]">Material Published!</h4>
                <p className="text-xs text-gray-500">Students can now view and download this PDF in their portal.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#071A3D] block">Target Subject *</label>
                    <span className="text-[10px] text-[#1455D9] font-bold">Typable &amp; Searchable</span>
                  </div>
                  <input
                    type="text"
                    list="target-subjects-datalist"
                    value={uploadTargetCode}
                    onChange={(e) => {
                      const val = e.target.value
                      setUploadTargetCode(val)
                      const matching = courses.find(
                        (c) =>
                          val.toUpperCase().includes(c.code.toUpperCase()) ||
                          c.name.toLowerCase().includes(val.toLowerCase())
                      )
                      if (matching && matching.units.length > 0) {
                        setUploadUnitTitle(`${matching.units[0].unit} - ${matching.units[0].title}`)
                      }
                    }}
                    placeholder="Type subject code or title (e.g. AD3301 - Design and Analysis of Algorithms)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#071A3D] focus:outline-none focus:border-[#1455D9] focus:bg-white transition-all shadow-xs"
                    required
                  />
                  <datalist id="target-subjects-datalist">
                    {courses.map((c) => (
                      <option key={c.code} value={`${c.code} - ${c.name}`}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </datalist>

                  {/* Quick Select Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-gray-400 font-bold">Quick Select:</span>
                    {courses.map((c) => {
                      const isSelected = uploadTargetCode.includes(c.code)
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setUploadTargetCode(`${c.code} - ${c.name}`)
                            if (c.units.length > 0) {
                              setUploadUnitTitle(`${c.units[0].unit} - ${c.units[0].title}`)
                            }
                          }}
                          className={cn(
                            'text-[10px] px-2.5 py-1 rounded-lg border font-mono font-bold cursor-pointer transition-all',
                            isSelected
                              ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs scale-105'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-[#1455D9] hover:text-[#1455D9]'
                          )}
                        >
                          {c.code}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#071A3D] block">Select / Type Unit *</label>
                    <span className="text-[10px] text-[#1455D9] font-bold">Typable &amp; Searchable</span>
                  </div>
                  <input
                    type="text"
                    list="target-units-datalist"
                    value={uploadUnitTitle}
                    onChange={(e) => setUploadUnitTitle(e.target.value)}
                    placeholder="Type custom unit or topic (e.g. Unit I - Foundations)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#071A3D] focus:outline-none focus:border-[#1455D9] focus:bg-white transition-all shadow-xs"
                    required
                  />
                  <datalist id="target-units-datalist">
                    {((courses.find((c) => uploadTargetCode.toUpperCase().includes(c.code.toUpperCase())) || currentCourse)?.units || []).map((u) => (
                      <option key={u.unit} value={`${u.unit} - ${u.title}`}>
                        {u.unit} — {u.title}
                      </option>
                    ))}
                    <option value="Unit I - Introduction & Foundations" />
                    <option value="Unit II - Core Algorithms & Models" />
                    <option value="Unit III - Advanced Paradigms & Kernels" />
                    <option value="Unit IV - Unsupervised & High Dimension" />
                    <option value="Unit V - Modern Frameworks & Deep Networks" />
                  </datalist>

                  {/* Quick Unit Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-gray-400 font-bold">Quick Select:</span>
                    {['Unit I', 'Unit II', 'Unit III', 'Unit IV', 'Unit V'].map((uTag) => {
                      const matchedUnit = (
                        courses.find((c) => uploadTargetCode.toUpperCase().includes(c.code.toUpperCase())) || currentCourse
                      )?.units?.find((u) => u.unit === uTag)
                      const fillVal = matchedUnit ? `${matchedUnit.unit} - ${matchedUnit.title}` : uTag
                      const isSelected = uploadUnitTitle.startsWith(uTag)

                      return (
                        <button
                          key={uTag}
                          type="button"
                          onClick={() => setUploadUnitTitle(fillVal)}
                          className={cn(
                            'text-[10px] px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-all',
                            isSelected
                              ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs scale-105'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-[#1455D9] hover:text-[#1455D9]'
                          )}
                        >
                          {uTag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#071A3D] block mb-1">Document Title *</label>
                  <input
                    type="text"
                    value={uploadDocTitle}
                    onChange={(e) => setUploadDocTitle(e.target.value)}
                    placeholder="e.g. Unit 3 State Space Search & TSP Notes"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[#071A3D] block mb-1">PDF File Document</label>
                  <div className="relative border-2 border-dashed border-gray-300 hover:border-[#1455D9] rounded-2xl p-4 text-center transition-colors bg-gray-50/50">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadFile(e.target.files[0])
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {uploadFile ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span className="truncate max-w-[200px]">{uploadFile.name}</span>
                        <span className="text-[10px] text-gray-400">
                          ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 text-gray-400 mx-auto" />
                        <p className="text-[11px] font-bold text-gray-700">Click or drag &amp; drop PDF notes</p>
                        <p className="text-[10px] text-gray-400">PDF up to 25 MB</p>
                      </div>
                    )}
                  </div>
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
                    className="px-5 py-2 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Upload &amp; Publish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Syllabus PDF/DOCX Upload & Automated Extraction Modal */}
      {showSyllabusUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-up border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-[#1455D9]">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#071A3D] text-base">Upload Syllabus Document</h3>
                  <p className="text-xs text-gray-400">Extracts units, hours, and topics from PDF or DOCX</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSyllabusUploadModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {syllabusError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{syllabusError}</span>
              </div>
            )}

            <form onSubmit={handleSyllabusUploadSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Course</span>
                <p className="font-bold text-xs text-[#071A3D]">
                  {currentCourse?.code} — {currentCourse?.name}
                </p>
              </div>

              <div>
                <label className="font-bold text-xs text-[#071A3D] block mb-1">
                  Select Syllabus File (.PDF or .DOCX) *
                </label>
                <div className="relative border-2 border-dashed border-blue-200 hover:border-[#1455D9] rounded-2xl p-6 text-center transition-all bg-blue-50/20 group">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSyllabusFile(e.target.files[0])
                        setSyllabusError(null)
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {syllabusFile ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="truncate max-w-[240px]">{syllabusFile.name}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {(syllabusFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to parse
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-[#1455D9] mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-gray-700">Click or drag &amp; drop syllabus document</p>
                      <p className="text-[10px] text-gray-400">Supports PDF, DOCX, DOC up to 25 MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSyllabusUploadModal(false)}
                  disabled={uploadingSyllabus}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!syllabusFile || uploadingSyllabus}
                  className="px-5 py-2 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {uploadingSyllabus ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Syllabus Data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#F4C430]" />
                      <span>Extract &amp; Publish Syllabus</span>
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
