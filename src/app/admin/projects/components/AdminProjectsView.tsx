'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  FolderOpen,
  Download,
  Plus,
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
  FileText,
  ExternalLink,
  Code2,
  Database,
  Cpu,
  TrendingUp,
  Check,
  Send,
  AlertCircle,
  MessageSquare,
  Clock,
  GitCommit,
  BookOpen,
  ArrowRight,
  UserCheck,
  Globe,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { cn } from '@/lib/utils'
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

export interface ProjectRecord {
  id: string
  title: string
  description?: string | null
  problemStatement?: string | null
  proposedSolution?: string | null
  technologies?: string | null
  dataset?: string | null
  results?: string | null
  futureScope?: string | null
  documentation?: string | null
  domain?: string | null
  year: number
  semester?: number | null
  batch?: string | null
  status: string
  guideName?: string | null
  guideEmail?: string | null
  teamMembers?: string | null
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

// Helper to parse daily updates from futureScope JSON string
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

export function AdminProjectsView({ initialProjects }: { initialProjects: ProjectRecord[] }) {
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects || [])
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL')
  const [selectedDomain, setSelectedDomain] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Real-time synchronization
  useEffect(() => {
    const fetchProjects = async () => {
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
              technologies: p.technologies,
              dataset: p.dataset,
              results: p.results,
              futureScope: p.futureScope,
              documentation: p.documentation,
              domain: p.domain,
              year: Number(p.year) || 4,
              semester: Number(p.semester) || (Number(p.year) * 2),
              batch: p.batch || (p.year === 1 ? '2025 - 2029' : p.year === 2 ? '2024 - 2028' : p.year === 3 ? '2023 - 2027' : '2022 - 2026'),
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

    const interval = setInterval(fetchProjects, 4000)
    return () => clearInterval(interval)
  }, [])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'edit' | 'preview'>('edit')
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'specs' | 'daily_updates'>('specs')

  // Daily Update Logging Form State
  const [showLogForm, setShowLogForm] = useState(false)
  const [newLogData, setNewLogData] = useState({
    postedBy: 'Student Team Contributor',
    taskCompleted: '',
    blockers: 'None',
    nextTarget: '',
    commitUrl: '',
    progressPercentage: 80,
  })

  // Faculty Feedback Input State
  const [facultyFeedbackText, setFacultyFeedbackText] = useState('')
  const [selectedLogIdForFeedback, setSelectedLogIdForFeedback] = useState<string | null>(null)

  // Add Project Form State (with Live Link & Custom Domain)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    proposedSolution: '',
    technologies: 'Python, PyTorch, YOLOv8, FastAPI, React',
    dataset: 'Custom Annotated Dataset / Kaggle Benchmark',
    results: '98.4% Accuracy, 12ms Real-time Inference',
    futureScope: '',
    githubUrl: 'https://github.com/vsb-aids/capstone-project',
    liveUrl: 'https://project-demo.vsb.edu.in',
    domainSelection: 'Computer Vision & Deep Learning',
    customDomain: '',
    year: 4,
    semester: 8,
    batch: '2022 - 2026',
    guideName: 'Dr. S. Karthik, Associate Professor',
    guideEmail: 'karthik@vsb.edu.in',
    teamMembers: '',
    status: 'Active & Supervised',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const effectiveDomain =
    formData.domainSelection === 'Custom Domain / Other'
      ? formData.customDomain.trim() || 'Applied Artificial Intelligence'
      : formData.domainSelection

  const yearCategories = [
    { year: 1, name: 'Year I', label: 'Mini Projects & Ideation', sems: 'Sem 1 & 2', color: 'blue' },
    { year: 2, name: 'Year II', label: 'Design & Software Prototypes', sems: 'Sem 3 & 4', color: 'purple' },
    { year: 3, name: 'Year III', label: 'Industry & Applied R&D', sems: 'Sem 5 & 6', color: 'indigo' },
    { year: 4, name: 'Year IV', label: 'Final Capstone & IEEE Patents', sems: 'Sem 7 & 8', color: 'emerald' },
  ]

  const getYearCount = (yearNum: number) => {
    return projects.filter((p) => (p.year || 4) === yearNum).length
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
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
  }, [projects, selectedYear, selectedDomain, searchQuery])

  const domains = useMemo(() => {
    const dList = Array.from(new Set(projects.map((p) => p.domain).filter(Boolean))) as string[]
    return dList.length > 0 ? dList : PRESET_DOMAINS.filter((d) => d !== 'Custom Domain / Other')
  }, [projects])

  // Open Project Details Modal (Reference + Daily Updates)
  const handleOpenProjectDetails = (proj: ProjectRecord) => {
    const updates = parseDailyUpdates(proj.futureScope)
    setSelectedProject({ ...proj, dailyUpdates: updates })
    setActiveTab('specs')
    setShowLogForm(false)
    setSelectedLogIdForFeedback(null)
    setIsDetailModalOpen(true)
  }

  // Submit a new daily update for the project
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
      postedBy: newLogData.postedBy || 'Student Contributor',
      role: 'Candidate Lead',
      taskCompleted: newLogData.taskCompleted,
      blockers: newLogData.blockers || 'None',
      nextTarget: newLogData.nextTarget || 'Continue sprint goals',
      commitUrl: newLogData.commitUrl || undefined,
      progressPercentage: Number(newLogData.progressPercentage) || 75,
      facultyFeedback: 'Pending faculty mentor review.',
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
        setProjects((prev) =>
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
        toast.success('Daily progress update submitted successfully!')
        setShowLogForm(false)
        setNewLogData({
          postedBy: 'Student Team Contributor',
          taskCompleted: '',
          blockers: 'None',
          nextTarget: '',
          commitUrl: '',
          progressPercentage: 85,
        })
      } else {
        toast.error('Failed to save daily update.')
      }
    } catch {
      toast.error('Network error saving update.')
    }
  }

  // Save Faculty Guidance feedback on a daily log entry
  const handleSaveFacultyFeedback = async (logId: string) => {
    if (!selectedProject || !facultyFeedbackText.trim()) return

    const currentUpdates = selectedProject.dailyUpdates || parseDailyUpdates(selectedProject.futureScope)
    const updatedList = currentUpdates.map((item) =>
      item.id === logId
        ? {
            ...item,
            facultyFeedback: facultyFeedbackText,
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
        toast.success('Faculty guidance feedback recorded!')
        setSelectedLogIdForFeedback(null)
        setFacultyFeedbackText('')
      }
    } catch {
      toast.error('Network error recording feedback.')
    }
  }

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — CAPSTONE PROJECTS & STUDENT REFERENCE HUB',
      subtitle: `V.S.B. Engineering College · Autonomous Institution · ${selectedYear === 'ALL' ? 'Complete 4-Year Technical Reference Directory' : `Year ${selectedYear} Reference Projects`}`,
      author: 'Department Research & Innovation Committee',
      category: 'Official Capstone Technical Reference Library',
      sections: [
        {
          heading: '1. R&D CAPSTONE REFERENCE REPOSITORY',
          body: [
            `Total Documented Projects: ${filteredProjects.length} Research Blueprints`,
            'Purpose: Technical reference and architectural guidance for undergraduate students',
            'Domains: Computer Vision, LLMs, Speech AI, Healthcare ML, GNNs, Blockchain & Robotics',
            'Supervision: Guided by Full-Time Faculty Research Mentors with Daily Progress Tracking',
          ],
        },
        {
          heading: '2. REFERENCE PROJECT BLUEPRINTS & ARCHITECTURES',
          body: filteredProjects.map((p, idx) => {
            const links = extractProjectLinks(p.documentation)
            return `${idx + 1}. [Year ${p.year || 4}] "${p.title}" — Domain: ${p.domain || 'Applied AI'} | Supervisor: ${p.guideName || 'Faculty Guide'} | Team: ${p.teamMembers || 'Student Team'} | Stack: ${p.technologies || 'AI Frameworks'} ${links.liveUrl ? `| Live Demo: ${links.liveUrl}` : ''}`
          }),
        },
      ],
      fileName: `VSB_Projects_Reference_Directory_${selectedYear === 'ALL' ? 'All_Years' : `Year_${selectedYear}`}_2026`,
    })
  }

  const handleDownloadReferenceDossier = (proj: ProjectRecord) => {
    const updates = proj.dailyUpdates || parseDailyUpdates(proj.futureScope)
    const links = extractProjectLinks(proj.documentation)

    generateAndDownloadPDF({
      title: 'PROJECT REFERENCE DOSSIER & DAILY PROGRESS LOGS',
      subtitle: `Department of Artificial Intelligence & Data Science · Student Reference Hub 2026`,
      author: proj.guideName || 'Dr. S. Karthik (Faculty Supervisor)',
      category: `TECHNICAL BLUEPRINT: ${proj.title.toUpperCase()}`,
      sections: [
        {
          heading: '1. TECHNICAL BLUEPRINT & ARCHITECTURE REFERENCE',
          body: [
            `Project Title: ${proj.title}`,
            `Domain Vertical: ${proj.domain || 'Applied AI / ML'}`,
            `Academic Cadre: Year ${proj.year || 4} (Semester ${proj.semester || (proj.year || 4) * 2}) | Batch: ${proj.batch || '2022-2026'}`,
            `Student Researchers: ${proj.teamMembers || 'Candidate Team'}`,
            `Faculty Research Supervisor: ${proj.guideName || 'Dr. S. Karthik'} (${proj.guideEmail || 'karthik@vsb.edu.in'})`,
            `Technical Stack: ${proj.technologies || 'Python, PyTorch, React, FastAPI'}`,
            `Benchmark Results: ${proj.results || '98.4% Accuracy, 12ms Inference Latency'}`,
            `GitHub Repository: ${links.githubUrl || 'Available on Department GitHub'}`,
            `Live Demo / Deployment: ${links.liveUrl || 'Available in lab'}`,
            `Problem Statement: ${proj.problemStatement || proj.description || 'Modern deep learning architecture for production environments.'}`,
            `Proposed Solution: ${proj.proposedSolution || 'End-to-end model pipeline with quantization and edge deployment.'}`,
          ],
        },
        {
          heading: '2. DAILY PROJECT WORK LOGS & FACULTY GUIDANCE HISTORY',
          body: updates.map(
            (u, idx) =>
              `[Update #${idx + 1} - ${u.date}] Contributor: ${u.postedBy} (${u.progressPercentage || 70}% Complete)\n• Completed: ${u.taskCompleted}\n• Blockers: ${u.blockers || 'None'}\n• Next Target: ${u.nextTarget || 'Sprint tasks'}\n• Faculty Guidance: ${u.facultyFeedback || 'Reviewed by supervisor'}\n• Status: ${u.facultyStatus || 'Verified'}`
          ),
        },
      ],
      fileName: `Reference_Dossier_${proj.title.slice(0, 20).replace(/\s+/g, '_')}_2026`,
    })
  }

  const handleAddSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter project title')
      return
    }

    const finalDomain = effectiveDomain
    const combinedDocs = formatProjectLinks(formData.githubUrl, formData.liveUrl)

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description,
          problemStatement: formData.problemStatement,
          proposedSolution: formData.proposedSolution,
          technologies: formData.technologies,
          dataset: formData.dataset,
          results: formData.results,
          futureScope: formData.futureScope,
          documentation: combinedDocs,
          domain: finalDomain,
          year: Number(formData.year),
          semester: Number(formData.semester),
          batch: formData.batch,
          guideName: formData.guideName,
          guideEmail: formData.guideEmail,
          teamMembers: formData.teamMembers,
          status: formData.status,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setProjects([result.project, ...projects])
        setIsAddModalOpen(false)
        setModalMode('edit')
        toast.success('Project blueprint registered & published to live portal!')
        setFormData({
          title: '',
          description: '',
          problemStatement: '',
          proposedSolution: '',
          technologies: 'Python, PyTorch, YOLOv8, FastAPI, React',
          dataset: 'Custom Annotated Dataset / Kaggle Benchmark',
          results: '98.4% Accuracy, 12ms Real-time Inference',
          futureScope: '',
          githubUrl: 'https://github.com/vsb-aids/capstone-project',
          liveUrl: 'https://project-demo.vsb.edu.in',
          domainSelection: 'Computer Vision & Deep Learning',
          customDomain: '',
          year: 4,
          semester: 8,
          batch: '2022 - 2026',
          guideName: 'Dr. S. Karthik, Associate Professor',
          guideEmail: 'karthik@vsb.edu.in',
          teamMembers: '',
          status: 'Active & Supervised',
        })
      } else {
        toast.error('Failed to create project')
      }
    } catch {
      toast.error('Network error registering project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently remove "${title}"?`)) return
    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setProjects(projects.filter((p) => p.id !== id))
        toast.success('Project deleted.')
      } else {
        toast.error('Could not delete project.')
      }
    } catch {
      toast.error('Network error deleting project.')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Student Reference &amp; Innovation Hub
            </span>
            <span className="text-xs text-gray-300 font-medium">· Technical Blueprints &amp; Daily Progress Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Capstone Projects &amp; Reference Hub</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Technical architecture blueprints for student reference with daily standup logs and faculty guidance tracking across {projects.length} projects.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
          >
            <Download className="w-4 h-4 text-[#F4C430]" />
            Export Reference PDF
          </button>
          <button
            onClick={() => {
              setModalMode('edit')
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#18A0B8] text-[#071A3D] text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#22C7E8]/20"
          >
            <Plus className="w-4 h-4" />
            Publish Project Blueprint
          </button>
        </div>
      </div>

      {/* Year-Wise Tab Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {yearCategories.map((cat) => {
          const isSelected = selectedYear === cat.year
          const count = getYearCount(cat.year)

          return (
            <button
              key={cat.year}
              onClick={() => setSelectedYear(isSelected ? 'ALL' : cat.year)}
              className={cn(
                'p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden',
                isSelected
                  ? 'border-[#1455D9] bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-xs font-black uppercase px-2 py-0.5 rounded-lg',
                      isSelected ? 'bg-[#1455D9] text-white' : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {cat.name}
                  </span>
                  <span className="text-xs font-bold text-gray-500">{count} Projects</span>
                </div>
                <h3 className="font-black text-sm text-[#071A3D] line-clamp-1">{cat.label}</h3>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 font-medium">{cat.sems}</p>
            </button>
          )
        })}
      </div>

      {/* Search & Domain Filter Bar */}
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reference projects, tech stack, datasets, or guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] focus:border-transparent outline-none bg-gray-50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Domain Filter:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-gray-50 text-gray-700 focus:ring-2 focus:ring-[#1455D9] outline-none"
            >
              <option value="ALL">All AI Domains ({projects.length})</option>
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="font-bold text-gray-700">No Reference Projects Found</p>
            <p className="text-xs text-gray-400 mt-1">Try resetting your year or domain filter.</p>
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const updatesCount = (proj.dailyUpdates || parseDailyUpdates(proj.futureScope)).length
            const links = extractProjectLinks(proj.documentation)

            return (
              <Card
                key={proj.id}
                className="rounded-3xl border border-gray-200 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden flex flex-col justify-between group"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#1455D9]">
                        Year {proj.year} · Sem {proj.semester || proj.year * 2}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {proj.batch || '2022 - 2026'}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {updatesCount} Daily Logs
                    </span>
                  </div>

                  {/* Title & Domain */}
                  <div>
                    <h3 className="font-black text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-blue-600 font-bold mt-1 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" />
                      {proj.domain || 'Applied Artificial Intelligence'}
                    </p>
                  </div>

                  {/* Summary / Problem Statement Snippet for Student Reference */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {proj.problemStatement || proj.description || 'Comprehensive undergraduate research blueprint available for student reference.'}
                  </p>

                  {/* Team & Guide Info Card */}
                  <div className="bg-gray-50 rounded-2xl p-3 text-xs space-y-1.5 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-bold text-gray-800 truncate">
                        {proj.teamMembers || 'B.Tech AI & DS Team'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-[#F4C430] shrink-0" />
                      <span className="text-gray-600 truncate">
                        Faculty Mentor: {proj.guideName || 'Dr. S. Karthik, Associate Professor'}
                      </span>
                    </div>
                  </div>

                  {/* Technical Stack Tags */}
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.split(',').slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                      {proj.technologies.split(',').length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-lg bg-gray-100 text-gray-400 text-[10px] font-bold">
                          +{proj.technologies.split(',').length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenProjectDetails(proj)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#22C7E8]" />
                      Blueprint &amp; Daily Updates
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
                        onClick={() => handleDelete(proj.id, proj.title)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* PROJECT REFERENCE BLUEPRINT & DAILY UPDATES MODAL                         */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-200 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white p-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#22C7E8] text-[#071A3D] text-[10px] font-black uppercase">
                    Student Reference Blueprint
                  </span>
                  <span className="text-xs text-blue-200">
                    Year {selectedProject.year} · Sem {selectedProject.semester || selectedProject.year * 2} ({selectedProject.batch || '2022-2026'})
                  </span>
                </div>
                <h2 className="text-xl font-black text-white leading-snug">{selectedProject.title}</h2>
                <p className="text-xs text-gray-300 mt-1">
                  Faculty Guide: {selectedProject.guideName || 'Dr. S. Karthik'} · Domain: {selectedProject.domain}
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-gray-200 bg-gray-50/80 px-6 pt-3 gap-2">
              <button
                onClick={() => setActiveTab('specs')}
                className={cn(
                  'px-4 py-2.5 font-black text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5',
                  activeTab === 'specs'
                    ? 'bg-white text-[#1455D9] border-t-2 border-x border-[#1455D9] shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <Code2 className="w-4 h-4" />
                1. Reference Architecture &amp; Specifications
              </button>
              <button
                onClick={() => setActiveTab('daily_updates')}
                className={cn(
                  'px-4 py-2.5 font-black text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5',
                  activeTab === 'daily_updates'
                    ? 'bg-white text-[#1455D9] border-t-2 border-x border-[#1455D9] shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <Clock className="w-4 h-4 text-[#F4C430]" />
                2. Daily Project Updates &amp; Faculty Guidance Feed ({selectedProject.dailyUpdates?.length || 0})
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {activeTab === 'specs' ? (
                /* TAB 1: TECHNICAL REFERENCE FOR STUDENTS */
                <div className="space-y-4">
                  {/* Student Team & Faculty Banner */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black text-blue-900 uppercase">Student Researchers / Authors</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">
                        {selectedProject.teamMembers || 'B.Tech AI & DS Team'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-900 uppercase">Faculty Guide Contact</p>
                      <p className="text-xs text-gray-700 mt-0.5">
                        {selectedProject.guideEmail || 'karthik@vsb.edu.in'}
                      </p>
                    </div>
                  </div>

                  {/* Problem Statement Reference */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#071A3D] uppercase flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                      Research Problem Formulation (Student Reference)
                    </label>
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed font-mono">
                      {selectedProject.problemStatement ||
                        selectedProject.description ||
                        'Developing a robust AI model pipeline to address modern real-time inference constraints with low error rates.'}
                    </div>
                  </div>

                  {/* Proposed Solution & Methodology */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#071A3D] uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F4C430]" />
                      Proposed Solution &amp; Technical Methodology
                    </label>
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed">
                      {selectedProject.proposedSolution ||
                        'Utilizes transfer learning and transformer backbones with quantization for edge deployment on low-power hardware.'}
                    </div>
                  </div>

                  {/* Tech Stack, Dataset & Results Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-[#1455D9] font-black text-[11px] uppercase">
                        <Cpu className="w-3.5 h-3.5" /> Tech Stack
                      </div>
                      <p className="text-xs text-gray-800 font-semibold">
                        {selectedProject.technologies || 'PyTorch, Python, React, FastAPI'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-black text-[11px] uppercase">
                        <Database className="w-3.5 h-3.5" /> Benchmark Dataset
                      </div>
                      <p className="text-xs text-gray-800 font-semibold">
                        {selectedProject.dataset || 'Curated Multi-Class Dataset (10k+ Samples)'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-700 font-black text-[11px] uppercase">
                        <TrendingUp className="w-3.5 h-3.5" /> Empirical Results
                      </div>
                      <p className="text-xs text-gray-800 font-semibold">
                        {selectedProject.results || '98.4% Accuracy, 12ms Latency'}
                      </p>
                    </div>
                  </div>

                  {/* Links & Repositories Card */}
                  {(() => {
                    const links = extractProjectLinks(selectedProject.documentation)
                    return (
                      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-[#22C7E8]">Source Code &amp; Live Deployment</p>
                          <p className="text-xs text-gray-300 truncate font-mono">
                            {links.githubUrl || links.liveUrl || 'Available on Department GitHub'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {links.liveUrl && (
                            <a
                              href={links.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl text-xs font-black transition flex items-center gap-1.5"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              Launch Live App
                            </a>
                          )}
                          {links.githubUrl && (
                            <a
                              href={links.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-[#22C7E8] hover:bg-[#18A0B8] text-[#071A3D] rounded-xl text-xs font-black transition flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              GitHub Repo
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                /* TAB 2: DAILY PROJECT UPDATES & FACULTY GUIDANCE FEED */
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                    <div>
                      <h4 className="font-black text-sm text-[#071A3D] flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#1455D9]" />
                        Daily Standup &amp; Progress Work Logs
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Students submit daily progress logs; faculty guides review, unblock, and provide continuous mentorship.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowLogForm(!showLogForm)}
                      className="px-3.5 py-1.5 bg-[#1455D9] hover:bg-[#0A2A5E] text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-blue-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {showLogForm ? 'Cancel Update Form' : '+ Post Daily Work Log'}
                    </button>
                  </div>

                  {/* Form to Post New Daily Log */}
                  {showLogForm && (
                    <form onSubmit={handleAddDailyUpdate} className="p-4 rounded-2xl border-2 border-blue-200 bg-white space-y-3 animate-scale-up">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h5 className="font-black text-xs text-[#071A3D] uppercase flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#F4C430]" />
                          Submit Today&apos;s Work Log
                        </h5>
                        <span className="text-[10px] font-bold text-gray-400">{new Date().toISOString().split('T')[0]}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Student Contributor Name</label>
                          <input
                            type="text"
                            value={newLogData.postedBy}
                            onChange={(e) => setNewLogData({ ...newLogData, postedBy: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Overall Progress Percentage (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newLogData.progressPercentage}
                            onChange={(e) => setNewLogData({ ...newLogData, progressPercentage: Number(e.target.value) })}
                            className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1 text-xs">
                          Tasks Completed Today <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          placeholder="e.g. Optimized model weights, trained epoch 40-50, integrated WebSocket streaming..."
                          value={newLogData.taskCompleted}
                          onChange={(e) => setNewLogData({ ...newLogData, taskCompleted: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Challenges / Blockers Faced</label>
                          <input
                            type="text"
                            placeholder="e.g. Memory leak during inference on GPU..."
                            value={newLogData.blockers}
                            onChange={(e) => setNewLogData({ ...newLogData, blockers: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Next Day Target Plan</label>
                          <input
                            type="text"
                            placeholder="e.g. Build Docker container and deploy API..."
                            value={newLogData.nextTarget}
                            onChange={(e) => setNewLogData({ ...newLogData, nextTarget: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1 text-xs">GitHub Commit / Pull Request Link</label>
                        <input
                          type="url"
                          placeholder="https://github.com/vsb-aids/capstone-project/commit/..."
                          value={newLogData.commitUrl}
                          onChange={(e) => setNewLogData({ ...newLogData, commitUrl: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <button
                          type="button"
                          onClick={() => setShowLogForm(false)}
                          className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Work Log
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Daily Updates */}
                  <div className="space-y-4">
                    {(selectedProject.dailyUpdates || parseDailyUpdates(selectedProject.futureScope)).length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-xs font-bold text-gray-600">No Daily Updates Posted Yet</p>
                        <p className="text-[11px] text-gray-400 mt-1">Students can post daily sprint logs using the button above.</p>
                      </div>
                    ) : (
                      (selectedProject.dailyUpdates || parseDailyUpdates(selectedProject.futureScope)).map((log, idx) => (
                        <div key={log.id || idx} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3 hover:border-blue-300 transition-all shadow-xs">
                          {/* Log Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-[#1455D9] text-[10px] font-black uppercase">
                                Update #{idx + 1}
                              </span>
                              <span className="text-xs font-bold text-gray-800">{log.postedBy}</span>
                              <span className="text-[11px] text-gray-400">· {log.date}</span>
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

                          {/* Completed Tasks */}
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Tasks Completed</p>
                            <p className="text-xs text-gray-800 leading-relaxed font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                              {log.taskCompleted}
                            </p>
                          </div>

                          {/* Blockers & Next Target Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                              <span className="text-[10px] font-black text-red-600 uppercase block">Blockers / Challenges</span>
                              <p className="text-gray-700 mt-0.5 text-[11px]">{log.blockers || 'None reported'}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                              <span className="text-[10px] font-black text-blue-600 uppercase block">Next Target</span>
                              <p className="text-gray-700 mt-0.5 text-[11px]">{log.nextTarget || 'Continue sprint targets'}</p>
                            </div>
                          </div>

                          {/* Commit Link */}
                          {log.commitUrl && (
                            <div className="flex items-center gap-2 text-xs">
                              <GitCommit className="w-3.5 h-3.5 text-gray-400" />
                              <a
                                href={log.commitUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-mono text-[11px] truncate max-w-sm"
                              >
                                {log.commitUrl}
                              </a>
                            </div>
                          )}

                          {/* Faculty Guidance Remarks */}
                          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-amber-900 uppercase flex items-center gap-1">
                                <Award className="w-3 h-3 text-[#F4C430]" />
                                Faculty Guidance &amp; Mentorship Note
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedLogIdForFeedback(selectedLogIdForFeedback === log.id ? null : log.id)
                                  setFacultyFeedbackText(log.facultyFeedback || '')
                                }}
                                className="text-[10px] font-bold text-[#1455D9] hover:underline cursor-pointer"
                              >
                                {selectedLogIdForFeedback === log.id ? 'Close' : 'Add / Edit Guidance'}
                              </button>
                            </div>
                            <p className="text-xs text-amber-950 italic">
                              &ldquo;{log.facultyFeedback || 'Good momentum. Keep testing on real edge data.'}&rdquo;
                            </p>
                          </div>

                          {/* Faculty Feedback Input Box */}
                          {selectedLogIdForFeedback === log.id && (
                            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-2 animate-scale-up">
                              <label className="text-[11px] font-black text-[#071A3D] block">
                                Enter Faculty Guidance for this Update:
                              </label>
                              <textarea
                                rows={2}
                                value={facultyFeedbackText}
                                onChange={(e) => setFacultyFeedbackText(e.target.value)}
                                placeholder="Write advice, technical suggestions, or next steps for the team..."
                                className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#1455D9] outline-none"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveFacultyFeedback(log.id)}
                                  className="px-3 py-1 bg-[#1455D9] hover:bg-[#0A2A5E] text-white rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Save &amp; Verify Log
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                onClick={() => handleDownloadReferenceDossier(selectedProject)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#1455D9]" />
                Download Reference Dossier &amp; Logs PDF
              </button>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TWO-STEP REGISTER PROJECT BLUEPRINT MODAL WITH PREVIEW & SUBMIT           */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-200 my-8">
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-6 flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#22C7E8] text-[#071A3D] text-[10px] font-black uppercase">
                  Project Blueprint Registry
                </span>
                <h2 className="text-xl font-black mt-1">
                  {modalMode === 'edit' ? 'Publish Project Reference Blueprint' : 'Preview & Confirm Reference Blueprint'}
                </h2>
                <p className="text-xs text-gray-300 mt-0.5">
                  {modalMode === 'edit'
                    ? 'Publish technical blueprints, datasets, and architecture details for student learning & guidance.'
                    : 'Verify reference blueprint details before committing to the institutional database.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'edit' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!formData.title.trim()) {
                    toast.error('Project title is required')
                    return
                  }
                  if (formData.domainSelection === 'Custom Domain / Other' && !formData.customDomain.trim()) {
                    toast.error('Please type your custom domain name')
                    return
                  }
                  setModalMode('preview')
                }}
                className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
              >
                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Real-Time Autonomous Edge AI for Healthcare Diagnostics"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                  />
                </div>

                {/* Academic Year & Domain */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Academic Year</label>
                    <select
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          year: Number(e.target.value),
                          semester: Number(e.target.value) * 2,
                          batch:
                            Number(e.target.value) === 1
                              ? '2025 - 2029'
                              : Number(e.target.value) === 2
                              ? '2024 - 2028'
                              : Number(e.target.value) === 3
                              ? '2023 - 2027'
                              : '2022 - 2026',
                        })
                      }
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                    >
                      <option value={1}>Year 1 (Mini Projects / Sem 1-2)</option>
                      <option value={2}>Year 2 (Design Prototypes / Sem 3-4)</option>
                      <option value={3}>Year 3 (Applied R&amp;D / Sem 5-6)</option>
                      <option value={4}>Year 4 (Final Capstone / Sem 7-8)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Research Domain</label>
                    <select
                      value={formData.domainSelection}
                      onChange={(e) => setFormData({ ...formData, domainSelection: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                    >
                      {PRESET_DOMAINS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Domain Input when "Custom Domain / Other" is selected */}
                {formData.domainSelection === 'Custom Domain / Other' && (
                  <div className="animate-scale-up p-3 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                    <label className="text-xs font-bold text-blue-900 block">
                      Enter Custom Research Domain Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Quantum Computing & Neural Cryptography, Brain-Computer Interfaces..."
                      value={formData.customDomain}
                      onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                      className="w-full p-2.5 border border-blue-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                )}

                {/* Problem Statement */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Problem Statement (Reference)</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the research problem and motivation..."
                    value={formData.problemStatement}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                  />
                </div>

                {/* Proposed Solution & Tech Stack */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Proposed Solution</label>
                    <textarea
                      rows={2}
                      placeholder="Proposed algorithm & architecture..."
                      value={formData.proposedSolution}
                      onChange={(e) => setFormData({ ...formData, proposedSolution: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Tech Stack (comma-separated)</label>
                    <textarea
                      rows={2}
                      placeholder="Python, PyTorch, React, OpenCV"
                      value={formData.technologies}
                      onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                </div>

                {/* Dataset & Results */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Benchmark Dataset</label>
                    <input
                      type="text"
                      placeholder="e.g. ChestX-ray14 / Custom Annotated (5k samples)"
                      value={formData.dataset}
                      onChange={(e) => setFormData({ ...formData, dataset: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Empirical Benchmark Results</label>
                    <input
                      type="text"
                      placeholder="e.g. 98.4% Accuracy, 12ms Inference Latency"
                      value={formData.results}
                      onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                </div>

                {/* Team Members & Guide */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Student Team Members</label>
                    <input
                      type="text"
                      placeholder="e.g. K. Aishwarya (23AD001), R. Deepak (23AD002)"
                      value={formData.teamMembers}
                      onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Faculty Research Supervisor</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. S. Karthik, Associate Professor"
                      value={formData.guideName}
                      onChange={(e) => setFormData({ ...formData, guideName: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                </div>

                {/* GitHub Repo Link & Live Demo URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5 text-gray-500" />
                      GitHub / Code Repository URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/vsb-aids/capstone-project"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-emerald-700 block mb-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      Project Live Demo / Production URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://my-app.vercel.app or https://huggingface.co/..."
                      value={formData.liveUrl}
                      onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                      className="w-full p-2.5 border border-emerald-200 bg-emerald-50/30 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
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
                      Year {formData.year} · Sem {formData.semester} ({formData.batch})
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
                    onClick={() => setModalMode('edit')}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    ← Back to Edit
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleAddSubmit()}
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
