'use client'

import React, { useState } from 'react'
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
  Heart,
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
} from 'lucide-react'

interface AboutPortalViewProps {
  role?: 'admin' | 'faculty' | 'hod' | 'student' | 'public'
}

type TabType = 'overview' | 'vision' | 'modules' | 'roles' | 'schedule' | 'tech' | 'architect'

export function AboutPortalView({ role = 'public' }: AboutPortalViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'admin' | 'hod' | 'faculty' | 'student'>('all')

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

  const tabs: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Executive Summary', shortLabel: 'Overview', icon: <Globe className="w-4 h-4" /> },
    { id: 'vision', label: 'Department Vision & Mission', shortLabel: 'Vision & Mission', icon: <Target className="w-4 h-4" /> },
    { id: 'modules', label: 'Core Platform Modules', shortLabel: 'Capabilities', icon: <Layers className="w-4 h-4" /> },
    { id: 'roles', label: 'Governance & RBAC Matrix', shortLabel: 'Role Matrix', icon: <Users className="w-4 h-4" /> },
    { id: 'schedule', label: 'Master Bell Schedule & Regulations', shortLabel: 'Timetable & Rules', icon: <Clock className="w-4 h-4" /> },
    { id: 'tech', label: 'Architecture & Cloud Stack', shortLabel: 'Architecture', icon: <Cpu className="w-4 h-4" /> },
    { id: 'architect', label: 'Engineering Directorate & Architect', shortLabel: 'Developer & Credits', icon: <Sparkles className="w-4 h-4 text-amber-300" /> },
  ]

  return (
    <div className="min-h-screen pb-20 space-y-8 animate-fade-in text-slate-800">
      {/* Top Breadcrumb & Live Portal Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <Link href={backUrl} className="hover:text-royal transition-colors flex items-center gap-1 font-medium">
            <span>Portal Workspace</span>
          </Link>
          <span>/</span>
          <span className="text-royal font-bold">Institutional Overview &amp; Specifications</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Cloud Service Active
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
            Autonomous R-2021
          </span>
        </div>
      </div>

      {/* Hero Section: Institutional Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061A3D] via-[#0A295C] to-[#0D387A] text-white p-6 sm:p-10 shadow-2xl border border-blue-400/20">
        {/* Ambient Glow Spheres */}
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* Official College Emblem with Gold Ring */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-[#E7B93E] via-[#FFF3B8] to-[#B8860B] shadow-[0_0_30px_rgba(231,185,62,0.35)] flex items-center justify-center">
                <div className="w-full h-full rounded-xl bg-white p-1.5 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/college-emblem.png"
                    alt="V.S.B. Engineering College Emblem"
                    width={84}
                    height={84}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/15 border border-blue-300/30 text-blue-200 text-xs font-bold tracking-wide uppercase">
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>V.S.B. Engineering College (Autonomous)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Digital Academic Portal
              </h1>
              <p className="text-base sm:text-lg text-amber-300 font-semibold flex items-center gap-2">
                <span>Department of Artificial Intelligence &amp; Data Science</span>
              </p>
              <p className="text-xs sm:text-sm text-blue-200 font-medium max-w-2xl leading-relaxed">
                Autonomous Academic Governance, Multi-Tier Approval Workflows, 8-Period Attendance Verification &amp; Cloud Management Ecosystem.
              </p>
            </div>
          </div>

          {/* College Accreditations Badges */}
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> NAAC 'A' Grade Accredited
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-cyan-300" /> NBA Accredited Department
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold shadow-xs">
              <Award className="w-4 h-4 text-amber-300" /> Anna University Autonomous
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-slate-200 text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-purple-300" /> AICTE Approved · New Delhi
            </span>
          </div>
        </div>

        {/* Executive Key Metric Stats Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <div className="text-2xl font-black text-white">4</div>
            <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider mt-0.5">Academic Years</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <div className="text-2xl font-black text-amber-300">8</div>
            <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider mt-0.5">Semesters Syllabi</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <div className="text-2xl font-black text-emerald-400">8</div>
            <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider mt-0.5">Daily Bell Periods</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <div className="text-2xl font-black text-cyan-300">100%</div>
            <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider mt-0.5">Live PostgreSQL</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <div className="text-2xl font-black text-purple-300">4-Tier</div>
            <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider mt-0.5">RBAC Governance</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <div className="text-2xl font-black text-pink-300">Fast2SMS</div>
            <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider mt-0.5">Parent WhatsApp</div>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/40 ring-2 ring-blue-400/20'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-transparent'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
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
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-royal text-xs font-bold uppercase tracking-wider">
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-royal to-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch Production Portal</span>
                </a>
                <button
                  onClick={() => setActiveTab('modules')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                >
                  <span>Explore 8 Core Modules</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Three Foundational Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-royal border border-blue-200/80 flex items-center justify-center mb-4 shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#071A3D] mb-2">Deterministic Governance</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Enforces a strict 4-tier approval pipeline. Every student OD submission, attendance register modification, and curriculum change undergoes systematic faculty verification and HOD sign-off with immutable audit trails.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-royal">
                <span>RBAC Tier-0 to Tier-3</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mb-4 shadow-2xs">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#071A3D] mb-2">Automated Parent Dispatch</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Direct integration with the Fast2SMS WhatsApp Cloud API triggers instantaneous WhatsApp notifications to registered parent and guardian phone numbers upon student absence during morning roll-call.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <span>Fast2SMS Cloud Gateway</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/80 flex items-center justify-center mb-4 shadow-2xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#071A3D] mb-2">Full Curricular Lifecycle</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Encompasses all 8 semesters of theory syllabi, 60+ laboratory exercises, Anna University question paper archives, and capstone milestone defense for AD2614, AD2711, and AD2811.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600">
                <span>8-Semester Architecture</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Quick Institutional Highlights */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#071A3D] to-slate-900 text-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-2">
                <span className="text-amber-400 text-xs font-black uppercase tracking-wider">Zero Mock Data Guarantee</span>
                <h3 className="text-xl sm:text-2xl font-black text-white">Live PostgreSQL Cloud Synchronous</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Every attendance record, student enrollment, faculty subject allocation, and OD proof is stored securely in Supabase Cloud PostgreSQL with PgBouncer connection pooling. The platform maintains 100% data integrity with zero dummy records.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  onClick={() => setActiveTab('tech')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors text-center"
                >
                  View Cloud Tech Stack
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors text-center border border-white/20"
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#071A3D] tracking-tight">
                Department Vision &amp; Mission Statements
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                National Board of Accreditation (NBA) &amp; NAAC Institutional Criteria
              </p>
            </div>
          </div>

          {/* Vision Statement */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white border-2 border-blue-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-xs">
                <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                <span>Department Vision</span>
              </div>
              <p className="text-base sm:text-lg text-[#071A3D] font-bold leading-relaxed italic">
                &ldquo;To emerge as a premier center of excellence in Artificial Intelligence and Data Science education, research, and innovation, producing socially responsible technocrats, intellectual leaders, and ethical innovators equipped to solve global multi-disciplinary challenges.&rdquo;
              </p>
            </div>
          </div>

          {/* Mission Statements (M1, M2, M3) */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#071A3D]">Department Mission Statements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-royal flex items-center justify-center font-black text-sm mb-3">
                  M1
                </div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">Academic Rigor &amp; Theory</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Provide high-quality education through modern curriculum design, rigorous mathematical foundations, and cutting-edge laboratory infrastructure in AI, Machine Learning, and Big Data.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm mb-3">
                  M2
                </div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">Industry &amp; Research Synergies</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Foster an environment of innovative research, industry partnerships, hackathons, and real-world capstone projects addressing contemporary socio-industrial challenges.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm mb-3">
                  M3
                </div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">Ethics &amp; Global Leadership</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Nurture professional ethics, leadership qualities, lifelong learning adaptability, and a commitment to societal welfare and ethical AI governance.
                </p>
              </div>
            </div>
          </div>

          {/* Program Educational Objectives (PEOs) & Program Specific Outcomes (PSOs) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-royal font-black text-sm uppercase tracking-wide">
                <Award className="w-4 h-4" />
                <span>Program Educational Objectives (PEOs)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-royal font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><strong className="text-slate-800">Core Technical Proficiency:</strong> Establish successful careers as AI Engineers, Data Scientists, and Machine Learning Specialists across leading global enterprises.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-royal font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><strong className="text-slate-800">Higher Education &amp; Research:</strong> Pursue advanced post-graduate and doctoral research in cognitive computing, computer vision, and NLP.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-royal font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><strong className="text-slate-800">Entrepreneurship &amp; Ethics:</strong> Create sustainable tech ventures exhibiting sound professional ethics, leadership, and team collaboration.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-black text-sm uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                <span>Program Specific Outcomes (PSOs)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><strong className="text-slate-800">Cognitive Computing Mastery:</strong> Ability to formulate, design, and deploy advanced neural networks, deep learning pipelines, and predictive analytics platforms.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><strong className="text-slate-800">Big Data Engineering:</strong> Capacity to architect distributed data pipelines, cloud data warehouses, and automated real-time stream processing systems.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><strong className="text-slate-800">Responsible AI Deployment:</strong> Ensure fairness, interpretability, data privacy, and ethical compliance across industrial AI applications.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: CORE PLATFORM MODULES & SERVICES */}
      {/* ========================================================================= */}
      {activeTab === 'modules' && (
        <section className="space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
              <Layers className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#071A3D] tracking-tight">
                Core Architectural Modules
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Comprehensive breakdown of the 8 production subsystems powering the portal
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Module 1 */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-royal border border-blue-200 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-royal uppercase tracking-wider mb-1">Module 01</div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">8-Period Attendance Engine</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time period-wise attendance marking for all 8 daily periods. Computes aggregate percentage, Forenoon/Afternoon status, and triggers condonation warnings below 75%.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Auto Gauge Calculation</span>
                <span className="text-emerald-600">Active</span>
              </div>
            </div>

            {/* Module 2 */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">Module 02</div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">Fast2SMS WhatsApp Alerts</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated dispatch engine integrated with Fast2SMS Cloud API. Sends formatted WhatsApp absence alerts and exam schedules to parents and guardians with 99.9% delivery SLA.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Multi-Template Support</span>
                <span className="text-emerald-600">Active</span>
              </div>
            </div>

            {/* Module 3 */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Module 03</div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">Geotagged OD Verification</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  High-security On-Duty pipeline. Extracts EXIF GPS coordinates and timestamps from uploaded symposium/hackathon photos with interactive map pins and certificate viewer.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Multi-Tier Sign-Off</span>
                <span className="text-emerald-600">Active</span>
              </div>
            </div>

            {/* Module 4 */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-purple-600 uppercase tracking-wider mb-1">Module 04</div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">Curriculum &amp; All 8 Labs</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete repository covering all 8 semesters of AI &amp; DS syllabi, dynamic unit lecture notes, lab manuals, and experimental procedures with zero mock data.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Sem 1 to Sem 8</span>
                <span className="text-emerald-600">Active</span>
              </div>
            </div>

            {/* Module 5 */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-cyan-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-cyan-600 uppercase tracking-wider mb-1">Module 05</div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">Question Paper Bank</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Digital archive containing Internal Assessment Tests (IAT-1, IAT-2, Model Exams) and Anna University previous year semester examination question papers with filterable search.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>PDF Download Ready</span>
                <span className="text-emerald-600">Active</span>
              </div>
            </div>

            {/* Module 6 */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-pink-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center mb-3">
                  <Code2 className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-pink-600 uppercase tracking-wider mb-1">Module 06</div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">Capstone Project Hub</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Milestone submission tracking for AD2614 (Mini-Project), AD2711 (Phase I), and AD2811 (Phase II). Facilitates supervisor allocation, abstract reviews, and GitHub/demo verification.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Review Milestones 1-3</span>
                <span className="text-emerald-600">Active</span>
              </div>
            </div>

            {/* Module 7 */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-1">Module 07</div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">Grounded AI NLP Assistant</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Floating conversational assistant grounded directly in live PostgreSQL schema tables. Answers questions about schedules, advisors, and subjects with Google Gemini fallback.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Natural Language NLP</span>
                <span className="text-emerald-600">Active</span>
              </div>
            </div>

            {/* Module 8 */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-red-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mb-3">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">Module 08</div>
                <h4 className="text-sm font-black text-[#071A3D] mb-1.5">Institutional PDF Engine</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vector-rendered report generation using jsPDF. Produces official departmental letterheads, security watermarks, autonomous validation codes, and printable attendance registries.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Vector Letterhead</span>
                <span className="text-emerald-600">Active</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: GOVERNANCE & RBAC MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <section className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-royal shadow-2xs">
                <Users className="w-5 h-5 text-royal" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#071A3D] tracking-tight">
                  Role-Based Access Control (RBAC)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Strict authorization boundary and operational privileges per stakeholder
                </p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              {(['all', 'admin', 'hod', 'faculty', 'student'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                    selectedRoleFilter === r
                      ? 'bg-white text-[#071A3D] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Super Admin */}
            {(selectedRoleFilter === 'all' || selectedRoleFilter === 'admin') && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-red-300 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-black text-lg">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#071A3D]">Tier-0: Super Administrator</h3>
                      <p className="text-xs text-slate-500 font-medium">Root Infrastructure Command Center</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-extrabold">
                    /admin
                  </span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800">Primary Identifier:</strong> Administrator Email ID · Passwordless 2FA via Email OTP
                  </div>
                  <ul className="space-y-2 text-xs">
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
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-black text-lg">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#071A3D]">Tier-1: Head of Department (HOD)</h3>
                      <p className="text-xs text-slate-500 font-medium">Departmental Academic Directorate</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-extrabold">
                    /hod-dashboard
                  </span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800">Primary Identifier:</strong> Department Email ID · Secure HOD Password
                  </div>
                  <ul className="space-y-2 text-xs">
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
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black text-lg">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#071A3D]">Tier-2: Faculty &amp; Class Advisor</h3>
                      <p className="text-xs text-slate-500 font-medium">Academic Instruction &amp; Student Mentorship</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold">
                    /faculty-dashboard
                  </span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800">Primary Identifier:</strong> Official Faculty Email ID · Secure Faculty Password
                  </div>
                  <ul className="space-y-2 text-xs">
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
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-royal border border-blue-200 flex items-center justify-center font-black text-lg">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#071A3D]">Tier-3: Student Undergraduates</h3>
                      <p className="text-xs text-slate-500 font-medium">Digital Academic Workspace</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-royal text-xs font-extrabold">
                    /dashboard
                  </span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800">Primary Identifier:</strong> Register Number (e.g. 922525243103) · 2-Step OTP Verification
                  </div>
                  <ul className="space-y-2 text-xs">
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
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: MASTER BELL SCHEDULE & REGULATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <section className="space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
              <Clock className="w-5 h-5 text-amber-600" />
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

          {/* Schedule Table */}
          <div className="overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#071A3D] text-white">
                    <th className="p-3.5 sm:p-4 font-black">Period / Interval</th>
                    <th className="p-3.5 sm:p-4 font-black">Time Window</th>
                    <th className="p-3.5 sm:p-4 font-black">Duration</th>
                    <th className="p-3.5 sm:p-4 font-black">Academic Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-royal">Period 1</td>
                    <td className="p-3.5 sm:p-4 font-mono">09:15 AM - 10:00 AM</td>
                    <td className="p-3.5 sm:p-4">45 mins</td>
                    <td className="p-3.5 sm:p-4 font-medium">Morning Theory / Core Lecture Slot 1 · Roll Call</td>
                  </tr>
                  <tr className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-royal">Period 2</td>
                    <td className="p-3.5 sm:p-4 font-mono">10:00 AM - 10:45 AM</td>
                    <td className="p-3.5 sm:p-4">45 mins</td>
                    <td className="p-3.5 sm:p-4 font-medium">Morning Theory / Core Lecture Slot 2</td>
                  </tr>
                  <tr className="bg-amber-50/60 font-semibold text-amber-900">
                    <td className="p-3.5 sm:p-4 flex items-center gap-1.5">
                      <span>☕ Morning Interval</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono">10:45 AM - 11:00 AM</td>
                    <td className="p-3.5 sm:p-4">15 mins</td>
                    <td className="p-3.5 sm:p-4">Campus Refreshment Break</td>
                  </tr>
                  <tr className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-royal">Period 3</td>
                    <td className="p-3.5 sm:p-4 font-mono">11:00 AM - 11:45 AM</td>
                    <td className="p-3.5 sm:p-4">45 mins</td>
                    <td className="p-3.5 sm:p-4 font-medium">Mid-Morning Core / Advanced Theory Slot 3</td>
                  </tr>
                  <tr className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-royal">Period 4</td>
                    <td className="p-3.5 sm:p-4 font-mono">11:45 AM - 12:30 PM</td>
                    <td className="p-3.5 sm:p-4">45 mins</td>
                    <td className="p-3.5 sm:p-4 font-medium">Mid-Morning Core / Advanced Theory Slot 4</td>
                  </tr>
                  <tr className="bg-amber-50/60 font-semibold text-amber-900">
                    <td className="p-3.5 sm:p-4 flex items-center gap-1.5">
                      <span>🍱 Lunch Break</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono">12:30 PM - 01:20 PM</td>
                    <td className="p-3.5 sm:p-4">50 mins</td>
                    <td className="p-3.5 sm:p-4">Midday Dining &amp; Campus Interval</td>
                  </tr>
                  <tr className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-royal">Period 5</td>
                    <td className="p-3.5 sm:p-4 font-mono">01:20 PM - 02:05 PM</td>
                    <td className="p-3.5 sm:p-4">45 mins</td>
                    <td className="p-3.5 sm:p-4 font-medium">Afternoon Theory / Practical Lab Block Slot 5</td>
                  </tr>
                  <tr className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-royal">Period 6</td>
                    <td className="p-3.5 sm:p-4 font-mono">02:05 PM - 02:50 PM</td>
                    <td className="p-3.5 sm:p-4">45 mins</td>
                    <td className="p-3.5 sm:p-4 font-medium">Afternoon Theory / Practical Lab Block Slot 6</td>
                  </tr>
                  <tr className="bg-amber-50/60 font-semibold text-amber-900">
                    <td className="p-3.5 sm:p-4 flex items-center gap-1.5">
                      <span>🍵 Evening Tea Interval</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono">02:50 PM - 03:05 PM</td>
                    <td className="p-3.5 sm:p-4">15 mins</td>
                    <td className="p-3.5 sm:p-4">Tea &amp; Refreshment Break</td>
                  </tr>
                  <tr className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-royal">Period 7</td>
                    <td className="p-3.5 sm:p-4 font-mono">03:05 PM - 03:50 PM</td>
                    <td className="p-3.5 sm:p-4">45 mins</td>
                    <td className="p-3.5 sm:p-4 font-medium">Practical Lab Block / Soft Skills / Seminar</td>
                  </tr>
                  <tr className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-royal">Period 8</td>
                    <td className="p-3.5 sm:p-4 font-mono">03:50 PM - 04:40 PM</td>
                    <td className="p-3.5 sm:p-4">50 mins</td>
                    <td className="p-3.5 sm:p-4 font-medium">Practical Lab Block / Mentorship &amp; Counseling</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Anna University Attendance Regulations */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-royal font-black text-sm uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              <span>Anna University R-2021 Autonomous Attendance Norms</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-emerald-800 font-black text-base">≥ 75% Attendance</div>
                <div className="text-emerald-700 font-bold mt-0.5">Eligible for End-Sem Exams</div>
                <p className="text-xs text-emerald-900/80 mt-2 leading-relaxed">
                  Students meeting or exceeding the 75% overall period requirement are fully cleared for semester autonomous examinations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-amber-800 font-black text-base">65% - 74.9% Attendance</div>
                <div className="text-amber-700 font-bold mt-0.5">Condonation Category</div>
                <p className="text-xs text-amber-900/80 mt-2 leading-relaxed">
                  Requires valid medical certificate / On-Duty certification submitted within 3 days. Subject to condonation fee and Principal approval.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <div className="text-red-800 font-black text-base">&lt; 65% Attendance</div>
                <div className="text-red-700 font-bold mt-0.5">Detained (Not Eligible)</div>
                <p className="text-xs text-red-900/80 mt-2 leading-relaxed">
                  Strictly not permitted to appear for semester examinations. Student must re-register and repeat the course in subsequent semesters.
                </p>
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
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-2xs">
              <Cpu className="w-5 h-5 text-purple-600" />
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:border-blue-300 transition-all">
              <div className="text-3xl mb-2">⚛️</div>
              <h4 className="text-xs font-black text-[#071A3D]">Next.js 14</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">App Router · SSR · Edge Routing</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:border-blue-300 transition-all">
              <div className="text-3xl mb-2">📘</div>
              <h4 className="text-xs font-black text-[#071A3D]">TypeScript 5</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Strict Type Safety Across App</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:border-blue-300 transition-all">
              <div className="text-3xl mb-2">🐘</div>
              <h4 className="text-xs font-black text-[#071A3D]">PostgreSQL</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Supabase Cloud + PgBouncer</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:border-blue-300 transition-all">
              <div className="text-3xl mb-2">💎</div>
              <h4 className="text-xs font-black text-[#071A3D]">Prisma ORM</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Type-Safe Schema &amp; Migrations</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:border-blue-300 transition-all">
              <div className="text-3xl mb-2">💬</div>
              <h4 className="text-xs font-black text-[#071A3D]">Fast2SMS</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">WhatsApp Cloud API Gateway</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-xs hover:border-blue-300 transition-all">
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
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-600" />
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
            {/* Ambient Lighting */}
            <div className="absolute -right-16 -top-16 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-slate-100">
              {/* Profile Avatar & Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Official Monogram Avatar */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#061A3D] via-[#0A295C] to-[#1455D9] p-1 shadow-lg">
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-b from-[#071A3D] to-[#0A2540] flex items-center justify-center font-black text-3xl sm:text-4xl text-amber-300 tracking-wider">
                      LG
                    </div>
                  </div>
                  {/* Live Active Beacon */}
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 ring-4 ring-white" />
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
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>GitHub Repository</span>
                  </a>
                  <a
                    href="https://app-two-plum-10.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-royal hover:bg-royal-dark text-white font-bold text-xs transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Live Portal</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Architectural Statement */}
            <div className="relative z-10 mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border-l-4 border-royal">
              <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed italic font-medium">
                &ldquo;Conceived, architected, and engineered from foundational code to revolutionize academic administration within the Department of Artificial Intelligence &amp; Data Science. This portal unites strict Anna University autonomous attendance standards, automated WhatsApp parent alerts via Fast2SMS Cloud API, geotagged On-Duty verification, dynamic 8-semester laboratory tracking, and cross-platform PWA offline capabilities into an institutional-grade cloud ecosystem.&rdquo;
              </blockquote>
            </div>

            {/* Core Architectural Contributions Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2 text-royal text-xs font-black uppercase tracking-wide mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span>Full-Stack Engine</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Engineered the complete Next.js 14 App Router, dynamic server rendering, custom REST API endpoints, and client-side reactive state.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-black uppercase tracking-wide mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>Fast2SMS Cloud API</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Integrated Fast2SMS WhatsApp Cloud API for automated absence notices, multi-channel templates, and live SMS/WhatsApp gateway configurations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:border-purple-300 transition-all">
                <div className="flex items-center gap-2 text-purple-700 text-xs font-black uppercase tracking-wide mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Database className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>Curricula &amp; 8 Labs</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Designed the comprehensive 8-semester laboratory architecture with zero mock data and dedicated Year &amp; Semester-wise filtering.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-black uppercase tracking-wide mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                  </div>
                  <span>Offline-Ready PWA</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Built 1-click installable Progressive Web App for Windows, Android, Mac, and iOS with Service Worker cache and Web Push notifications.
                </p>
              </div>
            </div>

            {/* Institutional Mentorship & Acknowledgement */}
            <div className="relative z-10 mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-xs font-black text-[#071A3D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Institutional Patronage &amp; Acknowledgement</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Special gratitude is extended to the <strong>College Management</strong>, <strong>Principal</strong>, <strong>Head of the Department</strong>, and <strong>Faculty Members</strong> of the Department of Artificial Intelligence &amp; Data Science at V.S.B. Engineering College (Autonomous), Karur, for their unwavering guidance, encouragement, and institutional support throughout the development and deployment of this enterprise digital portal.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* INSTITUTIONAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1 text-royal">
            <Building2 className="w-3.5 h-3.5" />
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
