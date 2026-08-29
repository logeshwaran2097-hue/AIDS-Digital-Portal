'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Settings,
  Bell,
  Shield,
  Smartphone,
  Eye,
  Download,
  Trash2,
  CheckCircle2,
  Lock,
  Moon,
  Laptop,
  Save,
  Sparkles,
  Mail,
  Key,
  Link as LinkIcon,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  FileText,
  Code2,
  Plus,
  Copy,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

interface CustomLink {
  id: string
  title: string
  url: string
  category: 'coding' | 'portfolio' | 'academic' | 'custom'
}

export function StudentSettingsView({
  user,
  student,
}: {
  user: { name: string; email: string; phone?: string | null }
  student: { registerNumber: string; year: number; semester: number; section: string }
}) {
  // Preference States
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [examAlerts, setExamAlerts] = useState(true)
  const [hackathonReminders, setHackathonReminders] = useState(true)
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'midnight'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('vsb-portal-theme') as any) || 'light'
    }
    return 'light'
  })
  const [defaultLanding, setDefaultLanding] = useState('dashboard')
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Helper to provide clean input placeholders without forcing dummy values
  const getLinkPlaceholder = (id: string) => {
    switch (id) {
      case 'github':
        return 'https://github.com/your-username'
      case 'linkedin':
        return 'https://linkedin.com/in/your-profile'
      case 'leetcode':
        return 'https://leetcode.com/u/your-username'
      case 'portfolio':
        return 'https://your-portfolio-site.vercel.app'
      case 'annauniv':
        return 'https://coe1.annauniv.edu'
      case 'vsbcollege':
        return 'https://vsbec.com'
      default:
        return 'https://...'
    }
  }

  // Editable Links State
  const [links, setLinks] = useState<CustomLink[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vsb_student_links')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Clean up any stale placeholder links from earlier builds
            return parsed.map((item: CustomLink) => {
              if (
                item.url &&
                (item.url.includes('logeshwaran') ||
                  item.url.includes('example.com'))
              ) {
                return { ...item, url: '' }
              }
              return item
            })
          }
        } catch {
          // fallback
        }
      }
    }
    return [
      {
        id: 'github',
        title: 'GitHub Developer Profile',
        url: '',
        category: 'coding',
      },
      {
        id: 'linkedin',
        title: 'LinkedIn Professional Profile',
        url: '',
        category: 'portfolio',
      },
      {
        id: 'leetcode',
        title: 'LeetCode Problem Solving Profile',
        url: '',
        category: 'coding',
      },
      {
        id: 'portfolio',
        title: 'Personal Portfolio & Resume',
        url: '',
        category: 'portfolio',
      },
      {
        id: 'annauniv',
        title: 'Anna University CoE Examination Portal',
        url: '',
        category: 'academic',
      },
      {
        id: 'vsbcollege',
        title: 'V.S.B. Engineering College Official Site',
        url: '',
        category: 'academic',
      },
    ]
  })

  // New Custom Link State
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newCategory, setNewCategory] = useState<'coding' | 'portfolio' | 'academic' | 'custom'>('custom')
  const [showAddModal, setShowAddModal] = useState(false)

  const handleThemeChange = (newTheme: 'system' | 'light' | 'midnight') => {
    setThemeMode(newTheme)
    try {
      localStorage.setItem('vsb-portal-theme', newTheme)
      if (newTheme === 'midnight') {
        document.documentElement.classList.add('midnight')
      } else if (newTheme === 'light') {
        document.documentElement.classList.remove('midnight')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('midnight')
        } else {
          document.documentElement.classList.remove('midnight')
        }
      }
    } catch (e) {
      console.error('Failed to set theme:', e)
    }
  }

  const handleLinkChange = (id: string, newUrl: string) => {
    const updated = links.map((link) => (link.id === id ? { ...link, url: newUrl } : link))
    setLinks(updated)
    try {
      localStorage.setItem('vsb_student_links', JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newUrl.trim()) return

    let formattedUrl = newUrl.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }

    const newLink: CustomLink = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      url: formattedUrl,
      category: newCategory,
    }

    const updated = [...links, newLink]
    setLinks(updated)
    try {
      localStorage.setItem('vsb_student_links', JSON.stringify(updated))
    } catch {
      // ignore
    }

    setNewTitle('')
    setNewUrl('')
    setShowAddModal(false)
    setShowSavedToast(true)
    setTimeout(() => setShowSavedToast(false), 2500)
  }

  const handleDeleteLink = (id: string) => {
    const updated = links.filter((link) => link.id !== id)
    setLinks(updated)
    try {
      localStorage.setItem('vsb_student_links', JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSavePreferences = () => {
    try {
      localStorage.setItem('vsb_student_links', JSON.stringify(links))
    } catch {
      // ignore
    }
    setShowSavedToast(true)
    setTimeout(() => setShowSavedToast(false), 2500)
  }

  const handleExportData = () => {
    generateAndDownloadPDF({
      title: 'OFFICIAL STUDENT ACADEMIC DOSSIER & RECORD',
      subtitle: `${user.name} (${student.registerNumber}) · B.Tech Artificial Intelligence & Data Science`,
      author: 'Office of the Academic Registrar & HOD',
      category: 'Institutional Transcript Dossier',
      sections: [
        {
          heading: '1. STUDENT ENROLLMENT & IDENTITY PARTICULARS',
          body: [
            `Student Name: ${user.name}`,
            `Register Number: ${student.registerNumber}`,
            `Academic Degree: Bachelor of Technology (B.Tech) in AI & DS`,
            `Academic Regulation: R-2021 (Autonomous Framework)`,
            `Current Standing: Year ${student.year} · Semester ${student.semester} · Section ${student.section}`,
            `Institutional Email: ${user.email}`,
            `Verified Contact Phone: ${user.phone || 'Not Provided'}`,
          ],
        },
        {
          heading: '2. ACADEMIC & INSTITUTIONAL SUMMARY',
          body: [
            `Current Standing: Year ${student.year} · Semester ${student.semester} · Section ${student.section}`,
            `Department: B.Tech Artificial Intelligence & Data Science`,
            'Status: Active Student Academic Record',
          ],
        },
        {
          heading: '3. VERIFIED PORTFOLIO & PROFILES',
          body: links.filter(l => l.url).length > 0
            ? links.filter(l => l.url).map((l) => `${l.title}: ${l.url}`)
            : ['No custom portfolio links configured yet.'],
        },
      ],
      fileName: `Academic_Dossier_${student.registerNumber}`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Student Preferences &amp; Links
            </span>
            <span className="text-xs text-gray-300 font-medium">· V.S.B. Autonomous Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Account Configuration &amp; Links</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Manage your editable portfolio links, coding profiles, notifications, and portal display
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSavePreferences}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer hover:scale-105"
          >
            <Save className="w-4 h-4" /> Save All Changes
          </button>
        </div>
      </div>

      {/* Save Success Toast */}
      {showSavedToast && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>All portal links and configuration preferences have been saved successfully!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. EDITABLE QUICK LINKS & PORTFOLIO LINKS MANAGER (NEW FEATURE) */}
      {/* ========================================================================= */}
      <Card className="rounded-3xl border-gray-200 shadow-xs overflow-hidden">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1455D9] flex items-center justify-center">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#071A3D]">Editable Portfolio &amp; Profile Links</h3>
                <p className="text-[11px] text-gray-400">
                  Update and manage your GitHub, LinkedIn, LeetCode, and custom project repository links
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b2] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Custom Link
            </button>
          </div>

          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="p-4 rounded-2xl bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {link.category === 'coding' && <Code2 className="w-4 h-4 text-purple-600 shrink-0" />}
                    {link.category === 'portfolio' && <Globe className="w-4 h-4 text-blue-600 shrink-0" />}
                    {link.category === 'academic' && <FileText className="w-4 h-4 text-amber-600 shrink-0" />}
                    {link.category === 'custom' && <LinkIcon className="w-4 h-4 text-emerald-600 shrink-0" />}
                    <span className="text-xs font-bold text-[#071A3D] truncate">{link.title}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-semibold text-gray-500 uppercase">
                      {link.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Copy Link Button */}
                    <button
                      type="button"
                      disabled={!link.url}
                      onClick={() => handleCopyLink(link.id, link.url)}
                      className={cn(
                        'p-1.5 rounded-lg bg-white border transition-colors',
                        link.url
                          ? 'border-gray-200 text-gray-500 hover:text-[#1455D9] cursor-pointer'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                      )}
                      title={link.url ? 'Copy URL' : 'Enter a URL first'}
                    >
                      {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Test & Open Link */}
                    {link.url ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Open</span>
                      </a>
                    ) : (
                      <span
                        className="p-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-400 flex items-center gap-1 text-[11px] font-bold cursor-not-allowed opacity-50"
                        title="Enter a URL first"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Open</span>
                      </span>
                    )}

                    {/* Delete Custom Link */}
                    {link.id.startsWith('custom-') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1.5 rounded-lg bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Editable URL Input */}
                <div className="relative">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(link.id, e.target.value)}
                    placeholder={getLinkPlaceholder(link.id)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1455D9] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 2. Notification & Dispatch Preferences */}
      {/* ========================================================================= */}
      <Card className="rounded-3xl border-gray-200 shadow-xs">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-[#1455D9]/10 text-[#1455D9] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#071A3D]">Notifications &amp; Automated Alerts</h3>
              <p className="text-[11px] text-gray-400">Configure how and when the portal alerts you and your guardians</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[#071A3D]">SMS Absence &amp; Attendance Dispatch</p>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  Sends automated SMS to registered guardian phone if marked absent during daily roll call (05:00 PM)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1455D9]"></div>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[#071A3D]">Official Circulars &amp; Examination Notices</p>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  Receive instant institutional email notifications for Anna University exam timetables and circulars
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1455D9]"></div>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[#071A3D]">IAT-1 &amp; IAT-2 Mark Publication Alerts</p>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  Notification banner when faculty publishes internal test marks and answer evaluations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={examAlerts}
                  onChange={(e) => setExamAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1455D9]"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 3. Portal Display & Layout Preferences */}
      {/* ========================================================================= */}
      <Card className="rounded-3xl border-gray-200 shadow-xs">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#071A3D]">Display &amp; Interface Preferences</h3>
              <p className="text-[11px] text-gray-400">Customize dashboard starting views and visual themes</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <label className="font-bold text-[#071A3D] block">Default Starting Module</label>
              <select
                value={defaultLanding}
                onChange={(e) => setDefaultLanding(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#071A3D]"
              >
                <option value="dashboard">Home Dashboard Overview</option>
                <option value="attendance">Biometric Attendance Log</option>
                <option value="study">Study Details &amp; Syllabus</option>
                <option value="resources">Digital Library &amp; E-Books</option>
              </select>
              <p className="text-[10px] text-gray-400">Page to load after student sign-in</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <label className="font-bold text-[#071A3D] block">Theme Appearance</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'light', label: 'Light' },
                  { id: 'midnight', label: 'Navy' },
                  { id: 'system', label: 'System' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleThemeChange(t.id as any)}
                    className={cn(
                      'py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center',
                      themeMode === t.id
                        ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400">Portal color scheme palette</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 4. Security & Active Session */}
      {/* ========================================================================= */}
      <Card className="rounded-3xl border-gray-200 shadow-xs">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#071A3D]">Security &amp; Session Management</h3>
              <p className="text-[11px] text-gray-400">Verified credentials and active device authentication</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1455D9]/10 text-[#1455D9] flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#071A3D]">Student Register Number</p>
                  <p className="text-gray-400 font-mono text-[11px]">{student.registerNumber} (Verified)</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                Active Session
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#071A3D]">Current Device</p>
                  <p className="text-gray-400 text-[11px]">Web Browser · Vercel Production Environment</p>
                </div>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">Logged in now</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 5. Data Export & Archival */}
      {/* ========================================================================= */}
      <Card className="rounded-3xl border-gray-200 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-black text-sm text-[#071A3D]">Student Academic Dossier &amp; Record</h3>
              <p className="text-xs text-gray-400">Download a verified official PDF copy of your academic performance, links &amp; attendance</p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" /> Download Academic Dossier (PDF)
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM LINK */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-base text-[#071A3D] flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#1455D9]" />
                Add Custom Profile / Resource Link
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLink} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Link Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HackerRank / Kaggle / Project Repo"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1455D9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">URL Address</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1455D9]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1455D9]"
                >
                  <option value="coding">Coding &amp; Problem Solving</option>
                  <option value="portfolio">Portfolio &amp; Social</option>
                  <option value="academic">Academic &amp; Research</option>
                  <option value="custom">Custom Project Link</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1455D9] text-white font-bold hover:bg-[#0f44b2] shadow-xs"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
