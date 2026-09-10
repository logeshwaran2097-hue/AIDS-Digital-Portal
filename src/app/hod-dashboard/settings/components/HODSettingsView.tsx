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
  Loader2,
  RotateCcw,
  Sparkles,
  FileText,
  Building,
  CheckSquare,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/Toast'

interface SettingsProps {
  initialSettings?: {
    attendanceThreshold?: number
    showAttendanceBenchmark?: boolean
    academicTerm?: string
    regulation?: string
    academicYear?: string
    departmentCode?: string
    departmentName?: string
    hodContactEmail?: string
    smsDefaulters?: boolean
    emailQPUploads?: boolean
    weeklyDigest?: boolean
    autoLockRegister?: boolean
    odProofNotification?: boolean
    advisorApprovalRequired?: boolean
  }
}

export function HODSettingsView({ initialSettings }: SettingsProps) {
  const router = useRouter()

  // Form State initialized from DB settings or robust defaults
  const [attendanceThreshold, setAttendanceThreshold] = useState<number>(
    initialSettings?.attendanceThreshold ?? 75
  )
  const [showAttendanceBenchmark, setShowAttendanceBenchmark] = useState<boolean>(
    initialSettings?.showAttendanceBenchmark ?? true
  )
  const [academicTerm, setAcademicTerm] = useState<string>(
    initialSettings?.academicTerm ?? '2025-2026 (Odd Semester)'
  )
  const [regulation, setRegulation] = useState<string>(
    initialSettings?.regulation ?? 'R-2021 (Autonomous)'
  )
  const [academicYear, setAcademicYear] = useState<string>(
    initialSettings?.academicYear ?? '2025-2026'
  )
  const [departmentCode, setDepartmentCode] = useState<string>(
    initialSettings?.departmentCode ?? 'AI & DS'
  )
  const [departmentName, setDepartmentName] = useState<string>(
    initialSettings?.departmentName ?? 'Artificial Intelligence and Data Science'
  )
  const [hodContactEmail, setHodContactEmail] = useState<string>(
    initialSettings?.hodContactEmail ?? 'hod.aids@vsb.ac.in'
  )

  // Alert & Automation Preferences
  const [smsDefaulters, setSmsDefaulters] = useState<boolean>(
    initialSettings?.smsDefaulters ?? true
  )
  const [emailQPUploads, setEmailQPUploads] = useState<boolean>(
    initialSettings?.emailQPUploads ?? true
  )
  const [weeklyDigest, setWeeklyDigest] = useState<boolean>(
    initialSettings?.weeklyDigest ?? true
  )
  const [autoLockRegister, setAutoLockRegister] = useState<boolean>(
    initialSettings?.autoLockRegister ?? true
  )
  const [odProofNotification, setOdProofNotification] = useState<boolean>(
    initialSettings?.odProofNotification ?? true
  )
  const [advisorApprovalRequired, setAdvisorApprovalRequired] = useState<boolean>(
    initialSettings?.advisorApprovalRequired ?? true
  )

  // UI state
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [exportingRoster, setExportingRoster] = useState(false)

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)

    try {
      const payload = {
        attendanceThreshold: Number(attendanceThreshold) || 75,
        showAttendanceBenchmark,
        academicTerm,
        regulation,
        academicYear,
        departmentCode,
        departmentName,
        hodContactEmail,
        smsDefaulters,
        emailQPUploads,
        weeklyDigest,
        autoLockRegister,
        odProofNotification,
        advisorApprovalRequired,
      }

      const res = await fetch('/api/hod/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSavedSuccess(true)
        toast.success('Department configuration saved to database successfully!')
        setTimeout(() => setSavedSuccess(false), 4500)
      } else {
        throw new Error(data.error || 'Failed to save settings')
      }
    } catch (err: any) {
      console.error('Error saving settings:', err)
      toast.error(err.message || 'Error updating department preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleResetToSaved = () => {
    setAttendanceThreshold(initialSettings?.attendanceThreshold ?? 75)
    setShowAttendanceBenchmark(initialSettings?.showAttendanceBenchmark ?? true)
    setAcademicTerm(initialSettings?.academicTerm ?? '2025-2026 (Odd Semester)')
    setRegulation(initialSettings?.regulation ?? 'R-2021 (Autonomous)')
    setAcademicYear(initialSettings?.academicYear ?? '2025-2026')
    setDepartmentCode(initialSettings?.departmentCode ?? 'AI & DS')
    setDepartmentName(initialSettings?.departmentName ?? 'Artificial Intelligence and Data Science')
    setHodContactEmail(initialSettings?.hodContactEmail ?? 'hod.aids@vsb.ac.in')
    setSmsDefaulters(initialSettings?.smsDefaulters ?? true)
    setEmailQPUploads(initialSettings?.emailQPUploads ?? true)
    setWeeklyDigest(initialSettings?.weeklyDigest ?? true)
    setAutoLockRegister(initialSettings?.autoLockRegister ?? true)
    setOdProofNotification(initialSettings?.odProofNotification ?? true)
    setAdvisorApprovalRequired(initialSettings?.advisorApprovalRequired ?? true)
    toast.info('Preferences reset to last saved state.')
  }

  const handleExportRoster = async () => {
    setExportingRoster(true)
    try {
      toast.info('Generating verified student roster...')
      const res = await fetch('/api/students')
      const data = await res.json()
      const students = data.students || []

      if (students.length === 0) {
        toast.warning('No student records found to export.')
        return
      }

      const headers = ['Register Number', 'Name', 'Year', 'Semester', 'Section', 'Email', 'Advisor', 'Parent Phone']
      const rows = students.map((s: any) => [
        `"${s.registerNumber || ''}"`,
        `"${s.name || ''}"`,
        `"Year ${s.year || ''}"`,
        `"Sem ${s.semester || ''}"`,
        `"Sec ${s.section || ''}"`,
        `"${s.email || ''}"`,
        `"${s.advisorName || 'Assigned Advisor'}"`,
        `"${s.parentPhone || 'N/A'}"`,
      ].join(','))

      const csv = [headers.join(','), ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `VSB_AIDS_Department_Roster_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Successfully exported ${students.length} student records!`)
    } catch (err) {
      console.error('Export error:', err)
      toast.error('Failed to export student roster.')
    } finally {
      setExportingRoster(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider shadow-xs">
              System Preferences
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/90 text-[10px] font-semibold">
              HOD Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Department Configuration &amp; Settings</h1>
          <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-2xl leading-relaxed">
            Manage academic policies, attendance thresholds, automated alerts, advisor workflows &amp; data backup.
          </p>
        </div>

        {/* Top Actions & Save Button */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          {savedSuccess && (
            <div className="px-3.5 py-2 bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-lg animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4" /> Saved Successfully!
            </div>
          )}

          <button
            type="button"
            onClick={handleResetToSaved}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-2xl transition-all border border-white/20 flex items-center gap-1.5"
            title="Reset to last saved values"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white/80" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2.5 bg-[#F4C430] hover:bg-[#e5b726] text-[#071A3D] text-xs font-black rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 active:scale-95 disabled:opacity-75 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#071A3D]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#071A3D]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Academic Policies & Thresholds */}
        <Card className="rounded-3xl border-gray-200 shadow-xs overflow-hidden">
          <CardContent className="p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#071A3D] uppercase tracking-wider">
                    Academic Policies &amp; Thresholds
                  </h2>
                  <p className="text-[11px] text-gray-400">Core operational regulations and minimum requirements</p>
                </div>
              </div>
              <Badge variant="info" className="text-[10px] text-blue-700 bg-blue-50 border-blue-200 font-bold">
                Anna University Autonomous
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              {/* Minimum Attendance Threshold */}
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#071A3D] block">
                    Attendance Benchmark (%)
                  </label>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-[#1455D9]">
                    {attendanceThreshold}%
                  </span>
                </div>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={attendanceThreshold}
                  onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20 transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                  Anna University &amp; Government Condonation Cut-off (Default: 75%).
                </p>
              </div>

              {/* Active Academic Term */}
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-blue-200 transition-colors">
                <label className="font-bold text-[#071A3D] block mb-1.5">Active Academic Term</label>
                <select
                  value={academicTerm}
                  onChange={(e) => setAcademicTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9]/20 transition-all cursor-pointer"
                >
                  <option value="2025-2026 (Odd Semester)">2025-2026 (Odd Semester)</option>
                  <option value="2025-2026 (Even Semester)">2025-2026 (Even Semester)</option>
                  <option value="2026-2027 (Odd Semester)">2026-2027 (Odd Semester)</option>
                  <option value="2026-2027 (Even Semester)">2026-2027 (Even Semester)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">Operational academic semester period.</p>
              </div>

              {/* Curriculum Regulation */}
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-blue-200 transition-colors">
                <label className="font-bold text-[#071A3D] block mb-1.5">Curriculum Regulation</label>
                <select
                  value={regulation}
                  onChange={(e) => setRegulation(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#071A3D] focus:ring-2 focus:ring-[#1455D9]/20 transition-all cursor-pointer"
                >
                  <option value="R-2021 (Autonomous)">R-2021 (Autonomous)</option>
                  <option value="R-2025 (Updated Choice Based Credit System)">R-2025 (Updated CBCS)</option>
                  <option value="R-2017 (Regulation 2017)">R-2017 (Regulation 2017)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">Active Anna University Syllabus Norm.</p>
              </div>
            </div>

            {/* Department Identifiers */}
            <div className="grid gap-4 sm:grid-cols-3 text-xs pt-2">
              <div className="p-3.5 rounded-2xl bg-gray-50/60 border border-gray-100">
                <label className="font-semibold text-gray-700 block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#071A3D]"
                  placeholder="e.g. 2025-2026"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50/60 border border-gray-100">
                <label className="font-semibold text-gray-700 block mb-1">Department Code</label>
                <input
                  type="text"
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#071A3D]"
                  placeholder="e.g. AI & DS"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50/60 border border-gray-100">
                <label className="font-semibold text-gray-700 block mb-1">HOD Dispatch Email</label>
                <input
                  type="email"
                  value={hodContactEmail}
                  onChange={(e) => setHodContactEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#071A3D]"
                  placeholder="e.g. hod.aids@vsb.ac.in"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Automated Department Communication & Alerts */}
        <Card className="rounded-3xl border-gray-200 shadow-xs overflow-hidden">
          <CardContent className="p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#071A3D] uppercase tracking-wider">
                    Automated Department Communication &amp; Alerts
                  </h2>
                  <p className="text-[11px] text-gray-400">Configure real-time automated triggers and notifications</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] text-purple-700 bg-purple-50 border-purple-200 font-bold">
                Real-time Webhook &amp; Dispatch
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              {/* SMS & Email Absence Dispatch */}
              <label className="flex items-start sm:items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/70 transition-all cursor-pointer select-none">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#1455D9]" />
                    <p className="font-bold text-[#071A3D]">SMS &amp; Email Absence Dispatch</p>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Automatically trigger notifications to parents when a student is marked Absent during roll call.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={smsDefaulters}
                  onChange={(e) => setSmsDefaulters(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-[#1455D9] accent-[#1455D9] cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                />
              </label>

              {/* Question Paper Review Alerts */}
              <label className="flex items-start sm:items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/70 transition-all cursor-pointer select-none">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <p className="font-bold text-[#071A3D]">Question Paper Review Alerts</p>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Send instant high-priority alert to HOD dashboard when faculty submits a new examination paper.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailQPUploads}
                  onChange={(e) => setEmailQPUploads(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-[#1455D9] accent-[#1455D9] cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                />
              </label>

              {/* Automatic Register Locking */}
              <label className="flex items-start sm:items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/70 transition-all cursor-pointer select-none">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <p className="font-bold text-[#071A3D]">Automatic Register Locking</p>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Lock hourly government attendance sheets at the end of each working day at 05:00 PM.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoLockRegister}
                  onChange={(e) => setAutoLockRegister(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-[#1455D9] accent-[#1455D9] cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                />
              </label>

              {/* OD & Event Proofs Notifications */}
              <label className="flex items-start sm:items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/70 transition-all cursor-pointer select-none">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <p className="font-bold text-[#071A3D]">OD &amp; Event Proof Alerts</p>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Notify HOD and Class Advisors immediately when students submit event certificates and venue GPS proof.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={odProofNotification}
                  onChange={(e) => setOdProofNotification(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-[#1455D9] accent-[#1455D9] cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                />
              </label>

              {/* Require Class Advisor Approval First */}
              <label className="flex items-start sm:items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/70 transition-all cursor-pointer select-none">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <p className="font-bold text-[#071A3D]">Advisor Endorsement Required for OD</p>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Require Class Advisor verification before student on-duty participation is elevated for HOD final sanction.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={advisorApprovalRequired}
                  onChange={(e) => setAdvisorApprovalRequired(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-[#1455D9] accent-[#1455D9] cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                />
              </label>

              {/* Weekly Academic Digest */}
              <label className="flex items-start sm:items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/70 transition-all cursor-pointer select-none">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <p className="font-bold text-[#071A3D]">Weekly Department Summary Digest</p>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Send automated Friday digest of departmental attendance, faculty log books, and pending student requests.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-[#1455D9] accent-[#1455D9] cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 3. Department Data Backup & Quick Links */}
        <Card className="rounded-3xl border-gray-200 shadow-xs overflow-hidden">
          <CardContent className="p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#071A3D] uppercase tracking-wider">
                    Department Data Archival &amp; Export
                  </h2>
                  <p className="text-[11px] text-gray-400">Instant export tools and institutional academic portals</p>
                </div>
              </div>
              <Badge variant="success" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200 font-bold">
                Export &amp; Analytics
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              {/* Export Student Roll */}
              <button
                type="button"
                onClick={handleExportRoster}
                disabled={exportingRoster}
                className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 hover:bg-blue-100/70 text-left transition-all flex items-center gap-3.5 cursor-pointer group shadow-2xs hover:shadow-xs active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1455D9] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {exportingRoster ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-[#071A3D] group-hover:text-[#1455D9] transition-colors">Export Student Roll</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Excel / CSV Format</p>
                </div>
              </button>

              {/* Attendance Reports */}
              <button
                type="button"
                onClick={() => router.push('/hod-dashboard/reports')}
                className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 hover:bg-purple-100/70 text-left transition-all flex items-center gap-3.5 cursor-pointer group shadow-2xs hover:shadow-xs active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-[#071A3D] group-hover:text-purple-700 transition-colors">Attendance Reports</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Official University Analytics</p>
                </div>
              </button>

              {/* Curriculum Archive */}
              <button
                type="button"
                onClick={() => router.push('/hod-dashboard/academics')}
                className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-100/70 text-left transition-all flex items-center gap-3.5 cursor-pointer group shadow-2xs hover:shadow-xs active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-[#071A3D] group-hover:text-emerald-700 transition-colors">Curriculum Archive</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Regulation 2021 Courses</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Form Submit Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 pb-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Changes persist immediately to university institutional database.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetToSaved}
              className="px-5 py-3 border border-gray-200 hover:bg-gray-50 text-[#071A3D] text-xs font-bold rounded-2xl transition-all w-full sm:w-auto text-center"
            >
              Discard Changes
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75 cursor-pointer w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Department Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
