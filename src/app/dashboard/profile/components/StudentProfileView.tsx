'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  Building,
  Award,
  ShieldCheck,
  QrCode,
  Download,
  CheckCircle2,
  Sparkles,
  MapPin,
  Heart,
  TrendingUp,
  Percent,
  Edit3,
  X,
  Lock,
  Save,
  RotateCcw,
  Check,
  Send,
  Clock,
  AlertCircle,
  ShieldAlert,
  Info,
} from 'lucide-react'
import { downloadStudentCardPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { playNotificationChime } from '@/lib/notificationEngine'

interface StudentFullProfile {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  bloodGroup: string
  residencyStatus: string
  registerNumber: string
  department: string
  degreeProgram: string
  regulation: string
  batch: string
  year: number
  semester: number
  section: string
  advisor: string
  cgpa: string
  cgpaClass: string
  attendance: string
  attendanceRemark: string
  rank: string
  rankRemark: string
  arrears: string
  arrearRemark: string
  enrollmentStatus: string
}

interface ChangeRequest {
  id: string
  registerNumber: string
  studentName: string
  requestedData: Partial<StudentFullProfile>
  currentData: Partial<StudentFullProfile>
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
}

export function StudentProfileView({
  user: initialUser,
  student: initialStudent,
}: {
  user: { name: string; email: string; phone?: string | null }
  student: {
    registerNumber: string
    department: string
    year: number
    semester: number
    section: string
    dateOfBirth?: Date | string | null
    advisorName?: string | null
    batch?: string | null
  }
}) {
  const regNo = initialStudent.registerNumber || '922525243123'
  const storageKey = `vsb_student_profile_v2_${regNo}`

  const defaultProfile: StudentFullProfile = {
    name: initialUser.name || '',
    email: (initialUser.email && !initialUser.email.endsWith('@student.vsb.edu.in')) ? initialUser.email : '',
    phone: initialUser.phone || '',
    dateOfBirth: initialStudent.dateOfBirth
      ? new Date(initialStudent.dateOfBirth).toISOString().split('T')[0]
      : '',
    bloodGroup: '',
    residencyStatus: '',
    registerNumber: regNo,
    department: initialStudent.department || 'Artificial Intelligence & Data Science',
    degreeProgram: 'B.Tech Artificial Intelligence & Data Science',
    regulation: 'R-2021 (Autonomous System)',
    batch: initialStudent.batch || '',
    year: initialStudent.year || 1,
    semester: initialStudent.semester || 1,
    section: initialStudent.section || 'A',
    advisor: initialStudent.advisorName || '',
    cgpa: '',
    cgpaClass: '',
    attendance: '',
    attendanceRemark: '',
    rank: '',
    rankRemark: '',
    arrears: '',
    arrearRemark: '',
    enrollmentStatus: 'Enrolled & Active',
  }

  const [profile, setProfile] = useState<StudentFullProfile>(defaultProfile)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'kpis'>('personal')
  const [formData, setFormData] = useState<StudentFullProfile>(defaultProfile)
  const [changeReason, setChangeReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<ChangeRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  // Fetch pending/past requests from database
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true)
      const res = await fetch(`/api/students/profile-requests?registerNumber=${regNo}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests)

        // If the latest request was recently approved, apply changes to active profile
        const latestApproved = data.requests.find((r: ChangeRequest) => r.status === 'approved')
        if (latestApproved && latestApproved.requestedData) {
          setProfile((prev) => {
            const updated = { ...prev, ...latestApproved.requestedData }
            if (typeof window !== 'undefined') {
              localStorage.setItem(storageKey, JSON.stringify(updated))
            }
            return updated
          })
        }
      }
    } catch {} finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => {
    // Load custom saved profile from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          setProfile((prev) => ({ ...prev, ...parsed }))
          setFormData((prev) => ({ ...prev, ...parsed }))
        }
      } catch {}
    }
    fetchRequests()
  }, [regNo, storageKey])

  const handleOpenEdit = (tab: 'personal' | 'academic' | 'kpis' = 'personal') => {
    setActiveTab(tab)
    setFormData(profile)
    setChangeReason('')
    setIsEditOpen(true)
  }

  const handleDownloadCard = () => {
    downloadStudentCardPDF({
      name: profile.name,
      registerNumber: profile.registerNumber,
      department: profile.department,
      year: profile.year,
      semester: profile.semester,
      section: profile.section,
      email: profile.email,
      phone: profile.phone,
      dob: formatDate(profile.dateOfBirth),
      cgpa: profile.cgpa,
      attendance: profile.attendance,
    })
  }

  // Submit edit request for Admin Approval
  const handleSubmitPermissionRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/students/profile-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerNumber: profile.registerNumber,
          studentName: formData.name,
          requestedData: formData,
          currentData: profile,
          reason: changeReason.trim() || 'Student submitted profile modifications for official record verification.',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Edit request submitted to Department Admin for approval!')
        playNotificationChime()
        setIsEditOpen(false)
        fetchRequests()
      } else {
        toast.error(data.message || 'Failed to submit permission request.')
      }
    } catch {
      toast.error('Network error submitting request.')
    } finally {
      setLoading(false)
    }
  }

  // Cancel a pending request
  const handleCancelRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/students/profile-requests?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Request cancelled')
        setRequests((prev) => prev.filter((r) => r.id !== id))
      }
    } catch {}
  }

  const pendingRequest = requests.find((r) => r.status === 'pending')

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Hero Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 bottom-0 w-80 h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#22C7E8]/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xl border-4 border-white/20 shrink-0">
              {profile.name.charAt(0) || 'M'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                  Official Student Record
                </span>
                <span className="text-xs text-green-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {profile.enrollmentStatus}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black mt-1">{profile.name}</h1>
              <p className="text-xs sm:text-sm text-gray-300 font-mono mt-0.5">
                Reg. No: <span className="text-[#22C7E8] font-bold">{profile.registerNumber}</span> · {profile.degreeProgram}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => handleOpenEdit('personal')}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 shadow-xs cursor-pointer hover:scale-102"
            >
              <Edit3 className="w-4 h-4 text-[#22C7E8]" /> Edit Profile (Request Admin Permission)
            </button>
            <button
              onClick={handleDownloadCard}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer hover:scale-102"
            >
              <Download className="w-4 h-4" /> Download Student ID Card (PDF)
            </button>
          </div>
        </div>

        {/* KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div
            onClick={() => handleOpenEdit('kpis')}
            className="bg-white/10 hover:bg-white/15 cursor-pointer transition-all backdrop-blur-md p-3.5 rounded-2xl border border-white/10 group relative"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-300 uppercase font-bold">Academic CGPA</p>
              <Edit3 className="w-3 h-3 text-white/40 group-hover:text-[#F4C430] transition-colors" />
            </div>
            <p className="text-xl font-black text-[#F4C430] mt-0.5">{profile.cgpa}</p>
            <p className="text-[10px] text-gray-300">{profile.cgpaClass}</p>
          </div>

          <div
            onClick={() => handleOpenEdit('kpis')}
            className="bg-white/10 hover:bg-white/15 cursor-pointer transition-all backdrop-blur-md p-3.5 rounded-2xl border border-white/10 group relative"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-300 uppercase font-bold">Attendance Record</p>
              <Edit3 className="w-3 h-3 text-white/40 group-hover:text-green-400 transition-colors" />
            </div>
            <p className="text-xl font-black text-green-400 mt-0.5">{profile.attendance}</p>
            <p className="text-[10px] text-green-300">{profile.attendanceRemark}</p>
          </div>

          <div
            onClick={() => handleOpenEdit('kpis')}
            className="bg-white/10 hover:bg-white/15 cursor-pointer transition-all backdrop-blur-md p-3.5 rounded-2xl border border-white/10 group relative"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-300 uppercase font-bold">Department Standing</p>
              <Edit3 className="w-3 h-3 text-white/40 group-hover:text-[#22C7E8] transition-colors" />
            </div>
            <p className="text-xl font-black text-[#22C7E8] mt-0.5">{profile.rank}</p>
            <p className="text-[10px] text-gray-300">{profile.rankRemark}</p>
          </div>

          <div
            onClick={() => handleOpenEdit('kpis')}
            className="bg-white/10 hover:bg-white/15 cursor-pointer transition-all backdrop-blur-md p-3.5 rounded-2xl border border-white/10 group relative"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-300 uppercase font-bold">Arrear Status</p>
              <Edit3 className="w-3 h-3 text-white/40 group-hover:text-emerald-300 transition-colors" />
            </div>
            <p className="text-xl font-black text-emerald-300 mt-0.5">{profile.arrears}</p>
            <p className="text-[10px] text-gray-300">{profile.arrearRemark}</p>
          </div>
        </div>
      </div>

      {/* LIVE ADMIN PERMISSION STATUS BANNER */}
      {pendingRequest && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-amber-900">
                  Profile Edit Request Awaiting Admin Approval
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900">
                  Pending Review
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Submitted on {formatDate(pendingRequest.createdAt)} · Reason: &quot;{pendingRequest.reason}&quot;
              </p>
              <p className="text-[11px] text-amber-700 font-medium mt-1">
                Your requested changes will update automatically on this page as soon as verified by the Department Administrator.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleCancelRequest(pendingRequest.id)}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            Cancel Request
          </button>
        </div>
      )}

      {/* Profile Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Academic & Institutional Record */}
        <Card className="rounded-3xl border-gray-200 shadow-xs hover:shadow-md transition-all relative group">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1455D9]/10 text-[#1455D9] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#071A3D]">Academic &amp; Institutional Record</h3>
                  <p className="text-[11px] text-gray-400">Department curriculum &amp; batch registration</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenEdit('academic')}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#1455D9] bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                title="Request Change"
              >
                <Edit3 className="w-3.5 h-3.5" /> Request Edit
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Degree &amp; Program:</span>
                <span className="font-black text-[#071A3D] text-right">{profile.degreeProgram}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Academic Regulation:</span>
                <span className="font-black text-[#1455D9]">{profile.regulation}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Academic Batch:</span>
                <span className="font-black text-[#071A3D]">{profile.batch}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Current Semester &amp; Section:</span>
                <span className="font-black text-[#071A3D]">
                  Year {profile.year} · Semester {profile.semester} · Section {profile.section}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <span className="font-bold text-[#1455D9]">Assigned Faculty Advisor:</span>
                <span className="font-black text-[#071A3D]">{profile.advisor}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Personal & Contact Records */}
        <Card className="rounded-3xl border-gray-200 shadow-xs hover:shadow-md transition-all relative group">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#071A3D]">Personal &amp; Contact Records</h3>
                  <p className="text-[11px] text-gray-400">Official student registry contact details</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenEdit('personal')}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-1 cursor-pointer"
                title="Request Change"
              >
                <Edit3 className="w-3.5 h-3.5" /> Request Edit
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Institutional Email:</span>
                <span className="font-mono font-bold text-[#1455D9]">{profile.email}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Contact Number:</span>
                <span className="font-bold text-[#071A3D]">{profile.phone}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Date of Birth:</span>
                <span className="font-bold text-[#071A3D]">{formatDate(profile.dateOfBirth)}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Blood Group:</span>
                <span className="font-bold text-red-600 font-mono">{profile.bloodGroup}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500">Residency Status:</span>
                <span className="font-bold text-[#071A3D] text-right">{profile.residencyStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* COMPREHENSIVE EDIT PROFILE & ADMIN PERMISSION MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="text-xl font-black text-[#071A3D] flex items-center gap-2">
                  Edit Profile &amp; Request Admin Permission
                </h3>
                <p className="text-xs text-[#1455D9] font-mono font-bold">
                  {formData.registerNumber} · {formData.name}
                </p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Institutional Security Notice */}
            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5 shrink-0">
              <ShieldAlert className="w-4 h-4 text-[#1455D9] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Administrative Permission Protocol:</p>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  All menu field updates are submitted directly to the Department Administrator for official verification. Once approved, changes are automatically published to your student record.
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={cn(
                  'px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
                  activeTab === 'personal'
                    ? 'border-[#1455D9] text-[#1455D9]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <User className="w-3.5 h-3.5" /> Personal &amp; Contact
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('academic')}
                className={cn(
                  'px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
                  activeTab === 'academic'
                    ? 'border-[#1455D9] text-[#1455D9]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Academic &amp; Batch
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('kpis')}
                className={cn(
                  'px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
                  activeTab === 'kpis'
                    ? 'border-[#1455D9] text-[#1455D9]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Performance &amp; Standing
              </button>
            </div>

            <form onSubmit={handleSubmitPermissionRequest} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* TAB 1: PERSONAL & CONTACT */}
              {activeTab === 'personal' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block font-bold text-[#071A3D] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-semibold text-[#071A3D]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Institutional Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono text-[#071A3D]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Contact Phone Number</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Blood Group</label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] bg-white font-semibold"
                      >
                        <option value="O +ve">O +ve</option>
                        <option value="O -ve">O -ve</option>
                        <option value="A +ve">A +ve</option>
                        <option value="A -ve">A -ve</option>
                        <option value="B +ve">B +ve</option>
                        <option value="B -ve">B -ve</option>
                        <option value="AB +ve">AB +ve</option>
                        <option value="AB -ve">AB -ve</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#071A3D] mb-1">Residency Status &amp; Transport/Hostel Details</label>
                    <input
                      type="text"
                      value={formData.residencyStatus}
                      onChange={(e) => setFormData({ ...formData, residencyStatus: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                      placeholder="e.g. Day Scholar (College Bus Route 14) or Hosteller (Kaveri Hostel Room 204)"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ACADEMIC & BATCH */}
              {activeTab === 'academic' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Register Number</label>
                      <input
                        type="text"
                        value={formData.registerNumber}
                        onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value.toUpperCase() })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono font-bold text-[#1455D9]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Degree &amp; Program Name</label>
                      <input
                        type="text"
                        value={formData.degreeProgram}
                        onChange={(e) => setFormData({ ...formData, degreeProgram: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Academic Regulation</label>
                      <input
                        type="text"
                        value={formData.regulation}
                        onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                        placeholder="R-2021 (Autonomous System)"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Academic Batch</label>
                      <input
                        type="text"
                        value={formData.batch}
                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                        placeholder="2023 - 2027 (4 Year Program)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Year</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] bg-white font-bold"
                      >
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Semester</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] bg-white font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Section</label>
                      <select
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] bg-white font-bold"
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#071A3D] mb-1">Assigned Faculty Advisor</label>
                    <input
                      type="text"
                      value={formData.advisor}
                      onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                      placeholder="Dr. S. Karthik (Professor)"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PERFORMANCE & STANDING */}
              {activeTab === 'kpis' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Academic CGPA</label>
                      <input
                        type="text"
                        value={formData.cgpa}
                        onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#F4C430] bg-[#071A3D]"
                        placeholder="8.84 / 10.0"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">CGPA Class / Standing</label>
                      <input
                        type="text"
                        value={formData.cgpaClass}
                        onChange={(e) => setFormData({ ...formData, cgpaClass: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                        placeholder="First Class with Distinction"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Attendance Record</label>
                      <input
                        type="text"
                        value={formData.attendance}
                        onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-green-700"
                        placeholder="92.5%"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Attendance Remark</label>
                      <input
                        type="text"
                        value={formData.attendanceRemark}
                        onChange={(e) => setFormData({ ...formData, attendanceRemark: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                        placeholder="Compliant (>75% Req)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Department Rank</label>
                      <input
                        type="text"
                        value={formData.rank}
                        onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#1455D9]"
                        placeholder="Rank 4 / 68"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Rank Remark / Standing</label>
                      <input
                        type="text"
                        value={formData.rankRemark}
                        onChange={(e) => setFormData({ ...formData, rankRemark: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                        placeholder="Top 6% in Batch"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Arrear Status</label>
                      <input
                        type="text"
                        value={formData.arrears}
                        onChange={(e) => setFormData({ ...formData, arrears: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-emerald-600"
                        placeholder="0 Arrears"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Arrear Status Remark</label>
                      <input
                        type="text"
                        value={formData.arrearRemark}
                        onChange={(e) => setFormData({ ...formData, arrearRemark: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                        placeholder="All Semesters Cleared"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#071A3D] mb-1">Official Enrollment Status Badge</label>
                    <input
                      type="text"
                      value={formData.enrollmentStatus}
                      onChange={(e) => setFormData({ ...formData, enrollmentStatus: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                      placeholder="Enrolled & Active"
                    />
                  </div>
                </div>
              )}

              {/* Reason / Justification Input for Admin */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block font-bold text-[#071A3D] mb-1 flex items-center justify-between">
                  <span>Reason / Note for Department Admin Approval</span>
                  <span className="text-gray-400 font-normal text-[10px]">Required for official record audit</span>
                </label>
                <textarea
                  rows={2}
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="e.g. Updated contact phone number, corrected date of birth as per certificate, updated academic section."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] text-xs"
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t shrink-0">
                <p className="text-[11px] text-gray-500 hidden sm:block">
                  Changes require Admin permission
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-2 text-xs transition-all hover:scale-102 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Request Admin Approval'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
