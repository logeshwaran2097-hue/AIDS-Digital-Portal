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
  Sparkles,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

const roles = [
  {
    id: 'student',
    label: 'Student',
    description: 'Access your academic portal',
    icon: '🎓',
  },
  {
    id: 'faculty',
    label: 'Faculty',
    description: 'Manage teaching & content',
    icon: '📚',
  },
  {
    id: 'hod',
    label: 'HOD',
    description: 'Department management',
    icon: '🏛️',
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'System management',
    icon: '⚙️',
  },
]

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = React.useState('student')
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
        payload = { registerNumber, password }
      } else if (selectedRole === 'faculty') {
        endpoint = '/api/auth/faculty'
        payload = { facultyId, password }
      } else if (selectedRole === 'hod') {
        endpoint = '/api/auth/hod'
        payload = { facultyId, password }
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
        toast.success('Welcome! Please complete your profile and set a permanent password.')
        return
      }

      toast.success('Login successful!')
      const dashboardMap: Record<string, string> = {
        student: '/dashboard',
        faculty: '/faculty-dashboard',
        hod: '/hod-dashboard',
      }
      setTimeout(() => {
        window.location.href = dashboardMap[selectedRole]
      }, 300)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Onboarding Completion Submit
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
        toast.success('Profile details and permanent password saved!')
        setShowOnboardingModal(false)
        const dashboardMap: Record<string, string> = {
          student: '/dashboard',
          faculty: '/faculty-dashboard',
          hod: '/hod-dashboard',
        }
        setTimeout(() => {
          window.location.href = dashboardMap[selectedRole]
        }, 400)
      } else {
        toast.error(data.message || 'Failed to save profile.')
      }
    } catch {
      toast.error('Network error saving profile.')
    } finally {
      setOnboardingLoading(false)
    }
  }

  // Skip Onboarding for now
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
    if (!email) {
      toast.error('Please enter your admin email address')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
      toast.success(data.message || 'OTP sent to your registered email.')
      setOtpCooldown(60)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (customOtp?: string) => {
    const codeToVerify = typeof customOtp === 'string' ? customOtp : otp
    if (!codeToVerify || codeToVerify.length !== 6) {
      toast.error('Please enter the full 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: codeToVerify, challenge }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Invalid or expired OTP.')
        return
      }
      toast.success('Admin login successful!')
      setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 300)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Demo auto-fill helper
  const handleFillDemo = (role: string) => {
    setSelectedRole(role)
    if (role === 'student') {
      setRegisterNumber('922522AD001')
      setPassword('student123')
    } else if (role === 'faculty') {
      setFacultyId('FAC001')
      setPassword('faculty123')
    } else if (role === 'hod') {
      setFacultyId('HOD001')
      setPassword('hod123')
    } else if (role === 'admin') {
      setEmail('admin@vsb.edu.in')
    }
    toast.success(`Demo credentials filled for ${role.toUpperCase()}!`)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#030917] via-[#071A3D] to-[#0a255c] p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none">
      {/* Background Neural Glow & Grid Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1455D9]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#F4C430]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#22C7E8]/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Main Dual-Pane / Glass Container */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_25px_60px_-15px_rgba(7,26,61,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Side: Institutional Hero Banner (Desktop lg+) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#071A3D] via-[#0A2352] to-[#1455D9] p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-[#F4C430]/10 rounded-full blur-2xl" />
          
          <div className="space-y-6 relative z-10">
            {/* Top Emblem & Brand */}
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-lg border-2 border-[#F4C430]/50 shrink-0 flex items-center justify-center">
                <Image
                  src="/college-emblem.png"
                  alt="V.S.B. Engineering College Emblem"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                  V.S.B. ENGINEERING COLLEGE
                </h1>
                <p className="text-[11px] font-bold text-[#F4C430] uppercase tracking-wider">
                  Autonomous · Karur
                </p>
              </div>
            </div>

            {/* Department Title */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 shadow-inner">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1455D9]/40 border border-[#22C7E8]/40 text-[9.5px] font-black uppercase text-[#22C7E8] tracking-wider">
                <Sparkles className="w-3 h-3 text-[#F4C430]" /> Official Department Portal
              </div>
              <h2 className="text-sm sm:text-base font-black text-white leading-snug">
                Department of Artificial Intelligence &amp; Data Science
              </h2>
              <p className="text-[11px] text-gray-300">
                Unified Autonomous Academic, Attendance, Examination &amp; Faculty Governance Engine.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2.5 pt-2 hidden sm:block">
              {[
                { icon: '⚡', title: 'Autonomous Attendance & Criteria', desc: 'Real-time 75% cutoff & condonation tracking' },
                { icon: '🤖', title: 'AI-Powered Department Assistant', desc: 'Instant live queries on subjects & syllabus' },
                { icon: '🔔', title: 'Real-Time Multi-Tone Notifications', desc: 'Mobile push, audio chimes & haptics' },
                { icon: '🔒', title: 'Role-Based 2FA Governance', desc: 'Student, Faculty, HOD & Admin Portals' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-base shrink-0 leading-none mt-0.5">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[10px] text-gray-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Accreditation Badges */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-300 font-semibold relative z-10">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F4C430]" /> NBA Tier-1 &amp; NAAC &apos;A&apos;
            </span>
            <span className="text-gray-400">Anna University Affiliated</span>
          </div>
        </div>

        {/* Right Side: Interactive Login Form Pane */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div className="space-y-6">
            {/* Header Title & Quick Demo Fill */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#071A3D] tracking-tight">
                  Welcome to Portal
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Select your role to sign in to your digital dashboard
                </p>
              </div>

              {/* Quick Demo Fill Buttons */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-gray-400 uppercase mr-1 hidden sm:inline">Demo:</span>
                <button
                  type="button"
                  onClick={() => handleFillDemo('student')}
                  className="px-2 py-1 rounded-lg bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-[10px] font-bold border border-blue-200 cursor-pointer transition-all shadow-2xs"
                  title="Auto-fill Student demo login"
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('faculty')}
                  className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-[10px] font-bold border border-purple-200 cursor-pointer transition-all shadow-2xs"
                  title="Auto-fill Faculty demo login"
                >
                  📚 Faculty
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin')}
                  className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-[10px] font-bold border border-amber-200 cursor-pointer transition-all shadow-2xs"
                  title="Auto-fill Admin demo login"
                >
                  ⚙️ Admin
                </button>
              </div>
            </div>

            {/* 4 Role Selector Tabs */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-4 gap-2">
                {roles.map((role) => {
                  const isSelected = selectedRole === role.id
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id)
                        setRegisterNumber('')
                        setPassword('')
                        setShowPassword(false)
                        setFacultyId('')
                        setEmail('')
                        setOtpSent(false)
                        setOtp('')
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-2xl p-3 text-xs transition-all duration-200 cursor-pointer font-bold relative overflow-hidden',
                        isSelected
                          ? 'bg-[#071A3D] text-white shadow-md ring-2 ring-[#071A3D] scale-[1.02]'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80 hover:border-gray-300'
                      )}
                    >
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#F4C430]" />
                      )}
                      <span className="text-xl leading-none" aria-hidden="true">
                        {role.icon}
                      </span>
                      <span className="text-[11px] font-bold">{role.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Dynamic Role Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {/* STUDENT ROLE */}
              {selectedRole === 'student' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-black text-[#071A3D] pb-1 border-b border-gray-100">
                    <UserIcon className="w-4 h-4 text-[#1455D9]" />
                    <span>Student Portal Authentication</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071A3D] mb-1">
                      Register Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 922522AD001"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071A3D] mb-1">
                      Password / Temporary Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all pr-10 text-xs sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      First time logging in? Use the default password assigned by Administrator.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-black py-3 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-md transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                    size="lg"
                    loading={loading}
                  >
                    <span>Login to Student Portal</span>
                    <ArrowRight className="w-4 h-4 text-[#F4C430]" />
                  </Button>
                </div>
              )}

              {/* FACULTY ROLE */}
              {selectedRole === 'faculty' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-black text-[#071A3D] pb-1 border-b border-gray-100">
                    <Lock className="w-4 h-4 text-[#1455D9]" />
                    <span>Faculty Directorate Authentication</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071A3D] mb-1">
                      Faculty ID *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FAC001"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071A3D] mb-1">
                      Password / Temporary Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter faculty password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all pr-10 text-xs sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-black py-3 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-md transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                    size="lg"
                    loading={loading}
                  >
                    <span>Login to Faculty Portal</span>
                    <ArrowRight className="w-4 h-4 text-[#F4C430]" />
                  </Button>
                </div>
              )}

              {/* HOD ROLE */}
              {selectedRole === 'hod' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-black text-[#071A3D] pb-1 border-b border-gray-100">
                    <Lock className="w-4 h-4 text-[#1455D9]" />
                    <span>Head of Department (HOD) Authentication</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071A3D] mb-1">
                      HOD Faculty ID *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HOD001"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071A3D] mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter HOD password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all pr-10 text-xs sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-black py-3 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-md transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                    size="lg"
                    loading={loading}
                  >
                    <span>Login to HOD Portal</span>
                    <ArrowRight className="w-4 h-4 text-[#F4C430]" />
                  </Button>
                </div>
              )}

              {/* ADMIN ROLE (2FA) */}
              {selectedRole === 'admin' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                    <span className="flex items-center gap-1.5 text-xs font-black text-[#071A3D]">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      System Administrator 2FA Portal
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                      2FA Protected
                    </span>
                  </div>

                  {!otpSent ? (
                    <>
                      <p className="text-[11px] text-gray-500">
                        Enter your registered institutional administrator email to receive an instant verification OTP.
                      </p>
                      <div>
                        <label className="block text-xs font-bold text-[#071A3D] mb-1">
                          Admin Email Address *
                        </label>
                        <input
                          type="email"
                          placeholder="admin@vsb.edu.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-mono font-bold text-gray-900 bg-white focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all text-xs sm:text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        className="w-full font-black py-3 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-md transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                        size="lg"
                        onClick={handleSendOTP}
                        loading={loading}
                      >
                        <span>Send 2FA Verification OTP</span>
                        <ArrowRight className="w-4 h-4 text-[#F4C430]" />
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                        <span className="text-[#1455D9] font-bold">
                          OTP Dispatched to: <span className="font-mono">{email}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false)
                            setOtp('')
                          }}
                          className="text-[11px] text-gray-500 hover:text-[#071A3D] underline cursor-pointer font-bold"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#071A3D] mb-1">
                          Enter 6-Digit OTP Code *
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
                          className="w-full font-black py-3 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white shadow-md transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                          size="lg"
                          onClick={() => handleVerifyOTP()}
                          loading={loading}
                          variant="gold"
                        >
                          <span>Verify &amp; Enter Admin Portal</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>

                        {otpCooldown > 0 ? (
                          <p className="text-center text-[11px] text-gray-500 font-semibold">
                            Resend code in {otpCooldown}s
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="block w-full text-center text-xs font-bold text-[#1455D9] hover:underline cursor-pointer disabled:opacity-50"
                          >
                            Resend 2FA OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Footer Info */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
            <span>© {new Date().getFullYear()} V.S.B. Engineering College</span>
            <span className="font-bold text-[#1455D9]">AI &amp; DS Dept Portal</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ONBOARDING & PROFILE COMPLETION MODAL (FIRST TIME LOGIN) */}
      {/* ========================================================================= */}
      {showOnboardingModal && onboardingUser && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up border border-gray-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-black uppercase tracking-wider border border-blue-200">
                  First-Time Account Setup
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {onboardingUser.registerNumber || onboardingUser.facultyId}
                </span>
              </div>
              <h3 className="text-xl font-black text-[#071A3D] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F4C430]" />
                Complete Your Profile Details
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Your account was created by Admin with a temporary password. Please set your permanent secure password and fill in your remaining details.
              </p>
            </div>

            <form onSubmit={handleCompleteOnboarding} className="space-y-4 text-xs">
              {/* Permanent Password Setup */}
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
                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-[#071A3D] focus:border-[#1455D9] focus:outline-none pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Details Fields */}
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
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#1455D9]" />
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={onboardingForm.phone}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#1455D9]" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={onboardingForm.dateOfBirth}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, dateOfBirth: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#1455D9]" />
                    Personal / Preferred Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. personal.email@gmail.com"
                    value={onboardingForm.email}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-medium text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>

                {/* Extra fields if Faculty */}
                {selectedRole === 'faculty' && (
                  <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2.5">
                    <span className="font-bold text-purple-900 text-xs block">
                      Faculty Academic Particulars:
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-bold text-gray-600 text-[10px] mb-0.5">Highest Qualification</label>
                        <input
                          type="text"
                          placeholder="e.g. M.E., Ph.D."
                          value={onboardingForm.qualification}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, qualification: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-medium text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-600 text-[10px] mb-0.5">Specialization Domain</label>
                        <input
                          type="text"
                          placeholder="e.g. Deep Learning, NLP"
                          value={onboardingForm.specialization}
                          onChange={(e) => setOnboardingForm({ ...onboardingForm, specialization: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-medium text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
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
                  className="font-bold flex items-center gap-1.5"
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