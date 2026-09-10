'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'

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

interface AdvisorODProofsViewProps {
  initialProofs: ODProofItem[]
  advisorJurisdiction: {
    year: number
    section: string
    batch: string
    advisorName: string
  }
}

export function AdvisorODProofsView({ initialProofs, advisorJurisdiction }: AdvisorODProofsViewProps) {
  const [proofs, setProofs] = useState<ODProofItem[]>(initialProofs)
  const [activeTab, setActiveTab] = useState<'ALL' | 'READY' | 'PENDING' | 'VERIFIED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProof, setSelectedProof] = useState<ODProofItem | null>(null)
  const [advisorRemarks, setAdvisorRemarks] = useState(
    'Geo-tag and Certificate verified. Officially endorsed for OD attendance credit.'
  )
  const [loading, setLoading] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<{ url: string; title: string; category?: string } | null>(null)

  // Safely open base64 data URLs in a new browser tab without Chrome top-frame navigation block
  const openInNewTabSafely = (url: string) => {
    if (!url) return
    if (url.startsWith('data:')) {
      try {
        const parts = url.split(',')
        const mimeMatch = parts[0].match(/:(.*?);/)
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
        const bstr = atob(parts[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        const blob = new Blob([u8arr], { type: mime })
        const blobUrl = URL.createObjectURL(blob)
        window.open(blobUrl, '_blank')
        return
      } catch {
        // Fallback
      }
    }
    window.open(url, '_blank')
  }

  // Filter proofs
  const filteredProofs = proofs.filter((p) => {
    // Tab Filter
    if (activeTab === 'READY') {
      if (!p.geoPhotoUrl || !p.certificateUrl || p.status === 'verified' || p.status === 'advisor_approved') return false
    } else if (activeTab === 'PENDING') {
      if (p.geoPhotoUrl && p.certificateUrl) return false
    } else if (activeTab === 'VERIFIED') {
      if (p.status !== 'verified' && p.status !== 'advisor_approved') return false
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = p.studentName.toLowerCase().includes(q)
      const matchReg = p.registerNumber.toLowerCase().includes(q)
      const matchEvent = p.eventName.toLowerCase().includes(q)
      const matchCollege = p.venueCollege?.toLowerCase().includes(q) || false
      return matchName || matchReg || matchEvent || matchCollege
    }

    return true
  })

  // Open Inspection Modal
  const openInspectModal = (p: ODProofItem) => {
    setSelectedProof(p)
    setAdvisorRemarks(
      p.advisorRemarks || 'Geo-tag and Certificate verified. Officially endorsed for OD attendance credit.'
    )
  }

  // Action: Verify & Credit Attendance
  const handleVerifyOD = async () => {
    if (!selectedProof) return
    setLoading(true)
    try {
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADVISOR_VERIFY',
          id: selectedProof.id,
          remarks: advisorRemarks,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message)
        setProofs((prev) => prev.map((p) => (p.id === selectedProof.id ? result.proof : p)))
        setSelectedProof(null)
      } else {
        toast.error(result.message || 'Failed to verify OD attendance.')
      }
    } catch {
      toast.error('Network error verifying OD.')
    } finally {
      setLoading(false)
    }
  }

  // Action: Request Resubmission
  const handleRejectOD = async () => {
    if (!selectedProof) return
    if (!advisorRemarks.trim()) {
      toast.error('Please enter a reason or instructions for the student.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADVISOR_REJECT',
          id: selectedProof.id,
          remarks: advisorRemarks,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message)
        setProofs((prev) => prev.map((p) => (p.id === selectedProof.id ? result.proof : p)))
        setSelectedProof(null)
      } else {
        toast.error(result.message || 'Failed to request clarification.')
      }
    } catch {
      toast.error('Network error sending request.')
    } finally {
      setLoading(false)
    }
  }

  // Stats calculation
  const totalCount = proofs.length
  const readyCount = proofs.filter((p) => p.geoPhotoUrl && p.certificateUrl && p.status !== 'verified' && p.status !== 'advisor_approved').length
  const pendingProofsCount = proofs.filter((p) => (!p.geoPhotoUrl || !p.certificateUrl) && p.status !== 'verified' && p.status !== 'advisor_approved').length
  const verifiedCount = proofs.filter((p) => p.status === 'verified' || p.status === 'advisor_approved').length

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4C430]/20 border border-[#F4C430]/40 text-[#F4C430] text-xs font-black uppercase tracking-wide">
            <Award className="w-3.5 h-3.5" />
            Class Advisor Statutory Powers · OD &amp; Leave Verification
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            OD &amp; Hackathon Proofs Verification Vault
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Inspect live student <strong>Venue Geo-Tags</strong> (with GPS coordinates &amp; host college validation) and <strong>Achievement Certificates</strong> before officially sanctioning OD attendance credits.
          </p>
          <div className="flex items-center gap-3 text-xs text-blue-200 pt-1 font-mono">
            <span>Jurisdiction: {advisorJurisdiction.batch}</span>
            <span>·</span>
            <span>Advisor: {advisorJurisdiction.advisorName}</span>
          </div>
        </div>

        <div className="relative z-10 shrink-0 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-right">
          <p className="text-[10px] text-blue-200 uppercase font-bold">Class Roster Scope</p>
          <p className="text-xl font-black text-white">{advisorJurisdiction.batch}</p>
          <p className="text-[10px] text-emerald-300 font-medium">Department of AI &amp; DS</p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Class ODs</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{totalCount}</p>
          <p className="text-[10px] text-gray-500">Cohort Submissions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs text-center">
          <p className="text-[10px] text-purple-600 font-bold uppercase">Ready For Sign-off</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">{readyCount}</p>
          <p className="text-[10px] text-purple-600 font-bold">Both Proofs Uploaded</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs text-center">
          <p className="text-[10px] text-amber-600 font-bold uppercase">Awaiting Student Proofs</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">{pendingProofsCount}</p>
          <p className="text-[10px] text-amber-600">Geo-Tag / Cert Missing</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs text-center">
          <p className="text-[10px] text-emerald-600 font-bold uppercase">Verified &amp; Credited</p>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">{verifiedCount}</p>
          <p className="text-[10px] text-emerald-600 font-bold">OD Attendance Granted</p>
        </div>
      </div>

      {/* Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-[#1455D9] shadow-xs'
                : 'text-gray-600 hover:text-[#071A3D]'
            }`}
          >
            All Submissions ({proofs.length})
          </button>
          <button
            onClick={() => setActiveTab('READY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'READY'
                ? 'bg-[#1455D9] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#071A3D]'
            }`}
          >
            Ready for Sign-Off ({readyCount})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-[#071A3D]'
            }`}
          >
            Awaiting Proofs ({pendingProofsCount})
          </button>
          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'VERIFIED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-[#071A3D]'
            }`}
          >
            Verified ({verifiedCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#1455D9]"
          />
        </div>
      </div>

      {/* Proof Requests List */}
      <div className="space-y-4">
        {filteredProofs.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-gray-300 p-8 text-center bg-white">
            <CardContent className="space-y-2">
              <ShieldCheck className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="font-bold text-sm text-[#071A3D]">No OD Records Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No OD submissions matching the selected filter criteria for {advisorJurisdiction.batch}.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProofs.map((p) => {
            const hasGeo = Boolean(p.geoPhotoUrl)
            const hasCert = Boolean(p.certificateUrl)
            const isVerified = p.status === 'verified' || p.status === 'advisor_approved'
            const isReady = hasGeo && hasCert && !isVerified

            return (
              <Card
                key={p.id}
                className="rounded-3xl border-gray-200 shadow-xs bg-white overflow-hidden transition-all hover:shadow-md"
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100/80 text-[#1455D9] text-[10px] font-black uppercase tracking-wider">
                          {p.category}
                        </span>
                        <span className="font-mono text-xs text-gray-500 font-bold">
                          {p.registerNumber}
                        </span>
                        <span className="text-xs text-gray-500">·</span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {p.eventDate}
                        </span>
                        {p.venueCollege && (
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            {p.venueCollege}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[#071A3D]">
                        {p.studentName} — {p.eventName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isVerified ? (
                        <Badge className="bg-emerald-500 text-white font-black text-xs px-3 py-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified &amp; Attendance Credited
                        </Badge>
                      ) : isReady ? (
                        <Badge className="bg-purple-600 text-white font-black text-xs px-3 py-1 flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Ready for Advisor Sign-off
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500 text-white font-black text-xs px-3 py-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Complete Proofs
                        </Badge>
                      )}

                      <button
                        onClick={() => openInspectModal(p)}
                        className="px-4 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-105"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Inspect Proofs
                      </button>
                    </div>
                  </div>

                  {/* Proofs Badge Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Geo-Tag Status */}
                    <div
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        hasGeo ? 'bg-blue-50/70 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {hasGeo ? (
                          <div 
                            onClick={() => setPreviewMedia({ url: p.geoPhotoUrl || '', title: `${p.studentName} — Venue Geo-Tag Photo`, category: 'Venue Geo-Tag Photo' })}
                            className="w-10 h-10 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                            title="Click to view full photo"
                          >
                            <img src={p.geoPhotoUrl || ''} alt="Venue Geotag" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-bold text-[#071A3D]">Stage 1: Venue Geo-Tag Photo</p>
                          <p className="text-[11px] text-gray-600 truncate">
                            {hasGeo
                              ? p.venueCollege ? `${p.venueCollege} · Uploaded` : 'Geo-Tag Photo Uploaded'
                              : 'Student has not checked in yet'}
                          </p>
                        </div>
                      </div>

                      {hasGeo && p.geoPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewMedia({ url: p.geoPhotoUrl || '', title: `${p.studentName} — Venue Geo-Tag Photo`, category: 'Venue Geo-Tag Photo' })}
                          className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-[#1455D9] text-[11px] font-bold shrink-0 hover:bg-blue-50 flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      )}
                    </div>

                    {/* Certificate Status */}
                    <div
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        hasCert ? 'bg-purple-50/70 border-purple-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          onClick={() => hasCert && p.certificateUrl && setPreviewMedia({ url: p.certificateUrl, title: `${p.studentName} — ${p.achievement || 'Certificate'}`, category: 'Event Certificate' })}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            hasCert ? 'bg-purple-200 text-purple-700 cursor-pointer hover:bg-purple-300' : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-[#071A3D]">Stage 2: Event Certificate</p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {hasCert ? p.achievement || 'Submitted' : 'Pending certificate submission'}
                          </p>
                        </div>
                      </div>

                      {hasCert && p.certificateUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewMedia({ url: p.certificateUrl || '', title: `${p.studentName} — ${p.achievement || 'Certificate'}`, category: 'Event Certificate' })}
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 text-[11px] font-bold shrink-0 hover:bg-purple-50 flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Verification Footer details if verified */}
                  {isVerified && (
                    <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Remarks: {p.advisorRemarks || 'Verified and sanctioned.'}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-mono">
                        Endorsed by {p.verifiedByName || 'Class Advisor'} on{' '}
                        {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString() : 'Active'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PROOF INSPECTION & ADVISOR ENDORSEMENT DRAWER */}
      {/* ========================================================================= */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-black uppercase">
                    {selectedProof.category}
                  </span>
                  <span className="text-xs text-gray-500 font-mono font-bold">
                    Reg: {selectedProof.registerNumber}
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#071A3D]">
                  {selectedProof.studentName} — Proof Inspection Dossier
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Event: <strong>{selectedProof.eventName}</strong> ({selectedProof.eventDate})
                </p>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-Side Proofs Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left Column: Stage 1 Geo-Tag Photo */}
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#071A3D] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#1455D9]" /> Stage 1: Venue Geo-Tag Photo
                  </span>
                  {selectedProof.geoPhotoUrl ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      GPS Validated
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold">
                      Not Uploaded
                    </span>
                  )}
                </div>

                {selectedProof.geoPhotoUrl ? (
                  <div className="space-y-2">
                    <div 
                      onClick={() => setPreviewMedia({ url: selectedProof.geoPhotoUrl || '', title: `${selectedProof.studentName} — Venue Geo-Tag Photo`, category: 'Venue Geo-Tag Photo' })}
                      className="rounded-2xl overflow-hidden border border-gray-200 shadow-xs max-h-72 bg-black flex items-center justify-center p-1 cursor-pointer group"
                      title="Click to view full photo"
                    >
                      <img
                        src={selectedProof.geoPhotoUrl}
                        alt="Venue Geo-tag"
                        className="w-full h-auto max-h-72 object-contain rounded-xl group-hover:opacity-90 transition-opacity"
                      />
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-blue-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">GPS Geotag Photo:</span>
                        <button
                          type="button"
                          onClick={() => setPreviewMedia({ url: selectedProof.geoPhotoUrl || '', title: `${selectedProof.studentName} — Venue Geo-Tag Photo`, category: 'Venue Geo-Tag Photo' })}
                          className="text-[11px] text-[#1455D9] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Full Image
                        </button>
                      </div>
                      {selectedProof.venueCollege && (
                        <div>
                          <p className="font-black text-[#071A3D] text-xs">
                            {selectedProof.venueCollege}
                          </p>
                        </div>
                      )}
                      {selectedProof.geoAddress && (
                        <p className="text-gray-700 text-[11px] leading-snug">
                          {selectedProof.geoAddress}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white border border-dashed border-gray-300 text-center text-gray-400">
                    <MapPin className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                    <p className="font-medium text-xs">Student has not checked in at the venue yet.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Stage 2 Certificate */}
              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#071A3D] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" /> Stage 2: Event Certificate
                  </span>
                  {selectedProof.certificateUrl ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                      {selectedProof.achievement || 'Submitted'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold">
                      Pending
                    </span>
                  )}
                </div>

                {selectedProof.certificateUrl ? (
                  <div className="space-y-2">
                    <div 
                      onClick={() => setPreviewMedia({ url: selectedProof.certificateUrl || '', title: `${selectedProof.studentName} — ${selectedProof.achievement || 'Certificate'}`, category: 'Event Certificate' })}
                      className="rounded-2xl overflow-hidden border border-purple-200 shadow-xs max-h-60 bg-purple-100 flex items-center justify-center p-2 cursor-pointer group"
                      title="Click to view certificate"
                    >
                      {selectedProof.certificateUrl.startsWith('data:image') ||
                      selectedProof.certificateUrl.endsWith('.png') ||
                      selectedProof.certificateUrl.endsWith('.jpg') ? (
                        <img
                          src={selectedProof.certificateUrl}
                          alt="Certificate"
                          className="w-full h-full object-contain max-h-56 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <FileText className="w-12 h-12 text-purple-600 mx-auto group-hover:scale-105 transition-transform" />
                          <p className="font-bold text-xs text-purple-900">{selectedProof.certificateName || 'Certificate Document'}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-purple-200 flex items-center justify-between">
                      <span className="font-bold text-purple-800 text-[11px]">
                        Achievement: {selectedProof.achievement || 'Participation'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewMedia({ url: selectedProof.certificateUrl || '', title: `${selectedProof.studentName} — ${selectedProof.achievement || 'Certificate'}`, category: 'Event Certificate' })}
                        className="text-[11px] text-purple-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View File
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white border border-dashed border-gray-300 text-center text-gray-400">
                    <Award className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                    <p className="font-medium text-xs">Event completion certificate has not been uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Advisor Remarks & Sign-off Actions */}
            <div className="space-y-3 pt-2 border-t">
              <div>
                <label className="block font-bold text-[#071A3D] text-xs mb-1">
                  Class Advisor Regulatory Sign-off Remarks:
                </label>
                <textarea
                  rows={2}
                  value={advisorRemarks}
                  onChange={(e) => setAdvisorRemarks(e.target.value)}
                  placeholder="Enter endorsement remarks or reasons for clarification..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRejectOD}
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Request Re-upload / Clarification'}
                </button>

                <div className="flex-1" />

                <button
                  type="button"
                  onClick={() => setSelectedProof(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleVerifyOD}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50 hover:scale-105"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {loading ? 'Sanctioning...' : 'Verify & Credit OD Attendance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULLSCREEN MEDIA PREVIEW LIGHTBOX */}
      {/* ========================================================================= */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setPreviewMedia(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50/90">
              <div className="min-w-0 pr-3">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-black uppercase tracking-wide">
                  {previewMedia.category || 'Proof Document'}
                </span>
                <h3 className="text-sm sm:text-base font-black text-[#071A3D] mt-0.5 truncate">
                  {previewMedia.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openInNewTabSafely(previewMedia.url)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Open in new browser tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Tab</span>
                </button>
                <a
                  href={previewMedia.url}
                  download={`OD-Proof-${Date.now()}`}
                  className="px-3 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Viewer Body */}
            <div className="flex-1 overflow-auto p-3 sm:p-5 bg-neutral-900 flex items-center justify-center min-h-[320px]">
              {previewMedia.url.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewMedia.url}
                  className="w-full h-[70vh] rounded-xl border-0"
                  title={previewMedia.title}
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
