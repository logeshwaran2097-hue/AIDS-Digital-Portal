'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  BookOpen,
  Users,
  CalendarDays,
  Database,
  FileQuestion,
  FolderOpen,
  Megaphone,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Plus,
  Search,
  Upload,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  X,
  FlaskConical,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { StaffOnboardingModal } from '@/components/auth/StaffOnboardingModal'

export interface AssignedSubjectItem {
  code: string
  name: string
  batch: string
  students: number
  hoursConducted: number
  nextClass: string
  attendanceAvg: string
}

export interface TimetableSlotItem {
  time: string
  subject: string
  room: string
  type: string
  status: string
}

interface FacultyData {
  user: { name: string; email: string; phone?: string | null; profileImage?: string | null; mustChangePassword?: boolean }
  faculty: {
    facultyId: string
    designation: string
    qualification: string
    experience: number
    specialization: string
    subjects: string
    subjectName?: string | null
    advisorBatch?: string | null
    advisorYear?: number | null
    advisorSem?: number | null
    advisorSec?: string | null
    facultyType?: string
    dateOfBirth?: string | null
    classPeriod?: string | null
  } | null
  totalStudents: number
  totalSubjects: number
  resourcesCount: number
  questionPapersCount: number
  attendanceAvg?: string
  assignedSubjects?: AssignedSubjectItem[]
  todayTimetable?: TimetableSlotItem[]
  isAdvisor?: boolean
}

export function FacultyDashboardView({ data }: { data: FacultyData }) {
  const facultyKey = data.faculty?.facultyId || data.user?.email || 'faculty'
  const isInitialNeedsOnboarding = Boolean(data.user?.mustChangePassword)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [odList, setOdList] = useState<{ id: string; studentName: string; regNo: string; event: string; date: string; type: string }[]>([])
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const isClassAdvisor =
    typeof data.isAdvisor === 'boolean'
      ? data.isAdvisor
      : (data.faculty?.facultyType === 'advisor' ||
        data.faculty?.facultyType === 'both' ||
        Boolean(data.faculty?.advisorBatch || (data.faculty?.advisorYear && data.faculty?.advisorSec)))

  const quickNav = useMemo(() => [
    { label: 'Mark Attendance', href: '/faculty-dashboard/attendance', icon: <UserCheck className="w-5 h-5" />, bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20' },
    { label: 'Students', href: '/faculty-dashboard/students', icon: <Users className="w-5 h-5" />, bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20' },
    { label: 'My Subjects', href: '/faculty-dashboard/subjects', icon: <BookOpen className="w-5 h-5" />, bg: 'bg-[#1455D9]/10 text-[#1455D9] border-[#1455D9]/20 hover:bg-[#1455D9]/20' },
    { label: 'Laboratory', href: '/faculty-dashboard/laboratory', icon: <FlaskConical className="w-5 h-5" />, bg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/20' },
    { label: 'Upload Resources', href: '/faculty-dashboard/resources', icon: <Database className="w-5 h-5" />, bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20' },
    { label: 'Question Papers', href: '/faculty-dashboard/question-papers', icon: <FileQuestion className="w-5 h-5" />, bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20' },
    { label: 'Circular Notices', href: '/faculty-dashboard/announcements', icon: <Megaphone className="w-5 h-5" />, bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20' },
  ], [])

  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isCompletedLocally =
      localStorage.getItem(`vsb_staff_onboarding_done_${facultyKey}`) === 'true' ||
      sessionStorage.getItem(`vsb_staff_onboarding_done_${facultyKey}`) === 'true'

    const queryTrigger = searchParams?.get('onboarding') === '1'
    const isProfileIncomplete = !data.faculty?.qualification || data.faculty.qualification.trim().length === 0
    const dismissedThisSession = sessionStorage.getItem(`vsb_staff_onboarding_dismissed_${facultyKey}`) === 'true'

    if (queryTrigger || ((!isCompletedLocally || isProfileIncomplete || isInitialNeedsOnboarding) && !dismissedThisSession)) {
      setIsOnboardingOpen(true)
    } else {
      setIsOnboardingOpen(false)
    }
  }, [facultyKey, isInitialNeedsOnboarding, searchParams, data.faculty?.qualification])

  const assignedSubjects = data.assignedSubjects || []
  const todayTimetable = data.todayTimetable || []

  const handleApproveOD = (id: string, name: string) => {
    setOdList((prev) => prev.filter((o) => o.id !== id))
    setActionSuccess(`Approved On-Duty Request for ${name}!`)
    setTimeout(() => setActionSuccess(null), 2500)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* First-Time Staff Onboarding Wizard */}
      <StaffOnboardingModal
        isOpen={isOnboardingOpen}
        role={isClassAdvisor ? 'advisor' : 'faculty'}
        onClose={() => {
          setIsOnboardingOpen(false)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`vsb_staff_onboarding_dismissed_${facultyKey}`, 'true')
          }
        }}
        initialData={{
          name: data?.user?.name || 'Faculty Member',
          email: data?.user?.email || '',
          phone: data?.user?.phone || '',
          designation: data?.faculty?.designation || '',
          qualification: data?.faculty?.qualification || '',
          experience: data?.faculty?.experience || 0,
          specialization: data?.faculty?.specialization || '',
          advisorBatch: data?.faculty?.advisorBatch || null,
          advisorYear: data?.faculty?.advisorYear || null,
          advisorSem: data?.faculty?.advisorSem || null,
          advisorSec: data?.faculty?.advisorSec || null,
          subjects: data?.faculty?.subjectName || (data?.assignedSubjects && data.assignedSubjects.length > 0 ? data.assignedSubjects.map(s => s.name).join(', ') : (data?.faculty?.subjects && data.faculty.subjects !== '[]' ? data.faculty.subjects : 'Artificial Intelligence & Data Science')),
          department: 'B.Tech Artificial Intelligence & Data Science',
          dateOfBirth: data?.faculty?.dateOfBirth || '',
          profileImage: data?.user?.profileImage || '',
        }}
        onComplete={(updated) => {
          setIsOnboardingOpen(false)
          if (typeof window !== 'undefined') {
            localStorage.setItem(`vsb_staff_onboarding_done_${facultyKey}`, 'true')
            sessionStorage.setItem(`vsb_staff_onboarding_done_${facultyKey}`, 'true')
            sessionStorage.removeItem(`vsb_staff_onboarding_dismissed_${facultyKey}`)
          }
          if (updated?.name && data?.user) {
            data.user.name = updated.name
          }
          if (updated?.email && data?.user) {
            data.user.email = updated.email
          }
          if (updated?.phone && data?.user) {
            data.user.phone = updated.phone
          }
        }}
      />
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#051330] via-[#071A3D] to-[#1455D9] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute right-0 bottom-0 w-80 h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#22C7E8]/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0 ring-4 ring-white/10">
              {(data?.user?.name || 'Faculty Member').replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.)\s*/, '').charAt(0) || 'F'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs",
                  data?.faculty?.facultyType === 'lab_faculty'
                    ? "bg-[#22C7E8] text-[#051330]"
                    : "bg-[#F4C430] text-[#071A3D]"
                )}>
                  {isClassAdvisor ? 'Class Advisor' : data?.faculty?.facultyType === 'lab_faculty' ? 'Lab Handler' : 'Faculty Member'}
                </span>
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Department of AI &amp; DS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight text-white">{data?.user?.name || 'Faculty Member'}</h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono mt-0.5">
                {data?.faculty?.designation || 'Faculty'} {data?.faculty?.qualification ? `· ${data.faculty.qualification}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/faculty-dashboard/attendance"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#22C7E8] to-[#0EA5E9] hover:brightness-105 text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-[0_4px_16px_rgba(34,199,232,0.35)] shrink-0 hover:scale-102 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" /> Mark Daily Attendance
            </Link>
          </div>
        </div>

        {/* Academic KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/[0.08] backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xs">
            {isClassAdvisor && data.totalSubjects === 0 ? (
              <>
                <p className="text-[10px] text-slate-300 uppercase font-bold">Class Advisory Scope</p>
                <p className="text-xl font-black text-[#F4C430] mt-0.5">
                  {data.faculty?.advisorBatch || (data.faculty?.advisorYear ? `Year ${data.faculty.advisorYear} · Sec ${data.faculty.advisorSec || 'B'}` : 'Year 2 · Sec B')}
                </p>
                <p className="text-[10px] text-slate-300">Class Advisor In-Charge</p>
              </>
            ) : (
              <>
                <p className="text-[10px] text-slate-300 uppercase font-bold">Allocated Courses</p>
                <p className="text-xl font-black text-[#F4C430] mt-0.5">{data.totalSubjects} Subject{data.totalSubjects === 1 ? '' : 's'}</p>
                <p className="text-[10px] text-slate-300">Curriculum &amp; Labs</p>
              </>
            )}
          </div>

          <div className="bg-white/[0.08] backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xs">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Enrolled Students</p>
            <p className="text-xl font-black text-emerald-300 mt-0.5">{data.totalStudents} Student{data.totalStudents === 1 ? '' : 's'}</p>
            <p className="text-[10px] text-gray-300">{data.faculty?.advisorBatch || (data.faculty?.facultyType === 'lab_faculty' ? 'Practical Lab Sessions' : 'Class Advisor Scope')}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Batch Attendance Avg</p>
            <p className="text-xl font-black text-[#22C7E8] mt-0.5">{data.attendanceAvg || '—'}</p>
            <p className="text-[10px] text-emerald-300">Recorded Sessions</p>
          </div>

          {isClassAdvisor ? (
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <p className="text-[10px] text-gray-300 uppercase font-bold">Class Advisor Scope</p>
              <p className="text-xl font-black text-amber-300 mt-0.5">{data.totalStudents} Students</p>
              <p className="text-[10px] text-amber-200">Advisory Jurisdiction</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <p className="text-[10px] text-gray-300 uppercase font-bold">Faculty Status</p>
              <p className="text-xl font-black text-emerald-300 mt-0.5">Active</p>
              <p className="text-[10px] text-emerald-200">Department Faculty</p>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Quick Action Navigation Tiles */}
      <section aria-label="Faculty Quick Navigation">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-gray-200 bg-white text-[#071A3D] hover:shadow-md transition-all duration-200 group text-center space-y-2 hover:border-[#1455D9]/40"
            >
              <div className={cn('p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-200 border', item.bg)}>
                {item.icon}
              </div>
              <span className="text-[11px] font-bold text-gray-700 group-hover:text-[#1455D9] transition-colors line-clamp-1">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Grid: Allocated Courses & Today's Schedule */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Allocated Subject Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#071A3D] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1455D9]" />
              <span>{isClassAdvisor && assignedSubjects.length === 0 ? 'Class Advisory Overview' : 'Allocated Subjects & Class Performance'}</span>
            </h2>
            {assignedSubjects.length > 0 && (
              <Link href="/faculty-dashboard/subjects" className="text-xs font-bold text-[#1455D9] hover:underline flex items-center gap-1">
                View All Courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {assignedSubjects.length === 0 ? (
              <Card className="rounded-3xl border-gray-200 bg-white shadow-xs">
                <CardContent className="p-6 sm:p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
                    <Users className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-black">
                      <Sparkles className="w-3.5 h-3.5" /> Class Advisor Assignment
                    </div>
                    <h3 className="font-black text-base sm:text-lg text-[#071A3D]">
                      {data.faculty?.advisorBatch || (data.faculty?.advisorYear ? `Year ${data.faculty.advisorYear} · Section ${data.faculty.advisorSec || 'B'}` : 'Year 2 · Section B')}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      You are assigned as the Class Advisor with full student information oversight, attendance management, and parent communication for all {data.totalStudents} enrolled students.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center gap-2.5">
                    <Link
                      href="/faculty-dashboard/students"
                      className="px-4 py-2.5 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Users className="w-4 h-4" /> View All Student Information
                    </Link>
                    <Link
                      href="/faculty-dashboard/attendance"
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" /> Mark Class Attendance
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              assignedSubjects.map((sub) => (
                <Card key={sub.code} className="rounded-3xl border-gray-200 hover:shadow-md transition-all bg-white group hover:border-[#1455D9]/40">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-black text-[#1455D9] px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200/60">
                          {sub.code}
                        </span>
                        <h3 className="font-bold text-sm text-[#071A3D] group-hover:text-[#1455D9] transition-colors">
                          {sub.name}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-gray-400">{sub.batch}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-xs">
                      <div className="p-2 rounded-xl bg-gray-50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Enrolled</p>
                        <p className="font-bold text-[#071A3D] mt-0.5">{sub.students} Students</p>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Hours Taught</p>
                        <p className="font-bold text-[#071A3D] mt-0.5">{sub.hoursConducted} Periods</p>
                      </div>
                      <div className="p-2 rounded-xl bg-green-50 border border-green-100">
                        <p className="text-[10px] text-green-700 font-bold uppercase">Class Attendance</p>
                        <p className="font-black text-green-700 mt-0.5">{sub.attendanceAvg}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-[10px] text-[#1455D9] font-bold uppercase">Next Session</p>
                        <p className="font-bold text-[#1455D9] truncate mt-0.5">{sub.nextClass}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400 font-medium">Department Verified Curriculum</span>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/faculty-dashboard/subjects"
                          className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#071A3D] text-xs font-bold transition-colors"
                        >
                          Manage Syllabus
                        </Link>
                        <Link
                          href="/faculty-dashboard/attendance"
                          className="px-3 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Take Roll Call
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Today's Timetable & Pending OD Approvals */}
        <div className="space-y-6">
          {/* Today's Teaching Schedule */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#071A3D] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#22C7E8]" />
              <span>Today&apos;s Class Schedule</span>
            </h2>

            <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
              <CardContent className="p-4 space-y-3">
                {todayTimetable.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 space-y-1">
                    <Clock className="w-7 h-7 text-gray-300 mx-auto mb-1" />
                    <p className="font-semibold text-gray-600">No scheduled periods for today</p>
                    <p className="text-[11px]">Timetable slots configured by Admin or HOD will be displayed here.</p>
                  </div>
                ) : (
                  todayTimetable.map((slot, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-mono font-bold text-[#1455D9]">{slot.time}</span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase',
                            slot.status === 'Completed' && 'bg-gray-200 text-gray-700',
                            slot.status === 'In-Progress' && 'bg-green-100 text-green-800 animate-pulse',
                            slot.status === 'Upcoming' && 'bg-blue-100 text-[#1455D9]'
                          )}
                        >
                          {slot.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#071A3D] leading-tight">{slot.subject}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400" /> {slot.room} · {slot.type}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Laboratory Practical Activities Quick Access for Course Faculty */}
          {!isClassAdvisor && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#071A3D] flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-cyan-600" />
                  <span>Laboratory Practicals &amp; Topics</span>
                </h2>
                <Link href="/faculty-dashboard/laboratory" className="text-xs font-bold text-[#1455D9] hover:underline flex items-center gap-1">
                  Open Lab <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <Card className="rounded-3xl border-cyan-200/80 bg-gradient-to-br from-cyan-50/40 via-white to-blue-50/30 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-[#1455D9] text-white flex items-center justify-center shadow-md shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#071A3D]">AI &amp; DS Practical Sessions</h3>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Log day-wise experiments, topics covered, and lab trainer activities
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2 border-t border-cyan-100/80 text-xs">
                  <span className="text-[11px] text-gray-600 font-medium">AU Syllabus &amp; NBA Compliant</span>
                  <Link
                    href="/faculty-dashboard/laboratory"
                    className="px-3 py-1.5 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Day&apos;s Lab Activity
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
