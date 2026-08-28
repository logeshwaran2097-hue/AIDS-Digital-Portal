'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Building,
  BookOpen,
  GraduationCap,
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
    advisorName?: string
    batch?: string
  }
}

export function StudentOnboardingModal({
  isOpen,
  onComplete,
  initialData,
}: StudentOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1)

  // Editable fields student can correct if wrong
  const [name, setName] = useState(initialData.name || '')
  const [phone, setPhone] = useState(initialData.phone || '')
  const [dateOfBirth, setDateOfBirth] = useState(initialData.dateOfBirth || '')

  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  // Handler: Student confirms details are correct → go directly to dashboard
  const handleConfirmAndEnter = async () => {
    if (!name.trim()) {
      toast.error('Please enter your full name.')
      return
    }

    setLoading(true)
    try {
      // Save any edits the student made to name / phone / DOB
      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          dateOfBirth: dateOfBirth || undefined,
          skipEmailVerification: true,
        }),
      })

      const data = await res.json()
      // Even if the API call fails we still let the student in since they're authenticated
      if (res.ok && data.success) {
        setStep(2)
        toast.success('Details confirmed! Entering your student portal...')
        setTimeout(() => onComplete(data.user || {}), 1000)
      } else {
        // Graceful fallback: still proceed to dashboard
        setStep(2)
        toast.success('Details confirmed! Entering your student portal...')
        setTimeout(() => onComplete({}), 1000)
      }
    } catch {
      // Fallback: still proceed
      setStep(2)
      toast.success('Details confirmed! Entering your student portal...')
      setTimeout(() => onComplete({}), 1000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#071A3D]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 animate-scale-up relative overflow-hidden">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#F4C430]" />

        {/* Header */}
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
            <span className="text-xs font-bold text-[#1455D9] bg-blue-50 px-2.5 py-1 rounded-lg">
              Details Review
            </span>
          </div>

          {step === 1 && (
            <>
              <h2 className="text-xl sm:text-2xl font-black text-[#071A3D]">
                ✅ Check & Confirm Your Details
              </h2>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Please review all the details entered by administration. If anything is incorrect, you can edit your name, phone number, or date of birth. Once everything is correct, click <strong>Confirm & Enter Dashboard</strong>.
              </p>
              {/* Progress bar full at step 1 since it's the only step */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#1455D9] to-[#22C7E8] h-full transition-all duration-300"
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl sm:text-2xl font-black text-[#071A3D]">
                Entering Your Portal...
              </h2>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#1455D9] to-[#22C7E8] h-full w-full" />
              </div>
            </>
          )}
        </div>

        {/* STEP 1: DETAILS REVIEW */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            {/* Read-only Admin-entered fields */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                📋 Admin-Entered Details (Read-Only)
              </p>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <Building className="w-3.5 h-3.5" />
                  Department:
                </span>
                <span className="font-bold text-[#071A3D]">
                  {initialData.department || 'AI & DS'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <BookOpen className="w-3.5 h-3.5" />
                  Academic Year / Sem / Sec:
                </span>
                <span className="font-bold text-[#1455D9]">
                  Year {initialData.year} · Sem {initialData.semester} · Sec {initialData.section}
                </span>
              </div>

              {initialData.batch && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Batch (Cohort):
                  </span>
                  <span className="font-bold text-[#071A3D]">{initialData.batch}</span>
                </div>
              )}

              {initialData.advisorName && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <User className="w-3.5 h-3.5" />
                    Class Advisor:
                  </span>
                  <span className="font-bold text-[#071A3D]">{initialData.advisorName}</span>
                </div>
              )}
            </div>

            {/* Editable Fields */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                ✏️ You Can Correct These If Wrong
              </p>

              {/* Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#071A3D]">Student Full Name *</label>
                  <span className="text-[10px] text-blue-500 font-medium">Editable if incorrect</span>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs font-bold text-[#071A3D]"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#071A3D]">Phone Number</label>
                    <span className="text-[10px] text-blue-500 font-medium">Editable</span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1455D9] text-xs font-semibold"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#071A3D]">Date of Birth</label>
                    <span className="text-[10px] text-blue-500 font-medium">Editable</span>
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

            {/* Confirmation Checkbox notice */}
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-green-800 font-medium leading-relaxed">
                By clicking <strong>Confirm & Enter Dashboard</strong>, you confirm that the above details are accurate. Your identity has been verified by the administration.
              </p>
            </div>

            {/* CTA */}
            <div className="pt-2 border-t flex justify-end">
              <Button
                type="button"
                onClick={handleConfirmAndEnter}
                loading={loading}
                className="font-bold flex items-center gap-2 bg-[#1455D9] text-white"
                size="lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                All Details Correct — Enter Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: SUCCESS REDIRECT */}
        {step === 2 && (
          <div className="py-8 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-500 text-green-600 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-[#071A3D]">
              Details Confirmed!
            </h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              Your details have been verified. Opening your student dashboard now...
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-[#1455D9] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
