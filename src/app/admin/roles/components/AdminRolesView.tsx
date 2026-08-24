'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

interface PermissionItem {
  id: string
  module: string
  name: string
  description: string
  student: boolean
  faculty: boolean
  hod: boolean
  admin: boolean
}

const DEFAULT_PERMISSIONS: PermissionItem[] = [
  // Student Records
  { id: 'p1', module: 'Student Records', name: 'View Enrolled Student Directory', description: 'Access batch roster and academic standing', student: true, faculty: true, hod: true, admin: true },
  { id: 'p2', module: 'Student Records', name: 'Edit Student Details & Bio', description: 'Update profile info, DOB and contact data', student: false, faculty: false, hod: true, admin: true },
  { id: 'p3', module: 'Student Records', name: 'Submit On-Duty (OD) / Leave', description: 'Request institutional OD for symposiums/hackathons', student: true, faculty: false, hod: false, admin: true },
  { id: 'p4', module: 'Student Records', name: 'Sanction & Approve OD Requests', description: 'Authorize student attendance exemption', student: false, faculty: true, hod: true, admin: true },

  // Faculty Directorate
  { id: 'p5', module: 'Faculty Directorate', name: 'View Faculty Profiles & Cadre', description: 'View professor qualifications and cabin hours', student: true, faculty: true, hod: true, admin: true },
  { id: 'p6', module: 'Faculty Directorate', name: 'Allocate Curricular Courses', description: 'Assign subjects and lab batches to professors', student: false, faculty: false, hod: true, admin: true },
  { id: 'p7', module: 'Faculty Directorate', name: 'Manage Faculty Appointments', description: 'Add, edit, or de-register teaching staff', student: false, faculty: false, hod: false, admin: true },

  // Curriculum & Resources
  { id: 'p8', module: 'Curriculum & Resources', name: 'Download E-Books & Study Notes', description: 'Access standard textbooks and lecture packs', student: true, faculty: true, hod: true, admin: true },
  { id: 'p9', module: 'Curriculum & Resources', name: 'Upload Digital Textbooks & Pack', description: 'Add syllabus units and digital PDF materials', student: false, faculty: true, hod: true, admin: true },
  { id: 'p10', module: 'Curriculum & Resources', name: 'Delete Course Digital Materials', description: 'Remove outdated files from the cloud library', student: false, faculty: false, hod: true, admin: true },

  // Question Papers & Exams
  { id: 'p11', module: 'Exams & Question Bank', name: 'Download Previous Question Papers', description: 'View Anna University past exam papers', student: true, faculty: true, hod: true, admin: true },
  { id: 'p12', module: 'Exams & Question Bank', name: 'Generate IAT Question Papers', description: 'Create Bloom\'s Taxonomy Part-A/B/C exam papers', student: false, faculty: true, hod: true, admin: true },
  { id: 'p13', module: 'Exams & Question Bank', name: 'Approve COE Examination Blueprints', description: 'Final sign-off on department exam schemes', student: false, faculty: false, hod: true, admin: true },

  // Capstone Projects & Events
  { id: 'p14', module: 'R&D Capstones & Events', name: 'Submit Project Synopsis & Reports', description: 'Upload capstone research proposals', student: true, faculty: true, hod: true, admin: true },
  { id: 'p15', module: 'R&D Capstones & Events', name: 'Approve & Grade Capstone Teams', description: 'Evaluate innovation progress and assign guides', student: false, faculty: true, hod: true, admin: true },
  { id: 'p16', module: 'R&D Capstones & Events', name: 'Broadcast Targeted Circulars', description: 'Issue official alerts to batch, faculty or individual', student: false, faculty: true, hod: true, admin: true },

  // Security & Infrastructure
  { id: 'p17', module: 'System Infrastructure', name: 'View Audit Logs & Security Trails', description: 'Inspect real-time login and authentication trails', student: false, faculty: false, hod: false, admin: true },
  { id: 'p18', module: 'System Infrastructure', name: 'Configure SMTP & AI Prompts', description: 'Manage Gmail credentials and Gemini model setup', student: false, faculty: false, hod: false, admin: true },
]

export function AdminRolesView({ userName }: { userName: string }) {
  const [permissions, setPermissions] = useState<PermissionItem[]>(DEFAULT_PERMISSIONS)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const togglePermission = (id: string, role: 'student' | 'faculty' | 'hod' | 'admin') => {
    // Admin permissions are locked to true for root safety
    if (role === 'admin') return

    setPermissions(
      permissions.map((p) => {
        if (p.id === id) {
          return { ...p, [role]: !p[role] }
        }
        return p
      })
    )
    setSavedSuccess(false)
  }

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT RBAC SECURITY & ROLE PERMISSIONS POLICY',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official RBAC Security Policy Matrix',
      sections: [
        {
          heading: '1. ROLE-BASED ACCESS CONTROL (RBAC) OVERVIEW',
          body: [
            'Security Model: Tiered Least-Privilege Role-Based Access Control (RBAC)',
            'Tier 0: Super Administrator — Full Unrestricted Root & Infrastructure Rights',
            'Tier 3: Head of Department (HOD) — Departmental Oversight & Executive Approvals',
            'Tier 2: Faculty Directorate — Course Management, Lesson Plans & OD Sanctions',
            'Tier 1: Enrolled Students — Academic Repository, Biometric Attendance & Project Hub',
          ],
        },
        {
          heading: '2. PRIVILEGE ENFORCEMENT MATRIX (EXCERPT)',
          body: permissions.map(
            (p) =>
              `• [${p.module}] ${p.name} -> Student: ${p.student ? 'ALLOW' : 'DENY'} | Faculty: ${p.faculty ? 'ALLOW' : 'DENY'} | HOD: ${p.hod ? 'ALLOW' : 'DENY'} | Admin: ${p.admin ? 'ALLOW' : 'DENY'}`
          ),
        },
      ],
      fileName: 'VSB_RBAC_Permissions_Policy_2026',
    })
  }

  const modules = Array.from(new Set(permissions.map((p) => p.module)))

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
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

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export RBAC Matrix (PDF)
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-green-800" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Policy Saved!' : 'Save Policy Matrix'}
          </button>
        </div>
      </div>

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-black uppercase">
              Tier 1 Role
            </span>
            <GraduationCap className="w-5 h-5 text-[#1455D9]" />
          </div>
          <h3 className="font-bold text-sm text-[#071A3D]">Student Role</h3>
          <p className="text-xs text-gray-500">Read-only curricular resources, OD submissions, personal attendance &amp; research synopsis.</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
              Tier 2 Role
            </span>
            <Users className="w-5 h-5 text-purple-700" />
          </div>
          <h3 className="font-bold text-sm text-[#071A3D]">Faculty Directorate</h3>
          <p className="text-xs text-gray-500">Curriculum packs, lesson plan units, OD verification, question paper generator &amp; marks entry.</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase">
              Tier 3 Role
            </span>
            <ShieldCheck className="w-5 h-5 text-indigo-700" />
          </div>
          <h3 className="font-bold text-sm text-[#071A3D]">HOD Leadership</h3>
          <p className="text-xs text-gray-500">Workload distribution, targeted circular broadcast, COE blueprints &amp; NBA accreditation reports.</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
              Tier 0 Root
            </span>
            <Lock className="w-5 h-5 text-rose-700" />
          </div>
          <h3 className="font-bold text-sm text-[#071A3D]">Super Admin</h3>
          <p className="text-xs text-gray-500">Full system jurisdiction, user provisioning, database backups, SMTP OTP &amp; audit security.</p>
        </div>
      </div>

      {/* Permissions Interactive Matrix */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-[#071A3D]">Granular Access Control Matrix</h2>
            <p className="text-xs text-gray-500">Click any toggle button to instantly permit or restrict capabilities per role</p>
          </div>
          <span className="text-xs font-bold text-[#1455D9] bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
            {permissions.length} Privilege Rules Enforced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-1/3">Privilege / Action</th>
                <th className="px-4 py-3.5 text-center">Student (🎓)</th>
                <th className="px-4 py-3.5 text-center">Faculty (📚)</th>
                <th className="px-4 py-3.5 text-center">HOD (🏛️)</th>
                <th className="px-4 py-3.5 text-center">Super Admin (🔒)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {modules.map((mod) => (
                <React.Fragment key={mod}>
                  <tr className="bg-gray-50/80">
                    <td colSpan={5} className="px-5 py-2 font-black text-[#071A3D] uppercase text-[10px] tracking-wider">
                      Module: {mod}
                    </td>
                  </tr>
                  {permissions
                    .filter((p) => p.module === mod)
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-[#071A3D] text-xs">{p.name}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{p.description}</p>
                        </td>

                        {/* Student toggle */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => togglePermission(p.id, 'student')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              p.student
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            {p.student ? '✓ Allowed' : '✕ Restricted'}
                          </button>
                        </td>

                        {/* Faculty toggle */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => togglePermission(p.id, 'faculty')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              p.faculty
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            {p.faculty ? '✓ Allowed' : '✕ Restricted'}
                          </button>
                        </td>

                        {/* HOD toggle */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => togglePermission(p.id, 'hod')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              p.hod
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            {p.hod ? '✓ Allowed' : '✕ Restricted'}
                          </button>
                        </td>

                        {/* Admin toggle (Locked to Allowed for safety) */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-100 text-[#1455D9] border border-blue-200">
                            🛡️ Root Full
                          </span>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
