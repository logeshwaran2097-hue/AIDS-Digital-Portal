'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
  Edit3,
  Trash2,
  RotateCw,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import {
  parseDailyProofs,
  DailyProofItem,
  HackathonDurationFormat,
} from '@/lib/dailyProofs'

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
  durationFormat?: string | null
  dailyProofs?: string | null
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
  const router = useRouter()
  const [proofs, setProofs] = useState<ODProofItem[]>(initialProofs)
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'SANCTIONED' | 'PENDING_GEO' | 'PENDING_CERT' | 'CREDITED'>('ALL')

  React.useEffect(() => {
    fetch('/api/od-proofs')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.proofs)) {
          setProofs(data.proofs)
        }
      })
      .catch(() => {})
  }, [])

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [editingProof, setEditingProof] = useState<ODProofItem | null>(null)
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false)
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [selectedProof, setSelectedProof] = useState<ODProofItem | null>(null)
  const [previewMedia, setPreviewMedia] = useState<{ url: string; title: string; category?: string } | null>(null)

  // Edit Event Form State
  const [editForm, setEditForm] = useState({
    eventName: '',
    category: 'Hackathon',
    durationFormat: '24 Hours (2 Days)' as HackathonDurationFormat,
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    venueCollege: '',
  })

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

  // Register Form with Hackathon Durations (24h, 36h, 48h)
  const [registerForm, setRegisterForm] = useState({
    eventName: '',
    category: 'Hackathon',
    durationFormat: '24 Hours (2 Days)' as HackathonDurationFormat,
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    venueCollege: '',
  })

  // Geo-tag Upload Form (With Day selection & progress checkpoint caption)
  const [geoForm, setGeoForm] = useState({
    photoUrl: '',
    dayNumber: 1,
    dayTitle: '',
    date: '',
    caption: '',
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
      const eventDate = registerForm.fromDate === registerForm.toDate
        ? registerForm.fromDate
        : `${registerForm.fromDate} to ${registerForm.toDate}`

      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_OD',
          eventName: registerForm.eventName,
          category: registerForm.category,
          durationFormat: registerForm.durationFormat,
          eventDate,
          venueCollege: registerForm.venueCollege,
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
          durationFormat: '24 Hours (2 Days)',
          fromDate: new Date().toISOString().split('T')[0],
          toDate: new Date().toISOString().split('T')[0],
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

  // 2b. OPEN & SUBMIT EDIT OD EVENT
  const openEditEventModal = (p: ODProofItem) => {
    setEditingProof(p)
    const dates = (p.eventDate || '').split(' to ')
    const from = dates[0] || new Date().toISOString().split('T')[0]
    const to = dates[1] || dates[0] || new Date().toISOString().split('T')[0]
    setEditForm({
      eventName: p.eventName || '',
      category: p.category || 'Hackathon',
      durationFormat: (p.durationFormat as HackathonDurationFormat) || '24 Hours (2 Days)',
      fromDate: from,
      toDate: to,
      venueCollege: p.venueCollege || '',
    })
    setIsEditEventOpen(true)
  }

  const handleEditEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProof) return
    if (!editForm.eventName.trim()) {
      toast.error('Please enter an event name.')
      return
    }

    setLoading(true)
    try {
      const eventDate = editForm.fromDate === editForm.toDate
        ? editForm.fromDate
        : `${editForm.fromDate} to ${editForm.toDate}`

      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_OD',
          id: editingProof.id,
          eventName: editForm.eventName.trim(),
          category: editForm.category,
          durationFormat: editForm.durationFormat,
          eventDate,
          venueCollege: editForm.venueCollege ? editForm.venueCollege.trim() : '',
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'OD Event updated successfully!')
        setProofs((prev) => prev.map((p) => (p.id === editingProof.id ? result.proof : p)))
        setIsEditEventOpen(false)
        setEditingProof(null)
      } else {
        toast.error(result.message || 'Failed to update OD event.')
      }
    } catch {
      toast.error('Network error updating OD event.')
    } finally {
      setLoading(false)
    }
  }

  // 2c. DELETE OD EVENT
  const handleDeleteEvent = async (p: ODProofItem) => {
    if (!confirm(`Are you sure you want to delete "${p.eventName}"? This cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/od-proofs?id=${encodeURIComponent(p.id)}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'Event removed successfully.')
        setProofs((prev) => prev.filter((item) => item.id !== p.id))
        router.refresh()
      } else {
        toast.error(result.message || 'Failed to remove event.')
      }
    } catch {
      toast.error('Network error removing event.')
    } finally {
      setLoading(false)
    }
  }

  // 2d. DELETE ALL OD EVENTS
  const handleDeleteAllEvents = async () => {
    if (!confirm('Are you sure you want to permanently delete all your OD event proofs? This cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/od-proofs?all=true', {
        method: 'DELETE',
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'All OD events permanently removed.')
        setProofs([])
        router.refresh()
      } else {
        toast.error(result.message || 'Failed to remove events.')
      }
    } catch {
      toast.error('Network error removing events.')
    } finally {
      setLoading(false)
    }
  }

  // 2e. MANUAL ON-DEMAND SYNC SANCTIONED ODS
  const handleSyncSanctionedODs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_SANCTIONED_ODS' }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'Sanctioned OD events synchronized.')
        const fresh = await fetch('/api/od-proofs').then((r) => r.json())
        if (fresh && fresh.success && Array.isArray(fresh.proofs)) {
          setProofs(fresh.proofs)
        }
        router.refresh()
      } else {
        toast.error(result.message || 'Sync failed.')
      }
    } catch {
      toast.error('Network error during sync.')
    } finally {
      setLoading(false)
    }
  }

  // 3. SUBMIT GEOTAG PHOTO FOR SPECIFIC DAY
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
          dayNumber: geoForm.dayNumber,
          caption: geoForm.caption,
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

  const openGeoModal = (p: ODProofItem, targetDay?: number) => {
    setSelectedProof(p)
    const checkpoints = parseDailyProofs(p)
    const day = targetDay || checkpoints.find((c) => !c.photoUrl)?.dayNumber || 1
    const checkpoint = checkpoints.find((c) => c.dayNumber === day) || checkpoints[0]
    setGeoForm({
      photoUrl: checkpoint?.photoUrl || '',
      dayNumber: day,
      dayTitle: checkpoint?.title || `Day ${day} Proof`,
      date: checkpoint?.date || p.eventDate,
      caption: checkpoint?.caption || '',
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
  const verifiedCount = proofs.filter((p) => p.status === 'verified' || p.status === 'advisor_approved').length
  const sanctionedCount = proofs.filter(
    (p) =>
      p.status === 'verified' ||
      p.attendanceCredited ||
      (p.advisorRemarks && p.advisorRemarks.toLowerCase().includes('sanction'))
  ).length
  const pendingGeoCount = proofs.filter((p) => !p.geoPhotoUrl).length
  const pendingCertCount = proofs.filter((p) => !p.certificateUrl).length

  const filteredProofs = proofs.filter((p) => {
    const isGeo = Boolean(p.geoPhotoUrl)
    const isCert = Boolean(p.certificateUrl)
    const isSanctioned =
      p.status === 'verified' ||
      p.attendanceCredited ||
      (p.advisorRemarks && p.advisorRemarks.toLowerCase().includes('sanction'))

    if (activeFilter === 'SANCTIONED') return isSanctioned
    if (activeFilter === 'PENDING_GEO') return !isGeo
    if (activeFilter === 'PENDING_CERT') return !isCert
    if (activeFilter === 'CREDITED') return p.status === 'verified' || p.attendanceCredited
    return true
  })

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
            Event Proofs &amp; Sanctioned OD Hub
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            View your <strong>Sanctioned On-Duty (OD) Events</strong>, upload your <strong>Live Venue Geo-Tag Photo</strong> on event day and submit your <strong>Completion Certificate</strong> to credit your official attendance.
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
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Events</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{totalCount}</p>
          <p className="text-[10px] text-gray-500">Official Registrations</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs text-center bg-gradient-to-b from-white to-emerald-50/40">
          <p className="text-[10px] text-emerald-700 font-bold uppercase">Sanctioned ODs</p>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">{sanctionedCount}</p>
          <p className="text-[10px] text-emerald-600 font-bold">Approved by HOD / Advisor</p>
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
      </div>

      {/* Filter Tabs Strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        {[
          { key: 'ALL', label: `All Events (${totalCount})` },
          { key: 'SANCTIONED', label: `🏛️ Sanctioned ODs (${sanctionedCount})` },
          { key: 'PENDING_GEO', label: `📍 Need Geo-Tag (${pendingGeoCount})` },
          { key: 'PENDING_CERT', label: `📜 Need Certificate (${pendingCertCount})` },
          { key: 'CREDITED', label: `✅ Attendance Credited (${verifiedCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-[#071A3D] text-[#F4C430] shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OD Proof Submissions List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-black text-[#071A3D] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1455D9]" /> My Registered &amp; Sanctioned OD Events
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-gray-500 font-medium">{filteredProofs.length} of {proofs.length} Events</span>
            <button
              type="button"
              onClick={handleSyncSanctionedODs}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-all cursor-pointer shadow-2xs"
              title="Sync newly approved OD applications"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Sanctioned ODs
            </button>
            {proofs.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteAllEvents}
                disabled={loading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 transition-all cursor-pointer shadow-2xs"
                title="Permanently remove all OD events"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All Proofs
              </button>
            )}
          </div>
        </div>

        {filteredProofs.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-gray-300 p-8 text-center bg-white">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#071A3D]">
                {activeFilter === 'SANCTIONED' ? 'No Sanctioned OD Events Found' : 'No OD Events Found in This View'}
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                {activeFilter === 'SANCTIONED'
                  ? 'When your class advisor endorses and HOD sanctions your OD attendance or leave request, it will automatically appear here ready for proof submission.'
                  : 'Register your external hackathon, symposium, or conference participation to upload venue photos and certificates.'}
              </p>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1455D9] text-white text-xs font-bold shadow-xs hover:bg-[#0e44b5] cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Register Event Now
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredProofs.map((p) => {
              const checkpoints = parseDailyProofs(p)
              const submittedDailyProofs = checkpoints.filter((c) => c.status === 'submitted' && Boolean(c.photoUrl))
              const isAllDaysCompleted = submittedDailyProofs.length === checkpoints.length && checkpoints.length > 0
              const isGeoUploaded = Boolean(p.geoPhotoUrl) || submittedDailyProofs.length > 0
              const isCertUploaded = Boolean(p.certificateUrl)
              const isVerified = p.status === 'verified' || p.status === 'advisor_approved'
              const isResubmit = p.status === 'resubmit_requested'
              const isSanctioned =
                p.status === 'verified' ||
                p.attendanceCredited ||
                (p.advisorRemarks && p.advisorRemarks.toLowerCase().includes('sanction'))

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
                          {p.durationFormat && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              {p.durationFormat}
                            </span>
                          )}
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

                      <div className="shrink-0 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {p.status === 'verified' ? (
                          <Badge className="bg-emerald-500 text-white font-black text-xs px-3 py-1 flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OD Sanctioned & Credited
                          </Badge>
                        ) : p.status === 'advisor_approved' ? (
                          <Badge className="bg-teal-600 text-white font-black text-xs px-3 py-1 flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Advisor
                          </Badge>
                        ) : isResubmit ? (
                          <Badge className="bg-rose-500 text-white font-black text-xs px-3 py-1 flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3.5 h-3.5" /> Re-upload Requested
                          </Badge>
                        ) : isAllDaysCompleted && isCertUploaded ? (
                          <Badge className="bg-purple-600 text-white font-black text-xs px-3 py-1 flex items-center gap-1 shadow-xs">
                            <Clock className="w-3.5 h-3.5" /> Under Advisor Review
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500 text-white font-black text-xs px-3 py-1 flex items-center gap-1 shadow-xs">
                            <Clock className="w-3.5 h-3.5" /> Awaiting Proofs ({submittedDailyProofs.length}/{checkpoints.length} Days)
                          </Badge>
                        )}

                        {/* Edit & Delete Action Buttons */}
                        <button
                          type="button"
                          onClick={() => openEditEventModal(p)}
                          className="px-2.5 py-1 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-[#1455D9] transition-all cursor-pointer shadow-2xs flex items-center gap-1 text-xs font-bold"
                          title="Edit Event Details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(p)}
                          className="px-2.5 py-1 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all cursor-pointer shadow-2xs flex items-center gap-1 text-xs font-bold"
                          title="Delete Event Record"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Delete</span>
                        </button>
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

                    {/* Officially Sanctioned OD Badge Banner */}
                    {isSanctioned && (
                      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 border border-emerald-300 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                            🏛️
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-emerald-950">
                                Officially Sanctioned On-Duty (OD)
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
                                Sanctioned
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                              {p.advisorRemarks || 'Approved by HOD & Advisor · OD Attendance Credited'}
                            </p>
                          </div>
                        </div>

                        {/* Quick upload buttons right in the sanctioned banner */}
                        {(!isAllDaysCompleted || !isCertUploaded) && (
                          <div className="flex items-center gap-2 shrink-0">
                            {!isAllDaysCompleted && (
                              <button
                                type="button"
                                onClick={() => openGeoModal(p)}
                                className="px-3 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-105"
                              >
                                <Camera className="w-3.5 h-3.5" /> Upload Daily Proof
                              </button>
                            )}
                            {!isCertUploaded && (
                              <button
                                type="button"
                                onClick={() => openCertModal(p)}
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-105"
                              >
                                <Award className="w-3.5 h-3.5" /> Upload Certificate
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dynamic Daily Proofs Lifecycle (1. Pre-registered -> Day 1 -> Day 2 -> ... -> Certificate) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                      {/* Step 1: Pre-Registered */}
                      <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-emerald-900 truncate">1. Pre-Registered</p>
                          <p className="text-[10px] text-emerald-700">OD Sanctioned</p>
                        </div>
                      </div>

                      {/* Dynamic Checkpoints for Each Day of Hackathon / Multi-day Event */}
                      {checkpoints.map((cp, idx) => {
                        const isSubmitted = cp.status === 'submitted' && Boolean(cp.photoUrl)
                        return (
                          <div
                            key={cp.dayNumber}
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                              isSubmitted ? 'bg-blue-50/70 border-blue-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isSubmitted ? (
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : (
                                <Camera className="w-4 h-4 text-gray-400 shrink-0" />
                              )}
                              <div className="truncate">
                                <p className="font-bold text-[#071A3D] truncate" title={cp.title}>
                                  {idx + 2}. {cp.title.includes(':') ? cp.title.split(':')[0] : `Day ${cp.dayNumber}`}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate">
                                  {isSubmitted ? 'GPS Verified' : cp.date ? `Pending · ${cp.date}` : 'Pending'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => openGeoModal(p, cp.dayNumber)}
                              className="px-2.5 py-1 rounded-lg bg-[#1455D9] text-white text-[10px] font-bold shrink-0 hover:bg-[#0e44b5] cursor-pointer"
                            >
                              {isSubmitted ? 'Edit' : 'Upload'}
                            </button>
                          </div>
                        )
                      })}

                      {/* Final Step: Event Certificate */}
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
                            <p className="font-bold text-[#071A3D] truncate">
                              {checkpoints.length + 2}. Certificate
                            </p>
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
                    </div>

                    {/* Proof Cards Preview Strip (Daily Geo-Tags & Certificate) */}
                    {(submittedDailyProofs.length > 0 || isCertUploaded) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                        {/* Render All Submitted Daily Proofs */}
                        {submittedDailyProofs.map((cp) => (
                          <div
                            key={cp.dayNumber}
                            className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3"
                          >
                            <div
                              onClick={() =>
                                setPreviewMedia({
                                  url: cp.photoUrl || '',
                                  title: `${p.eventName} — ${cp.title}`,
                                  category: `Day ${cp.dayNumber} Geo-Tag Photo`,
                                })
                              }
                              className="w-16 h-16 rounded-xl overflow-hidden bg-black/10 shrink-0 relative border border-gray-300 cursor-pointer group"
                              title="Click to view full photo"
                            >
                              <img
                                src={cp.photoUrl || ''}
                                alt={cp.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="space-y-1 text-xs min-w-0 flex-1">
                              <span className="font-bold text-[#071A3D] flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="truncate">{cp.title}</span>
                              </span>
                              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>{cp.date}</span>
                              </p>
                              {cp.caption && (
                                <p className="text-[11px] text-[#1455D9] font-medium italic truncate">
                                  &ldquo;{cp.caption}&rdquo;
                                </p>
                              )}
                              <div className="pt-1 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewMedia({
                                      url: cp.photoUrl || '',
                                      title: `${p.eventName} — ${cp.title}`,
                                      category: `Day ${cp.dayNumber} Geo-Tag Photo`,
                                    })
                                  }
                                  className="text-[11px] text-[#1455D9] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Photo
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

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

                    {/* Direct Proof Upload CTA Footer if proofs are missing */}
                    {(!isAllDaysCompleted || !isCertUploaded) && (
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="text-xs text-gray-600 font-medium">
                          <span className="text-[#071A3D] font-bold">Proof Actions:</span>{' '}
                          {submittedDailyProofs.length} of {checkpoints.length} Daily Proofs Submitted
                          {!isAllDaysCompleted && ` · Day ${checkpoints.find(c => !c.photoUrl)?.dayNumber || 1} photo pending`}
                          {!isCertUploaded ? ' · Final certificate pending' : ''}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {!isAllDaysCompleted && (
                            <button
                              type="button"
                              onClick={() => openGeoModal(p)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-105"
                            >
                              <Camera className="w-3.5 h-3.5" /> Upload Day {checkpoints.find(c => !c.photoUrl)?.dayNumber || 1} Proof
                            </button>
                          )}
                          {!isCertUploaded && (
                            <button
                              type="button"
                              onClick={() => openCertModal(p)}
                              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-105"
                            >
                              <Award className="w-3.5 h-3.5" /> Upload Certificate
                            </button>
                          )}
                        </div>
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
                    onChange={(e) => {
                      const cat = e.target.value
                      setRegisterForm({
                        ...registerForm,
                        category: cat,
                        durationFormat: cat === 'Hackathon' ? '24 Hours (2 Days)' : 'Single Day (8 Hours)',
                      })
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] bg-white"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Symposium">Symposium</option>
                    <option value="Paper Presentation">Paper Presentation</option>
                    <option value="Project Expo">Project Expo</option>
                    <option value="Sports">Sports Meet</option>
                    <option value="Workshop">Hands-on Workshop</option>
                    <option value="Internship">Internship / Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Duration & Format *</label>
                  <select
                    value={registerForm.durationFormat}
                    onChange={(e) => setRegisterForm({ ...registerForm, durationFormat: e.target.value as HackathonDurationFormat })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] bg-white"
                  >
                    <option value="24 Hours (2 Days)">24 Hours Hackathon (2 Days)</option>
                    <option value="36 Hours (2-3 Days)">36 Hours Hackathon (2-3 Days)</option>
                    <option value="48 Hours (3 Days)">48 Hours Hackathon (3 Days)</option>
                    <option value="Single Day (8 Hours)">Single Day Event (1 Day)</option>
                    <option value="Multi-Day Range">Custom Multi-Day Date Range</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">From / Start Date *</label>
                  <input
                    type="date"
                    required
                    value={registerForm.fromDate}
                    onChange={(e) => setRegisterForm({ ...registerForm, fromDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">To / End Date *</label>
                  <input
                    type="date"
                    required
                    value={registerForm.toDate}
                    onChange={(e) => setRegisterForm({ ...registerForm, toDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                <span>Daily proof submission checkpoints will be generated for each working day (Sundays excluded).</span>
              </p>

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
      {/* MODAL 2: UPLOAD STAGE 1 - LIVE GEO-TAG VENUE PHOTO & DAILY PROOFS */}
      {/* ========================================================================= */}
      {isGeoModalOpen && selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Upload Daily Geo-Tag Proof</h3>
                <p className="text-xs text-[#1455D9] font-bold">{selectedProof.eventName}</p>
                <p className="text-[11px] text-gray-500 font-medium">{geoForm.dayTitle}</p>
              </div>
              <button
                onClick={() => setIsGeoModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkpoint day selector if multiple days */}
            {(() => {
              const checkpoints = parseDailyProofs(selectedProof)
              if (checkpoints.length <= 1) return null
              return (
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#071A3D] text-[11px] uppercase tracking-wider">
                    Select Hackathon Day Checkpoint *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {checkpoints.map((cp) => {
                      const isSel = geoForm.dayNumber === cp.dayNumber
                      const isSubmitted = cp.status === 'submitted' && Boolean(cp.photoUrl)
                      return (
                        <button
                          key={cp.dayNumber}
                          type="button"
                          onClick={() =>
                            setGeoForm((prev) => ({
                              ...prev,
                              dayNumber: cp.dayNumber,
                              dayTitle: cp.title,
                              date: cp.date,
                              photoUrl: cp.photoUrl || '',
                              caption: cp.caption || '',
                            }))
                          }
                          className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                              : isSubmitted
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>Day {cp.dayNumber}</span>
                            {isSubmitted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                          <p className={`text-[10px] font-normal truncate mt-0.5 ${isSel ? 'text-blue-100' : 'text-gray-500'}`}>
                            {cp.date}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            <form onSubmit={handleGeoSubmit} className="space-y-4 text-xs">
              {/* Optional Progress Caption / Checkpoint Note */}
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">
                  Progress Milestone / Activity Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Round 1 Ideation Pitch completed or 24hr midnight coding session"
                  value={geoForm.caption}
                  onChange={(e) => setGeoForm({ ...geoForm, caption: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9]"
                />
              </div>

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
      {/* ========================================================================= */}
      {/* MODAL 5: EDIT OD EVENT DETAILS (CRUD EDIT) */}
      {/* ========================================================================= */}
      {isEditEventOpen && editingProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Edit OD Event Details</h3>
                <p className="text-xs text-gray-500">Update event name, category, dates or venue</p>
              </div>
              <button
                onClick={() => setIsEditEventOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditEventSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Event Name / Hackathon Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart India Hackathon, Tech Symposium..."
                  value={editForm.eventName}
                  onChange={(e) => setEditForm({ ...editForm, eventName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Category *</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] bg-white font-medium"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Technical Paper">Technical Paper Presentation</option>
                    <option value="Project Expo">Project Expo</option>
                    <option value="Symposium">Symposium / Fest</option>
                    <option value="Workshop">Hands-on Workshop</option>
                    <option value="Conference">International / National Conference</option>
                    <option value="Sports">Sports Tournament</option>
                    <option value="Cultural">Cultural Fest</option>
                    <option value="Other">Other Academic Activity</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Duration / Schedule *</label>
                  <select
                    value={editForm.durationFormat}
                    onChange={(e) => setEditForm({ ...editForm, durationFormat: e.target.value as HackathonDurationFormat })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] bg-white font-medium"
                  >
                    <option value="Single Day (8 Hours)">Single Day (8 Hours)</option>
                    <option value="24 Hours (2 Days)">24 Hours (2 Days)</option>
                    <option value="36 Hours (2-3 Days)">36 Hours (2-3 Days)</option>
                    <option value="48 Hours (3-4 Days)">48 Hours (3-4 Days)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={editForm.fromDate}
                    onChange={(e) => setEditForm({ ...editForm, fromDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={editForm.toDate}
                    onChange={(e) => setEditForm({ ...editForm, toDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Host Institution / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. IIT Madras, Anna University, Coimbatore..."
                  value={editForm.venueCollege}
                  onChange={(e) => setEditForm({ ...editForm, venueCollege: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditEventOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !editForm.eventName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Saving Changes...' : 'Update Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
