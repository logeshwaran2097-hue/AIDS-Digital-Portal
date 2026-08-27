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
  Phone,
  Mail,
  Calendar,
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
  ExternalLink,
} from 'lucide-react'

interface RoleOption {
  id: 'student' | 'faculty' | 'hod' | 'admin'
  label: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

const ROLES: RoleOption[] = [
  {
    id: 'student',
    label: 'Student',
    subtitle: 'Academic portal & records',
    icon: GraduationCap,
  },
  {
    id: 'faculty',
    label: 'Faculty',
    subtitle: 'Course & attendance management',
    icon: BookOpen,
  },
  {
    id: 'hod',
    label: 'HOD',
    subtitle: 'Department administration',
    icon: Building2,
  },
  {
    id: 'admin',
    label: 'Admin',
    subtitle: 'System & security governance',
    icon: ShieldCheck,
  },
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

  // First-time Onboarding / Profile Completion Modal state
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

      // Check if user must complete profile or change temporary password
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
        toast.success('Welcome! Please complete your account profile.')
        return
      }

      toast.success('Authentication successful! Opening dashboard...')
      const dashboardMap: Record<string, string> = {
        student: '/dashboard',
        faculty: '/faculty-dashboard',
        hod: '/hod-dashboard',
      }
      setTimeout(() => {
        window.location.href = dashboardMap[selectedRole]
      }, 250)
    } catch {
      toast.error('Network error connecting to server. Please try again.')
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
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#071329] text-gray-900 relative overflow-hidden select-none font-sans">
      
      {/* Background Ambience: Subtle Geometric Grid & Soft Vignette */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d224d] via-[#071329] to-[#040a17]" />
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1455D9]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm border border-gray-200 flex items-center justify-center">
            <Image
              src="/college-emblem.png"
              alt="V.S.B. Engineering College"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              V.S.B. ENGINEERING COLLEGE
            </h1>
            <p className="text-[10px] text-gray-400 font-medium">
              Autonomous Institution · Affiliated to Anna University, Chennai
            </p>
          </div>
        </div>

        {/* Official Security & Portal Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          
          {/* Left Column: Institutional Info & Governance Details */}
          <div className="md:col-span-5 bg-[#071A3D] text-white p-7 sm:p-8 flex flex-col justify-between border-r border-gray-100/10">
            <div className="space-y-5">
              
              {/* Emblem & Dept Badge */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F4C430]" />
                  <span>Official Academic Portal</span>
                </div>

                <div>
                  <h2 className="text-lg font-black text-white leading-tight">
                    Department of Artificial Intelligence &amp; Data Science
                  </h2>
                  <p className="text-xs text-gray-300 mt-1 font-medium">
                    Autonomous Curriculum, Attendance &amp; Student Information System
                  </p>
                </div>
              </div>

              {/* Verified Institutional Details */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    icon: FileCheck2,
                    title: 'Autonomous Regulations',
                    desc: 'Regulation 2021 & 2023 Anna University aligned criteria',
                  },
                  {
                    icon: Layers,
                    title: 'Active Cohort Batches',
                    desc: 'I, II, III & IV Year academic tracking and attendance',
                  },
                  {
                    icon: KeyRound,
                    title: 'Role-Based Access Control',
                    desc: 'Secured student, faculty, HOD & admin endpoints',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <item.icon className="w-4 h-4 text-[#F4C430] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-100">{item.title}</h4>
                      <p className="text-[11px] text-gray-400 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accreditation standing footer */}
            <div className="pt-5 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400 font-medium">
              <span>NAAC &apos;A&apos; Grade &amp; NBA Tier-1</span>
              <span>Karur - 639 111</span>
            </div>
          </div>

          {/* Right Column: Clean Authentication Form */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white">
            <div className="space-y-5">
              
              {/* Form Title & Subtitle */}
              <div>
                <h3 className="text-xl font-black text-[#071A3D] tracking-tight">
                  Sign In to Your Account
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Select your role to access your designated portal
                </p>
              </div>

              {/* Modern Segmented Role Selector */}
              <div className="p-1 rounded-xl bg-gray-100 grid grid-cols-4 gap-1">
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
                        'flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                        isSelected
                          ? 'bg-[#071A3D] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{r.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Dynamic Role Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                
                {/* 1. STUDENT LOGIN */}
                {selectedRole === 'student' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Register Number
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Enter your Register Number..."
                          value={registerNumber}
                          onChange={(e) => setRegisterNumber(e.target.value)}
                          required
                          autoComplete="username"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/15 focus:outline-none transition-all text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/15 focus:outline-none transition-all text-xs sm:text-sm"
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
                      className="w-full font-bold py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
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
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Faculty ID
                      </label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Enter your Faculty ID..."
                          value={facultyId}
                          onChange={(e) => setFacultyId(e.target.value)}
                          required
                          autoComplete="username"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/15 focus:outline-none transition-all text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your faculty password..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/15 focus:outline-none transition-all text-xs sm:text-sm"
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
                      className="w-full font-bold py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
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
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        HOD Faculty Code
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Enter your HOD Faculty Code..."
                          value={facultyId}
                          onChange={(e) => setFacultyId(e.target.value)}
                          required
                          autoComplete="username"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/15 focus:outline-none transition-all text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/15 focus:outline-none transition-all text-xs sm:text-sm"
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
                      className="w-full font-bold py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
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
                  <div className="space-y-3.5">
                    {!otpSent ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Administrator Email
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              placeholder="Enter administrator email..."
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              autoComplete="email"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/15 focus:outline-none transition-all text-xs sm:text-sm"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          className="w-full font-bold py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                          size="lg"
                          onClick={handleSendOTP}
                          loading={loading}
                        >
                          <span>Send 2FA Code</span>
                          <ArrowRight className="w-4 h-4 text-[#F4C430]" />
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                          <span className="text-gray-700 font-medium">
                            Code sent to: <span className="font-mono font-bold text-[#071A3D]">{email}</span>
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
                          <label className="block text-xs font-bold text-gray-700 mb-1">
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
                            className="w-full font-bold py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                            size="lg"
                            onClick={() => handleVerifyOTP()}
                            loading={loading}
                            variant="gold"
                          >
                            <span>Verify &amp; Enter Portal</span>
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>

                          {otpCooldown > 0 ? (
                            <p className="text-center text-[11px] text-gray-500 font-medium">
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
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
              <span>© {new Date().getFullYear()} V.S.B. Engineering College</span>
              <span className="font-semibold text-gray-600">AI &amp; DS Portal</span>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer Credits */}
      <footer className="relative z-10 w-full py-3 text-center text-[11px] text-gray-500 border-t border-white/5">
        <span>V.S.B. Engineering College (Autonomous) · Accredited by NBA &amp; NAAC &apos;A&apos; Grade</span>
      </footer>

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