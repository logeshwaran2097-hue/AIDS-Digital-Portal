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
  Scale,
  FileText,
  ExternalLink,
  Code2,
  Database,
  Cpu,
  TrendingUp,
  Check,
  Send,
  AlertCircle,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

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
  review0Marks?: number
  review1Marks?: number
  review2Marks?: number
  review3Marks?: number
  totalScore?: number
  evaluatorRemarks?: string | null
  evaluatorDecision?: string | null
  evaluatedByName?: string | null
}

export const DOMAINS_LIST = [
  'Computer Vision & Deep Learning',
  'Large Language Models & GenAI',
  'Healthcare & Biomedical AI',
  'Robotics & Autonomous Edge AI',
  'NLP & Speech Intelligence',
  'Blockchain & Secure AI Systems',
  'FinTech & Predictive AI',
  'IoT & Smart Cyber-Physical AI',
]

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
              status: p.status || 'Approved & Active',
              guideName: p.guideName,
              guideEmail: p.guideEmail,
              teamMembers: p.teamMembers,
              review0Marks: p.review0Marks,
              review1Marks: p.review1Marks,
              review2Marks: p.review2Marks,
              review3Marks: p.review3Marks,
              totalScore: p.totalScore,
              evaluatorRemarks: p.evaluatorRemarks,
              evaluatorDecision: p.evaluatorDecision,
              evaluatedByName: p.evaluatedByName,
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
  const [isEvaluatorModalOpen, setIsEvaluatorModalOpen] = useState(false)
  const [evaluatorTab, setEvaluatorTab] = useState<'specs' | 'rubrics'>('specs')

  // Evaluator Scorecard State
  const [evalScores, setEvalScores] = useState({
    review0: 18,
    review1: 23,
    review2: 24,
    review3: 28,
    decision: 'Approved with Distinction (Grade O / 90+)',
    remarks: 'Outstanding implementation of deep learning pipeline with verifiable benchmark accuracy and edge deployment.',
    evaluatorName: 'Dr. V. Sundar, Head of Department',
  })

  // Add Project Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    proposedSolution: '',
    technologies: 'Python, PyTorch, YOLOv8, FastAPI, React',
    dataset: 'Custom Annotated Dataset / Kaggle Benchmark',
    results: '98.4% Accuracy, 12ms Real-time Inference',
    futureScope: 'Edge hardware deployment on NVIDIA Jetson & IEEE Conference publication',
    documentation: 'https://github.com/vsb-aids/capstone-project',
    domain: 'Computer Vision & Deep Learning',
    year: 4,
    semester: 8,
    batch: '2022 - 2026',
    guideName: 'Dr. S. Karthik, Associate Professor',
    guideEmail: 'karthik@vsb.edu.in',
    teamMembers: '',
    status: 'Approved & Active',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    return dList.length > 0 ? dList : DOMAINS_LIST
  }, [projects])

  // Open Evaluator Inspection Modal
  const handleOpenEvaluator = (proj: ProjectRecord) => {
    setSelectedProject(proj)
    setEvaluatorTab('specs')
    setEvalScores({
      review0: proj.review0Marks ?? 18,
      review1: proj.review1Marks ?? 23,
      review2: proj.review2Marks ?? 24,
      review3: proj.review3Marks ?? 28,
      decision: proj.evaluatorDecision || 'Approved with Distinction (Grade O / 90+)',
      remarks: proj.evaluatorRemarks || 'Implementation verified against institutional benchmarks.',
      evaluatorName: proj.evaluatedByName || 'Dr. V. Sundar, Head of Department',
    })
    setIsEvaluatorModalOpen(true)
  }

  // Save Evaluator Score
  const handleSaveEvaluation = async () => {
    if (!selectedProject) return
    const total = evalScores.review0 + evalScores.review1 + evalScores.review2 + evalScores.review3

    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedProject.id,
          status: `Evaluated · ${evalScores.decision.split('(')[0].trim()} (${total}/100)`,
          review0Marks: evalScores.review0,
          review1Marks: evalScores.review1,
          review2Marks: evalScores.review2,
          review3Marks: evalScores.review3,
          totalScore: total,
          evaluatorRemarks: evalScores.remarks,
          evaluatorDecision: evalScores.decision,
          evaluatedByName: evalScores.evaluatorName,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProject.id
              ? {
                  ...p,
                  status: `Evaluated · ${evalScores.decision.split('(')[0].trim()} (${total}/100)`,
                  review0Marks: evalScores.review0,
                  review1Marks: evalScores.review1,
                  review2Marks: evalScores.review2,
                  review3Marks: evalScores.review3,
                  totalScore: total,
                  evaluatorRemarks: evalScores.remarks,
                  evaluatorDecision: evalScores.decision,
                  evaluatedByName: evalScores.evaluatorName,
                }
              : p
          )
        )
        toast.success(`Evaluation recorded! Final Score: ${total}/100`)
        setIsEvaluatorModalOpen(false)
      } else {
        toast.error('Failed to update evaluation.')
      }
    } catch {
      toast.error('Network error saving evaluation.')
    }
  }

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
              `${idx + 1}. [Year ${p.year || 4}] "${p.title}" — Domain: ${p.domain || 'Applied AI'} | Guide: ${p.guideName || 'Faculty Guide'} | Team: ${p.teamMembers || 'Student Cohort'} | Status: ${p.status}`
          ),
        },
      ],
      fileName: `VSB_AI_DS_Projects_${selectedYear === 'ALL' ? 'All_Years' : `Year_${selectedYear}`}_2026`,
    })
  }

  const handleDownloadEvaluatorSheet = (proj: ProjectRecord) => {
    const total = evalScores.review0 + evalScores.review1 + evalScores.review2 + evalScores.review3
    generateAndDownloadPDF({
      title: 'OFFICIAL PROJECT EVALUATION & RUBRIC SCORECARD',
      subtitle: `Department of Artificial Intelligence & Data Science · Autonomous Examination 2026`,
      author: evalScores.evaluatorName,
      category: `CAPSTONE EVALUATION: ${proj.title.toUpperCase()}`,
      sections: [
        {
          heading: '1. CANDIDATE & ARCHITECTURE DETAILS',
          body: [
            `Project Title: ${proj.title}`,
            `Domain Vertical: ${proj.domain || 'Applied AI / ML'}`,
            `Academic Cadre: Year ${proj.year || 4} (Semester ${proj.semester || (proj.year || 4) * 2}) | Batch: ${proj.batch || '2022-2026'}`,
            `Student Researchers: ${proj.teamMembers || 'Candidate Team'}`,
            `Faculty Supervisor: ${proj.guideName || 'Dr. S. Karthik'} (${proj.guideEmail || 'karthik@vsb.edu.in'})`,
            `Technical Stack: ${proj.technologies || 'Python, PyTorch, React, FastAPI'}`,
            `Benchmark Results: ${proj.results || '98.4% Accuracy, 12ms Inference Latency'}`,
            `Repository / Codebase: ${proj.documentation || 'Available for Examination Inspection'}`,
          ],
        },
        {
          heading: '2. RUBRIC SCORING BREAKDOWN (100 MARKS TOTAL)',
          body: [
            `Review 0 (Ideation, Literature Review & Problem Formulation - 20 Max): ${evalScores.review0} / 20`,
            `Review 1 (System Architecture, Dataset Pipeline & EDA - 25 Max): ${evalScores.review1} / 25`,
            `Review 2 (Model Training, Optimization & Experimental Metrics - 25 Max): ${evalScores.review2} / 25`,
            `Review 3 / Viva Voce (Hardware/Cloud Deployment & Q&A - 30 Max): ${evalScores.review3} / 30`,
            `--------------------------------------------------`,
            `CUMULATIVE SCORE: ${total} / 100 (${total >= 90 ? 'Grade O' : total >= 80 ? 'Grade A+' : total >= 70 ? 'Grade A' : 'Pass'})`,
            `COMMITTEE VERDICT: ${evalScores.decision}`,
            `EVALUATOR REMARKS: ${evalScores.remarks}`,
          ],
        },
      ],
      fileName: `Evaluator_Report_${proj.title.slice(0, 20).replace(/\s+/g, '_')}_2026`,
    })
  }

  const handleAddSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!formData.title) {
      toast.error('Please enter project title')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: Number(formData.year),
          semester: Number(formData.semester),
        }),
      })
      const result = await res.json()
      if (result.success) {
        setProjects([result.project, ...projects])
        setIsAddModalOpen(false)
        setModalMode('edit')
        toast.success('Project registered & published to live portal!')
        setFormData({
          title: '',
          description: '',
          problemStatement: '',
          proposedSolution: '',
          technologies: 'Python, PyTorch, YOLOv8, FastAPI, React',
          dataset: 'Custom Annotated Dataset / Kaggle Benchmark',
          results: '98.4% Accuracy, 12ms Real-time Inference',
          futureScope: 'Edge hardware deployment on NVIDIA Jetson & IEEE Conference publication',
          documentation: 'https://github.com/vsb-aids/capstone-project',
          domain: 'Computer Vision & Deep Learning',
          year: 4,
          semester: 8,
          batch: '2022 - 2026',
          guideName: 'Dr. S. Karthik, Associate Professor',
          guideEmail: 'karthik@vsb.edu.in',
          teamMembers: '',
          status: 'Approved & Active',
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
              Innovation &amp; R&amp;D Hub
            </span>
            <span className="text-xs text-gray-300 font-medium">· Evaluator &amp; Milestone Inspection Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Capstone Projects &amp; Innovation</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Real-time inspection console for {projects.length} research projects across 4 academic tiers with official rubric scoring.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
          >
            <Download className="w-4 h-4 text-[#F4C430]" />
            Export Directory PDF
          </button>
          <button
            onClick={() => {
              setModalMode('edit')
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#18A0B8] text-[#071A3D] text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#22C7E8]/20"
          >
            <Plus className="w-4 h-4" />
            Register Project Proposal
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
              placeholder="Search by title, team members, supervisor, or domain..."
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
            <p className="font-bold text-gray-700">No Projects Found</p>
            <p className="text-xs text-gray-400 mt-1">Try resetting your year or domain filter.</p>
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const isEvaluated = proj.status.includes('Evaluated')
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
                        Year {proj.year} · Sem {proj.semester || (proj.year * 2)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {proj.batch || '2022 - 2026'}
                      </span>
                    </div>

                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                        isEvaluated
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      )}
                    >
                      {proj.status}
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

                  {/* Summary / Problem Statement Snippet */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {proj.problemStatement || proj.description || 'Comprehensive undergraduate research initiative.'}
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
                        Mentor: {proj.guideName || 'Dr. S. Karthik, Associate Professor'}
                      </span>
                    </div>
                  </div>

                  {/* Technical Tags Snippet */}
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
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEvaluator(proj)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Scale className="w-3.5 h-3.5 text-[#22C7E8]" />
                      Evaluator Inspection
                    </button>

                    <div className="flex items-center gap-1">
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
      {/* EVALUATOR INSPECTION MODAL WITH RUBRIC SCORECARD & TECHNICAL SPECS        */}
      {/* ========================================================================= */}
      {isEvaluatorModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-200 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white p-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#22C7E8] text-[#071A3D] text-[10px] font-black uppercase">
                    Academic Evaluator Console
                  </span>
                  <span className="text-xs text-blue-200">
                    Year {selectedProject.year} · Sem {selectedProject.semester || (selectedProject.year * 2)}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white leading-snug">{selectedProject.title}</h2>
                <p className="text-xs text-gray-300 mt-1">
                  Supervisor: {selectedProject.guideName || 'Dr. S. Karthik'} · Domain: {selectedProject.domain}
                </p>
              </div>
              <button
                onClick={() => setIsEvaluatorModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-gray-200 bg-gray-50/80 px-6 pt-3 gap-2">
              <button
                onClick={() => setEvaluatorTab('specs')}
                className={cn(
                  'px-4 py-2.5 font-black text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5',
                  evaluatorTab === 'specs'
                    ? 'bg-white text-[#1455D9] border-t-2 border-x border-[#1455D9] shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <Code2 className="w-4 h-4" />
                1. Technical Architecture &amp; Artifacts
              </button>
              <button
                onClick={() => setEvaluatorTab('rubrics')}
                className={cn(
                  'px-4 py-2.5 font-black text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5',
                  evaluatorTab === 'rubrics'
                    ? 'bg-white text-[#1455D9] border-t-2 border-x border-[#1455D9] shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <Scale className="w-4 h-4 text-[#F4C430]" />
                2. Milestone Rubrics &amp; Verdict (100 Marks)
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {evaluatorTab === 'specs' ? (
                <div className="space-y-4">
                  {/* Candidate Team Details */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black text-blue-900 uppercase">Student Candidate Team</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">
                        {selectedProject.teamMembers || 'B.Tech AI & DS Team'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-900 uppercase">Guide Contact</p>
                      <p className="text-xs text-gray-700 mt-0.5">
                        {selectedProject.guideEmail || 'karthik@vsb.edu.in'}
                      </p>
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#071A3D] uppercase flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                      Research Problem Statement
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

                  {/* Links & Repository */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#22C7E8]">Source Code &amp; Documentation</p>
                      <p className="text-xs text-gray-300 truncate font-mono mt-0.5">
                        {selectedProject.documentation || 'https://github.com/vsb-aids/capstone-project'}
                      </p>
                    </div>
                    {selectedProject.documentation && (
                      <a
                        href={selectedProject.documentation}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#22C7E8] hover:bg-[#18A0B8] text-[#071A3D] rounded-xl text-xs font-black transition flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Inspect Repo
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                /* RUBRIC SCORING TAB */
                <div className="space-y-5">
                  <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-1">
                    <p className="font-black text-sm text-[#071A3D] flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-amber-700" />
                      Academic Rubric Evaluation Standard (Total: 100 Marks)
                    </p>
                    <p className="text-gray-600">
                      Score candidate milestone deliveries according to autonomous board regulations.
                    </p>
                  </div>

                  {/* 4 Reviews Scoring Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Review 0 */}
                    <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-[#071A3D] uppercase">Review 0: Ideation &amp; Problem</label>
                        <span className="text-xs font-black text-blue-600">Max 20</span>
                      </div>
                      <p className="text-[11px] text-gray-500">Problem clarity, IEEE literature review &amp; scope.</p>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={evalScores.review0}
                        onChange={(e) => setEvalScores({ ...evalScores, review0: Number(e.target.value) })}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-bold bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                      />
                    </div>

                    {/* Review 1 */}
                    <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-[#071A3D] uppercase">Review 1: Architecture &amp; Data</label>
                        <span className="text-xs font-black text-blue-600">Max 25</span>
                      </div>
                      <p className="text-[11px] text-gray-500">Data pipeline, EDA, and technical system design.</p>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={evalScores.review1}
                        onChange={(e) => setEvalScores({ ...evalScores, review1: Number(e.target.value) })}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-bold bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                      />
                    </div>

                    {/* Review 2 */}
                    <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-[#071A3D] uppercase">Review 2: Training &amp; Accuracy</label>
                        <span className="text-xs font-black text-blue-600">Max 25</span>
                      </div>
                      <p className="text-[11px] text-gray-500">Model training, loss curves &amp; validation results.</p>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={evalScores.review2}
                        onChange={(e) => setEvalScores({ ...evalScores, review2: Number(e.target.value) })}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-bold bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                      />
                    </div>

                    {/* Review 3 */}
                    <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-[#071A3D] uppercase">Review 3 / Viva: Deployment</label>
                        <span className="text-xs font-black text-blue-600">Max 30</span>
                      </div>
                      <p className="text-[11px] text-gray-500">Working prototype, UI/Edge deployment &amp; Viva Q&amp;A.</p>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={evalScores.review3}
                        onChange={(e) => setEvalScores({ ...evalScores, review3: Number(e.target.value) })}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-bold bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                      />
                    </div>
                  </div>

                  {/* Total Calculation Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#22C7E8]">Cumulative Rubric Score</p>
                      <p className="text-xs text-gray-200 mt-0.5">Calculated across Review 0 to 3 Milestones</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-[#F4C430]">
                        {evalScores.review0 + evalScores.review1 + evalScores.review2 + evalScores.review3}
                      </span>
                      <span className="text-sm font-bold text-gray-300"> / 100</span>
                    </div>
                  </div>

                  {/* Decision Verdict & Remarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#071A3D] uppercase">Committee Decision Verdict</label>
                      <select
                        value={evalScores.decision}
                        onChange={(e) => setEvalScores({ ...evalScores, decision: e.target.value })}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                      >
                        <option value="Approved with Distinction (Grade O / 90+)">Approved with Distinction (Grade O / 90+)</option>
                        <option value="Approved with Excellence (Grade A+ / 80-89)">Approved with Excellence (Grade A+ / 80-89)</option>
                        <option value="Approved (Grade A / 70-79)">Approved (Grade A / 70-79)</option>
                        <option value="Revision Required (Re-Review within 10 Days)">Revision Required (Re-Review within 10 Days)</option>
                        <option value="Rejected / Resubmit Next Academic Year">Rejected / Resubmit Next Academic Year</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#071A3D] uppercase">Lead Evaluator Authority</label>
                      <input
                        type="text"
                        value={evalScores.evaluatorName}
                        onChange={(e) => setEvalScores({ ...evalScores, evaluatorName: e.target.value })}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#071A3D] uppercase">Evaluator Committee Remarks</label>
                    <textarea
                      rows={2}
                      value={evalScores.remarks}
                      onChange={(e) => setEvalScores({ ...evalScores, remarks: e.target.value })}
                      placeholder="Enter formal academic remarks, patent potential assessment, or improvement feedback..."
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                onClick={() => handleDownloadEvaluatorSheet(selectedProject)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#1455D9]" />
                Download Official Grade Sheet PDF
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEvaluatorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                {evaluatorTab === 'rubrics' && (
                  <button
                    onClick={handleSaveEvaluation}
                    className="px-5 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0A2A5E] text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Save &amp; Certify Evaluation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TWO-STEP REGISTER PROJECT PROPOSAL MODAL WITH PREVIEW & SUBMIT            */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-200 my-8">
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-6 flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#22C7E8] text-[#071A3D] text-[10px] font-black uppercase">
                  Capstone Proposal Registry
                </span>
                <h2 className="text-xl font-black mt-1">
                  {modalMode === 'edit' ? 'Register Project Proposal' : 'Preview & Confirm Project Proposal'}
                </h2>
                <p className="text-xs text-gray-300 mt-0.5">
                  {modalMode === 'edit'
                    ? 'Enter technical architecture details before publishing to students and evaluators.'
                    : 'Verify proposal details before committing to the institutional database.'}
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
                  if (!formData.title) {
                    toast.error('Project title is required')
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
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:ring-2 focus:ring-[#1455D9] outline-none"
                    >
                      {DOMAINS_LIST.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Problem Statement */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Problem Statement</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the research bottleneck and motivation..."
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
                    <label className="text-xs font-bold text-gray-700 block mb-1">Dataset Utilized</label>
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

                {/* GitHub Repo Link */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">GitHub / Documentation URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/vsb-aids/capstone-project"
                    value={formData.documentation}
                    onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9] outline-none"
                  />
                </div>

                {/* Form Buttons */}
                <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1455D9] hover:bg-[#0A2A5E] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Proposal
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
                    <span className="text-xs font-bold text-blue-700">{formData.domain}</span>
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
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Student Team</span>
                    <p className="font-bold text-gray-800 mt-0.5">{formData.teamMembers || 'TBD'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Guide Supervisor</span>
                    <p className="font-bold text-gray-800 mt-0.5">{formData.guideName}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Repo Link</span>
                  <p className="font-mono text-blue-600 truncate mt-0.5">{formData.documentation || 'N/A'}</p>
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
                    {isSubmitting ? 'Publishing...' : 'Confirm & Publish to Live Portal'}
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
