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
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface ProjectRecord {
  id: string
  title: string
  description?: string | null
  domain?: string | null
  status: string
  guideName?: string | null
  teamMembers?: string | null
}

export function AdminProjectsView({ initialProjects }: { initialProjects: ProjectRecord[] }) {
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: 'Computer Vision & Deep Learning',
    guideName: 'Dr. S. Karthik',
    teamMembers: 'K. Aishwarya (23AD001), R. Deepak (23AD002)',
    status: 'Approved & Active',
  })

  const filteredProjects = projects.filter((p) => {
    return (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.domain && p.domain.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.guideName && p.guideName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — CAPSTONE PROJECTS & R&D HUB',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official Capstone R&D Synopsis Registry',
      sections: [
        {
          heading: '1. R&D CAPSTONE INNOVATION DIRECTORY',
          body: [
            `Total Approved Capstone Teams: ${projects.length} Multidisciplinary Teams`,
            'Research Verticals: Computer Vision, LLMs, Speech AI, Healthcare ML, GNNs, Blockchain',
            'Supervision: Full-Time Ph.D. Faculty Research Mentors',
            'Evaluation Standard: Autonomous Innovation, IEEE Format & Patent Potential',
          ],
        },
        {
          heading: '2. APPROVED CAPSTONE TEAMS & SYNOPSIS',
          body: projects.map(
            (p, idx) =>
              `${idx + 1}. "${p.title}" — Domain: ${p.domain || 'Applied AI'} | Guide: ${p.guideName || 'Faculty Guide'} | Team: ${p.teamMembers || 'Student Cohort'}`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Capstone_Projects_2026',
    })
  }

  const handleDownloadSynopsis = (proj: ProjectRecord) => {
    generateAndDownloadPDF({
      title: proj.title.toUpperCase(),
      subtitle: 'V.S.B. Engineering College · Capstone Research Proposal · 2025-2026',
      author: proj.guideName || 'Research Supervisor',
      category: 'Project Synopsis',
      sections: [
        {
          heading: '1. RESEARCH ABSTRACT & PROBLEM STATEMENT',
          body: [
            proj.description || 'Undergraduate Capstone Research project developing production AI models and autonomous systems.',
            `Domain Vertical: ${proj.domain || 'Applied Artificial Intelligence'}`,
            `Status: ${proj.status}`,
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
      guideName: formData.guideName,
      teamMembers: formData.teamMembers,
      status: formData.status,
    }

    setProjects([...projects, newP])
    setIsAddModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this project?')) {
      setProjects(projects.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Innovation &amp; Capstone R&amp;D
            </span>
            <span className="text-xs text-gray-300 font-medium">· Research Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Capstone Projects &amp; R&amp;D Hub</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Monitor {projects.length} capstone research teams, innovation prototypes &amp; mentor allocations
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Projects (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Add Capstone Team
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search project title, domain, mentor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
          Showing {filteredProjects.length} Research Projects
        </span>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-black shrink-0">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-purple-700 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 uppercase">
                      {p.domain || 'Applied AI'}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800 shrink-0">
                  {p.status}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#071A3D] line-clamp-2">{p.title}</h3>
              {p.description && <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>}

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Faculty Mentor:</span>
                  <span className="font-bold text-[#1455D9]">{p.guideName || 'Dr. S. Karthik'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Team Members:</span>
                  <span className="font-bold text-[#071A3D] truncate max-w-[200px]">{p.teamMembers || 'Batch 2023-27 Cohort'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleDownloadSynopsis(p)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Synopsis (PDF)
              </button>

              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD PROJECT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Register Capstone Team</h3>
                <p className="text-xs text-gray-500">R&amp;D Research Program</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Edge-AI Vision for Defect Detection in Manufacturing"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Domain</label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Computer Vision & Deep Learning">Computer Vision</option>
                    <option value="Natural Language Processing (NLP)">NLP & LLMs</option>
                    <option value="Healthcare & Predictive Analytics">Healthcare Analytics</option>
                    <option value="Edge AI & IoT Robotics">Edge AI & Robotics</option>
                    <option value="Blockchain & Security">Blockchain</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Faculty Guide</label>
                  <select
                    value={formData.guideName}
                    onChange={(e) => setFormData({ ...formData, guideName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Dr. S. Karthik">Dr. S. Karthik</option>
                    <option value="Mrs. R. Priya">Mrs. R. Priya</option>
                    <option value="Mr. S. Arun">Mr. S. Arun</option>
                    <option value="Dr. M. Sowmya">Dr. M. Sowmya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Team Members (Names &amp; Reg. Nos)</label>
                <input
                  type="text"
                  placeholder="e.g. K. Aishwarya (23AD001), R. Deepak (23AD002)"
                  value={formData.teamMembers}
                  onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Description &amp; Goals</label>
                <textarea
                  rows={2}
                  placeholder="Objective, dataset details and target deliverables..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Save Capstone Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
