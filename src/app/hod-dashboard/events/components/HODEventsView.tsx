'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  CalendarDays,
  Search,
  Download,
  Plus,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Tag,
  Check,
  X,
  Share2,
  Trash2,
  Printer,
  Calendar,
  Building,
  Award,
  BookOpen,
  Filter,
  Eye,
  FileText,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import toast from 'react-hot-toast'

export interface HODEventItem {
  id: string
  name: string
  description?: string | null
  category: string
  date: string
  time: string
  venue: string
  registrationUrl?: string | null
  registrationInfo?: string | null
  createdByName?: string | null
  status: string
  isPublished: boolean
}

export function HODEventsView({
  initialEvents,
  hodName = 'Head of Department',
}: {
  initialEvents: HODEventItem[]
  hodName?: string
}) {
  const [events, setEvents] = useState<HODEventItem[]>(initialEvents)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedEvent, setSelectedEvent] = useState<HODEventItem | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // New Event Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Workshop',
    date: new Date().toISOString().split('T')[0],
    time: '09:30 AM - 04:30 PM',
    venue: 'AI & DS Computing Complex Lab 3',
    registrationInfo: 'ALL',
    registrationUrl: '',
    createdByName: hodName,
  })

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        e.venue.toLowerCase().includes(q) ||
        (e.createdByName && e.createdByName.toLowerCase().includes(q))

      let matchesCat = true
      if (selectedCategory === 'UPCOMING') {
        try {
          matchesCat = new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))
        } catch {
          matchesCat = true
        }
      } else if (selectedCategory !== 'ALL') {
        matchesCat = e.category.toLowerCase() === selectedCategory.toLowerCase()
      }

      return matchesSearch && matchesCat
    })
  }, [events, searchQuery, selectedCategory])

  // Metric counts
  const totalCount = events.length
  const upcomingCount = useMemo(() => {
    return events.filter((e) => {
      try {
        return new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))
      } catch {
        return true
      }
    }).length
  }, [events])

  const hackathonsCount = useMemo(() => {
    return events.filter((e) => /hackathon|contest|challenge|code/i.test(`${e.name} ${e.category}`)).length
  }, [events])

  const workshopsCount = useMemo(() => {
    return events.filter((e) => /workshop|bootcamp|hands-on|training/i.test(`${e.name} ${e.category}`)).length
  }, [events])

  const lecturesCount = useMemo(() => {
    return events.filter((e) => /lecture|keynote|seminar|talk|webinar/i.test(`${e.name} ${e.category}`)).length
  }, [events])

  // Handle Event Creation
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Event title is required')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(`Event "${formData.name}" scheduled & broadcasted!`)
        const newEvent: HODEventItem = {
          ...result.event,
          date: result.event.date
            ? typeof result.event.date === 'string'
              ? result.event.date
              : new Date(result.event.date).toISOString().split('T')[0]
            : formData.date,
        }
        setEvents((prev) => [newEvent, ...prev])
        setShowCreateModal(false)
        setFormData({
          name: '',
          description: '',
          category: 'Workshop',
          date: new Date().toISOString().split('T')[0],
          time: '09:30 AM - 04:30 PM',
          venue: 'AI & DS Computing Complex Lab 3',
          registrationInfo: 'ALL',
          registrationUrl: '',
          createdByName: hodName,
        })
      } else {
        toast.error(result.message || 'Failed to create event')
      }
    } catch {
      toast.error('Network error creating event')
    } finally {
      setCreating(false)
    }
  }

  // Handle Delete Event
  const handleDeleteEvent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete and archive "${name}"?`)) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(`Event "${name}" deleted`)
        setEvents((prev) => prev.filter((e) => e.id !== id))
        if (selectedEvent?.id === id) setSelectedEvent(null)
      } else {
        toast.error(result.message || 'Failed to delete event')
      }
    } catch {
      toast.error('Network error deleting event')
    } finally {
      setDeletingId(null)
    }
  }

  // Download Event Circular PDF
  const handleDownloadBrochure = (e: HODEventItem) => {
    generateAndDownloadPDF({
      title: e.name.toUpperCase(),
      subtitle: `${e.category.toUpperCase()} · DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE`,
      author: e.createdByName || `${hodName} (Head of Department)`,
      category: 'Official College Event Circular',
      sections: [
        {
          heading: '1. EXECUTIVE EVENT BRIEF & PURPOSE',
          body: [
            `Event Designation: ${e.name}`,
            `Category Classification: ${e.category}`,
            `Event Host Institution: V.S.B. Engineering College, Karur`,
            `Department Directorate: Artificial Intelligence & Data Science`,
            `Convenor / Authority: ${e.createdByName || hodName}`,
            `Target Demographic: ${e.registrationInfo || 'Open to All Enrolled AI & DS Cohorts'}`,
            `Brief Overview: ${e.description || 'Department technical activity organized to foster hands-on experiential learning, cutting-edge machine learning problem-solving, and industry readiness.'}`,
          ],
        },
        {
          heading: '2. LOGISTICS, VENUE & SCHEDULE',
          body: [
            `Date of Conduction: ${formatDate(e.date)}`,
            `Timing Schedule: ${e.time}`,
            `Campus Venue: ${e.venue}`,
            `Registration / Portal Enrollment Link: ${e.registrationUrl || 'Internal Institutional Portal Registration'}`,
          ],
        },
        {
          heading: '3. PARTICIPATION & OD SANCTION POLICIES',
          body: [
            'All enrolled attendees and prize winners will receive formal On-Duty (OD) attendance credit.',
            'Participants must check in on event day via the AI&DS Digital Portal with live venue geo-tag verification.',
            'Merit awards and certificates of distinction will be archived in the student achievement vault.',
          ],
        },
      ],
      fileName: `VSB_AI_DS_Event_${e.name.replace(/[^a-zA-Z0-9]/g, '_')}_Circular`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Department Activities
            </span>
            <span className="text-xs text-gray-300">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Events, Workshops &amp; Hackathons</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            Organize, schedule, and review upcoming technical symposiums, hackathons, industry guest lectures, and student coding challenges.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Event</span>
          </button>

          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[90px]">
            <p className="text-[10px] uppercase font-bold text-gray-300">Total Events</p>
            <p className="text-xl font-black text-[#F4C430]">{totalCount}</p>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Events</p>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1455D9] flex items-center justify-center">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#071A3D] mt-1">{totalCount}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Department Portfolio</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-emerald-700 font-bold uppercase">Upcoming Events</p>
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-1">{upcomingCount}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">Scheduled Ahead</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs bg-purple-50/20">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-purple-700 font-bold uppercase">Hackathons</p>
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-800 mt-1">{hackathonsCount}</p>
          <p className="text-[10px] text-purple-600 mt-0.5 font-medium">Coding Contests</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-amber-700 font-bold uppercase">Workshops</p>
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-800 mt-1">{workshopsCount}</p>
          <p className="text-[10px] text-amber-600 mt-0.5 font-medium">Hands-on Labs</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-blue-700 font-bold uppercase">Guest Lectures</p>
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-800 mt-1">{lecturesCount}</p>
          <p className="text-[10px] text-blue-600 mt-0.5 font-medium">Industry Keynotes</p>
        </div>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'ALL' ? 'bg-[#071A3D] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Events ({totalCount})
          </button>
          <button
            onClick={() => setSelectedCategory('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'UPCOMING'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setSelectedCategory('Symposium')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedCategory.toLowerCase() === 'symposium'
                ? 'bg-[#1455D9] text-white shadow-xs'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            Symposiums
          </button>
          <button
            onClick={() => setSelectedCategory('Hackathon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedCategory.toLowerCase() === 'hackathon'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            Hackathons
          </button>
          <button
            onClick={() => setSelectedCategory('Workshop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedCategory.toLowerCase() === 'workshop'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Workshops
          </button>
          <button
            onClick={() => setSelectedCategory('Guest Lecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedCategory.toLowerCase() === 'guest lecture'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-teal-700 hover:bg-teal-50'
            }`}
          >
            Guest Lectures
          </button>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event name, venue, coordinator..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((e) => {
            const isHackathon = /hackathon|contest|code/i.test(`${e.name} ${e.category}`)
            const isSymposium = /symposi/i.test(`${e.name} ${e.category}`)
            const isWorkshop = /workshop|bootcamp/i.test(`${e.name} ${e.category}`)

            return (
              <Card
                key={e.id}
                className="rounded-3xl border-gray-200 hover:shadow-lg transition-all bg-white flex flex-col justify-between overflow-hidden group"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        isHackathon
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : isSymposium
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : isWorkshop
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-teal-100 text-teal-800 border border-teal-200'
                      }`}
                    >
                      {e.category}
                    </span>
                    <span className="text-xs text-gray-500 font-bold flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(e.date)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-black text-base text-[#071A3D] leading-snug group-hover:text-[#1455D9] transition-colors line-clamp-2">
                      {e.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 mt-1.5 leading-relaxed">
                      {e.description || 'Department activity focused on practical hands-on experience and technical readiness.'}
                    </p>
                  </div>

                  {/* Schedule & Venue Details */}
                  <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                    <p className="flex items-center gap-1.5 text-[#1455D9] font-medium">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{e.time}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-gray-600 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span className="truncate">{e.venue}</span>
                    </p>
                    {e.createdByName && (
                      <p className="flex items-center gap-1.5 text-gray-400 text-[11px] truncate">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Coordinator: {e.createdByName}</span>
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedEvent(e)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <button
                        onClick={() => handleDownloadBrochure(e)}
                        className="p-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200 transition cursor-pointer"
                        title="Export Event Circular PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {e.registrationUrl && (
                        <a
                          href={e.registrationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-[#071A3D] hover:bg-[#1455D9] text-white rounded-xl font-bold text-xs inline-flex items-center gap-1 shadow-xs transition"
                        >
                          <span>Register</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteEvent(e.id, e.name)}
                        disabled={deletingId === e.id}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-[#071A3D]">No Department Events Found</h3>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'No events match your search or category filter.'
              : 'There are currently no events scheduled. Click the button below to schedule an upcoming hackathon, symposium, or workshop.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-5 px-5 py-2.5 rounded-2xl bg-[#1455D9] hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Event</span>
          </button>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5 text-[#F4C430]" />
                </div>
                <div>
                  <h3 className="font-black text-base">Schedule Department Event</h3>
                  <p className="text-[11px] text-blue-200">Broadcast to all students and faculty advisors</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. National Level AI Hackathon — HackNova 2026"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 cursor-pointer focus:outline-none"
                  >
                    <option value="Symposium">Technical Symposium</option>
                    <option value="Hackathon">Hackathon / Coding Contest</option>
                    <option value="Workshop">Hands-on Workshop</option>
                    <option value="Guest Lecture">Industry Guest Lecture</option>
                    <option value="Seminar">Research Seminar</option>
                    <option value="Cultural">Department Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Timing Schedule</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 09:30 AM - 04:30 PM"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Venue / Hall / Lab *</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. VSB Central Auditorium / AI Lab 3"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Brief Description &amp; Objectives</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline topics covered, key challenge statements, prize pools, or keynote speakers..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Registration URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    placeholder="https://forms.gle/..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Event Coordinator</label>
                  <input
                    type="text"
                    value={formData.createdByName}
                    onChange={(e) => setFormData({ ...formData, createdByName: e.target.value })}
                    placeholder="Faculty In-charge / HOD"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{creating ? 'Publishing...' : 'Schedule & Broadcast Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5 text-[#F4C430]" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100/20 text-[#F4C430] font-black text-[10px] uppercase">
                    {selectedEvent.category}
                  </span>
                  <h3 className="font-black text-base mt-0.5">{selectedEvent.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* Event Particulars Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Date of Conduction</p>
                  <p className="font-black text-gray-800 mt-0.5 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#1455D9]" />
                    {formatDate(selectedEvent.date)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Timing Schedule</p>
                  <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#1455D9]" />
                    {selectedEvent.time}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Host Campus Venue</p>
                  <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    {selectedEvent.venue}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Event Coordinator</p>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedEvent.createdByName || hodName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Target Cohorts</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {selectedEvent.registrationInfo || 'All Department Classes'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Publication Status</p>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-block mt-0.5">
                    Live in Portal
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="font-black text-xs text-[#071A3D] uppercase tracking-wider">
                  Event Brief &amp; Detailed Curriculum
                </h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  {selectedEvent.description ||
                    'Comprehensive departmental activity designed to bridge academic curriculum with industry challenges and foster collaborative innovation.'}
                </p>
              </div>

              {/* Actions Strip */}
              <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadBrochure(selectedEvent)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#1455D9]" />
                  <span>Download Official Circular PDF</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedEvent.registrationUrl && (
                    <a
                      href={selectedEvent.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#1455D9] hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <span>Registration Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
