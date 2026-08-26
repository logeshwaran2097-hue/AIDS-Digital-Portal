'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  GraduationCap,
  Search,
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
  AlertTriangle,
  RotateCcw,
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
  const [semFilter, setSemFilter] = useState('ALL')
  const [sectionFilter, setSectionFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(false)

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
    password: 'vsb@123',
    phone: '',
    dateOfBirth: '2006-08-15',
    year: 2,
    semester: 4,
    section: 'A',
    status: 'active',
  })

  // 8 Semesters Definition
  const allSemesters = [
    { sem: 1, year: 1, yearName: 'Year I', label: 'Semester 1', tag: 'Freshman - Odd' },
    { sem: 2, year: 1, yearName: 'Year I', label: 'Semester 2', tag: 'Freshman - Even' },
    { sem: 3, year: 2, yearName: 'Year II', label: 'Semester 3', tag: 'Sophomore - Odd' },
    { sem: 4, year: 2, yearName: 'Year II', label: 'Semester 4', tag: 'Sophomore - Even' },
    { sem: 5, year: 3, yearName: 'Year III', label: 'Semester 5', tag: 'Junior - Odd' },
    { sem: 6, year: 3, yearName: 'Year III', label: 'Semester 6', tag: 'Junior - Even' },
    { sem: 7, year: 4, yearName: 'Year IV', label: 'Semester 7', tag: 'Senior - Odd' },
    { sem: 8, year: 4, yearName: 'Year IV', label: 'Semester 8', tag: 'Final Year - Capstone' },
  ]

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesYear = yearFilter === 'ALL' || student.year === Number(yearFilter)
    const matchesSem = semFilter === 'ALL' || student.semester === Number(semFilter)
    const matchesSection = sectionFilter === 'ALL' || student.section.toUpperCase() === sectionFilter.toUpperCase()
    const matchesStatus =
      statusFilter === 'ALL' || student.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesYear && matchesSem && matchesSection && matchesStatus
  })

  const getSemCount = (semNumber: number) => {
    return students.filter((s) => s.semester === semNumber).length
  }

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
          ],
        },
        {
          heading: '2. ENROLLED STUDENTS BATCH LIST',
          body: filteredStudents.map(
            (s, idx) =>
              `${idx + 1}. [${s.registerNumber}] ${s.name} — Year ${s.year}, Sem ${s.semester}, Sec ${s.section} (${s.status.toUpperCase()})`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Student_Roster_2026',
    })
  }

  // Handle Add Student Submit with Real Database Save
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.registerNumber.trim() || !formData.name.trim() || !formData.password.trim()) {
      alert('Please fill in Register Number, Full Name, and Temporary Password.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await res.json()

      if (result.success && result.student) {
        setStudents([result.student, ...students])
        setIsAddModalOpen(false)
        setFormData({
          registerNumber: '',
          name: '',
          email: '',
          password: '',
          phone: '',
          dateOfBirth: '',
          year: 2,
          semester: 4,
          section: 'A',
          status: 'active',
        })
        alert('Student successfully registered with temporary password!')
      } else {
        alert(result.message || 'Failed to add student')
      }
    } catch (err) {
      console.error(err)
      alert('Network error adding student. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Edit Student Submit with Real Database Save
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedStudent.id,
          ...formData,
        }),
      })
      const result = await res.json()

      if (result.success) {
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
        alert('Student record updated successfully in database!')
      } else {
        alert(result.message || 'Failed to update student')
      }
    } catch (err) {
      console.error(err)
      alert('Network error updating student.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Delete with Real Database Delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the database?`)) {
      return
    }

    try {
      const res = await fetch(`/api/students?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        setStudents(students.filter((s) => s.id !== id))
      } else {
        alert(result.message || 'Failed to delete student')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting student record.')
    }
  }

  // Clear all mock/sample students
  const handleClearAllStudents = async () => {
    if (!confirm('Are you sure you want to delete ALL student records from the database? This will clear all mock data so you can enter real students.')) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/students?clearAll=true', {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        setStudents([])
        alert('All mock student records have been permanently cleared! You can now add your real students.')
      } else {
        alert(result.message || 'Failed to clear students')
      }
    } catch (err) {
      console.error(err)
      alert('Error clearing student records.')
    } finally {
      setIsLoading(false)
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
            {students.length > 0
              ? `Real-time management of ${students.length} enrolled student records`
              : 'Directory is ready for real student entries'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          {students.length > 0 && (
            <button
              onClick={handleClearAllStudents}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:text-white"
              title="Delete all sample students from database"
            >
              <Trash2 className="w-4 h-4 text-red-400" /> Clear Mock Data
            </button>
          )}

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

      {/* Two-Step Hierarchical Year -> Semester Academic Navigation */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
        {/* STEP 1: Select Academic Year */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1455D9] text-white text-[11px] font-black flex items-center justify-center">1</span>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                Step 1: Choose Academic Year
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-gray-500">
              {yearFilter === 'ALL' ? 'Browsing across all 4 Academic Years' : `Selected: Year ${yearFilter}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={() => {
                setYearFilter('ALL')
                setSemFilter('ALL')
              }}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                yearFilter === 'ALL'
                  ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-md ring-2 ring-[#071A3D]/30'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase block opacity-80">All 4 Years</span>
              <p className="text-xs font-black mt-0.5">All Years</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-1 inline-block ${
                yearFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {students.length} Total
              </span>
            </button>

            {[
              { year: 1, name: 'Year I', label: '1st Year (Freshman)', sems: [1, 2] },
              { year: 2, name: 'Year II', label: '2nd Year (Sophomore)', sems: [3, 4] },
              { year: 3, name: 'Year III', label: '3rd Year (Junior)', sems: [5, 6] },
              { year: 4, name: 'Year IV', label: '4th Year (Senior)', sems: [7, 8] },
            ].map((y) => {
              const isSelected = yearFilter === String(y.year)
              const yCount = students.filter((s) => s.year === y.year).length
              return (
                <button
                  key={y.year}
                  onClick={() => {
                    setYearFilter(String(y.year))
                    setSemFilter('ALL')
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1455D9] to-[#0A2A5E] text-white border-[#1455D9] shadow-md ring-2 ring-[#1455D9]/30 scale-101'
                      : 'bg-gray-50 hover:bg-blue-50/60 border-gray-200 text-gray-700'
                  }`}
                >
                  <span className={`text-[10px] font-extrabold uppercase block ${
                    isSelected ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {y.name}
                  </span>
                  <p className="text-xs font-black mt-0.5">{y.label}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-1 inline-block ${
                    isSelected ? 'bg-[#F4C430] text-[#071A3D]' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {yCount} {yCount === 1 ? 'Student' : 'Students'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* STEP 2: Choose Semester within Selected Year */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F4C430] text-[#071A3D] text-[11px] font-black flex items-center justify-center">2</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                Step 2: Choose Semester {yearFilter !== 'ALL' ? `(Year ${yearFilter})` : '(All 8 Semesters)'}
              </h3>
            </div>
            {semFilter !== 'ALL' && (
              <button
                onClick={() => setSemFilter('ALL')}
                className="text-[11px] font-bold text-[#1455D9] hover:underline cursor-pointer"
              >
                Clear Semester Filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSemFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                semFilter === 'ALL'
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {yearFilter === 'ALL' ? 'All 8 Semesters' : `All Semesters in Year ${yearFilter}`}
            </button>

            {allSemesters
              .filter((s) => yearFilter === 'ALL' || s.year === Number(yearFilter))
              .map((s) => {
                const count = getSemCount(s.sem)
                const isSelected = semFilter === String(s.sem)
                return (
                  <button
                    key={s.sem}
                    onClick={() => {
                      if (isSelected) {
                        setSemFilter('ALL')
                      } else {
                        setSemFilter(String(s.sem))
                        setYearFilter(String(s.year))
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-sm ring-2 ring-[#071A3D]/20'
                        : 'bg-white hover:bg-blue-50 border-gray-200 text-[#071A3D]'
                    }`}
                  >
                    <span>{s.label} ({s.yearName})</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-[#F4C430] text-[#071A3D]' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Enrolled</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{students.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">4 Years · 8 Semesters</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Status</p>
          <p className="text-2xl font-black text-green-700 mt-0.5">
            {students.filter((s) => s.status.toLowerCase() === 'active').length}
          </p>
          <p className="text-[10px] text-green-700 font-medium mt-1">100% Attendance Eligible</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Filter</p>
          <p className="text-lg font-black text-purple-700 mt-0.5">
            {yearFilter === 'ALL' && semFilter === 'ALL'
              ? 'All Years & Sems'
              : semFilter !== 'ALL'
                ? `Sem ${semFilter} (Year ${Math.ceil(Number(semFilter) / 2)})`
                : `Year ${yearFilter} (All Sems)`}
          </p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">
            Matching {filteredStudents.length} Students
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Department</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">B.Tech AI &amp; DS</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">Anna University · Reg 2021</p>
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

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Step 1: Academic Year Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Year:</span>
            <select
              value={yearFilter}
              onChange={(e) => {
                const val = e.target.value
                setYearFilter(val)
                setSemFilter('ALL')
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Years (I - IV)</option>
              <option value="1">Year I (Freshman)</option>
              <option value="2">Year II (Sophomore)</option>
              <option value="3">Year III (Junior)</option>
              <option value="4">Year IV (Senior)</option>
            </select>
          </div>

          {/* Step 2: Cascading Semester Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Semester:</span>
            <select
              value={semFilter}
              onChange={(e) => {
                const val = e.target.value
                setSemFilter(val)
                if (val !== 'ALL') {
                  setYearFilter(String(Math.ceil(Number(val) / 2)))
                }
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#1455D9] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">
                {yearFilter === 'ALL' ? 'All 8 Semesters' : `All Sems in Year ${yearFilter}`}
              </option>
              {allSemesters
                .filter((s) => yearFilter === 'ALL' || s.year === Number(yearFilter))
                .map((s) => (
                  <option key={s.sem} value={s.sem}>
                    {s.label} ({s.yearName})
                  </option>
                ))}
            </select>
          </div>

          {/* Step 3: Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Section:</span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All 4 Sections (A - D)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
            Showing {filteredStudents.length} of {students.length}
          </span>
        </div>
      </div>

      {/* Students Data Table / Empty State */}
      {students.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <GraduationCap className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Students Registered Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            All sample records have been removed. Click below to add your actual students into the database.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Add First Real Student
          </button>
        </div>
      ) : (
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
                                password: '',
                              })
                              setIsEditModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Student Record"
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
      )}

      {/* MODAL: ADD STUDENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Register Real Student Candidate</h3>
                <p className="text-xs text-gray-500">Records will be saved directly into the database</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
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
                    placeholder="e.g. 23AD001"
                    value={formData.registerNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, registerNumber: e.target.value.toUpperCase() })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K. Aishwarya"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Institutional Email <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. 23ad001@vsb.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Student can verify during first login.</p>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TempPass@2026"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/20 focus:bg-white focus:outline-none focus:border-[#1455D9] font-mono font-bold text-[#071A3D]"
                  />
                  <p className="text-[10px] text-[#1455D9] font-medium mt-1">Student will use this temporary password for their first login &amp; verification.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 90252 10001"
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
                  <label className="block font-bold text-[#071A3D] mb-1">Semester (1 - 8)</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => {
                      const sem = Number(e.target.value)
                      setFormData({ ...formData, semester: sem, year: Math.ceil(sem / 2) })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem} (Year {Math.ceil(sem / 2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => {
                      const y = Number(e.target.value)
                      setFormData({ ...formData, year: y, semester: (y * 2) - 1 })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={1}>Year 1 (Freshman)</option>
                    <option value={2}>Year 2 (Sophomore)</option>
                    <option value={3}>Year 3 (Junior)</option>
                    <option value={4}>Year 4 (Senior)</option>
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
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
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
                  {isLoading ? 'Saving...' : 'Save Student to Database'}
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
                <h3 className="text-lg font-black text-[#071A3D]">Edit Student Record</h3>
                <p className="text-xs text-[#1455D9] font-mono font-bold">
                  {selectedStudent.registerNumber}
                </p>
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
                <label className="block font-bold text-[#071A3D] mb-1">Student Full Name</label>
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
                  <label className="block font-bold text-[#071A3D] mb-1">Institutional Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Reset Password <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter new password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone</label>
                  <input
                    type="text"
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
                  <label className="block font-bold text-[#071A3D] mb-1">Semester (1 - 8)</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => {
                      const sem = Number(e.target.value)
                      setFormData({ ...formData, semester: sem, year: Math.ceil(sem / 2) })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem} (Year {Math.ceil(sem / 2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => {
                      const y = Number(e.target.value)
                      setFormData({ ...formData, year: y, semester: (y * 2) - 1 })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={1}>Year 1 (Freshman)</option>
                    <option value={2}>Year 2 (Sophomore)</option>
                    <option value={3}>Year 3 (Junior)</option>
                    <option value={4}>Year 4 (Senior)</option>
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
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
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
                  {isLoading ? 'Updating...' : 'Save Changes'}
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
                <span className="font-mono text-xs font-black text-[#1455D9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                  {selectedStudent.registerNumber}
                </span>
                <h3 className="text-lg font-black text-[#071A3D] mt-1">{selectedStudent.name}</h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Department:</span>
                  <span className="font-bold text-[#071A3D]">AI &amp; DS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Academic Standing:</span>
                  <span className="font-bold text-[#071A3D]">
                    Year {selectedStudent.year} · Sem {selectedStudent.semester} · Sec{' '}
                    {selectedStudent.section}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-bold text-green-700 uppercase">{selectedStudent.status}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-[#1455D9]" />
                  <span>{selectedStudent.email}</span>
                </div>
                {selectedStudent.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#1455D9]" />
                    <span>{selectedStudent.phone}</span>
                  </div>
                )}
                {selectedStudent.dateOfBirth && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-[#1455D9]" />
                    <span>Date of Birth: {selectedStudent.dateOfBirth}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#071A3D] text-white font-bold cursor-pointer"
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
