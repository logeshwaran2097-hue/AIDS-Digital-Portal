'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  Trash2,
  User as UserIcon,
  BadgeCheck,
  FileCheck2,
  BookOpen,
  MapPin,
  Users,
  Award,
  Sparkles,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { TN_DISTRICTS, DISTRICT_SCHOOLS, OTHER_SCHOOL_OPTION } from '@/data/schoolsData'

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
    gender?: string
    fatherName?: string
    motherName?: string
    address?: string
  }
}

export function StudentOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  initialData,
}: StudentOnboardingModalProps) {
  const [mounted, setMounted] = useState(false)
  
  // 4 Steps: 
  // 1: Review Academic & Personal Details (with Gender)
  // 2: Family & Schooling Academic Records (Father/Mother, Address, 10th & 12th Details)
  // 3: Password & Email OTP Verification
  // 4: Final Review & Confirmation
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4>(1)
  const [loading, setLoading] = useState(false)
  const [step4Confirmed, setStep4Confirmed] = useState(false)
  const [step4Error, setStep4Error] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Form State
  const [form, setForm] = useState({
    // Step 1: Personal & Academic
    phone: initialData.phone || '',
    parentPhone: initialData.parentPhone || '',
    dateOfBirth: initialData.dateOfBirth || '',
    gender: (initialData.gender as 'Male' | 'Female' | 'Other' | '') || '',
    isParentWhatsapp: false,
    bloodGroup: '',
    residencyStatus: '',
    dayScholarType: 'College Bus' as 'College Bus' | 'Out Bus' | 'Bike' | 'Self' | '',
    outBusMode: 'Public Bus (TNSTC)',
    busNo: '',
    boardingPoint: '',
    hostelBlock: '',
    roomNo: '',
    hasCorrectionRequest: false,
    correctionRemarks: '',
    detailsConfirmed: true,
    profileImage: initialData.profileImage || '',

    // Step 2: Family & Schooling Record
    fatherName: initialData.fatherName || '',
    motherName: initialData.motherName || '',
    address: initialData.address || '',
    // 10th (SSLC)
    sslcDistrict: '',
    sslcSchool: '',
    sslcCustomSchool: '',
    sslcMarks: '',
    sslcPercentage: '',
    sslcMedium: '',
    // 12th (HSC)
    hscDistrict: '',
    hscSchool: '',
    hscCustomSchool: '',
    hscMarks: '',
    hscPercentage: '',
    hscCutoff: '',
    hscMedium: '',

    // Step 3: Security & Verification
    email: '',
    newPassword: '',
    confirmPassword: '',
    emailOtp: '',
  })

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0)
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
      gender: (initialData.gender as any) || prev.gender,
      fatherName: initialData.fatherName || prev.fatherName,
      motherName: initialData.motherName || prev.motherName,
      address: initialData.address || prev.address,
    }))
  }, [initialData])

  // Cooldown countdown timer
  React.useEffect(() => {
    if (emailOtpCooldown <= 0) return
    const timer = setInterval(() => setEmailOtpCooldown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [emailOtpCooldown])

  const isVerifyingOtpRef = useRef(false)
  const lastVerifiedOtpRef = useRef<string | null>(null)

  // Direct, ultra-fast auto-verify function
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
      } else {
        lastVerifiedOtpRef.current = null
        setOtpVerified(false)
        setOtpError(data.message || 'Invalid or expired OTP')
      }
    } catch {
      lastVerifiedOtpRef.current = null
      setOtpVerified(false)
      setOtpError('Network error verifying OTP')
    } finally {
      setIsVerifyingOtp(false)
      isVerifyingOtpRef.current = false
    }
  }

  // Handle OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setForm((prev) => ({ ...prev, emailOtp: val }))
    if (otpError) setOtpError(null)
    if (val.length === 6) {
      verifyOtpCode(val)
    } else {
      if (otpVerified) setOtpVerified(false)
    }
  }

  // Auto-calculate 10th percentage when marks change
  const handleSslcMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    let pct = form.sslcPercentage
    if (val && !isNaN(Number(val))) {
      const num = parseFloat(val)
      if (num >= 0 && num <= 500) {
        pct = ((num / 500) * 100).toFixed(2)
      }
    }
    setForm((prev) => ({
      ...prev,
      sslcMarks: val,
      sslcPercentage: pct,
    }))
  }

  // Auto-calculate 12th percentage when marks change
  const handleHscMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    let pct = form.hscPercentage
    if (val && !isNaN(Number(val))) {
      const num = parseFloat(val)
      if (num >= 0 && num <= 600) {
        pct = ((num / 600) * 100).toFixed(2)
      }
    }
    setForm((prev) => ({
      ...prev,
      hscMarks: val,
      hscPercentage: pct,
    }))
  }

  // Real-time Email check
  useEffect(() => {
    const emailToTest = form.email.trim().toLowerCase()
    if (!emailToTest) {
      setEmailCheckStatus({ checking: false, available: null, message: null })
      return
    }

    if (!emailToTest.endsWith('@gmail.com')) {
      setEmailCheckStatus({
        checking: false,
        available: false,
        message: 'Only @gmail.com email addresses are allowed.',
      })
      return
    }

    const timer = setTimeout(async () => {
      setEmailCheckStatus({ checking: true, available: null, message: null })
      try {
        const res = await fetch(
          `/api/auth/check-email-availability?email=${encodeURIComponent(emailToTest)}&regNo=${encodeURIComponent(
            initialData.registerNumber || ''
          )}`
        )
        const data = await res.json()
        if (data.success) {
          setEmailCheckStatus({
            checking: false,
            available: data.available,
            message: data.message || null,
          })
        } else {
          setEmailCheckStatus({
            checking: false,
            available: false,
            message: data.message || 'Email check failed',
          })
        }
      } catch {
        setEmailCheckStatus({ checking: false, available: null, message: null })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [isOpen, form.email, initialData.registerNumber])

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

  // =========================================================================
  // STEP 1 -> STEP 2: Proceed to Family & Schooling
  // =========================================================================
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit student mobile number.')
      return
    }
    if (!form.parentPhone.trim() || form.parentPhone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit parent/guardian mobile number.')
      return
    }
    if (!form.dateOfBirth || !form.dateOfBirth.trim()) {
      toast.error('Please select your Date of Birth.')
      return
    }
    if (!form.gender) {
      toast.error('Please select your Gender.')
      return
    }
    if (!form.bloodGroup || !form.bloodGroup.trim()) {
      toast.error('Please select your Blood Group.')
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

  // =========================================================================
  // STEP 2 -> STEP 3: Proceed to Security & Password
  // =========================================================================
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fatherName || form.fatherName.trim().length < 2) {
      toast.error("Please enter your Father / Guardian's full name.")
      return
    }
    if (!form.motherName || form.motherName.trim().length < 2) {
      toast.error("Please enter your Mother's full name.")
      return
    }
    if (!form.address || form.address.trim().length < 5) {
      toast.error('Please enter your complete permanent residential address.')
      return
    }
    if (!form.sslcDistrict) {
      toast.error('Please select your 10th Standard School District.')
      return
    }
    const finalSslcSchool = form.sslcSchool === OTHER_SCHOOL_OPTION ? form.sslcCustomSchool.trim() : form.sslcSchool.trim()
    if (!finalSslcSchool) {
      toast.error('Please select or specify your 10th Standard School Name.')
      return
    }
    const sslcMarksNum = parseFloat(form.sslcMarks)
    if (isNaN(sslcMarksNum) || sslcMarksNum < 100 || sslcMarksNum > 500) {
      toast.error('Please enter valid 10th Standard marks obtained (out of 500).')
      return
    }
    if (!form.sslcPercentage || isNaN(parseFloat(form.sslcPercentage))) {
      toast.error('Please enter a valid 10th percentage.')
      return
    }
    if (!form.sslcMedium) {
      toast.error('Please select your 10th Standard Medium of Study from the dropdown.')
      return
    }

    if (!form.hscDistrict) {
      toast.error('Please select your 12th Standard School District.')
      return
    }
    const finalHscSchool = form.hscSchool === OTHER_SCHOOL_OPTION ? form.hscCustomSchool.trim() : form.hscSchool.trim()
    if (!finalHscSchool) {
      toast.error('Please select or specify your 12th Standard School Name.')
      return
    }
    const hscMarksNum = parseFloat(form.hscMarks)
    if (isNaN(hscMarksNum) || hscMarksNum < 100 || hscMarksNum > 600) {
      toast.error('Please enter valid 12th Standard marks obtained (out of 600).')
      return
    }
    if (!form.hscPercentage || isNaN(parseFloat(form.hscPercentage))) {
      toast.error('Please enter a valid 12th percentage.')
      return
    }
    const cutoffNum = parseFloat(form.hscCutoff)
    if (isNaN(cutoffNum) || cutoffNum < 50 || cutoffNum > 200) {
      toast.error('Please enter a valid 12th Engineering Cut-off mark (out of 200).')
      return
    }
    if (!form.hscMedium) {
      toast.error('Please select your 12th Standard Medium of Study from the dropdown.')
      return
    }

    setOnboardingStep(3)
  }

  // Send Email OTP
  const handleSendEmailOTP = async () => {
    const normalizedEmail = form.email.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.endsWith('@gmail.com')) {
      toast.error('Only @gmail.com email addresses are permitted (e.g. yourname@gmail.com).')
      return
    }

    if (emailCheckStatus.available === false) {
      toast.error(
        emailCheckStatus.message ||
        'Only @gmail.com email addresses are allowed.'
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
        toast.success(`Verification OTP sent to ${form.email.trim()}`)
      } else {
        const errorMsg = data.message || 'Failed to send OTP'
        toast.error(errorMsg)
        if (
          errorMsg.toLowerCase().includes('already linked') ||
          errorMsg.toLowerCase().includes('already registered') ||
          errorMsg.toLowerCase().includes('already in use') ||
          errorMsg.toLowerCase().includes('rate limit') ||
          errorMsg.toLowerCase().includes('try again')
        ) {
          setEmailCheckStatus({
            checking: false,
            available: false,
            message: errorMsg,
          })
        } else {
          setOtpError(errorMsg)
        }
      }
    } catch {
      toast.error('Network error sending OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // =========================================================================
  // STEP 3 -> STEP 4: Validate Password & OTP, proceed to Final Review
  // =========================================================================
  const handleProceedToStep4 = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.newPassword || form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New password and confirm password do not match.')
      return
    }
    const normalizedEmail = form.email.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.endsWith('@gmail.com')) {
      toast.error('Only @gmail.com personal email addresses are allowed (e.g. yourname@gmail.com).')
      return
    }
    if (!emailOtpSent) {
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

    setOnboardingStep(4)
  }

  // =========================================================================
  // STEP 4: Complete Onboarding & Final Activation
  // =========================================================================
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!step4Confirmed) {
      toast.error('Please check the verification confirmation box before entering the portal.')
      return
    }

    setLoading(true)
    setStep4Error(null)
    try {
      const finalResidency = form.residencyStatus === 'Day Scholar'
        ? (form.dayScholarType === 'College Bus'
            ? `Day Scholar · College Bus ${form.busNo ? `No. ${form.busNo}` : ''} ${form.boardingPoint ? `(${form.boardingPoint})` : ''}`.trim()
            : `Day Scholar · Out Bus (${form.outBusMode || 'Public Bus'}) ${form.boardingPoint ? `From: ${form.boardingPoint}` : ''}`.trim())
        : (form.residencyStatus === 'Hostel'
            ? `Hosteller · ${form.hostelBlock || 'Hostel'} ${form.roomNo ? `Room ${form.roomNo}` : ''}`.trim()
            : '')

      const finalSslcSchool = form.sslcSchool === OTHER_SCHOOL_OPTION ? form.sslcCustomSchool.trim() : form.sslcSchool.trim()
      const finalHscSchool = form.hscSchool === OTHER_SCHOOL_OPTION ? form.hscCustomSchool.trim() : form.hscSchool.trim()

      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-role': 'student',
        },
        body: JSON.stringify({
          name: initialData.name,
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          parentPhone: form.parentPhone.trim(),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          isParentWhatsapp: form.isParentWhatsapp,
          bloodGroup: form.bloodGroup,
          residencyStatus: finalResidency || form.residencyStatus,
          busNo: form.busNo,
          boardingPoint: form.boardingPoint,
          hostelBlock: form.hostelBlock,
          roomNo: form.roomNo,
          // Family & Schooling
          fatherName: form.fatherName.trim(),
          motherName: form.motherName.trim(),
          address: form.address.trim(),
          sslcDistrict: form.sslcDistrict,
          sslcSchool: finalSslcSchool,
          sslcMarks: form.sslcMarks,
          sslcPercentage: form.sslcPercentage,
          sslcMedium: form.sslcMedium,
          hscDistrict: form.hscDistrict,
          hscSchool: finalHscSchool,
          hscMarks: form.hscMarks,
          hscPercentage: form.hscPercentage,
          hscCutoff: form.hscCutoff,
          hscMedium: form.hscMedium,
          // Security
          newPassword: form.newPassword.trim(),
          otp: form.emailOtp.trim(),
          profileImage: form.profileImage || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('portal_login_role', 'student')
          document.cookie = `portal_login_role=student; path=/; max-age=2592000; SameSite=Lax`
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
              gender: form.gender,
              bloodGroup: form.bloodGroup || '',
              residencyStatus: finalResidency || form.residencyStatus || '',
              busNo: form.busNo.trim(),
              boardingPoint: form.boardingPoint.trim(),
              hostelBlock: form.hostelBlock.trim(),
              roomNo: form.roomNo.trim(),
              fatherName: form.fatherName.trim(),
              motherName: form.motherName.trim(),
              address: form.address.trim(),
              sslcDistrict: form.sslcDistrict,
              sslcSchool: finalSslcSchool,
              sslcMarks: form.sslcMarks,
              sslcPercentage: form.sslcPercentage,
              sslcMedium: form.sslcMedium,
              hscDistrict: form.hscDistrict,
              hscSchool: finalHscSchool,
              hscMarks: form.hscMarks,
              hscPercentage: form.hscPercentage,
              hscCutoff: form.hscCutoff,
              hscMedium: form.hscMedium,
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
        toast.success('Account fully verified & Onboarding completed!')
        onComplete(data.user || {})
      } else {
        const errorMsg = data.message || 'Invalid or expired OTP. Please try again.'
        setStep4Error(errorMsg)
        toast.error(errorMsg)
      }
    } catch {
      setStep4Error('Failed to complete setup. Please check your network.')
      toast.error('Network error during final submission.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Correction Request submission
  const handleSendCorrectionRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedValue.trim() || !correctionReason.trim()) {
      toast.error('Please provide both the corrected value and reason.')
      return
    }

    setCorrectionSubmitting(true)
    try {
      const res = await fetch('/api/students/profile-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: correctionCategory,
          requestedValue: requestedValue.trim(),
          reason: correctionReason.trim(),
          registerNumber: initialData.registerNumber,
          studentName: initialData.name,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setCorrectionSubmitted(true)
        toast.success('Correction request submitted to Administrator for review!')
      } else {
        toast.error(data.message || 'Failed to submit correction request')
      }
    } catch {
      toast.error('Network error. Please try again later.')
    } finally {
      setCorrectionSubmitting(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-[#071A41]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl sm:max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative my-auto"
      >
        
        {/* Modal Header with Progress Step Indicator */}
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1557C0] text-[10px] font-black uppercase tracking-wider">
              STUDENT ONBOARDING &amp; ACADEMIC ENROLLMENT
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {initialData.registerNumber}
              </span>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
                  title="Close and continue to dashboard"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-[#071A41]">
              {onboardingStep === 1 && 'Step 1: Review Academic & Personal Details'}
              {onboardingStep === 2 && 'Step 2: Family & Schooling Academic Records'}
              {onboardingStep === 3 && 'Step 3: Password & Email OTP Verification'}
              {onboardingStep === 4 && 'Step 4: Final Review & Confirmation'}
            </h3>
            <span className="text-xs font-black text-[#1557C0] bg-blue-50 px-2.5 py-1 rounded-xl">
              Step {onboardingStep} of 4
            </span>
          </div>

          {/* 4-Step Visual Progress Bar */}
          <div className="grid grid-cols-4 gap-2 mt-2.5">
            <div className={cn('h-1.5 rounded-full transition-all', onboardingStep >= 1 ? 'bg-[#1557C0]' : 'bg-gray-200')} />
            <div className={cn('h-1.5 rounded-full transition-all', onboardingStep >= 2 ? 'bg-[#1557C0]' : 'bg-gray-200')} />
            <div className={cn('h-1.5 rounded-full transition-all', onboardingStep >= 3 ? 'bg-[#1557C0]' : 'bg-gray-200')} />
            <div className={cn('h-1.5 rounded-full transition-all', onboardingStep === 4 ? 'bg-[#1557C0]' : 'bg-gray-200')} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: REVIEW & EDIT STUDENT PARTICULARS / REQUEST CORRECTION */}
        {/* ========================================================================= */}
        {onboardingStep === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-4 text-xs">
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
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 pb-2 text-xs font-black text-[#071A41]">
                <Camera className="w-4 h-4 text-[#1557C0]" />
                <span>Student Passport Photograph</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                <div className="relative group shrink-0">
                  {form.profileImage ? (
                    <img
                      src={form.profileImage}
                      alt="Student Photo"
                      className="w-20 h-24 rounded-xl object-cover border-2 border-[#1557C0] shadow-sm bg-white"
                    />
                  ) : (
                    <div className="w-20 h-24 rounded-xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-1 shadow-2xs">
                      <UserIcon className="w-7 h-7" />
                      <span className="text-[9px] font-bold">No Photo</span>
                    </div>
                  )}

                  {form.profileImage && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, profileImage: '' }))}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1557C0] hover:bg-[#0e44b5] text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{form.profileImage ? 'Change Photo' : 'Upload Passport Photo'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-gray-500">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    📱 Student Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    👨‍👩‍👧 Parent Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                    placeholder="10-digit parent mobile"
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

                {/* Date of Birth */}
                <div className="sm:col-span-2 pt-1 border-t border-blue-200/50">
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

                {/* GENDER SELECTION (USER SPECIFIED: ONLY ADD GENDER ON STEP 1) */}
                <div className="sm:col-span-2 pt-1 border-t border-blue-200/50">
                  <label className="block font-bold text-gray-700 text-[11px] mb-1.5">
                    ⚧ Gender *
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'Male', label: 'Male', icon: '👨' },
                      { id: 'Female', label: 'Female', icon: '👩' },
                      { id: 'Other', label: 'Other', icon: '⚧' },
                    ].map((g) => (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => setForm({ ...form, gender: g.id as any })}
                        className={cn(
                          "p-2.5 rounded-xl border text-center flex items-center justify-center gap-2 transition-all cursor-pointer font-bold text-xs",
                          form.gender === g.id
                            ? "bg-[#1557C0] text-white border-[#1557C0] shadow-sm ring-2 ring-blue-300"
                            : "bg-white text-[#071A41] border-gray-200 hover:border-blue-300 hover:bg-slate-50"
                        )}
                      >
                        <span className="text-base">{g.icon}</span>
                        <span>{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🩸 Blood Group *
                  </label>
                  <select
                    required
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                  >
                    <option value="">Select Blood Group *</option>
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

                {/* Residency Details */}
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

                  {form.dayScholarType === 'College Bus' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block font-bold text-gray-700 text-[10px] mb-1">
                          🚌 College Bus / Route No. *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.busNo}
                          onChange={(e) => setForm({ ...form, busNo: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                          placeholder="e.g. Route 14 (Karur - Campus)"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[10px] mb-1">
                          📍 Boarding Point Details *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.boardingPoint}
                          onChange={(e) => setForm({ ...form, boardingPoint: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                          placeholder="e.g. Karur Bus Stand"
                        />
                      </div>
                    </div>
                  )}

                  {form.dayScholarType === 'Out Bus' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block font-bold text-gray-700 text-[10px] mb-1">
                          Transit Method *
                        </label>
                        <input
                          type="text"
                          value={form.outBusMode}
                          onChange={(e) => setForm({ ...form, outBusMode: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                          placeholder="e.g. Public Bus / TNSTC"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[10px] mb-1">
                          Origin / Stop Location *
                        </label>
                        <input
                          type="text"
                          value={form.boardingPoint}
                          onChange={(e) => setForm({ ...form, boardingPoint: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                          placeholder="e.g. Kulithalai"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hostel Sub-Options */}
              {form.residencyStatus === 'Hostel' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/90 to-indigo-50/60 border border-purple-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                      <span>🏢</span> Campus Hostel Particulars *
                    </span>
                    <span className="text-[10px] text-purple-700 font-bold bg-purple-100/80 px-2 py-0.5 rounded-md">
                      Hosteller Resident
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-gray-700 text-[10px] mb-1">
                        Hostel Block Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.hostelBlock}
                        onChange={(e) => setForm({ ...form, hostelBlock: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                        placeholder="e.g. Kaveri Block / Ganga Block"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[10px] mb-1">
                        Room Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.roomNo}
                        onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                        placeholder="e.g. 204-B"
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
                    I solemnly declare and confirm that I have thoroughly verified all my academic particulars, gender, registration number, parent/student contact details, and photograph displayed above.
                  </p>
                </div>
              </label>
            </div>

            {/* Navigation Button */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium order-2 sm:order-1">
                <FileCheck2 className="w-3.5 h-3.5 text-[#1557C0]" />
                <span>Step 1 of 4: Academic &amp; Personal Particulars</span>
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
                <span>Proceed to Step 2: Family &amp; Schooling</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: FAMILY & SCHOOLING ACADEMIC RECORDS (NEW USER REQUIREMENTS) */}
        {/* ========================================================================= */}
        {onboardingStep === 2 && (
          <form onSubmit={handleProceedToStep3} className="space-y-4 text-xs">
            <p className="text-[11px] text-gray-500 font-medium">
              Please enter your parental details, permanent address, and comprehensive 10th (SSLC) &amp; 12th (HSC) academic schooling records.
            </p>

            {/* Part 1: Parental Details & Permanent Address */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-[#1557C0]/10 flex items-center justify-center text-[#1557C0]">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-black text-[#071A41] text-xs block">Parental Particulars &amp; Permanent Residence</span>
                  <span className="text-[10px] font-bold text-slate-500">Official Guardian Information for Department Records</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    👨 Father / Guardian Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                    placeholder="Enter Father's Full Name"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    👩 Mother Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.motherName}
                    onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                    placeholder="Enter Mother's Full Name"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    📍 Permanent Residential Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                    placeholder="Door No, Street Name, Village / Town, Taluk, District, PIN Code"
                  />
                </div>
              </div>
            </div>

            {/* Part 2: 10th Standard (SSLC) Schooling & Performance */}
            <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-blue-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-700">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-black text-[#071A41] text-xs block">10th Standard (SSLC) Academic Record</span>
                    <span className="text-[10px] font-bold text-blue-600">Secondary School Leaving Certificate Particulars</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Max Marks: 500
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 10th School District */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🏛️ 10th School District *
                  </label>
                  <select
                    required
                    value={form.sslcDistrict}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sslcDistrict: e.target.value,
                        sslcSchool: '',
                        sslcCustomSchool: '',
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                  >
                    <option value="">Select 10th School District *</option>
                    {TN_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 10th School Name (Based on District) */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🏫 10th School Name *
                  </label>
                  <select
                    required
                    disabled={!form.sslcDistrict}
                    value={form.sslcSchool}
                    onChange={(e) => setForm({ ...form, sslcSchool: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!form.sslcDistrict ? 'Select District First' : 'Select 10th School *'}
                    </option>
                    {(DISTRICT_SCHOOLS[form.sslcDistrict] || []).map((sch) => (
                      <option key={sch} value={sch}>
                        {sch}
                      </option>
                    ))}
                    <option value={OTHER_SCHOOL_OPTION}>
                      ✏️ {OTHER_SCHOOL_OPTION}
                    </option>
                  </select>
                </div>

                {/* Custom School Input if Other */}
                {form.sslcSchool === OTHER_SCHOOL_OPTION && (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 text-[11px] mb-1">
                      ✏️ Specify 10th School Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.sslcCustomSchool}
                      onChange={(e) => setForm({ ...form, sslcCustomSchool: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-blue-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] text-xs"
                      placeholder="Enter full name of your 10th standard school"
                    />
                  </div>
                )}

                {/* Marks Obtained / 500 */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    📝 Marks Obtained (out of 500) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="500"
                    step="1"
                    required
                    value={form.sslcMarks}
                    onChange={handleSslcMarksChange}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs font-mono"
                    placeholder="e.g. 465"
                  />
                </div>

                {/* Total Percentage */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1 flex items-center justify-between">
                    <span>📊 10th Total Percentage (%) *</span>
                    {form.sslcPercentage && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                        Auto-computed
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.sslcPercentage}
                    onChange={(e) => setForm({ ...form, sslcPercentage: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs font-mono font-bold"
                    placeholder="e.g. 93.00%"
                  />
                </div>

                {/* 10th Medium of Study Dropdown */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🗣️ 10th Medium of Study (Dropdown) *
                  </label>
                  <select
                    required
                    value={form.sslcMedium}
                    onChange={(e) => setForm({ ...form, sslcMedium: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs cursor-pointer"
                  >
                    <option value="">-- Select 10th Medium of Study (Dropdown) * --</option>
                    <option value="English">🇬🇧 English Medium</option>
                    <option value="Tamil">🇮🇳 Tamil Medium</option>
                    <option value="Telugu">🇮🇳 Telugu Medium</option>
                    <option value="Malayalam">🇮🇳 Malayalam Medium</option>
                    <option value="Hindi / Other">🌐 Hindi / Other Regional Medium</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Part 3: 12th Standard (HSC) Schooling & Performance */}
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-indigo-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-700">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-black text-[#071A41] text-xs block">12th Standard (HSC) Academic Record</span>
                    <span className="text-[10px] font-bold text-indigo-600">Higher Secondary Course &amp; Engineering Cut-off</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Max Marks: 600
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 12th School District */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🏛️ 12th School District *
                  </label>
                  <select
                    required
                    value={form.hscDistrict}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hscDistrict: e.target.value,
                        hscSchool: '',
                        hscCustomSchool: '',
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                  >
                    <option value="">Select 12th School District *</option>
                    {TN_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 12th School Name (Based on District) */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🏫 12th School Name *
                  </label>
                  <select
                    required
                    disabled={!form.hscDistrict}
                    value={form.hscSchool}
                    onChange={(e) => setForm({ ...form, hscSchool: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!form.hscDistrict ? 'Select District First' : 'Select 12th School *'}
                    </option>
                    {(DISTRICT_SCHOOLS[form.hscDistrict] || []).map((sch) => (
                      <option key={sch} value={sch}>
                        {sch}
                      </option>
                    ))}
                    <option value={OTHER_SCHOOL_OPTION}>
                      ✏️ {OTHER_SCHOOL_OPTION}
                    </option>
                  </select>
                </div>

                {/* Custom School Input if Other */}
                {form.hscSchool === OTHER_SCHOOL_OPTION && (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 text-[11px] mb-1">
                      ✏️ Specify 12th School Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.hscCustomSchool}
                      onChange={(e) => setForm({ ...form, hscCustomSchool: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-indigo-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] text-xs"
                      placeholder="Enter full name of your 12th standard school"
                    />
                  </div>
                )}

                {/* Marks Obtained / 600 */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    📝 Marks Obtained in 12th (out of 600) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="600"
                    step="1"
                    required
                    value={form.hscMarks}
                    onChange={handleHscMarksChange}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs font-mono"
                    placeholder="e.g. 545"
                  />
                </div>

                {/* Total Percentage in 12th */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1 flex items-center justify-between">
                    <span>📊 12th Total Percentage (%) *</span>
                    {form.hscPercentage && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                        Auto-computed
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.hscPercentage}
                    onChange={(e) => setForm({ ...form, hscPercentage: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs font-mono font-bold"
                    placeholder="e.g. 90.83%"
                  />
                </div>

                {/* Engineering Cut-off (out of 200) */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🎯 Engineering Cut-off (out of 200) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="200"
                    step="0.01"
                    required
                    value={form.hscCutoff}
                    onChange={(e) => setForm({ ...form, hscCutoff: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs font-mono font-bold"
                    placeholder="e.g. 182.50"
                  />
                  <span className="text-[9px] text-gray-500 mt-0.5 block">
                    Formula: Maths + (Physics / 2) + (Chemistry / 2)
                  </span>
                </div>

                {/* 12th Medium of Study Dropdown */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🗣️ 12th Medium of Study (Dropdown) *
                  </label>
                  <select
                    required
                    value={form.hscMedium}
                    onChange={(e) => setForm({ ...form, hscMedium: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs cursor-pointer"
                  >
                    <option value="">-- Select 12th Medium of Study (Dropdown) * --</option>
                    <option value="English">🇬🇧 English Medium</option>
                    <option value="Tamil">🇮🇳 Tamil Medium</option>
                    <option value="Telugu">🇮🇳 Telugu Medium</option>
                    <option value="Malayalam">🇮🇳 Malayalam Medium</option>
                    <option value="Hindi / Other">🌐 Hindi / Other Regional Medium</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOnboardingStep(1)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer text-xs transition-colors order-2 sm:order-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 1</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-black flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#071A41] via-[#0E387A] to-[#1557C0] hover:from-[#051330] hover:to-[#0d45b5] text-white shadow-blue-900/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer transition-all text-xs sm:text-sm order-1 sm:order-2 group"
              >
                <span>Proceed to Step 3: Security &amp; Verification</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SET PERMANENT PASSWORD & EMAIL OTP VERIFICATION */}
        {/* ========================================================================= */}
        {onboardingStep === 3 && (
          <form onSubmit={handleProceedToStep4} className="space-y-4 text-xs">
            <p className="text-[11px] text-gray-500 font-medium">
              Please configure your permanent password and verify your personal Gmail address with a secure 6-digit OTP code.
            </p>

            {/* Permanent Password Setup Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-[#1557C0]/10 flex items-center justify-center text-[#1557C0]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-black text-[#071A41] text-xs block">Permanent Student Password Setup</span>
                  <span className="text-[10px] font-bold text-slate-500">This replaces the default institutional login password</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* New Password */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🔒 New Permanent Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      className="w-full p-2.5 pr-10 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    🔒 Confirm Permanent Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className={cn(
                        "w-full p-2.5 pr-10 rounded-xl border font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2",
                        form.confirmPassword && form.newPassword !== form.confirmPassword
                          ? "border-rose-300 focus:ring-rose-500"
                          : "border-gray-300 focus:ring-[#1557C0]"
                      )}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                    <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                      Passwords do not match
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Email OTP Verification Card */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-blue-200/60">
                <div className="w-6 h-6 rounded-lg bg-[#1557C0]/10 flex items-center justify-center text-[#1557C0]">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-black text-[#071A41] text-xs block">Personal Email Verification (@gmail.com)</span>
                  <span className="text-[10px] font-bold text-slate-500">A 6-digit OTP will be dispatched to verify ownership</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 text-[11px] mb-1">
                  ✉️ Personal Gmail Address *
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value })
                        setEmailOtpSent(false)
                        setOtpVerified(false)
                        setOtpError(null)
                      }}
                      className={cn(
                        "w-full p-2.5 rounded-xl border font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2",
                        emailCheckStatus.available === false
                          ? "border-rose-400 focus:ring-rose-500"
                          : emailCheckStatus.available === true
                          ? "border-emerald-400 focus:ring-emerald-500"
                          : "border-gray-300 focus:ring-[#1557C0]"
                      )}
                      placeholder="yourname@gmail.com"
                    />
                    {emailCheckStatus.checking && (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={
                      loading ||
                      emailOtpCooldown > 0 ||
                      !form.email ||
                      !form.email.includes('@gmail.com') ||
                      emailCheckStatus.available === false
                    }
                    onClick={handleSendEmailOTP}
                    className="px-5 py-2.5 rounded-xl font-bold bg-[#1557C0] hover:bg-[#0e44b5] text-white flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 text-xs"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {emailOtpCooldown > 0
                        ? `Resend in ${emailOtpCooldown}s`
                        : emailOtpSent
                        ? 'Resend OTP'
                        : 'Send OTP'}
                    </span>
                  </button>
                </div>

                {emailCheckStatus.message && (
                  <p
                    className={cn(
                      "text-[10px] font-bold mt-1.5",
                      emailCheckStatus.available === false ? "text-rose-600" : "text-emerald-600"
                    )}
                  >
                    {emailCheckStatus.message}
                  </p>
                )}
              </div>

              {/* OTP Entry Box */}
              {emailOtpSent && (
                <div className="pt-2 border-t border-blue-200/50 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-gray-700 text-[11px]">
                      🔢 Enter 6-Digit Email OTP Code *
                    </label>
                    {otpVerified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={form.emailOtp}
                      onChange={handleOtpChange}
                      disabled={otpVerified}
                      className={cn(
                        "w-full p-3 rounded-xl border text-center font-mono font-bold tracking-widest text-lg bg-white focus:outline-none focus:ring-2",
                        otpVerified
                          ? "border-emerald-500 text-emerald-800 bg-emerald-50/40"
                          : otpError
                          ? "border-rose-400 focus:ring-rose-500 text-rose-700"
                          : "border-gray-300 focus:ring-[#1557C0] text-[#071A41]"
                      )}
                      placeholder="• • • • • •"
                    />
                    {isVerifyingOtp && (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  {otpError && (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-bold">
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
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-black flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#071A41] via-[#0E387A] to-[#1557C0] hover:from-[#051330] hover:to-[#0d45b5] text-white shadow-blue-900/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer transition-all text-xs sm:text-sm order-1 sm:order-2 group"
              >
                <span>Proceed to Step 4: Final Review</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: FINAL REVIEW & COMPREHENSIVE RECORD ATTESTATION (NEW) */}
        {/* ========================================================================= */}
        {onboardingStep === 4 && (
          <form onSubmit={handleCompleteOnboarding} className="space-y-4 text-xs">
            <p className="text-[11px] text-gray-500 font-medium">
              Please thoroughly inspect your complete academic, family, 10th &amp; 12th schooling records, and login credentials before finalizing your portal enrollment.
            </p>

            {/* Comprehensive Review Cards */}
            <div className="space-y-3">
              {/* Header inside summary with Photo & Identity */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                {form.profileImage ? (
                  <img
                    src={form.profileImage}
                    alt="Student Photo"
                    className="w-14 h-16 rounded-xl object-cover border-2 border-[#1557C0] shadow-sm bg-white shrink-0"
                  />
                ) : (
                  <div className="w-14 h-16 rounded-xl bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shadow-inner shrink-0">
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
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-bold">
                    <span>Gender: <strong className="text-[#071A41]">{form.gender || 'Not specified'}</strong></span>
                    <span>•</span>
                    <span>Blood: <strong className="text-[#071A41]">{form.bloodGroup || 'Not specified'}</strong></span>
                    <span>•</span>
                    <span>DOB: <strong className="text-[#071A41]">{form.dateOfBirth}</strong></span>
                  </div>
                </div>
              </div>

              {/* Card 1: Family & Residence */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 font-bold text-xs text-[#071A41]">
                  <Users className="w-3.5 h-3.5 text-[#1557C0]" />
                  <span>Family Particulars &amp; Permanent Residence</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Father / Guardian:</span>
                    <span className="font-bold text-[#071A41]">{form.fatherName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Mother Name:</span>
                    <span className="font-bold text-[#071A41]">{form.motherName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Parent Mobile:</span>
                    <span className="font-mono font-bold text-[#071A41]">{form.parentPhone} {form.isParentWhatsapp && '(WhatsApp)'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Residency Mode:</span>
                    <span className="font-bold text-[#071A41]">
                      {form.residencyStatus === 'Day Scholar'
                        ? `Day Scholar (${form.dayScholarType} ${form.busNo ? `· ${form.busNo}` : ''})`
                        : `Hostel (${form.hostelBlock} ${form.roomNo ? `· Rm ${form.roomNo}` : ''})`}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Permanent Address:</span>
                    <span className="font-semibold text-[#071A41]">{form.address}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: 10th & 12th Academic Schooling */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 font-bold text-xs text-[#071A41]">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Prior Schooling Qualifications (10th &amp; 12th)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  {/* 10th Record */}
                  <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-1">
                    <span className="text-[10px] font-black text-blue-800 uppercase block">10th Standard (SSLC)</span>
                    <p className="font-bold text-[#071A41] leading-tight">
                      {form.sslcSchool === OTHER_SCHOOL_OPTION ? form.sslcCustomSchool : form.sslcSchool}
                    </p>
                    <p className="text-[10px] text-gray-500">District: {form.sslcDistrict} · {form.sslcMedium} Medium</p>
                    <div className="flex items-center justify-between pt-1 border-t border-blue-200/50">
                      <span>Marks: <strong className="font-mono text-[#071A41]">{form.sslcMarks} / 500</strong></span>
                      <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.2 rounded">{form.sslcPercentage}%</span>
                    </div>
                  </div>

                  {/* 12th Record */}
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200/60 space-y-1">
                    <span className="text-[10px] font-black text-indigo-800 uppercase block">12th Standard (HSC)</span>
                    <p className="font-bold text-[#071A41] leading-tight">
                      {form.hscSchool === OTHER_SCHOOL_OPTION ? form.hscCustomSchool : form.hscSchool}
                    </p>
                    <p className="text-[10px] text-gray-500">District: {form.hscDistrict} · {form.hscMedium} Medium</p>
                    <div className="flex items-center justify-between pt-1 border-t border-indigo-200/50">
                      <span>Marks: <strong className="font-mono text-[#071A41]">{form.hscMarks} / 600</strong> ({form.hscPercentage}%)</span>
                      <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.2 rounded">Cut-off: {form.hscCutoff}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Security & Contact */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 font-bold text-xs text-[#071A41]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Security &amp; Verified Contact</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Verified Email:</span>
                    <span className="font-mono font-bold text-emerald-700 truncate block">{form.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Student Mobile:</span>
                    <span className="font-mono font-bold text-[#071A41]">{form.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Permanent Password:</span>
                    <span className="font-bold text-slate-700">•••••••• (Secured)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutional Verification Declaration Card */}
            <div className={cn(
              "relative rounded-2xl border-2 p-4 transition-all duration-200",
              step4Confirmed
                ? "bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-blue-50/30 border-emerald-400/90 shadow-sm shadow-emerald-500/10"
                : "bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-xs"
            )}>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="mt-0.5 flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    required
                    checked={step4Confirmed}
                    onChange={(e) => {
                      setStep4Confirmed(e.target.checked)
                      if (step4Error) setStep4Error(null)
                    }}
                    className="w-5 h-5 rounded-md text-emerald-600 border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer transition-all"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className={cn("w-4 h-4", step4Confirmed ? "text-emerald-600" : "text-[#1557C0]")} />
                      <span className="text-xs font-black text-[#071A41] uppercase tracking-wide">
                        Final Academic Authorization &amp; Portal Enrollment
                      </span>
                    </div>
                    {step4Confirmed ? (
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
                    I solemnly declare and affirm that all the personal particulars, parental names, permanent residential address, 10th &amp; 12th schooling records, marks, and cut-off submitted above are true, complete, and authentic to the best of my knowledge.
                  </p>
                </div>
              </label>
            </div>

            {/* Inline Error Banner if Step 4 fails */}
            {step4Error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step4Error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOnboardingStep(3)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer text-xs transition-colors order-2 sm:order-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 3</span>
              </button>

              <button
                type="submit"
                disabled={loading || !step4Confirmed}
                className={cn(
                  "w-full sm:w-auto px-8 py-3 rounded-xl font-black flex items-center justify-center gap-2.5 shadow-md transition-all text-xs sm:text-sm order-1 sm:order-2 group",
                  step4Confirmed && !loading
                    ? "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none"
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{loading ? 'Authorizing & Entering...' : 'Authorize & Enter Student Portal'}</span>
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
    </div>,
    document.body
  )
}
