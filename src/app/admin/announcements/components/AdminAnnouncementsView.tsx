'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Megaphone,
  Download,
  Plus,
  Trash2,
  Eye,
  X,
  Search,
  Users,
  GraduationCap,
  Sparkles,
  Calendar,
  Send,
  Building,
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
  facultyList,
  studentList,
}: {
  initialAnnouncements: AnnouncementRecord[]
  facultyList: { id: string; name: string; facultyId: string }[]
  studentList: { id: string; name: string; registerNumber: string }[]
}) {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>(initialAnnouncements)
  const [searchQuery, setSearchQuery] = useState('')
  const [targetFilter, setTargetFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'ACADEMIC',
    target: 'ALL',
    targetSpecific: '',
  })

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTarget = targetFilter === 'ALL' || a.target.toLowerCase() === targetFilter.toLowerCase()
    return matchesSearch && matchesTarget
  })

  const handleDownloadCircular = (ann: AnnouncementRecord) => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — OFFICIAL CIRCULAR',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Karur',
      author: ann.createdByName || 'Office of the Super Administrator',
      category: `Circular / ${ann.category}`,
      sections: [
        {
          heading: `SUBJECT: ${ann.title.toUpperCase()}`,
          body: [
            ann.content,
            `Target Audience: ${ann.target.toUpperCase()} ${ann.targetSpecific ? `(${ann.targetSpecific})` : ''}`,
            `Date of Issue: ${ann.createdAt}`,
            `Authorized Authority: ${ann.createdByName} (Super Administrator)`,
          ],
        },
        {
          heading: 'INSTRUCTIONS & COMPLIANCE',
          body: [
            '1. All concerned students and faculty members are directed to strictly adhere to the schedule.',
            '2. Queries regarding this circular must be routed through the Department Office (AI Block).',
          ],
        },
      ],
      fileName: `Circular_${ann.title.slice(0, 20).replace(/\s+/g, '_')}`,
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      alert('Please fill in Title and Content')
      return
    }

    const newA: AnnouncementRecord = {
      id: 'ann_' + Date.now(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      target: formData.target,
      targetSpecific: formData.targetSpecific || null,
      createdByName: 'System Administrator',
      isPublished: true,
      createdAt: new Date().toISOString().split('T')[0],
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
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this circular?')) {
      setAnnouncements(announcements.filter((a) => a.id !== id))
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
            Broadcast official notices to All Students, All Faculty, or Specific Individuals with PDF generation
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" /> + Broadcast Notice
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search circular title, text..."
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
            <option value="all">Everyone</option>
            <option value="students">Students Only</option>
            <option value="faculty">Faculty Only</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
            Showing {filteredAnnouncements.length} Circulars
          </span>
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((a) => (
          <div
            key={a.id}
            className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-lg transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1455D9]">
                  Target: {a.target.toUpperCase()} {a.targetSpecific ? `(${a.targetSpecific})` : ''}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                  {a.category}
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

      {/* MODAL: BROADCAST NOTICE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Issue Official Department Circular</h3>
                <p className="text-xs text-gray-500">Instant Broadcast &amp; PDF Stamping</p>
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
                    <option value="particular_faculty">Particular Faculty Member</option>
                    <option value="particular_student">Particular Student Candidate</option>
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

              {/* Specific Individual Dropdown */}
              {formData.target === 'particular_faculty' && (
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Select Faculty Member</label>
                  <select
                    value={formData.targetSpecific}
                    onChange={(e) => setFormData({ ...formData, targetSpecific: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="">-- Choose Faculty --</option>
                    {facultyList.map((f) => (
                      <option key={f.id} value={`${f.name} (${f.facultyId})`}>
                        {f.name} ({f.facultyId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.target === 'particular_student' && (
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Select Student</label>
                  <select
                    value={formData.targetSpecific}
                    onChange={(e) => setFormData({ ...formData, targetSpecific: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="">-- Choose Student --</option>
                    {studentList.map((s) => (
                      <option key={s.id} value={`${s.name} (${s.registerNumber})`}>
                        {s.registerNumber} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Dispatch Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
