'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Award,
  Download,
  Calendar,
  Sparkles,
  Layers,
  MapPin,
  CheckCircle2,
  Edit3,
  X,
  Lock,
  Users,
  Clock,
  Shield,
  FileCheck,
  Check,
  AlertCircle,
  ArrowRight,
  Sliders,
  Building,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface FacultyProfileData {
  name: string
  facultyId: string
  designation: string
  qualification: string
  experience: number
  specialization: string
  email: string
  phone: string
  cabin: string
  officeHours: string
  publicationsCount: number
  citationsCount: number
  allocatedCourses: string[]
  isAdvisor?: boolean
  advisorBatch?: string
  advisorYear?: number
  advisorSem?: number
  advisorSec?: string
  facultyType?: string
  studentCount?: number
}

export function FacultyProfileView({ data: initialData }: { data: FacultyProfileData }) {
  const [data, setData] = useState(initialData)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: data.name,
    phone: data.phone || '',
    email: data.email || '',
    qualification: data.qualification || '',
    specialization: data.specialization || '',
    experience: data.experience || 1,
    cabin: data.cabin || 'Staff Room 2 · AI & DS Block (Desk #4)',
    officeHours: data.officeHours || 'Tuesday & Thursday · 03:30 PM - 04:30 PM',
  })
  const [loading, setLoading] = useState(false)

  const isAdvisor = Boolean(data.isAdvisor)

  const handleDownloadFacultyDossier = () => {
    generateAndDownloadPDF({
      title: isAdvisor
        ? 'CLASS ADVISOR & FACULTY ADMINISTRATIVE DOSSIER'
        : 'FACULTY ACADEMIC & RESEARCH DOSSIER',
      subtitle: `${data.name} · ${data.designation} · Department of AI & DS · V.S.B. Engineering College`,
      author: 'Office of the Principal & Dean of Academic Affairs',
      category: isAdvisor ? 'Class Advisor Portfolio' : 'Faculty Curriculum Vitae',
      sections: [
        {
          heading: '1. FACULTY BIOGRAPHICAL & CONTACT PARTICULARS',
          body: [
            `Full Name: ${data.name}`,
            `Academic Designation: ${data.designation}`,
            `Role: ${isAdvisor ? 'Official Class Advisor & Faculty' : 'Faculty Member'}`,
            `Highest Qualification: ${data.qualification}`,
            `Teaching & Advisory Experience: ${data.experience} Years`,
            `Specialization: ${data.specialization}`,
            `Official Email: ${data.email}`,
            `Contact Phone: ${data.phone || 'N/A'}`,
            `Faculty Cabin: ${data.cabin}`,
            `Office Counseling Hours: ${data.officeHours}`,
          ],
        },
        ...(isAdvisor
          ? [
              {
                heading: '2. CLASS ADVISOR JURISDICTION & STUDENT COHORT',
                body: [
                  `Assigned Cohort Batch: ${data.advisorBatch || 'B.Tech AI & DS'}`,
                  `Year of Study: Year ${data.advisorYear || 2} | Semester ${data.advisorSem || 3} | Section ${data.advisorSec || 'A'}`,
                  `Enrolled Students Under Direct Mentorship: ${data.studentCount || 'Official Roster'} Students`,
                  'Statutory Mandate: OD Verification, Attendance Defaulter Monitoring, Anna University Exam Eligibility Sign-off, and Parent Consultation.',
                ],
              },
            ]
          : []),
        {
          heading: isAdvisor ? '3. ALLOCATED SUBJECTS & ADVISORY COMMITMENTS' : '2. ALLOCATED COURSES',
          body:
            data.allocatedCourses.length > 0
              ? data.allocatedCourses.map((c) => `Course Code & Title: ${c}`)
              : [
                  `Primary Institutional Responsibility: Head Class Advisor & Student Mentorship for ${data.advisorBatch || 'Assigned Cohort'}.`,
                  'No secondary theory subjects allocated for current semester.',
                ],
        },
      ],
      fileName: `${data.facultyId}_${data.name.replace(/[^a-zA-Z0-9]/g, '_')}_Dossier`,
    })
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Save profile basics via complete-profile
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          email: editForm.email.trim(),
          qualification: editForm.qualification.trim(),
          specialization: editForm.specialization.trim(),
          experience: Number(editForm.experience) || 1,
        }),
      })

      // 2. Save cabin and office hours via faculty settings
      await fetch('/api/faculty/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PROFILE',
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          qualification: editForm.qualification.trim(),
          specialization: editForm.specialization.trim(),
          experience: Number(editForm.experience) || 0,
          cabin: editForm.cabin.trim(),
          officeHours: editForm.officeHours.trim(),
        }),
      }).catch(() => {})

      const result = await res.json()
      if (res.ok && result.success) {
        setData((prev) => ({
          ...prev,
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          email: editForm.email.trim(),
          qualification: editForm.qualification.trim(),
          specialization: editForm.specialization.trim(),
          experience: Number(editForm.experience) || 0,
          cabin: editForm.cabin.trim(),
          officeHours: editForm.officeHours.trim(),
        }))
        setIsEditOpen(false)
        toast.success('Faculty profile details saved successfully!')
      } else {
        toast.error(result.message || 'Failed to update profile.')
      }
    } catch {
      toast.error('Network error updating profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header Profile Hero */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#22C7E8] to-[#F4C430] text-[#071A3D] font-black text-3xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
            {data.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              {isAdvisor && (
                <span className="px-3 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Award className="w-3 h-3 text-[#071A3D]" />
                  Official Class Advisor
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-[#22C7E8]/20 border border-[#22C7E8]/40 text-[#22C7E8] text-[10px] font-bold">
                {data.designation}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{data.name}</h1>
            <p className="text-xs sm:text-sm text-gray-300">
              {data.qualification} · {data.experience} Years Experience · Dept. of AI &amp; DS
            </p>
            {isAdvisor && (
              <p className="text-xs text-[#22C7E8] font-bold flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                <Users className="w-3.5 h-3.5" />
                <span>Assigned Cohort: {data.advisorBatch}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 shadow-xs cursor-pointer hover:scale-105"
          >
            <Edit3 className="w-4 h-4 text-[#22C7E8]" /> Edit Profile
          </button>
          <button
            onClick={handleDownloadFacultyDossier}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Download className="w-4 h-4" /> Export Dossier (PDF)
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {isAdvisor ? (
          <>
            <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Advisory Cohort</p>
              <p className="text-lg font-black text-[#1455D9] mt-0.5 truncate">{data.advisorBatch}</p>
              <p className="text-[10px] text-gray-500 font-medium">
                Year {data.advisorYear} · Sec {data.advisorSec}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs text-center">
              <p className="text-[10px] text-emerald-600 font-bold uppercase">Students Mentored</p>
              <p className="text-xl font-black text-emerald-700 mt-0.5">
                {data.studentCount && data.studentCount > 0 ? `${data.studentCount} Students` : '0 Enrolled'}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">
                {data.studentCount && data.studentCount > 0 ? 'Direct Roster Scope' : 'Class Roster Pending'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs text-center">
              <p className="text-[10px] text-purple-700 font-bold uppercase">Experience</p>
              <p className="text-xl font-black text-purple-700 mt-0.5">{data.experience} Years</p>
              <p className="text-[10px] text-purple-600 font-medium">Academic &amp; Mentorship</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs text-center">
              <p className="text-[10px] text-amber-700 font-bold uppercase">Counseling Cabin</p>
              <p className="text-sm font-black text-amber-800 mt-0.5 truncate">{data.cabin}</p>
              <p className="text-[10px] text-amber-700 font-medium truncate">{data.officeHours}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Experience</p>
              <p className="text-xl font-black text-[#1455D9] mt-0.5">{data.experience} Years</p>
              <p className="text-[10px] text-gray-400">Teaching &amp; Academic</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs text-center">
              <p className="text-[10px] text-purple-700 font-bold uppercase">Allocated Workload</p>
              <p className="text-xl font-black text-purple-700 mt-0.5">
                {data.allocatedCourses.length} Subject{data.allocatedCourses.length === 1 ? '' : 's'}
              </p>
              <p className="text-[10px] text-purple-600">Active Curriculum</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs text-center">
              <p className="text-[10px] text-green-700 font-bold uppercase">Faculty Cadre</p>
              <p className="text-sm font-black text-green-700 mt-1">
                {data.facultyType === 'lab_faculty' ? 'Lab In-charge' : 'Theory Specialist'}
              </p>
              <p className="text-[10px] text-green-600">AI &amp; DS Department</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs text-center">
              <p className="text-[10px] text-amber-700 font-bold uppercase">Teaching Schedule</p>
              <p className="text-sm font-black text-amber-800 mt-1 truncate">{data.officeHours}</p>
              <p className="text-[10px] text-amber-700 truncate">{data.cabin}</p>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CLASS ADVISOR JURISDICTION & POWERS CARD (HIGHLIGHTED FOR ADVISOR) */}
      {/* ========================================================================= */}
      {isAdvisor ? (
        <Card className="rounded-3xl border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-white shadow-xs overflow-hidden">
          <CardContent className="p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1455D9] block mb-0.5">
                  Institutional Appointment &amp; Oversight
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#071A3D] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#1455D9]" />
                  Class Advisor Jurisdiction: {data.advisorBatch}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Academic Year 2025–2026 · Department of Artificial Intelligence &amp; Data Science
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/faculty-dashboard/students"
                  className="px-4 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" /> View Class Students
                </Link>
                <Link
                  href="/faculty-dashboard/attendance"
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-blue-300 text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#1455D9]" /> Attendance Log
                </Link>
                <Link
                  href="/faculty-dashboard/settings"
                  className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Tune advisor policy cutoffs"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Statutory Advisory Powers Grid */}
            <div>
              <p className="text-xs font-black uppercase text-[#071A3D] mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Authorized Advisory Powers &amp; Regulatory Duties:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1455D9] font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>OD Application Sign-off</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Primary verification and approval authority for student symposium, hackathon, and sports OD forms.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1455D9] font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Attendance Defaulters</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Tracking 75% minimum condonation threshold and issuing proactive early-warning notices to parents.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1455D9] font-bold text-xs">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Exam Eligibility Sign-off</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Verification of internal marks, hall ticket clearances, and Anna University registration eligibility.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1455D9] font-bold text-xs">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Parent Consultation</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Official department liaison for parent inquiries, emergency intimations, and student counseling.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ========================================================================= */
        /* FACULTY TEACHING PORTFOLIO CARD (FOR THEORY/LAB SPECIALISTS) */
        /* ========================================================================= */
        <Card className="rounded-3xl border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-white shadow-xs overflow-hidden">
          <CardContent className="p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1455D9] block mb-0.5">
                  Institutional Appointment &amp; Academic Responsibilities
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#071A3D] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#1455D9]" />
                  Faculty Teaching Portfolio: Department of AI &amp; DS
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Academic Year 2025–2026 · V.S.B. Engineering College
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Link
                  href="/faculty-dashboard/attendance"
                  className="px-4 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" /> Take Attendance
                </Link>
                <Link
                  href="/faculty-dashboard/subjects"
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-blue-300 text-[#071A3D] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#1455D9]" /> My Subjects
                </Link>
                <Link
                  href="/faculty-dashboard/question-papers"
                  className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <FileCheck className="w-3.5 h-3.5 text-[#1455D9]" /> Question Papers
                </Link>
              </div>
            </div>

            {/* Teaching Responsibilities Grid */}
            <div>
              <p className="text-xs font-black uppercase text-[#071A3D] mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Authorized Teaching Duties &amp; Subject Responsibilities:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1455D9] font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Period Attendance</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Recording live period attendance, tracking presence and marking OD/Absents in real time.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1455D9] font-bold text-xs">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Syllabus Delivery</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Upload official syllabus (PDF/DOCX), parse units and track classroom curriculum coverage.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1455D9] font-bold text-xs">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Assessment &amp; Tests</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Formulating and submitting question papers for IAT-1, IAT-2 and Model semester examinations.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1455D9] font-bold text-xs">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>Academic Guidance</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Subject doubts clarification, practical lab supervision, and student project mentorship.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Details Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact & Cabin Info */}
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#071A3D] flex items-center gap-2">
              <User className="w-4 h-4 text-[#1455D9]" /> Academic &amp; Contact Particulars
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Institutional Email:</span>
                <span className="font-bold text-[#071A3D] font-mono">{data.email}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Contact Phone:</span>
                <span className="font-bold text-[#071A3D]">{data.phone || '+91 98421 12345'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Highest Qualification:</span>
                <span className="font-bold text-[#071A3D]">{data.qualification}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Specialization:</span>
                <span className="font-bold text-[#1455D9]">{data.specialization}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Advisor Cabin / Desk:</span>
                <span className="font-bold text-[#071A3D]">{data.cabin}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Office Counseling Hours:</span>
                <span className="font-bold text-gray-700">{data.officeHours}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: Class Advisor Student Information Hub OR Teaching Workload */}
        {isAdvisor ? (
          <Card className="rounded-3xl border-blue-200/80 shadow-xs bg-gradient-to-br from-blue-50/40 via-white to-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <h3 className="font-bold text-sm text-[#071A3D] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1455D9]" /> Class Cohort &amp; Student Information Hub
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100/80 text-[#1455D9] text-[10px] font-black uppercase tracking-wider">
                  {data.advisorBatch || 'Year 2 · Sec B'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white border border-blue-100/80 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#071A3D] flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#1455D9]" /> Full Student Roster &amp; Academic Dossiers
                    </span>
                    <span className="text-[11px] font-bold text-[#1455D9]">
                      {data.studentCount && data.studentCount > 0 ? `${data.studentCount} Enrolled Students` : 'Direct Cohort Scope'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Complete student profiles, Anna University register numbers, roll numbers, semester CGPA progression, and internal assessment marks.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-blue-100/80 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#071A3D] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" /> Attendance Monitoring &amp; Defaulter Tracking
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">75% Threshold Policy</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Live period attendance logs, absentees tracking, parent SMS / WhatsApp notification alerts, and condonation compliance.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-blue-100/80 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#071A3D] flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-purple-600" /> On-Duty (OD) &amp; Leave Authorizations
                    </span>
                    <span className="text-[11px] font-bold text-purple-600">Primary Sign-off</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Primary verification and digital approval authority for symposiums, external hackathons, paper presentations, and medical leaves with document proofs.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-blue-100/80 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#071A3D] flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-amber-600" /> Parent &amp; Guardian Direct Liaison
                    </span>
                    <span className="text-[11px] font-bold text-amber-700">Verified Contact Directory</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Direct access to parent mobile numbers, address details, and official emergency contacts for regular counseling and meeting intimations.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  href="/faculty-dashboard/students"
                  className="flex-1 min-w-[140px] text-center px-4 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Manage Class Students ({data.studentCount || 0})
                </Link>
                <Link
                  href="/faculty-dashboard/attendance"
                  className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-blue-300 text-[#071A3D] text-xs font-bold transition-all shadow-xs"
                >
                  Attendance Log
                </Link>
                <Link
                  href="/faculty-dashboard/projects"
                  className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-blue-300 text-[#071A3D] text-xs font-bold transition-all shadow-xs"
                >
                  Class Projects
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-sm text-[#071A3D] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1455D9]" /> Allocated Teaching Subjects &amp; Workload
              </h3>

              <div className="space-y-2.5 text-xs">
                {data.allocatedCourses.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2 text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1455D9] flex items-center justify-center mx-auto">
                      <Award className="w-5 h-5" />
                    </div>
                    <p className="font-black text-sm text-[#071A3D]">Department Academic Portfolio</p>
                    <p className="text-[11px] text-gray-600 max-w-sm mx-auto">
                      No primary teaching subjects currently assigned for this semester.
                    </p>
                  </div>
                ) : (
                  data.allocatedCourses.map((c, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#1455D9] shrink-0" />
                        <span className="font-bold text-[#071A3D]">{c}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href="/faculty-dashboard/attendance"
                          className="px-2.5 py-1 rounded-lg bg-[#1455D9] text-white text-[11px] font-bold hover:bg-[#0e44b5] transition-all shadow-2xs"
                        >
                          Attendance
                        </Link>
                        <Link
                          href="/faculty-dashboard/subjects"
                          className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-[#1455D9] text-[11px] font-bold hover:bg-blue-50 transition-all shadow-2xs"
                        >
                          Syllabus
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">
                  {isAdvisor ? 'Edit Class Advisor Profile' : 'Edit Faculty Profile'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone / Mobile *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98421 12345"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="faculty@vsb.edu.in"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Tech, Ph.D."
                    value={editForm.qualification}
                    onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Specialization / Domain</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Data Science, Deep Learning"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Advisor Cabin Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Staff Room 2, Desk #4"
                    value={editForm.cabin}
                    onChange={(e) => setEditForm({ ...editForm, cabin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Office Counseling Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. Tuesday & Thursday, 03:30 PM"
                    value={editForm.officeHours}
                    onChange={(e) => setEditForm({ ...editForm, officeHours: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              {isAdvisor && (
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-gray-700 text-[11px] space-y-1">
                  <span className="font-bold text-[#1455D9] block">Advisory Assignment:</span>
                  <p>
                    Official Class Advisor for <strong>{data.advisorBatch}</strong> (Year {data.advisorYear}, Sem {data.advisorSem}, Section {data.advisorSec}). Class cohort is managed by Department HOD.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
