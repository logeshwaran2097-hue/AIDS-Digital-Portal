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
  CheckCircle2,
  Sparkles,
  Send,
  AlertCircle,
  FileText,
  Tag,
  Check,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface FacultyAnnouncementItem {
  id: string
  title: string
  content: string
  category: string
  target: string
  targetYear?: number | null
  targetSemester?: number | null
  createdByName?: string | null
  isPublished: boolean
  publishedAt?: Date | null
  createdAt: Date
}

export function FacultyAnnouncementsView({
  initialAnnouncements,
  facultyName = 'Faculty Member',
}: {
  initialAnnouncements: FacultyAnnouncementItem[]
  facultyName?: string
}) {
  const [announcements, setAnnouncements] = useState<FacultyAnnouncementItem[]>(initialAnnouncements)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createStep, setCreateStep] = useState<'edit' | 'preview'>('edit')
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('Academic')
  const [formTarget, setFormTarget] = useState('All Students')
  const [formContent, setFormContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null)

  // Auto-sync Faculty announcements in real-time
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
        a.target.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCat =
        selectedCategory === 'ALL' || a.category.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCat
    })
  }, [announcements, searchQuery, selectedCategory])

  const handleDownloadCircularPDF = (a: FacultyAnnouncementItem) => {
    const d = new Date(a.createdAt)
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
      subtitle: `CIRCULAR REF NO: VSB/AIDS/CIR/2026/${a.id.slice(-4).toUpperCase()} · DATE: ${d.toLocaleDateString('en-GB')}`,
      author: a.createdByName || `${facultyName} (Faculty Advisor)`,
      category: `OFFICIAL CIRCULAR: ${a.category.toUpperCase()}`,
      sections: [
        {
          heading: `SUBJECT: ${a.title.toUpperCase()}`,
          body: [
            `Target Audience: ${a.target.toUpperCase()}`,
            `Issuing Authority: Office of the Head of Department & Academic Advisory`,
            `Status: Immediate Compliance & Information`,
          ],
        },
        {
          heading: 'CIRCULAR PARTICULARS & INSTRUCTIONS',
          body: [
            a.content,
            'All concerned students and faculty advisors are requested to take note of the above schedule and adhere strictly to the guidelines.',
            'For any clarifications, reach out to the Department Advisory Cell.',
          ],
        },
      ],
      fileName: `Circular_${a.category}_${a.id.slice(-4)}`,
    })
  }

  const handleBroadcast = (a: FacultyAnnouncementItem) => {
    setBroadcastSuccess(`Dispatched Instant Push Alert & SMS for "${a.title}" to ${a.target}!`)
    setTimeout(() => setBroadcastSuccess(null), 3000)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          category: formCategory,
          target: formTarget,
          createdByName: `${facultyName} (Faculty Advisor)`,
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
      }
      setBroadcastSuccess(`Successfully Published Circular for ${formTarget}!`)
      setTimeout(() => setBroadcastSuccess(null), 3500)
      setShowCreateModal(false)
      setCreateStep('edit')
      setFormTitle('')
      setFormContent('')
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
              Department Circulars
            </span>
            <span className="text-xs text-gray-300 font-medium">· Official Notice Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Notices &amp; Announcements Center</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {facultyName} · Issue official academic circulars, exam schedules, and placement notifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Issue New Circular
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Notices</p>
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">{announcements.length} Circulars</p>
            <p className="text-[10px] text-gray-400">Live on Student Portal</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs bg-purple-50/20">
          <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Target Scope</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">All Semesters</p>
          <p className="text-[10px] text-purple-600 font-semibold">AI &amp; DS Batches</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Broadcast Health</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">100% Delivered</p>
          <p className="text-[10px] text-green-700 font-semibold">Instant Push Active</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Official Seal</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">Verified</p>
          <p className="text-[10px] text-amber-700 font-semibold">COE &amp; HOD Approved</p>
        </div>
      </div>

      {/* Broadcast Alert Feedback */}
      {broadcastSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{broadcastSuccess}</span>
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
            placeholder="Search circulars by subject, keyword or target batch..."
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Notices' },
            { id: 'academic', label: 'Academic' },
            { id: 'exam', label: 'Examinations' },
            { id: 'placement', label: 'Placements' },
            { id: 'symposium', label: 'Symposium' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0',
                selectedCategory === c.id
                  ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List Grid */}
      <div className="space-y-4">
        {filtered.map((a) => (
          <Card
            key={a.id}
            className="rounded-3xl border-gray-200 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-black uppercase tracking-wider border border-blue-200/60">
                    {a.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                    Target: {a.target}
                  </span>
                  <span className="text-[11px] text-gray-400 font-semibold">
                    {formatDate(a.createdAt)}
                  </span>
                </div>

                <span className="text-[11px] text-gray-500 font-medium">
                  Issued by: <strong className="text-gray-800">{a.createdByName || facultyName}</strong>
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
                  <Download className="w-3.5 h-3.5" /> Official Circular (PDF)
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">
                  {createStep === 'preview' ? 'Verify & Confirm Official Circular' : 'Issue Department Circular'}
                </h3>
                <p className="text-xs text-gray-500">
                  {createStep === 'preview' ? 'Review before dispatching to student notice boards' : 'Publish notice to students and faculty notice board'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateStep('edit')
                }}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {createStep === 'preview' ? (
              /* High-Fidelity Official Circular Preview */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/50 via-white to-amber-50/30 border-2 border-blue-200 shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1455D9] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        🏛️
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-[#071A3D] uppercase tracking-wider">V.S.B. Engineering College</p>
                        <p className="text-[10px] text-gray-500 font-semibold">Department of Artificial Intelligence & Data Science</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#1455D9] bg-blue-100 px-2 py-0.5 rounded-full">
                      FACULTY PREVIEW
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-[#1455D9] border border-blue-200">
                      🏷️ {formCategory}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      👥 {formTarget}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-[#071A3D] leading-snug">
                    {formTitle || 'Untitled Circular'}
                  </h3>

                  <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200 font-medium">
                    {formContent || 'No circular content entered.'}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 font-medium border-t border-gray-100">
                    <span>Authorized by: <strong className="text-[#071A3D]">{facultyName} (Faculty Advisor)</strong></span>
                    <span className="font-mono">Official Circular · V.S.B. AI &amp; DS</span>
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
                    <Send className="w-4 h-4" /> {submitting ? 'Publishing...' : '✓ Confirm & Publish Circular'}
                  </button>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!formTitle.trim() || !formContent.trim()) {
                    alert('Please enter Circular Subject and Content')
                    return
                  }
                  setCreateStep('preview')
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Circular Subject / Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Schedule for Lab External Practical Examinations"
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Examinations">Examinations</option>
                      <option value="Placements">Placements</option>
                      <option value="Symposium">Symposium</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Target Audience</label>
                    <select
                      value={formTarget}
                      onChange={(e) => setFormTarget(e.target.value)}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="All Students">All Students (Years 1 to 4)</option>
                      <option value="All Class Advisors">⭐ All Class Advisors</option>
                      <option value="Year I (Sem 1 & 2)">Year I (Sem 1 &amp; 2)</option>
                      <option value="Year II (Sem 3 & 4)">Year II (Sem 3 &amp; 4)</option>
                      <option value="Year III (Sem 5 & 6)">Year III (Sem 5 &amp; 6)</option>
                      <option value="Year IV (Sem 7 & 8)">Year IV (Sem 7 &amp; 8)</option>
                      <option value="Placement Eligible">Placement Eligible Students</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Circular Content &amp; Instructions</label>
                  <textarea
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Full notice details, instructions, room allocations, dates..."
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs"
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
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]"
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
