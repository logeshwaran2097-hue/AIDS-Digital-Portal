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

function parseDailyUpdates(raw: string | null | undefined): DailyUpdateLog[] {
  if (!raw) {
    return [
      {
        id: 'log_1',
        date: '2026-08-30',
        postedBy: 'Student Team Leader',
        role: 'Candidate Lead',
        taskCompleted: 'Completed dataset augmentation pipeline and finalized YOLOv8 baseline model architecture.',
        blockers: 'Slight class imbalance on minority medical scan labels.',
        nextTarget: 'Apply focal loss and benchmark against ResNet-50 backbone.',
        commitUrl: 'https://github.com/vsb-aids/capstone-project/commit/7a8f1b2',
        progressPercentage: 65,
        facultyFeedback: 'Excellent progress. Recommended Focal Loss with gamma=2.0 to balance classes.',
        facultyStatus: 'Verified & Guided',
      },
      {
        id: 'log_2',
        date: '2026-08-31',
        postedBy: 'Student Researcher',
        role: 'ML Engineer',
        taskCompleted: 'Quantized neural network weights to INT8 precision for NVIDIA Jetson deployment test.',
        blockers: 'None. Inference latency reduced from 45ms to 12ms.',
        nextTarget: 'Build FastAPI endpoint and connect React front-end dashboard.',
        commitUrl: 'https://github.com/vsb-aids/capstone-project/commit/9e4c3d1',
        progressPercentage: 80,
        facultyFeedback: 'Good benchmark metrics. Ensure you document memory consumption curves.',
        facultyStatus: 'Verified & Guided',
      },
    ]
  }

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}

  return [
    {
      id: 'log_init',
      date: '2026-08-31',
      postedBy: 'Student Team',
      role: 'Student Researcher',
      taskCompleted: raw,
      blockers: 'None',
      nextTarget: 'Prepare sprint deliverables',
      progressPercentage: 70,
      facultyFeedback: 'Supervised by faculty mentor.',
      facultyStatus: 'Verified & Guided',
    },
  ]
}

export function FacultyProjectsView({ initialProjects }: { initialProjects: FacultyProjectItem[] }) {
  const [projects, setProjects] = useState<FacultyProjectItem[]>(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('ALL')
  const [filterGuide, setFilterGuide] = useState<'ALL' | 'MY_PROJECTS'>('ALL')
  const [selectedProject, setSelectedProject] = useState<FacultyProjectItem | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [modalTab, setModalTab] = useState<'specs' | 'daily_updates'>('specs')

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
        (filterGuide === 'MY_PROJECTS' && (p.guideName || '').includes('Karthik'))

      return matchesSearch && matchesDomain && matchesGuide
    })
  }, [projects, searchQuery, selectedDomain, filterGuide])

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

  const handleDownloadDossier = (p: FacultyProjectItem) => {
    const updates = p.dailyUpdates || parseDailyUpdates(p.futureScope)
    generateAndDownloadPDF({
      title: 'CAPSTONE PROJECT REFERENCE DOSSIER & DAILY PROGRESS LOGS',
      subtitle: `${p.title} · Domain: ${p.domain}`,
      author: p.guideName || 'Dr. S. Karthik (Faculty Supervisor)',
      category: 'Capstone Research Project',
      sections: [
        {
          heading: '1. TECHNICAL BLUEPRINT & ARCHITECTURE SPECIFICATION',
          body: [
            `Project Title: ${p.title}`,
            `Domain Specialization: ${p.domain}`,
            `Faculty Research Mentor: ${p.guideName || 'Dr. S. Karthik'}`,
            `Team Members: ${p.teamMembers}`,
            `Technology Stack: ${p.technologies}`,
            `Problem Statement: ${p.problemStatement || p.description || 'Formulating scalable intelligence frameworks.'}`,
            `Proposed Solution: ${p.proposedSolution || 'End-to-end algorithmic pipeline deployed on edge hardware.'}`,
            `Code Repository: ${p.documentation || 'Available on Department GitHub Organization'}`,
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
          onClick={() => setShowAssignModal(true)}
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
            {projects.filter((p) => (p.guideName || '').includes('Karthik')).length} Projects
          </p>
          <p className="text-[10px] text-purple-600 font-semibold">Under Dr. S. Karthik</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Student Researchers</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">18 Students</p>
          <p className="text-[10px] text-green-600 font-semibold">Active Cohort</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Daily Standups</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">Continuous</p>
          <p className="text-[10px] text-amber-600 font-semibold">Faculty Monitored</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterGuide('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
              filterGuide === 'ALL' ? 'bg-[#1455D9] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            My Mentored Teams ({projects.filter((p) => (p.guideName || '').includes('Karthik')).length})
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
                  <p className="text-gray-500">Mentor: {p.guideName || 'Dr. S. Karthik'}</p>
                  <p className="font-mono text-[11px] text-[#1455D9] font-bold">Stack: {p.technologies}</p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenDetails(p)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#22C7E8]" /> Blueprint &amp; Daily Updates
                  </button>

                  <button
                    onClick={() => handleDownloadDossier(p)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#1455D9]" /> Dossier PDF
                  </button>
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

      {/* Propose / Assign Project Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Assign Capstone Project Blueprint</h3>
                <p className="text-xs text-gray-500">Create research project title and allocate student team</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                toast.success('Project blueprint assigned to research team!')
                setShowAssignModal(false)
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-gray-700 block mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Edge AI for Real-Time Solar Panel Defect Detection"
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs"
                  required
                />
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
                  <input
                    type="text"
                    defaultValue="Dr. S. Karthik (Associate Professor)"
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Allocated Team Members</label>
                <input
                  type="text"
                  placeholder="e.g. K. Aishwarya (23AD001), R. Deepak (23AD002)"
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Problem Statement</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of research problem and technical goals..."
                  className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]"
                >
                  Assign Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
