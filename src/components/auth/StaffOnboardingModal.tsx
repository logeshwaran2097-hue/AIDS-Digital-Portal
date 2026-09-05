'use client'

import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Send,
  X,
  Lock,
  Mail,
  Phone,
  Pencil,
  Eye,
  EyeOff,
  GraduationCap,
  Camera,
  Upload,
  Trash2,
  User as UserIcon,
  Building2,
  Users,
  BookOpen,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface StaffOnboardingModalProps {
  isOpen: boolean
  role: 'advisor' | 'faculty' | 'hod'
  onComplete: (updatedData?: any) => void
  initialData: {
    name: string
    email: string
    phone?: string
    facultyId: string
    designation: string
    qualification?: string
    experience?: number
    specialization?: string
    advisorBatch?: string | null
    advisorYear?: number | null
    advisorSem?: number | null
    advisorSec?: string | null
    subjects?: string
    department?: string
    dateOfBirth?: string
    profileImage?: string
  }
}

export function StaffOnboardingModal({
  isOpen,
  role,
  onComplete,
  initialData,
}: StaffOnboardingModalProps) {
  // 3-Step Wizard: 1. Review Official Particulars -> 2. Password & Email OTP -> 3. Verify All Details & Confirm
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [step3Confirmed, setStep3Confirmed] = useState(false)

  // Form State: Only prefilled if explicitly set by admin; otherwise completely empty!
  const [form, setForm] = useState({
    name: initialData.name || '',
    phone: initialData.phone || '',
    dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
    cabin: '',
    specialization: initialData.specialization || '',
    qualification: initialData.qualification || '',
    experience: initialData.experience ? String(initialData.experience) : '',
    detailsConfirmed: true,
    profileImage: initialData.profileImage || '',
    email: '', // REMOVE FIELD DATA: Never prefill email so user types their own email
    newPassword: '',
    confirmPassword: '',
    emailOtp: '',
  })

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0)
  const [demoOtp, setDemoOtp] = useState<string | null>(null)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpChallenge, setOtpChallenge] = useState<string | null>(null)

  // Correction Modal State
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionCategory, setCorrectionCategory] = useState('designation')
  const [requestedValue, setRequestedValue] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false)
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false)

  // Sync initialData changes (only update if admin fields are populated)
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      phone: initialData.phone || prev.phone,
      dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : prev.dateOfBirth,
      specialization: initialData.specialization || prev.specialization,
      qualification: initialData.qualification || prev.qualification,
      experience: initialData.experience ? String(initialData.experience) : prev.experience,
      profileImage: initialData.profileImage || prev.profileImage,
      // Note: email is NEVER overwritten with initialData.email so it remains empty for fresh user entry!
    }))
  }, [initialData])

  // Cooldown countdown timer
  useEffect(() => {
    if (emailOtpCooldown <= 0) return
    const timer = setInterval(() => setEmailOtpCooldown((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(timer)
  }, [emailOtpCooldown])

  // Auto-verify OTP in real-time as soon as all 6 digits are typed
  useEffect(() => {
    const code = (form.emailOtp || '').trim()
    if (code.length === 6 && form.email.trim() && !otpVerified && !isVerifyingOtp) {
      let active = true
      const runAutoVerify = async () => {
        setIsVerifyingOtp(true)
        setOtpError(null)
        try {
          const res = await fetch('/api/auth/verify-onboarding-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: form.email.trim().toLowerCase(),
              otp: code,
              challenge: otpChallenge || undefined,
            }),
          })
          const data = await res.json()
          if (!active) return
          if (res.ok && data.success) {
            setOtpVerified(true)
            setOtpError(null)
            toast.success('Email OTP verified successfully!')
            // If new passwords are valid, automatically proceed to Step 3!
            if (
              form.newPassword &&
              form.newPassword.length >= 6 &&
              form.newPassword === form.confirmPassword
            ) {
              setTimeout(() => {
                if (active) setOnboardingStep(3)
              }, 500)
            }
          } else {
            setOtpVerified(false)
            setOtpError(data.message || 'Invalid verification code. Please check and try again.')
          }
        } catch {
          if (active) setOtpError('Network error during auto-verification.')
        } finally {
          if (active) setIsVerifyingOtp(false)
        }
      }
      runAutoVerify()
      return () => {
        active = false
      }
    } else if (code.length < 6) {
      if (otpVerified) setOtpVerified(false)
      if (otpError) setOtpError(null)
    }
  }, [form.emailOtp, form.email, otpVerified, isVerifyingOtp, otpChallenge, form.newPassword, form.confirmPassword])

  // Photo upload and compression to base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = document.createElement('img')
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 300
        let w = img.width
        let h = img.height
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          }
        } else {
          if (h > maxDim) {
            w = Math.round((h * maxDim) / h)
            h = maxDim
          }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h)
          const base64 = canvas.toDataURL('image/jpeg', 0.85)
          setForm((prev) => ({ ...prev, profileImage: base64 }))
          toast.success('Passport photograph uploaded!')
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null

  // Determine mentorship / course allocation string
  let allocationLabel = 'Department Allocation'
  let allocationValue = 'Artificial Intelligence & Data Science'
  if (role === 'advisor') {
    allocationLabel = 'ASSIGNED MENTORSHIP BATCH'
    allocationValue =
      initialData.advisorBatch ||
      (initialData.advisorYear && initialData.advisorSec
        ? `Year ${initialData.advisorYear} · Sem ${initialData.advisorSem || 3} · Sec ${initialData.advisorSec}`
        : 'Year II · Sem 3 · Sec A')
  } else if (role === 'hod') {
    allocationLabel = 'DEPARTMENT HEADSHIP'
    allocationValue = 'Head of Department · AI & DS'
  } else {
    allocationLabel = 'ALLOCATED COURSES / LABS'
    try {
      const subs = JSON.parse(initialData.subjects || '[]')
      allocationValue = subs.length > 0 ? subs.join(', ') : 'Assigned Departmental Courses'
    } catch {
      allocationValue = initialData.subjects || 'Assigned Departmental Courses'
    }
  }

  // STEP 1 -> STEP 2: Proceed to Security Step
  const handleProceedToSecurityStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone.trim()) {
      toast.error('Please enter your direct mobile / WhatsApp number.')
      return
    }
    if (!form.detailsConfirmed) {
      toast.error('Please check the confirmation box verifying your particulars.')
      return
    }
    setOnboardingStep(2)
  }

  // Send Email OTP
  const handleSendEmailOTP = async () => {
    if (!form.email.trim() || !form.email.includes('@')) {
      toast.error('Please enter a valid official/personal email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-onboarding-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          name: initialData.name,
          facultyId: initialData.facultyId,
          role,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setEmailOtpSent(true)
        setEmailOtpCooldown(60)
        setOtpVerified(false)
        setOtpError(null)
        if (data.challenge) {
          setOtpChallenge(data.challenge)
        }
        if (data.devOtp) {
          setDemoOtp(data.devOtp)
        }
        toast.success(`Verification OTP sent to ${form.email.trim()}`)
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch {
      toast.error('Network error sending OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // STEP 2 -> STEP 3: Validate Password & OTP
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.newPassword || form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New password and confirm password do not match.')
      return
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }
    if (!emailOtpSent && !demoOtp) {
      toast.error('Please click "Send OTP" to receive your verification code.')
      return
    }
    if (!form.emailOtp || form.emailOtp.trim().length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code.')
      return
    }
    if (otpError) {
      toast.error('Please enter a valid OTP code.')
      return
    }

    setOnboardingStep(3)
  }

  // STEP 3: Complete Onboarding & Final Activation
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!step3Confirmed) {
      toast.error('Please check the verification confirmation box before entering the portal.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.name || initialData.name,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        facultyId: initialData.facultyId,
        dateOfBirth: form.dateOfBirth || undefined,
        qualification: form.qualification || initialData.qualification || '',
        specialization: form.specialization || '',
        experience: Number(form.experience) || initialData.experience || 0,
        classPeriod: form.cabin || '',
        role,
        newPassword: form.newPassword.trim(),
        emailOtp: form.emailOtp.trim(),
        challenge: otpChallenge || undefined,
        profileImage: form.profileImage || undefined,
      }

      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Account fully verified & Password saved! Welcome to the portal.')
        setTimeout(() => {
          onComplete(data.user || {})
        }, 600)
      } else {
        toast.error(data.message || 'Invalid or expired OTP. Please try again.')
      }
    } catch {
      toast.error('Network error completing verification.')
    } finally {
      setLoading(false)
    }
  }

  // Send Correction Request to Admin
  const handleSendCorrectionRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedValue.trim() || !correctionReason.trim()) {
      toast.error('Please fill in all correction details.')
      return
    }

    setCorrectionSubmitting(true)
    try {
      const res = await fetch('/api/students/profile-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerNumber: initialData.facultyId,
          studentName: initialData.name,
          requestedData: { [correctionCategory]: requestedValue.trim() },
          currentData: {
            name: initialData.name,
            facultyId: initialData.facultyId,
            designation: initialData.designation,
            department: initialData.department || 'Artificial Intelligence & Data Science',
            batch: allocationValue,
          },
          reason: `[Staff Correction] Requested ${correctionCategory.toUpperCase()}: ${correctionReason.trim()}`,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setCorrectionSubmitted(true)
        setShowCorrectionModal(false)
        toast.success('Correction request submitted to Admin!')
      } else {
        toast.error(data.message || 'Failed to submit correction request.')
      }
    } catch {
      toast.error('Network error submitting request.')
    } finally {
      setCorrectionSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#071A41]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 border border-gray-100 max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Modal Header with Progress Step Indicator (Matching Student Onboarding Method) */}
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1557C0] text-[10px] font-black uppercase tracking-wider">
              {role === 'hod'
                ? 'HOD APPOINTMENT VERIFICATION & SECURITY SETUP'
                : role === 'advisor'
                ? 'CLASS ADVISOR VERIFICATION & SECURITY SETUP'
                : 'FACULTY APPOINTMENT VERIFICATION & SECURITY SETUP'}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              {initialData.facultyId}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-[#071A41]">
              {onboardingStep === 1 &&
                (role === 'hod'
                  ? 'Step 1: Review HOD Appointment Details'
                  : role === 'advisor'
                  ? 'Step 1: Review Class Advisor Particulars'
                  : 'Step 1: Review Faculty Particulars')}
              {onboardingStep === 2 && 'Step 2: Password & Email OTP Verification'}
              {onboardingStep === 3 && 'Step 3: Verify All Details & Confirm'}
            </h3>
            <span className="text-xs font-black text-[#1557C0] bg-blue-50 px-2.5 py-1 rounded-xl">
              Step {onboardingStep} of 3
            </span>
          </div>

          {/* Visual Step Bar */}
          <div className="grid grid-cols-3 gap-2 mt-2.5">
            <div className={cn('h-1.5 rounded-full transition-all', onboardingStep >= 1 ? 'bg-[#1557C0]' : 'bg-gray-200')} />
            <div className={cn('h-1.5 rounded-full transition-all', onboardingStep >= 2 ? 'bg-[#1557C0]' : 'bg-gray-200')} />
            <div className={cn('h-1.5 rounded-full transition-all', onboardingStep === 3 ? 'bg-[#1557C0]' : 'bg-gray-200')} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: REVIEW OFFICIAL PARTICULARS & REQUEST CORRECTION */}
        {/* ========================================================================= */}
        {onboardingStep === 1 && (
          <form onSubmit={handleProceedToSecurityStep} className="space-y-4 text-xs">
            <p className="text-[11px] text-gray-500 font-medium">
              Please carefully verify your official department appointment records below. If any academic or designation details are incorrect, you can request an instant admin correction.
            </p>

            {/* Official Institutional Record (Locked by Admin) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#1557C0]/10 flex items-center justify-center text-[#1557C0]">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-black text-[#071A41] text-xs block">Official Institutional Record</span>
                    <span className="text-[10px] font-bold text-slate-500">Verified &amp; Configured by Department Administrator</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 hover:bg-amber-100 text-[11px] font-black transition-all shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3 h-3 text-amber-700" />
                  <span>Request Admin Correction</span>
                </button>
              </div>

              {/* Pending Correction Alert */}
              {correctionSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-900 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-black block">Correction Request Pending Admin Review</span>
                    <span className="text-[11px] text-emerald-700">
                      Your request to modify appointment records has been submitted. The Administrator will review and update official records.
                    </span>
                  </div>
                </div>
              )}

              {/* 6 High-Contrast Locked Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Official Staff ID */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">OFFICIAL STAFF ID</span>
                    <span className="font-mono font-black text-xs text-[#071A41]">{initialData.facultyId}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Lock className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>

                {/* Full Name */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">FULL NAME</span>
                    <span className="font-bold text-xs text-[#071A41]">{initialData.name}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Program / Department */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">DEPARTMENT</span>
                    <span className="font-bold text-xs text-[#1557C0]">{initialData.department || 'Artificial Intelligence & Data Science'}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Designation */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">DESIGNATION</span>
                    <span className="font-bold text-xs text-[#071A41]">{initialData.designation}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Assigned Batch / Allocated Subjects */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between sm:col-span-2">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">{allocationLabel}</span>
                    <span className="font-bold text-xs text-[#1557C0] truncate block">{allocationValue}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                </div>

                {/* Qualifications & Experience */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">QUALIFICATIONS &amp; EXPERIENCE</span>
                    <span className="font-bold text-xs text-[#071A41]">
                      {initialData.qualification ? (
                        <>
                          {initialData.qualification}
                          {initialData.experience ? ` · ${initialData.experience} Years Experience` : ''}
                        </>
                      ) : (
                        <span className="text-amber-600 font-semibold">Not Set by Admin (Enter in particulars below)</span>
                      )}
                    </span>
                  </div>
                  {initialData.qualification ? (
                    <Lock className="w-3 h-3 text-slate-400" />
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Enter Below
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Staff Passport Photograph Upload Section */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#071A41]">
                  <Camera className="w-4 h-4 text-[#1557C0]" />
                  <span>Staff Passport Photograph (Official Faculty Dossier)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  Embeds on ID Card
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                  {form.profileImage ? (
                    <img
                      src={form.profileImage}
                      alt="Staff Photo"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#1557C0] shadow-md shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-dashed border-blue-300 flex flex-col items-center justify-center text-blue-500 shadow-inner shrink-0">
                      <UserIcon className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-[9px] font-bold text-gray-500">No Photo</span>
                    </div>
                  )}
                  {form.profileImage && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, profileImage: '' }))}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-all cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1557C0] hover:bg-[#0f44b0] text-white font-bold text-xs cursor-pointer shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{form.profileImage ? 'Change Photo' : 'Upload Passport Photo'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-gray-600">
                    Upload a clear frontal passport size photograph (JPG, PNG). This will appear on your Faculty Portal, Student Mentorship View &amp; Digital ID Card.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Personal Particulars (Editable) */}
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-blue-200/60 text-xs font-black text-[#071A41]">
                <Phone className="w-4 h-4 text-[#1557C0]" />
                <span>Contact &amp; Personal Particulars (Editable)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Direct Mobile / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit mobile number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Cabin / Department Wing
                  </label>
                  <input
                    type="text"
                    value={form.cabin}
                    onChange={(e) => setForm({ ...form, cabin: e.target.value })}
                    placeholder="e.g. Staff Room 204 / AI & DS Wing"
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Specialization / Research Domain
                  </label>
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="e.g. Machine Learning, Computer Vision, Data Science"
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  />
                </div>

                {!initialData.qualification && (
                  <>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        Highest Qualification
                      </label>
                      <input
                        type="text"
                        value={form.qualification}
                        onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                        placeholder="e.g. M.E. / M.Tech, Ph.D., M.Sc."
                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        Teaching Experience (Years)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={form.experience}
                        onChange={(e) => setForm({ ...form, experience: e.target.value })}
                        placeholder="e.g. 5"
                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Details Confirmed Checkbox */}
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={form.detailsConfirmed}
                  onChange={(e) => setForm({ ...form, detailsConfirmed: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#1557C0] focus:ring-[#1557C0]"
                />
                <span className="text-xs font-bold text-[#071A41]">
                  I confirm that I have reviewed my staff particulars, contact numbers, and departmental appointment.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#1557C0] hover:bg-[#0f44b0] text-white shadow-md cursor-pointer hover:scale-[1.02] transition-all text-xs sm:text-sm"
              >
                <span>Proceed to Step 2: Password &amp; Email</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SET PERMANENT PASSWORD & EMAIL OTP VERIFICATION */}
        {/* ========================================================================= */}
        {onboardingStep === 2 && (
          <form onSubmit={handleProceedToStep3} className="space-y-4 text-xs">
            {/* 1. Permanent Password Section */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <span className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Create Permanent Secure Password *
                </span>
                <span className="text-[10px] font-bold text-amber-700">Min 6 characters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Create strong password"
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Email Verification via OTP */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <span className="font-black text-[#071A41] flex items-center gap-1.5 text-xs">
                  <Mail className="w-4 h-4 text-[#1557C0]" />
                  Verify Official Email via OTP *
                </span>
                <span className="text-[10px] font-bold text-blue-700">Official Campus Communication</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 text-[11px] mb-1">
                  Email Address *
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your personal or official email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailOTP}
                    disabled={loading || emailOtpCooldown > 0 || !form.email.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#1557C0] hover:bg-[#0e44b5] text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {emailOtpCooldown > 0 ? `Resend (${emailOtpCooldown}s)` : emailOtpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* Demo OTP Helper if generated */}
              {demoOtp && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-900 block">Security Code Sent:</span>
                    <span className="font-mono font-bold text-amber-800 text-sm tracking-wider">{demoOtp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, emailOtp: demoOtp })}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              )}

              {/* OTP Input Section */}
              {emailOtpSent && (
                <div className="space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-gray-700 text-[11px]">
                      Enter 6-Digit Email Verification Code *
                    </label>
                    {isVerifyingOtp && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1557C0] animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Auto-verifying...
                      </span>
                    )}
                    {otpVerified && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified!
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={form.emailOtp}
                    onChange={(e) => setForm({ ...form, emailOtp: e.target.value.replace(/\D/g, '') })}
                    placeholder="000000"
                    disabled={otpVerified}
                    className={cn(
                      'w-full text-center tracking-[0.4em] font-mono font-black text-2xl p-2.5 rounded-xl border bg-white focus:outline-none shadow-inner transition-all',
                      otpVerified
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800 ring-2 ring-emerald-400/40'
                        : otpError
                        ? 'border-rose-400 bg-rose-50/30 text-rose-800 ring-2 ring-rose-400/30'
                        : 'border-gray-300 text-[#071A41] focus:ring-2 focus:ring-[#1557C0]'
                    )}
                  />
                  {otpError && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}
                  {otpVerified && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Security Code Verified &amp; Confirmed</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpVerified(false)
                          setForm((prev) => ({ ...prev, emailOtp: '' }))
                        }}
                        className="text-[11px] text-emerald-700 underline font-semibold hover:text-emerald-900 cursor-pointer"
                      >
                        Change Code
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
              <button
                type="button"
                onClick={() => setOnboardingStep(1)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 1</span>
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#1557C0] hover:bg-[#0e44b5] text-white shadow-md text-xs sm:text-sm cursor-pointer transition-all"
              >
                <span>Next: Review &amp; Verify All Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: VERIFY ALL DETAILS & FINAL CONFIRMATION */}
        {/* ========================================================================= */}
        {onboardingStep === 3 && (
          <form onSubmit={handleCompleteOnboarding} className="space-y-4 text-xs">
            <p className="text-[11px] text-gray-500 font-medium">
              Please thoroughly verify all your staff particulars, contact details, and security credentials below before confirming.
            </p>

            {/* Comprehensive Details Review Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-xs">
              {/* Header inside summary with Photo & Identity */}
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200">
                {form.profileImage ? (
                  <img
                    src={form.profileImage}
                    alt="Staff Photo"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1557C0] shadow-sm bg-white shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shadow-inner shrink-0">
                    <UserIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-[#071A41] truncate">{initialData.name}</h4>
                    <span className="text-[10px] font-mono font-bold bg-blue-100 text-[#1557C0] px-2 py-0.5 rounded-md">
                      {initialData.facultyId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                    {initialData.designation} · {initialData.department || 'Artificial Intelligence & Data Science'}
                  </p>
                  <p className="text-[10px] text-[#1557C0] font-bold mt-0.5 truncate">
                    {allocationLabel}: {allocationValue}
                  </p>
                </div>
              </div>

              {/* Grid of Verified Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">DIRECT MOBILE</span>
                  <span className="font-mono font-bold text-[#071A41]">{form.phone || 'Not provided'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">OFFICIAL EMAIL</span>
                  <span className="font-mono font-bold text-[#071A41] truncate block">{form.email || 'Not provided'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">CABIN LOCATION</span>
                  <span className="font-bold text-[#071A41]">{form.cabin || 'Not provided'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">SPECIALIZATION</span>
                  <span className="font-bold text-[#071A41] truncate block">{form.specialization || 'Not provided'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">QUALIFICATIONS</span>
                  <span className="font-bold text-[#071A41] truncate block">
                    {form.qualification || initialData.qualification || 'Not provided'}
                    {(form.experience || initialData.experience) ? ` · ${form.experience || initialData.experience} Years Exp` : ''}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">DATE OF BIRTH</span>
                  <span className="font-bold text-[#071A41]">{form.dateOfBirth || 'Not provided'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 sm:col-span-2">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">SECURITY CREDENTIALS</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Password &amp; 2FA Ready
                  </span>
                </div>
              </div>

              {/* Note about admin locks */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2 text-amber-900 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Official institutional records (Staff ID, designation, allocated batch/subjects) are centrally locked. Future changes require approval from the Department Administrator.
                </p>
              </div>

              {/* Checkbox Affirmation */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={step3Confirmed}
                  onChange={(e) => setStep3Confirmed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#1557C0] focus:ring-[#1557C0]"
                />
                <span className="text-xs font-bold text-[#071A41]">
                  I solemnly affirm that the details furnished above are genuine, accurate, and match my official institutional credentials.
                </span>
              </label>
            </div>

            {/* Navigation & Final Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
              <button
                type="button"
                onClick={() => setOnboardingStep(2)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 2</span>
              </button>

              <button
                type="submit"
                disabled={loading || !step3Confirmed}
                className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#1557C0] hover:bg-[#0e44b5] text-white shadow-md text-xs sm:text-sm cursor-pointer transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating Portal...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Verification &amp; Activate Staff Portal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADMIN CORRECTION REQUEST MODAL (Exact match with student correction flow) */}
      {/* ========================================================================= */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#071A41]">Request Record Correction</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Forwarded to Department Administrator</p>
                </div>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendCorrectionRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1 text-[11px]">Particular to Correct</label>
                <select
                  value={correctionCategory}
                  onChange={(e) => setCorrectionCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41]"
                >
                  <option value="name">Full Name</option>
                  <option value="facultyId">Staff ID</option>
                  <option value="designation">Designation</option>
                  <option value="batch">Assigned Batch / Mentorship</option>
                  <option value="qualification">Qualifications</option>
                  <option value="department">Department</option>
                  <option value="subjects">Allocated Courses / Labs</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 text-[11px]">Correct / Requested Value *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter the correct detail"
                  value={requestedValue}
                  onChange={(e) => setRequestedValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 text-[11px]">Reason for Correction *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide supporting remarks or appointment reference"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={correctionSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {correctionSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
