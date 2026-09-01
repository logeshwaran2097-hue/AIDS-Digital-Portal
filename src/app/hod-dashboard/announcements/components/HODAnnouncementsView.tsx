'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Megaphone,
  Search,
  Download,
  Plus,
  Clock,
  Calendar,
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Send,
  AlertCircle,
  FileText,
  Tag,
  Filter,
  Check,
  X,
  Shield,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  category: string
  target: string
  targetYear?: number | null
  targetSemester?: number | null
  createdByName?: string | null
  isPublished: boolean
  createdAt: Date
}

export interface TargetFacultyOption {
  id: string
  facultyId: string
  name: string
  designation: string
}

export interface TargetStudentOption {
  id: string
  registerNumber: string
  name: string
}

export function HODAnnouncementsView({
  initialAnnouncements,
  facultyList,
  studentList,
}: {
  initialAnnouncements: AnnouncementItem[]
  facultyList: TargetFacultyOption[]
  studentList: TargetStudentOption[]
}) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createStep, setCreateStep] = useState<'edit' | 'preview'>('edit')
  const [broadcastAlert, setBroadcastAlert] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Academic')
  const [targetType, setTargetType] = useState<
    'ALL' | 'STUDENTS' | 'FACULTY' | 'ALL_ADVISORS' | 'ADVISORS_Y1' | 'ADVISORS_Y2' | 'ADVISORS_Y3' | 'ADVISORS_Y4' | 'PARTICULAR_FACULTY' | 'PARTICULAR_STUDENT'
  >('STUDENTS')
  const [selectedFacultyId, setSelectedFacultyId] = useState(facultyList[0]?.facultyId || 'AI001')
  const [selectedStudentReg, setSelectedStudentReg] = useState(studentList[0]?.registerNumber || '23AD001')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState('NORMAL')

  // Auto-sync HOD announcements in real-time
  useEffect(() => {
    const fetchFreshAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements', { cache: 'no-store' })
        const data = await res.json()
        if (data.success && Array.isArray(data.announcements)) {
          setAnnouncements(
            data.announcements.map((a: any) => ({
              id: a.id,
              title: a.title,
              content: a.content,
              category: a.category,
              target: a.target,
              createdByName: a.createdByName,
              isPublished: a.isPublished !== false,
              createdAt: new Date(a.createdAt),
            }))
          )
        }
      } catch {}
    }

    const timer = setInterval(fetchFreshAnnouncements, 3500)
    return () => clearInterval(timer)
  }, [])

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesAudience = true
      if (selectedAudienceFilter === 'STUDENTS') {
        matchesAudience = a.target.toLowerCase().includes('student')
      } else if (selectedAudienceFilter === 'FACULTY') {
        matchesAudience = a.target.toLowerCase().includes('faculty')
      } else if (selectedAudienceFilter === 'PARTICULAR') {
        matchesAudience =
          a.target.toLowerCase().includes('dr.') ||
          a.target.toLowerCase().includes('prof.') ||
          a.target.toLowerCase().includes('mrs.') ||
          a.target.toLowerCase().includes('mr.') ||
          a.target.toLowerCase().includes('23ad') ||
          a.target.toLowerCase().includes('individual')
      }

      return matchesSearch && matchesAudience
    })
  }, [announcements, searchQuery, selectedAudienceFilter])

  const handleDownloadCircularPDF = (a: AnnouncementItem) => {
    const d = new Date(a.createdAt)
    generateAndDownloadPDF({
      title: 'OFFICIAL DEPARTMENT CIRCULAR & EXECUTIVE DIRECTIVE',
      subtitle: `REF: VSB/AIDS/HOD-CIR/2026/${a.id.slice(-4).toUpperCase()} · DATE: ${d.toLocaleDateString('en-GB')}`,
      author: 'Prof. Dr. V. Sundar (Head of the Department)',
      category: `EXECUTIVE NOTICE: ${a.category.toUpperCase()}`,
      sections: [
        {
          heading: `OFFICIAL SUBJECT: ${a.title.toUpperCase()}`,
          body: [
            `Target Recipient / Audience: ${a.target.toUpperCase()}`,
            'Issuing Authority: Office of the Head of Department (AI & DS)',
            'Compliance Status: Immediate Academic & Administrative Adherence',
          ],
        },
        {
          heading: 'NOTICE PARTICULARS & INSTRUCTIONS',
          body: [
            a.content,
            'All designated recipients are instructed to acknowledge receipt and ensure strict compliance.',
            'For any inquiries or appeals, contact the HOD Executive Secretariat (Room 101).',
          ],
        },
      ],
      fileName: `HOD_Circular_${a.id.slice(-4)}_${a.category}`,
    })
  }

  const handleBroadcast = (a: AnnouncementItem) => {
    setBroadcastAlert(`Dispatched Real-Time Push Notification & SMS for "${a.title}" to ${a.target}!`)
    setTimeout(() => setBroadcastAlert(null), 3500)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    let finalTarget = 'ALL'
    if (targetType === 'STUDENTS') {
      finalTarget = 'All Students'
    } else if (targetType === 'FACULTY') {
      finalTarget = 'All Faculty Members'
    } else if (targetType === 'ALL_ADVISORS') {
      finalTarget = 'All Class Advisors (Years 1 - 4)'
    } else if (targetType === 'ADVISORS_Y1') {
      finalTarget = 'Year 1 Class Advisors'
    } else if (targetType === 'ADVISORS_Y2') {
      finalTarget = 'Year 2 Class Advisors'
    } else if (targetType === 'ADVISORS_Y3') {
      finalTarget = 'Year 3 Class Advisors'
    } else if (targetType === 'ADVISORS_Y4') {
      finalTarget = 'Year 4 Class Advisors'
    } else if (targetType === 'PARTICULAR_FACULTY') {
      const f = facultyList.find((fac) => fac.facultyId === selectedFacultyId)
      finalTarget = f ? `Faculty: ${f.name} (${f.facultyId})` : `Faculty (${selectedFacultyId})`
    } else if (targetType === 'PARTICULAR_STUDENT') {
      const s = studentList.find((stu) => stu.registerNumber === selectedStudentReg)
      finalTarget = s ? `Student: ${s.name} (${s.registerNumber})` : `Student (${selectedStudentReg})`
    }

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: priority === 'URGENT' ? `[URGENT / PRIORITY NOTICE]\n${content}` : content,
          category,
          target: finalTarget,
          createdByName: 'Prof. Dr. V. Sundar (HOD)',
        }),
      })

      const data = await res.json()
      if (data.success && data.announcement) {
        setAnnouncements((prev) => [
          {
            id: data.announcement.id,
            title: data.announcement.title,
            content: data.announcement.content,
            category: data.announcement.category,
            target: data.announcement.target,
            createdByName: data.announcement.createdByName,
            isPublished: true,
            createdAt: new Date(),
          },
          ...prev,
        ])
      } else {
        // Fallback local update
        setAnnouncements((prev) => [
          {
            id: 'ann_' + Date.now(),
            title,
            content: priority === 'URGENT' ? `[URGENT / PRIORITY NOTICE]\n${content}` : content,
            category,
            target: finalTarget,
            createdByName: 'Prof. Dr. V. Sundar (HOD)',
            isPublished: true,
            createdAt: new Date(),
          },
          ...prev,
        ])
      }

      setBroadcastAlert(`Successfully Published & Broadcasted Announcement to ${finalTarget}!`)
      setTimeout(() => setBroadcastAlert(null), 4000)
      setShowCreateModal(false)
      setTitle('')
      setContent('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Executive Broadcast Center
            </span>
            <span className="text-xs text-gray-300 font-medium">· Office of the Head of Department</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Department Announcements &amp; Circulars</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Prof. Dr. V. Sundar · Issue targeted notices to All Students, All Faculty, or Specific Individuals
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" /> Issue New Announcement
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Notices</p>
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">{announcements.length} Circulars</p>
            <p className="text-[10px] text-gray-400">Department Active</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs bg-purple-50/20">
          <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Faculty Notices</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">
            {announcements.filter((a) => a.target.toLowerCase().includes('faculty')).length} Active
          </p>
          <p className="text-[10px] text-purple-600 font-semibold">Council &amp; Academic</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Student Notices</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">
            {announcements.filter((a) => a.target.toLowerCase().includes('student') || a.target === 'ALL').length} Active
          </p>
          <p className="text-[10px] text-green-700 font-semibold">Exams &amp; Placements</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Direct Target</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">1-to-1 Enabled</p>
          <p className="text-[10px] text-amber-700 font-semibold">Private &amp; Confidential</p>
        </div>
      </div>

      {/* Broadcast Alert Feedback */}
      {broadcastAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{broadcastAlert}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars by title, keyword, recipient or category..."
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Notices' },
            { id: 'STUDENTS', label: '🎓 To Students' },
            { id: 'FACULTY', label: '📚 To Faculty' },
            { id: 'PARTICULAR', label: '🎯 Particular Person' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedAudienceFilter(t.id)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0',
                selectedAudienceFilter === t.id
                  ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((a) => {
          const isIndividual =
            a.target.includes('Faculty:') ||
            a.target.includes('Student:') ||
            a.target.includes('23AD') ||
            a.target.includes('AI00')
          const isFacultyAudience = a.target.toLowerCase().includes('faculty')
          const isStudentAudience = a.target.toLowerCase().includes('student')

          return (
            <Card
              key={a.id}
              className="rounded-3xl border-gray-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-black uppercase tracking-wider border border-blue-200/60">
                      {a.category}
                    </span>

                    {/* Target Audience Badge */}
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1',
                        isIndividual
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : isFacultyAudience
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : isStudentAudience
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      )}
                    >
                      {isIndividual ? (
                        <User className="w-3 h-3 text-amber-600" />
                      ) : isFacultyAudience ? (
                        <BookOpen className="w-3 h-3 text-purple-600" />
                      ) : (
                        <GraduationCap className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>Audience: {a.target}</span>
                    </span>

                    <span className="text-[11px] text-gray-400 font-semibold">
                      {formatDate(a.createdAt)}
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-500 font-medium">
                    Issued by: <strong className="text-gray-800">{a.createdByName || 'Prof. Dr. V. Sundar (HOD)'}</strong>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                    {a.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                    {a.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleBroadcast(a)}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#1455D9]" /> Re-Broadcast Alert
                  </button>

                  <button
                    onClick={() => handleDownloadCircularPDF(a)}
                    className="px-4 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Stamped Circular (PDF)
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase">
                  HOD Executive Directive
                </span>
                <h3 className="text-lg font-black text-[#071A3D] mt-1">Issue Department Announcement</h3>
                <p className="text-xs text-gray-500">Broadcast notices to batches or specific individuals</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {createStep === 'preview' ? (
              /* High-Fidelity HOD Official Circular Preview */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/30 border-2 border-indigo-200 shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#071A3D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        🏛️
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-[#071A3D] uppercase tracking-wider">V.S.B. Engineering College</p>
                        <p className="text-[10px] text-gray-500 font-semibold">Office of Head of Department · AI & DS</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      HOD PREVIEW
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-800 border border-indigo-200">
                      🏷️ {category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-[#1455D9] border border-blue-200">
                      👥 {targetType === 'STUDENTS' ? 'All Students' : targetType === 'FACULTY' ? 'All Faculty' : targetType === 'ALL' ? 'All Department' : targetType === 'PARTICULAR_FACULTY' ? `Specific Faculty: ${selectedFacultyId}` : `Specific Student: ${selectedStudentReg}`}
                    </span>
                    {priority === 'URGENT' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200 animate-pulse">
                        ⚠️ URGENT
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-base text-[#071A3D] leading-snug">
                    {title || 'Untitled Announcement'}
                  </h3>

                  <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200 font-medium">
                    {content || 'No directives entered.'}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 font-medium border-t border-gray-100">
                    <span>Authorized by: <strong className="text-[#071A3D]">Prof. Dr. V. Sundar (Head of Department)</strong></span>
                    <span className="font-mono">Ref: VSB/HOD/2026</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateStep('edit')}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    ← Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSubmit}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> {submitting ? 'Publishing...' : '✓ Confirm & Broadcast Circular'}
                  </button>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!title.trim() || !content.trim()) {
                    alert('Please fill in Title and Content')
                    return
                  }
                  setCreateStep('preview')
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Announcement Title / Subject</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Schedule for Academic Council Meeting / Lab External Review"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#1455D9]/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Examination">Examination</option>
                      <option value="Placement">Placement</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Disciplinary">Disciplinary</option>
                      <option value="Symposium">Symposium &amp; Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-red-600"
                    >
                      <option value="NORMAL">Normal Priority</option>
                      <option value="URGENT">⚠️ Urgent / Critical Alert</option>
                    </select>
                  </div>
                </div>

                {/* Target Audience Selector */}
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2.5">
                  <label className="font-bold text-[#071A3D] block text-xs">Target Recipient Scope</label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'STUDENTS', label: '🎓 All Students' },
                      { id: 'FACULTY', label: '📚 All Faculty' },
                      { id: 'ALL', label: '🏛️ All Dept' },
                      { id: 'ALL_ADVISORS', label: '⭐ All Advisors (1-4)' },
                      { id: 'ADVISORS_Y1', label: '👨‍🏫 Year 1 Advisors' },
                      { id: 'ADVISORS_Y2', label: '👨‍🏫 Year 2 Advisors' },
                      { id: 'ADVISORS_Y3', label: '👨‍🏫 Year 3 Advisors' },
                      { id: 'ADVISORS_Y4', label: '👨‍🏫 Year 4 Advisors' },
                      { id: 'PARTICULAR_FACULTY', label: '👤 Specific Faculty' },
                      { id: 'PARTICULAR_STUDENT', label: '🎯 Specific Student' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTargetType(t.id as any)}
                        className={cn(
                          'px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center',
                          targetType === t.id
                            ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Specific Faculty Selector */}
                  {targetType === 'PARTICULAR_FACULTY' && (
                    <div className="pt-2 border-t border-blue-200/60 space-y-1 animate-in fade-in">
                      <label className="font-bold text-purple-800 block text-[11px]">Select Specific Faculty Member:</label>
                      <select
                        value={selectedFacultyId}
                        onChange={(e) => setSelectedFacultyId(e.target.value)}
                        className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-[#071A3D]"
                      >
                        {facultyList.map((f) => (
                          <option key={f.id} value={f.facultyId}>
                            {f.name} ({f.facultyId} - {f.designation})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Specific Student Selector */}
                  {targetType === 'PARTICULAR_STUDENT' && (
                    <div className="pt-2 border-t border-blue-200/60 space-y-1 animate-in fade-in">
                      <label className="font-bold text-amber-800 block text-[11px]">Select Specific Student:</label>
                      <select
                        value={selectedStudentReg}
                        onChange={(e) => setSelectedStudentReg(e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold text-[#071A3D]"
                      >
                        {studentList.map((s) => (
                          <option key={s.id} value={s.registerNumber}>
                            {s.registerNumber} — {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Notice Content &amp; Directives</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Detailed instructions, room allocations, timings, required attachments, or submission deadlines..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#1455D9]/20"
                    required
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setCreateStep('edit')
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>👁️ Preview &amp; Confirm Notice</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
