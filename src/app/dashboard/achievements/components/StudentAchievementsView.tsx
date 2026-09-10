'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Trophy,
  Award,
  Calendar,
  ExternalLink,
  Users,
  Search,
  Plus,
  Filter,
  Sparkles,
  FileCheck,
  ChevronRight,
  X,
  Share2,
  Medal,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export interface AchievementItem {
  id: string
  title: string
  description: string
  category: string
  recipientType?: string
  recipientName?: string | null
  eventName?: string | null
  awardName?: string | null
  certificateUrl?: string | null
  date: string | Date
  status?: string
}

const CATEGORIES = [
  'ALL',
  'Hackathon & Coding',
  'Research & Publications',
  'Paper Presentations',
  'Symposium & Competitions',
  'Certifications & Honors',
]

export function StudentAchievementsView({
  initialAchievements,
  userName,
}: {
  initialAchievements: AchievementItem[]
  userName: string
}) {
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewCert, setPreviewCert] = useState<{ title: string; url: string } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hackathon & Coding',
    awardName: '',
    eventName: '',
    certificateUrl: '',
    date: new Date().toISOString().split('T')[0],
  })

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const matchesCat =
        selectedCategory === 'ALL' ||
        item.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(item.category?.toLowerCase() || '')

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.awardName?.toLowerCase().includes(q) ||
        item.eventName?.toLowerCase().includes(q) ||
        item.recipientName?.toLowerCase().includes(q)

      return matchesCat && matchesSearch
    })
  }, [achievements, selectedCategory, searchQuery])

  const handleSubmitAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Please enter the achievement title')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recipientName: userName,
          recipientType: 'student',
        }),
      })

      const data = await res.json()
      if (data.success && data.achievement) {
        toast.success('🎉 Achievement submitted successfully!')
        setAchievements([
          {
            ...data.achievement,
            recipientName: userName,
          },
          ...achievements,
        ])
        setIsSubmitModalOpen(false)
        setFormData({
          title: '',
          description: '',
          category: 'Hackathon & Coding',
          awardName: '',
          eventName: '',
          certificateUrl: '',
          date: new Date().toISOString().split('T')[0],
        })
      } else {
        toast.error(data.message || 'Failed to submit achievement')
      }
    } catch (err) {
      toast.error('Network error while submitting achievement')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Hall of Fame
            </span>
            <span className="text-xs text-gray-300">· V.S.B. Engineering College</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student &amp; Faculty Achievements</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            National hackathon victories, research publications, competitive coding honors, and symposium accolades
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#F4C430] hover:bg-[#e0b226] text-[#071A3D] font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Achievement</span>
          </button>

          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[100px]">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Awards Won</p>
            <p className="text-base font-black text-[#F4C430]">{achievements.length} Honors</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#071A3D] text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {cat === 'ALL' ? 'All Accolades' : cat}
              </button>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px] sm:min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search award, event, or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1455D9] focus:outline-none placeholder-gray-400"
          />
        </div>
      </div>

      {/* Achievements Display Grid or Rich Empty State */}
      {filteredAchievements.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map((item) => {
            return (
              <Card
                key={item.id}
                className="rounded-3xl border-gray-200 hover:shadow-xl transition-all bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-bold border border-blue-200/60">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">{formatDate(item.date)}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4C430]/20 text-[#b58b10] flex items-center justify-center shrink-0 shadow-xs">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs font-bold text-[#1455D9] mt-0.5">{item.awardName || item.eventName}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 flex items-center gap-1.5 truncate max-w-[170px]">
                      <Users className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                      <span className="truncate">{item.recipientName || 'B.Tech AI & DS'}</span>
                    </span>

                    {item.certificateUrl ? (
                      <button
                        onClick={() => setPreviewCert({ title: item.title, url: item.certificateUrl! })}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1455D9] rounded-lg font-bold text-[10px] flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Certificate</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                        Verified
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Rich Empty State Container */
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-8 sm:p-14 text-center">
          <div className="max-w-md mx-auto flex flex-col items-center">
            {/* Glowing Golden Trophy Emblem */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#F4C430] to-amber-300 text-[#071A3D] flex items-center justify-center shadow-xl shadow-amber-500/20">
                <Trophy className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#1455D9] text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-[#F4C430]" />
              </div>
            </div>

            <h3 className="text-xl font-black text-[#071A3D] tracking-tight">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'No Matching Achievements Found'
                : 'No Department Achievements Published Yet'}
            </h3>

            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'Try resetting your category filter or search query to view all awards.'
                : 'National hackathon triumphs, research journal publications, and inter-college symposium laurels will be showcased here once verified by department faculty and HOD.'}
            </p>

            {/* Actions for Students */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Your Achievement</span>
              </button>

              <Link
                href="/dashboard/od-proofs"
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-2 transition"
              >
                <FileCheck className="w-4 h-4 text-[#1455D9]" />
                <span>Upload Event Certificate / OD Proof</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Student Submit Achievement Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5 text-[#F4C430]" />
                </div>
                <div>
                  <h3 className="font-black text-base">Submit Achievement</h3>
                  <p className="text-[11px] text-blue-200">Showcase your award or research to the department</p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitAchievement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Achievement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Prize — Smart India Hackathon 2025"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Hackathon & Coding">Hackathon &amp; Coding</option>
                    <option value="Research & Publications">Research &amp; Publications</option>
                    <option value="Paper Presentations">Paper Presentations</option>
                    <option value="Symposium & Competitions">Symposium &amp; Competitions</option>
                    <option value="Certifications & Honors">Certifications &amp; Honors</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Award / Distinction</label>
                  <input
                    type="text"
                    placeholder="e.g. Winner (₹1,00,000 Cash Prize)"
                    value={formData.awardName}
                    onChange={(e) => setFormData({ ...formData, awardName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Event / Host Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. Ministry of Education / IIT Madras"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date of Award</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Certificate / Proof Link (Drive or URL)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/... or certificate link"
                  value={formData.certificateUrl}
                  onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Brief Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the project, problem statement solved, or paper published..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1455D9] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4">
            <h3 className="text-base font-black text-[#071A3D]">{previewCert.title}</h3>
            <p className="text-xs text-gray-500">Official Certificate / Verification Link</p>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <a
                href={previewCert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1455D9] hover:underline font-bold flex items-center justify-center gap-1.5 break-all"
              >
                <span>{previewCert.url}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
            <button
              onClick={() => setPreviewCert(null)}
              className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
