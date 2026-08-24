'use client'

import React from 'react'
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
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

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
}

export function FacultyProfileView({ data }: { data: FacultyProfileData }) {
  const handleDownloadFacultyDossier = () => {
    generateAndDownloadPDF({
      title: 'FACULTY ACADEMIC & RESEARCH DOSSIER',
      subtitle: `${data.name} · ${data.designation} · Department of AI & DS`,
      author: 'Office of the Principal & Dean of Academic Affairs',
      category: 'Faculty Profile & Curriculum Vitae',
      sections: [
        {
          heading: '1. FACULTY BIOGRAPHICAL & CONTACT PARTICULARS',
          body: [
            `Full Name: ${data.name}`,
            `Institutional Faculty ID: ${data.facultyId}`,
            `Academic Designation: ${data.designation}`,
            `Highest Qualification: ${data.qualification}`,
            `Total Teaching & Research Experience: ${data.experience} Years`,
            `Specialization: ${data.specialization}`,
            `Official Email: ${data.email}`,
            `Contact Phone: ${data.phone}`,
            `Faculty Cabin: ${data.cabin}`,
            `Office Counseling Hours: ${data.officeHours}`,
          ],
        },
        {
          heading: '2. RESEARCH PUBLICATIONS & SCHOLARLY CONTRIBUTIONS',
          body: [
            `Total Peer-Reviewed Journal Publications: ${data.publicationsCount} Scopus / SCI Indexed Papers`,
            `Total Academic Citations: ${data.citationsCount} Citations (h-index: 12)`,
            'Key Research Domains: Machine Learning Optimization, Deep Neural Architectures, Computer Vision & Edge AI',
            'Conference Proceedings: IEEE, Springer & ACM International Conferences',
          ],
        },
        {
          heading: '3. CURRENT ALLOCATED COURSES (SEMESTER 3 & 5)',
          body: data.allocatedCourses.map((c) => `Course Code & Title: ${c}`),
        },
      ],
      fileName: `Faculty_Dossier_${data.facultyId}_${data.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Profile Hero */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#22C7E8] to-[#F4C430] text-[#071A3D] font-black text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
            {data.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                {data.designation}
              </span>
              <span className="text-xs text-gray-300 font-mono">ID: {data.facultyId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{data.name}</h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              {data.qualification} · {data.experience} Years Experience · Dept. of AI &amp; DS
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadFacultyDossier}
          className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
        >
          <Download className="w-4 h-4" /> Export Faculty Dossier (PDF)
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs text-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase">Experience</p>
          <p className="text-xl font-black text-[#1455D9] mt-0.5">{data.experience} Years</p>
          <p className="text-[10px] text-gray-400">Teaching &amp; R&amp;D</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs text-center">
          <p className="text-[10px] text-purple-700 font-bold uppercase">Publications</p>
          <p className="text-xl font-black text-purple-700 mt-0.5">{data.publicationsCount} Papers</p>
          <p className="text-[10px] text-purple-600">Scopus / SCI</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs text-center">
          <p className="text-[10px] text-green-700 font-bold uppercase">Citations</p>
          <p className="text-xl font-black text-green-600 mt-0.5">{data.citationsCount}+</p>
          <p className="text-[10px] text-green-700">h-index: 12</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs text-center">
          <p className="text-[10px] text-amber-700 font-bold uppercase">Cabin</p>
          <p className="text-xl font-black text-amber-600 mt-0.5">{data.cabin}</p>
          <p className="text-[10px] text-amber-700">{data.officeHours}</p>
        </div>
      </div>

      {/* Profile Details Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact & Cabin Info */}
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#071A3D] flex items-center gap-2">
              <User className="w-4 h-4 text-[#1455D9]" /> Academic &amp; Contact Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border flex items-center justify-between">
                <span className="text-gray-500 font-medium">Institutional Email:</span>
                <span className="font-bold text-[#071A3D] font-mono">{data.email}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex items-center justify-between">
                <span className="text-gray-500 font-medium">Contact Phone:</span>
                <span className="font-bold text-[#071A3D]">{data.phone}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex items-center justify-between">
                <span className="text-gray-500 font-medium">Specialization:</span>
                <span className="font-bold text-[#1455D9]">{data.specialization}</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border flex items-center justify-between">
                <span className="text-gray-500 font-medium">Office Counseling:</span>
                <span className="font-bold text-gray-700">{data.officeHours}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocated Subjects */}
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#071A3D] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1455D9]" /> Allocated Teaching Subjects
            </h3>

            <div className="space-y-2.5 text-xs">
              {data.allocatedCourses.map((c, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1455D9] shrink-0" />
                  <span className="font-bold text-[#071A3D]">{c}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
