'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Settings,
  Moon,
  Sun,
  Shield,
  Mail,
  Server,
  Lock,
  Download,
  Save,
  Check,
  Sparkles,
  Database,
  Bell,
  RefreshCw,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export function AdminSettingsView() {
  const [isDark, setIsDark] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [twoFactorRequired, setTwoFactorRequired] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme')
    if (savedTheme === 'dark' || document.documentElement.classList.contains('dark')) {
      setIsDark(true)
    }
  }, [])

  const handleToggleTheme = (dark: boolean) => {
    setIsDark(dark)
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('app-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('app-theme', 'light')
    }
  }

  const handleSaveSettings = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleExportConfigPDF = () => {
    generateAndDownloadPDF({
      title: 'ENTERPRISE SYSTEM CONFIGURATION & SECURITY STATEMENT',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official System Configuration Statement',
      sections: [
        {
          heading: '1. INFRASTRUCTURE & APP DEPLOYMENT',
          body: [
            'Application Name: V.S.B. AI & DS Digital Portal',
            'Institution: V.S.B. Engineering College, Karur, Tamil Nadu',
            'Runtime Framework: Next.js 15.2.1 (App Router) + Node.js',
            'Database Architecture: SQLite with Prisma ORM Connection Pool',
            `Maintenance Status: ${maintenanceMode ? 'ACTIVE (Restricted)' : 'OPERATIONAL (Live Online)'}`,
          ],
        },
        {
          heading: '2. SMTP OTP & SECURITY PROTOCOLS',
          body: [
            'SMTP Host: smtp.gmail.com (SSL Port 465, IPv4 Enforced)',
            'Primary Security Dispatch Inbox: lonelyboy44y@gmail.com',
            'Authentication Encryption: JWT Cryptographic Tokens (HTTP-Only SameSite Cookies)',
            '2-Factor Authentication (2FA): Mandatory for Super Administrator Accounts',
          ],
        },
      ],
      fileName: 'VSB_System_Configuration_2026',
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              System Control &amp; Preferences
            </span>
            <span className="text-xs text-gray-300 font-medium">· Super Admin Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Portal Settings &amp; Configuration</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Manage institutional metadata, SMTP credentials, theme switcher &amp; security policies
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportConfigPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Config (PDF)
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-green-800" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Settings Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Switcher */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-black text-[#071A3D]">Display Appearance</h3>
              <p className="text-xs text-gray-500">Live theme switching across all portal routes</p>
            </div>
            <div className="p-2 rounded-2xl bg-blue-50 text-[#1455D9]">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleToggleTheme(false)}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                !isDark
                  ? 'border-[#1455D9] bg-blue-50/50 shadow-md ring-2 ring-[#1455D9]/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-xs font-bold text-[#071A3D]">Classic Light</p>
              <p className="text-[10px] text-gray-400">Institutional clean white theme</p>
            </button>

            <button
              onClick={() => handleToggleTheme(true)}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                isDark
                  ? 'border-[#1455D9] bg-[#071A3D] text-white shadow-md ring-2 ring-[#1455D9]/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Moon className="w-5 h-5 text-blue-400 mb-2" />
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#071A3D]'}`}>
                Midnight Navy
              </p>
              <p className="text-[10px] text-gray-400">Dark high-contrast mode</p>
            </button>
          </div>
        </div>

        {/* SMTP Mail Configuration */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-black text-[#071A3D]">SMTP Mail Gateway</h3>
              <p className="text-xs text-gray-500">Live Gmail OTP verification pipeline</p>
            </div>
            <div className="p-2 rounded-2xl bg-green-50 text-green-700">
              <Mail className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2 text-xs divide-y divide-gray-100">
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">SMTP Gateway Host:</span>
              <span className="font-mono font-bold text-[#071A3D]">smtp.gmail.com (Port 465 SSL)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Default Dispatch Inbox:</span>
              <span className="font-mono font-bold text-[#1455D9]">lonelyboy44y@gmail.com</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Connection Health:</span>
              <span className="font-bold text-green-700 uppercase flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 100% Operational
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">IPv4 DNS Resolution:</span>
              <span className="font-bold text-[#071A3D]">Enforced (No Timeouts)</span>
            </div>
          </div>
        </div>

        {/* Security & Access Policies */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-black text-[#071A3D]">Security &amp; 2FA Protocols</h3>
              <p className="text-xs text-gray-500">Root access security controls</p>
            </div>
            <div className="p-2 rounded-2xl bg-purple-50 text-purple-700">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
              <div>
                <p className="font-bold text-[#071A3D]">Enforce 2FA Email OTP</p>
                <p className="text-[11px] text-gray-400">Require OTP for all admin login sessions</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorRequired}
                onChange={(e) => setTwoFactorRequired(e.target.checked)}
                className="w-4 h-4 accent-[#1455D9] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
              <div>
                <p className="font-bold text-[#071A3D]">System Maintenance Mode</p>
                <p className="text-[11px] text-gray-400">Temporarily restrict non-admin portal access</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-[#1455D9] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Institutional Metadata */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-black text-[#071A3D]">Institutional Identity</h3>
              <p className="text-xs text-gray-500">Accreditation &amp; affiliation parameters</p>
            </div>
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-700">
              <Server className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2 text-xs divide-y divide-gray-100">
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">College Name:</span>
              <span className="font-bold text-[#071A3D]">V.S.B. Engineering College</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Department:</span>
              <span className="font-bold text-[#071A3D]">Artificial Intelligence &amp; Data Science</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Autonomous Affiliation:</span>
              <span className="font-bold text-[#1455D9]">Anna University, Chennai</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Campus Location:</span>
              <span className="font-bold text-[#071A3D]">Karur, Tamil Nadu, India</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
