'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface StudentOnboardingModalProps {
  isOpen: boolean
  onComplete: (updatedUser: any) => void
  initialData: {
    name: string
    email: string
    phone?: string
    registerNumber: string
    department: string
    year: number
    semester: number
    section: string
    dateOfBirth?: string
    advisorName?: string
    batch?: string
    parentPhone?: string
  }
}

export function StudentOnboardingModal({
  isOpen,
  onComplete,
  initialData,
}: StudentOnboardingModalProps) {
  // Steps: 1: Review Academic Details -> 2: Set Password & Email OTP Verification
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)

  // Form State
  const [form, setForm] = useState({
    phone: initialData.phone || '',
    parentPhone: initialData.parentPhone || '',
    dateOfBirth: initialData.dateOfBirth || '',
    isParentWhatsapp: false,
    bloodGroup: '',
    residencyStatus: '',
    busNo: '',
    boardingPoint: '',
    hostelBlock: '',
    roomNo: '',
    hasCorrectionRequest: false,
    correctionRemarks: '',
    detailsConfirmed: false,
    email:
      initialData.email && !initialData.email.endsWith('@student.vsb.edu.in')
        ? initialData.email
        : '',
    newPassword: '',
    confirmPassword: '',
    emailOtp: '',
  })

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0)
  const [demoOtp, setDemoOtp] = useState<string | null>(null)

  // Sync state whenever initialData changes
  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      phone: initialData.phone || prev.phone,
      parentPhone: initialData.parentPhone || prev.parentPhone,
      dateOfBirth: initialData.dateOfBirth || prev.dateOfBirth,
      email:
        initialData.email && !initialData.email.endsWith('@student.vsb.edu.in')
          ? initialData.email
          : prev.email,
    }))
  }, [initialData.phone, initialData.parentPhone, initialData.email, initialData.dateOfBirth])

  // Cooldown countdown timer
  React.useEffect(() => {
    if (emailOtpCooldown <= 0) return
    const timer = setInterval(() => setEmailOtpCooldown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [emailOtpCooldown])

  // Correction Modal state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionCategory, setCorrectionCategory] = useState('name')
  const [requestedValue, setRequestedValue] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false)
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false)

  if (!isOpen) return null

  // STEP 1 -> STEP 2: Proceed to Security Step
  const handleProceedToSecurityStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone.trim()) {
      toast.error('Please enter your personal mobile number.')
      return
    }
    if (!form.parentPhone.trim()) {
      toast.error('Please enter parent/guardian mobile number.')
      return
    }
    if (!form.detailsConfirmed) {
      toast.error('Please confirm that you have reviewed your student details.')
      return
    }
    setOnboardingStep(2)
  }

  // Send Email OTP
  const handleSendEmailOTP = async () => {
    if (!form.email.trim() || !form.email.includes('@')) {
      toast.error('Please enter a valid personal email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          name: initialData.name,
          regNo: initialData.registerNumber,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setEmailOtpSent(true)
        setEmailOtpCooldown(60)
        if (data.demoOtp) {
          setDemoOtp(data.demoOtp)
        }
        toast.success(`Verification OTP sent to ${form.email.trim()}`)
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch {
      toast.error('Network error sending OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // STEP 2: Complete Onboarding & Activate Account
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.newPassword || form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New password and confirm password do not match.')
      return
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }
    if (!emailOtpSent) {
      toast.error('Please click "Send OTP" to receive your verification code.')
      return
    }
    if (!form.emailOtp || form.emailOtp.trim().length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: initialData.name,
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          parentPhone: form.parentPhone.trim(),
          dateOfBirth: form.dateOfBirth,
          isParentWhatsapp: form.isParentWhatsapp,
          bloodGroup: form.bloodGroup,
          residencyStatus: form.residencyStatus,
          busNo: form.busNo,
          boardingPoint: form.boardingPoint,
          hostelBlock: form.hostelBlock,
          roomNo: form.roomNo,
          newPassword: form.newPassword.trim(),
          otp: form.emailOtp.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Account fully verified & Password saved!')
        setTimeout(() => {
          onComplete(data.user || {})
        }, 600)
      } else {
        toast.error(data.message || 'Invalid or expired OTP. Please try again.')
      }
    } catch {
      toast.error('Network error completing verification.')
    } finally {
      setLoading(false)
    }
  }

  // Send Correction Request to Admin
  const handleSendCorrectionRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedValue.trim() || !correctionReason.trim()) {
      toast.error('Please fill in all correction details.')
      return
    }

    setCorrectionSubmitting(true)
    try {
      const res = await fetch('/api/students/profile-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerNumber: initialData.registerNumber,
          studentName: initialData.name,
          requestedData: { [correctionCategory]: requestedValue.trim() },
          currentData: {
            name: initialData.name,
            department: initialData.department,
            year: initialData.year,
            semester: initialData.semester,
            section: initialData.section,
          },
          reason: `Correction requested for ${correctionCategory.toUpperCase()}: ${correctionReason.trim()}`,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setCorrectionSubmitted(true)
        toast.success('Correction request submitted to Admin!')
      } else {
        toast.error(data.message || 'Failed to submit correction request.')
      }
    } catch {
      toast.error('Network error submitting request.')
    } finally {
      setCorrectionSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#071A41]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 border border-gray-100 max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Header with Progress Step Indicator (Exact Match with Image 1) */}
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1557C0] text-[10px] font-black uppercase tracking-wider">
              INITIAL PROFILE VERIFICATION &amp; SECURITY SETUP
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              {initialData.registerNumber}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-[#071A41]">
              {onboardingStep === 1 ? 'Step 1: Review Your Academic Details' : 'Step 2: Password & Email OTP Verification'}
            </h3>
            <span className="text-xs font-black text-[#1557C0] bg-blue-50 px-2.5 py-1 rounded-xl">
              Step {onboardingStep} of 2
            </span>
          </div>

          {/* Visual Step Bar */}
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <div className={cn('h-1.5 rounded-full transition-all', onboardingStep >= 1 ? 'bg-[#1557C0]' : 'bg-gray-200')} />
            <div className={cn('h-1.5 rounded-full transition-all', onboardingStep === 2 ? 'bg-[#1557C0]' : 'bg-gray-200')} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: REVIEW & EDIT STUDENT PARTICULARS / REQUEST CORRECTION */}
        {/* ========================================================================= */}
        {onboardingStep === 1 && (
          <form onSubmit={handleProceedToSecurityStep} className="space-y-4 text-xs">
            <p className="text-[11px] text-gray-500 font-medium">
              Please carefully verify your official enrollment records below. If any academic details are incorrect, you can request an instant admin correction.
            </p>

            {/* Official Academic Record (Locked by Admin) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#1557C0]/10 flex items-center justify-center text-[#1557C0]">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-black text-[#071A41] text-xs block">Official Academic Record</span>
                    <span className="text-[10px] font-bold text-slate-500">Verified &amp; Configured by Department Administrator</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 hover:bg-amber-100 text-[11px] font-black transition-all shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3 h-3 text-amber-700" />
                  <span>Request Admin Correction</span>
                </button>
              </div>

              {/* Pending Correction Alert */}
              {correctionSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-900 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-black block">Correction Request Pending Admin Review</span>
                    <span className="text-[11px] text-emerald-700">
                      Your request to modify academic details has been submitted. The Administrator will review and update official records.
                    </span>
                  </div>
                </div>
              )}

              {/* 6 High-Contrast Locked Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Register Number */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">REGISTER NUMBER</span>
                    <span className="font-mono font-black text-xs text-[#071A41]">{initialData.registerNumber}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Lock className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>

                {/* Full Name */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">FULL NAME</span>
                    <span className="font-bold text-xs text-[#071A41]">{initialData.name}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Program / Department */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">PROGRAM / DEPARTMENT</span>
                    <span className="font-bold text-xs text-[#1557C0]">{initialData.department || 'B.Tech Artificial Intelligence & Data Science'}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Year & Semester */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">YEAR &amp; SEMESTER</span>
                    <span className="font-bold text-xs text-[#071A41]">Year {initialData.year} · Semester {initialData.semester}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Assigned Section */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">ASSIGNED SECTION</span>
                    <span className="font-bold text-xs text-[#071A41]">Section {initialData.section}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>

                {/* Class Advisor */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">CLASS ADVISOR / MENTOR</span>
                    <span className="font-bold text-xs text-[#1557C0]">{initialData.advisorName || 'Assigned Faculty Mentor'}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Contact & Personal Particulars (Editable) */}
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-blue-200/60 text-xs font-black text-[#071A41]">
                <Phone className="w-4 h-4 text-[#1557C0]" />
                <span>Contact &amp; Personal Particulars (Editable)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Student Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit mobile"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Parent Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter parent / guardian mobile"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                  />
                  <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isParentWhatsapp}
                      onChange={(e) => setForm({ ...form, isParentWhatsapp: e.target.checked })}
                      className="rounded border-gray-300 text-[#16a34a] focus:ring-[#16a34a] w-3 h-3"
                    />
                    <span className="text-[10px] font-semibold text-gray-600">Available on WhatsApp</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Blood Group
                  </label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Residency Status
                  </label>
                  <select
                    value={form.residencyStatus}
                    onChange={(e) => setForm({ ...form, residencyStatus: e.target.value, busNo: '', boardingPoint: '', hostelBlock: '', roomNo: '' })}
                    className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                  >
                    <option value="">Select Residency Status</option>
                    <option value="Day Scholar">Day Scholar</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>

                {form.residencyStatus === 'Day Scholar' && (
                  <>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        Bus No.
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15"
                        value={form.busNo}
                        onChange={(e) => setForm({ ...form, busNo: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        Boarding Point
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Karur Bus Stand"
                        value={form.boardingPoint}
                        onChange={(e) => setForm({ ...form, boardingPoint: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      />
                    </div>
                  </>
                )}

                {form.residencyStatus === 'Hostel' && (
                  <>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        Hostel Block
                      </label>
                      <select
                        value={form.hostelBlock}
                        onChange={(e) => setForm({ ...form, hostelBlock: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      >
                        <option value="">Select Block</option>
                        <option value="Boys Hostel 1">Boys Hostel 1</option>
                        <option value="Boys Hostel 2">Boys Hostel 2</option>
                        <option value="Boys Hostel 3">Boys Hostel 3</option>
                        <option value="Girls Hostel 1">Girls Hostel 1</option>
                        <option value="Girls Hostel 2">Girls Hostel 2</option>
                        <option value="Girls Hostel 3">Girls Hostel 3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">
                        Room No.
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 102"
                        value={form.roomNo}
                        onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-300 font-medium text-[#071A41] bg-white focus:outline-none focus:ring-2 focus:ring-[#1557C0]"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Option: Request Admin Correction */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasCorrectionRequest}
                  onChange={(e) => setForm({ ...form, hasCorrectionRequest: e.target.checked })}
                  className="w-4 h-4 rounded text-[#1557C0] focus:ring-[#1557C0]"
                />
                <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Any academic details wrong? Request Admin Correction
                </span>
              </label>

              {form.hasCorrectionRequest && (
                <div className="pt-1 animate-in fade-in">
                  <textarea
                    rows={2}
                    placeholder="Describe the correction needed (e.g. My section should be B, or correction in name spelling...)"
                    value={form.correctionRemarks}
                    onChange={(e) => setForm({ ...form, correctionRemarks: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs font-medium text-[#071A41] focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Details Confirmed Checkbox */}
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={form.detailsConfirmed}
                  onChange={(e) => setForm({ ...form, detailsConfirmed: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#1557C0] focus:ring-[#1557C0]"
                />
                <span className="text-xs font-bold text-[#071A41]">
                  I confirm that I have reviewed my student particulars, mobile numbers, and academic record.
                </span>
              </label>
            </div>

            {/* Next Button */}
            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#1557C0] hover:bg-[#0f44b0] text-white shadow-md cursor-pointer hover:scale-[1.02] transition-all"
              >
                <span>Next: Set Password &amp; Verify Email</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SET PERMANENT PASSWORD & EMAIL OTP VERIFICATION */}
        {/* ========================================================================= */}
        {onboardingStep === 2 && (
          <form onSubmit={handleCompleteOnboarding} className="space-y-4 text-xs">
            
            {/* 1. Permanent Password Section */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <span className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Create Permanent Secure Password *
                </span>
                <span className="text-[10px] font-bold text-amber-700">Min 6 characters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Create strong password"
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none pr-8"
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
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Email Verification via OTP */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <span className="font-black text-[#071A41] flex items-center gap-1.5 text-xs">
                  <Mail className="w-4 h-4 text-[#1557C0]" />
                  Verify Student Email via OTP *
                </span>
                <span className="text-[10px] font-bold text-blue-700">Official Communication</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 text-[11px] mb-1">
                  Email Address *
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="e.g. yourname@gmail.com or student@vsb.edu.in"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailOTP}
                    disabled={loading || emailOtpCooldown > 0}
                    className="px-4 py-2.5 rounded-xl bg-[#1557C0] hover:bg-[#0e44b5] text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {emailOtpCooldown > 0 ? `Resend (${emailOtpCooldown}s)` : emailOtpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* Demo OTP Helper if generated */}
              {demoOtp && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-900 block">Security Code Sent:</span>
                    <span className="font-mono font-bold text-amber-800 text-sm tracking-wider">{demoOtp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, emailOtp: demoOtp })}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              )}

              {/* OTP Input Section */}
              {emailOtpSent && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="block font-bold text-gray-700 text-[11px]">
                    Enter 6-Digit Email Verification Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={form.emailOtp}
                    onChange={(e) => setForm({ ...form, emailOtp: e.target.value.replace(/\D/g, '') })}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.4em] font-mono font-black text-2xl p-2.5 rounded-xl border border-gray-300 bg-white text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none shadow-inner"
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
              <button
                type="button"
                onClick={() => setOnboardingStep(1)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Details</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#1557C0] hover:bg-[#0e44b5] text-white shadow-md text-xs sm:text-sm cursor-pointer transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify OTP &amp; Enter Dashboard</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 📝 OFFICIAL ACADEMIC CORRECTION REQUEST MODAL TO ADMIN */}
      {/* ========================================================================= */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-60 bg-[#071A41]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-amber-200 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-[#071A41] text-sm">Request Official Academic Correction</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Requires Verification &amp; Approval by Department Admin</p>
                </div>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {correctionSubmitted ? (
              <div className="py-6 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h5 className="font-black text-sm text-[#071A41]">Correction Request Submitted</h5>
                <p className="text-xs text-slate-500">
                  Your request has been forwarded to the Department Admin. Changes will reflect once verified against university records.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1557C0] text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendCorrectionRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Select Detail to Correct *
                  </label>
                  <select
                    value={correctionCategory}
                    onChange={(e) => setCorrectionCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  >
                    <option value="name">Full Name (Spelling / Initials)</option>
                    <option value="department">Program / Department</option>
                    <option value="year">Year of Study</option>
                    <option value="semester">Current Semester</option>
                    <option value="section">Assigned Section (A / B / C)</option>
                    <option value="advisorName">Class Advisor / Mentor</option>
                    <option value="dateOfBirth">Date of Birth</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Requested / Corrected Value *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter the correct value"
                    value={requestedValue}
                    onChange={(e) => setRequestedValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">
                    Reason / Official Proof Notes *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Briefly state reason (e.g. as per 10th marksheet, allotment order...)"
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A41] focus:ring-2 focus:ring-[#1557C0] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={correctionSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#1557C0] hover:bg-[#0e44b5] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {correctionSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Submit to Admin</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
