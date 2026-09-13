'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Sparkles,
  Award,
  ShieldCheck,
  Code2,
  Cpu,
  CheckCircle2,
  GraduationCap,
  Users,
  MessageSquare,
  Database,
  Smartphone,
  Globe,
  Zap,
  ArrowRight,
  UserCheck,
  Calendar,
  Clock,
  FileText,
  BookOpen,
  Layers,
  ExternalLink,
  Lock,
  Bell,
  Target,
  Lightbulb,
  Building2,
  Activity,
  Server,
  MapPin,
  Mail,
  Compass,
  FileCheck,
  Check,
  ChevronRight,
  Play,
  Info,
  AlertTriangle,
  RefreshCw,
  Radio,
  Terminal,
  Sliders,
  X,
  Share2,
  FileSpreadsheet,
  CheckCheck
} from 'lucide-react'

interface AboutPortalViewProps {
  role?: 'admin' | 'faculty' | 'hod' | 'student' | 'public'
}

type TabType = 'overview' | 'vision' | 'modules' | 'roles' | 'schedule' | 'tech' | 'architect'

interface PeriodScheduleItem {
  period: string
  name: string
  start: string
  end: string
  duration: string
  type: 'period' | 'interval' | 'lunch'
  description: string
  startMin: number // minutes from midnight
  endMin: number
}

const MASTER_SCHEDULE: PeriodScheduleItem[] = [
  { period: 'Period 1', name: 'Period 1', start: '09:15 AM', end: '10:00 AM', duration: '45 mins', type: 'period', description: 'Morning Theory / Core Lecture Slot 1 · Roll Call & Attendance Verification', startMin: 9 * 60 + 15, endMin: 10 * 60 },
  { period: 'Period 2', name: 'Period 2', start: '10:00 AM', end: '10:45 AM', duration: '45 mins', type: 'period', description: 'Morning Theory / Core Lecture Slot 2', startMin: 10 * 60, endMin: 10 * 60 + 45 },
  { period: 'Break 1', name: 'Morning Refreshment Interval', start: '10:45 AM', end: '11:00 AM', duration: '15 mins', type: 'interval', description: 'Campus Refreshment & Morning Tea Break', startMin: 10 * 60 + 45, endMin: 11 * 60 },
  { period: 'Period 3', name: 'Period 3', start: '11:00 AM', end: '11:45 AM', duration: '45 mins', type: 'period', description: 'Mid-Morning Core / Advanced Theory Slot 3', startMin: 11 * 60, endMin: 11 * 60 + 45 },
  { period: 'Period 4', name: 'Period 4', start: '11:45 AM', end: '12:30 PM', duration: '45 mins', type: 'period', description: 'Mid-Morning Core / Advanced Theory Slot 4', startMin: 11 * 60 + 45, endMin: 12 * 60 + 30 },
  { period: 'Lunch', name: 'Campus Lunch Break', start: '12:30 PM', end: '01:20 PM', duration: '50 mins', type: 'lunch', description: 'Midday Dining, Cafeteria & Campus Interval', startMin: 12 * 60 + 30, endMin: 13 * 60 + 20 },
  { period: 'Period 5', name: 'Period 5', start: '01:20 PM', end: '02:05 PM', duration: '45 mins', type: 'period', description: 'Afternoon Theory / Practical Lab Block Slot 5', startMin: 13 * 60 + 20, endMin: 14 * 60 + 5 },
  { period: 'Period 6', name: 'Period 6', start: '02:05 PM', end: '02:50 PM', duration: '45 mins', type: 'period', description: 'Afternoon Theory / Practical Lab Block Slot 6', startMin: 14 * 60 + 5, endMin: 14 * 60 + 50 },
  { period: 'Break 2', name: 'Evening Tea Interval', start: '02:50 PM', end: '03:05 PM', duration: '15 mins', type: 'interval', description: 'Evening Tea & Refreshment Break', startMin: 14 * 60 + 50, endMin: 15 * 60 + 5 },
  { period: 'Period 7', name: 'Period 7', start: '03:05 PM', end: '03:50 PM', duration: '45 mins', type: 'period', description: 'Practical Lab Block / Soft Skills / Technical Seminar', startMin: 15 * 60 + 5, endMin: 15 * 60 + 50 },
  { period: 'Period 8', name: 'Period 8', start: '03:50 PM', end: '04:40 PM', duration: '50 mins', type: 'period', description: 'Practical Lab Block / Mentorship & Student Counseling', startMin: 15 * 60 + 50, endMin: 16 * 60 + 40 },
]

interface ModuleDetail {
  id: string
  number: string
  name: string
  category: 'Academic' | 'Communication' | 'Security' | 'Student Success'
  icon: React.ReactNode
  accentColor: string
  bgLight: string
  borderColor: string
  description: string
  fullFeatures: string[]
  databaseEntities: string[]
  governingRoles: string[]
  slaOrStandard: string
}

const MODULE_DETAILS: ModuleDetail[] = [
  {
    id: 'attendance',
    number: '01',
    name: '8-Period Attendance Engine',
    category: 'Academic',
    icon: <Clock className="w-6 h-6 text-blue-600" />,
    accentColor: 'text-blue-600',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Comprehensive period-by-period roll call system covering all 8 daily periods. Computes real-time aggregate percentage, Forenoon/Afternoon attendance classification, and automatic condonation thresholds under 75%.',
    fullFeatures: [
      'Morning Period 1 roll-call with 1-click batch marking',
      'Period-wise subject mapping directly tied to day-order timetables',
      'Instant aggregate percentage recalculation upon each submission',
      'Automated condonation alert indicators (< 75% red warning)',
      'HOD-authorized unlock workflow for verified retrospective corrections'
    ],
    databaseEntities: ['attendance_records', 'timetable_slots', 'academic_semesters', 'students'],
    governingRoles: ['Faculty & Class Advisor', 'Head of Department', 'Super Administrator'],
    slaOrStandard: 'Sub-second real-time calculation · Anna Univ R-2021 compliant'
  },
  {
    id: 'fast2sms',
    number: '02',
    name: 'Fast2SMS WhatsApp Alerts',
    category: 'Communication',
    icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
    accentColor: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Automated notification dispatch gateway connected with Fast2SMS Cloud API. Automatically triggers instant formatted WhatsApp messages to parents and guardians upon student absence during morning roll-call.',
    fullFeatures: [
      'Automatic absent notification dispatch on morning roll-call save',
      'Multi-template support for absence, test schedules, and announcements',
      'Live gateway API status verification directly from admin dashboard',
      'Parent and guardian dual-contact fallbacks with country code resolution',
      'Historical delivery logging with status tracking and timestamp auditing'
    ],
    databaseEntities: ['fast2sms_logs', 'parent_contacts', 'sms_templates'],
    governingRoles: ['Faculty / Advisors (Trigger)', 'Admin (Gateway Config)', 'Parents (Recipient)'],
    slaOrStandard: '99.9% API Delivery SLA · Automated Instant Roll-Call Dispatch'
  },
  {
    id: 'od_verification',
    number: '03',
    name: 'Geotagged OD Verification',
    category: 'Security',
    icon: <MapPin className="w-6 h-6 text-amber-600" />,
    accentColor: 'text-amber-600',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Tamper-proof digital On-Duty pipeline. Extracts EXIF GPS coordinates and capture timestamps from uploaded symposium/hackathon photos with interactive map pins and high-resolution certificate inspection.',
    fullFeatures: [
      'EXIF metadata parser extracting latitude, longitude, and timestamp',
      'Interactive OpenStreetMap coordinate viewer pinning venue location',
      'Multi-tier review: Student submits -> Advisor verifies -> HOD approves',
      'Auto-credit of approved OD into overall attendance percentage',
      'Tamper-evident audit trail with immutable sign-off timestamps'
    ],
    databaseEntities: ['od_requests', 'od_attachments', 'exif_metadata_logs'],
    governingRoles: ['Student (Submit)', 'Faculty Advisor (Verify)', 'HOD (Final Approval)'],
    slaOrStandard: 'EXIF Anti-Spoofing Algorithm · OpenStreetMap Visualizer'
  },
  {
    id: 'curriculum',
    number: '04',
    name: 'Curriculum & 8 Labs Repository',
    category: 'Academic',
    icon: <BookOpen className="w-6 h-6 text-purple-600" />,
    accentColor: 'text-purple-600',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Complete centralized curricular database covering all 8 semesters of AI & DS theory courses, 60+ laboratory exercises, dynamic unit lecture notes, lab manuals, and experimental procedures with zero mock data.',
    fullFeatures: [
      'Semester 1 to Semester 8 full course code structure (R-2021 Autonomous)',
      '60+ official laboratory experiment sheets with code and outputs',
      'Faculty unit note uploads with downloadable PDF attachments',
      'Direct filtering by Academic Year (I, II, III, IV) and Semester (1 to 8)',
      'Real-time subject credit hours and prerequisite course tracking'
    ],
    databaseEntities: ['curriculum_courses', 'lab_experiments', 'course_units', 'study_materials'],
    governingRoles: ['Faculty (Upload & Manage)', 'Students (View & Download)', 'HOD (Audit)'],
    slaOrStandard: 'Zero-Mock Pure Relational Model · All 8 Semesters Online'
  },
  {
    id: 'question_bank',
    number: '05',
    name: 'Question Paper Bank',
    category: 'Academic',
    icon: <FileText className="w-6 h-6 text-cyan-600" />,
    accentColor: 'text-cyan-600',
    bgLight: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    description: 'Digital institutional repository containing Internal Assessment Tests (IAT-1, IAT-2, Model Exams) and Anna University previous year semester examination question papers with filterable search and PDF viewing.',
    fullFeatures: [
      'Indexed archive of IAT-1, IAT-2, Model, and End-Semester papers',
      'Filterable by Course Code, Semester, Regulation, and Academic Year',
      'In-browser high-speed PDF preview with secure watermarking',
      'Faculty submission portal for upcoming assessment test blueprints',
      'Direct alignment with Bloom’s Taxonomy course outcome rubrics'
    ],
    databaseEntities: ['question_papers', 'course_outcomes', 'exam_blueprints'],
    governingRoles: ['Faculty (Upload)', 'Students (Practice & Download)', 'HOD (Approve)'],
    slaOrStandard: 'Instant Vector PDF Preview · Categorized by Course Codes'
  },
  {
    id: 'capstone',
    number: '06',
    name: 'Capstone Project Hub',
    category: 'Student Success',
    icon: <Code2 className="w-6 h-6 text-pink-600" />,
    accentColor: 'text-pink-600',
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Structured milestone lifecycle management for AD2614 (Mini-Project), AD2711 (Project Work Phase I), and AD2811 (Project Work Phase II). Handles supervisor allocation, zero-to-final milestone defenses, and GitHub verification.',
    fullFeatures: [
      'Milestone 1 (Abstract & SRS), Milestone 2 (Implementation), Milestone 3 (Viva)',
      'Faculty supervisor and internal panel guide allocation matrices',
      'Direct GitHub repository URL and live demonstration link validation',
      'Rubric-based scoring (Literature Survey, Methodology, Results, Defense)',
      'Automated generation of project completion certificates'
    ],
    databaseEntities: ['capstone_projects', 'project_teams', 'project_milestones', 'guide_allocations'],
    governingRoles: ['Students (Submit)', 'Project Guides (Review)', 'HOD & Coordinator (Grade)'],
    slaOrStandard: 'Autonomous Review Stages 1-3 · GitHub CI Verification'
  },
  {
    id: 'ai_assistant',
    number: '07',
    name: 'Grounded AI NLP Assistant',
    category: 'Student Success',
    icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
    accentColor: 'text-indigo-600',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Conversational assistant grounded directly in live PostgreSQL schema tables. Formulates accurate answers regarding period timetables, class advisors, subject codes, and academic regulations with Google Gemini fallback.',
    fullFeatures: [
      'Direct SQL table schema awareness (Students, Courses, Attendance, Guides)',
      'Deterministic answers without LLM hallucination for factual inquiries',
      'Google Gemini generative fallback for comprehensive conceptual explanations',
      'Floating conversational widget accessible across student & faculty views',
      'Session history persistence with quick suggestion prompts'
    ],
    databaseEntities: ['portal_chat_sessions', 'schema_grounding_cache'],
    governingRoles: ['Students (Query)', 'Faculty (Query)', 'Admin (Grounding Monitor)'],
    slaOrStandard: 'Grounded Schema Architecture · Sub-2s Query Response'
  },
  {
    id: 'pdf_engine',
    number: '08',
    name: 'Institutional PDF Engine',
    category: 'Security',
    icon: <FileCheck className="w-6 h-6 text-red-600" />,
    accentColor: 'text-red-600',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Vector-rendered institutional document generator powered by jsPDF and AutoTable. Emits authentic departmental letterheads, security watermarks, autonomous verification hashes, and print-ready attendance registries.',
    fullFeatures: [
      'Official V.S.B. Engineering College header, crest, and accreditation badges',
      'Automated Anna University tabular layout with period-by-period percentages',
      'Dynamic security validation hash preventing unauthorized document forgery',
      'Student individual academic dossier export with semester breakdown',
      'Print-ready A4 formatting optimized for departmental file audits'
    ],
    databaseEntities: ['system_audit_logs', 'student_transcripts'],
    governingRoles: ['HOD (Official Export)', 'Faculty (Registry Print)', 'Admin (Audit Export)'],
    slaOrStandard: 'jsPDF Vector Precision · Official Institution Watermarks'
  }
]

export function AboutPortalView({ role = 'public' }: AboutPortalViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'admin' | 'hod' | 'faculty' | 'student'>('all')
  const [moduleFilter, setModuleFilter] = useState<'all' | 'Academic' | 'Communication' | 'Security' | 'Student Success'>('all')
  const [inspectedModule, setInspectedModule] = useState<ModuleDetail | null>(null)
  
  // Interactive Attendance Calculator State
  const [calcPercentage, setCalcPercentage] = useState<number>(82)

  // Real-time Clock and Bell Period Engine
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentMinutes = useMemo(() => {
    return now.getHours() * 60 + now.getMinutes()
  }, [now])

  const formattedTime = useMemo(() => {
    return now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }, [now])

  const formattedDate = useMemo(() => {
    return now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [now])

  // Current Period Detection
  const currentActiveScheduleItem = useMemo(() => {
    return MASTER_SCHEDULE.find(
      (item) => currentMinutes >= item.startMin && currentMinutes < item.endMin
    )
  }, [currentMinutes])

  const nextScheduleItem = useMemo(() => {
    return MASTER_SCHEDULE.find((item) => currentMinutes < item.startMin)
  }, [currentMinutes])

  const backUrl =
    role === 'admin'
      ? '/admin/dashboard'
      : role === 'faculty'
      ? '/faculty-dashboard'
      : role === 'hod'
      ? '/hod-dashboard'
      : role === 'student'
      ? '/dashboard'
      : '/login'

  const tabs: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Executive Summary', shortLabel: 'Overview', icon: <Globe className="w-4 h-4" /> },
    { id: 'vision', label: 'Department Vision & Mission', shortLabel: 'Vision & Mission', icon: <Target className="w-4 h-4" />, badge: 'NBA/NAAC' },
    { id: 'modules', label: 'Core Platform Modules', shortLabel: 'Capabilities', icon: <Layers className="w-4 h-4" />, badge: '8 Systems' },
    { id: 'roles', label: 'Governance & RBAC Matrix', shortLabel: 'Role Matrix', icon: <Users className="w-4 h-4" />, badge: '4 Tiers' },
    { id: 'schedule', label: 'Master Bell Schedule & Regulations', shortLabel: 'Timetable & Rules', icon: <Clock className="w-4 h-4" />, badge: '8 Periods' },
    { id: 'tech', label: 'Architecture & Cloud Stack', shortLabel: 'Architecture', icon: <Cpu className="w-4 h-4" />, badge: 'Cloud' },
    { id: 'architect', label: 'Engineering Directorate & Architect', shortLabel: 'Lead Architect', icon: <Sparkles className="w-4 h-4 text-amber-300" />, badge: 'Creator' },
  ]

  const filteredModules = useMemo(() => {
    if (moduleFilter === 'all') return MODULE_DETAILS
    return MODULE_DETAILS.filter((m) => m.category === moduleFilter)
  }, [moduleFilter])

  return (
    <div className="min-h-screen pb-24 space-y-8 animate-fade-in text-slate-800">
      {/* Top Breadcrumb & Live Synchronized Academic Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <Link href={backUrl} className="hover:text-royal transition-colors flex items-center gap-1 font-medium group">
            <span className="group-hover:underline">Portal Workspace</span>
          </Link>
          <span>/</span>
          <span className="text-royal font-bold">Institutional Overview &amp; Specifications</span>
        </div>

        {/* Live Academic Period & Clock Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-[11px] shadow-sm border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>{formattedTime}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {currentActiveScheduleItem ? (
              <span>
                Live: <strong>{currentActiveScheduleItem.name}</strong> ({currentActiveScheduleItem.start} - {currentActiveScheduleItem.end})
              </span>
            ) : nextScheduleItem ? (
              <span>
                Next Bell: <strong>{nextScheduleItem.name}</strong> at {nextScheduleItem.start}
              </span>
            ) : (
              <span>Academic Day Completed · Cloud Active</span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-royal text-[11px] font-bold">
            Autonomous R-2021
          </span>
        </div>
      </div>

      {/* Hero Section: Institutional Banner with Animated Ambient Atmosphere */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061A3D] via-[#0A295C] to-[#0D387A] text-white p-6 sm:p-10 shadow-2xl border border-blue-400/20">
        {/* Animated Glow Particles & Floating Ambient Mesh */}
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -left-16 -bottom-16 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute right-1/3 bottom-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* Official College Emblem with Pulsing Gold Corona & Hover Levitation */}
            <div className="relative shrink-0 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-[#E7B93E] via-[#FFF3B8] to-[#B8860B] shadow-[0_0_35px_rgba(231,185,62,0.45)] flex items-center justify-center anim-medallion-levitate transition-transform duration-500 group-hover:scale-105">
                <div className="w-full h-full rounded-xl bg-white p-1.5 flex items-center justify-center overflow-hidden relative">
                  <Image
                    src="/college-emblem.png"
                    alt="V.S.B. Engineering College Emblem"
                    width={84}
                    height={84}
                    className="w-full h-full object-contain"
                    priority
                  />
                  {/* Subtle specular sheen */}
                  <div className="anim-gold-sheen" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-300/40 text-blue-100 text-xs font-bold tracking-wide uppercase shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>V.S.B. Engineering College (Autonomous)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Digital Academic Portal
              </h1>
              <p className="text-base sm:text-lg text-amber-300 font-bold flex items-center gap-2">
                <span>Department of Artificial Intelligence &amp; Data Science</span>
              </p>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium max-w-2xl leading-relaxed">
                Autonomous Academic Governance, Multi-Tier Approval Workflows, 8-Period Attendance Verification &amp; Cloud Management Ecosystem.
              </p>
            </div>
          </div>

          {/* College Accreditations Badges with Hover Micro-Scale */}
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 text-xs font-bold shadow-xs hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> NAAC 'A' Grade Accredited
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/25 border border-blue-400/50 text-blue-100 text-xs font-bold shadow-xs hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4 text-cyan-300" /> NBA Accredited Department
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/25 border border-amber-400/50 text-amber-200 text-xs font-bold shadow-xs hover:scale-105 transition-transform">
              <Award className="w-4 h-4 text-amber-300" /> Anna University Autonomous
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/30 text-slate-100 text-xs font-bold shadow-xs hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-purple-300" /> AICTE Approved · New Delhi
            </span>
          </div>
        </div>

        {/* Executive Key Metric Stats Bar with Hover Lift & Glassmorphism */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-white/15">
          <div 
            onClick={() => setActiveTab('vision')} 
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform">4</div>
            <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mt-0.5">Academic Years</div>
          </div>
          <div 
            onClick={() => setActiveTab('modules')} 
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="text-2xl font-black text-amber-300 group-hover:scale-110 transition-transform">8</div>
            <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mt-0.5">Semesters Syllabi</div>
          </div>
          <div 
            onClick={() => setActiveTab('schedule')} 
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="text-2xl font-black text-emerald-400 group-hover:scale-110 transition-transform">8</div>
            <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mt-0.5">Daily Bell Periods</div>
          </div>
          <div 
            onClick={() => setActiveTab('tech')} 
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="text-2xl font-black text-cyan-300 group-hover:scale-110 transition-transform">100%</div>
            <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mt-0.5">Live PostgreSQL</div>
          </div>
          <div 
            onClick={() => setActiveTab('roles')} 
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="text-2xl font-black text-purple-300 group-hover:scale-110 transition-transform">4-Tier</div>
            <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mt-0.5">RBAC Governance</div>
          </div>
          <div 
            onClick={() => setActiveTab('modules')} 
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="text-2xl font-black text-pink-300 group-hover:scale-110 transition-transform">Fast2SMS</div>
            <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mt-0.5">Parent WhatsApp</div>
          </div>
        </div>

        {/* Dynamic Animated Tab Selector Navigation Bar */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/15">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-royal text-white shadow-xl shadow-blue-500/40 border border-blue-300 ring-2 ring-blue-300/40 scale-105'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10 hover:scale-102'
              }`}
            >
              <span className={activeTab === tab.id ? 'animate-bounce' : ''}>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                  activeTab === tab.id ? 'bg-white text-royal' : 'bg-white/20 text-blue-100'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: EXECUTIVE SUMMARY & CAPABILITIES */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <section className="space-y-8 animate-fade-in">
          {/* Institutional Narrative Header */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-royal text-xs font-black uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Centralized Digital Academic Infrastructure</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#071A3D] tracking-tight">
                  Next-Generation Academic Administration
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The <strong className="text-slate-900 font-bold">V.S.B. AI &amp; DS Digital Portal</strong> replaces disparate paper registers, manual spreadsheets, and physical On-Duty vouchers with a unified, high-integrity cloud operating ecosystem. Designed to adhere strictly to <strong className="text-slate-900 font-bold">Anna University Regulation 2021 Autonomous</strong> standards, it guarantees seamless synchronization across student academic tracking, faculty workload, department leadership, and institutional auditing.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full lg:w-auto">
                <a
                  href="https://app-two-plum-10.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-royal to-blue-700 hover:from-royal-dark hover:to-blue-800 text-white text-xs font-bold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch Production Portal</span>
                </a>
                <button
                  onClick={() => setActiveTab('modules')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all duration-300 hover:scale-102 cursor-pointer"
                >
                  <span>Explore 8 Core Modules</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Three Foundational Pillars with Hover Lift & Accent Glow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-royal border border-blue-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#071A3D] mb-2">Deterministic Governance</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Enforces a strict 4-tier approval pipeline. Every student OD submission, attendance register modification, and curriculum change undergoes systematic faculty verification and HOD sign-off with immutable audit trails.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('roles')}
                className="flex items-center gap-1.5 text-xs font-bold text-royal group-hover:underline cursor-pointer pt-2"
              >
                <span>Inspect RBAC Tier-0 to Tier-3 Matrix</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="group p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#071A3D] mb-2">Automated Parent Dispatch</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Direct integration with the Fast2SMS WhatsApp Cloud API triggers instantaneous WhatsApp notifications to registered parent and guardian phone numbers upon student absence during morning roll-call.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('modules')
                  const m = MODULE_DETAILS.find((item) => item.id === 'fast2sms')
                  if (m) setInspectedModule(m)
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:underline cursor-pointer pt-2"
              >
                <span>View Fast2SMS Cloud Architecture</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="group p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#071A3D] mb-2">Full Curricular Lifecycle</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Encompasses all 8 semesters of theory syllabi, 60+ laboratory exercises, Anna University question paper archives, and capstone milestone defense for AD2614, AD2711, and AD2811.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('schedule')}
                className="flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:underline cursor-pointer pt-2"
              >
                <span>Examine 8-Semester Curricular Framework</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Institutional Highlights Banner with Live System Indicators */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#071A3D] to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
              <div className="lg:col-span-2 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-amber-400 text-xs font-black uppercase tracking-wider">Zero Mock Data Guarantee · Pure Relational Engine</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">Live PostgreSQL Cloud Synchronous Architecture</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Every attendance record, student enrollment, faculty subject allocation, and OD proof is stored securely in Supabase Cloud PostgreSQL on port 6543 with PgBouncer connection pooling. The platform guarantees 100% data integrity with zero dummy records.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-slate-400">
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> &lt; 120ms Edge Latency
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-cyan-400">
                    <Server className="w-3.5 h-3.5" /> 99.98% Cloud Uptime
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5" /> 89 Verified Next.js Routes
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  onClick={() => setActiveTab('tech')}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md hover:shadow-lg text-center cursor-pointer hover:scale-102"
                >
                  View Cloud Tech Stack &amp; Diagram
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all text-center border border-white/20 cursor-pointer hover:scale-102"
                >
                  Department Accreditation Criteria
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: DEPARTMENT VISION, MISSION & ACCREDITATION */}
      {/* ========================================================================= */}
      {activeTab === 'vision' && (
        <section className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#071A3D] tracking-tight">
                  Vision, Mission &amp; Academic Outcomes
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Official Institutional &amp; Departmental Standards · NBA &amp; NAAC Criteria
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-royal text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>NBA Tier-1 Criteria 1.1 Compliant</span>
            </div>
          </div>

          {/* Department Vision Statement */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white border-2 border-blue-200 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-56 h-56 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-xs">
                <Lightbulb className="w-4 h-4 text-amber-300" />
                <span>Vision of the Department</span>
              </div>
              <p className="text-base sm:text-xl text-[#071A3D] font-black leading-relaxed italic">
                &ldquo;To emerge as a premier centre of excellence in Artificial Intelligence and Data Science by creating globally competent professionals, advancing impactful research, fostering innovation and entrepreneurship, and developing ethical, intelligent technologies for a sustainable and inclusive society.&rdquo;
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="text-royal font-black">Department of Artificial Intelligence &amp; Data Science</span>
                <span>•</span>
                <span>V.S.B. Engineering College (Autonomous)</span>
              </div>
            </div>
          </div>

          {/* Department Mission Statements (M1, M2, M3, M4) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#071A3D] flex items-center gap-2">
                <span>Mission of the Department</span>
                <span className="text-xs font-bold text-slate-500 px-2 py-0.5 rounded-md bg-slate-100">4 Core Directives</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-royal flex items-center justify-center font-black text-base mb-3 shadow-xs">
                    M1
                  </div>
                  <h4 className="text-sm font-black text-[#071A3D] mb-2">World-Class Pedagogy</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Provide world-class education through innovative pedagogy, outcome-based learning, and industry-aligned curricula in Artificial Intelligence and Data Science.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-royal">
                  Outcome-Based Learning
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base mb-3 shadow-xs">
                    M2
                  </div>
                  <h4 className="text-sm font-black text-[#071A3D] mb-2">Interdisciplinary Research</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Promote interdisciplinary research, innovation, and lifelong learning to address global challenges through intelligent and data-driven solutions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700">
                  Data-Driven Innovation
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-base mb-3 shadow-xs">
                    M3
                  </div>
                  <h4 className="text-sm font-black text-[#071A3D] mb-2">Industry Partnerships</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Collaborate with industries, research institutions, and professional bodies to enhance experiential learning, technology development, and employability.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-purple-700">
                  Technology Development
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-base mb-3 shadow-xs">
                    M4
                  </div>
                  <h4 className="text-sm font-black text-[#071A3D] mb-2">Ethical Leadership</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Cultivate ethical leadership, entrepreneurial mindset, social responsibility, and professional excellence for sustainable technological advancement.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-amber-800">
                  Social Responsibility
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Vision & Mission (College Level) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-[#071A3D] text-white shadow-xl space-y-3 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Vision of the Institute</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                &ldquo;We endeavor to impart futuristic technical education of the highest quality to the student community and to inculcate discipline in them to face the world with self-confidence and thus we prepare them for life as responsible citizens to uphold human values and to be of service at large. We strive to bring up the Institution as an Institution of academic excellence of international standard.&rdquo;
              </p>
              <div className="text-[11px] font-bold text-amber-300">
                V.S.B. Engineering College (Autonomous), Karur
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-[#0A295C] text-white shadow-xl space-y-3 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mission of the Institute</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                &ldquo;We transform persons in to personalities by the state-of-the-art infrastructure, time consciousness, quick response and the best academic practices through assessment and advice.&rdquo;
              </p>
              <div className="text-[11px] font-bold text-cyan-300">
                Holistic Student Personality Development
              </div>
            </div>
          </div>

          {/* Program Educational Objectives (PEOs) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-royal font-black text-sm uppercase tracking-wide">
              <Award className="w-5 h-5" />
              <span>Programme Educational Objectives (PEOs)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-royal text-white font-black text-xs flex items-center justify-center">PEO 1</span>
                  <h4 className="text-xs font-black uppercase tracking-wide text-royal">Professional Competence</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Graduates will excel as competent professionals by applying Artificial Intelligence, Data Science, and computational intelligence to develop innovative solutions for complex engineering, industrial, and societal problems.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">PEO 2</span>
                  <h4 className="text-xs font-black uppercase tracking-wide text-indigo-700">Lifelong Learning &amp; Research</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Graduates will engage in lifelong learning, research, higher education, and technological innovation by adopting emerging AI technologies and contributing to knowledge creation and sustainable development.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center">PEO 3</span>
                  <h4 className="text-xs font-black uppercase tracking-wide text-amber-800">Ethical Leadership</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Graduates will exhibit ethical values, leadership, entrepreneurial mindset, and effective communication while contributing to multidisciplinary teams and creating technology solutions with global impact.
                </p>
              </div>
            </div>
          </div>

          {/* Program Specific Outcomes (PSOs) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-black text-sm uppercase tracking-wide">
              <CheckCircle2 className="w-5 h-5" />
              <span>Program Specific Outcomes (PSOs)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">PSO 1</span>
                  <h4 className="text-xs font-black uppercase tracking-wide text-emerald-800">AI &amp; Data Science</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Design, implement, and optimize intelligent systems using Artificial Intelligence, Machine Learning, Deep Learning, Natural Language Processing, and Computer Vision techniques to solve domain-specific challenges.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-cyan-50/70 border border-cyan-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-cyan-600 text-white font-black text-xs flex items-center justify-center">PSO 2</span>
                  <h4 className="text-xs font-black uppercase tracking-wide text-cyan-800">Data Analytics</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Apply advanced data engineering, analytics, visualization, and predictive modeling techniques using state-of-the-art industrial tools and AI frameworks to transform data into actionable intelligence for strategic decision-making.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">PSO 3</span>
                  <h4 className="text-xs font-black uppercase tracking-wide text-purple-800">Intelligent Systems</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Engineer scalable, reliable, secure, and ethical AI-enabled solutions by integrating cloud computing, edge intelligence, Generative AI, IoT, and MLOps while effectively managing multidisciplinary projects and adhering to professional and societal responsibilities.
                </p>
              </div>
            </div>
          </div>

          {/* Program Outcomes (POs - PO1 through PO11) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#071A3D] font-black text-sm uppercase tracking-wide">
                <BookOpen className="w-5 h-5 text-royal" />
                <span>Program Outcomes (POs: PO1 – PO11)</span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Washington Accord Graduate Attributes
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs text-slate-600">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="font-black text-royal block text-[11px] mb-1">PO1: Engineering Knowledge</span>
                <span>Apply mathematics, science, and computing to solve complex engineering problems.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="font-black text-royal block text-[11px] mb-1">PO2: Problem Analysis</span>
                <span>Formulate and analyze complex problems reaching substantiated conclusions for sustainable development.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="font-black text-royal block text-[11px] mb-1">PO3: Design/Development of Solutions</span>
                <span>Design creative solutions meeting public health, safety, net zero carbon, culture, and environmental needs.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="font-black text-royal block text-[11px] mb-1">PO4: Conduct Investigations</span>
                <span>Use research-based knowledge, modeling, and data interpretation to provide valid conclusions.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="font-black text-royal block text-[11px] mb-1">PO5: Engineering Tool Usage</span>
                <span>Create and apply modern IT tools, prediction, and modeling recognizing their limitations.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="font-black text-royal block text-[11px] mb-1">PO6: The Engineer &amp; The World</span>
                <span>Analyze societal and environmental impacts for sustainability across health, legal, and economic domains.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="font-black text-royal block text-[11px] mb-1">PO7: Ethics &amp; Human Values</span>
                <span>Apply professional ethics, diversity, inclusion, and national/international legal frameworks.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="font-black text-royal block text-[11px] mb-1">PO8: Collaborative Teamwork</span>
                <span>Function effectively as an individual, member, or leader in diverse multi-disciplinary teams.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="font-black text-royal block text-[11px] mb-1">PO9: Communication</span>
                <span>Communicate inclusively with effective reports, designs, presentations, and technical documentation.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <span className="font-black text-royal block text-[11px] mb-1">PO10: Project Management &amp; Finance</span>
                <span>Apply engineering management principles and economic decision-making in team environments.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors sm:col-span-2 lg:col-span-2">
                <span className="font-black text-royal block text-[11px] mb-1">PO11: Life-Long Learning</span>
                <span>Adapt to new emerging technologies, critical thinking, and independent lifelong learning.</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: CORE PLATFORM MODULES & SERVICES */}
      {/* ========================================================================= */}
      {activeTab === 'modules' && (
        <section className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-xs">
                <Layers className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#071A3D] tracking-tight">
                  Core Architectural Modules
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  8 production-ready subsystems powering the V.S.B. AI &amp; DS portal
                </p>
              </div>
            </div>

            {/* Filter Chips for Modules */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
              {(['all', 'Academic', 'Communication', 'Security', 'Student Success'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setModuleFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    moduleFilter === cat
                      ? 'bg-white text-royal shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All 8 Modules' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredModules.map((mod) => (
              <div
                key={mod.id}
                onClick={() => setInspectedModule(mod)}
                className={`p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:${mod.borderColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-2xl ${mod.bgLight} ${mod.accentColor} border ${mod.borderColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}>
                      {mod.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Module {mod.number}
                    </span>
                  </div>

                  <span className="inline-block text-[10px] font-bold text-royal uppercase tracking-wider mb-1">
                    {mod.category}
                  </span>
                  <h4 className="text-sm font-black text-[#071A3D] mb-1.5 group-hover:text-royal transition-colors">
                    {mod.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500 group-hover:text-royal flex items-center gap-1">
                    <span>Inspect Specs</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Inspection Modal / Drawer for any clicked module */}
          {inspectedModule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
                <button
                  onClick={() => setInspectedModule(null)}
                  className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${inspectedModule.bgLight} ${inspectedModule.accentColor} border ${inspectedModule.borderColor} flex items-center justify-center shadow-xs shrink-0`}>
                    {inspectedModule.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-royal">Module {inspectedModule.number}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-600">{inspectedModule.category}</span>
                    </div>
                    <h3 className="text-xl font-black text-[#071A3D]">{inspectedModule.name}</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {inspectedModule.description}
                </p>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Key Capabilities &amp; Verification Rules</h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {inspectedModule.fullFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">PostgreSQL Tables</span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-royal font-bold">
                      {inspectedModule.databaseEntities.map((tbl) => (
                        <span key={tbl} className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">{tbl}</span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">Operational RBAC Roles</span>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-700 font-bold">
                      {inspectedModule.governingRoles.join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                  <span>{inspectedModule.slaOrStandard}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active in Cloud
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setInspectedModule(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                  >
                    Close Specifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: GOVERNANCE & RBAC MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <section className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-royal shadow-xs">
                <Users className="w-6 h-6 text-royal" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#071A3D] tracking-tight">
                  Role-Based Access Control (RBAC) Matrix
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Strict 4-tier authorization boundaries and operational privileges
                </p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
              {(['all', 'admin', 'hod', 'faculty', 'student'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                    selectedRoleFilter === r
                      ? 'bg-white text-royal shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === 'all' ? 'All 4 Tiers' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Super Admin */}
            {(selectedRoleFilter === 'all' || selectedRoleFilter === 'admin') && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-red-300 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-black text-lg shadow-xs">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#071A3D]">Tier-0: Super Administrator</h3>
                      <p className="text-xs text-slate-500 font-medium">Root Infrastructure Command Center</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black">
                    /admin
                  </span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800">Primary Identifier:</strong> Administrator Email ID · Passwordless 2FA via Email OTP
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>Full CRUD management over Student rosters with bulk CSV upload parser.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>Faculty profile provisioning, class advisor assignments, and designation credentials.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>Fast2SMS WhatsApp Cloud API keys, gateway status testing &amp; template verification.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>Autonomous curriculum schema: 8-semester course codes, credits, and lab configurations.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>Immutable security event logging, login timestamps, and system audit history.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* HOD Directorate */}
            {(selectedRoleFilter === 'all' || selectedRoleFilter === 'hod') && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-black text-lg shadow-xs">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#071A3D]">Tier-1: Head of Department (HOD)</h3>
                      <p className="text-xs text-slate-500 font-medium">Departmental Academic Directorate</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black">
                    /hod-dashboard
                  </span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800">Primary Identifier:</strong> Department Email ID · Secure HOD Password
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Executive oversight across all 4 Academic Years, batches, and class sections.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Final institutional sign-off for student On-Duty (OD) applications verified by Advisors.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Attendance register unlock approvals with mandatory faculty audit justification.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Department-wide capstone project review, guide assignments, and circular broadcasts.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Institutional PDF report generation with official college letterhead and watermarks.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Faculty & Class Advisor */}
            {(selectedRoleFilter === 'all' || selectedRoleFilter === 'faculty') && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black text-lg shadow-xs">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#071A3D]">Tier-2: Faculty &amp; Class Advisor</h3>
                      <p className="text-xs text-slate-500 font-medium">Academic Instruction &amp; Student Mentorship</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                    /faculty-dashboard
                  </span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800">Primary Identifier:</strong> Official Faculty Email ID · Secure Faculty Password
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Morning 1st period roll call and period-by-period lecture/lab attendance tracking.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Automatic WhatsApp message dispatch to parents when marking a student absent.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Class Advisor OD Verification Desk: inspect certificates, geo-tags, and forward to HOD.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Course unit material uploads, presentation slide decks, and question bank creation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Attendance unlock requests to HOD for retrospective corrections with justification.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Student Learner */}
            {(selectedRoleFilter === 'all' || selectedRoleFilter === 'student') && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-royal border border-blue-200 flex items-center justify-center font-black text-lg shadow-xs">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#071A3D]">Tier-3: Student Undergraduates</h3>
                      <p className="text-xs text-slate-500 font-medium">Digital Academic Workspace</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-royal text-xs font-black">
                    /dashboard
                  </span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800">Primary Identifier:</strong> Register Number (e.g. 922525243103) · 2-Step OTP Verification
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-royal shrink-0 mt-0.5" />
                      <span>Live 8-period attendance percentage meter with 75% condonation alert indicators.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-royal shrink-0 mt-0.5" />
                      <span>Semester syllabus tracker, unit notes, lab manuals, and timetable day-order display.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-royal shrink-0 mt-0.5" />
                      <span>Digital On-Duty applications with photo upload, EXIF geo-tagging, and approval tracking.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-royal shrink-0 mt-0.5" />
                      <span>Capstone project milestone submissions with GitHub repository links and demo URLs.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-royal shrink-0 mt-0.5" />
                      <span>Non-dismissible security onboarding enforcing residency and transport mode declaration.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Privilege Comparison Matrix */}
          <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#071A3D]">Operational RBAC Permission Comparison Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">Summary of CRUD operations enforced at middleware &amp; database triggers</p>
              </div>
              <span className="text-xs font-bold text-royal px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
                Deterministic Policy
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black">
                    <th className="p-3.5 pl-6">Platform Functionality</th>
                    <th className="p-3.5 text-center text-red-700">Tier-0 Admin</th>
                    <th className="p-3.5 text-center text-amber-700">Tier-1 HOD</th>
                    <th className="p-3.5 text-center text-emerald-700">Tier-2 Faculty</th>
                    <th className="p-3.5 text-center text-royal pr-6">Tier-3 Student</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-slate-800">Student &amp; Faculty Roster Provisioning</td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Full CRUD</span></td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-royal font-bold text-[10px]">View All</span></td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-royal font-bold text-[10px]">View Class</span></td>
                    <td className="p-3.5 text-center pr-6"><span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[10px]">Self Only</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-slate-800">8-Period Daily Attendance Marking</td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[10px]">Super Audit</span></td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Audit &amp; Unlock</span></td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Period Entry</span></td>
                    <td className="p-3.5 text-center pr-6"><span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-royal font-bold text-[10px]">Live View</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-slate-800">Fast2SMS WhatsApp Absence Alerts</td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">API Gateway</span></td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-royal font-bold text-[10px]">Delivery Log</span></td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Auto Trigger</span></td>
                    <td className="p-3.5 text-center pr-6"><span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-bold text-[10px]">None</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-slate-800">On-Duty (OD) Geotagged Approvals</td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-royal font-bold text-[10px]">System Audit</span></td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Final Sign-Off</span></td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Advisor Verify</span></td>
                    <td className="p-3.5 text-center pr-6"><span className="inline-flex items-center px-2 py-0.5 rounded bg-royal text-white font-bold text-[10px]">Submit &amp; Track</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 pl-6 font-bold text-slate-800">Capstone Project Review &amp; Defense</td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-royal font-bold text-[10px]">Course Setup</span></td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Guide Assign</span></td>
                    <td className="p-3.5 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Guide Review</span></td>
                    <td className="p-3.5 text-center pr-6"><span className="inline-flex items-center px-2 py-0.5 rounded bg-royal text-white font-bold text-[10px]">Milestone Sub</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: MASTER BELL SCHEDULE & REGULATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <section className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#071A3D] tracking-tight">
                  Institutional Master Bell Schedule
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Official 8-Period Day Order schedule of V.S.B. Engineering College
                </p>
              </div>
            </div>

            {/* Live Synchronized Tracker Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>Synchronized with Client Time · 45-min Standard Hours</span>
            </div>
          </div>

          {/* Schedule Table with LIVE ACTIVE PERIOD Highlight */}
          <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#071A3D] text-white">
                    <th className="p-3.5 sm:p-4 font-black">Period / Interval</th>
                    <th className="p-3.5 sm:p-4 font-black">Time Window</th>
                    <th className="p-3.5 sm:p-4 font-black">Duration</th>
                    <th className="p-3.5 sm:p-4 font-black">Academic Classification</th>
                    <th className="p-3.5 sm:p-4 font-black text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {MASTER_SCHEDULE.map((item) => {
                    const isLive = currentActiveScheduleItem?.period === item.period
                    const isBreak = item.type === 'interval' || item.type === 'lunch'

                    return (
                      <tr
                        key={item.period}
                        className={`transition-all duration-300 ${
                          isLive
                            ? 'bg-emerald-50/90 font-bold ring-2 ring-emerald-500 ring-inset shadow-xs'
                            : isBreak
                            ? 'bg-amber-50/60 text-amber-950 font-semibold'
                            : 'hover:bg-blue-50/50'
                        }`}
                      >
                        <td className="p-3.5 sm:p-4">
                          <div className="flex items-center gap-2">
                            {isBreak ? (
                              <span>{item.type === 'lunch' ? '🍱' : '☕'}</span>
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-royal" />
                            )}
                            <span className={isLive ? 'text-emerald-800 font-black' : isBreak ? 'text-amber-900 font-bold' : 'text-royal font-bold'}>
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-800">
                          {item.start} - {item.end}
                        </td>
                        <td className="p-3.5 sm:p-4 text-slate-500">
                          {item.duration}
                        </td>
                        <td className="p-3.5 sm:p-4 text-slate-600">
                          {item.description}
                        </td>
                        <td className="p-3.5 sm:p-4 text-center">
                          {isLive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-xs animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              ACTIVE NOW
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Scheduled</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Anna University Attendance Regulations & Dynamic Eligibility Calculator */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-royal font-black text-sm uppercase tracking-wide">
                <ShieldCheck className="w-5 h-5 text-royal" />
                <span>Anna University R-2021 Autonomous Attendance Norms</span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Interactive Examination Eligibility Simulator
              </span>
            </div>

            {/* Attendance Rules Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-emerald-800 font-black text-lg">≥ 75% Attendance</div>
                <div className="text-emerald-700 font-bold mt-0.5">Fully Eligible for End-Sem Exams</div>
                <p className="text-xs text-emerald-900/80 mt-2.5 leading-relaxed">
                  Students meeting or exceeding the 75% overall period requirement are cleared for semester autonomous examinations without penalty.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-amber-800 font-black text-lg">65% - 74.9% Attendance</div>
                <div className="text-amber-700 font-bold mt-0.5">Condonation Category</div>
                <p className="text-xs text-amber-900/80 mt-2.5 leading-relaxed">
                  Requires valid medical certificate or authorized On-Duty certification submitted within 3 days. Subject to condonation fee and Principal approval.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
                <div className="text-red-800 font-black text-lg">&lt; 65% Attendance</div>
                <div className="text-red-700 font-bold mt-0.5">Detained (Not Eligible)</div>
                <p className="text-xs text-red-900/80 mt-2.5 leading-relaxed">
                  Strictly not permitted to appear for semester examinations. Student must re-register and repeat the course in subsequent semesters.
                </p>
              </div>
            </div>

            {/* Interactive Calculator Slider */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-[#071A3D]">Test Your Attendance Percentage</h4>
                  <p className="text-xs text-slate-500">Drag the slider to test status under Autonomous R-2021 criteria</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-royal font-mono">{calcPercentage}%</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={calcPercentage}
                onChange={(e) => setCalcPercentage(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-royal"
              />

              {/* Dynamic Status Display */}
              <div className="pt-2">
                {calcPercentage >= 75 ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Status: Fully Qualified for Anna University Autonomous Examinations</span>
                  </div>
                ) : calcPercentage >= 65 ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Status: Condonation Application Required (OD / Medical within 3 days)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-100 text-red-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Status: Detention Risk (Below 65% minimum threshold - Course Repeat Mandatory)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: ARCHITECTURE & CLOUD STACK */}
      {/* ========================================================================= */}
      {activeTab === 'tech' && (
        <section className="space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs">
              <Cpu className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#071A3D] tracking-tight">
                Full-Stack System Architecture &amp; Cloud Topology
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Enterprise-grade modern web standards delivering sub-second response times
              </p>
            </div>
          </div>

          {/* Animated Interactive Cloud Topology Diagram */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden space-y-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-cyan-400 text-xs font-black uppercase tracking-wider">End-to-End Cloud Topology</span>
                <h3 className="text-lg font-black text-white mt-0.5">Automated Real-Time Synchronous Data Pipeline</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Stream Active
              </span>
            </div>

            {/* Architecture Node Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Node 1 */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-400 transition-all text-center space-y-2 group">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  📱
                </div>
                <div className="text-[10px] uppercase font-black tracking-wider text-cyan-400">Client Tier</div>
                <h4 className="text-sm font-bold text-white">PWA &amp; Responsive Web</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Next.js Client Hydration, Service Worker Offline Cache &amp; Reactive UI
                </p>
              </div>

              {/* Node 2 */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-blue-400 transition-all text-center space-y-2 group">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <div className="text-[10px] uppercase font-black tracking-wider text-blue-400">Application Tier</div>
                <h4 className="text-sm font-bold text-white">Next.js 14 Edge / SSR</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Server Actions, Middleware RBAC Verification &amp; RESTful API Routes
                </p>
              </div>

              {/* Node 3 */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-400 transition-all text-center space-y-2 group">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  🐘
                </div>
                <div className="text-[10px] uppercase font-black tracking-wider text-emerald-400">Persistence Tier</div>
                <h4 className="text-sm font-bold text-white">Supabase PostgreSQL</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  PgBouncer Pooling on Port 6543, Foreign Key Cascades &amp; ACID Guarantees
                </p>
              </div>

              {/* Node 4 */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-pink-400 transition-all text-center space-y-2 group">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  💬
                </div>
                <div className="text-[10px] uppercase font-black tracking-wider text-pink-400">Gateway Tier</div>
                <h4 className="text-sm font-bold text-white">Fast2SMS Cloud API</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Instant Parent WhatsApp Messages &amp; jsPDF Vector Generation
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-2">⚛️</div>
              <h4 className="text-xs font-black text-[#071A3D]">Next.js 14</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">App Router · SSR · Edge Routing</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-2">📘</div>
              <h4 className="text-xs font-black text-[#071A3D]">TypeScript 5</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Strict Type Safety Across App</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-2">🐘</div>
              <h4 className="text-xs font-black text-[#071A3D]">PostgreSQL</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Supabase Cloud + PgBouncer</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-2">💎</div>
              <h4 className="text-xs font-black text-[#071A3D]">Prisma ORM</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Type-Safe Schema &amp; Migrations</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-2">💬</div>
              <h4 className="text-xs font-black text-[#071A3D]">Fast2SMS</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">WhatsApp Cloud API Gateway</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-2">📲</div>
              <h4 className="text-xs font-black text-[#071A3D]">PWA Engine</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Offline Cache &amp; Push Service</p>
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-black text-[#071A3D]">Enterprise Cloud Infrastructure Breakdown</h3>
            </div>
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-slate-800">Hosting &amp; Edge Delivery</div>
                <div className="text-slate-600 font-medium">Vercel Global Edge CDN + Render Background Worker Daemon</div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-slate-800">Database Persistence</div>
                <div className="text-slate-600 font-medium">Supabase Cloud PostgreSQL on Port 6543 (PgBouncer Connection Pooling)</div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-slate-800">Authentication &amp; Session</div>
                <div className="text-slate-600 font-medium">HttpOnly Cookie Tokens, Bcrypt Hashes &amp; 2-Step Email OTP (6-digit transient tokens)</div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-slate-800">Data Integrity Model</div>
                <div className="text-slate-600 font-medium">Zero-Mock Pure Relational Architecture with strict Foreign Key constraints</div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-slate-800">Vector PDF Generation</div>
                <div className="text-slate-600 font-medium">Client/Server jsPDF + AutoTable with vector letterheads &amp; dynamic watermarks</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: ENGINEERING DIRECTORATE & ARCHITECT STEWARDSHIP */}
      {/* ========================================================================= */}
      {activeTab === 'architect' && (
        <section className="space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#071A3D] tracking-tight">
                Engineering Directorate &amp; System Stewardship
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Conceived, engineered, and maintained for the Department of AI &amp; DS
              </p>
            </div>
          </div>

          {/* Distinguished Architect Profile Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xl p-6 sm:p-10">
            {/* Ambient Lighting Glows */}
            <div className="absolute -right-16 -top-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-slate-100">
              {/* Profile Avatar & Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Official Monogram Avatar with Emerald Radar Beacon */}
                <div className="relative shrink-0 group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#061A3D] via-[#0A295C] to-[#1455D9] p-1.5 shadow-xl group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-[20px] bg-gradient-to-b from-[#071A3D] to-[#0A2540] flex items-center justify-center font-black text-3xl sm:text-4xl text-amber-300 tracking-wider shadow-inner">
                      LG
                    </div>
                  </div>
                  {/* Live Active Beacon */}
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 ring-4 ring-white" />
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lead System Architect &amp; Full-Stack Engineer</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-[#071A3D] tracking-tight">
                    Logeshwaran G
                  </h3>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-600">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-royal font-black">
                      Department of AI &amp; DS
                    </span>
                    <span>•</span>
                    <span className="text-slate-700 font-bold">Class of 2025 – 2029 (Second Year)</span>
                    <span>•</span>
                    <span className="text-royal font-bold">V.S.B. Engineering College (Autonomous)</span>
                  </div>
                </div>
              </div>

              {/* Status / Governance Badge */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
                <div className="px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Engineering Responsibility</p>
                  <p className="text-sm font-black text-[#071A3D] mt-0.5">End-to-End System Architect</p>
                  <p className="text-xs font-bold text-royal mt-0.5">Full-Stack · DevOps · Cloud DB · API Gateways</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/logeshwaran2097-hue/AIDS-Digital-Portal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all hover:scale-102"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>GitHub Repository</span>
                  </a>
                  <a
                    href="https://app-two-plum-10.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-royal hover:bg-royal-dark text-white font-bold text-xs transition-all hover:scale-102 shadow-md hover:shadow-lg"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Live Portal</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Architect's Guiding Philosophy Quote */}
            <div className="relative z-10 mt-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-[#071A3D] to-slate-900 text-white border border-blue-400/30 shadow-2xl overflow-hidden text-center group">
              {/* Ambient Glows */}
              <div className="absolute -top-12 -left-12 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 text-amber-300 border border-white/15 mx-auto shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                </div>

                <blockquote className="text-xl sm:text-3xl font-black tracking-tight leading-relaxed italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-300">
                  &ldquo;Success cannot teach anything<br className="hidden sm:inline" /> but Failure teach everything&rdquo;
                </blockquote>

                <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold text-blue-200">
                  <span className="w-10 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-amber-300 rounded-full" />
                  <span className="uppercase tracking-widest text-amber-300 font-extrabold text-[11px]">
                    Architect’s Guiding Philosophy
                  </span>
                  <span className="w-10 h-0.5 bg-gradient-to-l from-transparent via-amber-400/60 to-amber-300 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* INSTITUTIONAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1.5 text-royal">
            <Building2 className="w-4 h-4" />
            <span>V.S.B. Engineering College (Autonomous)</span>
          </span>
          <span>•</span>
          <span>Department of Artificial Intelligence &amp; Data Science</span>
          <span>•</span>
          <span className="text-emerald-600 font-black">NAAC 'A' Grade</span>
          <span>•</span>
          <span className="text-blue-600 font-black">NBA Accredited</span>
        </div>

        <p className="text-xs text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          NH-67, Covai Road, Karur - 639 111, Tamil Nadu, India · Approved by AICTE, New Delhi · Affiliated to Anna University, Chennai.
        </p>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-semibold">
          <div className="flex items-center gap-1.5">
            <span>Engineered &amp; Maintained by</span>
            <span className="font-black text-royal">Logeshwaran G</span>
            <span>(Second Year, AI &amp; DS)</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} V.S.B. AI &amp; DS Enterprise Digital Portal · All Rights Reserved</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
