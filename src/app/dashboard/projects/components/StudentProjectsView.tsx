'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  FolderOpen,
  Users,
  Search,
  Plus,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Code2,
  BookOpen,
  Clock,
  Send,
  GitCommit,
  Cpu,
  Database,
  TrendingUp,
  AlertCircle,
  Download,
  Award,
  UserCheck,
  X,
  Eye,
  Check,
  Globe,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
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

export interface StudentProjectRecord {
  id: string
  title: string
  description: string | null
  problemStatement?: string | null
  proposedSolution?: string | null
  technologies: string
  dataset?: string | null
  results?: string | null
  futureScope?: string | null
  documentation?: string | null
  domain: string
  year: number
  semester?: number | null
  batch?: string | null
  status: string
  guideName: string | null
  guideEmail?: string | null
  teamMembers: string
  createdAt?: Date
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

export function StudentProjectsView({
  projects,
  activeBatch = '2024 - 2028',
  batchLabel = 'II Year (Semester 4)',
  studentName = 'Student',
  registerNumber = '',
}: {
  projects: StudentProjectRecord[]
  activeBatch?: string
  batchLabel?: string
  studentName?: string
  registerNumber?: string
}) {
  const [projectsList, setProjectsList] = useState<StudentProjectRecord[]>(projects)
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<StudentProjectRecord | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitModalMode, setSubmitModalMode] = useState<'edit' | 'preview'>('edit')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalTab, setModalTab] = useState<'specs' | 'daily_updates'>('specs')

  // Real-time polling
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/projects', { cache: 'no-store' })
        const data = await res.json()
        if (data.success && Array.isArray(data.projects)) {
          setProjectsList(
            data.projects.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              problemStatement: p.problemStatement,
              proposedSolution: p.proposedSolution,
              technologies: p.technologies,
              dataset: p.dataset,
              results: p.results,
              futureScope: p.futureScope,
              documentation: p.documentation,
              domain: p.domain,
              year: Number(p.year) || 2,
              semester: Number(p.semester) || 4,
              batch: p.batch || activeBatch,
              status: p.status || 'Active & Supervised',
              guideName: p.guideName,
              guideEmail: p.guideEmail,
              teamMembers: p.teamMembers,
              dailyUpdates: parseDailyUpdates(p.futureScope),
            }))
          )
        }
      } catch {}
    }

    const interval = setInterval(fetchLatest, 4000)
    return () => clearInterval(interval)
  }, [activeBatch])

  // Daily Update Logging Form State
  const [showLogForm, setShowLogForm] = useState(false)
  const [newLogData, setNewLogData] = useState({
    postedBy: registerNumber ? `${studentName} (${registerNumber})` : studentName,
    taskCompleted: '',
    blockers: 'None',
    nextTarget: '',
    commitUrl: '',
    progressPercentage: 80,
  })

  const defaultMemberText = registerNumber ? `${studentName} (${registerNumber})` : studentName

  // Proposal Form State with Custom Domain and Live URL
  const [formData, setFormData] = useState({
    title: '',
    domainSelection: 'Computer Vision & Deep Learning',
    customDomain: '',
    technologies: '',
    teamMembers: '',
    guideName: '',
    description: '',
    problemStatement: '',
    proposedSolution: '',
    dataset: '',
    results: '',
    githubUrl: '',
    liveUrl: '',
  })

  const effectiveDomain =
    formData.domainSelection === 'Custom Domain / Other'
      ? formData.customDomain.trim() || 'Applied Artificial Intelligence'
      : formData.domainSelection

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
        (p.teamMembers && p.teamMembers.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.guideName && p.guideName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.technologies && p.technologies.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesDomain && matchesSearch
    })
  }, [projectsList, selectedDomain, searchQuery])

  // Open Project Details Modal
  const handleOpenDetails = (proj: StudentProjectRecord) => {
    const updates = proj.dailyUpdates || parseDailyUpdates(proj.futureScope)
    setSelectedProject({ ...proj, dailyUpdates: updates })
    setModalTab('specs')
    setShowLogForm(false)
  }

  // Submit daily progress log
  const handleAddDailyUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return
    if (!newLogData.taskCompleted.trim()) {
      toast.error('Please describe tasks completed today')
      return
    }

    const currentUpdates = selectedProject.dailyUpdates || parseDailyUpdates(selectedProject.futureScope)
    const newEntry: DailyUpdateLog = {
      id: 'log_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      postedBy: newLogData.postedBy || studentName,
      role: 'Candidate Researcher',
      taskCompleted: newLogData.taskCompleted,
      blockers: newLogData.blockers || 'None',
      nextTarget: newLogData.nextTarget || 'Continue sprint goals',
      commitUrl: newLogData.commitUrl || undefined,
      progressPercentage: Number(newLogData.progressPercentage) || 75,
      facultyFeedback: 'Pending guide verification.',
      facultyStatus: 'Pending Review',
    }

    const updatedList = [newEntry, ...currentUpdates]
    const updatedSerialized = JSON.stringify(updatedList)

    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedProject.id,
          futureScope: updatedSerialized,
          status: 'Active · Daily Update Posted',
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSelectedProject({
          ...selectedProject,
          futureScope: updatedSerialized,
          dailyUpdates: updatedList,
          status: 'Active · Daily Update Posted',
        })
        setProjectsList((prev) =>
          prev.map((p) =>
            p.id === selectedProject.id
              ? {
                  ...p,
                  futureScope: updatedSerialized,
                  dailyUpdates: updatedList,
                  status: 'Active · Daily Update Posted',
                }
              : p
          )
        )
        toast.success('Daily progress update submitted to faculty mentor!')
        setShowLogForm(false)
        setNewLogData({
          postedBy: registerNumber ? `${studentName} (${registerNumber})` : studentName,
          taskCompleted: '',
          blockers: 'None',
          nextTarget: '',
          commitUrl: '',
          progressPercentage: 85,
        })
      } else {
        toast.error('Failed to submit daily update.')
      }
    } catch {
      toast.error('Network error saving update.')
    }
  }

  // Final Publish Proposal after preview
  const handleFinalSubmitProposal = async () => {
    const finalDomain = effectiveDomain
    const combinedDocs = formatProjectLinks(formData.githubUrl, formData.liveUrl)

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          domain: finalDomain,
          technologies: formData.technologies,
          description: formData.description,
          problemStatement: formData.problemStatement,
          proposedSolution: formData.proposedSolution,
          dataset: formData.dataset,
          results: formData.results,
          documentation: combinedDocs,
          teamMembers: formData.teamMembers,
          year: 2,
          status: 'Active & Supervised',
          guideName: formData.guideName || 'Dr. S. Karthik, Associate Professor',
          guideEmail: 'karthik@vsb.edu.in',
        }),
      })

      const data = await res.json()
      if (data.success && data.project) {
        setProjectsList([data.project, ...projectsList])
        setShowSubmitModal(false)
        setSubmitModalMode('edit')
        setFormData({
          title: '',
          domainSelection: 'Computer Vision & Deep Learning',
          customDomain: '',
          technologies: '',
          teamMembers: '',
          guideName: '',
          description: '',
          problemStatement: '',
          proposedSolution: '',
          dataset: '',
          results: '',
          githubUrl: '',
          liveUrl: '',
        })
        toast.success('🎉 Project blueprint published to Live Portal!')
      } else {
        toast.error(data.message || 'Failed to submit proposal.')
      }
    } catch {
      toast.error('Network error submitting proposal.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadDossier = (proj: StudentProjectRecord) => {
    const updates = proj.dailyUpdates || parseDailyUpdates(proj.futureScope)
    const links = extractProjectLinks(proj.documentation)

    generateAndDownloadPDF({
      title: 'PROJECT REFERENCE DOSSIER & DAILY PROGRESS LOGS',
      subtitle: `Department of Artificial Intelligence & Data Science · Student Reference Hub 2026`,
      author: proj.guideName || 'Dr. S. Karthik (Faculty Mentor)',
      category: `TECHNICAL BLUEPRINT: ${proj.title.toUpperCase()}`,
      sections: [
        {
          heading: '1. TECHNICAL BLUEPRINT & ARCHITECTURE REFERENCE',
          body: [
            `Project Title: ${proj.title}`,
            `Domain Vertical: ${proj.domain || 'Applied AI / ML'}`,
            `Academic Cadre: Year ${proj.year || 2} | Batch: ${proj.batch || '2024-2028'}`,
            `Student Researchers: ${proj.teamMembers || 'Student Team'}`,
            `Faculty Research Mentor: ${proj.guideName || 'Dr. S. Karthik'} (${proj.guideEmail || 'karthik@vsb.edu.in'})`,
            `Technical Stack: ${proj.technologies || 'Python, PyTorch, React, FastAPI'}`,
            `Benchmark Results: ${proj.results || 'Verified on local test split'}`,
            `GitHub Repository: ${links.githubUrl || 'Available on Department GitHub'}`,
            `Live Deployment URL: ${links.liveUrl || 'Available in local environment'}`,
            `Problem Statement: ${proj.problemStatement || proj.description || 'Engineering AI solutions for real-world automation.'}`,
            `Proposed Methodology: ${proj.proposedSolution || 'End-to-end pipeline with transformer architectures.'}`,
          ],
        },
        {
          heading: '2. DAILY PROGRESS STANDUP LOGS & MENTOR FEEDBACK',
          body: updates.map(
            (u, idx) =>
              `[Log #${idx + 1} - ${u.date}] Contributor: ${u.postedBy} (${u.progressPercentage || 70}% Complete)\n• Tasks: ${u.taskCompleted}\n• Blockers: ${u.blockers || 'None'}\n• Next Target: ${u.nextTarget || 'Sprint tasks'}\n• Mentor Guidance: ${u.facultyFeedback || 'Reviewed by supervisor'}\n• Status: ${u.facultyStatus || 'Verified'}`
          ),
        },
      ],
      fileName: `Reference_Dossier_${proj.title.slice(0, 20).replace(/\s+/g, '_')}_2026`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Student Reference &amp; Innovation Hub
            </span>
            <span className="text-xs text-gray-300">· Peer Architecture Blueprints &amp; Daily Progress Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">AI &amp; Data Science Project Reference Hub</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Explore reference blueprints, neural architectures, datasets, and post your team&apos;s daily project updates.
          </p>
        </div>

        <button
          onClick={() => {
            setSubmitModalMode('edit')
            setShowSubmitModal(true)
          }}
          className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-colors shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Submit Project Blueprint
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reference Projects</p>
          <p className="text-2xl font-black text-[#071A3D] mt-1">{projectsList.length}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Peer Blueprints &amp; Codebases</p>
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
          <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Faculty Guidance</p>
          <p className="text-2xl font-black text-green-600 mt-1">Daily Standup</p>
          <p className="text-[10px] text-green-600 mt-0.5">Continuous Mentorship</p>
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
            placeholder="Search reference projects, datasets, tech stack..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => {
            const updatesCount = (p.dailyUpdates || parseDailyUpdates(p.futureScope)).length
            const links = extractProjectLinks(p.documentation)

            return (
              <div
                key={p.id}
                onClick={() => handleOpenDetails(p)}
                className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black text-purple-700 px-2.5 py-0.5 rounded-lg bg-purple-50 border border-purple-200 uppercase">
                      {p.domain}
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {updatesCount} Daily Logs
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#071A3D] group-hover:text-[#1455D9] transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {p.problemStatement || p.description || 'Undergraduate Capstone Research reference blueprint.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Supervisor:</span>
                    <span className="font-bold text-[#071A3D]">{p.guideName || 'Dr. S. Karthik'}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Tech:</span>
                    <span className="font-mono text-[11px] font-bold text-[#1455D9] truncate max-w-[180px]">
                      {p.technologies}
                    </span>
                  </div>
                  {links.liveUrl && (
                    <div className="flex items-center justify-between text-emerald-700 pt-1">
                      <span className="flex items-center gap-1 font-bold">
                        <Globe className="w-3 h-3" /> Live Demo:
                      </span>
                      <span className="font-mono text-[10px] truncate max-w-[160px] underline">
                        {links.liveUrl.replace('https://', '')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <FolderOpen className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Projects in Selection</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Click &quot;+ Submit Project Blueprint&quot; to register your team&apos;s capstone or mini-project.
          </p>
          <button
            onClick={() => {
              setSubmitModalMode('edit')
              setShowSubmitModal(true)
            }}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Submit Blueprint
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW PROJECT REFERENCE & DAILY LOGS MODAL                                 */}
      {/* ========================================================================= */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#1455D9]">
                  {selectedProject.domain} · Year {selectedProject.year} Reference
                </span>
                <h3 className="text-lg font-black text-[#071A3D] mt-1.5">{selectedProject.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Faculty Mentor: {selectedProject.guideName || 'Dr. S. Karthik'}</p>
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

            {/* Modal Body Content */}
            <div className="max-h-[60vh] overflow-y-auto space-y-4">
              {modalTab === 'specs' ? (
                /* TAB 1: TECHNICAL REFERENCE */
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-black text-[#071A3D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                      Research Problem Formulation (Reference)
                    </h4>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100 font-mono">
                      {selectedProject.problemStatement || selectedProject.description || 'Undergraduate Capstone Research reference proposal.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-black text-[#071A3D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F4C430]" />
                      Proposed Methodology &amp; Architecture
                    </h4>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      {selectedProject.proposedSolution || 'End-to-end deep learning framework with edge optimization.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
                      <p className="font-black text-[#1455D9] text-[10px] uppercase flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> Tech Stack
                      </p>
                      <p className="font-bold text-gray-800">{selectedProject.technologies}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                      <p className="font-black text-emerald-700 text-[10px] uppercase flex items-center gap-1">
                        <Database className="w-3 h-3" /> Dataset
                      </p>
                      <p className="font-bold text-gray-800">{selectedProject.dataset || 'Curated Dataset'}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                      <p className="font-black text-purple-700 text-[10px] uppercase flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Empirical Metrics
                      </p>
                      <p className="font-bold text-gray-800">{selectedProject.results || '98.4% Accuracy'}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                    <p className="text-[#071A3D] font-semibold">Student Authors: {selectedProject.teamMembers}</p>
                    <p className="text-gray-500">Supervisor: {selectedProject.guideName || 'Dr. S. Karthik'}</p>
                    
                    {(() => {
                      const links = extractProjectLinks(selectedProject.documentation)
                      return (
                        <div className="pt-2 flex items-center gap-2 flex-wrap">
                          {links.liveUrl && (
                            <a
                              href={links.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition"
                            >
                              <Globe className="w-3.5 h-3.5" /> Launch Live App Demo
                            </a>
                          )}
                          {links.githubUrl && (
                            <a
                              href={links.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#071A3D] text-white text-xs font-black hover:bg-[#1455D9] transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#22C7E8]" /> Explore GitHub Repository
                            </a>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              ) : (
                /* TAB 2: DAILY UPDATES FEED & SUBMISSION FORM */
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                    <div>
                      <p className="font-black text-[#071A3D]">Daily Standup &amp; Work Progress Log</p>
                      <p className="text-[11px] text-gray-500">Post daily accomplishments for faculty guide verification.</p>
                    </div>
                    <button
                      onClick={() => setShowLogForm(!showLogForm)}
                      className="px-3 py-1.5 bg-[#1455D9] text-white rounded-xl font-bold cursor-pointer hover:bg-[#0e44b5]"
                    >
                      {showLogForm ? 'Cancel' : '+ Post Today&apos;s Update'}
                    </button>
                  </div>

                  {/* Form to Post Update */}
                  {showLogForm && (
                    <form onSubmit={handleAddDailyUpdate} className="p-4 rounded-2xl border-2 border-blue-200 bg-white space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Contributor</label>
                          <input
                            type="text"
                            value={newLogData.postedBy}
                            onChange={(e) => setNewLogData({ ...newLogData, postedBy: e.target.value })}
                            className="w-full p-2 border rounded-xl bg-gray-50 text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Progress Percentage (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newLogData.progressPercentage}
                            onChange={(e) => setNewLogData({ ...newLogData, progressPercentage: Number(e.target.value) })}
                            className="w-full p-2 border rounded-xl bg-gray-50 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Tasks Completed Today *</label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Describe what you coded, trained, or designed today..."
                          value={newLogData.taskCompleted}
                          onChange={(e) => setNewLogData({ ...newLogData, taskCompleted: e.target.value })}
                          className="w-full p-2 border rounded-xl bg-gray-50 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Blockers / Challenges</label>
                          <input
                            type="text"
                            placeholder="e.g. CUDA out of memory error..."
                            value={newLogData.blockers}
                            onChange={(e) => setNewLogData({ ...newLogData, blockers: e.target.value })}
                            className="w-full p-2 border rounded-xl bg-gray-50 text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Next Day Target Plan</label>
                          <input
                            type="text"
                            placeholder="e.g. Implement learning rate scheduler..."
                            value={newLogData.nextTarget}
                            onChange={(e) => setNewLogData({ ...newLogData, nextTarget: e.target.value })}
                            className="w-full p-2 border rounded-xl bg-gray-50 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">GitHub Commit / PR Link</label>
                        <input
                          type="url"
                          placeholder="https://github.com/..."
                          value={newLogData.commitUrl}
                          onChange={(e) => setNewLogData({ ...newLogData, commitUrl: e.target.value })}
                          className="w-full p-2 border rounded-xl bg-gray-50 text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <button
                          type="button"
                          onClick={() => setShowLogForm(false)}
                          className="px-3 py-1.5 border rounded-xl font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 inline mr-1" /> Submit to Mentor
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Updates */}
                  <div className="space-y-3">
                    {(selectedProject.dailyUpdates || parseDailyUpdates(selectedProject.futureScope)).map((log, idx) => (
                      <div key={log.id || idx} className="p-3.5 rounded-2xl border border-gray-200 bg-white space-y-2">
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

                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-0.5">
                          <span className="text-[10px] font-black text-amber-900 uppercase flex items-center gap-1">
                            <Award className="w-3 h-3 text-[#F4C430]" /> Faculty Guide Mentorship Note:
                          </span>
                          <p className="text-amber-950 italic text-[11px]">
                            &ldquo;{log.facultyFeedback || 'Reviewed by supervisor. Keep up the good pace.'}&rdquo;
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t flex items-center justify-between gap-2">
              <button
                onClick={() => handleDownloadDossier(selectedProject)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#1455D9]" /> Download Dossier PDF
              </button>

              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 bg-[#071A3D] text-white rounded-xl text-xs font-bold hover:bg-[#1455D9] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TWO-STEP SUBMIT PROPOSAL MODAL (EDIT -> PREVIEW & CONFIRM)                */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-200 my-8">
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-6 flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#22C7E8] text-[#071A3D] text-[10px] font-black uppercase">
                  Project Blueprint Registry
                </span>
                <h2 className="text-xl font-black mt-1">
                  {submitModalMode === 'edit'
                    ? 'Submit Capstone Project Blueprint'
                    : 'Preview & Confirm Reference Blueprint'}
                </h2>
                <p className="text-xs text-gray-300 mt-0.5">
                  {submitModalMode === 'edit'
                    ? 'Enter technical details, dataset, and architecture before reviewing your submission.'
                    : 'Verify reference blueprint details before committing to the institutional database.'}
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitModalMode === 'edit' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!formData.title.trim()) {
                    toast.error('Please enter a project title')
                    return
                  }
                  if (formData.domainSelection === 'Custom Domain / Other' && !formData.customDomain.trim()) {
                    toast.error('Please type your custom domain name')
                    return
                  }
                  setSubmitModalMode('preview')
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
                    placeholder="e.g. Edge AI for Agricultural Drones"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Research Domain</label>
                    <select
                      value={formData.domainSelection}
                      onChange={(e) => setFormData({ ...formData, domainSelection: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                    >
                      {PRESET_DOMAINS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Faculty Research Mentor</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. S. Karthik, Associate Professor"
                      value={formData.guideName}
                      onChange={(e) => setFormData({ ...formData, guideName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                    />
                  </div>
                </div>

                {/* Custom Domain Input when selected */}
                {formData.domainSelection === 'Custom Domain / Other' && (
                  <div className="animate-scale-up p-3 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                    <label className="text-xs font-bold text-blue-900 block">
                      Enter Custom Research Domain Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Quantum AI & Cryptography, Neuromorphic Edge Computing..."
                      value={formData.customDomain}
                      onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                      className="w-full p-2.5 border border-blue-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. PyTorch, YOLOv8, FastAPI, React"
                      value={formData.technologies}
                      onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Student Authors / Team Members</label>
                    <input
                      type="text"
                      placeholder="e.g. Logeshwaran G (92252524185)"
                      value={formData.teamMembers}
                      onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1 text-xs">Problem Statement</label>
                  <textarea
                    rows={2}
                    placeholder="Describe research problem, industry bottleneck, and motivation..."
                    value={formData.problemStatement}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1 text-xs">Proposed Solution &amp; Methodology</label>
                  <textarea
                    rows={2}
                    placeholder="Proposed architecture, deep learning models, and pipeline..."
                    value={formData.proposedSolution}
                    onChange={(e) => setFormData({ ...formData, proposedSolution: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Dataset</label>
                    <input
                      type="text"
                      placeholder="e.g. Custom Annotated Dataset / Kaggle"
                      value={formData.dataset}
                      onChange={(e) => setFormData({ ...formData, dataset: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs">Empirical Results</label>
                    <input
                      type="text"
                      placeholder="e.g. 98.4% Accuracy, 12ms Latency"
                      value={formData.results}
                      onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                    />
                  </div>
                </div>

                {/* GitHub Repo & Live Demo Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1 text-xs flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5 text-gray-500" />
                      GitHub / Code Repository URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/vsb-aids/..."
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1455D9]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-emerald-700 block mb-1 text-xs flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      Project Live Demo / Production URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://my-app.vercel.app or Streamlit link"
                      value={formData.liveUrl}
                      onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                      className="w-full bg-emerald-50/40 border border-emerald-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
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
                      Year 2 · Sem 4 ({activeBatch})
                    </span>
                    <span className="text-xs font-bold text-blue-700">{effectiveDomain}</span>
                  </div>
                  <h3 className="text-base font-black text-[#071A3D]">{formData.title}</h3>
                  <p className="text-xs text-gray-700 font-mono">
                    Problem: {formData.problemStatement || 'Not specified'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Tech Stack</span>
                    <p className="font-bold text-gray-800 mt-0.5">{formData.technologies}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Dataset</span>
                    <p className="font-bold text-gray-800 mt-0.5">{formData.dataset}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Student Authors</span>
                    <p className="font-bold text-gray-800 mt-0.5">{formData.teamMembers || 'TBD'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Faculty Mentor</span>
                    <p className="font-bold text-gray-800 mt-0.5">{formData.guideName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-gray-500" /> GitHub Repository
                    </span>
                    <p className="font-mono text-blue-600 truncate mt-0.5">{formData.githubUrl || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-black uppercase text-emerald-800 block flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-600" /> Live Demo Deployment
                    </span>
                    <p className="font-mono text-emerald-700 truncate mt-0.5">{formData.liveUrl || 'Not configured'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmitModalMode('edit')}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    ← Back to Edit
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmitProposal}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    {isSubmitting ? 'Publishing...' : 'Confirm & Publish Blueprint'}
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
