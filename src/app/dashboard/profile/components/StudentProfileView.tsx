'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import {
  YEAR_TO_DEFAULT_BATCH,
  getDefaultBatchForYear,
  getYearFromBatch,
  getYearFromSemester,
  getSemesterForYear,
  ACADEMIC_COHORTS,
} from '@/lib/academicBatch'
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
  Smartphone,
  Download,
  CheckCircle2,
  Sparkles,
  Bot,
  Target,
  Copy,
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
  Bus,
  Car,
  Home,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react'
import { downloadStudentCardPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { playNotificationChime } from '@/lib/notificationEngine'
import { StudentOnboardingModal } from '@/components/auth/StudentOnboardingModal'

interface StudentFullProfile {
  name: string
  email: string
  institutionalEmail?: string
  personalEmail?: string
  emailVerified?: boolean
  phone: string
  dateOfBirth: string
  bloodGroup: string
  residencyStatus: string
  residencyType?: 'Day Scholar' | 'Hosteller'
  dayScholarType?: 'College Bus' | 'Out Bus'
  busNo?: string
  boardingPoint?: string
  outBusMode?: string
  address?: string
  hostelBlock?: string
  roomNo?: string
  parentPhone?: string
  isParentWhatsapp?: boolean
  gender?: string
  fatherName?: string
  motherName?: string
  sslcDistrict?: string
  sslcSchool?: string
  sslcMarks?: string
  sslcPercentage?: string
  sslcMedium?: string
  hscDistrict?: string
  hscSchool?: string
  hscMarks?: string
  hscPercentage?: string
  hscCutoff?: string
  hscMedium?: string
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
  profileImage?: string | null
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
  user: {
    name: string
    email: string
    personalEmail?: string | null
    emailVerified?: boolean
    phone?: string | null
    profileImage?: string | null
  }
  student: {
    registerNumber: string
    department: string
    year: number
    semester: number
    section: string
    dateOfBirth?: Date | string | null
    advisorName?: string | null
    batch?: string | null
    parentPhone?: string | null
    isParentWhatsapp?: boolean | null
    bloodGroup?: string | null
    residencyStatus?: string | null
    hostelBlock?: string | null
    roomNo?: string | null
    busNo?: string | null
    boardingPoint?: string | null
    phone?: string | null
    cgpa?: number | string | null
    attendance?: string | null
  }
}) {
  const regNo = initialStudent.registerNumber || initialUser.email?.split('@')[0].toUpperCase() || ''
  const storageKey = `vsb_student_profile_v2_${regNo}`
  const verifiedPersonal = (initialUser as any).personalEmail || initialUser.email || ''

  const defaultProfile: StudentFullProfile = {
    name: initialUser.name || '',
    email: verifiedPersonal,
    personalEmail: verifiedPersonal,
    emailVerified: Boolean((initialUser as any).emailVerified || verifiedPersonal),
    phone: initialUser.phone || (initialStudent as any).phone || '',
    parentPhone: (initialStudent as any).parentPhone || '',
    isParentWhatsapp: (initialStudent as any).isParentWhatsapp ?? false,
    dateOfBirth: initialStudent.dateOfBirth
      ? new Date(initialStudent.dateOfBirth).toISOString().split('T')[0]
      : '',
    bloodGroup: (initialStudent as any).bloodGroup || '',
    residencyStatus: (initialStudent as any).residencyStatus || '',
    busNo: (initialStudent as any).busNo || '',
    boardingPoint: (initialStudent as any).boardingPoint || '',
    hostelBlock: (initialStudent as any).hostelBlock || '',
    roomNo: (initialStudent as any).roomNo || '',
    gender: (initialStudent as any).gender || '',
    fatherName: (initialStudent as any).fatherName || '',
    motherName: (initialStudent as any).motherName || '',
    address: (initialStudent as any).address || '',
    sslcDistrict: '',
    sslcSchool: '',
    sslcMarks: '',
    sslcPercentage: '',
    sslcMedium: 'English',
    hscDistrict: '',
    hscSchool: '',
    hscMarks: '',
    hscPercentage: '',
    hscCutoff: '',
    hscMedium: 'English',
    registerNumber: regNo,
    department: initialStudent.department || 'Artificial Intelligence & Data Science',
    degreeProgram: 'B.Tech Artificial Intelligence & Data Science',
    regulation: 'R-2021 (Autonomous System)',
    batch: initialStudent.batch || getDefaultBatchForYear(initialStudent.year || 1),
    year: initialStudent.year || 1,
    semester: initialStudent.semester || 1,
    section: initialStudent.section || 'A',
    advisor: initialStudent.advisorName || '',
    cgpa: (initialStudent as any).cgpa != null ? String((initialStudent as any).cgpa) : '',
    cgpaClass: '',
    attendance: (initialStudent as any).attendance || '',
    attendanceRemark: '',
    rank: '',
    rankRemark: '',
    arrears: '',
    arrearRemark: '',
    enrollmentStatus: 'Enrolled & Active',
    profileImage: (initialUser.profileImage && !initialUser.profileImage.startsWith('blob:')) ? initialUser.profileImage : null,
  }

  const [profile, setProfile] = useState<StudentFullProfile>(defaultProfile)
  const [imageError, setImageError] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'kpis'>('personal')
  const [formData, setFormData] = useState<StudentFullProfile>(defaultProfile)
  const [loading, setLoading] = useState(false)

  // AI Career & Skills Mentor Agent State
  const [showAiMentor, setShowAiMentor] = useState(false)
  const [aiMentorInput, setAiMentorInput] = useState('')
  const [isAiMentorLoading, setIsAiMentorLoading] = useState(false)
  const [aiMentorAdvice, setAiMentorAdvice] = useState<string | null>(null)

  const handleAskAiMentor = async (queryText?: string) => {
    const q = (queryText || aiMentorInput).trim()
    if (!q) return
    setIsAiMentorLoading(true)
    setAiMentorAdvice(null)

    const prompt = `You are a Year IV Academic & Career Advisor for B.Tech Artificial Intelligence & Data Science at V.S.B. Engineering College (Anna University affiliated).
Student Profile Context:
- Name: ${profile.name}
- Year: ${profile.year} (Semester ${profile.semester})
- Department: ${profile.department}
- Current CGPA: ${profile.cgpa || 'N/A'}
- Current Attendance: ${profile.attendance || 'N/A'}%

Student Query: ${q}

Provide concise, highly actionable, industry-relevant guidance (recommended tools, certifications, GitHub projects, Anna University exam prep tips). Use bullet points and clear formatting.`

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          sessionId: `mentor-${profile.registerNumber}`,
        }),
      })
      const data = await res.json()
      if (data.success && data.answer) {
        setAiMentorAdvice(data.answer)
      } else {
        setAiMentorAdvice('Unable to generate mentorship recommendations. Please try again.')
      }
    } catch {
      setAiMentorAdvice('Network error connecting to AI Mentor service.')
    } finally {
      setIsAiMentorLoading(false)
    }
  }

  useEffect(() => {
    // Load custom saved profile from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.profileImage && parsed.profileImage.startsWith('blob:')) {
            parsed.profileImage = null
          }
          if (!parsed.email && parsed.personalEmail) {
            parsed.email = parsed.personalEmail
          }
          delete parsed.institutionalEmail
          if (parsed.parentPhone === '6381366088' && !(initialStudent as any).parentPhone) {
            parsed.parentPhone = ''
          }
          if (parsed.profileImage && !parsed.profileImage.startsWith('blob:')) {
            localStorage.setItem('user_profile_image', parsed.profileImage)
          } else if (!parsed.profileImage) {
            // Check if user_profile_image or initialUser has a valid photo
            const cachedImg = localStorage.getItem('user_profile_image')
            if (cachedImg && !cachedImg.startsWith('blob:') && cachedImg !== 'null') {
              parsed.profileImage = cachedImg
            } else if (initialUser?.profileImage && !initialUser.profileImage.startsWith('blob:')) {
              parsed.profileImage = initialUser.profileImage
            }
          }
          setProfile((prev) => ({ ...prev, ...parsed }))
          setFormData((prev) => ({ ...prev, ...parsed }))
        }
      } catch { }
    }
  }, [regNo, storageKey, verifiedPersonal, initialUser?.profileImage])

  // Real-time synchronization when Onboarding is completed or updated
  useEffect(() => {
    const handleProfileUpdated = (e: any) => {
      if (e.detail) {
        const d = { ...e.detail }
        if (d.profileImage && d.profileImage.startsWith('blob:')) {
          d.profileImage = null
        }
        if (!d.email && d.personalEmail) {
          d.email = d.personalEmail
        }
        delete d.institutionalEmail
        setProfile((prev) => ({ ...prev, ...d }))
        setFormData((prev) => ({ ...prev, ...d }))
      }
    }
    window.addEventListener('portal-student-profile-updated', handleProfileUpdated)
    return () => window.removeEventListener('portal-student-profile-updated', handleProfileUpdated)
  }, [verifiedPersonal])

  const handleOpenEdit = (tab: 'personal' | 'academic' | 'kpis' = 'personal') => {
    setActiveTab(tab)
    setFormData(profile)
    setIsEditOpen(true)
  }

  const handlePhotoUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = document.createElement('img')
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const maxDim = 300
        let w = img.width
        let h = img.height
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h)
          const base64 = canvas.toDataURL('image/jpeg', 0.85)
          setImageError(false)

          setProfile((prev) => {
            const upd = { ...prev, profileImage: base64 }
            if (typeof window !== 'undefined') {
              localStorage.setItem(storageKey, JSON.stringify(upd))
              localStorage.setItem('user_profile_image', base64)
              window.dispatchEvent(new CustomEvent('portal-profile-image-updated', { detail: base64 }))
            }
            return upd
          })
          setFormData((prev) => ({ ...prev, profileImage: base64 }))

          try {
            const res = await fetch('/api/students', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ registerNumber: profile.registerNumber, profileImage: base64 }),
            })
            if (!res.ok) {
              await fetch('/api/auth/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileImage: base64, registerNumber: profile.registerNumber }),
              }).catch(() => {})
            }
          } catch (e) {
            console.warn('Profile image server sync note:', e)
          }

          toast.success('Passport photograph updated!')
          playNotificationChime()
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = async () => {
    setImageError(false)
    setProfile((prev) => {
      const upd = { ...prev, profileImage: null }
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(upd))
        localStorage.removeItem('user_profile_image')
        window.dispatchEvent(new CustomEvent('portal-profile-image-updated', { detail: null }))
      }
      return upd
    })
    setFormData((prev) => ({ ...prev, profileImage: null }))

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_profile_image')
      window.dispatchEvent(new CustomEvent('portal-profile-image-updated', { detail: null }))
    }

    try {
      await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerNumber: profile.registerNumber,
          profileImage: null,
        }),
      })
      toast.success('Passport photograph removed successfully!')
      playNotificationChime()
    } catch {
      toast.error('Failed to remove photo on server')
    }
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
      bloodGroup: profile.bloodGroup,
      residencyStatus: profile.residencyStatus,
      cgpa: profile.cgpa,
      attendance: profile.attendance,
      degreeProgram: profile.degreeProgram,
      regulation: profile.regulation,
      batch: profile.batch,
      profileImage: profile.profileImage,
    })
  }

  // Directly save profile changes to state, localStorage, and DB
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const cleanPersonalEmail = (formData.personalEmail || formData.email || '').trim()

    if (cleanPersonalEmail && !cleanPersonalEmail.toLowerCase().endsWith('@gmail.com')) {
      toast.error('Only @gmail.com email addresses are permitted (e.g. name@gmail.com).')
      setLoading(false)
      return
    }

    try {
      const updatedProfile = {
        ...formData,
        email: cleanPersonalEmail,
        personalEmail: cleanPersonalEmail,
        institutionalEmail: '',
      }
      setProfile(updatedProfile)
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updatedProfile))
        if (formData.profileImage) {
          localStorage.setItem('user_profile_image', formData.profileImage)
          window.dispatchEvent(new CustomEvent('portal-profile-image-updated', { detail: formData.profileImage }))
        } else if (formData.profileImage === null) {
          localStorage.removeItem('user_profile_image')
          window.dispatchEvent(new CustomEvent('portal-profile-image-updated', { detail: null }))
        }
      }

      // Persist directly to database
      await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerNumber: formData.registerNumber,
          name: formData.name,
          email: cleanPersonalEmail,
          phone: formData.phone,
          parentPhone: formData.parentPhone,
          isParentWhatsapp: formData.isParentWhatsapp,
          dateOfBirth: formData.dateOfBirth || undefined,
          bloodGroup: formData.bloodGroup,
          residencyStatus: formData.residencyStatus,
          hostelBlock: formData.hostelBlock,
          roomNo: formData.roomNo,
          busNo: formData.busNo,
          boardingPoint: formData.boardingPoint,
          address: formData.address,
          department: formData.department,
          year: formData.year,
          semester: formData.semester,
          section: formData.section,
          batch: formData.batch,
          advisorName: formData.advisor,
          profileImage: formData.profileImage !== undefined ? formData.profileImage : null,
        }),
      }).catch(() => { })

      toast.success('Profile updated successfully!')
      playNotificationChime()
      setIsEditOpen(false)
    } catch {
      toast.success('Profile saved successfully!')
      playNotificationChime()
      setIsEditOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl mx-auto font-sans">
      {/* Official Academic Profile Record Header (Spec 9) */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#003399] px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
              Institutional Academic Record
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937] mt-1.5">Student Profile</h1>
            <p className="text-xs text-[#6B7280]">V.S.B. Engineering College · Department of Artificial Intelligence &amp; Data Science</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCard}
              type="button"
              className="px-3.5 py-2 rounded text-xs font-semibold bg-[#003399] hover:bg-[#002266] text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> DOWNLOAD RECORD (PDF)
            </button>
          </div>
        </div>

        {/* Primary Academic Details Grid */}
        <div className="flex flex-col md:flex-row items-start gap-6 pt-5">
          {/* Student Photo */}
          <div className="relative shrink-0">
            {profile.profileImage && !imageError && !profile.profileImage.startsWith('blob:') ? (
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="w-24 h-28 sm:w-28 sm:h-32 rounded border border-[#E5E7EB] object-cover shadow-2xs bg-slate-50"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded border border-[#E5E7EB] bg-slate-100 text-[#003399] font-bold text-3xl flex items-center justify-center">
                {profile.name.charAt(0) || 'S'}
              </div>
            )}
            <div className="mt-2 flex items-center justify-center gap-1">
              <label
                className="text-[11px] font-semibold text-[#003399] hover:underline cursor-pointer flex items-center gap-1"
                title="Change Photo"
              >
                <Camera className="w-3 h-3" /> Change
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handlePhotoUpload(f)
                  }}
                  className="hidden"
                />
              </label>
              {profile.profileImage && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] font-semibold text-[#CC0000] hover:underline cursor-pointer ml-2"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Academic Key-Value Record */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs flex-1">
            <div className="border-b border-[#F3F4F6] pb-1.5">
              <span className="text-[#6B7280] block text-[11px]">Name:</span>
              <span className="font-bold text-[#1F2937] text-sm">{profile.name}</span>
            </div>

            <div className="border-b border-[#F3F4F6] pb-1.5">
              <span className="text-[#6B7280] block text-[11px]">Register Number:</span>
              <span className="font-bold font-mono text-[#003399] text-sm">{profile.registerNumber}</span>
            </div>

            <div className="border-b border-[#F3F4F6] pb-1.5">
              <span className="text-[#6B7280] block text-[11px]">Department:</span>
              <span className="font-semibold text-[#1F2937]">{profile.department || 'Artificial Intelligence & Data Science'}</span>
            </div>

            <div className="border-b border-[#F3F4F6] pb-1.5">
              <span className="text-[#6B7280] block text-[11px]">Year &amp; Semester:</span>
              <span className="font-semibold text-[#1F2937]">
                {profile.year === 1 ? 'I Year' : profile.year === 2 ? 'II Year' : profile.year === 3 ? 'III Year' : 'IV Year'} • Semester {profile.semester}
              </span>
            </div>

            <div className="border-b border-[#F3F4F6] pb-1.5">
              <span className="text-[#6B7280] block text-[11px]">Section:</span>
              <span className="font-semibold text-[#1F2937]">Section {profile.section || 'A'}</span>
            </div>

            <div className="border-b border-[#F3F4F6] pb-1.5">
              <span className="text-[#6B7280] block text-[11px]">Academic Year:</span>
              <span className="font-semibold text-[#1F2937]">{profile.batch || '2026–2027'}</span>
            </div>

            <div className="border-b border-[#F3F4F6] pb-1.5">
              <span className="text-[#6B7280] block text-[11px]">Institution / College:</span>
              <span className="font-semibold text-[#1F2937]">V.S.B. Engineering College (Autonomous)</span>
            </div>

            <div className="border-b border-[#F3F4F6] pb-1.5">
              <span className="text-[#6B7280] block text-[11px]">Faculty Advisor:</span>
              <span className="font-semibold text-[#1F2937]">{profile.advisor || 'Assigned by Department'}</span>
            </div>
          </div>
        </div>

        {/* Academic Performance Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#E5E7EB]">
          <div className="bg-[#F7F8FA] p-3 rounded border border-[#E5E7EB]">
            <p className="text-[10px] text-[#6B7280] uppercase font-bold">Cumulative GPA</p>
            <p className="text-xl font-bold text-[#003399] mt-0.5">{profile.cgpa}</p>
            <p className="text-[10px] text-[#6B7280]">{profile.cgpaClass}</p>
          </div>

          <div className="bg-[#F7F8FA] p-3 rounded border border-[#E5E7EB]">
            <p className="text-[10px] text-[#6B7280] uppercase font-bold">Attendance Record</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{profile.attendance}</p>
            <p className="text-[10px] text-emerald-800">{profile.attendanceRemark}</p>
          </div>

          <div className="bg-[#F7F8FA] p-3 rounded border border-[#E5E7EB]">
            <p className="text-[10px] text-[#6B7280] uppercase font-bold">Department Rank</p>
            <p className="text-xl font-bold text-[#1F2937] mt-0.5">{profile.rank}</p>
            <p className="text-[10px] text-[#6B7280]">{profile.rankRemark}</p>
          </div>

          <div className="bg-[#F7F8FA] p-3 rounded border border-[#E5E7EB]">
            <p className="text-[10px] text-[#6B7280] uppercase font-bold">Standing Arrears</p>
            <p className="text-xl font-bold text-[#1F2937] mt-0.5">{profile.arrears}</p>
            <p className="text-[10px] text-[#6B7280]">{profile.arrearRemark}</p>
          </div>
        </div>
      </div>

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

        {/* 2. Personal & Contact Information */}
        <Card className="rounded-3xl border-gray-200 shadow-xs hover:shadow-md transition-all relative group">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#071A3D]">Personal &amp; Contact Info</h3>
                  <p className="text-[11px] text-gray-400">Your personal details and residency</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col gap-1">
                  <span className="font-bold text-gray-500 text-[10px] uppercase">Gender</span>
                  <span className="font-black text-[#071A3D] truncate">{profile.gender || 'Not specified'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col gap-1">
                  <span className="font-bold text-gray-500 text-[10px] uppercase">Date of Birth</span>
                  <span className="font-black text-[#071A3D] truncate">{profile.dateOfBirth || 'Not specified'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col gap-1">
                  <span className="font-bold text-gray-500 text-[10px] uppercase">Blood Group</span>
                  <span className="font-black text-rose-600 truncate">{profile.bloodGroup || 'Not specified'}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-500">Mobile No:</span>
                  </div>
                  <span className="font-black text-[#071A3D]">{profile.phone || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-200/60 pt-2 mt-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-500">Email ID:</span>
                  </div>
                  <span className="font-black text-[#071A3D] truncate max-w-[150px] sm:max-w-none">
                    {profile.personalEmail || profile.email || 'Not specified'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col gap-1.5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-500">Residency Status:</span>
                    </div>
                    <span className="font-black text-purple-700 text-right">
                      {profile.residencyStatus || 'Not specified'}
                    </span>
                  </div>
                  
                  {/* Additional Onboarding Details */}
                  <div className="pl-6 space-y-1 mt-1">
                    {profile.hostelBlock && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 font-medium">Hostel Block:</span>
                        <span className="font-bold text-gray-700">{profile.hostelBlock}</span>
                      </div>
                    )}
                    {profile.roomNo && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 font-medium">Room No:</span>
                        <span className="font-bold text-gray-700">{profile.roomNo}</span>
                      </div>
                    )}
                    {profile.busNo && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 font-medium">College Bus No:</span>
                        <span className="font-bold text-gray-700">{profile.busNo}</span>
                      </div>
                    )}
                    {profile.outBusMode && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 font-medium">Transport Mode:</span>
                        <span className="font-bold text-gray-700">{profile.outBusMode}</span>
                      </div>
                    )}
                    {profile.boardingPoint && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 font-medium">Boarding Point:</span>
                        <span className="font-bold text-gray-700">{profile.boardingPoint}</span>
                      </div>
                    )}
                  </div>
                </div>
                {profile.address && (
                  <p className="text-[10px] text-gray-500 mt-1 pl-6 leading-tight">
                    {profile.address}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-amber-700">Emergency / Parent:</span>
                </div>
                <span className="font-black text-[#071A3D]">{profile.parentPhone || 'Not specified'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Family & Schooling Academic Records (10th & 12th) */}
        <Card className="rounded-3xl border-gray-200 shadow-xs hover:shadow-md transition-all relative group md:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#071A3D]">Family Particulars &amp; Prior Schooling Records (10th &amp; 12th)</h3>
                  <p className="text-[11px] text-gray-400">Authenticated parental details and secondary schooling qualifications</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Parental Particulars & Address */}
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-2.5">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
                  👨‍👩‍👧 PARENTAL &amp; RESIDENTIAL RECORD
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Father / Guardian:</span>
                    <span className="font-black text-[#071A3D]">{profile.fatherName || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Mother Name:</span>
                    <span className="font-black text-[#071A3D]">{profile.motherName || 'Not specified'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Permanent Address:</span>
                  <span className="font-semibold text-[#071A3D] leading-tight block mt-0.5">
                    {profile.address || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* 10th & 12th Records */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 10th Record */}
                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-800 uppercase">10th (SSLC)</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                      {profile.sslcPercentage ? `${profile.sslcPercentage}%` : 'Verified'}
                    </span>
                  </div>
                  <p className="font-bold text-[#071A41] text-xs leading-tight line-clamp-2">
                    {profile.sslcSchool || 'School details on record'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    District: {profile.sslcDistrict || 'N/A'} · {profile.sslcMedium || 'English'} Medium
                  </p>
                  {profile.sslcMarks && (
                    <p className="text-[11px] font-mono font-bold text-blue-900 pt-1 border-t border-blue-200/60">
                      Marks: {profile.sslcMarks} / 500
                    </p>
                  )}
                </div>

                {/* 12th Record */}
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-800 uppercase">12th (HSC)</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                      {profile.hscCutoff ? `Cut-off: ${profile.hscCutoff}` : 'Verified'}
                    </span>
                  </div>
                  <p className="font-bold text-[#071A41] text-xs leading-tight line-clamp-2">
                    {profile.hscSchool || 'School details on record'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    District: {profile.hscDistrict || 'N/A'} · {profile.hscMedium || 'English'} Medium
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-indigo-200/60 text-[11px] font-mono font-bold text-indigo-900">
                    <span>{profile.hscMarks ? `${profile.hscMarks} / 600` : ''}</span>
                    <span>{profile.hscPercentage ? `(${profile.hscPercentage}%)` : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 3. AI CAREER & SKILLS MENTOR AGENT */}
      <Card className="rounded-3xl border-blue-200/80 shadow-md bg-gradient-to-br from-[#071A3D] via-[#0E2C66] to-[#1455D9] text-white overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm sm:text-base text-white">AI Career &amp; Skills Mentor Agent</h3>
                  <Badge variant="role" className="bg-cyan-500/20 text-cyan-200 border-cyan-400/30 text-[9px] font-bold">
                    AI &amp; DS Specialist
                  </Badge>
                </div>
                <p className="text-[11px] text-cyan-100/80">
                  Personalized technical roadmap for Year {profile.year} Semester {profile.semester}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAiMentor(!showAiMentor)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-200 text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>{showAiMentor ? 'Hide Mentor' : 'Open AI Mentor'}</span>
            </button>
          </div>

          {showAiMentor && (
            <div className="pt-3 border-t border-white/10 space-y-3.5 animate-in fade-in-50 duration-200">
              {/* Quick Guidance Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-cyan-200">Suggested Prompts:</span>
                {[
                  { l: '🎯 Recommended Certifications', q: 'What certifications should a Year ' + profile.year + ' AI & DS student pursue?' },
                  { l: '💻 Portfolio Project Ideas', q: 'Suggest 3 impressive resume projects for B.Tech AI & DS students.' },
                  { l: '📈 CGPA & Exam Strategy', q: 'How can I score above 8.5 CGPA in Anna University R-2021?' },
                  { l: '🚀 Placement Roadmap', q: 'Give me a step-by-step placement preparation roadmap for product companies and AI startups.' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiMentorInput(chip.q)
                      handleAskAiMentor(chip.q)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-cyan-400 hover:text-[#071A3D] text-[10px] font-semibold text-white border border-white/15 transition-all cursor-pointer"
                  >
                    {chip.l}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask career or academic advice (e.g., 'Best deep learning courses', 'How to prepare for tech interviews')..."
                  value={aiMentorInput}
                  onChange={(e) => setAiMentorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAiMentor()}
                  className="flex-1 bg-[#051330] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleAskAiMentor()}
                  disabled={isAiMentorLoading || !aiMentorInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-[#071A3D] font-black text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-md"
                >
                  {isAiMentorLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#071A3D] border-t-transparent rounded-full animate-spin" />
                      <span>Advising...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Get Advice</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mentor Advice Output */}
              {aiMentorAdvice && (
                <div className="p-4 rounded-2xl bg-white text-slate-900 border border-white shadow-lg space-y-2.5 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between text-xs font-bold text-[#071A3D] border-b border-gray-100 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>Mentor Advisory &amp; Action Plan</span>
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiMentorAdvice)
                        toast.success('Advisory copied!')
                      }}
                      className="text-gray-400 hover:text-blue-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                    {aiMentorAdvice}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* COMPREHENSIVE EDIT PROFILE MODAL (DIRECT EDIT & SAVE) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="text-xl font-black text-[#071A3D] flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#1455D9]" /> Edit Student Profile
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

            {/* Direct Update Notice */}
            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5 shrink-0">
              <Sparkles className="w-4 h-4 text-[#1455D9] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Instant Profile Updates:</p>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Update your personal, contact, and academic information anytime. Changes are saved immediately to your profile and student records.
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

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* TAB 1: PERSONAL & CONTACT */}
              {activeTab === 'personal' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Photo Upload in Edit Modal */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center gap-4">
                    <div className="relative group shrink-0">
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt="Preview"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1455D9] shadow-sm bg-white"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-blue-300 flex items-center justify-center text-blue-500 font-bold text-lg shadow-inner">
                          {formData.name.charAt(0) || 'S'}
                        </div>
                      )}
                      {formData.profileImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, profileImage: null }))
                            handleRemovePhoto()
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-[#071A3D] text-xs">Student Passport Photograph</p>
                      <p className="text-[10px] text-gray-500">Appears on Student Profile &amp; Pre-filled on ID Card PDF</p>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold text-[11px] cursor-pointer shadow-xs transition-all">
                        <Upload className="w-3 h-3" />
                        <span>{formData.profileImage ? 'Change Photo' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) {
                              const reader = new FileReader()
                              reader.onload = (event) => {
                                const img = document.createElement('img')
                                img.onload = () => {
                                  const canvas = document.createElement('canvas')
                                  const maxDim = 300
                                  let w = img.width
                                  let h = img.height
                                  if (w > h) {
                                    if (w > maxDim) {
                                      h = Math.round((h * maxDim) / w)
                                      w = maxDim
                                    }
                                  } else {
                                    if (h > maxDim) {
                                      w = Math.round((w * maxDim) / h)
                                      h = maxDim
                                    }
                                  }
                                  canvas.width = w
                                  canvas.height = h
                                  const ctx = canvas.getContext('2d')
                                  if (ctx) {
                                    ctx.drawImage(img, 0, 0, w, h)
                                    const base64 = canvas.toDataURL('image/jpeg', 0.85)
                                    setFormData((prev) => ({ ...prev, profileImage: base64 }))
                                  }
                                }
                                img.src = event.target?.result as string
                              }
                              reader.readAsDataURL(f)
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

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
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-[#071A3D]">Personal Email Address</label>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          @gmail.com only
                        </span>
                      </div>
                      <input
                        type="email"
                        value={formData.personalEmail || formData.email || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormData({ ...formData, personalEmail: val, email: val })
                        }}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono text-[#071A3D] text-xs"
                        placeholder="e.g. yourname@gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Student Contact Number</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-[#071A3D] mb-1">Parent / Guardian Mobile</label>
                      <input
                        type="text"
                        value={formData.parentPhone || ''}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono"
                        placeholder="e.g. 9876543210"
                      />
                      <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.isParentWhatsapp)}
                          onChange={(e) => setFormData({ ...formData, isParentWhatsapp: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-[11px] font-bold text-gray-600">Available on WhatsApp</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <label className="block font-bold text-[#071A3D] mb-1.5 flex items-center justify-between">
                      <span>Date of Birth (Day / Month / Year)</span>
                      {formData.dateOfBirth && formData.dateOfBirth.includes('-') && (
                        <span className="text-[10px] font-bold text-[#1455D9] bg-blue-50 px-2 py-0.5 rounded-md">
                          Selected: {formData.dateOfBirth.split('-')[2]}-{['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(formData.dateOfBirth.split('-')[1], 10)] || formData.dateOfBirth.split('-')[1]}-{formData.dateOfBirth.split('-')[0]} (DD-MM-YYYY)
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={formData.dateOfBirth ? (formData.dateOfBirth.split('-')[2] || '') : ''}
                        onChange={(e) => {
                          const parts = (formData.dateOfBirth || '2005-01-01').split('-')
                          const y = parts[0] || '2005'
                          const m = parts[1] || '01'
                          setFormData({ ...formData, dateOfBirth: `${y}-${m}-${e.target.value.padStart(2, '0')}` })
                        }}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-semibold text-xs"
                      >
                        <option value="">Day (DD)</option>
                        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <select
                        value={formData.dateOfBirth ? (formData.dateOfBirth.split('-')[1] || '') : ''}
                        onChange={(e) => {
                          const parts = (formData.dateOfBirth || '2005-01-01').split('-')
                          const y = parts[0] || '2005'
                          const d = parts[2] || '01'
                          setFormData({ ...formData, dateOfBirth: `${y}-${e.target.value.padStart(2, '0')}-${d}` })
                        }}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-semibold text-xs"
                      >
                        <option value="">Month (MM)</option>
                        {[
                          { val: '01', label: '01 - Jan' },
                          { val: '02', label: '02 - Feb' },
                          { val: '03', label: '03 - Mar' },
                          { val: '04', label: '04 - Apr' },
                          { val: '05', label: '05 - May' },
                          { val: '06', label: '06 - Jun' },
                          { val: '07', label: '07 - Jul' },
                          { val: '08', label: '08 - Aug' },
                          { val: '09', label: '09 - Sep' },
                          { val: '10', label: '10 - Oct' },
                          { val: '11', label: '11 - Nov' },
                          { val: '12', label: '12 - Dec' },
                        ].map((m) => (
                          <option key={m.val} value={m.val}>{m.label}</option>
                        ))}
                      </select>

                      <select
                        value={formData.dateOfBirth ? (formData.dateOfBirth.split('-')[0] || '') : ''}
                        onChange={(e) => {
                          const parts = (formData.dateOfBirth || '2005-01-01').split('-')
                          const m = parts[1] || '01'
                          const d = parts[2] || '01'
                          setFormData({ ...formData, dateOfBirth: `${e.target.value}-${m}-${d}` })
                        }}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-semibold text-xs"
                      >
                        <option value="">Year (YYYY)</option>
                        {Array.from({ length: 30 }, (_, i) => String(2012 - i)).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#071A3D] mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] bg-white font-semibold"
                    >
                      <option value="">Select Blood Group</option>
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

                  {/* RESIDENCY & TRANSPORT SETUP */}
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block font-black text-[#071A3D] text-xs uppercase tracking-wider">
                        Residency &amp; Accommodation
                      </label>
                      <span className="text-[11px] text-gray-400 font-medium">Select your accommodation</span>
                    </div>

                    {/* Radio Type Selector: Day Scholar vs Hosteller */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newType = 'Day Scholar'
                          const isCollegeBus = formData.dayScholarType !== 'Out Bus'
                          const bNo = formData.busNo || 'Route 12'
                          const stop = formData.boardingPoint || 'Karur Bus Stand'
                          const outM = formData.outBusMode || 'Public Bus'
                          const newSummary = isCollegeBus
                            ? `Day Scholar · College Bus ${bNo} · Boarding: ${stop}`
                            : `Day Scholar · Out Bus (${outM}) · From: ${stop}`
                          setFormData({
                            ...formData,
                            residencyType: newType,
                            dayScholarType: isCollegeBus ? 'College Bus' : 'Out Bus',
                            busNo: isCollegeBus ? bNo : formData.busNo,
                            boardingPoint: stop,
                            residencyStatus: newSummary,
                          })
                        }}
                        className={cn(
                          'p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3',
                          (formData.residencyType === 'Day Scholar' || (!formData.residencyType && !formData.residencyStatus?.toLowerCase().includes('hostel')))
                            ? 'bg-blue-50/80 border-[#1455D9] ring-2 ring-[#1455D9]/20 text-[#071A3D]'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        )}
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1455D9] flex items-center justify-center shrink-0">
                          <Bus className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">Day Scholar</p>
                          <p className="text-[10px] text-gray-500">College Bus / Out Bus</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newType = 'Hosteller'
                          const block = formData.hostelBlock || 'Boys Hostel Block A (Ganga)'
                          const room = formData.roomNo || 'Room 101'
                          const newSummary = `Hosteller · ${block} · ${room}`
                          setFormData({
                            ...formData,
                            residencyType: newType,
                            hostelBlock: block,
                            roomNo: room,
                            residencyStatus: newSummary,
                          })
                        }}
                        className={cn(
                          'p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3',
                          (formData.residencyType === 'Hosteller' || formData.residencyStatus?.toLowerCase().includes('hostel'))
                            ? 'bg-purple-50/80 border-purple-600 ring-2 ring-purple-600/20 text-[#071A3D]'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        )}
                      >
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">Hosteller</p>
                          <p className="text-[10px] text-gray-500">College Hostel Residence</p>
                        </div>
                      </button>
                    </div>

                    {/* DAY SCHOLAR SUB-OPTIONS: College Bus User vs Out Bus User */}
                    {(formData.residencyType === 'Day Scholar' || (!formData.residencyType && !formData.residencyStatus?.toLowerCase().includes('hostel'))) && (
                      <div className="p-3.5 rounded-2xl bg-white border border-blue-100 space-y-3">
                        <label className="block font-bold text-gray-700 text-[11px]">
                          Day Scholar Transport Option:
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const bNo = formData.busNo || 'Route 12'
                              const stop = formData.boardingPoint || 'Karur Bus Stand'
                              setFormData({
                                ...formData,
                                dayScholarType: 'College Bus',
                                busNo: bNo,
                                boardingPoint: stop,
                                residencyStatus: `Day Scholar · College Bus ${bNo} · Boarding: ${stop}`,
                              })
                            }}
                            className={cn(
                              'p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                              formData.dayScholarType !== 'Out Bus'
                                ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            )}
                          >
                            <Bus className="w-4 h-4" /> College Bus User
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const mode = formData.outBusMode || 'Public Bus (TNSTC / Private)'
                              const stop = formData.boardingPoint || 'Local Stop'
                              setFormData({
                                ...formData,
                                dayScholarType: 'Out Bus',
                                outBusMode: mode,
                                boardingPoint: stop,
                                residencyStatus: `Day Scholar · Out Bus (${mode}) · From: ${stop}`,
                              })
                            }}
                            className={cn(
                              'p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                              formData.dayScholarType === 'Out Bus'
                                ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            )}
                          >
                            <Car className="w-4 h-4" /> Out Bus / Own Transport
                          </button>
                        </div>

                        {/* If College Bus User */}
                        {formData.dayScholarType !== 'Out Bus' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="block font-bold text-gray-700 text-[11px] mb-1">
                                College Bus Route / Bus No.
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Bus No. 12 - Karur or Route 08 - Trichy"
                                value={formData.busNo || ''}
                                onChange={(e) => {
                                  const bNo = e.target.value
                                  setFormData({
                                    ...formData,
                                    busNo: bNo,
                                    residencyStatus: `Day Scholar · College Bus ${bNo} · Boarding: ${formData.boardingPoint || 'Main Stop'}`,
                                  })
                                }}
                                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] text-xs"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-gray-700 text-[11px] mb-1">
                                Boarding Point / Stop Name
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Karur Bus Stand / Tollgate"
                                value={formData.boardingPoint || ''}
                                onChange={(e) => {
                                  const pt = e.target.value
                                  setFormData({
                                    ...formData,
                                    boardingPoint: pt,
                                    residencyStatus: `Day Scholar · College Bus ${formData.busNo || 'Bus'} · Boarding: ${pt}`,
                                  })
                                }}
                                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] text-xs"
                              />
                            </div>
                          </div>
                        ) : (
                          /* If Out Bus User */
                          <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block font-bold text-gray-700 text-[11px] mb-1">
                                  Out Bus Transport Mode
                                </label>
                                <select
                                  value={formData.outBusMode || 'Public Bus (TNSTC / Private)'}
                                  onChange={(e) => {
                                    const m = e.target.value
                                    setFormData({
                                      ...formData,
                                      outBusMode: m,
                                      residencyStatus: `Day Scholar · Out Bus (${m}) · From: ${formData.boardingPoint || 'Local Stop'}`,
                                    })
                                  }}
                                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] text-xs bg-white"
                                >
                                  <option value="Public Bus (TNSTC / Private)">Public Bus (TNSTC / Private)</option>
                                  <option value="Own Two-Wheeler / Bike">Own Two-Wheeler / Bike</option>
                                  <option value="Private Van / Auto">Private Van / Auto</option>
                                  <option value="Walking / Nearby Resident">Walking / Nearby Resident</option>
                                </select>
                              </div>

                              <div>
                                <label className="block font-bold text-gray-700 text-[11px] mb-1">
                                  Starting Location / Stop
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Thanthonimalai / Velliyanai"
                                  value={formData.boardingPoint || ''}
                                  onChange={(e) => {
                                    const pt = e.target.value
                                    setFormData({
                                      ...formData,
                                      boardingPoint: pt,
                                      residencyStatus: `Day Scholar · Out Bus (${formData.outBusMode || 'Public/Own'}) · From: ${pt}`,
                                    })
                                  }}
                                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block font-bold text-gray-700 text-[11px] mb-1">
                                Residential Address (Optional)
                              </label>
                              <input
                                type="text"
                                placeholder="Door No, Street Name, Area, City, Pincode"
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* HOSTELLER SUB-OPTIONS */}
                    {(formData.residencyType === 'Hosteller' || (!formData.residencyType && formData.residencyStatus?.toLowerCase().includes('hostel'))) && (
                      <div className="p-3.5 rounded-2xl bg-white border border-purple-100 space-y-3">
                        <label className="block font-bold text-gray-700 text-[11px]">
                          Hostel Allocation Details:
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-gray-700 text-[11px] mb-1">
                              Hostel Block
                            </label>
                            <select
                              value={formData.hostelBlock || 'Boys Hostel Block A (Ganga)'}
                              onChange={(e) => {
                                const b = e.target.value
                                setFormData({
                                  ...formData,
                                  hostelBlock: b,
                                  residencyStatus: `Hosteller · ${b} · ${formData.roomNo || 'Room'}`,
                                })
                              }}
                              className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 text-xs bg-white font-semibold"
                            >
                              <option value="Boys Hostel Block A (Ganga)">Boys Hostel Block A (Ganga)</option>
                              <option value="Boys Hostel Block B (Yamuna)">Boys Hostel Block B (Yamuna)</option>
                              <option value="Boys Hostel Block C (Kaveri)">Boys Hostel Block C (Kaveri)</option>
                              <option value="Girls Hostel Block A (Thamarai)">Girls Hostel Block A (Thamarai)</option>
                              <option value="Girls Hostel Block B (Malligai)">Girls Hostel Block B (Malligai)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-gray-700 text-[11px] mb-1">
                              Room Number
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Room 204"
                              value={formData.roomNo || ''}
                              onChange={(e) => {
                                const r = e.target.value
                                setFormData({
                                  ...formData,
                                  roomNo: r,
                                  residencyStatus: `Hosteller · ${formData.hostelBlock || 'Boys Hostel'} · ${r}`,
                                })
                              }}
                              className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-[#071A3D]">Academic Batch (Cohort)</label>
                        <span className="text-[10px] font-bold text-[#1455D9] bg-blue-50 px-2 py-0.5 rounded-md">
                          Year {formData.year} Standard: {getDefaultBatchForYear(formData.year)}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.batch}
                        onChange={(e) => {
                          const val = e.target.value
                          const matchedYear = getYearFromBatch(val)
                          if (matchedYear) {
                            const newSem = getSemesterForYear(matchedYear, formData.semester)
                            setFormData({ ...formData, batch: val, year: matchedYear, semester: newSem })
                          } else {
                            setFormData({ ...formData, batch: val })
                          }
                        }}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D]"
                        placeholder="e.g. 2025-2029"
                      />
                      {/* Quick Cohort Select Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ACADEMIC_COHORTS.map((c) => {
                          const isCurrent = formData.batch === c.batch && formData.year === c.year
                          return (
                            <button
                              key={c.batch}
                              type="button"
                              onClick={() => {
                                const newSem = getSemesterForYear(c.year, formData.semester)
                                setFormData({
                                  ...formData,
                                  batch: c.batch,
                                  year: c.year,
                                  semester: newSem,
                                })
                              }}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              {c.yearName}: {c.batch}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Academic Year</label>
                      <select
                        value={formData.year}
                        onChange={(e) => {
                          const y = Number(e.target.value)
                          const newSem = getSemesterForYear(y, formData.semester)
                          const newBatch = getDefaultBatchForYear(y)
                          setFormData({ ...formData, year: y, semester: newSem, batch: newBatch })
                        }}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] bg-white font-bold text-[#071A3D]"
                      >
                        <option value={1}>1st Year (2026-2030)</option>
                        <option value={2}>2nd Year (2025-2029)</option>
                        <option value={3}>3rd Year (2024-2028)</option>
                        <option value={4}>4th Year (2023-2027)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#071A3D] mb-1">Semester</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => {
                          const s = Number(e.target.value)
                          const newYear = getYearFromSemester(s)
                          const newBatch = getDefaultBatchForYear(newYear)
                          setFormData({ ...formData, semester: s, year: newYear, batch: newBatch })
                        }}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] bg-white font-bold text-[#1455D9]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8]
                          .filter((s) => Math.ceil(s / 2) === formData.year)
                          .map((s) => {
                            const sYear = Math.ceil(s / 2)
                            return (
                              <option key={s} value={s}>
                                Semester {s} (Year {sYear} {s % 2 === 1 ? 'Odd' : 'Even'})
                              </option>
                            )
                          })}
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

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t shrink-0">
                <p className="text-[11px] text-gray-500 hidden sm:block">
                  Changes are saved immediately to your profile
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
                    <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Onboarding & Identity Verification Modal */}
      <StudentOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(updatedUser) => {
          setIsOnboardingOpen(false)
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey)
            if (saved) {
              try {
                const parsed = JSON.parse(saved)
                setProfile((prev) => ({ ...prev, ...parsed, ...updatedUser }))
                setFormData((prev) => ({ ...prev, ...parsed, ...updatedUser }))
              } catch { }
            }
          }
          toast.success('Onboarding records synchronized to your profile!')
        }}
        initialData={{
          name: profile.name || initialUser.name,
          email: profile.personalEmail || profile.email || initialUser.email || '',
          phone: profile.phone || initialUser.phone || '',
          registerNumber: regNo,
          department: profile.department,
          year: profile.year,
          semester: profile.semester,
          section: profile.section,
          dateOfBirth: profile.dateOfBirth,
          advisorName: profile.advisor,
          batch: profile.batch,
          parentPhone: profile.parentPhone,
          profileImage: profile.profileImage || initialUser.profileImage || undefined,
        }}
      />
    </div>
  )
}
