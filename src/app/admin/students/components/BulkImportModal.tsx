'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react'
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  HelpCircle,
  FileText,
  KeyRound,
  GraduationCap,
  Calendar,
  Layers,
  Home,
  Building2,
  Trash2,
  Sparkles,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from '@/components/ui/Toast'
import { playNotificationChime } from '@/lib/notificationEngine'
import {
  getDefaultBatchForYear,
  YEAR_TO_DEFAULT_BATCH,
  ACADEMIC_COHORTS,
} from '@/lib/academicBatch'

export interface ParsedStudent {
  registerNumber: string
  name: string
  email?: string
  password?: string
  phone?: string
  parentPhone?: string
  dateOfBirth?: string
  year: number
  semester: number
  section: string
  batch?: string
  department?: string
  bloodGroup?: string
  residencyStatus?: string
  cgpa?: string | number
  attendance?: string
  isValid: boolean
  validationError?: string
}

interface RawStudentRow {
  registerNumber: string
  name: string
  password?: string
  email?: string
  phone?: string
  parentPhone?: string
  dateOfBirth?: string
  bloodGroup?: string
  cgpa?: string | number
  attendance?: string
  // Optional row-level overrides if explicit in spreadsheet
  year?: number
  semester?: number
  section?: string
  batch?: string
  residencyStatus?: string
}

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const AVAILABLE_BATCHES = [
  '2026-2030',
  '2025-2029',
  '2024-2028',
  '2023-2027',
  '2022-2026',
]

const AVAILABLE_SECTIONS = ['A', 'B', 'C']

const AVAILABLE_DEPARTMENTS = [
  'Artificial Intelligence & Data Science',
  'Computer Science & Engineering',
  'Information Technology',
]

const AVAILABLE_RESIDENCIES = [
  { value: '', label: 'Unassigned (Fill on Login)' },
  { value: 'Day Scholar', label: 'Day Scholar' },
  { value: 'Hosteller', label: 'Hosteller' },
]

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  // Navigation & Upload mode
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [rawText, setRawText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Top-level Cohort & Detail Dropdown State
  const [selectedYear, setSelectedYear] = useState<number>(1)
  const [selectedBatch, setSelectedBatch] = useState<string>(YEAR_TO_DEFAULT_BATCH[1] || '2026-2030')
  const [selectedSemester, setSelectedSemester] = useState<number>(1)
  const [selectedSection, setSelectedSection] = useState<string>('A')
  const [selectedResidency, setSelectedResidency] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Artificial Intelligence & Data Science')
  const [defaultPassword, setDefaultPassword] = useState<string>('Student@123')

  // Stored unmapped raw rows from file / pasted text
  const [rawRows, setRawRows] = useState<RawStudentRow[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // When year changes, auto-sync default batch and semester (odd sem)
  const handleYearChange = (yearNum: number) => {
    setSelectedYear(yearNum)
    const defaultBatch = YEAR_TO_DEFAULT_BATCH[yearNum] || '2026-2030'
    setSelectedBatch(defaultBatch)
    const defaultSem = (yearNum - 1) * 2 + 1
    setSelectedSemester(defaultSem)
  }

  // Reactively apply cohort dropdowns to all raw parsed rows
  const parsedStudents: ParsedStudent[] = useMemo(() => {
    return rawRows.map((r) => {
      const regUpper = String(r.registerNumber || '').trim().toUpperCase()
      const studentName = String(r.name || '').trim()
      const customPass = r.password && String(r.password).trim() ? String(r.password).trim() : ''
      const pass = customPass || defaultPassword

      const year = r.year && !isNaN(Number(r.year)) ? Number(r.year) : selectedYear
      const semester = r.semester && !isNaN(Number(r.semester)) ? Number(r.semester) : selectedSemester
      const batch = r.batch && r.batch.trim() ? r.batch.trim() : selectedBatch
      const section = r.section && r.section.trim() ? r.section.trim().toUpperCase() : selectedSection
      const residencyStatus = r.residencyStatus && r.residencyStatus.trim() ? r.residencyStatus.trim() : selectedResidency
      const department = selectedDepartment

      const isValid = Boolean(regUpper && studentName)
      const validationError = !regUpper
        ? 'Missing Register Number'
        : !studentName
        ? 'Missing Student Name'
        : undefined

      return {
        registerNumber: regUpper,
        name: studentName,
        password: pass,
        email: r.email,
        phone: r.phone,
        parentPhone: r.parentPhone,
        dateOfBirth: r.dateOfBirth,
        bloodGroup: r.bloodGroup && r.bloodGroup.trim() ? r.bloodGroup.trim() : undefined,
        cgpa: r.cgpa !== undefined && r.cgpa !== '' ? r.cgpa : undefined,
        attendance: r.attendance !== undefined && r.attendance !== '' ? r.attendance : undefined,
        year,
        semester,
        section,
        batch,
        department,
        residencyStatus,
        isValid,
        validationError,
      }
    })
  }, [
    rawRows,
    selectedYear,
    selectedBatch,
    selectedSemester,
    selectedSection,
    selectedResidency,
    selectedDepartment,
    defaultPassword,
  ])

  if (!isOpen) return null

  // 1. Download Sample CSV Template (Clean 3 columns)
  const handleDownloadCsvTemplate = () => {
    const headers = ['RegisterNumber', 'Name', 'Password']
    const sampleRows = [
      '922525104001,Aakash Kumar,Aakash@123',
      '922525104002,Abirami Sundaram,Abirami@123',
      '922525104003,Balaji Mani,Balaji@123',
      '922525104004,Chandran Raj,Chandran@123',
      '922525104005,Deepak Sharma,Deepak@123',
    ]

    const csvContent = [headers.join(','), ...sampleRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `VSB_Student_Import_${selectedBatch}_Year${selectedYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Sample 3-column CSV template downloaded!')
  }

  // 2. Download Sample Excel Template (.xlsx) (Clean 3 columns)
  const handleDownloadExcelTemplate = () => {
    try {
      const data = [
        ['RegisterNumber', 'Name', 'Password'],
        ['922525104001', 'Aakash Kumar', 'Aakash@123'],
        ['922525104002', 'Abirami Sundaram', 'Abirami@123'],
        ['922525104003', 'Balaji Mani', 'Balaji@123'],
        ['922525104004', 'Chandran Raj', 'Chandran@123'],
        ['922525104005', 'Deepak Sharma', 'Deepak@123'],
      ]
      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Students')
      XLSX.writeFile(wb, `VSB_Student_Import_${selectedBatch}_Year${selectedYear}.xlsx`)
      toast.success('Sample 3-column Excel (.xlsx) downloaded!')
    } catch {
      handleDownloadCsvTemplate()
    }
  }

  // 3. Matrix Parser (accepts array of rows from Excel or Delimited text)
  const parseRowsMatrix = (rows: any[][]) => {
    if (!rows || rows.length === 0) {
      setRawRows([])
      return
    }

    // Filter empty rows
    const cleanedRows = rows.filter((r) =>
      r && r.length > 0 && r.some((c) => c !== undefined && c !== null && String(c).trim() !== '')
    )

    if (cleanedRows.length === 0) {
      setRawRows([])
      return
    }

    const firstRow = cleanedRows[0].map((c) =>
      String(c || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    )

    // Check if row 0 is header row
    const hasHeader =
      firstRow.some((h) => h.includes('reg') || h.includes('roll') || h.includes('id') || h.includes('studentno')) &&
      firstRow.some((h) => h.includes('name'))

    const startIndex = hasHeader ? 1 : 0

    // Column Mapping
    const getColIndex = (keywords: string[]): number => {
      if (!hasHeader) return -1
      return firstRow.findIndex((h) => keywords.some((k) => h.includes(k)))
    }

    const regIdx = hasHeader ? getColIndex(['reg', 'roll', 'studentno', 'id']) : 0
    const nameIdx = hasHeader ? getColIndex(['name', 'fullname', 'studentname']) : 1
    const passIdx = hasHeader ? getColIndex(['pass', 'pwd', 'password']) : 2

    // Legacy fallback column checks (if someone imports an older wide sheet)
    const emailIdx = hasHeader ? getColIndex(['email', 'mail']) : -1
    const phoneIdx = hasHeader ? getColIndex(['phone', 'mobile', 'contact']) : -1
    const parentPhoneIdx = hasHeader ? getColIndex(['parent', 'father', 'guardian']) : -1
    const dobIdx = hasHeader ? getColIndex(['dob', 'birth', 'dateofbirth']) : -1
    const bloodIdx = hasHeader ? getColIndex(['blood', 'bloodgroup']) : -1
    const residencyIdx = hasHeader ? getColIndex(['residency', 'hostel', 'dayscholar', 'status']) : -1
    const yearIdx = hasHeader ? getColIndex(['year', 'yr']) : -1
    const semIdx = hasHeader ? getColIndex(['sem', 'semester']) : -1
    const secIdx = hasHeader ? getColIndex(['sec', 'section']) : -1
    const batchIdx = hasHeader ? getColIndex(['batch']) : -1
    const cgpaIdx = hasHeader ? getColIndex(['cgpa', 'gpa', 'marks']) : -1
    const attIdx = hasHeader ? getColIndex(['att', 'attendance']) : -1

    const results: RawStudentRow[] = []

    for (let i = startIndex; i < cleanedRows.length; i++) {
      const row = cleanedRows[i]
      if (!row || row.length === 0) continue

      const rawReg = regIdx >= 0 && row[regIdx] !== undefined ? String(row[regIdx]).trim() : String(row[0] || '').trim()
      const rawName = nameIdx >= 0 && row[nameIdx] !== undefined ? String(row[nameIdx]).trim() : String(row[1] || '').trim()
      const rawPass = passIdx >= 0 && row[passIdx] !== undefined ? String(row[passIdx]).trim() : ''

      if (!rawReg && !rawName) continue

      const rawEmail = emailIdx >= 0 && row[emailIdx] !== undefined ? String(row[emailIdx]).trim() : undefined
      const rawPhone = phoneIdx >= 0 && row[phoneIdx] !== undefined ? String(row[phoneIdx]).trim() : undefined
      const rawParentPhone = parentPhoneIdx >= 0 && row[parentPhoneIdx] !== undefined ? String(row[parentPhoneIdx]).trim() : undefined
      const rawDob = dobIdx >= 0 && row[dobIdx] !== undefined ? String(row[dobIdx]).trim() : undefined
      const rawBlood = bloodIdx >= 0 && row[bloodIdx] !== undefined ? String(row[bloodIdx]).trim() : undefined
      const rawResidency = residencyIdx >= 0 && row[residencyIdx] !== undefined ? String(row[residencyIdx]).trim() : undefined

      const parsedYear = yearIdx >= 0 && !isNaN(Number(row[yearIdx])) ? Number(row[yearIdx]) : undefined
      const parsedSem = semIdx >= 0 && !isNaN(Number(row[semIdx])) ? Number(row[semIdx]) : undefined
      const parsedSec = secIdx >= 0 && row[secIdx] ? String(row[secIdx]).trim() : undefined
      const parsedBatch = batchIdx >= 0 && row[batchIdx] ? String(row[batchIdx]).trim() : undefined
      const parsedCgpa = cgpaIdx >= 0 && row[cgpaIdx] !== undefined ? String(row[cgpaIdx]).trim() : undefined
      const parsedAtt = attIdx >= 0 && row[attIdx] !== undefined ? String(row[attIdx]).trim() : undefined

      results.push({
        registerNumber: rawReg,
        name: rawName,
        password: rawPass,
        email: rawEmail,
        phone: rawPhone,
        parentPhone: rawParentPhone,
        dateOfBirth: rawDob,
        bloodGroup: rawBlood,
        residencyStatus: rawResidency,
        year: parsedYear,
        semester: parsedSem,
        section: parsedSec,
        batch: parsedBatch,
        cgpa: parsedCgpa,
        attendance: parsedAtt,
      })
    }

    setRawRows(results)
  }

  // 4. Parse Delimited Text (CSV, TSV, Copy-paste from Excel / Sheets)
  const parseTableText = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    if (lines.length === 0) {
      setRawRows([])
      return
    }

    const firstLine = lines[0]
    let sep = ','
    if (firstLine.includes('\t')) sep = '\t'
    else if (firstLine.includes(';') && !firstLine.includes(',')) sep = ';'
    else if (firstLine.includes('|')) sep = '|'

    const rowsMatrix = lines.map((line) =>
      line.split(sep).map((c) => c.replace(/^["']|["']$/g, '').trim())
    )

    parseRowsMatrix(rowsMatrix)
  }

  // 5. Handle File Upload (Supports .xlsx, .xls, .csv, .tsv, .txt)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const fileName = selectedFile.name.toLowerCase()

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer
          const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })
          const firstSheetName = wb.SheetNames[0]
          const ws = wb.Sheets[firstSheetName]
          const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
          parseRowsMatrix(rows)
          toast.success(`Excel sheet read successfully: ${rows.length} rows detected`)
        } catch (err: any) {
          toast.error('Failed to read Excel file. Please export as CSV and re-upload.')
        }
      }
      reader.readAsArrayBuffer(selectedFile)
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (text) {
          parseTableText(text)
          toast.success('File processed successfully!')
        }
      }
      reader.readAsText(selectedFile)
    }
  }

  // Clear data
  const handleResetData = () => {
    setFile(null)
    setRawText('')
    setRawRows([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.info('Parsed student rows cleared.')
  }

  // 6. Submit Bulk Students to Server
  const handleExecuteUpload = async () => {
    const validRows = parsedStudents.filter((s) => s.isValid)
    if (validRows.length === 0) {
      toast.error('No valid student records found to import.')
      return
    }

    setIsProcessing(true)
    setUploadProgress(15)

    try {
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: validRows,
          defaultPassword,
          year: selectedYear,
          batch: selectedBatch,
          semester: selectedSemester,
          section: selectedSection,
          residencyStatus: selectedResidency,
          department: selectedDepartment,
        }),
      })

      const data = await res.json()
      setUploadProgress(100)

      if (res.ok && data.success) {
        playNotificationChime()
        toast.success(
          data.message || `Successfully enrolled ${validRows.length} students into Batch ${selectedBatch} (Year ${selectedYear})!`
        )
        onSuccess()
        onClose()
      } else {
        toast.error(data.message || 'Failed to import students.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Network error during bulk import.')
    } finally {
      setIsProcessing(false)
    }
  }

  const validCount = parsedStudents.filter((s) => s.isValid).length
  const invalidCount = parsedStudents.length - validCount

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up border border-gray-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F4C430] text-[#071A3D] flex items-center justify-center font-black shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">Bulk Student Enrollment &amp; Data Import</h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                  3-Column Excel Mode
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Excel only needs: <span className="font-bold text-[#F4C430]">Register Number</span>, <span className="font-bold text-[#F4C430]">Name</span>, &amp; optional <span className="font-bold text-[#F4C430]">Password</span>. Select cohort details below.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-gray-50/50">

          {/* STEP 1: COHORT DETAILS SELECTION CARD */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-blue-100 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1455D9] text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="text-xs sm:text-sm font-black text-[#071A3D] uppercase tracking-wider">
                  Cohort &amp; Class Details (Applied to All Imported Students)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                Active Cohort: Year {selectedYear} · Batch {selectedBatch} · Sem {selectedSemester} · Sec {selectedSection}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Academic Year */}
              <div>
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#1455D9]" /> Academic Year:
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 hover:bg-white focus:bg-white rounded-xl border border-gray-300 text-xs font-bold text-[#071A3D] focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9] outline-none transition-all cursor-pointer"
                >
                  <option value={1}>1st Year (Year I)</option>
                  <option value={2}>2nd Year (Year II)</option>
                  <option value={3}>3rd Year (Year III)</option>
                  <option value={4}>4th Year (Year IV)</option>
                </select>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1455D9]" /> Academic Batch:
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 hover:bg-white focus:bg-white rounded-xl border border-gray-300 text-xs font-bold text-[#071A3D] focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9] outline-none transition-all cursor-pointer"
                >
                  {AVAILABLE_BATCHES.map((batch) => (
                    <option key={batch} value={batch}>
                      Batch {batch} {batch === YEAR_TO_DEFAULT_BATCH[selectedYear] ? '★ (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#1455D9]" /> Current Semester:
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(Number(e.target.value))}
                  className="w-full p-2.5 bg-gray-50 hover:bg-white focus:bg-white rounded-xl border border-gray-300 text-xs font-bold text-[#071A3D] focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9] outline-none transition-all cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem} {sem === (selectedYear - 1) * 2 + 1 ? '(Current Odd)' : sem === selectedYear * 2 ? '(Even)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#1455D9]" /> Section:
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 hover:bg-white focus:bg-white rounded-xl border border-gray-300 text-xs font-bold text-[#071A3D] focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9] outline-none transition-all cursor-pointer"
                >
                  {AVAILABLE_SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Residency Status */}
              <div>
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-[#1455D9]" /> Residency Status:
                </label>
                <select
                  value={selectedResidency}
                  onChange={(e) => setSelectedResidency(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 hover:bg-white focus:bg-white rounded-xl border border-gray-300 text-xs font-bold text-[#071A3D] focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9] outline-none transition-all cursor-pointer"
                >
                  {AVAILABLE_RESIDENCIES.map((res) => (
                    <option key={res.value} value={res.value}>
                      {res.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#1455D9]" /> Academic Department:
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 hover:bg-white focus:bg-white rounded-xl border border-gray-300 text-xs font-bold text-[#071A3D] focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9] outline-none transition-all cursor-pointer"
                >
                  {AVAILABLE_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Fallback Password */}
              <div>
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-[#1455D9]" /> Default / Fallback Password:
                </label>
                <input
                  type="text"
                  value={defaultPassword}
                  onChange={(e) => setDefaultPassword(e.target.value)}
                  placeholder="Student@123"
                  className="w-full p-2.5 bg-gray-50 hover:bg-white focus:bg-white rounded-xl border border-gray-300 font-mono text-xs font-bold text-[#071A3D] focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9] outline-none transition-all"
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-500 italic pt-1 border-t border-gray-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1455D9] shrink-0" />
              Tip: Changing any dropdown above automatically re-maps all previewed students instantly before you click import.
            </p>
          </div>

          {/* STEP 2: EXCEL / CSV DATA SOURCE */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1455D9] text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="text-xs sm:text-sm font-black text-[#071A3D] uppercase tracking-wider">
                  Provide Excel Spreadsheet or Pasted Rows
                </h3>
              </div>

              {/* Template Download Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  Sample Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCsvTemplate}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-[#1455D9] border border-blue-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#1455D9]" />
                  Sample CSV (.csv)
                </button>
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#1455D9] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📁 Upload Excel (.xlsx) or CSV File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  activeTab === 'paste'
                    ? 'bg-[#1455D9] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📋 Paste Rows From Excel / Google Sheets
              </button>

              {rawRows.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetData}
                  className="ml-auto text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Clear loaded rows"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Data
                </button>
              )}
            </div>

            {/* Tab 1: Upload File */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-[#1455D9] rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-gray-50/70 hover:bg-blue-50/40 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.txt,.tsv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1455D9] group-hover:scale-110 transition-transform mx-auto flex items-center justify-center mb-2.5">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#071A3D] text-sm">
                    {file ? file.name : 'Click to select or drag and drop your Excel (.xlsx) or CSV file'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Excel requires only 3 columns: <span className="font-semibold text-gray-700">Register Number</span>, <span className="font-semibold text-gray-700">Name</span>, and optional <span className="font-semibold text-gray-700">Password</span>
                  </p>
                  {file && (
                    <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-800 text-[11px] font-bold rounded-full">
                      {rawRows.length} student records extracted
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Paste Rows */}
            {activeTab === 'paste' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#071A3D] uppercase tracking-wider">
                    Paste 3 columns directly from Excel or Google Sheets:
                  </label>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Format: RegisterNumber [Tab/,] Name [Tab/,] Password
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value)
                    parseTableText(e.target.value)
                  }}
                  placeholder={`922525104001\tAakash Kumar\tAakash@123\n922525104002\tAbirami Sundaram\tAbirami@123\n922525104003\tBalaji Mani\tBalaji@123`}
                  className="w-full p-3 font-mono text-xs rounded-2xl border border-gray-300 focus:outline-none focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9] bg-white leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* STEP 3: LIVE PREVIEW & VERIFICATION TABLE */}
          {parsedStudents.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs sm:text-sm font-black uppercase text-[#071A3D]">
                    Preview &amp; Verify Student Records ({parsedStudents.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} Ready to Import
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {invalidCount} Invalid
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Register Number</th>
                      <th className="p-2.5">Full Name</th>
                      <th className="p-2.5">Password</th>
                      <th className="p-2.5">Year / Sem</th>
                      <th className="p-2.5">Batch</th>
                      <th className="p-2.5">Section</th>
                      <th className="p-2.5">Residency</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {parsedStudents.slice(0, 100).map((st, idx) => (
                      <tr key={idx} className={st.isValid ? 'hover:bg-gray-50' : 'bg-red-50/50'}>
                        <td className="p-2.5 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-[#1455D9]">
                          {st.registerNumber || <span className="text-red-500 italic">Missing</span>}
                        </td>
                        <td className="p-2.5 font-semibold text-[#071A3D]">
                          {st.name || <span className="text-red-500 italic">Missing</span>}
                        </td>
                        <td className="p-2.5 font-mono text-gray-600 text-[11px]">
                          {st.password === defaultPassword ? (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">
                              Default ({defaultPassword})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-blue-50 text-[#1455D9] rounded-md text-[10px] font-bold">
                              Custom ({st.password})
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-gray-700 font-semibold">
                          Y{st.year} · S{st.semester}
                        </td>
                        <td className="p-2.5 font-mono text-gray-600">{st.batch}</td>
                        <td className="p-2.5 font-bold text-[#071A3D]">Sec {st.section}</td>
                        <td className="p-2.5 text-gray-600">{st.residencyStatus || '—'}</td>
                        <td className="p-2.5">
                          {st.isValid ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready
                            </span>
                          ) : (
                            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-bold text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> {st.validationError}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedStudents.length > 100 && (
                <p className="text-[11px] text-gray-500 text-center italic">
                  Showing first 100 of {parsedStudents.length} rows. All {validCount} valid students will be imported.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-gray-400" />
            Selected Target: <span className="font-bold text-[#071A3D]">Batch {selectedBatch}</span> (Year {selectedYear}, Sem {selectedSemester}, Sec {selectedSection})
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExecuteUpload}
              disabled={isProcessing || validCount === 0}
              className="px-6 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Enrolling {validCount} Students into Batch {selectedBatch}...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Import {validCount > 0 ? validCount : ''} Students into Batch {selectedBatch}
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
