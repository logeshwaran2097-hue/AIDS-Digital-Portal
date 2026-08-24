'use client'

import React, { useState, useMemo } from 'react'
import {
  FolderOpen,
  Users,
  Star,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Code2,
  CheckCircle2,
  Sparkles,
  Layers,
  FileCode2,
  Github,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface ProjectRecord {
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

export function StudentProjectsView({ projects }: { projects: ProjectRecord[] }) {
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const domains = useMemo(() => {
    const set = new Set(projects.map((p) => p.domain))
    return ['ALL', ...Array.from(set)]
  }, [projects])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesDomain = selectedDomain === 'ALL' || p.domain === selectedDomain
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.teamMembers.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.guideName && p.guideName.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesDomain && matchesSearch
    })
  }, [projects, selectedDomain, searchQuery])

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
          className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" /> Submit Project Proposal
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Projects</p>
          <p className="text-2xl font-black text-[#071A3D] mt-1">{projects.length}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Approved Prototypes</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
          <p className="text-xs font-bold text-[#1455D9] uppercase tracking-wider">Specializations</p>
          <p className="text-2xl font-black text-[#1455D9] mt-1">{domains.length - 1} Domains</p>
          <p className="text-[10px] text-blue-600 mt-0.5">Vision, NLP, Health AI, GNN</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs bg-purple-50/20">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Active Batch</p>
          <p className="text-2xl font-black text-purple-600 mt-1">2023 - 2027</p>
          <p className="text-[10px] text-purple-600 mt-0.5">III Year (Semester 5)</p>
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
                'px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0',
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
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((p) => {
          let techList: string[] = []
          try {
            techList = JSON.parse(p.technologies)
          } catch (e) {
            techList = [p.technologies]
          }

          return (
            <Card
              key={p.id}
              className="rounded-3xl border-gray-200 hover:shadow-xl transition-all flex flex-col justify-between group overflow-hidden bg-white hover:border-[#1455D9]/40"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-bold border border-blue-200/60">
                    {p.domain}
                  </span>
                  <span className="text-[11px] text-gray-400 font-bold">Year {p.year} (Sem 5)</span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3 mt-1.5 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* Tech Stack Chips */}
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

                {/* Team Members & Guide */}
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
                    className="text-xs text-[#1455D9] hover:underline font-bold inline-flex items-center gap-1"
                  >
                    View Details →
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Project Detail Modal */}
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
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-[#071A3D] uppercase tracking-wider mb-1">Project Abstract:</h4>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  {selectedProject.description}
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
                  <p className="text-gray-500">Faculty Guide: {selectedProject.guideName || 'Dr. S. Karthik'}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#071A3D]">Submit Capstone Project Proposal</h3>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-600 block mb-1">Project Title</label>
                <input type="text" placeholder="e.g. Edge AI for Agricultural Drones" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="font-bold text-gray-600 block mb-1">Domain</label>
                <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs">
                  <option>Computer Vision</option>
                  <option>Natural Language Processing</option>
                  <option>Data Science &amp; Health AI</option>
                  <option>Generative AI</option>
                  <option>Deep Learning</option>
                  <option>Blockchain &amp; Security</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-600 block mb-1">Technologies (Comma separated)</label>
                <input type="text" placeholder="e.g. PyTorch, YOLOv8, FastAPI" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="font-bold text-gray-600 block mb-1">Brief Abstract</label>
                <textarea rows={3} placeholder="Describe problem statement and solution..." className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>
            <div className="pt-3 border-t flex justify-end gap-2">
              <button onClick={() => setShowSubmitModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
              <button
                onClick={() => {
                  alert('Project proposal submitted successfully to HOD & Guide for review!')
                  setShowSubmitModal(false)
                }}
                className="px-4 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]"
              >
                Submit Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
