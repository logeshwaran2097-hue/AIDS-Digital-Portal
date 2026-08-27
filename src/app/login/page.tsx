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
  Settings,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

interface RoleConfig {
  id: 'student' | 'faculty' | 'hod' | 'admin'
  label: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  glowColor: string
  activeRing: string
  activeBadge: string
  buttonGradient: string
  titleColor: string
  badgeText: string
}

const roles: RoleConfig[] = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    gradient: 'from-blue-600 to-indigo-600',
    glowColor: 'shadow-blue-500/30',
    activeRing: 'ring-blue-500/40',
    activeBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    buttonGradient: 'from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25',
    titleColor: 'text-blue-600',
    badgeText: 'Student Authentication',
  },
  {
    id: 'faculty',
    label: 'Faculty',
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-600',
    glowColor: 'shadow-emerald-500/30',
    activeRing: 'ring-emerald-500/40',
    activeBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    buttonGradient: 'from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25',
    titleColor: 'text-emerald-600',
    badgeText: 'Faculty Authentication',
  },
  {
    id: 'hod',
    label: 'HOD',
    icon: Building2,
    gradient: 'from-purple-600 to-indigo-700',
    glowColor: 'shadow-purple-500/30',
    activeRing: 'ring-purple-500/40',
    activeBadge: 'bg-purple-50 text-purple-700 border-purple-200',
    buttonGradient: 'from-purple-600 via-indigo-700 to-purple-800 hover:from-purple-700 hover:to-indigo-800 shadow-purple-500/25',
    titleColor: 'text-purple-600',
    badgeText: 'HOD Authentication',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    gradient: 'from-amber-500 to-orange-600',
    glowColor: 'shadow-amber-500/30',
    activeRing: 'ring-amber-500/40',
    activeBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    buttonGradient: 'from-amber-500 via-orange-600 to-amber-600 hover:from-amber-600 hover:to-orange-700 shadow-orange-500/25',
    titleColor: 'text-amber-600',
    badgeText: 'Administrator 2FA',
  },
]

export default function LoginPage() {
  const [selectedRoleId, setSelectedRoleId] = React.useState<'student' | 'faculty' | 'hod' | 'admin'>('student')
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

  const currentRole = roles.find((r) => r.id === selectedRoleId) || roles[0]

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

      if (selectedRoleId === 'student') {
        endpoint = '/api/auth/student'
        payload = { registerNumber: registerNumber.trim(), password }
      } else if (selectedRoleId === 'faculty') {
        endpoint = '/api/auth/faculty'
        payload = { facultyId: facultyId.trim(), password }
      } else if (selectedRoleId === 'hod') {
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
      if (data.user?.mustChangePassword && (selectedRoleId === 'student' || selectedRoleId === 'faculty' || selectedRoleId === 'hod')) {
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
        window.location.href = dashboardMap[selectedRoleId]
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
          window.location.href = dashboardMap[selectedRoleId]
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
    window.location.href = dashboardMap[selectedRoleId]
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/60 px-4 py-8 sm:py-12 select-none">
      
      {/* ========================================================================= */}
      {/* COLORFUL ANIMATED BACKGROUND AMBIENCE */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Glowing Color Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/25 to-indigo-400/20 blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tr from-teal-400/25 via-emerald-400/20 to-cyan-400/20 blur-3xl animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-gradient-to-bl from-purple-400/20 to-pink-400/15 blur-3xl animate-pulse" style={{ animationDuration: '11s' }} />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-400/20 to-orange-400/15 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#071A3D 1px, transparent 1px), linear-gradient(to right, #071A3D 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* TOP INSTITUTION BRANDING WITH ANIMATIONS */}
      {/* ========================================================================= */}
      <div className="w-full max-w-md text-center mb-6 sm:mb-8 space-y-3 relative z-10">
        
        {/* Floating Glowing Emblem */}
        <div className="relative inline-flex mx-auto group">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400 via-indigo-500 to-teal-400 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-700 animate-spin" style={{ animationDuration: '15s' }} />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-2xl border-4 border-white p-1.5 flex items-center justify-center transform transition-transform duration-500 hover:scale-105">
            <Image
              src="/college-emblem.png"
              alt="V.S.B. Engineering College Emblem"
              width={100}
              height={100}
              className="w-full h-full object-contain rounded-full"
              priority
            />
          </div>
        </div>

        {/* Institution Title with Gradient Accent */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#071A3D] drop-shadow-xs">
            V.S.B. ENGINEERING COLLEGE
          </h1>
          <p className="text-xs sm:text-sm font-black tracking-wide uppercase bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
          </p>
          <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Academic Management &amp; Digital Portal</span>
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GLASSMORPHIC COLORFUL LOGIN CARD */}
      {/* ========================================================================= */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/80 p-6 sm:p-8 space-y-6 relative z-10 transition-all duration-300 hover:shadow-indigo-500/10">
        
        {/* SELECT YOUR ROLE SEGMENT WITH VIBRANT THEMES */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
              SELECT YOUR ROLE
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              Role: <span className="capitalize text-indigo-600 font-black">{selectedRoleId}</span>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {roles.map((role) => {
              const isSelected = selectedRoleId === role.id
              const Icon = role.icon
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRoleId(role.id)
                    setRegisterNumber('')
                    setPassword('')
                    setShowPassword(false)
                    setFacultyId('')
                    setEmail('')
                    setOtpSent(false)
                    setOtp('')
                  }}
                  className={cn(
                    'group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 px-1 text-xs font-bold transition-all duration-300 cursor-pointer overflow-hidden border',
                    isSelected
                      ? cn('bg-gradient-to-br text-white shadow-lg scale-105 border-transparent ring-2', role.gradient, role.glowColor, role.activeRing)
                      : 'bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:scale-[1.02]'
                  )}
                >
                  <Icon className={cn('w-5 h-5 transition-transform duration-300 group-hover:scale-110', isSelected ? 'text-white' : 'text-gray-600')} />
                  <span className="text-[11px] font-bold tracking-tight">{role.label}</span>
                  {isSelected && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white/80 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* DYNAMIC AUTHENTICATION FORM WITH ANIMATIONS */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          
          {/* STUDENT ROLE */}
          {selectedRoleId === 'student' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span>Student Authentication</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Register Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 922522AD001"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    required
                    autoComplete="username"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-mono font-bold text-gray-900 bg-white/90 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Password / Temporary Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-900 bg-white/90 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all pr-10 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none cursor-pointer transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  First time logging in? Use the temporary password given by Admin.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full font-bold py-3.5 px-4 rounded-xl text-white shadow-lg transition-all duration-300 cursor-pointer text-sm mt-2 flex items-center justify-center gap-2 transform active:scale-98 hover:scale-[1.01] bg-gradient-to-r',
                  currentRole.buttonGradient
                )}
              >
                <span>{loading ? 'Authenticating...' : 'Login to Student Portal'}</span>
                <ArrowRight className="w-4 h-4 text-white/90" />
              </button>
            </div>
          )}

          {/* FACULTY ROLE */}
          {selectedRoleId === 'faculty' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span>Faculty Authentication</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Faculty ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. FAC001"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    required
                    autoComplete="username"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-mono font-bold text-gray-900 bg-white/90 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Password / Temporary Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-900 bg-white/90 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all pr-10 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-600 focus:outline-none cursor-pointer transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  First time logging in? Use the temporary password given by Admin.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full font-bold py-3.5 px-4 rounded-xl text-white shadow-lg transition-all duration-300 cursor-pointer text-sm mt-2 flex items-center justify-center gap-2 transform active:scale-98 hover:scale-[1.01] bg-gradient-to-r',
                  currentRole.buttonGradient
                )}
              >
                <span>{loading ? 'Authenticating...' : 'Login to Faculty Portal'}</span>
                <ArrowRight className="w-4 h-4 text-white/90" />
              </button>
            </div>
          )}

          {/* HOD ROLE */}
          {selectedRoleId === 'hod' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-sm font-bold text-purple-700">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span>HOD Authentication</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  HOD Faculty Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. HOD001"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    required
                    autoComplete="username"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-mono font-bold text-gray-900 bg-white/90 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Password / Temporary Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-900 bg-white/90 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15 transition-all pr-10 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 focus:outline-none cursor-pointer transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  First time logging in? Use the temporary password given by Admin.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full font-bold py-3.5 px-4 rounded-xl text-white shadow-lg transition-all duration-300 cursor-pointer text-sm mt-2 flex items-center justify-center gap-2 transform active:scale-98 hover:scale-[1.01] bg-gradient-to-r',
                  currentRole.buttonGradient
                )}
              >
                <span>{loading ? 'Authenticating...' : 'Login to HOD Portal'}</span>
                <ArrowRight className="w-4 h-4 text-white/90" />
              </button>
            </div>
          )}

          {/* ADMIN ROLE */}
          {selectedRoleId === 'admin' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Administrator 2FA Authentication</span>
              </div>

              {!otpSent ? (
                <>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    Enter your registered institutional administrator email to receive a secure 2FA OTP code.
                  </p>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800">
                      Admin Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="admin@vsb.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-mono font-bold text-gray-900 bg-white/90 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 transition-all shadow-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className={cn(
                      'w-full font-bold py-3.5 px-4 rounded-xl text-white shadow-lg transition-all duration-300 cursor-pointer text-sm mt-2 flex items-center justify-center gap-2 transform active:scale-98 hover:scale-[1.01] bg-gradient-to-r',
                      currentRole.buttonGradient
                    )}
                  >
                    <span>{loading ? 'Sending OTP...' : 'Send 2FA Code'}</span>
                    <ArrowRight className="w-4 h-4 text-white/90" />
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                    <span className="text-amber-900 font-medium">
                      Code sent to: <span className="font-bold">{email}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false)
                        setOtp('')
                      }}
                      className="text-xs text-amber-700 font-bold hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
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

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleVerifyOTP()}
                      disabled={loading}
                      className={cn(
                        'w-full font-bold py-3.5 px-4 rounded-xl text-white shadow-lg transition-all duration-300 cursor-pointer text-sm flex items-center justify-center gap-2 transform active:scale-98 hover:scale-[1.01] bg-gradient-to-r',
                        currentRole.buttonGradient
                      )}
                    >
                      <span>{loading ? 'Verifying...' : 'Verify OTP & Enter Portal'}</span>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </button>

                    {otpCooldown > 0 ? (
                      <p className="text-center text-xs text-gray-500 font-medium">
                        Resend code in {otpCooldown}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="block w-full text-center text-xs font-bold text-amber-600 hover:underline cursor-pointer disabled:opacity-50"
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
                  className="font-bold flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
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