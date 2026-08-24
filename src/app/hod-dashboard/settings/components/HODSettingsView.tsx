'use client'

import React, { useState } from 'react'
import {
  Settings,
  Shield,
  Bell,
  Lock,
  Database,
  Save,
  CheckCircle2,
  Sliders,
  Mail,
  Smartphone,
  FileSpreadsheet,
  Download,
  School,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function HODSettingsView() {
  const [attendanceThreshold, setAttendanceThreshold] = useState(75)
  const [academicTerm, setAcademicTerm] = useState('2025-2026 (Odd Semester)')
  const [regulation, setRegulation] = useState('R-2021 (Autonomous)')
  const [smsDefaulters, setSmsDefaulters] = useState(true)
  const [emailQPUploads, setEmailQPUploads] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [autoLockRegister, setAutoLockRegister] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 4000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              System Preferences
            </span>
          </div>
          <h1 className="text-2xl font-black">Department Configuration &amp; Settings</h1>
          <p className="text-xs text-gray-300 mt-1">
            Manage academic policies, attendance thresholds, automated alerts &amp; data backup
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-green-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" /> Preferences Saved Successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Academic Policies & Thresholds */}
        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <Sliders className="w-4 h-4 text-[#1455D9]" />
              <h2 className="text-xs font-bold text-[#071A3D] uppercase tracking-wider">
                Academic Policies &amp; Thresholds
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <label className="font-bold text-[#071A3D] block mb-1">
                  Minimum Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  value={attendanceThreshold}
                  onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
                />
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Anna University &amp; Government Condonation Cut-off
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <label className="font-bold text-[#071A3D] block mb-1">Active Academic Term</label>
                <select
                  value={academicTerm}
                  onChange={(e) => setAcademicTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9]/20"
                >
                  <option>2025-2026 (Odd Semester)</option>
                  <option>2025-2026 (Even Semester)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1.5">Operational academic semester period</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <label className="font-bold text-[#071A3D] block mb-1">Curriculum Regulation</label>
                <select
                  value={regulation}
                  onChange={(e) => setRegulation(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9]/20"
                >
                  <option>R-2021 (Autonomous)</option>
                  <option>R-2025 (Updated Choice Based Credit System)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1.5">Active Anna University Syllabus Norm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Automated Department Notification Alerts */}
        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <Bell className="w-4 h-4 text-purple-600" />
              <h2 className="text-xs font-bold text-[#071A3D] uppercase tracking-wider">
                Automated Department Communication &amp; Alerts
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-bold text-[#071A3D]">SMS &amp; Email Absence Dispatch</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Automatically trigger notifications to parents when a student is marked Absent during roll call
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={smsDefaulters}
                  onChange={(e) => setSmsDefaulters(e.target.checked)}
                  className="w-5 h-5 rounded text-[#1455D9] accent-[#1455D9] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-bold text-[#071A3D]">Question Paper Review Alerts</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Send instant high-priority alert to HOD dashboard when faculty submits a new examination paper
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailQPUploads}
                  onChange={(e) => setEmailQPUploads(e.target.checked)}
                  className="w-5 h-5 rounded text-[#1455D9] accent-[#1455D9] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-bold text-[#071A3D]">Automatic Register Locking</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Lock hourly government attendance sheets at the end of each working day at 05:00 PM
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoLockRegister}
                  onChange={(e) => setAutoLockRegister(e.target.checked)}
                  className="w-5 h-5 rounded text-[#1455D9] accent-[#1455D9] cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Department Data Backup & Audit Tools */}
        <Card className="rounded-3xl border-gray-200 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <Database className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-[#071A3D] uppercase tracking-wider">
                Department Data Archival &amp; Export
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <button
                type="button"
                onClick={() => alert('Exporting full student enrollment register to Excel...')}
                className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 hover:bg-blue-100/60 text-left transition-colors flex items-center gap-3"
              >
                <FileSpreadsheet className="w-5 h-5 text-[#1455D9] shrink-0" />
                <div>
                  <p className="font-bold text-[#071A3D]">Export Student Roll</p>
                  <p className="text-[10px] text-gray-500">Excel / CSV Format</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => alert('Exporting department attendance analytics to PDF...')}
                className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 hover:bg-purple-100/60 text-left transition-colors flex items-center gap-3"
              >
                <Download className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <p className="font-bold text-[#071A3D]">Attendance Reports</p>
                  <p className="text-[10px] text-gray-500">Official University PDF</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => alert('Generating full curriculum course syllabus archive...')}
                className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-100/60 text-left transition-colors flex items-center gap-3"
              >
                <School className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-[#071A3D]">Curriculum Archive</p>
                  <p className="text-[10px] text-gray-500">Regulation 2021 Files</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Form Submit Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold rounded-2xl transition-colors shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Department Configuration
          </button>
        </div>
      </form>
    </div>
  )
}
