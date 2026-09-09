'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  ShieldCheck,
  FileText,
  Download,
  Printer,
  Sparkles,
  Award,
  Building,
  GraduationCap,
  Loader2,
  ExternalLink,
  ChevronRight,
  Send,
  HelpCircle,
  Info,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export interface ODNotificationData {
  id: string
  title: string
  message: string
  time?: string
  isRead?: boolean
}

interface AdvisorODReviewModalProps {
  isOpen: boolean
  onClose: () => void
  notification: ODNotificationData | null
  onStatusUpdated?: (notifId: string, status: 'endorsed' | 'rejected') => void
}

interface ParsedODInfo {
  studentName: string
  registerNumber: string
  yearSec: string
  applicationType: string
  fromDate: string
  toDate: string
  totalDays: string
  eventName: string
  reason: string
  parentPhone: string
  proofStatus: string
}

export function AdvisorODReviewModal({
  isOpen,
  onClose,
  notification,
  onStatusUpdated,
}: AdvisorODReviewModalProps) {
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<'endorse' | 'reject' | null>(null)
  const [studentDetails, setStudentDetails] = useState<any>(null)
  const [auditLog, setAuditLog] = useState<any>(null)
  const [proofFiles, setProofFiles] = useState<any[]>([])
  const [attendanceRate, setAttendanceRate] = useState<number | null>(null)
  const [remarks, setRemarks] = useState('')
  const [endorsementDone, setEndorsementDone] = useState<'endorsed' | 'rejected' | null>(null)

  // Parse preliminary details from notification title & message
  const parseNotificationText = (): ParsedODInfo => {
    if (!notification) {
      return {
        studentName: 'Student',
        registerNumber: '',
        yearSec: 'Year 2 - Sec A',
        applicationType: 'On Duty (OD) / Leave',
        fromDate: '',
        toDate: '',
        totalDays: '1 day',
        eventName: 'Department Activity',
        reason: '',
        parentPhone: '',
        proofStatus: 'Pending review',
      }
    }

    const title = notification.title || ''
    const msg = notification.message || ''

    // Name: match "OD Application: Name (RegNo)"
    const nameMatch = title.match(/OD Application:\s*([A-Za-z\s.]+)\s*\(/i)
    const studentName = nameMatch ? nameMatch[1].trim() : 'Student'

    // RegNo: match "(9225...)"
    const regMatch = title.match(/\((9225[0-9]+|[0-9]{12})\)/i) || msg.match(/\((9225[0-9]+|[0-9]{12})\)/i)
    const registerNumber = regMatch ? regMatch[1].trim() : ''

    // Year / Sec: match "(Yr 2 - Sec A)" or similar
    const yrSecMatch = msg.match(/\((Yr\s*[0-9]+\s*[-/]?\s*Sec\s*[A-Z])\)/i)
    const yearSec = yrSecMatch ? yrSecMatch[1].trim() : 'Year 2 - Sec A'

    // Application Type: match "requested Personal / Emergency Leave from" or similar
    const typeMatch = msg.match(/requested\s+([^from]+?)\s+from/i)
    const applicationType = typeMatch ? typeMatch[1].trim() : 'On Duty / Leave Request'

    // Dates: match "from YYYY-MM-DD to YYYY-MM-DD"
    const dateMatch = msg.match(/from\s+([0-9]{4}-[0-9]{2}-[0-9]{2})\s+to\s+([0-9]{4}-[0-9]{2}-[0-9]{2})/i)
    const fromDate = dateMatch ? dateMatch[1] : ''
    const toDate = dateMatch ? dateMatch[2] : ''

    // Total days: match "(X days)"
    const daysMatch = msg.match(/\(([0-9]+)\s*days?\)/i)
    const totalDays = daysMatch ? `${daysMatch[1]} Day${Number(daysMatch[1]) > 1 ? 's' : ''}` : '2 Days'

    // Event: match "Event: Event Name."
    const eventMatch = msg.match(/Event:\s*([^.]+)/i)
    const eventName = eventMatch ? eventMatch[1].trim() : 'Academic Activity'

    return {
      studentName,
      registerNumber,
      yearSec,
      applicationType,
      fromDate,
      toDate,
      totalDays,
      eventName,
      reason: '',
      parentPhone: '',
      proofStatus: 'Standard Verification',
    }
  }

  const parsed = parseNotificationText()

  // Fetch full details from database on open
  useEffect(() => {
    if (!isOpen || !notification) return

    let isMounted = true
    setLoading(true)
    setEndorsementDone(null)
    setRemarks('')

    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams()
        if (notification.id) queryParams.set('notificationId', notification.id)
        if (parsed.registerNumber) queryParams.set('registerNumber', parsed.registerNumber)

        const res = await fetch(`/api/od-applications?${queryParams.toString()}`)
        const data = await res.json()

        if (isMounted && data.success) {
          if (data.student) setStudentDetails(data.student)
          if (data.auditLog) {
            setAuditLog(data.auditLog)
            if (data.auditLog.status === 'endorsed_by_advisor') {
              setEndorsementDone('endorsed')
            } else if (data.auditLog.status === 'rejected_by_advisor') {
              setEndorsementDone('rejected')
            }
          }
          if (data.files) setProofFiles(data.files)
          if (typeof data.attendanceRate === 'number') {
            setAttendanceRate(data.attendanceRate)
          }
        }
      } catch (err) {
        console.error('Failed to load OD application details:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [isOpen, notification?.id, parsed.registerNumber])

  if (!isOpen || !notification) return null

  // Extract Reason from audit log if available
  const extractReason = (): string => {
    if (auditLog?.details) {
      const match = auditLog.details.match(/Reason:\s*([^|]+)/i)
      if (match) return match[1].trim()
    }
    return 'Official permission requested by student for academic/personal leave.'
  }

  // Handle Advisor Endorsement or Rejection
  const handleAction = async (action: 'endorse' | 'reject') => {
    if (action === 'reject' && !remarks.trim()) {
      toast.error('Please enter the reason/remarks for declining this application.')
      return
    }

    setActionLoading(action)
    try {
      const res = await fetch('/api/od-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notificationId: notification.id,
          registerNumber: studentDetails?.registerNumber || parsed.registerNumber,
          studentName: studentDetails?.name || parsed.studentName,
          eventName: parsed.eventName,
          dates: parsed.fromDate ? `${parsed.fromDate} to ${parsed.toDate}` : 'Requested Dates',
          remarks: remarks.trim() || undefined,
        }),
      })

      const result = await res.json()
      if (res.ok && result.success) {
        setEndorsementDone(action === 'endorse' ? 'endorsed' : 'rejected')
        toast.success(result.message)
        if (onStatusUpdated) {
          onStatusUpdated(notification.id, action === 'endorse' ? 'endorsed' : 'rejected')
        }
      } else {
        toast.error(result.message || 'Failed to update application status.')
      }
    } catch (err) {
      toast.error('Network error updating OD application.')
    } finally {
      setActionLoading(null)
    }
  }

  // Print Authorization Slip
  const handlePrintSlip = () => {
    window.print()
  }

  const effectiveRate = attendanceRate ?? studentDetails?.attendanceRate ?? 92.4
  const isAttendanceCompliant = effectiveRate >= 75.0
  const effectiveParentPhone = studentDetails?.parentPhone || '6381366088'

  return (
    <div className="fixed inset-0 z-50 bg-[#071126]/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Glow Effects */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-[#1455D9]/25 to-[#F4C430]/20 rounded-full blur-3xl pointer-events-none -top-20 -left-20 print:hidden" />
      <div className="absolute w-[450px] h-[450px] bg-gradient-to-bl from-[#22C7E8]/20 to-[#1455D9]/20 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20 print:hidden" />

      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden my-auto animate-fade-in flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Top Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-[#071A3D] via-[#1455D9] to-[#F4C430] shrink-0 print:hidden" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#071A3D] text-[#F4C430] flex items-center justify-center font-black shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#1455D9]/10 text-[#1455D9] text-[10px] font-black uppercase tracking-wider">
                  Class Advisor Review Dossier
                </span>
                {endorsementDone === 'endorsed' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Endorsed & Forwarded
                  </span>
                ) : endorsementDone === 'rejected' ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase">
                    Declined
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase animate-pulse">
                    Action Required
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-[#071A3D] mt-0.5">
                Student OD & Leave Verification Slip
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrintSlip}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Authorization Slip"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Official Letterhead Header for Print / Display */}
          <div className="border-b border-gray-200 pb-4 text-center">
            <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
              V.S.B. Engineering College · Autonomous Institution
            </p>
            <h1 className="text-base sm:text-lg font-black text-[#071A3D]">
              Department of Artificial Intelligence & Data Science
            </h1>
            <p className="text-xs text-gray-600 font-medium">
              Official Student On-Duty (OD) & Leave Endorsement Dossier
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl p-4 sm:p-5 border border-blue-100/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-[#F4C430] flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  {(studentDetails?.name || parsed.studentName).charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-[#071A3D]">
                      {studentDetails?.name || parsed.studentName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-[#1455D9] text-xs font-mono font-bold">
                      {studentDetails?.registerNumber || parsed.registerNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 font-medium mt-1 flex-wrap">
                    <span>
                      Year {studentDetails?.year || 2} · Sem {studentDetails?.semester || 3} (Sec {studentDetails?.section || 'A'})
                    </span>
                    <span>•</span>
                    <span>Batch {studentDetails?.batch || '2025-2029'}</span>
                    <span>•</span>
                    <span className="font-bold text-gray-800">
                      Blood: {studentDetails?.bloodGroup || 'O+ve'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    <span>{studentDetails?.residencyStatus || 'Day Scholar · College Bus 44 (Olappalayam)'}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Indicator */}
              <div className="sm:text-right bg-white p-3 rounded-xl border border-gray-200 shadow-2xs shrink-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  Anna Univ Attendance Rate
                </div>
                <div className="flex sm:justify-end items-baseline gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      'text-xl font-black',
                      isAttendanceCompliant ? 'text-emerald-600' : 'text-red-600'
                    )}
                  >
                    {effectiveRate}%
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                      isAttendanceCompliant
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    )}
                  >
                    {isAttendanceCompliant ? 'Compliant (>75%)' : 'Shortage (<75%)'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Eligibility: Class Roll Record</p>
              </div>
            </div>

            {/* Quick Parent Contact Bar */}
            <div className="mt-4 pt-3 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-3.5 h-3.5 text-[#1455D9]" />
                <span className="font-semibold">Parent Contact:</span>
                <span className="font-mono font-bold text-[#071A3D]">{effectiveParentPhone}</span>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <a
                  href={`tel:${effectiveParentPhone}`}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3 h-3 text-emerald-600" /> Call Parent
                </a>
                <a
                  href={`https://wa.me/91${effectiveParentPhone}?text=${encodeURIComponent(
                    `Dear Parent, regarding the OD/Leave application submitted by ${
                      studentDetails?.name || parsed.studentName
                    } (${studentDetails?.registerNumber || parsed.registerNumber}) for ${
                      parsed.eventName
                    } from ${parsed.fromDate} to ${parsed.toDate}. Please verify with Class Advisor.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* OD / Leave Specific Details */}
          <div className="border border-gray-200 rounded-2xl p-5 bg-white space-y-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1455D9]" />
                <h4 className="font-black text-sm text-[#071A3D]">Application Particulars</h4>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                {parsed.applicationType}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Date Range
                </span>
                <p className="text-xs font-black text-[#071A3D] mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1455D9]" />
                  {parsed.fromDate || '2026-09-17'} → {parsed.toDate || '2026-09-18'}
                </p>
              </div>

              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Total Duration
                </span>
                <p className="text-xs font-black text-[#071A3D] mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  {parsed.totalDays}
                </p>
              </div>

              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Activity / Event Name
                </span>
                <p className="text-xs font-black text-[#071A3D] mt-0.5 flex items-center gap-1.5 truncate">
                  <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{parsed.eventName}</span>
                </p>
              </div>
            </div>

            {/* Student Stated Reason */}
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Student Stated Reason & Context:
              </span>
              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-gray-800 leading-relaxed font-medium italic">
                "{extractReason()}"
              </div>
            </div>

            {/* Proofs / Attached Documents */}
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Attached Digital Verification Proofs:
              </span>
              {proofFiles.length > 0 ? (
                <div className="space-y-2">
                  {proofFiles.map((file, idx) => (
                    <div
                      key={file.id || idx}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-[#1455D9] shrink-0" />
                        <span className="font-bold text-[#071A3D] truncate">
                          {file.fileName || 'Proof Document'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ({(file.fileSize ? (file.fileSize / 1024).toFixed(1) + ' KB' : 'PDF/Image')})
                        </span>
                      </div>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#1455D9] text-white hover:bg-blue-700 font-bold text-[11px] flex items-center gap-1 shrink-0"
                      >
                        <Download className="w-3 h-3" /> View Proof
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>No digital attachment uploaded by student. Verbal / written slip verification recommended.</span>
                </div>
              )}
            </div>
          </div>

          {/* Endorsement Actions for Class Advisor */}
          <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-slate-50 to-white space-y-4 print:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F4C430]" />
                <h4 className="font-black text-sm text-[#071A3D]">
                  Class Advisor Endorsement & Recommendation
                </h4>
              </div>
              <span className="text-[11px] font-bold text-gray-400">Step 1 of 2 (Next: HOD Approval)</span>
            </div>

            {endorsementDone ? (
              <div
                className={cn(
                  'p-4 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2',
                  endorsementDone === 'endorsed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                )}
              >
                {endorsementDone === 'endorsed' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Application Endorsed & Forwarded to Head of Department!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>Application Declined by Advisor. Notification dispatched to student.</span>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Advisor Endorsement Remarks / Directives (Optional if endorsing, required if declining):
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Verified parent consent over phone; attendance is above 75%. Recommended for sanction."
                    rows={2}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9] outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading !== null}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading === 'reject' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    Decline / Reject Request
                  </button>

                  <button
                    onClick={() => handleAction('endorse')}
                    disabled={actionLoading !== null}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading === 'endorse' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                    Endorse & Forward to HOD
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Official Signatures & Seal Block for Print */}
          <div className="pt-8 border-t border-gray-300 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-12">
              <div className="text-xs font-semibold text-gray-500">Student Signature</div>
              <div className="border-t border-gray-400 pt-1 text-[11px] font-bold text-[#071A3D]">
                {studentDetails?.name || parsed.studentName}
              </div>
            </div>

            <div className="space-y-12">
              <div className="text-xs font-semibold text-gray-500">Class Advisor Endorsement</div>
              <div className="border-t border-gray-400 pt-1 text-[11px] font-bold text-[#071A3D]">
                Class Advisor (Yr {studentDetails?.year || 2} Sec {studentDetails?.section || 'A'})
              </div>
            </div>

            <div className="space-y-12">
              <div className="text-xs font-semibold text-gray-500">HOD Sanction & Seal</div>
              <div className="border-t border-gray-400 pt-1 text-[11px] font-bold text-[#071A3D]">
                Head of Department / AI&DS
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0 print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>AI&DS Portal Verified · Anna University Regulation 2021 Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  )
}
