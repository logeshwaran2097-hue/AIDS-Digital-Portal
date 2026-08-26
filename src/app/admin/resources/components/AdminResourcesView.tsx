'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  BookOpen,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  CheckCircle2,
  Layers,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface ResourceRecord {
  id: string
  name: string
  description?: string | null
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  uploadedByName?: string | null
  status: string
  resourceType: string
  semester?: number | null
}

export function AdminResourcesView({ initialResources }: { initialResources: ResourceRecord[] }) {
  const [resources, setResources] = useState<ResourceRecord[]>(initialResources)
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL')
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<ResourceRecord | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fileName: '',
    resourceType: 'REFERENCE_BOOK',
    semester: 1,
    uploadedByName: 'System Administrator',
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

  const getSemCount = (semNumber: number) => {
    return resources.filter((r) => r.semester === semNumber).length
  }

  const filteredResources = resources.filter((r) => {
    const rSem = r.semester || 1
    const rYear = Math.ceil(rSem / 2)

    const matchesYear = selectedYear === 'ALL' || rYear === selectedYear
    const matchesSemester = selectedSemester === 'ALL' || rSem === selectedSemester
    const matchesType = typeFilter === 'ALL' || r.resourceType === typeFilter
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.uploadedByName && r.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesYear && matchesSemester && matchesType && matchesSearch
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — DIGITAL LIBRARY & STUDY ASSETS',
      subtitle: `V.S.B. Engineering College · Autonomous Institution · ${selectedSemester === 'ALL' ? 'Complete 8-Semester Asset Registry' : `Semester ${selectedSemester} Digital Repository`}`,
      author: 'Office of the Super Administrator',
      category: 'Official Digital Library Asset Registry',
      sections: [
        {
          heading: '1. DIGITAL REPOSITORY ASSET INVENTORY',
          body: [
            `Total Filtered Resources: ${filteredResources.length} Standard E-Books & Course Packs`,
            'Category: Standard Reference Textbooks, Lecture Notes, Lab Manuals & Interview Kits',
            'Storage & Security: Encrypted Vector PDF Digital Asset Storage',
            'Access Clearance: Open to all verified B.Tech AI & DS Enrolled Students and Faculty',
          ],
        },
        {
          heading: '2. CATALOG OF APPROVED REFERENCE TEXTBOOKS',
          body: filteredResources.map(
            (r, idx) =>
              `${idx + 1}. [Sem ${r.semester || 'All'}] ${r.name} — Type: ${r.resourceType} | Size: ${(r.fileSize / 1024 / 1024).toFixed(1)} MB | Verified by: ${r.uploadedByName || 'Faculty Lead'}`
          ),
        },
      ],
      fileName: `VSB_AI_DS_Digital_Library_${selectedSemester === 'ALL' ? 'Complete' : `Sem_${selectedSemester}`}_2026`,
    })
  }

  const handleDownloadFile = (res: ResourceRecord) => {
    generateAndDownloadPDF({
      title: res.name.toUpperCase(),
      subtitle: 'V.S.B. Engineering College · Department of AI & DS · Academic Library',
      author: res.uploadedByName || 'Faculty Lead',
      category: res.resourceType,
      sections: [
        {
          heading: 'DIGITAL ASSET OVERVIEW & DESCRIPTION',
          body: [
            res.description || 'Standard academic reference textbook for undergraduate AI & DS curriculum.',
            `File Name: ${res.fileName}`,
            `Asset Type: ${res.resourceType}`,
            `Semester Alignment: Semester ${res.semester || 1} (Year ${Math.ceil((res.semester || 1) / 2)})`,
            `Verified By: ${res.uploadedByName || 'Department BoS'}`,
          ],
        },
      ],
      fileName: res.fileName.replace(/\.[^/.]+$/, ''),
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      alert('Please fill in Resource Title')
      return
    }

    const newRes: ResourceRecord = {
      id: 'res_' + Date.now(),
      name: formData.name,
      description: formData.description,
      fileName: formData.fileName || `${formData.name.replace(/\s+/g, '_')}.pdf`,
      fileType: 'pdf',
      fileSize: 15400000,
      fileUrl: `/resources/${formData.fileName || 'document.pdf'}`,
      uploadedByName: formData.uploadedByName,
      status: 'approved',
      resourceType: formData.resourceType,
      semester: Number(formData.semester),
    }

    setResources([newRes, ...resources])
    setIsAddModalOpen(false)
    setFormData({
      name: '',
      description: '',
      fileName: '',
      resourceType: 'REFERENCE_BOOK',
      semester: 1,
      uploadedByName: 'System Administrator',
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this digital resource from the library?')) {
      setResources(resources.filter((r) => r.id !== id))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Digital Library &amp; Assets
            </span>
            <span className="text-xs text-gray-300 font-medium">· 8-Semester Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Study Resources &amp; E-Books</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Manage {resources.length} verified standard reference textbooks, lecture kits &amp; lab packs
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Library Catalog (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Upload New Resource
          </button>
        </div>
      </div>

      {/* 2-STEP HIERARCHICAL YEAR -> SEMESTER CURRICULUM SELECTOR */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
        {/* Step 1: Choose Academic Year */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1455D9] text-white text-[11px] font-black flex items-center justify-center">1</span>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                Step 1: Choose Academic Year
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-gray-500">
              {selectedYear === 'ALL' ? 'Browsing across all 4 Academic Years' : `Selected: Year ${selectedYear}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={() => {
                setSelectedYear('ALL')
                setSelectedSemester('ALL')
              }}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                selectedYear === 'ALL'
                  ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-md ring-2 ring-[#071A3D]/30'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase block opacity-80">All 4 Years</span>
              <p className="text-xs font-black mt-0.5">All Years</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-1 inline-block ${
                selectedYear === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {resources.length} Assets
              </span>
            </button>

            {[
              { year: 1, name: 'Year I', label: '1st Year (Freshman)', sems: [1, 2] },
              { year: 2, name: 'Year II', label: '2nd Year (Sophomore)', sems: [3, 4] },
              { year: 3, name: 'Year III', label: '3rd Year (Junior)', sems: [5, 6] },
              { year: 4, name: 'Year IV', label: '4th Year (Senior)', sems: [7, 8] },
            ].map((y) => {
              const isSelected = selectedYear === y.year
              const yCount = resources.filter((r) => Math.ceil((r.semester || 1) / 2) === y.year).length
              return (
                <button
                  key={y.year}
                  onClick={() => {
                    setSelectedYear(y.year)
                    setSelectedSemester('ALL')
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
                    {yCount} {yCount === 1 ? 'Asset' : 'Assets'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Choose Semester */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F4C430] text-[#071A3D] text-[11px] font-black flex items-center justify-center">2</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                Step 2: Choose Semester {selectedYear !== 'ALL' ? `(Year ${selectedYear})` : '(All 8 Semesters)'}
              </h3>
            </div>
            {selectedSemester !== 'ALL' && (
              <button
                onClick={() => setSelectedSemester('ALL')}
                className="text-[11px] font-bold text-[#1455D9] hover:underline cursor-pointer"
              >
                Clear Semester Filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSemester('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedSemester === 'ALL'
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {selectedYear === 'ALL' ? 'All 8 Semesters' : `All Semesters in Year ${selectedYear}`}
            </button>

            {allSemesters
              .filter((s) => selectedYear === 'ALL' || s.year === selectedYear)
              .map((s) => {
                const count = getSemCount(s.sem)
                const isSelected = selectedSemester === s.sem
                return (
                  <button
                    key={s.sem}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSemester('ALL')
                      } else {
                        setSelectedSemester(s.sem)
                        setSelectedYear(s.year)
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
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Digital Assets</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{filteredResources.length} Items</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">
            {selectedSemester === 'ALL' ? 'All 8 Semesters' : `Semester ${selectedSemester}`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Approved Status</p>
          <p className="text-2xl font-black text-green-700 mt-0.5">100% Approved</p>
          <p className="text-[10px] text-green-700 font-medium mt-1">Anna University BoS</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Filter</p>
          <p className="text-lg font-black text-purple-700 mt-0.5">
            {selectedSemester === 'ALL' ? 'All Semesters' : `Semester ${selectedSemester}`}
          </p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">
            {selectedYear === 'ALL' ? 'All 4 Years' : `Year ${selectedYear} Students`}
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
            placeholder="Search textbook title, author, file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                setSelectedYear(val)
                setSelectedSemester('ALL')
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Years (I - IV)</option>
              <option value={1}>Year I (Freshman)</option>
              <option value={2}>Year II (Sophomore)</option>
              <option value={3}>Year III (Junior)</option>
              <option value={4}>Year IV (Senior)</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => {
                const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                setSelectedSemester(val)
                if (val !== 'ALL') {
                  setSelectedYear(Math.ceil(val / 2))
                }
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#1455D9] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">
                {selectedYear === 'ALL' ? 'All 8 Semesters' : `All Sems in Year ${selectedYear}`}
              </option>
              {allSemesters
                .filter((s) => selectedYear === 'ALL' || s.year === selectedYear)
                .map((s) => (
                  <option key={s.sem} value={s.sem}>
                    {s.label} ({s.yearName})
                  </option>
                ))}
            </select>
          </div>

          {/* Asset Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Asset Types</option>
            <option value="REFERENCE_BOOK">Reference Textbooks</option>
            <option value="LECTURE_NOTES">Lecture Notes</option>
            <option value="LAB_MANUAL">Lab Manuals</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
            Showing {filteredResources.length} of {resources.length}
          </span>
        </div>
      </div>

      {/* Resources Cards Grid / Empty State */}
      {filteredResources.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredResources.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#1455D9] text-white flex items-center justify-center font-black text-sm shadow-md">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-purple-700 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 uppercase">
                          {r.resourceType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-black text-[#1455D9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                          Sem {r.semester || 1}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#071A3D] mt-1 line-clamp-2">{r.name}</h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800 shrink-0">
                    {r.status}
                  </span>
                </div>

                {r.description && <p className="text-xs text-gray-500 line-clamp-2">{r.description}</p>}

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-sans">File Name:</span>
                    <span className="text-[#071A3D] font-bold truncate max-w-[200px]">{r.fileName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-sans">File Size:</span>
                    <span className="text-[#1455D9] font-bold">{(r.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-sans">Verified By:</span>
                    <span className="text-gray-700 font-sans">{r.uploadedByName || 'Department Faculty'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleDownloadFile(r)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedResource(r)
                      setIsViewModalOpen(true)
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <BookOpen className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Study Resources in Current Selection</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            {selectedSemester !== 'ALL'
              ? `No e-books or materials uploaded for Semester ${selectedSemester} yet.`
              : 'The digital library is clean and ready for real textbooks and lecture packs.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Upload First Resource
          </button>
        </div>
      )}

      {/* MODAL: ADD RESOURCE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Upload Digital Resource / E-Book</h3>
                <p className="text-xs text-gray-500">Official Department Study Asset</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence: A Modern Approach"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Target Semester (1 - 8) *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
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
                  <label className="block font-bold text-[#071A3D] mb-1">Asset Category</label>
                  <select
                    value={formData.resourceType}
                    onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="REFERENCE_BOOK">Reference Textbook</option>
                    <option value="LECTURE_NOTES">Lecture Notes</option>
                    <option value="LAB_MANUAL">Lab Manual</option>
                    <option value="PLACEMENT_GUIDE">Placement Guide / Handbook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">File Name</label>
                <input
                  type="text"
                  placeholder="e.g. AI_Modern_Approach_4th_Ed.pdf"
                  value={formData.fileName}
                  onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Author details, edition, coverage topics..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW RESOURCE */}
      {isViewModalOpen && selectedResource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1455D9]">
                  Sem {selectedResource.semester || 1} · {selectedResource.resourceType.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-black text-[#071A3D] mt-2">{selectedResource.name}</h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600 leading-relaxed">{selectedResource.description || 'Standard verified textbook.'}</p>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">File Name:</span>
                  <span className="font-bold text-[#071A3D]">{selectedResource.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Size:</span>
                  <span className="font-bold text-[#1455D9]">{(selectedResource.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Target Semester:</span>
                  <span className="font-bold text-purple-700">
                    Semester {selectedResource.semester || 1} (Year {Math.ceil((selectedResource.semester || 1) / 2)})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                onClick={() => handleDownloadFile(selectedResource)}
                className="px-4 py-2 rounded-xl bg-[#1455D9] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Vector PDF
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs hover:bg-gray-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
