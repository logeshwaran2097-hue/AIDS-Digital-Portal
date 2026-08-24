'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OTPInput } from '@/components/ui/OTPInput'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

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
  const [dateOfBirth, setDateOfBirth] = React.useState('')
  const [facultyId, setFacultyId] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [challenge, setChallenge] = React.useState('')
  const [otpSent, setOtpSent] = React.useState(false)
  const [otpCooldown, setOtpCooldown] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
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
        payload = { registerNumber, dateOfBirth }
      } else if (selectedRole === 'faculty') {
        endpoint = '/api/auth/faculty'
        payload = { facultyId, dateOfBirth }
      } else if (selectedRole === 'hod') {
        endpoint = '/api/auth/hod'
        payload = { facultyId, dateOfBirth }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Login failed')
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

  const handleSendOTP = async () => {
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

  return (
    <div className="min-h-screen bg-navy">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" aria-hidden="true" />
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left brand panel */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-navy via-[#0A2A5E] to-royal p-10">
          <div className="max-w-md text-center space-y-6">
            <div className="flex items-center justify-center">
              <div className="p-3 rounded-full bg-white shadow-2xl ring-4 ring-white/30">
                <Image src="/college-emblem.png" alt="V.S.B. Engineering College Official Emblem" width={130} height={130} className="rounded-full object-contain drop-shadow-md" priority />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Artificial Intelligence &amp; Data Science</h1>
            <p className="text-lg text-gray-200">V.S.B. Engineering College, Karur, Tamil Nadu, India</p>
            <div className="flex items-center gap-3 justify-center">
              <span className="inline-block rounded-full bg-gold/20 px-4 py-1.5 text-sm font-semibold text-gold">Academic Portal</span>
              <span className="inline-block rounded-full bg-cyan/20 px-4 py-1.5 text-sm font-semibold text-cyan">AI Powered</span>
            </div>
          </div>
        </div>

        {/* Right login panel */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
            <div className="flex items-center justify-center gap-3.5 mb-6">
              <Image src="/college-emblem.png" alt="V.S.B. Official Emblem" width={52} height={52} className="rounded-full object-contain shadow-sm" />
              <div>
                <h2 className="text-lg font-bold text-navy leading-tight">V.S.B. Engineering College</h2>
                <p className="text-xs text-royal font-semibold">AI &amp; DS Digital Portal</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6" role="tablist" aria-label="Select your role">
              {roles.map((role) => (
                <button
                  key={role.id}
                  role="tab"
                  aria-selected={selectedRole === role.id}
                  aria-label={`Login as ${role.label}`}
                  onClick={() => {
                    setSelectedRole(role.id)
                    setOtpSent(false)
                    setOtp('')
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg p-2 text-xs transition-all duration-200',
                    selectedRole === role.id
                      ? 'bg-royal text-white border-2 border-royal'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                  )}
                >
                  <span className="text-xl leading-none" aria-hidden="true">{role.icon}</span>
                  <span className="font-medium">{role.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedRole === 'student' && (
                <>
                  <h3 className="text-lg font-semibold text-navy mb-2">Student Login</h3>
                  <Input
                    label="Register Number"
                    placeholder="e.g. 23AD001"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    required
                    autoComplete="username"
                  />
                  <Input
                    label="Date of Birth"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    autoComplete="bday"
                    hint="Enter your date of birth in DD/MM/YYYY format"
                  />
                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    Login to Student Portal
                  </Button>
                </>
              )}

              {selectedRole === 'faculty' && (
                <>
                  <h3 className="text-lg font-semibold text-navy mb-2">Faculty Login</h3>
                  <Input
                    label="Faculty ID"
                    placeholder="e.g. FAC-001"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    required
                    autoComplete="username"
                  />
                  <Input
                    label="Date of Birth"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    autoComplete="bday"
                    hint="Enter your date of birth in DD/MM/YYYY format"
                  />
                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    Login to Faculty Portal
                  </Button>
                </>
              )}

              {selectedRole === 'hod' && (
                <>
                  <h3 className="text-lg font-semibold text-navy mb-2">HOD Login</h3>
                  <Input
                    label="Faculty ID"
                    placeholder="e.g. HOD-001"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    required
                    autoComplete="username"
                  />
                  <Input
                    label="Date of Birth"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    autoComplete="bday"
                    hint="Enter your date of birth in DD/MM/YYYY format"
                  />
                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    Login to HOD Portal
                  </Button>
                </>
              )}

              {selectedRole === 'admin' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy mb-2">Admin Login</h3>
                  {!otpSent ? (
                    <>
                      <p className="text-sm text-gray-500 mb-4">
                        You will receive a secure OTP on your registered email address.
                      </p>
                      <Input
                        label="Admin Email"
                        type="email"
                        placeholder="admin@vsb.edu.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                      <Button type="button" className="w-full" size="lg" onClick={handleSendOTP} loading={loading}>
                        Send OTP
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-[#1455D9]">
                          OTP sent to: <span className="font-bold">{email}</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtp(''); }}
                          className="text-xs text-gray-400 hover:text-[#071A3D] underline"
                        >
                          Change
                        </button>
                      </div>
                      <label className="block text-xs font-bold text-[#071A3D] mb-1">
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
                      <div className="mt-4 space-y-2">
                        <Button
                          type="button"
                          className="w-full font-bold"
                          size="lg"
                          onClick={() => handleVerifyOTP()}
                          loading={loading}
                          variant="gold"
                        >
                          Verify OTP &amp; Login
                        </Button>
                        {otpCooldown > 0 ? (
                          <p className="text-center text-xs text-gray-500 font-medium">
                            Resend OTP in {otpCooldown}s
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="block w-full text-center text-xs font-bold text-[#1455D9] hover:underline disabled:opacity-50"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}