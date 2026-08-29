'use client'

import React, { useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, Send, FileEdit, X } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface StudentOnboardingModalProps {
  isOpen: boolean
  onComplete: (updatedUser: any) => void
  initialData: {
    name: string
    email: string
    phone?: string
    registerNumber: string
    department: string
    year: number
    semester: number
    section: string
    dateOfBirth?: string
    advisorName?: string
    batch?: string
    parentPhone?: string
  }
}

export function StudentOnboardingModal({
  isOpen,
  onComplete,
  initialData,
}: StudentOnboardingModalProps) {
  const [showCorrection, setShowCorrection] = useState(false)
  const [loading, setLoading] = useState(false)
  const [correctionCategory, setCorrectionCategory] = useState('name')
  const [requestedValue, setRequestedValue] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false)

  if (!isOpen) return null

  // Fast Confirmation: Accept Details & Enter Dashboard
  const handleConfirmAndEnter = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: initialData.name,
          skipEmailVerification: true,
        }),
      })
      const data = await res.json()
      toast.success('Details confirmed! Entering portal...')
      setTimeout(() => onComplete(res.ok && data.success ? data.user || {} : {}), 500)
    } catch {
      toast.success('Details confirmed! Entering portal...')
      setTimeout(() => onComplete({}), 500)
    } finally {
      setLoading(false)
    }
  }

  // Submit Official Correction Request to Admin
  const handleSendCorrectionRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedValue.trim()) {
      toast.error('Please enter the requested corrected value.')
      return
    }
    if (!correctionReason.trim()) {
      toast.error('Please provide a reason or note for the administrator.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/students/profile-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerNumber: initialData.registerNumber,
          studentName: initialData.name,
          requestedData: {
            [correctionCategory]: requestedValue.trim(),
          },
          currentData: {
            name: initialData.name,
            department: initialData.department,
            year: initialData.year,
            semester: initialData.semester,
            section: initialData.section,
            phone: initialData.phone,
            parentPhone: initialData.parentPhone,
          },
          reason: `Requested ${correctionCategory.toUpperCase()} correction: ${correctionReason.trim()}`,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setCorrectionSubmitted(true)
        toast.success('Correction request submitted to Admin!')
      } else {
        toast.error(data.message || 'Failed to submit correction request.')
      }
    } catch {
      toast.error('Network error submitting request.')
    } finally {
      setLoading(false)
    }
  }

  const cleanEmail =
    initialData.email && !initialData.email.endsWith('@student.vsb.edu.in')
      ? initialData.email
      : null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
        {/* Top Header Accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#E7B93E]" />

        {!showCorrection ? (
          /* READ-ONLY VIEW OF ADMIN-ENTERED PROFILE */
          <div className="p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1455D9] text-[11px] font-extrabold uppercase tracking-wider mb-1 border border-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1455D9]" />
                  <span>Official Academic Records</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Student Profile Verification</h2>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Review the official information entered by the department administrator.
                </p>
              </div>
            </div>

            {/* Read-Only Details Card */}
            <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden bg-gray-50/50 shadow-xs">
              <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/40">
                <span className="text-xs font-semibold text-gray-500">Register Number</span>
                <span className="font-mono font-black text-[#1455D9] text-sm tracking-wide">
                  {initialData.registerNumber}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs font-semibold text-gray-500">Student Name</span>
                <span className="font-black text-gray-900 text-sm">
                  {initialData.name || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs font-semibold text-gray-500">Department</span>
                <span className="font-bold text-gray-800 text-xs text-right max-w-[65%]">
                  {initialData.department}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/40">
                <span className="text-xs font-semibold text-gray-500">Year / Semester / Section</span>
                <span className="font-bold text-[#1455D9] text-xs">
                  Year {initialData.year} &middot; Sem {initialData.semester} &middot; Sec {initialData.section}
                </span>
              </div>

              {initialData.advisorName && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-gray-500">Class Advisor</span>
                  <span className="font-bold text-gray-800 text-xs">
                    {initialData.advisorName}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs font-semibold text-gray-500">Personal Phone</span>
                <span className="font-mono font-bold text-gray-800 text-xs">
                  {initialData.phone ? `📱 ${initialData.phone}` : <span className="text-gray-400 font-normal italic">Not specified</span>}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/40">
                <span className="text-xs font-semibold text-gray-500">Parent / Guardian Contact</span>
                <span className="font-mono font-bold text-gray-800 text-xs">
                  {initialData.parentPhone ? `👨‍👩‍👧 ${initialData.parentPhone}` : <span className="text-gray-400 font-normal italic">Not specified</span>}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs font-semibold text-gray-500">Email Address</span>
                <span className="font-medium text-gray-800 text-xs truncate max-w-[60%]">
                  {cleanEmail ? (
                    <span className="text-[#1455D9] font-bold">{cleanEmail}</span>
                  ) : (
                    <span className="text-amber-600 font-semibold italic text-[11px]">Email not registered yet</span>
                  )}
                </span>
              </div>

              {initialData.dateOfBirth && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-gray-500">Date of Birth</span>
                  <span className="font-mono font-bold text-gray-800 text-xs">
                    {initialData.dateOfBirth}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleConfirmAndEnter}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#1455D9] hover:bg-[#1044b5] active:scale-[0.99] disabled:opacity-60 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#F4C430]" />
                )}
                <span>All Details Verified · Enter Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCorrection(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1455D9] transition-colors py-1 cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 text-[#1455D9]" />
                <span>Found an error? Request Correction from Admin</span>
              </button>
            </div>
          </div>
        ) : (
          /* CORRECTION REQUEST TO ADMIN MODAL */
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Request Profile Correction</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Send an official edit request to the department administrator.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCorrection(false)
                  setCorrectionSubmitted(false)
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {correctionSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-gray-900 text-base">Correction Request Sent!</p>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Your request has been forwarded to the department administrator for verification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmAndEnter}
                  className="px-6 py-2.5 bg-[#1455D9] hover:bg-[#1044b5] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Proceed to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendCorrectionRequest} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Select Field to Correct
                  </label>
                  <select
                    value={correctionCategory}
                    onChange={(e) => setCorrectionCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1455D9] bg-white"
                  >
                    <option value="name">Full Name</option>
                    <option value="phone">Personal Mobile Number</option>
                    <option value="parentPhone">Parent / Guardian Mobile Number</option>
                    <option value="email">Personal Email Address</option>
                    <option value="dateOfBirth">Date of Birth</option>
                    <option value="section">Section / Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Corrected Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={requestedValue}
                    onChange={(e) => setRequestedValue(e.target.value)}
                    placeholder="Enter the correct value"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#1455D9] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Reason / Note for Admin <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Please mention why this needs to be updated..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#1455D9] bg-white resize-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCorrection(false)}
                    className="w-1/3 px-3 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1455D9] hover:bg-[#1044b5] disabled:opacity-60 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Submit to Admin</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
