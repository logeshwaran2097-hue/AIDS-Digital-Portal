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
  Phone,
  MessageCircle,
  Bus,
  Home,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  Navigation,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface AdminODProofItem {
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
  status: string // 'pending_proofs' | 'under_review' | 'advisor_approved' | 'verified' | 'resubmit_requested'
  advisorRemarks?: string | null
  verifiedByName?: string | null
  verifiedAt?: string | null
  attendanceCredited: boolean
  assignedAdvisor?: string | null
  studentPhone?: string | null
  parentPhone?: string | null
  residencyType?: string | null
  busRoute?: string | null
  hostelRoom?: string | null
  cgpa?: number | null
  createdAt: string
  updatedAt: string
}

interface Props {
  initialProofs: AdminODProofItem[]
  adminName: string
}

export function AdminODProofsView({ initialProofs, adminName }: Props) {
  const [proofs, setProofs] = useState<AdminODProofItem[]>(initialProofs)
  const [activeTab, setActiveTab] = useState<'ALL' | 'ADVISOR_APPROVED' | 'UNDER_REVIEW' | 'SANCTIONED' | 'RESUBMIT' | 'INCOMPLETE'>('ALL')
  const [yearFilter, setYearFilter] = useState<'ALL' | '1' | '2' | '3' | '4'>('ALL')
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProof, setSelectedProof] = useState<AdminODProofItem | null>(null)
  const [adminRemarks, setAdminRemarks] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeInspectTab, setActiveInspectTab] = useState<'GEOTAG' | 'CERTIFICATE' | 'DETAILS'>('GEOTAG')
  const [previewMedia, setPreviewMedia] = useState<{ url: string; title: string; category: string } | null>(null)

  // Metrics computation
  const metrics = useMemo(() => {
    const total = proofs.length
    const withGeotag = proofs.filter((p) => Boolean(p.geoPhotoUrl)).length
    const withCertificate = proofs.filter((p) => Boolean(p.certificateUrl)).length
    const advisorApproved = proofs.filter((p) => p.status === 'advisor_approved').length
    const underReview = proofs.filter((p) => p.status === 'under_review').length
    const sanctioned = proofs.filter((p) => p.status === 'verified').length
    const resubmitRequested = proofs.filter((p) => p.status === 'resubmit_requested').length
    const incomplete = proofs.filter((p) => !p.geoPhotoUrl || !p.certificateUrl).length
    return {
      total,
      withGeotag,
      withCertificate,
      advisorApproved,
      underReview,
      sanctioned,
      resubmitRequested,
      incomplete,
    }
  }, [proofs])

  // Filtered dataset
  const filteredProofs = useMemo(() => {
    return proofs.filter((p) => {
      // Tab filter
      if (activeTab === 'ADVISOR_APPROVED' && p.status !== 'advisor_approved') return false
      if (activeTab === 'UNDER_REVIEW' && p.status !== 'under_review') return false
      if (activeTab === 'SANCTIONED' && p.status !== 'verified') return false
      if (activeTab === 'RESUBMIT' && p.status !== 'resubmit_requested') return false
      if (activeTab === 'INCOMPLETE' && Boolean(p.geoPhotoUrl && p.certificateUrl)) return false

      // Year filter
      if (yearFilter !== 'ALL' && String(p.year) !== yearFilter) return false

      // Section filter
      if (sectionFilter !== 'ALL' && (p.section || 'A').toUpperCase() !== sectionFilter) return false

      // Category filter
      if (categoryFilter !== 'ALL' && p.category.toLowerCase() !== categoryFilter.toLowerCase()) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = (p.studentName || '').toLowerCase().includes(q)
        const matchesReg = (p.registerNumber || '').toLowerCase().includes(q)
        const matchesEvent = (p.eventName || '').toLowerCase().includes(q)
        const matchesCollege = (p.venueCollege || '').toLowerCase().includes(q)
        const matchesAdvisor = (p.assignedAdvisor || '').toLowerCase().includes(q)
        if (!matchesName && !matchesReg && !matchesEvent && !matchesCollege && !matchesAdvisor) {
          return false
        }
      }

      return true
    })
  }, [proofs, activeTab, yearFilter, sectionFilter, categoryFilter, searchQuery])

  // Super Admin: Sanction OD & Credit Attendance
  const handleAdminSanction = async (proof: AdminODProofItem) => {
    try {
      setLoading(true)
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_SANCTION',
          id: proof.id,
          remarks: adminRemarks || 'Verified and officially sanctioned under Super Admin central jurisdiction.',
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`OD Sanctioned! Attendance credited for ${proof.studentName}`)
        setProofs((prev) =>
          prev.map((p) =>
            p.id === proof.id
              ? {
                  ...p,
                  status: 'verified',
                  attendanceCredited: true,
                  verifiedByName: `${adminName} (Super Admin)`,
                  verifiedAt: new Date().toISOString(),
                  advisorRemarks: adminRemarks || p.advisorRemarks,
                }
              : p
          )
        )
        setSelectedProof(null)
        setAdminRemarks('')
      } else {
        toast.error(data.message || 'Failed to sanction OD')
      }
    } catch {
      toast.error('Network error while sanctioning OD')
    } finally {
      setLoading(false)
    }
  }

  // Super Admin: Request Clarification / Resubmit
  const handleAdminReject = async (proof: AdminODProofItem) => {
    if (!adminRemarks.trim()) {
      toast.error('Please enter specific clarification remarks for the student')
      return
    }
    try {
      setLoading(true)
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_REJECT',
          id: proof.id,
          remarks: adminRemarks.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Clarification request dispatched to ${proof.studentName}`)
        setProofs((prev) =>
          prev.map((p) =>
            p.id === proof.id
              ? {
                  ...p,
                  status: 'resubmit_requested',
                  advisorRemarks: `[Admin Directive] ${adminRemarks.trim()}`,
                }
              : p
          )
        )
        setSelectedProof(null)
        setAdminRemarks('')
      } else {
        toast.error(data.message || 'Failed to send clarification request')
      }
    } catch {
      toast.error('Network error requesting clarification')
    } finally {
      setLoading(false)
    }
  }

  // Super Admin: Delete Record
  const handleDeleteProof = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the OD Proof record for ${name}?`)) {
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`/api/od-proofs?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        toast.success('OD Proof record deleted successfully')
        setProofs((prev) => prev.filter((p) => p.id !== id))
        if (selectedProof?.id === id) {
          setSelectedProof(null)
        }
      } else {
        toast.error(data.message || 'Failed to delete record')
      }
    } catch {
      toast.error('Network error deleting record')
    } finally {
      setLoading(false)
    }
  }

  // Export PDF Report
  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'INSTITUTIONAL ON-DUTY (OD) PROOFS & VERIFICATION AUDIT REGISTRY',
      subtitle: 'Department of Artificial Intelligence & Data Science · Academic Year 2025-26',
      author: `${adminName} (Super System Administrator)`,
      category: 'Central OD Tracking & Attendance Credit Audit',
      sections: [
        {
          heading: '1. EXECUTIVE OD TRACKING SUMMARY',
          body: [
            `Total Audited OD Submissions: ${metrics.total}`,
            `Live Geo-Tagged Photos Uploaded: ${metrics.withGeotag}`,
            `Completion Certificates Attached: ${metrics.withCertificate}`,
            `Class Advisor Endorsed: ${metrics.advisorApproved}`,
            `Super Admin / HOD Sanctioned (Credited): ${metrics.sanctioned}`,
            `Clarification / Re-upload Directives: ${metrics.resubmitRequested}`,
            `Incomplete Proof Dossiers: ${metrics.incomplete}`,
            `Report Generated On: ${new Date().toLocaleDateString('en-IN')}`,
          ],
        },
        {
          heading: '2. MASTER STUDENT OD PROOF AUDIT LIST',
          body: filteredProofs.map(
            (p, idx) =>
              `${idx + 1}. [Year ${p.year} - Sec ${p.section || 'A'}] ${p.studentName} (${p.registerNumber}) | Event: "${p.eventName}" (${p.category}) at ${p.venueCollege || 'Host Institution'} on ${p.eventDate}. Advisor: ${p.assignedAdvisor || 'Class Advisor'}. Distinction: ${p.achievement || 'Participation'}. Status: ${p.status.toUpperCase()} | Attendance: ${p.attendanceCredited ? 'CREDITED' : 'PENDING'}.`
          ),
        },
      ],
      fileName: `VSB_OD_Proofs_Master_Registry_${new Date().toISOString().split('T')[0]}`,
    })
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Register Number',
      'Student Name',
      'Year',
      'Section',
      'Event Name',
      'Category',
      'Event Date',
      'Venue College',
      'Geo Latitude',
      'Geo Longitude',
      'Geo Address',
      'Geo Timestamp',
      'Certificate Name',
      'Achievement',
      'Status',
      'Class Advisor',
      'Advisor Remarks',
      'Verified By',
      'Attendance Credited',
    ]

    const rows = filteredProofs.map((p) => [
      p.registerNumber,
      `"${p.studentName.replace(/"/g, '""')}"`,
      p.year,
      p.section,
      `"${p.eventName.replace(/"/g, '""')}"`,
      p.category,
      p.eventDate,
      `"${(p.venueCollege || '').replace(/"/g, '""')}"`,
      p.latitude || '',
      p.longitude || '',
      `"${(p.geoAddress || '').replace(/"/g, '""')}"`,
      p.geoTimestamp || '',
      `"${(p.certificateName || '').replace(/"/g, '""')}"`,
      p.achievement || '',
      p.status,
      `"${(p.assignedAdvisor || '').replace(/"/g, '""')}"`,
      `"${(p.advisorRemarks || '').replace(/"/g, '""')}"`,
      `"${(p.verifiedByName || '').replace(/"/g, '""')}"`,
      p.attendanceCredited ? 'YES' : 'NO',
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `VSB_OD_Proofs_Tracking_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('CSV Registry downloaded successfully!')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#22C7E8]/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-[#22C7E8] flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-[#22C7E8] shrink-0 shadow-lg">
              <ShieldCheck className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#22C7E8] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                  Admin Command
                </span>
                <span className="text-xs sm:text-sm text-gray-300 font-medium">· Institutional Attendance Governance</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white mt-1">
                On-Duty (OD) &amp; Proofs Central Tracking System
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
                Comprehensive tracking pipeline: Inspect live geo-tagged venue photos, audit symposium &amp; hackathon certificates, verify Class Advisor endorsements, and credit institutional attendance.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              Export Audit PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Submissions</span>
            <FileText className="w-4 h-4 text-[#1455D9]" />
          </div>
          <p className="text-2xl font-black text-[#071A3D]">{metrics.total}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Across all 4 batches</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Geotags Captured</span>
            <MapPin className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-black text-cyan-700">{metrics.withGeotag}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">GPS location stamped</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Certificates</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700">{metrics.withCertificate}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Official documents</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Advisor Endorsed</span>
            <GraduationCap className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">{metrics.advisorApproved}</p>
          <p className="text-[10px] text-amber-600 font-bold mt-0.5">Ready for sanction</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fully Sanctioned</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{metrics.sanctioned}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Attendance Credited</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Clarification / Incomplete</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{metrics.resubmitRequested + metrics.incomplete}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Missing items or query</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100">
          {[
            { id: 'ALL', label: 'All Submissions', count: metrics.total },
            { id: 'ADVISOR_APPROVED', label: 'Advisor Approved (Ready to Sanction)', count: metrics.advisorApproved },
            { id: 'UNDER_REVIEW', label: 'Under Review', count: metrics.underReview },
            { id: 'SANCTIONED', label: 'Sanctioned & Credited', count: metrics.sanctioned },
            { id: 'RESUBMIT', label: 'Clarification Needed', count: metrics.resubmitRequested },
            { id: 'INCOMPLETE', label: 'Incomplete Dossiers', count: metrics.incomplete },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#071A3D] text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#071A3D]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === tab.id ? 'bg-[#22C7E8] text-[#071A3D]' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, reg no, event, college, advisor..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1455D9] bg-white cursor-pointer"
            >
              <option value="ALL">All Academic Years</option>
              <option value="1">1st Year (Batch 2025)</option>
              <option value="2">2nd Year (Batch 2024)</option>
              <option value="3">3rd Year (Batch 2023)</option>
              <option value="4">4th Year (Batch 2022)</option>
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1455D9] bg-white cursor-pointer"
            >
              <option value="ALL">All Sections (A/B/C/D)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1455D9] bg-white cursor-pointer"
            >
              <option value="ALL">All Event Categories</option>
              <option value="hackathon">Hackathon</option>
              <option value="symposium">Symposium</option>
              <option value="workshop">Workshop</option>
              <option value="paper presentation">Paper Presentation</option>
              <option value="sports">Sports</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Tracking Cards */}
      {filteredProofs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#071A3D]">No OD Proof Records Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No On-Duty applications match the selected filters or query. When students register and upload proofs, they appear here for centralized verification.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProofs.map((proof) => {
            const hasGeotag = Boolean(proof.geoPhotoUrl)
            const hasCertificate = Boolean(proof.certificateUrl)
            const isAdvisorApproved = proof.status === 'advisor_approved'
            const isSanctioned = proof.status === 'verified'
            const isResubmit = proof.status === 'resubmit_requested'

            return (
              <div
                key={proof.id}
                className={`p-5 rounded-2xl bg-white border transition-all duration-300 hover:shadow-md ${
                  isSanctioned
                    ? 'border-emerald-200/90 shadow-emerald-50/50'
                    : isAdvisorApproved
                    ? 'border-amber-300 shadow-amber-50/50 ring-1 ring-amber-200'
                    : isResubmit
                    ? 'border-rose-200 shadow-rose-50/50'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Card Top: Student Profile & Event Title */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    {/* Student Initials Box */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center font-black text-base shrink-0 shadow-md shadow-blue-500/10">
                      {proof.studentName?.charAt(0) || 'S'}
                    </div>

                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-base font-black text-[#071A3D]">{proof.studentName}</h3>
                        <span className="text-xs font-mono font-bold text-[#1455D9] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {proof.registerNumber}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Year {proof.year} · Sec {proof.section || 'A'} · Sem {proof.semester}
                        </span>
                      </div>

                      <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {proof.eventName}
                        </span>
                        <span>·</span>
                        <span className="text-slate-600">{proof.venueCollege || 'Host Venue / College'}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {proof.eventDate}
                        </span>
                        <span>·</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                          {proof.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges & Quick Action Trigger */}
                  <div className="flex items-center flex-wrap gap-2 shrink-0">
                    {isSanctioned ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-black text-[11px] px-2.5 py-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Sanctioned &amp; Attendance Credited
                      </Badge>
                    ) : isAdvisorApproved ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-black text-[11px] px-2.5 py-1 flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Advisor Approved · Sanction Ready
                      </Badge>
                    ) : isResubmit ? (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-black text-[11px] px-2.5 py-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Clarification Requested
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-50 text-blue-800 border-blue-200 font-bold text-[11px] px-2.5 py-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Under Review
                      </Badge>
                    )}

                    <button
                      onClick={() => {
                        setSelectedProof(proof)
                        setActiveInspectTab('GEOTAG')
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#22C7E8]" />
                      Inspect Proofs Dossier
                    </button>
                  </div>
                </div>

                {/* Card Middle: Visual Lifecycle Tracking Stepper */}
                <div className="py-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Live OD Verification &amp; Tracking Pipeline
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {/* Stage 1: Registration */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                        ✓
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#071A3D] truncate">1. Registered</p>
                        <p className="text-[10px] text-slate-500 truncate">{proof.category}</p>
                      </div>
                    </div>

                    {/* Stage 2: Geotag */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                        hasGeotag ? 'bg-cyan-50/70 border-cyan-200' : 'bg-slate-50 border-dashed border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          hasGeotag ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {hasGeotag ? '✓' : '2'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#071A3D] truncate">2. Live Geotag</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {hasGeotag ? (proof.venueCollege || 'Location Tagged') : 'Pending Upload'}
                        </p>
                      </div>
                    </div>

                    {/* Stage 3: Certificate */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                        hasCertificate ? 'bg-purple-50/70 border-purple-200' : 'bg-slate-50 border-dashed border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          hasCertificate ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {hasCertificate ? '✓' : '3'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#071A3D] truncate">3. Certificate</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {hasCertificate ? (proof.achievement || 'Submitted') : 'Pending Upload'}
                        </p>
                      </div>
                    </div>

                    {/* Stage 4: Advisor Endorsement */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                        isAdvisorApproved || isSanctioned
                          ? 'bg-amber-50/80 border-amber-200'
                          : 'bg-slate-50 border-dashed border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isAdvisorApproved || isSanctioned ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isAdvisorApproved || isSanctioned ? '✓' : '4'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#071A3D] truncate">4. Advisor Review</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {isAdvisorApproved || isSanctioned ? (proof.assignedAdvisor || 'Endorsed') : 'Awaiting Check'}
                        </p>
                      </div>
                    </div>

                    {/* Stage 5: Final Sanction */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                        isSanctioned ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-dashed border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isSanctioned ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isSanctioned ? '✓' : '5'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#071A3D] truncate">5. Attendance Credit</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {isSanctioned ? 'Attendance Credited' : 'Pending Sanction'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Inline Proof Thumbnails & Advisor Endorsement Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Proofs Preview Strip */}
                  <div className="flex items-center gap-3">
                    {/* Geotag Thumbnail */}
                    <div className="flex items-center gap-2">
                      {proof.geoPhotoUrl ? (
                        <div
                          onClick={() => {
                            setSelectedProof(proof)
                            setActiveInspectTab('GEOTAG')
                          }}
                          className="w-14 h-14 rounded-xl border-2 border-cyan-400 overflow-hidden relative group cursor-pointer shadow-sm shrink-0"
                        >
                          <img
                            src={proof.geoPhotoUrl}
                            alt="Geotag Venue"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <MapPin className="w-4 h-4 text-[#22C7E8]" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
                          <MapPin className="w-4 h-4" />
                          <span className="text-[8px] font-bold">No Photo</span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                          Live Geo-Tag Photo
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {proof.geoAddress
                            ? `${proof.geoAddress.slice(0, 35)}...`
                            : proof.latitude
                            ? `GPS: ${proof.latitude.toFixed(3)}, ${proof.longitude?.toFixed(3)}`
                            : 'Not uploaded yet'}
                        </p>
                      </div>
                    </div>

                    {/* Certificate Thumbnail */}
                    <div className="flex items-center gap-2">
                      {proof.certificateUrl ? (
                        <div
                          onClick={() => {
                            setSelectedProof(proof)
                            setActiveInspectTab('CERTIFICATE')
                          }}
                          className="w-14 h-14 rounded-xl border-2 border-purple-400 overflow-hidden relative group cursor-pointer shadow-sm shrink-0 bg-purple-50 flex items-center justify-center"
                        >
                          {proof.certificateUrl.endsWith('.pdf') ? (
                            <FileText className="w-7 h-7 text-purple-600" />
                          ) : (
                            <img
                              src={proof.certificateUrl}
                              alt="Certificate"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Award className="w-4 h-4 text-purple-300" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
                          <Award className="w-4 h-4" />
                          <span className="text-[8px] font-bold">No Cert</span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-700 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-purple-600" />
                          Completion Certificate
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {proof.achievement ? `Award: ${proof.achievement}` : proof.certificateName || 'Not uploaded yet'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Advisor & Sanction Info */}
                  <div className="flex items-center justify-between gap-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-500">
                        Advisor Endorsement: <span className="text-[#071A3D] font-bold">{proof.assignedAdvisor || 'Class Advisor'}</span>
                      </p>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        {proof.advisorRemarks ? `"${proof.advisorRemarks}"` : 'Pending verification review'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isSanctioned && (
                        <button
                          onClick={() => {
                            setSelectedProof(proof)
                            setActiveInspectTab('DETAILS')
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Sanction
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteProof(proof.id, proof.studentName)}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-500 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN PROOFS INSPECTOR MODAL (SEE THE PROOFS) */}
      {/* ========================================================================= */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#071A3D]/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#22C7E8] flex items-center justify-center text-[#22C7E8]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    OD Proofs Dossier · {selectedProof.studentName} ({selectedProof.registerNumber})
                  </h3>
                  <p className="text-xs text-gray-300">
                    {selectedProof.eventName} · {selectedProof.venueCollege || 'Host Venue'} · {selectedProof.eventDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 shrink-0">
              <button
                onClick={() => setActiveInspectTab('GEOTAG')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeInspectTab === 'GEOTAG'
                    ? 'border-[#1455D9] text-[#1455D9] bg-white rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-[#071A3D]'
                }`}
              >
                <MapPin className="w-4 h-4 text-cyan-600" />
                1. Live Geo-Tagged Photo
                {selectedProof.geoPhotoUrl && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </button>

              <button
                onClick={() => setActiveInspectTab('CERTIFICATE')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeInspectTab === 'CERTIFICATE'
                    ? 'border-[#1455D9] text-[#1455D9] bg-white rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-[#071A3D]'
                }`}
              >
                <Award className="w-4 h-4 text-purple-600" />
                2. Completion Certificate
                {selectedProof.certificateUrl && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </button>

              <button
                onClick={() => setActiveInspectTab('DETAILS')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeInspectTab === 'DETAILS'
                    ? 'border-[#1455D9] text-[#1455D9] bg-white rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-[#071A3D]'
                }`}
              >
                <FileCheck className="w-4 h-4 text-emerald-600" />
                3. Student Bio &amp; Sanction Directives
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: GEOTAG PHOTO INSPECTOR */}
              {activeInspectTab === 'GEOTAG' && (
                <div className="space-y-4">
                  {selectedProof.geoPhotoUrl ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Photo Display */}
                      <div className="md:col-span-2 rounded-2xl border-2 border-cyan-200 overflow-hidden bg-slate-900 relative shadow-inner flex items-center justify-center min-h-[360px]">
                        <img
                          src={selectedProof.geoPhotoUrl}
                          alt="Live Geotagged Venue Photo"
                          className="max-h-[440px] w-auto object-contain rounded-xl"
                        />
                        <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#22C7E8]" />
                            <span className="font-mono">
                              {selectedProof.latitude?.toFixed(4)}, {selectedProof.longitude?.toFixed(4)}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-300">
                            {selectedProof.geoTimestamp ? new Date(selectedProof.geoTimestamp).toLocaleString() : 'Live Stamped'}
                          </span>
                        </div>
                      </div>

                      {/* Geotag Metadata & Maps Link */}
                      <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-black text-[#071A3D] uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-cyan-600" />
                          Geo-Verification Audit
                        </h4>

                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Host Venue / College</p>
                            <p className="font-bold text-slate-800">{selectedProof.venueCollege || 'Host Institution'}</p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Reverse-Geocoded Address</p>
                            <p className="font-medium text-slate-700">{selectedProof.geoAddress || 'GPS Coordinates Registered'}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Latitude</p>
                              <p className="font-mono font-bold text-slate-800">{selectedProof.latitude || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Longitude</p>
                              <p className="font-mono font-bold text-slate-800">{selectedProof.longitude || 'N/A'}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Capture Timestamp</p>
                            <p className="font-medium text-slate-700">
                              {selectedProof.geoTimestamp
                                ? new Date(selectedProof.geoTimestamp).toLocaleString()
                                : selectedProof.createdAt}
                            </p>
                          </div>
                        </div>

                        {selectedProof.latitude && selectedProof.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${selectedProof.latitude},${selectedProof.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            Open in Google Maps
                          </a>
                        )}

                        <a
                          href={selectedProof.geoPhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Original Image
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300">
                      <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">No Geo-Tagged Photo Uploaded</p>
                      <p className="text-xs text-slate-400 mt-1">
                        The student has registered for this event but has not yet uploaded the live venue photo from the venue.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CERTIFICATE INSPECTOR */}
              {activeInspectTab === 'CERTIFICATE' && (
                <div className="space-y-4">
                  {selectedProof.certificateUrl ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Document Viewer */}
                      <div className="md:col-span-2 rounded-2xl border-2 border-purple-200 overflow-hidden bg-slate-900 relative shadow-inner flex items-center justify-center min-h-[360px]">
                        {selectedProof.certificateUrl.endsWith('.pdf') ? (
                          <iframe
                            src={selectedProof.certificateUrl}
                            className="w-full h-[460px] rounded-xl"
                            title="Certificate PDF"
                          />
                        ) : (
                          <img
                            src={selectedProof.certificateUrl}
                            alt="Event Certificate"
                            className="max-h-[460px] w-auto object-contain rounded-xl"
                          />
                        )}
                      </div>

                      {/* Certificate Metadata */}
                      <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-black text-[#071A3D] uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-purple-600" />
                          Certificate Validation
                        </h4>

                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Document File</p>
                            <p className="font-bold text-slate-800 break-all">{selectedProof.certificateName || 'Certificate_Dossier'}</p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Achievement Level</p>
                            <span className="inline-block mt-0.5 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-black text-xs">
                              🏆 {selectedProof.achievement || 'Participation Certificate'}
                            </span>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Event Title</p>
                            <p className="font-medium text-slate-700">{selectedProof.eventName}</p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Submission Timestamp</p>
                            <p className="font-medium text-slate-700">
                              {new Date(selectedProof.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <a
                          href={selectedProof.certificateUrl}
                          download={selectedProof.certificateName || 'OD_Certificate'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Certificate
                        </a>

                        <a
                          href={selectedProof.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open in Full Screen Tab
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300">
                      <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">No Certificate Uploaded</p>
                      <p className="text-xs text-slate-400 mt-1">
                        The event certificate has not been uploaded yet. Students can upload it once received from the organizers.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STUDENT BIO & EXECUTIVE SANCTION */}
              {activeInspectTab === 'DETAILS' && (
                <div className="space-y-6">
                  {/* Student Dossier Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Information</p>
                      <p className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        Student: {selectedProof.studentPhone || 'Not provided'}
                      </p>
                      <p className="font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Parent: {selectedProof.parentPhone || 'Not provided'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Residency &amp; Transport</p>
                      <p className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-purple-600" />
                        Type: {selectedProof.residencyType || 'Day Scholar'}
                      </p>
                      <p className="font-semibold text-slate-600 mt-1">
                        {selectedProof.hostelRoom || selectedProof.busRoute || 'Regular Campus Transit'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Academic Class Advisor</p>
                      <p className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                        {selectedProof.assignedAdvisor || 'Class Advisor'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Status: {selectedProof.status === 'advisor_approved' ? 'Endorsed & Verified' : 'Under Assessment'}
                      </p>
                    </div>
                  </div>

                  {/* Advisor Remarks Log */}
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs">
                    <p className="text-[11px] font-black text-blue-900 uppercase tracking-wider mb-1">
                      Class Advisor Verification Note
                    </p>
                    <p className="text-slate-700 italic">
                      {selectedProof.advisorRemarks || 'No specific advisor remarks recorded yet.'}
                    </p>
                    {selectedProof.verifiedByName && (
                      <p className="text-[10px] text-blue-600 font-bold mt-2">
                        Signed by: {selectedProof.verifiedByName} on{' '}
                        {selectedProof.verifiedAt ? new Date(selectedProof.verifiedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    )}
                  </div>

                  {/* Super Admin Directives & Sanction Action Box */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black text-[#071A3D] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#1455D9]" />
                      Super Administrator Executive Actions
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Administrative Directives / Sanction Remarks (Optional):
                      </label>
                      <textarea
                        value={adminRemarks}
                        onChange={(e) => setAdminRemarks(e.target.value)}
                        placeholder="e.g. Geotagged venue and official participation certificate audited under Central Administration. Full OD attendance granted."
                        rows={2}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1455D9] bg-white font-medium"
                      />
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5 pt-1">
                      <button
                        onClick={() => handleAdminSanction(selectedProof)}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {loading ? 'Processing...' : 'Officially Sanction & Credit Attendance'}
                      </button>

                      <button
                        onClick={() => handleAdminReject(selectedProof)}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Request Proof Clarification / Re-upload
                      </button>

                      <button
                        onClick={() => handleDeleteProof(selectedProof.id, selectedProof.studentName)}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ml-auto"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        Delete Record
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="font-mono">Record ID: {selectedProof.id}</span>
              <button
                onClick={() => setSelectedProof(null)}
                className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition-all cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
