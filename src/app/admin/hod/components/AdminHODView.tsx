'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import {
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  Edit2,
  Download,
  Plus,
  X,
  CheckCircle2,
  Building,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface HODRecord {
  id: string
  facultyId: string
  name: string
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  department: string
  status: string
}

export function AdminHODView({ initialHOD }: { initialHOD: HODRecord[] }) {
  const [hodList, setHODList] = useState<HODRecord[]>(initialHOD)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedHOD, setSelectedHOD] = useState<HODRecord | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Artificial Intelligence & Data Science',
    status: 'active',
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT HEAD (HOD) APPOINTMENT & CREDENTIALS',
      subtitle: 'V.S.B. Engineering College · Department of AI & DS · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official HOD Directorate Appointment',
      sections: [
        {
          heading: '1. DEPARTMENT JURISDICTION & AUTHORITY',
          body: [
            'Designation: Head of the Department (HOD)',
            'Jurisdiction: Department of Artificial Intelligence & Data Science',
            'Authorized Personnel: Prof. Dr. V. Sundar, M.E., Ph.D.',
            'Faculty Identification: HOD001',
            'Administrative Status: Active & Certified (Autonomous Regulations)',
          ],
        },
        {
          heading: '2. RESPONSIBILITIES & POWERS',
          body: [
            '1. Curriculum formulation, Anna University BoS representation, and syllabus compliance.',
            '2. Faculty workload distribution, performance appraisals, and timetable authorization.',
            '3. Student OD / Leave sanctioning, grievance resolution, and academic progress monitoring.',
            '4. NBA Tier-1 & NAAC Accreditation coordinator and continuous quality improvement (CQI).',
          ],
        },
      ],
      fileName: 'VSB_HOD_Appointment_Dossier_2026',
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHOD) return

    setHODList(
      hodList.map((h) =>
        h.id === selectedHOD.id
          ? {
              ...h,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              department: formData.department,
              status: formData.status,
            }
          : h
      )
    )
    setIsEditModalOpen(false)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Department Leadership Administration
            </span>
            <span className="text-xs text-gray-300 font-medium">· Root Authority</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Head of Department (HOD) Directorate</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Official department head appointment, academic jurisdiction &amp; administrative oversight
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0"
        >
          <Download className="w-4 h-4" /> Export HOD Dossier (PDF)
        </button>
      </div>

      {/* HOD Profile Card */}
      {hodList.map((hod) => (
        <div key={hod.id} className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-blue-50">
                {hod.name.replace('Prof. ', '').replace('Dr. ', '').charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-[#071A3D]">{hod.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-black uppercase">
                    {hod.status}
                  </span>
                </div>
                <p className="text-xs text-[#1455D9] font-bold">Head of the Department (HOD) &amp; Professor</p>
                <p className="text-[11px] text-gray-500 font-medium">B.Tech Artificial Intelligence &amp; Data Science</p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedHOD(hod)
                setFormData({
                  name: hod.name,
                  email: hod.email,
                  phone: hod.phone || '+91 98421 54321',
                  department: hod.department,
                  status: hod.status,
                })
                setIsEditModalOpen(true)
              }}
              className="px-4 py-2 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" /> Edit Details
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Faculty Identifier</p>
              <p className="text-base font-mono font-bold text-[#071A3D] mt-0.5">{hod.facultyId}</p>
              <p className="text-[10px] text-gray-400 mt-1">Autonomous Login ID</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Official Email</p>
              <p className="text-sm font-bold text-[#071A3D] mt-0.5 truncate">{hod.email}</p>
              <p className="text-[10px] text-gray-400 mt-1">Institutional Inbox</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Direct Cabin Contact</p>
              <p className="text-sm font-bold text-[#071A3D] mt-0.5">{hod.phone || '+91 98421 54321'}</p>
              <p className="text-[10px] text-gray-400 mt-1">Cabin: AI-101, Main Block</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Academic Jurisdiction</p>
              <p className="text-sm font-bold text-green-700 mt-0.5">Full Authority</p>
              <p className="text-[10px] text-gray-400 mt-1">Anna Univ BoS Member</p>
            </div>
          </div>
        </div>
      ))}

      {/* MODAL: EDIT HOD */}
      {isEditModalOpen && selectedHOD && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Update HOD Credentials</h3>
                <p className="text-xs text-gray-500 font-mono">ID: {selectedHOD.facultyId}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Full Name &amp; Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
