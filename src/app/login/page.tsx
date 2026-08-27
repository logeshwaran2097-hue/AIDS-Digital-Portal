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
} from 'lucide-react'

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = React.useState<'student' | 'faculty' | 'hod' | 'admin'>('student')
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

  // LUXURY AUTHENTICATION ANIMATION STATES
  const [authStatus, setAuthStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  const [authMessage, setAuthMessage] = React.useState('')
  const [successDestination, setSuccessDestination] = React.useState('')

  // MULTI-STEP ONBOARDING WIZARD STATE
  const [showOnboardingModal, setShowOnboardingModal] = React.useState(false)
  const [onboardingStep, setOnboardingStep] = React.useState<1 | 2>(1) // 1: Check Details & Corrections, 2: Password & Email OTP
  const [onboardingUser, setOnboardingUser] = React.useState<any>(null)
  
  // Form State for Details Review & Password Setup
  const [onboardingForm, setOnboardingForm] = React.useState({
    name: '',
    registerNumber: '',
    phone: '',
    parentPhone: '',
    dateOfBirth: '',
    department: 'B.Tech Artificial Intelligence & Data Science',
    year: 'Year 2 (Sophomore)',
    semester: 'Semester 4',
    section: 'Section A',
    advisorName: 'Dr. S. Karthik (Professor)',
    hasCorrectionRequest: false,
    correctionRemarks: '',
    detailsConfirmed: false,
    email: '',
    newPassword: '',
    confirmPassword: '',
    emailOtp: '',
    otpChallenge: '',
  })

  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [onboardingLoading, setOnboardingLoading] = React.useState(false)
  const [emailOtpSent, setEmailOtpSent] = React.useState(false)
  const [emailOtpCooldown, setEmailOtpCooldown] = React.useState(0)
  const [demoOtpCode, setDemoOtpCode] = React.useState<string | null>(null)

  const router = useRouter()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthStatus('idle')
    try {
      let endpoint = ''
      let payload: Record<string, string> = {}

      if (selectedRole === 'student') {
        endpoint = '/api/auth/student'
        payload = { registerNumber: registerNumber.trim(), password }
      } else if (selectedRole === 'faculty') {
        endpoint = '/api/auth/faculty'
        payload = { facultyId: facultyId.trim(), password }
      } else if (selectedRole === 'hod') {
        endpoint = '/api/auth/hod'
        payload = { facultyId: facultyId.trim(), password }
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

      // Check if user must complete profile verification
      if (data.user?.mustChangePassword && (selectedRole === 'student' || selectedRole === 'faculty' || selectedRole === 'hod')) {
        const studentReg = data.user.registerNumber || registerNumber.trim().toUpperCase()
        const rawName = data.user.name || ''
        const cleanName = rawName.startsWith('Student (') ? '' : rawName
        const rawEmail = data.user.email || ''
        const cleanEmail = rawEmail.endsWith('@student.vsb.edu.in') ? '' : rawEmail

        setOnboardingUser(data.user)
        setOnboardingForm({
          name: cleanName,
          registerNumber: studentReg,
          phone: data.user.phone || '',
          parentPhone: '',
          dateOfBirth: data.user.dateOfBirth ? String(data.user.dateOfBirth).split('T')[0] : '',
          department: 'B.Tech Artificial Intelligence & Data Science',
          year: data.user.year ? `Year ${data.user.year}` : 'Year 2 (Sophomore)',
          semester: data.user.semester ? `Semester ${data.user.semester}` : 'Semester 4',
          section: data.user.section ? `Section ${data.user.section}` : 'Section A',
          advisorName: 'Dr. S. Karthik (Professor · AI & DS)',
          hasCorrectionRequest: false,
          correctionRemarks: '',
          detailsConfirmed: false,
          email: cleanEmail,
          newPassword: '',
          confirmPassword: '',
          emailOtp: '',
          otpChallenge: '',
        })
        setOnboardingStep(1)
        setShowOnboardingModal(true)
        toast.success('Welcome! Please fill and review your official student profile.')
        return
      }

      // Success Luxury Animation & Warp Navigation
      const dashboardMap: Record<string, string> = {
        student: '/dashboard',
        faculty: '/faculty-dashboard',
        hod: '/hod-dashboard',
      }
      const targetUrl = dashboardMap[selectedRole]
      setSuccessDestination(targetUrl)
      setAuthStatus('success')
      setAuthMessage(`Identity Verified · Entering ${selectedRole.toUpperCase()} Digital Portal...`)
      toast.success('Login verified! Entering portal...')

      setTimeout(() => {
        window.location.href = targetUrl
      }, 1400)
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
    if (!onboardingForm.name.trim() || onboardingForm.name.startsWith('Student (')) {
      toast.error('Please enter your official Full Name.')
      return
    }
    if (!onboardingForm.detailsConfirmed) {
      toast.error('Please check the confirmation box verifying that your details are reviewed.')
      return
    }
    if (!onboardingForm.phone.trim()) {
      toast.error('Please provide your active mobile phone number.')
      return
    }
    if (!onboardingForm.parentPhone.trim()) {
      toast.error('Please provide parent/guardian contact number for college alerts.')
      return
    }
    setOnboardingStep(2)
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
    if (!onboardingForm.emailOtp || onboardingForm.emailOtp.length !== 6) {
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
          hod: '/hod-dashboard',
        }
        setTimeout(() => {
          window.location.href = dashboardMap[selectedRole]
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
        
        {/* Accreditation Top Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-0.5 sm:py-1 rounded-full bg-white/90 border border-[#071A41]/10 text-[9px] sm:text-xs font-black text-[#071A41] shadow-xs backdrop-blur-md anim-logo-reveal">
          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E7B93E] animate-pulse" />
          <span>Autonomous · NBA &amp; NAAC &apos;A&apos; Accredited Institution</span>
        </div>
        
        {/* 3-LAYER CELESTIAL MASTER EMBLEM */}
        <div className="relative flex items-center justify-center my-2 sm:my-3 anim-logo-reveal anim-medallion-levitate">
          {/* Layer 3: Outer Celestial Dashed Cyan Tech Ring */}
          <div 
            className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-dashed border-[#06B6D4]/60 shadow-[0_0_16px_rgba(6,182,212,0.4)] animate-spin" 
            style={{ animationDuration: '14s' }} 
          />

          {/* Layer 2: Middle Sapphire-Cyan Glass Orbit Halo */}
          <div className="absolute w-26 h-26 sm:w-34 sm:h-34 rounded-full border-[1.5px] border-[#1557C0]/35 bg-gradient-to-tr from-cyan-100/35 via-blue-100/20 to-amber-100/30 shadow-[0_0_20px_rgba(21,87,192,0.2)] anim-solar-corona" />
          
          {/* Layer 1: Inner Circular Gold Medallion with Specular Sheen */}
          <div className="relative w-20 h-20 sm:w-26 sm:h-26 rounded-full p-1 bg-gradient-to-tr from-[#E7B93E] via-[#FFF2B2] to-[#B8860B] shadow-[0_14px_35px_rgba(7,26,65,0.22),0_0_25px_rgba(231,185,62,0.5)] ring-2 ring-white/90 overflow-hidden hover:scale-105 transition-transform duration-500">
            {/* Specular Liquid Gold Sweep */}
            <div className="anim-gold-sheen" />

            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-1.5 shadow-inner overflow-hidden relative z-10">
              <Image
                src="/college-emblem.png"
                alt="V.S.B. Engineering College Logo"
                width={100}
                height={100}
                className="w-full h-full object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>

          {/* Sparkling Diamond Glint at Top-Right */}
          <div className="absolute top-0 right-1/2 translate-x-10 sm:translate-x-13 -translate-y-1 text-[#E7B93E] anim-diamond-twinkle pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E7B93E] drop-shadow-[0_0_8px_rgba(231,185,62,0.9)]" />
          </div>
        </div>

        {/* Master Branding Typography with Liquid Gold Shimmer */}
        <div className="space-y-1 w-full">
          <h1 
            className="text-base sm:text-2xl font-black tracking-tight uppercase"
            style={{ letterSpacing: '0.02em', fontWeight: 900 }}
          >
            <span className="anim-word anim-word-1 mr-1 shimmer-liquid-gold">V.S.B.</span>
            <span className="anim-word anim-word-2 mr-1 shimmer-liquid-gold">ENGINEERING</span>
            <span className="anim-word anim-word-3 shimmer-liquid-gold">COLLEGE</span>
          </h1>

          <div>
            <p className="text-[9px] sm:text-xs font-black text-[#1557C0] tracking-widest uppercase flex items-center justify-center gap-1 bg-gradient-to-r from-[#1557C0]/10 via-[#1557C0]/15 to-[#1557C0]/10 px-3 py-0.5 rounded-full border border-[#1557C0]/20 mx-auto w-fit shadow-xs">
              <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E7B93E]" />
              <span>Autonomous Institution · Karur</span>
            </p>
          </div>

          {/* Glowing Golden Light Beam Separator */}
          <div className="w-36 sm:w-44 h-[2px] bg-gradient-to-r from-transparent via-[#E7B93E] to-transparent mx-auto rounded-full my-0.5 opacity-80" />

          {/* Department Name with Sapphire Cyan Holographic Glow */}
          <h2 className="text-[11px] sm:text-sm font-black leading-tight">
            <span className="block text-slate-500 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider mb-0.5">Department of</span>
            <span className="block font-black shimmer-sapphire-cyan text-xs sm:text-base">
              ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
            </span>
          </h2>

          <div className="pt-0.5 anim-cpu-badge flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-[#071A41] to-[#1557C0] text-white text-[9px] sm:text-xs font-bold shadow-md border border-cyan-400/30">
              <Cpu className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 animate-pulse" />
              <span>Digital Academic Portal</span>
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E7B93E]" />
            </span>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN QUANTUM SUCCESS PORTAL MODAL */}
      {authStatus === 'success' && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#071A41]/85 backdrop-blur-2xl text-white select-none animate-fade-in">
          {/* Rotating Success Energy Halo */}
          <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-emerald-500/30 via-cyan-400/30 to-[#E7B93E]/30 blur-3xl animate-pulse" />
          
          <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center text-center space-y-5 p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.5)] anim-success-portal">
            
            {/* Holographic Glowing Checkmark Crest */}
            <div className="relative flex items-center justify-center my-2">
              <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-emerald-400/60 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="absolute w-32 h-32 rounded-full border-2 border-dotted border-[#E7B93E]/60 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-[0_0_40px_rgba(16,185,129,0.6)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#071A41] flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#E7B93E]" />
                <span>ACCESS GRANTED</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Security Verified
              </h2>
              
              <p className="text-xs text-slate-300 font-semibold px-2">
                {authMessage}
              </p>
            </div>

            {/* Quantum Warp Streamer Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-[#E7B93E] rounded-full animate-progress-bar" />
            </div>
          </div>
        </div>
      )}

      {/* ULTRA-LUXURY LOGIN CARD */}
      <div 
        className={cn(
          "w-full max-w-[395px] bg-white/85 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.25rem] border p-3.5 sm:p-5 space-y-3 sm:space-y-4 relative z-10 my-0.5 shadow-[0_25px_60px_-15px_rgba(7,26,65,0.18),0_0_0_1.5px_rgba(255,255,255,0.85)_inset] anim-card-reveal transition-all duration-300",
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

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { id: 'student', label: 'Student', icon: '🎓' },
              { id: 'faculty', label: 'Faculty', icon: '📚' },
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
                  'relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 px-1 text-xs font-bold transition-all duration-300 cursor-pointer border shadow-xs',
                  selectedRole === role.id
                    ? 'bg-gradient-to-b from-[#1557C0] via-[#0D3B82] to-[#071A41] text-white border-cyan-400/40 shadow-[0_10px_20px_-3px_rgba(21,87,192,0.4)] scale-[1.03]'
                    : 'bg-white/80 hover:bg-white text-[#071A41] hover:border-slate-300 border-slate-200/80 hover:scale-[1.01]'
                )}
              >
                {selectedRole === role.id && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E7B93E] text-[#071A41] flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                  </span>
                )}
                <span className="text-xl drop-shadow-xs">{role.icon}</span>
                <span className="text-[10px] sm:text-[11px] font-black">{role.label}</span>
                {selectedRole === role.id && (
                  <span className="w-5 h-0.5 bg-[#E7B93E] rounded-full mt-0.5 animate-pulse" />
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
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Register Number</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4 text-[#1557C0]" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 922525243123"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-[#1557C0]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter temporary or permanent password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-black py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#0D3B82] hover:from-[#05132E] hover:to-[#1557C0] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2 border border-blue-400/30 hover:scale-[1.01]"
                >
                  <LogIn className="w-4 h-4 text-[#E7B93E]" />
                  <span>{loading ? 'Authenticating...' : 'Login to Student Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Faculty */}
            {selectedRole === 'faculty' && (
              <>
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Faculty ID</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4 text-[#1557C0]" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. FAC001"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-[#1557C0]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-black py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#0D3B82] hover:from-[#05132E] hover:to-[#1557C0] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2 border border-blue-400/30 hover:scale-[1.01]"
                >
                  <LogIn className="w-4 h-4 text-[#E7B93E]" />
                  <span>{loading ? 'Authenticating...' : 'Login to Faculty Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* HOD */}
            {selectedRole === 'hod' && (
              <>
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Faculty ID</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4 text-[#1557C0]" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. HOD001"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-[#1557C0]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-black py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#0D3B82] hover:from-[#05132E] hover:to-[#1557C0] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2 border border-blue-400/30 hover:scale-[1.01]"
                >
                  <LogIn className="w-4 h-4 text-[#E7B93E]" />
                  <span>{loading ? 'Authenticating...' : 'Login to HOD Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Admin */}
            {selectedRole === 'admin' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#071A41] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Administrator Email</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4 text-[#1557C0]" />
                    </div>
                    <input
                      type="email"
                      placeholder="admin@vsb.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || !email}
                    className="w-full font-black py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#0D3B82] hover:from-[#05132E] hover:to-[#1557C0] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2 border border-blue-400/30 hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4 text-[#E7B93E]" />
                    <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
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
                        className="w-full px-4 py-2.5 text-center text-lg font-mono font-black tracking-widest rounded-xl border border-blue-300 text-[#071A41] bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-[#1557C0] transition-all shadow-inner"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyOTP()}
                      disabled={loading}
                      className="w-full font-black py-3 px-4 rounded-xl text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
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
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E7B93E]" />
              <span>256-Bit SSL Encrypted</span>
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

      {/* QUOTE */}
      <div className="text-center space-y-1 relative z-10 pt-2 pb-1 anim-quote-reveal">
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

      {/* FOOTER */}
      <footer className="w-full max-w-[420px] mx-auto flex flex-col items-center justify-center gap-2 text-[10px] sm:text-[11px] text-[#071A41] font-bold z-10 pt-2 border-t border-blue-200/50 anim-footer-reveal px-2 text-center">
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
        <div className="fixed inset-0 z-50 bg-[#071A41]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 border border-gray-100 max-h-[94vh] overflow-y-auto">
            
            {/* Modal Header with Progress Step Indicator */}
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1557C0] text-[10px] font-black uppercase tracking-wider">
                  Initial Profile Verification &amp; Security Setup
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {onboardingForm.registerNumber}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-[#071A41]">
                  {onboardingStep === 1 ? 'Step 1: Review Your Academic Details' : 'Step 2: Password & Email OTP Verification'}
                </h3>
                <span className="text-xs font-black text-[#1557C0] bg-blue-50 px-2.5 py-1 rounded-xl">
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
                <p className="text-[11px] text-gray-500 font-medium">
                  Please carefully verify your official enrollment records below. If any academic details are incorrect, you can request an instant admin correction.
                </p>

                {/* Academic Record Grid */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 text-xs font-black text-[#071A41]">
                    <GraduationCap className="w-4 h-4 text-[#1557C0]" />
                    <span>Academic Enrollment Record</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Register Number */}
                    <div>
                      <label className="block font-bold text-gray-500 text-[10px] uppercase">Register Number (Verified)</label>
                      <p className="font-mono font-black text-sm text-[#071A41] bg-gray-100/80 px-2.5 py-1.5 rounded-xl border border-gray-200">{onboardingForm.registerNumber}</p>
                    </div>

                    {/* Student Full Name */}
                    <div>
                      <label className="block font-bold text-[#071A41] text-[11px]">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your official Full Name"
                        value={onboardingForm.name}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, name: e.target.value })}
                        className="w-full mt-0.5 p-2 rounded-xl border border-gray-300 font-bold text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      />
                    </div>

                    {/* Class & Department */}
                    <div>
                      <label className="block font-bold text-[#071A41] text-[11px]">Class &amp; Program</label>
                      <select
                        value={onboardingForm.department}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, department: e.target.value })}
                        className="w-full mt-0.5 p-2 rounded-xl border border-gray-300 font-bold text-xs text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      >
                        <option value="B.Tech Artificial Intelligence & Data Science">B.Tech Artificial Intelligence &amp; Data Science</option>
                        <option value="B.E Computer Science & Engineering">B.E Computer Science &amp; Engineering</option>
                        <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                      </select>
                    </div>

                    {/* Year & Semester */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="block font-bold text-[#071A41] text-[11px]">Year</label>
                        <select
                          value={onboardingForm.year}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, year: e.target.value })}
                          className="w-full mt-0.5 p-2 rounded-xl border border-gray-300 font-bold text-xs text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                        >
                          <option value="Year 1 (Freshman)">Year 1 (Freshman)</option>
                          <option value="Year 2 (Sophomore)">Year 2 (Sophomore)</option>
                          <option value="Year 3 (Junior)">Year 3 (Junior)</option>
                          <option value="Year 4 (Senior)">Year 4 (Senior)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#071A41] text-[11px]">Semester</label>
                        <select
                          value={onboardingForm.semester}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, semester: e.target.value })}
                          className="w-full mt-0.5 p-2 rounded-xl border border-gray-300 font-bold text-xs text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Section */}
                    <div>
                      <label className="block font-bold text-[#071A41] text-[11px]">Assigned Section</label>
                      <select
                        value={onboardingForm.section}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, section: e.target.value })}
                        className="w-full mt-0.5 p-2 rounded-xl border border-gray-300 font-bold text-xs text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      >
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                        <option value="Section D">Section D</option>
                      </select>
                    </div>

                    {/* Class Advisor */}
                    <div>
                      <label className="block font-bold text-[#071A41] text-[11px]">Class Advisor / Mentor Name</label>
                      <input
                        type="text"
                        list="advisorOnboardingList"
                        placeholder="Type or select Advisor Name"
                        value={onboardingForm.advisorName}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, advisorName: e.target.value })}
                        className="w-full mt-0.5 p-2 rounded-xl border border-gray-300 font-bold text-xs text-[#1557C0] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      />
                      <datalist id="advisorOnboardingList">
                        <option value="Dr. S. Karthik (Professor · AI & DS)" />
                        <option value="Dr. M. Sowmya (Associate Professor)" />
                        <option value="Dr. K. Meenakshi (Associate Professor)" />
                        <option value="Dr. R. Ramanathan (Professor · AI & DS)" />
                        <option value="Prof. P. Naveen (Assistant Professor)" />
                        <option value="Prof. S. Divya (Assistant Professor)" />
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Personal & Contact Particulars (Editable) */}
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-blue-200/60 text-xs font-black text-[#071A41]">
                    <Phone className="w-4 h-4 text-[#1557C0]" />
                    <span>Contact &amp; Personal Particulars (Editable)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        Student Mobile *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your 10-digit mobile"
                        value={onboardingForm.phone}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, phone: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        Parent Mobile *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter parent / guardian mobile"
                        value={onboardingForm.parentPhone}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, parentPhone: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        required
                        value={onboardingForm.dateOfBirth}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, dateOfBirth: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      />
                    </div>
                  </div>
                </div>

                {/* Option: Request Admin Correction */}
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onboardingForm.hasCorrectionRequest}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, hasCorrectionRequest: e.target.checked })}
                      className="w-4 h-4 rounded text-[#1557C0] focus:ring-[#1557C0]"
                    />
                    <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Any academic details wrong? Request Admin Correction
                    </span>
                  </label>

                  {onboardingForm.hasCorrectionRequest && (
                    <div className="pt-1 animate-in fade-in">
                      <textarea
                        rows={2}
                        placeholder="Describe the correction needed (e.g. My section should be B, or correction in name spelling...)"
                        value={onboardingForm.correctionRemarks}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, correctionRemarks: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs font-medium text-[#071A41] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* Details Confirmed Checkbox */}
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={onboardingForm.detailsConfirmed}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, detailsConfirmed: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-[#1557C0] focus:ring-[#1557C0]"
                    />
                    <span className="text-xs font-bold text-[#071A41]">
                      I confirm that I have reviewed my student particulars, mobile numbers, and academic record.
                    </span>
                  </label>
                </div>

                {/* Next Button */}
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] text-white shadow-md cursor-pointer hover:scale-[1.02] transition-all"
                  >
                    <span>Next: Set Password &amp; Verify Email</span>
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
                          placeholder="Create strong password"
                          value={onboardingForm.newPassword}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, newPassword: e.target.value })}
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
                          placeholder="Repeat password"
                          value={onboardingForm.confirmPassword}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, confirmPassword: e.target.value })}
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
                      Verify Student Email via OTP *
                    </span>
                    <span className="text-[10px] font-bold text-blue-700">Official Communication</span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-1">
                      Email Address *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="e.g. yourname@gmail.com or student@vsb.edu.in"
                        value={onboardingForm.email}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, email: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSendEmailOTP}
                        disabled={onboardingLoading || emailOtpCooldown > 0}
                        className="px-4 py-2.5 rounded-xl bg-[#1557C0] hover:bg-[#0e44b5] text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {emailOtpCooldown > 0 ? `Resend (${emailOtpCooldown}s)` : emailOtpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  {/* OTP Input Section */}
                  {emailOtpSent && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <label className="block font-bold text-gray-700 text-[11px]">
                        Enter 6-Digit Email Verification Code *
                      </label>
                      <OTPInput
                        length={6}
                        value={onboardingForm.emailOtp}
                        onChange={(val) => setOnboardingForm({ ...onboardingForm, emailOtp: val })}
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Wizard Navigation Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Details</span>
                  </button>

                  <Button
                    type="submit"
                    size="default"
                    loading={onboardingLoading}
                    className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] text-white shadow-md text-xs sm:text-sm cursor-pointer transition-all"
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
    </div>
  )
}