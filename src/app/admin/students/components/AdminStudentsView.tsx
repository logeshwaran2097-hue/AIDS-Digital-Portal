'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  X,
  Mail,
  Phone,
  Calendar,
  Layers,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface StudentRecord {
  id: string
  registerNumber: string
  name: string
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  year: number
  semester: number
  section: string
  status: string
}

export function AdminStudentsView({ initialStudents }: { initialStudents: StudentRecord[] }) {
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents)
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    registerNumber: '',
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '2006-08-15',
    year: 2,
    semester: 4,
    section: 'A',
    status: 'active',
  })

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesYear = yearFilter === 'ALL' || s.year.toString() === yearFilter
    const matchesStatus = statusFilter === 'ALL' || s.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesYear && matchesStatus
  })

  // PDF Export
  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — OFFICIAL STUDENT ROSTER',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official Enrolled Student Records',
      sections: [
        {
          heading: '1. STUDENT ENROLLMENT SUMMARY',
          body: [
            `Total Enrolled Students: ${students.length} Registered Candidates`,
            `Department: Artificial Intelligence & Data Science (AI & DS)`,
            `Active Academic Regulations: Anna University Regulation 2021 (Autonomous)`,
            `Batch Strength: Year II (Sem 4) - 68 Students`,
          ],
        },
        {
          heading: '2. ENROLLED STUDENTS BATCH LIST (SAMPLE / EXCERPT)',
          body: filteredStudents.slice(0, 30).map(
            (s, idx) =>
              `${idx + 1}. [${s.registerNumber}] ${s.name} — Year ${s.year}, Sem ${s.semester}, Sec ${s.section} (${s.status.toUpperCase()})`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Student_Roster_2026',
    })
  }

  // Handle Add Student Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.registerNumber || !formData.name || !formData.email) {
      alert('Please fill in Register Number, Name, and Email')
      return
    }

    const newStudent: StudentRecord = {
      id: 'stud_' + Date.now(),
      registerNumber: formData.registerNumber.toUpperCase(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '+91 98765 43210',
      dateOfBirth: formData.dateOfBirth,
      year: Number(formData.year),
      semester: Number(formData.semester),
      section: formData.section,
      status: formData.status,
    }

    setStudents([newStudent, ...students])
    setIsAddModalOpen(false)
    setFormData({
      registerNumber: '',
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '2006-08-15',
      year: 2,
      semester: 4,
      section: 'A',
      status: 'active',
    })
  }

  // Handle Edit Student Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    setStudents(
      students.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              year: Number(formData.year),
              semester: Number(formData.semester),
              section: formData.section,
              status: formData.status,
            }
          : s
      )
    )
    setIsEditModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this student record from the directory?')) {
      setStudents(students.filter((s) => s.id !== id))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Student Records Administration
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student Enrollment &amp; Directory</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Comprehensive management of {students.length} enrolled undergraduate candidates
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Roster (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Add New Student
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Enrolled</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{students.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">Batch 2023 - 2027</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Status</p>
          <p className="text-2xl font-black text-green-700 mt-0.5">
            {students.filter((s) => s.status.toLowerCase() === 'active').length}
          </p>
          <p className="text-[10px] text-green-700 font-medium mt-1">100% Attendance Eligible</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Current Year / Sem</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">Year II / Sem 4</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Regulation 2021</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Department</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">B.Tech AI &amp; DS</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">Anna University</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, reg no, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Academic Years</option>
            <option value="1">Year I</option>
            <option value="2">Year II (Current)</option>
            <option value="3">Year III</option>
            <option value="4">Year IV</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
            Showing {filteredStudents.length} of {students.length}
          </span>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Register No</th>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5 text-center">Year / Sem</th>
                <th className="px-4 py-3.5 text-center">Section</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#1455D9]">{s.registerNumber}</td>
                    <td className="px-4 py-3 font-bold text-[#071A3D]">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <div className="flex flex-col text-[11px]">
                        <span>{s.email}</span>
                        {s.phone && <span className="text-gray-400">{s.phone}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200">
                        Yr {s.year} / S{s.semester}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-[#071A3D]">Sec {s.section}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          s.status.toLowerCase() === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudent(s)
                            setIsViewModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View Student Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(s)
                            setFormData({
                              registerNumber: s.registerNumber,
                              name: s.name,
                              email: s.email,
                              phone: s.phone || '',
                              dateOfBirth: s.dateOfBirth || '2006-08-15',
                              year: s.year,
                              semester: s.semester,
                              section: s.section,
                              status: s.status,
                            })
                            setIsEditModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Student Info"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD STUDENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Add New Student Candidate</h3>
                <p className="text-xs text-gray-500">Department of AI &amp; DS Enrollment</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Register Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23AD069"
                    value={formData.registerNumber}
                    onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. Vignesh"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@vsb.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={1}>Year I</option>
                    <option value={2}>Year II</option>
                    <option value={3}>Year III</option>
                    <option value={4}>Year IV</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={1}>Sem 1</option>
                    <option value={2}>Sem 2</option>
                    <option value={3}>Sem 3</option>
                    <option value={4}>Sem 4</option>
                    <option value={5}>Sem 5</option>
                    <option value={6}>Sem 6</option>
                    <option value={7}>Sem 7</option>
                    <option value={8}>Sem 8</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
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
                  Save &amp; Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDENT */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Edit Student Information</h3>
                <p className="text-xs text-gray-500 font-mono">Reg No: {selectedStudent.registerNumber}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone Number</label>
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
                  <label className="block font-bold text-[#071A3D] mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={1}>Year I</option>
                    <option value={2}>Year II</option>
                    <option value={3}>Year III</option>
                    <option value={4}>Year IV</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={1}>Sem 1</option>
                    <option value={2}>Sem 2</option>
                    <option value={3}>Sem 3</option>
                    <option value={4}>Sem 4</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Update Information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW STUDENT DOSSIER */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Student Dossier</h3>
                <p className="text-xs text-gray-500">Verified Academic Record</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-12 h-12 rounded-xl bg-[#1455D9] text-white flex items-center justify-center font-black text-lg">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#071A3D]">{selectedStudent.name}</h4>
                  <p className="font-mono text-xs text-[#1455D9] font-bold">{selectedStudent.registerNumber}</p>
                </div>
              </div>

              <div className="space-y-2 divide-y divide-gray-100">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Degree &amp; Branch:</span>
                  <span className="font-bold text-[#071A3D]">B.Tech AI &amp; DS</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Current Semester:</span>
                  <span className="font-bold text-[#071A3D]">Year {selectedStudent.year} / Sem {selectedStudent.semester}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Section Allocation:</span>
                  <span className="font-bold text-[#071A3D]">Section {selectedStudent.section}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Official Email:</span>
                  <span className="font-mono text-[#071A3D]">{selectedStudent.email}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Phone Contact:</span>
                  <span className="font-mono text-[#071A3D]">{selectedStudent.phone || '+91 98765 43210'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Enrollment Status:</span>
                  <span className="font-bold text-green-700 uppercase">{selectedStudent.status}</span>
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
