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

  const currentCourse = courses[selectedCourseIndex] || null

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
            onClick={() => setShowUploadModal(true)}
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
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#071A3D]">Unit-Wise Detailed Lesson Plan</h3>
                <span className="text-xs text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  5 / 5 Units Structured (100%)
                </span>
              </div>

              <div className="space-y-3">
                {currentCourse.units.map((u, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#1455D9] font-bold text-xs">
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
                          <span className="line-clamp-1">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Lecture Materials */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#071A3D]">Uploaded Notes &amp; Handouts</h3>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-3 py-1.5 bg-[#1455D9] text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#0e44b5]"
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
                <p className="text-xs text-gray-500">Publish notes or lab guide for {currentCourse.code}</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
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
              <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Select Unit</label>
                  <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold">
                    <option>Unit I - Introduction &amp; Foundations</option>
                    <option>Unit II - Core Algorithms &amp; Models</option>
                    <option>Unit III - Advanced Paradigms &amp; Kernels</option>
                    <option>Unit IV - Unsupervised &amp; High Dimension</option>
                    <option>Unit V - Modern Frameworks &amp; Deep Networks</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Document Title</label>
                  <input type="text" placeholder="e.g. Unit 4 PCA & Dimensionality Notes" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" required />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">PDF File</label>
                  <input type="file" accept=".pdf" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]">Upload &amp; Publish</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
