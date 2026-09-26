'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/portal/states'
import { formatDate } from '@/lib/utils'
import {
  CalendarDays,
  Clock,
  MapPin,
  Search,
  ExternalLink,
  Sparkles,
  Trophy,
  Users,
  CheckCircle2,
  Calendar,
  Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  name: string
  description: string | null
  category: string
  date: Date
  time: string
  venue: string
  registrationInfo: string | null
  registrationUrl: string | null
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Hackathon: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  Workshop: { bg: 'bg-blue-100', text: 'text-[#1455D9]', border: 'border-blue-200' },
  Seminar: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  Symposium: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
}

function RegistrationForm({ onSubmit, onCancel }: { onSubmit: (e: React.FormEvent) => void; onCancel: () => void }) {
  const [participationType, setParticipationType] = useState('individual')
  const [teamName, setTeamName] = useState('')
  const teamCount = participationType === 'team2' ? 2 : participationType === 'team4' ? 4 : 0
  const [members, setMembers] = useState(
    Array.from({ length: 4 }, () => ({ name: '', regNo: '', dept: 'AI & DS' }))
  )

  const updateMember = (idx: number, field: string, value: string) => {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
      <div>
        <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
        <input
          type="text"
          placeholder="Your full name"
          required
          className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-[#003399] focus:border-[#003399]"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Reg. Number</label>
          <input
            type="text"
            placeholder="Your register number"
            required
            className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-mono font-medium focus:ring-1 focus:ring-[#003399] focus:border-[#003399]"
          />
        </div>
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Participation Type</label>
          <select
            value={participationType}
            onChange={(e) => setParticipationType(e.target.value)}
            className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-[#003399] focus:border-[#003399]"
          >
            <option value="individual">Individual Entry</option>
            <option value="team2">Team (2 Members)</option>
            <option value="team4">Team (4 Members)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="font-semibold text-gray-700 block mb-1">Institutional Email</label>
        <input
          type="email"
          placeholder="Your institutional email"
          required
          className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-[#003399] focus:border-[#003399]"
        />
      </div>

      {teamCount > 0 && (
        <div className="space-y-3 pt-3 border-t border-dashed border-gray-300">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#003399]" />
            <h4 className="font-bold text-xs text-[#1F2937]">Team Details</h4>
            <span className="px-2 py-0.5 bg-blue-50 text-[#003399] border border-blue-200 rounded text-[10px] font-bold">{teamCount} Members</span>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your team name"
              required
              className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-[#003399] placeholder:text-gray-400"
            />
          </div>

          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Member 1 — Team Leader (filled above)</p>

          {Array.from({ length: teamCount - 1 }, (_, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-md border border-[#E5E7EB] space-y-2">
              <p className="text-[10px] font-bold text-[#003399] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#003399] text-white flex items-center justify-center text-[10px]">{i + 2}</span>
                Member {i + 2}
              </p>
              <div>
                <label className="font-semibold text-gray-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={members[i].name}
                  onChange={(e) => updateMember(i, 'name', e.target.value)}
                  placeholder={`Enter member ${i + 2} name`}
                  required
                  className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#003399] placeholder:text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Register No.</label>
                  <input
                    type="text"
                    value={members[i].regNo}
                    onChange={(e) => updateMember(i, 'regNo', e.target.value)}
                    required
                    className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-[#003399]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Department</label>
                  <select
                    value={members[i].dept}
                    onChange={(e) => updateMember(i, 'dept', e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#003399]"
                  >
                    <option>AI &amp; DS</option>
                    <option>CSE</option>
                    <option>IT</option>
                    <option>ECE</option>
                    <option>EEE</option>
                    <option>MECH</option>
                    <option>CIVIL</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-[#E5E7EB] flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-xs font-bold hover:bg-gray-200 transition-colors uppercase tracking-wider"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-[#003399] text-white rounded-md text-xs font-bold hover:bg-[#002266] shadow-xs transition-colors uppercase tracking-wider"
        >
          {teamCount > 0 ? `Register Team (${teamCount})` : 'Confirm Registration'}
        </button>
      </div>
    </form>
  )
}

export default function EventsList({ events }: { events: Event[] }) {
  const [query, setQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState('ALL')
  const [selectedYear, setSelectedYear] = useState('ALL')
  const [selectedSemester, setSelectedSemester] = useState('ALL')
  const [selectedMonth, setSelectedMonth] = useState('ALL')
  const [registeredModalEvent, setRegisteredModalEvent] = useState<Event | null>(null)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.category))
    return ['ALL', ...Array.from(set)]
  }, [events])

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory = selectedCat === 'ALL' || e.category.toLowerCase() === selectedCat.toLowerCase()
      
      const semInfo = e.registrationInfo || 'ALL'
      const semNum = semInfo.replace('sem', '')
      const yrNum = semNum !== 'ALL' && !isNaN(Number(semNum)) ? Math.ceil(Number(semNum) / 2) : 'ALL'
      const yrKey = yrNum !== 'ALL' ? `year${yrNum}` : 'ALL'

      const matchesYear = selectedYear === 'ALL' || yrKey === selectedYear || semInfo === 'ALL'
      const matchesSemester =
        selectedSemester === 'ALL' ||
        semInfo === selectedSemester ||
        semInfo === 'ALL' ||
        e.name.toLowerCase().includes(selectedSemester.toLowerCase())

      let matchesMonth = true
      if (selectedMonth !== 'ALL') {
        const d = new Date(e.date)
        matchesMonth = String(d.getMonth() + 1) === selectedMonth
      }

      const matchesSearch =
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(query.toLowerCase())) ||
        e.venue.toLowerCase().includes(query.toLowerCase())

      return matchesCategory && matchesYear && matchesSemester && matchesMonth && matchesSearch
    })
  }, [events, selectedCat, selectedYear, selectedSemester, selectedMonth, query])

  const featuredEvent = events[0]

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRegistrationSuccess(true)
    setTimeout(() => {
      setRegistrationSuccess(false)
      setRegisteredModalEvent(null)
    }, 2500)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-lg bg-[#002266] text-white p-5 sm:p-6 border border-[#001B4D] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-white/10 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider">
              Department Activities
            </span>
            <span className="text-xs text-blue-200">· V.S.B. Engineering College</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Events, Workshops &amp; Symposia</h1>
          <p className="text-xs text-blue-100/90 mt-1">
            Department of Artificial Intelligence &amp; Data Science — Academic schedule &amp; technical programs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-white/10 rounded-md border border-white/15 text-center">
            <p className="text-[10px] text-blue-200 uppercase font-semibold">Scheduled Events</p>
            <p className="text-base font-bold text-[#FFD700]">{filtered.length} Programs</p>
          </div>
        </div>
      </div>

      {/* Featured Spotlight Card */}
      {featuredEvent && (
        <div className="rounded-lg bg-white p-5 sm:p-6 text-[#1F2937] shadow-xs border border-[#E5E7EB]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#003399] text-white text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                  Featured Event
                </span>
                <span className="text-xs text-gray-500 font-medium">Registration Open</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#003399] leading-snug">
                {featuredEvent.name}
              </h2>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {featuredEvent.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <CalendarDays className="w-3.5 h-3.5 text-[#003399]" /> {formatDate(featuredEvent.date)}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-gray-600" /> {featuredEvent.time}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#CC0000]" /> {featuredEvent.venue}
                </span>
              </div>
            </div>

            <button
              onClick={() => setRegisteredModalEvent(featuredEvent)}
              className="px-5 py-2.5 bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold rounded-md transition-colors shadow-xs shrink-0 flex items-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" /> REGISTER NOW
            </button>
          </div>
        </div>
      )}

      {/* Multi-Dimensional Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-xs space-y-3">
        {/* Academic Year Filter */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">1. Academic Year:</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {[
              { key: 'ALL', label: 'All Years' },
              { key: 'year1', label: 'Year 1' },
              { key: 'year2', label: 'Year 2' },
              { key: 'year3', label: 'Year 3' },
              { key: 'year4', label: 'Year 4' },
            ].map((y) => (
              <button
                key={y.key}
                onClick={() => setSelectedYear(y.key)}
                className={cn(
                  'py-1 px-2 rounded-md text-xs font-semibold text-center transition-colors cursor-pointer border',
                  selectedYear === y.key
                    ? 'bg-[#003399] text-white border-[#003399]'
                    : 'bg-white text-gray-700 border-[#E5E7EB] hover:bg-gray-50'
                )}
              >
                {y.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Semesters Filter */}
        <div className="space-y-1 pt-1 border-t border-[#E5E7EB]">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">2. Semester:</span>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1">
            {[
              { key: 'ALL', label: 'All Sems' },
              { key: 'sem1', label: 'Sem 1' },
              { key: 'sem2', label: 'Sem 2' },
              { key: 'sem3', label: 'Sem 3' },
              { key: 'sem4', label: 'Sem 4' },
              { key: 'sem5', label: 'Sem 5' },
              { key: 'sem6', label: 'Sem 6' },
              { key: 'sem7', label: 'Sem 7' },
              { key: 'sem8', label: 'Sem 8' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSelectedSemester(s.key)}
                className={cn(
                  'py-1 px-1 rounded-md text-xs font-semibold text-center transition-colors cursor-pointer border',
                  selectedSemester === s.key
                    ? 'bg-[#003399] text-white border-[#003399]'
                    : 'bg-white text-gray-700 border-[#E5E7EB] hover:bg-gray-50'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Months Filter */}
        <div className="space-y-1 pt-1 border-t border-[#E5E7EB]">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">3. Month:</span>
          <div className="grid grid-cols-4 sm:grid-cols-13 gap-1 overflow-x-auto">
            {[
              { num: 'ALL', short: 'All' },
              { num: '1', short: 'Jan' },
              { num: '2', short: 'Feb' },
              { num: '3', short: 'Mar' },
              { num: '4', short: 'Apr' },
              { num: '5', short: 'May' },
              { num: '6', short: 'Jun' },
              { num: '7', short: 'Jul' },
              { num: '8', short: 'Aug' },
              { num: '9', short: 'Sep' },
              { num: '10', short: 'Oct' },
              { num: '11', short: 'Nov' },
              { num: '12', short: 'Dec' },
            ].map((m) => (
              <button
                key={m.num}
                onClick={() => setSelectedMonth(m.num)}
                className={cn(
                  'py-0.5 px-1 rounded-md text-[11px] font-medium text-center transition-colors cursor-pointer border',
                  selectedMonth === m.num
                    ? 'bg-[#003399] text-white border-[#003399]'
                    : 'bg-white text-gray-700 border-[#E5E7EB] hover:bg-gray-50'
                )}
              >
                {m.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors shrink-0 border cursor-pointer',
                selectedCat === cat
                  ? 'bg-[#003399] text-white border-[#003399]'
                  : 'bg-gray-50 text-gray-700 border-[#E5E7EB] hover:bg-gray-100'
              )}
            >
              {cat === 'ALL' ? 'All Activities' : cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search event, venue or topic..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-md text-xs focus:ring-1 focus:ring-[#003399] focus:border-[#003399]"
          />
        </div>
      </div>

      {/* Events Grid */}
      {filtered.length === 0 ? (
        <EmptyState title="No events found" description="Check back later or adjust your search filter." icon="📅" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const dateObj = new Date(e.date)
            const monthStr = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase()
            const dayStr = dateObj.getDate()
            const style = CATEGORY_COLORS[e.category] || { bg: 'bg-blue-100', text: 'text-[#003399]', border: 'border-blue-200' }

            return (
              <Card
                key={e.id}
                className="rounded-lg border border-[#E5E7EB] hover:border-[#003399]/40 hover:shadow-xs transition-colors bg-white flex flex-col justify-between"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top Bar with Category & Date Box */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* Date Tile */}
                      <div className="w-11 h-12 rounded-md bg-[#002266] text-white flex flex-col items-center justify-center shrink-0 border border-[#001B4D]">
                        <span className="text-[9px] font-bold text-[#FFD700] tracking-wider leading-none">
                          {monthStr}
                        </span>
                        <span className="text-base font-bold leading-tight mt-0.5">{dayStr}</span>
                      </div>

                      <div>
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-semibold border', style.bg, style.text, style.border)}>
                          {e.category}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium block mt-0.5">{dateObj.getFullYear()} Academic Year</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-sm text-[#1F2937] hover:text-[#003399] transition-colors leading-snug">
                      {e.name}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 mt-1 leading-relaxed">
                      {e.description}
                    </p>
                  </div>

                  {/* Logistics */}
                  <div className="space-y-1 pt-2 border-t border-[#E5E7EB] text-xs text-gray-600">
                    <p className="flex items-center gap-1.5 font-medium text-[#003399]">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{e.time}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-gray-600 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
                      <span>{e.venue}</span>
                    </p>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded font-semibold text-[10px]">
                      Open
                    </span>

                    <div className="flex items-center gap-1.5">
                      {e.registrationUrl && (
                        <a
                          href={e.registrationUrl.startsWith('http') ? e.registrationUrl : `https://${e.registrationUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-[#E5E7EB]"
                        >
                          <span>LINK</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => setRegisteredModalEvent(e)}
                        className="px-3 py-1 rounded-md bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold flex items-center gap-1 transition-colors shrink-0 uppercase tracking-wider cursor-pointer"
                      >
                        <span>REGISTER</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Registration Modal */}
      {registeredModalEvent && (
        <div className="fixed inset-0 z-50 bg-[#001B4D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-lg border border-[#E5E7EB] space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-2.5">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#003399] border border-blue-200 text-[10px] font-bold">
                  {registeredModalEvent.category}
                </span>
                <h3 className="text-sm font-bold text-[#1F2937] mt-1">{registeredModalEvent.name}</h3>
                <p className="text-xs text-gray-500">{registeredModalEvent.time} · {registeredModalEvent.venue}</p>
              </div>
              <button
                onClick={() => setRegisteredModalEvent(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded"
              >
                ✕
              </button>
            </div>

            {registrationSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#1F2937]">Registration Confirmed</h4>
                <p className="text-xs text-gray-500">
                  Your event entry pass details have been sent to your registered student email.
                </p>
              </div>
            ) : (
              <RegistrationForm
                onSubmit={handleRegisterSubmit}
                onCancel={() => setRegisteredModalEvent(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}