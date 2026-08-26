'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Users,
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
  BookOpen,
  Briefcase,
  Award,
  GraduationCap,
  Sparkles,
  Layers,
  Calendar,
  UserCheck,
  BookMarked,
  SlidersHorizontal,
  ChevronRight,
  School,
  Lock,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { cn } from '@/lib/utils'

export interface FacultyRecord {
  id: string
  facultyId: string
  name: string
  email: string
  phone?: string | null
  designation: string
  qualification: string
  experience: number
  specialization: string
  subjects: string[] | string
  advisorBatch?: string | null
  advisorYear?: number | null
  advisorSem?: number | null
  advisorSec?: string | null
  facultyType?: string
  status: string
}

export function AdminFacultyView({ initialFaculty }: { initialFaculty: FacultyRecord[] }) {
  // Active View Tab: 'advisors' (Class Advisors) vs 'handlers' (Subject Handlers)
  const [activeTab, setActiveTab] = useState<'advisors' | 'handlers'>('advisors')
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>(initialFaculty)
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [designationFilter, setDesignationFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(false)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    email: '',
    phone: '',
    password: 'vsb@123',
    designation: 'Assistant Professor',
    qualification: 'M.E., Ph.D.',
    experience: 5,
    specialization: 'Artificial Intelligence & Machine Learning',
    subjects: '["AD2301", "AD2302"]',
    advisorBatch: 'Year II - Sem 4 - Sec A',
    advisorYear: 2,
    advisorSem: 4,
    advisorSec: 'A',
    facultyType: 'both',
    status: 'active',
  })

  // Normalize subjects array helper
  const getSubjectsList = (subjects: string[] | string): string[] => {
    if (Array.isArray(subjects)) return subjects
    if (typeof subjects === 'string') {
      try {
        const parsed = JSON.parse(subjects)
        if (Array.isArray(parsed)) return parsed
      } catch {}
      return subjects ? [subjects] : []
    }
    return []
  }

  // Filtered lists for each tab
  const advisorsList = useMemo(() => {
    return facultyList.filter((f) => {
      const isAdvisor =
        f.advisorBatch ||
        f.facultyType === 'advisor' ||
        f.facultyType === 'both' ||
        !f.facultyType
      if (!isAdvisor) return false

      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.advisorBatch && f.advisorBatch.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesYear =
        yearFilter === 'ALL' ||
        String(f.advisorYear) === yearFilter ||
        (f.advisorBatch && f.advisorBatch.includes(`Year ${yearFilter}`))

      return matchesSearch && matchesYear
    })
  }, [facultyList, searchQuery, yearFilter])

  const handlersList = useMemo(() => {
    return facultyList.filter((f) => {
      const subjs = getSubjectsList(f.subjects)
      const isHandler =
        subjs.length > 0 ||
        f.facultyType === 'subject_handler' ||
        f.facultyType === 'both' ||
        !f.facultyType
      if (!isHandler) return false

      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subjs.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesDesignation =
        designationFilter === 'ALL' ||
        f.designation.toLowerCase().includes(designationFilter.toLowerCase())

      return matchesSearch && matchesDesignation
    })
  }, [facultyList, searchQuery, designationFilter])

  // PDF Export
  const handleExportPDF = () => {
    const isAdvisors = activeTab === 'advisors'
    generateAndDownloadPDF({
      title: isAdvisors
        ? 'DEPARTMENT OF AI & DS — CLASS ADVISORS DIRECTORY'
        : 'DEPARTMENT OF AI & DS — SUBJECT HANDLERS & COURSE DIRECTORY',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Department Administrator',
      category: isAdvisors ? 'Class In-Charges & Mentors' : 'Course Instructors',
      sections: [
        {
          heading: isAdvisors ? '1. CLASS ADVISORS SUMMARY' : '1. COURSE INSTRUCTORS SUMMARY',
          body: [
            `Total Faculty Count: ${facultyList.length} Faculty Members`,
            `Active View: ${isAdvisors ? 'Class Mentors & Batch Advisors' : 'Subject Handlers & Course Allocations'}`,
            `Department: Artificial Intelligence & Data Science (AI & DS)`,
          ],
        },
        {
          heading: isAdvisors ? '2. CLASS ADVISORS ALLOCATION' : '2. SUBJECT HANDLERS ALLOCATION',
          body: (isAdvisors ? advisorsList : handlersList).map((f, idx) => {
            if (isAdvisors) {
              return `${idx + 1}. [${f.facultyId}] ${f.name} — ${f.designation} | Assigned Batch: ${f.advisorBatch || 'Year II (Sec A)'} | Contact: ${f.email}`
            } else {
              const subjs = getSubjectsList(f.subjects).join(', ') || 'AD2301, AD2302'
              return `${idx + 1}. [${f.facultyId}] ${f.name} — ${f.designation} (${f.specialization}) | Courses Handled: [${subjs}]`
            }
          }),
        },
      ],
      fileName: isAdvisors ? 'VSB_AI_DS_Class_Advisors_2026' : 'VSB_AI_DS_Subject_Handlers_2026',
    })
  }

  // Handle Add Faculty Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in Faculty Name and Email.')
      return
    }

    setIsLoading(true)
    try {
      let subjectsArr: string[] = []
      try {
        subjectsArr = JSON.parse(formData.subjects)
      } catch {
        subjectsArr = formData.subjects.split(',').map((s) => s.trim()).filter(Boolean)
      }

      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subjects: subjectsArr,
        }),
      })
      const result = await res.json()

      if (result.success && result.faculty) {
        setFacultyList([result.faculty, ...facultyList])
        setIsAddModalOpen(false)
        setFormData({
          facultyId: '',
          name: '',
          email: '',
          phone: '',
          password: 'vsb@123',
          designation: 'Assistant Professor',
          qualification: 'M.E., Ph.D.',
          experience: 5,
          specialization: 'Artificial Intelligence & Machine Learning',
          subjects: '["AD2301", "AD2302"]',
          advisorBatch: 'Year II - Sem 4 - Sec A',
          advisorYear: 2,
          advisorSem: 4,
          advisorSec: 'A',
          facultyType: 'both',
          status: 'active',
        })
        alert('Faculty successfully registered in database!')
      } else {
        alert(result.message || 'Failed to register faculty')
      }
    } catch (err) {
      console.error(err)
      alert('Network error adding faculty.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Edit Faculty Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFaculty) return

    setIsLoading(true)
    try {
      let subjectsArr: string[] = []
      try {
        subjectsArr = JSON.parse(formData.subjects)
      } catch {
        subjectsArr = formData.subjects.split(',').map((s) => s.trim()).filter(Boolean)
      }

      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          facultyId: selectedFaculty.facultyId,
          subjects: subjectsArr,
        }),
      })
      const result = await res.json()

      if (result.success) {
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
                  subjects: subjectsArr,
                  advisorBatch: formData.advisorBatch,
                  advisorYear: formData.advisorYear,
                  advisorSem: formData.advisorSem,
                  advisorSec: formData.advisorSec,
                  facultyType: formData.facultyType,
                  status: formData.status,
                }
              : f
          )
        )
        setIsEditModalOpen(false)
        alert('Faculty record updated successfully in database!')
      } else {
        alert(result.message || 'Failed to update faculty')
      }
    } catch (err) {
      console.error(err)
      alert('Network error updating faculty.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Delete Faculty
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove all their course and advisory assignments.`)) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setFacultyList(facultyList.filter((f) => f.id !== id && f.facultyId !== id))
        alert(`${name} removed successfully.`)
      } else {
        alert(result.message || 'Failed to delete faculty')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting faculty.')
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
              Faculty Directorate
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Faculty Management &amp; Cadre</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Separated into dedicated pages for <strong>Class Advisors</strong> and <strong>Subject Handlers</strong>
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F4C430]" /> Export Directorate (PDF)
          </button>
          <button
            onClick={() => {
              setFormData({
                facultyId: `FAC${Math.floor(100 + Math.random() * 900)}`,
                name: '',
                email: '',
                phone: '',
                password: 'vsb@123',
                designation: 'Assistant Professor',
                qualification: 'M.E., Ph.D.',
                experience: 5,
                specialization: 'Artificial Intelligence & Machine Learning',
                subjects: '["AD2301", "AD2302"]',
                advisorBatch: activeTab === 'advisors' ? 'Year II - Sem 4 - Sec A' : '',
                advisorYear: 2,
                advisorSem: 4,
                advisorSec: 'A',
                facultyType: activeTab === 'advisors' ? 'advisor' : 'subject_handler',
                status: 'active',
              })
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'advisors' ? 'Assign New Class Advisor' : 'Add Subject Handler'}
          </button>
        </div>
      </div>

      {/* TWO PRIMARY PAGES / TABS: CLASS ADVISORS vs SUBJECT HANDLERS */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200">
          <button
            onClick={() => setActiveTab('advisors')}
            className={cn(
              'px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer',
              activeTab === 'advisors'
                ? 'bg-[#1455D9] text-white shadow-md'
                : 'text-gray-600 hover:text-[#071A3D] hover:bg-white/60'
            )}
          >
            <UserCheck className="w-4 h-4" />
            Page 1: Class Advisors (Mentors)
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                activeTab === 'advisors' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              )}
            >
              {advisorsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('handlers')}
            className={cn(
              'px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer',
              activeTab === 'handlers'
                ? 'bg-[#1455D9] text-white shadow-md'
                : 'text-gray-600 hover:text-[#071A3D] hover:bg-white/60'
            )}
          >
            <BookMarked className="w-4 h-4" />
            Page 2: Subject Handlers (Course Instructors)
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                activeTab === 'handlers' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              )}
            >
              {handlersList.length}
            </span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'advisors'
                ? 'Search advisors by name or batch...'
                : 'Search handlers by name or course code...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* PAGE 1: CLASS ADVISORS VIEW */}
      {/* ========================================================= */}
      {activeTab === 'advisors' && (
        <div className="space-y-5 animate-fade-in">
          {/* Quick Year Filter for Advisors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-gray-500 mr-1">Filter Batch:</span>
            {[
              { label: 'All Batches', val: 'ALL' },
              { label: 'Year I (Freshman)', val: '1' },
              { label: 'Year II (Sophomore)', val: '2' },
              { label: 'Year III (Junior)', val: '3' },
              { label: 'Year IV (Senior)', val: '4' },
            ].map((b) => (
              <button
                key={b.val}
                onClick={() => setYearFilter(b.val)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                  yearFilter === b.val
                    ? 'bg-[#071A3D] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Advisors Table */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-blue-50/60 border-b border-gray-200 text-[#071A3D]">
                  <th className="p-4 font-black">Faculty ID &amp; Name</th>
                  <th className="p-4 font-black">Assigned Class &amp; Section</th>
                  <th className="p-4 font-black">Designation &amp; Qualification</th>
                  <th className="p-4 font-black">Advisory Contact</th>
                  <th className="p-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {advisorsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No Class Advisors found matching your filter.
                    </td>
                  </tr>
                ) : (
                  advisorsList.map((advisor) => (
                    <tr key={advisor.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#1455D9]/10 text-[#1455D9] font-black text-sm flex items-center justify-center border border-[#1455D9]/20">
                            {advisor.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#071A3D] text-sm block">
                              {advisor.name}
                            </span>
                            <span className="font-mono text-[11px] text-[#1455D9] font-bold">
                              {advisor.facultyId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200 inline-flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {advisor.advisorBatch ||
                            `Year ${advisor.advisorYear || 2} · Sem ${advisor.advisorSem || 4} (${advisor.advisorSec || 'Sec A'})`}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-gray-800 block">
                          {advisor.designation}
                        </span>
                        <span className="text-gray-500 text-[11px]">
                          {advisor.qualification} ({advisor.experience} Yrs Exp)
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5 text-[11px] text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#1455D9]" />
                            <span>{advisor.email}</span>
                          </div>
                          {advisor.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#1455D9]" />
                              <span>{advisor.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedFaculty(advisor)
                              const subjs = getSubjectsList(advisor.subjects)
                              setFormData({
                                facultyId: advisor.facultyId,
                                name: advisor.name,
                                email: advisor.email,
                                phone: advisor.phone || '',
                                password: '',
                                designation: advisor.designation,
                                qualification: advisor.qualification,
                                experience: advisor.experience,
                                specialization: advisor.specialization,
                                subjects: JSON.stringify(subjs),
                                advisorBatch: advisor.advisorBatch || 'Year II - Sem 4 - Sec A',
                                advisorYear: advisor.advisorYear || 2,
                                advisorSem: advisor.advisorSem || 4,
                                advisorSec: advisor.advisorSec || 'A',
                                facultyType: advisor.facultyType || 'advisor',
                                status: advisor.status,
                              })
                              setIsEditModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Advisor Allocation"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(advisor.id, advisor.name)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove Faculty"
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

      {/* ========================================================= */}
      {/* PAGE 2: SUBJECT HANDLERS VIEW */}
      {/* ========================================================= */}
      {activeTab === 'handlers' && (
        <div className="space-y-5 animate-fade-in">
          {/* Designation Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-gray-500 mr-1">Designation:</span>
            {[
              { label: 'All Cadres', val: 'ALL' },
              { label: 'Professors', val: 'Professor' },
              { label: 'Associate Professors', val: 'Associate' },
              { label: 'Assistant Professors', val: 'Assistant' },
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => setDesignationFilter(d.val)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                  designationFilter === d.val
                    ? 'bg-[#071A3D] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Subject Handlers Table */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-blue-50/60 border-b border-gray-200 text-[#071A3D]">
                  <th className="p-4 font-black">Faculty &amp; ID</th>
                  <th className="p-4 font-black">Handled Courses &amp; Subjects</th>
                  <th className="p-4 font-black">Specialization Domain</th>
                  <th className="p-4 font-black">Designation &amp; Experience</th>
                  <th className="p-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {handlersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No Subject Handlers found matching your search.
                    </td>
                  </tr>
                ) : (
                  handlersList.map((handler) => {
                    const subjs = getSubjectsList(handler.subjects)
                    return (
                      <tr key={handler.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center border border-purple-200">
                              {handler.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-[#071A3D] text-sm block">
                                {handler.name}
                              </span>
                              <span className="font-mono text-[11px] text-[#1455D9] font-bold">
                                {handler.facultyId}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {subjs.length > 0 ? (
                              subjs.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-xl bg-blue-50 text-[#1455D9] font-mono font-bold border border-blue-200/60"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">No courses assigned yet</span>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-gray-800 block">
                            {handler.specialization || 'AI & Machine Learning'}
                          </span>
                          <span className="text-[11px] text-gray-500">{handler.qualification}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-[#071A3D] block">{handler.designation}</span>
                          <span className="text-green-700 font-bold text-[11px]">
                            {handler.experience}+ Years Academic Exp
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedFaculty(handler)
                                setFormData({
                                  facultyId: handler.facultyId,
                                  name: handler.name,
                                  email: handler.email,
                                  phone: handler.phone || '',
                                  password: '',
                                  designation: handler.designation,
                                  qualification: handler.qualification,
                                  experience: handler.experience,
                                  specialization: handler.specialization,
                                  subjects: JSON.stringify(subjs),
                                  advisorBatch: handler.advisorBatch || '',
                                  advisorYear: handler.advisorYear || 2,
                                  advisorSem: handler.advisorSem || 4,
                                  advisorSec: handler.advisorSec || 'A',
                                  facultyType: handler.facultyType || 'subject_handler',
                                  status: handler.status,
                                })
                                setIsEditModalOpen(true)
                              }}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Edit Course Allocation"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(handler.id, handler.name)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove Faculty"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD FACULTY / ADVISOR / SUBJECT HANDLER */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">
                  {activeTab === 'advisors' ? 'Assign New Class Advisor' : 'Add Subject Handler'}
                </h3>
                <p className="text-xs text-gray-500">Record will be saved directly into institutional database</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Faculty ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono font-bold text-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Full Name with Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. S. Karthik"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Faculty Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. karthik@vsb.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Initial Login Password *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/20 font-mono font-bold text-[#071A3D]"
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
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.E., Ph.D."
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              {/* Class Advisor Assignment Fields */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#1455D9]" />
                  Class Advisor Assignment (Page 1):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Year</label>
                    <select
                      value={formData.advisorYear}
                      onChange={(e) => {
                        const y = Number(e.target.value)
                        setFormData({
                          ...formData,
                          advisorYear: y,
                          advisorSem: (y * 2) - 1,
                          advisorBatch: `Year ${y} - Sem ${(y * 2) - 1} - Sec ${formData.advisorSec}`,
                        })
                      }}
                      className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-xs"
                    >
                      <option value={1}>Year 1 (Freshman)</option>
                      <option value={2}>Year 2 (Sophomore)</option>
                      <option value={3}>Year 3 (Junior)</option>
                      <option value={4}>Year 4 (Senior)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Semester</label>
                    <select
                      value={formData.advisorSem}
                      onChange={(e) => {
                        const s = Number(e.target.value)
                        setFormData({
                          ...formData,
                          advisorSem: s,
                          advisorBatch: `Year ${formData.advisorYear} - Sem ${s} - Sec ${formData.advisorSec}`,
                        })
                      }}
                      className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-xs"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Section</label>
                    <select
                      value={formData.advisorSec}
                      onChange={(e) => {
                        const sec = e.target.value
                        setFormData({
                          ...formData,
                          advisorSec: sec,
                          advisorBatch: `Year ${formData.advisorYear} - Sem ${formData.advisorSem} - Sec ${sec}`,
                        })
                      }}
                      className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-xs"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subject Handler Assignment Fields */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4 text-purple-700" />
                  Subject Handler Courses (Page 2):
                </span>
                <div>
                  <label className="block font-bold text-gray-600 text-[11px] mb-0.5">
                    Course Codes Handled (Comma-separated or JSON)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AD2301, AD2302, AD2305"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono font-bold text-purple-800"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Example: AD2301 (Data Structures), AD2305 (Machine Learning)</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
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
                  {isLoading ? 'Saving...' : 'Save Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT FACULTY / ADVISOR / SUBJECT HANDLER */}
      {/* ========================================================= */}
      {isEditModalOpen && selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Edit Faculty &amp; Role Allocation</h3>
                <p className="text-xs text-[#1455D9] font-mono font-bold">{selectedFaculty.facultyId}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
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
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              {/* Class Advisor Assignment */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#1455D9]" />
                  Class Advisor Allocation:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Year</label>
                    <select
                      value={formData.advisorYear}
                      onChange={(e) => {
                        const y = Number(e.target.value)
                        setFormData({
                          ...formData,
                          advisorYear: y,
                          advisorSem: (y * 2) - 1,
                          advisorBatch: `Year ${y} - Sem ${(y * 2) - 1} - Sec ${formData.advisorSec}`,
                        })
                      }}
                      className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-xs"
                    >
                      <option value={1}>Year 1</option>
                      <option value={2}>Year 2</option>
                      <option value={3}>Year 3</option>
                      <option value={4}>Year 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Semester</label>
                    <select
                      value={formData.advisorSem}
                      onChange={(e) => {
                        const s = Number(e.target.value)
                        setFormData({
                          ...formData,
                          advisorSem: s,
                          advisorBatch: `Year ${formData.advisorYear} - Sem ${s} - Sec ${formData.advisorSec}`,
                        })
                      }}
                      className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-xs"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Section</label>
                    <select
                      value={formData.advisorSec}
                      onChange={(e) => {
                        const sec = e.target.value
                        setFormData({
                          ...formData,
                          advisorSec: sec,
                          advisorBatch: `Year ${formData.advisorYear} - Sem ${formData.advisorSem} - Sec ${sec}`,
                        })
                      }}
                      className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-xs"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subject Handler Assignment */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4 text-purple-700" />
                  Subject Handler Courses:
                </span>
                <div>
                  <label className="block font-bold text-gray-600 text-[11px] mb-0.5">
                    Course Codes Handled
                  </label>
                  <input
                    type="text"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono font-bold text-purple-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
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
                  {isLoading ? 'Updating...' : 'Update Faculty Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
