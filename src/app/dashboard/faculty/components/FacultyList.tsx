'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/portal/states'
import {
  GraduationCap,
  MapPin,
  Search,
  MessageCircle,
  Clock,
  UserCheck,
  BookMarked,
  ShieldCheck,
  Users,
  Copy,
  Check,
  Zap,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn, normalizeIndianPhone } from '@/lib/utils'

interface FacultyDetail {
  id: string
  userId: string
  facultyId: string
  designation: string
  qualification: string
  experience: number
  specialization: string
  subjects: string
  subjectName?: string | null
  classDay?: string | null
  classPeriod?: string | null
  classTime?: string | null
  advisorBatch?: string | null
  advisorYear?: number | null
  advisorSem?: number | null
  advisorSec?: string | null
  facultyType?: string
}

interface FacultyUser {
  id: string
  name: string
  email: string
  phone: string | null
  profileImage: string | null
}

interface StudentInfo {
  id?: string
  userId?: string
  name?: string
  registerNumber?: string
  department?: string
  year?: number
  semester?: number
  section?: string
  advisorName?: string | null
}

interface ClassAdvisorRecord {
  id: string
  facultyId: string
  facultyName: string
  year: number
  section: string
  semester: number
  academicYear: string
}

const AVATAR_GRADIENTS = [
  'from-[#1455D9] to-[#22C7E8]',
  'from-[#6C5CE7] to-[#a29bfe]',
  'from-[#00b894] to-[#00cec9]',
  'from-[#e17055] to-[#fab1a0]',
]

export default function FacultyList({
  users,
  details,
  student,
  classAdvisors,
}: {
  users: FacultyUser[]
  details: FacultyDetail[]
  student?: StudentInfo | null
  classAdvisors?: ClassAdvisorRecord[]
}) {
  // Two distinct views: 'advisors' (Class Advisors) and 'handlers' (Subject Handlers)
  const [activeTab, setActiveTab] = useState<'advisors' | 'handlers'>('advisors')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllAdvisors, setShowAllAdvisors] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeSpeedMenuId, setActiveSpeedMenuId] = useState<string | null>(null)

  const handleCopyPhone = (phone: string | null | undefined, name: string, id: string) => {
    const cleanPhone = normalizeIndianPhone(phone)
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`+91 ${cleanPhone}`)
      setCopiedId(id)
      toast.success(`Copied +91 ${cleanPhone} (${name}) to clipboard!`)
      setTimeout(() => setCopiedId(null), 2500)
    }
  }

  const handleOpenWhatsAppFast = (
    phone: string | null | undefined,
    name: string,
    mode: 'auto' | 'app' | 'web' = 'auto'
  ) => {
    const cleanPhone = normalizeIndianPhone(phone)
    if (!cleanPhone || cleanPhone === '0000000000') {
      toast.error(`WhatsApp contact number for ${name} is unavailable.`)
      return
    }

    const facultySalutation =
      name.trim().startsWith('Dr.') || name.trim().startsWith('Prof.')
        ? name.trim()
        : `Prof. ${name.trim()}`

    const studentName = student?.name?.trim() || 'Student'
    const regNoPart = student?.registerNumber ? ` (Reg No: ${student.registerNumber})` : ''
    const deptPart = student?.department || 'B.Tech AI & DS'
    const yearPart = student?.year ? `Year ${student.year}` : 'Year 2'
    const secPart = student?.section ? `Sec ${student.section}` : 'Sec B'
    const semPart = student?.semester ? ` (Sem ${student.semester})` : ''

    const text = `Respected ${facultySalutation},

Greetings! I am ${studentName}${regNoPart} from ${deptPart}, ${yearPart} - ${secPart}${semPart}.

I am reaching out regarding academic guidance and department portal inquiry.

Thank you!`

    const encoded = encodeURIComponent(text)
    const nativeUrl = `whatsapp://send?phone=91${cleanPhone}&text=${encoded}`
    const webUrl = `https://web.whatsapp.com/send?phone=91${cleanPhone}&text=${encoded}`
    const mobileApiUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encoded}`

    const isMobile =
      typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (mode === 'app') {
      // User explicitly clicked "WhatsApp App (Instant)"
      window.location.href = nativeUrl
      return
    }

    if (mode === 'web') {
      // User explicitly clicked "WhatsApp Web"
      window.open(webUrl, '_blank', 'noopener,noreferrer')
      return
    }

    // Default 'auto' mode:
    // Mobile devices open the WhatsApp application seamlessly via api.whatsapp.com
    // Desktop devices open WhatsApp Web in a clean new tab without intermediate wa.me landing pages
    // (We do NOT trigger both nativeUrl and webUrl simultaneously to avoid duplicate message insertion)
    if (isMobile) {
      window.location.href = mobileApiUrl
    } else {
      window.open(webUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const detailByUser = new Map(details.map((d) => [d.userId, d]))

  // Separate list of Class Advisors
  const advisorUsers = useMemo(() => {
    return users.filter((u) => {
      const d = detailByUser.get(u.id)
      if (!d) return false

      let isAdvisorForStudent = false

      if (showAllAdvisors) {
        if (d.advisorYear || d.advisorBatch || ['advisor', 'both'].includes(d.facultyType || '')) {
          isAdvisorForStudent = true
        }
      } else {
        // 1. Exact Year and Section match in Faculty record
        if (student?.year && student?.section) {
          if (
            d.advisorYear === student.year &&
            d.advisorSec?.trim().toUpperCase() === student.section.trim().toUpperCase()
          ) {
            isAdvisorForStudent = true
          }
        }

        // 2. Advisor Batch text contains the student's year and section
        if (!isAdvisorForStudent && d.advisorBatch && student?.year && student?.section) {
          const batch = d.advisorBatch.toLowerCase()
          const romanYear = ['', 'i', 'ii', 'iii', 'iv'][student.year] || ''
          const matchYear =
            batch.includes(`year ${student.year}`) ||
            batch.includes(`y${student.year}`) ||
            batch.includes(`yr ${student.year}`) ||
            (romanYear && (batch.includes(`year ${romanYear}`) || batch.includes(`${romanYear} year`) || batch.startsWith(`${romanYear} `) || batch.startsWith(`${romanYear}-`)))
          const matchSec =
            batch.includes(`sec ${student.section.toLowerCase()}`) ||
            batch.includes(`section ${student.section.toLowerCase()}`) ||
            batch.includes(`- ${student.section.toLowerCase()}`) ||
            batch.includes(`-${student.section.toLowerCase()}`) ||
            batch.includes(` ${student.section.toLowerCase()}`)
          if (matchYear && matchSec) {
            isAdvisorForStudent = true
          }
        }

        // 3. Match against the student's recorded advisorName
        if (!isAdvisorForStudent && student?.advisorName && student.advisorName.trim()) {
          const assignedName = student.advisorName.toLowerCase().trim()
          const facultyName = u.name.toLowerCase().trim()
          if (facultyName.includes(assignedName) || assignedName.includes(facultyName)) {
            isAdvisorForStudent = true
          }
        }

        // 4. Match against ClassAdvisor allocation table
        if (!isAdvisorForStudent && classAdvisors && classAdvisors.length > 0) {
          const matchCA = classAdvisors.find((ca) => {
            const facultyMatch =
              ca.facultyId === d.facultyId || ca.facultyName.toLowerCase() === u.name.toLowerCase()
            const classMatch =
              (!student?.year || ca.year === student.year) &&
              (!student?.section || ca.section.toUpperCase() === student.section.toUpperCase())
            return facultyMatch && classMatch
          })
          if (matchCA) isAdvisorForStudent = true
        }

        // Fallback only if student has no year/section configured: show faculty with explicit advisor status
        if (!student?.year && !student?.section) {
          if (d.advisorYear || d.advisorBatch || ['advisor', 'both'].includes(d.facultyType || '')) {
            isAdvisorForStudent = true
          }
        }
      }

      if (!isAdvisorForStudent) return false

      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery)) ||
        (d?.advisorBatch && d.advisorBatch.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesSearch
    })
  }, [users, details, student, classAdvisors, searchQuery, showAllAdvisors])

  // Separate list of Subject Handlers: Show course and laboratory subject handlers
  const handlerUsers = useMemo(() => {
    return users.filter((u) => {
      const d = detailByUser.get(u.id)
      if (!d) return false

      const isHandler =
        ['subject_handler', 'both', 'lab_faculty', 'subject'].includes(d.facultyType || '') ||
        Boolean(d.subjectName && d.subjectName.trim()) ||
        Boolean(d.subjects && d.subjects !== '[]' && d.subjects !== '""')

      if (!isHandler) return false

      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery)) ||
        (d?.specialization && d.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d?.subjectName && d.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d?.subjects && d.subjects.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesSearch
    })
  }, [users, details, searchQuery])

  const displayedUsers = activeTab === 'advisors' ? advisorUsers : handlerUsers

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Department Faculty
            </span>
            <span className="text-xs text-gray-300">· Artificial Intelligence &amp; Data Science</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Teaching Faculty &amp; Mentors</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {student?.year && student?.section ? (
              <>
                Official Academic Faculty allocated for <strong>Year {student.year} · Section {student.section}</strong> (Semester {student.semester || 3})
              </>
            ) : (
              <>
                View your assigned <strong>Class Advisors</strong> and <strong>Course Subject Handlers</strong>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
            <p className="text-[10px] text-gray-300 uppercase font-bold">
              {activeTab === 'advisors' ? 'Assigned Advisors' : 'Subject Handlers'}
            </p>
            <p className="text-base font-black text-[#F4C430]">
              {displayedUsers.length} {displayedUsers.length === 1 ? 'Faculty' : 'Professors'}
            </p>
          </div>
        </div>
      </div>

      {/* TWO PRIMARY TABS: CLASS ADVISORS vs SUBJECT HANDLERS */}
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(7,26,61,0.05)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70">
          <button
            type="button"
            onClick={() => setActiveTab('advisors')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer',
              activeTab === 'advisors'
                ? 'bg-gradient-to-r from-[#1455D9] to-[#2563EB] text-white shadow-md shadow-blue-500/20 ring-1 ring-white/20'
                : 'text-slate-600 hover:text-[#071A3D] hover:bg-white/50'
            )}
          >
            <UserCheck className="w-4 h-4" />
            <span>Class Advisors (Mentors)</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                activeTab === 'advisors' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
              )}
            >
              {advisorUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('handlers')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer',
              activeTab === 'handlers'
                ? 'bg-gradient-to-r from-[#1455D9] to-[#2563EB] text-white shadow-md shadow-blue-500/20 ring-1 ring-white/20'
                : 'text-slate-600 hover:text-[#071A3D] hover:bg-white/50'
            )}
          >
            <BookMarked className="w-4 h-4" />
            <span>Subject Handlers (Courses)</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                activeTab === 'handlers' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
              )}
            >
              {handlerUsers.length}
            </span>
          </button>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'advisors'
                ? 'Search advisor by name or mobile...'
                : 'Search handlers by name, subject, or code...'
            }
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/90 border border-slate-200/90 rounded-xl text-xs text-[#071A3D] placeholder:text-slate-400 shadow-2xs focus:ring-4 focus:ring-[#1455D9]/15 focus:border-[#1455D9] transition-all"
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {displayedUsers.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title={`No ${activeTab === 'advisors' ? 'Class Advisors' : 'Subject Handlers'} found`}
            description={
              activeTab === 'advisors'
                ? (showAllAdvisors
                    ? 'No faculty members currently match your search query.'
                    : `No assigned class advisor matches your current enrolled class / section (Year ${student?.year || 2} · Sec ${student?.section || 'B'}).`)
                : 'Try adjusting your search query or check back once department allocations are finalized.'
            }
            icon="👨‍🏫"
          />
          {activeTab === 'advisors' && !showAllAdvisors && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowAllAdvisors(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>View All Department Class Advisors</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {displayedUsers.map((u, idx) => {
            const d = detailByUser.get(u.id)
            const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
            const initials =
              u.name
                .replace(/Dr\.|Mr\.|Mrs\.|Prof\./g, '')
                .trim()
                .split(' ')
                .map((n) => n.charAt(0))
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'FC'

            let subjectsArray: string[] = []
            if (d?.subjects) {
              try {
                subjectsArray = JSON.parse(d.subjects)
              } catch {
                subjectsArray = [d.subjects]
              }
            }

            const advisorLabel =
              d?.advisorBatch ||
              (d?.advisorYear ? `Year ${d.advisorYear} · Sec ${d.advisorSec || 'A'}` : 'Faculty Mentor')

            const isCurrentStudentAdvisor =
              student?.year &&
              d?.advisorYear === student.year &&
              d?.advisorSec?.toUpperCase() === student.section?.toUpperCase()

            return (
              <Card
                key={u.id}
                className="rounded-3xl border-slate-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Top Profile Bar */}
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-16 h-16 rounded-2xl bg-gradient-to-tr text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0 border-2 border-white',
                        gradient
                      )}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-black text-lg text-[#071A3D] group-hover:text-[#1455D9] transition-colors truncate">
                          {u.name}
                        </h3>
                        <Badge variant="role" className="shrink-0 text-[10px] font-bold">
                          {d?.designation || 'Assistant Professor'}
                        </Badge>
                      </div>

                      <p className="text-xs font-semibold text-[#1455D9] mt-0.5 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#1455D9]" />
                        <span>{d?.qualification || 'Department Faculty Member'}</span>
                      </p>

                      <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span>AI Department Faculty Block · Cabin 204</span>
                      </p>
                    </div>
                  </div>

                  {/* Class Advisor Badge / Subject Handled Badge */}
                  {activeTab === 'advisors' ? (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1455D9] flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#1455D9]" />
                        Assigned Class Advisor:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-[#071A3D]">{advisorLabel}</span>
                        {isCurrentStudentAdvisor && (
                          <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                            Your Class
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200/70 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          <BookMarked className="w-4 h-4 text-purple-700" />
                          Courses &amp; Subjects Handled:
                        </span>
                        {d?.classTime && (
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {d.classTime}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {d?.subjectName && (
                          <span className="px-2.5 py-1 rounded-xl bg-white text-[#071A3D] text-xs font-black border border-purple-200 shadow-2xs">
                            {d.subjectName}
                          </span>
                        )}
                        {subjectsArray.length > 0 &&
                          subjectsArray.map((code, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-xl bg-purple-100/90 text-purple-900 text-xs font-mono font-black border border-purple-200 shadow-2xs"
                            >
                              {code}
                            </span>
                          ))}
                        {!d?.subjectName && subjectsArray.length === 0 && (
                          <span className="text-slate-600 font-semibold text-[11px]">
                            AI Department Laboratory &amp; Practical Subject Handler
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Experience
                      </span>
                      <p className="font-black text-[#071A3D] mt-0.5">
                        {d?.experience || 5}+ Years
                      </p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Specialization
                      </span>
                      <p className="font-bold text-purple-700 truncate mt-0.5">
                        {d?.specialization || 'Artificial Intelligence & Data Science'}
                      </p>
                    </div>
                  </div>

                  {/* Contact Action Footer: WHATSAPP ONLY */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#25D366] border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                          {activeTab === 'advisors' ? 'Advisor WhatsApp' : 'Faculty WhatsApp'}
                        </span>
                        <span className="font-mono font-black text-xs text-[#071A3D] truncate block">
                          +91 {normalizeIndianPhone(u.phone)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 relative">
                      {/* 1-Click Copy Phone Number Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(u.phone, u.name, u.id)}
                        className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
                        title="Copy phone number directly"
                      >
                        {copiedId === u.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[11px] font-bold text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[11px] hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>

                      {/* Main Fast WhatsApp Button Group */}
                      <div className="relative flex items-center">
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsAppFast(u.phone, u.name, 'auto')}
                          className="px-3.5 py-2 rounded-l-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
                          title={`Fast message ${u.name} on WhatsApp`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </button>

                        {/* Dropdown Toggle for Quick Launch Modes */}
                        <button
                          type="button"
                          onClick={() => setActiveSpeedMenuId(activeSpeedMenuId === u.id ? null : u.id)}
                          className="px-1.5 py-2 rounded-r-xl bg-[#1eb855] hover:bg-[#1a9e49] text-white text-xs font-bold border-l border-white/20 transition-all cursor-pointer"
                          title="WhatsApp speed launch options"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Launch Options Popover */}
                        {activeSpeedMenuId === u.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveSpeedMenuId(null)}
                            />
                            <div className="absolute right-0 bottom-full mb-2 z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 animate-in fade-in zoom-in-95">
                              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                WhatsApp Fast Launcher
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSpeedMenuId(null)
                                  handleOpenWhatsAppFast(u.phone, u.name, 'app')
                                }}
                                className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <div>
                                  <div className="leading-tight">WhatsApp App (Instant)</div>
                                  <div className="text-[10px] font-normal text-slate-400">0s load · Windows / Phone App</div>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSpeedMenuId(null)
                                  handleOpenWhatsAppFast(u.phone, u.name, 'web')
                                }}
                                className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-800 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                                <div>
                                  <div className="leading-tight">WhatsApp Web</div>
                                  <div className="text-[10px] font-normal text-slate-400">Direct link (skips redirects)</div>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSpeedMenuId(null)
                                  handleCopyPhone(u.phone, u.name, u.id)
                                }}
                                className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <div>
                                  <div className="leading-tight">Copy +91 {normalizeIndianPhone(u.phone)}</div>
                                  <div className="text-[10px] font-normal text-slate-400">Paste in any messenger</div>
                                </div>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}