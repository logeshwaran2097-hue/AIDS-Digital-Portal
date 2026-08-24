'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Eye,
  X,
  Mail,
  Phone,
  BookOpen,
  Briefcase,
  GraduationCap,
  Award,
  ShieldCheck,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface FacultyRecord {
  id: string
  facultyId: string
  name: string
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  designation: string
  qualification: string
  experience: number
  specialization: string
  subjects: string
  status: string
}

export function AdminFacultyView({ initialFaculty }: { initialFaculty: FacultyRecord[] }) {
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>(initialFaculty)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord | null>(null)

  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    email: '',
    phone: '',
    designation: 'Assistant Professor',
    qualification: 'M.E., Ph.D.',
    experience: 8,
    specialization: 'Artificial Intelligence & Machine Learning',
    subjects: 'CS3491 Artificial Intelligence',
    status: 'active',
  })

  const filteredFaculty = facultyList.filter((f) => {
    return (
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — FACULTY DIRECTORATE',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official Faculty Directorate & Workload Report',
      sections: [
        {
          heading: '1. FACULTY CADRE & STRENGTH OVERVIEW',
          body: [
            `Total Teaching Faculty: ${facultyList.length} Full-Time Professors`,
            `Department: Artificial Intelligence & Data Science (AI & DS)`,
            `Cadre Distribution: Professors, Associate Professors & Assistant Professors`,
            `Specializations: Deep Learning, NLP, Distributed Systems, Data Analytics`,
          ],
        },
        {
          heading: '2. FACULTY ROSTER & ALLOCATED COURSES',
          body: facultyList.map(
            (f, idx) =>
              `${idx + 1}. [${f.facultyId}] ${f.name} — ${f.designation} (${f.qualification}) | Exp: ${f.experience} Yrs | Spec: ${f.specialization} | Courses: ${f.subjects}`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Faculty_Directorate_2026',
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.facultyId || !formData.name || !formData.email) {
      alert('Please fill in Faculty ID, Name, and Email')
      return
    }

    const newFaculty: FacultyRecord = {
      id: 'fac_' + Date.now(),
      facultyId: formData.facultyId.toUpperCase(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '+91 94432 10987',
      designation: formData.designation,
      qualification: formData.qualification,
      experience: Number(formData.experience),
      specialization: formData.specialization,
      subjects: formData.subjects,
      status: formData.status,
    }

    setFacultyList([...facultyList, newFaculty])
    setIsAddModalOpen(false)
    setFormData({
      facultyId: '',
      name: '',
      email: '',
      phone: '',
      designation: 'Assistant Professor',
      qualification: 'M.E., Ph.D.',
      experience: 8,
      specialization: 'Artificial Intelligence & Machine Learning',
      subjects: 'CS3491 Artificial Intelligence',
      status: 'active',
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFaculty) return

    setFacultyList(
      facultyList.map((f) =>
        f.id === selectedFaculty.id
          ? {
              ...f,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              designation: formData.designation,
              qualification: formData.qualification,
              experience: Number(formData.experience),
              specialization: formData.specialization,
              subjects: formData.subjects,
              status: formData.status,
            }
          : f
      )
    )
    setIsEditModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this faculty record from the directorate?')) {
      setFacultyList(facultyList.filter((f) => f.id !== id))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Faculty Directorate Administration
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Faculty Roster &amp; Workload</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Oversee {facultyList.length} certified professors, research guides &amp; course instructors
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Directorate (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Add New Faculty
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Teaching Staff</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{facultyList.length} Professors</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">Full-Time Faculty</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Doctorate Holders</p>
          <p className="text-2xl font-black text-green-700 mt-0.5">
            {facultyList.filter((f) => f.qualification.includes('Ph.D')).length} Ph.D. Scholars
          </p>
          <p className="text-[10px] text-green-700 font-medium mt-1">Research Supervisors</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Avg Experience</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">
            {Math.round(facultyList.reduce((acc, f) => acc + f.experience, 0) / (facultyList.length || 1))} Years
          </p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Academic &amp; Industry</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Student-Faculty Ratio</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">17 : 1</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">NBA Norms Compliant</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search faculty by name, ID, specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
          Showing {filteredFaculty.length} of {facultyList.length} Faculty Members
        </span>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredFaculty.map((f) => (
          <div
            key={f.id}
            className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center font-black text-lg shadow-md">
                    {f.name.replace('Dr. ', '').replace('Mrs. ', '').replace('Mr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#071A3D]">{f.name}</h3>
                    <p className="text-xs text-[#1455D9] font-bold">{f.designation}</p>
                    <p className="text-[10px] text-gray-400">{f.qualification}</p>
                  </div>
                </div>

                <span className="font-mono text-xs font-black text-[#071A3D] px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200">
                  {f.facultyId}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Specialization:</span>
                  <span className="font-bold text-[#071A3D] text-right truncate max-w-[200px]">{f.specialization}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Allocated Course:</span>
                  <span className="font-bold text-[#1455D9] text-right truncate max-w-[200px]">{f.subjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Experience:</span>
                  <span className="font-bold text-green-700">{f.experience} Years Teaching</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Email:</span>
                  <span className="font-mono text-[11px] text-gray-700">{f.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800">
                {f.status}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedFaculty(f)
                    setIsViewModalOpen(true)
                  }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                  title="View Full Profile"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedFaculty(f)
                    setFormData({
                      facultyId: f.facultyId,
                      name: f.name,
                      email: f.email,
                      phone: f.phone || '',
                      designation: f.designation,
                      qualification: f.qualification,
                      experience: f.experience,
                      specialization: f.specialization,
                      subjects: f.subjects,
                      status: f.status,
                    })
                    setIsEditModalOpen(true)
                  }}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit Faculty Record"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Faculty"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD FACULTY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Add New Faculty Member</h3>
                <p className="text-xs text-gray-500">Department of AI &amp; DS Directorate</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Faculty ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI005"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. K. Ramesh"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="faculty@vsb.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 94432 10987"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Allocated Subjects</label>
                <input
                  type="text"
                  value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Save &amp; Appoint Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW FACULTY DOSSIER */}
      {isViewModalOpen && selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Faculty Profile Dossier</h3>
                <p className="text-xs text-gray-500">Official Staff Directorate Record</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-12 h-12 rounded-xl bg-[#1455D9] text-white flex items-center justify-center font-black text-lg">
                  {selectedFaculty.name.replace('Dr. ', '').replace('Mrs. ', '').replace('Mr. ', '').charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#071A3D]">{selectedFaculty.name}</h4>
                  <p className="font-mono text-xs text-[#1455D9] font-bold">{selectedFaculty.facultyId}</p>
                </div>
              </div>

              <div className="space-y-2 divide-y divide-gray-100">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Cadre &amp; Role:</span>
                  <span className="font-bold text-[#071A3D]">{selectedFaculty.designation}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Qualification:</span>
                  <span className="font-bold text-[#071A3D]">{selectedFaculty.qualification}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Teaching Experience:</span>
                  <span className="font-bold text-green-700">{selectedFaculty.experience} Years</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Research Focus:</span>
                  <span className="font-bold text-[#071A3D]">{selectedFaculty.specialization}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Course Load:</span>
                  <span className="font-bold text-[#1455D9]">{selectedFaculty.subjects}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Official Email:</span>
                  <span className="font-mono text-[#071A3D]">{selectedFaculty.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#071A3D] text-white font-bold text-xs hover:bg-[#0a2a5e]"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
