'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  GraduationCap,
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  Mail,
  Phone,
  Calendar,
  Layers,
  Sparkles,
  Bot,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Clock,
  Check,
  XCircle,
  FileText,
  ShieldAlert,
  Send,
  UploadCloud,
  FileSpreadsheet,
  Bus,
  Building,
  LayoutGrid,
  List,
  Copy,
  PhoneCall,
  Cake,
  Gift,
  PartyPopper,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { playNotificationChime } from '@/lib/notificationEngine'
import { toast } from '@/components/ui/Toast'
import { BulkImportModal } from './BulkImportModal'
import {
  YEAR_TO_DEFAULT_BATCH,
  ACADEMIC_COHORTS,
  getDefaultBatchForYear,
  getYearFromBatch,
  getYearFromSemester,
  getSemesterForYear,
} from '@/lib/academicBatch'
import { cn } from '@/lib/utils'

export interface StudentRecord {
  id: string
  userId?: string
  registerNumber: string
  name: string
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  bloodGroup?: string | null
  residencyStatus?: string | null
  busNo?: string | null
  boardingPoint?: string | null
  busDetails?: string | null
  hostelBlock?: string | null
  roomNo?: string | null
  address?: string | null
  year: number
  semester: number
  section: string
  batch?: string | null
  advisorName?: string | null
  parentPhone?: string | null
  status: string
  cgpa?: string | null
  attendance?: string | null
  profileImage?: string | null
}

function parseBirthDate(dobStr: string | null | undefined): { month: number; day: number; year?: number } | null {
  if (!dobStr) return null
  const str = String(dobStr).trim()
  if (!str || str.startsWith('2004-01-01')) return null

  // Format YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (ymdMatch) {
    return {
      year: parseInt(ymdMatch[1], 10),
      month: parseInt(ymdMatch[2], 10),
      day: parseInt(ymdMatch[3], 10),
    }
  }

  // Format DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (dmyMatch) {
    return {
      year: parseInt(dmyMatch[3], 10),
      month: parseInt(dmyMatch[2], 10),
      day: parseInt(dmyMatch[1], 10),
    }
  }

  // Date object / ISO string fallback
  const d = new Date(str)
  if (!isNaN(d.getTime())) {
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    }
  }

  return null
}

export function AdminStudentsView({ initialStudents }: { initialStudents: StudentRecord[] }) {
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents)
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [semFilter, setSemFilter] = useState('ALL')
  const [sectionFilter, setSectionFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [birthdayFilter, setBirthdayFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'BOTH'>('ALL')

  // Compute today's and tomorrow's birthdays
  const { todayBirthdays, tomorrowBirthdays } = React.useMemo(() => {
    const today = new Date()
    const tm = today.getMonth() + 1
    const td = today.getDate()

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const tomm = tomorrow.getMonth() + 1
    const tomd = tomorrow.getDate()

    const tday: (StudentRecord & { turningAge?: number })[] = []
    const tmrw: (StudentRecord & { turningAge?: number })[] = []

    students.forEach((s) => {
      const p = parseBirthDate(s.dateOfBirth)
      if (!p) return

      const age = p.year ? today.getFullYear() - p.year : undefined

      if (p.month === tm && p.day === td) {
        tday.push({ ...s, turningAge: age })
      } else if (p.month === tomm && p.day === tomd) {
        tmrw.push({ ...s, turningAge: age })
      }
    })

    return { todayBirthdays: tday, tomorrowBirthdays: tmrw }
  }, [students])

  const getBirthdayStatus = (dob?: string | null): 'today' | 'tomorrow' | null => {
    const p = parseBirthDate(dob)
    if (!p) return null
    const now = new Date()
    if (p.month === now.getMonth() + 1 && p.day === now.getDate()) return 'today'
    const tom = new Date()
    tom.setDate(tom.getDate() + 1)
    if (p.month === tom.getMonth() + 1 && p.day === tom.getDate()) return 'tomorrow'
    return null
  }

  const handleSendBirthdayWish = (s: StudentRecord, isTomorrow: boolean = false) => {
    const phone = s.phone || s.parentPhone
    if (!phone) {
      toast.error(`No phone number on record for ${s.name}`)
      return
    }
    const cleanPhone = phone.replace(/\D/g, '')
    const intlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
    const greeting = isTomorrow
      ? `🎉 Advance Happy Birthday, ${s.name}! 🎂✨ The Department of AI & DS, V.S.B. Engineering College wishes you a fantastic birthday tomorrow and great academic success in the year ahead! 🎓🌟`
      : `🎉 Wishing you a very Happy Birthday, ${s.name}! 🎂✨ The Department of AI & DS, V.S.B. Engineering College wishes you joy, good health, and wonderful achievements in your academics! 🎓🌟`
    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(greeting)}`
    window.open(url, '_blank')
  }
  const [isLoading, setIsLoading] = useState(false)

  // Mobile / Desktop View Mode: Defaults to 'cards' on mobile screens, 'table' on desktop
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [copiedReg, setCopiedReg] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setViewMode('table')
    }
  }, [])

  const handleCopyReg = (reg: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(reg)
      setCopiedReg(reg)
      toast.success(`Copied "${reg}" to clipboard`)
      setTimeout(() => setCopiedReg(null), 2000)
    }
  }

  // Main Tab Navigation: 'directory' | 'requests'
  const [activeMainTab, setActiveMainTab] = useState<'directory' | 'requests'>('directory')

  // AI Student Query & Advisor Agent State
  const [showAiAgent, setShowAiAgent] = useState(false)
  const [aiQueryInput, setAiQueryInput] = useState('')
  const [isAiQuerying, setIsAiQuerying] = useState(false)
  const [aiAgentResponse, setAiAgentResponse] = useState<string | null>(null)
  
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedStudent) return
    const file = e.target.files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG).')
      return
    }
    
    setIsUploadingPhoto(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        
        // Compress image using canvas
        const img = new Image()
        img.onload = async () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 400
          const MAX_HEIGHT = 400
          let width = img.width
          let height = img.height

          if (width > height && width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          } else if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)

          try {
            const res = await fetch('/api/students', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: selectedStudent.id,
                profileImage: compressedBase64
              })
            })
            const data = await res.json()
            if (res.ok && data.success) {
              setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, profileImage: compressedBase64 } : s))
              setSelectedStudent(prev => prev ? { ...prev, profileImage: compressedBase64 } : null)
              toast.success('Profile photo updated successfully!')
            } else {
              toast.error(data.message || 'Failed to update photo')
            }
          } catch (error) {
            toast.error('Network error. Failed to update photo.')
          } finally {
            setIsUploadingPhoto(false)
          }
        }
        img.src = base64
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Failed to process image.')
      setIsUploadingPhoto(false)
    }
  }

  const handleRunAiAgent = async (customQuery?: string) => {
    const q = (customQuery || aiQueryInput).trim()
    if (!q) return
    setIsAiQuerying(true)
    setAiAgentResponse(null)

    const lowerQ = q.toLowerCase()
    if (lowerQ.includes('birthday') || lowerQ.includes('bday') || lowerQ.includes('birth day')) {
      let bdaySummary = `🎂 **Department Birthday Intelligence (Today & Tomorrow):**\n\n`
      if (todayBirthdays.length > 0) {
        bdaySummary += `🎉 **Today's Birthday Celebrations (${todayBirthdays.length}):**\n` +
          todayBirthdays.map(s => `• **${s.name}** (${s.registerNumber}) — Year ${s.year}, Sec ${s.section}${s.turningAge ? ` · Turning ${s.turningAge} Today!` : ''} | Phone: ${s.phone || 'N/A'}`).join('\n') + '\n\n'
      } else {
        bdaySummary += `• **Today:** No birthdays scheduled today.\n\n`
      }

      if (tomorrowBirthdays.length > 0) {
        bdaySummary += `🎁 **Tomorrow's Birthday Celebrations (${tomorrowBirthdays.length}):**\n` +
          tomorrowBirthdays.map(s => `• **${s.name}** (${s.registerNumber}) — Year ${s.year}, Sec ${s.section}${s.turningAge ? ` · Turning ${s.turningAge} Tomorrow!` : ''} | Phone: ${s.phone || 'N/A'}`).join('\n')
      } else {
        bdaySummary += `• **Tomorrow:** No birthdays scheduled tomorrow.`
      }

      setAiAgentResponse(bdaySummary)
      setIsAiQuerying(false)
      return
    }

    if (lowerQ.includes('low attendance') || lowerQ.includes('< 75') || lowerQ.includes('below 75') || lowerQ.includes('shortage')) {
      const lowAtt = students.filter(s => {
        const att = parseFloat(s.attendance || '100')
        return !isNaN(att) && att < 75
      })
      const summary = `📊 **AI Attendance Analysis (${lowAtt.length} students < 75% threshold):**\n\n` +
        (lowAtt.length > 0 
          ? lowAtt.map(s => `• **${s.registerNumber}** — ${s.name} (Yr ${s.year}, Sec ${s.section}): Attendance **${s.attendance || 'N/A'}%** | Parent: ${s.parentPhone || 'N/A'}`).join('\n')
          : 'All students have satisfactory attendance (≥ 75%).')
      setAiAgentResponse(summary)
      setIsAiQuerying(false)
      return
    }

    if (lowerQ.includes('top') || lowerQ.includes('rank') || lowerQ.includes('highest cgpa')) {
      const topStudents = [...students]
        .filter(s => s.cgpa && !isNaN(parseFloat(s.cgpa)))
        .sort((a, b) => parseFloat(b.cgpa || '0') - parseFloat(a.cgpa || '0'))
        .slice(0, 5)
      const summary = `🏆 **Top 5 Academic Performers (by CGPA):**\n\n` +
        (topStudents.length > 0
          ? topStudents.map((s, idx) => `${idx + 1}. **${s.name}** (${s.registerNumber}) — CGPA: **${s.cgpa}** | Year ${s.year} Sec ${s.section}`).join('\n')
          : 'No CGPA records found yet.')
      setAiAgentResponse(summary)
      setIsAiQuerying(false)
      return
    }

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[Admin Student Directory Query] Database size: ${students.length} students. Query: ${q}`,
          sessionId: 'admin-student-agent',
        }),
      })
      const data = await res.json()
      if (data.success && data.answer) {
        setAiAgentResponse(data.answer)
      } else {
        setAiAgentResponse('I could not analyze this student query. Try asking about attendance, CGPA, or specific register numbers.')
      }
    } catch {
      setAiAgentResponse('Network error querying AI engine.')
    } finally {
      setIsAiQuerying(false)
    }
  }

  // Profile Edit Permission Requests State
  const [profileRequests, setProfileRequests] = useState<any[]>([])
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'pending' | 'approved' | 'rejected'>('ALL')
  const [adminNotesMap, setAdminNotesMap] = useState<Record<string, string>>({})
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null)

  const fetchProfileRequests = async () => {
    try {
      const res = await fetch('/api/students/profile-requests')
      const data = await res.json()
      if (data.success && Array.isArray(data.requests)) {
        setProfileRequests(data.requests)
      }
    } catch {}
  }

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students')
      const data = await res.json()
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students)
      }
    } catch (err) {
      console.error('Error fetching students:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialStudents && initialStudents.length > 0) {
      setStudents(initialStudents)
    } else {
      fetchStudents()
    }
    fetchProfileRequests()

    const interval = setInterval(() => {
      fetchStudents()
      fetchProfileRequests()
    }, 45000)
    return () => clearInterval(interval)
  }, [initialStudents])

  const handleReviewRequest = async (id: string, action: 'approve' | 'reject') => {
    setProcessingRequestId(id)
    try {
      const res = await fetch('/api/students/profile-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          adminNotes: adminNotesMap[id] || '',
          reviewedBy: 'Super Administrator',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        playNotificationChime()
        fetchProfileRequests()

        // Also refresh student list if approved
        if (action === 'approve') {
          const req = profileRequests.find((r) => r.id === id)
          if (req && req.requestedData) {
            setStudents((prev) =>
              prev.map((s) =>
                s.registerNumber === req.registerNumber
                  ? {
                      ...s,
                      name: req.requestedData.name || s.name,
                      email: req.requestedData.email || s.email,
                      phone: req.requestedData.phone !== undefined ? req.requestedData.phone : s.phone,
                      year: req.requestedData.year ? Number(req.requestedData.year) : s.year,
                      semester: req.requestedData.semester ? Number(req.requestedData.semester) : s.semester,
                      section: req.requestedData.section || s.section,
                    }
                  : s
              )
            )
          }
        }
      } else {
        alert(data.message || 'Failed to update request')
      }
    } catch {
      alert('Network error updating request')
    } finally {
      setProcessingRequestId(null)
    }
  }

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [addFormError, setAddFormError] = useState<string | null>(null)
  const [editFormError, setEditFormError] = useState<string | null>(null)

  // Academic Cohort & Batch States
  const [batchFilter, setBatchFilter] = useState('ALL')
  const [isBatchSyncModalOpen, setIsBatchSyncModalOpen] = useState(false)
  const [isSyncingBatches, setIsSyncingBatches] = useState(false)
  const [syncTargetYear, setSyncTargetYear] = useState('ALL')
  const [syncSemestersOption, setSyncSemestersOption] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    registerNumber: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    parentPhone: '',
    dateOfBirth: '',
    bloodGroup: '',
    residencyStatus: '',
    busNo: '',
    boardingPoint: '',
    busDetails: '',
    hostelBlock: '',
    roomNo: '',
    address: '',
    year: 1,
    semester: 1,
    batch: getDefaultBatchForYear(1),
    section: 'A',
    advisorName: '',
    status: 'active',
    cgpa: '',
    attendance: '',
  })

  // 8 Semesters Definition
  const allSemesters = [
    { sem: 1, year: 1, yearName: 'Year I', label: 'Semester 1', tag: 'Year I - Odd' },
    { sem: 2, year: 1, yearName: 'Year I', label: 'Semester 2', tag: 'Year I - Even' },
    { sem: 3, year: 2, yearName: 'Year II', label: 'Semester 3', tag: 'Year II - Odd' },
    { sem: 4, year: 2, yearName: 'Year II', label: 'Semester 4', tag: 'Year II - Even' },
    { sem: 5, year: 3, yearName: 'Year III', label: 'Semester 5', tag: 'Year III - Odd' },
    { sem: 6, year: 3, yearName: 'Year III', label: 'Semester 6', tag: 'Year III - Even' },
    { sem: 7, year: 4, yearName: 'Year IV', label: 'Semester 7', tag: 'Year IV - Odd' },
    { sem: 8, year: 4, yearName: 'Year IV', label: 'Semester 8', tag: 'Final Year - Capstone' },
  ]

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesYear = yearFilter === 'ALL' || student.year === Number(yearFilter)
    const matchesSem = semFilter === 'ALL' || student.semester === Number(semFilter)
    const matchesSection = sectionFilter === 'ALL' || student.section.toUpperCase() === sectionFilter.toUpperCase()
    const matchesStatus =
      statusFilter === 'ALL' || student.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesBatch =
      batchFilter === 'ALL' ||
      student.batch === batchFilter ||
      (student.batch ? student.batch.includes(batchFilter) : false)

    return matchesSearch && matchesYear && matchesSem && matchesSection && matchesStatus && matchesBatch
  }).sort((a, b) => a.registerNumber.localeCompare(b.registerNumber, undefined, { numeric: true }))

  const getSemCount = (semNumber: number) => {
    return students.filter((s) => s.semester === semNumber).length
  }

  const handleExportPDF = () => {
    generateAndDownloadPDF({
      title: 'DEPARTMENT OF AI & DS — OFFICIAL STUDENT ROSTER',
      subtitle: `V.S.B. Engineering College · Master Student Directory (${students.length} Registered Candidates)`,
      author: 'Department Directorate',
      category: 'Official Student Directory',
      sections: [
        {
          heading: '1. ENROLLMENT OVERVIEW',
          statsGrid: [
            { label: 'Total Enrolled', value: `${students.length}`, badgeColor: 'blue' },
            { label: 'Active Cadre', value: `${students.filter((s) => s.status.toLowerCase() === 'active').length}`, badgeColor: 'emerald' },
            { label: 'Day Scholars', value: `${students.filter((s) => !s.residencyStatus || s.residencyStatus.toLowerCase().includes('day')).length}`, badgeColor: 'cyan' },
            { label: 'Hostellers', value: `${students.filter((s) => s.residencyStatus?.toLowerCase().includes('hostel')).length}`, badgeColor: 'gold' },
          ],
          body: [
            `Total Candidates Enrolled: ${students.length}`,
            `Department: Artificial Intelligence & Data Science`,
            `Active Cadre: ${students.filter((s) => s.status.toLowerCase() === 'active').length}`,
            `Day Scholars: ${students.filter((s) => !s.residencyStatus || s.residencyStatus.toLowerCase().includes('day')).length}`,
            `Hostellers: ${students.filter((s) => s.residencyStatus?.toLowerCase().includes('hostel')).length}`,
          ],
        },
        {
          heading: '2. ENROLLED STUDENTS BATCH ROSTER',
          table: {
            headers: ['#', 'REGISTER NO', 'STUDENT NAME', 'COHORT / CLASS', 'CONTACT DETAILS', 'STATUS'],
            rows: students.map((s, idx) => [
              String(idx + 1),
              s.registerNumber,
              s.name,
              `Yr ${s.year} · Sem ${s.semester} · Sec ${s.section}`,
              s.phone || s.email || 'N/A',
              {
                text: s.status.toUpperCase(),
                badge: true,
                badgeType: s.status.toLowerCase() === 'active' ? 'success' : 'danger'
              }
            ]),
            widths: [8, 28, 50, 32, 42, 26],
            alignments: ['center', 'left', 'left', 'center', 'left', 'center']
          },
          body: students.map(
            (s, idx) =>
              `${idx + 1}. [${s.registerNumber}] ${s.name} — Year ${s.year}, Sem ${s.semester}, Sec ${s.section} · Contact: ${s.phone || s.email || 'N/A'} · Status: ${s.status.toUpperCase()}`
          ),
        },
      ],
      fileName: 'VSB_AI_DS_Student_Roster_2026',
    })
  }

  // Handle Add Student Submit with Real Database Save
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddFormError(null)

    if (!formData.registerNumber.trim() || !formData.name.trim() || !formData.password.trim()) {
      setAddFormError('Please fill in Register Number, Full Name, and Temporary Password.')
      return
    }

    setIsLoading(true)
    try {
      let cleanDob = formData.dateOfBirth ? formData.dateOfBirth.trim() : ''
      if (cleanDob.includes('-')) {
        const parts = cleanDob.replace(/^\+/, '').split('-')
        if (parts[0] && parts[0].length > 4) {
          parts[0] = parts[0].slice(-4)
          cleanDob = parts.join('-')
        }
      }

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          parentPhone: ((formData as any).parentPhone || '').trim() || undefined,
          dateOfBirth: cleanDob || undefined,
        }),
      })
      const result = await res.json()

      if (result.success && result.student) {
        setStudents([result.student, ...students])
        fetchStudents()
        setIsAddModalOpen(false)
        setAddFormError(null)
        setFormData({
          registerNumber: '',
          name: '',
          email: '',
          password: '',
          phone: '',
          parentPhone: '',
          dateOfBirth: '',
          year: 1,
          semester: 1,
          batch: '',
          section: 'A',
          advisorName: '',
          status: 'active',
          bloodGroup: '',
          residencyStatus: '',
          busNo: '',
          boardingPoint: '',
          busDetails: '',
          hostelBlock: '',
          roomNo: '',
          address: '',
          cgpa: '',
          attendance: '',
        })
        toast.success(result.message || 'Student registered successfully in database!')
      } else {
        const message = result.message || 'Failed to register student candidate.'
        setAddFormError(message)
        toast.error(message, { duration: 6000 })
      }
    } catch (err) {
      console.error(err)
      const errorMsg = 'Database connection timed out or is temporarily busy. Please try submitting again.'
      setAddFormError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Edit Student Submit with Real Database Save & 0ms Optimistic Feedback
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    setEditFormError(null)

    let cleanDob = formData.dateOfBirth ? formData.dateOfBirth.trim() : ''
    if (cleanDob.includes('-')) {
      const parts = cleanDob.replace(/^\+/, '').split('-')
      if (parts[0] && parts[0].length > 4) {
        parts[0] = parts[0].slice(-4)
        cleanDob = parts.join('-')
      }
    }

    const previousStudents = [...students]
    const isHostelForm = (formData.residencyStatus || '').toLowerCase().includes('hostel')
    const isDayForm = (formData.residencyStatus || '').toLowerCase().includes('day scholar')
    const optimisticUpdated: StudentRecord = {
      ...selectedStudent,
      registerNumber: formData.registerNumber,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      parentPhone: formData.parentPhone,
      dateOfBirth: formData.dateOfBirth,
      year: Number(formData.year),
      semester: Number(formData.semester),
      batch: formData.batch,
      section: formData.section,
      advisorName: formData.advisorName,
      status: formData.status,
      bloodGroup: formData.bloodGroup || null,
      residencyStatus: formData.residencyStatus || null,
      busNo: isHostelForm ? null : (formData.busNo || null),
      boardingPoint: isHostelForm ? null : (formData.boardingPoint || null),
      busDetails: isHostelForm ? null : (formData.busDetails || null),
      hostelBlock: isDayForm ? null : (formData.hostelBlock || null),
      roomNo: isDayForm ? null : (formData.roomNo || null),
      address: formData.address || null,
      cgpa: formData.cgpa ? String(formData.cgpa) : null,
      attendance: formData.attendance ? String(formData.attendance) : null,
    }

    // Instant 0ms visual feedback
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id || s.registerNumber === selectedStudent.registerNumber
          ? optimisticUpdated
          : s
      )
    )
    setIsEditModalOpen(false)

    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedStudent.id,
          ...formData,
          password: formData.password?.trim() ? formData.password.trim() : undefined,
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          parentPhone: ((formData as any).parentPhone || '').trim() || undefined,
          busNo: isHostelForm ? null : (formData.busNo || null),
          boardingPoint: isHostelForm ? null : (formData.boardingPoint || null),
          busDetails: isHostelForm ? null : (formData.busDetails || null),
          hostelBlock: isDayForm ? null : (formData.hostelBlock || null),
          roomNo: isDayForm ? null : (formData.roomNo || null),
          dateOfBirth: cleanDob || undefined,
        }),
      })
      const result = await res.json()

      if (result.success) {
        const serverUpdated = result.student
        if (serverUpdated) {
          setStudents((prev) =>
            prev.map((s) =>
              s.id === selectedStudent.id || s.registerNumber === selectedStudent.registerNumber
                ? { ...s, ...serverUpdated }
                : s
            )
          )
        }
        toast.success(result.message || 'Student record updated in database!')
      } else {
        // Revert on error
        setStudents(previousStudents)
        setIsEditModalOpen(true)
        const message = result.message || 'Failed to update student record.'
        setEditFormError(message)
        toast.error(message, { duration: 6000 })
      }
    } catch (err) {
      console.error(err)
      setStudents(previousStudents)
      setIsEditModalOpen(true)
      const errorMsg = 'Network error updating student. Please try again.'
      setEditFormError(errorMsg)
      toast.error(errorMsg)
    }
  }

  // Handle Delete with Real Database Delete
  const handleDelete = async (id: string, name: string, registerNumber?: string) => {
    if (!confirm(`Are you sure you want to permanently delete student "${name}" (${registerNumber || id}) from the database?`)) {
      return
    }

    try {
      // Optimistically remove from state for instant 0ms UI feedback
      setStudents((prev) => prev.filter((s) => s.id !== id && (registerNumber ? s.registerNumber !== registerNumber : true)))

      const deleteKey = id || registerNumber || ''
      const res = await fetch(`/api/students?id=${encodeURIComponent(deleteKey)}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        playNotificationChime()
        toast.success(`"${name}" permanently removed from database.`)
      } else {
        // Rollback on failure
        toast.error(result.message || 'Failed to delete student')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting student record.')
    }
  }

  const openEditModal = (s: StudentRecord) => {
    const isPlaceholder = !s.email || s.email.endsWith('@vsb.student.edu') || s.email.endsWith('@student.vsb.edu.in') || (s.registerNumber && s.email.toLowerCase().startsWith(s.registerNumber.toLowerCase()))
    const cleanEmail = isPlaceholder ? '' : s.email
    setSelectedStudent(s)
    const isHostel = (s.residencyStatus || '').toLowerCase().includes('hostel')
    const isDay = (s.residencyStatus || '').toLowerCase().includes('day scholar') || (s.residencyStatus || '').toLowerCase().includes('dayscholar')
    setFormData({
      registerNumber: s.registerNumber || '',
      name: s.name || '',
      email: cleanEmail,
      phone: s.phone || '',
      parentPhone: s.parentPhone || '',
      dateOfBirth: s.dateOfBirth || '',
      bloodGroup: s.bloodGroup || '',
      residencyStatus: s.residencyStatus || '',
      busNo: isHostel ? '' : (s.busNo || ''),
      boardingPoint: isHostel ? '' : (s.boardingPoint || ''),
      busDetails: isHostel ? '' : (s.busDetails || ''),
      hostelBlock: isDay ? '' : (s.hostelBlock || ''),
      roomNo: isDay ? '' : (s.roomNo || ''),
      address: s.address || '',
      year: s.year || 1,
      semester: s.semester || 1,
      batch: s.batch || getDefaultBatchForYear(s.year || 1),
      section: s.section || 'A',
      advisorName: s.advisorName || '',
      status: s.status || 'active',
      cgpa: s.cgpa || '',
      attendance: s.attendance || '',
      password: '',
    })
    setShowEditPassword(false)
    setEditFormError(null)
    setIsEditModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Student Records Administration
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Student Enrollment &amp; Directory</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {students.length > 0
              ? `Real-time management of ${students.length} enrolled student records`
              : 'Directory is ready for real student entries'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={() => setIsBatchSyncModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/20 shadow-sm cursor-pointer hover:scale-105"
            title="Standardize and auto-update student batches year-wise"
          >
            <RotateCcw className="w-4 h-4 text-cyan-300" /> Auto-Sync Batches
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/20 shadow-sm cursor-pointer hover:scale-105"
          >
            <Download className="w-4 h-4 text-[#F4C430]" /> Download Student List (PDF)
          </button>
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-105"
            title="Bulk import students via CSV, Excel, or copy-paste table"
          >
            <UploadCloud className="w-4 h-4 text-white" /> Bulk Import
          </button>
          <button
            onClick={() => {
              const defaultYear = yearFilter !== 'ALL' ? Number(yearFilter) : 1
              const defaultSem = semFilter !== 'ALL' ? Number(semFilter) : ((defaultYear - 1) * 2 + 1)
              const defaultBatch = getDefaultBatchForYear(defaultYear)
              setFormData({
                registerNumber: '',
                name: '',
                email: '',
                password: '',
                phone: '',
                parentPhone: '',
                dateOfBirth: '',
                bloodGroup: '',
                residencyStatus: '',
                busNo: '',
                boardingPoint: '',
                busDetails: '',
                hostelBlock: '',
                roomNo: '',
                address: '',
                year: defaultYear,
                semester: defaultSem,
                batch: defaultBatch,
                section: sectionFilter !== 'ALL' ? sectionFilter : 'A',
                advisorName: '',
                status: 'active',
                cgpa: '',
                attendance: '',
              })
              setAddFormError(null)
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-[#F4C430] hover:bg-[#e0b224] text-[#071A3D] text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4 text-[#071A3D]" /> + Add Student
          </button>
        </div>
      </div>

      {/* Primary Top Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveMainTab('directory')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeMainTab === 'directory'
              ? 'bg-[#071A3D] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Enrolled Directory ({students.length})
        </button>

        <button
          onClick={() => setActiveMainTab('requests')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeMainTab === 'requests'
              ? 'bg-[#1455D9] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Profile Edit &amp; Permission Requests
          {profileRequests.filter((r) => r.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F4C430] text-[#071A3D] animate-pulse">
              {profileRequests.filter((r) => r.status === 'pending').length} Pending
            </span>
          )}
        </button>
      </div>

      {activeMainTab === 'directory' && (
        <div className="space-y-6">
          {/* Two-Step Hierarchical Year -> Semester Academic Navigation */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
            {/* STEP 1: Select Academic Year */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1455D9] text-white text-[11px] font-black flex items-center justify-center">1</span>
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                    Step 1: Choose Academic Year
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-gray-500">
                  {yearFilter === 'ALL' ? 'Browsing across all 4 Academic Years' : `Selected: Year ${yearFilter}`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <button
                  onClick={() => {
                    setYearFilter('ALL')
                    setSemFilter('ALL')
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    yearFilter === 'ALL'
                      ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-md ring-2 ring-[#071A3D]/30'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase block opacity-80">All 4 Years</span>
                  <p className="text-xs font-black mt-0.5">All Years</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-1 inline-block ${
                    yearFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {students.length} Total
                  </span>
                </button>

                {ACADEMIC_COHORTS.map((y) => {
                  const isSelected = yearFilter === String(y.year)
                  const yCount = students.filter((s) => s.year === y.year).length
                  return (
                    <button
                      key={y.year}
                      onClick={() => {
                        setYearFilter(String(y.year))
                        setSemFilter('ALL')
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-md ring-2 ring-[#1455D9]/30'
                          : 'bg-white hover:bg-blue-50/50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="text-[10px] font-extrabold uppercase block opacity-80">{y.yearName}</span>
                      <p className="text-xs font-black mt-0.5">{y.year === 1 ? '1st Year' : y.year === 2 ? '2nd Year' : y.year === 3 ? '3rd Year' : '4th Year'}</p>
                      <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-blue-50 text-[#1455D9] border border-blue-200'
                        }`}>
                          {y.batch}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {yCount}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* STEP 2: Choose Semester within Selected Year */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#F4C430] text-[#071A3D] text-[11px] font-black flex items-center justify-center">2</span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                    Step 2: Choose Semester {yearFilter !== 'ALL' ? `(Year ${yearFilter})` : '(All 8 Semesters)'}
                  </h3>
                </div>
                {semFilter !== 'ALL' && (
                  <button
                    onClick={() => setSemFilter('ALL')}
                    className="text-[11px] font-bold text-[#1455D9] hover:underline cursor-pointer"
                  >
                    Clear Semester Filter
                  </button>
                )}
              </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSemFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                semFilter === 'ALL'
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {yearFilter === 'ALL' ? 'All 8 Semesters' : `All Semesters in Year ${yearFilter}`}
            </button>

            {allSemesters
              .filter((s) => yearFilter === 'ALL' || s.year === Number(yearFilter))
              .map((s) => {
                const count = getSemCount(s.sem)
                const isSelected = semFilter === String(s.sem)
                return (
                  <button
                    key={s.sem}
                    onClick={() => {
                      if (isSelected) {
                        setSemFilter('ALL')
                      } else {
                        setSemFilter(String(s.sem))
                        setYearFilter(String(s.year))
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-sm ring-2 ring-[#071A3D]/20'
                        : 'bg-white hover:bg-blue-50 border-gray-200 text-[#071A3D]'
                    }`}
                  >
                    <span>{s.label} ({s.yearName})</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-[#F4C430] text-[#071A3D]' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Enrolled</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{students.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">4 Years · 8 Semesters</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Status</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <p className="text-2xl font-black text-emerald-700">
              {students.filter((s) => s.status.toLowerCase() === 'active').length}
            </p>
            <span className="text-xs text-gray-400 font-bold">/ {students.length}</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">
            {students.filter((s) => s.status.toLowerCase() === 'active').length} Logged In · {students.filter((s) => s.status.toLowerCase() !== 'active').length} Inactive
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Filter</p>
          <p className="text-lg font-black text-purple-700 mt-0.5">
            {yearFilter === 'ALL' && semFilter === 'ALL'
              ? 'All Years & Sems'
              : semFilter !== 'ALL'
                ? `Sem ${semFilter} (Year ${Math.ceil(Number(semFilter) / 2)})`
                : `Year ${yearFilter} (All Sems)`}
          </p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">
            Matching {filteredStudents.length} Students
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Department</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">B.Tech AI &amp; DS</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">Anna University · Reg 2021</p>
        </div>
      </div>

      {/* AI Student Advisor & Natural Language Query Agent */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0E2C66] to-[#1455D9] rounded-2xl p-4 text-white shadow-md border border-blue-400/20 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Bot className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs sm:text-sm text-white">AI Student Advisor & Intelligence Agent</h3>
                <span className="px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 text-[9px] font-bold">
                  Live Agent
                </span>
              </div>
              <p className="text-[11px] text-cyan-100/70">
                Natural language query & instant analytics across student database
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAiAgent(!showAiAgent)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-200 text-xs font-bold border border-white/20 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{showAiAgent ? 'Collapse Agent' : 'Open Query Console'}</span>
          </button>
        </div>

        {showAiAgent && (
          <div className="pt-2 border-t border-white/10 space-y-3 animate-in fade-in-50 duration-200">
            {/* Quick Action Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-cyan-200 mr-1">Quick Insights:</span>
              {[
                { l: '🎂 Today & Tomorrow Birthdays', q: 'Show students with birthdays today or tomorrow' },
                { l: '⚠️ Low Attendance (<75%)', q: 'Show students with low attendance below 75' },
                { l: '🏆 Top CGPA Rankers', q: 'Top highest cgpa students' },
                { l: '🚌 Day Scholars vs Hostellers', q: 'How many students are day scholars vs hostellers?' },
                { l: '📧 Parent Notification Draft', q: 'Draft an official SMS/Email notice for students with attendance shortage' },
              ].map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAiQueryInput(chip.q)
                    handleRunAiAgent(chip.q)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-cyan-400 hover:text-[#071A3D] text-[10px] font-semibold text-white/90 border border-white/20 transition-colors cursor-pointer"
                >
                  {chip.l}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask anything about students (e.g. 'Students in Sec A with high CGPA', 'Find student 922522AD001')..."
                value={aiQueryInput}
                onChange={(e) => setAiQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAiAgent()}
                className="flex-1 bg-[#051330] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleRunAiAgent()}
                disabled={isAiQuerying || !aiQueryInput.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-[#071A3D] font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                {isAiQuerying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#071A3D] border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask Agent</span>
                  </>
                )}
              </button>
            </div>

            {/* Agent Output Response */}
            {aiAgentResponse && (
              <div className="p-3.5 rounded-xl bg-white text-slate-900 border border-white shadow-sm space-y-2 animate-in fade-in-50 duration-150">
                <div className="flex items-center justify-between text-xs font-bold text-[#071A3D] border-b border-gray-100 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span>Agent Intelligence Report</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiAgentResponse)
                      toast.success('Agent report copied!')
                    }}
                    className="text-gray-400 hover:text-blue-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                  {aiAgentResponse}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Birthday Panel - Today & Tomorrow */}
      {(todayBirthdays.length > 0 || tomorrowBirthdays.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-sm">
                <Cake className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#071A3D]">&#x1F382; Birthday Celebrations</h3>
                <p className="text-[10px] text-gray-400 font-medium">
                  {todayBirthdays.length} today &middot; {tomorrowBirthdays.length} tomorrow
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {(['ALL', 'TODAY', 'TOMORROW'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setBirthdayFilter(f)}
                  className={cn(
                    'px-3 py-1 rounded-xl text-[11px] font-black border transition-colors cursor-pointer',
                    birthdayFilter === f
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300 hover:text-rose-600'
                  )}
                >
                  {f === 'ALL'
                    ? 'Show All'
                    : f === 'TODAY'
                    ? 'Today (' + todayBirthdays.length + ')'
                    : 'Tomorrow (' + tomorrowBirthdays.length + ')'}
                </button>
              ))}
            </div>
          </div>
          {(birthdayFilter === 'ALL' || birthdayFilter === 'TODAY') && todayBirthdays.length > 0 && (
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <PartyPopper className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-black text-rose-700 uppercase tracking-wide">Today's Birthdays &#x1F389;</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {todayBirthdays.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 bg-white border border-rose-200 rounded-xl px-3 py-2 shadow-xs hover:shadow-sm transition-shadow">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-black text-xs shrink-0 overflow-hidden">
                      {s.profileImage ? (
                        <img src={s.profileImage} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        s.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#071A3D] leading-tight">{s.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        <>
                          {s.registerNumber}
                          {(s as any).turningAge ? <> &middot; Age {(s as any).turningAge}</> : null}
                        </>
                      </p>
                    </div>
                    {(s.phone || s.parentPhone) && (
                      <button type="button" onClick={() => handleSendBirthdayWish(s, false)} title="Send WhatsApp Birthday Wish"
                        className="ml-1 p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors cursor-pointer">
                        <span className="text-[13px]">&#x1F4AC;</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {(birthdayFilter === 'ALL' || birthdayFilter === 'TOMORROW') && tomorrowBirthdays.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black text-amber-700 uppercase tracking-wide">Tomorrow's Birthdays &#x1F381;</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {tomorrowBirthdays.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2 shadow-xs hover:shadow-sm transition-shadow">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-black text-xs shrink-0 overflow-hidden">
                      {s.profileImage ? (
                        <img src={s.profileImage} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        s.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#071A3D] leading-tight">{s.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        <>
                          {s.registerNumber}
                          {(s as any).turningAge ? <> &middot; Age {(s as any).turningAge}</> : null}
                        </>
                      </p>
                    </div>
                    {(s.phone || s.parentPhone) && (
                      <button type="button" onClick={() => handleSendBirthdayWish(s, true)} title="Send Advance Birthday Wish"
                        className="ml-1 p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors cursor-pointer">
                        <span className="text-[13px]">&#x1F4AC;</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, reg no, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Batch Cohort Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Batch:</span>
            <select
              value={batchFilter}
              onChange={(e) => {
                const val = e.target.value
                setBatchFilter(val)
                if (val !== 'ALL') {
                  const y = getYearFromBatch(val)
                  if (y) {
                    setYearFilter(String(y))
                    setSemFilter('ALL')
                  }
                }
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Cohort Batches</option>
              <option value="2026-2030">2026-2030 (1st Year)</option>
              <option value="2025-2029">2025-2029 (2nd Year)</option>
              <option value="2024-2028">2024-2028 (3rd Year)</option>
              <option value="2023-2027">2023-2027 (4th Year)</option>
            </select>
          </div>

          {/* Step 1: Academic Year Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Year:</span>
            <select
              value={yearFilter}
              onChange={(e) => {
                const val = e.target.value
                setYearFilter(val)
                setSemFilter('ALL')
                if (val !== 'ALL') {
                  setBatchFilter(getDefaultBatchForYear(Number(val)))
                } else {
                  setBatchFilter('ALL')
                }
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Years (I - IV)</option>
              <option value="1">Year I · 2026-2030</option>
              <option value="2">Year II · 2025-2029</option>
              <option value="3">Year III · 2024-2028</option>
              <option value="4">Year IV · 2023-2027</option>
            </select>
          </div>

          {/* Step 2: Cascading Semester Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Semester:</span>
            <select
              value={semFilter}
              onChange={(e) => {
                const val = e.target.value
                setSemFilter(val)
                if (val !== 'ALL') {
                  setYearFilter(String(Math.ceil(Number(val) / 2)))
                }
              }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#1455D9] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">
                {yearFilter === 'ALL' ? 'All 8 Semesters' : `All Sems in Year ${yearFilter}`}
              </option>
              {allSemesters
                .filter((s) => yearFilter === 'ALL' || s.year === Number(yearFilter))
                .map((s) => (
                  <option key={s.sem} value={s.sem}>
                    {s.label} ({s.yearName})
                  </option>
                ))}
            </select>
          </div>

          {/* Step 3: Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Section:</span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All 4 Sections (A - D)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active (Logged In)</option>
              <option value="inactive">Inactive (Not Logged In)</option>
            </select>
          </div>

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
            Showing {filteredStudents.length} of {students.length}
          </span>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer',
                viewMode === 'cards'
                  ? 'bg-white text-[#1455D9] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
              title="Mobile Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white text-[#1455D9] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
              title="Desktop Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Students Data Display: Cards or Table / Empty State */}
      {students.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
          <GraduationCap className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#071A3D] mb-1">No Students Enrolled in This Cohort</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            There are currently no student records matching the selected filters. Click below to register a new student candidate directly into the database.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" /> + Register Student Candidate
            </button>
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
            >
              <UploadCloud className="w-4 h-4" /> Bulk Import Roster
            </button>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center text-gray-400">
          No matching student records found for the selected filters.
        </div>
      ) : viewMode === 'cards' ? (
        /* Mobile & Tablet Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredStudents.map((s, idx) => (
            <Card
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {/* Card Top: Avatar, Name, Reg Number, Status */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0 overflow-hidden">
                      {s.profileImage ? (
                        <img src={s.profileImage} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        s.name.charAt(0) || 'S'
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[#071A3D] text-sm truncate leading-snug">
                        {s.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs font-black text-[#1455D9]">
                          {s.registerNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyReg(s.registerNumber)}
                          className="p-1 rounded-md text-gray-400 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Copy Register Number"
                        >
                          {copiedReg === s.registerNumber ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 tracking-wide inline-flex items-center gap-1',
                      s.status.toLowerCase() === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full', s.status.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
                    {s.status.toLowerCase() === 'active' ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {/* Cohort Badges: Year, Sem, Section, Batch */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200">
                    Yr {s.year} / Sem {s.semester}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#1455D9] font-bold border border-blue-200">
                    Sec {s.section}
                  </span>
                  {s.batch && (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      {s.batch}
                    </span>
                  )}
                  {s.cgpa && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 font-bold border border-amber-200 font-mono">
                      CGPA {s.cgpa}
                    </span>
                  )}
                  {(() => {
                    const bd = getBirthdayStatus(s.dateOfBirth)
                    if (bd === 'today') return (<span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 font-bold border border-rose-300 flex items-center gap-1"><Cake className="w-3 h-3" /> Birthday!</span>)
                    if (bd === 'tomorrow') return (<span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700 font-bold border border-amber-300 flex items-center gap-1"><Gift className="w-3 h-3" /> Tomorrow</span>)
                    return null
                  })()}
                </div>

                {/* Class Advisor Highlight */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between gap-2">
                  <span className="text-gray-500 text-[11px] font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#1455D9]" />
                    Advisor:
                  </span>
                  <span className="font-bold text-[#071A3D] truncate text-[11.5px]">
                    {s.advisorName || 'Not Assigned'}
                  </span>
                </div>

                {/* Residency / Transit Details */}
                {s.residencyStatus && (
                  <div className="text-[11px] text-gray-600 flex items-center gap-1.5 px-1">
                    {s.residencyStatus.toLowerCase().includes('hostel') || s.hostelBlock ? (
                      <span className="flex items-center gap-1 text-amber-800 font-medium">
                        <Building className="w-3.5 h-3.5 text-amber-600" />
                        {s.hostelBlock ? `Block ${s.hostelBlock}${s.roomNo ? ` · Rm ${s.roomNo}` : ''}` : 'Campus Hostel'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-700 font-medium truncate">
                        <Bus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {s.busNo ? `Bus ${s.busNo.replace(/^#\s*/, '')}${s.boardingPoint ? ` (${s.boardingPoint})` : ''}` : (s.boardingPoint || 'Day Scholar')}
                      </span>
                    )}
                  </div>
                )}

                {/* Direct Contact Links */}
                <div className="pt-2 border-t border-gray-100 flex flex-col gap-1 text-xs text-gray-600">
                  {s.phone && (
                    <a
                      href={`tel:${s.phone}`}
                      className="flex items-center gap-2 text-slate-700 hover:text-[#1455D9] transition-colors py-0.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono font-semibold text-[11px]">{s.phone}</span>
                      <span className="text-[10px] text-gray-400 font-normal">(Student)</span>
                    </a>
                  )}
                  {s.parentPhone && (
                    <a
                      href={`tel:${s.parentPhone}`}
                      className="flex items-center gap-2 text-slate-700 hover:text-[#1455D9] transition-colors py-0.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-mono font-semibold text-[11px]">{s.parentPhone}</span>
                      <span className="text-[10px] text-gray-400 font-normal">(Parent)</span>
                    </a>
                  )}
                  {s.email && !s.email.endsWith('@vsb.student.edu') && !s.email.endsWith('@student.vsb.edu.in') && (
                    <a
                      href={`mailto:${s.email}`}
                      className="flex items-center gap-2 text-slate-700 hover:text-[#1455D9] transition-colors py-0.5 truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate text-[11px] font-medium">{s.email}</span>
                    </a>
                  )}
                </div>

                {/* Touch Action Buttons Row */}
                <div className="pt-2 border-t border-gray-100 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(s)
                      setIsViewModalOpen(true)
                    }}
                    className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-[#071A3D] hover:text-[#1455D9] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(s)}
                    className="py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id, s.name, s.registerNumber)}
                    className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Desktop Table View — Executive Consolidated Admin View with Sticky Header */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[75vh] overflow-y-auto scrollbar-thin">
            <table className="w-full min-w-[1150px] text-left text-xs border-collapse">
              <thead className="sticky top-0 z-20 bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider shadow-xs">
                <tr>
                  <th className="py-3.5 px-3 text-center w-12 whitespace-nowrap">#</th>
                  <th className="py-3.5 px-3 text-left w-52 whitespace-nowrap">Student Candidate</th>
                  <th className="py-3.5 px-3 text-left w-48 whitespace-nowrap">Class &amp; Advisor</th>
                  <th className="py-3.5 px-3 text-left w-36 whitespace-nowrap">Batch &amp; Bio</th>
                  <th className="py-3.5 px-3 text-left w-52 whitespace-nowrap">Contact Details</th>
                  <th className="py-3.5 px-3 text-left w-48 whitespace-nowrap">Residency / Transit</th>
                  <th className="py-3.5 px-3 text-center w-28 whitespace-nowrap">Standing</th>
                  <th className="py-3.5 px-3 text-center w-24 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-3 text-center w-28 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">
                      No matching student records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-blue-50/40 transition-colors group">
                      {/* # */}
                      <td className="py-3.5 px-3 text-gray-400 font-mono text-[11px] text-center whitespace-nowrap">
                        {idx + 1}
                      </td>

                      {/* Student Candidate: Avatar + Name + Reg No */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden">
                            {s.profileImage ? (
                              <img src={s.profileImage} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              s.name.charAt(0) || 'S'
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#071A3D] text-xs block truncate max-w-[180px]" title={s.name}>
                              {s.name}
                            </span>
                            <div className="flex items-center gap-1 font-mono text-[11px] text-[#1455D9] font-bold">
                              <span>{s.registerNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyReg(s.registerNumber)}
                                className="p-0.5 rounded text-gray-300 hover:text-[#1455D9] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                title="Copy Register Number"
                              >
                                {copiedReg === s.registerNumber ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class & Advisor */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1455D9] font-bold text-[11px] border border-blue-100 whitespace-nowrap inline-block">
                            {s.year === 2 ? 'II' : s.year === 3 ? 'III' : 'IV'} AIDS {s.section} · Sem {s.semester}
                          </span>
                          <p className="text-[10.5px] text-gray-500 mt-1 truncate max-w-[170px]" title={s.advisorName || 'Unassigned'}>
                            Adv: <span className="font-semibold text-gray-700">{s.advisorName || 'Unassigned'}</span>
                          </p>
                        </div>
                      </td>

                      {/* Batch & Bio */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div>
                          {s.batch ? (
                            <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap inline-block">
                              {s.batch}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px]">—</span>
                          )}
                          <p className="text-[10px] text-gray-400 font-mono mt-1">
                            {s.dateOfBirth && s.dateOfBirth !== '2004-01-01' ? (
                              <>{s.dateOfBirth}{s.bloodGroup ? ` · ${s.bloodGroup}` : ''}</>
                            ) : s.bloodGroup ? (
                              <>{s.bloodGroup}</>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </p>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 text-[10.5px]">
                          {s.email && !s.email.endsWith('@vsb.student.edu') && !s.email.endsWith('@student.vsb.edu.in') ? (
                            <a
                              href={`mailto:${s.email}`}
                              className="text-[#1455D9] font-medium whitespace-nowrap hover:underline block truncate max-w-[190px]"
                              title={s.email}
                            >
                              ✉ {s.email}
                            </a>
                          ) : (
                            <span className="text-gray-400 italic text-[9.5px]">✉ Not registered</span>
                          )}
                          <div className="flex items-center gap-1.5 text-gray-600 font-mono">
                            {s.phone ? (
                              <span title={`Student: ${s.phone}`}>📱 {s.phone}</span>
                            ) : s.parentPhone ? (
                              <span className="text-gray-500" title={`Parent: ${s.parentPhone}`}>👨‍👩‍👧 {s.parentPhone}</span>
                            ) : (
                              <span className="text-gray-300 italic">—</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Residency & Transport */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {s.residencyStatus ? (
                          <div className="flex flex-col gap-0.5 text-[10px]">
                            <span
                              className={`font-bold px-1.5 py-0.5 rounded border whitespace-nowrap inline-flex items-center gap-1 w-fit ${
                                s.residencyStatus.toLowerCase().includes('hostel') || s.hostelBlock
                                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                                  : 'text-blue-700 bg-blue-50 border-blue-200'
                              }`}
                            >
                              {s.residencyStatus.toLowerCase().includes('hostel') || s.hostelBlock ? (
                                <>🏢 {s.hostelBlock ? `Blk ${s.hostelBlock.replace(/^block\s*/i, '')}` : 'Hostel'}{s.roomNo ? ` · R${s.roomNo.replace(/^room\s*/i, '')}` : ''}</>
                              ) : (
                                <>🚌 {s.busNo ? `Bus ${s.busNo.replace(/^#\s*/, '')}` : 'Day Scholar'}</>
                              )}
                            </span>
                            {!(s.residencyStatus.toLowerCase().includes('hostel') || s.hostelBlock) && s.boardingPoint && (
                              <span className="text-gray-500 text-[9px] truncate max-w-[160px]" title={s.boardingPoint}>
                                📍 {s.boardingPoint}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-[10px] italic">—</span>
                        )}
                      </td>

                      {/* Standing (CGPA & Attendance) */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-0.5">
                          {s.cgpa ? (
                            <span className="font-mono font-bold text-[10.5px] text-[#071A3D]">
                              CGPA {s.cgpa}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-[10px]">—</span>
                          )}
                          {s.attendance ? (
                            <span
                              className={`font-mono font-bold text-[9.5px] px-1.5 py-0.2 rounded border whitespace-nowrap ${
                                parseFloat(s.attendance) >= 75
                                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                  : 'text-red-800 bg-red-50 border-red-200'
                              }`}
                            >
                              {s.attendance}% Att.
                            </span>
                          ) : (
                            <span className="text-gray-300 text-[9px]">Att: —</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 whitespace-nowrap ${
                            s.status.toLowerCase() === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.status.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {s.status.toLowerCase() === 'active' ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedStudent(s)
                              setIsViewModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="View Student Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.name, s.registerNumber)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )}

      {/* Profile Edit & Permission Requests Dashboard */}
      {activeMainTab === 'requests' && (
        <div className="space-y-5 animate-fade-in">
          {/* Sub-Filter Bar for Requests */}
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setRequestFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  requestFilter === 'ALL'
                    ? 'bg-[#071A3D] text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                All Requests ({profileRequests.length})
              </button>
              <button
                onClick={() => setRequestFilter('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  requestFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Pending Review ({profileRequests.filter((r) => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setRequestFilter('approved')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  requestFilter === 'approved'
                    ? 'bg-green-600 text-white shadow-xs'
                    : 'bg-green-50 hover:bg-green-100 text-green-800 border border-green-200'
                }`}
              >
                <Check className="w-3.5 h-3.5" /> Approved ({profileRequests.filter((r) => r.status === 'approved').length})
              </button>
              <button
                onClick={() => setRequestFilter('rejected')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  requestFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" /> Declined ({profileRequests.filter((r) => r.status === 'rejected').length})
              </button>
            </div>

            <button
              onClick={fetchProfileRequests}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#071A3D] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Refresh Requests
            </button>
          </div>

          {/* Requests List */}
          {profileRequests.filter((r) => requestFilter === 'ALL' || r.status === requestFilter).length === 0 ? (
            <Card className="rounded-3xl border-gray-200 shadow-sm">
              <CardContent className="p-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1455D9] flex items-center justify-center mx-auto mb-2">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-black text-[#071A3D] text-base">No Profile Permission Requests</h3>
                <p className="text-xs text-gray-500">
                  {requestFilter === 'pending'
                    ? 'There are currently no pending student edit requests awaiting your review.'
                    : 'No requests match the selected filter status.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {profileRequests
                .filter((r) => requestFilter === 'ALL' || r.status === requestFilter)
                .map((req) => {
                  const reqData = req.requestedData || {}
                  const currData = req.currentData || {}
                  const isPending = req.status === 'pending'
                  const isProcessing = processingRequestId === req.id

                  return (
                    <Card
                      key={req.id}
                      className={`rounded-3xl border transition-all ${
                        isPending
                          ? 'border-amber-300 bg-amber-50/20 shadow-md'
                          : req.status === 'approved'
                          ? 'border-green-200 bg-white shadow-xs'
                          : 'border-gray-200 bg-gray-50/60 opacity-80'
                      }`}
                    >
                      <CardContent className="p-6 space-y-4">
                        {/* Request Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-white font-black text-base flex items-center justify-center shadow-xs">
                              {req.studentName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-black text-sm text-[#071A3D]">{req.studentName}</h3>
                                <span className="font-mono text-xs font-bold text-[#1455D9] px-2 py-0.2 rounded-md bg-blue-50 border border-blue-200">
                                  {req.registerNumber}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Requested on {new Date(req.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                  : req.status === 'approved'
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}
                            >
                              {req.status === 'pending' ? '● Awaiting Admin Decision' : req.status}
                            </span>
                          </div>
                        </div>

                        {/* Reason Callout */}
                        {req.reason && (
                          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950">
                            <span className="font-bold text-[#1455D9]">Student Justification: </span>
                            &ldquo;{req.reason}&rdquo;
                          </div>
                        )}

                        {/* Diff Comparison Table */}
                        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden text-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[480px] text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[11px]">
                                <th className="p-3">Profile Field</th>
                                <th className="p-3">Current / Previous Record</th>
                                <th className="p-3">Requested New Record</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {[
                                { label: 'Full Name', key: 'name' },
                                { label: 'Institutional Email', key: 'email' },
                                { label: 'Contact Phone', key: 'phone' },
                                { label: 'Date of Birth', key: 'dateOfBirth' },
                                { label: 'Blood Group', key: 'bloodGroup' },
                                { label: 'Residency Status', key: 'residencyStatus' },
                                { label: 'Academic Regulation', key: 'regulation' },
                                { label: 'Academic Batch', key: 'batch' },
                                { label: 'Year / Semester / Section', key: 'cohort', custom: `Year ${reqData.year || currData.year} · Sem ${reqData.semester || currData.semester} · Sec ${reqData.section || currData.section}`, prevCustom: `Year ${currData.year} · Sem ${currData.semester} · Sec ${currData.section}` },
                                { label: 'Class Advisor', key: 'advisor' },
                                { label: 'Academic CGPA', key: 'cgpa' },
                                { label: 'Attendance Record', key: 'attendance' },
                                { label: 'Department Rank', key: 'rank' },
                                { label: 'Arrear Status', key: 'arrears' },
                              ]
                                .filter((f) => {
                                  if (f.custom) return f.custom !== f.prevCustom
                                  return reqData[f.key] !== undefined && reqData[f.key] !== currData[f.key]
                                })
                                .map((f) => (
                                  <tr key={f.key} className="hover:bg-blue-50/20">
                                    <td className="p-3 font-bold text-[#071A3D]">{f.label}</td>
                                    <td className="p-3 text-gray-500 font-mono">
                                      {f.prevCustom || currData[f.key] || '—'}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-[#1455D9] bg-blue-50/40">
                                      {f.custom || reqData[f.key]}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          </div>
                        </div>

                        {/* Admin Action Controls */}
                        {isPending ? (
                          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <input
                              type="text"
                              placeholder="Admin review notes (optional, sent to student)..."
                              value={adminNotesMap[req.id] || ''}
                              onChange={(e) =>
                                setAdminNotesMap({ ...adminNotesMap, [req.id]: e.target.value })
                              }
                              className="p-2.5 rounded-xl border border-gray-200 text-xs w-full sm:w-96 focus:outline-none focus:border-[#1455D9]"
                            />

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleReviewRequest(req.id, 'reject')}
                                disabled={isProcessing}
                                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <XCircle className="w-4 h-4" /> Decline
                              </button>
                              <button
                                onClick={() => handleReviewRequest(req.id, 'approve')}
                                disabled={isProcessing}
                                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold cursor-pointer shadow-md transition-all hover:scale-102 disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <Check className="w-4 h-4" /> {isProcessing ? 'Applying...' : 'Approve & Apply to DB'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                            <span>
                              Reviewed by <strong className="text-[#071A3D]">{req.reviewedBy || 'Admin'}</strong> on{' '}
                              {req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : 'N/A'}
                            </span>
                            {req.adminNotes && (
                              <span className="italic text-gray-600">Note: &ldquo;{req.adminNotes}&rdquo;</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD STUDENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Register Real Student Candidate</h3>
                <p className="text-xs text-gray-500">Records will be saved directly into the database</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addFormError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold text-rose-900 block mb-0.5">Registration Notice</span>
                  <span>{addFormError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAddFormError(null)}
                  className="text-rose-400 hover:text-rose-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleAddSubmit} autoComplete="off" className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Register Number *</label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={formData.registerNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, registerNumber: e.target.value.toUpperCase() })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Email <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    autoComplete="off"
                    name="student_email_entry"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#071A3D]">
                      Temporary Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-[#1455D9] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      name="student_password_entry"
                      placeholder="e.g. Student@123 or your choice"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2.5 pr-10 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-[#1455D9] font-mono font-medium text-[#071A3D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#1455D9] transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'View password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    You can decide any password. The student will use this to log in immediately.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Student Phone <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    name="student_phone_entry"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Parent / Guardian Phone <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    name="student_parent_phone_entry"
                    placeholder="e.g. +91 98765 43211"
                    value={(formData as any).parentPhone || ''}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value } as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Year *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => {
                      const newYear = Number(e.target.value)
                      const newSem = getSemesterForYear(newYear, formData.semester)
                      const newBatch = getDefaultBatchForYear(newYear)
                      setFormData({
                        ...formData,
                        year: newYear,
                        semester: newSem,
                        batch: newBatch,
                      })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D]"
                  >
                    <option value={1}>Year 1 (2026-2030)</option>
                    <option value={2}>Year 2 (2025-2029)</option>
                    <option value={3}>Year 3 (2024-2028)</option>
                    <option value={4}>Year 4 (2023-2027)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => {
                      const newSem = Number(e.target.value)
                      const newYear = getYearFromSemester(newSem)
                      const newBatch = getDefaultBatchForYear(newYear)
                      setFormData({
                        ...formData,
                        semester: newSem,
                        year: newYear,
                        batch: newBatch,
                      })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                  >
                    {allSemesters
                      .filter((s) => s.year === formData.year)
                      .map((s) => (
                        <option key={s.sem} value={s.sem}>
                          {s.label} ({s.sem % 2 === 1 ? 'Odd' : 'Even'})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                    <option value="C">Sec C</option>
                    <option value="D">Sec D</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#071A3D]">Batch *</label>
                    <span className="text-[9px] font-bold text-[#1455D9] bg-blue-50 px-1.5 py-0.2 rounded">
                      Auto
                    </span>
                  </div>
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. 2025-2029"
                    value={formData.batch}
                    onChange={(e) => {
                      const val = e.target.value
                      const matchedYear = getYearFromBatch(val)
                      if (matchedYear) {
                        const newSem = getSemesterForYear(matchedYear, formData.semester)
                        setFormData({ ...formData, batch: val, year: matchedYear, semester: newSem })
                      } else {
                        setFormData({ ...formData, batch: val })
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D]"
                  />
                </div>
              </div>

              {/* Quick Batch Selector Chips */}
              <div className="flex items-center gap-1.5 flex-wrap -mt-1 mb-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Default Batches:</span>
                {ACADEMIC_COHORTS.map((c) => (
                  <button
                    key={c.batch}
                    type="button"
                    onClick={() => {
                      const newSem = getSemesterForYear(c.year, formData.semester)
                      setFormData({
                        ...formData,
                        batch: c.batch,
                        year: c.year,
                        semester: newSem,
                      })
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      formData.year === c.year && formData.batch === c.batch
                        ? 'bg-[#1455D9] text-white border-[#1455D9]'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    Yr {c.year}: {c.batch}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Date of Birth <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    autoComplete="off"
                    min="1960-01-01"
                    max="2035-12-31"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Blood Group <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="O +ve">O +ve</option>
                    <option value="O -ve">O -ve</option>
                    <option value="A +ve">A +ve</option>
                    <option value="A -ve">A -ve</option>
                    <option value="B +ve">B +ve</option>
                    <option value="B -ve">B -ve</option>
                    <option value="AB +ve">AB +ve</option>
                    <option value="AB -ve">AB -ve</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">
                  Class Advisor / Mentor Name <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. Dr. S. K. Vijay Anand"
                  value={formData.advisorName}
                  onChange={(e) => setFormData({ ...formData, advisorName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800">
                💡 <strong>Note:</strong> Residency status, hostel/bus details, and address can be filled directly by the student after logging in.
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
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDENT */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Edit Student Record</h3>
                <p className="text-xs text-gray-500">Update student cohort, academic credentials, and details</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editFormError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold text-rose-900 block mb-0.5">Update Notice</span>
                  <span>{editFormError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditFormError(null)}
                  className="text-rose-400 hover:text-rose-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleEditSubmit} autoComplete="off" className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Register Number *</label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={formData.registerNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, registerNumber: e.target.value.toUpperCase() })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Email</label>
                  <input
                    type="email"
                    autoComplete="off"
                    name="student_email_edit"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#071A3D]">Reset Password (Optional)</label>
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="text-[11px] text-[#1455D9] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showEditPassword ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> View
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      name="student_password_edit"
                      placeholder="Leave blank to keep existing password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2.5 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#1455D9] transition-colors cursor-pointer"
                      title={showEditPassword ? 'Hide password' : 'View password'}
                    >
                      {showEditPassword ? (
                        <EyeOff className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Student Phone</label>
                  <input
                    type="text"
                    autoComplete="off"
                    name="student_phone_edit"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1 flex items-center justify-between">
                    <span>Parent Phone</span>
                    <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      WhatsApp / Fast2SMS
                    </span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    name="student_parent_phone_edit"
                    placeholder="e.g. 9876543210"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    autoComplete="off"
                    min="1960-01-01"
                    max="2035-12-31"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="O +ve">O +ve</option>
                    <option value="O -ve">O -ve</option>
                    <option value="A +ve">A +ve</option>
                    <option value="A -ve">A -ve</option>
                    <option value="B +ve">B +ve</option>
                    <option value="B -ve">B -ve</option>
                    <option value="AB +ve">AB +ve</option>
                    <option value="AB -ve">AB -ve</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Residency Status</label>
                <select
                  value={formData.residencyStatus?.toLowerCase().includes('hostel') ? 'Hosteller' : (formData.residencyStatus || '')}
                  onChange={(e) => {
                    const newRes = e.target.value
                    const isH = newRes.toLowerCase().includes('hostel')
                    const isD = newRes.toLowerCase().includes('day scholar')
                    setFormData({
                      ...formData,
                      residencyStatus: newRes,
                      ...(isH ? { busNo: '', boardingPoint: '', busDetails: '' } : {}),
                      ...(isD ? { hostelBlock: '', roomNo: '' } : {}),
                    })
                  }}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                >
                  <option value="">Select Residency Status</option>
                  <option value="Day Scholar">Day Scholar</option>
                  <option value="Hosteller">Hosteller</option>
                  <option value="Foreign Student">Foreign Student</option>
                </select>
              </div>

              {/* Day Scholar: Bus Transit Fields */}
              {(formData.residencyStatus?.toLowerCase().includes('day scholar') || (!formData.residencyStatus && (formData.busNo || formData.boardingPoint))) && (
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-[#1455D9] text-xs">
                    <Bus className="w-4 h-4 text-[#1455D9]" />
                    <span>College Transit &amp; Bus Allocation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">Bus Number / Route</label>
                      <input
                        type="text"
                        value={formData.busNo}
                        onChange={(e) => setFormData({ ...formData, busNo: e.target.value })}
                        placeholder="e.g. 44, Route 12"
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#1455D9]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">Boarding Point</label>
                      <input
                        type="text"
                        value={formData.boardingPoint}
                        onChange={(e) => setFormData({ ...formData, boardingPoint: e.target.value })}
                        placeholder="e.g. olappalayam, Karur Stand"
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#1455D9]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-1">Transit Details / Stop Summary</label>
                    <input
                      type="text"
                      value={formData.busDetails}
                      onChange={(e) => setFormData({ ...formData, busDetails: e.target.value })}
                      placeholder="e.g. College Bus · Bus 44 · olappalayam"
                      className="w-full p-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#1455D9]"
                    />
                  </div>
                </div>
              )}

              {/* Hosteller: Hostel Accommodation Fields */}
              {(formData.residencyStatus?.toLowerCase().includes('hostel') || (!formData.residencyStatus && (formData.hostelBlock || formData.roomNo))) && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <Building className="w-4 h-4 text-amber-700" />
                    <span>Campus Hostel Accommodation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">Hostel Block</label>
                      <input
                        type="text"
                        value={formData.hostelBlock}
                        onChange={(e) => setFormData({ ...formData, hostelBlock: e.target.value })}
                        placeholder="e.g. Block A, Emerald Hall"
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#1455D9]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1">Room Number</label>
                      <input
                        type="text"
                        value={formData.roomNo}
                        onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                        placeholder="e.g. 204"
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#1455D9]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">CGPA</label>
                  <input
                    type="text"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                    placeholder="e.g. 8.84 / 10.0"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Attendance</label>
                  <input
                    type="text"
                    value={formData.attendance}
                    onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                    placeholder="e.g. 92.5%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => {
                      const newYear = Number(e.target.value)
                      const newSem = getSemesterForYear(newYear, formData.semester)
                      const newBatch = getDefaultBatchForYear(newYear)
                      setFormData({
                        ...formData,
                        year: newYear,
                        semester: newSem,
                        batch: newBatch,
                      })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D]"
                  >
                    <option value={1}>Year 1 (2026-2030)</option>
                    <option value={2}>Year 2 (2025-2029)</option>
                    <option value={3}>Year 3 (2024-2028)</option>
                    <option value={4}>Year 4 (2023-2027)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => {
                      const newSem = Number(e.target.value)
                      const newYear = getYearFromSemester(newSem)
                      const newBatch = getDefaultBatchForYear(newYear)
                      setFormData({
                        ...formData,
                        semester: newSem,
                        year: newYear,
                        batch: newBatch,
                      })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#1455D9] focus:outline-none focus:border-[#1455D9]"
                  >
                    {allSemesters
                      .filter((s) => s.year === formData.year)
                      .map((s) => (
                        <option key={s.sem} value={s.sem}>
                          {s.label} ({s.sem % 2 === 1 ? 'Odd' : 'Even'})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                    <option value="C">Sec C</option>
                    <option value="D">Sec D</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#071A3D]">Batch (Cohort)</label>
                    <span className="text-[9px] font-bold text-[#1455D9] bg-blue-50 px-1.5 py-0.2 rounded">
                      Auto
                    </span>
                  </div>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formData.batch}
                    onChange={(e) => {
                      const val = e.target.value
                      const matchedYear = getYearFromBatch(val)
                      if (matchedYear) {
                        const newSem = getSemesterForYear(matchedYear, formData.semester)
                        setFormData({ ...formData, batch: val, year: matchedYear, semester: newSem })
                      } else {
                        setFormData({ ...formData, batch: val })
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D]"
                    placeholder="e.g. 2025-2029"
                  />
                </div>
              </div>

              {/* Quick Batch Selector Chips in Edit Modal */}
              <div className="flex items-center gap-1.5 flex-wrap -mt-1 mb-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Default Batches:</span>
                {ACADEMIC_COHORTS.map((c) => (
                  <button
                    key={c.batch}
                    type="button"
                    onClick={() => {
                      const newSem = getSemesterForYear(c.year, formData.semester)
                      setFormData({
                        ...formData,
                        batch: c.batch,
                        year: c.year,
                        semester: newSem,
                      })
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      formData.year === c.year && formData.batch === c.batch
                        ? 'bg-[#1455D9] text-white border-[#1455D9]'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    Yr {c.year}: {c.batch}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">
                    Class Advisor / Mentor Name
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formData.advisorName}
                    onChange={(e) => setFormData({ ...formData, advisorName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md"
                >
                  {isLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW STUDENT DOSSIER */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  {selectedStudent.profileImage ? (
                    <img src={selectedStudent.profileImage} alt={selectedStudent.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-gray-200" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#071A3D] to-[#1455D9] text-white font-black flex items-center justify-center text-3xl shadow-sm">
                      {selectedStudent.name.charAt(0)}
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-black/60 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isUploadingPhoto ? 'opacity-100' : ''}`}>
                    {isUploadingPhoto ? (
                      <RotateCcw className="w-5 h-5 animate-spin" />
                    ) : (
                      <div className="flex gap-2">
                        {selectedStudent.profileImage && (
                          <button
                            type="button"
                            onClick={() => setFullScreenImage(selectedStudent.profileImage!)}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                            title="View Photo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <label className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition-colors" title="Upload Photo">
                          <UploadCloud className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-mono text-xs font-black text-[#1455D9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                    {selectedStudent.registerNumber}
                  </span>
                  <h3 className="text-lg font-black text-[#071A3D] mt-1">{selectedStudent.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Department:</span>
                  <span className="font-bold text-[#071A3D]">AI &amp; DS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Academic Standing:</span>
                  <span className="font-bold text-[#071A3D]">
                    Year {selectedStudent.year} · Sem {selectedStudent.semester} · Sec{' '}
                    {selectedStudent.section}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Class Advisor:</span>
                  <span className="font-bold text-[#1455D9]">
                    {selectedStudent.advisorName || 'Not Assigned'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border inline-flex items-center gap-1 ${
                    selectedStudent.status.toLowerCase() === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedStudent.status.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {selectedStudent.status.toLowerCase() === 'active' ? 'ACTIVE (LOGGED IN)' : 'INACTIVE (NOT LOGGED IN)'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedStudent.email && !selectedStudent.email.endsWith('@vsb.student.edu') && !selectedStudent.email.endsWith('@student.vsb.edu.in') ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-[#1455D9]" />
                    <span className="font-semibold">{selectedStudent.email}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="italic text-xs">Email not registered</span>
                  </div>
                )}
                {selectedStudent.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#1455D9]" />
                    <span>{selectedStudent.phone}</span>
                  </div>
                )}
                {selectedStudent.parentPhone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-amber-500" />
                    <span>{selectedStudent.parentPhone} (Parent)</span>
                  </div>
                )}
                {selectedStudent.dateOfBirth && !selectedStudent.dateOfBirth.startsWith('2004-01-01') && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-[#1455D9]" />
                    <span>Date of Birth: {selectedStudent.dateOfBirth}</span>
                  </div>
                )}
                {selectedStudent.bloodGroup && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-red-300 text-red-300 flex items-center justify-center text-[1px]" />
                    <span className="font-semibold text-gray-600">{selectedStudent.bloodGroup}</span>
                  </div>
                )}
                {selectedStudent.residencyStatus && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-blue-400 text-blue-400 flex items-center justify-center text-[1px]" />
                    <span className="font-semibold text-gray-700">{selectedStudent.residencyStatus}</span>
                  </div>
                )}

                {/* Residency-Specific Transit or Hostel Details (Strictly Mutually Exclusive) */}
                {(() => {
                  const resStatus = (selectedStudent.residencyStatus || '').toLowerCase().trim()
                  const isHosteller = resStatus.includes('hostel') || (!resStatus && Boolean(selectedStudent.hostelBlock || selectedStudent.roomNo))
                  const isDayScholar = !isHosteller && (resStatus.includes('day scholar') || resStatus.includes('dayscholar') || Boolean(selectedStudent.busNo || selectedStudent.boardingPoint || selectedStudent.busDetails))

                  return (
                    <>
                      {/* College Transit / Bus Route Details: Strictly for Day Scholars */}
                      {isDayScholar && !isHosteller && (
                        <div className="p-3 bg-gradient-to-br from-blue-50/90 to-indigo-50/70 border border-blue-200/80 rounded-2xl space-y-2 text-xs shadow-xs">
                          <div className="flex items-center justify-between border-b border-blue-100/80 pb-1.5">
                            <div className="flex items-center gap-1.5 font-black text-[#1455D9]">
                              <Bus className="w-4 h-4 text-[#1455D9]" />
                              <span className="text-[12px] tracking-tight">College Transit &amp; Bus Details</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Day Scholar
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-0.5 text-gray-700">
                            <div>
                              <span className="text-gray-400 text-[10px] block font-semibold uppercase tracking-wider">Bus No.</span>
                              <span className="font-black text-[#071A3D] text-[13px]">
                                {selectedStudent.busNo ? `Bus ${selectedStudent.busNo.replace(/^#\s*/, '')}` : 'College Transit Bus'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-[10px] block font-semibold uppercase tracking-wider">Boarding Point</span>
                              <span className="font-black text-[#071A3D] text-[13px]">
                                {selectedStudent.boardingPoint || 'Main Bus Stop'}
                              </span>
                            </div>
                          </div>
                          {selectedStudent.busDetails && (
                            <div className="pt-1.5 border-t border-blue-100/70 text-gray-600 text-[11px]">
                              <span className="text-gray-400 text-[10px] block font-medium">Transit Route Summary</span>
                              <span className="font-semibold text-[#071A3D]">{selectedStudent.busDetails}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hostel Accommodation Details: Strictly for Hostellers */}
                      {isHosteller && (
                        <div className="p-3 bg-gradient-to-br from-amber-50/90 to-orange-50/70 border border-amber-200/80 rounded-2xl space-y-2 text-xs shadow-xs">
                          <div className="flex items-center justify-between border-b border-amber-100/80 pb-1.5">
                            <div className="flex items-center gap-1.5 font-black text-amber-900">
                              <Building className="w-4 h-4 text-amber-700" />
                              <span className="text-[12px] tracking-tight">Campus Hostel Accommodation</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Hosteller
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-0.5 text-gray-700">
                            <div>
                              <span className="text-gray-400 text-[10px] block font-semibold uppercase tracking-wider">Hostel Block</span>
                              <span className="font-black text-[#071A3D] text-[13px]">
                                {selectedStudent.hostelBlock ? `Block ${selectedStudent.hostelBlock}` : 'Campus Hostel'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-[10px] block font-semibold uppercase tracking-wider">Room Number</span>
                              <span className="font-black text-[#071A3D] text-[13px] font-mono">
                                {selectedStudent.roomNo ? `Room ${selectedStudent.roomNo}` : 'Assigned Room'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
                {selectedStudent.cgpa && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-gray-500 font-mono text-xs">CGPA:</span>
                    <span className="font-bold text-[#1455D9]">{selectedStudent.cgpa}</span>
                  </div>
                )}
                {selectedStudent.attendance && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-gray-500 font-mono text-xs">Attendance:</span>
                    <span className="font-bold text-[#1455D9]">{selectedStudent.attendance}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#071A3D] text-white font-bold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL: FULL SCREEN IMAGE */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullScreenImage(null)}
        >
          <div className="relative flex flex-col items-end gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setFullScreenImage(null)}
              className="p-2 bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors cursor-pointer backdrop-blur-md ring-1 ring-white/20"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={fullScreenImage}
              alt="Full screen view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      )}
      {/* MODAL: BATCH SYNCHRONIZATION & AUTO-UPDATE */}
      {isBatchSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1455D9] flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#071A3D]">Batch &amp; Semester Progression</h3>
                  <p className="text-[11px] text-gray-500">Auto-update student records to official default cohorts</p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchSyncModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Cohorts Reference Cards */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Official Department Standards:</p>
              <div className="grid grid-cols-2 gap-2">
                {ACADEMIC_COHORTS.map((c) => (
                  <div key={c.batch} className="p-2.5 rounded-xl border border-blue-100 bg-blue-50/50">
                    <p className="text-xs font-black text-[#071A3D]">{c.label.split('·')[0].trim()}</p>
                    <p className="text-xs font-black text-[#1455D9]">{c.batch}</p>
                    <p className="text-[10px] text-gray-500">Semesters {c.semesters[0]} &amp; {c.semesters[1]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Scope */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#071A3D] mb-1">Target Academic Year</label>
                <select
                  value={syncTargetYear}
                  onChange={(e) => setSyncTargetYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                >
                  <option value="ALL">All Academic Years (1 - 4)</option>
                  <option value="1">1st Year Only (→ Batch 2026-2030)</option>
                  <option value="2">2nd Year Only (→ Batch 2025-2029)</option>
                  <option value="3">3rd Year Only (→ Batch 2024-2028)</option>
                  <option value="4">4th Year Only (→ Batch 2023-2027)</option>
                </select>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncSemestersOption}
                  onChange={(e) => setSyncSemestersOption(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#1455D9] focus:ring-[#1455D9]"
                />
                <div>
                  <span className="text-xs font-bold text-[#071A3D] block">Also synchronize Semesters automatically</span>
                  <span className="text-[11px] text-gray-500">
                    Ensures odd/even semester numbers match each student's academic year range.
                  </span>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsBatchSyncModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSyncingBatches}
                onClick={async () => {
                  setIsSyncingBatches(true)
                  try {
                    const res = await fetch('/api/students/batch-sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        targetYear: syncTargetYear,
                        syncSemesters: syncSemestersOption,
                        forceAll: true,
                      }),
                    })
                    const data = await res.json()
                    if (res.ok && data.success) {
                      toast.success(data.message || 'Batches synchronized successfully!')
                      playNotificationChime()
                      fetchStudents()
                      setIsBatchSyncModalOpen(false)
                    } else {
                      alert(data.message || 'Failed to sync batches')
                    }
                  } catch (err: any) {
                    alert('Error syncing batches: ' + err.message)
                  } finally {
                    setIsSyncingBatches(false)
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSyncingBatches ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Run Auto-Sync Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BULK STUDENT IMPORT */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={() => {
          fetchStudents()
          toast.success('Student roster updated successfully!')
        }}
      />
    </div>
  )
}

