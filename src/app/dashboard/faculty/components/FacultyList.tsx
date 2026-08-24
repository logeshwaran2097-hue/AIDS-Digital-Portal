'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/portal/states'
import {
  Mail,
  Briefcase,
  GraduationCap,
  Star,
  Layers,
  MapPin,
  Calendar,
  Search,
  BookOpen,
  Send,
  Sparkles,
  Phone,
  Award,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FacultyDetail {
  id: string
  userId: string
  facultyId: string
  designation: string
  qualification: string
  experience: number
  specialization: string
  subjects: string
}

interface FacultyUser {
  id: string
  name: string
  email: string
  phone: string | null
  profileImage: string | null
}

const CABIN_MAP: Record<string, string> = {
  'Dr. S. Karthik': 'AI Block - Room 201 (2nd Floor)',
  'Dr. M. Sowmya': 'AI Block - Room 204 (2nd Floor)',
  'Mr. S. Arun': 'AI Block - Room 105 (1st Floor)',
  'Mrs. R. Priya': 'AI Block - Room 108 (1st Floor)',
}

const AVATAR_GRADIENTS = [
  'from-[#1455D9] to-[#22C7E8]',
  'from-[#6C5CE7] to-[#a29bfe]',
  'from-[#00b894] to-[#00cec9]',
  'from-[#e17055] to-[#fab1a0]',
]

export default function FacultyList({ users, details }: { users: FacultyUser[]; details: FacultyDetail[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDesignation, setSelectedDesignation] = useState('ALL')
  const [contactFaculty, setContactFaculty] = useState<FacultyUser | null>(null)

  const detailByUser = new Map(details.map((d) => [d.userId, d]))

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const d = detailByUser.get(u.id)
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d?.specialization && d.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d?.subjects && d.subjects.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesDesignation =
        selectedDesignation === 'ALL' ||
        (d?.designation && d.designation.toLowerCase().includes(selectedDesignation.toLowerCase()))

      return matchesSearch && matchesDesignation
    })
  }, [users, details, searchQuery, selectedDesignation])

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
            Meet your professors, course instructors, research mentors &amp; lab guides
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Total Faculty</p>
            <p className="text-base font-black text-[#F4C430]">{users.length} Professors</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {[
            { l: 'All Faculty', v: 'ALL' },
            { l: 'Professors', v: 'Professor' },
            { l: 'Associate Prof', v: 'Associate' },
            { l: 'Assistant Prof', v: 'Assistant' },
          ].map((tab) => (
            <button
              key={tab.v}
              onClick={() => setSelectedDesignation(tab.v)}
              className={cn(
                'px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0',
                selectedDesignation === tab.v
                  ? 'bg-[#1455D9] text-white shadow-md shadow-[#1455D9]/20 scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#071A3D]'
              )}
            >
              {tab.l}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty name, subject or skill..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {filteredUsers.length === 0 ? (
        <EmptyState title="No faculty found" description="Try adjusting your search query or designation filter." icon="👨‍🏫" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {filteredUsers.map((u, idx) => {
            const d = detailByUser.get(u.id)
            const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
            const initials = u.name
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
              } catch (e) {
                subjectsArray = [d.subjects]
              }
            }

            return (
              <Card
                key={u.id}
                className="rounded-3xl border-gray-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-5">
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
                          {d?.designation || 'Faculty'}
                        </Badge>
                      </div>

                      <p className="text-xs font-semibold text-[#1455D9] mt-0.5 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#1455D9]" />
                        <span>{d?.qualification || 'Ph.D. / M.Tech'}</span>
                      </p>

                      <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span>{CABIN_MAP[u.name] || 'AI Department Block'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Teaching Experience
                      </span>
                      <p className="font-black text-[#071A3D] mt-0.5">
                        {d?.experience || 8}+ Years
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Domain Specialization
                      </span>
                      <p className="font-bold text-purple-700 truncate mt-0.5">
                        {d?.specialization || 'AI & Machine Learning'}
                      </p>
                    </div>
                  </div>

                  {/* Allocated Course Badges */}
                  {subjectsArray.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Courses Handled:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {subjectsArray.map((code, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-xl bg-blue-50 text-[#1455D9] text-[11px] font-mono font-black border border-blue-200/60"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Action Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <a
                      href={`mailto:${u.email}`}
                      className="text-xs text-gray-600 hover:text-[#1455D9] font-semibold inline-flex items-center gap-1.5 truncate max-w-[200px]"
                      title={u.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </a>

                    <button
                      onClick={() => setContactFaculty(u)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                    >
                      <Send className="w-3 h-3" /> Contact
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Contact / Office Hours Modal */}
      {contactFaculty && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Connect with {contactFaculty.name}</h3>
                <p className="text-xs text-gray-500">{contactFaculty.email}</p>
              </div>
              <button onClick={() => setContactFaculty(null)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
                <p className="font-bold text-[#071A3D]">Faculty Office Hours:</p>
                <p className="text-gray-600 mt-1">Monday - Friday: 03:30 PM - 04:30 PM</p>
                <p className="text-gray-500 mt-0.5">Location: {CABIN_MAP[contactFaculty.name] || 'AI Block'}</p>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Subject / Query Topic</label>
                <input type="text" placeholder="e.g. Doubts in Machine Learning Unit 3" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Message to Professor</label>
                <textarea rows={3} placeholder="Write your question or request a slot..." className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setContactFaculty(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
              <button
                onClick={() => {
                  alert(`Message sent to ${contactFaculty.name}! The professor will reply to your registered student email.`)
                  setContactFaculty(null)
                }}
                className="px-4 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}