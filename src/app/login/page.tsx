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

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#071A3D] text-[#F4C430] mb-4 shadow-xl border-2 border-[#F4C430]/30 p-2">
            <Image
              src="/logo.jpg"
              alt="VSB Logo"
              width={70}
              height={70}
              className="rounded-full object-cover"
              priority
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071A3D] tracking-tight">
            V.S.B. ENGINEERING COLLEGE
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#1455D9] tracking-wide uppercase">
            Department of Artificial Intelligence &amp; Data Science
          </p>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            Academic Management &amp; Digital Portal
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-4 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id)
                      setRegisterNumber('')
                      setDateOfBirth('')
                      setFacultyId('')
                      setEmail('')
                      setOtpSent(false)
                      setOtp('')
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl p-2.5 text-xs transition-all duration-200 cursor-pointer font-medium',
                      selectedRole === role.id
                        ? 'bg-[#071A3D] text-white ring-2 ring-[#071A3D] shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    )}
                  >
                    <span className="text-xl leading-none" aria-hidden="true">{role.icon}</span>
                    <span className="font-semibold">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedRole === 'student' && (
                <>
                  <h3 className="text-base font-bold text-[#071A3D] mb-2">Student Authentication</h3>
                  <Input
                    label="Register Number"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    required
                    autoComplete="username"
                  />
                  <Input
                    label="Date of Birth"
                    type="text"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    autoComplete="bday"
                    hint="Format: DD/MM/YYYY"
                  />
                  <Button type="submit" className="w-full font-bold" size="lg" loading={loading}>
                    Login to Student Portal
                  </Button>
                </>
              )}

              {selectedRole === 'faculty' && (
                <>
                  <h3 className="text-base font-bold text-[#071A3D] mb-2">Faculty Authentication</h3>
                  <Input
                    label="Faculty ID"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    required
                    autoComplete="username"
                  />
                  <Input
                    label="Date of Birth"
                    type="text"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    autoComplete="bday"
                    hint="Format: DD/MM/YYYY"
                  />
                  <Button type="submit" className="w-full font-bold" size="lg" loading={loading}>
                    Login to Faculty Portal
                  </Button>
                </>
              )}

              {selectedRole === 'hod' && (
                <>
                  <h3 className="text-base font-bold text-[#071A3D] mb-2">HOD Authentication</h3>
                  <Input
                    label="Faculty ID"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    required
                    autoComplete="username"
                  />
                  <Input
                    label="Date of Birth"
                    type="text"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    autoComplete="bday"
                    hint="Format: DD/MM/YYYY"
                  />
                  <Button type="submit" className="w-full font-bold" size="lg" loading={loading}>
                    Login to HOD Portal
                  </Button>
                </>
              )}

              {selectedRole === 'admin' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#071A3D] mb-2">Administrator Authentication</h3>
                  {!otpSent ? (
                    <>
                      <p className="text-xs text-gray-500 mb-3">
                        Enter your registered institutional email to receive a secure 2FA OTP.
                      </p>
                      <Input
                        label="Admin Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                      <Button type="button" className="w-full font-bold" size="lg" onClick={handleSendOTP} loading={loading}>
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