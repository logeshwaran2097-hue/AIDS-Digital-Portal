'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Award,
  Download,
  Calendar,
  Sparkles,
  Layers,
  MapPin,
  CheckCircle2,
  Edit3,
  X,
  Lock,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'

export interface FacultyProfileData {
  name: string
  facultyId: string
  designation: string
  qualification: string
  experience: number
  specialization: string
  email: string
  phone: string
  cabin: string
  officeHours: string
  publicationsCount: number
  citationsCount: number
  allocatedCourses: string[]
}

export function FacultyProfileView({ data: initialData }: { data: FacultyProfileData }) {
  const [data, setData] = useState(initialData)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: data.name,
    phone: data.phone || '',
    email: data.email || '',
    qualification: data.qualification || '',
    specialization: data.specialization || '',
    experience: data.experience || 1,
    cabin: data.cabin || 'Room 302, AI Block',
    officeHours: data.officeHours || '03:05 PM - 04:30 PM (Mon-Fri)',
  })
  const [loading, setLoading] = useState(false)

  const handleDownloadFacultyDossier = () => {
    generateAndDownloadPDF({
      title: 'FACULTY ACADEMIC & RESEARCH DOSSIER',
      subtitle: `${data.name} · ${data.designation} · Department of AI & DS`,
      author: 'Office of the Principal & Dean of Academic Affairs',
      category: 'Faculty Profile & Curriculum Vitae',
      sections: [
        {
          heading: '1. FACULTY BIOGRAPHICAL & CONTACT PARTICULARS',
          body: [
            `Full Name: ${data.name}`,
            `Institutional Faculty ID: ${data.facultyId}`,
            `Academic Designation: ${data.designation}`,
            `Highest Qualification: ${data.qualification}`,
            `Total Teaching & Research Experience: ${data.experience} Years`,
            `Specialization: ${data.specialization}`,
            `Official Email: ${data.email}`,
            `Contact Phone: ${data.phone}`,
            `Faculty Cabin: ${data.cabin}`,
            `Office Counseling Hours: ${data.officeHours}`,
          ],
        },
        {
          heading: '2. RESEARCH PUBLICATIONS & SCHOLARLY CONTRIBUTIONS',
          body: [
            `Total Peer-Reviewed Journal Publications: ${data.publicationsCount} Scopus / SCI Indexed Papers`,
            `Total Academic Citations: ${data.citationsCount} Citations (h-index: 12)`,
            'Key Research Domains: Machine Learning Optimization, Deep Neural Architectures, Computer Vision & Edge AI',
            'Conference Proceedings: IEEE, Springer & ACM International Conferences',
          ],
        },
        {
          heading: '3. CURRENT ALLOCATED COURSES (SEMESTER 3 & 5)',
          body: data.allocatedCourses.map((c) => `Course Code & Title: ${c}`),
        },
      ],
      fileName: `Faculty_Dossier_${data.facultyId}_${data.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
    })
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          email: editForm.email.trim(),
          qualification: editForm.qualification.trim(),
          specialization: editForm.specialization.trim(),
          experience: Number(editForm.experience) || 1,
        }),
      })

      const result = await res.json()
      if (res.ok && result.success) {
        setData((prev) => ({
          ...prev,
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          email: editForm.email.trim(),
          qualification: editForm.qualification.trim(),
          specialization: editForm.specialization.trim(),
          experience: Number(editForm.experience) || 1,
          cabin: editForm.cabin,
          officeHours: editForm.officeHours,
        }))
        setIsEditOpen(false)
        toast.success('Your faculty profile details have been updated successfully!')
      } else {
        toast.error(result.message || 'Failed to update profile.')
      }
    } catch {
      toast.error('Network error updating profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Profile Hero */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#22C7E8] to-[#F4C430] text-[#071A3D] font-black text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
            {data.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                {data.designation}
              </span>
              <span className="text-xs text-gray-300 font-mono">ID: {data.facultyId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{data.name}</h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              {data.qualification} · {data.experience} Years Experience · Dept. of AI &amp; DS
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 shadow-xs cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-[#22C7E8]" /> Edit Profile
          </button>
          <button
            onClick={handleDownloadFacultyDossier}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
          >
            <Download className="w-4 h-4" /> Export Faculty Dossier (PDF)
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs text-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase">Experience</p>
          <p className="text-xl font-black text-[#1455D9] mt-0.5">{data.experience} Years</p>
          <p className="text-[10px] text-gray-400">Teaching &amp; R&amp;D</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs text-center">
          <p className="text-[10px] text-purple-700 font-bold uppercase">Publications</p>
          <p className="text-xl font-black text-purple-700 mt-0.5">{data.publicationsCount} Papers</p>
          <p className="text-[10px] text-purple-600">Scopus / SCI</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs text-center">
          <p className="text-[10px] text-green-700 font-bold uppercase">Citations</p>
          <p className="text-xl font-black text-green-600 mt-0.5">{data.citationsCount}+</p>
          <p className="text-[10px] text-green-700">h-index: 12</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs text-center">
          <p className="text-[10px] text-amber-700 font-bold uppercase">Cabin</p>
          <p className="text-xl font-black text-amber-600 mt-0.5">{data.cabin}</p>
          <p className="text-[10px] text-amber-700">{data.officeHours}</p>
        </div>
      </div>

      {/* Profile Details Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact & Cabin Info */}
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#071A3D] flex items-center gap-2">
              <User className="w-4 h-4 text-[#1455D9]" /> Academic &amp; Contact Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border flex items-center justify-between">
                <span className="text-gray-500 font-medium">Institutional Email:</span>
                <span className="font-bold text-[#071A3D] font-mono">{data.email}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex items-center justify-between">
                <span className="text-gray-500 font-medium">Contact Phone:</span>
                <span className="font-bold text-[#071A3D]">{data.phone || '+91 98421 12345'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex items-center justify-between">
                <span className="text-gray-500 font-medium">Qualification:</span>
                <span className="font-bold text-[#071A3D]">{data.qualification}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex items-center justify-between">
                <span className="text-gray-500 font-medium">Specialization:</span>
                <span className="font-bold text-[#1455D9]">{data.specialization}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex items-center justify-between">
                <span className="text-gray-500 font-medium">Office Counseling:</span>
                <span className="font-bold text-gray-700">{data.officeHours}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocated Subjects */}
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#071A3D] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1455D9]" /> Allocated Teaching Subjects
            </h3>

            <div className="space-y-2.5 text-xs">
              {data.allocatedCourses.length === 0 ? (
                <div className="p-4 rounded-2xl bg-gray-50 border text-center text-gray-400">
                  <p className="font-semibold text-gray-600">No subjects allocated yet</p>
                  <p className="text-[11px] mt-0.5">Courses assigned by HOD will be displayed here.</p>
                </div>
              ) : (
                data.allocatedCourses.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1455D9] shrink-0" />
                    <span className="font-bold text-[#071A3D]">{c}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Edit Faculty Profile</h3>
                <p className="text-xs text-[#1455D9] font-mono font-bold">{data.facultyId}</p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98421 12345"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="karthik@vsb.edu.in"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="M.E., Ph.D."
                    value={editForm.qualification}
                    onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Specialization Domain</label>
                <input
                  type="text"
                  placeholder="e.g. Deep Learning, Natural Language Processing"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Faculty Cabin</label>
                  <input
                    type="text"
                    value={editForm.cabin}
                    onChange={(e) => setEditForm({ ...editForm, cabin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Office Hours</label>
                  <input
                    type="text"
                    value={editForm.officeHours}
                    onChange={(e) => setEditForm({ ...editForm, officeHours: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
