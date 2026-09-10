'use client'

import React, { useState, useMemo, useRef } from 'react'
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
  UploadCloud,
  FileText,
  Eye,
  CheckCircle2,
  Download,
  AlertCircle,
  FileSpreadsheet,
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

interface ProofFileState {
  dataUrl: string
  fileName: string
  fileType: string
  fileSize: number
}

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
  const [proofFile, setProofFile] = useState<ProofFileState | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hackathon & Coding',
    awardName: '',
    eventName: '',
    date: new Date().toISOString().split('T')[0],
  })

  // File select handler: validates and converts to Data URL (base64)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB. Please upload a smaller image or compressed PDF.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setProofFile({
        dataUrl: reader.result as string,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })
      toast.success(`Proof document "${file.name}" attached!`)
    }
    reader.onerror = () => {
      toast.error('Failed to read file. Please try another image or PDF.')
    }
    reader.readAsDataURL(file)
  }

  const removeSelectedFile = () => {
    setProofFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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

    // MANDATORY PROOF CHECK
    if (!proofFile || !proofFile.dataUrl) {
      toast.error('Mandatory: Please upload the Certificate or Award Proof file.')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          certificateUrl: proofFile.dataUrl,
          recipientName: userName,
          recipientType: 'student',
        }),
      })

      const data = await res.json()
      if (data.success && data.achievement) {
        toast.success('🎉 Achievement & proof submitted successfully!')
        setAchievements([
          {
            ...data.achievement,
            recipientName: userName,
          },
          ...achievements,
        ])
        setIsSubmitModalOpen(false)
        setProofFile(null)
        setFormData({
          title: '',
          description: '',
          category: 'Hackathon & Coding',
          awardName: '',
          eventName: '',
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
              Verified Hall of Fame
            </span>
            <span className="text-xs text-gray-300">· V.S.B. Engineering College</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student &amp; Faculty Achievements</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            National hackathons, research publications &amp; competitive honors backed by verified certificates
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#F4C430] hover:bg-[#e0b226] text-[#071A3D] font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Achievement with Proof</span>
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs gap-2">
                    <span className="font-bold text-gray-700 flex items-center gap-1.5 truncate max-w-[140px]">
                      <Users className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                      <span className="truncate">{item.recipientName || 'B.Tech AI & DS'}</span>
                    </span>

                    {item.certificateUrl ? (
                      <button
                        onClick={() => setPreviewCert({ title: item.title, url: item.certificateUrl! })}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-[#1455D9] text-[#1455D9] hover:text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Proof</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
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
                : 'National hackathon triumphs, research journal publications, and inter-college symposium laurels will be showcased here once verified by department faculty and HOD with attached proof documents.'}
            </p>

            {/* Actions for Students */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Achievement with Proof File</span>
              </button>

              <Link
                href="/dashboard/od-proofs"
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-[#1455D9]" />
                <span>Upload Event Certificate / OD Proof</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Student Submit Achievement Modal with DIRECT FILE UPLOAD */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5 text-[#F4C430]" />
                </div>
                <div>
                  <h3 className="font-black text-base">Submit Achievement</h3>
                  <p className="text-[11px] text-blue-200">Upload your certified award proof to the Hall of Fame</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false)
                  setProofFile(null)
                }}
                className="p-1 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitAchievement} className="p-6 space-y-4 text-xs overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Achievement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Prize — Smart India Hackathon 2025"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Hackathon & Coding">Hackathon &amp; Coding</option>
                    <option value="Research & Publications">Research &amp; Publications</option>
                    <option value="Paper Presentations">Paper Presentations</option>
                    <option value="Symposium & Competitions">Symposium &amp; Competitions</option>
                    <option value="Certifications & Honors">Certifications &amp; Honors</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Award / Distinction *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Winner (₹1,00,000 Cash Prize)"
                    value={formData.awardName}
                    onChange={(e) => setFormData({ ...formData, awardName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date of Award *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* DIRECT PROOF FILE UPLOAD (NO URL/LINK) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#071A3D] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#1455D9]" />
                    <span>Upload Proof Document (Certificate / Award Letter) *</span>
                  </label>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Required for Verification
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="proof-file-upload-input"
                />

                {!proofFile ? (
                  <label
                    htmlFor="proof-file-upload-input"
                    className="border-2 border-dashed border-gray-300 hover:border-[#1455D9] bg-gray-50/80 hover:bg-blue-50/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-[#1455D9] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800 text-xs group-hover:text-[#1455D9] transition-colors">
                        Click to select Certificate or Proof File
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Supports PDF documents and Image files (PNG, JPG, WEBP up to 10MB)
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-[#1455D9] shadow-2xs">
                      Browse Computer / Device
                    </span>
                  </label>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#1455D9] text-white flex items-center justify-center shrink-0 shadow-xs">
                        {proofFile.fileType.includes('pdf') ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <FileCheck className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs truncate">{proofFile.fileName}</p>
                        <p className="text-[11px] text-blue-700 font-medium">
                          {(proofFile.fileSize / 1024).toFixed(1)} KB · Official Proof Attached
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewCert({ title: proofFile.fileName, url: proofFile.dataUrl })}
                        className="p-1.5 rounded-lg bg-white text-[#1455D9] hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                        title="Preview uploaded document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Brief Description / Project Summary</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the project, problem statement solved, competition rank, or publication..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitModalOpen(false)
                    setProofFile(null)
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !proofFile}
                  className="px-5 py-2.5 bg-[#1455D9] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN PROOF VIEWER MODAL / LIGHTBOX */}
      {previewCert && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50/90">
              <div className="min-w-0 pr-3">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-black uppercase tracking-wide">
                  Verified Proof Document
                </span>
                <h3 className="text-sm sm:text-base font-black text-[#071A3D] mt-0.5 truncate">
                  {previewCert.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewCert.url}
                  download={`Achievement-Proof-${Date.now()}`}
                  className="px-3 py-1.5 rounded-xl bg-[#1455D9] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Proof</span>
                </a>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-gray-900/5 min-h-[400px]">
              {previewCert.url.startsWith('data:application/pdf') || previewCert.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewCert.url}
                  title="Proof Document"
                  className="w-full h-[70vh] rounded-2xl border border-gray-200 bg-white"
                />
              ) : (
                <img
                  src={previewCert.url}
                  alt="Proof Document"
                  className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-md border border-gray-200 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
