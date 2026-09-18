'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Award,
  AlertCircle,
  FileCheck,
  Calendar,
  UserCheck,
  ArrowRight,
  Eye,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'

export interface ODProofItem {
  id: string
  studentName: string
  registerNumber: string
  year: number
  section: string
  semester: number
  eventName: string
  category: string
  eventDate: string
  venueCollege?: string | null
  geoPhotoUrl?: string | null
  geoAddress?: string | null
  certificateUrl?: string | null
  achievement?: string | null
  status: string // 'pending_proofs' | 'under_review' | 'advisor_approved' | 'verified' | 'resubmit_requested'
  advisorRemarks?: string | null
  verifiedByName?: string | null
  verifiedAt?: string | null
  attendanceCredited?: boolean
  createdAt: string
}

export function HODAdvisorODApprovalsMonitor() {
  const [proofs, setProofs] = useState<ODProofItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [selectedProof, setSelectedProof] = useState<ODProofItem | null>(null)

  const fetchProofs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/od-proofs', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && Array.isArray(data.proofs)) {
        setProofs(data.proofs)
      }
    } catch (err) {
      console.error('Error fetching OD proofs for HOD monitor:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProofs()
  }, [])

  const handleHODApprove = async (proof: ODProofItem) => {
    try {
      setActionLoadingId(proof.id)
      const res = await fetch('/api/od-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'HOD_APPROVE',
          proofId: proof.id,
          remarks: 'Officially sanctioned and attendance credited by Head of Department',
        }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(`Sanction granted for ${proof.studentName}! Attendance credited.`)
        // Update local state
        setProofs((prev) =>
          prev.map((p) =>
            p.id === proof.id
              ? {
                  ...p,
                  status: 'verified',
                  attendanceCredited: true,
                  verifiedByName: json.proof?.verifiedByName || `${p.verifiedByName || 'Advisor'} & HOD Sanctioned`,
                }
              : p
          )
        )
      } else {
        throw new Error(json.error || json.message || 'Failed to sanction proof')
      }
    } catch (err: any) {
      console.error('Error approving OD proof:', err)
      toast.error(err.message || 'Error granting HOD sanction')
    } finally {
      setActionLoadingId(null)
    }
  }

  const advisorApprovedCount = proofs.filter((p) => p.status === 'advisor_approved').length
  const pendingAdvisorCount = proofs.filter(
    (p) => p.status === 'under_review' || p.status === 'pending_proofs'
  ).length
  const verifiedCount = proofs.filter((p) => p.status === 'verified').length

  // Prioritize showing items awaiting HOD action, then recent items
  const displayProofs = proofs
    .slice()
    .sort((a, b) => {
      if (a.status === 'advisor_approved' && b.status !== 'advisor_approved') return -1
      if (b.status === 'advisor_approved' && a.status !== 'advisor_approved') return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .slice(0, 5)

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_25px_-4px_rgba(7,26,61,0.06)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-[#071A3D]">
              Advisor OD Verification &amp; Student Proofs Monitoring
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              Institutional Governance
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Monitor Class Advisor endorsements, verify venue GPS telemetry &amp; grant HOD executive sanctions for attendance credit.
          </p>
        </div>

        <Link
          href="/hod-dashboard/od-proofs"
          className="px-4 py-2 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs"
        >
          <span>Open Full OD Proofs Desk</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metric Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
              Awaiting HOD Sanction
            </span>
            <span className="text-2xl font-black text-amber-950 mt-0.5 block">
              {advisorApprovedCount}
            </span>
            <span className="text-[11px] text-amber-800">Advisor approved &amp; ready</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
              With Class Advisors
            </span>
            <span className="text-2xl font-black text-[#1455D9] mt-0.5 block">
              {pendingAdvisorCount}
            </span>
            <span className="text-[11px] text-blue-700">Under advisor verification</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1455D9] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
              Sanctioned &amp; Credited
            </span>
            <span className="text-2xl font-black text-emerald-950 mt-0.5 block">
              {verifiedCount}
            </span>
            <span className="text-[11px] text-emerald-800">Attendance granted</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Proofs Monitor Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#1455D9]" />
          <span>Synchronizing advisor endorsements...</span>
        </div>
      ) : displayProofs.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
          <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-bold text-[#071A3D]">No OD Submissions Currently Active</p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            When students submit event certificates and venue GPS proof, Class Advisors will verify attendance first before forwarding to HOD queue for final approval.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Student Particulars</th>
                <th className="py-3 px-3">Event &amp; Venue</th>
                <th className="py-3 px-3">Proof Attachments</th>
                <th className="py-3 px-3">Advisor Recommendation</th>
                <th className="py-3 px-3 text-right">HOD Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayProofs.map((proof) => {
                const isAdvisorApproved = proof.status === 'advisor_approved'
                const isVerified = proof.status === 'verified'
                const isPendingAdvisor =
                  proof.status === 'under_review' || proof.status === 'pending_proofs'

                return (
                  <tr
                    key={proof.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isAdvisorApproved ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Student particulars */}
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-bold text-[#071A3D]">{proof.studentName}</p>
                        <p className="text-[11px] font-mono text-slate-500">{proof.registerNumber}</p>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                          Year {proof.year} · Sec {proof.section}
                        </span>
                      </div>
                    </td>

                    {/* Event particulars */}
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-bold text-[#071A3D]">{proof.eventName}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {proof.venueCollege || 'Inter-Collegiate Venue'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {proof.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {proof.eventDate}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Proof Attachments */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              proof.geoPhotoUrl ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span className={proof.geoPhotoUrl ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                            {proof.geoPhotoUrl ? 'GPS Photo Validated' : 'No Venue Photo'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              proof.certificateUrl ? 'bg-blue-500' : 'bg-slate-300'
                            }`}
                          />
                          <span className={proof.certificateUrl ? 'text-blue-700 font-semibold' : 'text-slate-400'}>
                            {proof.certificateUrl ? 'Certificate Attached' : 'No Certificate'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Advisor Status */}
                    <td className="py-3.5 px-3">
                      <div>
                        {isAdvisorApproved ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1 w-fit">
                              <UserCheck className="w-3 h-3 text-amber-700" />
                              <span>Advisor Approved</span>
                            </span>
                            <p className="text-[11px] text-slate-600 font-medium">
                              By: {proof.verifiedByName || 'Class Advisor'}
                            </p>
                            {proof.advisorRemarks && (
                              <p className="text-[10px] text-slate-500 italic max-w-[220px] line-clamp-1">
                                "{proof.advisorRemarks}"
                              </p>
                            )}
                          </div>
                        ) : isVerified ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>HOD Sanctioned</span>
                          </span>
                        ) : isPendingAdvisor ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Awaiting Advisor Review</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {proof.status}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* HOD Action */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdvisorApproved && (
                          <button
                            onClick={() => handleHODApprove(proof)}
                            disabled={actionLoadingId === proof.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === proof.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Grant Sanction</span>
                          </button>
                        )}

                        <Link
                          href="/hod-dashboard/od-proofs"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-xl transition flex items-center gap-1"
                          title="Open in OD Proofs Desk"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inspect</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
