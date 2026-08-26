'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Award,
  Download,
  Mail,
  Phone,
  Calendar,
  Building,
  Edit2,
  Trash2,
  Plus,
  X,
  UserCheck,
  GraduationCap,
  Briefcase,
  Sparkles,
  Lock,
  Search,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { cn } from '@/lib/utils'

export interface HODRecord {
  id: string
  facultyId: string
  name: string
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  department: string
  designation?: string | null
  qualification?: string | null
  experience?: number | null
  status: string
}

export function AdminHODView({ initialHOD }: { initialHOD: HODRecord[] }) {
  const [hodList, setHODList] = useState<HODRecord[]>(initialHOD)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedHOD, setSelectedHOD] = useState<HODRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'nitr',
    dateOfBirth: '',
    designation: 'Professor & Head',
    qualification: 'Ph.D. (AI & Data Science)',
    experience: '15' as any,
    specialization: 'Artificial Intelligence, Deep Learning & Autonomous Systems',
    department: 'Artificial Intelligence & Data Science',
    status: 'active',
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — HOD APPOINTMENT & PROFILE',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Head of Department Administrative Dossier',
      sections: [
        {
          heading: '1. EXECUTIVE SUMMARY & JURISDICTION',
          body: [
            `Department: Artificial Intelligence & Data Science`,
            `HOD Appointees Count: ${hodList.length}`,
            `Status: Official Academic Head & BoS Chairperson`,
            `Default Password Protocol: Admin temporary password (nitr) with mandatory first-login profile completion.`,
          ],
        },
        {
          heading: '2. APPOINTED HEAD OF DEPARTMENT PARTICULARS',
          body: hodList.map((h, idx) => 
            `${idx + 1}. ${h.name} — ${h.designation || 'Professor & Head'} | Email: ${h.email} | Phone: ${h.phone || 'N/A'} | Qualification: ${h.qualification || 'Ph.D.'} | Experience: ${h.experience || 15} Yrs`
          ),
        },
      ],
      fileName: 'VSB_HOD_Appointment_Dossier_2026',
    })
  }

  // Handle Add/Appoint HOD
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter the HOD Full Name.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/hod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          password: formData.password.trim() || 'nitr',
          experience: Number(formData.experience) || 15,
        }),
      })
      const result = await res.json()

      if (result.success && result.hod) {
        setHODList([result.hod, ...hodList.filter((h) => h.id !== result.hod.id)])
        setIsAddModalOpen(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: 'nitr',
          dateOfBirth: '',
          designation: 'Professor & Head',
          qualification: 'Ph.D. (AI & Data Science)',
          experience: '15',
          specialization: 'Artificial Intelligence, Deep Learning & Autonomous Systems',
          department: 'Artificial Intelligence & Data Science',
          status: 'active',
        })
        alert('HOD appointed and registered with temporary password successfully!')
      } else {
        alert(result.message || 'Failed to save HOD')
      }
    } catch (err) {
      console.error(err)
      alert('Network error saving HOD.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Edit HOD
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHOD) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/hod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          facultyId: selectedHOD.facultyId,
          experience: Number(formData.experience) || 15,
        }),
      })
      const result = await res.json()

      if (result.success) {
        setHODList(
          hodList.map((h) =>
            h.id === selectedHOD.id
              ? {
                  ...h,
                  name: formData.name,
                  email: formData.email || h.email,
                  phone: formData.phone,
                  designation: formData.designation,
                  qualification: formData.qualification,
                  experience: Number(formData.experience) || 15,
                  dateOfBirth: formData.dateOfBirth,
                  department: formData.department,
                  status: formData.status,
                }
              : h
          )
        )
        setIsEditModalOpen(false)
        alert('HOD details updated in database!')
      } else {
        alert(result.message || 'Failed to update HOD')
      }
    } catch (err) {
      console.error(err)
      alert('Network error updating HOD.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Delete HOD
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove HOD record for "${name}" from database?`)) {
      return
    }

    try {
      const res = await fetch(`/api/hod?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setHODList(hodList.filter((h) => h.id !== id))
        alert('HOD record removed.')
      } else {
        alert(result.message || 'Failed to delete HOD')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting HOD record.')
    }
  }

  const filteredHODList = hodList.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Department Leadership Administration
            </span>
            <span className="text-xs text-gray-300 font-medium">· Root Authority</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Head of Department (HOD) Directorate</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Official department head appointment, academic jurisdiction &amp; administrative oversight
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F4C430]" /> Export PDF
          </button>
          <button
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                password: 'nitr',
                dateOfBirth: '',
                designation: 'Professor & Head',
                qualification: 'Ph.D. (AI & Data Science)',
                experience: '15',
                specialization: 'Artificial Intelligence, Deep Learning & Autonomous Systems',
                department: 'Artificial Intelligence & Data Science',
                status: 'active',
              })
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Appoint / Add HOD
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Appointed HODs</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{hodList.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">Active Leadership Profile</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Jurisdiction</p>
          <p className="text-xl font-black text-green-700 mt-0.5 truncate">AI &amp; DS Dept</p>
          <p className="text-[10px] text-green-700 font-medium mt-1">Autonomous Regulation</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Semesters Scope</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">8 Semesters</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Years I to IV Academic Oversight</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Default Password</p>
          <p className="text-xl font-black text-amber-700 mt-0.5 font-mono">nitr</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">First-login self-service update</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search HOD by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20 font-medium"
          />
        </div>
        <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
          {filteredHODList.length} Head(s) Listed
        </span>
      </div>

      {/* Appointed HOD Directory Grid / List */}
      <div className="space-y-4">
        {filteredHODList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No Head of Department Appointed</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Click &quot;+ Appoint / Add HOD&quot; above to assign the Head of Department. Only Full Name and Temporary Password (default: nitr) are required!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHODList.map((hod) => (
              <div
                key={hod.id}
                className="bg-white rounded-3xl p-6 border border-gray-200 hover:border-[#1455D9] transition-all shadow-xs space-y-4 relative group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                      {hod.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-[#071A3D]">{hod.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1455D9] border border-blue-200 text-[10px] font-black">
                          {hod.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#1455D9] mt-0.5">
                        {hod.designation || 'Professor & Head of Department'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedHOD(hod)
                        setFormData({
                          name: hod.name,
                          email: hod.email,
                          phone: hod.phone || '',
                          password: '',
                          dateOfBirth: hod.dateOfBirth || '',
                          designation: hod.designation || 'Professor & Head',
                          qualification: hod.qualification || 'Ph.D. (AI & Data Science)',
                          experience: hod.experience || '15',
                          specialization: 'Artificial Intelligence, Deep Learning & Autonomous Systems',
                          department: hod.department,
                          status: hod.status || 'active',
                        })
                        setIsEditModalOpen(true)
                      }}
                      className="p-2 rounded-xl text-gray-400 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer border border-gray-100"
                      title="Edit HOD Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(hod.id, hod.name)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border border-gray-100"
                      title="Remove HOD Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-[#1455D9] shrink-0" />
                    <span className="truncate">{hod.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#1455D9] shrink-0" />
                    <span>{hod.phone || '+91 94431 87654'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap className="w-4 h-4 text-[#1455D9] shrink-0" />
                    <span>{hod.qualification || 'Ph.D. (AI & DS)'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="w-4 h-4 text-[#1455D9] shrink-0" />
                    <span className="truncate">{hod.department}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: APPOINT REAL HEAD OF DEPARTMENT (LIKE FACULTY) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">
                  Appoint Real Head of Department
                </h3>
                <p className="text-xs text-gray-500">Record will be saved directly into institutional database</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">HOD Full Name with Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Dr. V. Sundar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Institutional Email <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. hod.ai@vsb.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Temporary Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. nitr"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/20 focus:bg-white focus:outline-none focus:border-[#1455D9] font-mono font-bold text-[#071A3D]"
                  />
                  <p className="text-[10px] text-[#1455D9] font-medium mt-1">Default temporary password: <strong>nitr</strong>.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94431 87654"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D]"
                  >
                    <option value="Professor & Head">Professor &amp; Head</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Director & HOD">Director &amp; HOD</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. Ph.D."
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-gray-700 text-[11px] space-y-1">
                <span className="font-bold text-[#1455D9] block">Self-Service Onboarding:</span>
                <p>
                  Upon first login using their temporary password (<strong>{formData.password || 'nitr'}</strong>), the HOD will be prompted to set a permanent secure password and complete any remaining profile details.
                </p>
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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-2"
                >
                  {isLoading ? 'Saving...' : 'Save HOD to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT HOD */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedHOD && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Edit HOD Directorate Profile</h3>
                <p className="text-xs text-[#1455D9] font-bold">{selectedHOD.name}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Full Name &amp; Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D]"
                  >
                    <option value="Professor & Head">Professor &amp; Head</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Director & HOD">Director &amp; HOD</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
