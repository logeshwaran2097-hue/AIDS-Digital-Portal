'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  BookOpen,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  CheckCircle2,
  Layers,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface ResourceRecord {
  id: string
  name: string
  description?: string | null
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  uploadedByName?: string | null
  status: string
  resourceType: string
  semester?: number | null
}

export function AdminResourcesView({ initialResources }: { initialResources: ResourceRecord[] }) {
  const [resources, setResources] = useState<ResourceRecord[]>(initialResources)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<ResourceRecord | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fileName: '',
    resourceType: 'REFERENCE_BOOK',
    semester: 4,
    uploadedByName: 'System Administrator',
  })

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.uploadedByName && r.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = typeFilter === 'ALL' || r.resourceType === typeFilter
    return matchesSearch && matchesType
  })

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — DIGITAL LIBRARY & STUDY ASSETS',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official Digital Library Asset Registry',
      sections: [
        {
          heading: '1. DIGITAL REPOSITORY ASSET INVENTORY',
          body: [
            `Total Approved Resources: ${resources.length} Standard E-Books & Course Packs`,
            'Category: Standard Reference Textbooks, Lecture Notes, Lab Manuals & Interview Kits',
            'Storage & Security: Encrypted Vector PDF Digital Asset Storage',
            'Access Clearance: Open to all verified B.Tech AI & DS Enrolled Students and Faculty',
          ],
        },
        {
          heading: '2. CATALOG OF APPROVED REFERENCE TEXTBOOKS',
          body: resources.map(
            (r, idx) =>
              `${idx + 1}. ${r.name} — Type: ${r.resourceType} | Size: ${(r.fileSize / 1024 / 1024).toFixed(1)} MB | Verified by: ${r.uploadedByName || 'Faculty Lead'}`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Digital_Library_Catalog_2026',
    })
  }

  const handleDownloadFile = (res: ResourceRecord) => {
    generateAndDownloadPDF({
      title: res.name.toUpperCase(),
      subtitle: 'V.S.B. Engineering College · Department of AI & DS · Academic Library',
      author: res.uploadedByName || 'Faculty Lead',
      category: res.resourceType,
      sections: [
        {
          heading: 'DIGITAL ASSET OVERVIEW & DESCRIPTION',
          body: [
            res.description || 'Standard academic reference textbook for undergraduate AI & DS curriculum.',
            `File Name: ${res.fileName}`,
            `Asset Type: ${res.resourceType}`,
            `Semester Alignment: Semester ${res.semester || 4}`,
            `Verified By: ${res.uploadedByName || 'Department BoS'}`,
          ],
        },
      ],
      fileName: res.fileName.replace(/\.[^/.]+$/, ''),
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      alert('Please fill in Resource Title')
      return
    }

    const newRes: ResourceRecord = {
      id: 'res_' + Date.now(),
      name: formData.name,
      description: formData.description,
      fileName: formData.fileName || `${formData.name.replace(/\s+/g, '_')}.pdf`,
      fileType: 'pdf',
      fileSize: 15400000,
      fileUrl: `/resources/${formData.fileName || 'document.pdf'}`,
      uploadedByName: formData.uploadedByName,
      status: 'approved',
      resourceType: formData.resourceType,
      semester: Number(formData.semester),
    }

    setResources([newRes, ...resources])
    setIsAddModalOpen(false)
    setFormData({
      name: '',
      description: '',
      fileName: '',
      resourceType: 'REFERENCE_BOOK',
      semester: 4,
      uploadedByName: 'System Administrator',
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this digital resource from the library?')) {
      setResources(resources.filter((r) => r.id !== id))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Digital Library &amp; Assets
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Study Resources &amp; E-Books</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Manage {resources.length} verified standard reference textbooks, lecture kits &amp; lab packs
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Library Catalog (PDF)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Upload New Resource
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Digital Assets</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{resources.length} Books</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">Verified Standard Packs</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Approved Status</p>
          <p className="text-2xl font-black text-green-700 mt-0.5">100% Approved</p>
          <p className="text-[10px] text-green-700 font-medium mt-1">Anna University BoS</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Average File Size</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">18.6 MB</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">High-Res Vector PDF</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Curriculum</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">Semesters 3 &amp; 4</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">Undergraduate AI &amp; DS</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search textbook title, author, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Asset Types</option>
            <option value="REFERENCE_BOOK">Reference Textbooks</option>
            <option value="LECTURE_NOTES">Lecture Notes</option>
            <option value="LAB_MANUAL">Lab Manuals</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
            Showing {filteredResources.length} of {resources.length} Assets
          </span>
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredResources.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#1455D9]/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#1455D9] text-white flex items-center justify-center font-black text-sm shadow-md">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-purple-700 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 uppercase">
                      {r.resourceType.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-sm text-[#071A3D] mt-1 line-clamp-2">{r.name}</h3>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800 shrink-0">
                  {r.status}
                </span>
              </div>

              {r.description && <p className="text-xs text-gray-500 line-clamp-2">{r.description}</p>}

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-sans">File Name:</span>
                  <span className="text-[#071A3D] font-bold truncate max-w-[200px]">{r.fileName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-sans">File Size:</span>
                  <span className="text-[#1455D9] font-bold">{(r.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-sans">Verified By:</span>
                  <span className="text-gray-700 font-sans">{r.uploadedByName || 'Department Faculty'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleDownloadFile(r)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedResource(r)
                    setIsViewModalOpen(true)
                  }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: UPLOAD RESOURCE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Upload Digital Study Resource</h3>
                <p className="text-xs text-gray-500">Department Digital Library</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Resource / Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence: A Modern Approach (Stuart Russell)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Resource Type</label>
                  <select
                    value={formData.resourceType}
                    onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="REFERENCE_BOOK">Reference Textbook</option>
                    <option value="LECTURE_NOTES">Lecture Notes</option>
                    <option value="LAB_MANUAL">Lab Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Description &amp; Topics Covered</label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis of topics covered in this textbook..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Approve &amp; Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
