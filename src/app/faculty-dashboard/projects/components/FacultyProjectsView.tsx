'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  FolderOpen,
  Search,
  Download,
  Users,
  Code2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Plus,
  Layers,
  FileCode2,
  Check,
  X,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface FacultyProjectItem {
  id: string
  title: string
  description?: string | null
  problemStatement?: string | null
  proposedSolution?: string | null
  technologies: string
  domain: string
  year: number
  status: string
  guideName?: string | null
  guideEmail?: string | null
  teamMembers: string
  results?: string | null
  createdAt: Date
}

export function FacultyProjectsView({ initialProjects }: { initialProjects: FacultyProjectItem[] }) {
  const [projects, setProjects] = useState<FacultyProjectItem[]>(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('ALL')
  const [filterGuide, setFilterGuide] = useState<'ALL' | 'MY_PROJECTS'>('ALL')
  const [selectedProject, setSelectedProject] = useState<FacultyProjectItem | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState(false)

  const domains = useMemo(() => {
    const set = new Set(projects.map((p) => p.domain))
    return ['ALL', ...Array.from(set)]
  }, [projects])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.teamMembers.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.guideName && p.guideName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.technologies.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDomain = selectedDomain === 'ALL' || p.domain === selectedDomain

      const matchesGuide =
        filterGuide === 'ALL' ||
        (filterGuide === 'MY_PROJECTS' && (p.guideName || '').includes('Karthik'))

      return matchesSearch && matchesDomain && matchesGuide
    })
  }, [projects, searchQuery, selectedDomain, filterGuide])

  const handleDownloadSynopsis = (p: FacultyProjectItem) => {
    generateAndDownloadPDF({
      title: 'CAPSTONE PROJECT SYNOPSIS & TECHNICAL SPECIFICATION',
      subtitle: `${p.title} · Domain: ${p.domain}`,
      author: p.guideName || 'Dr. S. Karthik (Faculty Guide)',
      category: 'Capstone Research Project',
      sections: [
        {
          heading: '1. PROJECT OVERVIEW & METADATA',
          body: [
            `Project Title: ${p.title}`,
            `Domain Specialization: ${p.domain}`,
            `Assigned Faculty Guide: ${p.guideName || 'Dr. S. Karthik'}`,
            `Team Members: ${p.teamMembers}`,
            `Technology Stack: ${p.technologies}`,
            `Current Phase Status: ${p.status}`,
          ],
        },
        {
          heading: '2. PROBLEM STATEMENT',
          body: [
            p.problemStatement ||
              'Formulating an efficient, scalable automated intelligence framework to solve high-impact industrial constraints.',
          ],
        },
        {
          heading: '3. PROPOSED ARCHITECTURAL WORKFLOW & METHODOLOGY',
          body: [
            p.proposedSolution ||
              'End-to-end multi-tier algorithmic pipeline integrating deep representation learning, data ingestion, and cloud deployment.',
            `Dataset & Validation: Tested with cross-validation and benchmarking against baseline models.`,
          ],
        },
        {
          heading: '4. FACULTY MENTORSHIP SIGN-OFF & MILESTONES',
          body: [
            'Phase 1: Abstract & Problem Formulation Review - APPROVED',
            'Phase 2: Data Pipeline & Model Architecture - APPROVED',
            'Phase 3: Prototype Deployment & Final Defense - READY',
          ],
        },
      ],
      fileName: `Synopsis_${p.domain.replace(/[^a-zA-Z0-9]/g, '_')}_${p.id.slice(-4)}`,
    })
  }

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAssignSuccess(true)
    setTimeout(() => {
      setAssignSuccess(false)
      setShowAssignModal(false)
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Research &amp; Innovation Hub
            </span>
            <span className="text-xs text-gray-300 font-medium">· Final &amp; Pre-Final Capstone</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student Projects &amp; Innovation Workspace</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Dr. S. Karthik · Guide and evaluate student research teams, project code repositories &amp; synopses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Propose / Assign Project
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Capstones</p>
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">{projects.length} Teams</p>
            <p className="text-[10px] text-gray-400">Department R&amp;D</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs bg-purple-50/20">
          <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">My Guided Teams</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">
            {projects.filter((p) => (p.guideName || '').includes('Karthik')).length} Projects
          </p>
          <p className="text-[10px] text-purple-600 font-semibold">Under Dr. S. Karthik</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Student Researchers</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">18 Students</p>
          <p className="text-[10px] text-green-700 font-semibold">Active Contributors</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Review Status</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">Phase-1 Cleared</p>
          <p className="text-[10px] text-amber-700 font-semibold">Ready for Defense</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, team members or tech stack..."
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setFilterGuide('ALL')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border',
              filterGuide === 'ALL'
                ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            )}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setFilterGuide('MY_PROJECTS')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border',
              filterGuide === 'MY_PROJECTS'
                ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            )}
          >
            Guided by Me ({projects.filter((p) => (p.guideName || '').includes('Karthik')).length})
          </button>
        </div>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="h-10 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-[#071A3D] md:w-56"
        >
          {domains.map((d) => (
            <option key={d} value={d}>
              {d === 'ALL' ? 'All Domains' : d}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((p) => (
          <Card
            key={p.id}
            className="rounded-3xl border-gray-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-black uppercase tracking-wider border border-blue-200/60">
                  {p.domain}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                  {p.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug line-clamp-2">
                  {p.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {p.problemStatement || p.description}
                </p>
              </div>

              {/* Technologies Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {p.technologies.split(',').map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold border border-gray-200/60"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>

              {/* Guide & Team Details */}
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-medium">Faculty Guide:</span>
                  <span className="font-bold text-[#071A3D]">{p.guideName || 'Dr. S. Karthik'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-medium">Team Members:</span>
                  <span className="font-bold text-[#1455D9] truncate max-w-[220px]">{p.teamMembers}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProject(p)}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#071A3D] text-xs font-bold transition-colors cursor-pointer"
                >
                  Review Details
                </button>

                <button
                  onClick={() => handleDownloadSynopsis(p)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Synopsis PDF
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-bold">
                  {selectedProject.domain}
                </span>
                <h3 className="text-base font-bold text-[#071A3D] mt-1">{selectedProject.title}</h3>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 border space-y-1">
                <p className="font-bold text-gray-700">Problem Statement:</p>
                <p className="text-gray-600 leading-relaxed">{selectedProject.problemStatement || selectedProject.description}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border space-y-1">
                <p className="font-bold text-gray-700">Proposed Solution &amp; Tech Architecture:</p>
                <p className="text-gray-600 leading-relaxed">{selectedProject.proposedSolution || 'Multi-tier deep learning architecture deployed on edge hardware.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Faculty Guide</p>
                  <p className="font-bold text-[#1455D9] mt-0.5">{selectedProject.guideName}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Team Members</p>
                  <p className="font-bold text-purple-700 mt-0.5">{selectedProject.teamMembers}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between items-center gap-2">
              <button
                onClick={() => handleDownloadSynopsis(selectedProject)}
                className="px-4 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#0e44b5]"
              >
                <Download className="w-4 h-4" /> Download Synopsis (PDF)
              </button>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Propose / Assign Project Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Assign Capstone Project</h3>
                <p className="text-xs text-gray-500">Create research project title and allocate student team</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {assignSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#071A3D]">Capstone Project Assigned!</h4>
                <p className="text-xs text-gray-500">The team has been registered under your research mentorship.</p>
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Project Title</label>
                  <input type="text" placeholder="e.g. Edge AI for Real-Time Solar Panel Defect Detection" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" required />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Domain</label>
                    <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold">
                      <option>Computer Vision</option>
                      <option>Natural Language Processing</option>
                      <option>Generative AI</option>
                      <option>Healthcare AI</option>
                      <option>Deep Learning</option>
                      <option>Blockchain &amp; Security</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Faculty Guide</label>
                    <input type="text" defaultValue="Dr. S. Karthik (Professor)" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Allocated Team Members</label>
                  <input type="text" placeholder="e.g. K. Aishwarya (23AD001), R. Deepak (23AD002)" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" required />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Problem Statement</label>
                  <textarea rows={3} placeholder="Brief summary of research problem and technical goals..." className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" required />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]">Assign Project</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
