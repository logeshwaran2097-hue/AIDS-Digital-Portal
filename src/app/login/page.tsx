'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { OTPInput } from '@/components/ui/OTPInput'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import {
  Eye,
  EyeOff,
  User as UserIcon,
  Lock,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  LogIn,
  HelpCircle,
  Brain,
  Lightbulb,
  TrendingUp,
  Cpu,
  Check,
  GraduationCap,
  Sparkles,
  Send,
  Key,
  AlertCircle,
  Users,
  Pencil,
  Download,
  Smartphone,
  Loader2,
} from 'lucide-react'
import { RealtimeAppDownloader } from '@/components/RealtimeAppDownloader'

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = React.useState<'student' | 'faculty' | 'advisor' | 'hod' | 'admin'>('student')
  const [showDownloader, setShowDownloader] = React.useState(false)
  const [isAppInstalled, setIsAppInstalled] = React.useState(false)
  const [registerNumber, setRegisterNumber] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [facultyId, setFacultyId] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [challenge, setChallenge] = React.useState('')
  const [otpSent, setOtpSent] = React.useState(false)
  const [otpCooldown, setOtpCooldown] = React.useState(0)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      setIsAppInstalled(standalone)
    }
  }, [])

  const handleDirectInstall = () => {
    if (typeof window !== 'undefined') {
      if ((window as any).__triggerPwaInstall) {
        ; (window as any).__triggerPwaInstall()
      } else if ((window as any).__openAppDownloader) {
        ; (window as any).__openAppDownloader()
      } else {
        setShowDownloader(true)
      }
    } else {
      setShowDownloader(true)
    }
  }

  // LUXURY AUTHENTICATION ANIMATION STATES
  const [authStatus, setAuthStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  const [authMessage, setAuthMessage] = React.useState('')
  const [successDestination, setSuccessDestination] = React.useState('')

  // MULTI-STEP ONBOARDING WIZARD STATE
  const [showOnboardingModal, setShowOnboardingModal] = React.useState(false)
  const [onboardingStep, setOnboardingStep] = React.useState<1 | 2 | 3>(1) // 1: Details, 2: Password & Email OTP, 3: Final Review Popup
  const [onboardingUser, setOnboardingUser] = React.useState<any>(null)

  // Form State for Details Review & Password Setup
  const [onboardingForm, setOnboardingForm] = React.useState({
    name: '',
    registerNumber: '',
    phone: '',
    parentPhone: '',
    parentWhatsApp: false,
    bloodGroup: '',
    residency: '', // 'Day Scholar' | 'Hostel' | ''
    dayScholarTransport: 'College Bus', // 'College Bus' | 'Out Bus' | 'Bike' | 'Self'
    busNo: '',
    boardingPoint: '',
    outBusTransportService: 'TNSTC Public Bus',
    hostelBlock: '', // 'Boys Hostel I' | 'Boys Hostel II' | 'Boys Hostel III' | 'Girls Hostel I' | 'Girls Hostel II' | 'Girls Hostel III'
    roomNo: '',
    address: '',
    busDetails: '',
    dateOfBirth: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    department: '',
    year: '',
    semester: '',
    section: '',
    advisorName: '',
    hasCorrectionRequest: false,
    correctionRemarks: '',
    detailsConfirmed: false,
    email: '',
    newPassword: '',
    confirmPassword: '',
    emailOtp: '',
    otpChallenge: '',
  })
  const [passportPhotoFile, setPassportPhotoFile] = React.useState<File | null>(null)
  const [passportPhotoPreview, setPassportPhotoPreview] = React.useState<string | null>(null)

  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [onboardingLoading, setOnboardingLoading] = React.useState(false)
  const [emailOtpSent, setEmailOtpSent] = React.useState(false)
  const [emailOtpCooldown, setEmailOtpCooldown] = React.useState(0)
  const [demoOtpCode, setDemoOtpCode] = React.useState<string | null>(null)
  const [isOnboardingVerifyingOtp, setIsOnboardingVerifyingOtp] = React.useState(false)
  const [isOnboardingOtpVerified, setIsOnboardingOtpVerified] = React.useState(false)
  const [onboardingOtpError, setOnboardingOtpError] = React.useState<string | null>(null)

  // Academic Details Correction Request to Admin States
  const [showCorrectionModal, setShowCorrectionModal] = React.useState(false)
  const [correctionCategory, setCorrectionCategory] = React.useState('name')
  const [correctionRequestedValue, setCorrectionRequestedValue] = React.useState('')
  const [correctionReason, setCorrectionReason] = React.useState('')
  const [correctionSubmitting, setCorrectionSubmitting] = React.useState(false)
  const [correctionSubmitted, setCorrectionSubmitted] = React.useState(false)

  // Deterministic 1-by-1 Staged Appearance Controller
  const [animStage, setAnimStage] = React.useState(0)
  const router = useRouter()

  React.useEffect(() => {
    // Progressive staged entrance timers
    const timers = [
      setTimeout(() => setAnimStage(1), 150),  // Stage 1: Accreditation Shield
      setTimeout(() => setAnimStage(2), 450),  // Stage 2: Picture & Celestial Emblem
      setTimeout(() => setAnimStage(3), 750),  // Stage 3: College Name
      setTimeout(() => setAnimStage(4), 1000), // Stage 4: Autonomous Karur Tag
      setTimeout(() => setAnimStage(5), 1200), // Stage 5: Golden Light Beam
      setTimeout(() => setAnimStage(6), 1400), // Stage 6: Department Name
      setTimeout(() => setAnimStage(7), 1600), // Stage 7: Digital Portal CPU Badge
      setTimeout(() => setAnimStage(8), 1850), // Stage 8: Luxury Login Card
      setTimeout(() => setAnimStage(9), 2150), // Stage 9: Motto & Footer
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  React.useEffect(() => {
    if (otpCooldown <= 0) return
    const timer = setTimeout(() => setOtpCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpCooldown])

  React.useEffect(() => {
    if (emailOtpCooldown <= 0) return
    const timer = setTimeout(() => setEmailOtpCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [emailOtpCooldown])

  const isOnboardingVerifyingOtpRef = React.useRef(false)
  const lastVerifiedOnboardingOtpRef = React.useRef<string | null>(null)

  // Direct, ultra-fast auto-verify function for login onboarding
  const verifyOnboardingOtpCode = async (rawCode: string) => {
    const code = rawCode.trim()
    const email = onboardingForm.email.trim().toLowerCase()
    if (code.length !== 6 || !email || !email.includes('@')) return
    if (isOnboardingVerifyingOtpRef.current) return
    if (isOnboardingOtpVerified && lastVerifiedOnboardingOtpRef.current === code) return

    isOnboardingVerifyingOtpRef.current = true
    setIsOnboardingVerifyingOtp(true)
    setOnboardingOtpError(null)

    try {
      const res = await fetch('/api/auth/verify-onboarding-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: code,
          challenge: onboardingForm.otpChallenge || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        lastVerifiedOnboardingOtpRef.current = code
        setIsOnboardingOtpVerified(true)
        setOnboardingOtpError(null)
        toast.success('Email OTP verified successfully!')
      } else {
        setIsOnboardingOtpVerified(false)
        setOnboardingOtpError(data.message || 'Invalid verification code.')
      }
    } catch {
      setOnboardingOtpError('Connection error verifying OTP.')
    } finally {
      isOnboardingVerifyingOtpRef.current = false
      setIsOnboardingVerifyingOtp(false)
    }
  }

  // Backup effect for auto-verify in Login Onboarding Wizard
  React.useEffect(() => {
    const code = (onboardingForm.emailOtp || '').trim()
    if (code.length === 6 && onboardingForm.email.trim() && !isOnboardingOtpVerified && !isOnboardingVerifyingOtpRef.current && lastVerifiedOnboardingOtpRef.current !== code) {
      verifyOnboardingOtpCode(code)
    } else if (code.length < 6) {
      if (isOnboardingOtpVerified) setIsOnboardingOtpVerified(false)
      if (onboardingOtpError) setOnboardingOtpError(null)
      lastVerifiedOnboardingOtpRef.current = null
    }
  }, [onboardingForm.emailOtp, onboardingForm.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthStatus('idle')
    try {
      let endpoint = ''
      let payload: Record<string, string> = {}

      if (selectedRole === 'student') {
        endpoint = '/api/auth/student'
        payload = { registerNumber: registerNumber.trim(), email: registerNumber.trim(), password }
      } else if (selectedRole === 'faculty' || selectedRole === 'advisor') {
        endpoint = '/api/auth/faculty'
        payload = { facultyId: facultyId.trim(), email: facultyId.trim(), name: facultyId.trim(), password }
      } else if (selectedRole === 'hod') {
        endpoint = '/api/auth/hod'
        payload = { facultyId: facultyId.trim(), email: facultyId.trim(), name: facultyId.trim(), password }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setAuthStatus('error')
        setAuthMessage(data.message || 'Authentication Failed · Invalid Credentials')
        toast.error(data.message || 'Login failed. Please check your credentials.')
        setTimeout(() => {
          setAuthStatus('idle')
        }, 4000)
        return
      }

      // Check if student requires first-time profile completion / onboarding
      if (data.user?.mustChangePassword && selectedRole === 'student') {
        setOnboardingUser(data.user)
        
        let initialDobDay = ''
        let initialDobMonth = ''
        let initialDobYear = ''
        if (data.user.dateOfBirth) {
          const d = new Date(data.user.dateOfBirth)
          if (!isNaN(d.getTime())) {
            initialDobDay = String(d.getUTCDate()).padStart(2, '0')
            initialDobMonth = String(d.getUTCMonth() + 1).padStart(2, '0')
            initialDobYear = String(d.getUTCFullYear())
          }
        }

        const rawUserEmail = (data.user.email || '').trim()
        const isMockEmail =
          !rawUserEmail ||
          rawUserEmail.endsWith('@student.vsb.edu.in') ||
          rawUserEmail.endsWith('@vsb.ac.in') ||
          rawUserEmail.endsWith('@vsb.edu.in') ||
          rawUserEmail.toLowerCase().includes('mock') ||
          rawUserEmail.toLowerCase().startsWith((data.user.registerNumber || registerNumber.trim()).toLowerCase())

        // Only use real DB values — never fall back to hardcoded defaults or mock email
        setOnboardingForm((prev) => ({
          ...prev,
          name: data.user.name || '',
          registerNumber: data.user.registerNumber || registerNumber.trim(),
          phone: data.user.phone || '',
          parentPhone: data.user.parentPhone || '',
          parentWhatsApp: Boolean(data.user.isParentWhatsapp),
          bloodGroup: data.user.bloodGroup || '',
          residency: data.user.residencyStatus || '',
          hostelBlock: data.user.hostelBlock || '',
          roomNo: data.user.roomNo || '',
          busNo: data.user.busNo || '',
          boardingPoint: data.user.boardingPoint || '',
          address: data.user.address || '',
          busDetails: data.user.busDetails || '',
          email: isMockEmail ? '' : rawUserEmail,
          dateOfBirth: data.user.dateOfBirth || '',
          dobDay: initialDobDay,
          dobMonth: initialDobMonth,
          dobYear: initialDobYear,
          department: data.user.department || '',
          year: data.user.year || '',
          semester: data.user.semester || '',
          section: data.user.section || '',
          advisorName: data.user.advisorName || '',
        }))
        // Show luxury success animation first, then open onboarding
        setAuthStatus('success')
        setAuthMessage('Identity Verified · Completing First-Time Setup...')
        setTimeout(() => {
          setAuthStatus('idle')
          setShowOnboardingModal(true)
          setOnboardingStep(1)
        }, 1100)
        toast.success('Welcome! Please review your details and set up your permanent password.')
        return
      }

      // Success Luxury Animation & Immediate Navigation
      const isAdvisor = Boolean(data.user?.isAdvisor || data.user?.facultyType === 'advisor' || selectedRole === 'advisor')
      const effectiveLoginRole = (selectedRole === 'advisor' || isAdvisor) ? 'advisor' : selectedRole

      if (typeof window !== 'undefined') {
        localStorage.setItem('portal_login_role', effectiveLoginRole)
        document.cookie = `portal_login_role=${effectiveLoginRole}; path=/; max-age=604800; SameSite=Lax`
      }

      const dashboardMap: Record<string, string> = {
        student: '/dashboard',
        faculty: '/faculty-dashboard',
        advisor: '/faculty-dashboard/attendance?mode=morning&role=advisor',
        hod: '/hod-dashboard',
      }
      const targetUrl = (isAdvisor && selectedRole !== 'student')
        ? '/faculty-dashboard/attendance?mode=morning&role=advisor'
        : dashboardMap[selectedRole] || '/dashboard'

      setSuccessDestination(targetUrl)
      setAuthStatus('success')
      setAuthMessage(`Identity Verified · Entering ${(isAdvisor && selectedRole !== 'student' ? 'CLASS ADVISOR' : selectedRole).toUpperCase()} Digital Portal...`)
      toast.success('Login verified! Entering portal...')

      // Luxury transition animation timing
      setTimeout(() => {
        window.location.href = targetUrl
      }, 1100)
    } catch {
      setAuthStatus('error')
      setAuthMessage('Network Connection Error · Unable to Reach Campus Server')
      toast.error('Network connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // STEP 1 ➔ STEP 2: Validate details review
  const handleProceedToSecurityStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!onboardingForm.phone.trim() || onboardingForm.phone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit student mobile number.')
      return
    }
    if (!onboardingForm.parentPhone.trim() || onboardingForm.parentPhone.trim().length < 10) {
      toast.error('Please provide a valid parent/guardian contact number.')
      return
    }
    if (!onboardingForm.dobDay || !onboardingForm.dobMonth || !onboardingForm.dobYear) {
      toast.error('Please select your complete Date of Birth (Day, Month, Year).')
      return
    }
    if (!onboardingForm.residency) {
      toast.error('Please select your Residency (Day Scholar or Hostel).')
      return
    }
    if (onboardingForm.residency === 'Hostel') {
      if (!onboardingForm.hostelBlock) {
        toast.error('Please select your Hostel Block (Boys Hostel I-III or Girls Hostel I-III).')
        return
      }
      if (!onboardingForm.roomNo.trim()) {
        toast.error('Please enter your Hostel Room Number.')
        return
      }
    }
    if (onboardingForm.residency === 'Day Scholar') {
      if (onboardingForm.dayScholarTransport === 'College Bus' && !onboardingForm.busNo.trim()) {
        toast.error('Please enter your College Bus / Route Number.')
        return
      }
      if (!onboardingForm.boardingPoint.trim()) {
        toast.error('Please enter your Boarding Point / Stop location.')
        return
      }
    }

    if (!onboardingForm.detailsConfirmed) {
      toast.error('Please check the confirmation declaration box to verify all your details.')
      return
    }

    // Build ISO dateOfBirth string from dropdowns
    const isoDate = `${onboardingForm.dobYear}-${onboardingForm.dobMonth}-${String(onboardingForm.dobDay).padStart(2, '0')}`
    setOnboardingForm(prev => ({ ...prev, dateOfBirth: isoDate }))
    setOnboardingStep(2)
  }

  // Submit Official Correction Request to Admin
  const handleSendCorrectionRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!correctionRequestedValue.trim()) {
      toast.error('Please enter the requested corrected value.')
      return
    }
    if (!correctionReason.trim()) {
      toast.error('Please provide a reason or explanation for this change.')
      return
    }

    setCorrectionSubmitting(true)
    try {
      const res = await fetch('/api/students/profile-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerNumber: onboardingForm.registerNumber,
          studentName: onboardingForm.name || onboardingUser?.name || 'Student',
          requestedData: {
            [correctionCategory]: correctionRequestedValue.trim(),
          },
          currentData: {
            name: onboardingForm.name,
            department: onboardingForm.department,
            year: onboardingForm.year,
            semester: onboardingForm.semester,
            section: onboardingForm.section,
            advisorName: onboardingForm.advisorName,
          },
          reason: `Requested ${correctionCategory.toUpperCase()} correction: ${correctionReason.trim()}`,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to submit correction request.')
        return
      }

      setCorrectionSubmitted(true)
      setShowCorrectionModal(false)
      toast.success('Correction request submitted to Admin! It will be verified with official college records.')
    } catch {
      toast.error('Network error submitting correction request.')
    } finally {
      setCorrectionSubmitting(false)
    }
  }

  // Dispatch Email Verification OTP
  const handleSendEmailOTP = async () => {
    if (!onboardingForm.email || !onboardingForm.email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    setOnboardingLoading(true)
    try {
      const res = await fetch('/api/auth/send-onboarding-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: onboardingForm.email.trim(),
          name: onboardingForm.name,
          registerNumber: onboardingForm.registerNumber,
          role: selectedRole || 'student',
          department: onboardingForm.department,
          year: onboardingForm.year,
          semester: onboardingForm.semester,
          section: onboardingForm.section,
          advisorName: onboardingForm.advisorName,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to dispatch OTP.')
        return
      }
      setEmailOtpSent(true)
      setEmailOtpCooldown(60)
      if (data.challenge) {
        setOnboardingForm((prev) => ({ ...prev, otpChallenge: data.challenge }))
      }
      if (data.devOtp) {
        setDemoOtpCode(data.devOtp)
      }
      toast.success(`6-digit OTP sent to ${onboardingForm.email}! Please check your inbox.`)
    } catch {
      toast.error('Network error sending OTP.')
    } finally {
      setOnboardingLoading(false)
    }
  }

  // Final Step: Complete Onboarding & Save Profile
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!onboardingForm.newPassword || onboardingForm.newPassword.length < 6) {
      toast.error('Please create a permanent password (at least 6 characters).')
      return
    }
    if (onboardingForm.newPassword !== onboardingForm.confirmPassword) {
      toast.error('New password and confirmation do not match.')
      return
    }
    if (emailOtpSent && (!onboardingForm.emailOtp || onboardingForm.emailOtp.length !== 6)) {
      toast.error('Please enter the complete 6-digit OTP sent to your email.')
      return
    }

    setOnboardingLoading(true)
    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: onboardingUser?.id,
          registerNumber: onboardingForm.registerNumber,
          role: selectedRole,
          name: onboardingForm.name,
          phone: onboardingForm.phone,
          parentPhone: onboardingForm.parentPhone,
          email: onboardingForm.email,
          dateOfBirth: onboardingForm.dateOfBirth,
          department: onboardingForm.department,
          year: onboardingForm.year,
          semester: onboardingForm.semester,
          section: onboardingForm.section,
          advisorName: onboardingForm.advisorName,
          bloodGroup: onboardingForm.bloodGroup,
          isParentWhatsapp: onboardingForm.parentWhatsApp,
          residencyStatus: onboardingForm.residency,
          hostelBlock: onboardingForm.residency === 'Hostel' ? onboardingForm.hostelBlock : undefined,
          roomNo: onboardingForm.residency === 'Hostel' ? onboardingForm.roomNo : undefined,
          busNo: onboardingForm.residency === 'Day Scholar' && onboardingForm.dayScholarTransport === 'College Bus' ? onboardingForm.busNo : undefined,
          boardingPoint: onboardingForm.residency === 'Day Scholar' ? onboardingForm.boardingPoint : undefined,
          busDetails: onboardingForm.residency === 'Day Scholar'
            ? `${onboardingForm.dayScholarTransport} · ${onboardingForm.dayScholarTransport === 'College Bus' ? `Bus ${onboardingForm.busNo} · ` : onboardingForm.dayScholarTransport === 'Out Bus' ? `${onboardingForm.outBusTransportService} · ` : ''}${onboardingForm.boardingPoint}`
            : onboardingForm.residency === 'Hostel'
              ? `${onboardingForm.hostelBlock} · Room ${onboardingForm.roomNo}`
              : undefined,
          newPassword: onboardingForm.newPassword,
          correctionRemarks: onboardingForm.hasCorrectionRequest ? onboardingForm.correctionRemarks : undefined,
          emailOtp: onboardingForm.emailOtp,
          challenge: onboardingForm.otpChallenge,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Profile verified & password updated successfully!')
        setShowOnboardingModal(false)
        const dashboardMap: Record<string, string> = {
          student: '/dashboard',
          faculty: '/faculty-dashboard',
          advisor: '/faculty-dashboard/attendance?mode=morning&role=advisor',
          hod: '/hod-dashboard',
        }
        setTimeout(() => {
          window.location.href = dashboardMap[selectedRole] || '/dashboard'
        }, 300)
      } else {
        toast.error(data.message || 'Failed to complete setup.')
      }
    } catch {
      toast.error('Network error saving profile.')
    } finally {
      setOnboardingLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter valid administrator email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Unable to send OTP')
        return
      }
      if (data.challenge) {
        setChallenge(data.challenge)
      }
      if (data.devOtp) {
        setDemoOtpCode(data.devOtp)
      }
      setOtpSent(true)
      toast.success(data.message || 'OTP dispatched to administrator email.')
      setOtpCooldown(60)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (customOtp?: string) => {
    const codeToVerify = typeof customOtp === 'string' ? customOtp : otp
    if (!codeToVerify || codeToVerify.length !== 6) {
      setAuthStatus('error')
      setAuthMessage('Please enter the complete 6-digit OTP security code.')
      toast.error('Please enter the complete 6-digit OTP')
      setTimeout(() => setAuthStatus('idle'), 3000)
      return
    }
    setLoading(true)
    setAuthStatus('idle')
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: codeToVerify, challenge }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setAuthStatus('error')
        setAuthMessage(data.message || '2FA Verification Failed · Invalid or Expired Code')
        toast.error(data.message || 'Invalid or expired OTP.')
        setTimeout(() => setAuthStatus('idle'), 4000)
        return
      }

      // Success Admin 2FA Elevation Animation
      setSuccessDestination('/admin/dashboard')
      setAuthStatus('success')
      setAuthMessage('2FA Biometric Verified · Elevating Super Admin Console...')
      toast.success('Admin authenticated!')

      setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 1400)
    } catch {
      setAuthStatus('error')
      setAuthMessage('Network Connection Error · Unable to Verify 2FA')
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-x-hidden anim-bg-intro bg-[#F5F8FC] px-4 py-4 sm:py-8 select-none max-w-full pb-safe"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >

      {/* Background Soft Blue Light Wave Sweep */}
      <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-blue-400/15 to-transparent anim-light-wave" />
        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent anim-idle-wave" />
      </div>

      {/* Subtle Connected Network Dots & AI Data Particles */}
      <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
        <div className="absolute top-2 left-2 sm:top-6 sm:left-6 w-36 h-36 sm:w-56 sm:h-56 opacity-20 anim-particle-float">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#1557C0]">
            <circle cx="30" cy="40" r="4" fill="currentColor" />
            <circle cx="100" cy="20" r="5" fill="currentColor" />
            <circle cx="160" cy="50" r="4" fill="currentColor" />
            <circle cx="60" cy="110" r="4" fill="currentColor" />
            <circle cx="140" cy="120" r="6" fill="currentColor" />
            <line x1="30" y1="40" x2="100" y2="20" stroke="currentColor" strokeWidth="1.5" className="anim-circuit-drift" />
            <line x1="100" y1="20" x2="160" y2="50" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="40" x2="60" y2="110" stroke="currentColor" strokeWidth="1.5" />
            <line x1="60" y1="110" x2="140" y2="120" stroke="currentColor" strokeWidth="1.5" className="anim-circuit-drift" />
            <line x1="160" y1="50" x2="140" y2="120" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="absolute top-2 right-2 sm:top-6 sm:right-6 w-36 h-36 sm:w-56 sm:h-56 opacity-20 anim-particle-float" style={{ animationDelay: '2s' }}>
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#1557C0]">
            <rect x="70" y="70" width="60" height="60" rx="10" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5" />
            <text x="100" y="106" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="bold" fontFamily="sans-serif">AI</text>
            <path d="M70 85 H48 M70 100 H48 M70 115 H48 M130 85 H152 M130 100 H152 M130 115 H152 M85 70 V48 M100 70 V48 M115 70 V48 M85 130 V152 M100 130 V152 M115 130 V152" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="anim-circuit-drift" />
            <circle cx="48" cy="85" r="3" fill="currentColor" />
            <circle cx="48" cy="115" r="3" fill="currentColor" />
            <circle cx="152" cy="100" r="3" fill="currentColor" />
          </svg>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-28 opacity-[0.06] pointer-events-none flex items-end justify-center">
          <svg viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover text-[#071A41]">
            <path d="M0 200L40 180H120L160 150H260L300 170H450L500 130H700L750 170H900L940 150H1040L1080 180H1200V200H0Z" fill="currentColor" />
            <path d="M500 130L600 90L700 130V200H500V130Z" fill="currentColor" />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 w-28 sm:w-44 h-10 sm:h-14 pointer-events-none">
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
            <path d="M0 100C50 90 100 60 140 20C170 -10 200 0 200 0V100H0Z" fill="#1557C0" fillOpacity="0.75" />
            <path d="M0 100C40 95 90 75 130 35C150 15 180 5 180 5" stroke="#E7B93E" strokeWidth="4" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-28 sm:w-44 h-10 sm:h-14 pointer-events-none">
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
            <path d="M200 100C150 90 100 60 60 20C30 -10 0 0 0 0V100H200Z" fill="#1557C0" fillOpacity="0.75" />
            <path d="M200 100C160 95 110 75 70 35C50 15 20 5 20 5" stroke="#E7B93E" strokeWidth="4" />
          </svg>
        </div>
      </div>

      {/* TOP HEADER: Centered Ultra-Luxury Branding */}
      <div className="w-full max-w-lg text-center space-y-1.5 sm:space-y-2.5 relative z-10 pt-1 pb-1">

        {/* Stage 1: Accreditation Top Badge & Laptop Install App Button */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <div className={cn(
            "inline-flex items-center gap-1.5 sm:gap-2 px-3 py-0.5 sm:py-1 rounded-full bg-white/90 border border-[#071A41]/10 text-[9px] sm:text-xs font-black text-[#071A41] shadow-xs backdrop-blur-md transition-all duration-700 ease-out transform",
            animStage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}>
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E7B93E] animate-pulse" />
            <span>Autonomous · NBA &amp; NAAC &apos;A&apos; Accredited Institution</span>
          </div>

          {/* Dedicated Install App / Download Button for Laptop & Desktop */}
          {!isAppInstalled && (
            <button
              type="button"
              onClick={handleDirectInstall}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#1455D9] via-[#0f44b0] to-[#071A41] text-white text-[10px] sm:text-xs font-black shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-cyan-400/40",
                animStage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              )}
              title="Install Web App on PC/Laptop or Download APK"
            >
              <Download className="w-3 h-3 text-[#FACC15] animate-bounce" />
              <span>Install App</span>
            </button>
          )}
        </div>

        {/* Stage 2: INSTAGRAM-STYLE MODERN SQUIRCLE EMBLEM */}
        <div className={cn(
          "relative flex items-center justify-center h-24 sm:h-28 my-1 anim-medallion-levitate transition-all duration-700 ease-out transform",
          animStage >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}>
          {/* Outer Pulsing Gradient Aura */}
          <div className="absolute w-22 h-22 sm:w-26 sm:h-26 rounded-[28px] bg-gradient-to-tr from-[#1455D9]/30 via-[#06B6D4]/25 to-[#EAB308]/30 blur-md animate-pulse" />

          {/* Modern Instagram-Style Radiant Squircle */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] sm:rounded-[26px] p-1 bg-gradient-to-tr from-[#051329] via-[#1455D9] via-60%-[#06B6D4] to-[#FACC15] shadow-[0_12px_32px_rgba(7,26,65,0.28),0_0_20px_rgba(6,182,212,0.35)] ring-1.5 ring-white/60 overflow-hidden hover:scale-105 transition-all duration-500 group cursor-pointer">
            {/* Top-Right Sunlight Flare */}
            <div className="absolute top-0 right-0 w-12 h-12 bg-radial from-[#FDE047]/60 via-[#06B6D4]/20 to-transparent pointer-events-none" />

            {/* Specular Sheen Sweep */}
            <div className="anim-gold-sheen" />

            {/* Inner Pure White Disc Housing Authentic Emblem */}
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-1.5 shadow-[0_4px_12px_rgba(5,19,41,0.2)] border-2 border-[#EAB308]/90 overflow-hidden relative z-10 group-hover:rotate-3 transition-transform duration-500">
              <Image
                src="/college-emblem.png"
                alt="V.S.B. Engineering College Logo"
                width={72}
                height={72}
                className="w-full h-full object-contain drop-shadow-xs"
                priority
              />
            </div>
          </div>

          {/* Sparkling Diamond Glint at Top-Right */}
          <div className="absolute top-0.5 right-1/2 translate-x-10 sm:translate-x-12 -translate-y-1 text-[#FACC15] anim-diamond-twinkle pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FACC15] drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]" />
          </div>
        </div>

        {/* Master Branding Typography with Staged Reveals */}
        <div className="space-y-1.5 w-full">
          {/* Stage 3: College Master Title */}
          <div className={cn(
            "transition-all duration-700 ease-out transform",
            animStage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <h1
              className="text-base sm:text-2xl font-black tracking-tight uppercase py-0.5"
              style={{ letterSpacing: '0.02em', fontWeight: 900 }}
            >
              <span className="shimmer-liquid-gold">V.S.B. ENGINEERING COLLEGE</span>
            </h1>
          </div>

          {/* Stage 4: Autonomous Karur Tag */}
          <div className={cn(
            "transition-all duration-700 ease-out transform",
            animStage >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <p className="text-[9px] sm:text-xs font-black text-[#1557C0] tracking-widest uppercase flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#1557C0]/10 via-[#1557C0]/15 to-[#1557C0]/10 px-3.5 py-0.5 rounded-full border border-[#1557C0]/20 mx-auto w-fit shadow-xs">
              <GraduationCap className="w-3.5 h-3.5 text-[#E7B93E]" />
              <span>AUTONOMOUS INSTITUTION · KARUR</span>
            </p>
          </div>

          {/* Stage 5: Glowing Golden Light Beam Separator */}
          <div className={cn(
            "w-36 sm:w-48 h-[2px] bg-gradient-to-r from-transparent via-[#E7B93E] to-transparent mx-auto rounded-full my-1 anim-beam-glow transition-all duration-700 ease-out transform origin-center",
            animStage >= 5 ? "opacity-80 scale-x-100" : "opacity-0 scale-x-0"
          )} />

          {/* Stage 6: Prominent Digital Portal of AI&DS Master Title */}
          <div className={cn(
            "space-y-2 transition-all duration-700 ease-out transform",
            animStage >= 6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {/* PRESTIGIOUS ROYAL SAPPHIRE & GOLD APP TITLE BADGE */}
            <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-2xl bg-gradient-to-r from-[#1455D9] via-[#1E60E6] to-[#0F44B8] text-white shadow-[0_10px_25px_-3px_rgba(20,85,217,0.4)] border-2 border-[#E7B93E] hover:scale-105 transition-all duration-300">
              <Cpu className="w-5 h-5 text-[#FFF3B8] animate-pulse shrink-0" />
              <span className="text-base sm:text-2xl font-black tracking-wider text-white drop-shadow-sm">
                Digital Portal of AI&amp;DS
              </span>
              <Sparkles className="w-4 h-4 text-[#F4C430] shrink-0" />
            </div>

            <h2 className="text-xs sm:text-sm font-bold leading-tight">
              <span className="block text-slate-500 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-0.5">Department of</span>
              <span className="block font-black text-[#1557C0] text-xs sm:text-base tracking-wide">
                ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN QUANTUM ULTRA-LUXURY SUCCESS PORTAL MODAL */}
      {authStatus === 'success' && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#030B1C]/90 backdrop-blur-3xl text-white select-none animate-fade-in overflow-hidden">

          {/* Ambient Celestial Light Halos */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#1455D9]/30 via-[#22C7E8]/20 to-[#F4C430]/25 blur-[120px] anim-lux-floating pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-amber-500/20 blur-[100px] pointer-events-none" />

          {/* Micro Geometric Hologram Matrix Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

          {/* Master Luxury Glass Container */}
          <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-6 p-7 sm:p-10 rounded-[2.75rem] bg-gradient-to-b from-white/[0.14] via-[#0A1A3A]/80 to-[#051126]/95 backdrop-blur-3xl border border-amber-400/30 shadow-[0_25px_100px_rgba(0,0,0,0.8),0_0_60px_rgba(244,196,48,0.25)_inset] anim-lux-card overflow-hidden">

            {/* Top Light Ray Beam */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F4C430] to-transparent shadow-[0_0_20px_#F4C430]" />

            {/* Stage 1: Holographic Gyroscope Scanner Crest */}
            <div className="relative flex items-center justify-center my-3">
              {/* Outer Golden Laser Ring with rotating ticks */}
              <div className="absolute w-44 h-44 rounded-full border border-amber-400/40 anim-lux-orbit-cw flex items-center justify-center">
                <div className="absolute top-0 w-2.5 h-2.5 bg-[#F4C430] rounded-full shadow-[0_0_12px_#F4C430]" />
                <div className="absolute bottom-0 w-2.5 h-2.5 bg-[#22C7E8] rounded-full shadow-[0_0_12px_#22C7E8]" />
              </div>

              {/* Middle Cyan Electric Ring */}
              <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-[#22C7E8]/60 anim-lux-orbit-ccw" />

              {/* Inner Diamond Hologram Hexagon Ring */}
              <div className="absolute w-28 h-28 rounded-full border border-emerald-400/50 anim-lux-orbit-fast" />

              {/* Center Radiant 3D Shield Orb */}
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#071A3D] via-[#0F3577] to-[#1455D9] p-1 shadow-[0_0_50px_rgba(34,199,232,0.6)] flex items-center justify-center border border-amber-400/50 anim-lux-pulse">
                {/* Laser Scanning Line */}
                <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#22C7E8] to-transparent shadow-[0_0_10px_#22C7E8] anim-lux-scanner pointer-events-none" />

                <div className="w-full h-full rounded-[1.35rem] bg-[#051126]/90 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-amber-400/20" />
                  <CheckCircle2 className="w-12 h-12 text-[#22C7E8] drop-shadow-[0_0_16px_rgba(34,199,232,0.9)] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Stage 2: Luxury Security Typography & Role Clearance */}
            <div className="space-y-3">
              {/* Golden Authorization Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(244,196,48,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-[#F4C430] animate-spin" style={{ animationDuration: '4s' }} />
                <span className="lux-gold-text tracking-wider">BIOMETRIC 2FA CLEARANCE GRANTED</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight lux-gold-text">
                Security Verified
              </h2>

              {/* Role Elevated Clearance Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-cyan-200 shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {selectedRole === 'admin' && '👑 Super Administrator Console'}
                  {selectedRole === 'hod' && '🏛️ Head of Department Directorate'}
                  {selectedRole === 'advisor' && '🛡️ Class Advisor Mentorship Suite'}
                  {selectedRole === 'faculty' && '📚 Course Faculty Portal'}
                  {selectedRole === 'student' && '🎓 Student Intelligence Portal'}
                </span>
              </div>

              {/* Dynamic Handshake Subtitle */}
              <p className="text-xs text-slate-300 font-medium px-4 leading-relaxed">
                {authMessage}
              </p>
            </div>

            {/* Stage 3: Hyper-Luxury Laser Progress Streamer */}
            <div className="w-full space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-bold px-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  TLS 1.3 / AES-256 GCM
                </span>
                <span className="text-[#F4C430] font-black">100% SECURE</span>
              </div>

              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/20 shadow-inner relative">
                <div className="h-full bg-gradient-to-r from-[#1455D9] via-[#22C7E8] via-[#10B981] to-[#F4C430] rounded-full anim-lux-progress shadow-[0_0_15px_#22C7E8]" />
              </div>

              <p className="text-[10px] text-slate-400 font-mono tracking-wider pt-0.5">
                Establishing High-Speed Encrypted Session · Redirecting Now...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ULTRA-LUXURY LOGIN CARD (STAGE 8) */}
      <div
        className={cn(
          "w-full max-w-[395px] bg-white/85 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.25rem] border p-3.5 sm:p-5 space-y-3 sm:space-y-4 relative z-10 my-0.5 shadow-[0_25px_60px_-15px_rgba(7,26,65,0.18),0_0_0_1.5px_rgba(255,255,255,0.85)_inset] transition-all duration-700 ease-out transform",
          animStage >= 8 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none",
          authStatus === 'error' ? 'border-rose-500/90 anim-error-shake shadow-[0_0_40px_rgba(244,63,94,0.35)]' : 'border-white/95',
          authStatus === 'success' && 'border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.4)] scale-[0.98]'
        )}
      >

        {/* ROLE SELECTION */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <label className="block text-[10px] font-black text-[#071A41] uppercase tracking-wider">
              SELECT YOUR PORTAL
            </label>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-[#1557C0]" />
              <span>Role-Based Access</span>
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
            {[
              { id: 'student', label: 'Student', icon: '🎓' },
              { id: 'faculty', label: 'Faculty', icon: '📚' },
              { id: 'advisor', label: 'Advisor', icon: '🛡️' },
              { id: 'hod', label: 'HOD', icon: '🏛️' },
              { id: 'admin', label: 'Admin', icon: '⚙️' },
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRole(role.id as any)
                  setRegisterNumber('')
                  setFacultyId('')
                  setPassword('')
                  setEmail('')
                  setOtpSent(false)
                  setOtp('')
                  setAuthStatus('idle')
                }}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-0.5 text-xs font-bold transition-all duration-300 cursor-pointer border shadow-xs',
                  selectedRole === role.id
                    ? 'bg-gradient-to-b from-[#1557C0] via-[#0D3B82] to-[#071A41] text-white border-cyan-400/40 shadow-[0_10px_20px_-3px_rgba(21,87,192,0.4)] scale-[1.03]'
                    : 'bg-white/80 hover:bg-white text-[#071A41] hover:border-slate-300 border-slate-200/80 hover:scale-[1.01]'
                )}
              >
                {selectedRole === role.id && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E7B93E] text-[#071A41] flex items-center justify-center shadow-md">
                    <Check className="w-2 h-2 stroke-[3.5]" />
                  </span>
                )}
                <span className="text-lg sm:text-xl drop-shadow-xs">{role.icon}</span>
                <span className="text-[9px] sm:text-[10px] font-black truncate">{role.label}</span>
                {selectedRole === role.id && (
                  <span className="w-4 h-0.5 bg-[#E7B93E] rounded-full mt-0.5 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ERROR ALERT BANNER */}
        {authStatus === 'error' && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200/90 text-rose-800 flex items-center gap-3 animate-fade-in shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-rose-900 uppercase tracking-wide">Access Denied</p>
              <p className="text-[10px] text-rose-700 font-semibold truncate">{authMessage}</p>
            </div>
          </div>
        )}

        {/* INNER FORM CONTAINER */}
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white/90 to-[#F8FAFD]/90 backdrop-blur-md p-4 sm:p-5 space-y-3.5 anim-form-reveal shadow-sm">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1557C0] to-[#22C7E8] text-white flex items-center justify-center shadow-md shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-[#071A41] flex items-center gap-1.5">
                <span>Welcome Back</span>
                <span>👋</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold">
                Sign in to access your <span className="capitalize font-black text-[#1557C0]">{selectedRole} Portal</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">

            {/* Student */}
            {selectedRole === 'student' && (
              <>
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#1557C0]" />
                      <span>Register Number or Email ID</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Reg No. / Email</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1557C0] group-focus-within:scale-110 transition-all">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 922525243103"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-[#071A41] bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1557C0]/15 focus:border-[#1557C0] focus:shadow-[0_0_20px_rgba(21,87,192,0.18)] transition-all placeholder:text-slate-400 placeholder:font-normal shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#1557C0]" />
                      <span>Password</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Encrypted</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1557C0] group-focus-within:scale-110 transition-all">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-[#071A41] bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1557C0]/15 focus:border-[#1557C0] focus:shadow-[0_0_20px_rgba(21,87,192,0.18)] transition-all placeholder:text-slate-400 placeholder:font-normal shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#1557C0] hover:scale-110 focus:outline-none cursor-pointer transition-all"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden w-full font-black py-3 sm:py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#071A41] shadow-[0_10px_25px_rgba(21,87,192,0.35)] hover:shadow-[0_15px_30px_rgba(21,87,192,0.5)] transition-all duration-300 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2 border border-cyan-400/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                  <LogIn className="w-4 h-4 text-[#E7B93E] group-hover:rotate-12 transition-transform" />
                  <span>{loading ? 'Authenticating...' : 'Login to Student Portal'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}

            {/* Faculty */}
            {selectedRole === 'faculty' && (
              <>
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#1557C0]" />
                      <span>Faculty Email ID or Name</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Email / Name</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1557C0] group-focus-within:scale-110 transition-all">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. karthik@vsb.edu.in or Karthik S"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-[#071A41] bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1557C0]/15 focus:border-[#1557C0] focus:shadow-[0_0_20px_rgba(21,87,192,0.18)] transition-all placeholder:text-slate-400 placeholder:font-normal shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#1557C0]" />
                      <span>Password</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Encrypted</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1557C0] group-focus-within:scale-110 transition-all">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-[#071A41] bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1557C0]/15 focus:border-[#1557C0] focus:shadow-[0_0_20px_rgba(21,87,192,0.18)] transition-all placeholder:text-slate-400 placeholder:font-normal shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#1557C0] hover:scale-110 focus:outline-none cursor-pointer transition-all"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden w-full font-black py-3 sm:py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#071A41] shadow-[0_10px_25px_rgba(21,87,192,0.35)] hover:shadow-[0_15px_30px_rgba(21,87,192,0.5)] transition-all duration-300 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2 border border-cyan-400/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                  <LogIn className="w-4 h-4 text-[#E7B93E] group-hover:rotate-12 transition-transform" />
                  <span>{loading ? 'Authenticating...' : 'Login to Faculty Portal'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}

            {/* Class Advisor */}
            {selectedRole === 'advisor' && (
              <>
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#1557C0]" />
                      <span>Class Advisor Email ID or Name</span>
                    </span>
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Email / Name
                    </span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1557C0] group-focus-within:scale-110 transition-all">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Karthik S"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-[#071A41] bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1557C0]/15 focus:border-[#1557C0] focus:shadow-[0_0_20px_rgba(21,87,192,0.18)] transition-all placeholder:text-slate-400 placeholder:font-normal shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#1557C0]" />
                      <span>Password</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Encrypted</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1557C0] group-focus-within:scale-110 transition-all">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-[#071A41] bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1557C0]/15 focus:border-[#1557C0] focus:shadow-[0_0_20px_rgba(21,87,192,0.18)] transition-all placeholder:text-slate-400 placeholder:font-normal shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#1557C0] hover:scale-110 focus:outline-none cursor-pointer transition-all"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden w-full font-black py-3 sm:py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#071A41] shadow-[0_10px_25px_rgba(21,87,192,0.35)] hover:shadow-[0_15px_30px_rgba(21,87,192,0.5)] transition-all duration-300 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2 border border-cyan-400/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                  <LogIn className="w-4 h-4 text-[#E7B93E] group-hover:rotate-12 transition-transform" />
                  <span>{loading ? 'Authenticating...' : 'Login to Advisor Portal (Full Class Dossier)'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}

            {/* HOD */}
            {selectedRole === 'hod' && (
              <>
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#1557C0]" />
                      <span>HOD Email ID or Name</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Email / Name</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1557C0] group-focus-within:scale-110 transition-all">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g.  Karthik S"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-[#071A41] bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1557C0]/15 focus:border-[#1557C0] focus:shadow-[0_0_20px_rgba(21,87,192,0.18)] transition-all placeholder:text-slate-400 placeholder:font-normal shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#1557C0]" />
                      <span>Password</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Encrypted</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1557C0] group-focus-within:scale-110 transition-all">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-[#071A41] bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1557C0]/15 focus:border-[#1557C0] focus:shadow-[0_0_20px_rgba(21,87,192,0.18)] transition-all placeholder:text-slate-400 placeholder:font-normal shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#1557C0] hover:scale-110 focus:outline-none cursor-pointer transition-all"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden w-full font-black py-3 sm:py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#071A41] shadow-[0_10px_25px_rgba(21,87,192,0.35)] hover:shadow-[0_15px_30px_rgba(21,87,192,0.5)] transition-all duration-300 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2 border border-cyan-400/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                  <LogIn className="w-4 h-4 text-[#E7B93E] group-hover:rotate-12 transition-transform" />
                  <span>{loading ? 'Authenticating...' : 'Login to HOD Portal'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}

            {/* Admin */}
            {selectedRole === 'admin' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#1557C0]" />
                      <span>Administrator Email ID</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Login via OTP</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1557C0] group-focus-within:scale-110 transition-all">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="e.g. admin@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-[#071A41] bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1557C0]/15 focus:border-[#1557C0] focus:shadow-[0_0_20px_rgba(21,87,192,0.18)] transition-all placeholder:text-slate-400 placeholder:font-normal shadow-xs"
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || !email}
                    className="group relative overflow-hidden w-full font-black py-3 sm:py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#071A41] shadow-[0_10px_25px_rgba(21,87,192,0.35)] hover:shadow-[0_15px_30px_rgba(21,87,192,0.5)] transition-all duration-300 cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2 border border-cyan-400/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                    <Send className="w-4 h-4 text-[#E7B93E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span>{loading ? 'Sending OTP...' : 'Send Login OTP'}</span>
                  </button>
                ) : (
                  <div className="space-y-2.5 animate-fade-in">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[#1557C0]" />
                        <span>Enter 6-Digit OTP</span>
                      </label>
                      <input
                        type="text"
                        placeholder="••••••"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 text-center text-lg font-mono font-black tracking-widest rounded-xl border border-blue-300 text-[#071A41] bg-blue-50/70 focus:outline-none focus:ring-4 focus:ring-[#1557C0]/20 focus:border-[#1557C0] transition-all shadow-inner"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyOTP()}
                      disabled={loading}
                      className="w-full font-black py-3 sm:py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{loading ? 'Verifying...' : 'Verify OTP & Login'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Quick Help & Secure Links Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-bold">
            <span className="flex items-center gap-1 text-slate-600 font-extrabold">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS 1.3 Secured</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-[#1557C0]">
              <HelpCircle className="w-3.5 h-3.5 text-[#1557C0]" />
              <span>Help Center</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-[#1557C0]">
              <Mail className="w-3.5 h-3.5 text-[#1557C0]" />
              <span>Admin Support</span>
            </span>
          </div>

        </div>
      </div>

      {/* QUOTE (STAGE 9) */}
      <div className={cn(
        "text-center space-y-1 relative z-10 pt-2 pb-1 transition-all duration-700 ease-out transform",
        animStage >= 9 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}>
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent via-[#E7B93E] to-slate-300" />
          <p
            className="text-base sm:text-xl font-bold tracking-wider italic text-[#071A41]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            &ldquo;a place for placement&rdquo;
          </p>
          <div className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent via-[#E7B93E] to-slate-300" />
        </div>
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <span className="h-[2px] bg-[#E7B93E] w-12 sm:w-16 rounded-full block anim-quote-underline shadow-xs" />
          <span className="text-xs">🎓</span>
          <span className="h-[2px] bg-[#E7B93E] w-12 sm:w-16 rounded-full block anim-quote-underline shadow-xs" />
        </div>
      </div>

      {/* FOOTER (STAGE 9) */}
      <footer className={cn(
        "w-full max-w-[420px] mx-auto flex flex-col items-center justify-center gap-2 text-[10px] sm:text-[11px] text-[#071A41] font-bold z-10 pt-2 border-t border-blue-200/50 px-2 text-center transition-all duration-700 ease-out transform",
        animStage >= 9 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}>
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border border-blue-100 shadow-2xs">
            <Brain className="w-3.5 h-3.5 text-[#1557C0] shrink-0" />
            <span>Learn Today</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border border-amber-100 shadow-2xs">
            <Lightbulb className="w-3.5 h-3.5 text-[#E7B93E] shrink-0" />
            <span>Build Tomorrow</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border border-emerald-100 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Better Future</span>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 🚀 2-STEP STUDENT PROFILE VERIFICATION & EMAIL OTP ONBOARDING WIZARD */}
      {/* ========================================================================= */}
      {showOnboardingModal && onboardingUser && (
        <div className="fixed inset-0 z-50 bg-[#071A41]/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg sm:max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 border border-gray-100 max-h-[92vh] overflow-y-auto overscroll-contain">

            {/* Modal Header with Progress Step Indicator */}
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1557C0] text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                  Initial Profile Verification &amp; Security Setup
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-500">
                  {onboardingForm.registerNumber}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base sm:text-xl font-black text-[#071A41]">
                  {onboardingStep === 1 ? 'Step 1: Review Academic Details' : 'Step 2: Password & Email OTP Verification'}
                </h3>
                <span className="text-[11px] sm:text-xs font-black text-[#1557C0] bg-blue-50 px-2 sm:px-2.5 py-1 rounded-xl shrink-0">
                  Step {onboardingStep} of 2
                </span>
              </div>

              {/* Visual Step Bar */}
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <div className={cn("h-1.5 rounded-full transition-all", onboardingStep >= 1 ? "bg-[#1557C0]" : "bg-gray-200")} />
                <div className={cn("h-1.5 rounded-full transition-all", onboardingStep === 2 ? "bg-[#1557C0]" : "bg-gray-200")} />
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STEP 1: REVIEW & EDIT STUDENT PARTICULARS / REQUEST CORRECTION */}
            {/* ========================================================================= */}
            {onboardingStep === 1 && (
              <form onSubmit={handleProceedToSecurityStep} className="space-y-4 text-xs">

                {/* Locked Academic Cards Grid */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#071A41]">
                      <span>🎓</span>
                      <span>Official Academic Profile (Locked)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCorrectionModal(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 text-[10.5px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <Pencil className="w-3 h-3 text-amber-700" />
                      <span>Request Admin Correction</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Register Number */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">🆔 Register Number</span>
                        <span className="font-mono font-black text-xs text-[#071A41]">{onboardingForm.registerNumber}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    </div>

                    {/* Full Name */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">👤 Full Name</span>
                        <span className={`font-bold text-xs ${onboardingForm.name ? 'text-[#071A41]' : 'text-slate-300 italic'}`}>
                          {onboardingForm.name || '— Not Set'}
                        </span>
                      </div>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>

                    {/* Program / Department */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">🏢 Department</span>
                        <span className={`font-bold text-xs ${onboardingForm.department ? 'text-[#1557C0]' : 'text-slate-300 italic'}`}>
                          {onboardingForm.department || '— Not Set'}
                        </span>
                      </div>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>

                    {/* Year & Semester */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">📅 Year &amp; Sem</span>
                        <span className={`font-bold text-xs ${(onboardingForm.year || onboardingForm.semester) ? 'text-[#071A41]' : 'text-slate-300 italic'}`}>
                          {onboardingForm.year && onboardingForm.semester
                            ? `${onboardingForm.year} · ${onboardingForm.semester}`
                            : onboardingForm.year || onboardingForm.semester || '— Not Set'}
                        </span>
                      </div>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>

                    {/* Assigned Section */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">🏷️ Section</span>
                        <span className={`font-bold text-xs ${onboardingForm.section ? 'text-[#071A41]' : 'text-slate-300 italic'}`}>
                          {onboardingForm.section || '— Not Set'}
                        </span>
                      </div>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>

                    {/* Class Advisor */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">👨‍🏫 Class Advisor</span>
                        <span className={`font-bold text-xs ${onboardingForm.advisorName ? 'text-[#1557C0]' : 'text-slate-300 italic'}`}>
                          {onboardingForm.advisorName || '— Not Set'}
                        </span>
                      </div>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Correction submitted alert */}
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

                {/* Passport Photo */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-[#071A41]">
                      <span>📸</span>
                      <span>Student Passport Photograph</span>
                      <span className="text-[10px] text-slate-400 font-medium">(Pre-filled on ID Card)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span>🪪</span> Embeds on ID Card
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Preview box */}
                    <div className="w-16 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {passportPhotoPreview ? (
                        <img src={passportPhotoPreview} alt="Passport" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-1">
                            <span className="text-base">👤</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium">No Photo</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1557C0] text-white text-[11px] font-bold hover:bg-[#1142A0] transition-all shadow-xs">
                        <span>📤</span>
                        Upload Passport Photo
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setPassportPhotoFile(file)
                              setPassportPhotoPreview(URL.createObjectURL(file))
                            }
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Upload a clear frontal passport size photograph (JPG, PNG). This will appear on your Student Portal &amp; downloadable Digital ID Card.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact & Personal Particulars */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#071A41]">
                    <span>📞</span>
                    <span>Contact &amp; Personal Particulars (Editable)</span>
                  </div>

                  {/* Student Mobile + Parent Mobile */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        📱 Student Mobile *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="Enter 10-digit mobile"
                        value={onboardingForm.phone}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        👨‍👩‍👧 Parent Mobile *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="Enter parent mobile"
                        value={onboardingForm.parentPhone}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, parentPhone: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                      />
                      <label className="mt-1 flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onboardingForm.parentWhatsApp}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, parentWhatsApp: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                          💬 Available on WhatsApp
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Date of Birth - Day / Month / Year dropdowns */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-700 text-[11px]">
                        🎂 Date of Birth (Day / Month / Year) *
                      </label>
                      {onboardingForm.dobDay && onboardingForm.dobMonth && onboardingForm.dobYear && (
                        <span className="text-[10px] text-[#1557C0] font-bold">
                          Selected: {String(onboardingForm.dobDay).padStart(2,'0')} {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(onboardingForm.dobMonth)-1]} {onboardingForm.dobYear}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Day */}
                      <select
                        required
                        value={onboardingForm.dobDay}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, dobDay: e.target.value })}
                        className="p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                      >
                        <option value="">📅 Day</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                          <option key={d} value={String(d).padStart(2,'0')}>{String(d).padStart(2,'0')}</option>
                        ))}
                      </select>
                      {/* Month */}
                      <select
                        required
                        value={onboardingForm.dobMonth}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, dobMonth: e.target.value })}
                        className="p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                      >
                        <option value="">🗓️ Month</option>
                        {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                          <option key={m} value={String(i+1).padStart(2,'0')}>{i + 1} - {m}</option>
                        ))}
                      </select>
                      {/* Year */}
                      <select
                        required
                        value={onboardingForm.dobYear}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, dobYear: e.target.value })}
                        className="p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                      >
                        <option value="">📆 Year</option>
                        {Array.from({ length: 30 }, (_, i) => 2012 - i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Blood Group + Residency Selection */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        🩸 Blood Group
                      </label>
                      <select
                        value={onboardingForm.bloodGroup}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, bloodGroup: e.target.value })}
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
                        value={onboardingForm.residency}
                        onChange={(e) => setOnboardingForm({
                          ...onboardingForm,
                          residency: e.target.value,
                          busNo: '',
                          boardingPoint: '',
                          hostelBlock: '',
                          roomNo: ''
                        })}
                        className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] text-xs"
                      >
                        <option value="">Select Residency *</option>
                        <option value="Day Scholar">🏡 Dayscholar</option>
                        <option value="Hostel">🏢 Hostel (Campus Resident)</option>
                      </select>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* 🏡 DAYSCHOLAR COMMUTE OPTIONS */}
                  {/* ========================================================================= */}
                  {onboardingForm.residency === 'Day Scholar' && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                          <span>🚌</span> Dayscholar Commute Options *
                        </span>
                        <span className="text-[10px] text-blue-700 font-bold bg-blue-100/80 px-2 py-0.5 rounded-md">
                          Daily Transport
                        </span>
                      </div>

                      {/* Transport Mode Options Grid */}
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
                              onClick={() => setOnboardingForm({ ...onboardingForm, dayScholarTransport: mode.id as any })}
                              className={cn(
                                "p-2 rounded-xl border text-left flex items-center gap-1.5 transition-all cursor-pointer font-bold text-[11px]",
                                onboardingForm.dayScholarTransport === mode.id
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

                      {/* 1. If College Bus */}
                      {onboardingForm.dayScholarTransport === 'College Bus' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div>
                            <label className="block font-bold text-gray-700 text-[10px] mb-1">
                              🚌 College Bus / Route No. *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Bus 12 / Route 08"
                              value={onboardingForm.busNo}
                              onChange={(e) => setOnboardingForm({ ...onboardingForm, busNo: e.target.value })}
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
                              placeholder="e.g. Karur Central Bus Stand / Thanthonimalai"
                              value={onboardingForm.boardingPoint}
                              onChange={(e) => setOnboardingForm({ ...onboardingForm, boardingPoint: e.target.value })}
                              className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                            />
                          </div>
                        </div>
                      )}

                      {/* 2. If Out Bus */}
                      {onboardingForm.dayScholarTransport === 'Out Bus' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div>
                            <label className="block font-bold text-gray-700 text-[10px] mb-1">
                              📍 Boarding Point Details *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Town Hall Stop / Gandhigramam"
                              value={onboardingForm.boardingPoint}
                              onChange={(e) => setOnboardingForm({ ...onboardingForm, boardingPoint: e.target.value })}
                              className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-gray-700 text-[10px] mb-1">
                              🏷️ Select Transport Services *
                            </label>
                            <select
                              value={onboardingForm.outBusTransportService}
                              onChange={(e) => setOnboardingForm({ ...onboardingForm, outBusTransportService: e.target.value })}
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

                      {/* 3. If Bike or Self */}
                      {(onboardingForm.dayScholarTransport === 'Bike' || onboardingForm.dayScholarTransport === 'Self') && (
                        <div className="pt-1">
                          <label className="block font-bold text-gray-700 text-[10px] mb-1">
                            📍 Starting Point / Location Details *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Thanthonimalai / Velliyanai / Near Campus"
                            value={onboardingForm.boardingPoint}
                            onChange={(e) => setOnboardingForm({ ...onboardingForm, boardingPoint: e.target.value })}
                            className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* 🏢 HOSTELLER OPTIONS (6 HOSTEL OPTIONS & ROOM NO) */}
                  {/* ========================================================================= */}
                  {onboardingForm.residency === 'Hostel' && (
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
                            value={onboardingForm.hostelBlock}
                            onChange={(e) => setOnboardingForm({ ...onboardingForm, hostelBlock: e.target.value })}
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
                            value={onboardingForm.roomNo}
                            onChange={(e) => setOnboardingForm({ ...onboardingForm, roomNo: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-xs text-[#071A41] focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Professional Student Details Attestation & Verification Card */}
                <div className={cn(
                  "rounded-2xl border-2 p-3.5 transition-all duration-200",
                  onboardingForm.detailsConfirmed
                    ? "bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-emerald-50/30 border-blue-400/90 shadow-xs"
                    : "bg-slate-50/90 border-slate-200 hover:border-slate-300"
                )}>
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <div className="mt-0.5 flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        required
                        checked={onboardingForm.detailsConfirmed}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, detailsConfirmed: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1557C0] border-slate-300 focus:ring-2 focus:ring-[#1557C0] cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className={cn("w-3.5 h-3.5", onboardingForm.detailsConfirmed ? "text-emerald-600" : "text-[#1557C0]")} />
                          <span className="text-xs font-black text-[#071A41]">
                            Institutional Student Declaration &amp; Attestation
                          </span>
                        </div>
                        {onboardingForm.detailsConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified &amp; Confirmed
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                            Required Confirmation
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                        I solemnly declare and confirm that I have thoroughly verified all my academic particulars, contact numbers, date of birth, blood group, residency information, and photograph entered above.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Proceed Button */}
                <div className="pt-2 border-t border-gray-100">
                  <Button
                    type="submit"
                    className={cn(
                      "w-full px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all text-xs sm:text-sm",
                      onboardingForm.detailsConfirmed
                        ? "bg-gradient-to-r from-[#071A41] via-[#0E387A] to-[#1557C0] hover:from-[#051330] hover:to-[#0d45b5] text-white shadow-blue-900/25 hover:scale-[1.01] cursor-pointer"
                        : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none"
                    )}
                  >
                    <span>Proceed to Password &amp; Email Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: SET PERMANENT PASSWORD & EMAIL OTP VERIFICATION */}
            {/* ========================================================================= */}
            {onboardingStep === 2 && (
              <form onSubmit={handleCompleteOnboarding} className="space-y-4 text-xs">

                {/* 1. Permanent Password Section */}
                <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
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
                          autoComplete="new-password"
                          placeholder="Create strong password"
                          value={onboardingForm.newPassword}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, newPassword: e.target.value })}
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
                          autoComplete="new-password"
                          placeholder="Repeat password"
                          value={onboardingForm.confirmPassword}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, confirmPassword: e.target.value })}
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
                <div className="p-3 sm:p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                    <span className="font-black text-[#071A41] flex items-center gap-2 text-xs">
                      <img src="/email-otp-icon.png" alt="Email OTP" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain" />
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
                        placeholder="Enter your personal email (e.g. name@gmail.com)"
                        value={onboardingForm.email}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, email: e.target.value })}
                        className="flex-1 w-full p-2.5 sm:p-3 rounded-xl border border-gray-300 bg-white font-medium text-xs sm:text-sm text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSendEmailOTP}
                        disabled={onboardingLoading || emailOtpCooldown > 0}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl bg-[#1557C0] hover:bg-[#0e44b5] text-white font-bold text-xs sm:text-sm shrink-0 cursor-pointer shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{emailOtpCooldown > 0 ? `Resend (${emailOtpCooldown}s)` : emailOtpSent ? 'Resend OTP' : 'Send Code'}</span>
                      </button>
                    </div>
                  </div>

                  {/* OTP Input Section */}
                  {emailOtpSent && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-gray-700 text-[11px]">
                          Enter 6-Digit Email Verification Code *
                        </label>
                        {isOnboardingVerifyingOtp && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1557C0] animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Auto-verifying...
                          </span>
                        )}
                        {isOnboardingOtpVerified && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Verified!
                          </span>
                        )}
                      </div>
                      <OTPInput
                        length={6}
                        value={onboardingForm.emailOtp}
                        onChange={(val) => {
                          const clean = val.replace(/\D/g, '').slice(0, 6)
                          setOnboardingForm((prev) => ({ ...prev, emailOtp: clean }))
                          if (clean.length === 6 && clean !== lastVerifiedOnboardingOtpRef.current) {
                            verifyOnboardingOtpCode(clean)
                          } else if (clean.length < 6) {
                            if (isOnboardingOtpVerified) setIsOnboardingOtpVerified(false)
                            if (onboardingOtpError) setOnboardingOtpError(null)
                            lastVerifiedOnboardingOtpRef.current = null
                          }
                        }}
                        autoFocus
                      />
                      {onboardingOtpError && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{onboardingOtpError}</span>
                        </div>
                      )}
                      {isOnboardingOtpVerified && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                          <div className="flex items-center gap-1.5 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Security Code Verified &amp; Confirmed</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsOnboardingOtpVerified(false)
                              setOnboardingForm((prev) => ({ ...prev, emailOtp: '' }))
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

                {/* Wizard Navigation Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-3 border-t border-gray-100 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Details</span>
                  </button>

                  <Button
                    type="submit"
                    size="default"
                    loading={onboardingLoading}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] text-white shadow-md text-xs sm:text-sm cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <span>Verify OTP &amp; Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📝 OFFICIAL ACADEMIC CORRECTION REQUEST MODAL TO ADMIN */}
      {/* ========================================================================= */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-60 bg-[#071A41]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
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
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendCorrectionRequest} className="space-y-3.5 text-xs">
              <p className="text-[11px] text-slate-600 font-medium">
                Official enrollment data (Name, Register Number, Department, Semester, Section, Advisor) is locked for security. Select the parameter to correct and provide official justification:
              </p>

              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Field / Particular to Correct *
                </label>
                <select
                  value={correctionCategory}
                  onChange={(e) => setCorrectionCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-[#071A41] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                >
                  <option value="name">Full Name (Spelling / Initial correction)</option>
                  <option value="department">Program / Department</option>
                  <option value="year">Academic Year</option>
                  <option value="semester">Semester</option>
                  <option value="section">Assigned Section</option>
                  <option value="advisorName">Class Advisor / Mentor Name</option>
                  <option value="other">Other Official Particular</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Requested Correct Value *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter the exact correct value"
                  value={correctionRequestedValue}
                  onChange={(e) => setCorrectionRequestedValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-[#071A41] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Reason &amp; Justification for Admin *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State the reason (e.g. As per 10th/12th certificate, section change approved by HOD, etc.)"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs text-[#071A41] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <Button
                  type="submit"
                  size="sm"
                  loading={correctionSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-sm cursor-pointer"
                >
                  <span>Submit to Admin</span>
                  <Send className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Real-Time App Downloader Modal */}
      <RealtimeAppDownloader
        isOpen={showDownloader}
        onClose={() => setShowDownloader(false)}
      />
    </div>
  )
}