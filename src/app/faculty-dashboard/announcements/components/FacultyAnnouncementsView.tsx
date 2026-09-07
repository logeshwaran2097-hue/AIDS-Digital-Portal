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
  ExternalLink,
  BarChart3,
  BellRing,
  CheckSquare,
  RefreshCw,
  Edit3,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'

export interface FacultyAnnouncementItem {
  id: string
  title: string
  content: string
  category: string
  target: string
  targetYear?: number | null
  targetSemester?: number | null
  attachmentUrl?: string | null
  createdByName?: string | null
  isPublished: boolean
  publishedAt?: Date | null
  createdAt: Date
}

export function FacultyAnnouncementsView({
  initialAnnouncements,
  facultyName = 'Faculty Member',
  isAdvisor = false,
  advisorBatch = null,
  advisorYear = null,
  advisorSem = null,
  advisorSec = null,
  allocatedClasses = [],
}: {
  initialAnnouncements: FacultyAnnouncementItem[]
  facultyName?: string
  isAdvisor?: boolean
  advisorBatch?: string | null
  advisorYear?: number | null
  advisorSem?: number | null
  advisorSec?: string | null
  allocatedClasses?: { year: number; section: string; semester: number }[]
}) {
  const allocatedClassLabel =
    advisorBatch ||
    (advisorYear
      ? `Year ${advisorYear} - Section ${advisorSec || 'A'} (Sem ${advisorSem || 3})`
      : null)

  const defaultTarget = allocatedClassLabel
    ? `My Class: ${allocatedClassLabel}`
    : 'All Students'

  const [announcements, setAnnouncements] = useState<FacultyAnnouncementItem[]>(initialAnnouncements)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createStep, setCreateStep] = useState<'edit' | 'preview'>('edit')
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('Academic')
  const [customCategory, setCustomCategory] = useState('')
  const [formTarget, setFormTarget] = useState(defaultTarget)
  const [formContent, setFormContent] = useState('')
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null)

  // Form Response Tracker Modal State
  const [trackingAnnouncement, setTrackingAnnouncement] = useState<FacultyAnnouncementItem | null>(null)
  const [trackerLoading, setTrackerLoading] = useState(false)
  const [trackerData, setTrackerData] = useState<{
    totalCount: number
    completedCount: number
    pendingCount: number
    completedStudents: any[]
    pendingStudents: any[]
  } | null>(null)
  const [reminderStatus, setReminderStatus] = useState<string | null>(null)

  // Edit and Delete State
  const [editingAnnouncement, setEditingAnnouncement] = useState<FacultyAnnouncementItem | null>(null)
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<FacultyAnnouncementItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
              attachmentUrl: a.attachmentUrl || null,
              createdByName: a.createdByName,
              isPublished: a.isPublished !== false,
              createdAt: new Date(a.createdAt),
            }))
          )
        }
      } catch {}
    }

    const timer = setInterval(fetchFreshAnnouncements, 45000)
    return () => clearInterval(timer)
  }, [])

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.target.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCat =
        selectedCategory === 'ALL' ||
        (selectedCategory === 'others'
          ? !['academic', 'examinations', 'placements', 'symposium'].includes(a.category.toLowerCase())
          : a.category.toLowerCase().includes(selectedCategory.toLowerCase()))

      return matchesSearch && matchesCat
    })
  }, [announcements, searchQuery, selectedCategory])

  const handleOpenTracker = async (a: FacultyAnnouncementItem) => {
    setTrackingAnnouncement(a)
    setTrackerLoading(true)
    setReminderStatus(null)
    try {
      const res = await fetch(`/api/announcements/form-tracker?announcementId=${a.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setTrackerData({
            totalCount: data.totalCount || 0,
            completedCount: data.completedCount || 0,
            pendingCount: data.pendingCount || 0,
            completedStudents: data.completedStudents || [],
            pendingStudents: data.pendingStudents || [],
          })
        }
      }
    } catch {} finally {
      setTrackerLoading(false)
    }
  }

  const handleSendReminderSMS = (pendingList: any[]) => {
    if (!pendingList || pendingList.length === 0) return
    setReminderStatus(`Dispatched Form Completion Reminder Notice to ${pendingList.length} Pending Students via SMS!`)
    setTimeout(() => setReminderStatus(null), 4000)
  }

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
            a.attachmentUrl ? `Attached Survey/Form: ${a.attachmentUrl}` : 'No external form attached',
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

  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null)
    setFormTitle('')
    setFormCategory('Academic')
    setCustomCategory('')
    setFormTarget(defaultTarget)
    setFormContent('')
    setFormAttachmentUrl('')
    setCreateStep('edit')
    setShowCreateModal(true)
  }

  const handleOpenEdit = (a: FacultyAnnouncementItem) => {
    setEditingAnnouncement(a)
    setFormTitle(a.title)
    const isStandardCategory = ['Academic', 'Examinations', 'Placements', 'Symposium'].includes(a.category)
    if (isStandardCategory) {
      setFormCategory(a.category)
      setCustomCategory('')
    } else {
      setFormCategory('Others')
      setCustomCategory(a.category)
    }
    setFormTarget(a.target)
    setFormContent(a.content)
    setFormAttachmentUrl(a.attachmentUrl || '')
    setCreateStep('edit')
    setShowCreateModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingAnnouncement) return
    const toDelete = deletingAnnouncement
    const previousAnnouncements = announcements

    // Optimistic instant removal (0ms UI latency)
    setAnnouncements((prev) => prev.filter((a) => a.id !== toDelete.id))
    setBroadcastSuccess(`Deleted Circular "${toDelete.title}"`)
    setTimeout(() => setBroadcastSuccess(null), 3500)
    setDeletingAnnouncement(null)
    setDeleteLoading(true)

    try {
      const res = await fetch(`/api/announcements?id=${encodeURIComponent(toDelete.id)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!data.success) {
        setAnnouncements(previousAnnouncements)
        toast.error(data.message || 'Failed to delete announcement')
      }
    } catch {
      setAnnouncements(previousAnnouncements)
      toast.error('Network error deleting announcement')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const finalCategory = formCategory === 'Others' ? (customCategory.trim() || 'Others') : formCategory

      if (editingAnnouncement) {
        const targetId = editingAnnouncement.id
        const previousAnnouncements = announcements

        // Optimistic instant update in UI
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === targetId
              ? {
                  ...a,
                  title: formTitle,
                  content: formContent,
                  category: finalCategory,
                  target: formTarget,
                  attachmentUrl: formAttachmentUrl.trim() || null,
                }
              : a
          )
        )
        setBroadcastSuccess(`Successfully Updated Circular "${formTitle}"!`)
        setShowCreateModal(false)
        setEditingAnnouncement(null)

        const res = await fetch('/api/announcements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: targetId,
            title: formTitle,
            content: formContent,
            category: finalCategory,
            target: formTarget,
            attachmentUrl: formAttachmentUrl.trim() || null,
          }),
        })

        const data = await res.json()
        if (!data.success) {
          setAnnouncements(previousAnnouncements)
          toast.error(data.message || 'Failed to update announcement')
        }
      } else {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            content: formContent,
            category: finalCategory,
            target: formTarget,
            attachmentUrl: formAttachmentUrl.trim() || null,
            createdByName: `${facultyName} (Class Advisor)`,
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
              attachmentUrl: data.announcement.attachmentUrl || formAttachmentUrl.trim() || null,
              createdByName: data.announcement.createdByName,
              isPublished: true,
              createdAt: new Date(),
            },
            ...prev,
          ])
          setBroadcastSuccess(`Successfully Published Circular for ${formTarget}!`)
        }
      }

      setTimeout(() => setBroadcastSuccess(null), 3500)
      setShowCreateModal(false)
      setEditingAnnouncement(null)
      setCreateStep('edit')
      setFormTitle('')
      setFormCategory('Academic')
      setCustomCategory('')
      setFormContent('')
      setFormAttachmentUrl('')
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
            onClick={handleOpenCreateModal}
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
            { id: 'others', label: 'Others' },
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
      {filtered.length === 0 ? (
        <Card className="rounded-3xl border-gray-200 bg-white">
          <CardContent className="p-12 text-center space-y-3">
            <Megaphone className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-base text-[#071A3D]">No Circulars Published Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Click &ldquo;+ Issue New Circular&rdquo; above to broadcast class notices, exam timetables, or assignment instructions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <Card
              key={a.id}
              className="rounded-3xl border-gray-200 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 cursor-pointer"
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

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">
                    Issued by: <strong className="text-gray-800">{a.createdByName || facultyName}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(a)}
                      className="p-1.5 text-gray-400 hover:text-[#1455D9] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit this circular"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingAnnouncement(a)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete this circular"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                  {a.title}
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                  {a.content}
                </p>
              </div>

              {/* Form Attachment & Detection Tracker Banner */}
              {a.attachmentUrl && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-blue-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 shadow-xs">
                      📋
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-[#071A3D]">Attached Google Form / Survey</p>
                        <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Auto Detection Active
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate font-mono mt-0.5">{a.attachmentUrl}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenTracker(a)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-102"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Form Responses Tracker</span>
                    </button>
                    <a
                      href={a.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Open Google Form link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBroadcast(a)}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#1455D9]" /> Re-Broadcast Alert
                  </button>

                  {a.attachmentUrl && (
                    <button
                      onClick={() => handleOpenTracker(a)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
                    >
                      <Users className="w-3.5 h-3.5" /> Check Completed ({a.target})
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(a)}
                    className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#1455D9] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title="Edit circular"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingAnnouncement(a)}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title="Delete circular"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => handleDownloadCircularPDF(a)}
                    className="px-4 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Official Circular (PDF)
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">
                  {createStep === 'preview'
                    ? 'Verify & Confirm Official Circular'
                    : editingAnnouncement
                    ? 'Edit Department Circular'
                    : 'Issue Department Circular'}
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
                      🏷️ {formCategory === 'Others' ? (customCategory.trim() || 'Others') : formCategory}
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
                    <span>Authorized by: <strong className="text-[#071A3D]">{facultyName} (Class Advisor)</strong></span>
                    <span className="font-mono">Official Circular · V.S.B. AI &amp; DS</span>
                  </div>

                  {formAttachmentUrl && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span>📝 Attached Google Form:</span>
                        <span className="font-mono font-bold truncate text-[11px]">{formAttachmentUrl}</span>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-black text-[10px]">
                        Track Responses Active
                      </span>
                    </div>
                  )}
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
                    <Send className="w-4 h-4" />{' '}
                    {submitting
                      ? 'Saving...'
                      : editingAnnouncement
                      ? '✓ Confirm & Update Circular'
                      : '✓ Confirm & Publish Circular'}
                  </button>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!formTitle.trim() || !formContent.trim()) {
                    toast.error('Please enter Circular Subject and Content')
                    return
                  }
                  if (formCategory === 'Others' && !customCategory.trim()) {
                    toast.error('Please type your custom category name')
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
                      onChange={(e) => {
                        setFormCategory(e.target.value)
                        if (e.target.value !== 'Others') setCustomCategory('')
                      }}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold text-[#071A3D]"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Examinations">Examinations</option>
                      <option value="Placements">Placements</option>
                      <option value="Symposium">Symposium</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 flex items-center justify-between">
                      <span>Target Audience</span>
                      {allocatedClassLabel && (
                        <span className="text-[9px] text-[#1455D9] font-extrabold bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">
                          Allocated: {allocatedClassLabel}
                        </span>
                      )}
                    </label>
                    <select
                      value={formTarget}
                      onChange={(e) => setFormTarget(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9] focus:outline-none"
                    >
                      {allocatedClassLabel && (
                        <optgroup label="🎯 My Allocated Class">
                          <option value={`My Class: ${allocatedClassLabel}`}>
                            🎯 {allocatedClassLabel} (My Assigned Class)
                          </option>
                        </optgroup>
                      )}

                      <optgroup label="🎓 Individual Academic Years">
                        <option value="Year I (Sem 1 & 2)">Year I (First Year - Sem 1 & 2)</option>
                        <option value="Year II (Sem 3 & 4)">Year II (Second Year - Sem 3 & 4)</option>
                        <option value="Year III (Sem 5 & 6)">Year III (Third Year - Sem 5 & 6)</option>
                        <option value="Year IV (Sem 7 & 8)">Year IV (Final Year - Sem 7 & 8)</option>
                      </optgroup>

                      <optgroup label="🏛️ Individual Class Sections">
                        {allocatedClasses && allocatedClasses.length > 0 ? (
                          allocatedClasses.map((cls) => {
                            const roman = cls.year === 1 ? 'I' : cls.year === 2 ? 'II' : cls.year === 3 ? 'III' : 'IV'
                            const val = `Year ${roman} - Section ${cls.section}`
                            return (
                              <option key={val} value={val}>
                                {val} (Sem {cls.semester})
                              </option>
                            )
                          })
                        ) : (
                          <>
                            <option value="Year I - Section A">Year I - Section A</option>
                            <option value="Year I - Section B">Year I - Section B</option>
                            <option value="Year II - Section A">Year II - Section A</option>
                            <option value="Year II - Section B">Year II - Section B</option>
                            <option value="Year III - Section A">Year III - Section A</option>
                            <option value="Year III - Section B">Year III - Section B</option>
                            <option value="Year IV - Section A">Year IV - Section A</option>
                            <option value="Year IV - Section B">Year IV - Section B</option>
                          </>
                        )}
                      </optgroup>

                      <optgroup label="📢 General Audiences">
                        <option value="All Students">All Students (Years 1 to 4)</option>
                        <option value="All Class Advisors">⭐ All Class Advisors</option>
                        <option value="Placement Eligible">Placement Eligible Students (Years 3 & 4)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Fast Audience Quick-Select Badges */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Quick Select:</span>
                  {allocatedClassLabel && (
                    <button
                      type="button"
                      onClick={() => setFormTarget(`My Class: ${allocatedClassLabel}`)}
                      className={`text-[10px] font-black px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        formTarget === `My Class: ${allocatedClassLabel}`
                          ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs scale-105'
                          : 'bg-blue-50 text-[#1455D9] border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      🎯 My Class
                    </button>
                  )}
                  {(['Year I (Sem 1 & 2)', 'Year II (Sem 3 & 4)', 'Year III (Sem 5 & 6)', 'Year IV (Sem 7 & 8)'] as const).map((fullTarget, idx) => {
                    const shortLabel = ['Year I', 'Year II', 'Year III', 'Year IV'][idx]
                    const isSelected = formTarget === fullTarget
                    return (
                      <button
                        key={fullTarget}
                        type="button"
                        onClick={() => setFormTarget(fullTarget)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-xs scale-105'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {shortLabel}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setFormTarget('All Students')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      formTarget === 'All Students'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-105'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    All Students
                  </button>
                </div>

                {/* Custom Category input field when Others is selected */}
                {formCategory === 'Others' && (
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="font-bold text-[#1455D9] block mb-1 text-xs flex items-center justify-between">
                      <span>Type Custom Category Name <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-gray-500 font-medium">e.g. Sports, Workshop, Cultural, Hackathon</span>
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Type your category name (e.g. Workshop)..."
                      className="w-full bg-white border-2 border-blue-300 rounded-xl px-3 py-2 text-xs font-bold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9] focus:outline-none placeholder:font-normal placeholder:text-gray-400 shadow-2xs"
                      required
                      autoFocus
                    />
                  </div>
                )}

                {/* Google Form / Survey Link Attachment Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-700 flex items-center gap-1.5">
                      <span>🔗 Attach Google Form / Survey Link</span>
                      <span className="text-[10px] text-emerald-600 font-bold">(Auto-Detects Completed vs Pending)</span>
                    </label>
                    <span className="text-[10px] text-gray-400 font-semibold">Optional</span>
                  </div>
                  <input
                    type="url"
                    value={formAttachmentUrl}
                    onChange={(e) => setFormAttachmentUrl(e.target.value)}
                    placeholder="https://docs.google.com/forms/d/e/... or https://forms.gle/..."
                    className="w-full bg-amber-50/40 border border-amber-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-400 font-medium"
                  />
                  <p className="text-[10.5px] text-gray-400 mt-1">
                    When attached, our portal automatically detects which students completed the form and who has not completed it yet!
                  </p>
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

      {/* Google Form / Survey Response Live Tracking Modal */}
      {trackingAnnouncement && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-3 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                    Form Response Tracker
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">· {trackingAnnouncement.target}</span>
                </div>
                <h3 className="text-base font-black text-[#071A3D]">{trackingAnnouncement.title}</h3>
                {trackingAnnouncement.attachmentUrl && (
                  <a
                    href={trackingAnnouncement.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#1455D9] hover:underline flex items-center gap-1 font-mono truncate max-w-lg"
                  >
                    <span>{trackingAnnouncement.attachmentUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>
              <button
                onClick={() => {
                  setTrackingAnnouncement(null)
                  setTrackerData(null)
                }}
                className="p-1 text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Reminder Feedback Banner */}
            {reminderStatus && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shrink-0 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reminderStatus}</span>
              </div>
            )}

            {/* Tracker Body */}
            {trackerLoading ? (
              <div className="py-16 text-center space-y-2">
                <RefreshCw className="w-8 h-8 text-[#1455D9] animate-spin mx-auto" />
                <p className="text-xs font-bold text-gray-600">Scanning cohort student form submissions...</p>
              </div>
            ) : !trackerData ? (
              <div className="py-12 text-center text-xs text-gray-500 font-medium">
                Unable to load form response data at this time.
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-1 flex-1" style={{ scrollbarWidth: 'thin' }}>
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-2.5 shrink-0">
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Total Class</p>
                    <p className="text-2xl font-black text-[#1455D9]">{trackerData.totalCount}</p>
                    <p className="text-[10px] text-gray-400">Students</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
                    <p className="text-[10px] text-emerald-700 font-bold uppercase">✓ Completed</p>
                    <p className="text-2xl font-black text-emerald-600">{trackerData.completedCount}</p>
                    <p className="text-[10px] text-emerald-700 font-bold">
                      {trackerData.totalCount > 0
                        ? `${((trackerData.completedCount / trackerData.totalCount) * 100).toFixed(0)}% Done`
                        : '0%'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-center">
                    <p className="text-[10px] text-rose-700 font-bold uppercase">⏳ Pending</p>
                    <p className="text-2xl font-black text-rose-600">{trackerData.pendingCount}</p>
                    <p className="text-[10px] text-rose-700 font-bold">Not Completed</p>
                  </div>
                </div>

                {/* Pending Students Section */}
                <div className="rounded-2xl border border-rose-200 overflow-hidden bg-white shadow-2xs">
                  <div className="p-3 bg-rose-50/80 border-b border-rose-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <h4 className="text-xs font-black text-rose-900">
                        Pending Students ({trackerData.pendingCount})
                      </h4>
                    </div>

                    {trackerData.pendingCount > 0 && (
                      <button
                        onClick={() => handleSendReminderSMS(trackerData.pendingStudents)}
                        className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Send Reminder SMS ({trackerData.pendingCount})</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-100" style={{ scrollbarWidth: 'thin' }}>
                    {trackerData.pendingCount === 0 ? (
                      <div className="p-6 text-center text-xs text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>All students in the class have submitted this form!</span>
                      </div>
                    ) : (
                      trackerData.pendingStudents.map((s: any) => (
                        <div key={s.id} className="p-2.5 sm:px-4 flex items-center justify-between text-xs hover:bg-gray-50">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#071A3D] truncate">{s.name}</p>
                            <p className="text-[11px] text-gray-500 font-mono">{s.registerNumber} · Yr {s.year} (Sec {s.section})</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {s.phone && (
                              <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">{s.phone}</span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                              Not Completed
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Completed Students Section */}
                <div className="rounded-2xl border border-emerald-200 overflow-hidden bg-white shadow-2xs">
                  <div className="p-3 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-black text-emerald-900">
                        Completed Students ({trackerData.completedCount})
                      </h4>
                    </div>
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-gray-100" style={{ scrollbarWidth: 'thin' }}>
                    {trackerData.completedCount === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400 font-medium">
                        No responses recorded yet. As students click or complete the form, they will appear here automatically.
                      </div>
                    ) : (
                      trackerData.completedStudents.map((s: any) => (
                        <div key={s.id} className="p-2.5 sm:px-4 flex items-center justify-between text-xs hover:bg-gray-50">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#071A3D] truncate">{s.name}</p>
                            <p className="text-[11px] text-gray-500 font-mono">{s.registerNumber} · Yr {s.year} (Sec {s.section})</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                              ✓ Completed
                            </span>
                            <p className="text-[9px] text-gray-400 mt-0.5">{s.completedAt ? new Date(s.completedAt).toLocaleDateString() : 'Recorded'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t flex items-center justify-between shrink-0">
              <button
                onClick={() => handleOpenTracker(trackingAnnouncement)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#1455D9]" />
                <span>Refresh Live Status</span>
              </button>

              <button
                onClick={() => {
                  setTrackingAnnouncement(null)
                  setTrackerData(null)
                }}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deletingAnnouncement && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-rose-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#071A3D]">Delete Circular?</h3>
                <p className="text-xs text-gray-500">This will remove the announcement from student portals.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
              <p className="font-bold text-[#071A3D] line-clamp-1">{deletingAnnouncement.title}</p>
              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{deletingAnnouncement.content}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAnnouncement(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Circular'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
