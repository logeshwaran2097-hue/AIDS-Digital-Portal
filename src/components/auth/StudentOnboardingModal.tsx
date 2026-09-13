'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
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
  BadgeCheck,
  FileCheck2,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface StudentOnboardingModalProps {
  isOpen: boolean
  onClose?: () => void
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
    profileImage?: string
  }
}

export function StudentOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  initialData,
}: StudentOnboardingModalProps) {
  // Steps: 1: Review Academic Details -> 2: Set Password & Email OTP Verification -> 3: Verify All Details & Confirm
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [step3Confirmed, setStep3Confirmed] = useState(false)

  // Form State
  const [form, setForm] = useState({
    phone: initialData.phone || '',
    parentPhone: initialData.parentPhone || '',
    dateOfBirth: initialData.dateOfBirth || '',
    isParentWhatsapp: false,
    bloodGroup: '',
    residencyStatus: '',
    dayScholarType: 'College Bus' as 'College Bus' | 'Out Bus' | '',
    outBusMode: 'Public Bus (TNSTC)',
    busNo: '',
    boardingPoint: '',
    hostelBlock: '',
    roomNo: '',
    hasCorrectionRequest: false,
    correctionRemarks: '',
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

  // Email Uniqueness & Availability Check State
  const [emailCheckStatus, setEmailCheckStatus] = useState<{
    checking: boolean
    available: boolean | null
    message: string | null
  }>({ checking: false, available: null, message: null })


  // Sync state whenever initialData changes
  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      phone: initialData.phone || prev.phone,
      parentPhone: initialData.parentPhone || prev.parentPhone,
      dateOfBirth: initialData.dateOfBirth || prev.dateOfBirth,
      profileImage: initialData.profileImage || prev.profileImage,
    }))
  }, [initialData.phone, initialData.parentPhone, initialData.dateOfBirth, initialData.profileImage])

  // Cooldown countdown timer
  React.useEffect(() => {
    if (emailOtpCooldown <= 0) return
    const timer = setInterval(() => setEmailOtpCooldown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [emailOtpCooldown])

  const isVerifyingOtpRef = useRef(false)
  const lastVerifiedOtpRef = useRef<string | null>(null)

  // Direct, ultra-fast auto-verify function (resilient against React re-render cancellations)
  const verifyOtpCode = async (rawCode: string) => {
    const code = rawCode.trim()
    const email = form.email.trim().toLowerCase()
    if (code.length !== 6 || !email || !email.includes('@')) return
    if (isVerifyingOtpRef.current) return
    if (otpVerified && lastVerifiedOtpRef.current === code) return

    isVerifyingOtpRef.current = true
    setIsVerifyingOtp(true)
    setOtpError(null)

    try {
      const res = await fetch('/api/auth/verify-onboarding-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: code,
          challenge: otpChallenge || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        lastVerifiedOtpRef.current = code
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
            setOnboardingStep(3)
          }, 350)
        }
      } else {
        setOtpVerified(false)
        setOtpError(data.message || 'Invalid verification code. Please check and try again.')
      }
    } catch {
      setOtpError('Network error during auto-verification.')
    } finally {
      isVerifyingOtpRef.current = false
      setIsVerifyingOtp(false)
    }
  }

  // Backup effect for auto-verify if OTP filled via paste or auto-fill
  useEffect(() => {
    const code = (form.emailOtp || '').trim()
    if (code.length === 6 && form.email.trim() && !otpVerified && !isVerifyingOtpRef.current && lastVerifiedOtpRef.current !== code) {
      verifyOtpCode(code)
    } else if (code.length < 6) {
      if (otpVerified) setOtpVerified(false)
      if (otpError) setOtpError(null)
      lastVerifiedOtpRef.current = null
    }
  }, [form.emailOtp, form.email])

  // Correction Modal state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionCategory, setCorrectionCategory] = useState('name')
  const [requestedValue, setRequestedValue] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false)
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false)

  // Handle photo upload and compression
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
            w = Math.round((w * maxDim) / h)
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



  // STEP 1 -> STEP 2: Proceed to Security Step
  const handleProceedToSecurityStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone.trim()) {
      toast.error('Please enter your personal mobile number.')
      return
    }
    if (!form.parentPhone.trim()) {
      toast.error('Please enter parent/guardian mobile number.')
      return
    }
    if (!form.residencyStatus || !form.residencyStatus.trim()) {
      toast.error('Please select your Residency Status (Day Scholar or Hostel).')
      return
    }
    if (form.residencyStatus === 'Day Scholar' && form.dayScholarType === 'College Bus' && !form.busNo.trim()) {
      toast.error('Please enter your College Bus / Route Number.')
      return
    }
    if (form.residencyStatus === 'Hostel' && (!form.hostelBlock.trim() || !form.roomNo.trim())) {
      toast.error('Please enter your Hostel Block and Room Number.')
      return
    }
    if (!form.detailsConfirmed) {
      toast.error('Please check the verification attestation box to confirm your details.')
      return
    }
    setOnboardingStep(2)
  }

  // Real-time debounced email availability check
  React.useEffect(() => {
    const rawEmail = form.email?.trim().toLowerCase()
    if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) {
      setEmailCheckStatus({ checking: false, available: null, message: null })
      return
    }

    setEmailCheckStatus((prev) => ({ ...prev, checking: true }))

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: rawEmail,
            registerNumber: initialData.registerNumber,
          }),
        })
        const data = await res.json()
        setEmailCheckStatus({
          checking: false,
          available: Boolean(data.available),
          message: data.message || (data.available ? null : `The email address ${rawEmail} is already linked to another account.`),
        })
      } catch {
        setEmailCheckStatus({ checking: false, available: true, message: null })
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [form.email, initialData.registerNumber])

  // Send Email OTP
  const handleSendEmailOTP = async () => {
    if (!form.email.trim() || !form.email.includes('@')) {
      toast.error('Please enter a valid personal email address.')
      return
    }

    if (emailCheckStatus.available === false) {
      toast.error(
        emailCheckStatus.message ||
        'This email address is already linked to another account. Please use a unique personal email.'
      )
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          name: initialData.name,
          regNo: initialData.registerNumber,
          advisorName: initialData.advisorName,
          year: initialData.year,
          semester: initialData.semester,
          section: initialData.section,
          department: initialData.department,
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
        if (data.demoOtp) {
          setDemoOtp(data.demoOtp)
        }
        toast.success(`Verification OTP sent to ${form.email.trim()}`)
      } else {
        const errorMsg = data.message || 'Failed to send OTP'
        toast.error(errorMsg)
        if (errorMsg.includes('already linked') || errorMsg.includes('already registered')) {
          setEmailCheckStatus({
            checking: false,
            available: false,
            message: errorMsg,
          })
        }
      }
    } catch {
      toast.error('Network error sending OTP. Please try again.')

    } finally {
      setLoading(false)
    }
  }

  // STEP 2 -> STEP 3: Validate Password & OTP, proceed to Review Details Step
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
      const finalResidency = form.residencyStatus === 'Day Scholar'
        ? (form.dayScholarType === 'College Bus'
            ? `Day Scholar · College Bus ${form.busNo ? `No. ${form.busNo}` : ''} ${form.boardingPoint ? `(${form.boardingPoint})` : ''}`.trim()
            : `Day Scholar · Out Bus (${form.outBusMode || 'Public Bus'}) ${form.boardingPoint ? `From: ${form.boardingPoint}` : ''}`.trim())
        : (form.residencyStatus === 'Hostel'
            ? `Hosteller · ${form.hostelBlock || 'Hostel'} ${form.roomNo ? `Room ${form.roomNo}` : ''}`.trim()
            : '')

      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: initialData.name,
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          parentPhone: form.parentPhone.trim(),
          dateOfBirth: form.dateOfBirth,
          isParentWhatsapp: form.isParentWhatsapp,
          bloodGroup: form.bloodGroup,
          residencyStatus: finalResidency || form.residencyStatus,
          busNo: form.busNo,
          boardingPoint: form.boardingPoint,
          hostelBlock: form.hostelBlock,
          roomNo: form.roomNo,
          newPassword: form.newPassword.trim(),
          otp: form.emailOtp.trim(),
          profileImage: form.profileImage || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          const reg = initialData.registerNumber || ''
          if (reg) {
            localStorage.setItem(`vsb_student_onboarding_done_${reg}`, 'true')
            sessionStorage.setItem(`vsb_student_onboarding_done_${reg}`, 'true')

            // Persist full onboarding defaults directly into the student profile storage
            const personalEmailClean = form.email.trim().toLowerCase()
            const updatedProfileData = {
              name: initialData.name,
              email: personalEmailClean,
              personalEmail: personalEmailClean,
              emailVerified: true,
              phone: form.phone.trim(),
              parentPhone: form.parentPhone.trim(),
              isParentWhatsapp: form.isParentWhatsapp,
              dateOfBirth: form.dateOfBirth,
              bloodGroup: form.bloodGroup || '',
              residencyStatus: finalResidency || form.residencyStatus || '',
              busNo: form.busNo.trim(),
              boardingPoint: form.boardingPoint.trim(),
              hostelBlock: form.hostelBlock.trim(),
              roomNo: form.roomNo.trim(),
              profileImage: form.profileImage || undefined,
            }
            try {
              const existing = localStorage.getItem(`vsb_student_profile_v2_${reg}`)
              const merged = existing ? { ...JSON.parse(existing), ...updatedProfileData } : updatedProfileData
              localStorage.setItem(`vsb_student_profile_v2_${reg}`, JSON.stringify(merged))
            } catch {
              localStorage.setItem(`vsb_student_profile_v2_${reg}`, JSON.stringify(updatedProfileData))
            }
            window.dispatchEvent(new CustomEvent('portal-student-profile-updated', { detail: updatedProfileData }))
          }
          if (form.profileImage) {
            localStorage.setItem('user_profile_image', form.profileImage)
            window.dispatchEvent(new CustomEvent('portal-profile-image-updated', { detail: form.profileImage }))
          }
        }
        toast.success('Account fully verified & Password saved!')
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
      setCorrectionSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-[#071A41]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 border border-gray-100 max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-200"
      >
        
        {/* Modal Header with Progress Step Indicator (Exact Match with Image 1) */}
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1557C0] text-[10px] font-black uppercase tracking-wider">
              INITIAL PROFILE VERIFICATION &amp; SECURITY SETUP
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {initialData.registerNumber}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-[#071A41]">
              {onboardingStep === 1 && 'Step 1: Review Your Academic Details'}
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
        {/* STEP 1: REVIEW & EDIT STUDENT PARTICULARS / REQUEST CORRECTION */}
        {/* ========================================================================= */}
        {onboardingStep === 1 && (
          <form onSubmit={handleProceedToSecurityStep} className="space-y-4 text-xs">
            <p className="text-[11px] text-gray-500 font-medium">
              Please carefully verify your official enrollment records below. If any academic details are incorrect, you can request an instant admin correction.
            </p>

            {/* Official Academic Record (Locked by Admin) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#1557C0]/10 flex items-center justify-center text-[#1557C0]">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-black text-[#071A41] text-xs block">Official Academic Record</span>
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
                      Your request to modify academic details has been submitted. The Administrator will review and update official records.
                    </span>
                  </div>
                </div>
              )}

              {/* 6 High-Contrast Locked Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Register Number */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">🆔 REGISTER NUMBER</span>
                    <span className="font-mono font-black text-xs text-[#071A41]">{initialData.registerNumber}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Lock className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>

                {/* Full Name */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">👤 FULL NAME</span>
                    <span className="font-bold text-xs text-[#071A41]">{initialData.name}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Program / Department */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">🏛️ PROGRAM / DEPARTMENT</span>
                    <span className="font-bold text-xs text-[#1557C0]">{initialData.department || 'B.Tech Artificial Intelligence & Data Science'}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Year & Semester */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">📅 YEAR &amp; SEMESTER</span>
                    <span className="font-bold text-xs text-[#071A41]">Year {initialData.year} · Semester {initialData.semester}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Assigned Section */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">🏷️ ASSIGNED SECTION</span>
                    <span className="font-bold text-xs text-[#071A41]">Section {initialData.section}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Class Advisor */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">👨‍🏫 CLASS ADVISOR / MENTOR</span>
                    <span className="font-bold text-xs text-[#1557C0]">{initialData.advisorName || 'Assigned Faculty Mentor'}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Student Passport Photograph Upload Section */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#071A41]">
                  <Camera className="w-4 h-4 text-[#1557C0]" />
                  <span>Student Passport Photograph (Pre-filled on ID Card)</span>
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
                      alt="Student Photo"
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
                    Upload a clear frontal passport size photograph (JPG, PNG). This will appear on your Student Portal &amp; downloadable Digital ID Card.
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    📱 Student Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit mobile"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    👨‍👩‍👧 Parent Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter parent / guardian mobile"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                  />
                  <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isParentWhatsapp}
                      onChange={(e) => setForm({ ...form, isParentWhatsapp: e.target.checked })}
                      className="rounded border-gray-300 text-[#16a34a] focus:ring-[#16a34a] w-3 h-3"
                    />
                    <span className="text-[10px] font-semibold text-gray-600">💬 Available on WhatsApp</span>
                  </label>
                </div>

                <div className="sm:col-span-3 pt-1 border-t border-blue-200/50">
                  <label className="block font-bold text-gray-700 text-[11px] mb-1.5 flex items-center justify-between">
                    <span>🎂 Date of Birth (Day / Month / Year) *</span>
                    {form.dateOfBirth && form.dateOfBirth.includes('-') && (
                      <span className="text-[10px] font-bold text-[#1557C0] bg-blue-100/70 px-2 py-0.5 rounded-md">
                        Selected: {form.dateOfBirth.split('-')[2]}-{['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(form.dateOfBirth.split('-')[1], 10)] || form.dateOfBirth.split('-')[1]}-{form.dateOfBirth.split('-')[0]} (DD-MM-YYYY)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Day Selector */}
                    <div>
                      <select
                        value={form.dateOfBirth ? (form.dateOfBirth.split('-')[2] || '') : ''}
                        onChange={(e) => {
                          const parts = (form.dateOfBirth || '2005-01-01').split('-')
                          const y = parts[0] || '2005'
                          const m = parts[1] || '01'
                          setForm({ ...form, dateOfBirth: `${y}-${m}-${e.target.value.padStart(2, '0')}` })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-300 font-medium text-xs text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      >
                        <option value="">📅 Day (DD)</option>
                        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Month Selector */}
                    <div>
                      <select
                        value={form.dateOfBirth ? (form.dateOfBirth.split('-')[1] || '') : ''}
                        onChange={(e) => {
                          const parts = (form.dateOfBirth || '2005-01-01').split('-')
                          const y = parts[0] || '2005'
                          const d = parts[2] || '01'
                          setForm({ ...form, dateOfBirth: `${y}-${e.target.value.padStart(2, '0')}-${d}` })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-300 font-medium text-xs text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      >
                        <option value="">🗓️ Month (MM)</option>
                        {[
                          { val: '01', label: '01 - January' },
                          { val: '02', label: '02 - February' },
                          { val: '03', label: '03 - March' },
                          { val: '04', label: '04 - April' },
                          { val: '05', label: '05 - May' },
                          { val: '06', label: '06 - June' },
                          { val: '07', label: '07 - July' },
                          { val: '08', label: '08 - August' },
                          { val: '09', label: '09 - September' },
                          { val: '10', label: '10 - October' },
                          { val: '11', label: '11 - November' },
                          { val: '12', label: '12 - December' },
                        ].map((m) => (
                          <option key={m.val} value={m.val}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year Selector */}
                    <div>
                      <select
                        value={form.dateOfBirth ? (form.dateOfBirth.split('-')[0] || '') : ''}
                        onChange={(e) => {
                          const parts = (form.dateOfBirth || '2005-01-01').split('-')
                          const m = parts[1] || '01'
                          const d = parts[2] || '01'
                          setForm({ ...form, dateOfBirth: `${e.target.value}-${m}-${d}` })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-300 font-medium text-xs text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      >
                        <option value="">📆 Year (YYYY)</option>
                        {Array.from({ length: 30 }, (_, i) => String(2012 - i)).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🩸 Blood Group
                  </label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">🅰️ A+ (Positive)</option>
                    <option value="A-">🅰️ A- (Negative)</option>
                    <option value="B+">🅱️ B+ (Positive)</option>
                    <option value="B-">🅱️ B- (Negative)</option>
                    <option value="AB+">🆎 AB+ (Positive)</option>
                    <option value="AB-">🆎 AB- (Negative)</option>
                    <option value="O+">🅾️ O+ (Positive)</option>
                    <option value="O-">🅾️ O- (Negative)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🏠 Residency Details *
                  </label>
                  <select
                    required
                    value={form.residencyStatus}
                    onChange={(e) => setForm({ ...form, residencyStatus: e.target.value, busNo: '', boardingPoint: '', hostelBlock: '', roomNo: '' })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                  >
                    <option value="">Select Residency *</option>
                    <option value="Day Scholar">🏡 Dayscholar</option>
                    <option value="Hostel">🏢 Hostel (Campus Resident)</option>
                  </select>
                </div>
              </div>

              {/* Day Scholar Sub-Options */}
              {form.residencyStatus === 'Day Scholar' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                      <span>🚌</span> Dayscholar Commute Options *
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-100/80 px-2 py-0.5 rounded-md">
                      Daily Transport
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 text-[10px] mb-1.5">
                      Select Mode of Transport *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'College Bus', label: 'College Bus', icon: '🚌' },
                        { id: 'Out Bus', label: 'Out Bus', icon: '🚐' },
                        { id: 'Bike', label: 'Bike', icon: '🏍️' },
                        { id: 'Self', label: 'Self / Walk', icon: '🚶' },
                      ].map((mode) => (
                        <button
                          type="button"
                          key={mode.id}
                          onClick={() => setForm({ ...form, dayScholarType: mode.id as any })}
                          className={cn(
                            "p-2 rounded-xl border text-left flex items-center gap-1.5 transition-all cursor-pointer font-bold text-[11px]",
                            form.dayScholarType === mode.id
                              ? "bg-[#1557C0] text-white border-[#1557C0] shadow-sm"
                              : "bg-white text-[#071A41] border-gray-200 hover:border-blue-300"
                          )}
                        >
                          <span className="text-sm">{mode.icon}</span>
                          <span>{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1. College Bus */}
                  {form.dayScholarType === 'College Bus' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block font-bold text-gray-700 text-[10px] mb-1">
                          🚌 College Bus / Route No. *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bus 12 / Route 08"
                          value={form.busNo}
                          onChange={(e) => setForm({ ...form, busNo: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[10px] mb-1">
                          📍 Boarding Point Details *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Karur Central Bus Stand"
                          value={form.boardingPoint}
                          onChange={(e) => setForm({ ...form, boardingPoint: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. Out Bus */}
                  {form.dayScholarType === 'Out Bus' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block font-bold text-gray-700 text-[10px] mb-1">
                          📍 Boarding Point Details *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Town Hall Stop / Gandhigramam"
                          value={form.boardingPoint}
                          onChange={(e) => setForm({ ...form, boardingPoint: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[10px] mb-1">
                          🏷️ Select Transport Services *
                        </label>
                        <select
                          value={form.outBusMode}
                          onChange={(e) => setForm({ ...form, outBusMode: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                        >
                          <option value="TNSTC Public Bus">🚌 TNSTC Public Government Bus</option>
                          <option value="Private Bus Service">🚐 Private Bus Service</option>
                          <option value="Town Bus / Route Bus">🚏 Town Bus / City Transit</option>
                          <option value="Share Auto / Van">🛺 Share Auto / Private Van</option>
                          <option value="Other Transport Service">🚗 Other Transport Service</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 3. Bike or Self */}
                  {(form.dayScholarType === ('Bike' as any) || form.dayScholarType === ('Self' as any)) && (
                    <div className="pt-1">
                      <label className="block font-bold text-gray-700 text-[10px] mb-1">
                        📍 Starting Point / Location Details *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Thanthonimalai / Velliyanai / Near Campus"
                        value={form.boardingPoint}
                        onChange={(e) => setForm({ ...form, boardingPoint: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Hosteller Sub-Options */}
              {form.residencyStatus === 'Hostel' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/90 to-fuchsia-50/60 border border-purple-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-purple-950 flex items-center gap-1.5">
                      <span>🏢</span> Campus Hostel Accommodation *
                    </span>
                    <span className="text-[10px] text-purple-700 font-bold bg-purple-100/80 px-2 py-0.5 rounded-md">
                      Resident
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 6 Hostel Options */}
                    <div>
                      <label className="block font-bold text-gray-700 text-[10px] mb-1">
                        🏢 Hostel Number / Block (6 Options) *
                      </label>
                      <select
                        required
                        value={form.hostelBlock}
                        onChange={(e) => setForm({ ...form, hostelBlock: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select Hostel Block *</option>
                        <option value="Boys Hostel I">👦 Boys Hostel I</option>
                        <option value="Boys Hostel II">👦 Boys Hostel II</option>
                        <option value="Boys Hostel III">👦 Boys Hostel III</option>
                        <option value="Girls Hostel I">👧 Girls Hostel I</option>
                        <option value="Girls Hostel II">👧 Girls Hostel II</option>
                        <option value="Girls Hostel III">👧 Girls Hostel III</option>
                      </select>
                    </div>

                    {/* Room Number */}
                    <div>
                      <label className="block font-bold text-gray-700 text-[10px] mb-1">
                        🚪 Room No. *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Room 204 / B-102"
                        value={form.roomNo}
                        onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Institutional Student Declaration & Attestation Card */}
            <div className={cn(
              "relative rounded-2xl border-2 p-4 transition-all duration-200",
              form.detailsConfirmed
                ? "bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-emerald-50/30 border-blue-400/90 shadow-sm shadow-blue-500/10"
                : "bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-xs"
            )}>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="mt-0.5 flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    required
                    checked={form.detailsConfirmed}
                    onChange={(e) => setForm({ ...form, detailsConfirmed: e.target.checked })}
                    className="w-5 h-5 rounded-md text-[#1557C0] border-slate-300 focus:ring-2 focus:ring-[#1557C0] focus:ring-offset-1 cursor-pointer transition-all"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className={cn("w-4 h-4", form.detailsConfirmed ? "text-emerald-600" : "text-[#1557C0]")} />
                      <span className="text-xs font-black text-[#071A41] uppercase tracking-wide">
                        Student Particulars &amp; Identity Attestation
                      </span>
                    </div>
                    {form.detailsConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Attested by Student
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                        Mandatory Confirmation
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    I solemnly declare and confirm that I have thoroughly verified all my academic particulars, registration number, parent/student contact details, and photograph displayed above. I understand these records will be permanently linked to my official V.S.B. student profile and digital ID.
                  </p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium order-2 sm:order-1">
                <FileCheck2 className="w-3.5 h-3.5 text-[#1557C0]" />
                <span>Step 1 of 3: Verification &amp; Attestation</span>
              </div>

              <button
                type="submit"
                className={cn(
                  "w-full sm:w-auto px-7 py-3 rounded-xl font-black flex items-center justify-center gap-2.5 shadow-md transition-all text-xs sm:text-sm order-1 sm:order-2 group",
                  form.detailsConfirmed
                    ? "bg-gradient-to-r from-[#071A41] via-[#0E387A] to-[#1557C0] hover:from-[#051330] hover:to-[#0d45b5] text-white shadow-blue-900/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none"
                )}
              >
                <span>Proceed to Password &amp; Email Setup</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
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
                      autoComplete="new-password"
                      placeholder="Create strong password"
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-300 bg-white font-medium text-xs sm:text-sm text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-300 bg-white font-medium text-xs sm:text-sm text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Email Verification via OTP */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <span className="font-black text-[#071A41] flex items-center gap-1.5 text-xs">
                  <Mail className="w-4 h-4 text-[#1557C0]" />
                  Verify Student Email via OTP *
                </span>
                <span className="text-[10px] font-bold text-blue-700">Official Communication</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 text-[11px] mb-1">
                  Email Address *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter personal email (e.g. name@gmail.com)"
                    value={form.email}
                    onChange={(e) => {
                      const val = e.target.value
                      setForm((prev) => ({
                        ...prev,
                        email: val,
                        ...(emailOtpSent || otpVerified ? { emailOtp: '' } : {}),
                      }))
                      if (emailOtpSent || otpVerified) {
                        setEmailOtpSent(false)
                        setOtpVerified(false)
                        setOtpError(null)
                      }
                    }}
                    className={cn(
                      "flex-1 w-full p-2.5 sm:p-3 rounded-xl border bg-white font-medium text-xs sm:text-sm text-[#071A41] focus:ring-2 focus:outline-none transition-all",
                      emailCheckStatus.available === false
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                        : emailCheckStatus.available === true
                        ? "border-emerald-400 focus:ring-emerald-500 bg-emerald-50/15"
                        : "border-gray-300 focus:ring-[#1557C0]"
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailOTP}
                    disabled={
                      loading ||
                      emailOtpCooldown > 0 ||
                      emailCheckStatus.available === false ||
                      emailCheckStatus.checking
                    }
                    className={cn(
                      "w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shrink-0 cursor-pointer shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5",
                      emailCheckStatus.available === false
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                        : "bg-[#1557C0] hover:bg-[#0e44b5] text-white"
                    )}
                  >
                    {emailCheckStatus.checking ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {emailOtpCooldown > 0
                        ? `Resend (${emailOtpCooldown}s)`
                        : emailOtpSent
                        ? 'Resend OTP'
                        : 'Send Code'}
                    </span>
                  </button>
                </div>

                {/* Email Check Feedback Status Indicator */}
                {emailCheckStatus.checking && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#1557C0] font-medium animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Checking email availability...</span>
                  </div>
                )}

                {emailCheckStatus.available === false && (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 text-xs font-semibold shadow-2xs animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-black text-rose-900 text-xs">Email Already Linked to Another Account</p>
                      <p className="text-[11px] text-rose-700 font-medium leading-snug mt-0.5">
                        {emailCheckStatus.message ||
                          `The email address ${form.email} is already linked to another account. Please use your unique personal or official email.`}
                      </p>
                    </div>
                  </div>
                )}

                {emailCheckStatus.available === true && form.email && form.email.includes('@') && !emailOtpSent && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Email is unique & ready. Click &quot;Send Code&quot; to receive your verification OTP.</span>
                  </div>
                )}
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
                    onClick={() => {
                      setForm((prev) => ({ ...prev, emailOtp: demoOtp }))
                      verifyOtpCode(demoOtp)
                    }}
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
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setForm((prev) => ({ ...prev, emailOtp: digits }))
                      if (digits.length === 6 && digits !== lastVerifiedOtpRef.current) {
                        verifyOtpCode(digits)
                      } else if (digits.length < 6) {
                        if (otpVerified) setOtpVerified(false)
                        if (otpError) setOtpError(null)
                        lastVerifiedOtpRef.current = null
                      }
                    }}
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
        {/* STEP 3: VERIFY ALL DETAILS & FINAL CONFIRMATION (CONTACT ADMIN IF CHANGES) */}
        {/* ========================================================================= */}
        {onboardingStep === 3 && (
          <form onSubmit={handleCompleteOnboarding} className="space-y-4 text-xs">
            <p className="text-[11px] text-gray-500 font-medium">
              Please thoroughly verify all your student particulars, contact details, and security credentials below before confirming.
            </p>

            {/* Comprehensive Details Review Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-xs">
              
              {/* Header inside summary with Photo & Identity */}
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200">
                {form.profileImage ? (
                  <img
                    src={form.profileImage}
                    alt="Student Photo"
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
                      {initialData.registerNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                    {initialData.department || 'B.Tech AI & Data Science'} · Year {initialData.year} · Sem {initialData.semester} (Sec {initialData.section})
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                    Class Advisor: {initialData.advisorName || 'Assigned Faculty Mentor'}
                  </p>
                </div>
              </div>

              {/* Grid of Verified Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">STUDENT MOBILE</span>
                  <span className="font-mono font-bold text-[#071A41]">{form.phone || 'Not provided'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">PARENT MOBILE</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#071A41]">{form.parentPhone || 'Not provided'}</span>
                    {form.isParentWhatsapp && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        WhatsApp
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">DATE OF BIRTH</span>
                  <span className="font-bold text-[#071A41]">
                    {form.dateOfBirth
                      ? form.dateOfBirth.includes('-')
                        ? `${form.dateOfBirth.split('-')[2]}-${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(form.dateOfBirth.split('-')[1], 10)] || form.dateOfBirth.split('-')[1]}-${form.dateOfBirth.split('-')[0]}`
                        : form.dateOfBirth
                      : 'Not provided'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">BLOOD GROUP</span>
                  <span className="font-bold text-[#071A41]">{form.bloodGroup || 'Not specified'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 sm:col-span-2">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">RESIDENCY &amp; TRANSPORT</span>
                  <span className="font-bold text-[#071A41]">
                    {form.residencyStatus === 'Day Scholar'
                      ? `Day Scholar · ${form.dayScholarType} ${form.busNo ? `(${form.busNo})` : ''} ${form.boardingPoint ? `at ${form.boardingPoint}` : ''}`
                      : form.residencyStatus === 'Hostel'
                      ? `Hostel · ${form.hostelBlock} ${form.roomNo ? `(${form.roomNo})` : ''}`
                      : form.residencyStatus || 'Day Scholar'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 sm:col-span-2">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">VERIFIED STUDENT EMAIL</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#1557C0] truncate">{form.email}</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> OTP Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prominent Admin Contact / Change Notice (EXACT REQUIREMENT) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300/90 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-200/90 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-black text-xs text-amber-950">
                    Important: Verify All Details &amp; Future Corrections
                  </h5>
                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    Please verify all your details above. Once confirmed, you cannot edit official particulars directly from your portal. <strong>If any changes are required, you must contact the Department Administrator.</strong>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-amber-800">
                  Any mistakes in academic records or personal details?
                </span>
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-400 text-amber-900 hover:bg-amber-100 text-[11px] font-black transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Pencil className="w-3 h-3 text-amber-700" />
                  <span>Contact Admin / Request Correction</span>
                </button>
              </div>
            </div>

            {/* Institutional Verification Declaration & Authorization Card */}
            <div className={cn(
              "relative rounded-2xl border-2 p-4 transition-all duration-200",
              step3Confirmed
                ? "bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-blue-50/30 border-emerald-400/90 shadow-sm shadow-emerald-500/10"
                : "bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-xs"
            )}>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="mt-0.5 flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    required
                    checked={step3Confirmed}
                    onChange={(e) => setStep3Confirmed(e.target.checked)}
                    className="w-5 h-5 rounded-md text-emerald-600 border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer transition-all"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className={cn("w-4 h-4", step3Confirmed ? "text-emerald-600" : "text-[#1557C0]")} />
                      <span className="text-xs font-black text-[#071A41] uppercase tracking-wide">
                        Final Academic Authorization &amp; Portal Enrollment
                      </span>
                    </div>
                    {step3Confirmed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Attested &amp; Authorized
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    I solemnly confirm that I have verified all details above. I acknowledge that upon completion, my official records are locked and any future corrections must be petitioned through the Department Administrator.
                  </p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOnboardingStep(2)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer text-xs transition-colors order-2 sm:order-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 2</span>
              </button>

              <button
                type="submit"
                disabled={loading || !step3Confirmed}
                className={cn(
                  "w-full sm:w-auto px-8 py-3 rounded-xl font-black flex items-center justify-center gap-2.5 shadow-md transition-all text-xs sm:text-sm order-1 sm:order-2 group",
                  step3Confirmed && !loading
                    ? "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none"
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Authorize &amp; Enter Student Portal</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 📝 OFFICIAL ACADEMIC CORRECTION REQUEST MODAL TO ADMIN */}
      {/* ========================================================================= */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-[100000] bg-[#071A41]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-amber-200 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-[#071A41] text-sm">Request Official Academic Correction</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Requires Verification &amp; Approval by Department Admin</p>
                </div>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {correctionSubmitted ? (
              <div className="py-6 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h5 className="font-black text-sm text-[#071A41]">Correction Request Submitted</h5>
                <p className="text-xs text-slate-500">
                  Your request has been forwarded to the Department Admin. Changes will reflect once verified against university records.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1557C0] text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendCorrectionRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Select Detail to Correct *
                  </label>
                  <select
                    value={correctionCategory}
                    onChange={(e) => setCorrectionCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  >
                    <option value="name">Full Name (Spelling / Initials)</option>
                    <option value="department">Program / Department</option>
                    <option value="year">Year of Study</option>
                    <option value="semester">Current Semester</option>
                    <option value="section">Assigned Section (A / B / C)</option>
                    <option value="advisorName">Class Advisor / Mentor</option>
                    <option value="dateOfBirth">Date of Birth</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Requested / Corrected Value *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter the correct value"
                    value={requestedValue}
                    onChange={(e) => setRequestedValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Reason / Official Proof Notes *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Briefly state reason (e.g. as per 10th marksheet, allotment order...)"
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={correctionSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#1557C0] hover:bg-[#0e44b5] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {correctionSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Submit to Admin</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
