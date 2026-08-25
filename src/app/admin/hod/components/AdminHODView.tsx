'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Award,
  Download,
  Mail,
  Phone,
  Calendar,
  Building,
  Edit2,
  Trash2,
  Plus,
  X,
  UserCheck,
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedHOD, setSelectedHOD] = useState<HODRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    facultyId: 'HOD001',
    name: '',
    email: '',
    phone: '',
    department: 'Artificial Intelligence & Data Science',
    status: 'active',
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — HOD APPOINTMENT & PROFILE',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Head of Department Administrative Dossier',
      sections: [
        {
          heading: '1. EXECUTIVE SUMMARY & JURISDICTION',
          body: [
            `Department: Artificial Intelligence & Data Science`,
            `HOD Appointees: ${hodList.length}`,
            `Status: Official Academic Head & BoS Chairperson`,
          ],
        },
      ],
      fileName: 'VSB_HOD_Appointment_Dossier_2026',
    })
  }

  // Handle Add/Appoint HOD
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      alert('Please fill in HOD Name and Email')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/hod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await res.json()

      if (result.success && result.hod) {
        setHODList([result.hod, ...hodList])
        setIsAddModalOpen(false)
        setFormData({
          facultyId: 'HOD001',
          name: '',
          email: '',
          phone: '',
          department: 'Artificial Intelligence & Data Science',
          status: 'active',
        })
        alert('HOD successfully appointed and saved to database!')
      } else {
        alert(result.message || 'Failed to save HOD')
      }
    } catch (err) {
      console.error(err)
      alert('Network error saving HOD.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Edit HOD
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHOD) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/hod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          facultyId: selectedHOD.facultyId,
        }),
      })
      const result = await res.json()

      if (result.success) {
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
        alert('HOD details updated in database!')
      } else {
        alert(result.message || 'Failed to update HOD')
      }
    } catch (err) {
      console.error(err)
      alert('Network error updating HOD.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Delete HOD
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove HOD record for "${name}" from database?`)) {
      return
    }

    try {
      const res = await fetch(`/api/hod?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setHODList(hodList.filter((h) => h.id !== id))
      } else {
        alert(result.message || 'Failed to delete HOD')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting HOD record.')
    }
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

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Appoint / Add HOD
          </button>
        </div>
      </div>

      {/* HOD Profile List / Empty State */}
      {hodList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <Award className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No HOD Configured Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Click below to appoint or enter your actual Head of Department details.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Appoint Real HOD
          </button>
        </div>
      ) : (
        hodList.map((hod) => (
          <div key={hod.id} className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-blue-50">
                  {hod.name.replace('Prof. ', '').replace('Dr. ', '').charAt(0) || 'H'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[#071A3D]">{hod.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-black uppercase">
                      {hod.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#1455D9] font-bold">Head of the Department (HOD) &amp; Professor</p>
                  <p className="text-[11px] text-gray-500 font-medium">{hod.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedHOD(hod)
                    setFormData({
                      facultyId: hod.facultyId,
                      name: hod.name,
                      email: hod.email,
                      phone: hod.phone || '',
                      department: hod.department,
                      status: hod.status,
                    })
                    setIsEditModalOpen(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  onClick={() => handleDelete(hod.id, hod.name)}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove HOD"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#1455D9] shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Institutional Email</p>
                  <p className="text-xs font-bold text-[#071A3D] truncate">{hod.email}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#1455D9] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Official Phone</p>
                  <p className="text-xs font-bold text-[#071A3D]">{hod.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <Building className="w-5 h-5 text-[#1455D9] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Faculty ID</p>
                  <p className="text-xs font-bold text-[#071A3D]">{hod.facultyId}</p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* MODAL: APPOINT / ADD HOD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Appoint Real Head of Department</h3>
                <p className="text-xs text-gray-500">Record will be saved directly into the database</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Faculty ID</label>
                  <input
                    type="text"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Dr. V. Sundar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. hod.ai@vsb.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94431 87654"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-2"
                >
                  {isLoading ? 'Saving...' : 'Save HOD to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT HOD */}
      {isEditModalOpen && selectedHOD && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Edit HOD Directorate Profile</h3>
                <p className="text-xs text-gray-500">Autonomous Department Head Appointment</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
