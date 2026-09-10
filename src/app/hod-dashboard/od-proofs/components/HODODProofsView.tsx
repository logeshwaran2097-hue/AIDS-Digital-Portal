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
  CheckCircle,
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
  initialProofs: ODProofItem[]
  hodName: string
}

export function HODODProofsView({ initialProofs, hodName }: Props) {
  const [proofs, setProofs] = useState<ODProofItem[]>(initialProofs)
  const [activeTab, setActiveTab] = useState<'ALL' | 'ADVISOR_APPROVED' | 'AWAITING_ADVISOR' | 'SANCTIONED' | 'INCOMPLETE'>('ALL')
  const [yearFilter, setYearFilter] = useState<'ALL' | '2' | '3' | '4'>('ALL')
  const [sectionFilter, setSectionFilter] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL')
  const [advisorFilter, setAdvisorFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProof, setSelectedProof] = useState<ODProofItem | null>(null)
  const [hodRemarks, setHodRemarks] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<{ url: string; title: string; category: string } | null>(null)

  // Metrics computation
  const metrics = useMemo(() => {
    const total = proofs.length
    const advisorApproved = proofs.filter((p) => p.status === 'advisor_approved').length
    const awaitingAdvisor = proofs.filter((p) => p.status === 'under_review' && p.geoPhotoUrl && p.certificateUrl).length
    const sanctioned = proofs.filter((p) => p.status === 'verified').length
    const incomplete = proofs.filter((p) => !p.geoPhotoUrl || !p.certificateUrl).length
    return { total, advisorApproved, awaitingAdvisor, sanctioned, incomplete }
  }, [proofs])

  // Distinct list of advisors for filtering
  const distinctAdvisors = useMemo(() => {
    const names = new Set<string>()
    proofs.forEach((p) => {
      if (p.assignedAdvisor && p.assignedAdvisor !== 'Unassigned') names.add(p.assignedAdvisor)
      if (p.verifiedByName && !p.verifiedByName.includes('&')) names.add(p.verifiedByName)
    })
    return Array.from(names)
  }, [proofs])

  // Filtered proofs list
  const filteredProofs = useMemo(() => {
    return proofs.filter((p) => {
      // Tab filter
      if (activeTab === 'ADVISOR_APPROVED') {
        if (p.status !== 'advisor_approved') return false
      } else if (activeTab === 'AWAITING_ADVISOR') {
        if (p.status !== 'under_review' || !p.geoPhotoUrl || !p.certificateUrl) return false
      } else if (activeTab === 'SANCTIONED') {
        if (p.status !== 'verified') return false
      } else if (activeTab === 'INCOMPLETE') {
        if (p.geoPhotoUrl && p.certificateUrl) return false
      }

      // Year filter
      if (yearFilter !== 'ALL' && p.year !== Number(yearFilter)) return false

      // Section filter
      if (sectionFilter !== 'ALL' && p.section.toUpperCase() !== sectionFilter) return false

      // Advisor filter
      if (advisorFilter !== 'ALL') {
        const matchesAdvisor =
          p.assignedAdvisor?.toLowerCase() === advisorFilter.toLowerCase() ||
          p.verifiedByName?.toLowerCase().includes(advisorFilter.toLowerCase())
        if (!matchesAdvisor) return false
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = p.studentName.toLowerCase().includes(q)
        const matchReg = p.registerNumber.toLowerCase().includes(q)
        const matchEvent = p.eventName.toLowerCase().includes(q)
        const matchCollege = p.venueCollege?.toLowerCase().includes(q) || false
        const matchAdvisor = p.assignedAdvisor?.toLowerCase().includes(q) || false
        if (!matchName && !matchReg && !matchEvent && !matchCollege && !matchAdvisor) return false
      }

      return true
    })
  }, [proofs, activeTab, yearFilter, sectionFilter, advisorFilter, searchQuery])

  // Open Full Details & Inspection Modal
  const openInspectModal = (p: ODProofItem) => {
    setSelectedProof(p)
    setHodRemarks(
      p.advisorRemarks ||
        'HOD Executive Sanction: Venue GPS geo-tag and completion certificate verified. Officially sanctioned for On-Duty attendance credit.'
    )
  }

  // HOD Executive Sanction & Attendance Credit
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
        toast.success(result.message || 'OD officially sanctioned & attendance credited!')
        setProofs((prev) =>
          prev.map((p) =>
            p.id === selectedProof.id
              ? {
                  ...result.proof,
                  assignedAdvisor: p.assignedAdvisor,
                  studentPhone: p.studentPhone,
                  parentPhone: p.parentPhone,
                  residencyType: p.residencyType,
                  busRoute: p.busRoute,
                  hostelRoom: p.hostelRoom,
                  cgpa: p.cgpa,
                }
              : p
          )
        )
        setSelectedProof(null)
      } else {
        toast.error(result.message || 'Failed to sanction OD.')
      }
    } catch {
      toast.error('Network error sanctioning OD.')
    } finally {
      setLoading(false)
    }
  }

  // HOD Request Resubmission / Clarification
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
        setProofs((prev) =>
          prev.map((p) =>
            p.id === selectedProof.id
              ? {
                  ...result.proof,
                  assignedAdvisor: p.assignedAdvisor,
                  studentPhone: p.studentPhone,
                  parentPhone: p.parentPhone,
                  residencyType: p.residencyType,
                  busRoute: p.busRoute,
                  hostelRoom: p.hostelRoom,
                  cgpa: p.cgpa,
                }
              : p
          )
        )
        setSelectedProof(null)
      } else {
        toast.error(result.message || 'Failed to request resubmission.')
      }
    } catch {
      toast.error('Network error sending request.')
    } finally {
      setLoading(false)
    }
  }

  // Export Executive PDF Dossier
  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — ON-DUTY & EVENT PROOF DOSSIER',
      subtitle: `V.S.B. Engineering College · Autonomous Institution · Head of Department Executive Report`,
      author: hodName,
      category: 'Official OD Proofs & Verification Audit',
      sections: [
        {
          heading: '1. EXECUTIVE MONITORING SUMMARY',
          body: [
            `Total OD Proof Records: ${metrics.total}`,
            `Class Advisor Approved & Recommended: ${metrics.advisorApproved}`,
            `Awaiting Class Advisor Review: ${metrics.awaitingAdvisor}`,
            `Officially Sanctioned & Credited: ${metrics.sanctioned}`,
            `Incomplete Student Uploads: ${metrics.incomplete}`,
            `Report Generated On: ${new Date().toLocaleDateString('en-IN')}`,
          ],
        },
        {
          heading: '2. STUDENT OD EVENT AUDIT & ADVISOR APPROVAL LIST',
          body: filteredProofs.map(
            (p, idx) =>
              `${idx + 1}. [${p.year} AIDS ${p.section}] ${p.studentName} (${p.registerNumber}) — Event: "${p.eventName}" at ${p.venueCollege || 'Venue'}. Class Advisor: ${p.assignedAdvisor || 'Assigned'}. Distinction: ${p.achievement || 'Participation'}. Status: ${p.status.toUpperCase()} (Endorsed by: ${p.verifiedByName || p.assignedAdvisor || 'Pending Advisor'}). Attendance: ${p.attendanceCredited ? 'Credited' : 'Pending'}.`
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
              Executive Department Monitoring
            </span>
            <span className="text-xs text-gray-300">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">On-Duty (OD) &amp; Event Proofs Oversight</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
            Monitor department-wide student hackathon &amp; symposium participations, track Class Advisor approvals, and inspect verified GPS &amp; Certificate dossiers.
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
            <p className="text-[10px] uppercase font-bold text-gray-300">Total Proofs</p>
            <p className="text-xl font-black text-[#F4C430]">{metrics.total}</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Submissions</p>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1455D9] flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#071A3D] mt-1">{metrics.total}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Across All Classes</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-xs bg-teal-50/20">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-teal-700 font-bold uppercase">Advisor Approved</p>
            <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-800 mt-1">{metrics.advisorApproved}</p>
          <p className="text-[10px] text-teal-600 mt-0.5 font-medium">Ready for HOD Review</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-amber-700 font-bold uppercase">Awaiting Advisor</p>
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-800 mt-1">{metrics.awaitingAdvisor}</p>
          <p className="text-[10px] text-amber-600 mt-0.5 font-medium">Proofs Uploaded</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-emerald-700 font-bold uppercase">Officially Credited</p>
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-1">{metrics.sanctioned}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">Attendance Updated</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-rose-600 font-bold uppercase">Incomplete Proofs</p>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700 mt-1">{metrics.incomplete}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Missing Geo or Cert</p>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'ALL' ? 'bg-[#071A3D] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Proofs ({metrics.total})
            </button>
            <button
              onClick={() => setActiveTab('ADVISOR_APPROVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'ADVISOR_APPROVED'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-teal-700 hover:bg-teal-50'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              Advisor Approved ({metrics.advisorApproved})
            </button>
            <button
              onClick={() => setActiveTab('AWAITING_ADVISOR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'AWAITING_ADVISOR'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3 h-3" />
              Awaiting Advisor ({metrics.awaitingAdvisor})
            </button>
            <button
              onClick={() => setActiveTab('SANCTIONED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'SANCTIONED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Officially Credited ({metrics.sanctioned})
            </button>
            <button
              onClick={() => setActiveTab('INCOMPLETE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'INCOMPLETE' ? 'bg-gray-800 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Incomplete ({metrics.incomplete})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, reg no, event, advisor..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dropdown Filters Strip */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-gray-100 text-xs">
          <span className="text-gray-400 font-bold flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          <select
            value={yearFilter}
            onChange={(e: any) => setYearFilter(e.target.value)}
            className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 text-xs cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Academic Years</option>
            <option value="2">II Year (2024-2028)</option>
            <option value="3">III Year (2023-2027)</option>
            <option value="4">IV Year (2022-2026)</option>
          </select>

          <select
            value={sectionFilter}
            onChange={(e: any) => setSectionFilter(e.target.value)}
            className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 text-xs cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Sections (A-D)</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>

          {distinctAdvisors.length > 0 && (
            <select
              value={advisorFilter}
              onChange={(e: any) => setAdvisorFilter(e.target.value)}
              className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 text-xs cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Class Advisors</option>
              {distinctAdvisors.map((adv) => (
                <option key={adv} value={adv}>
                  Advisor: {adv}
                </option>
              ))}
            </select>
          )}

          {(yearFilter !== 'ALL' || sectionFilter !== 'ALL' || advisorFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setYearFilter('ALL')
                setSectionFilter('ALL')
                setAdvisorFilter('ALL')
                setSearchQuery('')
              }}
              className="text-xs text-rose-600 font-bold hover:underline cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Proofs Grid */}
      {filteredProofs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProofs.map((p) => {
            const hasGeo = Boolean(p.geoPhotoUrl)
            const hasCert = Boolean(p.certificateUrl)
            const isVerified = p.status === 'verified'
            const isAdvisorApproved = p.status === 'advisor_approved'
            const isUnderReview = p.status === 'under_review' && hasGeo && hasCert
            const isResubmit = p.status === 'resubmit_requested'

            return (
              <Card
                key={p.id}
                className="rounded-3xl border-gray-200 hover:shadow-lg transition-all bg-white overflow-hidden flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Status & Class */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1455D9] font-mono font-bold text-[11px] border border-blue-100">
                      {p.year === 2 ? 'II' : p.year === 3 ? 'III' : 'IV'} AIDS {p.section} · Sem {p.semester}
                    </span>

                    {isVerified ? (
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Officially Credited
                      </span>
                    ) : isAdvisorApproved ? (
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-teal-100 text-teal-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Advisor Approved
                      </span>
                    ) : isUnderReview ? (
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 animate-pulse flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Awaiting Advisor
                      </span>
                    ) : isResubmit ? (
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-rose-100 text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Resubmit Requested
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-gray-100 text-gray-700">
                        Incomplete Upload
                      </span>
                    )}
                  </div>

                  {/* Student Particulars */}
                  <div>
                    <h3 className="font-black text-sm text-[#071A3D]">{p.studentName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] font-mono font-bold text-[#1455D9]">{p.registerNumber}</p>
                      {p.residencyType && (
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[9px] font-bold">
                          {p.residencyType === 'Hosteller' ? 'Hostel' : 'Day Scholar'}
                          {p.busRoute ? ` (Bus ${p.busRoute})` : ''}
                        </span>
                      )}
                    </div>

                    {/* Class Advisor Assignment Tag */}
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                      <User className="w-3 h-3 text-[#1455D9] shrink-0" />
                      <span className="text-gray-500">Class Advisor:</span>
                      <span className="font-bold text-[#071A3D] truncate">{p.assignedAdvisor || 'Prof. Raja'}</span>
                    </div>

                    {/* Event Details */}
                    <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-gray-800 line-clamp-2">{p.eventName}</p>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1455D9] font-bold text-[9px] shrink-0">
                          {p.category}
                        </span>
                      </div>
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
                        hasGeo
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Geo-Tag Photo</span>
                      </div>
                      <p className="text-[10px] mt-0.5 font-medium truncate">
                        {hasGeo ? 'GPS Coordinates Verified' : 'Missing Photo'}
                      </p>
                    </div>

                    <div
                      className={`p-2 rounded-xl text-center border text-[11px] ${
                        hasCert
                          ? 'bg-purple-50 border-purple-200 text-purple-800'
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 font-bold">
                        <Award className="w-3.5 h-3.5" />
                        <span>Certificate</span>
                      </div>
                      <p className="text-[10px] mt-0.5 font-medium truncate">
                        {hasCert ? p.achievement || 'Submitted' : 'Missing Document'}
                      </p>
                    </div>
                  </div>

                  {/* Advisor Approval Endorsement Strip */}
                  {isAdvisorApproved || isVerified ? (
                    <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-teal-800 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                          Advisor Approved:
                        </span>
                        <span className="text-[10px] text-teal-700 font-medium">
                          {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString('en-IN') : 'Active'}
                        </span>
                      </div>
                      <p className="font-bold text-gray-800">
                        {p.verifiedByName || p.assignedAdvisor || 'Class Advisor'}
                      </p>
                      {p.advisorRemarks && (
                        <p className="text-gray-600 text-[10px] italic line-clamp-2">
                          &ldquo;{p.advisorRemarks}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : isUnderReview ? (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] space-y-0.5">
                      <p className="text-amber-800 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Awaiting Class Advisor Approval
                      </p>
                      <p className="text-gray-600 text-[10px]">
                        Assigned to: <span className="font-bold text-gray-800">{p.assignedAdvisor || 'Class Advisor'}</span>
                      </p>
                    </div>
                  ) : isResubmit ? (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] space-y-0.5">
                      <p className="text-rose-800 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Clarification Requested
                      </p>
                      {p.advisorRemarks && (
                        <p className="text-rose-700 text-[10px] italic line-clamp-1">&ldquo;{p.advisorRemarks}&rdquo;</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500">
                      <span>Waiting for student to upload live geo-tag and completion certificate.</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => openInspectModal(p)}
                    className="w-full py-2.5 rounded-xl bg-[#1455D9] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Full Dossier &amp; HOD Oversight</span>
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
            {searchQuery || activeTab !== 'ALL' || yearFilter !== 'ALL' || sectionFilter !== 'ALL' || advisorFilter !== 'ALL'
              ? 'No student proof submissions match your active filter criteria.'
              : 'Students will upload live venue geo-tags and event certificates here when participating in external symposiums and hackathons.'}
          </p>
        </div>
      )}

      {/* FULL INSPECTION & OVERSIGHT MODAL (SHOWING ALL DETAILS) */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-[#F4C430]" />
                </div>
                <div>
                  <h3 className="font-black text-base">HOD Executive OD Dossier &amp; Monitoring</h3>
                  <p className="text-[11px] text-blue-200">
                    {selectedProof.studentName} ({selectedProof.registerNumber}) · {selectedProof.year} AIDS {selectedProof.section} · Sem {selectedProof.semester}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs" style={{ scrollbarWidth: 'thin' }}>
              {/* 1. Student Particulars Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-black text-xs text-[#071A3D] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1455D9]" />
                    Student &amp; Cohort Particulars
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#1455D9] font-bold text-[10px]">
                    Year {selectedProof.year} · Sec {selectedProof.section}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Student Name</p>
                    <p className="font-black text-gray-900 mt-0.5">{selectedProof.studentName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Register Number</p>
                    <p className="font-mono font-bold text-[#1455D9] mt-0.5">{selectedProof.registerNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Assigned Class Advisor</p>
                    <p className="font-bold text-gray-800 mt-0.5">{selectedProof.assignedAdvisor || 'Prof. Raja'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Residency / Transit</p>
                    <p className="font-medium text-gray-700 mt-0.5">
                      {selectedProof.residencyType || 'Day Scholar'}
                      {selectedProof.busRoute ? ` (Bus ${selectedProof.busRoute})` : ''}
                      {selectedProof.hostelRoom ? ` (Room ${selectedProof.hostelRoom})` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Parent Contact</p>
                    {selectedProof.parentPhone ? (
                      <a
                        href={`tel:${selectedProof.parentPhone}`}
                        className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{selectedProof.parentPhone}</span>
                      </a>
                    ) : (
                      <p className="text-gray-400 mt-0.5 font-medium">On Record</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Student Phone</p>
                    {selectedProof.studentPhone ? (
                      <a
                        href={`tel:${selectedProof.studentPhone}`}
                        className="font-bold text-blue-700 mt-0.5 flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{selectedProof.studentPhone}</span>
                      </a>
                    ) : (
                      <p className="text-gray-400 mt-0.5 font-medium">Available in Portal</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Event Particulars Card */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#1455D9] font-bold text-[10px]">
                      {selectedProof.category}
                    </span>
                    <h4 className="text-sm font-black text-[#071A3D] mt-1">{selectedProof.eventName}</h4>
                    <p className="text-gray-600 mt-0.5">
                      Host Venue: <span className="font-bold text-gray-800">{selectedProof.venueCollege || 'Host Institution'}</span> · Date: {selectedProof.eventDate}
                    </p>
                  </div>
                  {selectedProof.achievement && (
                    <span className="px-3 py-1 bg-[#F4C430] text-[#071A3D] font-black rounded-xl text-xs shrink-0 shadow-xs flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {selectedProof.achievement}
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Proof 1: Venue Geo-Tag Photo & GPS Telemetry */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-[#071A3D] flex items-center gap-1.5 text-xs">
                    <MapPin className="w-4 h-4 text-[#1455D9]" />
                    <span>Proof 1: Live Event Venue Geo-Tag Photo &amp; GPS Telemetry</span>
                  </h5>
                  {selectedProof.geoTimestamp && (
                    <span className="text-[10px] text-gray-400 font-mono">
                      Timestamp: {new Date(selectedProof.geoTimestamp).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {selectedProof.geoPhotoUrl ? (
                  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-3 space-y-3">
                    <div
                      onClick={() =>
                        setPreviewMedia({
                          url: selectedProof.geoPhotoUrl!,
                          title: `${selectedProof.studentName} — Venue Geo-Tag Photo`,
                          category: 'Venue Geo-Tag Photo',
                        })
                      }
                      className="relative h-48 sm:h-60 w-full rounded-xl overflow-hidden bg-black/5 cursor-pointer group"
                    >
                      <img
                        src={selectedProof.geoPhotoUrl}
                        alt="Venue Geo-Tag"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-xs">
                        <Eye className="w-4 h-4" /> Click to Inspect Full Size
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {selectedProof.geoAddress && (
                        <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Geocoded Venue Address</p>
                          <p className="font-medium mt-0.5 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{selectedProof.geoAddress}</span>
                          </p>
                        </div>
                      )}

                      {selectedProof.latitude && selectedProof.longitude && (
                        <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">GPS Satellite Coordinates</p>
                            <p className="font-mono font-bold text-[#1455D9] mt-0.5">
                              {selectedProof.latitude.toFixed(4)}° N, {selectedProof.longitude.toFixed(4)}° E
                            </p>
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${selectedProof.latitude},${selectedProof.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-xs text-[#1455D9] font-bold flex items-center gap-1 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> View Satellite Location on Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                    <p className="font-bold text-gray-600">Geo-tag photo not uploaded yet</p>
                    <p className="text-[11px] text-gray-400">Student must snap on-site at the event venue.</p>
                  </div>
                )}
              </div>

              {/* 4. Proof 2: Completion Certificate / Award Letter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-[#071A3D] flex items-center gap-1.5 text-xs">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Proof 2: Event Certificate / Award Letter</span>
                  </h5>
                  {selectedProof.achievement && (
                    <span className="text-[10px] text-purple-700 font-bold">
                      Distinction: {selectedProof.achievement}
                    </span>
                  )}
                </div>

                {selectedProof.certificateUrl ? (
                  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-xs">
                            {selectedProof.certificateName || 'Event_Certificate.pdf'}
                          </p>
                          <p className="text-[10px] text-gray-500">Official certificate document submitted by student</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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
                          <span>Inspect Document</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                    <p className="font-bold text-gray-600">Event Certificate not submitted yet</p>
                  </div>
                )}
              </div>

              {/* 5. Institutional Approval & Endorsement Audit Trail */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h5 className="font-black text-xs text-[#071A3D] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1455D9]" />
                  Institutional Approval &amp; Verification Chain
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Advisor Stage */}
                  <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Class Advisor Endorsement</p>
                    {selectedProof.status === 'advisor_approved' || selectedProof.status === 'verified' ? (
                      <div>
                        <p className="font-bold text-teal-800 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                          Approved by {selectedProof.verifiedByName || selectedProof.assignedAdvisor || 'Class Advisor'}
                        </p>
                        {selectedProof.verifiedAt && (
                          <p className="text-[10px] text-gray-400 font-mono">
                            On {new Date(selectedProof.verifiedAt).toLocaleString('en-IN')}
                          </p>
                        )}
                        {selectedProof.advisorRemarks && (
                          <p className="text-gray-600 text-[11px] mt-1 italic">&ldquo;{selectedProof.advisorRemarks}&rdquo;</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-amber-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Awaiting Class Advisor Endorsement
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Assigned: <span className="font-bold text-gray-800">{selectedProof.assignedAdvisor || 'Prof. Raja'}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* HOD Stage */}
                  <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">HOD Executive Sanction</p>
                    {selectedProof.status === 'verified' ? (
                      <div>
                        <p className="font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Officially Sanctioned &amp; Credited
                        </p>
                        <p className="text-[10px] text-emerald-700">Attendance credit officially recorded.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-blue-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#1455D9]" />
                          Ready for HOD Final Sanction
                        </p>
                        <p className="text-[10px] text-gray-500">HOD can review advisor endorsement and finalize.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 6. HOD Endorsement Remarks Input */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  HOD Executive Sanction Endorsement Remarks
                </label>
                <textarea
                  rows={2}
                  value={hodRemarks}
                  onChange={(e) => setHodRemarks(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter executive endorsement notes or specific clarification reason..."
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedProof(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
                >
                  Close Dossier
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRejectOD}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  Request Clarification
                </button>

                <button
                  type="button"
                  disabled={loading || !selectedProof.geoPhotoUrl || !selectedProof.certificateUrl}
                  onClick={handleApproveOD}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {loading
                      ? 'Processing...'
                      : selectedProof.status === 'verified'
                      ? 'Update HOD Sanction & Credit'
                      : 'HOD Executive Sanction & Credit Attendance'}
                  </span>
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
