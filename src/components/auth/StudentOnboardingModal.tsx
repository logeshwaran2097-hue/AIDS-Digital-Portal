'use client'

import React, { useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
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
  const [step, setStep] = useState<1 | 1.5 | 3 | 4>(1)
  const [loading, setLoading] = useState(false)
  
  // Edit State
  const [name, setName] = useState(initialData.name || '')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState(initialData.phone || '')
  const [parentPhone, setParentPhone] = useState(initialData.parentPhone || '')
  const [dateOfBirth, setDateOfBirth] = useState(initialData.dateOfBirth || '')
  const [isWhatsapp, setIsWhatsapp] = useState(false)
  
  // OTP State
  const [otp, setOtp] = useState('')

  if (!isOpen) return null

  // Fast path (Skip editing)
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
      setStep(4)
      toast.success('Details confirmed!')
      setTimeout(() => onComplete(res.ok && data.success ? data.user || {} : {}), 900)
    } catch {
      setStep(4)
      toast.success('Details confirmed!')
      setTimeout(() => onComplete({}), 900)
    } finally {
      setLoading(false)
    }
  }

  // Edit details -> Send OTP
  const handleSaveAndSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required.')
      return
    }
    if (parentPhone.trim() && !isWhatsapp) {
      toast.error('Please provide a WhatsApp enabled number for important college alerts.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), regNo: initialData.registerNumber }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`OTP sent to ${email}`)
        setStep(3)
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP & Complete
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          parentPhone: parentPhone.trim(),
          dateOfBirth: dateOfBirth || undefined,
          otp: otp.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Details updated and confirmed!')
        setStep(4)
        setTimeout(() => onComplete(data.user || {}), 900)
      } else {
        toast.error(data.message || 'Verification failed')
      }
    } catch (error) {
      toast.error('An error occurred during verification.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#1455D9] to-[#22C7E8]" />

        {/* STEP 1: Read Only view */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                First-Time Verification
              </p>
              <h2 className="text-lg font-bold text-gray-900">Check Your Details</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Verify the information below is correct.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                <span className="text-xs text-gray-500">Register No.</span>
                <span className="font-semibold text-gray-800 font-mono text-sm">{initialData.registerNumber}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-gray-500">Department</span>
                <span className="font-semibold text-gray-800 text-xs text-right max-w-[60%]">{initialData.department}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                <span className="text-xs text-gray-500">Year / Sem / Sec</span>
                <span className="font-semibold text-[#1455D9] text-xs">
                  Year {initialData.year} &middot; Sem {initialData.semester} &middot; Sec {initialData.section}
                </span>
              </div>
              {initialData.batch && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-500">Batch</span>
                  <span className="font-semibold text-gray-800 text-xs">{initialData.batch}</span>
                </div>
              )}
              {initialData.advisorName && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                  <span className="text-xs text-gray-500">Class Advisor</span>
                  <span className="font-semibold text-gray-800 text-xs">{initialData.advisorName}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-gray-500">Name</span>
                <span className="font-semibold text-gray-800 text-xs">{initialData.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                <span className="text-xs text-gray-500">Email</span>
                <span className="font-semibold text-gray-800 text-xs">{initialData.email || '—'}</span>
              </div>
              {initialData.phone && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                  <span className="text-xs text-gray-500">Phone</span>
                  <span className="font-semibold text-gray-800 text-xs">{initialData.phone}</span>
                </div>
              )}
              {initialData.dateOfBirth && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-500">Date of Birth</span>
                  <span className="font-semibold text-gray-800 text-xs">{initialData.dateOfBirth}</span>
                </div>
              )}
              {initialData.parentPhone && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                  <span className="text-xs text-gray-500">Parent Mobile</span>
                  <span className="font-semibold text-gray-800 text-xs">{initialData.parentPhone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleConfirmAndEnter}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#1455D9] hover:bg-[#1044b5] disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {loading ? 'Confirming...' : 'All Correct — Enter Dashboard'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1.5)}
                disabled={loading}
                className="w-full text-xs font-semibold text-[#1455D9] hover:text-[#0a3287] transition-colors"
              >
                Information is incorrect? Edit Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 1.5: Edit Details */}
        {step === 1.5 && (
          <form onSubmit={handleSaveAndSendOtp} className="p-6 space-y-5">
            <div>
              <p className="text-[11px] font-semibold text-[#1455D9] uppercase tracking-widest mb-1">
                Edit Details
              </p>
              <h2 className="text-lg font-bold text-gray-900">Update Your Profile</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                We will send an OTP to your email to verify these changes.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/10 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="personal.email@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/10 bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/10 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/10 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Parent / Guardian Mobile
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/10 bg-gray-50 focus:bg-white"
                />
              </div>

              {parentPhone.trim() && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWhatsapp}
                      onChange={(e) => setIsWhatsapp(e.target.checked)}
                      className="mt-0.5 rounded text-[#1455D9] focus:ring-[#1455D9]"
                    />
                    <span className="text-xs text-amber-900 font-medium">
                      I confirm this is a valid WhatsApp number.
                    </span>
                  </label>
                  {!isWhatsapp && (
                    <p className="mt-2 text-[10px] text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Please provide a WhatsApp enabled number for important college alerts.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || (parentPhone.trim().length > 0 && !isWhatsapp)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1455D9] hover:bg-[#1044b5] disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Send OTP'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: OTP Verification */}
        {step === 3 && (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Verify Email</h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code sent to <br /><span className="font-semibold text-gray-800">{email}</span>
              </p>
            </div>

            <div className="pt-2">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 bg-gray-50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-[#1455D9] hover:bg-[#1044b5] disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Enter Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => { setStep(1.5); setOtp(''); }}
              className="w-full text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Change Email Address
            </button>
          </form>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="font-bold text-gray-800">Details Confirmed!</p>
            <p className="text-xs text-gray-500">Opening your dashboard...</p>
            <div className="w-8 h-8 border-[3px] border-[#1455D9] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

      </div>
    </div>
  )
}
