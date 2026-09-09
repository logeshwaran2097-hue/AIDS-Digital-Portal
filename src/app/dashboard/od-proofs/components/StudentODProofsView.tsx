'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  ShieldCheck,
  Award,
  MapPin,
  Camera,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Plus,
  X,
  ExternalLink,
  Calendar,
  Sparkles,
  ChevronRight,
  Navigation,
  FileText,
  User,
  GraduationCap,
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

interface StudentODProofsViewProps {
  initialProofs: ODProofItem[]
  studentInfo: {
    name: string
    registerNumber: string
    year: number
    section: string
    semester: number
    batch: string
  }
}

export function StudentODProofsView({ initialProofs, studentInfo }: StudentODProofsViewProps) {
  const [proofs, setProofs] = useState<ODProofItem[]>(initialProofs)
  const [loading, setLoading] = useState(false)

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false)
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [selectedProof, setSelectedProof] = useState<ODProofItem | null>(null)
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

  // Register Form
  const [registerForm, setRegisterForm] = useState({
    eventName: '',
    category: 'Hackathon',
    eventDate: new Date().toISOString().split('T')[0],
    venueCollege: '',
  })

  // Geo-tag Upload Form (Image contains embedded GPS timestamp & map from GeoTag/GPS camera)
  const [geoForm, setGeoForm] = useState({
    photoUrl: '',
  })

  // Certificate Upload Form
  const [certForm, setCertForm] = useState({
    certificateUrl: '',
    certificateName: '',
    achievement: 'Participation',
  })

  // Handle Photo File Select (Convert to Base64)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setGeoForm((prev) => ({
        ...prev,
        photoUrl: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  // Handle Certificate File Select (Convert to Base64)
  const handleCertSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCertForm((prev) => ({
        ...prev,
        certificateUrl: reader.result as string,
        certificateName: file.name,
      }))
    }
    reader.readAsDataURL(file)
  }

  // 2. SUBMIT REGISTER OD
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_OD',
          ...registerForm,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message)
        setProofs((prev) => [result.proof, ...prev])
        setIsRegisterOpen(false)
        setRegisterForm({
          eventName: '',
          category: 'Hackathon',
          eventDate: new Date().toISOString().split('T')[0],
          venueCollege: '',
        })
      } else {
        toast.error(result.message || 'Failed to register OD.')
      }
    } catch {
      toast.error('Network error registering OD.')
    } finally {
      setLoading(false)
    }
  }

  // 3. SUBMIT GEOTAG PHOTO
  const handleGeoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProof) return
    if (!geoForm.photoUrl) {
      toast.error('Please snap or select your Geo-Tag photo.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPLOAD_GEOTAG',
          id: selectedProof.id,
          geoPhotoUrl: geoForm.photoUrl,
          geoTimestamp: new Date().toISOString(),
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message)
        setProofs((prev) => prev.map((p) => (p.id === selectedProof.id ? result.proof : p)))
        setIsGeoModalOpen(false)
        setSelectedProof(null)
      } else {
        toast.error(result.message || 'Failed to upload geo-tag.')
      }
    } catch {
      toast.error('Network error uploading geo-tag.')
    } finally {
      setLoading(false)
    }
  }

  // 4. SUBMIT CERTIFICATE
  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProof) return
    if (!certForm.certificateUrl) {
      toast.error('Please upload your event certificate.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPLOAD_CERTIFICATE',
          id: selectedProof.id,
          certificateUrl: certForm.certificateUrl,
          certificateName: certForm.certificateName,
          achievement: certForm.achievement,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message)
        setProofs((prev) => prev.map((p) => (p.id === selectedProof.id ? result.proof : p)))
        setIsCertModalOpen(false)
        setSelectedProof(null)
      } else {
        toast.error(result.message || 'Failed to upload certificate.')
      }
    } catch {
      toast.error('Network error uploading certificate.')
    } finally {
      setLoading(false)
    }
  }

  const openGeoModal = (p: ODProofItem) => {
    setSelectedProof(p)
    setGeoForm({
      photoUrl: p.geoPhotoUrl || '',
    })
    setIsGeoModalOpen(true)
  }

  const openCertModal = (p: ODProofItem) => {
    setSelectedProof(p)
    setCertForm({
      certificateUrl: p.certificateUrl || '',
      certificateName: p.certificateName || '',
      achievement: p.achievement || 'Participation',
    })
    setIsCertModalOpen(true)
  }

  // Metric summaries
  const totalCount = proofs.length
  const geoUploadedCount = proofs.filter((p) => p.geoPhotoUrl).length
  const certUploadedCount = proofs.filter((p) => p.certificateUrl).length
  const verifiedCount = proofs.filter((p) => p.status === 'verified').length

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4C430]/20 border border-[#F4C430]/40 text-[#F4C430] text-xs font-black uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Institutional Compliance &amp; NAAC Verification
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            OD &amp; Hackathon Proofs Hub
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Upload your <strong>Live Venue Geo-Tag Photo</strong> on event day and your <strong>Completion Certificate</strong> post-event to receive official OD attendance credit from your Class Advisor.
          </p>
          <div className="flex items-center gap-3 text-xs text-blue-200 pt-1 font-mono">
            <span>Student: {studentInfo.name}</span>
            <span>·</span>
            <span>Reg: {studentInfo.registerNumber}</span>
            <span>·</span>
            <span>Year {studentInfo.year} - Sec {studentInfo.section}</span>
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register New OD / Event
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total OD Registered</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{totalCount}</p>
          <p className="text-[10px] text-gray-500">Official Applications</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs text-center">
          <p className="text-[10px] text-blue-600 font-bold uppercase">Stage 1: Geo-Tag Photos</p>
          <p className="text-2xl font-black text-[#1455D9] mt-0.5">
            {geoUploadedCount} / {totalCount}
          </p>
          <p className="text-[10px] text-blue-600">GPS Venue Checked-in</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs text-center">
          <p className="text-[10px] text-purple-600 font-bold uppercase">Stage 2: Certificates</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">
            {certUploadedCount} / {totalCount}
          </p>
          <p className="text-[10px] text-purple-600">Post-Event Uploaded</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs text-center">
          <p className="text-[10px] text-emerald-600 font-bold uppercase">Advisor Verified</p>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">{verifiedCount}</p>
          <p className="text-[10px] text-emerald-600 font-bold">Attendance Sanctioned</p>
        </div>
      </div>

      {/* OD Proof Submissions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-[#071A3D] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1455D9]" /> My Registered OD Events &amp; Verification Status
          </h2>
          <span className="text-xs text-gray-500 font-medium">{proofs.length} Event Records</span>
        </div>

        {proofs.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-gray-300 p-8 text-center bg-white">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#071A3D]">No OD Events Registered Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                When you participate in an external hackathon, paper presentation, or symposium, click the button below to register your event and submit venue proofs.
              </p>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1455D9] text-white text-xs font-bold shadow-xs hover:bg-[#0e44b5]"
              >
                <Plus className="w-4 h-4" /> Register Event Now
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {proofs.map((p) => {
              const isGeoUploaded = Boolean(p.geoPhotoUrl)
              const isCertUploaded = Boolean(p.certificateUrl)
              const isVerified = p.status === 'verified'
              const isResubmit = p.status === 'resubmit_requested'

              return (
                <Card
                  key={p.id}
                  className="rounded-3xl border-gray-200 shadow-xs bg-white overflow-hidden transition-all hover:shadow-md"
                >
                  <CardContent className="p-5 sm:p-6 space-y-5">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100/80 text-[#1455D9] text-[10px] font-black uppercase tracking-wider">
                            {p.category}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
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
                        <h3 className="text-base sm:text-lg font-black text-[#071A3D]">{p.eventName}</h3>
                      </div>

                      <div className="shrink-0">
                        {isVerified ? (
                          <Badge className="bg-emerald-500 text-white font-black text-xs px-3 py-1 flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OD Attendance Credited
                          </Badge>
                        ) : isResubmit ? (
                          <Badge className="bg-rose-500 text-white font-black text-xs px-3 py-1 flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3.5 h-3.5" /> Re-upload Requested
                          </Badge>
                        ) : isGeoUploaded && isCertUploaded ? (
                          <Badge className="bg-purple-600 text-white font-black text-xs px-3 py-1 flex items-center gap-1 shadow-xs">
                            <Clock className="w-3.5 h-3.5" /> Under Advisor Review
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500 text-white font-black text-xs px-3 py-1 flex items-center gap-1 shadow-xs">
                            <Clock className="w-3.5 h-3.5" /> Awaiting Proofs
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Advisor Feedback Notice if resubmit requested */}
                    {isResubmit && p.advisorRemarks && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-rose-900">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          Class Advisor Remarks:
                        </p>
                        <p className="text-rose-700 pl-5">{p.advisorRemarks}</p>
                      </div>
                    )}

                    {/* 4-Step Progress Lifecycle */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {/* Step 1: Pre-Registered */}
                      <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-emerald-900">1. Pre-Registered</p>
                          <p className="text-[10px] text-emerald-700">OD Sanctioned</p>
                        </div>
                      </div>

                      {/* Step 2: Geo-Tag Photo */}
                      <div
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                          isGeoUploaded
                            ? 'bg-blue-50/70 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isGeoUploaded ? (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="font-bold text-[#071A3D] truncate">2. Geo-Tag Photo</p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {isGeoUploaded ? 'GPS Verified' : 'Pending'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openGeoModal(p)}
                          className="px-2.5 py-1 rounded-lg bg-[#1455D9] text-white text-[10px] font-bold shrink-0 hover:bg-[#0e44b5] cursor-pointer"
                        >
                          {isGeoUploaded ? 'Edit' : 'Upload'}
                        </button>
                      </div>

                      {/* Step 3: Certificate */}
                      <div
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                          isCertUploaded
                            ? 'bg-purple-50/70 border-purple-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isCertUploaded ? (
                            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                          ) : (
                            <Award className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="font-bold text-[#071A3D] truncate">3. Certificate</p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {isCertUploaded ? p.achievement || 'Submitted' : 'Pending'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openCertModal(p)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-bold shrink-0 hover:bg-purple-700 cursor-pointer"
                        >
                          {isCertUploaded ? 'Edit' : 'Upload'}
                        </button>
                      </div>

                      {/* Step 4: Advisor Sign-off */}
                      <div
                        className={`p-3 rounded-2xl border flex items-center gap-2 ${
                          isVerified
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {isVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-[#071A3D]">4. Attendance Credit</p>
                          <p className="text-[10px] text-gray-500">
                            {isVerified ? 'Official OD Granted' : 'Awaiting Advisor'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Proof Cards Preview Strip */}
                    {(isGeoUploaded || isCertUploaded) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                        {/* Geo-Tag Preview */}
                        {isGeoUploaded && (
                          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                            <div 
                              onClick={() => setPreviewMedia({ url: p.geoPhotoUrl || '', title: `${p.eventName} — Venue Geo-Tag Photo`, category: 'Venue Geo-Tag Photo' })}
                              className="w-16 h-16 rounded-xl overflow-hidden bg-black/10 shrink-0 relative border border-gray-300 cursor-pointer group"
                              title="Click to view full photo"
                            >
                              <img
                                src={p.geoPhotoUrl || ''}
                                alt="Venue Geotag"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="space-y-1 text-xs min-w-0 flex-1">
                              <span className="font-bold text-[#071A3D] flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                <span>Venue Geo-Tag Photo</span>
                              </span>
                              {p.venueCollege && (
                                <p className="font-bold text-[11px] text-[#071A3D] truncate">{p.venueCollege}</p>
                              )}
                              {p.geoAddress && (
                                <p className="text-[11px] text-gray-500 truncate">{p.geoAddress}</p>
                              )}
                              <div className="pt-1 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewMedia({ url: p.geoPhotoUrl || '', title: `${p.eventName} — Venue Geo-Tag Photo`, category: 'Venue Geo-Tag Photo' })}
                                  className="text-[11px] text-[#1455D9] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Geo-Tag Photo
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Certificate Preview */}
                        {isCertUploaded && (
                          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                            <div 
                              onClick={() => setPreviewMedia({ url: p.certificateUrl || '', title: `${p.eventName} — ${p.achievement || 'Certificate'}`, category: 'Event Certificate' })}
                              className="w-16 h-16 rounded-xl overflow-hidden bg-purple-100 shrink-0 relative border border-purple-200 flex items-center justify-center cursor-pointer group"
                              title="Click to view certificate"
                            >
                              {p.certificateUrl?.startsWith('data:image') || p.certificateUrl?.endsWith('.png') || p.certificateUrl?.endsWith('.jpg') ? (
                                <img
                                  src={p.certificateUrl || ''}
                                  alt="Certificate"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <FileText className="w-8 h-8 text-purple-600 group-hover:scale-105 transition-transform" />
                              )}
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="space-y-1 text-xs min-w-0 flex-1">
                              <span className="font-bold text-[#071A3D] flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-purple-600" />
                                <span>{p.achievement || 'Event Certificate'}</span>
                              </span>
                              <p className="text-[11px] text-gray-500 truncate">
                                {p.certificateName || 'Certificate Document'}
                              </p>
                              <div className="pt-1 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewMedia({ url: p.certificateUrl || '', title: `${p.eventName} — ${p.achievement || 'Certificate'}`, category: 'Event Certificate' })}
                                  className="text-[11px] text-purple-700 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Open Certificate
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER NEW OD EVENT */}
      {/* ========================================================================= */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Register OD / Hackathon Event</h3>
                <p className="text-xs text-gray-500">Initiate compliance dossier for external participation</p>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Event / Hackathon Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart India Hackathon 2026 - Finale"
                  value={registerForm.eventName}
                  onChange={(e) => setRegisterForm({ ...registerForm, eventName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Category *</label>
                  <select
                    value={registerForm.category}
                    onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] bg-white"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Symposium">Symposium</option>
                    <option value="Paper Presentation">Paper Presentation</option>
                    <option value="Project Expo">Project Expo</option>
                    <option value="Sports">Sports Meet</option>
                    <option value="Workshop">Hands-on Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={registerForm.eventDate}
                    onChange={(e) => setRegisterForm({ ...registerForm, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Host College / Venue Campus</label>
                <input
                  type="text"
                  placeholder="e.g. Coimbatore Institute of Technology, Coimbatore"
                  value={registerForm.venueCollege}
                  onChange={(e) => setRegisterForm({ ...registerForm, venueCollege: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Registering...' : 'Register Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPLOAD STAGE 1 - LIVE GEO-TAG VENUE PHOTO */}
      {/* ========================================================================= */}
      {isGeoModalOpen && selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Upload Live Venue Geo-Tag Photo</h3>
                <p className="text-xs text-[#1455D9] font-bold">{selectedProof.eventName}</p>
              </div>
              <button
                onClick={() => setIsGeoModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeoSubmit} className="space-y-4 text-xs">
              {/* Camera / Photo Upload input */}
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">
                  Select / Snap Geo-Tag Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#1455D9] hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Upload the photo captured with GPS Map Camera / Geo-Tag app at the venue (with embedded GPS location &amp; timestamp).
                </p>
              </div>

              {/* Photo Preview Clean - Shows the full photo so embedded GPS stamp is visible */}
              {geoForm.photoUrl ? (
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xs bg-black flex items-center justify-center p-1">
                  <img
                    src={geoForm.photoUrl}
                    alt="Geo-Tag Preview"
                    className="w-full h-auto max-h-80 object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-2 bg-gray-50/50">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-[#071A3D] text-xs">No Geo-Tag Photo Chosen Yet</p>
                  <p className="text-[11px] text-gray-400">
                    Snap or choose a photo taken with GPS Map Camera
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsGeoModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !geoForm.photoUrl}
                  className="flex-1 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Uploading...' : 'Save Geo-Tag Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: UPLOAD STAGE 2 - EVENT COMPLETION CERTIFICATE */}
      {/* ========================================================================= */}
      {isCertModalOpen && selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Upload Event Certificate</h3>
                <p className="text-xs text-purple-700 font-bold">{selectedProof.eventName}</p>
              </div>
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCertSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Select Certificate File (PDF / Image) *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleCertSelect}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                />
                {certForm.certificateName && (
                  <p className="text-[11px] text-purple-700 font-bold mt-1">
                    Selected: {certForm.certificateName}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Result / Achievement Category *</label>
                <select
                  value={certForm.achievement}
                  onChange={(e) => setCertForm({ ...certForm, achievement: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-purple-600 bg-white"
                >
                  <option value="Participation">Participation Certificate</option>
                  <option value="1st Prize / Winner">🥇 1st Prize / Winner</option>
                  <option value="2nd Prize / Runner Up">🥈 2nd Prize / Runner Up</option>
                  <option value="3rd Prize">🥉 3rd Prize</option>
                  <option value="Special Recognition / Finalist">🎖️ Special Recognition / Finalist</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !certForm.certificateUrl}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Submitting...' : 'Submit Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FULLSCREEN MEDIA PREVIEW LIGHTBOX */}
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
