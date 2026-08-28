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
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface EventRecord {
  id: string
  name: string
  description?: string | null
  category: string
  semester?: 'ALL' | 'sem3' | 'sem5' | 'sem7' | string
  semesterLabel?: string
  registrationInfo?: string | null
  registrationUrl?: string | null
  date: string
  time: string
  venue: string
  organizer: string
  status: string
}

export const DEFAULT_ACTIVE_ODD_SEMESTER_EVENTS: EventRecord[] = [
  // Semester 3 (Year 2 - Sophomore)
  {
    id: 'ev_s3_1',
    name: 'Python DSA & OOP Algorithms Bootcamp 2026',
    description: 'Intensive 2-day hands-on algorithmic bootcamp on Advanced Data Structures, recursion, and Object-Oriented System Architecture with live competitive coding benchmarks.',
    category: 'Workshop',
    semester: 'sem3',
    semesterLabel: 'Semester 3 (Yr 2)',
    date: '2026-09-16',
    time: '09:30 AM - 04:30 PM',
    venue: 'Data Structures Lab (Room 203) · AI & DS Block',
    organizer: 'Dr. S. Karthik · AI & DS Dept',
    status: 'published',
  },
  {
    id: 'ev_s3_2',
    name: 'DBMS & Relational Query Optimization Hackathon',
    description: '24-hour SQL and MongoDB database indexing, query execution optimization, and data normalization challenge with cash prizes.',
    category: 'Hackathon',
    semester: 'sem3',
    semesterLabel: 'Semester 3 (Yr 2)',
    date: '2026-09-25',
    time: '10:00 AM - 04:30 PM',
    venue: 'Database Engineering Lab (Room 205) · AI & DS Block',
    organizer: 'Mrs. R. Priya · AI & DS Dept',
    status: 'published',
  },

  // Semester 5 (Year 3 - Junior)
  {
    id: 'ev_s5_1',
    name: 'AWS Cloud & DevOps Enterprise Architect Masterclass',
    description: 'Production-grade AWS microservices, serverless functions, EC2 clusters, and automated container pipelines deployment workshop led by certified industry architects.',
    category: 'Workshop',
    semester: 'sem5',
    semesterLabel: 'Semester 5 (Yr 3)',
    date: '2026-09-19',
    time: '09:15 AM - 04:30 PM',
    venue: 'Cloud Service Management Lab (Room 304) · AI & DS Block',
    organizer: 'Dr. S. Karthik · AI & DS Dept',
    status: 'published',
  },
  {
    id: 'ev_s5_2',
    name: 'National Deep Learning & Vision AI Hackathon',
    description: 'National-level Computer Vision and Generative Deep Learning hackathon focusing on Healthcare Diagnostics, Robotics, and Smart City automation.',
    category: 'Hackathon',
    semester: 'sem5',
    semesterLabel: 'Semester 5 (Yr 3)',
    date: '2026-10-08',
    time: '09:00 AM - 05:00 PM',
    venue: 'AI Innovation Hub · Academic Block',
    organizer: 'Dr. M. Sowmya · AI & DS Dept',
    status: 'published',
  },
  {
    id: 'ev_s5_3',
    name: 'Industry Big Data & Predictive Business Analytics Summit',
    description: 'Guest seminar by senior analytics directors on PySpark stream processing, business intelligence dashboards, and revenue forecasting.',
    category: 'Seminar',
    semester: 'sem5',
    semesterLabel: 'Semester 5 (Yr 3)',
    date: '2026-10-14',
    time: '02:00 PM - 04:30 PM',
    venue: 'Department Auditorium (Hall 2)',
    organizer: 'Mr. S. Arun · AI & DS Dept',
    status: 'published',
  },

  // Semester 7 (Year 4 - Senior)
  {
    id: 'ev_s7_1',
    name: 'National AI Capstone & Innovation Project Expo 2026',
    description: 'Final year research exhibition where senior students showcase patents, funded prototypes, and commercial enterprise AI software to industry evaluators.',
    category: 'Symposium',
    semester: 'sem7',
    semesterLabel: 'Semester 7 (Yr 4)',
    date: '2026-09-28',
    time: '09:30 AM - 05:00 PM',
    venue: 'VSB Convention Center · Main Campus',
    organizer: 'Dr. S. Karthik (Professor & Head)',
    status: 'published',
  },
  {
    id: 'ev_s7_2',
    name: 'Corporate AI Leadership & High-Tier Placement Bootcamp',
    description: 'Advanced technical mock interviews, scalable system design interviews, and corporate AI readiness program tailored for Tier-1 product companies.',
    category: 'Workshop',
    semester: 'sem7',
    semesterLabel: 'Semester 7 (Yr 4)',
    date: '2026-10-10',
    time: '09:15 AM - 04:30 PM',
    venue: 'Innovation & Placement Wing (Room 401)',
    organizer: 'Dr. M. Sowmya · Placement Coordinator',
    status: 'published',
  },

  // All Active Semesters (Department-Wide)
  {
    id: 'ev_all_1',
    name: 'INNOVAIT 2026 — Annual Department Symposium & CodeFest',
    description: 'Flagship intra-college technical festival featuring multi-track coding, technical paper presentations, AI quiz contests, and startup pitch rounds.',
    category: 'Symposium',
    semester: 'ALL',
    semesterLabel: 'All Active Semesters (3, 5, 7)',
    date: '2026-10-15',
    time: '09:00 AM - 05:30 PM',
    venue: 'Main Institutional Auditorium · V.S.B.',
    organizer: 'Department of AI & DS Council',
    status: 'published',
  },
]

const SEMESTER_OPTIONS = [
  { key: 'ALL', label: 'All Active Sems (3, 5, 7)', shortLabel: 'All Active Sems', yr: 'All Years' },
  { key: 'sem3', label: 'Semester 3 · Year 2 (Sophomore)', shortLabel: 'Sem 3 (Yr 2)', yr: 'Year 2' },
  { key: 'sem5', label: 'Semester 5 · Year 3 (Junior)', shortLabel: 'Sem 5 (Yr 3)', yr: 'Year 3' },
  { key: 'sem7', label: 'Semester 7 · Year 4 (Senior)', shortLabel: 'Sem 7 (Yr 4)', yr: 'Year 4' },
]

export function AdminEventsView({ initialEvents }: { initialEvents: EventRecord[] }) {
  // Initialize events state; if initialEvents is empty, preload default semester-wise events
  const [events, setEvents] = useState<EventRecord[]>(() => {
    if (initialEvents && initialEvents.length > 0) {
      return initialEvents.map((ev) => {
        let sem: any = (ev as any).semester || 'ALL'
        if (ev.registrationInfo && ['sem3', 'sem5', 'sem7', 'ALL'].includes(ev.registrationInfo)) {
          sem = ev.registrationInfo
        }
        return {
          ...ev,
          semester: sem,
          semesterLabel:
            sem === 'sem3'
              ? 'Semester 3 (Yr 2)'
              : sem === 'sem5'
              ? 'Semester 5 (Yr 3)'
              : sem === 'sem7'
              ? 'Semester 7 (Yr 4)'
              : 'All Active Semesters (3, 5, 7)',
        }
      })
    }
    return DEFAULT_ACTIVE_ODD_SEMESTER_EVENTS
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Workshop',
    targetSemester: 'sem3',
    date: '2026-09-20',
    time: '09:30 AM - 04:30 PM',
    venue: 'AI & DS Academic Block',
    organizer: 'Department of AI & DS',
  })

  // Filtered Events based on Semester and Category
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Semester match: If filter is ALL, show everything. Otherwise match exact sem or ALL events
      const matchesSemester =
        semesterFilter === 'ALL' ||
        e.semester === semesterFilter ||
        e.semester === 'ALL' ||
        !e.semester

      const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter

      const matchesSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.semesterLabel && e.semesterLabel.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesSemester && matchesCategory && matchesSearch
    })
  }, [events, semesterFilter, categoryFilter, searchQuery])

  // PDF Export
  const handleExportPDF = () => {
    const semName =
      semesterFilter === 'ALL'
        ? 'Active Odd Semesters (3, 5 & 7)'
        : semesterFilter === 'sem3'
        ? 'Semester 3 (Year 2)'
        : semesterFilter === 'sem5'
        ? 'Semester 5 (Year 3)'
        : 'Semester 7 (Year 4)'

    generateAndDownloadPDF({
      title: `DEPARTMENT OF AI & DS — TECHNICAL EVENTS CALENDAR (${semName.toUpperCase()})`,
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Department Administrator',
      category: 'Department Programs & Technical Events Schedule',
      sections: [
        {
          heading: '1. EXECUTIVE OVERVIEW',
          body: [
            `Active Scope: ${semName}`,
            `Total Scheduled Department Programs: ${filteredEvents.length} Technical Events`,
            'Curriculum Tracks: National Hackathons, Hands-on Workshops, Research Symposia & Guest Lectures',
          ],
        },
        {
          heading: '2. CALENDAR OF SCHEDULED SEMESTER EVENTS',
          body: filteredEvents.map(
            (e, idx) =>
              `${idx + 1}. "${e.name}" — [${e.semesterLabel || 'All Sems'}] | Category: ${e.category} | Date: ${e.date} (${e.time}) | Venue: ${e.venue}`
          ),
        },
      ],
      fileName: `VSB_AI_DS_Events_${semesterFilter}_2026`,
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
            `Target Audience: ${ev.semesterLabel || 'All Active Semesters'}`,
            `Event Category: ${ev.category}`,
            `Date & Time: ${ev.date} · ${ev.time}`,
            `Official Venue: ${ev.venue}`,
            `Faculty Convener: ${ev.organizer}`,
          ],
        },
        {
          heading: '2. PARTICIPATION & RECOGNITION',
          body: [
            'Eligibility: AI & DS students in active odd semesters (Semesters 3, 5, and 7).',
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
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          registrationInfo: formData.targetSemester,
        }),
      })
      const result = await res.json()

      const semLabel =
        formData.targetSemester === 'sem3'
          ? 'Semester 3 (Yr 2)'
          : formData.targetSemester === 'sem5'
          ? 'Semester 5 (Yr 3)'
          : formData.targetSemester === 'sem7'
          ? 'Semester 7 (Yr 4)'
          : 'All Active Semesters (3, 5, 7)'

      const newEv: EventRecord = {
        id: (result.event && result.event.id) || 'ev_' + Date.now(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        semester: formData.targetSemester,
        semesterLabel: semLabel,
        date: formData.date,
        time: formData.time,
        venue: formData.venue.trim() || 'AI & DS Academic Block',
        organizer: formData.organizer.trim() || 'Department of AI & DS',
        status: 'published',
      }

      setEvents([newEv, ...events])
      setIsAddModalOpen(false)
      setFormData({
        name: '',
        description: '',
        category: 'Workshop',
        targetSemester: 'sem3',
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

  // Delete Event
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete event "${name}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      setEvents(events.filter((e) => e.id !== id))
      toast.success(`Event removed from calendar.`)
    } catch (err) {
      console.error(err)
      setEvents(events.filter((e) => e.id !== id))
      toast.success(`Event removed.`)
    }
  }

  // Reset to default institutional events
  const handleResetDefaultEvents = () => {
    if (confirm('Reset to standard semester-wise department programs & hackathons?')) {
      setEvents(DEFAULT_ACTIVE_ODD_SEMESTER_EVENTS)
      toast.success('Calendar loaded with active semester programs!')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Odd Semesters Programs (3, 5, 7)
            </span>
            <span className="text-xs text-gray-300 font-medium">· Technical Hub &amp; Hackathons</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Semester-Wise Events &amp; Workshops</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Browse, manage, and schedule hackathons, technical bootcamps &amp; guest lectures tailored for Semesters 3, 5, and 7
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleResetDefaultEvents}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
            title="Reload standard department programs"
          >
            <CalendarDays className="w-4 h-4 text-[#F4C430]" /> Standard Events
          </button>

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
      {/* SEMESTER FILTER SWITCHER BAR */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-blue-900/5 via-purple-900/5 to-amber-900/5 rounded-3xl p-5 border border-blue-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1455D9] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#071A3D] flex items-center gap-2">
                <span>Select Academic Semester:</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-bold">
                  Active Odd Semesters
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Filter events curated specifically for Year 2, Year 3, or Year 4 students
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-gray-500 font-mono">
            {filteredEvents.length} Events in View
          </span>
        </div>

        {/* Semester Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SEMESTER_OPTIONS.map((s) => {
            const isSelected = semesterFilter === s.key
            const count =
              s.key === 'ALL'
                ? events.length
                : events.filter((e) => e.semester === s.key || e.semester === 'ALL').length

            return (
              <button
                key={s.key}
                onClick={() => setSemesterFilter(s.key)}
                className={cn(
                  'p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 group relative overflow-hidden',
                  isSelected
                    ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-md ring-2 ring-[#1455D9]/20'
                    : 'bg-white hover:bg-blue-50/50 border-gray-200 text-[#071A3D]'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs font-black', isSelected ? 'text-white' : 'text-[#071A3D]')}>
                    {s.shortLabel}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-black font-mono',
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {count} Events
                  </span>
                </div>
                <span className={cn('text-[10px] font-medium', isSelected ? 'text-blue-100' : 'text-gray-400')}>
                  {s.yr}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">All Active Programs</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{events.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">Hackathons, Labs &amp; Seminars</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Semester 3 (Year 2)</p>
          <p className="text-2xl font-black text-blue-700 mt-0.5">
            {events.filter((e) => e.semester === 'sem3' || e.semester === 'ALL').length}
          </p>
          <p className="text-[10px] text-blue-700 font-medium mt-1">DSA &amp; DBMS Bootcamps</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Semester 5 (Year 3)</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">
            {events.filter((e) => e.semester === 'sem5' || e.semester === 'ALL').length}
          </p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Cloud, DL &amp; Big Data</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Semester 7 (Year 4)</p>
          <p className="text-2xl font-black text-indigo-700 mt-0.5">
            {events.filter((e) => e.semester === 'sem7' || e.semester === 'ALL').length}
          </p>
          <p className="text-[10px] text-indigo-700 font-medium mt-1">Project Expo &amp; Placement</p>
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
            Showing {filteredEvents.length} Events
          </span>
        </div>
      </div>

      {/* Events Grid / Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <CalendarDays className="w-12 h-12 text-purple-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Events Found for Selected Filter</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            There are currently no events matching {semesterFilter !== 'ALL' ? semesterFilter.toUpperCase() : 'your criteria'}. Click &ldquo;+ Create New Event&rdquo; to publish an event.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Create New Event
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredEvents.map((ev) => {
            const isSem3 = ev.semester === 'sem3'
            const isSem5 = ev.semester === 'sem5'
            const isSem7 = ev.semester === 'sem7'

            const semBadgeColor = isSem3
              ? 'bg-blue-50 text-[#1455D9] border-blue-200'
              : isSem5
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : isSem7
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'

            const semTagLabel =
              ev.semesterLabel ||
              (isSem3
                ? 'Semester 3 (Yr 2)'
                : isSem5
                ? 'Semester 5 (Yr 3)'
                : isSem7
                ? 'Semester 7 (Yr 4)'
                : 'All Active Semesters (3, 5, 7)')

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

                  <h3 className="font-extrabold text-sm text-[#071A3D] leading-snug">{ev.name}</h3>
                  {ev.description && <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{ev.description}</p>}

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

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownloadBrochure(ev)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Event Brochure (PDF)
                  </button>

                  <button
                    onClick={() => handleDelete(ev.id, ev.name)}
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
      {/* MODAL: ADD SEMESTER-WISE EVENT */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Schedule Semester Event</h3>
                <p className="text-xs text-gray-500">Configure technical programs for active odd semesters</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* Target Semester */}
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Target Academic Semester *</label>
                <select
                  value={formData.targetSemester}
                  onChange={(e) => setFormData({ ...formData, targetSemester: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                >
                  <option value="ALL">All Active Semesters (Sem 3, 5 &amp; 7)</option>
                  <option value="sem3">Semester 3 · Year 2 (Sophomore)</option>
                  <option value="sem5">Semester 5 · Year 3 (Junior)</option>
                  <option value="sem7">Semester 7 · Year 4 (Senior)</option>
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
                  <label className="block font-bold text-[#071A3D] mb-1">Event Date</label>
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
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLoading ? 'Saving...' : 'Publish Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
