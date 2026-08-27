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
  Lock,
  User as UserIcon,
  Mail,
  GraduationCap,
  BookOpen,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  FileCheck2,
  Layers,
  HelpCircle,
  Phone,
  Calendar,
} from 'lucide-react'

interface RoleOption {
  id: 'student' | 'faculty' | 'hod' | 'admin'
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const ROLES: RoleOption[] = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'faculty', label: 'Faculty', icon: BookOpen },
  { id: 'hod', label: 'HOD', icon: Building2 },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
]

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
        toast.error(data.message || 'Invalid credentials. Please verify and try again.')
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
        toast.success('Welcome! Please set a permanent password to complete setup.')
        return
      }

      toast.success('Authentication successful! Entering portal...')
      const dashboardMap: Record<string, string> = {
        student: '/dashboard',
        faculty: '/faculty-dashboard',
        hod: '/hod-dashboard',
      }
      setTimeout(() => {
        window.location.href = dashboardMap[selectedRole]
      }, 250)
    } catch {
      toast.error('Network connection issue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Onboarding Completion Submit
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()

    if (onboardingForm.newPassword) {
      if (onboardingForm.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters.')
        return
      }
      if (onboardingForm.newPassword !== onboardingForm.confirmPassword) {
        toast.error('Password confirmation does not match.')
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
        toast.success('Profile details saved successfully.')
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
        toast.error(data.message || 'Failed to update profile.')
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
      toast.error('Please enter a valid administrator email address')
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
        toast.error(data.message || 'Unable to generate administrator OTP')
        return
      }
      if (data.challenge) {
        setChallenge(data.challenge)
      }
      setOtpSent(true)
      toast.success(data.message || 'Two-Factor Authentication OTP code dispatched.')
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
      toast.error('Please enter the complete 6-digit OTP code')
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
      toast.success('Administrator authenticated!')
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-gray-900 font-sans select-none overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* LEFT PANE: INSTITUTIONAL BRAND & GOVERNANCE (50% Desktop, Full Header Mobile) */}
      {/* ========================================================================= */}
      <div className="lg:w-1/2 bg-[#071A3D] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
        
        {/* Subtle geometric grid background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1455D9]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Institution Emblem & Official Identity */}
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 shadow-lg border border-white/20 shrink-0 flex items-center justify-center">
              <Image
                src="/college-emblem.png"
                alt="V.S.B. Engineering College Official Emblem"
                width={68}
                height={68}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-snug">
                V.S.B. ENGINEERING COLLEGE
              </h1>
              <p className="text-xs text-[#F4C430] font-bold uppercase tracking-wider mt-0.5">
                Autonomous Institution · Karur, Tamil Nadu
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                Approved by AICTE, New Delhi · Affiliated to Anna University, Chennai
              </p>
            </div>
          </div>

          {/* Department Banner Card */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-sm shadow-inner">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1455D9]/30 border border-[#22C7E8]/30 text-[10px] font-bold uppercase text-[#22C7E8] tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F4C430]" />
              <span>Official Academic Department Portal</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              Department of Artificial Intelligence &amp; Data Science
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Autonomous Academic Management, Attendance, Continuous Assessment &amp; Student Information Governance.
            </p>
          </div>

          {/* Key System Highlights */}
          <div className="space-y-3 pt-2 hidden sm:block">
            {[
              {
                icon: FileCheck2,
                title: 'Autonomous Academic Regulations',
                desc: 'Regulation 2021 & 2023 course curriculums and syllabus catalogs.',
              },
              {
                icon: Layers,
                title: '4-Year Cohort Batch Management',
                desc: 'Configurable Odd & Even semester attendance and examination tracking.',
              },
              {
                icon: KeyRound,
                title: 'Multi-Role Access Governance',
                desc: 'Secured authenticated dashboards for Students, Faculty, HOD & Administrators.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <item.icon className="w-4 h-4 text-[#F4C430] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-gray-100">{item.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Accreditation Credentials */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 font-medium relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-gray-200">NAAC &apos;A&apos; Grade &amp; NBA Tier-1 Accredited</span>
          </div>
          <span>NH-67, Covai Road, Karur - 639 111</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANE: EXECUTIVE AUTHENTICATION FORM (50% Desktop) */}
      {/* ========================================================================= */}
      <div className="lg:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        
        {/* Top Right Support / Security Pill */}
        <div className="flex items-center justify-end pb-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-[11px] text-gray-600 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Center: Sign-in Card Form Container */}
        <div className="max-w-md w-full mx-auto space-y-6 my-auto">
          
          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#071A3D] tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Select your institutional role to access your designated digital portal
            </p>
          </div>

          {/* Segmented Role Tabs */}
          <div className="p-1 rounded-xl bg-gray-100 grid grid-cols-4 gap-1 border border-gray-200">
            {ROLES.map((r) => {
              const isSelected = selectedRole === r.id
              const Icon = r.icon
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r.id)
                    setRegisterNumber('')
                    setPassword('')
                    setShowPassword(false)
                    setFacultyId('')
                    setEmail('')
                    setOtpSent(false)
                    setOtp('')
                  }}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    isSelected
                      ? 'bg-[#071A3D] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{r.label}</span>
                </button>
              )
            })}
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            
            {/* 1. STUDENT LOGIN */}
            {selectedRole === 'student' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Register Number
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter your Register Number"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 focus:outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full font-bold py-3 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                  size="lg"
                  loading={loading}
                >
                  <span>Sign In as Student</span>
                  <ArrowRight className="w-4 h-4 text-[#F4C430]" />
                </Button>
              </div>
            )}

            {/* 2. FACULTY LOGIN */}
            {selectedRole === 'faculty' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Faculty ID
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter your Faculty ID"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 focus:outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full font-bold py-3 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                  size="lg"
                  loading={loading}
                >
                  <span>Sign In as Faculty</span>
                  <ArrowRight className="w-4 h-4 text-[#F4C430]" />
                </Button>
              </div>
            )}

            {/* 3. HOD LOGIN */}
            {selectedRole === 'hod' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    HOD Faculty Code
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter HOD Faculty Code"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 focus:outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full font-bold py-3 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                  size="lg"
                  loading={loading}
                >
                  <span>Sign In as HOD</span>
                  <ArrowRight className="w-4 h-4 text-[#F4C430]" />
                </Button>
              </div>
            )}

            {/* 4. ADMIN LOGIN (2FA) */}
            {selectedRole === 'admin' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Administrator Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="admin@vsb.edu.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 focus:outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="w-full font-bold py-3 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                      size="lg"
                      onClick={handleSendOTP}
                      loading={loading}
                    >
                      <span>Send 2FA Verification Code</span>
                      <ArrowRight className="w-4 h-4 text-[#F4C430]" />
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                      <span className="text-blue-950 font-medium">
                        Verification code sent to: <span className="font-mono font-bold">{email}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false)
                          setOtp('')
                        }}
                        className="text-xs text-[#1455D9] font-bold hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Enter 6-Digit Code
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

                    <div className="space-y-2 pt-1">
                      <Button
                        type="button"
                        className="w-full font-bold py-3 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                        size="lg"
                        onClick={() => handleVerifyOTP()}
                        loading={loading}
                        variant="gold"
                      >
                        <span>Verify &amp; Enter Admin Portal</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>

                      {otpCooldown > 0 ? (
                        <p className="text-center text-xs text-gray-500 font-medium">
                          Resend code in {otpCooldown}s
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={loading}
                          className="block w-full text-center text-xs font-bold text-[#1455D9] hover:underline cursor-pointer disabled:opacity-50"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Help Desk Contact */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800">Need Portal Assistance?</span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Contact AI &amp; DS Department Coordinator: <span className="font-semibold text-gray-700">admin@vsb.edu.in</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Footer Copyright */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>© {new Date().getFullYear()} V.S.B. Engineering College</span>
          <span className="font-semibold text-gray-600">AI &amp; DS Digital Portal</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ONBOARDING & PROFILE COMPLETION MODAL */}
      {/* ========================================================================= */}
      {showOnboardingModal && onboardingUser && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-gray-100 max-h-[92vh] overflow-y-auto">
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1455D9] text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                  First-Time Account Setup
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {onboardingUser.registerNumber || onboardingUser.facultyId}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#071A3D]">
                Complete Your Profile &amp; Permanent Password
              </h3>
            </div>

            <form onSubmit={handleCompleteOnboarding} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5">
                <span className="font-bold text-gray-900 text-xs block">
                  Set Permanent Password *
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-gray-600 text-[11px] mb-1">New Password *</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="New password"
                        value={onboardingForm.newPassword}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, newPassword: e.target.value })}
                        className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium text-gray-900 focus:border-[#1455D9] focus:outline-none pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-600 text-[11px] mb-1">Confirm Password *</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm password"
                      value={onboardingForm.confirmPassword}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, confirmPassword: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-300 bg-white font-medium text-gray-900 focus:border-[#1455D9] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 text-[11px] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={onboardingForm.name}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 font-bold text-gray-900 focus:border-[#1455D9] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-gray-700 text-[11px] mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={onboardingForm.phone}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, phone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-300 font-medium text-gray-900 focus:border-[#1455D9] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 text-[11px] mb-1">Personal Email</label>
                  <input
                    type="email"
                    placeholder="email@gmail.com"
                    value={onboardingForm.email}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, email: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-300 font-medium text-gray-900 focus:border-[#1455D9] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSkipOnboarding}
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium underline cursor-pointer"
                >
                  Skip for now
                </button>
                <Button
                  type="submit"
                  size="sm"
                  loading={onboardingLoading}
                  className="font-bold"
                >
                  Save &amp; Continue
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}