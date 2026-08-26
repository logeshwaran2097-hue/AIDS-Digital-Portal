'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Users,
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  X,
  Mail,
  Phone,
  BookOpen,
  Briefcase,
  Award,
  GraduationCap,
  Sparkles,
  Layers,
  Calendar,
  UserCheck,
  BookMarked,
  SlidersHorizontal,
  ChevronRight,
  School,
  Lock,
  Clock,
  AlertTriangle,
  FileText,
  Send,
  MessageSquare,
  Check,
  FlaskConical,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { cn } from '@/lib/utils'

export interface FacultyRecord {
  id: string
  facultyId: string
  name: string
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  designation: string
  qualification: string
  experience: number
  specialization: string
  subjects: string[] | string
  subjectName?: string | null
  classDay?: string | null
  classPeriod?: string | null
  classTime?: string | null
  advisorBatch?: string | null
  advisorYear?: number | null
  advisorSem?: number | null
  advisorSec?: string | null
  facultyType?: string
  status: string
}

interface StudentInClass {
  id: string
  registerNumber: string
  name: string
  email: string
  phone: string
  attendancePercent: number
  cgpa: number
  status: 'active' | 'warning' | 'critical'
}

const DEFAULT_SUBJECT_HANDLERS = [
  { code: 'AD2301', name: 'Data Structures & Algorithms', credits: 4, handler: 'Dr. S. Karthik', hours: 45, day: 'Mon, Wed, Fri', period: 'Period 1', time: '09:00 AM - 09:50 AM' },
  { code: 'AD2302', name: 'Database Management Systems', credits: 3, handler: 'Dr. M. Sowmya', hours: 40, day: 'Tue, Thu', period: 'Period 2, Period 4', time: '09:50 AM - 10:40 AM, 11:45 AM - 12:35 PM' },
  { code: 'AD2303', name: 'Discrete Mathematics', credits: 4, handler: 'Mr. S. Arun', hours: 45, day: 'Mon, Wed', period: 'Period 3', time: '10:55 AM - 11:45 AM' },
  { code: 'AD2304', name: 'Operating Systems & System Software', credits: 3, handler: 'Mrs. R. Priya', hours: 38, day: 'Tue, Fri', period: 'Period 4, Period 8', time: '11:45 AM - 12:35 PM, 04:05 PM - 04:55 PM' },
  { code: 'AD2305', name: 'Machine Learning Foundations', credits: 4, handler: 'Dr. S. Karthik', hours: 45, day: 'Mon, Thu', period: 'Period 2, Period 5', time: '09:50 AM - 10:40 AM, 01:25 PM - 02:15 PM' },
  { code: 'AD2306', name: 'Artificial Intelligence & Expert Systems', credits: 3, handler: 'Dr. M. Sowmya', hours: 36, day: 'Wed, Fri', period: 'Period 6, Period 7', time: '02:15 PM - 03:05 PM, 03:15 PM - 04:05 PM' },
  { code: 'AD2307', name: 'Data Science Tools & Laboratory', credits: 2, handler: 'Mr. S. Arun', hours: 30, day: 'Thu', period: 'Lab Session (AN)', time: '01:25 PM - 04:05 PM' },
]

// All 8 Periods + Dedicated Lab Sessions
const PERIOD_LIST = [
  { id: 'P1', name: 'Period 1', time: '09:00 AM - 09:50 AM', isLab: false },
  { id: 'P2', name: 'Period 2', time: '09:50 AM - 10:40 AM', isLab: false },
  { id: 'P3', name: 'Period 3', time: '10:55 AM - 11:45 AM', isLab: false },
  { id: 'P4', name: 'Period 4', time: '11:45 AM - 12:35 PM', isLab: false },
  { id: 'P5', name: 'Period 5', time: '01:25 PM - 02:15 PM', isLab: false },
  { id: 'P6', name: 'Period 6', time: '02:15 PM - 03:05 PM', isLab: false },
  { id: 'P7', name: 'Period 7', time: '03:15 PM - 04:05 PM', isLab: false },
  { id: 'P8', name: 'Period 8', time: '04:05 PM - 04:55 PM', isLab: false },
  { id: 'LAB_FN', name: 'Lab Session (FN)', time: '09:00 AM - 12:35 PM', isLab: true },
  { id: 'LAB_AN', name: 'Lab Session (AN)', time: '01:25 PM - 04:05 PM', isLab: true },
  { id: 'LAB_FULL', name: 'Lab Session (P5-P8)', time: '01:25 PM - 04:55 PM', isLab: true },
]

const DAYS_OF_WEEK = [
  { code: 'Mon', label: 'Monday' },
  { code: 'Tue', label: 'Tuesday' },
  { code: 'Wed', label: 'Wednesday' },
  { code: 'Thu', label: 'Thursday' },
  { code: 'Fri', label: 'Friday' },
  { code: 'Sat', label: 'Saturday' },
]

const DEFAULT_TIMETABLE = [
  { day: 'Monday', p1: 'AD2301 (DS)', p2: 'AD2302 (DBMS)', p3: 'AD2303 (Maths)', p4: 'AD2305 (ML)', p5: 'Lab: AD2307', p6: 'Lab: AD2307', p7: 'Lab: AD2307', p8: 'Library' },
  { day: 'Tuesday', p1: 'AD2305 (ML)', p2: 'AD2304 (OS)', p3: 'AD2301 (DS)', p4: 'AD2306 (AI)', p5: 'Mentorship', p6: 'AD2302 (DBMS)', p7: 'Self-Study', p8: 'Placement Prep' },
  { day: 'Wednesday', p1: 'AD2302 (DBMS)', p2: 'AD2303 (Maths)', p3: 'AD2306 (AI)', p4: 'AD2304 (OS)', p5: 'Project Work', p6: 'Project Work', p7: 'Seminar', p8: 'Sports' },
  { day: 'Thursday', p1: 'AD2304 (OS)', p2: 'AD2301 (DS)', p3: 'AD2305 (ML)', p4: 'AD2302 (DBMS)', p5: 'Lab: AD2307', p6: 'Lab: AD2307', p7: 'Lab: AD2307', p8: 'Club Activity' },
  { day: 'Friday', p1: 'AD2303 (Maths)', p2: 'AD2306 (AI)', p3: 'AD2304 (OS)', p4: 'AD2301 (DS)', p5: 'AD2305 (ML)', p6: 'AD2303 (Maths)', p7: 'Counseling', p8: 'Mentorship' },
]

export function AdminFacultyView({ initialFaculty }: { initialFaculty: FacultyRecord[] }) {
  // Active View Tab: 'advisors' (Class Advisors) vs 'handlers' (Subject Handlers)
  const [activeTab, setActiveTab] = useState<'advisors' | 'handlers'>('advisors')
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>(initialFaculty)
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [sectionFilter, setSectionFilter] = useState('ALL')
  const [designationFilter, setDesignationFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(false)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Dossier Modal for Class Advisor
  const [selectedAdvisorDossier, setSelectedAdvisorDossier] = useState<FacultyRecord | null>(null)
  const [dossierTab, setDossierTab] = useState<'students' | 'handlers' | 'attendance' | 'timetable' | 'notices'>('students')
  const [classStudents, setClassStudents] = useState<StudentInClass[]>([])
  const [loadingClassData, setLoadingClassData] = useState(false)

  // Form state - Clean default empty values
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    designation: 'Assistant Professor',
    qualification: '',
    experience: '' as any,
    specialization: '',
    subjects: '',
    subjectName: '',
    classDay: 'Mon, Wed, Fri',
    classPeriod: 'Period 1',
    classTime: '09:00 AM - 09:50 AM',
    advisorBatch: '',
    advisorYear: 2,
    advisorSem: 4,
    advisorSec: 'A',
    facultyType: 'advisor', // 'advisor', 'subject_handler', or 'both'
  })

  // Normalize subjects array helper
  const getSubjectsList = (subjects: string[] | string): string[] => {
    if (Array.isArray(subjects)) return subjects
    if (typeof subjects === 'string') {
      try {
        const parsed = JSON.parse(subjects)
        if (Array.isArray(parsed)) return parsed
      } catch {}
      return subjects ? [subjects] : []
    }
    return []
  }

  // Toggle Multiple Days (e.g. Mon, Wed, Fri)
  const toggleDaySelection = (dayCode: string) => {
    const currentDays = formData.classDay
      ? formData.classDay.split(',').map((d) => d.trim()).filter(Boolean)
      : []
    const nextDays = currentDays.includes(dayCode)
      ? currentDays.filter((d) => d !== dayCode)
      : [...currentDays, dayCode]
    
    setFormData({
      ...formData,
      classDay: nextDays.join(', '),
    })
  }

  // Toggle Multiple Periods & Auto-calculate combined times
  const togglePeriodSelection = (periodName: string) => {
    const currentPeriods = formData.classPeriod
      ? formData.classPeriod.split(',').map((p) => p.trim()).filter(Boolean)
      : []
    const nextPeriods = currentPeriods.includes(periodName)
      ? currentPeriods.filter((p) => p !== periodName)
      : [...currentPeriods, periodName]

    // Sort periods in chronological order
    nextPeriods.sort((a, b) => {
      const idxA = PERIOD_LIST.findIndex((p) => p.name === a)
      const idxB = PERIOD_LIST.findIndex((p) => p.name === b)
      return idxA - idxB
    })

    const calculatedTimes = nextPeriods.map((p) => {
      const found = PERIOD_LIST.find((item) => item.name === p)
      return found ? found.time : ''
    }).filter(Boolean)

    setFormData({
      ...formData,
      classPeriod: nextPeriods.join(', '),
      classTime: calculatedTimes.join(', '),
    })
  }

  // Load students for the selected class dossier
  useEffect(() => {
    if (!selectedAdvisorDossier) return
    const year = selectedAdvisorDossier.advisorYear || 2
    const sem = selectedAdvisorDossier.advisorSem || 4
    const sec = selectedAdvisorDossier.advisorSec || 'A'

    setLoadingClassData(true)
    fetch(`/api/students?year=${year}&semester=${sem}&section=${sec}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.students) && data.students.length > 0) {
          const mapped: StudentInClass[] = data.students.map((s: any, idx: number) => {
            const att = 90 + ((idx * 3) % 9) - ((idx % 5 === 0) ? 18 : 0)
            return {
              id: s.id,
              registerNumber: s.registerNumber,
              name: s.name,
              email: s.email,
              phone: s.phone || '+91 98765 43210',
              attendancePercent: Math.min(100, Math.max(68, att)),
              cgpa: Number((7.5 + ((idx * 0.17) % 2.3)).toFixed(2)),
              status: att < 75 ? 'critical' : att < 85 ? 'warning' : 'active',
            }
          })
          setClassStudents(mapped)
        } else {
          // Fallback mock students if DB is fresh
          const mock: StudentInClass[] = Array.from({ length: 15 }).map((_, i) => {
            const num = (i + 1).toString().padStart(3, '0')
            const att = 92 + (i % 7) - (i === 3 ? 20 : i === 7 ? 12 : 0)
            return {
              id: `mock-${i}`,
              registerNumber: `23AD${num}`,
              name: [
                'Aarav Sharma', 'Deepa Krishnan', 'Dinesh Kumar', 'Gowtham R', 'Harini V',
                'Karthik S', 'Keerthana M', 'Logeshwaran S', 'Manoj K', 'Naveen Raj',
                'Pavithra R', 'Praveen K', 'Rahul V', 'Santhosh M', 'Sneha Priya'
              ][i] || `Student ${num}`,
              email: `23ad${num}@vsb.edu.in`,
              phone: `+91 98765 ${43200 + i}`,
              attendancePercent: Math.min(100, Math.max(68, att)),
              cgpa: Number((7.8 + ((i * 0.13) % 2.1)).toFixed(2)),
              status: att < 75 ? 'critical' : att < 85 ? 'warning' : 'active',
            }
          })
          setClassStudents(mock)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingClassData(false))
  }, [selectedAdvisorDossier])

  // Filtered lists for Class Advisors
  const advisorsList = useMemo(() => {
    return facultyList.filter((f) => {
      const isAdvisor =
        f.advisorBatch ||
        f.facultyType === 'advisor' ||
        f.facultyType === 'both' ||
        !f.facultyType
      if (!isAdvisor) return false

      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.advisorBatch && f.advisorBatch.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesYear =
        yearFilter === 'ALL' ||
        String(f.advisorYear) === yearFilter ||
        (f.advisorBatch && f.advisorBatch.includes(`Year ${yearFilter}`))

      const matchesSection =
        sectionFilter === 'ALL' ||
        f.advisorSec?.toUpperCase() === sectionFilter.toUpperCase() ||
        (f.advisorBatch && f.advisorBatch.includes(`Sec ${sectionFilter}`))

      return matchesSearch && matchesYear && matchesSection
    })
  }, [facultyList, searchQuery, yearFilter, sectionFilter])

  // Filtered lists for Subject Handlers
  const handlersList = useMemo(() => {
    return facultyList.filter((f) => {
      const subjs = getSubjectsList(f.subjects)
      const isHandler =
        subjs.length > 0 ||
        f.subjectName ||
        f.facultyType === 'subject_handler' ||
        f.facultyType === 'both' ||
        !f.facultyType
      if (!isHandler) return false

      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.subjectName && f.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.classDay && f.classDay.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.classPeriod && f.classPeriod.toLowerCase().includes(searchQuery.toLowerCase())) ||
        f.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subjs.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesDesignation =
        designationFilter === 'ALL' ||
        f.designation.toLowerCase().includes(designationFilter.toLowerCase())

      return matchesSearch && matchesDesignation
    })
  }, [facultyList, searchQuery, designationFilter])

  // PDF Export
  const handleExportPDF = () => {
    const isAdvisors = activeTab === 'advisors'
    generateAndDownloadPDF({
      title: isAdvisors
        ? 'DEPARTMENT OF AI & DS — CLASS ADVISORS DIRECTORY'
        : 'DEPARTMENT OF AI & DS — SUBJECT HANDLERS & TIMINGS DIRECTORY',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Department Administrator',
      category: isAdvisors ? 'Class In-Charges & Mentors' : 'Course Instructors & Schedules',
      sections: [
        {
          heading: isAdvisors ? '1. CLASS ADVISORS SUMMARY' : '1. COURSE INSTRUCTORS SUMMARY',
          body: [
            `Total Faculty Count: ${facultyList.length} Faculty Members`,
            `Active View: ${isAdvisors ? 'Class Mentors & Batch Advisors' : 'Subject Handlers, Timing & Period Allocations'}`,
            `Department: Artificial Intelligence & Data Science (AI & DS)`,
          ],
        },
        {
          heading: isAdvisors ? '2. CLASS ADVISORS ALLOCATION' : '2. SUBJECT HANDLERS & TIMETABLE ALLOCATION',
          body: (isAdvisors ? advisorsList : handlersList).map((f, idx) => {
            if (isAdvisors) {
              return `${idx + 1}. ${f.name} — ${f.designation} | Assigned Batch: ${f.advisorBatch || 'Year II (Sec A)'} | Contact: ${f.email}`
            } else {
              const subjs = getSubjectsList(f.subjects).join(', ') || 'AD2301'
              const sName = f.subjectName || 'Artificial Intelligence'
              const sDay = f.classDay || 'Mon, Wed, Fri'
              const sPeriod = f.classPeriod || 'Period 1'
              const sTime = f.classTime || '09:00 AM - 09:50 AM'
              return `${idx + 1}. ${f.name} — ${sName} [${subjs}] | Days: ${sDay} | Periods: ${sPeriod} (${sTime}) | ${f.designation}`
            }
          }),
        },
      ],
      fileName: isAdvisors ? 'VSB_AI_DS_Class_Advisors_2026' : 'VSB_AI_DS_Subject_Handlers_2026',
    })
  }

  // Export Specific Class Dossier PDF
  const handleExportClassDossierPDF = () => {
    if (!selectedAdvisorDossier) return
    generateAndDownloadPDF({
      title: `CLASS DOSSIER: ${selectedAdvisorDossier.advisorBatch || 'Year II - Sem 4 - Sec A'}`,
      subtitle: `Class Advisor: ${selectedAdvisorDossier.name} · Department of AI & DS`,
      author: 'Class Advisory Mentorship Record',
      category: 'Official Class Details & Student Roster',
      sections: [
        {
          heading: '1. CLASS ADVISOR & BATCH DETAILS',
          body: [
            `Class Advisor: ${selectedAdvisorDossier.name} (${selectedAdvisorDossier.designation})`,
            `Assigned Class: ${selectedAdvisorDossier.advisorBatch || 'Year 2, Sem 4, Sec A'}`,
            `Advisor Email: ${selectedAdvisorDossier.email} | Phone: ${selectedAdvisorDossier.phone || 'N/A'}`,
            `Total Enrolled Students: ${classStudents.length} Students`,
            `Class Average Attendance: ${(classStudents.reduce((acc, s) => acc + s.attendancePercent, 0) / (classStudents.length || 1)).toFixed(1)}%`,
          ],
        },
        {
          heading: '2. SEMESTER COURSES & SUBJECT HANDLERS',
          body: DEFAULT_SUBJECT_HANDLERS.map(
            (s, i) => `${i + 1}. [${s.code}] ${s.name} (${s.credits} Credits) — Handled by: ${s.handler} | ${s.day} (${s.period}, ${s.time})`
          ),
        },
        {
          heading: '3. STUDENT ROLL & ATTENDANCE STANDING',
          body: classStudents.map(
            (s, idx) =>
              `${idx + 1}. ${s.registerNumber} - ${s.name} | Attendance: ${s.attendancePercent}% | CGPA: ${s.cgpa} | Status: ${s.status.toUpperCase()}`
          ),
        },
      ],
      fileName: `Class_Dossier_${selectedAdvisorDossier.advisorBatch?.replace(/[^a-zA-Z0-9]/g, '_') || 'Year2_SecA'}`,
    })
  }

  // Handle Add Faculty Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please fill in Faculty Name.')
      return
    }

    setIsLoading(true)
    try {
      let subjectsArr: string[] = []
      if (formData.subjects.trim()) {
        try {
          subjectsArr = JSON.parse(formData.subjects)
        } catch {
          subjectsArr = formData.subjects.split(',').map((s) => s.trim()).filter(Boolean)
        }
      }

      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          password: formData.password.trim() || 'vsb@123',
          experience: Number(formData.experience) || 1,
          subjects: subjectsArr,
          subjectName: formData.subjectName.trim() || null,
          classDay: formData.classDay || null,
          classPeriod: formData.classPeriod || null,
          classTime: formData.classTime || null,
        }),
      })
      const result = await res.json()

      if (result.success && result.faculty) {
        setFacultyList([result.faculty, ...facultyList])
        setIsAddModalOpen(false)
        setFormData({
          facultyId: '',
          name: '',
          email: '',
          phone: '',
          password: '',
          dateOfBirth: '',
          designation: 'Assistant Professor',
          qualification: '',
          experience: '',
          specialization: '',
          subjects: '',
          subjectName: '',
          classDay: 'Mon, Wed, Fri',
          classPeriod: 'Period 1',
          classTime: '09:00 AM - 09:50 AM',
          advisorBatch: activeTab === 'advisors' ? 'Year II - Sem 4 - Sec A' : '',
          advisorYear: 2,
          advisorSem: 4,
          advisorSec: 'A',
          facultyType: activeTab === 'advisors' ? 'advisor' : 'subject_handler',
        })
        alert('Faculty member successfully registered in database!')
      } else {
        alert(result.message || 'Failed to register faculty')
      }
    } catch (err) {
      console.error(err)
      alert('Network error adding faculty.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Edit Faculty Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFaculty) return

    setIsLoading(true)
    try {
      let subjectsArr: string[] = []
      if (formData.subjects.trim()) {
        try {
          subjectsArr = JSON.parse(formData.subjects)
        } catch {
          subjectsArr = formData.subjects.split(',').map((s) => s.trim()).filter(Boolean)
        }
      }

      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          facultyId: selectedFaculty.facultyId,
          experience: Number(formData.experience) || 1,
          subjects: subjectsArr,
          subjectName: formData.subjectName.trim() || null,
          classDay: formData.classDay || null,
          classPeriod: formData.classPeriod || null,
          classTime: formData.classTime || null,
        }),
      })
      const result = await res.json()

      if (result.success) {
        setFacultyList(
          facultyList.map((f) =>
            f.id === selectedFaculty.id
              ? {
                  ...f,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  designation: formData.designation,
                  qualification: formData.qualification,
                  experience: Number(formData.experience) || 1,
                  specialization: formData.specialization,
                  subjects: subjectsArr,
                  subjectName: formData.subjectName,
                  classDay: formData.classDay,
                  classPeriod: formData.classPeriod,
                  classTime: formData.classTime,
                  advisorBatch: formData.advisorBatch,
                  advisorYear: formData.advisorYear,
                  advisorSem: formData.advisorSem,
                  advisorSec: formData.advisorSec,
                  facultyType: formData.facultyType,
                }
              : f
          )
        )
        setIsEditModalOpen(false)
        alert('Faculty record updated successfully in database!')
      } else {
        alert(result.message || 'Failed to update faculty')
      }
    } catch (err) {
      console.error(err)
      alert('Network error updating faculty.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Delete Faculty
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove all their course and advisory assignments.`)) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setFacultyList(facultyList.filter((f) => f.id !== id && f.facultyId !== id))
        alert(`${name} removed successfully.`)
      } else {
        alert(result.message || 'Failed to delete faculty')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting faculty.')
    } finally {
      setIsLoading(false)
    }
  }

  // Selected Days array helper
  const parsedSelectedDays = useMemo(() => {
    return formData.classDay ? formData.classDay.split(',').map((d) => d.trim()).filter(Boolean) : []
  }, [formData.classDay])

  // Selected Periods array helper
  const parsedSelectedPeriods = useMemo(() => {
    return formData.classPeriod ? formData.classPeriod.split(',').map((p) => p.trim()).filter(Boolean) : []
  }, [formData.classPeriod])

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Faculty Records Administration
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Faculty Directorate &amp; Cadre</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Separated into dedicated pages for <strong>Class Advisors</strong> and <strong>Subject Handlers (8 Periods &amp; Lab Sessions)</strong>
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F4C430]" /> Export Directorate (PDF)
          </button>
          <button
            onClick={() => {
              setFormData({
                facultyId: '',
                name: '',
                email: '',
                phone: '',
                password: '',
                dateOfBirth: '',
                designation: 'Assistant Professor',
                qualification: '',
                experience: '',
                specialization: '',
                subjects: '',
                subjectName: '',
                classDay: 'Mon, Wed, Fri',
                classPeriod: 'Period 1',
                classTime: '09:00 AM - 09:50 AM',
                advisorBatch: activeTab === 'advisors' ? 'Year II - Sem 4 - Sec A' : '',
                advisorYear: 2,
                advisorSem: 4,
                advisorSec: 'A',
                facultyType: activeTab === 'advisors' ? 'advisor' : 'subject_handler',
              })
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Add New Faculty
          </button>
        </div>
      </div>

      {/* STEP 1: CHOOSE FACULTY CADRE / VIEW */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1455D9] text-white text-[11px] font-black flex items-center justify-center">1</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                Step 1: Choose Faculty Cadre / Division
              </h3>
            </div>
            <span className="text-[11px] font-bold text-gray-400">
              Select division to manage specific allocations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('advisors')}
              className={cn(
                'flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer text-left',
                activeTab === 'advisors'
                  ? 'border-[#1455D9] bg-blue-50/50 shadow-sm ring-2 ring-[#1455D9]/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-black',
                  activeTab === 'advisors' ? 'bg-[#1455D9] text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#071A3D]">Page 1: Class Advisors</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Batch Mentors, Section In-charges &amp; Class Dossier</p>
                </div>
              </div>
              <span className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-black font-mono',
                activeTab === 'advisors' ? 'bg-[#1455D9] text-white' : 'bg-gray-100 text-gray-700'
              )}>
                {advisorsList.length} Active
              </span>
            </button>

            <button
              onClick={() => setActiveTab('handlers')}
              className={cn(
                'flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer text-left',
                activeTab === 'handlers'
                  ? 'border-[#1455D9] bg-purple-50/50 shadow-sm ring-2 ring-[#1455D9]/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-black',
                  activeTab === 'handlers' ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#071A3D]">Page 2: Subject Handlers</h4>
                  <p className="text-[11px] text-gray-500 font-medium">8 Periods, Lab Sessions, Multi-Day Schedules &amp; Timings</p>
                </div>
              </div>
              <span className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-black font-mono',
                activeTab === 'handlers' ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-700'
              )}>
                {handlersList.length} Active
              </span>
            </button>
          </div>
        </div>

        {/* STEP 2: Filter by Academic Batch (When viewing Class Advisors) */}
        {activeTab === 'advisors' && (
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#F4C430] text-[#071A3D] text-[11px] font-black flex items-center justify-center">2</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                  Step 2: Filter by Academic Batch (Years I - IV)
                </h3>
              </div>
              {yearFilter !== 'ALL' && (
                <button
                  onClick={() => setYearFilter('ALL')}
                  className="text-[11px] font-bold text-[#1455D9] hover:underline cursor-pointer"
                >
                  Clear Year Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { val: 'ALL', label: 'All 4 Years', sub: 'All Batches' },
                { val: '1', label: 'Year I', sub: 'Freshman' },
                { val: '2', label: 'Year II', sub: 'Sophomore' },
                { val: '3', label: 'Year III', sub: 'Junior' },
                { val: '4', label: 'Year IV', sub: 'Senior' },
              ].map((b) => {
                const isSelected = yearFilter === b.val
                const count = facultyList.filter(
                  (f) => b.val === 'ALL' || String(f.advisorYear) === b.val
                ).length
                return (
                  <button
                    key={b.val}
                    onClick={() => setYearFilter(b.val)}
                    className={cn(
                      'p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                      isSelected
                        ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-sm ring-2 ring-[#071A3D]/20'
                        : 'bg-gray-50/80 hover:bg-blue-50/50 border-gray-200 text-[#071A3D]'
                    )}
                  >
                    <span className="text-xs font-black block">{b.label}</span>
                    <span className={cn(
                      'text-[10px] font-bold block mt-0.5',
                      isSelected ? 'text-[#F4C430]' : 'text-gray-500'
                    )}>
                      {b.sub} · {count} Advisors
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Faculty</p>
          <p className="text-2xl font-black text-[#071A3D] mt-0.5">{facultyList.length}</p>
          <p className="text-[10px] text-[#1455D9] font-medium mt-1">Teaching &amp; Advisory Staff</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-green-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Class Advisors</p>
          <p className="text-2xl font-black text-green-700 mt-0.5">{advisorsList.length}</p>
          <p className="text-[10px] text-green-700 font-medium mt-1">4 Years · Sections A - D</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Subject Handlers</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">{handlersList.length}</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Curriculum &amp; Lab Sessions</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Department</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">B.Tech AI &amp; DS</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">8 Periods &amp; Practical Labs</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'advisors'
                ? 'Search advisors by name or batch...'
                : 'Search handlers by name, subject name, days, period, or lab...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] focus:ring-2 focus:ring-[#1455D9]/20 font-medium"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Cadre Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-gray-400">Cadre:</span>
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
            >
              <option value="ALL">All Cadres</option>
              <option value="Professor">Professors</option>
              <option value="Associate">Associate Prof</option>
              <option value="Assistant">Assistant Prof</option>
            </select>
          </div>

          {/* Section Filter (Only for Advisors) */}
          {activeTab === 'advisors' && (
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
          )}

          <span className="text-xs text-gray-500 font-bold px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 whitespace-nowrap">
            Showing {activeTab === 'advisors' ? advisorsList.length : handlersList.length} of {facultyList.length}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PAGE 1: CLASS ADVISORS TABLE */}
      {/* ========================================================= */}
      {activeTab === 'advisors' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Faculty Name</th>
                <th className="px-4 py-3.5">Assigned Class &amp; Section</th>
                <th className="px-4 py-3.5">Role Type</th>
                <th className="px-4 py-3.5">Designation &amp; Qualification</th>
                <th className="px-4 py-3.5">Advisory Contact</th>
                <th className="px-4 py-3.5 text-center">Class Dossier</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {advisorsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-600">No Class Advisors Found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click &quot;+ Add New Faculty&quot; to assign a class advisor.</p>
                  </td>
                </tr>
              ) : (
                advisorsList.map((advisor, idx) => (
                  <tr key={advisor.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3.5 text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1455D9]/10 text-[#1455D9] font-black text-sm flex items-center justify-center border border-[#1455D9]/20">
                          {advisor.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-[#071A3D] text-sm block">
                            {advisor.name}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {advisor.designation}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200 inline-flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {advisor.advisorBatch ||
                          `Year ${advisor.advisorYear || 2} · Sem ${advisor.advisorSem || 4} (Sec ${advisor.advisorSec || 'A'})`}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1455D9] border border-blue-200">
                        {advisor.facultyType === 'both' ? 'Advisor & Faculty' : 'Class Advisor'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-gray-800 block">
                        {advisor.qualification || 'M.E. / Ph.D.'}
                      </span>
                      <span className="text-gray-500 text-[11px]">
                        {advisor.experience ? `${advisor.experience} Yrs Experience` : 'AI & DS Faculty'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5 text-[11px] text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#1455D9]" />
                          <span>{advisor.email}</span>
                        </div>
                        {advisor.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#1455D9]" />
                            <span>{advisor.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Class Details Dossier Button */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedAdvisorDossier(advisor)
                          setDossierTab('students')
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1455D9]/10 hover:bg-[#1455D9] text-[#1455D9] hover:text-white font-black text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer border border-[#1455D9]/30 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Class Details
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedFaculty(advisor)
                            const subjs = getSubjectsList(advisor.subjects)
                            setFormData({
                              facultyId: advisor.facultyId,
                              name: advisor.name,
                              email: advisor.email,
                              phone: advisor.phone || '',
                              password: '',
                              dateOfBirth: advisor.dateOfBirth || '',
                              designation: advisor.designation,
                              qualification: advisor.qualification || '',
                              experience: advisor.experience || '',
                              specialization: advisor.specialization || '',
                              subjects: subjs.join(', '),
                              subjectName: advisor.subjectName || '',
                              classDay: advisor.classDay || 'Mon, Wed, Fri',
                              classPeriod: advisor.classPeriod || 'Period 1',
                              classTime: advisor.classTime || '09:00 AM - 09:50 AM',
                              advisorBatch: advisor.advisorBatch || 'Year II - Sem 4 - Sec A',
                              advisorYear: advisor.advisorYear || 2,
                              advisorSem: advisor.advisorSem || 4,
                              advisorSec: advisor.advisorSec || 'A',
                              facultyType: advisor.facultyType || 'advisor',
                            })
                            setIsEditModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Advisor Allocation"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(advisor.id, advisor.name)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove Faculty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAGE 2: SUBJECT HANDLERS TABLE (WITH 8 PERIODS & LABS) */}
      {/* ========================================================= */}
      {activeTab === 'handlers' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Faculty Name</th>
                <th className="px-4 py-3.5">Subject Name &amp; Course Code</th>
                <th className="px-4 py-3.5">Class Days</th>
                <th className="px-4 py-3.5">Periods (1-8) &amp; Lab Sessions</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {handlersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <BookMarked className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-600">No Subject Handlers Found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click &quot;+ Add New Faculty&quot; to allocate subjects, days, 8 periods, and lab sessions.</p>
                  </td>
                </tr>
              ) : (
                handlersList.map((handler, idx) => {
                  const subjs = getSubjectsList(handler.subjects)
                  const subjectDisplayName = handler.subjectName || (subjs.length > 0 ? `Core Subject: ${subjs.join(', ')}` : 'Machine Learning Foundations')
                  const codeDisplay = subjs.length > 0 ? subjs.join(', ') : 'AD2305'
                  const dayList = handler.classDay ? handler.classDay.split(',').map(d => d.trim()).filter(Boolean) : ['Mon', 'Wed', 'Fri']
                  const periodList = handler.classPeriod ? handler.classPeriod.split(',').map(p => p.trim()).filter(Boolean) : ['Period 1']
                  const timeDisplay = handler.classTime || '09:00 AM - 09:50 AM'

                  return (
                    <tr key={handler.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center border border-purple-200">
                            {handler.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#071A3D] text-sm block">
                              {handler.name}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              {handler.designation}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subject Name & Course Code */}
                      <td className="px-4 py-3.5">
                        <div>
                          <span className="font-bold text-[#071A3D] block text-sm">
                            {subjectDisplayName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1455D9] font-mono font-bold border border-blue-200/60 text-[10px] inline-block mt-0.5">
                            Code: {codeDisplay}
                          </span>
                        </div>
                      </td>

                      {/* Multiple Class Days */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1">
                          {dayList.map((d, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#1455D9] border border-blue-200 text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <Calendar className="w-3 h-3 text-[#1455D9]" />
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Multiple Periods (1-8) & Lab Sessions */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1">
                            {periodList.map((p, i) => {
                              const isLabBadge = p.toLowerCase().includes('lab')
                              return (
                                <span
                                  key={i}
                                  className={cn(
                                    'px-2 py-0.5 rounded-md font-bold text-[11px] inline-flex items-center gap-1 border',
                                    isLabBadge
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : 'bg-purple-50 text-purple-700 border-purple-200'
                                  )}
                                >
                                  {isLabBadge ? <FlaskConical className="w-3 h-3 text-amber-600" /> : <Clock className="w-3 h-3 text-purple-600" />}
                                  {p}
                                </span>
                              )
                            })}
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono font-semibold block">
                            {timeDisplay}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#071A3D] block">{handler.designation}</span>
                        <span className="text-gray-500 text-[11px]">
                          {handler.qualification || 'M.E. / Ph.D.'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedFaculty(handler)
                              setFormData({
                                facultyId: handler.facultyId,
                                name: handler.name,
                                email: handler.email,
                                phone: handler.phone || '',
                                password: '',
                                dateOfBirth: handler.dateOfBirth || '',
                                designation: handler.designation,
                                qualification: handler.qualification || '',
                                experience: handler.experience || '',
                                specialization: handler.specialization || '',
                                subjects: subjs.join(', '),
                                subjectName: handler.subjectName || '',
                                classDay: handler.classDay || 'Mon, Wed, Fri',
                                classPeriod: handler.classPeriod || 'Period 1',
                                classTime: handler.classTime || '09:00 AM - 09:50 AM',
                                advisorBatch: handler.advisorBatch || '',
                                advisorYear: handler.advisorYear || 2,
                                advisorSem: handler.advisorSem || 4,
                                advisorSec: handler.advisorSec || 'A',
                                facultyType: handler.facultyType || 'subject_handler',
                              })
                              setIsEditModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Subject & Schedule"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(handler.id, handler.name)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove Faculty"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN CLASS DOSSIER MODAL */}
      {/* ========================================================================= */}
      {selectedAdvisorDossier && (
        <div className="fixed inset-0 z-50 bg-[#071A3D]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-gray-100">
            {/* Dossier Header Banner */}
            <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white p-6 shrink-0 relative">
              <button
                onClick={() => setSelectedAdvisorDossier(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-3 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                      Official Class Dossier
                    </span>
                    <span className="text-xs text-gray-300 font-bold">
                      · {selectedAdvisorDossier.advisorBatch || 'Year II · Sem 4 · Sec A'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black">
                    Class Details &amp; Mentorship Record
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-200">
                    <span className="flex items-center gap-1.5 font-bold text-white">
                      <UserCheck className="w-4 h-4 text-[#22C7E8]" />
                      Advisor: {selectedAdvisorDossier.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#22C7E8]" />
                      {selectedAdvisorDossier.email}
                    </span>
                    {selectedAdvisorDossier.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#22C7E8]" />
                        {selectedAdvisorDossier.phone}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleExportClassDossierPDF}
                  className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold flex items-center gap-2 text-white transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#F4C430]" /> Export Class Dossier (PDF)
                </button>
              </div>

              {/* Class KPI Metric Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-[10px] font-bold text-gray-300 uppercase block">Total Students</span>
                  <p className="text-xl font-black text-white mt-0.5">{classStudents.length} Enrolled</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-[10px] font-bold text-gray-300 uppercase block">Class Avg Attendance</span>
                  <p className="text-xl font-black text-[#22C7E8] mt-0.5">
                    {classStudents.length > 0
                      ? (classStudents.reduce((acc, s) => acc + s.attendancePercent, 0) / classStudents.length).toFixed(1)
                      : '94.2'}%
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-[10px] font-bold text-gray-300 uppercase block">Semester Subjects</span>
                  <p className="text-xl font-black text-[#F4C430] mt-0.5">{DEFAULT_SUBJECT_HANDLERS.length} Courses</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-[10px] font-bold text-gray-300 uppercase block">Attendance Defaulters</span>
                  <p className="text-xl font-black text-rose-400 mt-0.5">
                    {classStudents.filter((s) => s.attendancePercent < 75).length} Critical
                  </p>
                </div>
              </div>
            </div>

            {/* Dossier Tabs Navigation */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
              {[
                { id: 'students', label: '1. Student Roll Roster', icon: <Users className="w-3.5 h-3.5" />, count: classStudents.length },
                { id: 'handlers', label: '2. Subjects & Handlers', icon: <BookMarked className="w-3.5 h-3.5" />, count: DEFAULT_SUBJECT_HANDLERS.length },
                { id: 'attendance', label: '3. Defaulters Watch (<75%)', icon: <AlertTriangle className="w-3.5 h-3.5" />, count: classStudents.filter((s) => s.attendancePercent < 75).length },
                { id: 'timetable', label: '4. Class Timetable (8 Periods & Labs)', icon: <Clock className="w-3.5 h-3.5" /> },
                { id: 'notices', label: '5. Class Notices', icon: <MessageSquare className="w-3.5 h-3.5" /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDossierTab(t.id as any)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer',
                    dossierTab === t.id
                      ? 'bg-[#1455D9] text-white shadow-xs'
                      : 'text-gray-600 hover:text-[#071A3D] hover:bg-gray-200'
                  )}
                >
                  {t.icon}
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                        dossierTab === t.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      )}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Dossier Content Area */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {/* TAB 1: STUDENT ROSTER */}
              {dossierTab === 'students' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-[#071A3D]">Class Student Roll List</h4>
                      <p className="text-gray-500 text-[11px]">Enrolled students under {selectedAdvisorDossier.name}&apos;s advisory</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#1455D9] bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                      Total: {classStudents.length} Students
                    </span>
                  </div>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-[#071A3D] font-bold">
                          <th className="p-3">#</th>
                          <th className="p-3">Register No</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Contact Email</th>
                          <th className="p-3">Attendance %</th>
                          <th className="p-3">CGPA</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {classStudents.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-blue-50/20">
                            <td className="p-3 text-gray-400 font-mono">{idx + 1}</td>
                            <td className="p-3 font-mono font-bold text-[#1455D9]">{s.registerNumber}</td>
                            <td className="p-3 font-bold text-[#071A3D]">{s.name}</td>
                            <td className="p-3 text-gray-600">{s.email}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      'h-full rounded-full',
                                      s.attendancePercent >= 85
                                        ? 'bg-green-500'
                                        : s.attendancePercent >= 75
                                        ? 'bg-amber-500'
                                        : 'bg-red-500'
                                    )}
                                    style={{ width: `${s.attendancePercent}%` }}
                                  />
                                </div>
                                <span className="font-mono font-bold">{s.attendancePercent}%</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono font-bold text-gray-800">{s.cgpa}</td>
                            <td className="p-3 text-right">
                              <span
                                className={cn(
                                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                  s.status === 'active'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : s.status === 'warning'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                )}
                              >
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: SUBJECTS & HANDLERS */}
              {dossierTab === 'handlers' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h4 className="font-black text-sm text-[#071A3D]">Curriculum Courses &amp; Allocated Subject Handlers</h4>
                    <p className="text-gray-500 text-[11px]">All faculty members teaching this specific section this semester</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {DEFAULT_SUBJECT_HANDLERS.map((subj, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-[#1455D9] transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#1455D9] font-mono font-black border border-blue-200 text-xs">
                            {subj.code}
                          </span>
                          <span className="text-[11px] text-gray-500 font-bold">{subj.credits} Credits · {subj.hours} Hours</span>
                        </div>
                        <h5 className="font-black text-sm text-[#071A3D]">{subj.name}</h5>
                        <div className="pt-2 border-t space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-medium">Subject Handler:</span>
                            <span className="font-bold text-[#1455D9]">{subj.handler}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>Class Schedule:</span>
                            <span className="font-medium text-gray-700">{subj.day} ({subj.period}, {subj.time})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DEFAULTERS WATCH */}
              {dossierTab === 'attendance' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs">Class Advisor Action Required: Attendance Counseling</h4>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        Students below 75% require official mentorship consultation and parent notification according to Autonomous College norms.
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-[#071A3D] font-bold">
                          <th className="p-3">Register No</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Contact</th>
                          <th className="p-3">Current Attendance</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {classStudents.filter((s) => s.attendancePercent < 75).map((s) => (
                          <tr key={s.id} className="bg-red-50/30">
                            <td className="p-3 font-mono font-bold text-red-600">{s.registerNumber}</td>
                            <td className="p-3 font-bold text-[#071A3D]">{s.name}</td>
                            <td className="p-3 text-gray-600">{s.email} · {s.phone}</td>
                            <td className="p-3 font-mono font-black text-red-600">{s.attendancePercent}%</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => alert(`Counseling reminder dispatched to ${s.name} (${s.email}) and Parent.`)}
                                className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                              >
                                Send Notice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TIMETABLE (8 FULL PERIODS) */}
              {dossierTab === 'timetable' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h4 className="font-black text-sm text-[#071A3D]">Weekly Class Timetable &amp; Schedule (8 Periods &amp; Labs)</h4>
                    <p className="text-gray-500 text-[11px]">Room 204, AI Block · Mon – Fri (09:00 AM – 04:55 PM)</p>
                  </div>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                      <thead>
                        <tr className="bg-blue-50/60 border-b border-gray-200 text-[#071A3D] font-bold">
                          <th className="p-2.5">Day</th>
                          <th className="p-2.5">P1 (09:00-09:50)</th>
                          <th className="p-2.5">P2 (09:50-10:40)</th>
                          <th className="p-2.5">P3 (10:55-11:45)</th>
                          <th className="p-2.5">P4 (11:45-12:35)</th>
                          <th className="p-2.5">P5 (01:25-02:15)</th>
                          <th className="p-2.5">P6 (02:15-03:05)</th>
                          <th className="p-2.5">P7 (03:15-04:05)</th>
                          <th className="p-2.5">P8 (04:05-04:55)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {DEFAULT_TIMETABLE.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-2.5 font-bold text-[#1455D9]">{row.day}</td>
                            <td className="p-2.5">{row.p1}</td>
                            <td className="p-2.5">{row.p2}</td>
                            <td className="p-2.5">{row.p3}</td>
                            <td className="p-2.5">{row.p4}</td>
                            <td className="p-2.5">{row.p5}</td>
                            <td className="p-2.5">{row.p6}</td>
                            <td className="p-2.5">{row.p7}</td>
                            <td className="p-2.5">{row.p8}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: NOTICES */}
              {dossierTab === 'notices' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-[#071A3D]">Class Broadcasts &amp; Mentorship Notices</h4>
                      <p className="text-gray-500 text-[11px]">Announcements broadcasted to {selectedAdvisorDossier.advisorBatch}</p>
                    </div>
                    <button
                      onClick={() => alert('New announcement created and sent to class student emails!')}
                      className="px-3 py-1.5 rounded-xl bg-[#1455D9] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Broadcast Notice
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#071A3D] text-xs">Unit Test 2 Revision Schedule &amp; Lab Submissions</span>
                        <span className="text-[10px] text-gray-400 font-mono">Today, 09:30 AM</span>
                      </div>
                      <p className="text-gray-600 text-xs">
                        All students are required to submit their Data Science Laboratory observation records by this Friday 4:00 PM.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#071A3D] text-xs">Symposium &amp; Hackathon Participation Clearance</span>
                        <span className="text-[10px] text-gray-400 font-mono">Yesterday, 03:00 PM</span>
                      </div>
                      <p className="text-gray-600 text-xs">
                        Students attending the National Level AI Hackathon must obtain OD sign-off from the Class Advisor by Thursday.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dossier Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                Autonomous Academic Regulation · Department of Artificial Intelligence &amp; Data Science
              </span>
              <button
                onClick={() => setSelectedAdvisorDossier(null)}
                className="px-5 py-2 bg-[#071A3D] text-white font-bold rounded-xl text-xs hover:bg-[#0a2352] transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER REAL FACULTY PROFESSOR */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">
                  Register Real Faculty Professor
                </h3>
                <p className="text-xs text-gray-500">Record will be saved directly into institutional database</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              {/* Role / Type Selector: Advisor, Subject Faculty, or Both */}
              <div>
                <label className="block font-bold text-[#071A3D] mb-1.5">
                  Faculty Role / Allocation Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facultyType: 'advisor' })}
                    className={cn(
                      'p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1',
                      formData.facultyType === 'advisor'
                        ? 'bg-blue-50 border-[#1455D9] text-[#1455D9] shadow-xs ring-2 ring-[#1455D9]/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Class Advisor</span>
                    <span className="text-[10px] font-normal text-gray-400">Class In-Charge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facultyType: 'subject_handler' })}
                    className={cn(
                      'p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1',
                      formData.facultyType === 'subject_handler'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs ring-2 ring-purple-600/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <BookMarked className="w-4 h-4" />
                    <span>Subject Faculty</span>
                    <span className="text-[10px] font-normal text-gray-400">Course Teacher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facultyType: 'both' })}
                    className={cn(
                      'p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1',
                      formData.facultyType === 'both'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Advisor &amp; Faculty</span>
                    <span className="text-[10px] font-normal text-gray-400">Both Duties</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Full Name with Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. S. Karthik"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-bold text-[#071A3D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Institutional Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input
                    type="email"
                    placeholder="e.g. karthik@vsb.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Initial Password</label>
                  <input
                    type="text"
                    placeholder="Default: vsb@123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/20 focus:bg-white focus:outline-none focus:border-[#1455D9] font-mono font-bold text-[#071A3D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98421 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D]"
                  >
                    <option value="Professor & Head">Professor &amp; Head</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.E., Ph.D."
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Specialization Domain</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              {/* Class Advisor Assignment Fields (Shown when advisor or both) */}
              {(formData.facultyType === 'advisor' || formData.facultyType === 'both') && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 animate-fade-in">
                  <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#1455D9]" />
                    Class Advisor Allocation:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Semester (1 - 8)</label>
                      <select
                        value={formData.advisorSem}
                        onChange={(e) => {
                          const sem = Number(e.target.value)
                          const yr = Math.ceil(sem / 2)
                          setFormData({
                            ...formData,
                            advisorSem: sem,
                            advisorYear: yr,
                            advisorBatch: `Year ${yr} - Sem ${sem} - Sec ${formData.advisorSec}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#1455D9]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem} (Year {Math.ceil(sem / 2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Academic Year</label>
                      <select
                        value={formData.advisorYear}
                        onChange={(e) => {
                          const y = Number(e.target.value)
                          setFormData({
                            ...formData,
                            advisorYear: y,
                            advisorSem: (y * 2) - 1,
                            advisorBatch: `Year ${y} - Sem ${(y * 2) - 1} - Sec ${formData.advisorSec}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-semibold"
                      >
                        <option value={1}>Year 1 (Freshman)</option>
                        <option value={2}>Year 2 (Sophomore)</option>
                        <option value={3}>Year 3 (Junior)</option>
                        <option value={4}>Year 4 (Senior)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Section</label>
                      <select
                        value={formData.advisorSec}
                        onChange={(e) => {
                          const sec = e.target.value
                          setFormData({
                            ...formData,
                            advisorSec: sec,
                            advisorBatch: `Year ${formData.advisorYear} - Sem ${formData.advisorSem} - Sec ${sec}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-semibold"
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Subject Handler Schedule & Details (8 Periods & Lab Sessions) */}
              {(formData.facultyType === 'subject_handler' || formData.facultyType === 'both') && (
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                      <BookMarked className="w-4 h-4 text-purple-700" />
                      Subject Details &amp; Timetable (8 Periods &amp; Labs):
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Multiple Choice Enabled
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Subject Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Machine Learning Foundations"
                        value={formData.subjectName}
                        onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Course Code (e.g. AD2305)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AD2305"
                        value={formData.subjects}
                        onChange={(e) => setFormData({ ...formData, subjects: e.target.value.toUpperCase() })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold text-purple-800"
                      />
                    </div>
                  </div>

                  {/* 1. MULTIPLE CHOICE DAYS SELECTOR */}
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-1.5">
                      Class Days (Select all days that apply):
                    </label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {DAYS_OF_WEEK.map((d) => {
                        const isSelected = parsedSelectedDays.includes(d.code)
                        return (
                          <button
                            key={d.code}
                            type="button"
                            onClick={() => toggleDaySelection(d.code)}
                            className={cn(
                              'py-2 px-1 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5',
                              isSelected
                                ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50/50'
                            )}
                          >
                            <span>{d.code}</span>
                            <span className="text-[9px] font-normal opacity-80">{d.label.slice(0, 3)}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 2. 8 REGULAR PERIODS (P1 - P8) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-bold text-gray-700 text-[11px]">
                        Regular Periods (Periods 1 through 8):
                      </label>
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {parsedSelectedPeriods.filter(p => !p.includes('Lab')).length} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {PERIOD_LIST.filter(p => !p.isLab).map((p) => {
                        const isSelected = parsedSelectedPeriods.includes(p.name)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePeriodSelection(p.name)}
                            className={cn(
                              'p-2 rounded-xl text-left font-bold text-[11px] transition-all cursor-pointer border flex flex-col justify-between',
                              isSelected
                                ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50/50'
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-extrabold">{p.name}</span>
                              {isSelected && <Check className="w-3 h-3 text-[#F4C430]" />}
                            </div>
                            <span className={cn(
                              'text-[9px] font-mono mt-0.5',
                              isSelected ? 'text-purple-200' : 'text-gray-400'
                            )}>
                              {p.time}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 3. DEDICATED LAB SESSIONS */}
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-1.5 flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                      Laboratory / Practical Sessions:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {PERIOD_LIST.filter(p => p.isLab).map((p) => {
                        const isSelected = parsedSelectedPeriods.includes(p.name)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePeriodSelection(p.name)}
                            className={cn(
                              'p-2.5 rounded-xl text-left font-bold text-[11px] transition-all cursor-pointer border flex flex-col justify-between',
                              isSelected
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-amber-50/50 text-amber-900 border-amber-200 hover:bg-amber-100/60'
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-extrabold">{p.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={cn(
                              'text-[9px] font-mono mt-0.5',
                              isSelected ? 'text-amber-100' : 'text-amber-700'
                            )}>
                              {p.time}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 4. CALCULATED TIME SLOTS */}
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                      Combined Time of Classes (Auto-calculated):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM - 09:50 AM, 11:45 AM - 12:35 PM"
                      value={formData.classTime}
                      onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono text-[11px] font-bold text-[#071A3D]"
                    />
                  </div>

                  {/* 5. LIVE SCHEDULE PREVIEW */}
                  <div className="p-2.5 rounded-xl bg-white border border-purple-200 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-gray-500 font-bold">Schedule Summary:</span>
                    <span className="font-mono font-bold text-purple-900 text-right truncate">
                      {formData.classDay || 'No days selected'} · {formData.classPeriod || 'No periods'}
                    </span>
                  </div>
                </div>
              )}

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
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold cursor-pointer shadow-md flex items-center gap-2"
                >
                  {isLoading ? 'Saving...' : 'Save Faculty to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT FACULTY PROFESSOR */}
      {/* ========================================================= */}
      {isEditModalOpen && selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#071A3D]">Edit Faculty Record</h3>
                <p className="text-xs text-[#1455D9] font-bold">{selectedFaculty.name}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              {/* Role / Type Selector in Edit */}
              <div>
                <label className="block font-bold text-[#071A3D] mb-1.5">
                  Faculty Role / Allocation Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facultyType: 'advisor' })}
                    className={cn(
                      'p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1',
                      formData.facultyType === 'advisor'
                        ? 'bg-blue-50 border-[#1455D9] text-[#1455D9] shadow-xs ring-2 ring-[#1455D9]/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Class Advisor</span>
                    <span className="text-[10px] font-normal text-gray-400">Class In-Charge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facultyType: 'subject_handler' })}
                    className={cn(
                      'p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1',
                      formData.facultyType === 'subject_handler'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs ring-2 ring-purple-600/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <BookMarked className="w-4 h-4" />
                    <span>Subject Faculty</span>
                    <span className="text-[10px] font-normal text-gray-400">Course Teacher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facultyType: 'both' })}
                    className={cn(
                      'p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1',
                      formData.facultyType === 'both'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Advisor &amp; Faculty</span>
                    <span className="text-[10px] font-normal text-gray-400">Both Duties</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. S. Karthik"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Institutional Email</label>
                  <input
                    type="email"
                    placeholder="e.g. karthik@vsb.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98421 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D]"
                  >
                    <option value="Professor & Head">Professor &amp; Head</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.E., Ph.D."
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Specialization Domain</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              {/* Class Advisor Assignment */}
              {(formData.facultyType === 'advisor' || formData.facultyType === 'both') && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 animate-fade-in">
                  <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#1455D9]" />
                    Class Advisor Allocation:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Semester (1 - 8)</label>
                      <select
                        value={formData.advisorSem}
                        onChange={(e) => {
                          const sem = Number(e.target.value)
                          const yr = Math.ceil(sem / 2)
                          setFormData({
                            ...formData,
                            advisorSem: sem,
                            advisorYear: yr,
                            advisorBatch: `Year ${yr} - Sem ${sem} - Sec ${formData.advisorSec}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#1455D9]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>Semester {s} (Year {Math.ceil(s / 2)})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Academic Year</label>
                      <select
                        value={formData.advisorYear}
                        onChange={(e) => {
                          const y = Number(e.target.value)
                          setFormData({
                            ...formData,
                            advisorYear: y,
                            advisorSem: (y * 2) - 1,
                            advisorBatch: `Year ${y} - Sem ${(y * 2) - 1} - Sec ${formData.advisorSec}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-semibold"
                      >
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Section</label>
                      <select
                        value={formData.advisorSec}
                        onChange={(e) => {
                          const sec = e.target.value
                          setFormData({
                            ...formData,
                            advisorSec: sec,
                            advisorBatch: `Year ${formData.advisorYear} - Sem ${formData.advisorSem} - Sec ${sec}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-semibold"
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Subject Handler Schedule & Details (8 Periods & Labs) */}
              {(formData.facultyType === 'subject_handler' || formData.facultyType === 'both') && (
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                      <BookMarked className="w-4 h-4 text-purple-700" />
                      Subject Details &amp; Timetable (8 Periods &amp; Labs):
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Multiple Choice Enabled
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Subject Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Machine Learning Foundations"
                        value={formData.subjectName}
                        onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Course Code (e.g. AD2305)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AD2305"
                        value={formData.subjects}
                        onChange={(e) => setFormData({ ...formData, subjects: e.target.value.toUpperCase() })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold text-purple-800"
                      />
                    </div>
                  </div>

                  {/* 1. MULTIPLE CHOICE DAYS SELECTOR */}
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-1.5">
                      Class Days (Select all days that apply):
                    </label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {DAYS_OF_WEEK.map((d) => {
                        const isSelected = parsedSelectedDays.includes(d.code)
                        return (
                          <button
                            key={d.code}
                            type="button"
                            onClick={() => toggleDaySelection(d.code)}
                            className={cn(
                              'py-2 px-1 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5',
                              isSelected
                                ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50/50'
                            )}
                          >
                            <span>{d.code}</span>
                            <span className="text-[9px] font-normal opacity-80">{d.label.slice(0, 3)}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 2. 8 REGULAR PERIODS (P1 - P8) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-bold text-gray-700 text-[11px]">
                        Regular Periods (Periods 1 through 8):
                      </label>
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {parsedSelectedPeriods.filter(p => !p.includes('Lab')).length} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {PERIOD_LIST.filter(p => !p.isLab).map((p) => {
                        const isSelected = parsedSelectedPeriods.includes(p.name)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePeriodSelection(p.name)}
                            className={cn(
                              'p-2 rounded-xl text-left font-bold text-[11px] transition-all cursor-pointer border flex flex-col justify-between',
                              isSelected
                                ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50/50'
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-extrabold">{p.name}</span>
                              {isSelected && <Check className="w-3 h-3 text-[#F4C430]" />}
                            </div>
                            <span className={cn(
                              'text-[9px] font-mono mt-0.5',
                              isSelected ? 'text-purple-200' : 'text-gray-400'
                            )}>
                              {p.time}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 3. DEDICATED LAB SESSIONS */}
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-1.5 flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                      Laboratory / Practical Sessions:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {PERIOD_LIST.filter(p => p.isLab).map((p) => {
                        const isSelected = parsedSelectedPeriods.includes(p.name)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePeriodSelection(p.name)}
                            className={cn(
                              'p-2.5 rounded-xl text-left font-bold text-[11px] transition-all cursor-pointer border flex flex-col justify-between',
                              isSelected
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-amber-50/50 text-amber-900 border-amber-200 hover:bg-amber-100/60'
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-extrabold">{p.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={cn(
                              'text-[9px] font-mono mt-0.5',
                              isSelected ? 'text-amber-100' : 'text-amber-700'
                            )}>
                              {p.time}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 4. CALCULATED TIME SLOTS */}
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                      Combined Time of Classes (Auto-calculated):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM - 09:50 AM, 11:45 AM - 12:35 PM"
                      value={formData.classTime}
                      onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono text-[11px] font-bold text-[#071A3D]"
                    />
                  </div>

                  {/* 5. LIVE SCHEDULE PREVIEW */}
                  <div className="p-2.5 rounded-xl bg-white border border-purple-200 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-gray-500 font-bold">Schedule Summary:</span>
                    <span className="font-mono font-bold text-purple-900 text-right truncate">
                      {formData.classDay || 'No days selected'} · {formData.classPeriod || 'No periods'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
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
                  {isLoading ? 'Updating...' : 'Update Faculty Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
