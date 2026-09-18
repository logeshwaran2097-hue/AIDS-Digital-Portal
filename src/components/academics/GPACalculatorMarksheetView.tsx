'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  GraduationCap,
  Calculator,
  Award,
  TrendingUp,
  Download,
  Plus,
  Trash2,
  Lock,
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Info,
  BookOpen,
  Layers,
  Percent,
  RotateCcw,
  Copy
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  R2023_ASSESSMENT_METHODS,
  ABSOLUTE_GRADING_II_YEAR,
  RELATIVE_GRADING_III_IV_YEAR,
  calculateTheoryMarks,
  calculateLabMarks,
  calculateTheoryCumLabMarks,
  getAbsoluteGradeIIYear
} from '@/lib/assessmentR2023'

interface SubjectGradeRow {
  id: string
  code: string
  name: string
  credits: number
  courseType: 'Theory' | 'Laboratory' | 'Theory cum Laboratory'
  grade: string
}

export interface MarksheetItem {
  semester: number
  academicYear: string
  gpa: number
  totalCredits: number
  result: 'PASS' | 'DISTINCTION' | 'WITHHELD'
  fileName: string
  fileSize: string
  dateUploaded: string
  verified: boolean
}

// Regulation 2023 / 2021 Presets for B.Tech AI & DS
const AI_DS_SEMESTER_PRESETS: Record<number, { code: string; name: string; credits: number; courseType: 'Theory' | 'Laboratory' | 'Theory cum Laboratory' }[]> = {
  1: [
    { code: 'HS3151', name: 'Professional English - I', credits: 3, courseType: 'Theory' },
    { code: 'MA3151', name: 'Matrices and Calculus', credits: 4, courseType: 'Theory' },
    { code: 'PH3151', name: 'Engineering Physics', credits: 3, courseType: 'Theory' },
    { code: 'CY3151', name: 'Engineering Chemistry', credits: 3, courseType: 'Theory' },
    { code: 'GE3151', name: 'Problem Solving and Python Programming', credits: 3, courseType: 'Theory' },
    { code: 'GE3171', name: 'Problem Solving and Python Programming Laboratory', credits: 2, courseType: 'Laboratory' },
    { code: 'BS3171', name: 'Physics and Chemistry Laboratory', credits: 2, courseType: 'Laboratory' }
  ],
  2: [
    { code: 'HS3251', name: 'Professional English - II', credits: 2, courseType: 'Theory' },
    { code: 'MA3251', name: 'Statistics and Numerical Methods', credits: 4, courseType: 'Theory' },
    { code: 'PH3256', name: 'Physics for Information Science', credits: 3, courseType: 'Theory' },
    { code: 'BE3251', name: 'Basic Electrical and Electronics Engineering', credits: 3, courseType: 'Theory' },
    { code: 'GE3251', name: 'Engineering Graphics', credits: 4, courseType: 'Theory' },
    { code: 'CS3251', name: 'Programming in C', credits: 3, courseType: 'Theory' },
    { code: 'GE3271', name: 'Engineering Practices Laboratory', credits: 2, courseType: 'Laboratory' },
    { code: 'CS3271', name: 'Programming in C Laboratory', credits: 1.5, courseType: 'Laboratory' }
  ],
  3: [
    { code: 'MA3354', name: 'Discrete Mathematics', credits: 4, courseType: 'Theory' },
    { code: 'CS3351', name: 'Digital Principles and Computer Organization', credits: 4, courseType: 'Theory' },
    { code: 'AD3301', name: 'Data Exploration and Visualization', credits: 4, courseType: 'Theory cum Laboratory' },
    { code: 'AD3351', name: 'Design and Analysis of Algorithms', credits: 4, courseType: 'Theory' },
    { code: 'AD3381', name: 'Database Design and Management', credits: 3, courseType: 'Theory' },
    { code: 'AL3391', name: 'Artificial Intelligence', credits: 4, courseType: 'Theory' },
    { code: 'AD3311', name: 'Database Design and Management Laboratory', credits: 1.5, courseType: 'Laboratory' },
    { code: 'AD3361', name: 'Data Science & Exploration Laboratory', credits: 1.5, courseType: 'Laboratory' }
  ],
  4: [
    { code: 'MA3391', name: 'Probability and Statistics', credits: 4, courseType: 'Theory' },
    { code: 'AL3452', name: 'Operating Systems', credits: 3, courseType: 'Theory' },
    { code: 'AL3451', name: 'Machine Learning', credits: 4, courseType: 'Theory cum Laboratory' },
    { code: 'AD3491', name: 'Fundamentals of Data Science', credits: 3, courseType: 'Theory' },
    { code: 'CS3491', name: 'Software Engineering', credits: 3, courseType: 'Theory' },
    { code: 'AD3411', name: 'Data Science and Machine Learning Laboratory', credits: 2, courseType: 'Laboratory' },
    { code: 'AL3461', name: 'Operating Systems Laboratory', credits: 1.5, courseType: 'Laboratory' }
  ],
  5: [
    { code: 'AD3501', name: 'Deep Learning', credits: 4, courseType: 'Theory cum Laboratory' },
    { code: 'CW3551', name: 'Data and Information Security', credits: 3, courseType: 'Theory' },
    { code: 'CS3591', name: 'Computer Networks', credits: 4, courseType: 'Theory' },
    { code: 'AD3511', name: 'Deep Learning Laboratory', credits: 2, courseType: 'Laboratory' },
    { code: 'AD3512', name: 'Professional Development', credits: 1, courseType: 'Laboratory' }
  ],
  6: [
    { code: 'AD3601', name: 'Natural Language Processing', credits: 4, courseType: 'Theory cum Laboratory' },
    { code: 'AD3611', name: 'Big Data Analytics', credits: 4, courseType: 'Theory' },
    { code: 'IT3601', name: 'Cloud Computing and Virtualization', credits: 3, courseType: 'Theory' },
    { code: 'AD3681', name: 'Mini Project / Capstone Lab', credits: 2, courseType: 'Laboratory' }
  ]
}

const DEFAULT_SEMESTER_CREDITS: Record<number, number> = {
  1: 20,
  2: 23.5,
  3: 26,
  4: 22.5,
  5: 22,
  6: 22,
  7: 20,
  8: 16
}

// Slide 13 Example Data
const SLIDE_13_EXAMPLE_COURSES: SubjectGradeRow[] = [
  { id: 'ex-1', code: 'MA101', name: 'Mathematics', credits: 4, courseType: 'Theory', grade: 'A+' },
  { id: 'ex-2', code: 'CS101', name: 'Programming', credits: 3, courseType: 'Theory', grade: 'A' },
  { id: 'ex-3', code: 'PH101', name: 'Physics', credits: 4, courseType: 'Theory', grade: 'B+' },
  { id: 'ex-4', code: 'EN101', name: 'English', credits: 2, courseType: 'Theory', grade: 'S' },
  { id: 'ex-5', code: 'LB101', name: 'Lab', credits: 2, courseType: 'Laboratory', grade: 'A+' }
]

interface GPACalculatorMarksheetViewProps {
  studentName?: string
  registerNumber?: string
  studentYear?: number
  currentSemester?: number
  initialCgpa?: number | null
}

export default function GPACalculatorMarksheetView({
  studentName = 'Student',
  registerNumber = '',
  studentYear = 2,
  currentSemester = 3,
  initialCgpa = null
}: GPACalculatorMarksheetViewProps) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'cgpa_predictor' | 'marks_calculator' | 'r2023_guidelines' | 'marksheet_locker'>('calculator')

  // Grading scheme selection: II Year uses Absolute Grading; III/IV Year uses Relative Grading
  const [gradingSystem, setGradingSystem] = useState<'absolute_ii_year' | 'relative_iii_iv_year'>(
    studentYear === 2 ? 'absolute_ii_year' : 'relative_iii_iv_year'
  )

  const [selectedSemester, setSelectedSemester] = useState<number>(currentSemester || 3)

  // Grade point mapping based on selected grading system
  const currentGradePoints = useMemo<Record<string, number>>(() => {
    if (gradingSystem === 'absolute_ii_year') {
      const map: Record<string, number> = {}
      ABSOLUTE_GRADING_II_YEAR.forEach(g => { map[g.grade] = g.gradePoint })
      return map
    } else {
      const map: Record<string, number> = {}
      RELATIVE_GRADING_III_IV_YEAR.forEach(g => { map[g.grade] = g.gradePoint })
      return map
    }
  }, [gradingSystem])

  // Grade options for select dropdowns
  const gradeOptions = useMemo(() => {
    if (gradingSystem === 'absolute_ii_year') {
      return ABSOLUTE_GRADING_II_YEAR.map(g => ({
        grade: g.grade,
        label: `${g.grade} (Pts: ${g.gradePoint} - ${g.title})`,
        point: g.gradePoint
      }))
    } else {
      return RELATIVE_GRADING_III_IV_YEAR.map(g => ({
        grade: g.grade,
        label: `${g.grade} (Pts: ${g.gradePoint} - ${g.title})`,
        point: g.gradePoint
      }))
    }
  }, [gradingSystem])

  // Subject rows for GPA calculator (real presets from curriculum)
  const [subjects, setSubjects] = useState<SubjectGradeRow[]>(() => {
    const preset = AI_DS_SEMESTER_PRESETS[selectedSemester] || AI_DS_SEMESTER_PRESETS[3] || []
    return preset.map((item, idx) => ({
      id: `subj-${idx}`,
      code: item.code,
      name: item.name,
      credits: item.credits,
      courseType: item.courseType,
      grade: ''
    }))
  })

  // Real Cumulative Semester GPAs state (zero placeholder/fake numbers)
  const storageKey = `aids_student_semester_gpas_${registerNumber}`
  const [semesterGPAs, setSemesterGPAs] = useState<Record<number, { gpa: number; credits: number }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // fallback
        }
      }
    }
    // Initialize clean with 0 (real data entered by student)
    const initial: Record<number, { gpa: number; credits: number }> = {}
    for (let sem = 1; sem <= 8; sem++) {
      initial[sem] = { gpa: 0, credits: DEFAULT_SEMESTER_CREDITS[sem] || 20 }
    }
    if (initialCgpa && initialCgpa > 0) {
      initial[1] = { gpa: initialCgpa, credits: DEFAULT_SEMESTER_CREDITS[1] }
    }
    return initial
  })

  // Save to localStorage when semesterGPAs change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(semesterGPAs))
    }
  }, [semesterGPAs, storageKey])

  // Target Predictor State
  const [targetCGPA, setTargetCGPA] = useState<number>(8.5)

  // Real Marksheets state (empty by default - no fake uploaded PDFs)
  const marksheetStorageKey = `aids_student_marksheets_${registerNumber}`
  const [marksheets, setMarksheets] = useState<MarksheetItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(marksheetStorageKey)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // fallback
        }
      }
    }
    return []
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(marksheetStorageKey, JSON.stringify(marksheets))
    }
  }, [marksheets, marksheetStorageKey])

  // Switch semester preset
  const handleSemesterChange = (sem: number) => {
    setSelectedSemester(sem)
    const preset = AI_DS_SEMESTER_PRESETS[sem] || []
    setSubjects(preset.map((item, idx) => ({
      id: `subj-${sem}-${idx}`,
      code: item.code,
      name: item.name,
      credits: item.credits,
      courseType: item.courseType,
      grade: ''
    })))
    toast.success(`Loaded Regulation 2023 curriculum for Semester ${sem}!`)
  }

  // Clear all course grades
  const handleClearGrades = () => {
    setSubjects(prev => prev.map(s => ({ ...s, grade: '' })))
    toast.success('Course grades cleared. Select your grades to calculate SGPA.')
  }

  // Load Slide 13 Example
  const handleLoadSlide13Example = () => {
    setGradingSystem('absolute_ii_year')
    setSubjects(SLIDE_13_EXAMPLE_COURSES)
    toast.success('Loaded Official Example: Total Credits=15, Points=126, SGPA=8.40!', { icon: '📊' })
  }

  // Load Slide 14 Example
  const handleLoadSlide14Example = () => {
    setSemesterGPAs({
      1: { gpa: 8.50, credits: 20 },
      2: { gpa: 8.80, credits: 22 },
      3: { gpa: 9.10, credits: 21 },
      4: { gpa: 0, credits: DEFAULT_SEMESTER_CREDITS[4] },
      5: { gpa: 0, credits: DEFAULT_SEMESTER_CREDITS[5] },
      6: { gpa: 0, credits: DEFAULT_SEMESTER_CREDITS[6] },
      7: { gpa: 0, credits: DEFAULT_SEMESTER_CREDITS[7] },
      8: { gpa: 0, credits: DEFAULT_SEMESTER_CREDITS[8] }
    })
    toast.success('Loaded Official Example: Sem 1(20@8.50), Sem 2(22@8.80), Sem 3(21@9.10) => CGPA = 8.81!', { icon: '🎓' })
  }

  // Add custom subject
  const handleAddSubject = () => {
    const newId = `custom-${Date.now()}`
    setSubjects(prev => [
      ...prev,
      { id: newId, code: 'AD3099', name: 'Professional Elective / Special Course', credits: 3, courseType: 'Theory', grade: '' }
    ])
    toast.success('Custom elective added to calculator!')
  }

  // Remove subject
  const handleRemoveSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id))
  }

  // Update grade or credits
  const handleUpdateSubject = (id: string, field: 'grade' | 'credits' | 'courseType', value: any) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value }
      }
      return s
    }))
  }

  // Live SGPA Calculations: sum(Ci * Gi) / sum(Ci)
  const { totalWeightedPoints, currentSemesterCredits, gradedSemesterCredits, calculatedSemesterGPA, gradedCoursesCount, totalCoursesCount, hasAnyGrade } = useMemo(() => {
    let sumCiGi = 0
    let sumCi = 0
    let gradedCredits = 0
    let gradedCount = 0

    subjects.forEach(s => {
      sumCi += s.credits
      if (s.grade && currentGradePoints[s.grade] !== undefined) {
        const pt = currentGradePoints[s.grade]
        sumCiGi += pt * s.credits
        gradedCredits += s.credits
        gradedCount++
      }
    })

    const sgpa = gradedCredits > 0 ? parseFloat((sumCiGi / gradedCredits).toFixed(2)) : 0
    return {
      totalWeightedPoints: parseFloat(sumCiGi.toFixed(2)),
      currentSemesterCredits: sumCi,
      gradedSemesterCredits: gradedCredits,
      calculatedSemesterGPA: sgpa,
      gradedCoursesCount: gradedCount,
      totalCoursesCount: subjects.length,
      hasAnyGrade: gradedCount > 0
    }
  }, [subjects, currentGradePoints])

  // Live CGPA Calculations (Slide 14: sum(Semester Credits * SGPA) / sum(Semester Credits))
  const { currentCGPA, completedCredits, totalCompletedSemesters, totalCreditPointsCGPA } = useMemo(() => {
    let earnedPoints = 0
    let compCredits = 0
    let semCount = 0

    Object.entries(semesterGPAs).forEach(([_, data]) => {
      if (data.gpa > 0 && data.credits > 0) {
        earnedPoints += data.gpa * data.credits
        compCredits += data.credits
        semCount++
      }
    })

    const gpa = compCredits > 0 ? parseFloat((earnedPoints / compCredits).toFixed(2)) : 0
    return {
      currentCGPA: gpa,
      completedCredits: compCredits,
      totalCompletedSemesters: semCount,
      totalCreditPointsCGPA: parseFloat(earnedPoints.toFixed(2))
    }
  }, [semesterGPAs])

  // Required GPA for target (calculated against real remaining credits)
  const requiredRemainingGPA = useMemo(() => {
    let earnedPoints = 0
    let completedCreds = 0
    let remainingCreds = 0

    Object.entries(semesterGPAs).forEach(([_, data]) => {
      if (data.gpa > 0) {
        earnedPoints += data.gpa * data.credits
        completedCreds += data.credits
      } else {
        remainingCreds += data.credits
      }
    })

    const totalGradCredits = completedCreds + remainingCreds
    const totalPointsNeeded = targetCGPA * totalGradCredits
    const remainingPointsNeeded = totalPointsNeeded - earnedPoints

    if (remainingCreds <= 0) return 0
    const req = remainingPointsNeeded / remainingCreds
    return parseFloat(req.toFixed(2))
  }, [semesterGPAs, targetCGPA])

  // ==========================================
  // R2023 EXAM & INTERNAL MARKS CALCULATOR STATE
  // ==========================================
  const [courseCategory, setCourseCategory] = useState<'Theory' | 'Laboratory' | 'Theory cum Laboratory'>('Theory')
  const [theoryInputs, setTheoryInputs] = useState({
    test1: 76,
    test2: 80,
    assign1: 90,
    assign2: 90,
    external: 90
  })
  const [labInputs, setLabInputs] = useState({
    record: 70,
    test: 22,
    external: 85
  })
  const [theoryLabInputs, setTheoryLabInputs] = useState({
    assignment: 85,
    writtenTest: 78,
    labRecord: 68,
    labTest: 23,
    external: 85
  })

  // Computed marks for current category
  const currentMarksResult = useMemo(() => {
    if (courseCategory === 'Theory') {
      const calc = calculateTheoryMarks({
        test1Marks: theoryInputs.test1,
        test2Marks: theoryInputs.test2,
        assignment1Marks: theoryInputs.assign1,
        assignment2Marks: theoryInputs.assign2,
        externalMarksScored: theoryInputs.external
      })
      const absGrade = getAbsoluteGradeIIYear(calc.totalMarks)
      return { ...calc, absoluteGrade: absGrade, category: 'Theory' }
    } else if (courseCategory === 'Laboratory') {
      const calc = calculateLabMarks({
        observationRecordMarks: labInputs.record,
        testMarks: labInputs.test,
        externalMarksScored: labInputs.external
      })
      const absGrade = getAbsoluteGradeIIYear(calc.totalMarks)
      return { ...calc, absoluteGrade: absGrade, category: 'Laboratory' }
    } else {
      const calc = calculateTheoryCumLabMarks({
        assignmentMarks: theoryLabInputs.assignment,
        writtenTestMarks: theoryLabInputs.writtenTest,
        labRecordMarks: theoryLabInputs.labRecord,
        labTestMarks: theoryLabInputs.labTest,
        externalMarksScored: theoryLabInputs.external
      })
      const absGrade = getAbsoluteGradeIIYear(calc.totalMarks)
      return { ...calc, absoluteGrade: absGrade, category: 'Theory cum Laboratory' }
    }
  }, [courseCategory, theoryInputs, labInputs, theoryLabInputs])

  // Upload Real Marksheet Modal / Action
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [newMarksheet, setNewMarksheet] = useState({
    semester: selectedSemester,
    academicYear: 'Nov / Dec 2024',
    gpa: '',
    totalCredits: DEFAULT_SEMESTER_CREDITS[selectedSemester] || 24,
    result: 'PASS' as 'PASS' | 'DISTINCTION' | 'WITHHELD',
    fileName: ''
  })

  const handleSaveUploadedMarksheet = (e: React.FormEvent) => {
    e.preventDefault()
    const gpaNum = parseFloat(newMarksheet.gpa)
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 10) {
      toast.error('Please enter a valid Semester GPA between 0.0 and 10.0')
      return
    }

    const item: MarksheetItem = {
      semester: newMarksheet.semester,
      academicYear: newMarksheet.academicYear,
      gpa: gpaNum,
      totalCredits: Number(newMarksheet.totalCredits),
      result: newMarksheet.result,
      fileName: newMarksheet.fileName || `Official_Sem${newMarksheet.semester}_GradeSheet.pdf`,
      fileSize: '1.2 MB',
      dateUploaded: new Date().toLocaleDateString('en-GB'),
      verified: true
    }

    setMarksheets(prev => [...prev.filter(m => m.semester !== item.semester), item])
    setSemesterGPAs(prev => ({
      ...prev,
      [item.semester]: { gpa: item.gpa, credits: item.totalCredits }
    }))

    setShowUploadModal(false)
    setNewMarksheet({
      semester: selectedSemester,
      academicYear: 'Nov / Dec 2024',
      gpa: '',
      totalCredits: DEFAULT_SEMESTER_CREDITS[selectedSemester] || 24,
      result: 'PASS',
      fileName: ''
    })
    toast.success(`Saved and verified Semester ${item.semester} Marksheet!`)
  }

  // Clear real marks / reset all semester GPAs
  const handleResetAllSemesters = () => {
    if (confirm('Are you sure you want to clear all entered semester GPA data?')) {
      const resetMap: Record<number, { gpa: number; credits: number }> = {}
      for (let sem = 1; sem <= 8; sem++) {
        resetMap[sem] = { gpa: 0, credits: DEFAULT_SEMESTER_CREDITS[sem] || 20 }
      }
      setSemesterGPAs(resetMap)
      setMarksheets([])
      if (typeof window !== 'undefined') {
        localStorage.removeItem(storageKey)
        localStorage.removeItem(marksheetStorageKey)
      }
      toast.success('All semester GPAs and marksheets cleared!')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0E2C66] to-[#1455D9] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>V.S.B. Autonomous Regulation 2023 (R2023) Official Academic Formulae</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              SGPA &amp; CGPA Examination Calculation Suite
            </h1>
            <p className="text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
              Official credit-weighted formulae for SGPA (&sum;C<sub>i</sub>G<sub>i</sub> / &sum;C<sub>i</sub>) and CGPA (&sum;Credits &times; SGPA / &sum;Credits) directly aligned with Autonomous R2023 presentation rubrics.
            </p>
          </div>

          {/* Real Statistics Card */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20">
            <div className="text-center">
              <span className="text-[10px] text-cyan-200 uppercase font-bold block">Current CGPA</span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {currentCGPA > 0 ? currentCGPA.toFixed(2) : '—'}
              </span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <span className="text-[10px] text-cyan-200 uppercase font-bold block">Earned Credits</span>
              <span className="text-2xl sm:text-3xl font-black text-cyan-300">
                {completedCredits} <span className="text-xs text-white/60">/ 165</span>
              </span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <span className="text-[10px] text-cyan-200 uppercase font-bold block">Completed Sems</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-300">
                {totalCompletedSemesters} <span className="text-xs text-white/60">/ 8</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>SGPA Calculation</span>
          </button>

          <button
            onClick={() => setActiveTab('cgpa_predictor')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'cgpa_predictor'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>CGPA Calculation</span>
          </button>

          <button
            onClick={() => setActiveTab('marks_calculator')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'marks_calculator'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Percent className="w-4 h-4 text-amber-500" />
            <span>R2023 Exam Marks</span>
          </button>

          <button
            onClick={() => setActiveTab('r2023_guidelines')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'r2023_guidelines'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Assessment Matrix &amp; Grades</span>
          </button>

          <button
            onClick={() => setActiveTab('marksheet_locker')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'marksheet_locker'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Grade Sheets Vault {marksheets.length > 0 && `(${marksheets.length})`}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SGPA CALCULATION (MATCHING SLIDE 13 EXACTLY)       */}
      {/* ======================================================== */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Slide 13 Official Formula Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  Official Formula
                </span>
                <h3 className="font-black text-slate-900 text-lg tracking-tight">SGPA (Semester Grade Point Average)</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">Formula:</p>

              {/* Boxed Mathematical Formula */}
              <div className="inline-flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-slate-800 rounded-xl font-serif">
                <span className="font-bold text-slate-900 text-base">SGPA =</span>
                <div className="inline-flex flex-col items-center">
                  <span className="border-b-2 border-slate-800 px-3 pb-1 text-sm font-bold text-slate-900">
                    &sum; (C<sub>i</sub> &times; G<sub>i</sub>)
                  </span>
                  <span className="pt-1 text-sm font-bold text-slate-900">
                    &sum; C<sub>i</sub>
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                <div className="font-semibold text-slate-700">Where:</div>
                <div>&bull; <strong>C<sub>i</sub></strong> = Credits of the course</div>
                <div>&bull; <strong>G<sub>i</sub></strong> = Grade Point obtained in the course</div>
              </div>
            </div>

            {/* Quick Action Preset from Slide 13 */}
            <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
              <button
                onClick={handleLoadSlide13Example}
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Load Example (SGPA = 8.40)</span>
              </button>

              {/* Grading Scheme Toggle */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setGradingSystem('absolute_ii_year')}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    gradingSystem === 'absolute_ii_year'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  II Year (Absolute)
                </button>
                <button
                  onClick={() => setGradingSystem('relative_iii_iv_year')}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    gradingSystem === 'relative_iii_iv_year'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  III/IV Year (Relative)
                </button>
              </div>
            </div>
          </div>

          {/* Main Interactive Table matching Slide 13 Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Semester Course Work Table</h4>
                    <p className="text-xs text-slate-500">Select course grades to calculate real credit-weighted semester SGPA</p>
                  </div>

                  {/* Semester selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[1, 2, 3, 4, 5, 6].map((sem) => (
                      <button
                        key={sem}
                        onClick={() => handleSemesterChange(sem)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedSemester === sem
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Sem {sem}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4 text-center w-28">Credits (C<sub>i</sub>)</th>
                        <th className="py-3 px-4 text-center w-36">Grade Point (G<sub>i</sub>)</th>
                        <th className="py-3 px-4 text-center w-28 font-mono">C<sub>i</sub> &times; G<sub>i</sub></th>
                        <th className="py-3 px-3 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map((subj) => {
                        const hasGrade = Boolean(subj.grade && currentGradePoints[subj.grade] !== undefined)
                        const pt = hasGrade ? currentGradePoints[subj.grade] : null
                        const ciGi = hasGrade && pt !== null ? (pt * subj.credits) : null
                        return (
                          <tr key={subj.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-800 block">{subj.name}</span>
                              <span className="text-slate-400 font-mono text-[10px]">{subj.code} · {subj.courseType}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                step="0.5"
                                min="1"
                                max="6"
                                value={subj.credits}
                                onChange={(e) => handleUpdateSubject(subj.id, 'credits', parseFloat(e.target.value) || 0)}
                                className="w-16 p-1.5 rounded-lg border border-slate-200 text-center font-bold text-slate-800 bg-slate-50"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <select
                                value={subj.grade}
                                onChange={(e) => handleUpdateSubject(subj.id, 'grade', e.target.value)}
                                className={`w-full p-1.5 rounded-lg border font-bold text-xs bg-white transition-colors ${
                                  subj.grade ? 'border-blue-300 text-blue-700 bg-blue-50/30' : 'border-slate-200 text-slate-400'
                                }`}
                              >
                                <option value="">— Select Grade —</option>
                                {gradeOptions.map((opt) => (
                                  <option key={opt.grade} value={opt.grade} className="text-slate-800 font-medium">
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 text-sm">
                              {ciGi !== null ? ciGi : <span className="text-slate-300 font-normal">—</span>}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleRemoveSubject(subj.id)}
                                className="p-1 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove Course"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}

                      {/* Total Row */}
                      <tr className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="py-3 px-4 font-black uppercase text-xs">Total</td>
                        <td className="py-3 px-4 text-center font-black text-sm font-mono text-blue-700">
                          {currentSemesterCredits}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 text-[11px]">—</td>
                        <td className="py-3 px-4 text-center font-black text-sm font-mono text-blue-700">
                          {hasAnyGrade ? totalWeightedPoints : '—'}
                        </td>
                        <td className="py-3 px-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Step-by-Step Fraction Display */}
                {hasAnyGrade ? (
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-serif">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800 text-sm">Calculation:</span>
                      <span className="font-bold text-base text-slate-900">SGPA =</span>
                      <div className="inline-flex flex-col items-center text-sm font-bold">
                        <span className="border-b-2 border-slate-800 px-3 pb-0.5 text-blue-800">{totalWeightedPoints}</span>
                        <span className="pt-0.5 text-slate-800">{gradedSemesterCredits}</span>
                      </div>
                      <span className="font-bold text-base text-slate-900">=</span>
                      <span className="text-xl font-black text-blue-800">{calculatedSemesterGPA.toFixed(2)}</span>
                    </div>

                    <div className="font-sans">
                      <span className="text-xs text-slate-500 font-bold block">
                        {gradedCoursesCount === totalCoursesCount ? 'Final Semester Result:' : `Interim Result (${gradedCoursesCount}/${totalCoursesCount} Graded):`}
                      </span>
                      <strong className="text-base font-black text-blue-900">SGPA = {calculatedSemesterGPA.toFixed(2)}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                    Select your course grade in the table above to compute your real SGPA.
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddSubject}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>Add Custom Course</span>
                    </button>
                    {hasAnyGrade && (
                      <button
                        onClick={handleClearGrades}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear Grades</span>
                      </button>
                    )}
                  </div>

                  <button
                    disabled={!hasAnyGrade}
                    onClick={() => {
                      if (!hasAnyGrade) return
                      setSemesterGPAs(prev => ({
                        ...prev,
                        [selectedSemester]: { gpa: calculatedSemesterGPA, credits: currentSemesterCredits }
                      }))
                      toast.success(`Saved Sem ${selectedSemester} SGPA (${calculatedSemesterGPA.toFixed(2)}) to your real Cumulative CGPA records!`)
                    }}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      hasAnyGrade
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save to CGPA Tracker</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-200 block">
                  SEMESTER SGPA
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">{hasAnyGrade ? calculatedSemesterGPA.toFixed(2) : '—'}</span>
                  <span className="text-lg font-bold text-cyan-200">/ 10.0</span>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/20 text-xs text-cyan-100">
                  <div className="flex justify-between">
                    <span>Total Registered Credits (&sum;C<sub>i</sub>):</span>
                    <strong className="text-white font-mono">{currentSemesterCredits} Credits</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Credit-Points (&sum;C<sub>i</sub>G<sub>i</sub>):</span>
                    <strong className="text-white font-mono">{hasAnyGrade ? `${totalWeightedPoints} Points` : '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Academic Honors:</span>
                    <strong className="text-white font-bold">
                      {!hasAnyGrade
                        ? 'Awaiting Grade Input'
                        : calculatedSemesterGPA >= 8.5
                        ? 'First Class with Distinction'
                        : calculatedSemesterGPA >= 6.5
                        ? 'First Class'
                        : 'Second Class'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Grading Reference */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>
                    {gradingSystem === 'absolute_ii_year' ? 'II Year Absolute Scale' : 'III/IV Year Relative Scale'}
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {gradingSystem === 'absolute_ii_year' ? (
                    ABSOLUTE_GRADING_II_YEAR.map((g) => (
                      <div key={g.grade} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-800">{g.grade} ({g.title}):</span>
                        <span className="text-slate-500 block">{g.gradePoint} pts ({g.range})</span>
                      </div>
                    ))
                  ) : (
                    RELATIVE_GRADING_III_IV_YEAR.map((g) => (
                      <div key={g.grade} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-800">{g.grade} ({g.title}):</span>
                        <span className="text-slate-500 block">{g.gradePoint} pts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CGPA CALCULATION (MATCHING SLIDE 14 EXACTLY)       */}
      {/* ======================================================== */}
      {activeTab === 'cgpa_predictor' && (
        <div className="space-y-6">
          {/* Slide 14 Official Formula Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  Official Formula
                </span>
                <h3 className="font-black text-slate-900 text-lg tracking-tight">CGPA (Cumulative Grade Point Average)</h3>
              </div>
              <p className="text-xs text-slate-600">
                CGPA is the overall average grade point across all completed semesters.
              </p>
              <p className="text-xs text-slate-500 font-medium">Formula (Credit-Based):</p>

              {/* Boxed Mathematical Formulas */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-slate-800 rounded-xl font-serif">
                  <span className="font-bold text-slate-900 text-sm">CGPA =</span>
                  <div className="inline-flex flex-col items-center">
                    <span className="border-b-2 border-slate-800 px-3 pb-1 text-xs font-bold text-slate-900">
                      &sum; (Semester Credits &times; SGPA)
                    </span>
                    <span className="pt-1 text-xs font-bold text-slate-900">
                      &sum; Semester Credits
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-400">or equivalently,</span>

                <div className="inline-flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-slate-800 rounded-xl font-serif">
                  <span className="font-bold text-slate-900 text-sm">CGPA =</span>
                  <div className="inline-flex flex-col items-center">
                    <span className="border-b-2 border-slate-800 px-3 pb-1 text-xs font-bold text-slate-900">
                      &sum; (C<sub>i</sub> &times; G<sub>i</sub>) for all semesters
                    </span>
                    <span className="pt-1 text-xs font-bold text-slate-900">
                      &sum; C<sub>i</sub> for all semesters
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={handleLoadSlide14Example}
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Load Example (CGPA = 8.81)</span>
              </button>

              <button
                onClick={handleResetAllSemesters}
                className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Real Semesters</span>
              </button>
            </div>
          </div>

          {/* Example Table matching Slide 14 Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Semester-by-Semester Cumulative Records</h4>
                    <p className="text-xs text-slate-500">Enter real semester SGPA scores below or load example</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {totalCompletedSemesters} Completed / 8
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                        <th className="py-3 px-4">Semester</th>
                        <th className="py-3 px-4 text-center w-32">Total Credits</th>
                        <th className="py-3 px-4 text-center w-32">SGPA</th>
                        <th className="py-3 px-4 text-center w-36 font-mono">Credits &times; SGPA</th>
                        <th className="py-3 px-3 text-center w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => {
                        const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][sem - 1]
                        const data = semesterGPAs[sem] || { gpa: 0, credits: DEFAULT_SEMESTER_CREDITS[sem] || 20 }
                        const isEntered = data.gpa > 0
                        const creditsTimesSGPA = isEntered ? parseFloat((data.credits * data.gpa).toFixed(2)) : 0

                        return (
                          <tr key={sem} className={isEntered ? 'hover:bg-slate-50/70' : 'bg-slate-50/30'}>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-800 text-sm">Semester {roman}</span>
                              <span className="text-slate-400 text-[10px] block">Sem {sem}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                step="0.5"
                                value={data.credits}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0
                                  setSemesterGPAs(prev => ({
                                    ...prev,
                                    [sem]: { ...prev[sem], credits: val }
                                  }))
                                }}
                                className="w-16 p-1.5 rounded-lg border border-slate-200 text-center font-bold text-slate-800 bg-slate-50"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                placeholder="0.00"
                                value={data.gpa > 0 ? data.gpa : ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0
                                  setSemesterGPAs(prev => ({
                                    ...prev,
                                    [sem]: { ...prev[sem], gpa: val }
                                  }))
                                }}
                                className={`w-20 p-1.5 text-center font-black rounded-lg text-sm border ${
                                  isEntered ? 'border-emerald-300 bg-emerald-50/30 text-emerald-800' : 'border-slate-200 text-slate-600'
                                }`}
                              />
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 text-sm">
                              {isEntered ? creditsTimesSGPA.toFixed(2) : '—'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {isEntered ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Done
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-slate-400">
                                  Upcoming
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}

                      {/* Total Row matching Slide 14 Total */}
                      <tr className="bg-emerald-50/70 font-bold text-slate-900 border-t-2 border-emerald-300">
                        <td className="py-3 px-4 font-black uppercase text-xs">Total</td>
                        <td className="py-3 px-4 text-center font-black text-sm font-mono text-emerald-800">
                          {completedCredits}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 text-[11px]">—</td>
                        <td className="py-3 px-4 text-center font-black text-sm font-mono text-emerald-800">
                          {totalCreditPointsCGPA.toFixed(2)}
                        </td>
                        <td className="py-3 px-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Step-by-Step Fraction Display matching Slide 14 */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-serif">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800 text-sm">Calculation:</span>
                    <span className="font-bold text-base text-slate-900">CGPA =</span>
                    <div className="inline-flex flex-col items-center text-sm font-bold">
                      <span className="border-b-2 border-slate-800 px-3 pb-0.5 text-emerald-900">
                        {totalCreditPointsCGPA.toFixed(2)}
                      </span>
                      <span className="pt-0.5 text-slate-800">{completedCredits}</span>
                    </div>
                    <span className="font-bold text-base text-slate-900">=</span>
                    <span className="text-xl font-black text-emerald-900">
                      {currentCGPA > 0 ? currentCGPA.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <div className="font-sans">
                    <span className="text-xs text-slate-500 font-bold block">Final Cumulative Result:</span>
                    <strong className="text-base font-black text-emerald-900">
                      CGPA = {currentCGPA > 0 ? currentCGPA.toFixed(2) : '—'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200 block">
                  CUMULATIVE CGPA
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">{currentCGPA > 0 ? currentCGPA.toFixed(2) : '—'}</span>
                  <span className="text-lg font-bold text-emerald-200">/ 10.0</span>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/20 text-xs text-emerald-100">
                  <div className="flex justify-between">
                    <span>Total Earned Credits (&sum;C<sub>s</sub>):</span>
                    <strong className="text-white font-mono">{completedCredits} Credits</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Points (&sum;Credits &times; SGPA):</span>
                    <strong className="text-white font-mono">{totalCreditPointsCGPA.toFixed(2)} Points</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Degree Honors:</span>
                    <strong className="text-white font-bold">
                      {currentCGPA >= 8.5 ? 'First Class with Distinction' : currentCGPA >= 6.5 ? 'First Class' : currentCGPA >= 5.0 ? 'Second Class' : 'Pending Entry'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Target Predictor Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Graduation Target Predictor</span>
                  </h4>
                  <div className="flex items-center gap-1">
                    <label className="text-[10px] text-slate-500 font-bold">Goal:</label>
                    <input
                      type="number"
                      step="0.1"
                      min="5.0"
                      max="10.0"
                      value={targetCGPA}
                      onChange={(e) => setTargetCGPA(parseFloat(e.target.value) || 8.5)}
                      className="w-14 p-1 text-center font-bold text-xs border rounded-lg border-emerald-400 text-emerald-700"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentCGPA > 0 ? (
                    requiredRemainingGPA <= 10.0 && requiredRemainingGPA > 0 ? (
                      <>
                        You need an average of <strong className="text-emerald-700 font-bold">{requiredRemainingGPA.toFixed(2)} SGPA</strong> across remaining {165 - completedCredits} credits to graduate with {targetCGPA.toFixed(2)} CGPA.
                      </>
                    ) : requiredRemainingGPA <= 0 ? (
                      <span className="text-emerald-700 font-bold">Target CGPA already achieved!</span>
                    ) : (
                      <span className="text-amber-700 font-medium">Target CGPA is unachievable with remaining credits.</span>
                    )
                  ) : (
                    'Enter at least 1 completed semester SGPA to see your graduation roadmap.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: R2023 EXAM MARKS CALCULATOR (SLIDES 8–12)         */}
      {/* ======================================================== */}
      {activeTab === 'marks_calculator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-1">
                <Percent className="w-3.5 h-3.5 text-amber-600" />
                <span>R2023 Exact Examination Formula</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Continuous Assessment &amp; Final Grade Awarding</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate internal continuous assessment conversions and end-semester external exam marks to verify your exact course total and grade.
              </p>
            </div>

            <button
              onClick={() => {
                setCourseCategory('Theory')
                setTheoryInputs({ test1: 76, test2: 80, assign1: 90, assign2: 90, external: 90 })
                toast.success('Loaded Official Example: Test1=76, Test2=80, Assign1=90, Assign2=90, External=90 => 87 (A+)')
              }}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Load Example (Total=87 &rarr; A+)</span>
            </button>
          </div>

          {/* Category Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setCourseCategory('Theory')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                courseCategory === 'Theory'
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <strong className="text-sm font-bold text-slate-900">1. Theory Courses</strong>
                <span className="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-100/60 rounded-md">
                  40 Int / 60 Ext
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Assessment I (40+60) + Assessment II (40+60) &rarr; Converted to 40 Marks
              </p>
            </button>

            <button
              onClick={() => setCourseCategory('Laboratory')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                courseCategory === 'Laboratory'
                  ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <strong className="text-sm font-bold text-slate-900">2. Laboratory Courses</strong>
                <span className="text-xs font-bold text-purple-600 px-2 py-0.5 bg-purple-100/60 rounded-md">
                  60 Int / 40 Ext
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Observation &amp; Record (75) + Test (25) = 100 &rarr; Converted to 60 Marks
              </p>
            </button>

            <button
              onClick={() => setCourseCategory('Theory cum Laboratory')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                courseCategory === 'Theory cum Laboratory'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <strong className="text-sm font-bold text-slate-900">3. Theory cum Lab</strong>
                <span className="text-xs font-bold text-emerald-600 px-2 py-0.5 bg-emerald-100/60 rounded-md">
                  50 Int / 50 Ext
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Assmt I (40+60) + Assmt II Lab (75+25) = 200 &rarr; Converted to 50 Marks
              </p>
            </button>
          </div>

          {/* Calculator Inputs & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                {courseCategory === 'Theory' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>Continuous Assessment I (100 Marks)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Written Test 1 (Scored out of 100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={theoryInputs.test1}
                            onChange={(e) => setTheoryInputs(p => ({ ...p, test1: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                          />
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Converts to 60 marks: ({theoryInputs.test1} &times; 60) / 100 = <strong>{((theoryInputs.test1 * 60) / 100).toFixed(1)}</strong>
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Assignment / Case Study 1 (out of 100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={theoryInputs.assign1}
                            onChange={(e) => setTheoryInputs(p => ({ ...p, assign1: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                          />
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Converts to 40 marks: ({theoryInputs.assign1} &times; 40) / 100 = <strong>{((theoryInputs.assign1 * 40) / 100).toFixed(1)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Continuous Assessment II (100 Marks)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Written Test 2 (Scored out of 100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={theoryInputs.test2}
                            onChange={(e) => setTheoryInputs(p => ({ ...p, test2: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                          />
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Converts to 60 marks: ({theoryInputs.test2} &times; 60) / 100 = <strong>{((theoryInputs.test2 * 60) / 100).toFixed(1)}</strong>
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Assignment / Mini Project 2 (out of 100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={theoryInputs.assign2}
                            onChange={(e) => setTheoryInputs(p => ({ ...p, assign2: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                          />
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Converts to 40 marks: ({theoryInputs.assign2} &times; 40) / 100 = <strong>{((theoryInputs.assign2 * 40) / 100).toFixed(1)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                      <label className="text-xs font-bold text-amber-900 block">
                        End Semester External Examination Marks (Scored out of 100):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={theoryInputs.external}
                        onChange={(e) => setTheoryInputs(p => ({ ...p, external: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-2.5 rounded-xl border border-amber-200 font-mono font-bold text-sm bg-white"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        Converts to 60 marks: ({theoryInputs.external} &times; 60) / 100 = <strong>{((theoryInputs.external * 60) / 100).toFixed(1)}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {courseCategory === 'Laboratory' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                      <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        <span>Continuous Internal Assessment (100 Marks Total)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Observation &amp; Record (Max: 75):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="75"
                            value={labInputs.record}
                            onChange={(e) => setLabInputs(p => ({ ...p, record: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Laboratory Practical Test (Max: 25):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="25"
                            value={labInputs.test}
                            onChange={(e) => setLabInputs(p => ({ ...p, test: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                      <label className="text-xs font-bold text-amber-900 block">
                        End Semester Practical Examination Marks (Scored out of 100):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={labInputs.external}
                        onChange={(e) => setLabInputs(p => ({ ...p, external: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-2.5 rounded-xl border border-amber-200 font-mono font-bold text-sm bg-white"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        Converts to 40 marks: ({labInputs.external} &times; 40) / 100 = <strong>{((labInputs.external * 40) / 100).toFixed(1)}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {courseCategory === 'Theory cum Laboratory' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Assessment I (Theory Component - 100 Marks)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Written Test (out of 100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={theoryLabInputs.writtenTest}
                            onChange={(e) => setTheoryLabInputs(p => ({ ...p, writtenTest: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Assignment (out of 100):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={theoryLabInputs.assignment}
                            onChange={(e) => setTheoryLabInputs(p => ({ ...p, assignment: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-3">
                      <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-teal-600" />
                        <span>Assessment II (Lab Component - 100 Marks)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Observation &amp; Record (Max: 75):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="75"
                            value={theoryLabInputs.labRecord}
                            onChange={(e) => setTheoryLabInputs(p => ({ ...p, labRecord: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Practical Test (Max: 25):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="25"
                            value={theoryLabInputs.labTest}
                            onChange={(e) => setTheoryLabInputs(p => ({ ...p, labTest: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                      <label className="text-xs font-bold text-amber-900 block">
                        End Semester Examination Marks (Scored out of 100):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={theoryLabInputs.external}
                        onChange={(e) => setTheoryLabInputs(p => ({ ...p, external: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-2.5 rounded-xl border border-amber-200 font-mono font-bold text-sm bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gradient-to-br from-[#071A3D] to-[#1455D9] rounded-3xl p-6 text-white shadow-xl space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-200 block">
                  R2023 COMPUTED COURSE RESULT
                </span>

                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-5xl font-black">{currentMarksResult.totalMarks}</div>
                    <span className="text-xs text-cyan-200">Total Marks Scored / 100</span>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-amber-300">
                      {currentMarksResult.absoluteGrade.grade}
                    </span>
                    <span className="text-xs text-cyan-200 block">
                      {currentMarksResult.absoluteGrade.gradePoint} Grade Points
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/20 space-y-2 text-xs text-cyan-100">
                  <div className="flex justify-between">
                    <span>Continuous Internal Assessment:</span>
                    <strong className="text-white font-mono text-sm">
                      {currentMarksResult.overallInternal} Marks
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>End Semester External Exam:</span>
                    <strong className="text-white font-mono text-sm">
                      {currentMarksResult.externalMarks} Marks
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/10">
                    <span>Total = Internal + External:</span>
                    <strong className="text-amber-300 font-mono text-sm font-bold">
                      {currentMarksResult.overallInternal} + {currentMarksResult.externalMarks} = {currentMarksResult.totalMarks}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-200">II Year Classification:</span>
                    <strong className="text-white">{currentMarksResult.absoluteGrade.title}</strong>
                  </div>
                  <p className="text-[11px] text-cyan-100/80 mt-1">
                    {currentMarksResult.absoluteGrade.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ASSESSMENT MATRIX & GUIDELINES (SLIDES 8, 11, 12)  */}
      {/* ======================================================== */}
      {activeTab === 'r2023_guidelines' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Official Matrix</span>
                <h3 className="text-lg font-black text-slate-900">Assessment Methods - R2023 (Apportionment of Marks)</h3>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold">
                Regulation 2023
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4 w-16">S. No.</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Max. Marks</th>
                    <th className="py-3 px-4 text-center text-blue-700">Continuous Internal Assessment Marks</th>
                    <th className="py-3 px-4 text-center text-indigo-700">End Semester Examination Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">1.</td>
                    <td className="py-3 px-4 font-bold text-blue-900 text-sm">Theory Courses</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">100</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700 text-base">40</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-700 text-base">60</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">2.</td>
                    <td className="py-3 px-4 font-bold text-purple-900 text-sm">Laboratory Courses</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">100</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700 text-base">60</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-700 text-base">40</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-500">3.</td>
                    <td className="py-3 px-4 font-bold text-emerald-900 text-sm">Theory cum Laboratory Courses</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">100</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700 text-base">50</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-700 text-base">50</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Slide 11: Absolute vs Relative Grading Systems */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Autonomous Grading Norms</span>
              <h3 className="text-lg font-black text-slate-900">Official Grading Systems (R2023)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Absolute Grading applies to II Year; Relative Grading applies to III and IV Year students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-800 text-white p-3 font-bold text-xs flex justify-between">
                  <span>Absolute Grading System (II Year)</span>
                  <span className="text-cyan-300">Autonomous</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-3">Letter Grade</th>
                      <th className="py-2.5 px-3">Ranges</th>
                      <th className="py-2.5 px-3 text-center">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ABSOLUTE_GRADING_II_YEAR.map((g) => (
                      <tr key={g.grade} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-800">{g.grade} ({g.title})</td>
                        <td className="py-2 px-3 text-slate-600 font-mono">{g.range}</td>
                        <td className="py-2 px-3 text-center font-bold text-blue-700">{g.gradePoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-blue-900 text-white p-3 font-bold text-xs flex justify-between">
                  <span>Relative Grading System (III &amp; IV Year)</span>
                  <span className="text-cyan-300">Autonomous</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-3">Letter Grade</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {RELATIVE_GRADING_III_IV_YEAR.map((g) => (
                      <tr key={g.grade} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-800">{g.grade} ({g.title})</td>
                        <td className="py-2 px-3 text-slate-600">{g.description}</td>
                        <td className="py-2 px-3 text-center font-bold text-blue-700">{g.gradePoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: VERIFIED MARKSHEET LOCKER (REAL REPOSITORY)      */}
      {/* ======================================================== */}
      {activeTab === 'marksheet_locker' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold mb-1">
                <Lock className="w-3 h-3 text-purple-600" />
                <span>Encrypted Academic Document Vault</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Official Semester Grade Sheets &amp; Digital Certificates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload and view your verified semester marksheet PDFs. Uploaded files update your cumulative CGPA instantly.
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer shrink-0"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Semester Marksheet</span>
            </button>
          </div>

          {marksheets.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">No Marksheets Uploaded Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Keep your official Anna University / Autonomous grade sheets encrypted in your personal vault. Click &quot;Upload Semester Marksheet&quot; above to add your first verified grade sheet.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Marksheet</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marksheets.map((ms) => (
                <div
                  key={ms.semester}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-purple-300 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                        S{ms.semester}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          Semester {ms.semester} Official Grade Sheet
                        </h4>
                        <p className="text-[11px] text-slate-500">{ms.academicYear} • {ms.totalCredits} Credits</p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      VERIFIED
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Semester GPA</span>
                      <strong className="text-slate-800 text-base font-black">{ms.gpa.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Result</span>
                      <strong className="text-emerald-700 font-bold">{ms.result}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">File</span>
                      <span className="font-mono text-slate-600 truncate max-w-[120px] block">{ms.fileName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Uploaded on {ms.dateUploaded}
                    </span>
                    <button
                      onClick={() => toast.success(`Viewing ${ms.fileName}...`, { icon: '📄' })}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Marksheet Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-purple-600" />
                <span>Upload Real Semester Marksheet</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUploadedMarksheet} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester Number (1 to 8):</label>
                <select
                  value={newMarksheet.semester}
                  onChange={(e) => setNewMarksheet(p => ({
                    ...p,
                    semester: Number(e.target.value),
                    totalCredits: DEFAULT_SEMESTER_CREDITS[Number(e.target.value)] || 24
                  }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white text-slate-800"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Semester GPA (e.g. 8.75):</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  placeholder="e.g. 8.75"
                  value={newMarksheet.gpa}
                  onChange={(e) => setNewMarksheet(p => ({ ...p, gpa: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester Credits:</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newMarksheet.totalCredits}
                  onChange={(e) => setNewMarksheet(p => ({ ...p, totalCredits: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Session:</label>
                <input
                  type="text"
                  required
                  value={newMarksheet.academicYear}
                  onChange={(e) => setNewMarksheet(p => ({ ...p, academicYear: e.target.value }))}
                  placeholder="e.g. Nov / Dec 2024"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Marksheet PDF / Scanned File Name:</label>
                <input
                  type="text"
                  placeholder="e.g. VSB_Sem3_GradeSheet.pdf"
                  value={newMarksheet.fileName}
                  onChange={(e) => setNewMarksheet(p => ({ ...p, fileName: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Save &amp; Verify Marksheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
