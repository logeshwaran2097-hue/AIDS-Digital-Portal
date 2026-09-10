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
  GraduationCap,
  Briefcase,
  Sparkles,
  Lock,
  Search,
  Eye,
  EyeOff,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface HODRecord {
  id: string
  facultyId: string
  name: string
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  department: string
  designation?: string | null
  qualification?: string | null
  experience?: number | null
  specialization?: string | null
  status: string
}

interface AdminHODViewProps {
  initialHOD: HODRecord[]
}

export function AdminHODView({ initialHOD }: AdminHODViewProps) {
  const [hodList, setHODList] = useState<HODRecord[]>(initialHOD)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedHOD, setSelectedHOD] = useState<HODRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    designation: 'Professor & Head',
    qualification: 'Ph.D. (AI & Data Science)',
    experience: '15' as any,
    specialization: 'Artificial Intelligence, Deep Learning & Autonomous Systems',
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
            `HOD Appointees Count: ${hodList.length}`,
            `Status: Official Academic Head & BoS Chairperson`,
            `Default Password Protocol: Admin-assigned temporary password with mandatory first-login profile completion.`,
          ],
        },
        {
          heading: '2. APPOINTED HEAD OF DEPARTMENT PARTICULARS',
          body: hodList.map((h, idx) => 
            `${idx + 1}. ${h.name} — ${h.designation || 'Professor & Head'} | Email: ${h.email} | Phone: ${h.phone || 'N/A'} | Qualification: ${h.qualification || 'Ph.D. (AI & DS)'} | Experience: ${h.experience || 15} Yrs | Department: ${h.department}`
          ),
        },
      ],
      fileName: 'VSB_HOD_Appointment_Dossier_2026',
    })
  }

  // Handle Add/Appoint HOD
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.password.trim()) {
      toast.error('Please fill in HOD Full Name and Temporary Password.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/hod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          experience: Number(formData.experience) || 15,
        }),
      })
      const result = await res.json()

      if (result.success && result.hod) {
        setHODList([result.hod, ...hodList])
        setIsAddModalOpen(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          dateOfBirth: '',
          designation: 'Professor & Head',
          qualification: 'Ph.D. (AI & Data Science)',
          experience: '15',
          specialization: 'Artificial Intelligence, Deep Learning & Autonomous Systems',
          department: 'Artificial Intelligence & Data Science',
          status: 'active',
        })
        toast.success('HOD successfully registered in database!')
      } else {
        toast.error(result.message || 'Failed to add HOD')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error saving HOD.')
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
          experience: Number(formData.experience) || 15,
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
                  email: formData.email || h.email,
                  phone: formData.phone,
                  designation: formData.designation,
                  qualification: formData.qualification,
                  experience: Number(formData.experience) || 15,
                  specialization: formData.specialization,
                  dateOfBirth: formData.dateOfBirth,
                  department: formData.department,
                  status: formData.status,
                }
              : h
          )
        )
        setIsEditModalOpen(false)
        toast.success('HOD details updated in database!')
      } else {
        toast.error(result.message || 'Failed to update HOD')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error updating HOD.')
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
        toast.success(`HOD record for "${name}" removed.`)
      } else {
        toast.error(result.message || 'Failed to delete HOD')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting HOD record.')
    }
  }

  const filteredHODList = hodList.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.designation && h.designation.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F4C430]" /> Export PDF
          </button>
          <button
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                dateOfBirth: '',
                designation: 'Professor & Head',
                qualification: 'Ph.D. (AI & Data Science)',
                experience: '15',
                specialization: 'Artificial Intelligence, Deep Learning & Autonomous Systems',
                department: 'Artificial Intelligence & Data Science',
                status: 'active',
              })
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Appoint / Add HOD
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Appointed HODs</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{hodList.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">Active Leadership Profile</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Jurisdiction</p>
          <p className="text-xl font-black text-green-700 mt-0.5 truncate">AI &amp; DS Dept</p>
          <p className="text-[10px] text-green-700 font-medium mt-1">Autonomous Regulation</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Semesters Scope</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">8 Semesters</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Years I to IV Academic Oversight</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Password Policy</p>
          <p className="text-xl font-black text-amber-700 mt-0.5 font-mono">Admin Set</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">First-login self-service update</p>
        </div>
      </div>

      {/* Filter, Search & View Toggle Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search HOD by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-gray-500 font-bold px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
            {filteredHODList.length} Head(s) Listed
          </span>

          {/* Table / Cards View Toggle matching Faculty Members */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white text-[#1455D9] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
              title="Table View (Like Faculty)"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer',
                viewMode === 'cards'
                  ? 'bg-white text-[#1455D9] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Appointed HOD Directory: TABLE VIEW (Matching Faculty Members Table) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Head of Department</th>
                  <th className="px-4 py-3.5">Department &amp; Jurisdiction</th>
                  <th className="px-4 py-3.5">Designation &amp; Qualification</th>
                  <th className="px-4 py-3.5">Experience &amp; Domain</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredHODList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="font-bold text-gray-600">No Head of Department Appointed</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Click &quot;+ Appoint / Add HOD&quot; to register the Head of Department.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredHODList.map((hod, idx) => (
                    <tr key={hod.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 font-mono">{idx + 1}</td>

                      {/* Head of Department Name & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-white font-black text-sm flex items-center justify-center border border-blue-200 shadow-xs shrink-0">
                            {hod.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#071A3D] text-sm block">
                              {hod.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-[#1455D9] border border-blue-200 text-[9px] font-black font-mono">
                                {hod.facultyId}
                              </span>
                              <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                                {hod.status?.toUpperCase() || 'ACTIVE'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Jurisdiction */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#071A3D] block">
                          {hod.department}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-1 border border-blue-200 font-semibold">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          Academic Authority &amp; BoS
                        </span>
                      </td>

                      {/* Designation & Qualification */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#1455D9] block">
                          {hod.designation || 'Professor & Head'}
                        </span>
                        <span className="text-gray-600 text-[11px] block mt-0.5">
                          {hod.qualification || 'Ph.D. (AI & Data Science)'}
                        </span>
                      </td>

                      {/* Experience & Domain */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-gray-800 block">
                          {hod.experience ? `${hod.experience} Yrs Experience` : '15 Yrs Experience'}
                        </span>
                        <span className="text-gray-500 text-[11px] block mt-0.5 truncate max-w-[200px]" title={hod.specialization || 'Artificial Intelligence & Data Science'}>
                          {hod.specialization || 'AI, Deep Learning & Autonomous Systems'}
                        </span>
                      </td>

                      {/* Contact Details */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 text-[11px] text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                            <span className="font-mono">{hod.email}</span>
                          </div>
                          {hod.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
                              <span>{hod.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedHOD(hod)
                              setFormData({
                                name: hod.name,
                                email: hod.email,
                                phone: hod.phone || '',
                                password: '',
                                dateOfBirth: hod.dateOfBirth || '',
                                designation: hod.designation || 'Professor & Head',
                                qualification: hod.qualification || 'Ph.D. (AI & Data Science)',
                                experience: hod.experience || '15',
                                specialization: hod.specialization || 'Artificial Intelligence, Deep Learning & Autonomous Systems',
                                department: hod.department,
                                status: hod.status || 'active',
                              })
                              setIsEditModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit HOD Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(hod.id, hod.name)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove HOD Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointed HOD Directory: CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredHODList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Head of Department Appointed</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Click &quot;+ Appoint / Add HOD&quot; above to assign the Head of Department.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHODList.map((hod) => (
                <div
                  key={hod.id}
                  className="bg-white rounded-3xl p-6 border border-gray-200 hover:border-[#1455D9] transition-all shadow-xs space-y-4 relative group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        {hod.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-[#071A3D]">{hod.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1455D9] border border-blue-200 text-[10px] font-black font-mono">
                            {hod.facultyId}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                            {hod.status?.toUpperCase() || 'ACTIVE'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#1455D9] mt-0.5">
                          {hod.designation || 'Professor & Head of Department'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedHOD(hod)
                          setFormData({
                            name: hod.name,
                            email: hod.email,
                            phone: hod.phone || '',
                            password: '',
                            dateOfBirth: hod.dateOfBirth || '',
                            designation: hod.designation || 'Professor & Head',
                            qualification: hod.qualification || 'Ph.D. (AI & Data Science)',
                            experience: hod.experience || '15',
                            specialization: hod.specialization || 'Artificial Intelligence, Deep Learning & Autonomous Systems',
                            department: hod.department,
                            status: hod.status || 'active',
                          })
                          setIsEditModalOpen(true)
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer border border-gray-100"
                        title="Edit HOD Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hod.id, hod.name)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border border-gray-100"
                        title="Remove HOD Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-[#1455D9] shrink-0" />
                      <span className="truncate font-mono">{hod.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-[#1455D9] shrink-0" />
                      <span>{hod.phone || '+91 94431 87654'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <GraduationCap className="w-4 h-4 text-[#1455D9] shrink-0" />
                      <span>{hod.qualification || 'Ph.D. (AI & DS)'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="w-4 h-4 text-[#1455D9] shrink-0" />
                      <span className="truncate">{hod.department}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER / APPOINT HEAD OF DEPARTMENT (MATCHING FACULTY MEMBERS) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#071126]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up border border-slate-100 my-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center shadow-md shadow-blue-950/20 shrink-0">
                  <Plus className="w-6 h-6 text-[#22C7E8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1455D9] border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                      Department Leadership
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-[#0284C7] border border-cyan-200 text-[10px] font-bold">
                      Institutional Appointee
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#071A3D] mt-0.5">
                    Appoint Head of Department (HOD)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Record will be saved directly into institutional database</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                  <UserCheck className="w-4 h-4 text-[#1455D9]" />
                  <span>Full Name with Academic Title *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Dr. V. Sundar, M.E., Ph.D."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-bold text-sm text-[#071A3D] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <Mail className="w-4 h-4 text-[#1455D9]" />
                    <span>Institutional Email <span className="text-gray-400 font-normal">(Optional)</span></span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. hod.ai@vsb.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-mono text-xs text-slate-800 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-1.5 font-bold text-[#071A3D]">
                      <Lock className="w-4 h-4 text-[#1455D9]" />
                      <span>Temporary Password *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-[#1455D9] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="e.g. TempPass@2026"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/30 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-mono font-bold text-[#071A3D] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <Phone className="w-4 h-4 text-[#1455D9]" />
                    <span>Phone Number <span className="text-gray-400 font-normal">(Optional)</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94431 87654"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <Briefcase className="w-4 h-4 text-[#1455D9]" />
                    <span>Academic Designation</span>
                  </label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-bold text-[#071A3D] transition-all cursor-pointer"
                  >
                    <option value="Professor & Head">Professor &amp; Head</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Director & HOD">Director &amp; HOD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <GraduationCap className="w-4 h-4 text-[#1455D9]" />
                    <span>Academic Qualification</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ph.D. (AI & Data Science)"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-medium text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <Award className="w-4 h-4 text-[#1455D9]" />
                    <span>Total Experience (Years)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    placeholder="e.g. 15"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-bold text-[#071A3D] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#F4C430]" />
                  <span>Specialization &amp; Research Domain</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Machine Learning & Autonomous Systems"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                  <Building className="w-4 h-4 text-[#1455D9]" />
                  <span>Department &amp; Jurisdiction</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-semibold text-slate-800 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#071A3D] to-[#1455D9] hover:from-[#0A2A5E] hover:to-[#0f44b0] text-white font-bold cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F4C430]" />
                  {isLoading ? 'Saving...' : 'Save HOD to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT HOD DIRECTORATE PROFILE */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedHOD && (
        <div className="fixed inset-0 z-50 bg-[#071126]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up border border-slate-100 my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-white flex items-center justify-center shadow-md shadow-blue-950/20 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#F4C430]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1455D9] border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                      Directorate Administration
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono">
                      {selectedHOD.facultyId}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#071A3D] mt-0.5">
                    Edit HOD Directorate Profile
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Department Leadership Profile: <span className="font-bold text-[#1455D9]">{selectedHOD.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Full Name with Title */}
              <div>
                <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                  <UserCheck className="w-4 h-4 text-[#1455D9]" />
                  <span>Full Name &amp; Academic Title *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Dr. V. Sundar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-bold text-sm text-[#071A3D] transition-all"
                />
              </div>

              {/* Contact Information Row (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <Mail className="w-4 h-4 text-[#1455D9]" />
                    <span>Institutional Email Address</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. hod.ai@vsb.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-mono text-xs text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <Phone className="w-4 h-4 text-[#1455D9]" />
                    <span>Official Phone / Mobile</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94431 87654"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 transition-all"
                  />
                </div>
              </div>

              {/* Designation & Qualification Row (2 Columns with ample breathing room!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <Briefcase className="w-4 h-4 text-[#1455D9]" />
                    <span>Academic Designation</span>
                  </label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-bold text-[#071A3D] transition-all cursor-pointer"
                  >
                    <option value="Professor & Head">Professor &amp; Head</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Director & HOD">Director &amp; HOD</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <GraduationCap className="w-4 h-4 text-[#1455D9]" />
                    <span>Academic Qualification</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ph.D. (AI & Data Science)"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-medium text-slate-800 transition-all"
                  />
                </div>
              </div>

              {/* Experience & Department Row (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <Award className="w-4 h-4 text-[#1455D9]" />
                    <span>Total Experience (Years)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    placeholder="e.g. 15"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-bold text-[#071A3D] transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                    <Building className="w-4 h-4 text-[#1455D9]" />
                    <span>Department &amp; Jurisdiction</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-semibold text-slate-800 transition-all"
                  />
                </div>
              </div>

              {/* Specialization Domain */}
              <div>
                <label className="flex items-center gap-1.5 font-bold text-[#071A3D] mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#F4C430]" />
                  <span>Specialization &amp; Research Domain</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Deep Learning & Autonomous Systems"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 transition-all"
                />
              </div>

              {/* Password Reset Section (Sleek Box with Show/Hide Toggle) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/60 to-slate-50 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 font-bold text-[#071A3D]">
                    <Lock className="w-4 h-4 text-[#1455D9]" />
                    <span>Reset Access Password</span>
                    <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="text-[11px] text-[#1455D9] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {showEditPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Show
                      </>
                    )}
                  </button>
                </div>
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  placeholder="Leave blank to keep existing password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-blue-200 bg-white focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-blue-100 font-mono text-xs text-[#071A3D] transition-all"
                />
                <p className="text-[10px] text-slate-500 font-medium">
                  Leave blank to retain current password. If entered, HOD will use this new password on next login.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#071A3D] to-[#1455D9] hover:from-[#0A2A5E] hover:to-[#0f44b0] text-white font-bold cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F4C430]" />
                  {isLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
