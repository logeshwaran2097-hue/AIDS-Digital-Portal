'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import {
  CalendarDays,
  Plus,
  Trash2,
  Download,
  Search,
  Clock,
  MapPin,
  X,
  Sparkles,
  Layers,
  GraduationCap,
  Award,
  Users,
  Building,
  Calendar,
  CheckCircle2,
  Tag,
  BookOpen,
  Filter,
  RotateCcw,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Link2,
  ExternalLink,
  Send,
  Eye,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface EventRecord {
  id: string
  name: string
  description?: string | null
  category: string
  semester?: 'ALL' | 'sem1' | 'sem2' | 'sem3' | 'sem4' | 'sem5' | 'sem6' | 'sem7' | 'sem8' | string
  semesterLabel?: string
  academicYear?: 'ALL' | 'year1' | 'year2' | 'year3' | 'year4' | string
  registrationInfo?: string | null
  registrationUrl?: string | null
  date: string // YYYY-MM-DD
  time: string
  venue: string
  organizer: string
  status: string
}

const MONTHS_LIST = [
  { num: 'ALL', label: 'All 12 Months', short: 'All' },
  { num: '1', label: 'January', short: 'Jan' },
  { num: '2', label: 'February', short: 'Feb' },
  { num: '3', label: 'March', short: 'Mar' },
  { num: '4', label: 'April', short: 'Apr' },
  { num: '5', label: 'May', short: 'May' },
  { num: '6', label: 'June', short: 'Jun' },
  { num: '7', label: 'July', short: 'Jul' },
  { num: '8', label: 'August', short: 'Aug' },
  { num: '9', label: 'September', short: 'Sep' },
  { num: '10', label: 'October', short: 'Oct' },
  { num: '11', label: 'November', short: 'Nov' },
  { num: '12', label: 'December', short: 'Dec' },
]

const YEARS_LIST = [
  { key: 'ALL', label: 'All 4 Academic Years', short: 'All Years', semRange: 'Semesters 1 - 8' },
  { key: 'year1', label: 'Year 1 · Freshman', short: 'Year 1', semRange: 'Sem 1 & Sem 2' },
  { key: 'year2', label: 'Year 2 · Sophomore', short: 'Year 2', semRange: 'Sem 3 & Sem 4' },
  { key: 'year3', label: 'Year 3 · Junior', short: 'Year 3', semRange: 'Sem 5 & Sem 6' },
  { key: 'year4', label: 'Year 4 · Senior', short: 'Year 4', semRange: 'Sem 7 & Sem 8' },
]

const ALL_8_SEMESTERS = [
  { key: 'ALL', label: 'All 8 Sems', yr: 'ALL', yrNum: 'ALL' },
  { key: 'sem1', label: 'Sem 1', yr: 'year1', yrNum: 'Yr 1 (Odd)' },
  { key: 'sem2', label: 'Sem 2', yr: 'year1', yrNum: 'Yr 1 (Even)' },
  { key: 'sem3', label: 'Sem 3', yr: 'year2', yrNum: 'Yr 2 (Odd)' },
  { key: 'sem4', label: 'Sem 4', yr: 'year2', yrNum: 'Yr 2 (Even)' },
  { key: 'sem5', label: 'Sem 5', yr: 'year3', yrNum: 'Yr 3 (Odd)' },
  { key: 'sem6', label: 'Sem 6', yr: 'year3', yrNum: 'Yr 3 (Even)' },
  { key: 'sem7', label: 'Sem 7', yr: 'year4', yrNum: 'Yr 4 (Odd)' },
  { key: 'sem8', label: 'Sem 8', yr: 'year4', yrNum: 'Yr 4 (Even)' },
]

export function AdminEventsView({ initialEvents }: { initialEvents: EventRecord[] }) {
  // Pure database initial state without forced mock data fallback
  const [events, setEvents] = useState<EventRecord[]>(() => {
    if (initialEvents && Array.isArray(initialEvents)) {
      return initialEvents.map((ev) => {
        let sem: any = (ev as any).semester || 'ALL'
        if (ev.registrationInfo && ev.registrationInfo.startsWith('sem')) {
          sem = ev.registrationInfo
        }
        const semNum = sem.replace('sem', '')
        const yrNum = semNum !== 'ALL' && !isNaN(Number(semNum)) ? Math.ceil(Number(semNum) / 2) : 'ALL'
        const yrKey = yrNum !== 'ALL' ? `year${yrNum}` : 'ALL'

        return {
          ...ev,
          semester: sem,
          academicYear: yrKey,
          semesterLabel:
            sem === 'ALL'
              ? 'All 8 Semesters'
              : `Semester ${semNum} (Yr ${yrNum})`,
        }
      })
    }
    return []
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState<string>('ALL')
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL')
  const [monthFilter, setMonthFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Modals & Confirmation Popups
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<EventRecord | null>(null)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)
  const [showClearAllModal, setShowClearAllModal] = useState(false)
  const [isClearingAll, setIsClearingAll] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Workshop',
    targetSemester: 'sem3',
    registrationUrl: '',
    date: '2026-09-20',
    time: '09:30 AM - 04:30 PM',
    venue: 'AI & DS Academic Block',
    organizer: 'Department of AI & DS',
  })
  const [modalMode, setModalMode] = useState<'edit' | 'preview'>('edit')

  // When year filter changes, auto-adjust semester filter
  const handleSelectYear = (yr: string) => {
    setYearFilter(yr)
    if (yr === 'ALL') {
      setSemesterFilter('ALL')
    } else {
      if (semesterFilter !== 'ALL') {
        const semObj = ALL_8_SEMESTERS.find((s) => s.key === semesterFilter)
        if (semObj && semObj.yr !== yr) {
          setSemesterFilter('ALL')
        }
      }
    }
  }

  // When semester filter changes, auto-adjust year filter
  const handleSelectSemester = (sem: string) => {
    setSemesterFilter(sem)
    if (sem !== 'ALL') {
      const semObj = ALL_8_SEMESTERS.find((s) => s.key === sem)
      if (semObj && semObj.yr !== 'ALL') {
        setYearFilter(semObj.yr)
      }
    }
  }

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesYear =
        yearFilter === 'ALL' ||
        e.academicYear === yearFilter ||
        e.academicYear === 'ALL' ||
        !e.academicYear

      const matchesSemester =
        semesterFilter === 'ALL' ||
        e.semester === semesterFilter ||
        e.semester === 'ALL' ||
        !e.semester

      let matchesMonth = true
      if (monthFilter !== 'ALL') {
        const evDate = new Date(e.date)
        const evMonth = String(evDate.getMonth() + 1)
        matchesMonth = evMonth === monthFilter
      }

      const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter

      const matchesSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.semesterLabel && e.semesterLabel.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesYear && matchesSemester && matchesMonth && matchesCategory && matchesSearch
    })
  }, [events, yearFilter, semesterFilter, monthFilter, categoryFilter, searchQuery])

  // PDF Export
  const handleExportPDF = () => {
    if (filteredEvents.length === 0) {
      toast.error('No events available to export.')
      return
    }

    generateAndDownloadPDF({
      title: `DEPARTMENT OF AI & DS — TECHNICAL EVENTS CALENDAR`,
      subtitle: `V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026`,
      author: 'Office of the Department Administrator',
      category: 'Department Programs & Technical Events Schedule',
      sections: [
        {
          heading: '1. EXECUTIVE OVERVIEW & FILTER CRITERIA',
          body: [
            `Academic Year Scope: ${yearFilter.toUpperCase()}`,
            `Semester Scope: ${semesterFilter.toUpperCase()}`,
            `Month Scope: ${monthFilter === 'ALL' ? 'All 12 Months' : MONTHS_LIST.find((m) => m.num === monthFilter)?.label}`,
            `Total Scheduled Events: ${filteredEvents.length} Technical Events`,
          ],
        },
        {
          heading: '2. CALENDAR OF SCHEDULED EVENTS',
          body: filteredEvents.map(
            (e, idx) =>
              `${idx + 1}. "${e.name}" — [${e.semesterLabel || 'All Sems'}] | Category: ${e.category} | Date: ${e.date} (${e.time}) | Venue: ${e.venue}`
          ),
        },
      ],
      fileName: `VSB_AI_DS_Events_${yearFilter}_${semesterFilter}_${monthFilter}`,
    })
  }

  // Brochure Download (PDF)
  const handleDownloadBrochure = (ev: EventRecord) => {
    generateAndDownloadPDF({
      title: ev.name.toUpperCase(),
      subtitle: `V.S.B. Engineering College · Department of AI & DS · ${ev.category} 2026`,
      author: ev.organizer || 'Event Organizing Committee',
      category: 'Official Event Brochure',
      sections: [
        {
          heading: '1. PROGRAM SUMMARY & TARGET SEMESTER',
          body: [
            ev.description ||
              'State-of-the-art technical program designed to empower students with hands-on expertise in next-gen Artificial Intelligence.',
            `Target Academic Year / Semester: ${ev.semesterLabel || 'All 8 Semesters'}`,
            `Event Category: ${ev.category}`,
            `Date & Time: ${ev.date} · ${ev.time}`,
            `Official Venue: ${ev.venue}`,
            `Faculty Convener: ${ev.organizer}`,
          ],
        },
        {
          heading: '2. PARTICIPATION & CERTIFICATION',
          body: [
            'Eligibility: AI & DS students in corresponding academic semesters.',
            'Accredited Certificate of Participation will be issued upon completion.',
            'Direct mentorship and project review by institutional faculty and industry leads.',
          ],
        },
      ],
      fileName: `Brochure_${ev.name.slice(0, 20).replace(/\s+/g, '_')}`,
    })
  }

  // Add Event Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Please enter Event Title')
      return
    }

    setIsLoading(true)
    try {
      const semNum = formData.targetSemester.replace('sem', '')
      const yrNum = semNum !== 'ALL' && !isNaN(Number(semNum)) ? Math.ceil(Number(semNum) / 2) : 'ALL'
      const yrKey = yrNum !== 'ALL' ? `year${yrNum}` : 'ALL'
      const semLabel = semNum === 'ALL' ? 'All 8 Semesters' : `Semester ${semNum} (Yr ${yrNum})`

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          registrationInfo: formData.targetSemester,
          registrationUrl: formData.registrationUrl.trim() || null,
        }),
      })
      const result = await res.json()

      const newEv: EventRecord = {
        id: (result.event && result.event.id) || 'ev_' + Date.now(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        semester: formData.targetSemester,
        semesterLabel: semLabel,
        academicYear: yrKey,
        registrationUrl: formData.registrationUrl.trim() || null,
        date: formData.date,
        time: formData.time,
        venue: formData.venue.trim() || 'AI & DS Academic Block',
        organizer: formData.organizer.trim() || 'Department of AI & DS',
        status: 'published',
      }

      setEvents([newEv, ...events])
      setIsAddModalOpen(false)
      setModalMode('edit')
      setFormData({
        name: '',
        description: '',
        category: 'Workshop',
        targetSemester: 'sem3',
        registrationUrl: '',
        date: '2026-09-20',
        time: '09:30 AM - 04:30 PM',
        venue: 'AI & DS Academic Block',
        organizer: 'Department of AI & DS',
      })
      toast.success(`Event "${newEv.name}" published for ${semLabel}!`)
    } catch (err) {
      console.error(err)
      toast.error('Network error saving event.')
    } finally {
      setIsLoading(false)
    }
  }

  // Execute Pop-up Confirmed Deletion
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return
    setIsDeletingEvent(true)

    try {
      await fetch(`/api/events?id=${encodeURIComponent(eventToDelete.id)}`, { method: 'DELETE' })
      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id))
      toast.success(`Event "${eventToDelete.name}" permanently deleted.`)
      setEventToDelete(null)
    } catch (err) {
      console.error(err)
      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id))
      toast.success(`Event removed from calendar.`)
      setEventToDelete(null)
    } finally {
      setIsDeletingEvent(false)
    }
  }

  // Execute Pop-up Confirmed Purge of All Events
  const handleConfirmClearAll = async () => {
    setIsClearingAll(true)
    try {
      await fetch('/api/events?clearAll=true', { method: 'DELETE' })
      setEvents([])
      toast.success('All events purged from the database.')
      setShowClearAllModal(false)
    } catch (err) {
      console.error(err)
      setEvents([])
      toast.success('Events cleared.')
      setShowClearAllModal(false)
    } finally {
      setIsClearingAll(false)
    }
  }

  // Reset all filters
  const handleResetFilters = () => {
    setYearFilter('ALL')
    setSemesterFilter('ALL')
    setMonthFilter('ALL')
    setCategoryFilter('ALL')
    setSearchQuery('')
    toast.success('All filters reset!')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              8-Semester &amp; Multi-Year Hub
            </span>
            <span className="text-xs text-gray-300 font-medium">· Technical Workshops &amp; Hackathons</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Events, Workshops &amp; Hackathons</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {events.length > 0
              ? `Manage and broadcast ${events.length} active department events across all 8 Semesters, 4 Years & 12 Months`
              : 'Calendar is ready for real event entries · Filter by 8 Semesters, Years, and Months'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          {events.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:text-white"
            >
              <Trash2 className="w-4 h-4 text-red-400" /> Clear All Events
            </button>
          )}

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Calendar (PDF)
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Create New Event
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MULTI-TIER FILTER ENGINE: YEAR WISE, 8 SEMESTERS & MONTH WISE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1455D9] text-white flex items-center justify-center shadow-xs">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#071A3D] flex items-center gap-2">
                <span>Multi-Dimensional Filter Console</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1455D9] border border-blue-200 text-[10px] font-bold">
                  Year · 8 Sems · Month
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Refine technical programs by Academic Year, Specific Semester, and Month of the Year
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(yearFilter !== 'ALL' || semesterFilter !== 'ALL' || monthFilter !== 'ALL' || categoryFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-gray-500" /> Reset Filters
              </button>
            )}
            <span className="text-xs font-bold text-[#1455D9] bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 font-mono">
              {filteredEvents.length} Events in View
            </span>
          </div>
        </div>

        {/* 1. YEAR-WISE SELECTOR */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#1455D9]" /> 1. Academic Year Wise Filter:
            </span>
            <span className="text-[10px] text-gray-400 font-medium font-mono">Years 1 to 4</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {YEARS_LIST.map((y) => {
              const isSelected = yearFilter === y.key
              const count =
                y.key === 'ALL'
                  ? events.length
                  : events.filter((e) => e.academicYear === y.key || e.academicYear === 'ALL').length

              return (
                <button
                  key={y.key}
                  onClick={() => handleSelectYear(y.key)}
                  className={cn(
                    'p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-0.5',
                    isSelected
                      ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs ring-2 ring-[#1455D9]/20'
                      : 'bg-gray-50/80 hover:bg-blue-50/40 border-gray-200 text-[#071A3D]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs font-black', isSelected ? 'text-white' : 'text-[#071A3D]')}>
                      {y.short}
                    </span>
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded-full text-[9px] font-black font-mono',
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      )}
                    >
                      {count}
                    </span>
                  </div>
                  <span className={cn('text-[9px] font-semibold truncate', isSelected ? 'text-blue-100' : 'text-gray-400')}>
                    {y.semRange}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. 8-SEMESTER WISE SELECTOR */}
        <div className="space-y-1.5 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-700" /> 2. 8 Semesters Wise Filter:
            </span>
            <span className="text-[10px] text-gray-400 font-medium font-mono">Semesters 1 through 8</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {ALL_8_SEMESTERS.map((s) => {
              const isSelected = semesterFilter === s.key
              const count =
                s.key === 'ALL'
                  ? events.length
                  : events.filter((e) => e.semester === s.key || e.semester === 'ALL').length

              return (
                <button
                  key={s.key}
                  onClick={() => handleSelectSemester(s.key)}
                  className={cn(
                    'py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5',
                    isSelected
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs ring-2 ring-purple-400/20'
                      : 'bg-white hover:bg-purple-50/50 border-gray-200 text-gray-700'
                  )}
                >
                  <span className={cn('text-xs font-black leading-none', isSelected ? 'text-white' : 'text-[#071A3D]')}>
                    {s.label}
                  </span>
                  <span className={cn('text-[9px] font-semibold', isSelected ? 'text-purple-100' : 'text-gray-400')}>
                    {s.yrNum} ({count})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. MONTH-WISE SELECTOR */}
        <div className="space-y-1.5 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" /> 3. Month Wise Calendar Filter:
            </span>
            <span className="text-[10px] text-gray-400 font-medium font-mono">12 Calendar Months</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-13 gap-1 overflow-x-auto pb-1">
            {MONTHS_LIST.map((m) => {
              const isSelected = monthFilter === m.num
              const count =
                m.num === 'ALL'
                  ? events.length
                  : events.filter((e) => {
                      const d = new Date(e.date)
                      return String(d.getMonth() + 1) === m.num
                    }).length

              return (
                <button
                  key={m.num}
                  onClick={() => setMonthFilter(m.num)}
                  className={cn(
                    'py-1.5 px-1 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border flex flex-col items-center justify-center',
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/20'
                      : 'bg-gray-50/80 hover:bg-amber-50/50 border-gray-200 text-gray-700'
                  )}
                  title={`${m.label} (${count} events)`}
                >
                  <span className="text-[11px] font-black">{m.short}</span>
                  <span className={cn('text-[8.5px] font-mono', isSelected ? 'text-amber-100' : 'text-gray-400')}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">All Active Programs</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{events.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">Across Semesters 1 – 8</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Years 1 &amp; 2 (Fresh &amp; Soph)</p>
          <p className="text-2xl font-black text-blue-700 mt-0.5">
            {events.filter((e) => e.academicYear === 'year1' || e.academicYear === 'year2' || e.academicYear === 'ALL').length}
          </p>
          <p className="text-[10px] text-blue-700 font-medium mt-1">Semesters 1 – 4</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Years 3 &amp; 4 (Junior &amp; Senior)</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">
            {events.filter((e) => e.academicYear === 'year3' || e.academicYear === 'year4' || e.academicYear === 'ALL').length}
          </p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Semesters 5 – 8</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Filtered Results</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">{filteredEvents.length}</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">Matching Criteria</p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search event title, venue, category, or semester..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Event Categories</option>
            <option value="Workshop">Hands-on Workshop</option>
            <option value="Hackathon">National Hackathon</option>
            <option value="Seminar">Guest Seminar / Webinar</option>
            <option value="Symposium">Technical Symposium</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 whitespace-nowrap">
            Showing {filteredEvents.length} of {events.length}
          </span>
        </div>
      </div>

      {/* Events Grid / Clean Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto shadow-inner">
            <CalendarDays className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-[#071A3D] mb-1">
              {events.length === 0 ? 'No Events Scheduled Yet' : 'No Events Found for Selected Filters'}
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {events.length === 0
                ? 'Your calendar is clean and ready. Click "+ Create New Event" to publish workshops, seminars, or hackathons directly into the database.'
                : 'No programs match the selected Year, Semester, or Month. Adjust your filters or reset to view all.'}
            </p>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-3 pt-2">
            {events.length > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" /> + Create First Real Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredEvents.map((ev) => {
            const semNum = ev.semester ? ev.semester.replace('sem', '') : 'ALL'
            const yrNum = semNum !== 'ALL' && !isNaN(Number(semNum)) ? Math.ceil(Number(semNum) / 2) : 'ALL'

            const semBadgeColor =
              yrNum === 1
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : yrNum === 2
                ? 'bg-blue-50 text-[#1455D9] border-blue-200'
                : yrNum === 3
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : yrNum === 4
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'

            const semTagLabel =
              ev.semesterLabel ||
              (semNum === 'ALL' ? 'All 8 Semesters' : `Semester ${semNum} (Year ${yrNum})`)

            const eventDateObj = new Date(ev.date)
            const monthShortName = isNaN(eventDateObj.getTime())
              ? '2026'
              : eventDateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase()
            const dayNumber = isNaN(eventDateObj.getTime()) ? '15' : eventDateObj.getDate()

            return (
              <div
                key={ev.id}
                className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={cn('px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 shadow-2xs', semBadgeColor)}>
                        <GraduationCap className="w-3 h-3" />
                        <span>{semTagLabel}</span>
                      </span>

                      <span className="text-[10px] font-black text-gray-700 px-2.5 py-1 rounded-xl bg-gray-100 border border-gray-200 uppercase">
                        {ev.category}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800 shrink-0">
                      {ev.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-12 h-14 rounded-2xl bg-gradient-to-br from-[#071A3D] to-[#1455D9] text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                      <span className="text-[9.5px] font-black uppercase text-[#F4C430]">{monthShortName}</span>
                      <span className="text-base font-black leading-none">{dayNumber}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-sm text-[#071A3D] leading-snug">{ev.name}</h3>
                      {ev.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">{ev.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100 font-medium">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-[#1455D9] shrink-0" />
                      <span className="font-mono">{ev.date} · {ev.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-[11px] pt-1 border-t border-gray-200/60">
                      <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">Convener: {ev.organizer}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleDownloadBrochure(ev)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Event Brochure (PDF)
                    </button>
                    {ev.registrationUrl && (
                      <a
                        href={ev.registrationUrl.startsWith('http') ? ev.registrationUrl : `https://${ev.registrationUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black flex items-center gap-1.5 transition-colors border border-emerald-200"
                        title={ev.registrationUrl}
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Register Link
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setEventToDelete(ev)}
                    className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* INNOVATIVE POPUP: DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up border border-red-100">
            {/* Modal Header with glowing danger badge */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner border border-red-100">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <button
                onClick={() => setEventToDelete(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-[#071A3D]">Confirm Event Deletion</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete this event from the technical portal?
              </p>
            </div>

            {/* Event Summary Preview Box */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-[#1455D9] text-[10px] font-black">
                  {eventToDelete.semesterLabel || 'All Semesters'}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-gray-200 text-gray-700 text-[10px] font-bold">
                  {eventToDelete.category}
                </span>
              </div>
              <h4 className="font-extrabold text-[#071A3D] text-sm leading-snug">{eventToDelete.name}</h4>
              <div className="flex items-center gap-2 text-gray-500 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-[#1455D9]" />
                <span>{eventToDelete.date} · {eventToDelete.time}</span>
              </div>
            </div>

            {/* Warning Note */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>This record will be permanently deleted from the database and removed from all student dashboards.</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={isDeletingEvent}
                className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel, Keep Event
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingEvent}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingEvent ? 'Deleting...' : 'Yes, Delete Event'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INNOVATIVE POPUP: CLEAR ALL EVENTS CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up border border-red-200">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowClearAllModal(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-red-950">Purge All Department Events?</h3>
              <p className="text-xs text-gray-500 mt-1">
                You are about to delete all <span className="font-bold text-red-600 font-mono">{events.length}</span> scheduled workshops, hackathons, and symposiums from the database.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold space-y-1">
              <p className="flex items-center gap-1.5 font-bold">
                <Flame className="w-4 h-4 text-red-600" /> Irreversible Action
              </p>
              <p className="text-[11px] text-red-700 font-normal">
                This will reset your portal to an empty slate. No student or faculty will see any scheduled events until new ones are created.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                disabled={isClearingAll}
                className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                disabled={isClearingAll}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearingAll ? 'Purging All...' : 'Purge All Events'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD EVENT WITH PREVIEW & PUBLISH AND REGISTRATION LINK */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">
                  {modalMode === 'preview' ? 'Official Event Preview & Verification' : 'Schedule Semester Event'}
                </h3>
                <p className="text-xs text-gray-500">
                  {modalMode === 'preview'
                    ? 'Review official brochure details before publishing to institutional portal'
                    : 'Configure technical programs across 8 semesters and all academic years'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'preview' ? (
              /* High-Fidelity Official Event Preview Card */
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 border border-blue-200 shadow-xs space-y-4">
                  {/* Institutional Header Banner */}
                  <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#071A3D] text-[#F4C430] font-black text-xs flex items-center justify-center shadow-xs">
                        VSB
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-[#071A3D] uppercase tracking-wider">
                          V.S.B. Engineering College
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold">
                          Department of Artificial Intelligence &amp; Data Science
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#1455D9] bg-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      EVENT PREVIEW
                    </span>
                  </div>

                  {/* Category & Semester Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-[#1455D9] border border-blue-200">
                      🏷️ {formData.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200">
                      🎓 {formData.targetSemester === 'ALL' ? 'All 8 Semesters' : `Semester ${formData.targetSemester.replace('sem', '')}`}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-black text-lg text-[#071A3D] leading-snug">
                    {formData.name || 'Untitled Event'}
                  </h3>

                  {/* Description Box */}
                  <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-gray-200 font-medium shadow-xs">
                    {formData.description || 'No detailed description provided.'}
                  </div>

                  {/* Logistics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                      <span className="font-mono font-bold">{formData.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                      <span className="font-mono">{formData.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{formData.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate font-semibold">{formData.organizer}</span>
                    </div>
                  </div>

                  {/* Registration Link Preview Pill */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Link2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-emerald-900 block text-[11px]">Direct Registration Link:</span>
                        <span className="font-mono text-[10px] text-emerald-700 truncate block">
                          {formData.registrationUrl || 'Standard In-Portal Student Entry'}
                        </span>
                      </div>
                    </div>
                    {formData.registrationUrl && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-bold text-[10px] shrink-0">
                        External URL Active
                      </span>
                    )}
                  </div>

                  {/* Authority Stamp */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 font-medium border-t border-blue-100">
                    <span>Authorized Convener: <strong className="text-[#071A3D]">{formData.organizer}</strong></span>
                    <span className="font-mono">Department of AI &amp; DS</span>
                  </div>
                </div>

                {/* Preview Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalMode('edit')}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    ← Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSubmit}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isLoading ? 'Publishing...' : '✓ Confirm & Publish Event'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Event Edit Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!formData.name.trim()) {
                    toast.error('Please enter Event Title')
                    return
                  }
                  setModalMode('preview')
                }}
                className="space-y-4 text-xs"
              >
                {/* Target Semester */}
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Target Semester (Semesters 1 – 8) *</label>
                  <select
                    value={formData.targetSemester}
                    onChange={(e) => setFormData({ ...formData, targetSemester: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="ALL">All 8 Semesters (Department-Wide)</option>
                    <option value="sem1">Semester 1 · Year 1 (Freshman - Odd)</option>
                    <option value="sem2">Semester 2 · Year 1 (Freshman - Even)</option>
                    <option value="sem3">Semester 3 · Year 2 (Sophomore - Odd)</option>
                    <option value="sem4">Semester 4 · Year 2 (Sophomore - Even)</option>
                    <option value="sem5">Semester 5 · Year 3 (Junior - Odd)</option>
                    <option value="sem6">Semester 6 · Year 3 (Junior - Even)</option>
                    <option value="sem7">Semester 7 · Year 4 (Senior - Odd)</option>
                    <option value="sem8">Semester 8 · Year 4 (Senior - Even)</option>
                  </select>
                </div>

                {/* Event Title */}
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deep Learning & Computer Vision Hackathon 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                  />
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#071A3D] mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                    >
                      <option value="Workshop">Hands-on Workshop</option>
                      <option value="Hackathon">National Hackathon</option>
                      <option value="Seminar">Guest Seminar / Webinar</option>
                      <option value="Symposium">Technical Symposium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#071A3D] mb-1">Event Date (Determines Month)</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                    />
                  </div>
                </div>

                {/* Time & Venue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#071A3D] mb-1">Event Timings</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:30 AM - 04:30 PM"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#071A3D] mb-1">Venue Location</label>
                    <input
                      type="text"
                      placeholder="e.g. AI Innovation Hub / Lab 1"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                    />
                  </div>
                </div>

                {/* Individual Registration Link (URL) */}
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-[#1455D9]" />
                      Registration / Application Link (URL)
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">Google Form / External Portal Link</span>
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://forms.gle/xYz123 or https://event.vsb.ac.in/register"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/20 focus:bg-white focus:outline-none focus:border-[#1455D9] font-mono text-xs text-[#071A3D]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Optional. If provided, students will receive this direct link to register for the event.</p>
                </div>

                {/* Organizer */}
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Faculty Convener / Organizer</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. S. Karthik · Head of Department"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Program Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the event, objectives, and agenda..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>👁️ Preview &amp; Confirm Event</span>
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
