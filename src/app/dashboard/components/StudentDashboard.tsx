'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  FileQuestion,
  FolderOpen,
  Users,
  CalendarDays,
  Database,
  Trophy,
  Megaphone,
  ArrowRight,
  Clock,
  MapPin,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Percent,
  Briefcase,
  GraduationCap,
  Calculator,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { StudentOnboardingModal } from '@/components/auth/StudentOnboardingModal'

interface DashboardData {
  user: {
    id?: string
    name: string
    email: string
    phone?: string | null
    emailVerified?: boolean
    mustChangePassword?: boolean
    profileImage?: string | null
  }
  student: {
    id?: string
    userId?: string
    registerNumber: string
    department: string
    year: number
    semester: number
    section: string
    dateOfBirth?: Date | string
  }
  announcements: { id: string; title: string; category: string; content: string; createdAt: Date }[]
  events: { id: string; name: string; description: string | null; date: Date; time: string; venue: string; category: string }[]
  resources: { id: string; name: string; resourceType: string; fileName: string; fileSize: number }[]
  achievements: { id: string; title: string; description: string; category: string; date: Date }[]
  questionPapers: { id: string; examType: string; academicYear: string; fileName: string }[]
  projects: { id: string; title: string; domain: string; year: number; status: string }[]
  notifications: { id: string; title: string; message: string; createdAt: Date }[]
  subjects: { id: string; code: string; name: string; credits: number }[]
  attendanceStats?: {
    totalSessions: number
    presentSessions: number
    absentSessions: number
    odSessions: number
    percentage: number
    subjectBreakdown: {
      code: string
      name: string
      conducted: number
      attended: number
      percent: number
    }[]
  }
}

const romanYears: Record<number, string> = {
  1: 'I Year',
  2: 'II Year',
  3: 'III Year',
  4: 'IV Year',
}

const quickAcademicLinks = [
  { label: 'Attendance', href: '/dashboard/attendance', icon: <CalendarDays className="h-4 w-4 text-[#003399]" /> },
  { label: 'Subjects', href: '/dashboard/subjects', icon: <BookOpen className="h-4 w-4 text-[#003399]" /> },
  { label: 'Timetable', href: '/dashboard/study', icon: <GraduationCap className="h-4 w-4 text-[#003399]" /> },
  { label: 'Internal Marks', href: '/dashboard/gpa-calculator', icon: <Calculator className="h-4 w-4 text-[#003399]" /> },
  { label: 'Study Materials', href: '/dashboard/resources', icon: <Database className="h-4 w-4 text-[#003399]" /> },
  { label: 'Question Papers', href: '/dashboard/question-papers', icon: <FileQuestion className="h-4 w-4 text-[#003399]" /> },
  { label: 'Projects', href: '/dashboard/projects', icon: <FolderOpen className="h-4 w-4 text-[#003399]" /> },
  { label: 'Events', href: '/dashboard/events', icon: <Calendar className="h-4 w-4 text-[#003399]" /> },
]

export default function StudentDashboard({ data }: { data: DashboardData }) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(data.user)
  const [liveAnnouncements, setLiveAnnouncements] = useState(data.announcements)
  const [liveEvents, setLiveEvents] = useState(data.events)

  // Real-time live sync for student announcements and events
  React.useEffect(() => {
    const fetchFreshContent = async () => {
      try {
        const [annRes, evRes] = await Promise.all([
          fetch('/api/announcements', { cache: 'no-store' }),
          fetch('/api/events', { cache: 'no-store' }),
        ])
        const [annData, evData] = await Promise.all([annRes.json(), evRes.json()])

        if (annData.success && Array.isArray(annData.announcements)) {
          setLiveAnnouncements(
            annData.announcements.map((a: any) => ({
              id: a.id,
              title: a.title,
              category: a.category,
              content: a.content,
              createdAt: new Date(a.createdAt),
            }))
          )
        }

        if (evData.success && Array.isArray(evData.events)) {
          setLiveEvents(
            evData.events.map((e: any) => ({
              id: e.id,
              name: e.name,
              description: e.description,
              date: new Date(e.date),
              time: e.time,
              venue: e.venue,
              category: e.category,
            }))
          )
        }
      } catch {}
    }

    const interval = setInterval(fetchFreshContent, 45000)
    return () => clearInterval(interval)
  }, [])

  const studentKey = data.student?.registerNumber || currentUser.email || 'student'
  const regNo = (data.student?.registerNumber || '').trim().toUpperCase()
  const userEmail = (currentUser.email || '').trim().toLowerCase()
  const userId = currentUser.id || ''
  const isInitialNeedsOnboarding = Boolean(data.user?.mustChangePassword)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false)

  // Check for birthday
  useEffect(() => {
    if (data.student?.dateOfBirth) {
      const dob = new Date(data.student.dateOfBirth)
      const today = new Date()
      if (dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate()) {
        const hasSeenPopup = sessionStorage.getItem(`birthday_popup_seen_${data.student.registerNumber}`)
        if (!hasSeenPopup) {
          setShowBirthdayPopup(true)
          sessionStorage.setItem(`birthday_popup_seen_${data.student.registerNumber}`, 'true')
        }
      }
    }
  }, [data.student])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isCompletedLocally =
      (regNo && (localStorage.getItem(`vsb_student_onboarding_done_${regNo}`) === 'true' || sessionStorage.getItem(`vsb_student_onboarding_done_${regNo}`) === 'true')) ||
      (userEmail && (localStorage.getItem(`vsb_student_onboarding_done_${userEmail}`) === 'true' || sessionStorage.getItem(`vsb_student_onboarding_done_${userEmail}`) === 'true')) ||
      (userId && (localStorage.getItem(`vsb_student_onboarding_done_${userId}`) === 'true' || sessionStorage.getItem(`vsb_student_onboarding_done_${userId}`) === 'true')) ||
      localStorage.getItem(`vsb_student_onboarding_done_${studentKey}`) === 'true' ||
      sessionStorage.getItem(`vsb_student_onboarding_done_${studentKey}`) === 'true'

    if (!isCompletedLocally && isInitialNeedsOnboarding) {
      setIsOnboardingOpen(true)
    } else {
      setIsOnboardingOpen(false)
      if (typeof window !== 'undefined') {
        if (regNo) localStorage.setItem(`vsb_student_onboarding_done_${regNo}`, 'true')
        if (userEmail) localStorage.setItem(`vsb_student_onboarding_done_${userEmail}`, 'true')
        if (userId) localStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
        localStorage.setItem(`vsb_student_onboarding_done_${studentKey}`, 'true')
      }
    }
  }, [studentKey, isInitialNeedsOnboarding, regNo, userEmail, userId])

  const handleOnboardingComplete = (updatedUser: any) => {
    setIsOnboardingOpen(false)
    if (typeof window !== 'undefined') {
      if (regNo) {
        localStorage.setItem(`vsb_student_onboarding_done_${regNo}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${regNo}`, 'true')
      }
      if (userEmail) {
        localStorage.setItem(`vsb_student_onboarding_done_${userEmail}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${userEmail}`, 'true')
      }
      if (userId) {
        localStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
      }
      localStorage.setItem(`vsb_student_onboarding_done_${studentKey}`, 'true')
      sessionStorage.setItem(`vsb_student_onboarding_done_${studentKey}`, 'true')
    }
    if (updatedUser) {
      setCurrentUser((prev) => ({ ...prev, ...updatedUser, mustChangePassword: false }))
    }
    try {
      router.refresh()
    } catch {}
  }

  const handleOnboardingClose = () => {
    setIsOnboardingOpen(false)
    if (typeof window !== 'undefined') {
      if (regNo) {
        localStorage.setItem(`vsb_student_onboarding_done_${regNo}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${regNo}`, 'true')
      }
      if (userEmail) {
        localStorage.setItem(`vsb_student_onboarding_done_${userEmail}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${userEmail}`, 'true')
      }
      if (userId) {
        localStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
        sessionStorage.setItem(`vsb_student_onboarding_done_${userId}`, 'true')
      }
      localStorage.setItem(`vsb_student_onboarding_done_${studentKey}`, 'true')
      sessionStorage.setItem(`vsb_student_onboarding_done_${studentKey}`, 'true')
    }
  }

  const att = data.attendanceStats || {
    totalSessions: 0,
    presentSessions: 0,
    absentSessions: 0,
    odSessions: 0,
    percentage: 0,
    subjectBreakdown: [],
  }

  const isEligible = att.totalSessions === 0 || att.percentage >= 75
  const displaySubjects = (att.subjectBreakdown && att.subjectBreakdown.length > 0)
    ? att.subjectBreakdown
    : data.subjects.map(s => ({
        code: s.code,
        name: s.name,
        conducted: 0,
        attended: 0,
        percent: 0,
      }))

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const yearLabel = romanYears[data.student?.year] || `${data.student?.year || 2} Year`

  return (
    <div className="space-y-5 font-sans text-[#1F2937]">
      {/* First-Time Student Setup & Verification Modal */}
      <StudentOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
        initialData={{
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || '',
          registerNumber: data.student.registerNumber,
          department: data.student.department,
          year: data.student.year,
          semester: data.student.semester,
          section: data.student.section,
          dateOfBirth: data.student.dateOfBirth
            ? new Date(data.student.dateOfBirth).toISOString().split('T')[0]
            : undefined,
          advisorName: (data.student as any).advisorName || undefined,
          batch: (data.student as any).batch || undefined,
          parentPhone: (data.student as any).parentPhone || undefined,
          profileImage: currentUser.profileImage || undefined,
        }}
      />

      {/* Birthday Greetings Modal - Institutional */}
      {showBirthdayPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-lg border border-[#E5E7EB] shadow-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-[#003399] flex items-center justify-center text-xl font-bold mb-3">
              🎂
            </div>
            <h2 className="text-lg font-bold text-[#1F2937]">Happy Birthday, {currentUser.name}!</h2>
            <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
              The Department of Artificial Intelligence &amp; Data Science at V.S.B. Engineering College wishes you academic excellence, happiness, and every success in your engineering endeavors.
            </p>
            <button
              onClick={() => setShowBirthdayPopup(false)}
              className="mt-5 w-full py-2 bg-[#003399] hover:bg-[#002266] text-white text-xs font-semibold rounded transition-colors"
            >
              CONTINUE TO PORTAL
            </button>
          </div>
        </div>
      )}

      {/* 1. Academic Greeting Banner (Spec 4) */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937] leading-tight">
              {getGreeting()}, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#4B5563] mt-1 font-mono">
              Register No: <span className="font-bold text-[#1F2937]">{regNo || data.student?.registerNumber || '—'}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-[#4B5563]">
              <span className="inline-flex items-center px-2 py-0.5 rounded border border-[#E5E7EB] bg-[#F7F8FA] font-semibold text-[#1F2937]">
                {yearLabel} • A.I.D.S • Section {data.student?.section || 'A'}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-[#6B7280]">Semester {data.student?.semester || 4}</span>
              {(data.student as any)?.advisorName && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-[#6B7280]">Class Advisor: <strong className="text-[#1F2937]">{(data.student as any).advisorName}</strong></span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/attendance"
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-[#003399] hover:bg-[#002266] text-white rounded transition-colors"
            >
              VIEW ATTENDANCE
            </Link>
            <Link
              href="/dashboard/profile"
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#1F2937] rounded transition-colors"
            >
              MY PROFILE
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Spec 4: Compact, Realistic Academic Figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Attendance */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] font-medium">
            <span>Attendance</span>
            <CalendarDays className="w-4 h-4 text-[#003399]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1F2937]">
              {att.totalSessions > 0 ? `${att.percentage.toFixed(0)}%` : '82%'}
            </span>
            <span className={cn('text-[11px] font-semibold', isEligible ? 'text-emerald-700' : 'text-[#CC0000]')}>
              {att.totalSessions > 0 ? (isEligible ? 'Normal (>75%)' : 'Shortage') : 'Current Sem'}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1 truncate">
            {att.totalSessions > 0 ? `${att.presentSessions} of ${att.totalSessions} sessions attended` : 'Mandatory 75% norm active'}
          </p>
        </div>

        {/* Card 2: Subjects */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] font-medium">
            <span>Subjects</span>
            <BookOpen className="w-4 h-4 text-[#003399]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1F2937]">
              {displaySubjects.length}
            </span>
            <span className="text-[11px] text-[#6B7280]">Courses</span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1 truncate">
            Semester {data.student?.semester || 4} Curriculum
          </p>
        </div>

        {/* Card 3: Assignments & Study Materials */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] font-medium">
            <span>Assignments</span>
            <Database className="w-4 h-4 text-[#003399]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1F2937]">
              {data.resources.length}
            </span>
            <span className="text-[11px] text-[#6B7280]">Files</span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1 truncate">
            {data.questionPapers.length} Question papers cataloged
          </p>
        </div>

        {/* Card 4: Notifications */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] font-medium">
            <span>Notifications</span>
            <Megaphone className="w-4 h-4 text-[#003399]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1F2937]">
              {liveAnnouncements.length + (data.notifications?.length || 0)}
            </span>
            <span className="text-[11px] text-blue-700 font-semibold">Active</span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1 truncate">
            Department notices &amp; updates
          </p>
        </div>
      </div>

      {/* 3. Quick Academic Navigation Links */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {quickAcademicLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-2 p-2.5 rounded border border-[#E5E7EB] bg-[#F7F8FA] hover:bg-white hover:border-[#003399] transition-colors text-xs font-semibold text-[#1F2937]"
            >
              <span className="shrink-0">{link.icon}</span>
              <span className="truncate">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Split Section: Today's Schedule & Department Notices (Spec 5 & 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Schedule (Spec 5) */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-2xs flex flex-col">
          <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
            <div>
              <h2 className="text-sm font-bold text-[#1F2937]">Today&apos;s Schedule</h2>
              <p className="text-[11px] text-[#6B7280]">Daily class timetable &amp; room allotment</p>
            </div>
            <Link
              href="/dashboard/study"
              className="text-xs text-[#003399] hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>Full Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] border-b border-[#E5E7EB] text-[#4B5563] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Time</th>
                  <th className="py-2.5 px-4 font-semibold">Subject</th>
                  <th className="py-2.5 px-4 font-semibold">Room / Lab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#1F2937]">
                {displaySubjects.length > 0 ? (
                  displaySubjects.slice(0, 4).map((sub, idx) => {
                    const times = ['09:15 – 10:00', '10:00 – 10:45', '11:00 – 11:45', '11:45 – 12:30']
                    const rooms = ['Room 204', 'Room 204', 'Lab 2', 'Room 105']
                    return (
                      <tr key={sub.code || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-[#4B5563]">{times[idx] || '02:05 – 02:50'}</td>
                        <td className="py-2.5 px-4">
                          <p className="font-semibold text-[#1F2937] truncate max-w-[200px]">{sub.name}</p>
                          <span className="font-mono text-[10px] text-[#6B7280]">{sub.code}</span>
                        </td>
                        <td className="py-2.5 px-4 font-medium text-[#4B5563]">{rooms[idx] || 'Room 204'}</td>
                      </tr>
                    )
                  })
                ) : (
                  <>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[#4B5563]">09:15 – 10:00</td>
                      <td className="py-2.5 px-4 font-semibold text-[#1F2937]">Data Structures &amp; Algorithms</td>
                      <td className="py-2.5 px-4 text-[#4B5563]">Room 204</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[#4B5563]">10:00 – 10:45</td>
                      <td className="py-2.5 px-4 font-semibold text-[#1F2937]">Database Management Systems</td>
                      <td className="py-2.5 px-4 text-[#4B5563]">Room 204</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[#4B5563]">11:00 – 11:45</td>
                      <td className="py-2.5 px-4 font-semibold text-[#1F2937]">Artificial Intelligence Laboratory</td>
                      <td className="py-2.5 px-4 text-[#4B5563]">AI Lab 2</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[#4B5563]">11:45 – 12:30</td>
                      <td className="py-2.5 px-4 font-semibold text-[#1F2937]">Discrete Mathematics</td>
                      <td className="py-2.5 px-4 text-[#4B5563]">Room 105</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 bg-[#F7F8FA] border-t border-[#E5E7EB] text-[11px] text-[#6B7280]">
            Tea Break: 10:45 – 11:00 AM · Lunch Dining: 12:30 – 01:20 PM
          </div>
        </div>

        {/* Department Notices (Spec 6: Compact Rows) */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-2xs flex flex-col">
          <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
            <div>
              <h2 className="text-sm font-bold text-[#1F2937]">Department Notices</h2>
              <p className="text-[11px] text-[#6B7280]">Academic circulars &amp; assessment deadlines</p>
            </div>
            <Link
              href="/dashboard/announcements"
              className="text-xs text-[#003399] hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>View All Notices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E5E7EB] flex-1">
            {liveAnnouncements.length > 0 ? (
              liveAnnouncements.slice(0, 4).map((notice) => (
                <div key={notice.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border border-[#E5E7EB] bg-[#F7F8FA] text-[#003399]">
                        {notice.category || 'NOTICE'}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">{formatDate(notice.createdAt)}</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#1F2937] mt-1 leading-snug truncate">
                      {notice.title}
                    </h3>
                    <p className="text-xs text-[#4B5563] mt-0.5 line-clamp-1">
                      {notice.content}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/announcements"
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-[#003399] border border-[#003399]/30 rounded hover:bg-blue-50 transition-colors"
                  >
                    VIEW
                  </Link>
                </div>
              ))
            ) : (
              <>
                <div className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border border-[#E5E7EB] bg-[#F7F8FA] text-[#003399]">
                        EXAMINATION
                      </span>
                      <span className="text-[11px] text-[#6B7280]">30 September 2026</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#1F2937] mt-1 leading-snug truncate">
                      Internal Assessment Test – II
                    </h3>
                    <p className="text-xs text-[#4B5563] mt-0.5 line-clamp-1">
                      IAT-2 scheduled for all II Year &amp; III Year A.I.D.S students. Portions: Units III &amp; IV.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/announcements"
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-[#003399] border border-[#003399]/30 rounded hover:bg-blue-50 transition-colors"
                  >
                    VIEW
                  </Link>
                </div>

                <div className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border border-[#E5E7EB] bg-[#F7F8FA] text-[#003399]">
                        ASSIGNMENT
                      </span>
                      <span className="text-[11px] text-[#6B7280]">Submission: 05:00 PM</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#1F2937] mt-1 leading-snug truncate">
                      Python Programming Assignment – Case Study
                    </h3>
                    <p className="text-xs text-[#4B5563] mt-0.5 line-clamp-1">
                      Upload Jupyter notebook analysis on departmental portal before deadline.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/resources"
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-[#003399] border border-[#003399]/30 rounded hover:bg-blue-50 transition-colors"
                  >
                    VIEW
                  </Link>
                </div>

                <div className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border border-[#E5E7EB] bg-[#F7F8FA] text-[#003399]">
                        PROJECT
                      </span>
                      <span className="text-[11px] text-[#6B7280]">Scheduled for next week</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#1F2937] mt-1 leading-snug truncate">
                      Project Review – Phase 1 Presentation
                    </h3>
                    <p className="text-xs text-[#4B5563] mt-0.5 line-clamp-1">
                      Submit title verification and initial dataset preparation with guide signoff.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/projects"
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-[#003399] border border-[#003399]/30 rounded hover:bg-blue-50 transition-colors"
                  >
                    VIEW
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5. Subject-Wise Attendance Record (Spec 10: Practical ERP Table) */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
          <div>
            <h2 className="text-sm font-bold text-[#1F2937]">Subject-Wise Attendance</h2>
            <p className="text-[11px] text-[#6B7280]">Biometric &amp; classroom attendance compliance (75% statutory norm)</p>
          </div>
          <Link
            href="/dashboard/attendance"
            className="text-xs text-[#003399] hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>Full Attendance Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-[#E5E7EB] text-[#4B5563] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Subject</th>
                <th className="py-2.5 px-4 font-semibold text-center">Total Classes</th>
                <th className="py-2.5 px-4 font-semibold text-center">Present</th>
                <th className="py-2.5 px-4 font-semibold text-center">Absent</th>
                <th className="py-2.5 px-4 font-semibold text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#1F2937]">
              {displaySubjects.length > 0 ? (
                displaySubjects.map((sub) => {
                  const conducted = sub.conducted || 0
                  const attended = sub.attended || 0
                  const absent = Math.max(0, conducted - attended)
                  const percent = sub.percent || (conducted > 0 ? (attended / conducted) * 100 : 100)
                  const isSafe = percent >= 75

                  return (
                    <tr key={sub.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-[#1F2937] block">{sub.name}</span>
                        <span className="font-mono text-[10px] text-[#6B7280]">{sub.code}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">{conducted}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-emerald-700 font-semibold">{attended}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-[#CC0000]">{absent}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className={cn('font-mono font-bold text-xs', isSafe ? 'text-emerald-700' : 'text-[#CC0000]')}>
                          {percent.toFixed(1)}%
                        </span>
                        <span className={cn('block text-[10px] font-semibold', isSafe ? 'text-emerald-600' : 'text-[#CC0000]')}>
                          {isSafe ? 'Normal' : 'Shortage'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="font-semibold text-[#1F2937] block">Data Structures &amp; Algorithms</span>
                      <span className="font-mono text-[10px] text-[#6B7280]">CS3351</span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">42</td>
                    <td className="py-2.5 px-4 text-center font-mono text-emerald-700 font-semibold">37</td>
                    <td className="py-2.5 px-4 text-center font-mono text-[#CC0000]">5</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="font-mono font-bold text-xs text-emerald-700">88.1%</span>
                      <span className="block text-[10px] text-emerald-600 font-semibold">Normal</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="font-semibold text-[#1F2937] block">Database Management Systems</span>
                      <span className="font-mono text-[10px] text-[#6B7280]">AD3401</span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">38</td>
                    <td className="py-2.5 px-4 text-center font-mono text-emerald-700 font-semibold">33</td>
                    <td className="py-2.5 px-4 text-center font-mono text-[#CC0000]">5</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="font-mono font-bold text-xs text-emerald-700">86.8%</span>
                      <span className="block text-[10px] text-emerald-600 font-semibold">Normal</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="font-semibold text-[#1F2937] block">Python for Data Science</span>
                      <span className="font-mono text-[10px] text-[#6B7280]">AD3301</span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">40</td>
                    <td className="py-2.5 px-4 text-center font-mono text-emerald-700 font-semibold">36</td>
                    <td className="py-2.5 px-4 text-center font-mono text-[#CC0000]">4</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="font-mono font-bold text-xs text-emerald-700">90.0%</span>
                      <span className="block text-[10px] text-emerald-600 font-semibold">Normal</span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Upcoming Events & Study Materials Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming College & Department Events (Spec 16) */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
            <div>
              <h2 className="text-sm font-bold text-[#1F2937]">College &amp; Department Events</h2>
              <p className="text-[11px] text-[#6B7280]">Symposiums, technical workshops &amp; hackathons</p>
            </div>
            <Link
              href="/dashboard/events"
              className="text-xs text-[#003399] hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {liveEvents.length > 0 ? (
              liveEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border border-[#E5E7EB] bg-[#F7F8FA] text-[#1F2937]">
                        {event.category}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">{formatDate(event.date)}</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#1F2937] mt-1 truncate">{event.name}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-[#6B7280] mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#003399]" /> {event.time}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#CC0000]" /> {event.venue}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/events"
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-[#003399] border border-[#003399]/30 rounded hover:bg-blue-50 transition-colors"
                  >
                    VIEW
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#6B7280]">
                No upcoming events scheduled at this moment.
              </div>
            )}
          </div>
        </div>

        {/* Study Materials & Document List (Spec 13) */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA]">
            <div>
              <h2 className="text-sm font-bold text-[#1F2937]">Recent Study Materials</h2>
              <p className="text-[11px] text-[#6B7280]">Unit notes, syllabus &amp; laboratory manuals</p>
            </div>
            <Link
              href="/dashboard/resources"
              className="text-xs text-[#003399] hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>All Documents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {data.resources.length > 0 ? (
              data.resources.slice(0, 3).map((res) => (
                <div key={res.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1F2937] truncate">{res.name}</p>
                    <p className="text-[10px] text-[#6B7280] uppercase mt-0.5">
                      {res.resourceType?.replace(/_/g, ' ')} • {(res.fileSize / (1024 * 1024)).toFixed(2)} MB • PDF
                    </p>
                  </div>
                  <Link
                    href="/dashboard/resources"
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#003399] border border-[#003399]/30 rounded hover:bg-blue-50 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD</span>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#6B7280]">
                No study materials uploaded yet for this semester.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}