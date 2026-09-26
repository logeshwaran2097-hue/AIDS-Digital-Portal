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
  Target,
  X,
} from 'lucide-react'
import { RealtimeAppDownloader } from '@/components/pwa/RealtimeAppDownloader'
import { AppSecurityInstallModal } from '@/components/pwa/AppSecurityInstallModal'
import { VisionMissionModal } from '@/components/about/VisionMissionModal'
import { APP_VERSION_LABEL } from '@/lib/version'
import { triggerPortalUpdateCheck } from '@/components/pwa/VersionUpdateNotifier'

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = React.useState<'student' | 'faculty' | 'advisor' | 'hod' | 'admin'>('student')
  const [showDownloader, setShowDownloader] = React.useState(false)
  const [showSecurityInstallModal, setShowSecurityInstallModal] = React.useState(false)
  const [showVisionModal, setShowVisionModal] = React.useState(false)
  const [isAppInstalled, setIsAppInstalled] = React.useState(false)
  const [isStandaloneMode, setIsStandaloneMode] = React.useState(false)
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
  const [rememberMe, setRememberMe] = React.useState(true)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = React.useState(false)
  const [checkingExistingSession, setCheckingExistingSession] = React.useState(true)
  const [existingUser, setExistingUser] = React.useState<{ name: string; role: string } | null>(null)

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('vsb_remember_regno')
      if (saved) setRegisterNumber(saved)
    } catch {}
  }, [])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for active existing session so mobile users never get logged out when switching apps
      const checkActiveSession = async () => {
        try {
          const urlParams = new URLSearchParams(window.location.search)
          if (
            urlParams.get('logout') === 'true' ||
            urlParams.get('logged_out') === 'true' ||
            urlParams.get('updated') === 'true'
          ) {
            setCheckingExistingSession(false)
            try {
              localStorage.removeItem('portal_user_session')
              localStorage.removeItem('portal_login_role')
            } catch {}
            return
          }

          const res = await fetch('/api/auth/me', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          })
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.user) {
              setExistingUser({ name: data.user.name, role: data.user.role })
              try {
                localStorage.setItem(
                  'portal_user_session',
                  JSON.stringify({
                    role: data.user.role,
                    name: data.user.name,
                  })
                )
              } catch {}

              const role = data.user.role
              const isAdvisor = data.user.isAdvisor || (data.user as any)?.facultyType === 'advisor'
              const targetUrl =
                role === 'admin' || role === 'super_admin'
                  ? '/admin'
                  : role === 'hod'
                  ? '/hod-dashboard'
                  : role === 'faculty'
                  ? isAdvisor
                    ? '/faculty-dashboard/attendance?mode=morning&role=advisor'
                    : '/faculty-dashboard'
                  : '/dashboard'

              setTimeout(() => {
                window.location.replace(targetUrl)
              }, 400)
              return
            }
          }
        } catch {}
        setCheckingExistingSession(false)
      }

      checkActiveSession()
      const checkInstalled = async () => {
        // 1. Check standalone mode (PWA installed and launched from home screen / desktop shortcut / installed app window)
        const isStandalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          window.matchMedia('(display-mode: window-controls-overlay)').matches ||
          window.matchMedia('(display-mode: minimal-ui)').matches ||
          window.matchMedia('(display-mode: fullscreen)').matches ||
          (window.navigator as any).standalone === true ||
          document.referrer.includes('android-app://') ||
          (window as any).Capacitor?.isNativePlatform() ||
          window.location.search.includes('source=pwa') ||
          window.location.search.includes('mode=standalone') ||
          window.location.search.includes('mode=app')

        if (isStandalone) {
          setIsStandaloneMode(true)
          setIsAppInstalled(true)
          try {
            localStorage.setItem('pwa_installed', 'true')
          } catch {}
          return
        }

        // 2. Check local persistence flag
        let isFlaggedInstalled = false
        try {
          isFlaggedInstalled =
            localStorage.getItem('pwa_installed') === 'true' ||
            localStorage.getItem('vsb_app_installed') === 'true'
        } catch {}

        if (isFlaggedInstalled) {
          setIsAppInstalled(true)
          return
        }

        // 3. Official Chrome API to check if PWA/App is already installed on user's device
        if ('getInstalledRelatedApps' in navigator) {
          try {
            const relatedApps = await (navigator as any).getInstalledRelatedApps()
            if (relatedApps && relatedApps.length > 0) {
              setIsAppInstalled(true)
              try {
                localStorage.setItem('pwa_installed', 'true')
              } catch {}
              return
            }
          } catch {}
        }
      }

      checkInstalled()

      const onAppInstalled = () => {
        setIsAppInstalled(true)
        try {
          localStorage.setItem('pwa_installed', 'true')
        } catch {}
      }

      window.addEventListener('appinstalled', onAppInstalled)
      window.addEventListener('pwa-installed-event', onAppInstalled)

      const matchMediaStandalone = window.matchMedia('(display-mode: standalone)')
      const matchMediaWCO = window.matchMedia('(display-mode: window-controls-overlay)')
      const onDisplayChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          setIsStandaloneMode(true)
          setIsAppInstalled(true)
          try {
            localStorage.setItem('pwa_installed', 'true')
          } catch {}
        }
      }
      try {
        matchMediaStandalone.addEventListener('change', onDisplayChange)
        matchMediaWCO.addEventListener('change', onDisplayChange)
      } catch {}

      return () => {
        window.removeEventListener('appinstalled', onAppInstalled)
        window.removeEventListener('pwa-installed-event', onAppInstalled)
        try {
          matchMediaStandalone.removeEventListener('change', onDisplayChange)
          matchMediaWCO.removeEventListener('change', onDisplayChange)
        } catch {}
      }
    }
  }, [])

  const handleDirectInstall = () => {
    setShowSecurityInstallModal(true)
  }

  // LUXURY AUTHENTICATION ANIMATION STATES
  const [authStatus, setAuthStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  const [authMessage, setAuthMessage] = React.useState('')
  const [successDestination, setSuccessDestination] = React.useState('')

  // MULTI-STEP ONBOARDING WIZARD STATE
  const [showOnboardingModal, setShowOnboardingModal] = React.useState(false)
  const [onboardingStep, setOnboardingStep] = React.useState<1 | 2 | 3>(1) // 1: Details, 2: Password & Email OTP, 3: Final Review & Attestation
  const [onboardingStep3Confirmed, setOnboardingStep3Confirmed] = React.useState(false)
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
  const [isOnboardingVerifyingOtp, setIsOnboardingVerifyingOtp] = React.useState(false)
  const [isOnboardingOtpVerified, setIsOnboardingOtpVerified] = React.useState(false)
  const [onboardingOtpError, setOnboardingOtpError] = React.useState<string | null>(null)

  // Email Uniqueness & Availability Check State
  const [emailCheckStatus, setEmailCheckStatus] = React.useState<{
    checking: boolean
    available: boolean | null
    message: string | null
  }>({ checking: false, available: null, message: null })


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
        const raw = registerNumber.trim()
        payload = {
          registerNumber: raw,
          ...(raw.includes('@') ? { email: raw.toLowerCase() } : {}),
          password,
        }
      } else if (selectedRole === 'faculty' || selectedRole === 'advisor') {
        endpoint = '/api/auth/faculty'
        const raw = facultyId.trim()
        payload = {
          facultyId: raw,
          ...(raw.includes('@') ? { email: raw.toLowerCase() } : { name: raw }),
          password,
          role: selectedRole,
          loginAsRole: selectedRole,
        }
      } else if (selectedRole === 'hod') {
        endpoint = '/api/auth/hod'
        const raw = facultyId.trim()
        payload = {
          facultyId: raw,
          ...(raw.includes('@') ? { email: raw.toLowerCase() } : { name: raw }),
          password,
        }
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
          setOnboardingStep3Confirmed(false)
        }, 1100)
        toast.success('Welcome! Please review your details and set up your permanent password.')
        return
      }

      // Success Luxury Animation & Immediate Navigation
      const isAdvisorSession = selectedRole === 'advisor'
      const effectiveLoginRole = isAdvisorSession ? 'advisor' : selectedRole

      if (typeof window !== 'undefined') {
        localStorage.setItem('portal_login_role', effectiveLoginRole)
        localStorage.setItem(
          'portal_user_session',
          JSON.stringify({
            role: effectiveLoginRole,
            name: data.user?.name || '',
            id: data.user?.id || '',
          })
        )
        document.cookie = `portal_login_role=${effectiveLoginRole}; path=/; max-age=2592000; SameSite=Lax`
        sessionStorage.setItem('vsb_faculty_is_advisor', String(isAdvisorSession))

        if (selectedRole === 'student' && !data.user?.mustChangePassword) {
          const reg = (data.user?.registerNumber || registerNumber || '').trim().toUpperCase()
          const email = (data.user?.email || '').trim().toLowerCase()
          const userId = data.user?.id || ''
          if (reg) {
            localStorage.setItem(`vsb_student_onboarding_done_${reg}`, 'true')
            sessionStorage.setItem(`vsb_student_onboarding_done_${reg}`, 'true')
          }
          if (email) {
            localStorage.setItem(`vsb_student_onboarding_done_${email}`, 'true')
            sessionStorage.setItem(`vsb_student_onboarding_done_${email}`, 'true')
          }
          if (userId) {
            localStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
            sessionStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
          }
        }
      }

      const dashboardMap: Record<string, string> = {
        student: '/dashboard',
        faculty: '/faculty-dashboard',
        advisor: '/faculty-dashboard/attendance?mode=morning&role=advisor',
        hod: '/hod-dashboard',
      }
      let targetUrl = dashboardMap[selectedRole] || '/dashboard'
      if (selectedRole === 'advisor') {
        targetUrl = data.user?.mustChangePassword ? '/faculty-dashboard?onboarding=1' : '/faculty-dashboard/attendance?mode=morning&role=advisor'
      } else if (selectedRole === 'hod') {
        const hodNeedsOnboarding = Boolean(
          data.user?.mustChangePassword ||
          !data.user?.qualification ||
          data.user?.qualification.trim().length === 0
        )
        targetUrl = hodNeedsOnboarding ? '/hod-dashboard?onboarding=1' : '/hod-dashboard'
      } else if (selectedRole === 'faculty') {
        const facultyNeedsOnboarding = Boolean(
          data.user?.mustChangePassword ||
          !data.user?.qualification ||
          data.user?.qualification.trim().length === 0
        )
        targetUrl = facultyNeedsOnboarding ? '/faculty-dashboard?onboarding=1' : '/faculty-dashboard'
      }

      setSuccessDestination(targetUrl)
      setAuthStatus('success')
      setAuthMessage(`Identity Verified · Entering ${selectedRole.toUpperCase()} Digital Portal...`)
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

  // Real-time debounced email availability check
  React.useEffect(() => {
    const rawEmail = onboardingForm.email?.trim().toLowerCase()
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
            userId: onboardingUser?.id,
            registerNumber: onboardingForm.registerNumber,
          }),
        })
        if (!res.ok) {
          // In case of rate-limiting or network issues, do not falsely flag as unavailable
          setEmailCheckStatus({ checking: false, available: true, message: null })
          return
        }
        const data = await res.json()
        if (data.available === undefined) {
          setEmailCheckStatus({ checking: false, available: true, message: null })
          return
        }
        setEmailCheckStatus({
          checking: false,
          available: Boolean(data.available),
          message: data.available ? null : (data.message || `The email address ${rawEmail} is already linked to another account.`),
        })
      } catch {
        setEmailCheckStatus({ checking: false, available: true, message: null })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [onboardingForm.email, onboardingUser?.id, onboardingForm.registerNumber])

  // Dispatch Email Verification OTP
  const handleSendEmailOTP = async () => {
    if (!onboardingForm.email || !onboardingForm.email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (emailCheckStatus.available === false) {
      toast.error(
        emailCheckStatus.message ||
        'This email address is already linked to another account. Please use a unique personal email.'
      )
      return
    }

    setOnboardingLoading(true)
    try {
      const res = await fetch('/api/auth/send-onboarding-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: onboardingUser?.id,
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
        const errorMsg = data.message || 'Failed to dispatch OTP.'
        toast.error(errorMsg)
        if (errorMsg.includes('already linked') || errorMsg.includes('already registered')) {
          setEmailCheckStatus({
            checking: false,
            available: false,
            message: errorMsg,
          })
        }
        return
      }
      setEmailOtpSent(true)
      setEmailOtpCooldown(60)
      if (data.challenge) {
        setOnboardingForm((prev) => ({ ...prev, otpChallenge: data.challenge }))
      }
      toast.success(`6-digit OTP sent to ${onboardingForm.email}! Please check your inbox.`)
    } catch {
      toast.error('Network error sending OTP.')
    } finally {
      setOnboardingLoading(false)
    }
  }

  // Step 2 -> Step 3: Validate Password & OTP, proceed to Final Review Step
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault()

    if (!onboardingForm.newPassword || onboardingForm.newPassword.length < 6) {
      toast.error('Please create a permanent password (at least 6 characters).')
      return
    }
    if (onboardingForm.newPassword !== onboardingForm.confirmPassword) {
      toast.error('New password and confirmation do not match.')
      return
    }
    if (!onboardingForm.email || !onboardingForm.email.includes('@')) {
      toast.error('Please enter a valid personal email address.')
      return
    }
    if (!emailOtpSent) {
      toast.error('Please click "Send Code" to verify your email via OTP.')
      return
    }
    if (!onboardingForm.emailOtp || onboardingForm.emailOtp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code.')
      return
    }
    if (onboardingOtpError) {
      toast.error('Please enter a valid verification code.')
      return
    }
    if (!isOnboardingOtpVerified) {
      toast.error('Please wait for OTP verification or enter the correct code.')
      return
    }

    setOnboardingStep(3)
  }

  // Step 3: Complete Onboarding & Save Profile
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!onboardingStep3Confirmed) {
      toast.error('Please check the verification attestation box before entering the portal.')
      return
    }
    if (!onboardingForm.newPassword || onboardingForm.newPassword.length < 6) {
      toast.error('Please create a permanent password (at least 6 characters).')
      return
    }
    if (onboardingForm.newPassword !== onboardingForm.confirmPassword) {
      toast.error('New password and confirmation do not match.')
      return
    }

    setOnboardingLoading(true)
    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-role': selectedRole || 'student',
        },
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
            : undefined,
          profileImage: passportPhotoPreview || undefined,
          newPassword: onboardingForm.newPassword,
          correctionRemarks: onboardingForm.hasCorrectionRequest ? onboardingForm.correctionRemarks : undefined,
          emailOtp: onboardingForm.emailOtp,
          challenge: onboardingForm.otpChallenge,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        const effectiveRole = selectedRole || 'student'
        const reg = (onboardingForm.registerNumber || '').trim().toUpperCase()
        const email = (onboardingForm.email || '').trim().toLowerCase()
        const userId = data.user?.id || onboardingUser?.id || ''
        const userName = data.user?.name || onboardingForm.name || ''

        if (typeof window !== 'undefined') {
          localStorage.setItem('portal_login_role', effectiveRole)
          localStorage.setItem(
            'portal_user_session',
            JSON.stringify({
              role: effectiveRole,
              name: userName,
              id: userId,
            })
          )
          document.cookie = `portal_login_role=${effectiveRole}; path=/; max-age=2592000; SameSite=Lax`

          if (reg) {
            localStorage.setItem(`vsb_student_onboarding_done_${reg}`, 'true')
            sessionStorage.setItem(`vsb_student_onboarding_done_${reg}`, 'true')
          }
          if (email) {
            localStorage.setItem(`vsb_student_onboarding_done_${email}`, 'true')
            sessionStorage.setItem(`vsb_student_onboarding_done_${email}`, 'true')
          }
          if (userId) {
            localStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
            sessionStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
          }
        }

        toast.success('Onboarding complete! Entering Student Portal...')
        const dashboardMap: Record<string, string> = {
          student: '/dashboard',
          faculty: '/faculty-dashboard',
          advisor: '/faculty-dashboard/attendance?mode=morning&role=advisor',
          hod: '/hod-dashboard',
        }
        const targetUrl = dashboardMap[effectiveRole] || '/dashboard'
        window.location.replace(targetUrl)
        return
      } else {
        toast.error(data.message || 'Failed to complete setup.')
        setOnboardingLoading(false)
      }
    } catch {
      toast.error('Network error saving profile.')
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

  if (existingUser) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center bg-[#071A41] text-white px-4 relative overflow-hidden select-none"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      >
        <div className="flex flex-col items-center text-center space-y-4 max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-2xl shadow-2xl flex items-center justify-center animate-pulse">
            <Image
              src="/app-logo.png"
              alt="VSB Portal"
              width={80}
              height={80}
              className="w-full h-full object-contain rounded-2xl drop-shadow-md"
              priority
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#E7B93E] bg-[#E7B93E]/10 px-3 py-0.5 rounded-full border border-[#E7B93E]/20">
              Active Session Detected
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">Welcome Back</h2>
            <p className="text-sm font-bold text-cyan-300">{existingUser.name}</p>
            <p className="text-xs text-slate-300 font-medium">Resuming your portal dashboard...</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-4 py-2 rounded-full border border-emerald-500/30">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Opening {existingUser.role.toUpperCase()} Portal...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-between text-[#1F2937] font-sans antialiased">
      {/* Top Institutional Header Bar */}
      <header className="bg-white border-b border-[#E5E7EB] py-3 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#E5E7EB] p-0.5 bg-white flex items-center justify-center shrink-0">
              <Image
                src="/college-emblem.png"
                alt="V.S.B. Engineering College Crest"
                width={36}
                height={36}
                className="w-full h-full object-contain rounded-full"
                priority
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-[#003399] tracking-tight uppercase leading-tight">
                V.S.B. Engineering College
              </p>
              <p className="text-[10px] sm:text-xs font-semibold text-[#6B7280]">
                An Autonomous Institution · Affiliated to Anna University
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAppInstalled && (
              <button
                type="button"
                onClick={handleDirectInstall}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[11px] font-bold text-[#1F2937] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#003399]" />
                <span>Install App</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowVisionModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#003399]/5 hover:bg-[#003399]/10 text-[#003399] text-[11px] font-bold transition-colors cursor-pointer"
            >
              <span>Vision &amp; Mission</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT: Institutional College & Department Identity */}
          <div className="lg:col-span-5 bg-[#003399] text-white p-6 sm:p-8 flex flex-col justify-between relative">
            <div className="space-y-6">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-white p-1 border-2 border-[#FFD700] shrink-0 shadow-xs">
                  <Image
                    src="/college-emblem.png"
                    alt="V.S.B. Engineering College Emblem"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain rounded-full"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight uppercase text-white">
                    V.S.B. Engineering College
                  </h1>
                  <p className="text-[11px] text-blue-100 font-medium">
                    Karur, Tamil Nadu — 639111
                  </p>
                </div>
              </div>

              <div className="border-t border-white/20 pt-4 space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFD700] text-[#002266]">
                  Autonomous Regulation 2021
                </span>
                <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                  Department of Artificial Intelligence &amp; Data Science
                </h2>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Official Student, Faculty &amp; Administrative ERP Portal for academic operations, attendance, and curriculum administration.
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-blue-100">
                <p className="font-bold text-white text-[11px] uppercase tracking-wider">Portal Facilities:</p>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                    <span>Daily Attendance &amp; Anna University Norm Compliance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                    <span>Syllabus Scheme, Study Materials &amp; Question Papers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                    <span>Digital On-Duty (OD) &amp; Leave Request Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                    <span>Hostel &amp; College Bus Pass Verification</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
              <span>NBA Tier-1 &middot; NAAC &apos;A&apos; Grade</span>
              <span className="font-serif italic text-white">&ldquo;a place for placement&rdquo;</span>
            </div>
          </div>

          {/* RIGHT: Professional Institutional Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-5">
              
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                  Select User Role
                </label>
                <div className="grid grid-cols-5 gap-1 p-1 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg">
                  {[
                    { id: 'student', label: 'Student' },
                    { id: 'faculty', label: 'Faculty' },
                    { id: 'advisor', label: 'Advisor' },
                    { id: 'hod', label: 'HOD' },
                    { id: 'admin', label: 'Admin' },
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
                        setAuthMessage('')
                      }}
                      className={cn(
                        'py-1.5 px-1 rounded-md text-xs font-bold transition-all text-center cursor-pointer',
                        selectedRole === role.id
                          ? 'bg-[#003399] text-white shadow-xs'
                          : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-200/60'
                      )}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Header */}
              <div>
                <h2 className="text-xl font-black text-[#1F2937] tracking-tight">
                  {selectedRole === 'student' && 'Student Login'}
                  {selectedRole === 'faculty' && 'Faculty Member Login'}
                  {selectedRole === 'advisor' && 'Class Advisor Login'}
                  {selectedRole === 'hod' && 'Head of Department Login'}
                  {selectedRole === 'admin' && 'Administrator Login'}
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {selectedRole === 'student'
                    ? 'Enter your institutional Register Number and password.'
                    : selectedRole === 'admin'
                    ? 'Enter your official administrator email to receive login OTP.'
                    : 'Sign in with your official faculty credentials.'}
                </p>
              </div>

              {/* Error Alert Box */}
              {authStatus === 'error' && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900">Authentication Failed</p>
                    <p className="text-red-700 mt-0.5">{authMessage || 'Invalid credentials. Please verify and try again.'}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Student Fields */}
                {selectedRole === 'student' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F2937]">
                        Register Number
                      </label>
                      <input
                        type="text"
                        value={registerNumber}
                        onChange={(e) => setRegisterNumber(e.target.value)}
                        placeholder="e.g. 922522243001"
                        required
                        autoComplete="username"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399] transition-all bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F2937]">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your portal password"
                          required
                          autoComplete="current-password"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-[#E5E7EB] text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399] transition-all bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Faculty / Advisor / HOD Fields */}
                {(selectedRole === 'faculty' || selectedRole === 'advisor' || selectedRole === 'hod') && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F2937]">
                        {selectedRole === 'advisor' ? 'Class Advisor Email / ID' : selectedRole === 'hod' ? 'HOD Email / ID' : 'Faculty ID / Email'}
                      </label>
                      <input
                        type="text"
                        value={facultyId}
                        onChange={(e) => setFacultyId(e.target.value)}
                        placeholder="e.g. faculty@vsb.ac.in"
                        required
                        autoComplete="username"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399] transition-all bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F2937]">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          autoComplete="current-password"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-[#E5E7EB] text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399] transition-all bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Admin Fields */}
                {selectedRole === 'admin' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#1F2937]">
                        Administrator Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@vsb.ac.in"
                        required
                        autoComplete="email"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399] transition-all bg-white"
                      />
                    </div>

                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading || !email}
                        className="w-full py-2.5 px-4 rounded-lg bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{loading ? 'Sending OTP...' : 'Send Login OTP'}</span>
                      </button>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-[#1F2937]">
                            Enter 6-Digit OTP
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            className="w-full px-3.5 py-2.5 text-center text-lg font-mono font-bold tracking-widest rounded-lg border border-blue-300 text-[#003399] bg-blue-50/50 focus:outline-none focus:ring-1 focus:ring-[#003399]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVerifyOTP()}
                          disabled={loading}
                          className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{loading ? 'Verifying...' : 'Verify OTP & Enter Admin Console'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Remember Me & Forgot Password Row (for non-admin or password roles) */}
                {selectedRole !== 'admin' && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[#6B7280]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#003399] focus:ring-[#003399]"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[#003399] hover:underline font-bold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Primary Action Button */}
                {selectedRole !== 'admin' && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'Authenticating...' : 'LOGIN'}</span>
                  </button>
                )}
              </form>

              {/* Institutional Notice */}
              <div className="pt-4 border-t border-[#E5E7EB] text-center text-[11px] text-[#6B7280]">
                <p>For password assistance, contact your Class Advisor or HOD Office.</p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Forgot Password Institutional Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB] shadow-lg">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1F2937]">Password Assistance</h3>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-[#4B5563] leading-relaxed">
              <p>
                Student and faculty accounts are institutionally managed. To reset your portal password:
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Contact your appointed <strong>Class Advisor</strong> or <strong>Head of Department</strong>.</li>
                <li>Provide your registered <strong>Roll Number / Register Number</strong>.</li>
                <li>Temporary credentials will be generated and issued by the Academic Administration Office.</li>
              </ol>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-4 py-2 bg-[#003399] text-white rounded-lg text-xs font-bold hover:bg-[#002266]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Institutional Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-3 px-4 text-center text-xs text-[#6B7280]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; 2026 V.S.B. Engineering College. All rights reserved.</p>
          <p className="text-[11px]">Department of Artificial Intelligence &amp; Data Science &middot; Student Portal</p>
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
                  {onboardingStep === 1
                    ? 'Step 1: Review Academic Details'
                    : onboardingStep === 2
                    ? 'Step 2: Password & Email OTP Verification'
                    : 'Step 3: Verify All Details & Confirm'}
                </h3>
                <span className="text-[11px] sm:text-xs font-black text-[#1557C0] bg-blue-50 px-2 sm:px-2.5 py-1 rounded-xl shrink-0">
                  Step {onboardingStep} of 3
                </span>
              </div>

              {/* Visual Step Bar */}
              <div className="grid grid-cols-3 gap-2 mt-2.5">
                <div className={cn("h-1.5 rounded-full transition-all", onboardingStep >= 1 ? "bg-[#1557C0]" : "bg-gray-200")} />
                <div className={cn("h-1.5 rounded-full transition-all", onboardingStep >= 2 ? "bg-[#1557C0]" : "bg-gray-200")} />
                <div className={cn("h-1.5 rounded-full transition-all", onboardingStep === 3 ? "bg-[#1557C0]" : "bg-gray-200")} />
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
                              const reader = new FileReader()
                              reader.onload = (event) => {
                                const img = document.createElement('img')
                                img.onload = () => {
                                  const canvas = document.createElement('canvas')
                                  const maxDim = 400
                                  let w = img.width
                                  let h = img.height
                                  if (w > maxDim || h > maxDim) {
                                    if (w > h) {
                                      h = Math.round((h * maxDim) / w)
                                      w = maxDim
                                    } else {
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
                                    setPassportPhotoPreview(base64)
                                  }
                                }
                                img.src = event.target?.result as string
                              }
                              reader.readAsDataURL(file)
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
              <form onSubmit={handleProceedToStep3} className="space-y-4 text-xs">

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
                        value={onboardingForm.email}
                        onChange={(e) => {
                          const val = e.target.value
                          setOnboardingForm((prev) => ({
                            ...prev,
                            email: val,
                            ...(emailOtpSent || isOnboardingOtpVerified ? { emailOtp: '', otpChallenge: '' } : {}),
                          }))
                          if (emailOtpSent || isOnboardingOtpVerified) {
                            setEmailOtpSent(false)
                            setIsOnboardingOtpVerified(false)
                            setOnboardingOtpError(null)
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
                          onboardingLoading ||
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
                          <p className="font-black text-rose-900 text-xs">
                            {emailCheckStatus.message?.toLowerCase().includes('rate limit') || emailCheckStatus.message?.toLowerCase().includes('try again')
                              ? 'Too Many Attempts — Please Wait'
                              : 'Email Already Linked to Another Account'}
                          </p>
                          <p className="text-[11px] text-rose-700 font-medium leading-snug mt-0.5">
                            {emailCheckStatus.message ||
                              `The email address ${onboardingForm.email} is already linked to another account. Please use your unique personal or official email.`}
                          </p>
                        </div>
                      </div>
                    )}

                    {emailCheckStatus.available === true && onboardingForm.email && onboardingForm.email.includes('@') && !emailOtpSent && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Email is unique & ready. Click &quot;Send Code&quot; to receive your verification OTP.</span>
                      </div>
                    )}
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
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] text-white shadow-md text-xs sm:text-sm cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <span>Proceed to Final Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: VERIFY ALL DETAILS & FINAL CONFIRMATION */}
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
                    {passportPhotoPreview ? (
                      <img
                        src={passportPhotoPreview}
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
                        <h4 className="font-black text-sm text-[#071A41] truncate">{onboardingForm.name || onboardingUser?.name}</h4>
                        <span className="text-[10px] font-mono font-bold bg-blue-100 text-[#1557C0] px-2 py-0.5 rounded-md">
                          {onboardingForm.registerNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                        {onboardingForm.department || 'B.Tech Artificial Intelligence & Data Science'} · Year {onboardingForm.year} · Sem {onboardingForm.semester} (Sec {onboardingForm.section})
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                        Class Advisor: {onboardingForm.advisorName || 'Assigned Faculty Mentor'}
                      </p>
                    </div>
                  </div>

                  {/* Grid of Verified Particulars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">STUDENT MOBILE</span>
                      <span className="font-mono font-bold text-[#071A41]">{onboardingForm.phone || 'Not provided'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">PARENT MOBILE</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#071A41]">{onboardingForm.parentPhone || 'Not provided'}</span>
                        {onboardingForm.parentWhatsApp && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            WhatsApp
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">DATE OF BIRTH</span>
                      <span className="font-bold text-[#071A41]">
                        {onboardingForm.dobDay && onboardingForm.dobMonth && onboardingForm.dobYear
                          ? `${String(onboardingForm.dobDay).padStart(2, '0')}-${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(onboardingForm.dobMonth, 10)] || onboardingForm.dobMonth}-${onboardingForm.dobYear}`
                          : onboardingForm.dateOfBirth || 'Not provided'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">BLOOD GROUP</span>
                      <span className="font-bold text-[#071A41]">{onboardingForm.bloodGroup || 'Not specified'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 sm:col-span-2">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">RESIDENCY &amp; TRANSPORT</span>
                      <span className="font-bold text-[#071A41]">
                        {onboardingForm.residency === 'Day Scholar'
                          ? `Day Scholar · ${onboardingForm.dayScholarTransport} ${onboardingForm.busNo ? `(${onboardingForm.busNo})` : ''} ${onboardingForm.boardingPoint ? `at ${onboardingForm.boardingPoint}` : ''}`
                          : onboardingForm.residency === 'Hostel'
                          ? `Hostel · ${onboardingForm.hostelBlock} ${onboardingForm.roomNo ? `(${onboardingForm.roomNo})` : ''}`
                          : onboardingForm.residency || 'Day Scholar'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 sm:col-span-2">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">VERIFIED STUDENT EMAIL</span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[#1557C0] truncate">{onboardingForm.email}</span>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> OTP Verified
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 sm:col-span-2">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">PORTAL SECURITY / PASSWORD</span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          Permanent Password Set
                        </span>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed &amp; Secured
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Institutional Verification Declaration & Authorization Card */}
                <div className={cn(
                  "relative rounded-2xl border-2 p-4 transition-all duration-200",
                  onboardingStep3Confirmed
                    ? "bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-blue-50/30 border-emerald-400/90 shadow-sm shadow-emerald-500/10"
                    : "bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-xs"
                )}>
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <div className="mt-0.5 flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        required
                        checked={onboardingStep3Confirmed}
                        onChange={(e) => setOnboardingStep3Confirmed(e.target.checked)}
                        className="w-5 h-5 rounded-md text-emerald-600 border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer transition-all"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className={cn("w-4 h-4", onboardingStep3Confirmed ? "text-emerald-600" : "text-[#1557C0]")} />
                          <span className="text-xs font-black text-[#071A41] uppercase tracking-wide">
                            Final Academic Authorization &amp; Portal Enrollment
                          </span>
                        </div>
                        {onboardingStep3Confirmed ? (
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
                        I solemnly confirm that I have verified all details above and authorize my enrollment into the Student Portal.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer text-xs transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Step 2</span>
                  </button>

                  <Button
                    type="submit"
                    loading={onboardingLoading}
                    disabled={onboardingLoading || !onboardingStep3Confirmed}
                    className={cn(
                      "w-full sm:w-auto px-8 py-3 rounded-xl font-black flex items-center justify-center gap-2.5 shadow-md transition-all text-xs sm:text-sm",
                      onboardingStep3Confirmed && !onboardingLoading
                        ? "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none"
                    )}
                  >
                    {onboardingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Authorize &amp; Enter Student Portal</span>
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

      {/* Play Store & Apple Security Verification Install Modal */}
      <AppSecurityInstallModal
        isOpen={showSecurityInstallModal}
        onClose={() => setShowSecurityInstallModal(false)}
      />

      {/* Real-Time App Downloader Modal */}
      <RealtimeAppDownloader
        isOpen={showDownloader}
        onClose={() => setShowDownloader(false)}
      />

      {/* Department Vision & Mission Modal */}
      <VisionMissionModal
        isOpen={showVisionModal}
        onClose={() => setShowVisionModal(false)}
      />
    </div>
  )
}
