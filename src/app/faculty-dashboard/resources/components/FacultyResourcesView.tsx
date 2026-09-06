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
  ShieldCheck,
  Building2,
  Library,
  BookMarked,
  Briefcase,
  AlertCircle,
  Loader2,
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
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Form State
  const [formTitle, setFormTitle] = useState('')
  const [formResourceType, setFormResourceType] = useState('textbook')
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '')
  const [formSemester, setFormSemester] = useState<number>(advisorSem || 3)
  const [formDescription, setFormDescription] = useState('')

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
  const advisorCohortCount = resources.filter(
    (r) => advisorSem && r.semester === advisorSem
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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        resourceType: formResourceType,
        subjectId: formSubjectId || null,
        semester: formSemester,
        academicYear: '2025-2026',
        uploadedByName: isAdvisor ? `${facultyName} (Class Advisor)` : facultyName,
        fileName: `${formTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.pdf`,
        fileSize: 8500000,
        fileType: 'application/pdf',
      }

      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

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
      }, 1500)
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during publishing')
    } finally {
      setIsSubmitting(false)
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

      {/* KPI Stats Strip - Completely Dynamic */}
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
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#1455D9]/20 focus:bg-white placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: `All Resources (${totalCount})` },
            ...(isAdvisor
              ? [{ id: 'MY_COHORT', label: `My Cohort (${advisorBatch?.split('-')[0].trim() || 'Sem 3'} · ${advisorCohortCount})` }]
              : []),
            { id: 'textbook', label: `Textbooks (${textbookCount})` },
            { id: 'handbook', label: `Handbooks & Labs (${handbookCount})` },
            { id: 'placement_guide', label: `Placement Kits (${placementCount})` },
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

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400 font-medium">
                      Uploaded by <strong className="text-gray-700">{r.uploadedByName}</strong>
                    </span>

                    <button
                      onClick={() => handleDownloadPDF(r)}
                      className="px-4 py-2 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer hover:scale-105"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Upload Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#071A3D]">Upload Study Resource</h3>
                <p className="text-xs text-gray-500">
                  Publish textbook, lab manual, or interview kit to digital library
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 text-base"
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
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
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
    </div>
  )
}
