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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] px-4 py-8 sm:py-12 select-none font-sans">
      
      {/* Centered Top Branding Section */}
      <div className="w-full max-w-[420px] text-center mb-6 sm:mb-8 space-y-2.5">
        
        {/* Emblem with Golden Glow */}
        <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-xl border-4 border-[#f6c343]/40 p-1.5 mx-auto">
          <Image
            src="/college-emblem.png"
            alt="V.S.B. Engineering College Emblem"
            width={100}
            height={100}
            className="w-full h-full object-contain rounded-full"
            priority
          />
        </div>

        {/* Institution Title */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1a3d] tracking-tight">
            V.S.B. ENGINEERING COLLEGE
          </h1>
          <p className="text-xs sm:text-[13px] font-bold text-[#1d4ed8] tracking-wide uppercase">
            DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Academic Management &amp; Digital Portal
          </p>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-7 space-y-5">
        
        {/* SELECT YOUR ROLE */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
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
                'flex flex-col items-center justify-center gap-1 rounded-2xl py-3 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border',
                selectedRole === 'student'
                  ? 'bg-[#0b1a3d] text-white border-[#0b1a3d] shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              )}
            >
              <span className="text-lg">🎓</span>
              <span className="text-[11px] font-bold">Student</span>
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
                'flex flex-col items-center justify-center gap-1 rounded-2xl py-3 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border',
                selectedRole === 'faculty'
                  ? 'bg-[#0b1a3d] text-white border-[#0b1a3d] shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              )}
            >
              <span className="text-lg">📚</span>
              <span className="text-[11px] font-bold">Faculty</span>
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
                'flex flex-col items-center justify-center gap-1 rounded-2xl py-3 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border',
                selectedRole === 'hod'
                  ? 'bg-[#0b1a3d] text-white border-[#0b1a3d] shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              )}
            >
              <span className="text-lg">🏛️</span>
              <span className="text-[11px] font-bold">HOD</span>
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
                'flex flex-col items-center justify-center gap-1 rounded-2xl py-3 px-1 text-xs font-bold transition-all duration-200 cursor-pointer border',
                selectedRole === 'admin'
                  ? 'bg-[#0b1a3d] text-white border-[#0b1a3d] shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              )}
            >
              <span className="text-lg">⚙️</span>
              <span className="text-[11px] font-bold">Admin</span>
            </button>

          </div>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          
          {/* 1. STUDENT AUTHENTICATION */}
          {selectedRole === 'student' && (
            <>
              <div className="flex items-center gap-2 text-sm font-bold text-[#0b1a3d]">
                <UserIcon className="w-4 h-4 text-[#1d4ed8]" />
                <span>Student Authentication</span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0b1a3d]">
                  Register Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 922522AD001"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0b1a3d]">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent transition-all pr-10 placeholder:text-slate-400"
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
                <p className="text-[11px] text-slate-400 mt-1">
                  First time logging in? Use the temporary password given by Admin.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full font-bold py-3.5 px-4 rounded-xl text-white bg-[#0b1a3d] hover:bg-[#142854] shadow-md transition-all duration-200 cursor-pointer text-sm mt-2 text-center"
              >
                {loading ? 'Logging in...' : 'Login to Student Portal'}
              </button>
            </>
          )}

          {/* 2. FACULTY AUTHENTICATION */}
          {selectedRole === 'faculty' && (
            <>
              <div className="flex items-center gap-2 text-sm font-bold text-[#0b1a3d]">
                <Lock className="w-4 h-4 text-[#1d4ed8]" />
                <span>Faculty Authentication</span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0b1a3d]">
                  Faculty ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. FAC001"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0b1a3d]">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent transition-all pr-10 placeholder:text-slate-400"
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
                <p className="text-[11px] text-slate-400 mt-1">
                  First time logging in? Use the temporary password given by Admin.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full font-bold py-3.5 px-4 rounded-xl text-white bg-[#0b1a3d] hover:bg-[#142854] shadow-md transition-all duration-200 cursor-pointer text-sm mt-2 text-center"
              >
                {loading ? 'Logging in...' : 'Login to Faculty Portal'}
              </button>
            </>
          )}

          {/* 3. HOD AUTHENTICATION */}
          {selectedRole === 'hod' && (
            <>
              <div className="flex items-center gap-2 text-sm font-bold text-[#0b1a3d]">
                <Lock className="w-4 h-4 text-[#1d4ed8]" />
                <span>HOD Authentication</span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0b1a3d]">
                  Faculty ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. HOD001"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0b1a3d]">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent transition-all pr-10 placeholder:text-slate-400"
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
                <p className="text-[11px] text-slate-400 mt-1">
                  First time logging in? Use the temporary password given by Admin.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full font-bold py-3.5 px-4 rounded-xl text-white bg-[#0b1a3d] hover:bg-[#142854] shadow-md transition-all duration-200 cursor-pointer text-sm mt-2 text-center"
              >
                {loading ? 'Logging in...' : 'Login to HOD Portal'}
              </button>
            </>
          )}

          {/* 4. ADMIN 2FA AUTHENTICATION */}
          {selectedRole === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0b1a3d]">
                <ShieldCheck className="w-4 h-4 text-[#1d4ed8]" />
                <span>Administrator Authentication</span>
              </div>

              {!otpSent ? (
                <>
                  <p className="text-xs text-slate-500">
                    Enter your registered institutional email to receive a secure 2FA OTP.
                  </p>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0b1a3d]">
                      Admin Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="admin@vsb.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full font-bold py-3.5 px-4 rounded-xl text-white bg-[#0b1a3d] hover:bg-[#142854] shadow-md transition-all duration-200 cursor-pointer text-sm mt-2 text-center"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#1d4ed8]">
                      OTP sent to: <span className="font-bold">{email}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false)
                        setOtp('')
                      }}
                      className="text-xs text-slate-400 hover:text-[#0b1a3d] underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1a3d] mb-1">
                      Enter 6-digit OTP
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
                      className="w-full font-bold py-3.5 px-4 rounded-xl text-white bg-[#0b1a3d] hover:bg-[#142854] shadow-md transition-all duration-200 cursor-pointer text-sm text-center"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP & Login'}
                    </button>

                    {otpCooldown > 0 ? (
                      <p className="text-center text-xs text-slate-500 font-medium">
                        Resend OTP in {otpCooldown}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="block w-full text-center text-xs font-bold text-[#1d4ed8] hover:underline cursor-pointer disabled:opacity-50"
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
                  className="font-bold flex items-center gap-1.5 bg-[#0b1a3d] hover:bg-[#142854] text-white"
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