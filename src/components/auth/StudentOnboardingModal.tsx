'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Phone,
  Calendar,
  Building,
  Check,
  GraduationCap,
  KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
  }
}

export function StudentOnboardingModal({
  isOpen,
  onComplete,
  initialData,
}: StudentOnboardingModalProps) {
  // Step 1: Check/Edit Admin Details -> Step 2: Email OTP & Set Password -> Step 3: Success
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1: Profile details (Admin-entered, student can verify or edit if wrong)
  const [name, setName] = useState(initialData.name || '')
  const [phone, setPhone] = useState(initialData.phone || '')
  const [dateOfBirth, setDateOfBirth] = useState(
    initialData.dateOfBirth || '2005-01-01'
  )

  // Step 2: Email & OTP Verification + New Password
  const [email, setEmail] = useState(
    initialData.email && !initialData.email.includes('@student.vsb.edu.in')
      ? initialData.email
      : ''
  )
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCooldown, setOtpCooldown] = useState(0)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)

  // Timer for resending OTP
  React.useEffect(() => {
    if (otpCooldown <= 0) return
    const timer = setTimeout(() => setOtpCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpCooldown])

  if (!isOpen) return null

  // Handler: Send 6-Digit OTP to Email
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to send OTP code.')
        return
      }

      setOtpSent(true)
      setOtpCooldown(60)
      toast.success(data.message || 'Verification OTP sent to your email!')
    } catch {
      toast.error('Network error sending OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handler: Verify OTP, Set New Password, and Open Student Dashboard
  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (!otpSent) {
      toast.error('Please click "Send OTP" to receive your verification code.')
      return
    }

    if (!otp || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP sent to your email.')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          dateOfBirth,
          email: email.trim(),
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to verify OTP or set password.')
        return
      }

      setStep(3)
      toast.success('Email verified & password updated! Opening your student portal...')
      setTimeout(() => {
        onComplete(data.user)
      }, 1200)
    } catch {
      toast.error('Error completing verification. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#071A3D]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 animate-scale-up relative overflow-hidden">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#F4C430]" />

        {/* Step Indicator Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#1455D9] border border-blue-200/60 font-black text-xs font-mono">
                {initialData.registerNumber}
              </span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                First-Time Student Onboarding
              </span>
            </div>
            <span className="text-xs font-bold text-[#1455D9]">
              Step {step} of 2
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#071A3D]">
            {step === 1 && '1. Check & Confirm Your Details'}
            {step === 2 && '2. Email OTP Verification & Password Setup'}
            {step === 3 && 'Verification Complete!'}
          </h2>

          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            {step === 1 &&
              'Please check the details entered by administration. If any detail is incorrect, you can edit your name, phone number, or date of birth below.'}
            {step === 2 &&
              'Enter your email address to receive your 6-digit OTP. Verify the OTP and set your permanent password to unlock your portal.'}
            {step === 3 &&
              'Your details have been verified and your new password is saved. Redirecting to your dashboard...'}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#1455D9] to-[#22C7E8] h-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* STEP 1: CHECK & EDIT ADMIN DETAILS */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Department:</span>
                <span className="font-bold text-[#071A3D]">{initialData.department || 'AI & DS'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Academic Standing:</span>
                <span className="font-bold text-[#1455D9]">
                  Year {initialData.year} · Semester {initialData.semester} · Section {initialData.section}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#071A3D]">
                    Student Full Name *
                  </label>
                  <span className="text-[10px] text-gray-400">Editable if incorrect</span>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs font-bold text-[#071A3D]"
                    placeholder="Your Full Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#071A3D]">Phone Number</label>
                    <span className="text-[10px] text-gray-400">Editable</span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs font-semibold"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#071A3D]">Date of Birth</label>
                    <span className="text-[10px] text-gray-400">Editable</span>
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  if (!name.trim()) {
                    toast.error('Please enter your full name.')
                    return
                  }
                  setStep(2)
                }}
                className="font-bold flex items-center gap-2 bg-[#1455D9] text-white"
                size="lg"
              >
                Confirm Details &amp; Proceed to Email Verification
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: EMAIL OTP VERIFICATION & PASSWORD SETUP */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndComplete} className="space-y-4">
            <div className="space-y-3 text-xs">
              {/* Email Input */}
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">
                  Enter Your Email Address for OTP *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs font-semibold text-[#071A3D]"
                      placeholder="e.g. yourname@gmail.com or 23ad001@vsb.edu.in"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || otpCooldown > 0}
                    variant="outline"
                    className="font-bold shrink-0 text-xs border-blue-200 text-[#1455D9] hover:bg-blue-50"
                  >
                    {otpCooldown > 0
                      ? `Resend in ${otpCooldown}s`
                      : otpSent
                      ? 'Resend OTP'
                      : 'Send OTP'}
                  </Button>
                </div>
              </div>

              {/* 6-Digit OTP Box */}
              {otpSent && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#071A3D]">Enter 6-Digit Email OTP:</span>
                    <span className="text-[11px] text-amber-700 font-medium">Sent to {email}</span>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[8px] font-mono text-xl font-black py-2 rounded-xl border-2 border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1455D9]"
                    placeholder="••••••"
                    autoFocus
                  />
                </div>
              )}

              {/* Set New Permanent Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    New Permanent Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs font-semibold text-[#071A3D]"
                      placeholder="Min 6 chars"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs font-semibold text-[#071A3D]"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[11px] text-red-500 font-bold">Passwords do not match.</p>
              )}
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-gray-500 hover:text-[#071A3D] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Details
              </button>

              <Button
                type="submit"
                loading={loading}
                className="font-bold bg-[#1455D9] text-white flex items-center gap-2"
                size="lg"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify OTP, Save &amp; Enter Portal
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS & DASHBOARD UNLOCKED */}
        {step === 3 && (
          <div className="py-6 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-500 text-green-600 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#071A3D]">
              Verification Completed Successfully!
            </h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              Your details and email have been verified, and your permanent password is active. Opening your student portal now...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
