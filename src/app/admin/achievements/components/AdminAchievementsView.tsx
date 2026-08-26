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
  Layers,
  GraduationCap,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface AchievementRecord {
  id: string
  title: string
  description?: string | null
  recipientName: string
  category: string
  year?: number | null
  date: string
  awardName?: string | null
  prizeAmount?: string | null
}

export function AdminAchievementsView({ initialAchievements }: { initialAchievements: AchievementRecord[] }) {
  const [achievements, setAchievements] = useState<AchievementRecord[]>(initialAchievements)
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedAch, setSelectedAch] = useState<AchievementRecord | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recipientName: '',
    category: 'Hackathon & Competitions',
    year: 3,
    date: new Date().toISOString().split('T')[0],
    awardName: '1st Prize & Gold Medal',
    prizeAmount: '',
  })

  const yearCadres = [
    { year: 1, name: 'Year I', label: '1st Year Freshman Honors' },
    { year: 2, name: 'Year II', label: '2nd Year Sophomore Laurels' },
    { year: 3, name: 'Year III', label: '3rd Year Junior Accolades' },
    { year: 4, name: 'Year IV', label: '4th Year Senior Distinctions' },
  ]

  const getYearCount = (yearNum: number) => {
    return achievements.filter((a) => (a.year || 3) === yearNum).length
  }

  const filteredAchievements = achievements.filter((a) => {
    const aYear = a.year || 3
    const matchesYear = selectedYear === 'ALL' || aYear === selectedYear
    const matchesCat = categoryFilter === 'ALL' || a.category.toLowerCase().includes(categoryFilter.toLowerCase())
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.awardName && a.awardName.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesYear && matchesCat && matchesSearch
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — HALL OF FAME & ACHIEVEMENTS',
      subtitle: `V.S.B. Engineering College · Autonomous Institution · ${selectedYear === 'ALL' ? 'Complete Hall of Fame' : `Year ${selectedYear} Distinctions`}`,
      author: 'Office of the Super Administrator',
      category: 'Official Honors & Distinction Statement',
      sections: [
        {
          heading: '1. DEPARTMENT EXCELLENCE & NATIONAL RECOGNITIONS',
          body: [
            `Total Recognized Distinctions: ${filteredAchievements.length} Honors`,
            'Domains: Smart India Hackathon (SIH), IEEE International Conferences, National Coding Marathons',
            'Institutional Recognition: Department of Artificial Intelligence & Data Science, VSBEC Karur',
            'Accreditation Impact: Contributes to NBA Criterion 4 & NAAC Criteria 5 (Student Progression & Awards)',
          ],
        },
        {
          heading: '2. CATALOG OF HONOREES & DISTINCTIONS',
          body: filteredAchievements.map(
            (a, idx) =>
              `${idx + 1}. [Year ${a.year || 'All'}] "${a.title}" — Honoree: ${a.recipientName} | Category: ${a.category} | Award: ${a.awardName || 'Gold Medal'} (${a.date})`
          ),
        },
      ],
      fileName: `VSB_AI_DS_Achievements_${selectedYear === 'ALL' ? 'HallOfFame' : `Year_${selectedYear}`}_2026`,
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
            `Academic Cadre: Year ${ach.year || 3}`,
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
      year: Number(formData.year),
      date: formData.date,
      awardName: formData.awardName,
      prizeAmount: formData.prizeAmount,
    }

    setAchievements([newAch, ...achievements])
    setIsAddModalOpen(false)
    setFormData({
      title: '',
      description: '',
      recipientName: '',
      category: 'Hackathon & Competitions',
      year: 3,
      date: new Date().toISOString().split('T')[0],
      awardName: '1st Prize & Gold Medal',
      prizeAmount: '',
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this achievement record?')) {
      setAchievements(achievements.filter((a) => a.id !== id))
    }
  }

  const hackathonCount = achievements.filter((a) => a.category.toLowerCase().includes('hackathon')).length
  const researchCount = achievements.filter((a) => a.category.toLowerCase().includes('research') || a.category.toLowerCase().includes('paper') || a.category.toLowerCase().includes('ieee')).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Department Hall of Fame
            </span>
            <span className="text-xs text-gray-300 font-medium">· Year-Wise Laurels &amp; Awards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student &amp; Faculty Achievements</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Official record of Smart India Hackathon wins, IEEE best papers &amp; coding championships
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
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

      {/* YEAR-WISE INTERACTIVE SELECTOR CARDS */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F4C430]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
              Select Academic Cadre (Year-Wise)
            </h2>
          </div>
          <button
            onClick={() => setSelectedYear('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedYear === 'ALL'
                ? 'bg-[#071A3D] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Show All 4 Years ({achievements.length})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {yearCadres.map((yc) => {
            const count = getYearCount(yc.year)
            const isSelected = selectedYear === yc.year
            return (
              <button
                key={yc.year}
                onClick={() => setSelectedYear(isSelected ? 'ALL' : yc.year)}
                className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1455D9] to-[#071A3D] text-white border-[#1455D9] shadow-md ring-2 ring-[#1455D9]/30 scale-102'
                    : 'bg-gray-50/70 hover:bg-blue-50/60 border-gray-200 text-gray-700'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md inline-block mb-1 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {yc.name}
                  </span>
                  <h3 className="text-xs font-black line-clamp-1">{yc.label}</h3>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className={`text-xs font-black ${isSelected ? 'text-[#F4C430]' : 'text-[#1455D9]'}`}>
                    {count} {count === 1 ? 'Distinction' : 'Distinctions'}
                  </span>
                  <span className="text-[10px] opacity-70 font-semibold">View ➔</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Metrics Row (Dynamic) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Honors</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{filteredAchievements.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">
            {selectedYear === 'ALL' ? 'All 4 Years' : `Year ${selectedYear} Cohort`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Hackathon Honors</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">{hackathonCount}</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">SIH &amp; National Marathons</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Research Distinctions</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">{researchCount}</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">IEEE &amp; Scopus Publications</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Cadre Scope</p>
          <p className="text-lg font-black text-emerald-700 mt-0.5">
            {selectedYear === 'ALL' ? 'All 4 Batches' : `Year ${selectedYear} Scholars`}
          </p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">AI &amp; DS Hall of Fame</p>
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

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Year Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Academic Years</option>
              <option value={1}>Year I (Freshman)</option>
              <option value={2}>Year II (Sophomore)</option>
              <option value={3}>Year III (Junior)</option>
              <option value={4}>Year IV (Senior)</option>
            </select>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Categories</option>
            <option value="Hackathon">Hackathons &amp; Competitions</option>
            <option value="Research">Research &amp; Publications</option>
            <option value="Coding">Coding Contests</option>
            <option value="Academic">Academic Merits</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
            Showing {filteredAchievements.length} of {achievements.length} Honors
          </span>
        </div>
      </div>

      {/* Achievements Cards Grid / Empty State */}
      {filteredAchievements.length > 0 ? (
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
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-amber-800 px-2 py-0.5 rounded-lg bg-amber-100 uppercase">
                          {a.category}
                        </span>
                        <span className="text-[10px] font-black text-[#1455D9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                          Year {a.year || 3}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-xl border border-green-200 shrink-0">
                    {a.awardName || '1st Prize'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#071A3D] line-clamp-2">{a.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Recipient / Team:</span>
                    <span className="text-[#071A3D] font-bold">{a.recipientName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Date:</span>
                    <span className="text-[#1455D9] font-bold">{a.date}</span>
                  </div>
                  {a.prizeAmount && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Prize Grant:</span>
                      <span className="text-emerald-700 font-black">{a.prizeAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleDownloadCertificate(a)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Certificate
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedAch(a)
                      setIsViewModalOpen(true)
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Achievements in Current Selection</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            {selectedYear !== 'ALL'
              ? `No student or faculty distinctions recorded for Year ${selectedYear} yet.`
              : 'The Hall of Fame is clean and ready for real competition and research triumphs.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Add First Achievement
          </button>
        </div>
      )}

      {/* MODAL: ADD ACHIEVEMENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Register New Distinction</h3>
                <p className="text-xs text-gray-500">Department Hall of Fame Entry</p>
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
                <label className="block font-bold text-[#071A3D] mb-1">Achievement / Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart India Hackathon (SIH 2026) 1st Prize Winners"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={1}>Year I (Freshman)</option>
                    <option value={2}>Year II (Sophomore)</option>
                    <option value={3}>Year III (Junior)</option>
                    <option value={4}>Year IV (Senior)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Hackathon & Competitions">Hackathon &amp; Competitions</option>
                    <option value="Research & Publications">Research &amp; Publications</option>
                    <option value="Coding Contests">Coding Contests</option>
                    <option value="Academic Merits">Academic Merits</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Recipient Name / Student Team *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K. Aishwarya &amp; Team Quantum"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Award / Honor Conferred</label>
                  <input
                    type="text"
                    placeholder="e.g. 1st Prize &amp; Gold Medal"
                    value={formData.awardName}
                    onChange={(e) => setFormData({ ...formData, awardName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Prize Cash Amount (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1,00,000 Cash Grant"
                    value={formData.prizeAmount}
                    onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Date of Achievement</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Context, problem solved, host institution..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
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

      {/* MODAL: VIEW ACHIEVEMENT */}
      {isViewModalOpen && selectedAch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                  Year {selectedAch.year || 3} · {selectedAch.category}
                </span>
                <h3 className="text-lg font-black text-[#071A3D] mt-2">{selectedAch.title}</h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600 leading-relaxed">
                {selectedAch.description || 'Demonstrated exemplary technological innovation and research excellence.'}
              </p>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Honoree:</span>
                  <span className="font-bold text-[#071A3D]">{selectedAch.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Award:</span>
                  <span className="font-bold text-green-700">{selectedAch.awardName || 'Distinction'}</span>
                </div>
                {selectedAch.prizeAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-sans">Prize:</span>
                    <span className="font-bold text-emerald-700">{selectedAch.prizeAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Date:</span>
                  <span className="font-bold text-[#1455D9]">{selectedAch.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                onClick={() => handleDownloadCertificate(selectedAch)}
                className="px-4 py-2 rounded-xl bg-[#1455D9] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Certificate PDF
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs hover:bg-gray-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
