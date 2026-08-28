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

// Active Odd Semesters (Semesters 3, 5, 7) Practical Laboratories & Training Curricula
export const ALL_SEMESTERS_LABS = {
  sem3: {
    semNumber: 3,
    yearNumber: 2,
    semLabel: 'Semester 3 (Year 2 - Odd)',
    badgeColor: 'bg-blue-50 text-[#1455D9] border-blue-200',
    labs: [
      { id: 's3_oop', code: 'AD2311', name: 'Object Oriented Programming Laboratory', shortName: 'OOP Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Tuesday' },
      { id: 's3_dbms', code: 'AD2312', name: 'Database Management Systems Laboratory', shortName: 'DBMS Lab', credits: 2, defaultPeriod: 'Lab Session (FN)', defaultTime: '09:15 AM - 12:30 PM', defaultDays: 'Thursday' },
      { id: 's3_dsa', code: 'AD2313', name: 'Data Structures & Algorithms Laboratory', shortName: 'DSA Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Friday' },
    ],
  },
  sem5: {
    semNumber: 5,
    yearNumber: 3,
    semLabel: 'Semester 5 (Year 3 - Odd)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    labs: [
      { id: 's5_cloud', code: 'AD2511', name: 'Cloud Service Management Laboratory', shortName: 'Cloud Mgmt Lab', credits: 2, defaultPeriod: 'Lab Session (FN)', defaultTime: '09:15 AM - 12:30 PM', defaultDays: 'Monday' },
      { id: 's5_bigdata', code: 'AD2512', name: 'Big Data Analytics Laboratory', shortName: 'Big Data Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Wednesday' },
      { id: 's5_dl', code: 'AD2513', name: 'Deep Learning Laboratory', shortName: 'Deep Learning Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Thursday' },
      { id: 's5_ba', code: 'AD2514', name: 'Business Analytics Laboratory', shortName: 'Business Analytics Lab', credits: 2, defaultPeriod: 'Lab Session (FN)', defaultTime: '09:15 AM - 12:30 PM', defaultDays: 'Friday' },
      { id: 's5_comm', code: 'AD2515', name: 'Communication Training & Soft Skills', shortName: 'Communication Training', credits: 1, defaultPeriod: 'Period 7, Period 8', defaultTime: '03:05 PM - 03:50 PM, 03:50 PM - 04:30 PM', defaultDays: 'Tuesday' },
      { id: 's5_apt', code: 'AD2516', name: 'Aptitude & Quantitative Problem Solving', shortName: 'Aptitude Training', credits: 1, defaultPeriod: 'Period 7, Period 8', defaultTime: '03:05 PM - 03:50 PM, 03:50 PM - 04:30 PM', defaultDays: 'Thursday' },
      { id: 's5_web', code: 'AD2517', name: 'Full Stack Web Development Laboratory', shortName: 'Web Dev Lab', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Friday' },
    ],
  },
  sem7: {
    semNumber: 7,
    yearNumber: 4,
    semLabel: 'Semester 7 (Year 4 - Odd)',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    labs: [
      { id: 's7_proj1', code: 'AD2711', name: 'Project Work (Phase I)', shortName: 'Project Phase I', credits: 6, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Wednesday, Friday' },
      { id: 's7_place', code: 'AD2712', name: 'Placement & Industry Training Program', shortName: 'Placement & Training', credits: 2, defaultPeriod: 'Lab Session (AN)', defaultTime: '01:20 PM - 04:30 PM', defaultDays: 'Monday, Thursday' },
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

const DEFAULT_SUBJECT_HANDLERS = [
  { code: 'AD2311', name: 'Object Oriented Programming Laboratory', credits: 2, handler: 'Dr. S. Karthik', hours: 30, day: 'Tue', period: 'Lab Session (AN)', time: '01:20 PM - 04:30 PM' },
  { code: 'AD2312', name: 'Database Management Systems Laboratory', credits: 2, handler: 'Dr. M. Sowmya', hours: 30, day: 'Thu', period: 'Lab Session (FN)', time: '09:15 AM - 12:30 PM' },
  { code: 'AD2313', name: 'Data Structures & Algorithms Laboratory', credits: 2, handler: 'Mr. S. Arun', hours: 30, day: 'Fri', period: 'Lab Session (AN)', time: '01:20 PM - 04:30 PM' },
  { code: 'AD2511', name: 'Cloud Service Management Laboratory', credits: 2, handler: 'Dr. S. Karthik', hours: 30, day: 'Mon', period: 'Lab Session (FN)', time: '09:15 AM - 12:30 PM' },
  { code: 'AD2512', name: 'Big Data Analytics Laboratory', credits: 2, handler: 'Mrs. R. Priya', hours: 30, day: 'Wed', period: 'Lab Session (AN)', time: '01:20 PM - 04:30 PM' },
  { code: 'AD2513', name: 'Deep Learning Laboratory', credits: 2, handler: 'Dr. M. Sowmya', hours: 30, day: 'Thu', period: 'Lab Session (AN)', time: '01:20 PM - 04:30 PM' },
  { code: 'AD2514', name: 'Business Analytics Laboratory', credits: 2, handler: 'Mr. S. Arun', hours: 30, day: 'Fri', period: 'Lab Session (FN)', time: '09:15 AM - 12:30 PM' },
  { code: 'AD2515', name: 'Communication Training & Soft Skills', credits: 1, handler: 'Mrs. R. Priya', hours: 20, day: 'Tue', period: 'Period 7, Period 8', time: '03:05 PM - 03:50 PM, 03:50 PM - 04:30 PM' },
  { code: 'AD2516', name: 'Aptitude & Quantitative Problem Solving', credits: 1, handler: 'Mr. S. Arun', hours: 20, day: 'Thu', period: 'Period 7, Period 8', time: '03:05 PM - 03:50 PM, 03:50 PM - 04:30 PM' },
  { code: 'AD2517', name: 'Full Stack Web Development Laboratory', credits: 2, handler: 'Dr. S. Karthik', hours: 30, day: 'Fri', period: 'Lab Session (AN)', time: '01:20 PM - 04:30 PM' },
  { code: 'AD2711', name: 'Project Work (Phase I)', credits: 6, handler: 'Dr. S. Karthik', hours: 60, day: 'Wed, Fri', period: 'Lab Session (AN)', time: '01:20 PM - 04:30 PM' },
  { code: 'AD2712', name: 'Placement & Industry Training Program', credits: 2, handler: 'Dr. M. Sowmya', hours: 40, day: 'Mon, Thu', period: 'Lab Session (AN)', time: '01:20 PM - 04:30 PM' },
]

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

// Master Weekly Timetables across Active Odd Semesters (Sem 3, 5, 7)
const MASTER_TIMETABLES_ALL_8_SEMS: Record<string, { title: string; room: string; advisor: string; rows: any[] }> = {
  sem3: {
    title: 'Semester 3 · Year 2 (Odd Semester)',
    room: 'Room 201 · AI & DS Academic Block',
    advisor: 'Dr. S. Karthik (Professor)',
    rows: [
      { day: 'Monday', p1: 'AD2301 (DS)', p2: 'AD2302 (DBMS)', p3: 'MA2301 (Maths III)', p4: 'AD2303 (OOP)', p5: 'Lab: AD2311 (OOP Lab)', p6: 'Lab: AD2311 (OOP Lab)', p7: 'Lab: AD2311 (OOP Lab)', p8: 'Lab: AD2311 (OOP Lab)' },
      { day: 'Tuesday', p1: 'AD2304 (AI)', p2: 'AD2301 (DS)', p3: 'AD2302 (DBMS)', p4: 'MA2301 (Maths III)', p5: 'AD2303 (OOP)', p6: 'Mentorship', p7: 'Library / Self-Study', p8: 'Placement Prep' },
      { day: 'Wednesday', p1: 'MA2301 (Maths III)', p2: 'AD2304 (AI)', p3: 'AD2301 (DS)', p4: 'AD2302 (DBMS)', p5: 'Lab: AD2313 (DSA Lab)', p6: 'Lab: AD2313 (DSA Lab)', p7: 'Lab: AD2313 (DSA Lab)', p8: 'Lab: AD2313 (DSA Lab)' },
      { day: 'Thursday', p1: 'Lab: AD2312 (DBMS Lab)', p2: 'Lab: AD2312 (DBMS Lab)', p3: 'Lab: AD2312 (DBMS Lab)', p4: 'Lab: AD2312 (DBMS Lab)', p5: 'AD2303 (OOP)', p6: 'AD2304 (AI)', p7: 'Problem Solving', p8: 'Club Activity' },
      { day: 'Friday', p1: 'AD2302 (DBMS)', p2: 'MA2301 (Maths III)', p3: 'AD2304 (AI)', p4: 'AD2301 (DS)', p5: 'AD2303 (OOP)', p6: 'Mini-Project', p7: 'Counseling', p8: 'Mentorship' },
    ],
  },
  sem5: {
    title: 'Semester 5 · Year 3 (Odd Semester)',
    room: 'Room 302 · AI & DS Academic Block',
    advisor: 'Dr. M. Sowmya (Associate Prof)',
    rows: [
      { day: 'Monday', p1: 'Lab: AD2511 (Cloud Lab)', p2: 'Lab: AD2511 (Cloud Lab)', p3: 'Lab: AD2511 (Cloud Lab)', p4: 'Lab: AD2511 (Cloud Lab)', p5: 'AD2501 (Big Data)', p6: 'AD2502 (Deep Learning)', p7: 'AD2503 (Business Analytics)', p8: 'Industry Seminar' },
      { day: 'Tuesday', p1: 'AD2502 (Deep Learning)', p2: 'AD2501 (Big Data)', p3: 'AD2503 (Business Analytics)', p4: 'AD2504 (Cloud Computing)', p5: 'Mentorship', p6: 'Research Review', p7: 'AD2515 (Comm Training)', p8: 'AD2515 (Comm Training)' },
      { day: 'Wednesday', p1: 'AD2503 (Business Analytics)', p2: 'AD2504 (Cloud Computing)', p3: 'AD2501 (Big Data)', p4: 'AD2502 (Deep Learning)', p5: 'Lab: AD2512 (Big Data Lab)', p6: 'Lab: AD2512 (Big Data Lab)', p7: 'Lab: AD2512 (Big Data Lab)', p8: 'Lab: AD2512 (Big Data Lab)' },
      { day: 'Thursday', p1: 'AD2504 (Cloud Computing)', p2: 'AD2502 (Deep Learning)', p3: 'AD2501 (Big Data)', p4: 'AD2503 (Business Analytics)', p5: 'Lab: AD2513 (DL Lab)', p6: 'Lab: AD2513 (DL Lab)', p7: 'AD2516 (Aptitude)', p8: 'AD2516 (Aptitude)' },
      { day: 'Friday', p1: 'Lab: AD2514 (BA Lab)', p2: 'Lab: AD2514 (BA Lab)', p3: 'Lab: AD2514 (BA Lab)', p4: 'Lab: AD2514 (BA Lab)', p5: 'Lab: AD2517 (Web Dev Lab)', p6: 'Lab: AD2517 (Web Dev Lab)', p7: 'Lab: AD2517 (Web Dev Lab)', p8: 'Lab: AD2517 (Web Dev Lab)' },
    ],
  },
  sem7: {
    title: 'Semester 7 · Year 4 (Odd Semester)',
    room: 'Room 401 · Innovation & Placement Wing',
    advisor: 'Dr. S. Karthik (Professor & Head)',
    rows: [
      { day: 'Monday', p1: 'AD2701 (AI Ethics & Law)', p2: 'AD2702 (Generative AI)', p3: 'AD2703 (Elective IV)', p4: 'AD2704 (Elective V)', p5: 'AD2712 (Placement Training)', p6: 'AD2712 (Placement Training)', p7: 'AD2712 (Placement Training)', p8: 'AD2712 (Placement Training)' },
      { day: 'Tuesday', p1: 'AD2702 (Generative AI)', p2: 'AD2701 (AI Ethics & Law)', p3: 'AD2704 (Elective V)', p4: 'AD2703 (Elective IV)', p5: 'Industry Mentoring', p6: 'Mock Interviews', p7: 'Resume Building', p8: 'Corporate Readiness' },
      { day: 'Wednesday', p1: 'AD2703 (Elective IV)', p2: 'AD2704 (Elective V)', p3: 'AD2701 (AI Ethics & Law)', p4: 'AD2702 (Generative AI)', p5: 'Lab: AD2711 (Project Phase I)', p6: 'Lab: AD2711 (Project Phase I)', p7: 'Lab: AD2711 (Project Phase I)', p8: 'Lab: AD2711 (Project Phase I)' },
      { day: 'Thursday', p1: 'AD2704 (Elective V)', p2: 'AD2703 (Elective IV)', p3: 'AD2702 (Generative AI)', p4: 'AD2701 (AI Ethics & Law)', p5: 'AD2712 (Placement Training)', p6: 'AD2712 (Placement Training)', p7: 'AD2712 (Placement Training)', p8: 'AD2712 (Placement Training)' },
      { day: 'Friday', p1: 'AD2701 (AI Ethics & Law)', p2: 'AD2702 (Generative AI)', p3: 'AD2703 (Elective IV)', p4: 'AD2704 (Elective V)', p5: 'Lab: AD2711 (Project Phase I)', p6: 'Lab: AD2711 (Project Phase I)', p7: 'Lab: AD2711 (Project Phase I)', p8: 'Lab: AD2711 (Project Phase I)' },
    ],
  },
}

const DAYS_OF_WEEK = [
  { code: 'Mon', label: 'Monday' },
  { code: 'Tue', label: 'Tuesday' },
  { code: 'Wed', label: 'Wednesday' },
  { code: 'Thu', label: 'Thursday' },
  { code: 'Fri', label: 'Friday' },
  { code: 'Sat', label: 'Saturday' },
]

export function AdminFacultyView({ initialFaculty }: { initialFaculty: FacultyRecord[] }) {
  // Active View Tab: 'advisors' (Class Advisors) vs 'handlers' (Subject Handlers)
  const [activeTab, setActiveTab] = useState<'advisors' | 'handlers'>('advisors')
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>(initialFaculty)
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [semFilter, setSemFilter] = useState('ALL')
  const [sectionFilter, setSectionFilter] = useState('ALL')
  const [designationFilter, setDesignationFilter] = useState('ALL')
  const [labSemesterFilter, setLabSemesterFilter] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(false)

  // Master Timetable Expanded & Selected Tab
  const [isTimetableExpanded, setIsTimetableExpanded] = useState(true)
  const [timetableTab, setTimetableTab] = useState<'bell' | 'matrix'>('bell')
  const [timetableSemester, setTimetableSemester] = useState<string>('sem3')

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Dossier Modal for Class Advisor
  const [selectedAdvisorDossier, setSelectedAdvisorDossier] = useState<FacultyRecord | null>(null)
  const [dossierTab, setDossierTab] = useState<'students' | 'handlers' | 'attendance' | 'timetable' | 'notices'>('students')
  const [classStudents, setClassStudents] = useState<StudentInClass[]>([])
  const [loadingClassData, setLoadingClassData] = useState(false)

  // Form state
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
    classTime: '09:15 AM - 10:00 AM',
    advisorBatch: '',
    advisorYear: 2,
    advisorSem: 3,
    advisorSec: 'A',
    facultyType: 'advisor',
  })

  // Quick Presets Modal Tab for Labs & Theory Courses (Semesters 3, 5, 7)
  const [quickLabTab, setQuickLabTab] = useState<string>('sem3')
  const [quickTheoryTab, setQuickTheoryTab] = useState<string>('sem3')

  // Dynamic Editable Labs State (Persistent across browser reloads)
  const [semestersLabs, setSemestersLabs] = useState<SemestersLabsMap>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('VSB_AIDS_EDITABLE_LABS')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && typeof parsed === 'object' && parsed.sem3) return parsed
        }
      } catch {}
    }
    return ALL_SEMESTERS_LABS
  })

  // Save changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('VSB_AIDS_EDITABLE_LABS', JSON.stringify(semestersLabs))
      } catch {}
    }
  }, [semestersLabs])

  // Lab Edit & Add Modal State
  const [isLabModalOpen, setIsLabModalOpen] = useState(false)
  const [editingLabId, setEditingLabId] = useState<string | null>(null)
  const [labFormData, setLabFormData] = useState<{
    targetSem: 'sem3' | 'sem5' | 'sem7'
    name: string
    shortName: string
    code: string
    credits: number
    defaultPeriod: string
    defaultTime: string
    defaultDays: string
  }>({
    targetSem: 'sem3',
    name: '',
    shortName: '',
    code: '',
    credits: 2,
    defaultPeriod: 'Lab Session (FN)',
    defaultTime: '09:15 AM - 12:30 PM',
    defaultDays: 'Tuesday',
  })

  // Open Add Lab Modal
  const handleOpenAddLab = (semKey: 'sem3' | 'sem5' | 'sem7' = 'sem3') => {
    setEditingLabId(null)
    setLabFormData({
      targetSem: semKey,
      name: '',
      shortName: '',
      code: '',
      credits: 2,
      defaultPeriod: 'Lab Session (FN)',
      defaultTime: '09:15 AM - 12:30 PM',
      defaultDays: 'Monday',
    })
    setIsLabModalOpen(true)
  }

  // Open Edit Lab Modal
  const handleOpenEditLab = (semKey: 'sem3' | 'sem5' | 'sem7', lab: LabItem) => {
    setEditingLabId(lab.id)
    setLabFormData({
      targetSem: semKey,
      name: lab.name,
      shortName: lab.shortName,
      code: lab.code,
      credits: lab.credits,
      defaultPeriod: lab.defaultPeriod,
      defaultTime: lab.defaultTime,
      defaultDays: lab.defaultDays,
    })
    setIsLabModalOpen(true)
  }

  // Save Lab (Add or Update)
  const handleSaveLab = (e: React.FormEvent) => {
    e.preventDefault()
    if (!labFormData.name.trim() || !labFormData.code.trim()) {
      toast.error('Please enter both Laboratory Name and Course Code')
      return
    }

    const semKey = labFormData.targetSem
    const currentSem = semestersLabs[semKey] || ALL_SEMESTERS_LABS[semKey]

    if (editingLabId) {
      // Update existing lab
      const updatedLabs = currentSem.labs.map((l) =>
        l.id === editingLabId
          ? {
              ...l,
              name: labFormData.name.trim(),
              shortName: labFormData.shortName.trim() || labFormData.name.trim().slice(0, 16),
              code: labFormData.code.trim().toUpperCase(),
              credits: Number(labFormData.credits) || 2,
              defaultPeriod: labFormData.defaultPeriod,
              defaultTime: labFormData.defaultTime,
              defaultDays: labFormData.defaultDays,
            }
          : l
      )
      setSemestersLabs({
        ...semestersLabs,
        [semKey]: {
          ...currentSem,
          labs: updatedLabs,
        },
      })
      toast.success(`Lab "${labFormData.code}" updated successfully!`)
    } else {
      // Add new lab
      const newLab: LabItem = {
        id: 'lab_' + Date.now(),
        name: labFormData.name.trim(),
        shortName: labFormData.shortName.trim() || labFormData.name.trim().slice(0, 16),
        code: labFormData.code.trim().toUpperCase(),
        credits: Number(labFormData.credits) || 2,
        defaultPeriod: labFormData.defaultPeriod,
        defaultTime: labFormData.defaultTime,
        defaultDays: labFormData.defaultDays,
      }
      setSemestersLabs({
        ...semestersLabs,
        [semKey]: {
          ...currentSem,
          labs: [...currentSem.labs, newLab],
        },
      })
      toast.success(`New lab "${newLab.code}" added to Semester ${currentSem.semNumber}!`)
    }

    setIsLabModalOpen(false)
  }

  // Delete Lab
  const handleDeleteLab = (semKey: 'sem3' | 'sem5' | 'sem7', labId: string, labName: string) => {
    if (window.confirm(`Are you sure you want to remove "${labName}" from this semester?`)) {
      const currentSem = semestersLabs[semKey]
      if (!currentSem) return
      setSemestersLabs({
        ...semestersLabs,
        [semKey]: {
          ...currentSem,
          labs: currentSem.labs.filter((l) => l.id !== labId),
        },
      })
      toast.success(`Lab "${labName}" removed successfully.`)
    }
  }

  // Reset Labs to Official Defaults
  const handleResetLabs = () => {
    if (window.confirm('Reset all laboratories to default institutional curricula?')) {
      setSemestersLabs(ALL_SEMESTERS_LABS)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('VSB_AIDS_EDITABLE_LABS')
      }
      toast.success('Laboratories reset to standard curricula!')
    }
  }

  // Apply Quick Lab Preset into Form
  const applyLabPreset = (lab: {
    code: string
    name: string
    shortName: string
    defaultPeriod: string
    defaultTime: string
    defaultDays: string
  }) => {
    setFormData({
      ...formData,
      subjectName: lab.name,
      subjects: lab.code,
      classPeriod: lab.defaultPeriod,
      classTime: lab.defaultTime,
      classDay: lab.defaultDays,
    })
  }

  // Apply Quick Theory Subject Preset into Form
  const applyTheoryPreset = (subject: {
    code: string
    name: string
    shortName: string
    defaultPeriods: string
    defaultDays: string
  }) => {
    setFormData({
      ...formData,
      subjectName: subject.name,
      subjects: subject.code,
      classPeriod: subject.defaultPeriods,
      classTime: '09:15 AM - 10:45 AM',
      classDay: subject.defaultDays,
    })
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

  // Toggle Multiple Days
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

      // Lab Semester filter
      let matchesLabSem = true
      if (labSemesterFilter !== 'ALL' && semestersLabs[labSemesterFilter as keyof typeof semestersLabs]) {
        const targetLabs = semestersLabs[labSemesterFilter as keyof typeof semestersLabs].labs
        matchesLabSem = targetLabs.some(
          (l) => (f.subjectName && f.subjectName.toLowerCase().includes(l.shortName.toLowerCase())) || subjs.includes(l.code)
        )
      }

      return matchesSearch && matchesDesignation && matchesLabSem
    })
  }, [facultyList, searchQuery, designationFilter, labSemesterFilter, semestersLabs])

  // PDF Export for Master Timetable
  const handleExportTimetablePDF = () => {
    const cur = MASTER_TIMETABLES_ALL_8_SEMS[timetableSemester] || MASTER_TIMETABLES_ALL_8_SEMS.sem3
    generateAndDownloadPDF({
      title: `DEPARTMENT MASTER TIMETABLE: ${cur.title.toUpperCase()}`,
      subtitle: `V.S.B. Engineering College · Department of AI & DS · ${cur.room}`,
      author: 'Office of Academic Dean & Department Coordinator',
      category: 'Master Class Timetable & Schedule',
      sections: [
        {
          heading: '1. TIMETABLE PARTICULARS & CLASS ALLOTMENT',
          body: [
            `Class Scope: ${cur.title}`,
            `Classroom Allocation: ${cur.room}`,
            `Assigned Class Advisor: ${cur.advisor}`,
            'Operating Timings: 09:15 AM - 04:30 PM (8 Periods Daily)',
            'Break Intervals: Morning Tea (10:45-11:00 AM) | Lunch (12:30-01:20 PM) | Evening Tea (02:50-03:05 PM)',
          ],
        },
        {
          heading: '2. WEEKLY CLASS SCHEDULE (MONDAY - FRIDAY)',
          body: cur.rows.map(
            (r) => `${r.day.toUpperCase()}: P1: ${r.p1} | P2: ${r.p2} | P3: ${r.p3} | P4: ${r.p4} | P5: ${r.p5} | P6: ${r.p6} | P7: ${r.p7} | P8: ${r.p8}`
          ),
        },
      ],
      fileName: `Master_Timetable_${timetableSemester}_AI_DS`,
    })
  }

  // PDF Export
  const handleExportPDF = () => {
    const isAdvisors = activeTab === 'advisors'
    generateAndDownloadPDF({
      title: isAdvisors
        ? 'DEPARTMENT OF AI & DS — CLASS ADVISORS DIRECTORY'
        : 'DEPARTMENT OF AI & DS — 8 SEMESTERS LABS & SUBJECT HANDLERS DIRECTORY',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Department Administrator',
      category: isAdvisors ? 'Class In-Charges & Mentors' : 'Course Instructors & Schedules',
      sections: [
        {
          heading: isAdvisors ? '1. CLASS ADVISORS SUMMARY' : '1. COURSE INSTRUCTORS & LABS SUMMARY',
          body: [
            `Total Faculty Count: ${facultyList.length} Faculty Members`,
            `Active View: ${isAdvisors ? 'Class Mentors & Batch Advisors' : 'Curriculum Labs (Semesters 1 to 8) & Subject Handlers'}`,
            `Department: Artificial Intelligence & Data Science (AI & DS)`,
            `Curriculum Scope: All 8 Semesters (Sem 1 to Sem 8) Laboratories & Theory Courses`,
          ],
        },
        {
          heading: isAdvisors ? '2. CLASS ADVISORS ALLOCATION' : '2. SUBJECT HANDLERS & LAB ALLOCATIONS',
          body: (isAdvisors ? advisorsList : handlersList).map((f, idx) => {
            if (isAdvisors) {
              return `${idx + 1}. ${f.name} — ${f.designation} | Assigned Batch: ${f.advisorBatch || 'Year II (Sec A)'} | Contact: ${f.email}`
            } else {
              const subjs = getSubjectsList(f.subjects).join(', ') || 'AD2311'
              const sName = f.subjectName || 'Object Oriented Programming Laboratory'
              const sDay = f.classDay || 'Tuesday'
              const sPeriod = f.classPeriod || 'Lab Session (AN)'
              const sTime = f.classTime || '01:20 PM - 04:30 PM'
              return `${idx + 1}. ${f.name} — ${sName} [${subjs}] | Days: ${sDay} | Periods: ${sPeriod} (${sTime}) | ${f.designation}`
            }
          }),
        },
      ],
      fileName: isAdvisors ? 'VSB_AI_DS_Class_Advisors_2026' : 'VSB_AI_DS_8_Semesters_Labs_2026',
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
      alert('Please fill in Faculty Name and Temporary Password.')
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
          password: formData.password.trim(),
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
          classTime: '09:15 AM - 10:00 AM',
          advisorBatch: activeTab === 'advisors' ? 'Year II - Sem 3 - Sec A' : '',
          advisorYear: 2,
          advisorSem: 3,
          advisorSec: 'A',
          facultyType: activeTab === 'advisors' ? 'advisor' : 'subject_handler',
        })
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
                classTime: '09:15 AM - 10:00 AM',
                advisorBatch: activeTab === 'advisors' ? 'Year II - Sem 3 - Sec A' : '',
                advisorYear: 2,
                advisorSem: 3,
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
                  <h4 className="font-black text-sm text-[#071A3D]">Page 1: Class Advisors (Semesters 3, 5 &amp; 7)</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Batch Mentors across Active Semesters (3, 5, 7) &amp; Section Dossiers</p>
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
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#071A3D]">Page 2: Labs &amp; Subject Handlers (Sem 3, 5, 7)</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Active Labs (Sem 3, 5, 7), 8 Periods (09:15 - 04:30) &amp; Schedules</p>
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

        {/* STEP 2: Filter by Semesters (When viewing Class Advisors) */}
        {activeTab === 'advisors' && (
          <div className="border-t border-gray-100 pt-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#F4C430] text-[#071A3D] text-[11px] font-black flex items-center justify-center">2</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#071A3D]">
                  Step 2: Filter by Active Semesters (Semesters 3, 5 &amp; 7)
                </h3>
              </div>
              {(semFilter !== 'ALL' || yearFilter !== 'ALL') && (
                <button
                  onClick={() => { setSemFilter('ALL'); setYearFilter('ALL'); }}
                  className="text-[11px] font-bold text-[#1455D9] hover:underline cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => { setSemFilter('ALL'); setYearFilter('ALL'); }}
                className={cn(
                  'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center',
                  semFilter === 'ALL'
                    ? 'bg-[#071A3D] text-white border-[#071A3D] shadow-xs'
                    : 'bg-gray-50 hover:bg-blue-50 border-gray-200 text-gray-700'
                )}
              >
                <span className="text-xs font-black">All Active Sems (3, 5, 7)</span>
                <span className="text-[9px] font-mono opacity-80">{facultyList.length} Total</span>
              </button>

              {[3, 5, 7].map((s) => {
                const isSelected = semFilter === String(s)
                const yr = Math.ceil(s / 2)
                const count = facultyList.filter(
                  (f) => String(f.advisorSem) === String(s) || (f.advisorBatch && f.advisorBatch.includes(`Sem ${s}`))
                ).length
                return (
                  <button
                    key={s}
                    onClick={() => { setSemFilter(String(s)); setYearFilter(String(yr)); }}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center',
                      isSelected
                        ? 'bg-[#1455D9] text-white border-[#1455D9] shadow-xs ring-2 ring-[#1455D9]/20'
                        : 'bg-gray-50/80 hover:bg-blue-50/50 border-gray-200 text-[#071A3D]'
                    )}
                  >
                    <span className="text-xs font-black">Semester {s}</span>
                    <span className={cn('text-[10px] font-bold', isSelected ? 'text-[#F4C430]' : 'text-gray-400')}>
                      Year {yr} ({count} Advisors)
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE SEMESTERS (3, 5, 7) EDITABLE LABS SHOWCASE & FILTER */}
      {/* ========================================================================= */}
      {activeTab === 'handlers' && (
        <div className="bg-gradient-to-br from-purple-900/5 via-blue-900/5 to-amber-900/5 rounded-3xl p-5 border border-purple-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#071A3D] flex items-center gap-2">
                  <span>Available Laboratories &amp; Practical Training (Semesters 3, 5 &amp; 7)</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                    Editable Curricula
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  FN Lab: 09:15 AM – 12:30 PM · AN Lab: 01:20 PM – 04:30 PM · Click Edit on any lab to customize
                </p>
              </div>
            </div>

            {/* Quick Actions & Semester Filter buttons */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleOpenAddLab(labSemesterFilter !== 'ALL' ? (labSemesterFilter as any) : 'sem3')}
                className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Lab Course</span>
              </button>

              <button
                type="button"
                onClick={handleResetLabs}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Reset to default institutional laboratory curricula"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                <span>Reset</span>
              </button>

              <div className="h-5 w-px bg-purple-200 hidden sm:block mx-0.5" />

              <button
                onClick={() => setLabSemesterFilter('ALL')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  labSemesterFilter === 'ALL'
                    ? 'bg-[#071A3D] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                )}
              >
                All Active Sems (3, 5, 7)
              </button>
              {[
                { k: 'sem3', label: 'Sem 3 (Yr 2)' },
                { k: 'sem5', label: 'Sem 5 (Yr 3)' },
                { k: 'sem7', label: 'Sem 7 (Yr 4)' },
              ].map((s) => (
                <button
                  key={s.k}
                  onClick={() => setLabSemesterFilter(s.k)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                    labSemesterFilter === s.k
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Semesters Editable Labs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {Object.entries(semestersLabs).filter(([k]) => labSemesterFilter === 'ALL' || labSemesterFilter === k).map(([key, sem]) => (
              <div key={key} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2 flex flex-col justify-between hover:border-purple-300 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border', sem.badgeColor)}>
                      Semester {sem.semNumber} (Year {sem.yearNumber})
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-bold font-mono">{sem.labs.length} Labs</span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddLab(key as any)}
                        className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-700 hover:text-white text-purple-700 text-[10px] font-bold transition-all border border-purple-200 cursor-pointer flex items-center gap-0.5"
                        title={`Add laboratory to Semester ${sem.semNumber}`}
                      >
                        <Plus className="w-2.5 h-2.5" /> Add
                      </button>
                    </div>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#071A3D]">{sem.semLabel}</h4>

                  <ul className="mt-2.5 space-y-2 text-xs max-h-64 overflow-y-auto pr-1">
                    {sem.labs.length === 0 ? (
                      <li className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center text-gray-400 text-xs font-semibold">
                        No labs configured yet. Click "+ Add" above to insert a lab.
                      </li>
                    ) : (
                      sem.labs.map((l) => (
                        <li key={l.id} className="p-2 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 flex items-start justify-between gap-2 group transition-all">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <Code2 className="w-3.5 h-3.5 text-[#1455D9] shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-[#071A3D] block text-xs truncate" title={l.name}>{l.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono block">
                                <span className="text-purple-700 font-bold">{l.code}</span> · {l.defaultPeriod} ({l.defaultTime})
                              </span>
                              <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">
                                Days: {l.defaultDays} · {l.credits} Credits
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEditLab(key as any, l)}
                              className="p-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 text-[10px] transition-all cursor-pointer shadow-2xs"
                              title={`Edit ${l.name}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLab(key as any, l.id, l.name)}
                              className="p-1 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 text-[10px] transition-all cursor-pointer shadow-2xs"
                              title={`Delete ${l.name}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <div className="pt-2.5 border-t border-gray-100 text-xs text-purple-700 font-bold flex items-center justify-between">
                  <span>Practical Curricula</span>
                  <span className="font-mono">{sem.labs.reduce((a, b) => a + b.credits, 0)} Credits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE BELL TIMINGS & ODD SEMESTERS MASTER TIMETABLE SECTION */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-blue-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-[#071A3D]">
                  Institutional Bell Timings &amp; Odd Semesters Master Timetable
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1455D9] border border-blue-200 text-[10px] font-black">
                  8 Periods · 3 Breaks · FN/AN Labs
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Official institutional schedule (09:15 AM – 04:30 PM) across Semesters 3, 5 &amp; 7
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimetableTab('bell')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                timetableTab === 'bell'
                  ? 'bg-[#1455D9] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>1. Bell Timings (8 Periods)</span>
            </button>

            <button
              onClick={() => setTimetableTab('matrix')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                timetableTab === 'matrix'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>2. Odd Semesters Timetable (Sem 3, 5, 7)</span>
            </button>

            <button
              onClick={() => setIsTimetableExpanded(!isTimetableExpanded)}
              className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 cursor-pointer border border-gray-200 ml-1"
              title={isTimetableExpanded ? 'Collapse Timetable' : 'Expand Timetable'}
            >
              {isTimetableExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isTimetableExpanded && (
          <div className="space-y-4 animate-fade-in">
            {/* VIEW 1: BELL TIMINGS & 8 PERIODS BREAKDOWN */}
            {timetableTab === 'bell' && (
              <div className="space-y-4">
                {/* 3 Institutional Break Slots Highlighting Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center gap-3 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">First Break (Morning)</span>
                      <span className="text-sm font-black text-amber-950 block">10:45 AM – 11:00 AM</span>
                      <span className="text-[10px] text-amber-800 font-medium">15 mins Refreshment Tea</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Lunch Break (Midday)</span>
                      <span className="text-sm font-black text-emerald-950 block">12:30 PM – 01:20 PM</span>
                      <span className="text-[10px] text-emerald-800 font-medium">50 mins Dining Interval</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center gap-3 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Evening Break (Tea)</span>
                      <span className="text-sm font-black text-amber-950 block">02:50 PM – 03:05 PM</span>
                      <span className="text-[10px] text-amber-800 font-medium">15 mins Refreshment Tea</span>
                    </div>
                  </div>
                </div>

                {/* 8 Regular Periods Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-[#071A3D] tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1455D9]" />
                      Regular Periods (Periods 1 to 8):
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">Total Duration: 6 Hours 15 Mins Class Time</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PERIOD_LIST.filter(p => !p.isLab).map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200 hover:border-[#1455D9] transition-all flex flex-col justify-between space-y-2 group shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#1455D9] font-black text-xs border border-blue-200/60">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-gray-600 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                            {p.duration}
                          </span>
                        </div>
                        <div>
                          <p className="font-mono font-black text-xs text-[#071A3D]">{p.time}</p>
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">{p.session}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dedicated Lab Blocks */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-[#071A3D] tracking-wider flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                      Laboratory &amp; Practical Blocks (FN &amp; AN):
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Consecutive Multi-Period Practical Slots
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0">
                          <Code2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-black text-sm text-[#071A3D] block">Forenoon Lab Session (FN)</span>
                          <span className="text-xs font-mono font-bold text-[#1455D9]">09:15 AM – 12:30 PM</span>
                          <span className="text-[10px] text-gray-500 block">Periods 1, 2, 3, 4 (with 15m Tea Break)</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-white border border-blue-200 text-xs font-black text-blue-700 font-mono">
                        3h 15m
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-300 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shrink-0">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-black text-sm text-[#071A3D] block">Afternoon Lab Session (AN)</span>
                          <span className="text-xs font-mono font-bold text-amber-800">01:20 PM – 04:30 PM</span>
                          <span className="text-[10px] text-gray-500 block">Periods 5, 6, 7, 8 (with 15m Tea Break)</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-xs font-black text-amber-800 font-mono">
                        3h 10m
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: ODD SEMESTERS MASTER TIMETABLE MATRIX TABLE */}
            {timetableTab === 'matrix' && (
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs font-bold text-gray-600 whitespace-nowrap">Choose Semester:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { k: 'sem3', label: 'Sem 3 (Yr 2)' },
                        { k: 'sem5', label: 'Sem 5 (Yr 3)' },
                        { k: 'sem7', label: 'Sem 7 (Yr 4)' },
                      ].map((s) => (
                        <button
                          key={s.k}
                          onClick={() => setTimetableSemester(s.k)}
                          className={cn(
                            'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                            timetableSemester === s.k
                              ? 'bg-[#1455D9] text-white shadow-xs'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium font-mono">
                      {(MASTER_TIMETABLES_ALL_8_SEMS[timetableSemester] || MASTER_TIMETABLES_ALL_8_SEMS.sem3).room}
                    </span>
                    <button
                      onClick={handleExportTimetablePDF}
                      className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 border border-gray-200 cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-[#1455D9]" /> Download PDF
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#071A3D] text-white font-bold text-[11px]">
                        <th className="p-2.5">Day</th>
                        <th className="p-2.5 text-center">P1<br /><span className="text-[9px] font-normal text-gray-300 font-mono">09:15-10:00</span></th>
                        <th className="p-2.5 text-center">P2<br /><span className="text-[9px] font-normal text-gray-300 font-mono">10:00-10:45</span></th>
                        <th className="p-2.5 bg-amber-500/30 text-amber-200 text-center text-[10px]">Morning Tea<br /><span className="font-mono text-[8px]">10:45-11:00</span></th>
                        <th className="p-2.5 text-center">P3<br /><span className="text-[9px] font-normal text-gray-300 font-mono">11:00-11:45</span></th>
                        <th className="p-2.5 text-center">P4<br /><span className="text-[9px] font-normal text-gray-300 font-mono">11:45-12:30</span></th>
                        <th className="p-2.5 bg-emerald-500/30 text-emerald-200 text-center text-[10px]">Lunch Break<br /><span className="font-mono text-[8px]">12:30-01:20</span></th>
                        <th className="p-2.5 text-center">P5<br /><span className="text-[9px] font-normal text-gray-300 font-mono">01:20-02:05</span></th>
                        <th className="p-2.5 text-center">P6<br /><span className="text-[9px] font-normal text-gray-300 font-mono">02:05-02:50</span></th>
                        <th className="p-2.5 bg-amber-500/30 text-amber-200 text-center text-[10px]">Evening Tea<br /><span className="font-mono text-[8px]">02:50-03:05</span></th>
                        <th className="p-2.5 text-center">P7<br /><span className="text-[9px] font-normal text-gray-300 font-mono">03:05-03:50</span></th>
                        <th className="p-2.5 text-center">P8<br /><span className="text-[9px] font-normal text-gray-300 font-mono">03:50-04:30</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {(MASTER_TIMETABLES_ALL_8_SEMS[timetableSemester] || MASTER_TIMETABLES_ALL_8_SEMS.sem3).rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30">
                          <td className="p-2.5 font-bold text-[#1455D9] bg-gray-50">{row.day}</td>
                          <td className={cn('p-2.5 text-center', row.p1.startsWith('Lab') ? 'bg-amber-50 text-amber-900 font-bold' : '')}>{row.p1}</td>
                          <td className={cn('p-2.5 text-center', row.p2.startsWith('Lab') ? 'bg-amber-50 text-amber-900 font-bold' : '')}>{row.p2}</td>
                          <td className="p-2.5 bg-amber-50/60 text-amber-800 text-center font-mono text-[10px] border-x border-amber-100">☕ 15m</td>
                          <td className={cn('p-2.5 text-center', row.p3.startsWith('Lab') ? 'bg-amber-50 text-amber-900 font-bold' : '')}>{row.p3}</td>
                          <td className={cn('p-2.5 text-center', row.p4.startsWith('Lab') ? 'bg-amber-50 text-amber-900 font-bold' : '')}>{row.p4}</td>
                          <td className="p-2.5 bg-emerald-50/60 text-emerald-800 text-center font-mono text-[10px] border-x border-emerald-100">🍱 50m</td>
                          <td className={cn('p-2.5 text-center', row.p5.startsWith('Lab') ? 'bg-amber-50 text-amber-900 font-bold' : '')}>{row.p5}</td>
                          <td className={cn('p-2.5 text-center', row.p6.startsWith('Lab') ? 'bg-amber-50 text-amber-900 font-bold' : '')}>{row.p6}</td>
                          <td className="p-2.5 bg-amber-50/60 text-amber-800 text-center font-mono text-[10px] border-x border-amber-100">☕ 15m</td>
                          <td className={cn('p-2.5 text-center', row.p7.startsWith('Lab') ? 'bg-amber-50 text-amber-900 font-bold' : '')}>{row.p7}</td>
                          <td className={cn('p-2.5 text-center', row.p8.startsWith('Lab') ? 'bg-amber-50 text-amber-900 font-bold' : '')}>{row.p8}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
          <p className="text-[10px] text-green-700 font-medium mt-1">Semesters 3, 5, 7 · Sections A - D</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Semesters Labs</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">12 Courses</p>
          <p className="text-[10px] text-purple-700 font-medium mt-1">Semesters 3, 5, 7 Active Labs</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Daily Matrix</p>
          <p className="text-2xl font-black text-amber-700 mt-0.5">8 Periods</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">09:15 AM - 04:30 PM &amp; Labs</p>
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
                : 'Search handlers by name, subject, days, period, or lab...'
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
                              classTime: advisor.classTime || '09:15 AM - 10:00 AM',
                              advisorBatch: advisor.advisorBatch || 'Year II - Sem 3 - Sec A',
                              advisorYear: advisor.advisorYear || 2,
                              advisorSem: advisor.advisorSem || 3,
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
      {/* PAGE 2: SUBJECT HANDLERS & LABS TABLE */}
      {/* ========================================================= */}
      {activeTab === 'handlers' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#071A3D] text-white uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Faculty Name</th>
                <th className="px-4 py-3.5">Subject / Lab Name &amp; Code</th>
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
                    <FlaskConical className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-600">No Subject Handlers Found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click &quot;+ Add New Faculty&quot; to allocate subjects, days, 8 periods, and lab sessions.</p>
                  </td>
                </tr>
              ) : (
                handlersList.map((handler, idx) => {
                  const subjs = getSubjectsList(handler.subjects)
                  const subjectDisplayName = handler.subjectName || (subjs.length > 0 ? `Core Course: ${subjs.join(', ')}` : 'Object Oriented Programming Laboratory')
                  const codeDisplay = subjs.length > 0 ? subjs.join(', ') : 'AD2311'
                  const dayList = handler.classDay ? handler.classDay.split(',').map(d => d.trim()).filter(Boolean) : ['Tue']
                  const periodList = handler.classPeriod ? handler.classPeriod.split(',').map(p => p.trim()).filter(Boolean) : ['Lab Session (AN)']
                  const timeDisplay = handler.classTime || '01:20 PM - 04:30 PM'
                  const isLabCourse = subjectDisplayName.toLowerCase().includes('lab') || subjectDisplayName.toLowerCase().includes('project') || subjectDisplayName.toLowerCase().includes('training') || periodList.some(p => p.toLowerCase().includes('lab'))

                  return (
                    <tr key={handler.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center border',
                            isLabCourse
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-purple-100 text-purple-700 border-purple-200'
                          )}>
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
                          <span className="font-bold text-[#071A3D] block text-sm flex items-center gap-1.5">
                            {isLabCourse && <FlaskConical className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
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
                                classDay: handler.classDay || 'Tue',
                                classPeriod: handler.classPeriod || 'Lab Session (AN)',
                                classTime: handler.classTime || '01:20 PM - 04:30 PM',
                                advisorBatch: handler.advisorBatch || '',
                                advisorYear: handler.advisorYear || 2,
                                advisorSem: handler.advisorSem || 3,
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
                { id: 'timetable', label: '4. Class Timetable (8 Periods & Breaks)', icon: <Clock className="w-3.5 h-3.5" /> },
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

              {/* TAB 4: TIMETABLE (8 FULL PERIODS & BREAKS) */}
              {dossierTab === 'timetable' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-black text-sm text-[#071A3D]">Weekly Class Timetable &amp; Schedule (8 Periods &amp; Break Slots)</h4>
                      <p className="text-gray-500 text-[11px]">Room 204, AI Block · Mon – Fri (09:15 AM – 04:30 PM)</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl">
                      <span>🍵 Morning: 10:45-11:00</span>
                      <span>•</span>
                      <span>🍱 Lunch: 12:30-01:20</span>
                      <span>•</span>
                      <span>☕ Evening: 02:50-03:05</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                      <thead>
                        <tr className="bg-blue-50/60 border-b border-gray-200 text-[#071A3D] font-bold">
                          <th className="p-2.5">Day</th>
                          <th className="p-2.5">P1 (09:15-10:00)</th>
                          <th className="p-2.5">P2 (10:00-10:45)</th>
                          <th className="p-2.5 bg-amber-50/70 text-amber-900 border-x border-amber-200 text-center text-[10px]">Morning Tea</th>
                          <th className="p-2.5">P3 (11:00-11:45)</th>
                          <th className="p-2.5">P4 (11:45-12:30)</th>
                          <th className="p-2.5 bg-amber-50/70 text-amber-900 border-x border-amber-200 text-center text-[10px]">Lunch Break</th>
                          <th className="p-2.5">P5 (01:20-02:05)</th>
                          <th className="p-2.5">P6 (02:05-02:50)</th>
                          <th className="p-2.5 bg-amber-50/70 text-amber-900 border-x border-amber-200 text-center text-[10px]">Evening Tea</th>
                          <th className="p-2.5">P7 (03:05-03:50)</th>
                          <th className="p-2.5">P8 (03:50-04:30)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {(MASTER_TIMETABLES_ALL_8_SEMS.sem3).rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-2.5 font-bold text-[#1455D9]">{row.day}</td>
                            <td className="p-2.5">{row.p1}</td>
                            <td className="p-2.5">{row.p2}</td>
                            <td className="p-2.5 bg-amber-50/30 text-amber-800 text-center font-mono text-[10px] border-x border-amber-100">10:45-11:00</td>
                            <td className="p-2.5">{row.p3}</td>
                            <td className="p-2.5">{row.p4}</td>
                            <td className="p-2.5 bg-amber-50/30 text-amber-800 text-center font-mono text-[10px] border-x border-amber-100">12:30-01:20</td>
                            <td className="p-2.5">{row.p5}</td>
                            <td className="p-2.5">{row.p6}</td>
                            <td className="p-2.5 bg-amber-50/30 text-amber-800 text-center font-mono text-[10px] border-x border-amber-100">02:50-03:05</td>
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
              {/* Role / Type Selector: Advisor, Theory Subject, Lab Practical, or Both */}
              <div>
                <label className="block font-bold text-[#071A3D] mb-1.5">
                  Faculty Role / Allocation Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    <UserCheck className="w-4 h-4 text-[#1455D9]" />
                    <span>Class Advisor</span>
                    <span className="text-[10px] font-normal text-gray-400">Batch Mentor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facultyType: 'subject_handler' })}
                    className={cn(
                      'p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1',
                      formData.facultyType === 'subject_handler'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs ring-2 ring-indigo-600/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Theory Subject</span>
                    <span className="text-[10px] font-normal text-gray-400">Course Instructor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facultyType: 'lab_faculty' })}
                    className={cn(
                      'p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1',
                      formData.facultyType === 'lab_faculty'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs ring-2 ring-purple-600/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    <span>Lab / Practical</span>
                    <span className="text-[10px] font-normal text-gray-400">Lab In-Charge</span>
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
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Advisor &amp; Multi</span>
                    <span className="text-[10px] font-normal text-gray-400">Combined Duties</span>
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

              {/* Class Advisor Assignment Fields for All 8 Semesters */}
              {(formData.facultyType === 'advisor' || formData.facultyType === 'both') && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 animate-fade-in">
                  <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#1455D9]" />
                    Class Advisor Allocation (All 8 Semesters):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
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
                            advisorBatch: `Year ${yr} - Sem ${sem} - Sec ${formData.advisorSec}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#1455D9]"
                      >
                        {[3, 5, 7].map((s) => (
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
                            advisorBatch: `Year ${y} - Sem ${sem} - Sec ${formData.advisorSec}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-semibold"
                      >
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

              {/* INDIVIDUAL ENTRY: 1. THEORY SUBJECT FACULTY */}
              {(formData.facultyType === 'subject_handler' || formData.facultyType === 'both') && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-700" />
                      Theory Subject Allocation &amp; Timetable:
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Theory Sem 3, 5, 7
                    </span>
                  </div>

                  {/* Manual Input for Theory Subject & Course Code */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Theory Subject Name * <span className="text-gray-400 font-normal">(Type any name)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Data Structures & Algorithm Design"
                        value={formData.subjectName}
                        onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Subject Code * <span className="text-gray-400 font-normal">(Type code)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AD2301"
                        value={formData.subjects}
                        onChange={(e) => setFormData({ ...formData, subjects: e.target.value.toUpperCase() })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold text-indigo-800 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick-Fill Theory Subject Presets across Active Semesters (3, 5, 7) */}
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

              {/* INDIVIDUAL ENTRY: 2. LABORATORY / PRACTICAL FACULTY */}
              {(formData.facultyType === 'lab_faculty' || (formData.facultyType === 'both' && !formData.subjectName.toLowerCase().includes('laboratory'))) && (
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-purple-700" />
                      Laboratory / Practical Allocation &amp; Timetable:
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Labs Sem 3, 5, 7
                    </span>
                  </div>

                  {/* Manual Input for Lab Name & Course Code */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Laboratory Name * <span className="text-gray-400 font-normal">(Type any name)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Object Oriented Programming Laboratory"
                        value={formData.subjectName}
                        onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Lab Code * <span className="text-gray-400 font-normal">(Type code)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AD2311"
                        value={formData.subjects}
                        onChange={(e) => setFormData({ ...formData, subjects: e.target.value.toUpperCase() })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold text-purple-800 focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick-Fill Lab Presets across Active Semesters (3, 5, 7) */}
                  <div className="p-3 rounded-2xl bg-white border border-purple-200/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-[#071A3D] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Quick-Fill Lab from Semester:
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto">
                        {[3, 5, 7].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setQuickLabTab(`sem${s}`)}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                              quickLabTab === `sem${s}` ? 'bg-purple-700 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                          >
                            Sem {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
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
                        const isSelected = parsedSelectedDays.includes(d.code)
                        return (
                          <button
                            key={d.code}
                            type="button"
                            onClick={() => toggleDaySelection(d.code)}
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
                        const isSelected = parsedSelectedPeriods.includes(p.name)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePeriodSelection(p.name)}
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

              {/* COMBINED TIMINGS & LIVE SCHEDULE PREVIEW */}
              {(formData.facultyType !== 'advisor') && (
                <div className="space-y-2 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                      Combined Time of Classes (Auto-calculated / Editable):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 01:20 PM - 04:30 PM"
                      value={formData.classTime}
                      onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono text-[11px] font-bold text-[#071A3D]"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-gray-500 font-bold">Schedule Summary:</span>
                    <span className="font-mono font-bold text-[#1455D9] text-right truncate">
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
              {/* Role / Type Selector: Advisor, Theory Subject, Lab Practical, or Both */}
              <div>
                <label className="block font-bold text-[#071A3D] mb-1.5">
                  Faculty Role / Allocation Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    <UserCheck className="w-4 h-4 text-[#1455D9]" />
                    <span>Class Advisor</span>
                    <span className="text-[10px] font-normal text-gray-400">Batch Mentor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facultyType: 'subject_handler' })}
                    className={cn(
                      'p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1',
                      formData.facultyType === 'subject_handler'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs ring-2 ring-indigo-600/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Theory Subject</span>
                    <span className="text-[10px] font-normal text-gray-400">Course Instructor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facultyType: 'lab_faculty' })}
                    className={cn(
                      'p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1',
                      formData.facultyType === 'lab_faculty'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs ring-2 ring-purple-600/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    <span>Lab / Practical</span>
                    <span className="text-[10px] font-normal text-gray-400">Lab In-Charge</span>
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
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Advisor &amp; Multi</span>
                    <span className="text-[10px] font-normal text-gray-400">Combined Duties</span>
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

              {/* Class Advisor Assignment in Edit */}
              {(formData.facultyType === 'advisor' || formData.facultyType === 'both') && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 animate-fade-in">
                  <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#1455D9]" />
                    Class Advisor Allocation (Active Semesters 3, 5, 7):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
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
                            advisorBatch: `Year ${yr} - Sem ${sem} - Sec ${formData.advisorSec}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#1455D9]"
                      >
                        {[3, 5, 7].map((s) => (
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
                            advisorBatch: `Year ${y} - Sem ${sem} - Sec ${formData.advisorSec}`,
                          })
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-semibold"
                      >
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

              {/* INDIVIDUAL ENTRY: 1. THEORY SUBJECT FACULTY in EDIT MODAL */}
              {(formData.facultyType === 'subject_handler' || formData.facultyType === 'both') && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-700" />
                      Theory Subject Allocation &amp; Timetable:
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Theory Sem 3, 5, 7
                    </span>
                  </div>

                  {/* Manual Input for Theory Subject & Course Code */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Theory Subject Name * <span className="text-gray-400 font-normal">(Type any name)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Data Structures & Algorithm Design"
                        value={formData.subjectName}
                        onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Subject Code * <span className="text-gray-400 font-normal">(Type code)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AD2301"
                        value={formData.subjects}
                        onChange={(e) => setFormData({ ...formData, subjects: e.target.value.toUpperCase() })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold text-indigo-800 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick-Fill Theory Subject Presets across Active Semesters (3, 5, 7) */}
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

              {/* INDIVIDUAL ENTRY: 2. LABORATORY / PRACTICAL FACULTY in EDIT MODAL */}
              {(formData.facultyType === 'lab_faculty' || (formData.facultyType === 'both' && !formData.subjectName.toLowerCase().includes('laboratory'))) && (
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#071A3D] flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-purple-700" />
                      Laboratory / Practical Allocation &amp; Timetable:
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Labs Sem 3, 5, 7
                    </span>
                  </div>

                  {/* Manual Input for Lab Name & Course Code */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Laboratory Name * <span className="text-gray-400 font-normal">(Type any name)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Object Oriented Programming Laboratory"
                        value={formData.subjectName}
                        onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                        Lab Code * <span className="text-gray-400 font-normal">(Type code)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AD2311"
                        value={formData.subjects}
                        onChange={(e) => setFormData({ ...formData, subjects: e.target.value.toUpperCase() })}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold text-purple-800 focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick-Fill Lab Presets across Active Semesters (3, 5, 7) */}
                  <div className="p-3 rounded-2xl bg-white border border-purple-200/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-[#071A3D] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Quick-Fill Lab from Semester:
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto">
                        {[3, 5, 7].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setQuickLabTab(`sem${s}`)}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                              quickLabTab === `sem${s}` ? 'bg-purple-700 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                          >
                            Sem {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
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
                        const isSelected = parsedSelectedDays.includes(d.code)
                        return (
                          <button
                            key={d.code}
                            type="button"
                            onClick={() => toggleDaySelection(d.code)}
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
                        const isSelected = parsedSelectedPeriods.includes(p.name)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePeriodSelection(p.name)}
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

              {/* COMBINED TIMINGS & LIVE SCHEDULE PREVIEW */}
              {(formData.facultyType !== 'advisor') && (
                <div className="space-y-2 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <div>
                    <label className="block font-bold text-gray-700 text-[11px] mb-0.5">
                      Combined Time of Classes (Auto-calculated / Editable):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 01:20 PM - 04:30 PM"
                      value={formData.classTime}
                      onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono text-[11px] font-bold text-[#071A3D]"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-gray-500 font-bold">Schedule Summary:</span>
                    <span className="font-mono font-bold text-[#1455D9] text-right truncate">
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

      {/* ========================================================================= */}
      {/* EDIT / ADD LABORATORY MODAL */}
      {/* ========================================================================= */}
      {isLabModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#071A3D]">
                    {editingLabId ? 'Edit Laboratory Course' : 'Add New Laboratory Course'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Configure curriculum details, default sessions, timings and schedule days
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLabModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLab} className="space-y-4 text-xs">
              {/* Target Semester */}
              <div>
                <label className="block font-bold text-gray-700 text-xs mb-1">Target Semester *</label>
                <select
                  value={labFormData.targetSem}
                  onChange={(e) => setLabFormData({ ...labFormData, targetSem: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-[#1455D9] focus:border-[#1455D9] focus:outline-none"
                  disabled={Boolean(editingLabId)}
                >
                  <option value="sem3">Semester 3 · Year 2 (Sophomore - Odd)</option>
                  <option value="sem5">Semester 5 · Year 3 (Junior - Odd)</option>
                  <option value="sem7">Semester 7 · Year 4 (Senior - Odd)</option>
                </select>
              </div>

              {/* Lab Full Name */}
              <div>
                <label className="block font-bold text-gray-700 text-xs mb-1">
                  Full Laboratory Name * <span className="text-gray-400 font-normal">(e.g. Object Oriented Programming Laboratory)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Object Oriented Programming Laboratory"
                  value={labFormData.name}
                  onChange={(e) => setLabFormData({ ...labFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Code & Short Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 text-xs mb-1">
                    Course Code * <span className="text-gray-400 font-normal">(e.g. AD2311)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AD2311"
                    value={labFormData.code}
                    onChange={(e) => setLabFormData({ ...labFormData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono font-bold text-purple-800 focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-xs mb-1">
                    Short Name <span className="text-gray-400 font-normal">(e.g. OOP Lab)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OOP Lab"
                    value={labFormData.shortName}
                    onChange={(e) => setLabFormData({ ...labFormData, shortName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Credits & Period Preset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 text-xs mb-1">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={labFormData.credits}
                    onChange={(e) => setLabFormData({ ...labFormData, credits: Number(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-[#071A3D] focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-xs mb-1">Standard Lab Session</label>
                  <select
                    value={labFormData.defaultPeriod}
                    onChange={(e) => {
                      const period = e.target.value
                      let time = labFormData.defaultTime
                      if (period === 'Lab Session (FN)') time = '09:15 AM - 12:30 PM'
                      else if (period === 'Lab Session (AN)') time = '01:20 PM - 04:30 PM'
                      else if (period === 'Period 7, Period 8') time = '03:05 PM - 03:50 PM, 03:50 PM - 04:30 PM'
                      setLabFormData({
                        ...labFormData,
                        defaultPeriod: period,
                        defaultTime: time,
                      })
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-semibold text-[#071A3D] focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Lab Session (FN)">Forenoon: Lab Session (FN) [09:15 - 12:30]</option>
                    <option value="Lab Session (AN)">Afternoon: Lab Session (AN) [01:20 - 04:30]</option>
                    <option value="Period 7, Period 8">Evening: Period 7, Period 8 [03:05 - 04:30]</option>
                    <option value="Full Day Block">Full Day Dedicated Project Block</option>
                  </select>
                </div>
              </div>

              {/* Default Time & Default Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 text-xs mb-1">Default Timings</label>
                  <input
                    type="text"
                    value={labFormData.defaultTime}
                    onChange={(e) => setLabFormData({ ...labFormData, defaultTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono font-bold text-gray-700 focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-xs mb-1">Default Class Days</label>
                  <input
                    type="text"
                    placeholder="e.g. Tuesday, Friday"
                    value={labFormData.defaultDays}
                    onChange={(e) => setLabFormData({ ...labFormData, defaultDays: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Day Chips */}
              <div>
                <label className="block font-bold text-gray-500 text-[11px] mb-1">Click to toggle day:</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => {
                    const active = labFormData.defaultDays.includes(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const currentDays = labFormData.defaultDays
                            ? labFormData.defaultDays.split(',').map((x) => x.trim()).filter(Boolean)
                            : []
                          const updated = currentDays.includes(d)
                            ? currentDays.filter((x) => x !== d)
                            : [...currentDays, d]
                          setLabFormData({
                            ...labFormData,
                            defaultDays: updated.join(', '),
                          })
                        }}
                        className={cn(
                          'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                          active
                            ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-purple-50'
                        )}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsLabModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingLabId ? 'Save Lab Changes' : 'Create Laboratory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
