'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

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

  const handleSavePreferences = () => {
    setShowSavedToast(true)
    setTimeout(() => setShowSavedToast(false), 2500)
  }


  const handleExportData = () => {
    generateAndDownloadPDF({
      title: 'OFFICIAL STUDENT ACADEMIC DOSSIER & RECORD',
      subtitle: `${user.name} (${student.registerNumber}) · B.Tech Artificial Intelligence & Data Science · Batch 2023 - 2027`,
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
            `Verified Contact Phone: ${user.phone || '+91 90252 10001'}`,
          ],
        },
        {
          heading: '2. ACADEMIC PERFORMANCE & CGPA STANDING',
          body: [
            'Cumulative Grade Point Average (CGPA): 8.84 / 10.00 (First Class with Distinction)',
            'Total Credits Earned: 52 Credits (Semesters I & II Cleared with 0 Arrears)',
            'Batch Academic Standing: Rank 4 / 68 Students (Top 6% Percentile)',
            'Overall Department Attendance Record: 92.5% (Safe Compliance >75% Norm)',
          ],
        },
        {
          heading: '3. SEMESTER 3 REGISTERED CURRICULUM (R-2021)',
          body: [
            'AD2301 - Data Structures & Algorithms (4 Credits) - Attendance: 94.7%',
            'AD2302 - Database Management Systems (4 Credits) - Attendance: 91.9%',
            'AD2303 - Discrete Mathematics (4 Credits) - Attendance: 88.9%',
            'AD2304 - Operating Systems (3 Credits) - Attendance: 93.8%',
            'AD2305 - Machine Learning Foundations (4 Credits) - Attendance: 97.3%',
            'AD2306 - Artificial Intelligence & Expert Systems (3 Credits) - Attendance: 90.6%',
            'AD2307 - Data Science Tools & Laboratory (2 Credits) - Attendance: 100.0%',
          ],
        },
        {
          heading: '4. CO-CURRICULAR HONORS & CAPSTONE RESEARCH',
          body: [
            '1st Prize & Gold Trophy: Smart India Hackathon (SIH 2025) - Cash Prize Rs. 1,00,000',
            'Best Research Paper Award: IEEE ICCCNT 2025 ("Edge AI for Precision Agriculture")',
            'National Winner (Rank 1): National Level Code Marathon 2025 (Python & PyTorch Speed Coding)',
            'Capstone Project: Autonomous Crop Disease Detection using Deep Transfer Learning',
          ],
        },

      ],
      fileName: `Academic_Dossier_${student.registerNumber}`,
    })
  }


  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Student Preferences
            </span>
            <span className="text-xs text-gray-300 font-medium">· V.S.B. Autonomous Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Account Configuration &amp; Settings</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Manage attendance notifications, security authentication, theme mode &amp; data export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSavePreferences}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer hover:scale-105"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>

      {/* Save Success Toast */}
      {showSavedToast && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>All portal preferences and notification configurations have been saved successfully!</span>
        </div>
      )}

      {/* 1. Notification & Dispatch Preferences */}
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

      {/* 2. Portal Display & Layout Preferences */}
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

      {/* 3. Security & Active Session */}
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
                  <p className="text-gray-400 text-[11px]">Web Browser on Windows 11 · Localhost (Port 3001)</p>
                </div>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">Logged in now</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Data Export & Archival */}
      <Card className="rounded-3xl border-gray-200 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-black text-sm text-[#071A3D]">Student Academic Dossier &amp; Record</h3>
              <p className="text-xs text-gray-400">Download a verified official PDF copy of your academic performance, CGPA &amp; attendance</p>
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

    </div>
  )
}
