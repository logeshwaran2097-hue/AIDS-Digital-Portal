'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  Plus,
  Trash2,
  X,
  Search,
  Edit2,
} from 'lucide-react'

export interface SubjectItem {
  id: string
  code: string
  name: string
  credits: number
  category: string
  facultyInCharge: string
  courseType?: 'Theory' | 'Laboratory' | 'Theory cum Laboratory'
  semester: number
  year?: number
  description?: string | null
  units: { number: number; title: string; hours: number }[]
}

export function AdminSubjectsView({
  initialSubjects,
}: {
  initialSubjects: SubjectItem[]
}) {
  const [subjects, setSubjects] = useState<SubjectItem[]>(initialSubjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 4,
    courseType: 'Theory' as 'Theory' | 'Laboratory' | 'Theory cum Laboratory',
    category: 'Professional Core (PC)',
    facultyInCharge: '',
    semester: 1,
    description: '',
  })

  const filteredSubjects = subjects.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.facultyInCharge.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.name) {
      alert('Please fill in Course Code and Name')
      return
    }

    try {
      const url = '/api/admin/academics'
      const method = editingId ? 'PUT' : 'POST'
      const payload = editingId ? { ...formData, id: editingId } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to ${editingId ? 'update' : 'save'} subject`)
      }

      const updatedSub: SubjectItem = {
        id: data.subject.id,
        code: data.subject.code,
        name: data.subject.name,
        credits: data.subject.credits,
        category: formData.category,
        facultyInCharge: formData.facultyInCharge,
        courseType: formData.courseType,
        semester: Number(formData.semester),
        year: Math.ceil(Number(formData.semester) / 2),
        description: data.subject.description,
        units: data.subject.units || [],
      }

      if (editingId) {
        setSubjects(subjects.map(s => (s.id === updatedSub.id ? updatedSub : s)))
      } else {
        setSubjects([...subjects.filter(s => s.id !== updatedSub.id && s.code !== updatedSub.code), updatedSub])
      }

      setIsAddModalOpen(false)
      setEditingId(null)
      setFormData({
        code: '',
        name: '',
        credits: 4,
        courseType: 'Theory',
        category: 'Professional Core (PC)',
        facultyInCharge: '',
        semester: 1,
        description: '',
      })
    } catch (err: any) {
      alert(err.message || `Failed to ${editingId ? 'update' : 'add'} subject`)
    }
  }

  const handleEditClick = (sub: SubjectItem) => {
    setEditingId(sub.id)
    setFormData({
      code: sub.code,
      name: sub.name,
      credits: sub.credits,
      courseType: sub.courseType || 'Theory',
      category: sub.category,
      facultyInCharge: sub.facultyInCharge,
      semester: sub.semester,
      description: sub.description || '',
    })
    setIsAddModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this subject from the database?')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/academics?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove subject')
      }
      setSubjects(subjects.filter((s) => s.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to remove subject')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Subject Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Manage Subjects & Course Names</h1>
          <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl">
            Add and manage the names of official subjects stored in the database.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => {
              setEditingId(null)
              setFormData({
                code: '',
                name: '',
                credits: 4,
                courseType: 'Theory',
                category: 'Professional Core (PC)',
                facultyInCharge: '',
                semester: 1,
                description: '',
              })
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Add New Subject
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subject name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-gray-500 font-bold px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            Total Subjects: {filteredSubjects.length}
          </span>
        </div>
      </div>

      {/* Subjects List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredSubjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                  <th className="px-6 py-4 font-bold">Subject Code</th>
                  <th className="px-6 py-4 font-bold">Subject Name</th>
                  <th className="px-6 py-4 font-bold">Semester</th>
                  <th className="px-6 py-4 font-bold text-center">Credits</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#1455D9]">{sub.code}</td>
                    <td className="px-6 py-4 font-bold text-[#071A3D]">{sub.name}</td>
                    <td className="px-6 py-4 text-gray-500">Sem {sub.semester}</td>
                    <td className="px-6 py-4 text-center font-bold">{sub.credits}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(sub)}
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-500 mb-1">No Subjects Found</h3>
            <p className="text-xs text-gray-400">Add a subject to start managing them here.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-[#071A3D]">{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AD3401"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Semester (1 - 8) *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Learning & Neural Networks"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Credit Score *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="20"
                    required
                    placeholder="e.g. 4 or 1.5"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-mono font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Subject Type</label>
                  <select
                    value={formData.courseType}
                    onChange={(e) => setFormData({ ...formData, courseType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Theory cum Laboratory">Theory cum Lab</option>
                  </select>
                </div>
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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  {editingId ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
