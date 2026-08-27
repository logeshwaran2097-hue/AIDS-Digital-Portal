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
  GraduationCap,
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
    <div className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-hidden bg-gradient-to-b from-[#EBF5FF] via-[#F4F9FF] to-[#E5F1FF] px-4 py-6 sm:py-10 select-none font-sans">
      
      {/* Background Ambient Glowing Shapes & Neural Vectors */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-Left AI Network Graphic */}
        <div className="absolute top-4 left-4 w-48 h-48 opacity-25">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-500">
            <circle cx="30" cy="40" r="4" fill="currentColor" />
            <circle cx="100" cy="20" r="6" fill="currentColor" />
            <circle cx="160" cy="50" r="5" fill="currentColor" />
            <circle cx="60" cy="110" r="5" fill="currentColor" />
            <circle cx="140" cy="120" r="7" fill="currentColor" />
            <line x1="30" y1="40" x2="100" y2="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="100" y1="20" x2="160" y2="50" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30" y1="40" x2="60" y2="110" stroke="currentColor" strokeWidth="1.5" />
            <line x1="60" y1="110" x2="140" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="160" y1="50" x2="140" y2="120" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Top-Right AI Microchip Graphic */}
        <div className="absolute top-4 right-4 w-48 h-48 opacity-25">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-500">
            <rect x="70" y="70" width="60" height="60" rx="8" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5" />
            <text x="100" y="105" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="bold">AI</text>
            <path d="M70 85 H50 M70 100 H50 M70 115 H50 M130 85 H150 M130 100 H150 M130 115 H150 M85 70 V50 M100 70 V50 M115 70 V50 M85 130 V150 M100 130 V150 M115 130 V150" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="85" r="3" fill="currentColor" />
            <circle cx="50" cy="115" r="3" fill="currentColor" />
            <circle cx="150" cy="100" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Soft Background Radial Light Blobs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-blue-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-0 w-[500px] h-[350px] bg-sky-200/40 rounded-full blur-3xl" />

        {/* Bottom Campus Graphic Overlay */}
        <div className="absolute bottom-0 inset-x-0 h-44 opacity-20 pointer-events-none flex items-end justify-center">
          <svg viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover text-blue-800">
            <path d="M0 200L40 180H120L160 150H260L300 170H450L500 130H700L750 170H900L940 150H1040L1080 180H1200V200H0Z" fill="currentColor" />
            <path d="M500 130L600 90L700 130V200H500V130Z" fill="currentColor" />
          </svg>
        </div>

        {/* Bottom Left & Right Wave Crests */}
        <div className="absolute bottom-0 left-0 w-44 h-16 pointer-events-none">
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
            <path d="M0 100C50 90 100 60 140 20C170 -10 200 0 200 0V100H0Z" fill="#1D4ED8" fillOpacity="0.8" />
            <path d="M0 100C40 95 90 75 130 35C150 15 180 5 180 5" stroke="#F59E0B" strokeWidth="4" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-44 h-16 pointer-events-none">
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
            <path d="M200 100C150 90 100 60 60 20C30 -10 0 0 0 0V100H200Z" fill="#1D4ED8" fillOpacity="0.8" />
            <path d="M200 100C160 95 110 75 70 35C50 15 20 5 20 5" stroke="#F59E0B" strokeWidth="4" />
          </svg>
        </div>
      </div>

      {/* TOP HEADER: Centered Branding */}
      <div className="w-full max-w-lg text-center space-y-2.5 relative z-10 pt-2 pb-2">
        
        {/* Emblem with Golden Border Rim */}
        <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-xl border-4 border-[#F59E0B]/70 p-1 mx-auto">
          <Image
            src="/college-emblem.png"
            alt="V.S.B. Engineering College Emblem"
            width={100}
            height={100}
            className="w-full h-full object-contain rounded-full"
            priority
          />
        </div>

        {/* Institution Titles */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#0B1E48] tracking-tight">
            V.S.B. ENGINEERING COLLEGE
          </h1>
          <p className="text-xs sm:text-[13px] font-black text-[#1D4ED8] tracking-wide uppercase">
            DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
          </p>
          <p className="text-xs text-slate-500 font-medium">
            — Academic Management &amp; Digital Portal —
          </p>

          {/* Department Portal Pill */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#0B2559] text-white text-xs font-semibold shadow-md">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI &amp; DS Department Portal</span>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN AUTHENTICATION CARD */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-white p-5 sm:p-6 space-y-4 relative z-10 my-2">
        
        {/* SELECT YOUR ROLE */}
        <div>
          <label className="block text-[11px] font-black text-[#0B1E48] uppercase tracking-wider mb-2">
            SELECT YOUR ROLE
          </label>
          <div className="grid grid-cols-4 gap-2">
            
            {/* 1. Student */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student')
                setRegisterNumber('')
                setPassword('')
                setShowPassword(false)
              }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border',
                selectedRole === 'student'
                  ? 'bg-gradient-to-b from-[#155DFC] to-[#0E46BC] text-white border-transparent shadow-md'
                  : 'bg-white text-[#0B1E48] hover:bg-slate-50 border-slate-200 shadow-xs'
              )}
            >
              <span className="text-xl">🎓</span>
              <span className="text-[11px] font-bold">Student</span>
              {selectedRole === 'student' && (
                <span className="w-6 h-0.5 bg-white rounded-full mt-0.5" />
              )}
            </button>

            {/* 2. Faculty */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('faculty')
                setFacultyId('')
                setPassword('')
                setShowPassword(false)
              }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border',
                selectedRole === 'faculty'
                  ? 'bg-gradient-to-b from-[#155DFC] to-[#0E46BC] text-white border-transparent shadow-md'
                  : 'bg-white text-[#0B1E48] hover:bg-slate-50 border-slate-200 shadow-xs'
              )}
            >
              <span className="text-xl">📚</span>
              <span className="text-[11px] font-bold">Faculty</span>
              {selectedRole === 'faculty' && (
                <span className="w-6 h-0.5 bg-white rounded-full mt-0.5" />
              )}
            </button>

            {/* 3. HOD */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('hod')
                setFacultyId('')
                setPassword('')
                setShowPassword(false)
              }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border',
                selectedRole === 'hod'
                  ? 'bg-gradient-to-b from-[#155DFC] to-[#0E46BC] text-white border-transparent shadow-md'
                  : 'bg-white text-[#0B1E48] hover:bg-slate-50 border-slate-200 shadow-xs'
              )}
            >
              <span className="text-xl">🏛️</span>
              <span className="text-[11px] font-bold">HOD</span>
              {selectedRole === 'hod' && (
                <span className="w-6 h-0.5 bg-white rounded-full mt-0.5" />
              )}
            </button>

            {/* 4. Admin */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin')
                setEmail('')
                setOtpSent(false)
                setOtp('')
              }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border',
                selectedRole === 'admin'
                  ? 'bg-gradient-to-b from-[#155DFC] to-[#0E46BC] text-white border-transparent shadow-md'
                  : 'bg-white text-[#0B1E48] hover:bg-slate-50 border-slate-200 shadow-xs'
              )}
            >
              <span className="text-xl">⚙️</span>
              <span className="text-[11px] font-bold">Admin</span>
              {selectedRole === 'admin' && (
                <span className="w-6 h-0.5 bg-white rounded-full mt-0.5" />
              )}
            </button>

          </div>
        </div>

        {/* Inner Rounded Authentication Card */}
        <div className="rounded-2xl border border-blue-50 bg-[#F9FBFE] p-4 sm:p-5 space-y-4">
          
          {/* Welcome Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100/80 flex items-center justify-center text-blue-600">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B1E48] flex items-center gap-1.5">
                <span>Welcome Back</span>
                <span>👋</span>
              </h2>
              <p className="text-xs text-slate-500">
                Sign in to access your <span className="capitalize font-semibold text-blue-600">{selectedRole} Portal</span>
              </p>
            </div>
          </div>

          {/* Dynamic Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            
            {/* 1. STUDENT AUTHENTICATION */}
            {selectedRole === 'student' && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0B1E48] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#1D4ED8]" />
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
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0B1E48] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1D4ED8]" />
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
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
                  className="w-full font-bold py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#0C3E9E] via-[#1455D9] to-[#1E60E6] hover:from-[#0B3587] hover:to-[#174FC0] shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2"
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
                  <label className="block text-xs font-bold text-[#0B1E48] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#1D4ED8]" />
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
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0B1E48] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1D4ED8]" />
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
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
                  className="w-full font-bold py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#0C3E9E] via-[#1455D9] to-[#1E60E6] hover:from-[#0B3587] hover:to-[#174FC0] shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2"
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
                  <label className="block text-xs font-bold text-[#0B1E48] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#1D4ED8]" />
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
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0B1E48] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1D4ED8]" />
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
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
                  className="w-full font-bold py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#0C3E9E] via-[#1455D9] to-[#1E60E6] hover:from-[#0B3587] hover:to-[#174FC0] shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2"
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
                      <label className="block text-xs font-bold text-[#0B1E48] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#1D4ED8]" />
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
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all placeholder:text-slate-400 shadow-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full font-bold py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#0C3E9E] via-[#1455D9] to-[#1E60E6] hover:from-[#0B3587] hover:to-[#174FC0] shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer text-xs sm:text-sm mt-2 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{loading ? 'Sending 2FA OTP...' : 'Send 2FA Code'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
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
                      <label className="block text-xs font-bold text-[#0B1E48] mb-1.5">
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
                      className="w-full font-bold py-3 px-4 rounded-xl text-white bg-gradient-to-r from-[#0C3E9E] via-[#1455D9] to-[#1E60E6] hover:from-[#0B3587] hover:to-[#174FC0] shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
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
              <Lock className="w-3 h-3 text-blue-600" />
              <span>Secure Login</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
              <HelpCircle className="w-3 h-3 text-blue-600" />
              <span>Need Help?</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
              <Mail className="w-3 h-3 text-blue-600" />
              <span>Contact Admin</span>
            </span>
          </div>

        </div>
      </div>

      {/* BOTTOM QUOTE: "a place for placement" with Golden Line and Mini Cap */}
      <div className="text-center space-y-1 relative z-10 pt-2 pb-2">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-px bg-slate-300" />
          <p className="text-lg sm:text-xl font-bold tracking-wide italic text-[#0B1E48]" style={{ fontFamily: 'Georgia, serif' }}>
            a place for placement
          </p>
          <div className="w-12 h-px bg-slate-300" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-0.5 bg-[#F59E0B]" />
          <span className="text-xs">🎓</span>
          <div className="w-8 h-0.5 bg-[#F59E0B]" />
        </div>
      </div>

      {/* FOOTER BADGES: Learn Today | Build Tomorrow | Create a Better Future */}
      <footer className="w-full max-w-lg mx-auto flex items-center justify-start gap-4 text-[11px] text-[#0B1E48] font-bold z-10 pt-2 border-t border-blue-200/50">
        <div className="flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-blue-600" />
          <div className="leading-tight">
            <span className="block text-[9px] text-slate-500 font-medium">Learn</span>
            <span>Today</span>
          </div>
        </div>
        <div className="h-6 w-px bg-slate-300" />
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <div className="leading-tight">
            <span className="block text-[9px] text-slate-500 font-medium">Build</span>
            <span>Tomorrow</span>
          </div>
        </div>
        <div className="h-6 w-px bg-slate-300" />
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
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
        <div className="fixed inset-0 z-50 bg-[#071A3D]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
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
              <h3 className="text-xl font-black text-[#071A3D]">
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
                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-[#071A3D] focus:border-blue-500 focus:outline-none pr-8"
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
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-[#071A3D] focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="font-bold text-[#071A3D] text-xs block">
                  Remaining Profile &amp; Contact Details:
                </span>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={onboardingForm.name}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D] focus:border-blue-500 focus:outline-none"
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
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-[#071A3D] focus:border-blue-500 focus:outline-none"
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
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-[#071A3D] focus:border-blue-500 focus:outline-none"
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
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-[#071A3D] focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSkipOnboarding}
                  className="text-xs text-gray-500 hover:text-[#071A3D] font-bold underline cursor-pointer"
                >
                  Skip for now
                </button>
                <Button
                  type="submit"
                  size="default"
                  loading={onboardingLoading}
                  className="font-bold flex items-center gap-1.5 bg-[#1455D9] hover:bg-[#0B3587] text-white"
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