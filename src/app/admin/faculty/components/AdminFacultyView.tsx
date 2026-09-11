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
  EyeOff,
  Key,
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
  ChevronDown,
  School,
  Lock,
  Clock,
  AlertTriangle,
  FileText,
  Send,
  MessageSquare,
  Check,
  FlaskConical,
  Coffee,
  Utensils,
  Zap,
  CheckSquare,
  Code2,
  Database,
  Cloud,
  Cpu,
  BarChart3,
  MessagesSquare,
  Compass,
  Globe,
  Rocket,
  BriefcaseBusiness,
  Printer,
  RotateCcw,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface LabItem {
  id: string
  code: string
  name: string
  shortName: string
  credits: number
  defaultPeriod: string
  defaultTime: string
  defaultDays: string
}

export interface SemesterLabGroup {
  semNumber: number
  yearNumber: number
  semLabel: string
  badgeColor: string
  labs: LabItem[]
}

export type SemestersLabsMap = Record<string, SemesterLabGroup>

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

export type SemKey = 'sem1' | 'sem2' | 'sem3' | 'sem4' | 'sem5' | 'sem6' | 'sem7' | 'sem8'

// All 8 Semesters (Years I - IV) Practical Laboratories & Training Curricula
export const ALL_SEMESTERS_LABS: Record<SemKey, SemesterLabGroup> = {
  sem1: {
    semNumber: 1,
    yearNumber: 1,
    semLabel: 'Semester 1 (Year 1 - Freshman Odd)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    labs: [
      { id: 'lab_s1_py', code: 'AD2111', name: 'Problem Solving and Python Programming Laboratory', shortName: 'Python Lab', credits: 2, defaultPeriod: 'Lab Session (FN)', defaultTime: '09:15 AM - 12:30 PM', defaultDays: 'Tue' },
      { id: 'lab_s1_bs', code: 'BS2111', name: 'Physics and Chemistry Practical Laboratory', shortName: 'Physics & Chem Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Thu' },
    ],
  },
  sem2: {
    semNumber: 2,
    yearNumber: 1,
    semLabel: 'Semester 2 (Year 1 - Freshman Even)',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    labs: [
      { id: 'lab_s2_c', code: 'AD2211', name: 'C Programming and Data Structures Laboratory', shortName: 'C Programming Lab', credits: 2, defaultPeriod: 'Lab Session (FN)', defaultTime: '09:15 AM - 12:30 PM', defaultDays: 'Wed' },
      { id: 'lab_s2_ep', code: 'GE2211', name: 'Engineering Practices Laboratory', shortName: 'Engg Practices Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Fri' },
    ],
  },
  sem3: {
    semNumber: 3,
    yearNumber: 2,
    semLabel: 'Semester 3 (Year 2 - Sophomore Odd)',
    badgeColor: 'bg-blue-50 text-[#1455D9] border-blue-200',
    labs: [
      { id: 'lab_s3_oop', code: 'AD2311', name: 'Object Oriented Programming Laboratory', shortName: 'OOP Lab (Java/C++)', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Tue' },
      { id: 'lab_s3_ds', code: 'AD2312', name: 'Data Structures Design and Analysis Laboratory', shortName: 'Data Structures Lab', credits: 2, defaultPeriod: 'Lab Session (FN)', defaultTime: '09:15 AM - 12:30 PM', defaultDays: 'Thu' },
    ],
  },
  sem4: {
    semNumber: 4,
    yearNumber: 2,
    semLabel: 'Semester 4 (Year 2 - Sophomore Even)',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    labs: [
      { id: 'lab_s4_dbms', code: 'AD2411', name: 'Database Management Systems Laboratory', shortName: 'DBMS Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Mon' },
      { id: 'lab_s4_os', code: 'AD2412', name: 'Operating Systems and Networks Laboratory', shortName: 'OS & Networks Lab', credits: 2, defaultPeriod: 'Lab Session (FN)', defaultTime: '09:15 AM - 12:30 PM', defaultDays: 'Wed' },
    ],
  },
  sem5: {
    semNumber: 5,
    yearNumber: 3,
    semLabel: 'Semester 5 (Year 3 - Junior Odd)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    labs: [
      { id: 'lab_s5_dl', code: 'AD2511', name: 'Deep Learning and Neural Networks Laboratory', shortName: 'Deep Learning Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Wed' },
      { id: 'lab_s5_bd', code: 'AD2512', name: 'Big Data Technologies and Cloud Computing Laboratory', shortName: 'Big Data & Cloud Lab', credits: 2, defaultPeriod: 'Lab Session (FN)', defaultTime: '09:15 AM - 12:30 PM', defaultDays: 'Fri' },
    ],
  },
  sem6: {
    semNumber: 6,
    yearNumber: 3,
    semLabel: 'Semester 6 (Year 3 - Junior Even)',
    badgeColor: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    labs: [
      { id: 'lab_s6_nlp', code: 'AD2611', name: 'Natural Language Processing & CV Laboratory', shortName: 'NLP & Vision Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Thu' },
      { id: 'lab_s6_fs', code: 'AD2612', name: 'Mobile App & Full Stack Development Laboratory', shortName: 'Full Stack Lab', credits: 2, defaultPeriod: 'Lab Session (FN)', defaultTime: '09:15 AM - 12:30 PM', defaultDays: 'Mon' },
    ],
  },
  sem7: {
    semNumber: 7,
    yearNumber: 4,
    semLabel: 'Semester 7 (Year 4 - Senior Odd)',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    labs: [
      { id: 'lab_s7_rl', code: 'AD2711', name: 'Reinforcement Learning and Robotics Laboratory', shortName: 'Robotics & RL Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Fri' },
      { id: 'lab_s7_edge', code: 'AD2712', name: 'Edge AI and IoT Analytics Practical Practicum', shortName: 'Edge AI Practicum', credits: 2, defaultPeriod: 'Lab Session (FN)', defaultTime: '09:15 AM - 12:30 PM', defaultDays: 'Tue' },
    ],
  },
  sem8: {
    semNumber: 8,
    yearNumber: 4,
    semLabel: 'Semester 8 (Year 4 - Capstone Even)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    labs: [
      { id: 'lab_s8_proj', code: 'AD2811', name: 'Capstone Project Work & Industrial Internship', shortName: 'Capstone Project', credits: 6, defaultPeriod: 'Full Day Dedicated Block', defaultTime: '09:15 AM - 04:30 PM', defaultDays: 'Mon, Tue, Wed, Thu, Fri' },
    ],
  },
}

// Active Odd Semesters (Semesters 3, 5, 7) Theory Curricula & Presets
export const ALL_SEMESTERS_THEORY_SUBJECTS = {
  sem3: {
    semNumber: 3,
    yearNumber: 2,
    semLabel: 'Semester 3 (Year 2 - Odd)',
    badgeColor: 'bg-blue-50 text-[#1455D9] border-blue-200',
    subjects: [
      { id: 's3_ds', code: 'AD2301', name: 'Data Structures and Algorithm Design', shortName: 'Data Structures', credits: 3, defaultPeriods: 'Period 1, Period 2', defaultDays: 'Mon, Wed, Fri' },
      { id: 's3_dbms_th', code: 'AD2302', name: 'Database Management Systems', shortName: 'DBMS Theory', credits: 3, defaultPeriods: 'Period 2, Period 3', defaultDays: 'Tue, Thu' },
      { id: 's3_oop_th', code: 'AD2303', name: 'Object Oriented Programming with Java/C++', shortName: 'OOP Theory', credits: 3, defaultPeriods: 'Period 4, Period 5', defaultDays: 'Mon, Thu' },
      { id: 's3_ai_th', code: 'AD2304', name: 'Artificial Intelligence Principles & Tech', shortName: 'AI Principles', credits: 3, defaultPeriods: 'Period 3, Period 4', defaultDays: 'Wed, Fri' },
      { id: 's3_math3', code: 'MA2301', name: 'Discrete Mathematics & Graph Theory', shortName: 'Discrete Maths', credits: 4, defaultPeriods: 'Period 1, Period 3', defaultDays: 'Tue, Fri' },
    ],
  },
  sem5: {
    semNumber: 5,
    yearNumber: 3,
    semLabel: 'Semester 5 (Year 3 - Odd)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    subjects: [
      { id: 's5_dl_th', code: 'AD2501', name: 'Deep Learning Architectures & Neural Nets', shortName: 'Deep Learning', credits: 3, defaultPeriods: 'Period 1, Period 2', defaultDays: 'Mon, Wed' },
      { id: 's5_bigdata_th', code: 'AD2502', name: 'Big Data Technologies & Ecosystems', shortName: 'Big Data Theory', credits: 3, defaultPeriods: 'Period 2, Period 3', defaultDays: 'Tue, Thu' },
      { id: 's5_cloud_th', code: 'AD2503', name: 'Cloud Computing Architecture and DevOps', shortName: 'Cloud Computing', credits: 3, defaultPeriods: 'Period 3, Period 4', defaultDays: 'Mon, Fri' },
      { id: 's5_se', code: 'AD2504', name: 'Software Engineering and Agile Methodologies', shortName: 'Software Engg', credits: 3, defaultPeriods: 'Period 4, Period 5', defaultDays: 'Wed, Fri' },
    ],
  },
  sem7: {
    semNumber: 7,
    yearNumber: 4,
    semLabel: 'Semester 7 (Year 4 - Odd)',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    subjects: [
      { id: 's7_rl', code: 'AD2701', name: 'Reinforcement Learning and Robotics', shortName: 'Reinforcement Learning', credits: 3, defaultPeriods: 'Period 1, Period 2', defaultDays: 'Mon, Wed' },
      { id: 's7_edge', code: 'AD2702', name: 'Edge AI and IoT Analytics', shortName: 'Edge AI & IoT', credits: 3, defaultPeriods: 'Period 2, Period 3', defaultDays: 'Tue, Thu' },
      { id: 's7_bi', code: 'AD2703', name: 'Business Intelligence and Data Mining', shortName: 'Business Intel', credits: 3, defaultPeriods: 'Period 3, Period 4', defaultDays: 'Wed, Fri' },
      { id: 's7_ethics', code: 'AD2704', name: 'Professional Ethics & AI Governance', shortName: 'AI Ethics', credits: 2, defaultPeriods: 'Period 5, Period 6', defaultDays: 'Thu, Fri' },
    ],
  },
}

const DEFAULT_SUBJECT_HANDLERS: any[] = []

// 8 Periods & Institutional Bell Timings (FN Lab: 09:15-12:30, AN Lab: 01:20-04:30)
const PERIOD_LIST = [
  { id: 'P1', name: 'Period 1', time: '09:15 AM - 10:00 AM', isLab: false, duration: '45 mins', session: 'Morning Theory' },
  { id: 'P2', name: 'Period 2', time: '10:00 AM - 10:45 AM', isLab: false, duration: '45 mins', session: 'Morning Theory' },
  { id: 'P3', name: 'Period 3', time: '11:00 AM - 11:45 AM', isLab: false, duration: '45 mins', session: 'Mid-Morning Core' },
  { id: 'P4', name: 'Period 4', time: '11:45 AM - 12:30 PM', isLab: false, duration: '45 mins', session: 'Mid-Morning Core' },
  { id: 'P5', name: 'Period 5', time: '01:20 PM - 02:05 PM', isLab: false, duration: '45 mins', session: 'Afternoon Theory / Lab' },
  { id: 'P6', name: 'Period 6', time: '02:05 PM - 02:50 PM', isLab: false, duration: '45 mins', session: 'Afternoon Theory / Lab' },
  { id: 'P7', name: 'Period 7', time: '03:05 PM - 03:50 PM', isLab: false, duration: '45 mins', session: 'Soft Skills / Self-Study' },
  { id: 'P8', name: 'Period 8', time: '03:50 PM - 04:30 PM', isLab: false, duration: '40 mins', session: 'Aptitude / Mentorship' },
  { id: 'LAB_FN', name: 'Lab Session (FN)', time: '09:15 AM - 12:30 PM', isLab: true, duration: '3h 15m', session: 'Periods 1-4 Practical' },
  { id: 'LAB_AN', name: 'Lab Session (AN)', time: '01:20 PM - 04:30 PM', isLab: true, duration: '3h 10m', session: 'Periods 5-8 Practical' },
]

const DAYS_OF_WEEK = [
  { code: 'Mon', label: 'Monday' },
  { code: 'Tue', label: 'Tuesday' },
  { code: 'Wed', label: 'Wednesday' },
  { code: 'Thu', label: 'Thursday' },
  { code: 'Fri', label: 'Friday' },
  { code: 'Sat', label: 'Saturday' },
]

export function AdminFacultyView({ initialFaculty }: { initialFaculty: FacultyRecord[] }) {
  // Active View Tab: 'faculty' (Theory Courses) vs 'labs' (Practical Laboratories) vs 'advisors' (Class Mentors)
  const [activeTab, setActiveTab] = useState<'faculty' | 'labs' | 'advisors'>('faculty')
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>(initialFaculty)
  const [searchQuery, setSearchQuery] = useState('')
  const [facultyYearFilter, setFacultyYearFilter] = useState('ALL')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [semFilter, setSemFilter] = useState('ALL')
  const [sectionFilter, setSectionFilter] = useState('ALL')
  const [designationFilter, setDesignationFilter] = useState('ALL')
  const [labYearFilter, setLabYearFilter] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL')
  const [labSemesterFilter, setLabSemesterFilter] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(false)

  const fetchFaculty = async () => {
    try {
      const res = await fetch('/api/faculty')
      const data = await res.json()
      if (data.success && Array.isArray(data.faculty)) {
        setFacultyList(data.faculty)
      }
    } catch {}
  }

  useEffect(() => {
    if (initialFaculty && initialFaculty.length > 0) {
      setFacultyList(initialFaculty)
    }
    fetchFaculty()
    const interval = setInterval(fetchFaculty, 45000)
    return () => clearInterval(interval)
  }, [initialFaculty])

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  // Dossier Modal for Class Advisor
  const [selectedAdvisorDossier, setSelectedAdvisorDossier] = useState<FacultyRecord | null>(null)
  const [dossierTab, setDossierTab] = useState<'students' | 'handlers' | 'attendance' | 'notices'>('students')
  const [classStudents, setClassStudents] = useState<StudentInClass[]>([])
  const [loadingClassData, setLoadingClassData] = useState(false)

  // Form state supporting Theory, Lab Handlers & Class Mentorship simultaneously
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    designation: '',
    qualification: '',
    experience: '' as any,
    specialization: '',
    // Class Advisor Mentorship
    isClassAdvisor: false,
    advisorBatch: '',
    advisorYear: 2,
    advisorSem: 3,
    advisorSec: 'A',
    // Theory Course Allocation
    hasTheory: false,
    teachingYear: 2,
    teachingSem: 3,
    subjects: '',
    subjectName: '',
    classDay: '',
    classPeriod: '',
    classTime: '',
    // Lab Practical Allocation
    hasLab: false,
    labSubjectName: '',
    labSubjectCode: '',
    labYear: 2,
    labSem: 3,
    labDay: '',
    labPeriod: '',
    labTime: '',
    // Legacy / Type compatibility
    allocationType: 'theory' as 'theory' | 'lab' | 'both',
    facultyType: 'both',
  })

  // Quick Presets Modal Tab for Labs & Theory Courses (Semesters 1 - 8)
  const [quickLabTab, setQuickLabTab] = useState<string>('sem3')
  const [quickTheoryTab, setQuickTheoryTab] = useState<string>('sem3')

  // Dynamic Editable Labs State (Persistent across browser reloads, without mock data)
  const [semestersLabs, setSemestersLabs] = useState<Record<string, SemesterLabGroup>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('VSB_AIDS_EDITABLE_LABS_V2')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && typeof parsed === 'object' && parsed.sem1) return parsed
        }
      } catch {}
    }
    return ALL_SEMESTERS_LABS
  })

  // Save changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('VSB_AIDS_EDITABLE_LABS_V2', JSON.stringify(semestersLabs))
      } catch {}
    }
  }, [semestersLabs])



  // Apply Quick Lab Preset into Form
  const applyLabPreset = (lab: {
    code: string
    name: string
    shortName: string
    defaultPeriod: string
    defaultTime: string
    defaultDays: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      hasLab: true,
      labSubjectName: lab.name,
      labSubjectCode: lab.code,
      labPeriod: lab.defaultPeriod,
      labTime: lab.defaultTime,
      labDay: lab.defaultDays,
    }))
  }

  // Apply Quick Theory Subject Preset into Form
  const applyTheoryPreset = (subject: {
    code: string
    name: string
    shortName: string
    defaultPeriods: string
    defaultDays: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      hasTheory: true,
      subjectName: subject.name,
      subjects: subject.code,
      classPeriod: subject.defaultPeriods,
      classTime: '09:15 AM - 10:45 AM',
      classDay: subject.defaultDays,
    }))
  }

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

  // Toggle Multiple Theory Days
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

  // Toggle Multiple Lab Days
  const toggleLabDaySelection = (dayCode: string) => {
    const currentDays = formData.labDay
      ? formData.labDay.split(',').map((d) => d.trim()).filter(Boolean)
      : []
    const nextDays = currentDays.includes(dayCode)
      ? currentDays.filter((d) => d !== dayCode)
      : [...currentDays, dayCode]
    
    setFormData({
      ...formData,
      labDay: nextDays.join(', '),
    })
  }

  // Toggle Multiple Theory Periods & Auto-calculate combined times
  const togglePeriodSelection = (periodName: string) => {
    const currentPeriods = formData.classPeriod
      ? formData.classPeriod.split(',').map((p) => p.trim()).filter(Boolean)
      : []
    const nextPeriods = currentPeriods.includes(periodName)
      ? currentPeriods.filter((p) => p !== periodName)
      : [...currentPeriods, periodName]

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

  // Toggle Lab Session Period
  const toggleLabPeriodSelection = (periodName: string) => {
    const currentPeriods = formData.labPeriod
      ? formData.labPeriod.split(',').map((p) => p.trim()).filter(Boolean)
      : []
    const nextPeriods = currentPeriods.includes(periodName)
      ? currentPeriods.filter((p) => p !== periodName)
      : [...currentPeriods, periodName]

    const calculatedTimes = nextPeriods.map((p) => {
      const found = PERIOD_LIST.find((item) => item.name === p)
      return found ? found.time : ''
    }).filter(Boolean)

    setFormData({
      ...formData,
      labPeriod: nextPeriods.join(', '),
      labTime: calculatedTimes.join(', ') || '01:20 PM - 04:30 PM',
    })
  }

  // Helper to determine faculty teaching / academic year
  const getFacultyYear = (f: FacultyRecord): number => {
    if (f.advisorYear && f.advisorYear >= 1 && f.advisorYear <= 4) {
      return Number(f.advisorYear)
    }
    const combined = `${f.subjectName || ''} ${f.advisorBatch || ''} ${Array.isArray(f.subjects) ? f.subjects.join(' ') : f.subjects || ''}`
    if (/Year 1|Year I\b|Sem 1|Sem 2|AD21|GE21|HS21|MA21|CS22/i.test(combined)) return 1
    if (/Year 2|Year II\b|Sem 3|Sem 4|AD23|AD24|CS23|CS24/i.test(combined)) return 2
    if (/Year 3|Year III\b|Sem 5|Sem 6|AD25|AD26|CS25|CS26/i.test(combined)) return 3
    if (/Year 4|Year IV\b|Sem 7|Sem 8|AD27|AD28|CS27|CS28/i.test(combined)) return 4
    return 2
  }

  // Load students for the selected class dossier
  useEffect(() => {
    if (!selectedAdvisorDossier) return
    const year = selectedAdvisorDossier.advisorYear || 2
    const sem = selectedAdvisorDossier.advisorSem || 3
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
          setClassStudents([])
        }
      })
      .catch(() => {
        setClassStudents([])
      })
      .finally(() => setLoadingClassData(false))
  }, [selectedAdvisorDossier])

  // Filtered lists for Class Advisors / In-charges
  const advisorsList = useMemo(() => {
    return facultyList.filter((f) => {
      const isAdvisor =
        Boolean(f.advisorBatch || (f.advisorYear && f.advisorSec)) ||
        f.facultyType === 'advisor' ||
        f.facultyType === 'both'

      if (!isAdvisor) return false

      const matchesSearch =
        !searchQuery ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.advisorBatch && f.advisorBatch.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesYear =
        yearFilter === 'ALL' ||
        String(f.advisorYear) === yearFilter ||
        (f.advisorBatch && f.advisorBatch.includes(`Year ${yearFilter}`))

      const matchesSem =
        semFilter === 'ALL' ||
        String(f.advisorSem) === semFilter ||
        (f.advisorBatch && f.advisorBatch.includes(`Sem ${semFilter}`))

      const matchesSection =
        sectionFilter === 'ALL' ||
        f.advisorSec?.toUpperCase() === sectionFilter.toUpperCase() ||
        (f.advisorBatch && f.advisorBatch.includes(`Sec ${sectionFilter}`))

      return matchesSearch && matchesYear && matchesSem && matchesSection
    })
  }, [facultyList, searchQuery, yearFilter, semFilter, sectionFilter])

  // Filtered lists for all Faculty Members (All faculty with Theory and Practical Labs)
  const facultyMembersList = useMemo(() => {
    return facultyList.filter((f) => {
      const subjs = getSubjectsList(f.subjects)
      const hasTheoryCourses = Boolean(f.subjectName && !f.subjectName.toLowerCase().includes('lab')) || (Array.isArray(subjs) && subjs.some(s => !s.toLowerCase().includes('lab') && !s.includes('11') && !s.includes('12')))

      // Exclude pure class advisors who do not teach theory courses
      if (f.facultyType === 'advisor' && !hasTheoryCourses) {
        return false
      }

      // Exclude pure lab handlers with no theory
      if (f.facultyType === 'lab_faculty' && !hasTheoryCourses) {
        return false
      }

      // If advisor batch is assigned without any theory subjects, treat as pure advisor
      const isAdvisor = Boolean(f.advisorBatch || (f.advisorYear && f.advisorSec)) || f.facultyType === 'advisor'
      if (isAdvisor && !hasTheoryCourses) {
        return false
      }

      const matchesSearch =
        !searchQuery ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.subjectName && f.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.classDay && f.classDay.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.classPeriod && f.classPeriod.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.advisorBatch && f.advisorBatch.toLowerCase().includes(searchQuery.toLowerCase())) ||
        f.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subjs.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesDesignation =
        designationFilter === 'ALL' ||
        f.designation.toLowerCase().includes(designationFilter.toLowerCase())

      const fYear = getFacultyYear(f)
      const matchesYear =
        facultyYearFilter === 'ALL' || String(fYear) === String(facultyYearFilter)

      return matchesSearch && matchesDesignation && matchesYear
    })
  }, [facultyList, searchQuery, designationFilter, facultyYearFilter])

  // Filtered lists for Lab Handlers
  const labHandlersList = useMemo(() => {
    return facultyList.filter((f) => {
      const subjs = getSubjectsList(f.subjects)

      // Exclude faculty strictly configured as advisors only with no lab/theory
      if (f.facultyType === 'advisor') {
        return false
      }

      const isLab =
        f.facultyType === 'lab_faculty' ||
        f.facultyType === 'both' ||
        (f.subjectName && f.subjectName.toLowerCase().includes('lab')) ||
        (f.classPeriod && f.classPeriod.toLowerCase().includes('lab')) ||
        subjs.some((s) => s.includes('11') || s.includes('12') || s.toLowerCase().includes('lab'))

      if (!isLab) return false

      const matchesSearch =
        !searchQuery ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.subjectName && f.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.classDay && f.classDay.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.classPeriod && f.classPeriod.toLowerCase().includes(searchQuery.toLowerCase())) ||
        f.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subjs.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesDesignation =
        designationFilter === 'ALL' ||
        f.designation.toLowerCase().includes(designationFilter.toLowerCase())

      const fYear = getFacultyYear(f)
      const matchesYear =
        labYearFilter === 'ALL' || String(fYear) === String(labYearFilter)

      // Lab Semester filter
      let matchesLabSem = true
      if (labSemesterFilter !== 'ALL' && semestersLabs[labSemesterFilter as keyof typeof semestersLabs]) {
        const targetLabs = semestersLabs[labSemesterFilter as keyof typeof semestersLabs].labs
        matchesLabSem = targetLabs.some(
          (l) => (f.subjectName && f.subjectName.toLowerCase().includes(l.shortName.toLowerCase())) || subjs.includes(l.code)
        )
      }

      return matchesSearch && matchesDesignation && matchesYear && matchesLabSem
    })
  }, [facultyList, searchQuery, designationFilter, labYearFilter, labSemesterFilter, semestersLabs])

  // Combined handlers list for backward compatibility if needed
  const handlersList = useMemo(() => {
    return facultyList.filter((f) => {
      if (f.facultyType === 'advisor') return false
      return (
        f.facultyType === 'subject_handler' ||
        f.facultyType === 'lab_faculty' ||
        f.facultyType === 'both' ||
        !f.facultyType
      )
    })
  }, [facultyList])

  // PDF Export
  const handleExportPDF = () => {
    const isAdvisors = activeTab === 'advisors'
    const isLabs = activeTab === 'labs'
    const currentList = isAdvisors ? advisorsList : isLabs ? labHandlersList : facultyMembersList
    
    generateAndDownloadPDF({
      title: isAdvisors
        ? 'DEPARTMENT OF AI & DS — CLASS ADVISORS DIRECTORY'
        : isLabs
        ? 'DEPARTMENT OF AI & DS — LABORATORY HANDLERS DIRECTORY'
        : 'DEPARTMENT OF AI & DS — FACULTY MEMBERS DIRECTORY',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Department Administrator',
      category: isAdvisors ? 'Class In-Charges & Mentors' : isLabs ? 'Practical Laboratory Handlers' : 'Theory & Practical Faculty Members',
      sections: [
        {
          heading: isAdvisors ? '1. CLASS ADVISORS SUMMARY' : isLabs ? '1. LAB HANDLERS SUMMARY' : '1. FACULTY MEMBERS SUMMARY',
          body: [
            `Total Faculty Count: ${facultyList.length} Faculty Members`,
            `Active View: ${isAdvisors ? 'Class Mentors & Batch In-Charges' : isLabs ? 'Laboratory Handlers & Practical Sessions' : 'Faculty Members (Theory Courses & Practical Laboratories)'}`,
            `Department: Artificial Intelligence & Data Science (AI & DS)`,
            `Curriculum Scope: All 8 Semesters (Sem 1 to Sem 8)`,
          ],
        },
        {
          heading: isAdvisors ? '2. CLASS ADVISORS ALLOCATION' : isLabs ? '2. LAB HANDLER ALLOCATIONS' : '2. FACULTY COURSE ALLOCATIONS',
          body: currentList.map((f, idx) => {
            if (isAdvisors) {
              return `${idx + 1}. ${f.name} — ${f.designation} | Assigned Batch: ${f.advisorBatch || 'Year II (Sec A)'} | Contact: ${f.email}`
            } else if (isLabs) {
              const subjs = getSubjectsList(f.subjects).join(', ') || 'AD2311'
              const sName = f.subjectName?.includes(' | ') ? f.subjectName.split(' | ')[1] : f.subjectName || 'Laboratory Practical'
              return `${idx + 1}. ${f.name} — Lab: ${sName} [${subjs}] | Timetable: ${f.classDay || 'Tue'} (${f.classPeriod || 'Lab Session'}) | ${f.designation}`
            } else {
              const subjs = getSubjectsList(f.subjects).join(', ') || 'AD2301'
              const sName = f.subjectName || 'Course / Practical'
              const sDay = f.classDay || 'Mon, Wed, Fri'
              const sPeriod = f.classPeriod || 'Regular Period'
              const sTime = f.classTime || 'Class Hours'
              return `${idx + 1}. ${f.name} — ${sName} [${subjs}] | Days: ${sDay} | Periods: ${sPeriod} (${sTime}) | ${f.designation}`
            }
          }),
        },
      ],
      fileName: isAdvisors ? 'VSB_AI_DS_Class_Advisors_2026' : isLabs ? 'VSB_AI_DS_Lab_Handlers_2026' : 'VSB_AI_DS_Faculty_Members_2026',
    })
  }

  // Export Specific Class Dossier PDF
  const handleExportClassDossierPDF = () => {
    if (!selectedAdvisorDossier) return
    generateAndDownloadPDF({
      title: `CLASS DOSSIER: ${selectedAdvisorDossier.advisorBatch || 'Year II - Sem 3 - Sec A'}`,
      subtitle: `Class Advisor: ${selectedAdvisorDossier.name} · Department of AI & DS`,
      author: 'Class Advisory Mentorship Record',
      category: 'Official Class Details & Student Roster',
      sections: [
        {
          heading: '1. CLASS ADVISOR & BATCH DETAILS',
          body: [
            `Class Advisor: ${selectedAdvisorDossier.name} (${selectedAdvisorDossier.designation})`,
            `Assigned Class: ${selectedAdvisorDossier.advisorBatch || 'Year 2, Sem 3, Sec A'}`,
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
    if (!formData.name.trim() || !formData.password.trim()) {
      toast.error('Please fill in Faculty Name and Temporary Password.')
      return
    }

    setIsLoading(true)
    try {
      let finalSubjects: string[] = []
      let finalSubjectName = ''
      let finalClassPeriod = ''
      let finalClassDay = ''
      let finalClassTime = ''

      if (formData.hasTheory && formData.hasLab) {
        finalSubjects = [formData.subjects.trim(), formData.labSubjectCode.trim()].filter(Boolean)
        finalSubjectName = [formData.subjectName.trim(), formData.labSubjectName.trim()].filter(Boolean).join(' | ')
        finalClassPeriod = [formData.classPeriod.trim(), formData.labPeriod.trim()].filter(Boolean).join(' | ')
        finalClassDay = [formData.classDay.trim(), formData.labDay.trim()].filter(Boolean).join(' | ')
        finalClassTime = [formData.classTime.trim(), formData.labTime.trim()].filter(Boolean).join(' | ')
      } else if (formData.hasLab) {
        finalSubjects = formData.labSubjectCode ? [formData.labSubjectCode.trim()] : []
        finalSubjectName = formData.labSubjectName.trim()
        finalClassPeriod = formData.labPeriod.trim()
        finalClassDay = formData.labDay.trim()
        finalClassTime = formData.labTime.trim()
      } else if (formData.hasTheory) {
        if (formData.subjects.trim()) {
          try {
            finalSubjects = JSON.parse(formData.subjects)
          } catch {
            finalSubjects = formData.subjects.split(',').map((s) => s.trim()).filter(Boolean)
          }
        }
        finalSubjectName = formData.subjectName.trim()
        finalClassPeriod = formData.classPeriod.trim()
        finalClassDay = formData.classDay.trim()
        finalClassTime = formData.classTime.trim()
      }

      const isAdvisorRole = Boolean(formData.isClassAdvisor)
      let computedFacultyType = 'subject_handler'
      if (formData.hasLab && (formData.hasTheory || isAdvisorRole)) {
        computedFacultyType = 'both'
      } else if (formData.hasLab) {
        computedFacultyType = 'lab_faculty'
      } else if (isAdvisorRole && !formData.hasTheory) {
        computedFacultyType = 'advisor'
      } else if (isAdvisorRole && formData.hasTheory) {
        computedFacultyType = 'both'
      } else {
        computedFacultyType = 'subject_handler'
      }

      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          password: formData.password.trim(),
          experience: Number(formData.experience) || 1,
          subjects: finalSubjects,
          subjectName: finalSubjectName || null,
          classDay: finalClassDay || null,
          classPeriod: finalClassPeriod || null,
          classTime: finalClassTime || null,
          advisorBatch: isAdvisorRole
            ? (formData.advisorBatch || `Year ${formData.advisorYear || 2} - Sem ${formData.advisorSem || 3} - Sec ${formData.advisorSec || 'A'}`)
            : null,
          advisorYear: isAdvisorRole ? Number(formData.advisorYear || 2) : null,
          advisorSem: isAdvisorRole ? Number(formData.advisorSem || 3) : null,
          advisorSec: isAdvisorRole ? (formData.advisorSec || 'A') : null,
          facultyType: computedFacultyType,
        }),
      })
      const result = await res.json()

      if (result.success && result.faculty) {
        setFacultyList([result.faculty, ...facultyList])
        setIsAddModalOpen(false)
        if (activeTab === 'advisors' && isAdvisorRole) {
          setActiveTab('advisors')
        } else if (activeTab === 'labs' && formData.hasLab) {
          setActiveTab('labs')
        }
        resetForm()
        toast.success('Faculty registered successfully in database!')
      } else {
        toast.error(result.message || 'Failed to register faculty')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error adding faculty.')
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
      let finalSubjects: string[] = []
      let finalSubjectName = ''
      let finalClassPeriod = ''
      let finalClassDay = ''
      let finalClassTime = ''

      if (formData.hasTheory && formData.hasLab) {
        finalSubjects = [formData.subjects.trim(), formData.labSubjectCode.trim()].filter(Boolean)
        finalSubjectName = [formData.subjectName.trim(), formData.labSubjectName.trim()].filter(Boolean).join(' | ')
        finalClassPeriod = [formData.classPeriod.trim(), formData.labPeriod.trim()].filter(Boolean).join(' | ')
        finalClassDay = [formData.classDay.trim(), formData.labDay.trim()].filter(Boolean).join(' | ')
        finalClassTime = [formData.classTime.trim(), formData.labTime.trim()].filter(Boolean).join(' | ')
      } else if (formData.hasLab) {
        finalSubjects = formData.labSubjectCode ? [formData.labSubjectCode.trim()] : []
        finalSubjectName = formData.labSubjectName.trim()
        finalClassPeriod = formData.labPeriod.trim()
        finalClassDay = formData.labDay.trim()
        finalClassTime = formData.labTime.trim()
      } else if (formData.hasTheory) {
        if (formData.subjects.trim()) {
          try {
            finalSubjects = JSON.parse(formData.subjects)
          } catch {
            finalSubjects = formData.subjects.split(',').map((s) => s.trim()).filter(Boolean)
          }
        }
        finalSubjectName = formData.subjectName.trim()
        finalClassPeriod = formData.classPeriod.trim()
        finalClassDay = formData.classDay.trim()
        finalClassTime = formData.classTime.trim()
      }

      const isAdvisorRole = Boolean(formData.isClassAdvisor)
      let computedFacultyType = 'subject_handler'
      if (formData.hasLab && (formData.hasTheory || isAdvisorRole)) {
        computedFacultyType = 'both'
      } else if (formData.hasLab) {
        computedFacultyType = 'lab_faculty'
      } else if (isAdvisorRole && !formData.hasTheory) {
        computedFacultyType = 'advisor'
      } else if (isAdvisorRole && formData.hasTheory) {
        computedFacultyType = 'both'
      } else {
        computedFacultyType = 'subject_handler'
      }

      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          password: formData.password?.trim() || undefined,
          facultyId: selectedFaculty.facultyId,
          experience: Number(formData.experience) || 1,
          subjects: finalSubjects,
          subjectName: finalSubjectName || null,
          classDay: finalClassDay || null,
          classPeriod: finalClassPeriod || null,
          classTime: finalClassTime || null,
          advisorBatch: isAdvisorRole
            ? (formData.advisorBatch || `Year ${formData.advisorYear || 2} - Sem ${formData.advisorSem || 3} - Sec ${formData.advisorSec || 'A'}`)
            : null,
          advisorYear: isAdvisorRole ? Number(formData.advisorYear || 2) : null,
          advisorSem: isAdvisorRole ? Number(formData.advisorSem || 3) : null,
          advisorSec: isAdvisorRole ? (formData.advisorSec || 'A') : null,
          facultyType: computedFacultyType,
        }),
      })
      const result = await res.json()

      if (result.success) {
        setFacultyList(
          facultyList.map((f) =>
            f.facultyId === selectedFaculty.facultyId
              ? {
                  ...f,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  designation: formData.designation,
                  qualification: formData.qualification,
                  experience: Number(formData.experience) || 1,
                  specialization: formData.specialization,
                  subjects: finalSubjects,
                  subjectName: finalSubjectName,
                  classDay: finalClassDay,
                  classPeriod: finalClassPeriod,
                  classTime: finalClassTime,
                  advisorBatch: isAdvisorRole ? (formData.advisorBatch || `Year ${formData.advisorYear || 2} - Sem ${formData.advisorSem || 3} - Sec ${formData.advisorSec || 'A'}`) : null,
                  advisorYear: isAdvisorRole ? Number(formData.advisorYear || 2) : null,
                  advisorSem: isAdvisorRole ? Number(formData.advisorSem || 3) : null,
                  advisorSec: isAdvisorRole ? (formData.advisorSec || 'A') : null,
                  facultyType: computedFacultyType,
                }
              : f
          )
        )
        setIsEditModalOpen(false)
        toast.success('Faculty record updated in database!')
      } else {
        toast.error(result.message || 'Failed to update faculty')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error updating faculty.')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset Add Form
  const resetForm = () => {
    setFormData({
      facultyId: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      dateOfBirth: '',
      designation: '',
      qualification: '',
      experience: '' as any,
      specialization: '',
      isClassAdvisor: activeTab === 'advisors',
      advisorBatch: '',
      advisorYear: 2,
      advisorSem: 3,
      advisorSec: 'A',
      hasTheory: false,
      teachingYear: 2,
      teachingSem: 3,
      subjects: '',
      subjectName: '',
      classDay: '',
      classPeriod: '',
      classTime: '',
      hasLab: false,
      labSubjectName: '',
      labSubjectCode: '',
      labYear: 2,
      labSem: 3,
      labDay: '',
      labPeriod: '',
      labTime: '',
      allocationType: activeTab === 'labs' ? 'lab' : 'theory',
      facultyType: activeTab === 'advisors' ? 'advisor' : activeTab === 'labs' ? 'lab_faculty' : 'both',
    })
  }

  // Populate Edit Form Helper
  const populateEditForm = (faculty: FacultyRecord) => {
    setSelectedFaculty(faculty)
    const subjs = getSubjectsList(faculty.subjects)
    const isAdvisor = Boolean(faculty.advisorBatch || (faculty.advisorYear && faculty.advisorSec)) || faculty.facultyType === 'advisor' || faculty.facultyType === 'both'

    const hasPipe = (faculty.subjectName || '').includes(' | ')
    const isLabOnly = faculty.facultyType === 'lab_faculty' || (!hasPipe && ((faculty.subjectName && faculty.subjectName.toLowerCase().includes('lab')) || (faculty.classPeriod && faculty.classPeriod.toLowerCase().includes('lab'))))

    let hasTheory = false
    let hasLab = false
    let theoryName = ''
    let theoryCode = ''
    let labName = ''
    let labCode = ''
    let theoryDay = ''
    let theoryPeriod = ''
    let theoryTime = ''
    let labDay = ''
    let labPeriod = ''
    let labTime = ''

    if (hasPipe) {
      hasTheory = true
      hasLab = true
      const sParts = (faculty.subjectName || '').split(' | ')
      theoryName = sParts[0] || ''
      labName = sParts[1] || ''

      if (subjs.length >= 2) {
        theoryCode = subjs[0]
        labCode = subjs[1]
      } else if (subjs.length === 1) {
        theoryCode = subjs[0]
      }

      if (faculty.classPeriod?.includes(' | ')) {
        const pParts = faculty.classPeriod.split(' | ')
        theoryPeriod = pParts[0] || ''
        labPeriod = pParts[1] || ''
      }
      if (faculty.classDay?.includes(' | ')) {
        const dParts = faculty.classDay.split(' | ')
        theoryDay = dParts[0] || ''
        labDay = dParts[1] || ''
      }
      if (faculty.classTime?.includes(' | ')) {
        const tParts = faculty.classTime.split(' | ')
        theoryTime = tParts[0] || ''
        labTime = tParts[1] || ''
      }
    } else if (isLabOnly) {
      hasLab = true
      hasTheory = false
      labName = faculty.subjectName || ''
      labCode = subjs.join(', ')
      labDay = faculty.classDay || ''
      labPeriod = faculty.classPeriod || ''
      labTime = faculty.classTime || ''
    } else {
      hasTheory = faculty.facultyType !== 'advisor' || Boolean(faculty.subjectName)
      hasLab = false
      theoryName = faculty.subjectName || ''
      theoryCode = subjs.join(', ')
      theoryDay = faculty.classDay || ''
      theoryPeriod = faculty.classPeriod || ''
      theoryTime = faculty.classTime || ''
    }

    const fYear = getFacultyYear(faculty)

    const rawEmail = faculty.email || ''
    const cleanEmail = (rawEmail.toLowerCase().startsWith('fac') && rawEmail.endsWith('@vsb.edu.in')) ? '' : rawEmail

    setFormData({
      facultyId: faculty.facultyId,
      name: faculty.name,
      email: cleanEmail,
      phone: faculty.phone || '',
      password: '',
      dateOfBirth: faculty.dateOfBirth || '',
      designation: faculty.designation || '',
      qualification: faculty.qualification || '',
      experience: faculty.experience && faculty.experience > 0 ? faculty.experience : '',
      specialization: faculty.specialization || '',
      isClassAdvisor: isAdvisor,
      advisorBatch: faculty.advisorBatch || '',
      advisorYear: faculty.advisorYear || 2,
      advisorSem: faculty.advisorSem || 3,
      advisorSec: faculty.advisorSec || 'A',
      hasTheory,
      teachingYear: fYear,
      teachingSem: fYear * 2 - 1,
      subjects: theoryCode,
      subjectName: theoryName,
      classDay: theoryDay,
      classPeriod: theoryPeriod,
      classTime: theoryTime,
      hasLab,
      labSubjectName: labName,
      labSubjectCode: labCode,
      labYear: fYear,
      labSem: fYear * 2 - 1,
      labDay,
      labPeriod,
      labTime,
      allocationType: hasLab && !hasTheory ? 'lab' : 'theory',
      facultyType: faculty.facultyType || (isAdvisor ? 'both' : hasLab ? 'lab_faculty' : 'subject_handler'),
    })
    setShowEditPassword(false)
    setIsEditModalOpen(true)
  }

  // Handle Delete Faculty
  const handleDelete = async (id: string, name: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setFacultyList(facultyList.filter((f) => f.id !== id && f.facultyId !== id))
        toast.success(`"${name}" removed from database.`)
      } else {
        toast.error(result.message || 'Failed to delete faculty')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting faculty.')
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

  // Selected Lab Days array helper
  const parsedLabDays = useMemo(() => {
    return formData.labDay ? formData.labDay.split(',').map((d) => d.trim()).filter(Boolean) : []
  }, [formData.labDay])

  // Selected Lab Periods array helper
  const parsedLabPeriods = useMemo(() => {
    return formData.labPeriod ? formData.labPeriod.split(',').map((p) => p.trim()).filter(Boolean) : []
  }, [formData.labPeriod])

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Active Odd Semesters (Sem 3, 5, 7)
            </span>
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Faculty Directorate &amp; Odd Semesters Labs</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Active curriculum management for <strong>Semesters 3, 5 &amp; 7 (Years 2, 3, 4)</strong> · 8 Periods Daily (09:15 AM – 04:30 PM) · FN &amp; AN Practical Lab Sessions.
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
              resetForm()
              setIsAddModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Add New Faculty
          </button>
        </div>
      </div>

      {/* STEP 1: CHOOSE FACULTY CADRE / DIVISION */}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cadre 1: Faculty Members (Theory Courses) */}
            <button
              onClick={() => setActiveTab('faculty')}
              className={cn(
                'flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer text-left',
                activeTab === 'faculty'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-600/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0',
                  activeTab === 'faculty' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#071A3D]">Faculty Members</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Theory Courses &amp; Class Lectures</p>
                </div>
              </div>
              <span className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-black font-mono shrink-0',
                activeTab === 'faculty' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
              )}>
                {facultyMembersList.length} Faculty
              </span>
            </button>

            {/* Cadre 2: Lab Handlers (Practical Laboratories) */}
            <button
              onClick={() => setActiveTab('labs')}
              className={cn(
                'flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer text-left',
                activeTab === 'labs'
                  ? 'border-purple-600 bg-purple-50/50 shadow-sm ring-2 ring-purple-600/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0',
                  activeTab === 'labs' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#071A3D]">Lab Handlers</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Practical Laboratories &amp; Sessions</p>
                </div>
              </div>
              <span className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-black font-mono shrink-0',
                activeTab === 'labs' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
              )}>
                {labHandlersList.length} Handlers
              </span>
            </button>

            {/* Cadre 3: Class Advisors & Mentors */}
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
                  'w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0',
                  activeTab === 'advisors' ? 'bg-[#1455D9] text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#071A3D]">Class Advisors</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Batch Mentors across 8 Semesters</p>
                </div>
              </div>
              <span className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-black font-mono shrink-0',
                activeTab === 'advisors' ? 'bg-[#1455D9] text-white' : 'bg-gray-100 text-gray-700'
              )}>
                {advisorsList.length} In-charges
              </span>
            </button>
          </div>
        </div>

        {/* STEP 2: Filter Faculty by Teaching Year (Years I – IV) */}
        {activeTab === 'faculty' && (
          <div className="border-t border-gray-100 pt-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">2</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                  Step 2: Choose Class / Filter Faculty by Academic Year (Years I, II, III &amp; IV)
                </h3>
              </div>
              {facultyYearFilter !== 'ALL' && (
                <button
                  onClick={() => setFacultyYearFilter('ALL')}
                  className="text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer"
                >
                  Show All Years
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => setFacultyYearFilter('ALL')}
                className={cn(
                  'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center',
                  facultyYearFilter === 'ALL'
                    ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-xs'
                    : 'bg-gray-50 hover:bg-indigo-50 border-gray-200 text-gray-700'
                )}
              >
                <span className="text-xs font-black">All Faculty (Years 1 - 4)</span>
                <span className="text-[9px] font-mono opacity-80">{facultyMembersList.length} Total</span>
              </button>

              {[
                { yr: 1, label: 'Year I (Freshman)', sems: 'Sem 1 & 2' },
                { yr: 2, label: 'Year II (Sophomore)', sems: 'Sem 3 & 4' },
                { yr: 3, label: 'Year III (Junior)', sems: 'Sem 5 & 6' },
                { yr: 4, label: 'Year IV (Senior)', sems: 'Sem 7 & 8' },
              ].map((item) => {
                const isSelected = facultyYearFilter === String(item.yr)
                const count = facultyMembersList.filter((f) => getFacultyYear(f) === item.yr).length

                return (
                  <button
                    key={item.yr}
                    onClick={() => setFacultyYearFilter(String(item.yr))}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center',
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-600/20'
                        : 'bg-gray-50/80 hover:bg-indigo-50 border-gray-200 text-[#071A3D]'
                    )}
                  >
                    <span className="text-xs font-black">{item.label}</span>
                    <span className={cn('text-[10px] font-bold', isSelected ? 'text-[#F4C430]' : 'text-gray-400')}>
                      {item.sems} ({count} Faculty)
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Filter Lab Handlers by Year & Semester */}
        {activeTab === 'labs' && (
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-black flex items-center justify-center">2</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                  Step 2: Filter Practical Labs by Year &amp; Semester (Practical Curriculum)
                </h3>
              </div>
              {(labYearFilter !== 'ALL' || labSemesterFilter !== 'ALL') && (
                <button
                  onClick={() => { setLabYearFilter('ALL'); setLabSemesterFilter('ALL'); }}
                  className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
                >
                  Reset All Lab Filters
                </button>
              )}
            </div>

            {/* Row A: Lab Academic Year */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => { setLabYearFilter('ALL'); setLabSemesterFilter('ALL'); }}
                className={cn(
                  'p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center',
                  labYearFilter === 'ALL'
                    ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-xs'
                    : 'bg-gray-50 hover:bg-purple-50 border-gray-200 text-gray-700'
                )}
              >
                <span className="text-xs font-black">All Practical Labs</span>
                <span className="text-[9px] font-mono opacity-80">{labHandlersList.length} Handlers</span>
              </button>

              {[
                { yr: 1, label: 'Year I Labs', sems: 'Sem 1 & 2' },
                { yr: 2, label: 'Year II Labs', sems: 'Sem 3 & 4' },
                { yr: 3, label: 'Year III Labs', sems: 'Sem 5 & 6' },
                { yr: 4, label: 'Year IV Labs', sems: 'Sem 7 & 8' },
              ].map((item) => {
                const isSelected = labYearFilter === item.yr
                return (
                  <button
                    key={item.yr}
                    onClick={() => {
                      setLabYearFilter(item.yr as any)
                      setLabSemesterFilter('ALL')
                    }}
                    className={cn(
                      'p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center',
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs ring-2 ring-purple-600/20'
                        : 'bg-gray-50 hover:bg-purple-50 border-gray-200 text-[#071A3D]'
                    )}
                  >
                    <span className="text-xs font-black">{item.label}</span>
                    <span className={cn('text-[10px] font-bold', isSelected ? 'text-[#F4C430]' : 'text-gray-400')}>
                      {item.sems}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Row B: Semester Lab Chips (Sem 1 to Sem 8) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
              <span className="text-[10px] font-black uppercase text-gray-400 shrink-0 mr-1">Semester:</span>
              <button
                onClick={() => setLabSemesterFilter('ALL')}
                className={cn(
                  'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  labSemesterFilter === 'ALL'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                All 8 Semesters
              </button>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
                const semKey = `sem${s}`
                const isSelected = labSemesterFilter === semKey
                const labsCount = semestersLabs[semKey]?.labs.length || 0
                return (
                  <button
                    key={s}
                    onClick={() => setLabSemesterFilter(semKey)}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/50'
                    )}
                  >
                    <span>Sem {s}</span>
                    <span className={cn('text-[9px] font-mono px-1 rounded-full', isSelected ? 'bg-white/20 text-white' : 'bg-purple-200/60 text-purple-900')}>
                      {labsCount}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Filter Advisors by Academic Year (Years I – IV) */}
        {activeTab === 'advisors' && (
          <div className="border-t border-gray-100 pt-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#F4C430] text-[#071A3D] text-[11px] font-black flex items-center justify-center">2</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                  Step 2: Filter Advisors by Academic Year (Years I, II, III &amp; IV)
                </h3>
              </div>
              {(semFilter !== 'ALL' || yearFilter !== 'ALL') && (
                <button
                  onClick={() => { setSemFilter('ALL'); setYearFilter('ALL'); }}
                  className="text-[11px] font-bold text-[#1455D9] hover:underline cursor-pointer"
                >
                  Show All 4 Years
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => { setSemFilter('ALL'); setYearFilter('ALL'); }}
                className={cn(
                  'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center',
                  yearFilter === 'ALL'
                    ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-xs'
                    : 'bg-gray-50 hover:bg-blue-50 border-gray-200 text-gray-700'
                )}
              >
                <span className="text-xs font-black">All Advisors (Years 1 - 4)</span>
                <span className="text-[9px] font-mono opacity-80">{advisorsList.length} Active</span>
              </button>

              {[
                { yr: 1, label: 'Year I (Freshman)', sems: 'Sem 1 & 2', bg: 'hover:bg-blue-50' },
                { yr: 2, label: 'Year II (Sophomore)', sems: 'Sem 3 & 4', bg: 'hover:bg-indigo-50' },
                { yr: 3, label: 'Year III (Junior)', sems: 'Sem 5 & 6', bg: 'hover:bg-purple-50' },
                { yr: 4, label: 'Year IV (Senior)', sems: 'Sem 7 & 8', bg: 'hover:bg-amber-50' },
              ].map((item) => {
                const isSelected = yearFilter === String(item.yr)
                const count = facultyList.filter(
                  (f) =>
                    (f.facultyType === 'advisor' || f.facultyType === 'both') &&
                    (Number(f.advisorYear) === item.yr || (f.advisorBatch && (f.advisorBatch.includes(`Year ${item.yr}`) || f.advisorBatch.includes(`Year ${['I', 'II', 'III', 'IV'][item.yr - 1]}`))))
                ).length

                return (
                  <button
                    key={item.yr}
                    onClick={() => { setYearFilter(String(item.yr)); setSemFilter('ALL'); }}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center',
                      isSelected
                        ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs ring-2 ring-[#1455D9]/20'
                        : `bg-gray-50/80 ${item.bg} border-gray-200 text-[#071A3D]`
                    )}
                  >
                    <span className="text-xs font-black">{item.label}</span>
                    <span className={cn('text-[10px] font-bold', isSelected ? 'text-[#F4C430]' : 'text-gray-400')}>
                      {item.sems} ({count} Advisors)
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
          <p className="text-[10px] text-gray-400 font-bold uppercase">Class In-charges</p>
          <p className="text-2xl font-black text-green-700 mt-0.5">{advisorsList.length}</p>
          <p className="text-[10px] text-green-700 font-medium mt-1">Active Batch Mentors</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Theory Courses</p>
          <p className="text-2xl font-black text-indigo-700 mt-0.5">
            {facultyList.filter(f => f.facultyType === 'subject_handler' || f.facultyType === 'both' || (f.subjectName && !f.subjectName.toLowerCase().includes('lab'))).length}
          </p>
          <p className="text-[10px] text-indigo-700 font-medium mt-1">Core &amp; Elective Courses</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Laboratory Practicals</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">
            {labHandlersList.length}
          </p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Practical &amp; Applied Curricula</p>
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
                ? 'Search class advisors by name, year, or batch...'
                : activeTab === 'labs'
                ? 'Search lab handlers by lab name, course code (e.g. AD2311), faculty name...'
                : 'Search faculty members by name, theory course, year, or specialization...'
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
            Showing {
              activeTab === 'advisors'
                ? advisorsList.length
                : activeTab === 'labs'
                ? labHandlersList.length
                : facultyMembersList.length
            } of {
              activeTab === 'advisors'
                ? advisorsList.length
                : activeTab === 'labs'
                ? labHandlersList.length
                : facultyMembersList.length
            }
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. CLASS ADVISORS TABLE */}
      {/* ========================================================= */}
      {activeTab === 'advisors' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Faculty Name</th>
                <th className="px-4 py-3.5">Assigned Class &amp; Semester</th>
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
                    <p className="text-[11px] text-gray-400 mt-0.5">Click &quot;+ Add New Faculty&quot; to assign a class advisor for any of the 8 semesters.</p>
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
                          `Year ${advisor.advisorYear || 2} · Sem ${advisor.advisorSem || 3} (Sec ${advisor.advisorSec || 'A'})`}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        advisor.facultyType === 'subject_handler'
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : advisor.facultyType === 'lab_faculty'
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : advisor.facultyType === 'both'
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-[#1455D9] border-blue-200"
                      )}>
                        {advisor.facultyType === 'both'
                          ? 'Advisor & Faculty'
                          : advisor.facultyType === 'subject_handler'
                          ? 'Theory Faculty'
                          : advisor.facultyType === 'lab_faculty'
                          ? 'Lab Handler'
                          : 'Class Advisor'}
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
                          onClick={() => populateEditForm(advisor)}
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
      {/* 2. FACULTY MEMBERS TABLE (Theory / Course Instructors & Lab Practicals) */}
      {/* ========================================================= */}
      {activeTab === 'faculty' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Faculty Member</th>
                <th className="px-4 py-3.5">Class In-charge</th>
                <th className="px-4 py-3.5">Course / Theory Subject</th>
                <th className="px-4 py-3.5">Laboratory Practical</th>
                <th className="px-4 py-3.5">Designation &amp; Qualification</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {facultyMembersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-600">No Faculty Members Found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click &quot;+ Add New Faculty&quot; to register theory courses, lab practicals and faculty instructors.</p>
                  </td>
                </tr>
              ) : (
                facultyMembersList.map((faculty, idx) => {
                  const subjs = getSubjectsList(faculty.subjects)
                  const isAdvisor = Boolean(faculty.advisorBatch || (faculty.advisorYear && faculty.advisorSec)) || faculty.facultyType === 'advisor' || faculty.facultyType === 'both'
                  const hasPipe = (faculty.subjectName || '').includes(' | ')

                  let hasTheory = false
                  let hasLab = false
                  let theoryName = ''
                  let theoryCode = ''
                  let theoryDay = ''
                  let theoryPeriod = ''
                  let theoryTime = ''

                  let labName = ''
                  let labCode = ''
                  let labDay = ''
                  let labPeriod = ''
                  let labTime = ''

                  if (hasPipe) {
                    hasTheory = true
                    hasLab = true
                    const nameParts = faculty.subjectName!.split(' | ')
                    theoryName = nameParts[0] || 'Theory Course'
                    labName = nameParts[1] || 'Laboratory Practical'
                    theoryCode = subjs[0] || 'AD2301'
                    labCode = subjs.length >= 2 ? subjs[1] : 'AD2311'

                    theoryDay = faculty.classDay?.includes(' | ') ? faculty.classDay.split(' | ')[0] : faculty.classDay || 'Mon, Wed, Fri'
                    labDay = faculty.classDay?.includes(' | ') ? faculty.classDay.split(' | ')[1] : 'Tue'

                    theoryPeriod = faculty.classPeriod?.includes(' | ') ? faculty.classPeriod.split(' | ')[0] : faculty.classPeriod || 'Period 1'
                    labPeriod = faculty.classPeriod?.includes(' | ') ? faculty.classPeriod.split(' | ')[1] : 'Lab Session (AN)'

                    theoryTime = faculty.classTime?.includes(' | ') ? faculty.classTime.split(' | ')[0] : faculty.classTime || '09:15 AM - 10:00 AM'
                    labTime = faculty.classTime?.includes(' | ') ? faculty.classTime.split(' | ')[1] : '01:20 PM - 04:30 PM'
                  } else if (faculty.facultyType === 'lab_faculty' || (faculty.subjectName && faculty.subjectName.toLowerCase().includes('lab')) || (faculty.classPeriod && faculty.classPeriod.toLowerCase().includes('lab'))) {
                    hasLab = true
                    hasTheory = false
                    labName = faculty.subjectName || 'Laboratory Practical'
                    labCode = subjs.join(', ') || 'AD2311'
                    labDay = faculty.classDay || 'Tue'
                    labPeriod = faculty.classPeriod || 'Lab Session (AN)'
                    labTime = faculty.classTime || '01:20 PM - 04:30 PM'
                  } else {
                    hasTheory = faculty.facultyType !== 'advisor' || Boolean(faculty.subjectName)
                    hasLab = false
                    theoryName = faculty.subjectName || (subjs.length > 0 ? `Course: ${subjs.join(', ')}` : 'Department Course')
                    theoryCode = subjs.join(', ') || '—'
                    theoryDay = faculty.classDay || 'Mon, Wed, Fri'
                    theoryPeriod = faculty.classPeriod || 'Period 1'
                    theoryTime = faculty.classTime || '09:15 AM - 10:00 AM'
                  }

                  return (
                    <tr key={faculty.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center border",
                            hasLab && !hasTheory ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-indigo-100 text-indigo-700 border-indigo-200"
                          )}>
                            {faculty.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#071A3D] text-sm block">
                              {faculty.name}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium block">
                              {faculty.designation}
                            </span>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {isAdvisor && (
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200">
                                  Class In-charge
                                </span>
                              )}
                              {hasTheory && (
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-0.5">
                                  <BookOpen className="w-2.5 h-2.5" /> Theory
                                </span>
                              )}
                              {hasLab && (
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-0.5">
                                  <FlaskConical className="w-2.5 h-2.5" /> Lab Practical
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class In-charge Column */}
                      <td className="px-4 py-3.5">
                        {isAdvisor ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200 text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                              {faculty.advisorBatch || `Year ${faculty.advisorYear || 2} · Sem ${faculty.advisorSem || 3} (Sec ${faculty.advisorSec || 'A'})`}
                            </span>
                            <div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAdvisorDossier(faculty)
                                  setDossierTab('students')
                                }}
                                className="text-[10px] font-bold text-[#1455D9] hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> View Class Details
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>

                      {/* Course / Theory Subject */}
                      <td className="px-4 py-3.5">
                        {hasTheory ? (
                          <div>
                            <span className="font-bold text-[#071A3D] block text-xs flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              {theoryName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {theoryCode && (
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200/60 text-[10px]">
                                  {theoryCode}
                                </span>
                              )}
                              {theoryDay && (
                                <span className="text-[10px] text-gray-500 font-medium">
                                  {theoryDay}
                                </span>
                              )}
                            </div>
                            {theoryPeriod && (
                              <span className="text-[9px] text-gray-400 font-mono block mt-0.5">
                                {theoryPeriod} {theoryTime ? `(${theoryTime})` : ''}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>

                      {/* Laboratory Practical */}
                      <td className="px-4 py-3.5">
                        {hasLab ? (
                          <div>
                            <span className="font-bold text-[#071A3D] block text-xs flex items-center gap-1.5">
                              <FlaskConical className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                              {labName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {labCode && (
                                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold border border-purple-200/60 text-[10px]">
                                  {labCode}
                                </span>
                              )}
                              {labDay && (
                                <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[#1455D9] font-bold text-[10px] border border-blue-100">
                                  {labDay}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-amber-800 font-bold block mt-1">
                              {labPeriod || 'Lab Session'} {labTime ? `· ${labTime}` : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>

                      {/* Designation & Qualification */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#071A3D] block">{faculty.designation}</span>
                        <span className="text-gray-500 text-[11px]">
                          {faculty.qualification || 'Not Specified'} · {faculty.experience ? `${faculty.experience} Yrs` : 'Faculty'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => populateEditForm(faculty)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Faculty Member & Lab Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(faculty.id, faculty.name)}
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

      {/* ========================================================= */}
      {/* 3. LAB HANDLERS TABLE (Dedicated Practical Laboratories View) */}
      {/* ========================================================= */}
      {activeTab === 'labs' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Lab Handler / Faculty</th>
                <th className="px-4 py-3.5">Laboratory Practical</th>
                <th className="px-4 py-3.5">Lab Timetable Schedule</th>
                <th className="px-4 py-3.5">Role Allocation</th>
                <th className="px-4 py-3.5">Designation &amp; Qualification</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {labHandlersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <FlaskConical className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-600">No Lab Handlers Found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Assign faculty members as Lab Handlers in the Add / Edit dialog (faculty also go to lab if applicable).
                    </p>
                  </td>
                </tr>
              ) : (
                labHandlersList.map((faculty, idx) => {
                  const subjs = getSubjectsList(faculty.subjects)
                  const isAdvisor = Boolean(faculty.advisorBatch || (faculty.advisorYear && faculty.advisorSec)) || faculty.facultyType === 'advisor' || faculty.facultyType === 'both'
                  const hasPipe = (faculty.subjectName || '').includes(' | ')

                  let labName = 'Laboratory Practical'
                  let labCode = 'AD2311'
                  let labDay = 'Tue'
                  let labPeriod = 'Lab Session (AN)'
                  let labTime = '01:20 PM - 04:30 PM'

                  if (hasPipe) {
                    const nameParts = faculty.subjectName!.split(' | ')
                    labName = nameParts[1] || 'Laboratory Practical'
                    labCode = subjs.length >= 2 ? subjs[1] : subjs[0] || 'AD2311'
                    labDay = faculty.classDay?.includes(' | ') ? faculty.classDay.split(' | ')[1] : 'Tue'
                    labPeriod = faculty.classPeriod?.includes(' | ') ? faculty.classPeriod.split(' | ')[1] : 'Lab Session (AN)'
                    labTime = faculty.classTime?.includes(' | ') ? faculty.classTime.split(' | ')[1] : '01:20 PM - 04:30 PM'
                  } else {
                    labName = faculty.subjectName || 'Laboratory Practical'
                    labCode = subjs.join(', ') || 'AD2311'
                    labDay = faculty.classDay || 'Tue'
                    labPeriod = faculty.classPeriod || 'Lab Session (AN)'
                    labTime = faculty.classTime || '01:20 PM - 04:30 PM'
                  }

                  const hasTheory = hasPipe || faculty.facultyType === 'both' || (faculty.facultyType !== 'lab_faculty' && !faculty.subjectName?.toLowerCase().includes('lab'))

                  return (
                    <tr key={faculty.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center border bg-purple-100 text-purple-700 border-purple-200">
                            {faculty.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#071A3D] text-sm block">
                              {faculty.name}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium block">
                              {faculty.designation}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div>
                          <span className="font-bold text-[#071A3D] block text-xs flex items-center gap-1.5">
                            <FlaskConical className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                            {labName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold border border-purple-200/60 text-[10px] inline-block mt-0.5">
                            {labCode}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1455D9] font-bold text-[10px] border border-blue-100 inline-block">
                            {labDay}
                          </span>
                          <span className="text-[11px] text-amber-800 font-bold block mt-1">
                            {labPeriod}
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono block">
                            {labTime}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          {hasTheory ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                              <BookOpen className="w-2.5 h-2.5" /> Theory + Lab Handler
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              Lab Handler Only
                            </span>
                          )}
                          {isAdvisor && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                              <UserCheck className="w-2.5 h-2.5" /> Class In-charge
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#071A3D] block">{faculty.designation}</span>
                        <span className="text-gray-500 text-[11px]">
                          {faculty.qualification || 'M.E., Ph.D.'} · {faculty.experience ? `${faculty.experience} Yrs` : 'Faculty'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => populateEditForm(faculty)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Lab Handler & Faculty Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(faculty.id, faculty.name)}
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
                      · {selectedAdvisorDossier.advisorBatch || 'Year II · Sem 3 · Sec A'}
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
                  <span className="text-[10px] font-bold text-gray-300 uppercase block">Semester Labs &amp; Courses</span>
                  <p className="text-xl font-black text-[#F4C430] mt-0.5">{DEFAULT_SUBJECT_HANDLERS.length} Allocated</p>
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
                { id: 'handlers', label: '2. Semester Labs & Handlers', icon: <FlaskConical className="w-3.5 h-3.5" />, count: DEFAULT_SUBJECT_HANDLERS.length },
                { id: 'attendance', label: '3. Defaulters Watch (<75%)', icon: <AlertTriangle className="w-3.5 h-3.5" />, count: classStudents.filter((s) => s.attendancePercent < 75).length },
                { id: 'notices', label: '4. Class Notices & Broadcasts', icon: <MessageSquare className="w-3.5 h-3.5" /> },
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

              {/* TAB 2: SEMESTER LABS & HANDLERS */}
              {dossierTab === 'handlers' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h4 className="font-black text-sm text-[#071A3D]">Curriculum Practical Laboratories &amp; Course Instructors</h4>
                    <p className="text-gray-500 text-[11px]">Practical lab courses and subject handlers allocated for this academic class</p>
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
                        <h5 className="font-black text-sm text-[#071A3D] flex items-center gap-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-purple-700" />
                          {subj.name}
                        </h5>
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

              {/* TAB 4: NOTICES */}
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
                        All students are required to submit their Laboratory observation records by this Friday 4:00 PM.
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
                  <label className="block font-bold text-[#071A3D] mb-1">Temporary Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TempPass@2026"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/20 focus:bg-white focus:outline-none focus:border-[#1455D9] font-mono font-bold text-[#071A3D]"
                  />
                  <p className="text-[10px] text-[#1455D9] font-medium mt-1">Admin-assigned temporary password.</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. +91 98421 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D]"
                  >
                    <option value="">Select Designation (Optional)</option>
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

              {/* 1. CLASS IN-CHARGE / BATCH MENTOR ALLOCATION */}
              <div className={cn(
                "p-3.5 rounded-2xl border transition-all space-y-2.5",
                formData.isClassAdvisor ? "bg-blue-50/80 border-[#1455D9]/40 ring-2 ring-[#1455D9]/10" : "bg-gray-50/60 border-gray-200"
              )}>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isClassAdvisor}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setFormData({
                          ...formData,
                          isClassAdvisor: checked,
                          advisorBatch: checked ? (formData.advisorBatch || `Year ${formData.advisorYear || 2} - Sem ${formData.advisorSem || 3} - Sec ${formData.advisorSec || 'A'}`) : '',
                          advisorYear: checked ? (formData.advisorYear || 2) : ('' as any),
                          advisorSem: checked ? (formData.advisorSem || 3) : ('' as any),
                          advisorSec: checked ? (formData.advisorSec || 'A') : '',
                          facultyType: checked ? 'both' : (formData.allocationType === 'lab' ? 'lab_faculty' : 'subject_handler'),
                        })
                      }}
                      className="w-4 h-4 rounded text-[#1455D9] focus:ring-[#1455D9] cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-[#071A3D] text-xs flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#1455D9]" />
                        Appointed as Class In-charge (Batch Mentor)
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        Assign faculty as mentor &amp; class advisor for an academic batch
                      </span>
                    </div>
                  </label>

                  {formData.isClassAdvisor && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-black font-mono">
                      Active In-charge
                    </span>
                  )}
                </div>

                {formData.isClassAdvisor && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-100 animate-fade-in">
                    <div>
                      <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Semester</label>
                      <select
                        value={formData.advisorSem}
                        onChange={(e) => {
                          const sem = Number(e.target.value)
                          const yr = Math.ceil(sem / 2)
                          setFormData({
                            ...formData,
                            advisorSem: sem,
                            advisorYear: yr,
                            advisorBatch: `Year ${yr} - Sem ${sem} - Sec ${formData.advisorSec || 'A'}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#1455D9]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s} (Year {Math.ceil(s / 2)})
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
                          const sem = (y * 2) - 1
                          setFormData({
                            ...formData,
                            advisorYear: y,
                            advisorSem: sem,
                            advisorBatch: `Year ${y} - Sem ${sem} - Sec ${formData.advisorSec || 'A'}`,
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
                )}
              </div>

              {/* 2. THEORY COURSE ALLOCATION (CLASSROOM LECTURE) */}
              <div className={cn(
                "p-3.5 rounded-2xl border transition-all space-y-3",
                formData.hasTheory ? "bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-600/10" : "bg-gray-50/60 border-gray-200"
              )}>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.hasTheory}
                      onChange={(e) => setFormData({ ...formData, hasTheory: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-[#071A3D] text-xs flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-700" />
                        Assign Theory Course (Classroom Lecture)
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        Assign regular theory courses, curriculum lectures, and classroom hours
                      </span>
                    </div>
                  </label>
                  {formData.hasTheory && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black font-mono">
                      Active Theory
                    </span>
                  )}
                </div>

                {formData.hasTheory && (
                  <div className="space-y-3 pt-2 border-t border-indigo-100 animate-fade-in">
                    {/* Teaching Academic Year & Semester */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">Teaching Academic Year</label>
                        <select
                          value={formData.teachingYear}
                          onChange={(e) => {
                            const yr = Number(e.target.value)
                            setFormData({ ...formData, teachingYear: yr, teachingSem: yr * 2 - 1 })
                          }}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-indigo-900 text-xs"
                        >
                          <option value={1}>Year 1 (Freshman)</option>
                          <option value={2}>Year 2 (Sophomore)</option>
                          <option value={3}>Year 3 (Junior)</option>
                          <option value={4}>Year 4 (Senior)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">Theory Semester</label>
                        <select
                          value={formData.teachingSem}
                          onChange={(e) => {
                            const sem = Number(e.target.value)
                            setFormData({ ...formData, teachingSem: sem, teachingYear: Math.ceil(sem / 2) })
                          }}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-indigo-900 text-xs"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>Semester {s} (Year {Math.ceil(s / 2)})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Manual Input for Theory Subject & Course Code */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                          Theory Subject Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Data Structures & Algorithm Design"
                          value={formData.subjectName}
                          onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-indigo-600 focus:outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                          Subject Code *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. AD2301"
                          value={formData.subjects}
                          onChange={(e) => setFormData({ ...formData, subjects: e.target.value.toUpperCase() })}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold text-indigo-800 focus:border-indigo-600 focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Quick-Fill Theory Subject Presets */}
                    <div className="p-3 rounded-2xl bg-white border border-indigo-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#071A3D] flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Quick-Fill Theory Subject:
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          {[3, 5, 7].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setQuickTheoryTab(`sem${s}`)}
                              className={cn(
                                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                                quickTheoryTab === `sem${s}` ? 'bg-indigo-700 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              )}
                            >
                              Sem {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ALL_SEMESTERS_THEORY_SUBJECTS[quickTheoryTab as keyof typeof ALL_SEMESTERS_THEORY_SUBJECTS]?.subjects.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => applyTheoryPreset(s)}
                            className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-105"
                            title={`Click to auto-fill ${s.name} (${s.code})`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>{s.shortName}</span>
                            <span className="font-mono text-[9px] opacity-75">[{s.code}]</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Multiple Choice Theory Days Selector */}
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1.5">
                        Theory Class Days (Select all days that apply):
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
                                  ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-indigo-50/50'
                              )}
                            >
                              <span>{d.code}</span>
                              <span className="text-[9px] font-normal opacity-80">{d.label.slice(0, 3)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* 8 Regular Theory Periods */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block font-bold text-gray-700 text-[11px]">
                          Regular Theory Periods (Periods 1 through 8):
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
                                  ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-indigo-50/50'
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-extrabold">{p.name}</span>
                                {isSelected && <Check className="w-3 h-3 text-[#F4C430]" />}
                              </div>
                              <span className={cn(
                                'text-[9px] font-mono mt-0.5',
                                isSelected ? 'text-indigo-200' : 'text-gray-500'
                              )}>
                                {p.time}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. LABORATORY / PRACTICAL ALLOCATION (LAB HANDLER) */}
              <div className={cn(
                "p-3.5 rounded-2xl border transition-all space-y-3",
                formData.hasLab ? "bg-purple-50/70 border-purple-200 ring-2 ring-purple-600/10" : "bg-gray-50/60 border-gray-200"
              )}>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.hasLab}
                      onChange={(e) => setFormData({ ...formData, hasLab: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-[#071A3D] text-xs flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4 text-purple-700" />
                        Assign as Lab Handler (Practical Session In-Charge)
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        Faculty also go to laboratory if applicable (not all faculty are lab handlers)
                      </span>
                    </div>
                  </label>
                  {formData.hasLab && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black font-mono">
                      Active Lab Handler
                    </span>
                  )}
                </div>

                {formData.hasLab && (
                  <div className="space-y-3 pt-2 border-t border-purple-100 animate-fade-in">
                    {/* Lab Academic Year & Semester */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">Lab Academic Year</label>
                        <select
                          value={formData.labYear}
                          onChange={(e) => {
                            const yr = Number(e.target.value)
                            setFormData({ ...formData, labYear: yr, labSem: yr * 2 - 1 })
                          }}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-purple-900 text-xs"
                        >
                          <option value={1}>Year 1 (Freshman)</option>
                          <option value={2}>Year 2 (Sophomore)</option>
                          <option value={3}>Year 3 (Junior)</option>
                          <option value={4}>Year 4 (Senior)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">Lab Semester</label>
                        <select
                          value={formData.labSem}
                          onChange={(e) => {
                            const sem = Number(e.target.value)
                            setFormData({ ...formData, labSem: sem, labYear: Math.ceil(sem / 2) })
                          }}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-purple-900 text-xs"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>Semester {s} (Year {Math.ceil(s / 2)})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Manual Input for Lab Name & Course Code */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                          Laboratory Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Object Oriented Programming Laboratory"
                          value={formData.labSubjectName}
                          onChange={(e) => setFormData({ ...formData, labSubjectName: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-purple-600 focus:outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                          Lab Code *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. AD2311"
                          value={formData.labSubjectCode}
                          onChange={(e) => setFormData({ ...formData, labSubjectCode: e.target.value.toUpperCase() })}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold text-purple-800 focus:border-purple-600 focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Quick-Fill Lab Presets across All 8 Semesters */}
                    <div className="p-3 rounded-2xl bg-white border border-purple-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#071A3D] flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Quick-Fill Lab from Semester (All 8 Sems):
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setQuickLabTab(`sem${s}`)}
                              className={cn(
                                'px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                                quickLabTab === `sem${s}` ? 'bg-purple-700 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              )}
                            >
                              Sem {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto">
                        {semestersLabs[quickLabTab as keyof typeof semestersLabs]?.labs.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => applyLabPreset(l)}
                            className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-900 border border-purple-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-105"
                            title={`Click to auto-fill ${l.name} (${l.code})`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>{l.shortName}</span>
                            <span className="font-mono text-[9px] opacity-75">[{l.code}]</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Multiple Choice Lab Days Selector */}
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1.5">
                        Lab Practical Days (Select all days that apply):
                      </label>
                      <div className="grid grid-cols-6 gap-1.5">
                        {DAYS_OF_WEEK.map((d) => {
                          const isSelected = parsedLabDays.includes(d.code)
                          return (
                            <button
                              key={d.code}
                              type="button"
                              onClick={() => toggleLabDaySelection(d.code)}
                              className={cn(
                                'py-2 px-1 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5',
                                isSelected
                                  ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50/50'
                              )}
                            >
                              <span>{d.code}</span>
                              <span className="text-[9px] font-normal opacity-80">{d.label.slice(0, 3)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Dedicated Lab Sessions: FN (09:15-12:30) & AN (01:20-04:30) */}
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1.5 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                        Laboratory &amp; Practical Sessions (FN / AN):
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {PERIOD_LIST.filter(p => p.isLab).map((p) => {
                          const isSelected = parsedLabPeriods.includes(p.name)
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggleLabPeriodSelection(p.name)}
                              className={cn(
                                'p-3 rounded-2xl text-left font-bold text-xs transition-all cursor-pointer border flex flex-col justify-between',
                                isSelected
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400/40'
                                  : 'bg-white text-gray-800 border-amber-200 hover:border-amber-400 hover:bg-amber-50/40'
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-black text-sm">{p.name}</span>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-white text-amber-600 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                              <span className={cn(
                                'text-[11px] font-mono font-bold mt-1 block',
                                isSelected ? 'text-amber-100' : 'text-amber-700'
                              )}>
                                {p.time}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. COMBINED TIMINGS & LIVE SCHEDULE PREVIEW */}
              <div className="space-y-2 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                    Combined Time of Classes (Auto-calculated / Editable):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:15 AM - 10:00 AM | 01:20 PM - 04:30 PM"
                    value={formData.classTime}
                    onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono text-[11px] font-bold text-[#071A3D]"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-gray-500 font-bold">Schedule Summary:</span>
                  <span className="font-mono font-bold text-[#1455D9] text-right truncate">
                    {formData.hasTheory && `Theory: ${formData.classDay || '—'} (${formData.classPeriod || '—'})`}
                    {formData.hasTheory && formData.hasLab && ' · '}
                    {formData.hasLab && `Lab: ${formData.labDay || '—'} (${formData.labPeriod || '—'})`}
                    {!formData.hasTheory && !formData.hasLab && 'Class In-charge / Advisory Only'}
                  </span>
                </div>
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

              {/* Password / Reset Temporary Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#071A3D] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#1455D9]" />
                    <span>Reset / Change Password</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-medium">
                    (Optional — leave blank to keep existing password)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Enter new temporary password to reset (or leave blank)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/20 focus:bg-white focus:outline-none focus:border-[#1455D9] font-mono text-xs text-[#071A3D] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    title={showEditPassword ? 'Hide password' : 'Show password'}
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Only enter a password if you want to reset this faculty member's credentials. Leave blank to keep existing.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-[#071A3D]"
                  >
                    <option value="">Select Designation (Optional)</option>
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

              {/* 1. CLASS IN-CHARGE / BATCH MENTOR ALLOCATION */}
              <div className={cn(
                "p-3.5 rounded-2xl border transition-all space-y-2.5",
                formData.isClassAdvisor ? "bg-blue-50/80 border-[#1455D9]/40 ring-2 ring-[#1455D9]/10" : "bg-gray-50/60 border-gray-200"
              )}>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isClassAdvisor}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setFormData({
                          ...formData,
                          isClassAdvisor: checked,
                          advisorBatch: checked ? (formData.advisorBatch || `Year ${formData.advisorYear || 2} - Sem ${formData.advisorSem || 3} - Sec ${formData.advisorSec || 'A'}`) : '',
                          advisorYear: checked ? (formData.advisorYear || 2) : ('' as any),
                          advisorSem: checked ? (formData.advisorSem || 3) : ('' as any),
                          advisorSec: checked ? (formData.advisorSec || 'A') : '',
                          facultyType: checked ? 'both' : (formData.allocationType === 'lab' ? 'lab_faculty' : 'subject_handler'),
                        })
                      }}
                      className="w-4 h-4 rounded text-[#1455D9] focus:ring-[#1455D9] cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-[#071A3D] text-xs flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#1455D9]" />
                        Appointed as Class In-charge (Batch Mentor)
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        Assign faculty as mentor &amp; class advisor for an academic batch
                      </span>
                    </div>
                  </label>

                  {formData.isClassAdvisor && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[10px] font-black font-mono">
                      Active In-charge
                    </span>
                  )}
                </div>

                {formData.isClassAdvisor && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-100 animate-fade-in">
                    <div>
                      <label className="block font-bold text-gray-600 text-[11px] mb-0.5">Semester</label>
                      <select
                        value={formData.advisorSem}
                        onChange={(e) => {
                          const sem = Number(e.target.value)
                          const yr = Math.ceil(sem / 2)
                          setFormData({
                            ...formData,
                            advisorSem: sem,
                            advisorYear: yr,
                            advisorBatch: `Year ${yr} - Sem ${sem} - Sec ${formData.advisorSec || 'A'}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#1455D9]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s} (Year {Math.ceil(s / 2)})
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
                          const sem = (y * 2) - 1
                          setFormData({
                            ...formData,
                            advisorYear: y,
                            advisorSem: sem,
                            advisorBatch: `Year ${y} - Sem ${sem} - Sec ${formData.advisorSec || 'A'}`,
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
                )}
              </div>

              {/* 2. THEORY COURSE ALLOCATION (CLASSROOM LECTURE) */}
              <div className={cn(
                "p-3.5 rounded-2xl border transition-all space-y-3",
                formData.hasTheory ? "bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-600/10" : "bg-gray-50/60 border-gray-200"
              )}>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.hasTheory}
                      onChange={(e) => setFormData({ ...formData, hasTheory: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-[#071A3D] text-xs flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-700" />
                        Assign Theory Course (Classroom Lecture)
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        Assign regular theory courses, curriculum lectures, and classroom hours
                      </span>
                    </div>
                  </label>
                  {formData.hasTheory && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black font-mono">
                      Active Theory
                    </span>
                  )}
                </div>

                {formData.hasTheory && (
                  <div className="space-y-3 pt-2 border-t border-indigo-100 animate-fade-in">
                    {/* Teaching Academic Year & Semester */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">Teaching Academic Year</label>
                        <select
                          value={formData.teachingYear}
                          onChange={(e) => {
                            const yr = Number(e.target.value)
                            setFormData({ ...formData, teachingYear: yr, teachingSem: yr * 2 - 1 })
                          }}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-indigo-900 text-xs"
                        >
                          <option value={1}>Year 1 (Freshman)</option>
                          <option value={2}>Year 2 (Sophomore)</option>
                          <option value={3}>Year 3 (Junior)</option>
                          <option value={4}>Year 4 (Senior)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">Theory Semester</label>
                        <select
                          value={formData.teachingSem}
                          onChange={(e) => {
                            const sem = Number(e.target.value)
                            setFormData({ ...formData, teachingSem: sem, teachingYear: Math.ceil(sem / 2) })
                          }}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-indigo-900 text-xs"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>Semester {s} (Year {Math.ceil(s / 2)})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Manual Input for Theory Subject & Course Code */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                          Theory Subject Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Data Structures & Algorithm Design"
                          value={formData.subjectName}
                          onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-indigo-600 focus:outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                          Subject Code *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. AD2301"
                          value={formData.subjects}
                          onChange={(e) => setFormData({ ...formData, subjects: e.target.value.toUpperCase() })}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold text-indigo-800 focus:border-indigo-600 focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Quick-Fill Theory Subject Presets */}
                    <div className="p-3 rounded-2xl bg-white border border-indigo-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#071A3D] flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Quick-Fill Theory Subject:
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          {[3, 5, 7].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setQuickTheoryTab(`sem${s}`)}
                              className={cn(
                                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                                quickTheoryTab === `sem${s}` ? 'bg-indigo-700 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              )}
                            >
                              Sem {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ALL_SEMESTERS_THEORY_SUBJECTS[quickTheoryTab as keyof typeof ALL_SEMESTERS_THEORY_SUBJECTS]?.subjects.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => applyTheoryPreset(s)}
                            className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-105"
                            title={`Click to auto-fill ${s.name} (${s.code})`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>{s.shortName}</span>
                            <span className="font-mono text-[9px] opacity-75">[{s.code}]</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Multiple Choice Theory Days Selector */}
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1.5">
                        Theory Class Days (Select all days that apply):
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
                                  ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-indigo-50/50'
                              )}
                            >
                              <span>{d.code}</span>
                              <span className="text-[9px] font-normal opacity-80">{d.label.slice(0, 3)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* 8 Regular Theory Periods */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block font-bold text-gray-700 text-[11px]">
                          Regular Theory Periods (Periods 1 through 8):
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
                                  ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-indigo-50/50'
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-extrabold">{p.name}</span>
                                {isSelected && <Check className="w-3 h-3 text-[#F4C430]" />}
                              </div>
                              <span className={cn(
                                'text-[9px] font-mono mt-0.5',
                                isSelected ? 'text-indigo-200' : 'text-gray-500'
                              )}>
                                {p.time}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. LABORATORY / PRACTICAL ALLOCATION (LAB HANDLER) */}
              <div className={cn(
                "p-3.5 rounded-2xl border transition-all space-y-3",
                formData.hasLab ? "bg-purple-50/70 border-purple-200 ring-2 ring-purple-600/10" : "bg-gray-50/60 border-gray-200"
              )}>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.hasLab}
                      onChange={(e) => setFormData({ ...formData, hasLab: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-black text-[#071A3D] text-xs flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4 text-purple-700" />
                        Assign as Lab Handler (Practical Session In-Charge)
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        Faculty also go to laboratory if applicable (not all faculty are lab handlers)
                      </span>
                    </div>
                  </label>
                  {formData.hasLab && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black font-mono">
                      Active Lab Handler
                    </span>
                  )}
                </div>

                {formData.hasLab && (
                  <div className="space-y-3 pt-2 border-t border-purple-100 animate-fade-in">
                    {/* Lab Academic Year & Semester */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">Lab Academic Year</label>
                        <select
                          value={formData.labYear}
                          onChange={(e) => {
                            const yr = Number(e.target.value)
                            setFormData({ ...formData, labYear: yr, labSem: yr * 2 - 1 })
                          }}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-purple-900 text-xs"
                        >
                          <option value={1}>Year 1 (Freshman)</option>
                          <option value={2}>Year 2 (Sophomore)</option>
                          <option value={3}>Year 3 (Junior)</option>
                          <option value={4}>Year 4 (Senior)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">Lab Semester</label>
                        <select
                          value={formData.labSem}
                          onChange={(e) => {
                            const sem = Number(e.target.value)
                            setFormData({ ...formData, labSem: sem, labYear: Math.ceil(sem / 2) })
                          }}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-purple-900 text-xs"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>Semester {s} (Year {Math.ceil(s / 2)})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Manual Input for Lab Name & Course Code */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                          Laboratory Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Object Oriented Programming Laboratory"
                          value={formData.labSubjectName}
                          onChange={(e) => setFormData({ ...formData, labSubjectName: e.target.value })}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-purple-600 focus:outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                          Lab Code *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. AD2311"
                          value={formData.labSubjectCode}
                          onChange={(e) => setFormData({ ...formData, labSubjectCode: e.target.value.toUpperCase() })}
                          className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold text-purple-800 focus:border-purple-600 focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Quick-Fill Lab Presets across All 8 Semesters */}
                    <div className="p-3 rounded-2xl bg-white border border-purple-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#071A3D] flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Quick-Fill Lab from Semester (All 8 Sems):
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setQuickLabTab(`sem${s}`)}
                              className={cn(
                                'px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                                quickLabTab === `sem${s}` ? 'bg-purple-700 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              )}
                            >
                              Sem {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto">
                        {semestersLabs[quickLabTab as keyof typeof semestersLabs]?.labs.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => applyLabPreset(l)}
                            className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-900 border border-purple-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-105"
                            title={`Click to auto-fill ${l.name} (${l.code})`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>{l.shortName}</span>
                            <span className="font-mono text-[9px] opacity-75">[{l.code}]</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Multiple Choice Lab Days Selector */}
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1.5">
                        Lab Practical Days (Select all days that apply):
                      </label>
                      <div className="grid grid-cols-6 gap-1.5">
                        {DAYS_OF_WEEK.map((d) => {
                          const isSelected = parsedLabDays.includes(d.code)
                          return (
                            <button
                              key={d.code}
                              type="button"
                              onClick={() => toggleLabDaySelection(d.code)}
                              className={cn(
                                'py-2 px-1 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5',
                                isSelected
                                  ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50/50'
                              )}
                            >
                              <span>{d.code}</span>
                              <span className="text-[9px] font-normal opacity-80">{d.label.slice(0, 3)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Dedicated Lab Sessions: FN (09:15-12:30) & AN (01:20-04:30) */}
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-1.5 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                        Laboratory &amp; Practical Sessions (FN / AN):
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {PERIOD_LIST.filter(p => p.isLab).map((p) => {
                          const isSelected = parsedLabPeriods.includes(p.name)
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggleLabPeriodSelection(p.name)}
                              className={cn(
                                'p-3 rounded-2xl text-left font-bold text-xs transition-all cursor-pointer border flex flex-col justify-between',
                                isSelected
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400/40'
                                  : 'bg-white text-gray-800 border-amber-200 hover:border-amber-400 hover:bg-amber-50/40'
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-black text-sm">{p.name}</span>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-white text-amber-600 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                              <span className={cn(
                                'text-[11px] font-mono font-bold mt-1 block',
                                isSelected ? 'text-amber-100' : 'text-amber-700'
                              )}>
                                {p.time}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. COMBINED TIMINGS & LIVE SCHEDULE PREVIEW */}
              <div className="space-y-2 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                    Combined Time of Classes (Auto-calculated / Editable):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:15 AM - 10:00 AM | 01:20 PM - 04:30 PM"
                    value={formData.classTime}
                    onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono text-[11px] font-bold text-[#071A3D]"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-gray-500 font-bold">Schedule Summary:</span>
                  <span className="font-mono font-bold text-[#1455D9] text-right truncate">
                    {formData.hasTheory && `Theory: ${formData.classDay || '—'} (${formData.classPeriod || '—'})`}
                    {formData.hasTheory && formData.hasLab && ' · '}
                    {formData.hasLab && `Lab: ${formData.labDay || '—'} (${formData.labPeriod || '—'})`}
                    {!formData.hasTheory && !formData.hasLab && 'Class In-charge / Advisory Only'}
                  </span>
                </div>
              </div>

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
