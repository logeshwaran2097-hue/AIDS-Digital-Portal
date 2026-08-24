'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  GraduationCap,
  Calendar,
  Layers,
  FileText,
  Plus,
  Edit,
  Download,
  Users,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  FileCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface SubjectItem {
  id: string
  code: string
  name: string
  credits: number
  type: 'Theory' | 'Practical' | 'Integrated'
  semester: number
  year: string
  faculty: string
  unitsCompleted: number
  totalUnits: number
  syllabusAvailable: boolean
}

const ALL_SUBJECTS: SubjectItem[] = [
  // Semester 5 (Current Active)
  { id: '1', code: 'AD2301', name: 'Machine Learning', credits: 4, type: 'Theory', semester: 5, year: 'III Year', faculty: 'Dr. S. Karthik', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '2', code: 'AD2302', name: 'Artificial Intelligence & Expert Systems', credits: 3, type: 'Theory', semester: 5, year: 'III Year', faculty: 'Prof. T. Lakshmi', unitsCompleted: 4, totalUnits: 5, syllabusAvailable: true },
  { id: '3', code: 'AD2303', name: 'Big Data Analytics', credits: 3, type: 'Theory', semester: 5, year: 'III Year', faculty: 'Prof. R. Meena', unitsCompleted: 4, totalUnits: 5, syllabusAvailable: true },
  { id: '4', code: 'AD2304', name: 'Natural Language Processing', credits: 3, type: 'Theory', semester: 5, year: 'III Year', faculty: 'Dr. K. Mohan', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '5', code: 'AD2305', name: 'Deep Learning', credits: 4, type: 'Theory', semester: 5, year: 'III Year', faculty: 'Dr. S. Karthik', unitsCompleted: 4, totalUnits: 5, syllabusAvailable: true },
  { id: '6', code: 'AD2311', name: 'Machine Learning Laboratory', credits: 2, type: 'Practical', semester: 5, year: 'III Year', faculty: 'Dr. S. Karthik / Prof. R. Meena', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '7', code: 'AD2312', name: 'Deep Learning Laboratory', credits: 2, type: 'Practical', semester: 5, year: 'III Year', faculty: 'Dr. K. Mohan', unitsCompleted: 4, totalUnits: 5, syllabusAvailable: true },

  // Semester 3
  { id: '8', code: 'AD2201', name: 'Data Structures & Algorithms', credits: 4, type: 'Theory', semester: 3, year: 'II Year', faculty: 'Prof. R. Meena', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '9', code: 'AD2202', name: 'Database Management Systems', credits: 3, type: 'Theory', semester: 3, year: 'II Year', faculty: 'Dr. K. Mohan', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '10', code: 'AD2203', name: 'Discrete Mathematics', credits: 4, type: 'Theory', semester: 3, year: 'II Year', faculty: 'Prof. T. Lakshmi', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '11', code: 'AD2204', name: 'Operating Systems', credits: 3, type: 'Theory', semester: 3, year: 'II Year', faculty: 'Prof. R. Meena', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },

  // Semester 4
  { id: '12', code: 'AD2205', name: 'Computer Networks', credits: 3, type: 'Theory', semester: 4, year: 'II Year', faculty: 'Prof. T. Lakshmi', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '13', code: 'AD2206', name: 'Design and Analysis of Algorithms', credits: 4, type: 'Theory', semester: 4, year: 'II Year', faculty: 'Dr. S. Karthik', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '14', code: 'AD2207', name: 'Software Engineering & Agile', credits: 3, type: 'Theory', semester: 4, year: 'II Year', faculty: 'Dr. K. Mohan', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },

  // Semester 1
  { id: '15', code: 'HS2101', name: 'Professional English', credits: 3, type: 'Theory', semester: 1, year: 'I Year', faculty: 'Faculty Dept of English', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '16', code: 'MA2101', name: 'Matrices and Calculus', credits: 4, type: 'Theory', semester: 1, year: 'I Year', faculty: 'Faculty Dept of Maths', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '17', code: 'PH2101', name: 'Engineering Physics', credits: 3, type: 'Theory', semester: 1, year: 'I Year', faculty: 'Faculty Dept of Physics', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
  { id: '18', code: 'GE2101', name: 'Problem Solving and Python Programming', credits: 3, type: 'Theory', semester: 1, year: 'I Year', faculty: 'Dr. S. Karthik', unitsCompleted: 5, totalUnits: 5, syllabusAvailable: true },
]

export function HODAcademicsView() {
  const [selectedSemester, setSelectedSemester] = useState<number>(5)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<SubjectItem | null>(null)

  // Filtered by semester and search
  const filteredSubjects = ALL_SUBJECTS.filter((s) => {
    const matchesSemester = selectedSemester === 0 || s.semester === selectedSemester
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.faculty.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSemester && matchesSearch
  })

  const totalCredits = filteredSubjects.reduce((acc, s) => acc + s.credits, 0)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Curriculum &amp; Syllabus
            </span>
          </div>
          <h1 className="text-2xl font-black">Academic &amp; Course Management</h1>
          <p className="text-xs text-gray-300 mt-1">
            Curriculum structure, semester subject mapping, credit allocations &amp; faculty assignments
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> Add New Course
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Curriculum Courses</p>
          <p className="text-2xl font-black text-[#071A3D] mt-1">{ALL_SUBJECTS.length}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Semesters 1 through 8</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Selected Sem Subjects</p>
          <p className="text-2xl font-black text-[#1455D9] mt-1">{filteredSubjects.length}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Semester {selectedSemester}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Semester Credits</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{totalCredits} Credits</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Anna Univ Regulation 2021</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Academic Regulation</p>
          <p className="text-2xl font-black text-[#F4C430]">R-2021</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Autonomous Curriculum</p>
        </div>
      </div>

      {/* Semester Selection Tab Pill Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Semester to View Curriculum:</p>
          <span className="text-xs font-bold text-[#1455D9]">Currently Viewing: Semester {selectedSemester}</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={cn(
                'px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0',
                selectedSemester === sem
                  ? 'bg-[#1455D9] text-white shadow-md shadow-[#1455D9]/25 scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#071A3D]'
              )}
            >
              <span>Semester {sem}</span>
              {sem === 5 && <span className="px-1.5 py-0.2 bg-[#F4C430] text-[#071A3D] text-[9px] rounded-md font-black">ACTIVE</span>}
            </button>
          ))}
          <button
            onClick={() => setSelectedSemester(0)}
            className={cn(
              'px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0',
              selectedSemester === 0
                ? 'bg-[#071A3D] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All Semesters (1-8)
          </button>
        </div>
      </div>

      {/* Subject Search & Table List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1455D9]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
              Course Syllabus &amp; Subject Directory {selectedSemester ? `(Semester ${selectedSemester})` : ''}
            </h2>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course title or code..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9]/20"
            />
          </div>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No subjects found for Semester {selectedSemester}. Click "Add New Course" to add courses to this semester.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#071A3D] text-white">
                <tr>
                  <th className="py-3 px-4 font-bold">Course Code</th>
                  <th className="py-3 px-4 font-bold">Course Name &amp; Title</th>
                  <th className="py-3 px-3 font-bold text-center">Credits</th>
                  <th className="py-3 px-3 font-bold text-center">Type</th>
                  <th className="py-3 px-4 font-bold">Allocated Faculty</th>
                  <th className="py-3 px-3 font-bold text-center">Units Covered</th>
                  <th className="py-3 px-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubjects.map((s, idx) => (
                  <tr key={s.id} className={cn('hover:bg-blue-50/30 transition-colors', idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20')}>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1455D9]">{s.code}</td>
                    <td className="py-3.5 px-4 font-bold text-[#071A3D]">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{s.year} · Semester {s.semester}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold">{s.credits} Cr</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold',
                        s.type === 'Theory' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      )}>
                        {s.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                        <span>{s.faculty}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-green-600">
                      {s.unitsCompleted}/{s.totalUnits} Units
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedSubjectDetail(s)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#1455D9] hover:text-white text-[#071A3D] text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Syllabus
                        </button>
                        <button
                          onClick={() => alert(`Downloading official Syllabus PDF for ${s.code} - ${s.name}`)}
                          className="p-1 rounded-lg bg-[#22C7E8]/10 text-[#0e8fa3] hover:bg-[#22C7E8]/20 transition-colors"
                          title="Download Syllabus PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Syllabus Detail Modal */}
      {selectedSubjectDetail && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#1455D9]">{selectedSubjectDetail.code}</span>
                <h3 className="text-lg font-black text-[#071A3D]">{selectedSubjectDetail.name}</h3>
                <p className="text-xs text-gray-500">{selectedSubjectDetail.year} · Semester {selectedSubjectDetail.semester} · {selectedSubjectDetail.credits} Credits</p>
              </div>
              <button
                onClick={() => setSelectedSubjectDetail(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-[#071A3D] uppercase tracking-wider">Course Units (Regulation 2021):</h4>
              <div className="space-y-2">
                {[
                  { u: 'Unit I', t: 'Introduction & Foundational Principles', topics: 'Mathematical preliminaries, core concepts, design paradigm' },
                  { u: 'Unit II', t: 'Supervised Learning & Regression Models', topics: 'Linear models, decision boundaries, cost optimization' },
                  { u: 'Unit III', t: 'Classification & Support Vector Machines', topics: 'Kernel methods, margin maximization, multi-class strategies' },
                  { u: 'Unit IV', t: 'Unsupervised Learning & Clustering', topics: 'K-Means, PCA, dimensionality reduction algorithms' },
                  { u: 'Unit V', t: 'Neural Architectures & Case Studies', topics: 'Feedforward networks, backpropagation, industry deployments' },
                ].map((unit) => (
                  <div key={unit.u} className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#071A3D]">{unit.u}: {unit.t}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{unit.topics}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                      Complete
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedSubjectDetail(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Syllabus PDF downloaded.')
                  setSelectedSubjectDetail(null)
                }}
                className="px-4 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Full Syllabus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#071A3D]">Add New Curriculum Course</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-600 block mb-1">Course Code</label>
                <input type="text" placeholder="e.g. AD2306" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="font-bold text-gray-600 block mb-1">Course Name</label>
                <input type="text" placeholder="e.g. Computer Vision" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-600 block mb-1">Semester</label>
                  <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-600 block mb-1">Credits</label>
                  <input type="number" defaultValue={3} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-600 block mb-1">Assigned Faculty</label>
                <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs">
                  <option>Dr. S. Karthik (Professor)</option>
                  <option>Prof. R. Meena (Assoc. Professor)</option>
                  <option>Dr. K. Mohan (Asst. Professor)</option>
                  <option>Prof. T. Lakshmi (Asst. Professor)</option>
                </select>
              </div>
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
              <button
                onClick={() => {
                  alert('Course added to academic syllabus database!')
                  setShowAddModal(false)
                }}
                className="px-4 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold"
              >
                Save Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
