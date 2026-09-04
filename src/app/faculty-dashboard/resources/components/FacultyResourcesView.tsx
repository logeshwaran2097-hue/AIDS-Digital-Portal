'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Database,
  Search,
  Download,
  Upload,
  Plus,
  BookOpen,
  FileText,
  CheckCircle2,
  Filter,
  Sparkles,
  Layers,
  Code2,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface ResourceItem {
  id: string
  name: string
  description?: string | null
  fileName: string
  fileSize: number
  resourceType?: string | null
  uploadedByName?: string | null
  createdAt: Date
}

export function FacultyResourcesView({
  initialResources = [],
  facultyName = 'Faculty Member',
}: {
  initialResources?: ResourceItem[]
  facultyName?: string
}) {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.uploadedByName && r.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesType =
        selectedType === 'ALL' ||
        (r.resourceType && r.resourceType.toLowerCase().includes(selectedType.toLowerCase()))

      return matchesSearch && matchesType
    })
  }, [resources, searchQuery, selectedType])

  const handleDownloadPDF = (r: ResourceItem) => {
    generateAndDownloadPDF({
      title: r.name.toUpperCase(),
      subtitle: `${r.description || 'Department of AI & DS Study Resource'} · Approved Reference Material`,
      author: r.uploadedByName || facultyName,
      category: r.resourceType?.replace(/_/g, ' ').toUpperCase() || 'DIGITAL RESOURCE',
      sections: [
        {
          heading: '1. EXECUTIVE RESOURCE OVERVIEW & ABSTRACT',
          body: [
            `Document Title: ${r.name}`,
            `Uploaded By: ${r.uploadedByName || facultyName}`,
            `Academic Regulation: Anna University & Autonomous R-2021`,
            `Intended Audience: B.Tech Artificial Intelligence & Data Science Students`,
          ],
        },
        {
          heading: '2. SYLLABUS & CURRICULAR MAPPING',
          body: [
            `Primary Subject Category: ${r.resourceType?.toUpperCase() || 'GENERAL AI/DS'}`,
            `Intended Course Units: Units I through V applicable`,
            `Repository Index File: ${r.fileName}`,
            `Standard Format: Electronic Document PDF (${(r.fileSize / 1024).toFixed(1)} KB)`,
          ],
        },
        {
          heading: '3. ACADEMIC ADVISORY & REVISION POLICY',
          body: [
            'All study materials are strictly for internal academic usage at V.S.B. Engineering College.',
            'Students are encouraged to consult primary prescribed Anna University textbooks alongside these lecture notes.',
            'Any revision or updated syllabus references are subject to department curriculum committee reviews.',
          ],
        },
      ],
    })
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUploadSuccess(true)
    setTimeout(() => {
      setUploadSuccess(false)
      setShowUploadModal(false)
    }, 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Digital Library Repository
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Study Resources &amp; E-Books Library</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {facultyName} · Publish and manage standard textbooks, lecture materials, and interview guides
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Upload New Resource (PDF)
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Resources</p>
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">{resources.length} Files</p>
            <p className="text-[10px] text-gray-400">Available to Students</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs bg-purple-50/20">
          <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Standard Textbooks</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">5 Textbooks</p>
          <p className="text-[10px] text-purple-600 font-semibold">Weiss, Korth, Bishop</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20">
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Placement Guides</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">2 Handbooks</p>
          <p className="text-[10px] text-green-700 font-semibold">2026 Tech Interview Kit</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Verified Downloads</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">100% PDF Ready</p>
          <p className="text-[10px] text-amber-700 font-semibold">Client-Side Generator</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by title, author or subject keywords..."
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Resources' },
            { id: 'textbook', label: 'Standard Textbooks' },
            { id: 'handbook', label: 'Handbooks' },
            { id: 'placement_guide', label: 'Placement Kits' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0',
                selectedType === t.id
                  ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-3xl border-gray-200 bg-white">
          <CardContent className="p-12 text-center space-y-3">
            <Database className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-sm text-[#071A3D]">No Learning Resources Available</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchQuery || selectedType !== 'ALL'
                ? 'No resources matching your search filter.'
                : 'Upload textbooks, lecture notes, lab manuals or interview materials using the button above.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((r) => (
          <Card
            key={r.id}
            className="rounded-3xl border-gray-200 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-black uppercase tracking-wider border border-blue-200/60">
                  {r.resourceType?.replace(/_/g, ' ') || 'Textbook'}
                </span>
                <span className="text-[11px] text-gray-400 font-semibold">
                  {(r.fileSize / (1024 * 1024)).toFixed(1)} MB · PDF
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug line-clamp-1">
                  {r.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400 font-medium">
                  Uploaded by <strong className="text-gray-700">{r.uploadedByName}</strong>
                </span>

                <button
                  onClick={() => handleDownloadPDF(r)}
                  className="px-4 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Upload Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Upload Study Resource</h3>
                <p className="text-xs text-gray-500">Publish textbook or handbook to student digital library</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {uploadSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#071A3D]">Resource Published!</h4>
                <p className="text-xs text-gray-500">The PDF has been added to the student digital library.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Resource Title &amp; Author</label>
                  <input type="text" placeholder="e.g. Deep Learning with PyTorch (Ian Goodfellow)" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" required />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Resource Type</label>
                  <select className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold">
                    <option>Standard Textbook</option>
                    <option>Lecture Handout</option>
                    <option>Placement Interview Kit</option>
                    <option>Laboratory Guide</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Description &amp; Topics</label>
                  <textarea rows={3} placeholder="Brief summary of syllabus units covered..." className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" required />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">PDF File</label>
                  <input type="file" accept=".pdf" className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs" />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#1455D9] text-white rounded-xl text-xs font-bold hover:bg-[#0e44b5]">Upload &amp; Publish</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
