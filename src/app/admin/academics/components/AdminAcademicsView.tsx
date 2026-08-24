'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  Plus,
  Trash2,
  Download,
  Eye,
  X,
  Search,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface SubjectItem {
  id: string
  code: string
  name: string
  credits: number
  category: string
  facultyInCharge: string
  semester: number
  description?: string | null
  units: { number: number; title: string; hours: number }[]
}

export function AdminAcademicsView({
  totalResources,
  totalQuestionPapers,
  initialSubjects,
}: {
  totalResources: number
  totalQuestionPapers: number
  initialSubjects: SubjectItem[]
}) {
  const [subjects, setSubjects] = useState<SubjectItem[]>(initialSubjects)
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState<SubjectItem | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 4,
    category: 'Professional Core (PC)',
    facultyInCharge: '',
    semester: 3,
    description: '',
  })

  const filteredSubjects = subjects.filter((s) => {
    const matchesSemester = selectedSemester === 'ALL' || s.semester === selectedSemester
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.facultyInCharge.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSemester && matchesSearch
  })

  const currentSemesterCredits = filteredSubjects.reduce((acc, s) => acc + s.credits, 0)

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
      subtitle: `Regulation 2021 (Autonomous) · ${selectedSemester === 'ALL' ? 'Complete 8-Semester Curricular Blueprint' : `Semester ${selectedSemester} Syllabus Scheme`}`,
      author: 'Office of the Super Administrator & Academic Council',
      category: 'Official Academic Curriculum Blueprint',
      sections: [
        {
          heading: '1. CURRICULAR STRUCTURE & SCHEME OF INSTRUCTION',
          body: [
            `Total Courses in Current View: ${filteredSubjects.length} Approved Courses`,
            `Total Credits: ${currentSemesterCredits} Credits`,
            'Degree: B.Tech in AI & DS',
            'Body: Anna University, Chennai / NBA Tier-1 OBE Scheme',
          ],
        },
        {
          heading: '2. DETAILED LIST OF APPROVED COURSES',
          body: filteredSubjects.map((s, idx) => `${idx + 1}. [${s.code}] ${s.name} — Sem ${s.semester} (${s.credits} Cr) | ${s.facultyInCharge}`),
        },
      ],
      fileName: `VSB_AI_DS_Curriculum_${selectedSemester === 'ALL' ? 'Complete' : `Sem_${selectedSemester}`}_2026`,
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.name) {
      alert('Please fill in Course Code and Name')
      return
    }
    const newSub: SubjectItem = {
      id: 'sub_' + Date.now(),
      code: formData.code,
      name: formData.name,
      credits: Number(formData.credits),
      category: formData.category,
      facultyInCharge: formData.facultyInCharge,
      semester: Number(formData.semester),
      description: formData.description,
      units: [
        { number: 1, title: 'Foundational Principles & Concepts', hours: 9 },
        { number: 2, title: 'Core Architectural Formulations', hours: 9 },
        { number: 3, title: 'Analytical & Methodological Frameworks', hours: 9 },
        { number: 4, title: 'Advanced Algorithms & System Design', hours: 9 },
        { number: 5, title: 'Industrial Case Studies & Applications', hours: 9 },
      ],
    }
    setSubjects([...subjects, newSub])
    setIsAddModalOpen(false)
    setFormData({ code: '', name: '', credits: 4, category: 'Professional Core (PC)', facultyInCharge: '', semester: 3, description: '' })
  }

  const handleDelete = (id: string) => {
    if (confirm('Remove this course from the curriculum?')) {
      setSubjects(subjects.filter((s) => s.id !== id))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">Curriculum &amp; Syllabus Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Academic Curriculum &amp; Courses</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">Official 8-semester syllabus, 5-unit lesson blueprints &amp; credit distribution</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={handleExportPDF} className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 cursor-pointer">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105">
            <Plus className="w-4 h-4" /> + Add New Course
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Courses</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{filteredSubjects.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">{selectedSemester === 'ALL' ? 'All 8 Semesters' : `Semester ${selectedSemester}`}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Credits</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">{currentSemesterCredits}</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Anna Univ R2021</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Digital Resources</p>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">{totalResources}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">Digital Library</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Question Papers</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">{totalQuestionPapers}</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">IAT &amp; Model Exam</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search course, faculty..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9]" />
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]">
            <option value="ALL">All Semesters (1–8)</option>
            {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">Showing {filteredSubjects.length}</span>
        </div>
      </div>

      {/* Courses */}
      {filteredSubjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((sub) => (
            <div key={sub.id} className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-black text-[#1455D9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">{sub.code}</span>
                    <span className="ml-2 font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Sem {sub.semester}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-700">{sub.credits} Cr</span>
                </div>
                <h3 className="font-bold text-base text-[#071A3D] line-clamp-2">{sub.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{sub.description}</p>
                <div className="pt-2 space-y-1.5 text-xs text-gray-600 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-gray-700 font-semibold">{sub.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Faculty:</span>
                    <span className="font-bold text-[#1455D9]">{sub.facultyInCharge}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button onClick={() => setSelectedSubjectForModal(sub)} className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <Eye className="w-3.5 h-3.5" /> View Syllabus
                </button>
                <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-500 mb-1">No Courses Added Yet</h3>
          <p className="text-xs text-gray-400 mb-4">Click &ldquo;+ Add New Course&rdquo; to enter official curriculum and syllabus.</p>
          <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-[#1455D9] text-white text-xs font-bold cursor-pointer shadow-md">
            + Add First Course
          </button>
        </div>
      )}

      {/* Syllabus Modal */}
      {selectedSubjectForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="font-mono text-xs font-black text-[#1455D9] px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">{selectedSubjectForModal.code} · Sem {selectedSubjectForModal.semester}</span>
                <h2 className="text-xl font-black text-[#071A3D] mt-2">{selectedSubjectForModal.name}</h2>
                <p className="text-xs text-gray-500 mt-1">45 Hours · {selectedSubjectForModal.credits} Credits · {selectedSubjectForModal.category}</p>
              </div>
              <button onClick={() => setSelectedSubjectForModal(null)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {selectedSubjectForModal.units.map((unit) => (
                <div key={unit.number} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#071A3D] text-white font-mono text-[10px] font-black">UNIT {unit.number}</span>
                    <h4 className="font-bold text-xs text-[#071A3D]">{unit.title}</h4>
                  </div>
                  <span className="font-mono text-xs font-bold text-gray-600 bg-white px-2.5 py-1 rounded-xl border border-gray-200 shrink-0">{unit.hours} Hrs</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xs text-gray-500">Faculty: <span className="font-bold text-[#071A3D]">{selectedSubjectForModal.facultyInCharge}</span></div>
              <button onClick={() => setSelectedSubjectForModal(null)} className="px-5 py-2 rounded-xl bg-[#071A3D] text-white text-xs font-bold hover:bg-[#0a2a5e] cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Add New Course</h3>
                <p className="text-xs text-gray-500">Regulation 2021 Autonomous Scheme</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Course Code *</label>
                  <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]" />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Semester *</label>
                  <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]">
                    {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Course Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Credits</label>
                  <select value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]">
                    <option value={4}>4 Credits</option>
                    <option value={3}>3 Credits</option>
                    <option value={2}>2 Credits (Lab)</option>
                    <option value={10}>10 Credits (Capstone)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]">
                    <option value="Professional Core (PC)">Professional Core (PC)</option>
                    <option value="Basic Science (BS)">Basic Science (BS)</option>
                    <option value="Engineering Science (ES)">Engineering Science (ES)</option>
                    <option value="Professional Elective (PE)">Professional Elective (PE)</option>
                    <option value="Employability Enhancement (EEC)">Employability Lab (EEC)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Faculty Instructor</label>
                <input type="text" value={formData.facultyInCharge} onChange={(e) => setFormData({ ...formData, facultyInCharge: e.target.value })} className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]" />
              </div>
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Course Description</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
