'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  ShieldCheck,
  Award,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  ExternalLink,
  Calendar,
  Sparkles,
  Search,
  Filter,
  User,
  GraduationCap,
  FileText,
  FileCheck,
  Check,
  Building,
  Eye,
  Download,
  Printer,
  ChevronRight,
  Layers,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface ODProofItem {
  id: string
  studentId?: string | null
  registerNumber: string
  studentName: string
  year: number
  section: string
  semester: number
  odRequestId?: string | null
  eventName: string
  category: string
  eventDate: string
  venueCollege?: string | null
  geoPhotoUrl?: string | null
  latitude?: number | null
  longitude?: number | null
  geoAddress?: string | null
  geoTimestamp?: string | null
  certificateUrl?: string | null
  certificateName?: string | null
  achievement?: string | null
  status: string
  advisorRemarks?: string | null
  verifiedByName?: string | null
  verifiedAt?: string | null
  attendanceCredited: boolean
  createdAt: string
  updatedAt: string
}

interface Props {
  initialProofs: ODProofItem[]
  hodName: string
}

export function HODODProofsView({ initialProofs, hodName }: Props) {
  const [proofs, setProofs] = useState<ODProofItem[]>(initialProofs)
  const [activeTab, setActiveTab] = useState<'ALL' | 'READY' | 'PENDING' | 'VERIFIED'>('ALL')
  const [yearFilter, setYearFilter] = useState<'ALL' | '2' | '3' | '4'>('ALL')
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProof, setSelectedProof] = useState<ODProofItem | null>(null)
  const [hodRemarks, setHodRemarks] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<{ url: string; title: string; category: string } | null>(null)

  // Metrics
  const metrics = useMemo(() => {
    const total = proofs.length
    const ready = proofs.filter((p) => p.geoPhotoUrl && p.certificateUrl && p.status !== 'verified').length
    const verified = proofs.filter((p) => p.status === 'verified').length
    const pending = proofs.filter((p) => !p.geoPhotoUrl || !p.certificateUrl).length
    return { total, ready, verified, pending }
  }, [proofs])

  // Filtered proofs
  const filteredProofs = useMemo(() => {
    return proofs.filter((p) => {
      // Tab filter
      if (activeTab === 'READY') {
        if (!p.geoPhotoUrl || !p.certificateUrl || p.status === 'verified') return false
      } else if (activeTab === 'PENDING') {
        if (p.geoPhotoUrl && p.certificateUrl) return false
      } else if (activeTab === 'VERIFIED') {
        if (p.status !== 'verified') return false
      }

      // Year filter
      if (yearFilter !== 'ALL' && p.year !== Number(yearFilter)) return false

      // Section filter
      if (sectionFilter !== 'ALL' && p.section.toUpperCase() !== sectionFilter) return false

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = p.studentName.toLowerCase().includes(q)
        const matchReg = p.registerNumber.toLowerCase().includes(q)
        const matchEvent = p.eventName.toLowerCase().includes(q)
        const matchCollege = p.venueCollege?.toLowerCase().includes(q) || false
        if (!matchName && !matchReg && !matchEvent && !matchCollege) return false
      }

      return true
    })
  }, [proofs, activeTab, yearFilter, sectionFilter, searchQuery])

  const openInspectModal = (p: ODProofItem) => {
    setSelectedProof(p)
    setHodRemarks(
      p.advisorRemarks || 'HOD Sanctioned: Venue geo-tag and completion certificate verified. Officially endorsed for On-Duty attendance credit.'
    )
  }

  // HOD Approve & Credit Attendance
  const handleApproveOD = async () => {
    if (!selectedProof) return
    setLoading(true)
    try {
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'HOD_APPROVE',
          id: selectedProof.id,
          remarks: hodRemarks,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'OD officially approved & attendance credited!')
        setProofs((prev) => prev.map((p) => (p.id === selectedProof.id ? result.proof : p)))
        setSelectedProof(null)
      } else {
        toast.error(result.message || 'Failed to approve OD.')
      }
    } catch {
      toast.error('Network error approving OD.')
    } finally {
      setLoading(false)
    }
  }

  // HOD Request Resubmission / Reject
  const handleRejectOD = async () => {
    if (!selectedProof) return
    if (!hodRemarks.trim()) {
      toast.error('Please enter the reason for clarification / rejection in the remarks.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'HOD_REJECT',
          id: selectedProof.id,
          remarks: hodRemarks,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'Clarification request dispatched to student.')
        setProofs((prev) => prev.map((p) => (p.id === selectedProof.id ? result.proof : p)))
        setSelectedProof(null)
      } else {
        toast.error(result.message || 'Failed to reject OD.')
      }
    } catch {
      toast.error('Network error rejecting OD.')
    } finally {
      setLoading(false)
    }
  }

  // Export PDF Dossier
  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — ON-DUTY & EVENT PROOF DOSSIER',
      subtitle: `V.S.B. Engineering College · Autonomous Institution · Head of Department Executive Report`,
      author: hodName,
      category: 'Official OD Proofs & Verification Audit',
      sections: [
        {
          heading: '1. EXECUTIVE SUMMARY',
          body: [
            `Total OD Proof Records: ${metrics.total}`,
            `Officially Verified & Credited: ${metrics.verified}`,
            `Under Review / Ready: ${metrics.ready}`,
            `Pending Incomplete Uploads: ${metrics.pending}`,
            `Generated On: ${new Date().toLocaleDateString('en-IN')}`,
          ],
        },
        {
          heading: '2. STUDENT OD EVENT AUDIT LIST',
          body: filteredProofs.map(
            (p, idx) =>
              `${idx + 1}. [${p.year} AIDS ${p.section}] ${p.studentName} (${p.registerNumber}) — Event: "${p.eventName}" at ${p.venueCollege || 'Venue'}. Distinction: ${p.achievement || 'Participation'}. Status: ${p.status.toUpperCase()} (Attendance: ${p.attendanceCredited ? 'Credited' : 'Pending'}).`
          ),
        },
      ],
      fileName: `VSB_AI_DS_HOD_OD_Proofs_${new Date().toISOString().split('T')[0]}`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Executive Verification
            </span>
            <span className="text-xs text-gray-300">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">On-Duty (OD) &amp; Event Proofs</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            Review live GPS venue geo-tags, event certificates, and advisor recommendations across all department classes
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#F4C430]" />
            <span>Export Dossier PDF</span>
          </button>

          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[90px]">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Total Proofs</p>
            <p className="text-base font-black text-[#F4C430]">{metrics.total}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase">Total Submissions</p>
            <p className="text-2xl font-black text-[#071A3D] mt-0.5">{metrics.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-700 uppercase">Ready for HOD</p>
            <p className="text-2xl font-black text-amber-900 mt-0.5">{metrics.ready}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase">Officially Credited</p>
            <p className="text-2xl font-black text-emerald-800 mt-0.5">{metrics.verified}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-rose-700 uppercase">Pending Proofs</p>
            <p className="text-2xl font-black text-rose-800 mt-0.5">{metrics.pending}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Secondary Controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" style={{ scrollbarWidth: 'none' }}>
            {[
              { key: 'ALL', label: 'All Proofs', count: metrics.total },
              { key: 'READY', label: 'Ready for Review', count: metrics.ready },
              { key: 'VERIFIED', label: 'Officially Verified', count: metrics.verified },
              { key: 'PENDING', label: 'Missing Proofs', count: metrics.pending },
            ].map((tab) => {
              const isSelected = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#071A3D] text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, reg no, event, college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1455D9] focus:outline-none"
            />
          </div>
        </div>

        {/* Secondary Year / Section Filter */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-[#1455D9]" />
            <span>Class Filter:</span>
          </div>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value as any)}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Academic Years</option>
            <option value="2">Year II (Sophomore)</option>
            <option value="3">Year III (Junior)</option>
            <option value="4">Year IV (Senior)</option>
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value as any)}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Sections (A-D)</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>

          {(yearFilter !== 'ALL' || sectionFilter !== 'ALL' || searchQuery || activeTab !== 'ALL') && (
            <button
              onClick={() => {
                setYearFilter('ALL')
                setSectionFilter('ALL')
                setActiveTab('ALL')
                setSearchQuery('')
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main OD Proofs Grid */}
      {filteredProofs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProofs.map((p) => {
            const hasGeo = Boolean(p.geoPhotoUrl)
            const hasCert = Boolean(p.certificateUrl)
            const isVerified = p.status === 'verified'

            return (
              <Card
                key={p.id}
                className="rounded-3xl border-gray-200 hover:shadow-lg transition-all bg-white overflow-hidden flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Status & Class */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1455D9] font-mono font-bold text-[11px] border border-blue-100">
                      {p.year === 2 ? 'II' : p.year === 3 ? 'III' : 'IV'} AIDS {p.section}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : hasGeo && hasCert
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isVerified ? 'Officially Credited' : hasGeo && hasCert ? 'Ready for HOD' : 'Incomplete'}
                    </span>
                  </div>

                  {/* Student & Event */}
                  <div>
                    <h3 className="font-black text-sm text-[#071A3D]">{p.studentName}</h3>
                    <p className="text-[11px] font-mono font-bold text-[#1455D9]">{p.registerNumber}</p>

                    <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1 text-xs">
                      <p className="font-bold text-gray-800 line-clamp-1">{p.eventName}</p>
                      <p className="text-gray-500 text-[11px] flex items-center gap-1 truncate">
                        <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{p.venueCollege || 'Host Institution'}</span>
                      </p>
                      <p className="text-gray-400 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{p.eventDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Dual Verification Checkers */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <div
                      className={`p-2 rounded-xl text-center border text-[11px] ${
                        hasGeo ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Geo-Tag Photo</span>
                      </div>
                      <p className="text-[10px] mt-0.5 font-medium">{hasGeo ? 'GPS Verified' : 'Missing'}</p>
                    </div>

                    <div
                      className={`p-2 rounded-xl text-center border text-[11px] ${
                        hasCert ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 font-bold">
                        <Award className="w-3.5 h-3.5" />
                        <span>Certificate</span>
                      </div>
                      <p className="text-[10px] mt-0.5 font-medium">{hasCert ? p.achievement || 'Attached' : 'Missing'}</p>
                    </div>
                  </div>

                  {/* Advisor remarks / sign-off status */}
                  {p.verifiedByName && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[11px]">
                      <p className="text-gray-500 font-semibold">
                        Endorsed by: <span className="font-bold text-gray-800">{p.verifiedByName}</span>
                      </p>
                      {p.advisorRemarks && (
                        <p className="text-gray-600 text-[10px] mt-0.5 line-clamp-1 italic">
                          &ldquo;{p.advisorRemarks}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => openInspectModal(p)}
                    className="w-full py-2.5 rounded-xl bg-[#1455D9] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Proofs &amp; HOD Sanction</span>
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-[#071A3D]">No OD Proof Records Found</h3>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {searchQuery || activeTab !== 'ALL' || yearFilter !== 'ALL' || sectionFilter !== 'ALL'
              ? 'No student proof submissions match your active filter criteria.'
              : 'Students will upload live venue geo-tags and event certificates here when participating in external symposiums and hackathons.'}
          </p>
        </div>
      )}

      {/* INSPECTION & SANCTION MODAL */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-[#F4C430]" />
                </div>
                <div>
                  <h3 className="font-black text-base">HOD Executive OD Inspection</h3>
                  <p className="text-[11px] text-blue-200">
                    {selectedProof.studentName} ({selectedProof.registerNumber}) · {selectedProof.year} AIDS {selectedProof.section}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs" style={{ scrollbarWidth: 'thin' }}>
              {/* Event Card */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#1455D9] font-bold text-[10px]">
                      {selectedProof.category}
                    </span>
                    <h4 className="text-sm font-black text-[#071A3D] mt-1">{selectedProof.eventName}</h4>
                    <p className="text-gray-600 mt-0.5">
                      Venue: <span className="font-bold text-gray-800">{selectedProof.venueCollege || 'Host Institution'}</span> · Date: {selectedProof.eventDate}
                    </p>
                  </div>
                  {selectedProof.achievement && (
                    <span className="px-3 py-1 bg-[#F4C430] text-[#071A3D] font-black rounded-xl text-xs shrink-0 shadow-xs">
                      {selectedProof.achievement}
                    </span>
                  )}
                </div>
              </div>

              {/* Proof 1: Venue Geo-Tag Photo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-black text-[#071A3D] flex items-center gap-1.5 text-xs">
                    <MapPin className="w-4 h-4 text-[#1455D9]" />
                    <span>Proof 1: Live Event Venue Geo-Tag Photo</span>
                  </h5>
                  {selectedProof.geoTimestamp && (
                    <span className="text-[10px] text-gray-400 font-mono">
                      Timestamp: {new Date(selectedProof.geoTimestamp).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {selectedProof.geoPhotoUrl ? (
                  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-2.5">
                    <div className="relative h-48 sm:h-60 w-full rounded-xl overflow-hidden bg-black/5">
                      <Image
                        src={selectedProof.geoPhotoUrl}
                        alt="Venue Geo-Tag"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {selectedProof.geoAddress && (
                      <p className="text-[11px] text-gray-600 mt-2 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{selectedProof.geoAddress}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                    <p className="font-bold text-gray-600">Geo-tag photo not uploaded yet</p>
                    <p className="text-[11px] text-gray-400">Student must snap on-site at the venue.</p>
                  </div>
                )}
              </div>

              {/* Proof 2: Completion Certificate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-black text-[#071A3D] flex items-center gap-1.5 text-xs">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Proof 2: Event Certificate / Award Letter</span>
                  </h5>
                  {selectedProof.certificateName && (
                    <span className="text-[10px] text-purple-700 font-bold truncate max-w-[200px]">
                      {selectedProof.certificateName}
                    </span>
                  )}
                </div>

                {selectedProof.certificateUrl ? (
                  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-bold text-gray-800 text-xs">
                            {selectedProof.certificateName || 'Event Certificate Document'}
                          </p>
                          <p className="text-[10px] text-gray-500">Official proof submitted by student</p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setPreviewMedia({
                            url: selectedProof.certificateUrl!,
                            title: `${selectedProof.studentName} — ${selectedProof.eventName} Certificate`,
                            category: 'Event Certificate',
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Certificate</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                    <p className="font-bold text-gray-600">Event Certificate not submitted yet</p>
                  </div>
                )}
              </div>

              {/* HOD Endorsement Remarks */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  HOD Sanction Endorsement Remarks
                </label>
                <textarea
                  rows={2}
                  value={hodRemarks}
                  onChange={(e) => setHodRemarks(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter endorsement details or reason for resubmission..."
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedProof(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRejectOD}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  Request Resubmission
                </button>

                <button
                  type="button"
                  disabled={loading || !selectedProof.geoPhotoUrl || !selectedProof.certificateUrl}
                  onClick={handleApproveOD}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Processing...' : 'HOD Sanction & Credit Attendance'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PREVIEW LIGHTBOX */}
      {previewMedia && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50">
              <div className="min-w-0 pr-3">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-black uppercase">
                  {previewMedia.category}
                </span>
                <h3 className="text-sm font-black text-[#071A3D] mt-0.5 truncate">{previewMedia.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewMedia.url}
                  download={`OD-Proof-${Date.now()}`}
                  className="px-3 py-1.5 rounded-xl bg-[#1455D9] text-white text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-gray-900/5 min-h-[400px]">
              {previewMedia.url.startsWith('data:application/pdf') || previewMedia.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewMedia.url}
                  title="Proof Document"
                  className="w-full h-[70vh] rounded-2xl border border-gray-200 bg-white"
                />
              ) : (
                <img
                  src={previewMedia.url}
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
