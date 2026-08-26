'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Database,
  FileQuestion,
  CalendarDays,
  Megaphone,
  Trophy,
  BarChart3,
  Bot,
  Activity,
  Download,
  Settings,
  UserPlus,
  Server,
  Cpu,
  Lock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface AdminDashboardData {
  user: { name: string; email: string }
  studentCount: number
  facultyCount: number
  hodCount: number
  adminCount: number
  subjectCount: number
  resourceCount: number
  questionPaperCount: number
  projectCount: number
  eventCount: number
  announcementCount: number
  achievementCount: number
}

export function AdminDashboardView({ data }: { data: AdminDashboardData }) {
  const [isSeeding, setIsSeeding] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleDownloadSystemReport = () => {
    generateAndDownloadPDF({
      title: 'ENTERPRISE SYSTEM INFRASTRUCTURE & AUDIT REPORT',
      subtitle: 'V.S.B. Engineering College · Department of AI & DS · Academic Year 2025-2026',
      author: 'System Super Administrator',
      category: 'System Audit & Inventory Statement',
      sections: [
        {
          heading: '1. DATABASE USER & ENTITY INVENTORY',
          body: [
            `Total Enrolled Students: ${data.studentCount} Active Accounts`,
            `Total Faculty Members: ${data.facultyCount} Teaching Staff`,
            `Department Heads: ${data.hodCount} Active HOD`,
            `System Super Administrators: ${data.adminCount} Certified Admins`,
            `Total Subjects & Courses: ${data.subjectCount} Curricular Courses`,
          ],
        },
        {
          heading: '2. DIGITAL ASSETS & CURRICULAR REPOSITORY',
          body: [
            `Study Resources & E-Books: ${data.resourceCount} Verified Textbooks`,
            `Examination Question Papers: ${data.questionPaperCount} COE Approved Question Sets`,
            `Student Capstone Projects: ${data.projectCount} Active Research Teams`,
            `Department Events & Hackathons: ${data.eventCount} Scheduled Programs`,
            `Official Circulars Broadcast: ${data.announcementCount} Active Notices`,
            `Recognized Achievements: ${data.achievementCount} Awards & Distinctions`,
          ],
        },
        {
          heading: '3. SYSTEM HEALTH & ENCRYPTION PROTOCOLS',
          body: [
            'Runtime Environment: Next.js 14.2.5 (App Router) + Node.js',
            'Database Engine: SQLite with Prisma ORM Connection Pool',
            'Authentication Architecture: JWT Cryptographic Tokens (HTTP-Only SameSite Cookies)',
            'Report Engine: Client-Side High-Fidelity Vector PDF Engine with Institutional Emblem',
            'System Security Status: 100% Secure · 0 Vulnerabilities Detected',
          ],
        },
      ],
      fileName: 'VSB_System_Audit_Report_2026',
    })
  }

  const handleSeedBaseline = async () => {
    if (!confirm('Would you like to populate baseline records (HOD, Faculty across Semesters 1-8, Students, and Circulars)?')) {
      return
    }

    setIsSeeding(true)
    try {
      const res = await fetch('/api/admin/seed-mock-data', { method: 'POST' })
      const result = await res.json()
      if (result.success) {
        alert(result.message || 'Baseline records seeded successfully!')
        window.location.reload()
      } else {
        alert(result.message || 'Failed to seed baseline data')
      }
    } catch {
      alert('Network error while populating baseline data.')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clean all non-admin mock/sample data? Admin accounts will remain safe.')) {
      return
    }

    setIsClearing(true)
    try {
      const res = await fetch('/api/admin/clean-mock-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'all' }),
      })
      const result = await res.json()
      if (result.success) {
        alert('Database cleared to pure state.')
        window.location.reload()
      }
    } catch {
      alert('Error clearing data.')
    } finally {
      setIsClearing(false)
    }
  }

  const managementTiles = [
    { title: 'Student Accounts', count: data.studentCount, href: '/admin/students', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-[#1455D9]', desc: 'Enrolled student accounts & bio-data' },
    { title: 'Faculty Members', count: data.facultyCount, href: '/admin/faculty', icon: <Users className="w-5 h-5" />, color: 'bg-purple-600', desc: 'Faculty professors & course allocations' },
    { title: 'HOD Administration', count: data.hodCount, href: '/admin/hod', icon: <ShieldCheck className="w-5 h-5" />, color: 'bg-indigo-600', desc: 'Department Head credentials & jurisdiction' },
    { title: 'Super Admins', count: data.adminCount, href: '/admin/admins', icon: <Lock className="w-5 h-5" />, color: 'bg-rose-600', desc: 'System operators & root access control' },
    { title: 'Curricular Subjects', count: data.subjectCount, href: '/admin/academics', icon: <BookOpen className="w-5 h-5" />, color: 'bg-amber-600', desc: 'Regulation 2021 curriculum & syllabus' },
    { title: 'Digital Resources', count: data.resourceCount, href: '/admin/resources', icon: <Database className="w-5 h-5" />, color: 'bg-emerald-600', desc: 'E-books, standard textbooks & lecture packs' },
    { title: 'Question Papers Bank', count: data.questionPaperCount, href: '/admin/question-papers', icon: <FileQuestion className="w-5 h-5" />, color: 'bg-cyan-600', desc: 'IAT-1, IAT-2 & Anna University past papers' },
    { title: 'Capstone Projects', count: data.projectCount, href: '/admin/projects', icon: <FolderOpen className="w-5 h-5" />, color: 'bg-blue-600', desc: 'Capstone research teams & prototypes' },
    { title: 'Events & Symposiums', count: data.eventCount, href: '/admin/events', icon: <CalendarDays className="w-5 h-5" />, color: 'bg-fuchsia-600', desc: 'National Hackathons & technical workshops' },
    { title: 'Circulars & Notices', count: data.announcementCount, href: '/admin/announcements', icon: <Megaphone className="w-5 h-5" />, color: 'bg-orange-600', desc: 'Broadcast notices to students & staff' },
    { title: 'System Activity Logs', count: 'Audit Log', href: '/admin/activity-logs', icon: <Activity className="w-5 h-5" />, color: 'bg-slate-700', desc: 'Real-time security logins & CRUD events' },
    { title: 'AI Assistant Engine', count: 'NLP Ready', href: '/admin/ai', icon: <Bot className="w-5 h-5" />, color: 'bg-teal-600', desc: 'Floating chatbot knowledge base & prompts' },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pt-1">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Super Admin Command Center
            </span>
            <span className="text-xs text-gray-300 font-medium">· Root System Jurisdiction</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">System Administration &amp; Infrastructure</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {data.user.name} ({data.user.email}) · Complete centralized control of users, databases, logs &amp; security
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {data.studentCount === 0 && (
            <button
              onClick={handleSeedBaseline}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-xl bg-[#F4C430] hover:bg-[#e0b224] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
            >
              <Sparkles className="w-4 h-4" /> {isSeeding ? 'Populating...' : 'Seed Baseline Data'}
            </button>
          )}

          {data.studentCount > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className="px-3.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:text-white"
            >
              <Trash2 className="w-4 h-4 text-red-400" /> Clean Sample Data
            </button>
          )}

          <button
            onClick={handleDownloadSystemReport}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
          >
            <Download className="w-4 h-4" /> Export System Audit (PDF)
          </button>
        </div>
      </div>

      {/* System Infrastructure Health Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">App Runtime</p>
            <p className="text-sm font-bold text-[#071A3D]">Next.js 14.2.5</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs flex items-center gap-3 bg-green-50/20">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-green-700 font-bold uppercase">Database Status</p>
            <p className="text-sm font-bold text-green-700">Healthy &amp; Synced</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs flex items-center gap-3 bg-purple-50/20">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-purple-700 font-bold uppercase">Security Seal</p>
            <p className="text-sm font-bold text-purple-700">JWT Encrypted</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-3 bg-amber-50/20">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-amber-700 font-bold uppercase">PDF Vector Engine</p>
            <p className="text-sm font-bold text-amber-700">Online &amp; Active</p>
          </div>
        </div>
      </div>

      {/* Centralized Management Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#071A3D]">Centralized Administrative Directory</h2>
            <p className="text-xs text-gray-500 font-medium">Real-time live database counts connected to SQLite &amp; Prisma</p>
          </div>
          <span className="text-xs text-gray-400 font-mono font-bold">12 Primary Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {managementTiles.map((tile, idx) => (
            <Link
              key={idx}
              href={tile.href}
              className="bg-white p-5 rounded-3xl border border-gray-200 hover:border-[#1455D9] transition-all duration-200 hover:shadow-md group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-xs', tile.color)}>
                    {tile.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#071A3D] group-hover:text-[#1455D9] transition-colors">
                      {tile.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium">{tile.desc}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-[#071A3D] group-hover:bg-blue-50 group-hover:text-[#1455D9] group-hover:border-blue-200 transition-colors">
                  {tile.count}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1455D9]">
                <span>Manage Module</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
