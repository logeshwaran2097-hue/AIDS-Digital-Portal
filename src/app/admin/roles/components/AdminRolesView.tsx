'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  ShieldCheck,
  Lock,
  Download,
  Save,
  Check,
  X,
  Info,
  Users,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Plus,
  Search,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Sliders,
  Eye,
  Key,
  Layers,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface PermissionItem {
  id: string
  module: string
  name: string
  description: string
  student: boolean
  faculty: boolean
  hod: boolean
  admin: boolean
  isCustom?: boolean
}

const DEFAULT_PERMISSIONS: PermissionItem[] = [
  // Student Records
  { id: 'p1', module: 'Student Records', name: 'View Enrolled Student Directory', description: 'Access batch roster, registration numbers & standing', student: true, faculty: true, hod: true, admin: true },
  { id: 'p2', module: 'Student Records', name: 'Edit Student Details & Bio', description: 'Update profile data, contact details & photo', student: false, faculty: false, hod: true, admin: true },
  { id: 'p3', module: 'Student Records', name: 'Submit On-Duty (OD) / Medical Leave', description: 'Request institutional OD for hackathons & symposiums', student: true, faculty: false, hod: false, admin: true },
  { id: 'p4', module: 'Student Records', name: 'Sanction & Approve OD / Leave', description: 'Authorize attendance exemption and condonation', student: false, faculty: true, hod: true, admin: true },

  // Faculty Directorate
  { id: 'p5', module: 'Faculty Directorate', name: 'View Faculty Directory & Qualifications', description: 'Access professor credentials, cabins & office hours', student: true, faculty: true, hod: true, admin: true },
  { id: 'p6', module: 'Faculty Directorate', name: 'Allocate Curricular Courses & Labs', description: 'Assign course blueprint codes and lab sections', student: false, faculty: false, hod: true, admin: true },
  { id: 'p7', module: 'Faculty Directorate', name: 'Manage Faculty Appointments', description: 'Onboard, modify or de-register teaching staff', student: false, faculty: false, hod: false, admin: true },

  // Curriculum & Resources
  { id: 'p8', module: 'Curriculum & Resources', name: 'Download E-Books & Study Notes', description: 'Access standardized PDF books and lesson packs', student: true, faculty: true, hod: true, admin: true },
  { id: 'p9', module: 'Curriculum & Resources', name: 'Upload Digital Textbooks & Packs', description: 'Add new syllabus units and lesson plan blueprints', student: false, faculty: true, hod: true, admin: true },
  { id: 'p10', module: 'Curriculum & Resources', name: 'Delete Outdated Digital Materials', description: 'Purge deprecated study files from library cache', student: false, faculty: false, hod: true, admin: true },

  // Question Papers & Exams
  { id: 'p11', module: 'Exams & Question Bank', name: 'Download Past Examination Papers', description: 'Access Anna University previous semester papers', student: true, faculty: true, hod: true, admin: true },
  { id: 'p12', module: 'Exams & Question Bank', name: 'Generate IAT & Model Papers', description: 'AI-assisted Blooms Taxonomy exam authoring', student: false, faculty: true, hod: true, admin: true },
  { id: 'p13', module: 'Exams & Question Bank', name: 'Approve COE Examination Schemes', description: 'Final institutional sign-off for controller of exams', student: false, faculty: false, hod: true, admin: true },

  // Capstone Projects & Events
  { id: 'p14', module: 'R&D Capstones & Events', name: 'Submit Project Synopsis & Pitch', description: 'Upload capstone research problem statement', student: true, faculty: true, hod: true, admin: true },
  { id: 'p15', module: 'R&D Capstones & Events', name: 'Approve & Grade Capstone Teams', description: 'Assign project guides and record jury scores', student: false, faculty: true, hod: true, admin: true },
  { id: 'p16', module: 'R&D Capstones & Events', name: 'Broadcast Official Circulars', description: 'Issue high-priority announcements and alerts', student: false, faculty: true, hod: true, admin: true },

  // Security & System Settings
  { id: 'p17', module: 'System Infrastructure', name: 'View Real-Time Security Audit Logs', description: 'Inspect login trails, IP addresses and transactions', student: false, faculty: false, hod: false, admin: true },
  { id: 'p18', module: 'System Infrastructure', name: 'Configure SMTP & AI API Settings', description: 'Manage Gmail credentials and system model keys', student: false, faculty: false, hod: false, admin: true },
]

export function AdminRolesView({ userName }: { userName: string }) {
  const [permissions, setPermissions] = useState<PermissionItem[]>(DEFAULT_PERMISSIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState('ALL')
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [notification, setNotification] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // New Rule Form
  const [newRule, setNewRule] = useState({
    module: 'Student Records',
    customModule: '',
    name: '',
    description: '',
    student: false,
    faculty: false,
    hod: true,
  })

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('vsb-rbac-matrix')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPermissions(parsed)
        }
      } catch (e) {
        console.error('Error loading RBAC matrix:', e)
      }
    }
  }, [])

  // Module List
  const modulesList = useMemo(() => {
    const mods = new Set(permissions.map((p) => p.module))
    return ['ALL', ...Array.from(mods)]
  }, [permissions])

  // Filtered Permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.module.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesModule = selectedModule === 'ALL' || p.module.toLowerCase() === selectedModule.toLowerCase()

      return matchesSearch && matchesModule
    })
  }, [permissions, searchQuery, selectedModule])

  // Role Counts
  const roleStats = useMemo(() => {
    return {
      student: permissions.filter((p) => p.student).length,
      faculty: permissions.filter((p) => p.faculty).length,
      hod: permissions.filter((p) => p.hod).length,
      admin: permissions.length,
    }
  }, [permissions])

  // 1-Click Toggle Single Permission
  const togglePermission = (id: string, role: 'student' | 'faculty' | 'hod' | 'admin') => {
    if (role === 'admin') return // Root safety

    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, [role]: !p[role] }
        }
        return p
      })
    )
    setSavedSuccess(false)
  }

  // Preset Applicator
  const applyPreset = (preset: 'academic' | 'lockdown' | 'open') => {
    if (preset === 'academic') {
      setPermissions(DEFAULT_PERMISSIONS)
      setNotification('Restored Standard Academic Defaults.')
    } else if (preset === 'lockdown') {
      setPermissions((prev) =>
        prev.map((p) => ({
          ...p,
          student: p.name.includes('View') || p.name.includes('Download'),
          faculty: !p.module.includes('Infrastructure'),
          hod: true,
          admin: true,
        }))
      )
      setNotification('Strict Examination Lockdown Applied!')
    } else if (preset === 'open') {
      setPermissions((prev) =>
        prev.map((p) => ({
          ...p,
          student: !p.module.includes('Infrastructure') && !p.name.includes('Appointments'),
          faculty: true,
          hod: true,
          admin: true,
        }))
      )
      setNotification('Open Academic Collaboration Matrix Applied!')
    }
    setTimeout(() => setNotification(''), 4000)
  }

  // Save Changes
  const handleSave = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('vsb-rbac-matrix', JSON.stringify(permissions))

      await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      })

      setSavedSuccess(true)
      setNotification('RBAC Permission Matrix saved and enforced!')
      setTimeout(() => {
        setSavedSuccess(false)
        setNotification('')
      }, 4000)
    } catch (e) {
      console.error('Failed to save roles:', e)
      setSavedSuccess(true)
      setNotification('Permissions saved locally!')
      setTimeout(() => {
        setSavedSuccess(false)
        setNotification('')
      }, 4000)
    } finally {
      setIsSaving(false)
    }
  }

  // Add Rule
  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRule.name.trim()) return

    const finalMod = newRule.module === 'CUSTOM' ? newRule.customModule || 'Custom Module' : newRule.module

    const item: PermissionItem = {
      id: 'custom_' + Date.now(),
      module: finalMod,
      name: newRule.name.trim(),
      description: newRule.description.trim() || 'Custom defined privilege rule',
      student: newRule.student,
      faculty: newRule.faculty,
      hod: newRule.hod,
      admin: true,
      isCustom: true,
    }

    const updated = [...permissions, item]
    setPermissions(updated)
    localStorage.setItem('vsb-rbac-matrix', JSON.stringify(updated))
    setIsAddModalOpen(false)
    setNewRule({
      module: 'Student Records',
      customModule: '',
      name: '',
      description: '',
      student: false,
      faculty: false,
      hod: true,
    })
    setNotification(`New privilege "${item.name}" added to matrix!`)
    setTimeout(() => setNotification(''), 4000)
  }

  // Delete Custom Rule
  const handleDeleteRule = (id: string) => {
    const updated = permissions.filter((p) => p.id !== id)
    setPermissions(updated)
    localStorage.setItem('vsb-rbac-matrix', JSON.stringify(updated))
    setNotification('Custom privilege removed.')
    setTimeout(() => setNotification(''), 3000)
  }

  // Export PDF
  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'ENTERPRISE ROLE-BASED ACCESS CONTROL (RBAC) MATRIX',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator & Cybersecurity Directorate',
      category: 'Official RBAC Security Governance Statement',
      sections: [
        {
          heading: '1. PRIVILEGE TIER HIERARCHY SUMMARY',
          body: [
            `Tier 1 (Student): ${roleStats.student} Granted Permissions`,
            `Tier 2 (Faculty Directorate): ${roleStats.faculty} Granted Permissions`,
            `Tier 3 (HOD Leadership): ${roleStats.hod} Granted Permissions`,
            `Tier 0 (Super Administrator): ${roleStats.admin} Full Root Jurisdiction (100%)`,
            'Compliance Standard: ISO/IEC 27001 Access Governance & NAAC Digital Traceability',
          ],
        },
        {
          heading: '2. GRANULAR PRIVILEGE SPECIFICATION',
          body: permissions.map(
            (p, idx) =>
              `${idx + 1}. [${p.module}] ${p.name} — Student: [${p.student ? 'ALLOWED' : 'RESTRICTED'}] | Faculty: [${p.faculty ? 'ALLOWED' : 'RESTRICTED'}] | HOD: [${p.hod ? 'ALLOWED' : 'RESTRICTED'}] | Admin: [ROOT FULL]`
          ),
        },
      ],
      fileName: `VSB_RBAC_Role_Matrix_${new Date().toISOString().split('T')[0]}`,
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Security &amp; Privilege Control
            </span>
            <span className="text-xs text-gray-300 font-medium">· Tiered RBAC Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Roles &amp; Permission Matrix</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Manage granular access control policies across Students, Faculty, HOD &amp; Super Administrators
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer shadow-md hover:scale-105"
          >
            <Plus className="w-4 h-4 text-[#F4C430]" /> Add Permission Rule
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer shadow-md hover:scale-105"
          >
            <Download className="w-4 h-4" /> Export RBAC (PDF)
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4 text-white" />}
            {isSaving ? 'Saving Policy...' : savedSuccess ? 'Policy Enforced!' : 'Save Policy Matrix'}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 4 Role Summary Cards with Distinct Tiers & Modern Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier 1: Student */}
        <div className="bg-white p-5 rounded-3xl border-2 border-blue-100 shadow-sm flex flex-col justify-between space-y-3 hover:border-[#1455D9]/40 transition-all">
          <div className="flex items-start justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-black uppercase tracking-wider">
              Tier 1 Role
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black text-[#071A3D]">Student Role</h3>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Read-only curricular resources, OD submissions, personal attendance &amp; research synopsis.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-[#1455D9]">{roleStats.student} Active Permissions</span>
            <span className="text-[10px] text-gray-400 font-semibold">Limited Scope</span>
          </div>
        </div>

        {/* Tier 2: Faculty */}
        <div className="bg-white p-5 rounded-3xl border-2 border-purple-100 shadow-sm flex flex-col justify-between space-y-3 hover:border-purple-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider">
              Tier 2 Role
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black text-[#071A3D]">Faculty Directorate</h3>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Curriculum packs, lesson plan units, OD verification, question paper generator &amp; marks entry.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700">{roleStats.faculty} Active Permissions</span>
            <span className="text-[10px] text-gray-400 font-semibold">Academic Staff</span>
          </div>
        </div>

        {/* Tier 3: HOD */}
        <div className="bg-white p-5 rounded-3xl border-2 border-indigo-100 shadow-sm flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
              Tier 3 Role
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black text-[#071A3D]">HOD Leadership</h3>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Workload distribution, targeted circular broadcast, COE blueprints &amp; NBA accreditation reports.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700">{roleStats.hod} Active Permissions</span>
            <span className="text-[10px] text-gray-400 font-semibold">Department Head</span>
          </div>
        </div>

        {/* Tier 0: Super Admin */}
        <div className="bg-white p-5 rounded-3xl border-2 border-rose-100 shadow-sm flex flex-col justify-between space-y-3 hover:border-rose-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">
              Tier 0 Root
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black text-[#071A3D]">Super Admin</h3>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Full system jurisdiction, user provisioning, database backups, SMTP OTP &amp; audit security.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">All {roleStats.admin} Permissions (100% Root)</span>
            <span className="text-[10px] text-rose-600 font-semibold">Immutable</span>
          </div>
        </div>
      </div>

      {/* Filter, Search & 1-Click Preset Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search privileges, actions, modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-medium text-[#071A3D] bg-gray-50/50 focus:outline-none focus:border-[#1455D9] focus:bg-white"
            />
          </div>

          {/* Module Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9] shadow-2xs"
            >
              {modulesList.map((m) => (
                <option key={m} value={m}>
                  {m === 'ALL' ? 'All Modules' : m}
                </option>
              ))}
            </select>

            <span className="text-xs text-gray-500 font-bold px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
              {filteredPermissions.length} Rules Active
            </span>
          </div>
        </div>

        {/* 1-Click Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-100 text-xs">
          <span className="font-bold text-gray-500">1-Click Policy Presets:</span>
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => applyPreset('academic')}
              className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] font-bold text-xs cursor-pointer transition-colors"
            >
              🏛️ Standard Academic Defaults
            </button>
            <button
              onClick={() => applyPreset('lockdown')}
              className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs cursor-pointer transition-colors"
            >
              🔒 Strict Exam Lockdown
            </button>
            <button
              onClick={() => applyPreset('open')}
              className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs cursor-pointer transition-colors"
            >
              🌐 Open Collaboration
            </button>
          </div>
        </div>
      </div>

      {/* Main Granular Access Control Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-5 py-4 w-2/5">Privilege / Action</th>
                <th className="px-4 py-4 text-center">Student (🎓)</th>
                <th className="px-4 py-4 text-center">Faculty (👨‍🏫)</th>
                <th className="px-4 py-4 text-center">HOD (🏛️)</th>
                <th className="px-4 py-4 text-center">Super Admin (👑)</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No matching permission rules found.
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Privilege Description */}
                    <td className="px-5 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">
                            {p.module}
                          </span>
                          {p.isCustom && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                              Custom Rule
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-[#071A3D] text-xs mt-1">{p.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{p.description}</p>
                      </div>
                    </td>

                    {/* Student Toggle */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => togglePermission(p.id, 'student')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs ${
                          p.student
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                      >
                        {p.student ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        {p.student ? 'Allowed' : 'Restricted'}
                      </button>
                    </td>

                    {/* Faculty Toggle */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => togglePermission(p.id, 'faculty')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs ${
                          p.faculty
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                      >
                        {p.faculty ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        {p.faculty ? 'Allowed' : 'Restricted'}
                      </button>
                    </td>

                    {/* HOD Toggle */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => togglePermission(p.id, 'hod')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs ${
                          p.hod
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                      >
                        {p.hod ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        {p.hod ? 'Allowed' : 'Restricted'}
                      </button>
                    </td>

                    {/* Admin (Immutable Root) */}
                    <td className="px-4 py-4 text-center">
                      <span className="px-3 py-1.5 rounded-xl bg-blue-100 text-[#1455D9] font-black text-[11px] inline-flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Root Full
                      </span>
                    </td>

                    {/* Custom Rule Delete Action */}
                    <td className="px-4 py-4 text-right">
                      {p.isCustom ? (
                        <button
                          onClick={() => handleDeleteRule(p.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Custom Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-300 font-mono">System</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Permission Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#071A3D] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-[#F4C430] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Define New Permission Rule</h3>
                  <p className="text-[10px] text-gray-300">Grant or restrict capability across roles</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRuleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Target System Module</label>
                <select
                  value={newRule.module}
                  onChange={(e) => setNewRule({ ...newRule, module: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
                >
                  <option value="Student Records">Student Records</option>
                  <option value="Faculty Directorate">Faculty Directorate</option>
                  <option value="Curriculum & Resources">Curriculum &amp; Resources</option>
                  <option value="Exams & Question Bank">Exams &amp; Question Bank</option>
                  <option value="R&D Capstones & Events">R&amp;D Capstones &amp; Events</option>
                  <option value="CUSTOM">+ Custom New Module</option>
                </select>
              </div>

              {newRule.module === 'CUSTOM' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Custom Module Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alumni Network, Placements..."
                    value={newRule.customModule}
                    onChange={(e) => setNewRule({ ...newRule, customModule: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-bold text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Privilege / Action Title</label>
                <input
                  type="text"
                  placeholder="e.g. Export Placement Offers Dossier"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-bold text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what this capability allows..."
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              {/* Initial Role Access Toggles */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2.5">
                <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">
                  Initial Access Permissions
                </span>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Grant to Student Role:</span>
                  <input
                    type="checkbox"
                    checked={newRule.student}
                    onChange={(e) => setNewRule({ ...newRule, student: e.target.checked })}
                    className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Grant to Faculty Directorate:</span>
                  <input
                    type="checkbox"
                    checked={newRule.faculty}
                    onChange={(e) => setNewRule({ ...newRule, faculty: e.target.checked })}
                    className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Grant to HOD Leadership:</span>
                  <input
                    type="checkbox"
                    checked={newRule.hod}
                    onChange={(e) => setNewRule({ ...newRule, hod: e.target.checked })}
                    className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Add Permission Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
