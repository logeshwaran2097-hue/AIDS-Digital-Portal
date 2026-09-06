'use client'

import React, { useState, useMemo, useRef } from 'react'
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
  ShieldCheck,
  Building2,
  Library,
  BookMarked,
  Briefcase,
  AlertCircle,
  Loader2,
  Pencil,
  Trash2,
  X,
  UploadCloud,
  FileCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface ResourceItem {
  id: string
  name: string
  description?: string | null
  fileName: string
  fileSize: number
  fileUrl?: string | null
  resourceType?: string | null
  subjectId?: string | null
  semester?: number | null
  academicYear?: string | null
  uploadedByName?: string | null
  createdAt: Date
}

export interface SubjectOption {
  id: string
  code: string
  name: string
  semester: number
}

export function FacultyResourcesView({
  initialResources = [],
  facultyName = 'Faculty Member',
  isAdvisor = false,
  advisorBatch = 'Year II - Sem 3 - Sec A',
  advisorSem = 3,
  subjects = [],
}: {
  initialResources?: ResourceItem[]
  facultyName?: string
  isAdvisor?: boolean
  advisorBatch?: string | null
  advisorSem?: number | null
  subjects?: SubjectOption[]
}) {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload Form State
  const [formTitle, setFormTitle] = useState('')
  const [formResourceType, setFormResourceType] = useState('textbook')
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '')
  const [formSemester, setFormSemester] = useState<number>(advisorSem || 3)
  const [formDescription, setFormDescription] = useState('')

  // Edit Modal State
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [editError, setEditError] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editResourceType, setEditResourceType] = useState('textbook')
  const [editSubjectId, setEditSubjectId] = useState('')
  const [editSemester, setEditSemester] = useState<number>(3)
  const [editDescription, setEditDescription] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [isEditDragging, setIsEditDragging] = useState(false)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Subject code lookup
  const subjectMap = useMemo(() => {
    const map: Record<string, SubjectOption> = {}
    subjects.forEach((s) => {
      map[s.id] = s
    })
    return map
  }, [subjects])

  // Dynamic KPI counts
  const totalCount = resources.length
  const textbookCount = resources.filter(
    (r) => r.resourceType?.toLowerCase() === 'textbook' || r.resourceType?.toLowerCase() === 'reference_book'
  ).length
  const handbookCount = resources.filter(
    (r) => r.resourceType?.toLowerCase() === 'handbook' || r.resourceType?.toLowerCase() === 'lab_manual'
  ).length
  const placementCount = resources.filter(
    (r) => r.resourceType?.toLowerCase() === 'placement_guide'
  ).length

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.uploadedByName && r.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.subjectId && subjectMap[r.subjectId]?.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.subjectId && subjectMap[r.subjectId]?.name.toLowerCase().includes(searchQuery.toLowerCase()))

      let matchesType = true
      if (selectedType === 'MY_COHORT') {
        matchesType = Boolean(advisorSem && r.semester === advisorSem)
      } else if (selectedType === 'textbook') {
        matchesType = r.resourceType?.toLowerCase() === 'textbook' || r.resourceType?.toLowerCase() === 'reference_book'
      } else if (selectedType === 'handbook') {
        matchesType = r.resourceType?.toLowerCase() === 'handbook' || r.resourceType?.toLowerCase() === 'lab_manual'
      } else if (selectedType === 'placement_guide') {
        matchesType = r.resourceType?.toLowerCase() === 'placement_guide'
      }

      return matchesSearch && matchesType
    })
  }, [resources, searchQuery, selectedType, advisorSem, subjectMap])

  const handleDownloadPDF = (r: ResourceItem) => {
    const subj = r.subjectId ? subjectMap[r.subjectId] : null
    generateAndDownloadPDF({
      title: r.name.toUpperCase(),
      subtitle: `${subj ? `${subj.code} · ${subj.name} · ` : ''}Approved Academic Resource Material`,
      subjectCode: subj ? subj.code : 'AI&DS-DEP',
      author: r.uploadedByName || facultyName,
      category: r.resourceType?.replace(/_/g, ' ').toUpperCase() || 'DIGITAL E-BOOK',
      sections: [
        {
          heading: '1. EXECUTIVE RESOURCE OVERVIEW & ABSTRACT',
          body: [
            `Document Title: ${r.name}`,
            `Department: Artificial Intelligence & Data Science`,
            `Institution: V.S.B. Engineering College, Karur (Autonomous)`,
            `Curriculum Regulation: Anna University & Autonomous R-2021`,
            `Intended Cohort: ${r.semester ? `Semester ${r.semester}` : 'All Semesters'} B.Tech AI & DS`,
            `Repository Index File: ${r.fileName}`,
            `Authorized Publisher: ${r.uploadedByName || facultyName}`,
          ],
        },
        {
          heading: '2. SYLLABUS & CURRICULAR MAPPING',
          body: [
            `Course Mapping: ${subj ? `${subj.code} - ${subj.name}` : 'Interdisciplinary / Placement Technical Skillset'}`,
            `Resource Classification: ${r.resourceType ? r.resourceType.replace(/_/g, ' ').toUpperCase() : 'STANDARD TEXTBOOK'}`,
            `Curricular Units Covered: Units I through V (Comprehensive Coverage)`,
            `Key Syllabus Topics: ${r.description || 'Core theoretical concepts, mathematical formulations, algorithmic implementations, and university examination review problems.'}`,
          ],
        },
        {
          heading: '3. ACADEMIC ADVISORY & REVISION POLICY',
          body: [
            'All study materials and reference manuals are strictly for internal academic usage at V.S.B. Engineering College.',
            'Students are strongly advised to consult the prescribed Anna University syllabus and standard textbook editions alongside these notes.',
            'Continuous Assessment Test (CAT) and Semester End Examination (SEE) questions are aligned with Bloom\'s Taxonomy levels mapped in this material.',
            'Any updates, errata, or supplementary laboratory sheets will be published via the AI&DS Digital Academic Portal.',
          ],
        },
      ],
    })
  }

  const handleFilePicked = (file: File) => {
    setSelectedFile(file)
    if (!formTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
      setFormTitle(cleanName)
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      let res: Response
      if (selectedFile) {
        const formData = new FormData()
        formData.append('title', formTitle.trim())
        formData.append('description', formDescription.trim())
        formData.append('resourceType', formResourceType)
        if (formSubjectId) formData.append('subjectId', formSubjectId)
        formData.append('semester', String(formSemester))
        formData.append('academicYear', '2025-2026')
        formData.append('uploadedByName', isAdvisor ? `${facultyName} (Class Advisor)` : facultyName)
        formData.append('file', selectedFile)

        res = await fetch('/api/resources', {
          method: 'POST',
          body: formData,
        })
      } else {
        const payload = {
          title: formTitle.trim(),
          description: formDescription.trim(),
          resourceType: formResourceType,
          subjectId: formSubjectId || null,
          semester: formSemester,
          academicYear: '2025-2026',
          uploadedByName: isAdvisor ? `${facultyName} (Class Advisor)` : facultyName,
          fileName: `${formTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.pdf`,
          fileSize: 8500000,
          fileType: 'application/pdf',
        }

        res = await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload resource')
      }

      const newResource: ResourceItem = {
        id: data.resource.id,
        name: data.resource.name,
        description: data.resource.description,
        fileName: data.resource.fileName,
        fileSize: data.resource.fileSize,
        fileUrl: data.resource.fileUrl,
        resourceType: data.resource.resourceType,
        subjectId: data.resource.subjectId,
        semester: data.resource.semester,
        academicYear: data.resource.academicYear,
        uploadedByName: data.resource.uploadedByName,
        createdAt: new Date(data.resource.createdAt),
      }

      setResources((prev) => [newResource, ...prev])
      setUploadSuccess(true)
      setTimeout(() => {
        setUploadSuccess(false)
        setShowUploadModal(false)
        setFormTitle('')
        setFormDescription('')
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }, 1200)
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during publishing')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Edit Modal
  const handleOpenEditModal = (r: ResourceItem) => {
    setEditingResource(r)
    setEditTitle(r.name)
    setEditDescription(r.description || '')
    setEditResourceType(r.resourceType || 'textbook')
    setEditSubjectId(r.subjectId || '')
    setEditSemester(r.semester || 3)
    setEditFile(null)
    setEditError('')
    setEditSuccess(false)
    setShowEditModal(true)
  }

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingResource) return
    setIsSavingEdit(true)
    setEditError('')

    try {
      let res: Response
      if (editFile) {
        const formData = new FormData()
        formData.append('id', editingResource.id)
        formData.append('title', editTitle.trim())
        formData.append('description', editDescription.trim())
        formData.append('resourceType', editResourceType)
        if (editSubjectId) formData.append('subjectId', editSubjectId)
        formData.append('semester', String(editSemester))
        formData.append('file', editFile)

        res = await fetch('/api/resources', {
          method: 'PUT',
          body: formData,
        })
      } else {
        const payload = {
          id: editingResource.id,
          title: editTitle.trim(),
          description: editDescription.trim(),
          resourceType: editResourceType,
          subjectId: editSubjectId || null,
          semester: editSemester,
        }

        res = await fetch('/api/resources', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update resource')
      }

      setResources((prev) =>
        prev.map((item) =>
          item.id === editingResource.id
            ? {
                ...item,
                name: data.resource.name,
                description: data.resource.description,
                resourceType: data.resource.resourceType,
                subjectId: data.resource.subjectId,
                semester: data.resource.semester,
                fileName: data.resource.fileName || item.fileName,
                fileSize: data.resource.fileSize || item.fileSize,
                fileUrl: data.resource.fileUrl || item.fileUrl,
              }
            : item
        )
      )

      setEditSuccess(true)
      setTimeout(() => {
        setEditSuccess(false)
        setShowEditModal(false)
        setEditingResource(null)
      }, 1200)
    } catch (err: any) {
      setEditError(err.message || 'Failed to update resource')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Delete Resource
  const handleDeleteResource = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the study library?`)) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/resources?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete resource')
      }

      setResources((prev) => prev.filter((r) => r.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete resource')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Digital Library Repository
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
            {isAdvisor && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Class Advisor: {advisorBatch}
              </span>
            )}
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
            <p className="text-2xl font-black text-[#1455D9] mt-0.5">{totalCount} Files</p>
            <p className="text-[10px] text-gray-400">Available to Students</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1455D9] text-white flex items-center justify-center font-black">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs bg-purple-50/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Standard Textbooks</p>
            <p className="text-2xl font-black text-purple-700 mt-0.5">{textbookCount} Textbooks</p>
            <p className="text-[10px] text-purple-600 font-semibold">Weiss, Korth, Bishop, Rosen</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black">
            <BookMarked className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-green-200/80 shadow-xs bg-green-50/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Placement &amp; Guides</p>
            <p className="text-2xl font-black text-green-600 mt-0.5">{placementCount + handbookCount} Handbooks</p>
            <p className="text-[10px] text-green-700 font-semibold">2026 Tech Interview Kits</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-green-600 text-white flex items-center justify-center font-black">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs bg-amber-50/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Verified Downloads</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">100% PDF Ready</p>
            <p className="text-[10px] text-amber-700 font-semibold">Client-Side Generator</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black">
            <Download className="w-5 h-5" />
          </div>
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
            placeholder="Search resources by title, subject code, author or syllabus topics..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedType('ALL')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              selectedType === 'ALL'
                ? 'bg-[#1455D9] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All Resources ({totalCount})
          </button>
          <button
            onClick={() => setSelectedType('textbook')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              selectedType === 'textbook'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Textbooks ({textbookCount})
          </button>
          <button
            onClick={() => setSelectedType('handbook')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              selectedType === 'handbook'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Handbooks &amp; Labs ({handbookCount})
          </button>
          <button
            onClick={() => setSelectedType('placement_guide')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              selectedType === 'placement_guide'
                ? 'bg-green-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Placement Kits ({placementCount})
          </button>
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
          {filtered.map((r) => {
            const subj = r.subjectId ? subjectMap[r.subjectId] : null
            const isCohort = advisorSem && r.semester === advisorSem

            return (
              <Card
                key={r.id}
                className="rounded-3xl border-gray-200 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border',
                          r.resourceType === 'textbook'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : r.resourceType === 'placement_guide'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-blue-50 text-[#1455D9] border-blue-200'
                        )}
                      >
                        {r.resourceType?.replace(/_/g, ' ') || 'Textbook'}
                      </span>

                      {subj && (
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold">
                          {subj.code}
                        </span>
                      )}

                      {isCohort && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          Sem {r.semester} Cohort
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-gray-400 font-semibold">
                      {(r.fileSize / (1024 * 1024)).toFixed(1)} MB · PDF
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug line-clamp-1">
                      {r.name}
                    </h3>
                    {subj && (
                      <p className="text-[11px] font-medium text-[#1455D9] mt-0.5">
                        {subj.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400 font-medium">
                      Uploaded by <strong className="text-gray-700">{r.uploadedByName}</strong>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(r)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer hover:scale-102"
                        title="Edit Resource Details & File"
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-700" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(r.id, r.name)}
                        disabled={deletingId === r.id}
                        className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer hover:scale-102 disabled:opacity-50"
                        title="Delete Resource"
                      >
                        {deletingId === r.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span className="hidden sm:inline">Delete</span>
                      </button>

                      {/* Download Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(r)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-102"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Upload Resource Modal ─────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Upload Study Resource</h3>
                <p className="text-xs text-gray-500">
                  Publish textbook, lab manual, or interview kit to digital library
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#071A3D]">Resource Published!</h4>
                <p className="text-xs text-gray-500">The resource has been added to the student digital library.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ── Document Upload Box ──────────────────────────────── */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Upload PDF / Document File <span className="text-rose-500">*</span>
                  </label>
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) handleFilePicked(file)
                    }}
                    className={cn(
                      'border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200',
                      isDragging
                        ? 'border-[#1455D9] bg-blue-50/60 ring-2 ring-[#1455D9]/20'
                        : selectedFile
                        ? 'border-emerald-400 bg-emerald-50/30'
                        : 'border-gray-300 hover:border-[#1455D9] hover:bg-blue-50/20 bg-gray-50/50'
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFilePicked(file)
                      }}
                    />

                    {selectedFile ? (
                      <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-[#071A3D] truncate">{selectedFile.name}</p>
                            <p className="text-[10px] text-emerald-700 font-semibold">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to publish
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-2">
                        <div className="w-11 h-11 rounded-2xl bg-blue-100/70 text-[#1455D9] flex items-center justify-center mx-auto shadow-2xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#071A3D]">
                            Click to browse or drag &amp; drop PDF document
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Standard PDF, Textbook, Lecture Notes, or E-Book (up to 50 MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Resource Title &amp; Author</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Deep Learning with PyTorch - Ian Goodfellow"
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1455D9]/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Resource Category</label>
                    <select
                      value={formResourceType}
                      onChange={(e) => setFormResourceType(e.target.value)}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold focus:bg-white"
                    >
                      <option value="textbook">Standard Textbook</option>
                      <option value="handbook">Course Handbook / Notes</option>
                      <option value="lab_manual">Laboratory Manual</option>
                      <option value="placement_guide">Placement Interview Kit</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Semester</label>
                    <select
                      value={formSemester}
                      onChange={(e) => setFormSemester(Number(e.target.value))}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold focus:bg-white"
                    >
                      <option value={1}>Semester 1 (Year I)</option>
                      <option value={2}>Semester 2 (Year I)</option>
                      <option value={3}>Semester 3 (Year II)</option>
                      <option value={4}>Semester 4 (Year II)</option>
                      <option value={5}>Semester 5 (Year III)</option>
                      <option value={6}>Semester 6 (Year III)</option>
                      <option value={7}>Semester 7 (Year IV)</option>
                      <option value={8}>Semester 8 (Year IV)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Associated Subject (Curriculum)</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-medium focus:bg-white"
                  >
                    <option value="">General AI &amp; DS (Interdisciplinary)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} (Sem {s.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Description &amp; Syllabus Coverage</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief summary of units, topics covered, reference editions..."
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1455D9]/20"
                    required
                  />
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1455D9] shrink-0" />
                  <span className="text-[11px] text-blue-900 font-medium">
                    Verified Digital PDF generation is automatically enabled for students with Anna University letterhead.
                  </span>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...
                      </>
                    ) : (
                      <>Publish to Library</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Resource Modal ───────────────────────────────────────────── */}
      {showEditModal && editingResource && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Edit Study Resource</h3>
                <p className="text-xs text-gray-500">
                  Update textbook title, syllabus details, or attach a replacement PDF
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#071A3D]">Resource Updated!</h4>
                <p className="text-xs text-gray-500">The study material changes have been saved to the library.</p>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
                {editError && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                {/* Current & Replacement File Box */}
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Attached Document
                  </label>
                  
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsEditDragging(true)
                    }}
                    onDragLeave={() => setIsEditDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsEditDragging(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) setEditFile(file)
                    }}
                    className={cn(
                      'border-2 border-dashed rounded-2xl p-3.5 text-center cursor-pointer transition-all duration-200',
                      isEditDragging
                        ? 'border-[#1455D9] bg-blue-50/60 ring-2 ring-[#1455D9]/20'
                        : editFile
                        ? 'border-emerald-400 bg-emerald-50/30'
                        : 'border-gray-200 hover:border-[#1455D9] bg-gray-50/50'
                    )}
                  >
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setEditFile(file)
                      }}
                    />

                    {editFile ? (
                      <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-[#071A3D] truncate">{editFile.name}</p>
                            <p className="text-[10px] text-emerald-700 font-semibold">
                              New File: {(editFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to save
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditFile(null)
                            if (editFileInputRef.current) editFileInputRef.current.value = ''
                          }}
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove replacement file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 text-left">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#071A3D] truncate">
                              {editingResource.fileName || `${editingResource.name}.pdf`}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {(editingResource.fileSize / (1024 * 1024)).toFixed(1)} MB • Click to upload replacement file
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#1455D9] shrink-0 bg-blue-50 px-2 py-1 rounded-lg">
                          Replace
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Resource Title &amp; Author</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1455D9]/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Resource Category</label>
                    <select
                      value={editResourceType}
                      onChange={(e) => setEditResourceType(e.target.value)}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold focus:bg-white"
                    >
                      <option value="textbook">Standard Textbook</option>
                      <option value="handbook">Course Handbook / Notes</option>
                      <option value="lab_manual">Laboratory Manual</option>
                      <option value="placement_guide">Placement Interview Kit</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Semester</label>
                    <select
                      value={editSemester}
                      onChange={(e) => setEditSemester(Number(e.target.value))}
                      className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-bold focus:bg-white"
                    >
                      <option value={1}>Semester 1 (Year I)</option>
                      <option value={2}>Semester 2 (Year I)</option>
                      <option value={3}>Semester 3 (Year II)</option>
                      <option value={4}>Semester 4 (Year II)</option>
                      <option value={5}>Semester 5 (Year III)</option>
                      <option value={6}>Semester 6 (Year III)</option>
                      <option value={7}>Semester 7 (Year IV)</option>
                      <option value={8}>Semester 8 (Year IV)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Associated Subject (Curriculum)</label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => setEditSubjectId(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-medium focus:bg-white"
                  >
                    <option value="">General AI &amp; DS (Interdisciplinary)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} (Sem {s.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Description &amp; Syllabus Coverage</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1455D9]/20"
                    required
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      <>Save Changes</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
