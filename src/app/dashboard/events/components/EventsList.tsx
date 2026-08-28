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
        <label className="font-bold text-gray-700 block mb-1">Participant Name (Team Leader)</label>
        <input
          type="text"
          defaultValue="K. Aishwarya"
          required
          className="w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[#1455D9]/20 focus:border-[#1455D9]"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-bold text-gray-700 block mb-1">Reg. Number</label>
          <input
            type="text"
            defaultValue="23AD001"
            required
            className="w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>
        <div>
          <label className="font-bold text-gray-700 block mb-1">Participation Type</label>
          <select
            value={participationType}
            onChange={(e) => setParticipationType(e.target.value)}
            className="w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[#1455D9]/20"
          >
            <option value="individual">Individual Entry</option>
            <option value="team2">Team (2 Members)</option>
            <option value="team4">Team (4 Members)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="font-bold text-gray-700 block mb-1">Contact Email</label>
        <input
          type="email"
          defaultValue="23ad001@vsb.ac.in"
          required
          className="w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-xs font-mono focus:ring-2 focus:ring-[#1455D9]/20"
        />
      </div>

      {teamCount > 0 && (
        <div className="space-y-3 pt-3 border-t border-dashed border-blue-200">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1455D9]" />
            <h4 className="font-black text-sm text-[#071A3D]">Team Details</h4>
            <span className="px-2 py-0.5 bg-blue-100 text-[#1455D9] rounded-full text-[10px] font-bold">{teamCount} Members</span>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Team Innovators"
              required
              className="w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[#1455D9]/20 placeholder:text-gray-400"
            />
          </div>

          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Member 1 — Team Leader (filled above)</p>

          {Array.from({ length: teamCount - 1 }, (_, i) => (
            <div key={i} className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
              <p className="text-[10px] font-black text-[#1455D9] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#1455D9] text-white flex items-center justify-center text-[10px]">{i + 2}</span>
                Member {i + 2}
              </p>
              <div>
                <label className="font-bold text-gray-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={members[i].name}
                  onChange={(e) => updateMember(i, 'name', e.target.value)}
                  placeholder={`Enter member ${i + 2} name`}
                  required
                  className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#1455D9]/20 placeholder:text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-600 block mb-1">Register No.</label>
                  <input
                    type="text"
                    value={members[i].regNo}
                    onChange={(e) => updateMember(i, 'regNo', e.target.value)}
                    placeholder="e.g. 23AD002"
                    required
                    className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-[#1455D9]/20 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-600 block mb-1">Department</label>
                  <select
                    value={members[i].dept}
                    onChange={(e) => updateMember(i, 'dept', e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1455D9]/20"
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

      <div className="pt-3 border-t flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5] shadow-xs transition-colors"
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
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              8-Semester Technical Portal
            </span>
            <span className="text-xs text-gray-300">· V.S.B. Engineering College</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Events, Workshops &amp; Hackathons</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Browse upcoming workshops, hackathons &amp; seminars across all 8 Semesters, 4 Academic Years, and 12 Months
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Matching Events</p>
            <p className="text-base font-black text-[#F4C430]">{filtered.length} Programs</p>
          </div>
        </div>
      </div>

      {/* Featured Spotlight Card */}
      {featuredEvent && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#071A3D] to-[#1455D9] p-6 sm:p-8 text-white shadow-xl border border-white/10">
          <div className="absolute right-0 bottom-0 w-80 h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#22C7E8]/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#F4C430] text-[#071A3D] text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" /> Featured Spotlight
                </span>
                <span className="text-xs text-gray-300 font-semibold">Registration Closes Soon</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black leading-tight text-white">
                {featuredEvent.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed">
                {featuredEvent.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <CalendarDays className="w-4 h-4 text-[#22C7E8]" /> {formatDate(featuredEvent.date)}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-[#F4C430]" /> {featuredEvent.time}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-rose-400" /> {featuredEvent.venue}
                </span>
              </div>
            </div>

            <button
              onClick={() => setRegisteredModalEvent(featuredEvent)}
              className="px-6 py-3.5 bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black rounded-2xl transition-all shadow-lg hover:scale-105 shrink-0 flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Register Now
            </button>
          </div>
        </div>
      )}

      {/* Multi-Dimensional Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-blue-200/80 shadow-xs space-y-3">
        {/* Academic Year Filter */}
        <div className="space-y-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">1. Academic Year:</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {[
              { key: 'ALL', label: 'All Years' },
              { key: 'year1', label: 'Year 1 (Freshman)' },
              { key: 'year2', label: 'Year 2 (Sophomore)' },
              { key: 'year3', label: 'Year 3 (Junior)' },
              { key: 'year4', label: 'Year 4 (Senior)' },
            ].map((y) => (
              <button
                key={y.key}
                onClick={() => setSelectedYear(y.key)}
                className={cn(
                  'py-1.5 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border',
                  selectedYear === y.key
                    ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50/50'
                )}
              >
                {y.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Semesters Filter */}
        <div className="space-y-1 pt-1 border-t border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">2. 8 Semesters:</span>
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
                  'py-1.5 px-1 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border',
                  selectedSemester === s.key
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50/50'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Months Filter */}
        <div className="space-y-1 pt-1 border-t border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">3. Month:</span>
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
                  'py-1 px-1 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer border',
                  selectedMonth === m.num
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50/50'
                )}
              >
                {m.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={cn(
                'px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0',
                selectedCat === cat
                  ? 'bg-[#1455D9] text-white shadow-md shadow-[#1455D9]/20 scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#071A3D]'
              )}
            >
              {cat === 'ALL' ? 'All Activities' : cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search event name, venue or topic..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>
      </div>

      {/* Events Grid */}
      {filtered.length === 0 ? (
        <EmptyState title="No events found" description="Check back later or adjust your search filter." icon="📅" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const dateObj = new Date(e.date)
            const monthStr = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase()
            const dayStr = dateObj.getDate()
            const style = CATEGORY_COLORS[e.category] || { bg: 'bg-blue-100', text: 'text-[#1455D9]', border: 'border-blue-200' }

            return (
              <Card
                key={e.id}
                className="rounded-3xl border-gray-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Top Bar with Category & Date Box */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Date Tile */}
                      <div className="w-12 h-14 rounded-2xl bg-[#071A3D] text-white flex flex-col items-center justify-center shadow-md shrink-0 border border-white/15">
                        <span className="text-[10px] font-black text-[#F4C430] tracking-wider leading-none">
                          {monthStr}
                        </span>
                        <span className="text-lg font-black leading-tight mt-0.5">{dayStr}</span>
                      </div>

                      <div>
                        <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border', style.bg, style.text, style.border)}>
                          {e.category}
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold block mt-1">2026 Academic Year</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-black text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                      {e.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 mt-1.5 leading-relaxed">
                      {e.description}
                    </p>
                  </div>

                  {/* Logistics Pills */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                    <p className="flex items-center gap-2 font-medium text-[#1455D9]">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{e.time}</span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{e.venue}</span>
                    </p>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                      Open for Registrations
                    </span>

                    <button
                      onClick={() => setRegisteredModalEvent(e)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                    >
                      <span>Register</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Registration Modal */}
      {registeredModalEvent && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-bold">
                  {registeredModalEvent.category}
                </span>
                <h3 className="text-base font-bold text-[#071A3D] mt-1">{registeredModalEvent.name}</h3>
                <p className="text-xs text-gray-500">{registeredModalEvent.time} · {registeredModalEvent.venue}</p>
              </div>
              <button
                onClick={() => setRegisteredModalEvent(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {registrationSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#071A3D]">Registration Confirmed!</h4>
                <p className="text-xs text-gray-500">
                  Your entry pass and event details have been dispatched to your student email.
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