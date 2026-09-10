'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  User,
  Mail,
  Phone,
  Building,
  Award,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Download,
  Printer,
  Sparkles,
  BookOpen,
  Users,
  GraduationCap,
  Clock,
  MapPin,
  Briefcase,
  Layers,
  Activity,
  Check,
  X,
  Shield,
  FileCheck,
  Building2,
  FileText,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import toast from 'react-hot-toast'

export interface HODProfileData {
  id: string
  name: string
  email: string
  phone?: string | null
  facultyId: string
  designation: string
  qualification: string
  experience: number
  department: string
  officeLocation?: string
  officeHours?: string
  specializations?: string[]
  bio?: string
  facultyCount: number
  studentCount: number
  recentLogs?: {
    id: string
    action: string
    module: string
    details?: string | null
    createdAt: string
    status: string
  }[]
}

export function HODProfileView({ initialProfile }: { initialProfile: HODProfileData }) {
  const [profile, setProfile] = useState<HODProfileData>(initialProfile)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone || '',
    designation: profile.designation,
    qualification: profile.qualification,
    experience: profile.experience,
    officeLocation: profile.officeLocation || 'Main Administrative Complex · Cabin HOD-101',
    officeHours: profile.officeHours || '09:00 AM - 05:00 PM (Mon - Sat)',
    bio:
      profile.bio ||
      'Leading the Department of Artificial Intelligence & Data Science with focus on research excellence, industry collaboration, and autonomous academic standards.',
  })

  // Handle Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/hod/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        toast.success('HOD Profile updated successfully!')
        setProfile((prev) => ({
          ...prev,
          name: formData.name,
          phone: formData.phone,
          designation: formData.designation,
          qualification: formData.qualification,
          experience: Number(formData.experience),
          officeLocation: formData.officeLocation,
          officeHours: formData.officeHours,
          bio: formData.bio,
        }))
        setIsEditModalOpen(false)
      } else {
        toast.error(result.message || 'Failed to update profile')
      }
    } catch {
      toast.error('Network error saving profile')
    } finally {
      setSaving(false)
    }
  }

  // Export Executive PDF Dossier
  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'EXECUTIVE PROFILE & ACADEMIC DOSSIER',
      subtitle: `${profile.designation.toUpperCase()} · DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE`,
      author: profile.name,
      category: 'Head of Department Institutional Credentials',
      sections: [
        {
          heading: '1. EXECUTIVE IDENTIFICATION & CONTACT',
          body: [
            `Full Name: ${profile.name}`,
            `Official Designation: ${profile.designation}`,
            `Faculty Employee ID: ${profile.facultyId}`,
            `Department Directorate: ${profile.department}`,
            `Institution: V.S.B. Engineering College (Autonomous), Karur`,
            `Official Email: ${profile.email}`,
            `Contact Phone: ${profile.phone || 'Recorded in Portal'}`,
            `Office Location: ${profile.officeLocation || 'Main Administrative Complex · Cabin HOD-101'}`,
            `Office Consultation Hours: ${profile.officeHours || '09:00 AM - 05:00 PM'}`,
          ],
        },
        {
          heading: '2. ACADEMIC CREDENTIALS & RESEARCH LEADERSHIP',
          body: [
            `Highest Qualification: ${profile.qualification}`,
            `Total Experience: ${profile.experience} Years of Teaching, Research & Administration`,
            `Research Focus: Deep Learning, Computer Vision, Edge AI, Large Language Models & MLOps`,
            `Department Faculty Strength: ${profile.facultyCount} Professors & Assistant Professors`,
            `Department Student Enrollment: ${profile.studentCount} Undergraduates Enrolled`,
            `Executive Philosophy: ${profile.bio || 'Promoting technical innovation and academic rigor.'}`,
          ],
        },
        {
          heading: '3. INSTITUTIONAL RESPONSIBILITIES & AUTHORITIES',
          body: [
            'Convener of Board of Studies (BoS) for AI & Data Science Curriculum and Regulations.',
            'Executive Authority for Student On-Duty (OD), Leave, and Hackathon Approvals.',
            'Lead Coordinator for NBA Tier-1 and NAAC Institutional Accreditation Audits.',
            'Supervisor for Department High-Performance Computing Labs and Research Grants.',
          ],
        },
      ],
      fileName: `VSB_AI_DS_HOD_${profile.name.replace(/[^a-zA-Z0-9]/g, '_')}_Dossier`,
    })
  }

  const specializations = profile.specializations || [
    'Deep Learning & Neural Networks',
    'Computer Vision & Edge AI',
    'Natural Language Processing',
    'Autonomous Systems & Robotics',
    'Big Data Analytics & Cloud MLOps',
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fade-in">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-[#F4C430] flex items-center justify-center text-4xl sm:text-5xl font-black text-[#F4C430] shadow-2xl shrink-0">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Head of Department
              </span>
              <span className="text-xs text-blue-200 font-mono">· {profile.facultyId}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                Executive Admin
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{profile.name}</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              {profile.designation} · {profile.department}
            </p>
            <p className="text-[11px] text-gray-300">
              V.S.B. Engineering College (Autonomous), Karur · Anna University Affiliated
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#F4C430]" />
            <span>Export Dossier PDF</span>
          </button>
        </div>
      </div>

      {/* Leadership & Department Jurisdiction Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Department Faculty</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{profile.facultyCount}</p>
          <p className="text-[10px] text-gray-500">Teaching &amp; Research</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs text-center bg-blue-50/20">
          <p className="text-[10px] text-[#1455D9] font-bold uppercase">Enrolled Students</p>
          <p className="text-2xl font-black text-[#1455D9] mt-0.5">{profile.studentCount}</p>
          <p className="text-[10px] text-blue-600 font-bold">Admin Enrolled Roster</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs text-center bg-purple-50/20">
          <p className="text-[10px] text-purple-700 font-bold uppercase">Active Cohorts</p>
          <p className="text-2xl font-black text-purple-800 mt-0.5">10 Classes</p>
          <p className="text-[10px] text-purple-600">Years II, III, IV · Sec A-D</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs text-center bg-emerald-50/20">
          <p className="text-[10px] text-emerald-700 font-bold uppercase">Accreditation</p>
          <p className="text-xl font-black text-emerald-800 mt-1">NAAC A+</p>
          <p className="text-[10px] text-emerald-600 font-bold">NBA Tier-1 Compliant</p>
        </div>
      </div>

      {/* Main Profile Particulars Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Card 1: Personal & Contact Particulars */}
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black text-[#071A3D] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#1455D9]" />
                Personal &amp; Contact Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-[#1455D9] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Official Email:</span>
                <span className="font-bold text-[#071A3D] font-mono">{profile.email}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Contact Number:</span>
                <span className="font-bold text-[#071A3D]">
                  {profile.phone || (
                    <span className="text-amber-600 font-medium italic">Click &quot;Edit Profile&quot; to add mobile</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Faculty / Employee ID:</span>
                <span className="font-bold text-[#1455D9] font-mono">{profile.facultyId}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Executive Office / Cabin:</span>
                <span className="font-bold text-gray-800">{profile.officeLocation || 'Cabin HOD-101'}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Consultation Hours:</span>
                <span className="font-bold text-gray-800">{profile.officeHours || '09:00 AM - 05:00 PM'}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Account Status:</span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active · Executive Admin
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Academic & Institutional Credentials */}
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black text-[#071A3D] uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                Academic &amp; Institutional Credentials
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                Verified Record
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Designation:</span>
                <span className="font-bold text-[#071A3D]">{profile.designation}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Highest Qualification:</span>
                <span className="font-bold text-[#1455D9]">{profile.qualification}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Total Experience:</span>
                <span className="font-bold text-purple-700">
                  {profile.experience} Years Teaching &amp; Research
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Department:</span>
                <span className="font-bold text-[#071A3D]">{profile.department}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Affiliating Body:</span>
                <span className="font-bold text-gray-800">Anna University, Chennai</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500 font-medium">Autonomous Regulation:</span>
                <span className="font-bold text-gray-800">VSB Regulation 2021 (Autonomous)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Research & Departmental Leadership Overview */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Research Specializations & Biography */}
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black text-[#071A3D] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <Sparkles className="w-4 h-4 text-[#F4C430]" />
              Research Focus &amp; Core Specializations
            </h3>

            <div className="flex flex-wrap gap-2">
              {specializations.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[#1455D9] font-bold text-xs"
                >
                  {spec}
                </span>
              ))}
            </div>

            <div className="pt-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Executive Leadership Statement</p>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-100 italic">
                &ldquo;{profile.bio || 'Leading the Department of AI & DS with focus on research excellence, industry collaboration, and autonomous academic standards.'}&rdquo;
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Department Governance Responsibilities */}
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black text-[#071A3D] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <Shield className="w-4 h-4 text-emerald-600" />
              Executive Authorities &amp; Governance Roles
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#071A3D]">Executive OD &amp; Event Sanction Authority</p>
                  <p className="text-gray-500 text-[11px]">Final department sanction for student hackathons, symposiums, and attendance credit.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#071A3D]">Board of Studies (BoS) Convenor</p>
                  <p className="text-gray-500 text-[11px]">Curriculum restructuring, AI &amp; Data Science autonomous syllabus formulation.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#071A3D]">Faculty Allocation &amp; Class Advisor Oversight</p>
                  <p className="text-gray-500 text-[11px]">Workload distribution, subject allocations, and mentor-mentee compliance.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#071A3D]">NBA &amp; NAAC Department Audit Chairperson</p>
                  <p className="text-gray-500 text-[11px]">Criterion leads, outcome-based education (OBE) course attainment verification.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executive Actions Trail */}
      {profile.recentLogs && profile.recentLogs.length > 0 && (
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black text-[#071A3D] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <Activity className="w-4 h-4 text-[#1455D9]" />
              Recent Executive Activity Audit Trail
            </h3>

            <div className="divide-y divide-gray-100 text-xs">
              {profile.recentLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#071A3D] capitalize">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-gray-500 text-[11px] truncate max-w-lg">{log.details || log.module}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0">{log.createdAt}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#071A3D] to-[#1455D9] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5 text-[#F4C430]" />
                </div>
                <div>
                  <h3 className="font-black text-base">Edit HOD Executive Profile</h3>
                  <p className="text-[11px] text-blue-200">Update personal particulars and academic designations</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Logeshwaran S"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Contact / Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 94433 12345"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Professor & Head"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="Ph.D. (AI & Data Science)"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Total Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Office / Cabin Location</label>
                  <input
                    type="text"
                    value={formData.officeLocation}
                    onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                    placeholder="Main Admin Block · Cabin HOD-101"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Office Consultation Hours</label>
                  <input
                    type="text"
                    value={formData.officeHours}
                    onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                    placeholder="09:00 AM - 05:00 PM (Mon - Sat)"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Executive Biography / Statement</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Outline departmental goals, academic priorities, and research initiatives..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
