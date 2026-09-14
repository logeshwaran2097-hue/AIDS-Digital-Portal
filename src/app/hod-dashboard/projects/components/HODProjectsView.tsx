'use client'

import React, { useState, useMemo } from 'react'
import {
  FolderOpen,
  Users,
  Search,
  Plus,
  Star,
  Layers,
  Code2,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Calendar,
  Filter,
  X,
  RotateCcw,
  BookOpen,
  Tag,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

export interface ProjectRecord {
  id: string
  title: string
  description: string | null
  problemStatement: string | null
  proposedSolution: string | null
  technologies: string
  domain: string
  year: number
  status: string
  guideName: string | null
  teamMembers: string
  createdAt: Date
}

const DOMAIN_OPTIONS = [
  'Artificial Intelligence & Machine Learning',
  'Deep Learning & Computer Vision',
  'Natural Language Processing & LLMs',
  'Data Science & Predictive Analytics',
  'Cloud Architecture & Distributed Systems',
  'IoT & Embedded Cyber-Physical Systems',
  'Blockchain & Web3 Technologies',
  'Full-Stack & Intelligent Web Systems'
]

export function HODProjectsView({ projects: initialProjects }: { projects: ProjectRecord[] }) {
  const [projectsList, setProjectsList] = useState<ProjectRecord[]>(initialProjects)
  const [selectedYear, setSelectedYear] = useState<string>('ALL') // 'ALL' | '1' | '2' | '3' | '4'
  const [selectedSection, setSelectedSection] = useState<string>('ALL') // 'ALL' | 'A' | 'B' | 'C'
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New Project Form State
  const [newProject, setNewProject] = useState({
    title: '',
    domain: DOMAIN_OPTIONS[0],
    year: '4',
    section: 'A',
    guideName: '',
    teamMembers: '',
    description: '',
    problemStatement: '',
    technologies: 'Python, PyTorch, React',
  })

  // Dynamic domain list based on projects or standard specializations
  const availableDomains = useMemo(() => {
    const set = new Set(projectsList.map((p) => p.domain).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [projectsList])

  // Real-time multi-dimensional filter (Year, Class/Section, Domain, Search Query)
  const filteredProjects = useMemo(() => {
    return projectsList.filter((p) => {
      // 1. Year filter
      const matchesYear = selectedYear === 'ALL' || String(p.year) === selectedYear

      // 2. Class / Section filter
      const matchesSection = (() => {
        if (selectedSection === 'ALL') return true
        const secLetter = selectedSection.toLowerCase()
        const rawContent = `${p.teamMembers} ${p.title} ${p.description || ''}`.toLowerCase()
        return (
          rawContent.includes(`sec ${secLetter}`) ||
          rawContent.includes(`section ${secLetter}`) ||
          rawContent.includes(`sec-${secLetter}`) ||
          rawContent.includes(`sec.${secLetter}`) ||
          rawContent.includes(`(${secLetter})`) ||
          rawContent.includes(`sec ${selectedSection}`) ||
          rawContent.includes(`section ${selectedSection}`)
        )
      })()

      // 3. Domain filter
      const matchesDomain = selectedDomain === 'ALL' || p.domain === selectedDomain

      // 4. Search query
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        p.teamMembers.toLowerCase().includes(query) ||
        (p.guideName && p.guideName.toLowerCase().includes(query))

      return matchesYear && matchesSection && matchesDomain && matchesSearch
    })
  }, [projectsList, selectedYear, selectedSection, selectedDomain, searchQuery])

  const hasActiveFilters =
    selectedYear !== 'ALL' || selectedSection !== 'ALL' || selectedDomain !== 'ALL' || searchQuery.trim().length > 0

  const handleResetFilters = () => {
    setSelectedYear('ALL')
    setSelectedSection('ALL')
    setSelectedDomain('ALL')
    setSearchQuery('')
  }

  // Handle adding a real new capstone project to DB
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProject.title.trim()) {
      toast.error('Please enter a project title')
      return
    }

    setIsSubmitting(true)
    try {
      const techArray = newProject.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const payload = {
        title: newProject.title.trim(),
        domain: newProject.domain,
        year: Number(newProject.year) || 4,
        guideName: newProject.guideName.trim() || 'Faculty Guide',
        teamMembers: `${newProject.teamMembers.trim()} (Sec ${newProject.section})`,
        description: newProject.description.trim(),
        problemStatement: newProject.problemStatement.trim(),
        technologies: techArray,
        status: 'Approved & Active',
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success && data.project) {
        setProjectsList((prev) => [data.project, ...prev])
        toast.success(`Capstone project "${data.project.title}" registered successfully!`)
        setIsAddModalOpen(false)
        setNewProject({
          title: '',
          domain: DOMAIN_OPTIONS[0],
          year: '4',
          section: 'A',
          guideName: '',
          teamMembers: '',
          description: '',
          problemStatement: '',
          technologies: 'Python, PyTorch, React',
        })
      } else {
        toast.error(data.message || 'Failed to create project')
      }
    } catch {
      toast.error('Network error registering project.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Innovation &amp; Research
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student Projects &amp; Capstone Works</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Final year capstone and mini-projects across AI, Machine Learning, Computer Vision &amp; Data Science
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Add Capstone Project
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Projects</p>
          <p className="text-2xl font-black text-[#071A3D] mt-1">{projectsList.length}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Capstone &amp; Mini-Projects</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-green-200 shadow-xs bg-green-50/20">
          <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Filtered Matches</p>
          <p className="text-2xl font-black text-green-600 mt-1">{filteredProjects.length}</p>
          <p className="text-[10px] text-green-600 mt-0.5">Active In Selection</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs bg-purple-50/20">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Domains</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {availableDomains.length > 1 ? availableDomains.length - 1 : 0} Specializations
          </p>
          <p className="text-[10px] text-purple-600 mt-0.5">AI, ML, CV, NLP, Web</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Academic Year</p>
          <p className="text-2xl font-black text-[#F4C430] mt-1">2025-26</p>
          <p className="text-[10px] text-gray-400 mt-0.5">B.Tech AI &amp; DS</p>
        </div>
      </div>

      {/* ── Filter Bar: Year-Wise & Class-Wise Selectors ─────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-bold">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#071A3D] uppercase tracking-wider">
                Filter Projects By Academic Year &amp; Section
              </h3>
              <p className="text-[11px] text-gray-400">
                Segment capstones by batch progression or class advisory jurisdiction
              </p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Row 1: Year Wise & Class Wise Pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Year-Wise Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1455D9]" />
              <span>Year-Wise Filter:</span>
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
              {[
                { label: 'All Years', value: 'ALL' },
                { label: 'Year 1 (I)', value: '1' },
                { label: 'Year 2 (II)', value: '2' },
                { label: 'Year 3 (III)', value: '3' },
                { label: 'Year 4 (IV / Capstone)', value: '4' },
              ].map((yr) => (
                <button
                  key={yr.value}
                  type="button"
                  onClick={() => setSelectedYear(yr.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                    selectedYear === yr.value
                      ? 'bg-[#1455D9] text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  )}
                >
                  {yr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Class / Section Wise Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Class / Section Filter:</span>
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
              {[
                { label: 'All Sections', value: 'ALL' },
                { label: 'Section A (Sec A)', value: 'A' },
                { label: 'Section B (Sec B)', value: 'B' },
                { label: 'Section C (Sec C)', value: 'C' },
              ].map((sec) => (
                <button
                  key={sec.value}
                  type="button"
                  onClick={() => setSelectedSection(sec.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
                    selectedSection === sec.value
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  )}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Search Input & Domain Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Domain Filter Pills / Dropdown */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
            <span className="text-[11px] font-bold text-gray-400 shrink-0">Domain:</span>
            {availableDomains.map((dom) => (
              <button
                key={dom}
                type="button"
                onClick={() => setSelectedDomain(dom)}
                className={cn(
                  'px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer',
                  selectedDomain === dom
                    ? 'bg-[#071A3D] text-[#F4C430] shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {dom === 'ALL' ? 'All Domains' : dom}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, student or guide..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9]/20"
            />
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-400 font-medium">Active filters:</span>
            {selectedYear !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200 flex items-center gap-1">
                Year {selectedYear}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedYear('ALL')} />
              </span>
            )}
            {selectedSection !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                Section {selectedSection}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSection('ALL')} />
              </span>
            )}
            {selectedDomain !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 font-bold border border-purple-200 flex items-center gap-1">
                {selectedDomain}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDomain('ALL')} />
              </span>
            )}
            {searchQuery.trim() && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 flex items-center gap-1">
                "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Projects Grid & Empty States ────────────────────────────────────────── */}
      {filteredProjects.length === 0 ? (
        <Card className="rounded-3xl border-gray-200 bg-white shadow-xs">
          <CardContent className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto">
              <FolderOpen className="w-7 h-7" />
            </div>
            {projectsList.length === 0 ? (
              <>
                <h3 className="font-bold text-base text-[#071A3D]">No Capstone Projects in Registry</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Ongoing mini-projects, final-year capstones, and published research prototypes will appear in this registry once registered.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1455D9] text-white text-xs font-bold hover:bg-[#0D44B8] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Capstone Project
                </button>
              </>
            ) : (
              <>
                <h3 className="font-bold text-base text-[#071A3D]">No Projects in Current Selection</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  No projects matched your combination of Year {selectedYear !== 'ALL' ? selectedYear : 'All'} and Section {selectedSection !== 'ALL' ? selectedSection : 'All'}.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#071A3D] text-xs font-bold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => {
            let techList: string[] = []
            try {
              techList = JSON.parse(p.technologies)
            } catch {
              techList = p.technologies ? p.technologies.split(',').map((t) => t.trim()) : []
            }

            return (
              <Card
                key={p.id}
                className="rounded-3xl border-gray-200 hover:shadow-xl transition-all flex flex-col justify-between group overflow-hidden bg-white"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-bold border border-blue-200/60">
                      {p.domain}
                    </span>
                    <span className="text-[11px] text-gray-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                      Year {p.year}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 mt-1.5 leading-relaxed">
                      {p.description || p.problemStatement || 'No abstract provided.'}
                    </p>
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {techList.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                    {techList.length > 4 && (
                      <span className="text-[10px] text-gray-400 font-bold self-center">
                        +{techList.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Team & Guide Info */}
                  <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-start gap-1.5 font-semibold text-[#071A3D]">
                      <Users className="w-3.5 h-3.5 text-[#1455D9] shrink-0 mt-0.5" />
                      <span className="text-[11px] line-clamp-1">{p.teamMembers}</span>
                    </div>
                    {p.guideName && (
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Star className="w-3.5 h-3.5 text-[#F4C430] shrink-0" />
                        <span className="truncate">Guide: {p.guideName}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-gray-50">
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                      {p.status}
                    </span>
                    <button
                      onClick={() => setSelectedProject(p)}
                      className="text-xs text-[#1455D9] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      View Details →
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Add Project Modal ─────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto border border-gray-100">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-black uppercase">
                  Department Capstone Registry
                </span>
                <h3 className="text-xl font-black text-[#071A3D] mt-1">Register New Project Work</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Autonomous Vision Navigation for Drone Inspection"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-xs focus:ring-2 focus:ring-[#1455D9]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Academic Year *</label>
                  <select
                    value={newProject.year}
                    onChange={(e) => setNewProject({ ...newProject, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs"
                  >
                    <option value="1">Year 1 (I Year)</option>
                    <option value="2">Year 2 (II Year)</option>
                    <option value="3">Year 3 (III Year)</option>
                    <option value="4">Year 4 (IV Year / Capstone)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Class / Section *</label>
                  <select
                    value={newProject.section}
                    onChange={(e) => setNewProject({ ...newProject, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Domain Specialization *</label>
                <select
                  value={newProject.domain}
                  onChange={(e) => setNewProject({ ...newProject, domain: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs"
                >
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Team Members (Names / Roll Nos) *</label>
                  <input
                    type="text"
                    required
                    value={newProject.teamMembers}
                    onChange={(e) => setNewProject({ ...newProject, teamMembers: e.target.value })}
                    placeholder="e.g. Logeshwaran G, Monishwaran L"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Faculty Guide / Mentor</label>
                  <input
                    type="text"
                    value={newProject.guideName}
                    onChange={(e) => setNewProject({ ...newProject, guideName: e.target.value })}
                    placeholder="e.g. Dr. K. Ravikumar"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Technologies &amp; Tools</label>
                <input
                  type="text"
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                  placeholder="e.g. Python, YOLOv8, PyTorch, FastAPI, Next.js"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Project Abstract &amp; Scope</label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Brief summary of the project architecture and outcomes..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0D44B8] flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Project to Registry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Project Detail Modal ──────────────────────────────────────────────── */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-bold">
                  {selectedProject.domain}
                </span>
                <h3 className="text-lg font-black text-[#071A3D] mt-1">{selectedProject.title}</h3>
                <p className="text-xs text-gray-500">Year {selectedProject.year} · Department of AI &amp; DS</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-[#071A3D] uppercase tracking-wider mb-1">Project Abstract:</h4>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  {selectedProject.description || 'No abstract provided.'}
                </p>
              </div>

              {selectedProject.problemStatement && (
                <div>
                  <h4 className="font-bold text-red-700 uppercase tracking-wider mb-1">Problem Statement:</h4>
                  <p className="text-gray-600 bg-red-50/40 p-3 rounded-2xl border border-red-100">
                    {selectedProject.problemStatement}
                  </p>
                </div>
              )}

              {selectedProject.proposedSolution && (
                <div>
                  <h4 className="font-bold text-green-700 uppercase tracking-wider mb-1">Proposed Architecture:</h4>
                  <p className="text-gray-600 bg-green-50/40 p-3 rounded-2xl border border-green-100">
                    {selectedProject.proposedSolution}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-[#071A3D] uppercase tracking-wider mb-1">Project Team &amp; Supervisor:</h4>
                <div className="p-3 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-1">
                  <p className="text-[#071A3D] font-semibold">Team Members: {selectedProject.teamMembers}</p>
                  <p className="text-gray-500">Faculty Guide: {selectedProject.guideName || 'Faculty Guide'}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
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
