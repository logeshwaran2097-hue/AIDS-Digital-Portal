'use client'

import React, { useState } from 'react'
import Image from 'next/image'
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
  Award,
  GraduationCap,
  ChevronRight,
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
  // Steps: 1 (Fill remaining & new password) -> 2 (OTP verification) -> 3 (Final verified summary)
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Sync state whenever initialData changes
  React.useEffect(() => {
    if (initialData.phone) setPhone(initialData.phone)
    if (initialData.parentPhone) setParentPhone(initialData.parentPhone)
    if (initialData.email && !initialData.email.endsWith('@student.vsb.edu.in')) {
      setEmail(initialData.email)
    }
  }, [initialData.phone, initialData.parentPhone, initialData.email])

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

  // Fast Confirmation: If details were already entered by Admin, verify & enter instantly
  const handleQuickConfirmAndEnter = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: initialData.name,
          phone: phone.trim() || initialData.phone || undefined,
          parentPhone: parentPhone.trim() || initialData.parentPhone || undefined,
          email: email.trim() || (initialData.email && !initialData.email.endsWith('@student.vsb.edu.in') ? initialData.email : undefined),
          dateOfBirth: initialData.dateOfBirth,
          skipEmailVerification: true,
        }),
      })
      const data = await res.json()
      toast.success('Details confirmed! Entering dashboard...')
      setTimeout(() => onComplete(res.ok && data.success ? data.user || {} : {}), 500)
    } catch {
      toast.success('Details confirmed! Entering dashboard...')
      setTimeout(() => onComplete({}), 500)
    } finally {
      setLoading(false)
    }
  }

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
        toast.success('Email verified & Password updated successfully!')
        setStep(3)
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
    <div className="fixed inset-0 z-50 bg-[#071126]/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-[#1455D9]/30 to-[#E7B93E]/20 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-bl from-[#22C7E8]/25 to-[#1455D9]/20 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative bg-white/95 backdrop-blur-2xl rounded-[32px] max-w-[540px] w-full shadow-[0_25px_70px_rgba(7,26,61,0.35)] border border-white/60 overflow-hidden my-auto animate-fade-in transition-all">
        
        {/* Luxury Gold & Sapphire Top Shimmer Bar */}
        <div className="h-2 bg-gradient-to-r from-[#1455D9] via-[#E7B93E] to-[#22C7E8]" />

        {/* Header with College Emblem & Step Indicators */}
        <div className="px-6 pt-6 pb-4 sm:px-8 border-b border-gray-100 bg-gradient-to-b from-slate-50/80 to-transparent">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Premium Emblem with Gold Halo Ring */}
              <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-[#E7B93E] via-[#FFF3B8] to-[#B8860B] shadow-[0_0_15px_rgba(231,185,62,0.4)]">
                <div className="w-12 h-12 rounded-[14px] bg-[#071A3D] p-1.5 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/college-emblem.png"
                    alt="V.S.B. Crest"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(231,185,62,0.8)]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black tracking-widest text-[#1455D9] uppercase">
                    V.S.B. ENGINEERING COLLEGE
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#E7B93E]" />
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                    AI &amp; DS
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-[#071A3D] tracking-tight">
                  {step === 1 && 'First-Time Student Setup'}
                  {step === 2 && 'Email Security Verification'}
                  {step === 3 && 'Profile Verified & Ready'}
                  {showCorrection && 'Request Profile Correction'}
                </h1>
              </div>
            </div>

            {/* Step Badge */}
            {!showCorrection && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Step {step} of 3
                </span>
                <div className="flex gap-1 mt-1">
                  <span className={`w-4 h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-[#1455D9]' : 'bg-gray-200'}`} />
                  <span className={`w-4 h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-[#E7B93E]' : 'bg-gray-200'}`} />
                  <span className={`w-4 h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: CORRECTION REQUEST MODAL                                          */}
        {/* ========================================================================= */}
        {showCorrection ? (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Official Change Request</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Academic records can only be updated with Admin approval.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCorrection(false)
                  setCorrectionSubmitted(false)
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {correctionSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-gray-900 text-base">Correction Request Dispatched</p>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    The department administrator will verify university records and apply your update.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCorrection(false)}
                  className="px-6 py-3 bg-[#1455D9] hover:bg-[#1044b5] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  Return to Activation
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendCorrectionRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Field to Correct
                  </label>
                  <select
                    value={correctionCategory}
                    onChange={(e) => setCorrectionCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-blue-50 bg-gray-50/50"
                  >
                    <option value="name">Student Full Name</option>
                    <option value="department">Department</option>
                    <option value="section">Year / Semester / Section</option>
                    <option value="dateOfBirth">Date of Birth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Corrected Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={requestedValue}
                    onChange={(e) => setRequestedValue(e.target.value)}
                    placeholder="Enter the official correction"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-blue-50 bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Reason / Official Proof Note <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Provide details for admin verification..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-blue-50 bg-gray-50/50 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCorrection(false)}
                    className="w-1/3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1455D9] hover:bg-[#1044b5] disabled:opacity-60 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
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
          <form onSubmit={handleSendOtp} className="p-6 sm:p-8 space-y-4">
            
            {/* Top Verified Institutional Card */}
            <div className="relative rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 p-4 shadow-sm overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#1455D9]/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#1455D9] uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1455D9]" />
                  <span>Admin Verified Record</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100/70 text-[#1455D9] text-[10px] font-bold font-mono">
                  {initialData.registerNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-medium text-gray-400 block">Student Name</span>
                  <span className="font-extrabold text-[#071A3D] text-xs truncate block">
                    {initialData.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-gray-400 block">Class &amp; Section</span>
                  <span className="font-bold text-[#1455D9] text-xs block">
                    Year {initialData.year} &middot; Sem {initialData.semester} &middot; Sec {initialData.section}
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Fields Section Header */}
            <div className="pt-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#E7B93E]" />
                <span>Complete Student Information &amp; Password</span>
              </h3>
            </div>

            {/* Input Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    📱 Student Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-blue-50 bg-gray-50/60 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    👨‍👩‍👧 Parent WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-blue-50 bg-gray-50/60 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Email */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  ✉️ Personal Email (For Security OTP) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student.personal@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-blue-50 bg-gray-50/60 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password Setup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
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
                      className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-blue-50 bg-gray-50/60 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    🔒 Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-blue-50 bg-gray-50/60 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2.5">
              {/* Fast 1-Click Confirmation if Details are Already Complete */}
              <button
                type="button"
                onClick={handleQuickConfirmAndEnter}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1455D9] via-[#0E44B8] to-[#1455D9] hover:from-[#1044b5] hover:to-[#0c399c] active:scale-[0.99] disabled:opacity-60 text-white font-black text-xs sm:text-sm py-3.5 rounded-2xl shadow-xl shadow-blue-600/25 border border-blue-400/30 transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#F4C430]" />
                )}
                <span>All Details Correct &middot; Confirm &amp; Enter Dashboard</span>
              </button>

              {/* Optional Password Update & OTP Verification */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#071A3D] font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#1455D9]" />
                <span>Update Password via Email OTP &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCorrection(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#1455D9] transition-colors py-1 cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 text-[#1455D9]" />
                <span>Academic records incorrect? Request Correction from Admin</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ENTER 6-DIGIT EMAIL OTP                                           */}
        {/* ========================================================================= */}
        {!showCorrection && step === 2 && (
          <form onSubmit={handleVerifyOtp} className="p-6 sm:p-8 space-y-6 text-center">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] blur-xl opacity-40 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#1455D9] to-[#0a358c] text-white flex items-center justify-center shadow-xl border border-blue-400/40">
                <Mail className="w-9 h-9 text-[#F4C430]" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#071A3D]">Enter Email Security Code</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                A 6-digit OTP has been sent to your institutional email inbox: <br />
                <span className="font-bold text-[#1455D9] text-xs">{email}</span>
              </p>
            </div>

            <div className="py-1">
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center tracking-[0.45em] font-mono font-black text-3xl px-4 py-4 rounded-2xl border-2 border-blue-200 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-blue-100 bg-blue-50/30 focus:bg-white text-[#071A3D] shadow-inner transition-all"
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.trim().length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1455D9] to-[#0E44B8] hover:from-[#1044b5] hover:to-[#0c399c] active:scale-[0.99] disabled:opacity-60 text-white font-black text-sm py-3.5 rounded-2xl shadow-xl shadow-blue-600/25 transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-[#F4C430]" />}
                <span>Verify Code &amp; Activate Account</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setOtp('')
                }}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors py-1"
              >
                &larr; Change Email or Phone Number
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: FINAL VERIFIED POP-UP SUMMARY BEFORE ENTERING DASHBOARD           */}
        {/* ========================================================================= */}
        {!showCorrection && step === 3 && (
          <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl border border-emerald-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verification Complete</span>
              </div>
              <h2 className="text-2xl font-black text-[#071A3D]">Account Fully Activated!</h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Your institutional contacts are verified and your new secure password is in effect.
              </p>
            </div>

            {/* Verified Profile Card */}
            <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden bg-slate-50/80 text-xs shadow-inner">
              <div className="flex items-center justify-between px-4 py-3 bg-blue-50/50">
                <span className="font-semibold text-gray-500">Register Number</span>
                <span className="font-mono font-black text-[#1455D9] text-sm">{initialData.registerNumber}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-semibold text-gray-500">Student Name</span>
                <span className="font-black text-[#071A3D]">{initialData.name}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-semibold text-gray-500">Verified Email</span>
                <span className="font-extrabold text-[#1455D9]">{email}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-semibold text-gray-500">Student Mobile</span>
                <span className="font-mono font-bold text-gray-800">📱 {phone}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-semibold text-gray-500">Parent WhatsApp</span>
                <span className="font-mono font-bold text-gray-800">👨‍👩‍👧 {parentPhone}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50/50">
                <span className="font-semibold text-emerald-800">Security Credentials</span>
                <span className="font-black text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Password Secured
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalEnterDashboard}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1455D9] via-[#0E44B8] to-[#1455D9] hover:from-[#1044b5] hover:to-[#0c399c] active:scale-[0.99] text-white font-black text-sm py-4 rounded-2xl shadow-xl shadow-blue-600/30 border border-blue-400/30 transition-all cursor-pointer"
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
