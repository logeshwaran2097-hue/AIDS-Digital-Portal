'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Megaphone,
  Plus,
  Trash2,
  Download,
  Search,
  Filter,
  Send,
  X,
  FileText,
  Users,
  Building,
  Sparkles,
  GraduationCap,
  Briefcase,
  UserCheck,
  FlaskConical,
  Layers,
  Calendar,
  Award,
  Zap,
  BookOpen,
  HelpCircle,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface AnnouncementRecord {
  id: string
  title: string
  content: string
  category: string
  target: string
  targetSpecific?: string | null
  createdByName: string
  isPublished: boolean
  createdAt: string
}

export const TARGET_AUDIENCE_OPTIONS = [
  {
    group: 'General Broad Audience',
    options: [
      { value: 'ALL', label: 'All Students & Faculty', icon: 'users' },
      { value: 'students', label: 'All Students (Years 1 to 4)', icon: 'graduation' },
      { value: 'faculty', label: 'All Faculty & Instructors', icon: 'briefcase' },
      { value: 'hod', label: 'Head of Department (HOD)', icon: 'award' },
      { value: 'advisors', label: 'Class Advisors Only', icon: 'user-check' },
      { value: 'lab_handlers', label: 'Lab Instructors & Subject Handlers', icon: 'flask' },
    ],
  },
  {
    group: 'By Academic Year (Years I – IV)',
    options: [
      { value: 'year1', label: 'Year 1 Students (Freshman · Sem 1 & 2)', icon: 'calendar' },
      { value: 'year2', label: 'Year 2 Students (Sophomore · Sem 3 & 4)', icon: 'calendar' },
      { value: 'year3', label: 'Year 3 Students (Junior · Sem 5 & 6)', icon: 'calendar' },
      { value: 'year4', label: 'Year 4 Students (Senior · Sem 7 & 8)', icon: 'calendar' },
    ],
  },
  {
    group: 'By Individual Semester (Semesters 1 – 8)',
    options: [
      { value: 'sem1', label: 'Semester 1 Students (Year 1 - Odd)', icon: 'layers' },
      { value: 'sem2', label: 'Semester 2 Students (Year 1 - Even)', icon: 'layers' },
      { value: 'sem3', label: 'Semester 3 Students (Year 2 - Odd)', icon: 'layers' },
      { value: 'sem4', label: 'Semester 4 Students (Year 2 - Even)', icon: 'layers' },
      { value: 'sem5', label: 'Semester 5 Students (Year 3 - Odd)', icon: 'layers' },
      { value: 'sem6', label: 'Semester 6 Students (Year 3 - Even)', icon: 'layers' },
      { value: 'sem7', label: 'Semester 7 Students (Year 4 - Odd)', icon: 'layers' },
      { value: 'sem8', label: 'Semester 8 Students (Year 4 - Even)', icon: 'layers' },
    ],
  },
]

export const CIRCULAR_CATEGORIES = [
  {
    group: 'Academics & Examinations',
    options: [
      { value: 'ACADEMIC', label: 'Academic & Internal Exams', badge: 'bg-blue-50 text-[#1455D9] border-blue-200' },
      { value: 'TIMETABLE', label: 'Class & Lab Timetable Schedule', badge: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
      { value: 'CURRICULUM', label: 'Curriculum, Electives & Regulations', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    ],
  },
  {
    group: 'Placement, Training & Industry',
    options: [
      { value: 'PLACEMENT', label: 'Placement Drives & Campus Recruitment', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { value: 'INTERNSHIP', label: 'Internships & In-Plant Industrial Visits', badge: 'bg-teal-50 text-teal-800 border-teal-200' },
      { value: 'APTITUDE', label: 'Aptitude & Soft Skills Training', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    ],
  },
  {
    group: 'Symposiums, Hackathons & Innovation',
    options: [
      { value: 'SYMPOSIUM', label: 'National Symposium & Conferences', badge: 'bg-amber-50 text-amber-800 border-amber-300' },
      { value: 'HACKATHON', label: 'Hackathons, Coding Contests & Expos', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
      { value: 'WORKSHOP', label: 'Technical Workshops & Guest Seminars', badge: 'bg-orange-50 text-orange-800 border-orange-200' },
    ],
  },
  {
    group: 'Student Welfare & Co-Curricular',
    options: [
      { value: 'CLUB', label: 'AI Association & Department Clubs', badge: 'bg-pink-50 text-pink-700 border-pink-200' },
      { value: 'SCHOLARSHIP', label: 'Scholarships & Merit Awards', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    ],
  },
  {
    group: 'Department Administration & Campus Logistics',
    options: [
      { value: 'FACULTY_NOTICE', label: 'Department Meeting & Faculty Notice', badge: 'bg-purple-50 text-purple-800 border-purple-300' },
      { value: 'LOGISTICS', label: 'Hostel, Transport & Campus Guidelines', badge: 'bg-gray-50 text-gray-700 border-gray-300' },
      { value: 'GENERAL', label: 'General Institutional Circular / Holiday', badge: 'bg-blue-50 text-[#071A3D] border-gray-200' },
    ],
  },
]

export function AdminAnnouncementsView({
  initialAnnouncements,
  studentList = [],
  facultyList = [],
}: {
  initialAnnouncements: AnnouncementRecord[]
  studentList?: { id: string; name: string; registerNumber: string }[]
  facultyList?: { id: string; name: string; facultyId: string }[]
}) {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>(initialAnnouncements)
  const [searchQuery, setSearchQuery] = useState('')
  const [targetFilter, setTargetFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'ACADEMIC',
    target: 'ALL',
    targetSpecific: '',
  })

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesTarget = targetFilter === 'ALL' || a.target === targetFilter
    const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.target.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTarget && matchesCategory && matchesSearch
  })

  const getAudienceLabel = (target: string): string => {
    for (const grp of TARGET_AUDIENCE_OPTIONS) {
      const found = grp.options.find((o) => o.value === target || o.value.toLowerCase() === target.toLowerCase())
      if (found) return found.label
    }
    if (target === 'ALL') return 'All Students & Faculty'
    if (target === 'students') return 'All Students'
    if (target === 'faculty') return 'All Faculty'
    return target
  }

  const getCategoryLabel = (category: string): string => {
    for (const grp of CIRCULAR_CATEGORIES) {
      const found = grp.options.find((o) => o.value === category || o.value.toLowerCase() === category.toLowerCase())
      if (found) return found.label
    }
    return category
  }

  const getCategoryBadgeStyle = (category: string) => {
    for (const grp of CIRCULAR_CATEGORIES) {
      const found = grp.options.find((o) => o.value === category || o.value.toLowerCase() === category.toLowerCase())
      if (found) return found.badge
    }
    return 'bg-blue-50 text-[#1455D9] border-blue-200'
  }

  const getAudienceBadgeStyle = (target: string) => {
    const t = target.toLowerCase()
    if (t === 'all') return 'bg-blue-50 text-[#1455D9] border-blue-200'
    if (t === 'students') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (t === 'faculty') return 'bg-purple-50 text-purple-700 border-purple-200'
    if (t === 'hod') return 'bg-amber-50 text-amber-800 border-amber-300'
    if (t === 'advisors') return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    if (t === 'lab_handlers') return 'bg-rose-50 text-rose-700 border-rose-200'
    if (t.startsWith('year')) return 'bg-teal-50 text-teal-800 border-teal-200'
    if (t.startsWith('sem')) return 'bg-cyan-50 text-cyan-800 border-cyan-200'
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const handleExportAllPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
      subtitle: 'Official Circulars & Executive Notifications Digest · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Department Announcements Archive',
      sections: [
        {
          heading: '1. EXECUTIVE BROADCAST SUMMARY',
          body: [
            `Total Published Notices: ${announcements.length} Official Circulars`,
            'Authorizing Body: Department of AI & DS Administration',
            'Audience Targeting: All 8 Semesters, Academic Years I - IV, Class Advisors, Lab Handlers, and Leadership',
          ],
        },
        {
          heading: '2. DIGEST OF ACTIVE NOTICES',
          body: announcements.map(
            (a, idx) =>
              `${idx + 1}. [${getCategoryLabel(a.category)}] ${a.title} — Target: ${getAudienceLabel(a.target)} | Date: ${a.createdAt}\n${a.content}`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Official_Notices_2026',
    })
  }

  const handleDownloadCircular = (ann: AnnouncementRecord) => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
      subtitle: 'Official Notification & Administrative Circular · Autonomous Scheme',
      author: ann.createdByName || 'Office of the Super Administrator',
      category: `Circular / ${getCategoryLabel(ann.category)}`,
      sections: [
        {
          heading: `SUBJECT: ${ann.title.toUpperCase()}`,
          body: [
            ann.content,
            `Category: ${getCategoryLabel(ann.category)}`,
            `Target Audience: ${getAudienceLabel(ann.target)} ${ann.targetSpecific ? `(${ann.targetSpecific})` : ''}`,
            `Date of Issue: ${ann.createdAt}`,
            `Authorized Authority: ${ann.createdByName}`,
          ],
        },
        {
          heading: 'INSTRUCTIONS & COMPLIANCE',
          body: [
            '1. All concerned students and faculty members are directed to strictly adhere to the schedule.',
            '2. Queries regarding this circular must be routed through the Department Office.',
          ],
        },
      ],
      fileName: `Circular_${ann.title.slice(0, 20).replace(/\s+/g, '_')}`,
    })
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      alert('Please fill in Title and Content')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await res.json()

      if (result.success && result.announcement) {
        const a = result.announcement
        const newA: AnnouncementRecord = {
          id: a.id,
          title: a.title,
          content: a.content,
          category: a.category,
          target: a.target,
          targetSpecific: formData.targetSpecific || null,
          createdByName: a.createdByName || 'System Administrator',
          isPublished: true,
          createdAt: a.createdAt ? String(a.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
        }
        setAnnouncements([newA, ...announcements])
        setIsAddModalOpen(false)
        setFormData({
          title: '',
          content: '',
          category: 'ACADEMIC',
          target: 'ALL',
          targetSpecific: '',
        })
        toast.success('Circular broadcast successfully to database!')
      } else {
        toast.error(result.message || 'Failed to issue circular')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error publishing circular.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setAnnouncements(announcements.filter((a) => a.id !== id))
        toast.success('Circular removed from database.')
      } else {
        toast.error(result.message || 'Failed to delete circular')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting circular.')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Department Communications
            </span>
            <span className="text-xs text-gray-300 font-medium">· Multi-Target Broadcast across 8 Semesters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Official Circulars &amp; Notices</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Broadcast official notices to all students, faculty, HOD, specific academic years (1 - 4), or individual semesters (1 - 8)
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportAllPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F4C430]" /> Export All (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Issue New Circular
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search circulars, subject, target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20 font-medium"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Target Audience Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Audience:</span>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Audiences</option>
              {TARGET_AUDIENCE_OPTIONS.map((grp) => (
                <optgroup key={grp.group} label={grp.group}>
                  {grp.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Categories</option>
              {CIRCULAR_CATEGORIES.map((grp) => (
                <optgroup key={grp.group} label={grp.group}>
                  {grp.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
            Showing {filteredAnnouncements.length} of {announcements.length} Notices
          </span>
        </div>
      </div>

      {/* Announcements List / Empty State */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <Megaphone className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Announcements Published Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Click &ldquo;+ Issue New Circular&rdquo; to publish notices and instructions to any of the 8 semesters or target groups.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Issue First Real Circular
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnnouncements.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs hover:border-[#1455D9] transition-all space-y-3 relative group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border', getCategoryBadgeStyle(a.category))}>
                      {getCategoryLabel(a.category)}
                    </span>
                    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-black border', getAudienceBadgeStyle(a.target))}>
                      Target: {getAudienceLabel(a.target)}
                    </span>
                    <span className="text-xs text-gray-400 font-mono font-medium">
                      {a.createdAt}
                    </span>
                  </div>
                  <h3 className="font-black text-base text-[#071A3D]">{a.title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadCircular(a)}
                    className="p-2 rounded-xl text-gray-400 hover:text-[#1455D9] hover:bg-blue-50 transition-colors border border-gray-100 cursor-pointer"
                    title="Download Circular (PDF)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-gray-100 cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100 font-medium">
                {a.content}
              </p>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 font-medium">
                <span>Authorized by: <strong className="text-gray-600">{a.createdByName || 'System Administrator'}</strong></span>
                <span className="font-mono">Official Circular · V.S.B. AI &amp; DS</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ISSUE OFFICIAL CIRCULAR WITH COMPREHENSIVE TARGET AUDIENCES & CATEGORIES */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">
                  Issue Official Department Circular
                </h3>
                <p className="text-xs text-gray-500">Instant multi-target broadcast across all 8 semesters</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Circular Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Anna University End-Semester Practical Examinations"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Target Audience *</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value, targetSpecific: '' })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D] bg-white"
                  >
                    {TARGET_AUDIENCE_OPTIONS.map((grp) => (
                      <optgroup key={grp.group} label={grp.group}>
                        {grp.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Notice Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D] bg-white"
                  >
                    {CIRCULAR_CATEGORIES.map((grp) => (
                      <optgroup key={grp.group} label={grp.group}>
                        {grp.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target & Category Summary Preview */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[#1455D9] flex items-center justify-between text-[11px] font-bold">
                <span className="truncate">Recipient: <strong>{getAudienceLabel(formData.target)}</strong></span>
                <span className="font-extrabold shrink-0 ml-2 px-2 py-0.5 rounded-md bg-white border border-blue-200 text-[10px]">
                  {getCategoryLabel(formData.category)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Circular Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed instructions, dates, deadlines and compliance notes..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                />
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
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> {isLoading ? 'Dispatching...' : 'Dispatch Notice to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
