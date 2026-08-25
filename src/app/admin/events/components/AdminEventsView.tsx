'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface EventRecord {
  id: string
  name: string
  description?: string | null
  category: string
  date: string
  time: string
  venue: string
  organizer: string
  status: string
}

export function AdminEventsView({ initialEvents }: { initialEvents: EventRecord[] }) {
  const [events, setEvents] = useState<EventRecord[]>(initialEvents)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Workshop',
    date: '2026-09-15',
    time: '09:30 AM - 04:30 PM',
    venue: 'AI & DS Lab / Auditorium',
    organizer: 'Department of AI & DS',
  })

  const filteredEvents = events.filter((e) => {
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — TECHNICAL EVENTS CALENDAR',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Department Programs & Technical Events Statement',
      sections: [
        {
          heading: '1. EXECUTIVE OVERVIEW',
          body: [
            `Total Scheduled Department Programs: ${events.length} Major Technical Events`,
            'Event Categories: National Hackathons, PyTorch Workshops & Industry Guest Lectures',
          ],
        },
        {
          heading: '2. CALENDAR OF SCHEDULED EVENTS',
          body: events.map(
            (e, idx) =>
              `${idx + 1}. "${e.name}" — Category: ${e.category} | Date: ${e.date} (${e.time}) | Venue: ${e.venue}`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Events_Schedule_2026',
    })
  }

  const handleDownloadBrochure = (ev: EventRecord) => {
    generateAndDownloadPDF({
      title: ev.name.toUpperCase(),
      subtitle: `V.S.B. Engineering College · Department of AI & DS · ${ev.category} 2026`,
      author: ev.organizer || 'Event Organizing Committee',
      category: 'Official Event Brochure',
      sections: [
        {
          heading: '1. PROGRAM SUMMARY & OBJECTIVES',
          body: [
            ev.description || 'State-of-the-art technical program designed to empower students with hands-on expertise in next-gen Artificial Intelligence.',
            `Event Category: ${ev.category}`,
            `Date & Time: ${ev.date} · ${ev.time}`,
            `Official Venue: ${ev.venue}`,
          ],
        },
      ],
      fileName: `Brochure_${ev.name.slice(0, 20).replace(/\s+/g, '_')}`,
    })
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      alert('Please fill in Event Name')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await res.json()

      if (result.success && result.event) {
        const ev = result.event
        const newEv: EventRecord = {
          id: ev.id,
          name: ev.name,
          description: ev.description,
          category: ev.category,
          date: ev.date ? String(ev.date).split('T')[0] : formData.date,
          time: ev.time,
          venue: ev.venue,
          organizer: ev.createdByName || formData.organizer,
          status: ev.status || 'published',
        }
        setEvents([newEv, ...events])
        setIsAddModalOpen(false)
        setFormData({
          name: '',
          description: '',
          category: 'Workshop',
          date: '2026-09-15',
          time: '09:30 AM - 04:30 PM',
          venue: 'AI & DS Lab / Auditorium',
          organizer: 'Department of AI & DS',
        })
        alert('Event successfully created and saved to database!')
      } else {
        alert(result.message || 'Failed to create event')
      }
    } catch (err) {
      console.error(err)
      alert('Network error saving event.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete event "${name}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setEvents(events.filter((e) => e.id !== id))
      } else {
        alert(result.message || 'Failed to delete event')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting event.')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear ALL events from the database?')) {
      return
    }

    try {
      const res = await fetch('/api/events?clearAll=true', { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setEvents([])
        alert('All events cleared!')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Department Programs &amp; Symposiums
            </span>
            <span className="text-xs text-gray-300 font-medium">· Technical Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Events, Workshops &amp; Hackathons</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {events.length > 0
              ? `Manage and broadcast ${events.length} technical hackathons, workshops & guest seminars`
              : 'Calendar is ready for real event entries'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          {events.length > 0 && (
            <button
              onClick={handleClearAll}
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

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search event title, venue, category..."
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
            <option value="ALL">All Categories</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Workshop">Hands-on Workshop</option>
            <option value="Seminar">Guest Seminar</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
            Showing {filteredEvents.length} Events
          </span>
        </div>
      </div>

      {/* Events Grid / Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <CalendarDays className="w-12 h-12 text-purple-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Events Scheduled Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Click &ldquo;+ Create New Event&rdquo; to publish workshops, guest seminars, or hackathons.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Create First Real Event
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-fuchsia-50 text-fuchsia-700 flex items-center justify-center font-black shrink-0">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-fuchsia-700 px-2 py-0.5 rounded-lg bg-fuchsia-50 border border-fuchsia-200 uppercase">
                        {ev.category}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800 shrink-0">
                    {ev.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#071A3D]">{ev.name}</h3>
                {ev.description && <p className="text-xs text-gray-500 line-clamp-2">{ev.description}</p>}

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100 font-medium">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{ev.date} · {ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-[#1455D9] shrink-0" />
                    <span className="truncate">{ev.venue}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleDownloadBrochure(ev)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Event Brochure (PDF)
                </button>

                <button
                  onClick={() => handleDelete(ev.id, ev.name)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD EVENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Schedule Real Event</h3>
                <p className="text-xs text-gray-500">Record will be saved directly into database</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Machine Learning Workshop 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Workshop">Hands-on Workshop</option>
                    <option value="Hackathon">National Hackathon</option>
                    <option value="Seminar">Guest Seminar / Webinar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Event Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Venue Location</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  {isLoading ? 'Saving...' : 'Publish Event to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
