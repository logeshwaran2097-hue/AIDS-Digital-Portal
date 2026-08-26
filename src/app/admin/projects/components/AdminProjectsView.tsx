'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  FolderOpen,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
  Layers,
  Calendar,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface ProjectRecord {
  id: string
  title: string
  description?: string | null
  domain?: string | null
  year: number
  semester?: number | null
  status: string
  guideName?: string | null
  teamMembers?: string | null
}

export function AdminProjectsView({ initialProjects }: { initialProjects: ProjectRecord[] }) {
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects)
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL')
  const [selectedDomain, setSelectedDomain] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: 'Computer Vision & Deep Learning',
    year: 4,
    semester: 8,
    guideName: 'Dr. S. Karthik',
    teamMembers: 'K. Aishwarya (23AD001), R. Deepak (23AD002)',
    status: 'Approved & Active',
  })

  const yearCategories = [
    { year: 1, name: 'Year I', label: 'Mini Projects & Ideation', sems: 'Sem 1 & 2', color: 'blue' },
    { year: 2, name: 'Year II', label: 'Design & Software Prototypes', sems: 'Sem 3 & 4', color: 'purple' },
    { year: 3, name: 'Year III', label: 'Industry & Applied R&D', sems: 'Sem 5 & 6', color: 'indigo' },
    { year: 4, name: 'Year IV', label: 'Final Capstone & IEEE Patents', sems: 'Sem 7 & 8', color: 'emerald' },
  ]

  const getYearCount = (yearNum: number) => {
    return projects.filter((p) => (p.year || 4) === yearNum).length
  }

  const filteredProjects = projects.filter((p) => {
    const pYear = p.year || 4
    const matchesYear = selectedYear === 'ALL' || pYear === selectedYear
    const matchesDomain = selectedDomain === 'ALL' || (p.domain && p.domain.includes(selectedDomain))
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.domain && p.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.guideName && p.guideName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.teamMembers && p.teamMembers.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesYear && matchesDomain && matchesSearch
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — CAPSTONE PROJECTS & R&D HUB',
      subtitle: `V.S.B. Engineering College · Autonomous Institution · ${selectedYear === 'ALL' ? 'Complete 4-Year R&D Directory' : `Year ${selectedYear} Projects Directory`}`,
      author: 'Office of the Super Administrator',
      category: 'Official Capstone R&D Synopsis Registry',
      sections: [
        {
          heading: '1. R&D CAPSTONE INNOVATION DIRECTORY',
          body: [
            `Total Filtered Capstone Teams: ${filteredProjects.length} Multidisciplinary Teams`,
            'Research Verticals: Computer Vision, LLMs, Speech AI, Healthcare ML, GNNs, Blockchain',
            'Supervision: Full-Time Ph.D. Faculty Research Mentors',
            'Evaluation Standard: Autonomous Innovation, IEEE Format & Patent Potential',
          ],
        },
        {
          heading: '2. APPROVED CAPSTONE TEAMS & SYNOPSIS',
          body: filteredProjects.map(
            (p, idx) =>
              `${idx + 1}. [Year ${p.year || 4}] "${p.title}" — Domain: ${p.domain || 'Applied AI'} | Guide: ${p.guideName || 'Faculty Guide'} | Team: ${p.teamMembers || 'Student Cohort'}`
          ),
        },
      ],
      fileName: `VSB_AI_DS_Projects_${selectedYear === 'ALL' ? 'All_Years' : `Year_${selectedYear}`}_2026`,
    })
  }

  const handleDownloadSynopsis = (proj: ProjectRecord) => {
    generateAndDownloadPDF({
      title: proj.title.toUpperCase(),
      subtitle: `V.S.B. Engineering College · Year ${proj.year || 4} Research Proposal · 2025-2026`,
      author: proj.guideName || 'Research Supervisor',
      category: 'Project Synopsis',
      sections: [
        {
          heading: '1. RESEARCH ABSTRACT & PROBLEM STATEMENT',
          body: [
            proj.description || 'Undergraduate Capstone Research project developing production AI models and autonomous systems.',
            `Domain Vertical: ${proj.domain || 'Applied Artificial Intelligence'}`,
            `Academic Cadre: Year ${proj.year || 4} (Semester ${proj.semester || ((proj.year || 4) * 2)})`,
            `Project Status: ${proj.status}`,
          ],
        },
        {
          heading: '2. TEAM COMPOSITION & SUPERVISION',
          body: [
            `Faculty Research Supervisor: ${proj.guideName || 'Dr. S. Karthik, Associate Professor'}`,
            `Student Researchers: ${proj.teamMembers || 'B.Tech AI & DS Team'}`,
          ],
        },
      ],
      fileName: `Synopsis_${proj.title.slice(0, 25).replace(/\s+/g, '_')}`,
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      alert('Please fill in Project Title')
      return
    }

    const newP: ProjectRecord = {
      id: 'proj_' + Date.now(),
      title: formData.title,
      description: formData.description,
      domain: formData.domain,
      year: Number(formData.year),
      semester: Number(formData.semester),
      guideName: formData.guideName,
      teamMembers: formData.teamMembers,
      status: formData.status,
    }

    setProjects([newP, ...projects])
    setIsAddModalOpen(false)
    setFormData({
      title: '',
      description: '',
      domain: 'Computer Vision & Deep Learning',
      year: 4,
      semester: 8,
      guideName: 'Dr. S. Karthik',
      teamMembers: '',
      status: 'Approved & Active',
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this project?')) {
      setProjects(projects.filter((p) => p.id !== id))
    }
  }

  const domains = Array.from(new Set(projects.map((p) => p.domain).filter(Boolean))) as string[]

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Innovation &amp; R&amp;D Hub
            </span>
            <span className="text-xs text-gray-300 font-medium">· Year-Wise Project Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Capstone Projects &amp; Innovation</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Track {projects.length} student research initiatives, patents, and capstone implementations
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Projects Directory (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Register New Project
          </button>
        </div>
      </div>

      {/* YEAR-WISE INTERACTIVE SELECTOR CARDS */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#1455D9]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
              Select Project Academic Cadre (Year-Wise)
            </h2>
          </div>
          <button
            onClick={() => setSelectedYear('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedYear === 'ALL'
                ? 'bg-[#071A3D] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Show All 4 Years ({projects.length})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {yearCategories.map((yc) => {
            const count = getYearCount(yc.year)
            const isSelected = selectedYear === yc.year
            return (
              <button
                key={yc.year}
                onClick={() => setSelectedYear(isSelected ? 'ALL' : yc.year)}
                className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1455D9] to-[#071A3D] text-white border-[#1455D9] shadow-md ring-2 ring-[#1455D9]/30 scale-102'
                    : 'bg-gray-50/70 hover:bg-blue-50/60 border-gray-200 text-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {yc.name}
                    </span>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                      {yc.sems}
                    </span>
                  </div>
                  <h3 className="text-xs font-black line-clamp-1">{yc.label}</h3>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className={`text-xs font-black ${isSelected ? 'text-[#F4C430]' : 'text-[#1455D9]'}`}>
                    {count} {count === 1 ? 'Project' : 'Projects'}
                  </span>
                  <span className="text-[10px] opacity-70 font-semibold">Explore ➔</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Projects</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{filteredProjects.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">
            {selectedYear === 'ALL' ? 'All 4 Years' : `Year ${selectedYear} Cohort`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Projects</p>
          <p className="text-2xl font-black text-green-700 mt-0.5">
            {projects.filter((p) => p.status.includes('Active') || p.status.includes('Approved')).length}
          </p>
          <p className="text-[10px] text-green-700 font-medium mt-1">Guided &amp; Approved</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Filter</p>
          <p className="text-lg font-black text-purple-700 mt-0.5">
            {selectedYear === 'ALL' ? 'All 4 Years' : `Year ${selectedYear} Projects`}
          </p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">
            {selectedDomain === 'ALL' ? 'All Tech Verticals' : selectedDomain}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Department</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">B.Tech AI &amp; DS</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">IEEE &amp; Patent Track</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search project title, team, supervisor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Year Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Academic Years</option>
              <option value={1}>Year I (Mini Projects)</option>
              <option value={2}>Year II (Prototypes)</option>
              <option value={3}>Year III (Applied R&amp;D)</option>
              <option value={4}>Year IV (Capstone)</option>
            </select>
          </div>

          {/* Domain Filter */}
          {domains.length > 0 && (
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Domains</option>
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
            Showing {filteredProjects.length} of {projects.length}
          </span>
        </div>
      </div>

      {/* Projects Cards Grid / Empty State */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1455D9] to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-purple-700 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 uppercase">
                          {p.domain || 'Applied AI'}
                        </span>
                        <span className="text-[10px] font-black text-[#1455D9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                          Year {p.year || 4}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#071A3D] mt-1 line-clamp-2">{p.title}</h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800 shrink-0">
                    {p.status}
                  </span>
                </div>

                {p.description && <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>}

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">Faculty Guide:</span>
                    <span className="text-[#071A3D] font-bold">{p.guideName || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-400 font-medium">Team:</span>
                    <span className="text-[#1455D9] font-bold text-right truncate max-w-[220px]">
                      {p.teamMembers || 'Cohort'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleDownloadSynopsis(p)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Synopsis PDF
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedProject(p)
                      setIsViewModalOpen(true)
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
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
          <FolderOpen className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Projects in Current Selection</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            {selectedYear !== 'ALL'
              ? `No research or capstone projects registered for Year ${selectedYear} yet.`
              : 'The R&D project registry is clean and ready for new student teams.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Register First Project
          </button>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Register Project Proposal</h3>
                <p className="text-xs text-gray-500">Autonomous R&amp;D and Capstone Scheme</p>
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
                <label className="block font-bold text-[#071A3D] mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Drone Swarm for Agricultural Crop Health"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => {
                      const y = Number(e.target.value)
                      setFormData({ ...formData, year: y, semester: y * 2 })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={1}>Year I (Mini Project)</option>
                    <option value={2}>Year II (Prototype)</option>
                    <option value={3}>Year III (Applied R&amp;D)</option>
                    <option value={4}>Year IV (Capstone Project)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Technical Domain</label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Computer Vision & Deep Learning">Computer Vision &amp; Deep Learning</option>
                    <option value="Large Language Models & GenAI">LLMs &amp; Generative AI</option>
                    <option value="Healthcare & Biomedical ML">Healthcare &amp; Biomedical ML</option>
                    <option value="Robotics & Autonomous Edge AI">Robotics &amp; Edge AI</option>
                    <option value="NLP & Speech Intelligence">NLP &amp; Speech Intelligence</option>
                    <option value="Blockchain & Secure AI">Blockchain &amp; Secure AI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Faculty Research Mentor</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. S. Karthik, Associate Professor"
                  value={formData.guideName}
                  onChange={(e) => setFormData({ ...formData, guideName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Team Members (Names &amp; Register Nos)</label>
                <input
                  type="text"
                  placeholder="e.g. K. Aishwarya (23AD001), R. Deepak (23AD002)"
                  value={formData.teamMembers}
                  onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Abstract / Problem Statement</label>
                <textarea
                  rows={2}
                  placeholder="Summary of research methodology and expected deliverables..."
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
                  Register Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW PROJECT */}
      {isViewModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1455D9]">
                  Year {selectedProject.year || 4} · {selectedProject.domain || 'Applied AI'}
                </span>
                <h3 className="text-lg font-black text-[#071A3D] mt-2">{selectedProject.title}</h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600 leading-relaxed">
                {selectedProject.description || 'Undergraduate Capstone Research project developing production AI models.'}
              </p>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Supervisor:</span>
                  <span className="font-bold text-[#071A3D]">{selectedProject.guideName || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Team:</span>
                  <span className="font-bold text-[#1455D9]">{selectedProject.teamMembers || 'Cohort'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">Cadre:</span>
                  <span className="font-bold text-purple-700">Year {selectedProject.year || 4}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                onClick={() => handleDownloadSynopsis(selectedProject)}
                className="px-4 py-2 rounded-xl bg-[#1455D9] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Synopsis PDF
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
