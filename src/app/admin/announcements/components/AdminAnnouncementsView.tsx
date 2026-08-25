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
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

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
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTarget && matchesSearch
  })

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
          ],
        },
        {
          heading: '2. DIGEST OF ACTIVE NOTICES',
          body: announcements.map(
            (a, idx) =>
              `${idx + 1}. [${a.category}] ${a.title} — Target: ${a.target.toUpperCase()} | Date: ${a.createdAt}\n${a.content}`
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
      category: `Circular / ${ann.category}`,
      sections: [
        {
          heading: `SUBJECT: ${ann.title.toUpperCase()}`,
          body: [
            ann.content,
            `Target Audience: ${ann.target.toUpperCase()} ${ann.targetSpecific ? `(${ann.targetSpecific})` : ''}`,
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
        alert('Circular dispatched and saved to database!')
      } else {
        alert(result.message || 'Failed to dispatch circular')
      }
    } catch (err) {
      console.error(err)
      alert('Network error dispatching circular.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this circular from the database?')) {
      return
    }

    try {
      const res = await fetch(`/api/announcements?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setAnnouncements(announcements.filter((a) => a.id !== id))
      } else {
        alert(result.message || 'Failed to delete circular')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting circular.')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear ALL circulars from the database?')) {
      return
    }

    try {
      const res = await fetch('/api/announcements?clearAll=true', { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setAnnouncements([])
        alert('All circulars cleared!')
      }
    } catch (err) {
      console.error(err)
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
            <span className="text-xs text-gray-300 font-medium">· Multi-Target Broadcast</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Official Circulars &amp; Notices</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {announcements.length > 0
              ? `Real-time management of ${announcements.length} departmental announcements`
              : 'Announcement board is ready for real circulars'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          {announcements.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:text-white"
            >
              <Trash2 className="w-4 h-4 text-red-400" /> Clear All Notices
            </button>
          )}

          <button
            onClick={handleExportAllPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export All (PDF)
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
            placeholder="Search circulars, subject, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Audiences</option>
            <option value="students">Students Only</option>
            <option value="faculty">Faculty Only</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
            Showing {filteredAnnouncements.length} Notices
          </span>
        </div>
      </div>

      {/* Announcements List / Empty State */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <Megaphone className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Announcements Published Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Click &ldquo;+ Issue New Circular&rdquo; to publish notices and instructions.
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
              className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      a.category === 'ACADEMIC'
                        ? 'bg-blue-100 text-[#1455D9]'
                        : a.category === 'PLACEMENT'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {a.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-mono text-[10px] font-bold uppercase">
                    Target: {a.target}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">{a.createdAt}</span>
                </div>

                <h3 className="text-base font-bold text-[#071A3D]">{a.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{a.content}</p>

                <p className="text-[11px] text-gray-400 font-medium">Issued by: {a.createdByName}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => handleDownloadCircular(a)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Stamped Circular (PDF)
                </button>

                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: BROADCAST NOTICE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Issue Official Department Circular</h3>
                <p className="text-xs text-gray-500">Instant Broadcast &amp; Database Save</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
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
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Target Audience</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value, targetSpecific: '' })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="ALL">All Students &amp; Faculty</option>
                    <option value="students">All Students</option>
                    <option value="faculty">All Faculty</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="ACADEMIC">Academic / Exam</option>
                    <option value="PLACEMENT">Placement &amp; Training</option>
                    <option value="SYMPOSIUM">Events &amp; Symposiums</option>
                    <option value="GENERAL">General Notice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Circular Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed instructions, dates, deadlines and compliance notes..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
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
