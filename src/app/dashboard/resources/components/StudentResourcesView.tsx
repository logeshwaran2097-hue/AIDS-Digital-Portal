'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/portal/states'
import { formatDate, formatFileSize } from '@/lib/utils'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

interface ResourceItem {
  id: string
  name: string
  description: string | null
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  subjectId: string | null
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

  const handleDownloadResource = (item: ResourceItem) => {
    generateAndDownloadPDF({
      title: item.name,
      subtitle: `Department Digital Library · ${item.resourceType.replace(/_/g, ' ')}`,
      author: item.uploadedByName || 'V.S.B. Department Faculty',
      category: item.resourceType.replace(/_/g, ' '),
      content: `RESOURCE OVERVIEW & METADATA\n\nTitle: ${item.name}\nResource Type: ${item.resourceType.replace(/_/g, ' ')}\nAuthor / Uploader: ${item.uploadedByName || 'Department Faculty'}\nRegulation: Autonomous R-2021\nDepartment: Artificial Intelligence & Data Science\n\nABSTRACT & HIGHLIGHTS:\n${item.description || 'Comprehensive curriculum study material and reference textbook guide.'}\n\nCURRICULUM INCLUSIONS:\n• Full thematic unit breakdowns and mathematical formulations\n• Solved analytical derivations and university past question reviews\n• Python, C++, and SQL code implementations with benchmark cases\n• Reference problem sets and placement practice questions`,
      fileName: item.fileName.replace(/\.pdf$/i, ''),
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Digital Library
            </span>
            <span className="text-xs text-gray-300">· V.S.B. Engineering College</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Study Resources &amp; Digital Textbooks</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Standard reference textbooks, lecture handbooks, cheatsheets &amp; placement interview guides
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Total E-Books</p>
            <p className="text-base font-black text-[#F4C430]">{resources.length} Volumes</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                'px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer',
                selectedType === tab.v
                  ? 'bg-[#1455D9] text-white shadow-md shadow-[#1455D9]/20 scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#071A3D]'
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
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>
      </div>

      {/* Resources Grid */}
      {filtered.length === 0 ? (
        <EmptyState title="No resources found" description="Try adjusting your search query or category filter." icon="📚" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const style = TYPE_COLORS[item.resourceType] || { bg: 'bg-blue-50', text: 'text-[#1455D9]', border: 'border-blue-200' }
            const isPlacement = item.resourceType === 'PLACEMENT_GUIDE'

            return (
              <Card
                key={item.id}
                className="rounded-3xl border-gray-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group hover:border-[#1455D9]/40 flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border', style.bg, style.text, style.border)}>
                      {item.resourceType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold font-mono">
                      {(item.fileSize / (1024 * 1024)).toFixed(1)} MB · PDF
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs',
                      isPlacement ? 'bg-amber-100 text-amber-800' : 'bg-[#1455D9]/10 text-[#1455D9]'
                    )}>
                      {isPlacement ? <Sparkles className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-black text-base text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium flex items-center gap-1.5 text-gray-700 truncate max-w-[170px]">
                      <User className="w-3.5 h-3.5 text-[#1455D9]" />
                      <span className="truncate">{item.uploadedByName || 'Department Faculty'}</span>
                    </span>

                    <button
                      onClick={() => handleDownloadResource(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
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
    </div>
  )
}
