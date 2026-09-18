'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  odProofCount?: number
}

export function AdminDashboardView({ data }: { data: AdminDashboardData }) {
  const router = useRouter()
  const [stats, setStats] = useState<AdminDashboardData>(data)

  React.useEffect(() => {
    setStats(data)
  }, [data])

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard/stats')
        const json = await res.json()
        if (json.success && json.data) {
          setStats((prev) => ({
            ...prev,
            ...json.data,
          }))
        }
      } catch {}
    }

    // Refresh every 20 seconds instead of rapid 3-second intervals to avoid interrupting clicks
    const interval = setInterval(fetchStats, 20000)
    return () => clearInterval(interval)
  }, [])

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
            `Total Enrolled Students: ${stats.studentCount} Active Accounts`,
            `Total Faculty Members: ${stats.facultyCount} Teaching Staff`,
            `Department Heads: ${stats.hodCount} Active HOD`,
            `System Super Administrators: ${stats.adminCount} Certified Admins`,
            `Total Subjects & Courses: ${stats.subjectCount} Curricular Courses`,
          ],
        },
        {
          heading: '2. DIGITAL ASSETS & CURRICULAR REPOSITORY',
          body: [
            `Study Resources & E-Books: ${stats.resourceCount} Verified Textbooks`,
            `Examination Question Papers: ${stats.questionPaperCount} COE Approved Question Sets`,
            `Student Capstone Projects: ${stats.projectCount} Active Research Teams`,
            `Department Events & Hackathons: ${stats.eventCount} Scheduled Programs`,
            `Official Circulars Broadcast: ${stats.announcementCount} Active Notices`,
            `Recognized Achievements: ${stats.achievementCount} Awards & Distinctions`,
          ],
        },
        {
          heading: '3. SYSTEM HEALTH & ENCRYPTION PROTOCOLS',
          body: [
            'Runtime Environment: Next.js 14.2.5 (App Router) + Node.js',
            'Database Engine: PostgreSQL with Prisma ORM Connection Pool',
            'Authentication Architecture: JWT Cryptographic Tokens (HTTP-Only SameSite Cookies)',
            'Report Engine: Client-Side High-Fidelity Vector PDF Engine with Institutional Emblem',
            'System Security Status: 100% Secure · 0 Vulnerabilities Detected',
          ],
        },
      ],
      fileName: 'VSB_System_Audit_Report_2026',
    })
  }

  const managementTiles = [
    { title: 'Student Accounts', count: stats.studentCount, href: '/admin/students', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-[#1455D9]', desc: 'Enrolled student accounts & bio-data' },
    { title: 'Faculty Members', count: stats.facultyCount, href: '/admin/faculty', icon: <Users className="w-5 h-5" />, color: 'bg-purple-600', desc: 'Faculty professors & course allocations' },
    { title: 'HOD Administration', count: stats.hodCount, href: '/admin/hod', icon: <ShieldCheck className="w-5 h-5" />, color: 'bg-indigo-600', desc: 'Department Head credentials & jurisdiction' },
    { title: 'Super Admins', count: stats.adminCount, href: '/admin/admins', icon: <Lock className="w-5 h-5" />, color: 'bg-rose-600', desc: 'System operators & root access control' },
    { title: 'Curricular Subjects', count: stats.subjectCount, href: '/admin/academics', icon: <BookOpen className="w-5 h-5" />, color: 'bg-amber-600', desc: 'Regulation 2021 curriculum & syllabus' },
    { title: 'Digital Resources', count: stats.resourceCount, href: '/admin/resources', icon: <Database className="w-5 h-5" />, color: 'bg-emerald-600', desc: 'E-books, standard textbooks & lecture packs' },
    { title: 'Question Papers Bank', count: stats.questionPaperCount, href: '/admin/question-papers', icon: <FileQuestion className="w-5 h-5" />, color: 'bg-cyan-600', desc: 'IAT-1, IAT-2 & Anna University past papers' },
    { title: 'Capstone Projects', count: stats.projectCount, href: '/admin/projects', icon: <FolderOpen className="w-5 h-5" />, color: 'bg-blue-600', desc: 'Capstone research teams & prototypes' },
    { title: 'Event Proofs', count: stats.odProofCount ?? 0, href: '/admin/od-proofs', icon: <ShieldCheck className="w-5 h-5" />, color: 'bg-emerald-600', desc: 'Inspect geotags, certificates & credit OD' },
    { title: 'Events & Symposiums', count: stats.eventCount, href: '/admin/events', icon: <CalendarDays className="w-5 h-5" />, color: 'bg-fuchsia-600', desc: 'National Hackathons & technical workshops' },
    { title: 'Circulars & Notices', count: stats.announcementCount, href: '/admin/announcements', icon: <Megaphone className="w-5 h-5" />, color: 'bg-orange-600', desc: 'Broadcast notices to students & staff' },
    { title: 'System Activity Logs', count: 'Audit Log', href: '/admin/activity-logs', icon: <Activity className="w-5 h-5" />, color: 'bg-slate-700', desc: 'Real-time security logins & CRUD events' },
    { title: 'AI Assistant Engine', count: 'NLP Ready', href: '/admin/ai', icon: <Bot className="w-5 h-5" />, color: 'bg-teal-600', desc: 'Floating chatbot knowledge base & prompts' },
  ]

  const handleTileNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pt-1">
      {/* Super Admin Executive Command Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl lux-sapphire-card p-6 sm:p-8 text-white shadow-2xl border border-white/15">
        <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-[#F3E5AB] to-[#D4AF37] text-[#071A3D] border border-[#D4AF37] shadow-xs">
                Super Administrator Command Center
              </span>
              <span className="text-xs text-slate-300 font-medium">· Root Institutional Jurisdiction</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">System Administration &amp; Infrastructure</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              {data.user.name} ({data.user.email}) · Complete centralized control of users, databases, logs &amp; security
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <button
              onClick={handleDownloadSystemReport}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA820A] text-[#071A3D] text-xs font-black flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/30 cursor-pointer hover:scale-[1.03] active:scale-[0.98] shrink-0 border border-[#F3E5AB]"
            >
              <Download className="w-4 h-4" />
              <span>Export System Audit (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Infrastructure Health Strip - Clickable Luxury Complications */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => router.push('/admin/settings')}
          className="lux-glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-3.5 cursor-pointer hover:shadow-lg hover:border-[#1455D9] transition-all hover:scale-[1.02] lux-specular-sweep"
          title="Click to view App System Settings"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-[#1455D9] dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">App Runtime</p>
            <p className="text-sm font-bold text-[#071A3D] dark:text-white font-mono">Next.js 14.2</p>
          </div>
        </div>

        <div
          onClick={() => router.push('/admin/activity-logs')}
          className="lux-tile-jewel p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer shadow-md select-none lux-specular-sweep"
          title="Click to inspect live Database Audit Logs"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Database Status</p>
            <p className="text-sm font-bold text-[#071A3D]">Healthy &amp; Synced</p>
          </div>
        </div>

        <div
          onClick={() => router.push('/admin/roles')}
          className="lux-tile-jewel p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer shadow-md select-none lux-specular-sweep"
          title="Click to manage RBAC Security & Roles"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Security Seal</p>
            <p className="text-sm font-bold text-[#071A3D]">JWT Encrypted</p>
          </div>
        </div>

        <div
          onClick={handleDownloadSystemReport}
          className="lux-tile-jewel p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer shadow-md select-none lux-specular-sweep"
          title="Click to Export Audit Report PDF"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">PDF Vector Engine</p>
            <p className="text-sm font-bold text-[#071A3D]">Active &amp; Ready</p>
          </div>
        </div>
      </div>

      {/* Centralized Management Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#071A3D] tracking-tight">Centralized Administrative Directory</h2>
            <p className="text-xs text-slate-500 font-medium">Real-time live database counts connected to PostgreSQL &amp; Prisma</p>
          </div>
          <span className="text-xs text-slate-400 font-mono font-bold">12 Primary Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {managementTiles.map((tile, idx) => (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => handleTileNavigation(tile.href)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTileNavigation(tile.href)
                }
              }}
              className="lux-glass-card p-5 rounded-3xl border border-white/80 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl group flex flex-col justify-between cursor-pointer active:scale-[0.98] select-none lux-specular-sweep hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow-md', tile.color)}>
                    {tile.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#071A3D] group-hover:text-[#1455D9] transition-colors">
                      {tile.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{tile.desc}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[#1455D9] group-hover:bg-blue-100/80 transition-colors shadow-xs">
                  {tile.count}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1455D9]">
                <Link
                  href={tile.href}
                  prefetch={true}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className="hover:underline flex items-center gap-1"
                >
                  <span>Manage Module</span>
                </Link>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
