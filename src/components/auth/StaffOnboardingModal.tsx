'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Send,
  X,
  Lock,
  Mail,
  Phone,
  Pencil,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  Building2,
  BookOpen,
  Calendar,
  Award,
  Users,
  Briefcase,
  Layers,
  HelpCircle,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface StaffOnboardingModalProps {
  isOpen: boolean
  role: 'advisor' | 'faculty' | 'hod'
  onComplete: (updatedUser?: any) => void
  initialData: {
    name: string
    email: string
    phone?: string
    facultyId: string
    designation?: string
    qualification?: string
    experience?: number
    specialization?: string
    department?: string
    advisorBatch?: string | null
    advisorYear?: number | null
    advisorSem?: number | null
    advisorSec?: string | null
    subjects?: string | string[]
    dateOfBirth?: string | null
    profileImage?: string
  }
}

export function StaffOnboardingModal({
  isOpen,
  role,
  onComplete,
  initialData,
}: StaffOnboardingModalProps) {
  // Step 1: Review Profile & Departmental Allocation
  // Step 2: Email Verification & Permanent Password Setup
  // Step 3: Final Verification & Portal Activation
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [step3Confirmed, setStep3Confirmed] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    facultyId: initialData.facultyId || '',
    designation: initialData.designation || (role === 'hod' ? 'Professor & Head' : role === 'advisor' ? 'Class Advisor' : 'Assistant Professor'),
    qualification: initialData.qualification || (role === 'hod' ? 'Ph.D., M.Tech' : 'M.E. / M.Tech'),
    experience: initialData.experience || 5,
    specialization: initialData.specialization || 'Artificial Intelligence & Data Science',
    department: initialData.department || 'Artificial Intelligence & Data Science',
    cabin: 'Staff Room / Department Wing',
    dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '1988-06-15',
    advisorBatch: initialData.advisorBatch || '',
    hasCorrectionRequest: false,
    correctionRemarks: '',
    newPassword: '',
    confirmPassword: '',
    emailOtp: '',
  })

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0)
  const [demoOtp, setDemoOtp] = useState<string | null>(null)
  const [sendingOtp, setSendingOtp] = useState(false)

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: initialData.name || prev.name,
      email: initialData.email || prev.email,
      phone: initialData.phone || prev.phone,
      facultyId: initialData.facultyId || prev.facultyId,
      designation: initialData.designation || prev.designation,
      qualification: initialData.qualification || prev.qualification,
      experience: initialData.experience || prev.experience,
      specialization: initialData.specialization || prev.specialization,
      department: initialData.department || prev.department,
      advisorBatch: initialData.advisorBatch || prev.advisorBatch,
      dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : prev.dateOfBirth,
    }))
  }, [initialData])

  // Cooldown countdown
  useEffect(() => {
    if (emailOtpCooldown <= 0) return
    const timer = setInterval(() => {
      setEmailOtpCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [emailOtpCooldown])

  if (!isOpen) return null

  const roleTitle =
    role === 'hod'
      ? 'Head of Department'
      : role === 'advisor'
      ? 'Class Advisor & Student Mentor'
      : 'Faculty Member'

  const roleAccentColor =
    role === 'hod' ? 'from-amber-500 to-yellow-400' : role === 'advisor' ? 'from-[#1455D9] to-[#22C7E8]' : 'from-indigo-600 to-cyan-500'

  const roleBadgeBg =
    role === 'hod' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : role === 'advisor' ? 'bg-[#22C7E8]/20 text-[#22C7E8] border-[#22C7E8]/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!form.email || !form.email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }
    setSendingOtp(true)
    try {
      const res = await fetch('/api/auth/send-onboarding-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name,
          facultyId: form.facultyId,
          role,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEmailOtpSent(true)
        setEmailOtpCooldown(60)
        if (data.devOtp) {
          setDemoOtp(data.devOtp)
        }
        toast.success(`Verification code sent to ${form.email}`)
      } else {
        toast.error(data.message || 'Failed to send verification code')
      }
    } catch {
      toast.error('Network error sending OTP code')
    } finally {
      setSendingOtp(false)
    }
  }

  // Submit complete onboarding
  const handleSubmitOnboarding = async () => {
    if (!step3Confirmed) {
      toast.error('Please verify and confirm the onboarding details')
      return
    }
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        facultyId: form.facultyId,
        dateOfBirth: form.dateOfBirth,
        qualification: form.qualification,
        specialization: form.specialization,
        experience: Number(form.experience),
        advisorBatch: form.advisorBatch,
        classPeriod: form.cabin,
        department: form.department,
        role,
        newPassword: form.newPassword,
        emailOtp: form.emailOtp,
        correctionRemarks: form.hasCorrectionRequest ? form.correctionRemarks : undefined,
      }

      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Onboarding complete! Welcome to the portal.')
        onComplete(data.user)
      } else {
        toast.error(data.message || 'Failed to complete profile verification.')
      }
    } catch {
      toast.error('An unexpected error occurred while completing onboarding.')
    } finally {
      setLoading(false)
    }
  }

  // Parse subjects
  let parsedSubjects: string[] = []
  try {
    if (typeof initialData.subjects === 'string') {
      parsedSubjects = JSON.parse(initialData.subjects)
    } else if (Array.isArray(initialData.subjects)) {
      parsedSubjects = initialData.subjects
    }
  } catch {
    parsedSubjects = []
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#071A3D]/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#0B224E] border border-white/15 text-white shadow-2xl overflow-hidden transition-all duration-300">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C7E8]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1455D9]/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-inner">
                {role === 'hod' ? (
                  <Building2 className="w-6 h-6 text-amber-400" />
                ) : role === 'advisor' ? (
                  <Users className="w-6 h-6 text-[#22C7E8]" />
                ) : (
                  <GraduationCap className="w-6 h-6 text-indigo-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-[11px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide uppercase', roleBadgeBg)}>
                    {roleTitle}
                  </span>
                  <span className="text-xs text-gray-400">First-Time Setup</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Staff Onboarding &amp; Verification</h2>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Staff ID</span>
              <span className="text-sm font-black text-[#22C7E8]">{form.facultyId}</span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { step: 1, label: '1. Professional Profile' },
              { step: 2, label: '2. Security & Credentials' },
              { step: 3, label: '3. Verify & Activate' },
            ].map((s) => (
              <div
                key={s.step}
                className={cn(
                  'py-2 px-3 rounded-xl border text-center transition-all',
                  onboardingStep === s.step
                    ? 'bg-gradient-to-r from-[#1455D9]/40 to-[#22C7E8]/20 border-[#22C7E8]/60 text-white font-bold shadow-sm'
                    : onboardingStep > s.step
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-semibold'
                    : 'bg-white/5 border-white/10 text-gray-400 font-medium'
                )}
              >
                <p className="text-[11px] sm:text-xs truncate">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-5">
          {/* STEP 1: REVIEW DETAILS */}
          {onboardingStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#22C7E8] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300 leading-relaxed">
                  Welcome to the V.S.B. AI &amp; DS Portal. Please review your departmental designation, assigned batch/subjects, and provide your direct contact number and cabin location for campus coordination.
                </p>
              </div>

              {/* Role-Specific Highlight Card */}
              {role === 'advisor' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1455D9]/20 to-[#22C7E8]/10 border border-[#22C7E8]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#22C7E8]">Assigned Mentorship Batch</span>
                      <h3 className="text-lg font-black text-white mt-0.5">{form.advisorBatch || 'Year II - Sem 3 - Sec A'}</h3>
                      <p className="text-xs text-gray-300 mt-1">Class Advisor &amp; Academic Mentor for this enrolled cohort</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#22C7E8]/20 text-[#22C7E8] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {role === 'hod' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Department Leadership</span>
                      <h3 className="text-lg font-black text-white mt-0.5">{form.department}</h3>
                      <p className="text-xs text-gray-300 mt-1">Direct oversight across 4 Academic Years, Faculty members, and Department Labs</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {role === 'faculty' && parsedSubjects.length > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 border border-indigo-500/30">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">Allocated Courses &amp; Labs</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {parsedSubjects.map((sub, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs font-bold text-white">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#22C7E8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Official Staff ID</label>
                  <input
                    type="text"
                    value={form.facultyId}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#22C7E8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#22C7E8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Direct Mobile / WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98421 XXXXX"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#22C7E8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Cabin / Office Room</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={form.cabin}
                      onChange={(e) => setForm({ ...form, cabin: e.target.value })}
                      placeholder="e.g. Staff Room 2 - Cabin A-04"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#22C7E8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#22C7E8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Specialization / Domain</label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                      placeholder="e.g. Deep Learning & Cloud Computing"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#22C7E8]"
                    />
                  </div>
                </div>
              </div>

              {/* Administrative Correction Request */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.hasCorrectionRequest}
                    onChange={(e) => setForm({ ...form, hasCorrectionRequest: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-400 text-[#22C7E8] focus:ring-0"
                  />
                  <span className="text-xs text-gray-300">
                    Need administrative correction for department or batch assignment?
                  </span>
                </label>

                {form.hasCorrectionRequest && (
                  <textarea
                    rows={2}
                    value={form.correctionRemarks}
                    onChange={(e) => setForm({ ...form, correctionRemarks: e.target.value })}
                    placeholder="Describe any batch allocation or course correction for Registrar / Admin review..."
                    className="w-full mt-2 p-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder-gray-400 focus:outline-none focus:border-[#22C7E8]"
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PASSWORD & OTP */}
          {onboardingStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300 leading-relaxed">
                  To secure your staff account, verify your official email address and replace your temporary password with a permanent, confidential password.
                </p>
              </div>

              {/* Email Verification Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                  Official Communication Email
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. staff.ai@vsb.edu.in"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#22C7E8]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || emailOtpCooldown > 0}
                    className="px-4 py-2.5 rounded-xl bg-[#22C7E8] text-[#071A3D] font-bold text-xs hover:bg-[#1bb0ce] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {sendingOtp ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : emailOtpCooldown > 0 ? (
                      `${emailOtpCooldown}s`
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send OTP</span>
                      </>
                    )}
                  </button>
                </div>

                {emailOtpSent && (
                  <div className="space-y-2 pt-1 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enter 6-Digit OTP Code
                      </label>
                      {demoOtp && (
                        <button
                          type="button"
                          onClick={() => {
                            setForm({ ...form, emailOtp: demoOtp })
                            toast.success(`Autofilled demo OTP: ${demoOtp}`)
                          }}
                          className="text-[11px] font-bold text-[#22C7E8] hover:underline"
                        >
                          Auto-fill Code: {demoOtp}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={form.emailOtp}
                      onChange={(e) => setForm({ ...form, emailOtp: e.target.value.replace(/\D/g, '') })}
                      placeholder="• • • • • •"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-[#22C7E8]/50 text-white text-center font-mono text-lg tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-[#22C7E8]"
                    />
                    <p className="text-[11px] text-gray-400">
                      OTP sent via official SMTP. Master test bypass: <span className="font-mono text-gray-300">123456</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Password Setup */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">New Permanent Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#22C7E8] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#22C7E8] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
                  <p className="text-xs text-rose-400 font-medium">Passwords do not match.</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SUMMARY & ACTIVATE */}
          {onboardingStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Ready for Portal Activation</h4>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Please confirm your updated staff identity details below before entering your portal.
                  </p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/15 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Staff Identity</span>
                    <h3 className="text-base font-black text-white">{form.name}</h3>
                    <p className="text-xs text-[#22C7E8]">{form.designation}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Faculty ID</span>
                    <p className="text-sm font-mono font-bold text-white">{form.facultyId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Verified Email:</span>
                    <span className="font-semibold text-white">{form.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Contact Phone:</span>
                    <span className="font-semibold text-white">{form.phone || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Cabin / Office:</span>
                    <span className="font-semibold text-white">{form.cabin}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Department:</span>
                    <span className="font-semibold text-white">{form.department}</span>
                  </div>
                  {role === 'advisor' && (
                    <div className="col-span-2 p-2.5 rounded-xl bg-[#22C7E8]/10 border border-[#22C7E8]/20">
                      <span className="text-gray-300 block text-[11px]">Class Advisory:</span>
                      <span className="font-bold text-[#22C7E8] text-xs">{form.advisorBatch}</span>
                    </div>
                  )}
                  {form.newPassword && (
                    <div className="col-span-2 flex items-center gap-2 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Permanent password configured and encrypted.
                    </div>
                  )}
                </div>
              </div>

              {/* Mandatory Acceptance Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={step3Confirmed}
                  onChange={(e) => setStep3Confirmed(e.target.checked)}
                  className="w-4 h-4 rounded mt-0.5 border-gray-400 text-[#22C7E8] focus:ring-0"
                />
                <span className="text-xs text-gray-300 leading-relaxed">
                  I hereby confirm that the academic particulars and contact credentials provided above are accurate and official.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-5 sm:p-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          {onboardingStep > 1 ? (
            <button
              type="button"
              onClick={() => setOnboardingStep((prev) => (prev - 1) as any)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {onboardingStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (onboardingStep === 1) {
                  if (!form.name.trim()) {
                    toast.error('Please enter your full name')
                    return
                  }
                  setOnboardingStep(2)
                } else if (onboardingStep === 2) {
                  if (form.newPassword && form.newPassword.length < 6) {
                    toast.error('Password must be at least 6 characters long')
                    return
                  }
                  if (form.newPassword && form.newPassword !== form.confirmPassword) {
                    toast.error('Passwords do not match')
                    return
                  }
                  setOnboardingStep(3)
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb0ce] text-[#071A3D] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitOnboarding}
              disabled={loading || !step3Confirmed}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Portal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Activate Portal &amp; Enter</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
