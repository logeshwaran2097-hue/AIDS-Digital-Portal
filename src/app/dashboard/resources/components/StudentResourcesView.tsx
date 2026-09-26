'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/portal/states'
import { formatDate, formatFileSize } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Sparkles,
  User,
  GraduationCap,
  ExternalLink,
  Layers,
  FileCheck,
  FolderDown,
  Zap,
  Eye,
  X,
  CheckCircle2,
  ShieldCheck,
  FileBadge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  generateAndDownloadPDF,
  downloadWithDeptHeader,
  generateCoverPageDataUri,
} from '@/lib/pdfGenerator'
import { StudyNavigationHeader } from '@/components/study/StudyNavigationHeader'
import {
  getFastDocumentUrl,
  prefetchDocumentUrls,
  instantDirectDownload,
} from '@/lib/fastDocumentFetcher'

interface ResourceItem {
  id: string
  name: string
  description: string | null
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  subjectId: string | null
  subject?: { name: string; code: string } | null
  uploadedByName: string | null
  resourceType: string
  semester: number | null
  academicYear: string | null
  createdAt: Date
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  REFERENCE_BOOK: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  HANDBOOK: { bg: 'bg-blue-50', text: 'text-[#1455D9]', border: 'border-blue-200' },
  PLACEMENT_GUIDE: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200' },
  NOTES: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
}

export function StudentResourcesView({ resources }: { resources: ResourceItem[] }) {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [previewItem, setPreviewItem] = useState<{ item: ResourceItem; url: string } | null>(null)
  const [previewMode, setPreviewMode] = useState<'doc' | 'cover'>('doc')

  // Background prefetch document URLs so downloads are instantaneous
  useEffect(() => {
    if (resources && resources.length > 0) {
      prefetchDocumentUrls(resources.map((r) => r.id))
    }
  }, [resources])

  const types = useMemo(() => {
    const set = new Set(resources.map((r) => r.resourceType))
    return ['ALL', ...Array.from(set)]
  }, [resources])

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesType = selectedType === 'ALL' || r.resourceType === selectedType
      const matchesSearch =
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(query.toLowerCase())) ||
        (r.uploadedByName && r.uploadedByName.toLowerCase().includes(query.toLowerCase())) ||
        r.fileName.toLowerCase().includes(query.toLowerCase())

      return matchesType && matchesSearch
    })
  }, [resources, selectedType, query])

  const groupedResources = useMemo(() => {
    const groups: Record<string, ResourceItem[]> = {}
    filtered.forEach((item) => {
      const subjectName = item.subject?.name ? `${item.subject.code} - ${item.subject.name}` : 'General Resources'
      if (!groups[subjectName]) groups[subjectName] = []
      groups[subjectName].push(item)
    })
    return groups
  }, [filtered])

  // Download with official VSB institutional letterhead cover prepended
  const handleDownloadWithHeader = async (item: ResourceItem) => {
    setDownloadingId(item.id)
    toast.loading('Compiling with official V.S.B. letterhead...', { id: 'hdr_dl' })
    try {
      let finalFileUrl = item.fileUrl
      if (!finalFileUrl) {
        finalFileUrl = (await getFastDocumentUrl(item.id)) || ''
      }

      if (finalFileUrl && (finalFileUrl.startsWith('/uploads/') || finalFileUrl.startsWith('data:') || finalFileUrl.startsWith('http') || finalFileUrl.startsWith('blob:'))) {
        await downloadWithDeptHeader({
          fileUrl: finalFileUrl,
          fileName: item.fileName,
          title: item.name,
          resourceType: item.resourceType,
          uploadedByName: item.uploadedByName || 'Department Faculty',
          semester: item.semester,
          subjectCode: item.subject?.code,
          subjectName: item.subject?.name,
          academicYear: item.academicYear,
          description: item.description || undefined,
        })
        toast.success(`Downloaded ${item.fileName} with official header`, { id: 'hdr_dl' })
        return
      }

      // Fallback PDF generation
      generateAndDownloadPDF({
        title: item.name,
        subtitle: `V.S.B. Engineering College · Department of AI & DS · ${item.resourceType.replace(/_/g, ' ')}`,
        subjectCode: item.subject?.code || 'AI&DS',
        author: item.uploadedByName || 'V.S.B. Department Faculty',
        category: item.resourceType.replace(/_/g, ' '),
        content: `OFFICIAL STUDY RESOURCE OVERVIEW & CURRICULAR MAPPING\n\nInstitution: V.S.B. Engineering College (Autonomous)\nDepartment: Artificial Intelligence & Data Science\nCourse: ${item.subject ? `${item.subject.code} - ${item.subject.name}` : item.name}\nRegulation: Autonomous R-2021\nSemester: ${item.semester || 'All Semesters'}\nResource Type: ${item.resourceType.replace(/_/g, ' ')}\nAuthorized Faculty: ${item.uploadedByName || 'Department Faculty'}\n\nABSTRACT & SYLLABUS HIGHLIGHTS:\n${item.description || 'Comprehensive curriculum study material and reference textbook guide.'}\n\nINCLUSIONS:\n• Unitwise analytical derivations and solved university past question reviews\n• Algorithm benchmarks, pseudo-codes, and data science model architectures\n• Autonomous continuous assessment and semester end examination guidelines`,
        fileName: item.fileName.replace(/\.pdf$/i, ''),
      })
      toast.success(`Generated official PDF with header: ${item.fileName}`, { id: 'hdr_dl' })
    } catch (err) {
      console.error('Download with header error:', err)
      toast.error('Failed to attach header, downloading direct file...', { id: 'hdr_dl' })
      instantDirectDownload(item.fileUrl, item.fileName)
    } finally {
      setDownloadingId(null)
    }
  }

  // Fast document downloading with instant streaming (Original raw file)
  const handleFastDownload = async (item: ResourceItem) => {
    setDownloadingId(item.id)
    try {
      let finalFileUrl = item.fileUrl

      if (!finalFileUrl) {
        finalFileUrl = (await getFastDocumentUrl(item.id)) || ''
      }

      if (finalFileUrl && (finalFileUrl.startsWith('/uploads/') || finalFileUrl.startsWith('data:') || finalFileUrl.startsWith('http') || finalFileUrl.startsWith('blob:'))) {
        instantDirectDownload(finalFileUrl, item.fileName)
        toast.success(`Fast download started: ${item.fileName}`)
        return
      }

      // Instant fallback PDF generation
      generateAndDownloadPDF({
        title: item.name,
        subtitle: `Department Digital Library · ${item.resourceType.replace(/_/g, ' ')}`,
        author: item.uploadedByName || 'V.S.B. Department Faculty',
        category: item.resourceType.replace(/_/g, ' '),
        content: `RESOURCE OVERVIEW & METADATA\n\nTitle: ${item.name}\nResource Type: ${item.resourceType.replace(/_/g, ' ')}\nAuthor / Uploader: ${item.uploadedByName || 'Department Faculty'}\nRegulation: Autonomous R-2021\nDepartment: Artificial Intelligence & Data Science\n\nABSTRACT & HIGHLIGHTS:\n${item.description || 'Comprehensive curriculum study material and reference textbook guide.'}\n\nCURRICULUM INCLUSIONS:\n• Full thematic unit breakdowns and mathematical formulations\n• Solved analytical derivations and university past question reviews\n• Python, C++, and SQL code implementations with benchmark cases\n• Reference problem sets and placement practice questions`,
        fileName: item.fileName.replace(/\.pdf$/i, ''),
      })
      toast.success(`Generated official PDF: ${item.fileName}`)
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download document.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Fast preview modal opener
  const handleQuickPreview = async (item: ResourceItem) => {
    setDownloadingId(item.id)
    setPreviewMode('doc')
    try {
      let url = item.fileUrl || (await getFastDocumentUrl(item.id))
      if (url) {
        setPreviewItem({ item, url })
      } else {
        handleFastDownload(item)
      }
    } catch {
      handleFastDownload(item)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Universal Institutional Study Navigation Header */}
      <StudyNavigationHeader
        title="Study Resources &amp; Digital Textbooks"
        subtitle="Standard reference textbooks, lecture handbooks, cheatsheets &amp; placement interview guides."
        badgeText="Digital Library &amp; Document Vault"
        stats={[
          { label: 'Total E-Books', value: `${resources.length} Volumes` },
          { label: 'Download Speed', value: 'High Speed CDN' },
        ]}
      />


      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {[
            { l: 'All Materials', v: 'ALL' },
            { l: 'Reference Textbooks', v: 'REFERENCE_BOOK' },
            { l: 'Handbooks', v: 'HANDBOOK' },
            { l: 'Placement Guides', v: 'PLACEMENT_GUIDE' },
          ].map((tab) => (
            <button
              key={tab.v}
              onClick={() => setSelectedType(tab.v)}
              className={cn(
                'px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer',
                selectedType === tab.v
                  ? 'bg-[#003399] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              {tab.l}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search textbook title, author or keywords..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded text-xs focus:ring-1 focus:ring-[#003399] focus:border-[#003399]"
          />
        </div>
      </div>

      {/* Practical Document List (Spec 13) */}
      {filtered.length === 0 ? (
        <EmptyState title="No resources found" description="Try adjusting your search query or category filter." icon="📚" />
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedResources).map(([subjectName, items]) => (
            <div key={subjectName} className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-2xs">
              <div className="px-4 py-2.5 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#003399]" />
                  <h2 className="text-xs sm:text-sm font-bold text-[#1F2937]">{subjectName}</h2>
                </div>
                <span className="text-[11px] text-[#6B7280] font-medium">{items.length} Documents</span>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {items.map((item) => {
                  const sizeMb = (item.fileSize / (1024 * 1024)).toFixed(1)
                  return (
                    <div key={item.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-[#1F2937]">{item.name}</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border border-[#E5E7EB] bg-[#F7F8FA] text-[#003399]">
                            {item.resourceType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                          {sizeMb} MB • PDF • Uploaded by {item.uploadedByName || 'Department Faculty'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickPreview(item)}
                          disabled={downloadingId === item.id}
                          className="px-2.5 py-1 text-xs font-semibold border border-[#E5E7EB] rounded hover:bg-slate-50 text-[#1F2937] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#003399]" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadWithHeader(item)}
                          disabled={downloadingId === item.id}
                          className="px-3 py-1 text-xs font-semibold bg-[#003399] hover:bg-[#002266] text-white rounded flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingId === item.id ? 'Attaching...' : 'DOWNLOAD'}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Institutional Preview Modal with V.S.B. Academic Header */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
            {/* ── Official Institutional Letterhead Header ────────────────────── */}
            <div className="bg-gradient-to-r from-[#071A3D] via-[#0D2860] to-[#1455D9] text-white p-4 sm:p-5 border-b border-[#F4C430]/30 shadow-lg shrink-0">
              {/* Row 1: College Emblem + College Name + Autonomous Badge + Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 shadow-md border-2 border-[#F4C430] shrink-0 flex items-center justify-center">
                    <Image
                      src="/app-logo.png"
                      alt="V.S.B. Crest"
                      width={44}
                      height={44}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-xs">
                        V.S.B. ENGINEERING COLLEGE
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#F4C430] text-[#071A3D] tracking-wider uppercase shadow-xs">
                        Autonomous
                      </span>
                    </div>
                    <p className="text-xs font-bold text-cyan-200 tracking-wide uppercase">
                      Department of Artificial Intelligence &amp; Data Science
                    </p>
                    <p className="text-[10px] text-blue-200/80 hidden sm:block">
                      Approved by AICTE · Affiliated to Anna University, Chennai · NAAC &apos;A&apos; Grade &amp; NBA Accredited
                    </p>
                  </div>
                </div>

                {/* Controls: Dual Downloads + External Link + Close */}
                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                  <button
                    onClick={() => handleDownloadWithHeader(previewItem.item)}
                    disabled={downloadingId === previewItem.item.id}
                    className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#F4C430] to-[#E0B028] hover:from-[#e0b028] hover:to-[#cca022] text-[#071A3D] text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-102"
                    title="Download official PDF with V.S.B. Department Letterhead cover"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#071A3D]" />
                    <span>{downloadingId === previewItem.item.id ? 'Attaching...' : 'Official PDF (With Header)'}</span>
                  </button>

                  <button
                    onClick={() => handleFastDownload(previewItem.item)}
                    disabled={downloadingId === previewItem.item.id}
                    className="px-3 py-1.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
                    title="Download original uploaded file directly"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Direct File</span>
                  </button>

                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setPreviewItem(null)}
                    className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close preview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Row 2: Document Metadata Ribbon (Subject, Code, Resource Type, Verification & View Mode) */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-cyan-200 font-bold border border-white/15 text-[11px] flex items-center gap-1.5 truncate max-w-[260px] sm:max-w-none">
                    <BookOpen className="w-3.5 h-3.5 text-[#F4C430] shrink-0" />
                    <span className="truncate">
                      {previewItem.item.subject ? `${previewItem.item.subject.code} · ${previewItem.item.subject.name}` : previewItem.item.name}
                    </span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/25 text-blue-200 border border-blue-400/25 text-[10px] font-bold uppercase">
                    {previewItem.item.resourceType.replace(/_/g, ' ')}
                  </span>
                  {previewItem.item.semester && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-400/20 text-[10px] font-semibold">
                      Sem {previewItem.item.semester}
                    </span>
                  )}
                  <span className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-300 font-medium bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Department Resource
                  </span>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-black/25 p-0.5 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('doc')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                      previewMode === 'doc'
                        ? 'bg-white text-[#071A3D] shadow-xs'
                        : 'text-white/70 hover:text-white'
                    )}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Document View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('cover')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                      previewMode === 'cover'
                        ? 'bg-[#F4C430] text-[#071A3D] shadow-xs'
                        : 'text-white/70 hover:text-white'
                    )}
                  >
                    <FileBadge className="w-3 h-3" />
                    <span>Cover Letterhead</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Document Frame / Cover Sheet Frame */}
            <div className="flex-1 bg-slate-100 p-2 overflow-hidden flex items-center justify-center">
              {previewMode === 'doc' ? (
                previewItem.url ? (
                  <iframe
                    src={previewItem.url}
                    className="w-full h-full rounded-2xl border border-gray-200 bg-white"
                    title={previewItem.item.name}
                  />
                ) : (
                  <div className="text-center p-8">
                    <p className="text-xs text-gray-500 mb-3">Preview loading...</p>
                    <button
                      onClick={() => handleFastDownload(previewItem.item)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs"
                    >
                      Open Document Directly
                    </button>
                  </div>
                )
              ) : (
                /* Cover Page High-Definition Letterhead View */
                <iframe
                  src={generateCoverPageDataUri({
                    fileUrl: previewItem.url,
                    fileName: previewItem.item.fileName,
                    title: previewItem.item.name,
                    resourceType: previewItem.item.resourceType,
                    uploadedByName: previewItem.item.uploadedByName || 'Department Faculty',
                    semester: previewItem.item.semester,
                    subjectCode: previewItem.item.subject?.code,
                    subjectName: previewItem.item.subject?.name,
                    academicYear: previewItem.item.academicYear,
                    description: previewItem.item.description || undefined,
                  })}
                  className="w-full h-full rounded-2xl border border-gray-200 bg-white"
                  title="Official Letterhead Cover"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


