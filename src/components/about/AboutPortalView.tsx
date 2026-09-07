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
  Layers,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Users,
  CalendarDays,
  FileQuestion,
  FolderOpen,
  MessageSquare,
  BookOpen,
  Database,
  Smartphone,
  Server,
  Globe,
  Zap,
  ArrowRight,
  UserCheck,
  Heart,
  ChevronRight,
  Info
} from 'lucide-react'

interface AboutPortalViewProps {
  role?: 'admin' | 'faculty' | 'hod' | 'student' | 'public'
}

export function AboutPortalView({ role = 'public' }: AboutPortalViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'architect' | 'tech'>('overview')

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

  return (
    <div className="min-h-screen pb-16 space-y-8 animate-fade-in text-slate-800">
      {/* Top Breadcrumb & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href={backUrl} className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <span>Portal</span>
          </Link>
          <span>/</span>
          <span className="text-blue-600 font-bold">About Portal &amp; Developer</span>
        </div>
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Section: Institutional Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061A3D] via-[#0A295C] to-[#0D387A] text-white p-6 sm:p-10 shadow-2xl border border-blue-400/20">
        {/* Glow Spheres */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 bottom-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            {/* Official College Emblem with Gold Ring */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-gradient-to-tr from-[#E7B93E] via-[#FFF3B8] to-[#B8860B] shadow-[0_0_24px_rgba(231,185,62,0.4)] flex items-center justify-center">
                <div className="w-full h-full rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/college-emblem.png"
                    alt="V.S.B. Engineering College Emblem"
                    width={72}
                    height={72}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-400/15 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-wide uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Department of Artificial Intelligence &amp; Data Science</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Digital Portal of AI &amp; DS
              </h1>
              <p className="text-sm sm:text-base text-blue-200 font-medium mt-1">
                V.S.B. Engineering College (Autonomous), Karur, Tamil Nadu
              </p>
            </div>
          </div>

          {/* College Accreditations */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> NAAC 'A' Grade Accredited
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> NBA Accredited Department
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold">
              <Award className="w-3.5 h-3.5" /> Anna University Affiliated
            </span>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
          {[
            { id: 'overview', label: 'Platform Overview', icon: <Globe className="w-4 h-4" /> },
            { id: 'architect', label: 'Designed & Implemented By', icon: <Sparkles className="w-4 h-4 text-amber-300" /> },
            { id: 'roles', label: 'Role Workflows (Admin, HOD, Faculty, Student)', icon: <Users className="w-4 h-4" /> },
            { id: 'tech', label: 'System Architecture & Tech Stack', icon: <Cpu className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/40'
                  : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: DESIGNED & IMPLEMENTED BY (FEATURED PROMINENTLY) */}
      {(activeTab === 'architect' || activeTab === 'overview') && (
        <section className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Designed &amp; Implemented By
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                The lead developer, system architect &amp; visionary behind the Digital Portal of AI &amp; DS
              </p>
            </div>
          </div>

          {/* Hero Developer Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071739] via-[#0B2556] to-[#040E26] text-white p-6 sm:p-10 shadow-xl border-2 border-amber-400/40">
            {/* Background luxury gradient flares */}
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Profile Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* 24K Luxury Monogram Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#E7B93E] via-[#FFE58F] to-[#B8860B] p-[2.5px] shadow-[0_0_28px_rgba(244,196,48,0.5)]">
                    <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#071A3D] to-[#0A2540] flex items-center justify-center font-black text-2xl sm:text-3xl text-[#FFE58F] tracking-widest">
                      LG
                    </div>
                  </div>
                  {/* Live Pulse Beacon */}
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 ring-2 ring-[#071A3D]" />
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lead Developer &amp; System Architect</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                    Logeshwaran G
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-200 font-bold">
                      Second Year · AI &amp; DS
                    </span>
                    <span>•</span>
                    <span>Batch 2023 - 2027</span>
                    <span>•</span>
                    <span className="text-amber-200 font-bold">V.S.B. Engineering College (Autonomous)</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
                <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                  <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Project Role</p>
                  <p className="text-sm font-extrabold text-white mt-0.5">End-to-End Creator &amp; Maintainer</p>
                  <p className="text-xs text-blue-200 mt-1">Full-Stack · DevOps · UI/UX · API Gateways</p>
                </div>
              </div>
            </div>

            {/* Architect Statement */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
              <blockquote className="text-sm sm:text-base text-blue-100/90 leading-relaxed italic">
                "Conceived, designed, and engineered from the ground up to revolutionize departmental academic governance.
                This portal combines institutional-grade security, instant automated parent WhatsApp notifications via Fast2SMS Cloud API,
                modular 8-semester laboratory tracking, paperless question archives, and cross-platform PWA offline capabilities
                tailored specifically for the Department of Artificial Intelligence &amp; Data Science."
              </blockquote>
            </div>

            {/* Core Architectural Contributions Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wide mb-1">
                  <Code2 className="w-4 h-4" /> Full-Stack Engineering
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  Engineered the complete Next.js 14 App Router, dynamic server rendering, custom REST API endpoints, and client-side reactive state.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-wide mb-1">
                  <MessageSquare className="w-4 h-4" /> Fast2SMS WhatsApp API
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  Integrated Fast2SMS WhatsApp Cloud API for automated absence notices, multi-channel templates, and live SMS/WhatsApp gateway configurations.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wide mb-1">
                  <Database className="w-4 h-4" /> Curricula &amp; All 8 Labs
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  Designed the comprehensive 8-semester laboratory architecture with zero mock data and dedicated Year &amp; Semester-wise filtering.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-black uppercase tracking-wide mb-1">
                  <Smartphone className="w-4 h-4" /> Offline-Ready PWA
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  Built 1-click installable Progressive Web App for Windows, Android, Mac, and iOS with Service Worker cache and Web Push notifications.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: PLATFORM OVERVIEW & CAPABILITIES */}
      {(activeTab === 'overview' || activeTab === 'tech') && (
        <section className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                About the Website &amp; Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                The centralized digital operating system for academic excellence in AI &amp; DS
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Institutional Governance</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Replaces fragmented physical registers with a centralized, immutable cloud registry for student records, faculty allocations, and departmental audits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Automated Communications</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connects faculty directly to parents through automated Fast2SMS WhatsApp dispatch on student absence, internal exam announcements, and department notices.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Curricular Excellence</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Features full 8-semester syllabus tracking, laboratory course allocations, semester question paper archives, and student capstone project showcases.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: ROLE WORKFLOWS */}
      {(activeTab === 'roles' || activeTab === 'overview') && (
        <section className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Role-Based Portals &amp; Access Controls
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Tailored environments engineered for each departmental stakeholder
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Admin Role Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-red-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Admin Portal</h3>
                    <p className="text-xs text-slate-500">Tier-0 Root Governance</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-extrabold">
                  System Admin
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Full student, faculty, HOD, and administrative user lifecycle management.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Management of all 8 semester laboratories &amp; curricular syllabi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Fast2SMS WhatsApp Cloud API credentials, sender identity &amp; gateway testing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Comprehensive activity audit logging &amp; database backup exports.</span>
                </li>
              </ul>
            </div>

            {/* HOD Role Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">HOD Portal</h3>
                    <p className="text-xs text-slate-500">Department Leadership &amp; Direction</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-extrabold">
                  Head of Dept
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Executive department overview: total students, faculty strength, and attendance rates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Faculty theory subject and laboratory course allocations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Class advisor assignments across Years I, II, III, and IV.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Official Duty (OD) application approvals and departmental circular broadcasts.</span>
                </li>
              </ul>
            </div>

            {/* Faculty Role Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Faculty Portal</h3>
                    <p className="text-xs text-slate-500">Instruction &amp; Class Advisory</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-extrabold">
                  Professors &amp; Staff
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Real-time lecture &amp; lab attendance recording with session security.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Instant parent WhatsApp notifications dispatched on student absenteeism.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Study materials, lab manuals, and syllabus distribution to enrolled classes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Mentorship and academic monitoring of mentored student cohorts.</span>
                </li>
              </ul>
            </div>

            {/* Student Role Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Student Portal</h3>
                    <p className="text-xs text-slate-500">Learner Workspace</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-extrabold">
                  Undergraduates
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Live attendance percentage tracking with 75% eligibility warning indicators.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Access to semester syllabi, lecture notes, lab manuals, and timetables.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Question paper bank for internal tests and Anna University end-sem exams.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Capstone project showcase, event registrations, and departmental broadcast alerts.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: SYSTEM ARCHITECTURE & TECH STACK */}
      {(activeTab === 'tech' || activeTab === 'overview') && (
        <section className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                System Architecture &amp; Technology Stack
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Modern enterprise web standards delivering sub-second response times
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-2xl mb-1 block">⚛️</span>
              <h4 className="text-xs font-bold text-slate-900">Next.js 14</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">App Router &amp; SSR</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-2xl mb-1 block">📘</span>
              <h4 className="text-xs font-bold text-slate-900">TypeScript</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Strict Type Safety</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-2xl mb-1 block">🎨</span>
              <h4 className="text-xs font-bold text-slate-900">TailwindCSS</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Modern Glassmorphism</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-2xl mb-1 block">🐘</span>
              <h4 className="text-xs font-bold text-slate-900">PostgreSQL</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Prisma ORM Cloud</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-2xl mb-1 block">💬</span>
              <h4 className="text-xs font-bold text-slate-900">Fast2SMS</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">WhatsApp Cloud API</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-2xl mb-1 block">📲</span>
              <h4 className="text-xs font-bold text-slate-900">PWA Engine</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Offline Desktop &amp; Mobile</p>
            </div>
          </div>
        </section>
      )}

      {/* Institutional Footer */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
        <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          <span>by</span>
          <span className="font-black text-blue-600">Logeshwaran G</span>
          <span>for Department of Artificial Intelligence &amp; Data Science</span>
        </div>
        <p className="text-[11px] text-slate-500">
          V.S.B. Engineering College (Autonomous), NH-67 Karur-Coimbatore Highway, Karur - 639 111, Tamil Nadu, India.
        </p>
      </div>
    </div>
  )
}
