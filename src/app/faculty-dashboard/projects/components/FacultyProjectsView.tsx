'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
  Check,
  X,
  BookOpen,
  Clock,
  Send,
  GitCommit,
  Cpu,
  Database,
  TrendingUp,
  AlertCircle,
  Award,
  UserCheck,
  Eye,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import toast from 'react-hot-toast'

export interface DailyUpdateLog {
  id: string
  date: string
  postedBy: string
  role?: string
  taskCompleted: string
  blockers?: string
  nextTarget?: string
  commitUrl?: string
  progressPercentage?: number
  facultyFeedback?: string
  facultyStatus?: 'Verified & Guided' | 'Feedback Provided' | 'Pending Review'
}

export interface FacultyProjectItem {
  id: string
  title: string
  description?: string | null
  problemStatement?: string | null
  proposedSolution?: string | null
  technologies: string
  dataset?: string | null
  results?: string | null
  futureScope?: string | null
  documentation?: string | null
  domain: string
  year: number
  status: string
  guideName?: string | null
  guideEmail?: string | null
  teamMembers: string
  createdAt: Date
  dailyUpdates?: DailyUpdateLog[]
}

export const PRESET_DOMAINS = [
  'Computer Vision & Deep Learning',
  'Large Language Models & GenAI',
  'Healthcare & Biomedical AI',
  'Robotics & Autonomous Edge AI',
  'NLP & Speech Intelligence',
  'Blockchain & Secure AI Systems',
  'FinTech & Predictive AI',
  'IoT & Smart Cyber-Physical AI',
  'Custom Domain / Other',
]

// Helper to extract GitHub & Live Demo URLs
export function extractProjectLinks(docStr: string | null | undefined): { githubUrl: string; liveUrl: string } {
  if (!docStr) return { githubUrl: '', liveUrl: '' }
  try {
    const parsed = JSON.parse(docStr)
    if (parsed && typeof parsed === 'object') {
      return {
        githubUrl: parsed.github || parsed.githubUrl || '',
        liveUrl: parsed.live || parsed.liveUrl || '',
      }
    }
  } catch {}

  if (docStr.includes('||')) {
    const [gh, lv] = docStr.split('||')
    return { githubUrl: gh?.trim() || '', liveUrl: lv?.trim() || '' }
  }

  if (docStr.includes('github.com')) {
    return { githubUrl: docStr, liveUrl: '' }
  }

  return { githubUrl: '', liveUrl: docStr }
}

export function formatProjectLinks(githubUrl: string, liveUrl: string): string {
  if (githubUrl && liveUrl) {
    return JSON.stringify({ github: githubUrl.trim(), live: liveUrl.trim() })
  }
  return githubUrl ? githubUrl.trim() : liveUrl ? liveUrl.trim() : ''
}

function parseDailyUpdates(raw: string | null | undefined): DailyUpdateLog[] {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {}

  return []
}

export function FacultyProjectsView({
  initialProjects,
  facultyName = 'Faculty Member',
}: {
  initialProjects: FacultyProjectItem[]
  facultyName?: string
}) {
  const [projects, setProjects] = useState<FacultyProjectItem[]>(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('ALL')
  const [filterGuide, setFilterGuide] = useState<'ALL' | 'MY_PROJECTS'>('ALL')
  const [selectedProject, setSelectedProject] = useState<FacultyProjectItem | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignModalMode, setAssignModalMode] = useState<'edit' | 'preview'>('edit')
  const [modalTab, setModalTab] = useState<'specs' | 'daily_updates'>('specs')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State for Assign Modal with Custom Domain and Live URL
  const [assignFormData, setAssignFormData] = useState({
    title: '',
    domainSelection: 'Computer Vision & Deep Learning',
    customDomain: '',
    technologies: '',
    guideName: '',
    teamMembers: '',
    problemStatement: '',
    proposedSolution: '',
    dataset: '',
    githubUrl: '',
    liveUrl: '',
  })

  const effectiveDomain =
    assignFormData.domainSelection === 'Custom Domain / Other'
      ? assignFormData.customDomain.trim() || 'Applied Artificial Intelligence'
      : assignFormData.domainSelection

  // Feedback State
  const [feedbackLogId, setFeedbackLogId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  // Real-time polling
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/projects', { cache: 'no-store' })
        const data = await res.json()
        if (data.success && Array.isArray(data.projects)) {
          setProjects(
            data.projects.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              problemStatement: p.problemStatement,
              proposedSolution: p.proposedSolution,
              technologies: p.technologies || 'Python, PyTorch',
              dataset: p.dataset,
              results: p.results,
              futureScope: p.futureScope,
              documentation: p.documentation,
              domain: p.domain || 'Applied AI',
              year: Number(p.year) || 4,
              status: p.status || 'Active & Supervised',
              guideName: p.guideName,
              guideEmail: p.guideEmail,
              teamMembers: p.teamMembers || 'B.Tech AI & DS Team',
              createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
              dailyUpdates: parseDailyUpdates(p.futureScope),
            }))
          )
        }
      } catch {}
    }

    const interval = setInterval(fetchLatest, 4000)
    return () => clearInterval(interval)
  }, [])

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
        (filterGuide === 'MY_PROJECTS' && (p.guideName || '').toLowerCase().includes(facultyName.toLowerCase()))

      return matchesSearch && matchesDomain && matchesGuide
    })
  }, [projects, searchQuery, selectedDomain, filterGuide, facultyName])

  // Open Details Modal
  const handleOpenDetails = (proj: FacultyProjectItem) => {
    const updates = proj.dailyUpdates || parseDailyUpdates(proj.futureScope)
    setSelectedProject({ ...proj, dailyUpdates: updates })
    setModalTab('specs')
    setFeedbackLogId(null)
  }

  // Save Faculty Guidance feedback on a daily log entry
  const handleSaveFacultyFeedback = async (logId: string) => {
    if (!selectedProject || !feedbackText.trim()) return

    const currentUpdates = selectedProject.dailyUpdates || parseDailyUpdates(selectedProject.futureScope)
    const updatedList = currentUpdates.map((item) =>
      item.id === logId
        ? {
            ...item,
            facultyFeedback: feedbackText,
            facultyStatus: 'Verified & Guided' as const,
          }
        : item
    )
    const updatedSerialized = JSON.stringify(updatedList)

    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedProject.id,
          futureScope: updatedSerialized,
          status: 'Guided by Faculty',
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSelectedProject({
          ...selectedProject,
          futureScope: updatedSerialized,
          dailyUpdates: updatedList,
          status: 'Guided by Faculty',
        })
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProject.id
              ? {
                  ...p,
                  futureScope: updatedSerialized,
                  dailyUpdates: updatedList,
                  status: 'Guided by Faculty',
                }
              : p
          )
        )
        toast.success('Faculty mentorship guidance recorded!')
        setFeedbackLogId(null)
        setFeedbackText('')
      }
    } catch {
      toast.error('Network error saving feedback.')
    }
  }

  // Final submit after preview
  const handleFinalAssignSubmit = async () => {
    const finalDomain = effectiveDomain
    const combinedDocs = formatProjectLinks(assignFormData.githubUrl, assignFormData.liveUrl)

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assignFormData.title.trim(),
          domain: finalDomain,
          technologies: assignFormData.technologies,
          problemStatement: assignFormData.problemStatement,
          proposedSolution: assignFormData.proposedSolution,
          dataset: assignFormData.dataset,
          teamMembers: assignFormData.teamMembers,
          guideName: assignFormData.guideName,
          documentation: combinedDocs,
          year: 4,
          status: 'Active & Supervised',
        }),
      })

      const data = await res.json()
      if (data.success && data.project) {
        setProjects([data.project, ...projects])
        setShowAssignModal(false)
        setAssignModalMode('edit')
        setAssignFormData({
          title: '',
          domainSelection: 'Computer Vision & Deep Learning',
          customDomain: '',
          technologies: '',
          guideName: '',
          teamMembers: '',
          problemStatement: '',
          proposedSolution: '',
          dataset: '',
          githubUrl: '',
          liveUrl: '',
        })
        toast.success('🎉 Project blueprint assigned & published!')
      } else {
        toast.error('Failed to assign project')
      }
    } catch {
      toast.error('Network error creating project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadDossier = (p: FacultyProjectItem) => {
    const updates = p.dailyUpdates || parseDailyUpdates(p.futureScope)
    const links = extractProjectLinks(p.documentation)

    generateAndDownloadPDF({
      title: 'CAPSTONE PROJECT REFERENCE DOSSIER & DAILY PROGRESS LOGS',
      subtitle: `${p.title} · Domain: ${p.domain}`,
      author: p.guideName || `${facultyName} (Faculty Supervisor)`,
      category: 'Capstone Research Project',
      sections: [
        {
          heading: '1. TECHNICAL BLUEPRINT & ARCHITECTURE SPECIFICATION',
          body: [
            `Project Title: ${p.title}`,
            `Domain Specialization: ${p.domain}`,
            `Faculty Research Mentor: ${p.guideName || facultyName}`,
            `Team Members: ${p.teamMembers}`,
            `Technology Stack: ${p.technologies}`,
            `Problem Statement: ${p.problemStatement || p.description || 'Formulating scalable intelligence frameworks.'}`,
            `Proposed Solution: ${p.proposedSolution || 'End-to-end algorithmic pipeline deployed on edge hardware.'}`,
            `GitHub Repository: ${links.githubUrl || 'Available on Department GitHub Organization'}`,
            `Live Deployment: ${links.liveUrl || 'Available in local deployment'}`,
          ],
        },
        {
          heading: '2. DAILY PROGRESS STANDUP LOGS & FACULTY GUIDANCE FEED',
          body: updates.map(
            (u, idx) =>
              `[Log #${idx + 1} - ${u.date}] Contributor: ${u.postedBy} (${u.progressPercentage || 70}% Complete)\n• Tasks: ${u.taskCompleted}\n• Blockers: ${u.blockers || 'None'}\n• Next Target: ${u.nextTarget || 'Sprint deliverables'}\n• Faculty Guidance: ${u.facultyFeedback || 'Reviewed by supervisor'}\n• Status: ${u.facultyStatus || 'Verified'}`
          ),
        },
      ],
      fileName: `Reference_Dossier_${p.domain.replace(/[^a-zA-Z0-9]/g, '_')}_${p.id.slice(-4)}`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Faculty Mentorship Hub
            </span>
            <span className="text-xs text-gray-300 font-medium">· Technical Blueprints &amp; Daily Progress Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student Projects &amp; Innovation Workspace</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Guide student research teams, review daily work logs, and inspect technical blueprints.
          </p>
        </div>

        <button
          onClick={() => {
            setAssignModalMode('edit')
            setShowAssignModal(true)
          }}
          className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" /> Propose / Assign Blueprint
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Blueprints</p>
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
            {projects.filter((p) => (p.guideName || '').toLowerCase().includes(facultyName.toLowerCase())).length} Projects
          </p>
          <p className="text-[10px] text-purple-600 font-semibold truncate">Guided by {facultyName}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Project Cohort</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">{projects.length > 0 ? `${projects.length} Active` : '0 Active'}</p>
          <p className="text-[10px] text-green-600 font-semibold">Department Portfolio</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Daily Standups</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">Continuous</p>
          <p className="text-[10px] text-amber-600 font-semibold">Faculty Monitored</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterGuide('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
              filterGuide === 'ALL' ? 'bg-[#071A3D] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All Department Projects ({projects.length})
          </button>
          <button
            onClick={() => setFilterGuide('MY_PROJECTS')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
              filterGuide === 'MY_PROJECTS' ? 'bg-[#1455D9] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            My Mentored Teams ({projects.filter((p) => (p.guideName || '').toLowerCase().includes(facultyName.toLowerCase())).length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, authors, tech stack..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((p) => {
          const updatesCount = (p.dailyUpdates || parseDailyUpdates(p.futureScope)).length
          const links = extractProjectLinks(p.documentation)

          return (
            <Card
              key={p.id}
              className="rounded-3xl border border-gray-200 hover:shadow-lg transition-all duration-200 bg-white"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-purple-700 px-2.5 py-0.5 rounded-lg bg-purple-50 border border-purple-200 uppercase">
                    {p.domain}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    {updatesCount} Daily Logs
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#071A3D] leading-snug">{p.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {p.problemStatement || p.description || 'Undergraduate Capstone Research reference blueprint.'}
                </p>

                <div className="p-3 bg-gray-50 rounded-2xl text-xs space-y-1 border border-gray-100">
                  <p className="font-bold text-[#071A3D]">Team: {p.teamMembers}</p>
                  <p className="text-gray-500">Mentor: {p.guideName || facultyName}</p>
                  <p className="font-mono text-[11px] text-[#1455D9] font-bold">Stack: {p.technologies}</p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => handleOpenDetails(p)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#22C7E8]" /> Blueprint &amp; Daily Updates
                  </button>

                  <div className="flex items-center gap-1.5">
                    {links.liveUrl && (
                      <a
                        href={links.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                        title="Open Live Deployment"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    {links.githubUrl && (
                      <a
                        href={links.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                        title="Open GitHub Repository"
                      >
                        <Code2 className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDownloadDossier(p)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#1455D9]" /> Dossier PDF
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* FACULTY PROJECT BLUEPRINT & DAILY UPDATES MODAL                           */}
      {/* ========================================================================= */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-bold">
                  {selectedProject.domain}
                </span>
                <h3 className="text-lg font-black text-[#071A3D] mt-1">{selectedProject.title}</h3>
                <p className="text-xs text-gray-500">Student Team: {selectedProject.teamMembers}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-2 border-b pb-2">
              <button
                onClick={() => setModalTab('specs')}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5',
                  modalTab === 'specs' ? 'bg-[#1455D9] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <BookOpen className="w-3.5 h-3.5" />
                1. Technical Reference Blueprint
              </button>
              <button
                onClick={() => setModalTab('daily_updates')}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5',
                  modalTab === 'daily_updates' ? 'bg-[#1455D9] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Clock className="w-3.5 h-3.5 text-[#F4C430]" />
                2. Daily Updates &amp; Guidance Feed ({(selectedProject.dailyUpdates || parseDailyUpdates(selectedProject.futureScope)).length})
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-4">
              {modalTab === 'specs' ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-gray-50 border space-y-1">
                    <p className="font-bold text-gray-700">Problem Statement Formulation:</p>
                    <p className="text-gray-600 leading-relaxed font-mono">
                      {selectedProject.problemStatement || selectedProject.description || 'Formulating automated intelligence systems.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 border space-y-1">
                    <p className="font-bold text-gray-700">Proposed Solution &amp; Tech Architecture:</p>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedProject.proposedSolution || 'Multi-tier deep learning architecture deployed on edge hardware.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Technology Stack</p>
                      <p className="font-bold text-[#1455D9] mt-0.5">{selectedProject.technologies}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Dataset</p>
                      <p className="font-bold text-purple-700 mt-0.5">{selectedProject.dataset || 'Curated Dataset'}</p>
                    </div>
                  </div>

                  {(() => {
                    const links = extractProjectLinks(selectedProject.documentation)
                    return (
                      <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Deployment &amp; Repository</p>
                          <p className="text-xs font-mono text-gray-700 truncate max-w-sm">
                            {links.liveUrl || links.githubUrl || 'Available on Department organization'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {links.liveUrl && (
                            <a
                              href={links.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1"
                            >
                              <Globe className="w-3.5 h-3.5" /> Launch Live App
                            </a>
                          )}
                          {links.githubUrl && (
                            <a
                              href={links.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-[#071A3D] text-white rounded-xl text-xs font-bold hover:bg-[#1455D9] transition flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#22C7E8]" /> GitHub Repo
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                /* TAB 2: DAILY UPDATES FEED WITH MENTORSHIP FEEDBACK INPUT */
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                    <p className="font-black text-[#071A3D]">Student Daily Standup Feed</p>
                    <p className="text-[11px] text-gray-500">Review student accomplishments, unblock obstacles, and record continuous mentorship guidance.</p>
                  </div>

                  <div className="space-y-3">
                    {(selectedProject.dailyUpdates || parseDailyUpdates(selectedProject.futureScope)).map((log, idx) => (
                      <div key={log.id || idx} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-[#1455D9] text-[10px] font-black uppercase">
                              Update #{idx + 1}
                            </span>
                            <span className="font-bold text-gray-800">{log.postedBy}</span>
                            <span className="text-gray-400">· {log.date}</span>
                          </div>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1',
                              log.facultyStatus === 'Verified & Guided'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            )}
                          >
                            <UserCheck className="w-3 h-3" />
                            {log.facultyStatus || 'Verified & Guided'}
                          </span>
                        </div>

                        <p className="text-gray-800 bg-gray-50 p-2.5 rounded-xl border border-gray-100 font-medium">
                          {log.taskCompleted}
                        </p>

                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-amber-900 uppercase flex items-center gap-1">
                              <Award className="w-3 h-3 text-[#F4C430]" /> Faculty Mentorship Note:
                            </span>
                            <button
                              onClick={() => {
                                setFeedbackLogId(feedbackLogId === log.id ? null : log.id)
                                setFeedbackText(log.facultyFeedback || '')
                              }}
                              className="text-[10px] font-bold text-[#1455D9] hover:underline cursor-pointer"
                            >
                              {feedbackLogId === log.id ? 'Close' : 'Add / Edit Guidance'}
                            </button>
                          </div>
                          <p className="text-amber-950 italic text-[11px]">
                            &ldquo;{log.facultyFeedback || 'Reviewed by supervisor. Progress on track.'}&rdquo;
                          </p>
                        </div>

                        {feedbackLogId === log.id && (
                          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-2">
                            <label className="text-[11px] font-black text-[#071A3D] block">
                              Enter Guidance Feedback for this Student Submission:
                            </label>
                            <textarea
                              rows={2}
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              placeholder="Write suggestions, code review feedback, or next target..."
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#1455D9] outline-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveFacultyFeedback(log.id)}
                                className="px-3 py-1 bg-[#1455D9] hover:bg-[#0A2A5E] text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Save Guidance &amp; Verify Log
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-between items-center gap-2">
              <button
                onClick={() => handleDownloadDossier(selectedProject)}
                className="px-4 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#0e44b5] cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Dossier PDF
              </button>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TWO-STEP PROPOSE / ASSIGN PROJECT MODAL (EDIT -> PREVIEW & CONFIRM)       */}
      {/* ========================================================================= */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-200 my-8">
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-6 flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#22C7E8] text-[#071A3D] text-[10px] font-black uppercase">
                  Faculty Project Registry
                </span>
                <h3 className="text-xl font-black mt-1">
                  {assignModalMode === 'edit'
                    ? 'Propose & Assign Capstone Blueprint'
                    : 'Preview & Confirm Blueprint Assignment'}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  {assignModalMode === 'edit'
                    ? 'Create research project title, assign student cohort, and configure technical domain.'
                    : 'Verify blueprint and assigned student team before publishing to live portal.'}
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignModalMode === 'edit' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!assignFormData.title.trim()) {
                    toast.error('Please enter a project title')
                    return
                  }
                  if (assignFormData.domainSelection === 'Custom Domain / Other' && !assignFormData.customDomain.trim()) {
                    toast.error('Please type your custom domain name')
                    return
                  }
                  setAssignModalMode('preview')
                }}
                className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
              >
                <div>
                  <label className="font-bold text-gray-700 block mb-1 text-xs">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Edge AI for Real-Time Solar Panel Defect Detection"
                    value={assignFormData.title}
                    onChange={(e) => setAssignFormData({ ...assignFormData, title: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Domain</label>
                    <select
                      value={assignFormData.domainSelection}
                      onChange={(e) => setAssignFormData({ ...assignFormData, domainSelection: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#1455D9] outline-none"
                    >
                      {PRESET_DOMAINS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Faculty Supervisor</label>
                    <input
                      type="text"
                      value={assignFormData.guideName}
                      onChange={(e) => setAssignFormData({ ...assignFormData, guideName: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                </div>

                {/* Custom Domain Input */}
                {assignFormData.domainSelection === 'Custom Domain / Other' && (
                  <div className="animate-scale-up p-3 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                    <label className="text-xs font-bold text-blue-900 block">
                      Enter Custom Research Domain Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brain-Computer Interfaces, Neuromorphic AI..."
                      value={assignFormData.customDomain}
                      onChange={(e) => setAssignFormData({ ...assignFormData, customDomain: e.target.value })}
                      className="w-full p-2.5 border border-blue-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-gray-700 block mb-1 text-xs">
                    Allocated Team Members (Names &amp; Reg Nos)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. K. Aishwarya (23AD001), R. Deepak (23AD002)"
                    value={assignFormData.teamMembers}
                    onChange={(e) => setAssignFormData({ ...assignFormData, teamMembers: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1 text-xs">Problem Statement</label>
                  <textarea
                    rows={2}
                    placeholder="Brief summary of research problem and technical goals..."
                    value={assignFormData.problemStatement}
                    onChange={(e) => setAssignFormData({ ...assignFormData, problemStatement: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Python, PyTorch, FastAPI, OpenCV"
                      value={assignFormData.technologies}
                      onChange={(e) => setAssignFormData({ ...assignFormData, technologies: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Dataset</label>
                    <input
                      type="text"
                      placeholder="e.g. Solar PV Thermal Dataset"
                      value={assignFormData.dataset}
                      onChange={(e) => setAssignFormData({ ...assignFormData, dataset: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5 text-gray-500" /> GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/vsb-aids/..."
                      value={assignFormData.githubUrl}
                      onChange={(e) => setAssignFormData({ ...assignFormData, githubUrl: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-emerald-700 block mb-1 text-xs flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" /> Live Demo URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://live-app.vercel.app"
                      value={assignFormData.liveUrl}
                      onChange={(e) => setAssignFormData({ ...assignFormData, liveUrl: e.target.value })}
                      className="w-full bg-emerald-50/40 border border-emerald-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1455D9] hover:bg-[#0A2A5E] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Blueprint
                  </button>
                </div>
              </form>
            ) : (
              /* PREVIEW CONFIRMATION VIEW */
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1455D9] text-white text-[10px] font-black uppercase">
                      Year 4 · Capstone
                    </span>
                    <span className="text-xs font-bold text-blue-700">{effectiveDomain}</span>
                  </div>
                  <h3 className="text-base font-black text-[#071A3D]">{assignFormData.title}</h3>
                  <p className="text-xs text-gray-700 font-mono">
                    Problem: {assignFormData.problemStatement || 'Not specified'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Tech Stack</span>
                    <p className="font-bold text-gray-800 mt-0.5">{assignFormData.technologies}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Dataset</span>
                    <p className="font-bold text-gray-800 mt-0.5">{assignFormData.dataset}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Assigned Team</span>
                    <p className="font-bold text-gray-800 mt-0.5">{assignFormData.teamMembers || 'TBD'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Faculty Supervisor</span>
                    <p className="font-bold text-gray-800 mt-0.5">{assignFormData.guideName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-gray-500" /> GitHub Repository
                    </span>
                    <p className="font-mono text-blue-600 truncate mt-0.5">{assignFormData.githubUrl || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-black uppercase text-emerald-800 block flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-600" /> Live Demo Deployment
                    </span>
                    <p className="font-mono text-emerald-700 truncate mt-0.5">{assignFormData.liveUrl || 'Not configured'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignModalMode('edit')}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    ← Back to Edit
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalAssignSubmit}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    {isSubmitting ? 'Assigning...' : 'Confirm & Assign Blueprint'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
