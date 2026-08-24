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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface FacultyEventItem {
  id: string
  name: string
  description?: string | null
  category: string
  date: Date
  time: string
  venue: string
  registrationUrl?: string | null
  registrationInfo?: string | null
  createdByName?: string | null
  status: string
  isPublished: boolean
}

export function FacultyEventsView({ initialEvents }: { initialEvents: FacultyEventItem[] }) {
  const [events, setEvents] = useState<FacultyEventItem[]>(initialEvents)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedEvent, setSelectedEvent] = useState<FacultyEventItem | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.venue.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCat =
        selectedCategory === 'ALL' || e.category.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCat
    })
  }, [events, searchQuery, selectedCategory])

  const handleDownloadBrochure = (e: FacultyEventItem) => {
    const d = new Date(e.date)
    generateAndDownloadPDF({
      title: `${e.name.toUpperCase()} (2026)`,
      subtitle: `Department of AI & DS · Category: ${e.category} · Venue: ${e.venue}`,
      author: e.createdByName || 'Dr. S. Karthik (Event Coordinator)',
      category: e.category.toUpperCase(),
      sections: [
        {
          heading: '1. EVENT OVERVIEW & THEMATIC HIGHLIGHTS',
          body: [
            `Event Title: ${e.name}`,
            `Event Category: ${e.category}`,
            `Scheduled Date: ${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`,
            `Timing: ${e.time}`,
            `Official Venue: ${e.venue}`,
            `Faculty Convener: ${e.createdByName || 'Dr. S. Karthik (Professor)'}`,
          ],
        },
        {
          heading: '2. EVENT DESCRIPTION & PROGRAM OUTLINE',
          body: [
            e.description ||
              'A premier academic and technical symposium bringing together AI researchers, students, and industry experts.',
            'Hands-on problem statements and mentor review sessions.',
            'Participation Certificates accredited by Anna University and Autonomous Board.',
          ],
        },
        {
          heading: '3. REGISTRATION & PARTICIPATION GUIDELINES',
          body: [
            'Eligibility: Open to all B.Tech / B.E. engineering students and faculty delegates.',
            'Registration Process: Online verification through V.S.B. AI & DS Portal.',
            'Awards: Cash Prizes, Gold Trophies, and Direct Internship Interviews with AI Companies.',
          ],
        },
      ],
      fileName: `Event_Brochure_${e.category}_${e.id.slice(-4)}`,
    })
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateSuccess(true)
    setTimeout(() => {
      setCreateSuccess(false)
      setShowCreateModal(false)
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Department Events &amp; Workshops
            </span>
            <span className="text-xs text-gray-300 font-medium">· Technical Symposiums</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Events, Hackathons &amp; Workshops Hub</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Dr. S. Karthik · Organize technical symposiums, hackathons, seminars, and track registrations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Create New Event
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Scheduled Events</p>
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">{events.length} Major Events</p>
            <p className="text-[10px] text-gray-400">Current Semester</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs bg-purple-50/20">
          <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">National Hackathon</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">Rs. 1 Lakh Prize</p>
          <p className="text-[10px] text-purple-600 font-semibold">15 Aug 2026</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Total Enrolled</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">148 Students</p>
          <p className="text-[10px] text-green-700 font-semibold">Registered Delegates</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Certificates</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">Autonomous Seal</p>
          <p className="text-[10px] text-amber-700 font-semibold">Anna University Accredited</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, venue or keywords..."
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'Hackathon', label: 'Hackathons' },
            { id: 'Workshop', label: 'Workshops' },
            { id: 'Seminar', label: 'Seminars & Lectures' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0',
                selectedCategory === c.id
                  ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => {
          const d = new Date(e.date)
          const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
          const day = d.getDate()

          return (
            <Card
              key={e.id}
              className="rounded-3xl border-gray-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-14 rounded-2xl bg-gradient-to-br from-[#071A3D] to-[#1455D9] text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                    <span className="text-[9.5px] font-black uppercase text-[#F4C430]">{month}</span>
                    <span className="text-base font-black leading-none">{day}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-bold">
                      {e.category}
                    </span>
                    <h3 className="font-bold text-sm text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug line-clamp-2 mt-1">
                      {e.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {e.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1455D9]" />
                    <span>{e.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="truncate">{e.venue}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedEvent(e)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#071A3D] text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleDownloadBrochure(e)}
                    className="px-3 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Brochure PDF
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1455D9] text-[10px] font-bold">
                  {selectedEvent.category}
                </span>
                <h3 className="text-base font-bold text-[#071A3D] mt-1">{selectedEvent.name}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-2.5 text-xs">
              <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>

              <div className="p-3 rounded-2xl bg-gray-50 border space-y-1.5">
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <CalendarDays className="w-4 h-4 text-[#1455D9]" />
                  <span>Date: {formatDate(selectedEvent.date)} · {selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Venue: {selectedEvent.venue}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <span className="text-[#1455D9] font-bold">Coordinator:</span>
                <span className="font-black text-[#071A3D]">{selectedEvent.createdByName || 'Dr. S. Karthik'}</span>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => handleDownloadBrochure(selectedEvent)}
                className="px-4 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Brochure (PDF)
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Create Department Event</h3>
                <p className="text-xs text-gray-500">Schedule technical symposium, hackathon or workshop</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {createSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#071A3D]">Event Published!</h4>
                <p className="text-xs text-gray-500">Students can now register and view this event on their portal.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Event Name</label>
                  <input type="text" placeholder="e.g. AI & Robotics National Symposium 2026" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" required />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Category</label>
                    <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold">
                      <option>Hackathon</option>
                      <option>Workshop</option>
                      <option>Seminar</option>
                      <option>Guest Lecture</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Event Date</label>
                    <input type="date" defaultValue="2026-09-28" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Time</label>
                    <input type="text" defaultValue="09:00 AM - 04:30 PM" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Venue</label>
                    <input type="text" placeholder="e.g. Main Auditorium" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" required />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Description &amp; Highlights</label>
                  <textarea rows={3} placeholder="Provide details about cash prizes, topics and registration..." className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" required />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]">Publish Event</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
