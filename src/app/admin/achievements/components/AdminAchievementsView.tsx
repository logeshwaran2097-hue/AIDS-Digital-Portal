'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Trophy,
  Award,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  Medal,
  Star,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface AchievementRecord {
  id: string
  title: string
  description?: string | null
  recipientName: string
  category: string
  date: string
  awardName?: string | null
  prizeAmount?: string | null
}

export function AdminAchievementsView({ initialAchievements }: { initialAchievements: AchievementRecord[] }) {
  const [achievements, setAchievements] = useState<AchievementRecord[]>(initialAchievements)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recipientName: '',
    category: 'Hackathon',
    date: '2026-03-15',
    awardName: '1st Prize & Gold Medal',
    prizeAmount: '₹1,00,000 Cash Prize',
  })

  const filteredAchievements = achievements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCat = categoryFilter === 'ALL' || a.category.toLowerCase() === categoryFilter.toLowerCase()
    return matchesSearch && matchesCat
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — HALL OF FAME & ACHIEVEMENTS',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official Honors & Distinction Statement',
      sections: [
        {
          heading: '1. DEPARTMENT EXCELLENCE & NATIONAL RECOGNITIONS',
          body: [
            `Total Recognized Achievements: ${achievements.length} National & International Honors`,
            'Domains: Smart India Hackathon (SIH), IEEE International Conferences, National Coding Marathons',
            'Institutional Recognition: Department of Artificial Intelligence & Data Science, VSBEC Karur',
            'Accreditation Impact: Contributes to NBA Criterion 4 & NAAC Criteria 5 (Student Progression & Awards)',
          ],
        },
        {
          heading: '2. CATALOG OF HONOREES & DISTINCTIONS',
          body: achievements.map(
            (a, idx) =>
              `${idx + 1}. "${a.title}" — Honoree: ${a.recipientName} | Category: ${a.category} | Award: ${a.awardName || 'Gold Medal'} (${a.date})`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Achievements_HallOfFame_2026',
    })
  }

  const handleDownloadCertificate = (ach: AchievementRecord) => {
    generateAndDownloadPDF({
      title: 'CERTIFICATE OF INSTITUTIONAL EXCELLENCE',
      subtitle: 'V.S.B. Engineering College · Department of AI & DS · Honors Board',
      author: 'Principal & Head of the Department',
      category: 'Official Distinction & Honor Certificate',
      sections: [
        {
          heading: `THIS IS PROUDLY CONFERRED TO: ${ach.recipientName.toUpperCase()}`,
          body: [
            `In recognition of outstanding triumph: "${ach.title}"`,
            `Category of Distinction: ${ach.category}`,
            `Award & Recognition: ${ach.awardName || '1st Place & Gold Medal'} ${ach.prizeAmount ? `(${ach.prizeAmount})` : ''}`,
            `Date of Distinction: ${ach.date}`,
            ach.description || 'Demonstrated exemplary technological innovation, research excellence and leadership representing VSB Engineering College at the national level.',
          ],
        },
      ],
      fileName: `Certificate_${ach.recipientName.replace(/\s+/g, '_')}`,
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.recipientName) {
      alert('Please fill in Title and Recipient Name')
      return
    }

    const newAch: AchievementRecord = {
      id: 'ach_' + Date.now(),
      title: formData.title,
      description: formData.description,
      recipientName: formData.recipientName,
      category: formData.category,
      date: formData.date,
      awardName: formData.awardName,
      prizeAmount: formData.prizeAmount,
    }

    setAchievements([newAch, ...achievements])
    setIsAddModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this achievement record?')) {
      setAchievements(achievements.filter((a) => a.id !== id))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Department Hall of Fame
            </span>
            <span className="text-xs text-gray-300 font-medium">· National Distinctions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student &amp; Faculty Achievements</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Official record of Smart India Hackathon wins, IEEE best papers &amp; coding championships
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Hall of Fame (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Add Achievement
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Honors</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{achievements.length} Distinctions</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">National Level</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">SIH Hackathons</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">1st Prize Winner</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">Govt of India</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">IEEE Best Paper</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">ICCCNT 2025</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">International Conf</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Prize Won</p>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">₹1,75,000</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">Cash Grants &amp; Rewards</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search achievement, recipient name, award..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Categories</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Research">Research &amp; Publications</option>
            <option value="Coding">Coding Contests</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
            Showing {filteredAchievements.length} Honors
          </span>
        </div>
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredAchievements.map((a) => (
          <div
            key={a.id}
            className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0 shadow-xs">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-800 px-2 py-0.5 rounded-lg bg-amber-100 uppercase">
                      {a.category}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-xl border border-green-200 shrink-0">
                  {a.awardName || '1st Prize'}
                </span>
              </div>

              <h3 className="font-bold text-base text-[#071A3D]">{a.title}</h3>
              {a.description && <p className="text-xs text-gray-500 line-clamp-2">{a.description}</p>}

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Recipient / Team:</span>
                  <span className="font-bold text-[#1455D9]">{a.recipientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Award Date:</span>
                  <span className="text-gray-700 font-bold">{a.date}</span>
                </div>
                {a.prizeAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Cash Award:</span>
                    <span className="font-bold text-emerald-700">{a.prizeAmount}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleDownloadCertificate(a)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Certificate (PDF)
              </button>

              <button
                onClick={() => handleDelete(a.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD ACHIEVEMENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Record New Achievement</h3>
                <p className="text-xs text-gray-500">Hall of Fame Registry</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Achievement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Prize - AICTE National AI Challenge 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Recipient / Team *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K. Aishwarya & Team"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Hackathon">National Hackathon</option>
                    <option value="Research">Research &amp; Publications</option>
                    <option value="Coding">Coding Contests</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Award Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 1st Place & Gold Medal"
                    value={formData.awardName}
                    onChange={(e) => setFormData({ ...formData, awardName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Cash Prize</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1,00,000"
                    value={formData.prizeAmount}
                    onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Key innovation highlights, project scope, jury notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
