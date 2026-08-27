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
  LogIn,
  HelpCircle,
  Brain,
  Lightbulb,
  TrendingUp,
  Cpu,
  Check,
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

  // First-time Onboarding Modal state
  const [showOnboardingModal, setShowOnboardingModal] = React.useState(false)
  const [onboardingUser, setOnboardingUser] = React.useState<any>(null)
  const [onboardingForm, setOnboardingForm] = React.useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    newPassword: '',
    confirmPassword: '',
    qualification: '',
    specialization: '',
    experience: '' as any,
  })
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [onboardingLoading, setOnboardingLoading] = React.useState(false)

  const router = useRouter()

  React.useEffect(() => {
    if (otpCooldown <= 0) return
    const timer = setTimeout(() => setOtpCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
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
        toast.error(data.message || 'Login failed. Please check your credentials.')
        return
      }

      // Check if user must complete profile
      if (data.user?.mustChangePassword && (selectedRole === 'student' || selectedRole === 'faculty' || selectedRole === 'hod')) {
        setOnboardingUser(data.user)
        setOnboardingForm({
          name: data.user.name || '',
          phone: data.user.phone || '',
          email: data.user.email || '',
          dateOfBirth: data.user.dateOfBirth || '',
          newPassword: '',
          confirmPassword: '',
          qualification: data.user.qualification || '',
          specialization: data.user.specialization || '',
          experience: data.user.experience || '',
        })
        setShowOnboardingModal(true)
        toast.success('Welcome! Please complete your profile.')
        return
      }

      toast.success('Login verified! Entering portal...')
      const dashboardMap: Record<string, string> = {
        student: '/dashboard',
        faculty: '/faculty-dashboard',
        hod: '/hod-dashboard',
      }
      setTimeout(() => {
        window.location.href = dashboardMap[selectedRole]
      }, 250)
    } catch {
      toast.error('Network connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()

    if (onboardingForm.newPassword) {
      if (onboardingForm.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long.')
        return
      }
      if (onboardingForm.newPassword !== onboardingForm.confirmPassword) {
        toast.error('New password and confirmation do not match.')
        return
      }
    }

    setOnboardingLoading(true)
    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingForm),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Profile details saved!')
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
        toast.error(data.message || 'Failed to save profile.')
      }
    } catch {
      toast.error('Network error saving profile.')
    } finally {
      setOnboardingLoading(false)
    }
  }

  const handleSkipOnboarding = () => {
    setShowOnboardingModal(false)
    const dashboardMap: Record<string, string> = {
      student: '/dashboard',
      faculty: '/faculty-dashboard',
      hod: '/hod-dashboard',
    }
    window.location.href = dashboardMap[selectedRole]
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
      toast.error('Please enter the complete 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: codeToVerify, challenge }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Invalid or expired OTP.')
        return
      }
      toast.success('Admin authenticated!')
      setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 250)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // 1. STAGED BACKGROUND: 0-1s Deep Navy -> Royal Blue -> Soft Light Blue -> White/Pearl with subtle idle wave
    <div className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-hidden anim-bg-intro bg-[#F5F8FC] px-4 py-5 sm:py-8 select-none font-sans max-w-full">
      
      {/* Soft Blue Light Wave Sweep (Initial 0.2s-2.0s & Idle repeat every 9s) */}
      <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-blue-400/15 to-transparent anim-light-wave" />
        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent anim-idle-wave" />
      </div>

      {/* Subtle Connected Network Dots & AI Data Particles (Gentle low opacity idle float) */}
      <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
        {/* Top-Left AI Network Constellation */}
        <div className="absolute top-2 left-2 sm:top-6 sm:left-6 w-44 h-44 sm:w-56 sm:h-56 opacity-20 anim-particle-float">
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

        {/* Top-Right AI Microchip Graphic */}
        <div className="absolute top-2 right-2 sm:top-6 sm:right-6 w-44 h-44 sm:w-56 sm:h-56 opacity-20 anim-particle-float" style={{ animationDelay: '2s' }}>
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#1557C0]">
            <rect x="70" y="70" width="60" height="60" rx="10" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5" />
            <text x="100" y="106" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="bold">AI</text>
            <path d="M70 85 H48 M70 100 H48 M70 115 H48 M130 85 H152 M130 100 H152 M130 115 H152 M85 70 V48 M100 70 V48 M115 70 V48 M85 130 V152 M100 130 V152 M115 130 V152" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="anim-circuit-drift" />
            <circle cx="48" cy="85" r="3" fill="currentColor" />
            <circle cx="48" cy="115" r="3" fill="currentColor" />
            <circle cx="152" cy="100" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Bottom Ambient Skyline Overlay */}
        <div className="absolute bottom-0 inset-x-0 h-40 opacity-15 pointer-events-none flex items-end justify-center">
          <svg viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover text-[#071A41]">
            <path d="M0 200L40 180H120L160 150H260L300 170H450L500 130H700L750 170H900L940 150H1040L1080 180H1200V200H0Z" fill="currentColor" />
            <path d="M500 130L600 90L700 130V200H500V130Z" fill="currentColor" />
          </svg>
        </div>

        {/* Bottom Left & Right Wave Crests in #1557C0 & #E7B93E */}
        <div className="absolute bottom-0 left-0 w-36 sm:w-44 h-14 pointer-events-none">
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
            <path d="M0 100C50 90 100 60 140 20C170 -10 200 0 200 0V100H0Z" fill="#1557C0" fillOpacity="0.75" />
            <path d="M0 100C40 95 90 75 130 35C150 15 180 5 180 5" stroke="#E7B93E" strokeWidth="4" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-36 sm:w-44 h-14 pointer-events-none">
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
            <path d="M200 100C150 90 100 60 60 20C30 -10 0 0 0 0V100H200Z" fill="#1557C0" fillOpacity="0.75" />
            <path d="M200 100C160 95 110 75 70 35C50 15 20 5 20 5" stroke="#E7B93E" strokeWidth="4" />
          </svg>
        </div>
      </div>

      {/* TOP HEADER: Centered Branding Sequence */}
      <div className="w-full max-w-lg text-center space-y-2 relative z-10 pt-1 pb-1">
        
        {/* 2. LOGO ANIMATION (1.0s - 1.8s): Scale 80% -> 100%, Opacity 0 -> 1, Smooth Ease-out with Subtle Gold Glow */}
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-xl border-[3.5px] border-[#E7B93E] p-1 mx-auto anim-logo-reveal">
          <Image
            src="/college-emblem.png"
            alt="V.S.B. Engineering College Logo"
            width={90}
            height={90}
            className="w-full h-full object-contain rounded-full"
            priority
          />
        </div>

        {/* 3. COLLEGE NAME ANIMATION (1.8s - 2.6s): Fade in + translateY 18px -> 0 */}
        <h1 className="text-xl sm:text-2xl font-black text-[#071A41] tracking-tight anim-college-name">
          V.S.B. ENGINEERING COLLEGE
        </h1>

        {/* 4. DEPARTMENT NAME ANIMATION (2.6s - 3.3s): Fade in + upward transition */}
        <p className="text-xs sm:text-[13px] font-black text-[#1557C0] tracking-wide uppercase anim-dept-name">
          DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
        </p>

        {/* 5. PORTAL TITLE ANIMATION (3.3s - 3.8s): Fade in + center-out underline animation */}
        <div className="relative inline-block mx-auto anim-portal-title">
          <p className="text-xs text-slate-500 font-medium px-2">
            Academic Management &amp; Digital Portal
          </p>
          <span className="block h-[1.5px] bg-gradient-to-r from-transparent via-[#E7B93E] to-transparent w-full mt-0.5 anim-underline-center" />
        </div>

        {/* Portal Pill Badge */}
        <div className="pt-0.5 anim-portal-title">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#071A41] text-white text-[11px] font-semibold shadow-md">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>AI &amp; DS Department Portal</span>
          </span>
        </div>
      </div>

      {/* 6. LOGIN CARD ANIMATION (3.8s - 4.6s): Scale 96% -> 100%, Opacity 0 -> 1, Gradual Soft Shadow */}
      <div className="w-full max-w-[410px] bg-white rounded-3xl border border-white/90 p-5 sm:p-6 space-y-4 relative z-10 my-1.5 anim-card-reveal">
        
        {/* 7. ROLE CARDS REVEAL (4.6s - 5.3s): Sequential Student -> Faculty -> HOD -> Admin with 10px upward motion */}
        <div>
          <label className="block text-[10px] font-black text-[#071A41] uppercase tracking-wider mb-2">
            SELECT YOUR ROLE
          </label>
          <div className="grid grid-cols-4 gap-2">
            
            {/* 1. Student (4.6s reveal, highlighted with blue gradient & check indicator) */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student')
                setRegisterNumber('')
                setPassword('')
                setShowPassword(false)
              }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border anim-role-student',
                selectedRole === 'student'
                  ? 'bg-gradient-to-b from-[#1557C0] to-[#071A41] text-white border-transparent anim-selected-glow'
                  : 'bg-white text-[#071A41] hover:bg-slate-50 border-slate-200 shadow-xs'
              )}
            >
              {selectedRole === 'student' && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#E7B93E] text-[#071A41] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              <span className="text-xl">🎓</span>
              <span className="text-[11px] font-bold">Student</span>
              {selectedRole === 'student' && (
                <span className="w-5 h-0.5 bg-white/90 rounded-full mt-0.5" />
              )}
            </button>

            {/* 2. Faculty (4.8s reveal) */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('faculty')
                setFacultyId('')
                setPassword('')
                setShowPassword(false)
              }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border anim-role-faculty',
                selectedRole === 'faculty'
                  ? 'bg-gradient-to-b from-[#1557C0] to-[#071A41] text-white border-transparent anim-selected-glow'
                  : 'bg-white text-[#071A41] hover:bg-slate-50 border-slate-200 shadow-xs'
              )}
            >
              {selectedRole === 'faculty' && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#E7B93E] text-[#071A41] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              <span className="text-xl">📚</span>
              <span className="text-[11px] font-bold">Faculty</span>
              {selectedRole === 'faculty' && (
                <span className="w-5 h-0.5 bg-white/90 rounded-full mt-0.5" />
              )}
            </button>

            {/* 3. HOD (5.0s reveal) */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('hod')
                setFacultyId('')
                setPassword('')
                setShowPassword(false)
              }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border anim-role-hod',
                selectedRole === 'hod'
                  ? 'bg-gradient-to-b from-[#1557C0] to-[#071A41] text-white border-transparent anim-selected-glow'
                  : 'bg-white text-[#071A41] hover:bg-slate-50 border-slate-200 shadow-xs'
              )}
            >
              {selectedRole === 'hod' && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#E7B93E] text-[#071A41] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              <span className="text-xl">🏛️</span>
              <span className="text-[11px] font-bold">HOD</span>
              {selectedRole === 'hod' && (
                <span className="w-5 h-0.5 bg-white/90 rounded-full mt-0.5" />
              )}
            </button>

            {/* 4. Admin (5.2s reveal) */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin')
                setEmail('')
                setOtpSent(false)
                setOtp('')
              }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border anim-role-admin',
                selectedRole === 'admin'
                  ? 'bg-gradient-to-b from-[#1557C0] to-[#071A41] text-white border-transparent anim-selected-glow'
                  : 'bg-white text-[#071A41] hover:bg-slate-50 border-slate-200 shadow-xs'
              )}
            >
              {selectedRole === 'admin' && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#E7B93E] text-[#071A41] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              <span className="text-xl">⚙️</span>
              <span className="text-[11px] font-bold">Admin</span>
              {selectedRole === 'admin' && (
                <span className="w-5 h-0.5 bg-white/90 rounded-full mt-0.5" />
              )}
            </button>

          </div>
        </div>

        {/* 8. LOGIN FORM REVEAL (5.3s - 5.8s): Welcome Back + Inputs + CTA Button */}
        <div className="rounded-2xl border border-blue-100/80 bg-[#F8FAFD] p-4 sm:p-5 space-y-3.5 anim-form-reveal">
          
          {/* Welcome Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#1557C0]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#071A41] flex items-center gap-1">
                <span>Welcome Back</span>
                <span>👋</span>
              </h2>
              <p className="text-xs text-slate-500">
                Sign in to access your <span className="capitalize font-semibold text-[#1557C0]">{selectedRole} Portal</span>
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            
            {/* 1. STUDENT AUTHENTICATION */}
            {selectedRole === 'student' && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#071A41] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Register Number</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 922522AD001"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#071A41] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] hover:from-[#05132E] hover:to-[#1557C0] shadow-lg shadow-blue-900/20 transition-all duration-200 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Logging in...' : 'Login to Student Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* 2. FACULTY AUTHENTICATION */}
            {selectedRole === 'faculty' && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#071A41] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Faculty ID</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. FAC001"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#071A41] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] hover:from-[#05132E] hover:to-[#1557C0] shadow-lg shadow-blue-900/20 transition-all duration-200 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Logging in...' : 'Login to Faculty Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* 3. HOD AUTHENTICATION */}
            {selectedRole === 'hod' && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#071A41] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Faculty ID</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. HOD001"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#071A41] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1557C0]" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] hover:from-[#05132E] hover:to-[#1557C0] shadow-lg shadow-blue-900/20 transition-all duration-200 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Logging in...' : 'Login to HOD Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* 4. ADMIN AUTHENTICATION */}
            {selectedRole === 'admin' && (
              <div className="space-y-3">
                {!otpSent ? (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#071A41] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#1557C0]" />
                        <span>Admin Email Address</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          placeholder="admin@vsb.edu.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full font-bold py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] hover:from-[#05132E] hover:to-[#1557C0] shadow-lg shadow-blue-900/20 transition-all duration-200 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{loading ? 'Sending 2FA OTP...' : 'Send 2FA Code'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/80 border border-blue-200 text-xs">
                      <span className="text-blue-900 font-medium">
                        OTP sent to: <span className="font-bold">{email}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false)
                          setOtp('')
                        }}
                        className="text-xs text-blue-700 font-bold hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#071A41] mb-1.5">
                        Enter 6-Digit OTP Code
                      </label>
                      <OTPInput
                        length={6}
                        value={otp}
                        onChange={setOtp}
                        onComplete={(v) => {
                          setOtp(v)
                          handleVerifyOTP(v)
                        }}
                        autoFocus
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyOTP()}
                      disabled={loading}
                      className="w-full font-bold py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] hover:from-[#05132E] hover:to-[#1557C0] shadow-lg shadow-blue-900/20 transition-all duration-200 cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{loading ? 'Verifying...' : 'Verify OTP & Login'}</span>
                    </button>

                    {otpCooldown > 0 ? (
                      <p className="text-center text-xs text-slate-500 font-medium">
                        Resend code in {otpCooldown}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="block w-full text-center text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Quick Help & Secure Links Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#1557C0]" />
              <span>Secure Login</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-[#1557C0]">
              <HelpCircle className="w-3 h-3 text-[#1557C0]" />
              <span>Need Help?</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-[#1557C0]">
              <Mail className="w-3 h-3 text-[#1557C0]" />
              <span>Contact Admin</span>
            </span>
          </div>

        </div>
      </div>

      {/* 9. QUOTE ANIMATION (5.8s - 6.5s): Opening quote, text slide-up, closing quote, and gold underline drawing left to right */}
      <div className="text-center space-y-1 relative z-10 pt-1.5 pb-1 anim-quote-reveal">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 sm:w-12 h-px bg-slate-300" />
          <p className="text-base sm:text-lg font-bold tracking-wider italic text-[#071A41]" style={{ fontFamily: 'Georgia, serif' }}>
            &ldquo;a place for placement&rdquo;
          </p>
          <div className="w-8 sm:w-12 h-px bg-slate-300" />
        </div>
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <span className="h-[2px] bg-[#E7B93E] w-12 sm:w-16 rounded-full block anim-quote-underline" />
          <span className="text-xs">🎓</span>
          <span className="h-[2px] bg-[#E7B93E] w-12 sm:w-16 rounded-full block anim-quote-underline" />
        </div>
      </div>

      {/* 10. FOOTER VALUE BADGES (6.4s): Learn Today | Build Tomorrow | Create a Better Future */}
      <footer className="w-full max-w-md mx-auto flex items-center justify-start gap-4 text-[11px] text-[#071A41] font-bold z-10 pt-1.5 border-t border-blue-200/50 anim-footer-reveal">
        <div className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-[#1557C0]" />
          <div className="leading-tight">
            <span className="block text-[9px] text-slate-500 font-medium">Learn</span>
            <span>Today</span>
          </div>
        </div>
        <div className="h-5 w-px bg-slate-300" />
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-[#E7B93E]" />
          <div className="leading-tight">
            <span className="block text-[9px] text-slate-500 font-medium">Build</span>
            <span>Tomorrow</span>
          </div>
        </div>
        <div className="h-5 w-px bg-slate-300" />
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <div className="leading-tight">
            <span className="block text-[9px] text-slate-500 font-medium">Create a</span>
            <span>Better Future</span>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* ONBOARDING & PROFILE COMPLETION MODAL */}
      {/* ========================================================================= */}
      {showOnboardingModal && onboardingUser && (
        <div className="fixed inset-0 z-50 bg-[#071A41]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-gray-100 max-h-[92vh] overflow-y-auto">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-200">
                  First-Time Account Setup
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {onboardingUser.registerNumber || onboardingUser.facultyId}
                </span>
              </div>
              <h3 className="text-xl font-black text-[#071A41]">
                Complete Your Profile Details
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Your account was created by Admin with a temporary password. Please set your permanent secure password and fill in your remaining details.
              </p>
            </div>

            <form onSubmit={handleCompleteOnboarding} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Set Your Permanent Password *
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700">Min 6 characters</span>
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
                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-[#071A41] focus:border-blue-500 focus:outline-none pr-8"
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
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={onboardingForm.confirmPassword}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, confirmPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-[#071A41] focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="font-bold text-[#071A41] text-xs block">
                  Remaining Profile &amp; Contact Details:
                </span>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={onboardingForm.name}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A41] focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-blue-600" />
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={onboardingForm.phone}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-[#071A41] focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={onboardingForm.dateOfBirth}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, dateOfBirth: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-[#071A41] focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-600" />
                    Personal / Preferred Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. personal.email@gmail.com"
                    value={onboardingForm.email}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-[#071A41] focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSkipOnboarding}
                  className="text-xs text-gray-500 hover:text-[#071A41] font-bold underline cursor-pointer"
                >
                  Skip for now
                </button>
                <Button
                  type="submit"
                  size="default"
                  loading={onboardingLoading}
                  className="font-bold flex items-center gap-1.5 bg-gradient-to-r from-[#071A41] to-[#1557C0] text-white"
                >
                  <span>Save &amp; Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}