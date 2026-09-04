'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Bell,
  Moon,
  Sun,
  Shield,
  Smartphone,
  Download,
  CheckCircle2,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export function FacultySettingsView({
  userName = 'Faculty Member',
  facultyId = 'FACULTY',
  designation = 'Faculty',
}: {
  userName?: string
  facultyId?: string
  designation?: string
}) {
  const [theme, setTheme] = useState<'light' | 'midnight'>('light')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [odAlerts, setOdAlerts] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('vsb-portal-theme')
    if (saved === 'midnight') {
      setTheme('midnight')
    }
  }, [])

  const handleToggleTheme = (newTheme: 'light' | 'midnight') => {
    setTheme(newTheme)
    localStorage.setItem('vsb-portal-theme', newTheme)
    if (newTheme === 'midnight') {
      document.documentElement.classList.add('midnight')
    } else {
      document.documentElement.classList.remove('midnight')
    }
  }

  const handleSavePreferences = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  const handleDownloadAcademicPortfolio = () => {
    generateAndDownloadPDF({
      title: 'FACULTY ACADEMIC & PROFILE SUMMARY',
      subtitle: `${userName} · Department of AI & DS · V.S.B. Engineering College`,
      author: `${userName} (${designation})`,
      category: 'Faculty Dossier',
      sections: [
        {
          heading: '1. FACULTY CREDENTIALS & ASSIGNMENTS',
          body: [
            `Faculty Name: ${userName}`,
            `Faculty ID: ${facultyId}`,
            `Designation: ${designation}`,
            'Department: Department of Artificial Intelligence & Data Science',
          ],
        },
      ],
      fileName: `${userName.replace(/\s+/g, '_')}_Portfolio`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Faculty Preferences
            </span>
            <span className="text-xs text-gray-300 font-medium">· Account &amp; Theme Controls</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Portal Settings &amp; Preferences</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {userName} · Manage alert notifications, theme appearance, and export academic portfolio
          </p>
        </div>

        <button
          onClick={handleDownloadAcademicPortfolio}
          className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
        >
          <Download className="w-4 h-4" /> Export Portfolio (PDF)
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Faculty settings and alert preferences saved successfully!</span>
        </div>
      )}

      {/* Theme Selection */}
      <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#071A3D] flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#1455D9]" /> Theme &amp; Visual Appearance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose your preferred workspace aesthetic</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleToggleTheme('light')}
              className={cn(
                'p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3',
                theme === 'light'
                  ? 'border-[#1455D9] bg-blue-50/50 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-amber-500 shadow-xs">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-[#071A3D]">Classic Light</p>
                <p className="text-[10px] text-gray-400">Clean institutional theme</p>
              </div>
            </button>

            <button
              onClick={() => handleToggleTheme('midnight')}
              className={cn(
                'p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3',
                theme === 'midnight'
                  ? 'border-[#22C7E8] bg-[#071A3D] text-white shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-[#071A3D] flex items-center justify-center text-[#22C7E8] shadow-xs">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className={cn('font-bold text-xs', theme === 'midnight' ? 'text-white' : 'text-[#071A3D]')}>
                  Midnight Navy
                </p>
                <p className="text-[10px] text-gray-400">Deep contrast night mode</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#071A3D] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1455D9]" /> Alert &amp; Communication Channels
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Control how and when you receive automated notifications</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div>
                <p className="font-bold text-xs text-[#071A3D]">Student On-Duty (OD) Instant Push</p>
                <p className="text-[11px] text-gray-500">Alerts when students submit hackathon / paper OD forms</p>
              </div>
              <input
                type="checkbox"
                checked={odAlerts}
                onChange={(e) => setOdAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#1455D9] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div>
                <p className="font-bold text-xs text-[#071A3D]">Email Notifications</p>
                <p className="text-[11px] text-gray-500">Receive exam schedules and HOD circulars via email</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#1455D9] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div>
                <p className="font-bold text-xs text-[#071A3D]">SMS Emergency Broadcasts</p>
                <p className="text-[11px] text-gray-500">Urgent college holiday and council notices on mobile</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#1455D9] cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSavePreferences}
              className="px-5 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
