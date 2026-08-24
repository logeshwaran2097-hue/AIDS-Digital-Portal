'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  FolderArchive,
  FileText,
  Download,
  Plus,
  Trash2,
  Eye,
  X,
  Search,
  HardDrive,
  Sparkles,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface FileItem {
  id: string
  fileName: string
  originalName: string
  fileType: string
  fileSize: number
  fileUrl: string
  module: string
  uploadedByName?: string | null
  createdAt: string
}

export function AdminFilesView({ initialFiles }: { initialFiles: FileItem[] }) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles)
  const [searchQuery, setSearchQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState('ALL')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    originalName: '',
    fileName: '',
    module: 'resources',
    fileType: 'pdf',
    uploadedByName: 'System Administrator',
  })

  const totalBytes = files.reduce((acc, f) => acc + f.fileSize, 0)
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1)

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.module.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesModule = moduleFilter === 'ALL' || f.module.toLowerCase() === moduleFilter.toLowerCase()
    return matchesSearch && matchesModule
  })

  const handleExportInventoryPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — CLOUD FILE STORAGE INVENTORY',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator',
      category: 'Official Cloud Document & Storage Manifest',
      sections: [
        {
          heading: '1. CLOUD REPOSITORY & STORAGE METRICS',
          body: [
            `Total Registered Documents: ${files.length} Digital Assets`,
            `Total Storage Allocation: ${totalMB} MB Storage Footprint`,
            'Storage Backend: High-Performance Distributed Object Storage with Secure HTTPS Endpoints',
            'Modules Covered: Reference Textbooks, Question Papers, Capstone Synopsis, Stamped Circulars',
          ],
        },
        {
          heading: '2. DIGITAL ASSET REPOSITORY MANIFEST',
          body: files.map(
            (f, idx) =>
              `${idx + 1}. [${f.module.toUpperCase()}] ${f.originalName} (${(f.fileSize / (1024 * 1024)).toFixed(2)} MB) — Uploaded by: ${f.uploadedByName || 'Admin'} on ${f.createdAt}`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Cloud_File_Inventory_2026',
    })
  }

  const handleDownloadFile = (f: FileItem) => {
    generateAndDownloadPDF({
      title: f.originalName.toUpperCase(),
      subtitle: `V.S.B. Engineering College · Department of AI & DS · Cloud Document Vault`,
      author: f.uploadedByName || 'Department Digital Archive',
      category: `Document / ${f.module.toUpperCase()}`,
      sections: [
        {
          heading: '1. DOCUMENT METADATA & REPOSITORY RECORD',
          body: [
            `Document Name: ${f.originalName}`,
            `System File Key: ${f.fileName}`,
            `Department Module: ${f.module.toUpperCase()}`,
            `Allocated File Size: ${(f.fileSize / (1024 * 1024)).toFixed(2)} MB`,
            `Registered By: ${f.uploadedByName || 'System Administrator'}`,
            `Registration Date: ${f.createdAt}`,
          ],
        },
        {
          heading: '2. DIGITAL ASSET INTEGRITY STATEMENT',
          body: [
            'This digital asset is cryptographically verified and indexed in the VSB AI & DS Centralized Academic Repository.',
            'Access permissions are governed strictly under Role-Based Access Control (RBAC).',
          ],
        },
      ],
      fileName: f.fileName.replace(/\.[^/.]+$/, ''),
    })
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.originalName) {
      alert('Please enter Document Name')
      return
    }

    const generatedFileName =
      formData.fileName || formData.originalName.replace(/\s+/g, '_') + '.pdf'

    const newF: FileItem = {
      id: 'file_' + Date.now(),
      fileName: generatedFileName,
      originalName: formData.originalName,
      fileType: formData.fileType,
      fileSize: 4500000,
      fileUrl: `/${formData.module}/${generatedFileName}`,
      module: formData.module,
      uploadedByName: formData.uploadedByName,
      createdAt: new Date().toISOString().split('T')[0],
    }

    setFiles([newF, ...files])
    setIsUploadModalOpen(false)
    setFormData({
      originalName: '',
      fileName: '',
      module: 'resources',
      fileType: 'pdf',
      uploadedByName: 'System Administrator',
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document from the vault?')) {
      setFiles(files.filter((f) => f.id !== id))
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Asset Storage &amp; Cloud Vault
            </span>
            <span className="text-xs text-gray-300 font-medium">· Digital Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Central File &amp; Document Vault</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Manage, upload and secure academic textbooks, question papers, capstone proposals &amp; notices
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportInventoryPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Manifest (PDF)
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" /> + Upload Document
          </button>
        </div>
      </div>

      {/* Storage Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Files Indexed</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{files.length} Files</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">Encrypted Storage</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Storage Footprint</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">{totalMB} MB</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Total Allocated</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Study Textbooks</p>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">
            {files.filter((f) => f.module === 'resources').length} Books
          </p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">Standard Editions</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Exam Question Sets</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">
            {files.filter((f) => f.module === 'question-papers').length} QP Sets
          </p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">COE Certified</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search document name, filename, module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
          >
            <option value="ALL">All Modules</option>
            <option value="resources">Study Resources &amp; Books</option>
            <option value="question-papers">Question Papers Bank</option>
            <option value="projects">Capstone Synopsis</option>
            <option value="announcements">Official Circulars</option>
          </select>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
            Showing {filteredFiles.length} Documents
          </span>
        </div>
      </div>

      {/* File Vault Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Document Title</th>
                <th className="px-4 py-3.5">Module</th>
                <th className="px-4 py-3.5">File Size</th>
                <th className="px-4 py-3.5">Uploaded By</th>
                <th className="px-4 py-3.5 text-center">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredFiles.map((f) => (
                <tr key={f.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[#071A3D] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-black shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">{f.originalName}</p>
                      <p className="text-[10px] text-gray-400 font-mono font-normal">{f.fileName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold uppercase text-[10px] border border-purple-200">
                      {f.module}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-gray-500 font-semibold">
                    {(f.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </td>
                  <td className="px-4 py-3.5 text-[#1455D9] font-bold">{f.uploadedByName || 'Admin'}</td>
                  <td className="px-4 py-3.5 text-center font-mono text-gray-400 text-[11px]">
                    {f.createdAt}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleDownloadFile(f)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: UPLOAD FILE */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Upload Digital Asset</h3>
                <p className="text-xs text-gray-500">Secure Document Cloud Vault</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Document Display Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Learning Specialization Lecture Notes (Andrew Ng)"
                  value={formData.originalName}
                  onChange={(e) => setFormData({ ...formData, originalName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Target Module</label>
                  <select
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="resources">Study Resources / Books</option>
                    <option value="question-papers">Question Papers Bank</option>
                    <option value="projects">Capstone Project Synopsis</option>
                    <option value="announcements">Official Circulars</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">File Type</label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="docx">Word Document (.docx)</option>
                    <option value="pptx">PowerPoint (.pptx)</option>
                    <option value="zip">ZIP Archive (.zip)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Uploaded By (Author / Faculty)</label>
                <input
                  type="text"
                  value={formData.uploadedByName}
                  onChange={(e) => setFormData({ ...formData, uploadedByName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  Upload &amp; Index Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
