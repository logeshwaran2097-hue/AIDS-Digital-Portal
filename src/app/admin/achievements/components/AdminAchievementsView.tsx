'use client'

import React, { useState, useEffect } from 'react'
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
  Check,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import toast from 'react-hot-toast'

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
  const [addModalMode, setAddModalMode] = useState<'edit' | 'preview'>('edit')
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

  // Real-time synchronization
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/achievements', { cache: 'no-store' })
        const data = await res.json()
        if (data.success && Array.isArray(data.achievements)) {
          setAchievements(
            data.achievements.map((a: any) => ({
              id: a.id,
              title: a.title,
              description: a.description,
              recipientName: a.recipientName || 'B.Tech AI & DS Student',
              category: a.category || 'Hackathon & Competitions',
              year: a.year || 3,
              date: a.date ? new Date(a.date).toISOString().split('T')[0] : '2026-03-15',
              awardName: a.awardName || 'Distinction',
              prizeAmount: a.prizeAmount || '',
            }))
          )
        }
      } catch {}
    }

    const interval = setInterval(fetchLatest, 4000)
    return () => clearInterval(interval)
  }, [])

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
              `${idx + 1}. [Year ${a.year || 3}] "${a.title}" — Honoree: ${a.recipientName} | Award: ${a.awardName || 'Distinction'} ${a.prizeAmount ? `(${a.prizeAmount})` : ''} | Date: ${a.date}`
          ),
        },
      ],
      fileName: `VSB_AI_DS_Hall_of_Fame_${selectedYear === 'ALL' ? 'All_Years' : `Year_${selectedYear}`}_2026`,
    })
  }

  const handleDownloadCertificate = (ach: AchievementRecord) => {
    generateAndDownloadPDF({
      title: 'CERTIFICATE OF MERIT & DISTINCTION',
      subtitle: 'Department of Artificial Intelligence & Data Science · V.S.B. Engineering College',
      author: 'Office of the Principal & Head of Department',
      category: 'Institutional Certificate of Honor',
      sections: [
        {
          heading: 'HONOR CITATION',
          body: [
            `This official distinction certifies that ${ach.recipientName} has achieved:`,
            `"${ach.awardName || 'Excellence Award'}" in ${ach.title}.`,
            `Category: ${ach.category} | Academic Cadre: Year ${ach.year || 3}`,
            ach.prizeAmount ? `Cash Award: ${ach.prizeAmount}` : 'Conferred with High Commendation',
            `Date of Distinction: ${ach.date}`,
            ach.description || 'Demonstrated technological brilliance, team leadership, and innovative research solving complex engineering challenges.',
          ],
        },
      ],
      fileName: `Honor_Certificate_${ach.recipientName.replace(/\s+/g, '_')}_2026`,
    })
  }

  const handleFinalAddSubmit = async () => {
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

    try {
      await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAch),
      })
    } catch {}

    setAchievements([newAch, ...achievements])
    setIsAddModalOpen(false)
    setAddModalMode('edit')
    toast.success('🎉 Achievement published to live Hall of Fame!')
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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this achievement record?')) {
      try {
        await fetch(`/api/achievements?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      } catch {}
      setAchievements(achievements.filter((a) => a.id !== id))
      toast.success('Achievement deleted.')
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
              Student Accolades &amp; Honors
            </span>
            <span className="text-xs text-gray-300 font-medium">· Year-Wise Hall of Fame</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Department Hall of Fame</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Celebrating {achievements.length} national hackathons, IEEE paper prizes, and academic distinctions
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
          >
            <Download className="w-4 h-4 text-[#F4C430]" />
            Export Hall of Fame PDF
          </button>
          <button
            onClick={() => {
              setAddModalMode('edit')
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#18A0B8] text-[#071A3D] text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#22C7E8]/20"
          >
            <Plus className="w-4 h-4" />
            Publish Achievement
          </button>
        </div>
      </div>

      {/* Year-Wise Tab Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {yearCadres.map((cadre) => {
          const isSelected = selectedYear === cadre.year
          const count = getYearCount(cadre.year)

          return (
            <button
              key={cadre.year}
              onClick={() => setSelectedYear(isSelected ? 'ALL' : cadre.year)}
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'border-[#1455D9] bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-black uppercase px-2 py-0.5 rounded-lg ${
                      isSelected ? 'bg-[#1455D9] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cadre.name}
                  </span>
                  <span className="text-xs font-bold text-gray-500">{count} Accolades</span>
                </div>
                <h3 className="font-black text-sm text-[#071A3D] line-clamp-1">{cadre.label}</h3>
              </div>
            </button>
          )
        })}
      </div>

      {/* Search & Filter Strip */}
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student, award, event name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] focus:border-transparent outline-none bg-gray-50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Filter:</span>
            {['ALL', 'Hackathon', 'Research', 'Coding'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#1455D9] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((ach) => (
          <Card
            key={ach.id}
            className="rounded-3xl border border-gray-200 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden flex flex-col justify-between group relative"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1455D9]">
                  Year {ach.year || 3}
                </span>
                <span className="text-xs text-gray-400 font-bold">{ach.date}</span>
              </div>

              <div>
                <h3 className="font-black text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                  {ach.title}
                </h3>
                <p className="text-xs font-bold text-green-700 mt-1 flex items-center gap-1">
                  <Medal className="w-3.5 h-3.5" />
                  {ach.awardName || 'Excellence Distinction'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 text-xs space-y-1">
                <p className="font-bold text-[#071A3D]">Honoree: {ach.recipientName}</p>
                {ach.prizeAmount && <p className="text-emerald-700 font-bold">Prize: {ach.prizeAmount}</p>}
                <p className="text-gray-500 text-[11px] line-clamp-2">{ach.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedAch(ach)
                    setIsViewModalOpen(true)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
                <button
                  onClick={() => handleDelete(ach.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TWO-STEP PUBLISH ACHIEVEMENT MODAL (EDIT -> PREVIEW & CONFIRM)            */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-200 my-8">
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-6 flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#22C7E8] text-[#071A3D] text-[10px] font-black uppercase">
                  Hall of Fame Registry
                </span>
                <h2 className="text-xl font-black mt-1">
                  {addModalMode === 'edit' ? 'Publish Student Achievement' : 'Preview & Confirm Distinction'}
                </h2>
                <p className="text-xs text-gray-300 mt-0.5">
                  {addModalMode === 'edit'
                    ? 'Enter accolade details, student team, and prize before reviewing.'
                    : 'Verify accolade details before committing to the institutional Hall of Fame.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addModalMode === 'edit' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!formData.title || !formData.recipientName) {
                    toast.error('Title and recipient name are required')
                    return
                  }
                  setAddModalMode('preview')
                }}
                className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
              >
                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs">Achievement / Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smart India Hackathon (SIH 2026) 1st Prize Winners"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-xs">Academic Year</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#1455D9] bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                    >
                      <option value={1}>Year I (Freshman)</option>
                      <option value={2}>Year II (Sophomore)</option>
                      <option value={3}>Year III (Junior)</option>
                      <option value={4}>Year IV (Senior)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-xs">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                    >
                      <option value="Hackathon & Competitions">Hackathon &amp; Competitions</option>
                      <option value="Research & Publications">Research &amp; Publications</option>
                      <option value="Coding Contests">Coding Contests</option>
                      <option value="Academic Merits">Academic Merits</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs">Recipient Name / Student Team *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K. Aishwarya &amp; Team Quantum"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-xs">Award / Honor Conferred</label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Prize &amp; Gold Medal"
                      value={formData.awardName}
                      onChange={(e) => setFormData({ ...formData, awardName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-xs">Prize Cash Amount (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹1,00,000 Cash Grant"
                      value={formData.prizeAmount}
                      onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs">Date of Achievement</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-xs">Description / Summary</label>
                  <textarea
                    rows={2}
                    placeholder="Context, problem solved, host institution..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1455D9] hover:bg-[#0A2A5E] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Distinction
                  </button>
                </div>
              </form>
            ) : (
              /* PREVIEW CONFIRMATION VIEW */
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1455D9] text-white text-[10px] font-black uppercase">
                      Year {formData.year} · {formData.category}
                    </span>
                    <span className="text-xs font-bold text-amber-900">{formData.date}</span>
                  </div>
                  <h3 className="text-base font-black text-[#071A3D]">{formData.title}</h3>
                  <p className="text-xs text-green-700 font-bold flex items-center gap-1">
                    <Medal className="w-4 h-4" /> {formData.awardName || 'Excellence Distinction'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Honoree / Team</span>
                    <p className="font-bold text-gray-800 mt-0.5">{formData.recipientName}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Prize Amount</span>
                    <p className="font-bold text-emerald-700 mt-0.5">{formData.prizeAmount || 'Certificate of Distinction'}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Citation / Summary</span>
                  <p className="text-gray-700 mt-0.5">{formData.description || 'Demonstrated exemplary innovation.'}</p>
                </div>

                <div className="pt-3 border-t flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setAddModalMode('edit')}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    ← Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalAddSubmit}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Confirm &amp; Publish to Hall of Fame
                  </button>
                </div>
              </div>
            )}
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
