'use client'

import React, { useState } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Send,
  FileEdit,
  X,
  Lock,
  Mail,
  Phone,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'
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
  // Steps: 1 (Fill remaining & new password) -> 2 (OTP verification) -> 3 (Final verified summary pop-up)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)

  // Input states
  const [phone, setPhone] = useState(initialData.phone || '')
  const [parentPhone, setParentPhone] = useState(initialData.parentPhone || '')
  const [email, setEmail] = useState(
    initialData.email && !initialData.email.endsWith('@student.vsb.edu.in')
      ? initialData.email
      : ''
  )
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // OTP state
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Correction request state
  const [showCorrection, setShowCorrection] = useState(false)
  const [correctionCategory, setCorrectionCategory] = useState('name')
  const [requestedValue, setRequestedValue] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false)

  // Completed user payload
  const [verifiedUserData, setVerifiedUserData] = useState<any>(null)

  if (!isOpen) return null

  // STEP 1 -> STEP 2: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone.trim()) {
      toast.error('Please enter your personal mobile number.')
      return
    }
    if (!parentPhone.trim()) {
      toast.error('Please enter your parent/guardian mobile number.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid personal email address for OTP verification.')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: initialData.name,
          regNo: initialData.registerNumber,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Verification OTP sent to ${email.trim()}`)
        setStep(2)
        setResendCooldown(60)
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch {
      toast.error('Network error sending OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // STEP 2 -> STEP 3: Verify OTP & Save all details to database
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.trim().length !== 6) {
      toast.error('Please enter the complete 6-digit OTP.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: initialData.name,
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          parentPhone: parentPhone.trim(),
          dateOfBirth: initialData.dateOfBirth,
          newPassword: newPassword.trim(),
          otp: otp.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setVerifiedUserData(data.user || {})
        toast.success('Email verified & Password updated!')
        setStep(3) // Transition to the final verification summary pop-up
      } else {
        toast.error(data.message || 'Invalid or expired OTP. Please try again.')
      }
    } catch {
      toast.error('Network error during verification.')
    } finally {
      setLoading(false)
    }
  }

  // STEP 3: Final confirmation click -> enter portal
  const handleFinalEnterDashboard = () => {
    toast.success('Welcome to your student portal!')
    onComplete(verifiedUserData || {})
  }

  // Send Correction Request to Admin
  const handleSendCorrectionRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedValue.trim() || !correctionReason.trim()) {
      toast.error('Please fill in all correction details.')
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
          requestedData: { [correctionCategory]: requestedValue.trim() },
          currentData: {
            name: initialData.name,
            department: initialData.department,
            year: initialData.year,
            semester: initialData.semester,
            section: initialData.section,
          },
          reason: `Correction requested for ${correctionCategory.toUpperCase()}: ${correctionReason.trim()}`,
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

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden my-auto animate-fade-in">
        {/* Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#E7B93E]" />

        {/* ========================================================================= */}
        {/* VIEW 1: CORRECTION REQUEST MODAL                                          */}
        {/* ========================================================================= */}
        {showCorrection ? (
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Request Academic Correction</h3>
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
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-gray-900 text-base">Request Submitted to Admin!</p>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    The department administrator will review and verify your requested updates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCorrection(false)}
                  className="px-6 py-2.5 bg-[#1455D9] hover:bg-[#1044b5] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Continue Setup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendCorrectionRequest} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Field to Correct
                  </label>
                  <select
                    value={correctionCategory}
                    onChange={(e) => setCorrectionCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1455D9] bg-white"
                  >
                    <option value="name">Full Name</option>
                    <option value="department">Department</option>
                    <option value="section">Year / Semester / Section</option>
                    <option value="dateOfBirth">Date of Birth</option>
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
        ) : null}

        {/* ========================================================================= */}
        {/* STEP 1: CHECK ADMIN DETAILS + ENTER REMAINING INFO + NEW PASSWORD         */}
        {/* ========================================================================= */}
        {!showCorrection && step === 1 && (
          <form onSubmit={handleSendOtp} className="p-6 sm:p-7 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1455D9] text-[11px] font-extrabold uppercase tracking-wider mb-1 border border-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1455D9]" />
                  <span>First-Time Account Activation</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Verify Profile &amp; Set Password
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Confirm your academic records, enter your active contacts, and create a new password.
                </p>
              </div>
            </div>

            {/* Read-Only Admin Details Summary Card */}
            <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden bg-gray-50/70 text-xs">
              <div className="flex items-center justify-between px-3.5 py-2 bg-blue-50/50">
                <span className="font-semibold text-gray-500">Register Number</span>
                <span className="font-mono font-black text-[#1455D9] text-sm">{initialData.registerNumber}</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2">
                <span className="font-semibold text-gray-500">Student Name</span>
                <span className="font-bold text-gray-900">{initialData.name}</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2">
                <span className="font-semibold text-gray-500">Department</span>
                <span className="font-bold text-gray-800 text-right max-w-[65%]">{initialData.department}</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2 bg-blue-50/50">
                <span className="font-semibold text-gray-500">Year / Sem / Sec</span>
                <span className="font-bold text-[#1455D9]">
                  Year {initialData.year} &middot; Sem {initialData.semester} &middot; Sec {initialData.section}
                </span>
              </div>
            </div>

            {/* Editable Contact Fields */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    📱 Student Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/10 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    👨‍👩‍👧 Parent WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/10 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ✉️ Personal Email (For OTP verification) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/10 bg-white"
                />
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    🔒 New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 pr-9 rounded-xl border border-gray-300 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/10 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    🔒 Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/10 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#1455D9] hover:bg-[#1044b5] active:scale-[0.99] disabled:opacity-60 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 text-[#F4C430]" />
                )}
                <span>Send OTP &amp; Verify Email</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCorrection(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1455D9] transition-colors py-1 cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 text-[#1455D9]" />
                <span>Academic details incorrect? Request Correction from Admin</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ENTER 6-DIGIT EMAIL OTP                                           */}
        {/* ========================================================================= */}
        {!showCorrection && step === 2 && (
          <form onSubmit={handleVerifyOtp} className="p-6 sm:p-7 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
              <Mail className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-black text-gray-900">Enter Verification Code</h2>
              <p className="text-xs text-gray-500 mt-1">
                We sent a 6-digit OTP code to: <br />
                <span className="font-bold text-gray-900 text-sm">{email}</span>
              </p>
            </div>

            <div className="py-2">
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center tracking-[0.4em] font-mono font-black text-3xl px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 bg-gray-50 focus:bg-white text-gray-900"
              />
            </div>

            <div className="space-y-2.5">
              <button
                type="submit"
                disabled={loading || otp.trim().length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-[#1455D9] hover:bg-[#1044b5] active:scale-[0.99] disabled:opacity-60 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-[#F4C430]" />}
                <span>Verify OTP &amp; Save Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setOtp('')
                }}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors py-1"
              >
                &larr; Change Email or Mobile Number
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: FINAL VERIFIED POP-UP SUMMARY BEFORE ENTERING DASHBOARD           */}
        {/* ========================================================================= */}
        {!showCorrection && step === 3 && (
          <div className="p-6 sm:p-7 space-y-5 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verification Complete</span>
              </div>
              <h2 className="text-xl font-black text-gray-900">Profile Activated!</h2>
              <p className="text-xs text-gray-500">
                Your contact details are linked and password has been set.
              </p>
            </div>

            {/* Small Verified Summary Card */}
            <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden bg-gray-50/70 text-xs">
              <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/50">
                <span className="font-semibold text-gray-500">Register Number</span>
                <span className="font-mono font-black text-[#1455D9] text-sm">{initialData.registerNumber}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="font-semibold text-gray-500">Student Name</span>
                <span className="font-bold text-gray-900">{initialData.name}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="font-semibold text-gray-500">Verified Email</span>
                <span className="font-bold text-[#1455D9]">{email}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="font-semibold text-gray-500">Student Phone</span>
                <span className="font-mono font-bold text-gray-800">📱 {phone}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="font-semibold text-gray-500">Parent WhatsApp</span>
                <span className="font-mono font-bold text-gray-800">👨‍👩‍👧 {parentPhone}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/50">
                <span className="font-semibold text-emerald-800">Password Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Updated &amp; Protected
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalEnterDashboard}
              className="w-full flex items-center justify-center gap-2 bg-[#1455D9] hover:bg-[#1044b5] active:scale-[0.99] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-xl shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>All Details Verified &middot; Enter Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#F4C430]" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
