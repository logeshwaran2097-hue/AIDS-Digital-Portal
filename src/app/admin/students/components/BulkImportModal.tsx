'use client'

import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  Eye,
  FileText,
  HelpCircle,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { playNotificationChime } from '@/lib/notificationEngine'

interface ParsedStudent {
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
  bloodGroup?: string
  residencyStatus?: string
  cgpa?: string | number
  attendance?: string
  isValid: boolean
  validationError?: string
}

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'quick-seed'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [rawText, setRawText] = useState('')
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [defaultPassword, setDefaultPassword] = useState('Student@123')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  // 1. Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      'RegisterNumber',
      'Name',
      'Email',
      'Password',
      'Year',
      'Semester',
      'Section',
      'Batch',
      'Phone',
      'ParentPhone',
      'DateOfBirth',
      'BloodGroup',
    ]

    const sampleRows = [
      '922524104001,Aakash Kumar,922524104001@student.vsb.edu.in,Student@123,2,4,A,2024-2028,9876543210,9876543211,2006-05-14,O+',
      '922524104002,Abirami Sundaram,922524104002@student.vsb.edu.in,Student@123,2,4,A,2024-2028,9876543212,9876543213,2006-08-22,B+',
      '922523104001,Balaji Mani,922523104001@student.vsb.edu.in,Student@123,3,6,B,2023-2027,9876543214,9876543215,2005-03-10,A+',
    ]

    const csvContent = [headers.join(','), ...sampleRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'VSB_AI_DS_Student_Import_Template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Sample template downloaded!')
  }

  // 2. Intelligent Delimiter & Column Parser
  const parseTableText = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    if (lines.length === 0) {
      setParsedStudents([])
      return
    }

    // Determine separator: comma, tab, semicolon or pipe
    const firstLine = lines[0]
    let sep = ','
    if (firstLine.includes('\t')) sep = '\t'
    else if (firstLine.includes(';') && !firstLine.includes(',')) sep = ';'
    else if (firstLine.includes('|')) sep = '|'

    // Check if first line is a header
    const headers = firstLine.split(sep).map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
    const hasHeader =
      headers.some((h) => h.includes('reg') || h.includes('roll')) &&
      headers.some((h) => h.includes('name'))

    const startIndex = hasHeader ? 1 : 0

    // Column Mapping Index Finder
    const getColIndex = (keywords: string[]): number => {
      if (!hasHeader) return -1
      return headers.findIndex((h) => keywords.some((k) => h.includes(k)))
    }

    const regIdx = hasHeader ? getColIndex(['reg', 'roll', 'studentno', 'id']) : 0
    const nameIdx = hasHeader ? getColIndex(['name', 'fullname', 'studentname']) : 1
    const emailIdx = hasHeader ? getColIndex(['email', 'mail']) : -1
    const passIdx = hasHeader ? getColIndex(['pass', 'pwd']) : -1
    const dobIdx = hasHeader ? getColIndex(['dob', 'birth', 'dateofbirth']) : -1
    const yearIdx = hasHeader ? getColIndex(['year', 'yr']) : -1
    const semIdx = hasHeader ? getColIndex(['sem', 'semester']) : -1
    const secIdx = hasHeader ? getColIndex(['sec', 'section']) : -1
    const batchIdx = hasHeader ? getColIndex(['batch']) : -1
    const phoneIdx = hasHeader ? getColIndex(['phone', 'mobile', 'contact', 'cell']) : -1
    const parentPhoneIdx = hasHeader ? getColIndex(['parent', 'father', 'guardian']) : -1
    const bloodIdx = hasHeader ? getColIndex(['blood', 'bloodgroup']) : -1
    const residencyIdx = hasHeader ? getColIndex(['residency', 'hostel', 'dayscholar', 'status']) : -1
    const cgpaIdx = hasHeader ? getColIndex(['cgpa', 'gpa', 'marks']) : -1
    const attIdx = hasHeader ? getColIndex(['att', 'attendance', 'percentage']) : -1

    const results: ParsedStudent[] = []

    for (let i = startIndex; i < lines.length; i++) {
      const row = lines[i].split(sep).map((c) => c.replace(/^["']|["']$/g, '').trim())
      if (row.length === 0 || (row.length === 1 && !row[0])) continue

      const registerNumber = (regIdx >= 0 && row[regIdx] ? row[regIdx] : row[0] || '').toUpperCase()
      const name = (nameIdx >= 0 && row[nameIdx] ? row[nameIdx] : row[1] || '')
      const email = emailIdx >= 0 ? row[emailIdx] : ''
      const password = passIdx >= 0 && row[passIdx] ? row[passIdx] : defaultPassword
      const dob = dobIdx >= 0 ? row[dobIdx] : ''
      const year = yearIdx >= 0 && !isNaN(Number(row[yearIdx])) ? Number(row[yearIdx]) : 1
      const semester = semIdx >= 0 && !isNaN(Number(row[semIdx])) ? Number(row[semIdx]) : (year * 2)
      const section = secIdx >= 0 && row[secIdx] ? row[secIdx].toUpperCase() : 'A'
      const batch = batchIdx >= 0 ? row[batchIdx] : ''
      const phone = phoneIdx >= 0 ? row[phoneIdx] : ''
      const parentPhone = parentPhoneIdx >= 0 ? row[parentPhoneIdx] : ''
      const bloodGroup = bloodIdx >= 0 ? row[bloodIdx] : 'O+'
      const residencyStatus = residencyIdx >= 0 ? row[residencyIdx] : 'Day Scholar'
      const cgpa = cgpaIdx >= 0 ? row[cgpaIdx] : ''
      const attendance = attIdx >= 0 ? row[attIdx] : ''

      const isValid = Boolean(registerNumber && name)
      const validationError = !registerNumber
        ? 'Missing Register Number'
        : !name
        ? 'Missing Student Name'
        : undefined

      results.push({
        registerNumber,
        name,
        email,
        password,
        dateOfBirth: dob,
        year: year || 1,
        semester: semester || 1,
        section: section || 'A',
        batch,
        phone,
        parentPhone,
        bloodGroup,
        residencyStatus,
        cgpa,
        attendance,
        isValid,
        validationError,
      })
    }

    setParsedStudents(results)
  }

  // 3. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) {
        parseTableText(text)
      }
    }
    reader.readAsText(selectedFile)
  }

  // 4. Submit Bulk Students to Server
  const handleExecuteUpload = async () => {
    const validRows = parsedStudents.filter((s) => s.isValid)
    if (validRows.length === 0) {
      toast.error('No valid student records found to import.')
      return
    }

    setIsProcessing(true)
    setUploadProgress(10)

    try {
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: validRows,
          defaultPassword,
        }),
      })

      const data = await res.json()
      setUploadProgress(100)

      if (res.ok && data.success) {
        playNotificationChime()
        toast.success(data.message || `Successfully processed ${validRows.length} students!`)
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

  // 5. One-Click 1,000 Sample Student Generator
  const handleGenerate1000Demo = async () => {
    setIsProcessing(true)
    setUploadProgress(20)

    try {
      const firstNames = [
        'Aadhil', 'Aakash', 'Abhinav', 'Abishek', 'Aditya', 'Ajay', 'Akash', 'Amarnath', 'Anand', 'Anbu',
        'Anirudh', 'Aravind', 'Arjun', 'Arul', 'Arun', 'Ashwin', 'Balaji', 'Barath', 'Bhuvanesh', 'Deepak',
        'Dhanush', 'Dinesh', 'Ganesh', 'Gautam', 'Gokul', 'Hariharan', 'Harish', 'Karthik', 'Kavin', 'Kishore',
        'Lokesh', 'Manoj', 'Naveen', 'Nikhil', 'Praveen', 'Rahul', 'Rajesh', 'Sanjay', 'Santhosh', 'Saravanan',
        'Siddharth', 'Siva', 'Surya', 'Vignesh', 'Vijay', 'Vishnu', 'Aadhira', 'Abirami', 'Aishwarya', 'Akshaya',
        'Ananya', 'Anitha', 'Archana', 'Bhavana', 'Deepa', 'Divya', 'Gayathri', 'Harini', 'Janani', 'Kavitha',
        'Keerthana', 'Lavanya', 'Monisha', 'Nandhini', 'Nithya', 'Pavithra', 'Pooja', 'Priya', 'Ramya', 'Sandhya',
        'Saranya', 'Sneha', 'Soundarya', 'Swathi', 'Swetha', 'Vaishnavi', 'Varsha'
      ]

      const lastNames = [
        'Kumar', 'Rajan', 'Murugan', 'Selvam', 'Palanisamy', 'Sundaram', 'Nadarajan', 'Krishnan', 'Mani',
        'Shanmugam', 'Subramanian', 'Natarajan', 'Balakrishnan', 'Ganesan', 'Kandasamy', 'Swaminathan',
        'Ramasamy', 'Manoharan', 'Govindasamy', 'Arumugam', 'Chandran', 'Venkatesh', 'Mohan', 'Suresh'
      ]

      const yearConfigs = [
        { year: 1, sem: 2, batch: '2025-2029', prefix: '922525104', birthYear: 2007 },
        { year: 2, sem: 4, batch: '2024-2028', prefix: '922524104', birthYear: 2006 },
        { year: 3, sem: 6, batch: '2023-2027', prefix: '922523104', birthYear: 2005 },
        { year: 4, sem: 8, batch: '2022-2026', prefix: '922522104', birthYear: 2004 },
      ]

      const sections = ['A', 'B', 'C', 'D']
      const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-']
      const residencies = ['Day Scholar', 'Hostel', 'College Bus']

      const generated: ParsedStudent[] = []

      for (const config of yearConfigs) {
        for (let i = 1; i <= 250; i++) {
          const regNum = `${config.prefix}${String(i).padStart(3, '0')}`
          const fName = firstNames[Math.floor(Math.random() * firstNames.length)]
          const lName = lastNames[Math.floor(Math.random() * lastNames.length)]
          const section = sections[Math.floor((i - 1) / 63) % sections.length]

          generated.push({
            registerNumber: regNum,
            name: `${fName} ${lName}`,
            email: `${regNum.toLowerCase()}@student.vsb.edu.in`,
            password: defaultPassword,
            dateOfBirth: `${config.birthYear}-0${(i % 9) + 1}-15`,
            year: config.year,
            semester: config.sem,
            section,
            batch: config.batch,
            phone: `+91 98${String(10000000 + i).padStart(8, '0')}`,
            parentPhone: `+91 94${String(10000000 + i).padStart(8, '0')}`,
            bloodGroup: bloodGroups[i % bloodGroups.length],
            residencyStatus: residencies[i % residencies.length],
            cgpa: (7.2 + (i % 25) * 0.1).toFixed(2),
            attendance: `${85 + (i % 14)}%`,
            isValid: true,
          })
        }
      }

      setParsedStudents(generated)
      setUploadProgress(50)
      setActiveTab('paste')
      toast.success('Generated 1,000 realistic student records! Review preview and click "Import to Database".')
    } catch (err: any) {
      toast.error('Error generating demo data.')
    } finally {
      setIsProcessing(false)
    }
  }

  const validCount = parsedStudents.filter((s) => s.isValid).length
  const invalidCount = parsedStudents.length - validCount

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4C430] text-[#071A3D] flex items-center justify-center font-black">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">Bulk Student Enrollment &amp; Data Import</h2>
              <p className="text-xs text-gray-300">
                Import from Excel (.xlsx, .csv), copy-pasted tabular data, or generate 1,000 students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-xs font-black rounded-t-xl transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-[#1455D9] border-t-2 border-[#1455D9] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              📁 Upload CSV / Excel File
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 text-xs font-black rounded-t-xl transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-white text-[#1455D9] border-t-2 border-[#1455D9] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              📋 Paste Excel / PDF Text Rows
            </button>
            <button
              onClick={() => setActiveTab('quick-seed')}
              className={`px-4 py-2 text-xs font-black rounded-t-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'quick-seed'
                  ? 'bg-white text-[#1455D9] border-t-2 border-[#1455D9] shadow-xs'
                  : 'text-[#071A3D] bg-amber-100 hover:bg-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              ⚡ Instant 1,000 Students Generator
            </button>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="text-xs text-[#1455D9] hover:underline font-bold flex items-center gap-1 cursor-pointer mb-2"
          >
            <Download className="w-3.5 h-3.5" /> Download Sample CSV Template
          </button>
        </div>

        {/* Body Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#1455D9] rounded-3xl p-8 text-center cursor-pointer transition-all bg-gray-50 hover:bg-blue-50/50 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-full bg-blue-100 text-[#1455D9] group-hover:scale-110 transition-transform mx-auto flex items-center justify-center mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-[#071A3D] text-sm">
                  {file ? file.name : 'Click to select CSV / Excel export file'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Supports .csv, .txt, and .tsv formats (comma, semicolon, or tab-delimited)
                </p>
                {file && (
                  <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-800 text-[11px] font-bold rounded-full">
                    {parsedStudents.length} rows detected
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
                <HelpCircle className="w-4 h-4 shrink-0 text-[#1455D9] mt-0.5" />
                <div>
                  <span className="font-bold">Tip for Excel / PDF files:</span> If you have an Excel (.xlsx) file or a PDF table, you can either save it as a <strong>CSV (.csv)</strong> in Excel, or simply copy the rows and paste them into the <strong>&quot;Paste Excel / PDF Text Rows&quot;</strong> tab.
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Paste Rows */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#071A3D] mb-1 uppercase tracking-wider">
                  Paste rows directly from Excel, Word, or PDF Table:
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value)
                    parseTableText(e.target.value)
                  }}
                  placeholder="Paste table contents here. For example:
922524104001,Aakash Kumar,2,4,A,2006-05-14,9876543210
922524104002,Abirami Sundaram,2,4,A,2006-08-22,9876543212"
                  className="w-full p-4 font-mono text-xs rounded-2xl border border-gray-300 focus:outline-none focus:border-[#1455D9] focus:ring-1 focus:ring-[#1455D9]"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Quick 1,000 Students Generator */}
          {activeTab === 'quick-seed' && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-blue-50 border border-amber-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F4C430] text-[#071A3D] flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#071A3D]">
                  Generate 1,000 Department of AI &amp; DS Students
                </h3>
                <p className="text-xs text-gray-600 max-w-lg mx-auto mt-1">
                  Instantly creates 250 students across each of Year 1, Year 2, Year 3, and Year 4 (Sections A, B, C, D) with Anna University register numbers, passwords, phone numbers, CGPAs, and attendance.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerate1000Demo}
                disabled={isProcessing}
                className="px-6 py-3 rounded-2xl bg-[#071A3D] hover:bg-[#0A2A5E] text-white text-xs font-black shadow-xl cursor-pointer hover:scale-105 transition-all flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4 text-[#F4C430]" />
                {isProcessing ? 'Generating Students...' : '⚡ Generate 1,000 Students Data Preview'}
              </button>
            </div>
          )}

          {/* Default Password Setting */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="flex-1">
              <label className="block text-xs font-black text-[#071A3D] mb-1">
                Default Student Temporary Login Password:
              </label>
              <input
                type="text"
                value={defaultPassword}
                onChange={(e) => setDefaultPassword(e.target.value)}
                className="p-2 rounded-xl border border-gray-300 font-mono text-xs w-full max-w-xs focus:outline-none focus:border-[#1455D9]"
              />
            </div>
            <div className="text-xs text-gray-500 max-w-xs">
              Students will use their Register Number + this password to log in and will be prompted to set a permanent password.
            </div>
          </div>

          {/* Live Data Preview Table */}
          {parsedStudents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-[#071A3D]">
                    Preview Parsed Records ({parsedStudents.length})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                    {validCount} Ready
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                      {invalidCount} Invalid
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Reg Number</th>
                      <th className="p-2.5">Full Name</th>
                      <th className="p-2.5">Year / Sem / Sec</th>
                      <th className="p-2.5">Batch</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5">CGPA</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedStudents.slice(0, 100).map((st, idx) => (
                      <tr key={idx} className={st.isValid ? 'hover:bg-gray-50' : 'bg-red-50/50'}>
                        <td className="p-2.5 text-gray-400 font-mono text-[10px]">{idx + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-[#1455D9]">
                          {st.registerNumber || <span className="text-red-500 italic">Empty</span>}
                        </td>
                        <td className="p-2.5 font-semibold text-[#071A3D]">
                          {st.name || <span className="text-red-500 italic">Empty</span>}
                        </td>
                        <td className="p-2.5 text-gray-600">
                          Y{st.year} / S{st.semester} / {st.section}
                        </td>
                        <td className="p-2.5 text-gray-500">{st.batch || '—'}</td>
                        <td className="p-2.5 text-gray-500 font-mono">{st.phone || '—'}</td>
                        <td className="p-2.5 font-bold text-gray-700">{st.cgpa || '—'}</td>
                        <td className="p-2.5">
                          {st.isValid ? (
                            <span className="text-green-600 flex items-center gap-1 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1 font-bold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5" /> {st.validationError}
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
                  Showing first 100 of {parsedStudents.length} rows (all {parsedStudents.length} will be imported).
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200 font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteUpload}
            disabled={isProcessing || validCount === 0}
            className="px-6 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] disabled:bg-gray-300 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Importing {validCount} Students to Database...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Import {validCount} Students to Database
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
