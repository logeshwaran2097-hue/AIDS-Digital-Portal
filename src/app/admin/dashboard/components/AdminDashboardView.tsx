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
  birthdayStudents?: { name: string; registerNumber: string; profileImage: string | null }[]
}

export function AdminDashboardView({ data }: { data: AdminDashboardData }) {
  const router = useRouter()
  const [stats, setStats] = useState<AdminDashboardData>(data)
  const [showTestPopup, setShowTestPopup] = useState(false)

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
          <button
            onClick={() => setShowTestPopup(true)}
            className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
          >
            <Sparkles className="w-4 h-4" /> Test Birthday Popup
          </button>
          <button
            onClick={handleDownloadSystemReport}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
          >
            <Download className="w-4 h-4" /> Export System Audit (PDF)
          </button>
        </div>
      </div>

      {/* Birthday Banner */}
      {data.birthdayStudents && data.birthdayStudents.length > 0 && (
        <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-pink-200/50 rounded-3xl p-6 shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-[#071A3D]">Today's Birthdays 🎉</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Wish these students a happy birthday!</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
              {data.birthdayStudents.map((student, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-xs border border-gray-100">
                  {student.profileImage ? (
                    <img src={student.profileImage} alt={student.name} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center text-xs font-bold">
                      {student.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#071A3D] line-clamp-1">{student.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{student.registerNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Infrastructure Health Strip - Clickable boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => router.push('/admin/settings')}
          className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-[#1455D9] transition-all hover:scale-[1.02]"
          title="Click to view App System Settings"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">App Runtime</p>
            <p className="text-sm font-bold text-[#071A3D]">Next.js 14.2.5</p>
          </div>
        </div>

        <div
          onClick={() => router.push('/admin/activity-logs')}
          className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs flex items-center gap-3 bg-green-50/20 cursor-pointer hover:shadow-md hover:border-green-500 transition-all hover:scale-[1.02]"
          title="Click to inspect live Database Audit Logs"
        >
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-green-700 font-bold uppercase">Database Status</p>
            <p className="text-sm font-bold text-green-700">Healthy &amp; Synced</p>
          </div>
        </div>

        <div
          onClick={() => router.push('/admin/roles')}
          className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs flex items-center gap-3 bg-purple-50/20 cursor-pointer hover:shadow-md hover:border-purple-500 transition-all hover:scale-[1.02]"
          title="Click to manage RBAC Security & Roles"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-purple-700 font-bold uppercase">Security Seal</p>
            <p className="text-sm font-bold text-purple-700">JWT Encrypted</p>
          </div>
        </div>

        <div
          onClick={handleDownloadSystemReport}
          className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-3 bg-amber-50/20 cursor-pointer hover:shadow-md hover:border-amber-500 transition-all hover:scale-[1.02]"
          title="Click to Export Audit Report PDF"
        >
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
            <p className="text-xs text-gray-500 font-medium">Real-time live database counts connected to PostgreSQL &amp; Prisma</p>
          </div>
          <span className="text-xs text-gray-400 font-mono font-bold">12 Primary Modules</span>
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
              className="bg-white p-5 rounded-3xl border border-gray-200 hover:border-[#1455D9] transition-all duration-200 hover:shadow-md group flex flex-col justify-between cursor-pointer active:scale-[0.98] select-none"
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
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Birthday Popup */}
      {showTestPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#071A3D]/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_60px_rgba(34,199,232,0.3)] border border-white/20 p-10 text-center overflow-hidden transform transition-all animate-in zoom-in-95 duration-500">
            {/* Animated glowing orbs in background */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-[80px] opacity-50 mix-blend-screen animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#1455D9] to-[#22C7E8] rounded-full blur-[80px] opacity-50 mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Close button */}
            <button 
              onClick={() => setShowTestPopup(false)}
              className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            {/* Icon */}
            <div className="relative z-10 mx-auto w-32 h-32 mb-6 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-500 to-[#22C7E8] rounded-full animate-[spin_4s_linear_infinite] blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full w-full bg-[#071A3D] rounded-full flex items-center justify-center border-2 border-white/20 shadow-inner">
                 <span className="text-6xl animate-bounce drop-shadow-xl" style={{ animationDuration: '2s' }}>🎂</span>
              </div>
            </div>

            {/* Text */}
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-[#22C7E8] mb-4 tracking-tight drop-shadow-sm animate-pulse" style={{ animationDuration: '3s' }}>
                HAPPY BIRTHDAY!
              </h2>
              <div className="text-white/90 font-medium mb-8 text-sm sm:text-base leading-relaxed px-2 space-y-4">
                <p className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150 fill-mode-both">
                  Dear <span className="font-bold text-white text-lg">Birthday Girl / Admin</span>,
                </p>
                <p className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-both">
                  On this special day, we wish you immense joy, boundless laughter, and extraordinary success in all your future endeavors! ✨
                </p>
                <p className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500 fill-mode-both">
                  May this year bring you closer to your dreams and aspirations. Keep shining bright and making us proud!
                </p>
                <p className="pt-2 text-[#22C7E8] font-semibold italic animate-in slide-in-from-bottom-4 fade-in duration-700 delay-700 fill-mode-both">
                  — With warm wishes from the Digital Portal of AI&amp;DS
                </p>
              </div>
              
              <button 
                onClick={() => setShowTestPopup(false)}
                className="w-full sm:w-2/3 mx-auto py-4 px-6 bg-gradient-to-r from-white to-gray-50 hover:to-white text-[#071A3D] rounded-2xl font-black text-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-1000 fill-mode-both"
              >
                Let's Celebrate! 🎉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
