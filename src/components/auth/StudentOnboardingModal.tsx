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
  KeyRound,
  Sparkles,
  Phone,
  Calendar,
  Building,
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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1: Profile fields
  const [name, setName] = useState(initialData.name || '')
  const [phone, setPhone] = useState(initialData.phone || '')
  const [dateOfBirth, setDateOfBirth] = useState(initialData.dateOfBirth || '2005-01-01')

  // Step 2: Email & OTP
  const [email, setEmail] = useState(
    initialData.email && !initialData.email.includes('@student.vsb.edu.in')
      ? initialData.email
      : ''
  )
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpCooldown, setOtpCooldown] = useState(0)

  // Step 3: Password setup
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

  // Handler: Send OTP to Email
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

  // Handler: Verify OTP Code
  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP code.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Invalid or expired OTP.')
        return
      }

      setOtpVerified(true)
      toast.success('Email verified successfully! Now set your new password.')
      setTimeout(() => {
        setStep(3)
      }, 500)
    } catch {
      toast.error('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handler: Complete Onboarding & Save Password
  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.')
      return
    }

    if (!otpVerified) {
      toast.error('Please complete email OTP verification first.')
      setStep(2)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          dateOfBirth,
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to complete setup.')
        return
      }

      setStep(4)
      toast.success('Security setup complete! Welcome to your student portal.')
      setTimeout(() => {
        onComplete(data.user)
      }, 1500)
    } catch {
      toast.error('Error saving your new password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#071A3D]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 animate-scale-up relative overflow-hidden">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#F4C430]" />

        {/* Step Indicator Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#1455D9] border border-blue-200/60 font-black text-xs">
                {initialData.registerNumber}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                First-Time Setup
              </span>
            </div>
            <span className="text-xs font-bold text-[#1455D9]">
              Step {step} of 3
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#071A3D]">
            {step === 1 && '1. Verify & Update Your Details'}
            {step === 2 && '2. Email & OTP Verification'}
            {step === 3 && '3. Set Your Permanent Password'}
            {step === 4 && 'Setup Completed Successfully!'}
          </h2>

          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            {step === 1 && 'Please review and update your student dossier before activating your digital account.'}
            {step === 2 && 'Enter your active email address to receive a secure 6-digit OTP verification code.'}
            {step === 3 && 'Create a strong, permanent password that you will use for future logins with your Register Number.'}
            {step === 4 && 'Your security setup has been verified and saved to the institutional database.'}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#1455D9] to-[#22C7E8] h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: REVIEW & EDIT PROFILE DETAILS */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Department:</span>
                <span className="font-bold text-[#071A3D]">{initialData.department || 'AI & DS'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Academic Standing:</span>
                <span className="font-bold text-[#1455D9]">
                  Year {initialData.year} · Semester {initialData.semester} · Section {initialData.section}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">
                  Full Name (as per college records) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs font-semibold text-[#071A3D]"
                    placeholder="Your Full Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs"
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
                className="font-bold flex items-center gap-2"
                size="lg"
              >
                Proceed to Email Verification
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: EMAIL & OTP VERIFICATION */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">
                  Institutional or Personal Email Address *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      disabled={otpVerified}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs font-semibold text-[#071A3D] disabled:bg-gray-100"
                      placeholder="e.g. student@gmail.com or 23ad001@vsb.edu.in"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || otpCooldown > 0 || otpVerified}
                    variant="outline"
                    className="font-bold shrink-0 text-xs"
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </Button>
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#071A3D]">Enter 6-Digit Email OTP:</span>
                    <span className="text-[11px] text-amber-700 font-medium">Check spam/inbox</span>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[8px] font-mono text-xl font-black py-2.5 rounded-xl border-2 border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1455D9]"
                    placeholder="••••••"
                    autoFocus
                  />

                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    loading={loading}
                    className="w-full font-bold bg-[#1455D9] text-white"
                  >
                    Verify OTP Code
                  </Button>
                </div>
              )}

              {otpVerified && (
                <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-2 text-green-700 font-bold text-xs">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span>Email verified successfully: {email}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-gray-500 hover:text-[#071A3D] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Details
              </button>

              {otpVerified && (
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="font-bold flex items-center gap-2"
                  size="lg"
                >
                  Proceed to Password Setup
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SET NEW PERMANENT PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleCompleteSetup} className="space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">
                  Create New Permanent Password *
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
                    placeholder="At least 6 characters"
                    autoFocus
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
                    placeholder="Re-enter your password"
                  />
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-red-500 font-bold mt-1">Passwords do not match.</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 text-[11px] text-gray-600 space-y-1">
                <p className="font-bold text-[#071A3D]">🔐 Security Notice:</p>
                <p>After saving, you can log in directly using your <strong>Register Number ({initialData.registerNumber})</strong> and this new password.</p>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-gray-500 hover:text-[#071A3D] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Email
              </button>

              <Button
                type="submit"
                loading={loading}
                className="font-bold bg-[#1455D9] text-white flex items-center gap-2"
                size="lg"
              >
                <ShieldCheck className="w-4 h-4" />
                Save Password &amp; Enter Portal
              </Button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="py-6 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-500 text-green-600 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#071A3D]">
              Setup Successfully Completed!
            </h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              Your institutional email has been verified and your permanent password is active. Unlocking your portal now...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
