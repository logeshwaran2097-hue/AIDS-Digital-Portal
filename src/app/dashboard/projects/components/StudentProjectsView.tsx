'use client'

import React, { useState, useMemo } from 'react'
import {
  FolderOpen,
  Users,
  Search,
  Plus,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Code2,
  FileCode2,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface ProjectRecord {
  id: string
  title: string
  description: string | null
  problemStatement?: string | null
  proposedSolution?: string | null
  technologies: string
  domain: string
  year: number
  status: string
  guideName: string | null
  teamMembers: string
  createdAt?: Date
}

export function StudentProjectsView({
  projects,
  activeBatch = '2024 - 2028',
  batchLabel = 'II Year (Semester 4)',
  studentName = 'Logeshwaran G',
  registerNumber = '922525243103',
}: {
  projects: ProjectRecord[]
  activeBatch?: string
  batchLabel?: string
  studentName?: string
  registerNumber?: string
}) {
  const [projectsList, setProjectsList] = useState<ProjectRecord[]>(projects)
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultMemberText = registerNumber
    ? `${studentName} (${registerNumber})`
    : studentName

  const [formData, setFormData] = useState({
    title: '',
    domain: 'Computer Vision & Deep Learning',
    technologies: 'Python, PyTorch, FastAPI',
    teamMembers: defaultMemberText,
    description: '',
    problemStatement: '',
    proposedSolution: '',
  })

  const domains = useMemo(() => {
    const set = new Set(projectsList.map((p) => p.domain).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [projectsList])

  const filteredProjects = useMemo(() => {
    return projectsList.filter((p) => {
      const matchesDomain = selectedDomain === 'ALL' || p.domain === selectedDomain
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.teamMembers.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.guideName && p.guideName.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesDomain && matchesSearch
    })
  }, [projectsList, selectedDomain, searchQuery])

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Please enter a project title.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          domain: formData.domain,
          technologies: formData.technologies,
          description: formData.description,
          problemStatement: formData.problemStatement,
          proposedSolution: formData.proposedSolution,
          teamMembers: formData.teamMembers,
          year: 2,
          status: 'Proposal Submitted',
          guideName: 'Assigned Faculty Guide',
        }),
      })

      const data = await res.json()
      if (data.success && data.project) {
        setProjectsList([data.project, ...projectsList])
        setShowSubmitModal(false)
        setFormData({
          title: '',
          domain: 'Computer Vision & Deep Learning',
          technologies: 'Python, PyTorch, FastAPI',
          teamMembers: 'Logeshwaran G (92252524185)',
          description: '',
          problemStatement: '',
          proposedSolution: '',
        })
        alert('🎉 Project proposal submitted successfully to HOD & Guide!')
      } else {
        alert(data.message || 'Failed to submit proposal.')
      }
    } catch {
      alert('Network error submitting proposal.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Student Innovation
            </span>
            <span className="text-xs text-gray-300">· Capstone &amp; Mini-Projects</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">AI &amp; Data Science Project Repository</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Explore peer projects, industry problem statements, neural architectures &amp; source code
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Submit Project Proposal
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Projects</p>
          <p className="text-2xl font-black text-[#071A3D] mt-1">{projectsList.length}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Approved Prototypes</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
          <p className="text-xs font-bold text-[#1455D9] uppercase tracking-wider">Specializations</p>
          <p className="text-2xl font-black text-[#1455D9] mt-1">{Math.max(0, domains.length - 1)} Domains</p>
          <p className="text-[10px] text-blue-600 mt-0.5">Vision, NLP, Health AI, GNN</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs bg-purple-50/20">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Active Batch</p>
          <p className="text-xl sm:text-2xl font-black text-purple-600 mt-1 whitespace-nowrap tracking-tight">
            {activeBatch}
          </p>
          <p className="text-[10px] text-purple-600 mt-0.5">{batchLabel}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-green-200 shadow-xs bg-green-50/20">
          <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Project Status</p>
          <p className="text-2xl font-black text-green-600 mt-1">100% Verified</p>
          <p className="text-[10px] text-green-600 mt-0.5">Faculty Supervised</p>
        </div>
      </div>

      {/* Filter Toolbar & Live Search */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={cn(
                'px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer',
                selectedDomain === dom
                  ? 'bg-[#1455D9] text-white shadow-md shadow-[#1455D9]/20 scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#071A3D]'
              )}
            >
              {dom === 'ALL' ? 'All Domains' : dom}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search project title or tech stack..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>
      </div>

      {/* Projects Grid / Empty State */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black text-purple-700 px-2.5 py-0.5 rounded-lg bg-purple-50 border border-purple-200 uppercase">
                    {p.domain}
                  </span>
                  <span className="text-[10px] font-black text-green-700 px-2.5 py-0.5 rounded-lg bg-green-50 border border-green-200 uppercase">
                    {p.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#071A3D] line-clamp-2">{p.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {p.description || 'Undergraduate Capstone Research project developing production AI systems.'}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Supervisor:</span>
                  <span className="font-bold text-[#071A3D]">{p.guideName || 'Faculty Guide'}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Tech:</span>
                  <span className="font-mono text-[11px] font-bold text-[#1455D9] truncate max-w-[180px]">
                    {p.technologies}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <FolderOpen className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Projects in Selection</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Click &quot;+ Submit Project Proposal&quot; to register your team&apos;s capstone or mini-project.
          </p>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Submit Proposal
          </button>
        </div>
      )}

      {/* View Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1455D9]">
                  {selectedProject.domain}
                </span>
                <h3 className="text-lg font-black text-[#071A3D] mt-1.5">{selectedProject.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-[#071A3D] uppercase tracking-wider mb-1">Project Abstract:</h4>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  {selectedProject.description || 'Undergraduate Capstone Research proposal.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-1">
                <p className="text-[#071A3D] font-semibold">Team Members: {selectedProject.teamMembers}</p>
                <p className="text-gray-500">Faculty Guide: {selectedProject.guideName || 'Dr. S. Karthik'}</p>
                <p className="text-gray-500">Tech Stack: {selectedProject.technologies}</p>
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

      {/* Submit Proposal Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Submit Capstone Project Proposal</h3>
                <p className="text-[11px] text-gray-400">Department R&amp;D and Mini-Project Hub</p>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-600 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Edge AI for Agricultural Drones"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Domain</label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                >
                  <option value="Computer Vision & Deep Learning">Computer Vision &amp; Deep Learning</option>
                  <option value="Natural Language Processing & GenAI">Natural Language Processing &amp; GenAI</option>
                  <option value="Healthcare & Biomedical ML">Healthcare &amp; Biomedical ML</option>
                  <option value="Robotics & Autonomous Edge AI">Robotics &amp; Edge AI</option>
                  <option value="Blockchain & Secure AI">Blockchain &amp; Secure AI</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Technologies (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. PyTorch, YOLOv8, FastAPI"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Team Members (Names &amp; Reg Nos)</label>
                <input
                  type="text"
                  placeholder="e.g. Logeshwaran G (92252524185)"
                  value={formData.teamMembers}
                  onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Brief Abstract</label>
                <textarea
                  rows={2}
                  placeholder="Describe problem statement, dataset, and methodology..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5] shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
