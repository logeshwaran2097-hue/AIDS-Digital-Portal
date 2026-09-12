'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  onClose?: () => void
  onComplete: (updatedData?: any) => void
  initialData: {
    name: string
    email: string
    phone?: string
    facultyId?: string
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
  onClose,
  onComplete,
  initialData,
}: StaffOnboardingModalProps) {
  // 3-Step Wizard: 1. Review Official Particulars -> 2. Password & Email OTP -> 3. Verify All Details & Confirm
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [step3Confirmed, setStep3Confirmed] = useState(false)

  let initDay = ''
  let initMonth = ''
  let initYear = ''
  if (initialData.dateOfBirth && !initialData.dateOfBirth.startsWith('1990-01-01')) {
    const parts = initialData.dateOfBirth.split('T')[0].split('-')
    if (parts.length === 3) {
      initYear = parts[0]
      initMonth = parts[1]
      initDay = parts[2]
    }
  }

  const [dobDay, setDobDay] = useState(initDay)
  const [dobMonth, setDobMonth] = useState(initMonth)
  const [dobYear, setDobYear] = useState(initYear)

  const initialEmail =
    initialData.email &&
    !initialData.email.toLowerCase().endsWith('@vsb.edu.in') &&
    !initialData.email.toLowerCase().includes('mock')
      ? initialData.email.trim()
      : initialData.email && initialData.email.includes('@') && !initialData.email.toLowerCase().includes('mock')
      ? initialData.email.trim()
      : ''

  // Form State
  const [form, setForm] = useState({
    name: initialData.name || '',
    phone: initialData.phone || '',
    dateOfBirth: initYear && initMonth && initDay ? `${initYear}-${initMonth}-${initDay}` : '',
    cabin: '',
    specialization: initialData.specialization || '',
    qualification: initialData.qualification || '',
    experience: initialData.experience ? String(initialData.experience) : '',
    detailsConfirmed: true,
    profileImage: initialData.profileImage || '',
    email: initialEmail,
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


  // Correction Modal State
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionCategory, setCorrectionCategory] = useState('designation')
  const [requestedValue, setRequestedValue] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false)
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false)

  // Sync initialData changes
  useEffect(() => {
    let day = ''
    let month = ''
    let year = ''
    if (initialData.dateOfBirth && !initialData.dateOfBirth.startsWith('1990-01-01')) {
      const parts = initialData.dateOfBirth.split('T')[0].split('-')
      if (parts.length === 3) {
        year = parts[0]
        month = parts[1]
        day = parts[2]
        setDobDay(day)
        setDobMonth(month)
        setDobYear(year)
      }
    }
    setForm((prev) => ({
      ...prev,
      name: initialData.name || prev.name,
      phone: initialData.phone || prev.phone,
      dateOfBirth: year && month && day ? `${year}-${month}-${day}` : prev.dateOfBirth,
      specialization: initialData.specialization || prev.specialization,
      qualification: initialData.qualification || prev.qualification,
      experience: initialData.experience ? String(initialData.experience) : prev.experience,
      profileImage: initialData.profileImage || prev.profileImage,
      email: prev.email || (initialData.email && !initialData.email.toLowerCase().includes('mock') ? initialData.email.trim() : ''),
    }))
  }, [initialData])

  const handleDobChange = (newDay: string, newMonth: string, newYear: string) => {
    setDobDay(newDay)
    setDobMonth(newMonth)
    setDobYear(newYear)
    if (newDay && newMonth && newYear) {
      setForm((prev) => ({
        ...prev,
        dateOfBirth: `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`,
      }))
    } else {
      setForm((prev) => ({ ...prev, dateOfBirth: '' }))
    }
  }

  // Cooldown countdown timer
  useEffect(() => {
    if (emailOtpCooldown <= 0) return
    const timer = setInterval(() => setEmailOtpCooldown((prev) => Math.max(0, prev - 1)), 1000)
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
  const isAdvisorRole = role === 'advisor' || Boolean(initialData.advisorBatch || (initialData.advisorYear && initialData.advisorSec))
  const advisorBatchText =
    initialData.advisorBatch ||
    (initialData.advisorYear && initialData.advisorSec
      ? `Year ${initialData.advisorYear} · Sem ${initialData.advisorSem || 3} · Sec ${initialData.advisorSec}`
      : isAdvisorRole ? 'Year II · Sem 3 · Sec B' : null)

  let parsedSubjectsText = ''
  if (initialData.subjects && initialData.subjects !== '[]' && initialData.subjects !== '""') {
    try {
      const subs = JSON.parse(initialData.subjects)
      parsedSubjectsText = Array.isArray(subs) && subs.length > 0 ? subs.join(', ') : initialData.subjects
    } catch {
      parsedSubjectsText = initialData.subjects
    }
  }

  let allocationLabel = 'DEPARTMENT ALLOCATION'
  let allocationValue = 'Artificial Intelligence & Data Science'
  if (role === 'hod') {
    allocationLabel = 'DEPARTMENT HEADSHIP'
    allocationValue = 'Head of Department · AI & DS'
  } else if (isAdvisorRole && parsedSubjectsText) {
    allocationLabel = 'MENTORSHIP BATCH & ALLOCATED COURSES'
    allocationValue = `${advisorBatchText || 'Class Advisor'} · ${parsedSubjectsText}`
  } else if (isAdvisorRole) {
    allocationLabel = 'ASSIGNED MENTORSHIP BATCH'
    allocationValue = advisorBatchText || 'Class Advisor · AI & DS'
  } else {
    allocationLabel = 'ALLOCATED COURSES / LABS'
    allocationValue = parsedSubjectsText || 'Assigned Departmental Courses'
  }

  // STEP 1 -> STEP 2: Proceed to Security Step
  const handleProceedToSecurityStep = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanPhone = form.phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit direct mobile / WhatsApp number.')
      return
    }
    if (!dobDay || !dobMonth || !dobYear) {
      toast.error('Please select your complete Date of Birth (Day, Month, Year).')
      return
    }
    if (!form.detailsConfirmed) {
      toast.error('Please check the confirmation box verifying your particulars.')
      return
    }
    setOnboardingStep(2)
  }

  // Real-time debounced email availability check
  useEffect(() => {
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
            facultyId: initialData.facultyId,
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
  }, [form.email, initialData.facultyId])

  // Send Email OTP
  const handleSendEmailOTP = async () => {
    if (!form.email.trim() || !form.email.includes('@')) {
      toast.error('Please enter a valid official/personal email address.')
      return
    }

    if (emailCheckStatus.available === false) {
      toast.error(
        emailCheckStatus.message ||
        'This email address is already linked to another account. Please use a unique official email.'
      )
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-onboarding-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          name: form.name || initialData.name,
          facultyId: initialData.facultyId,
          role,
          subjectName: parsedSubjectsText || initialData.subjects || '',
          department: initialData.department || 'B.Tech Artificial Intelligence & Data Science',
          advisorYear: initialData.advisorYear,
          advisorSem: initialData.advisorSem,
          advisorSec: initialData.advisorSec,
          advisorBatch: initialData.advisorBatch,
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
      toast.error(otpError || 'Please enter a valid OTP code.')
      return
    }
    if (!otpVerified) {
      toast.error('Please verify the 6-digit email OTP before proceeding.')
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
        advisorBatch: initialData.advisorBatch || undefined,
        advisorYear: initialData.advisorYear || undefined,
        advisorSem: initialData.advisorSem || undefined,
        advisorSec: initialData.advisorSec || undefined,
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
        const staffKey = initialData.facultyId || initialData.email || 'staff'
        if (typeof window !== 'undefined') {
          localStorage.setItem(`vsb_staff_onboarding_done_${staffKey}`, 'true')
          sessionStorage.setItem(`vsb_staff_onboarding_done_${staffKey}`, 'true')
        }
        toast.success('Account fully verified & Password saved! Welcome to the portal.')
        setTimeout(() => {
          onComplete(data.user || payload)
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
    <div className="fixed inset-0 z-[99999] bg-[#071A41]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 border border-gray-100 max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-200"
      >
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
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Dismiss modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
          <form onSubmit={handleProceedToSecurityStep} noValidate className="space-y-4 text-xs">
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

              {/* High-Contrast Locked Official Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Full Name */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">FULL NAME</span>
                    <span className="font-bold text-xs text-[#071A41]">{initialData.name}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Lock className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>

                {/* Designation */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">DESIGNATION</span>
                    <span className="font-bold text-xs text-[#071A41]">{initialData.designation}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Program / Department */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">DEPARTMENT</span>
                    <span className="font-bold text-xs text-[#1557C0]">{initialData.department || 'Artificial Intelligence & Data Science'}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Assigned Batch / Allocated Subjects */}
                {isAdvisorRole && advisorBatchText && parsedSubjectsText ? (
                  <>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">ASSIGNED MENTORSHIP BATCH</span>
                        <span className="font-bold text-xs text-[#1557C0] truncate block">{advisorBatchText}</span>
                      </div>
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">ALLOCATED COURSES / LABS</span>
                        <span className="font-bold text-xs text-[#1557C0] truncate block">{parsedSubjectsText}</span>
                      </div>
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>
                  </>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between sm:col-span-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">{allocationLabel}</span>
                      <span className="font-bold text-xs text-[#1557C0] truncate block">{allocationValue}</span>
                    </div>
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                  </div>
                )}

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

                <div className="sm:col-span-2 pt-1 border-t border-blue-200/50">
                  <label className="block font-bold text-gray-700 text-[11px] mb-1.5 flex items-center justify-between">
                    <span>Date of Birth (Day / Month / Year) *</span>
                    {dobDay && dobMonth && dobYear && (
                      <span className="text-[10px] font-bold text-[#1557C0] bg-blue-100/70 px-2 py-0.5 rounded-md">
                        Selected: {dobDay}-{['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(dobMonth, 10)] || dobMonth}-{dobYear} (DD-MM-YYYY)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Day Selector */}
                    <div>
                      <select
                        value={dobDay}
                        onChange={(e) => handleDobChange(e.target.value, dobMonth, dobYear)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-xs text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      >
                        <option value="">Day (DD)</option>
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
                        value={dobMonth}
                        onChange={(e) => handleDobChange(dobDay, e.target.value, dobYear)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-xs text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      >
                        <option value="">Month (MM)</option>
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
                        value={dobYear}
                        onChange={(e) => handleDobChange(dobDay, dobMonth, e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-xs text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      >
                        <option value="">Year (YYYY)</option>
                        {Array.from({ length: 55 }, (_, i) => String(2005 - i)).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
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

            {/* Institutional Staff Declaration & Attestation Card */}
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
                        Staff Particulars &amp; Official Identity Attestation
                      </span>
                    </div>
                    {form.detailsConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Attested by Faculty
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                        Mandatory Confirmation
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    I solemnly declare and confirm that I have reviewed my staff appointment particulars, direct contact numbers, and departmental allocations.
                  </p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium order-2 sm:order-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1557C0]" />
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your personal or official email address"
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
                      "flex-1 w-full p-2.5 rounded-xl border bg-white font-medium text-[#071A41] focus:ring-2 focus:outline-none transition-all",
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
                      !form.email.trim() ||
                      emailCheckStatus.available === false ||
                      emailCheckStatus.checking
                    }
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5",
                      emailCheckStatus.available === false
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                        : "bg-[#1557C0] hover:bg-[#0e44b5] text-white"
                    )}
                  >
                    {emailCheckStatus.checking ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : null}
                    <span>
                      {emailOtpCooldown > 0
                        ? `Resend (${emailOtpCooldown}s)`
                        : emailOtpSent
                        ? 'Resend OTP'
                        : 'Send OTP'}
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
                    <span>Email is unique & ready. Click &quot;Send OTP&quot; to receive your verification code.</span>
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
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#1557C0] px-2 py-0.5 rounded-md">
                      {role === 'advisor' ? 'Class Advisor' : role === 'hod' ? 'Head of Department' : 'Faculty Member'}
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
                  <span className="font-bold text-[#071A41]">
                    {form.dateOfBirth && form.dateOfBirth.includes('-')
                      ? `${form.dateOfBirth.split('-')[2]}-${form.dateOfBirth.split('-')[1]}-${form.dateOfBirth.split('-')[0]}`
                      : form.dateOfBirth || 'Not provided'}
                  </span>
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
        <div className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
