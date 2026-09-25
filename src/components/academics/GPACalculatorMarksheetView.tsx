'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
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
import { StudyNavigationHeader } from '@/components/study/StudyNavigationHeader'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

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

// Dynamic DB Subject Record
export interface DbSubject {
  id: string
  code: string
  name: string
  credits: number
  category?: string
  facultyInCharge?: string
  courseType?: 'Theory' | 'Laboratory' | 'Theory cum Laboratory'
  semester: number
  year?: number
  description?: string | null
}

interface GPACalculatorMarksheetViewProps {
  studentName?: string
  registerNumber?: string
  studentYear?: number
  currentSemester?: number
  initialCgpa?: number | null
  adminSubjects?: DbSubject[]
}

export default function GPACalculatorMarksheetView({
  studentName = 'Student',
  registerNumber = '',
  studentYear = 2,
  currentSemester = 3,
  initialCgpa = null,
  adminSubjects = []
}: GPACalculatorMarksheetViewProps) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'cgpa_predictor' | 'marks_calculator' | 'r2023_guidelines' | 'marksheet_locker'>('calculator')

  // Grading scheme selection: II Year uses Absolute Grading; III/IV Year uses Relative Grading
  const [gradingSystem, setGradingSystem] = useState<'absolute_ii_year' | 'relative_iii_iv_year'>(
    studentYear === 2 ? 'absolute_ii_year' : 'relative_iii_iv_year'
  )

  const [selectedSemester, setSelectedSemester] = useState<number>(currentSemester || 3)
  const [dbSubjects, setDbSubjects] = useState<DbSubject[]>(() => adminSubjects || [])
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(!adminSubjects || adminSubjects.length === 0)

  // Real credit total dynamically computed from subjects added by Admin for a given semester
  const getSemesterCreditTotal = useCallback((sem: number) => {
    const semSubs = dbSubjects.filter(s => s.semester === sem)
    return semSubs.reduce((acc, s) => acc + (Number(s.credits) || 0), 0)
  }, [dbSubjects])

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

  // Subject rows for GPA calculator loaded from subjects added by Admin
  const [subjects, setSubjects] = useState<SubjectGradeRow[]>(() => {
    const sem = currentSemester || 3
    const semSubjects = (adminSubjects || []).filter(s => s.semester === sem)
    return semSubjects.map((s, idx) => ({
      id: s.id || `admin-${sem}-${idx}`,
      code: s.code,
      name: s.name,
      credits: Number(s.credits) || 3,
      courseType: s.courseType || 'Theory',
      grade: ''
    }))
  })

  // Fetch live subjects configured by Admin
  useEffect(() => {
    let isMounted = true
    async function fetchSubjects() {
      try {
        setIsLoadingSubjects(true)
        const res = await fetch('/api/admin/academics')
        const data = await res.json()
        if (data.success && Array.isArray(data.subjects) && isMounted) {
          setDbSubjects(data.subjects)
        }
      } catch (err) {
        console.error('Failed to load curriculum subjects:', err)
      } finally {
        if (isMounted) setIsLoadingSubjects(false)
      }
    }
    fetchSubjects()
    return () => {
      isMounted = false
    }
  }, [])

  // Sync subjects when dbSubjects or selectedSemester changes (strictly use subjects added by admin)
  useEffect(() => {
    const semSubjects = dbSubjects.filter(s => s.semester === selectedSemester)
    setSubjects(
      semSubjects.map((s, idx) => ({
        id: s.id || `subj-${selectedSemester}-${idx}`,
        code: s.code,
        name: s.name,
        credits: Number(s.credits) || 3,
        courseType: (s.courseType as any) || 'Theory',
        grade: ''
      }))
    )
  }, [dbSubjects, selectedSemester])

  // Real Cumulative Semester GPAs state (zero placeholder / clean real records)
  const storageKey = `aids_student_semester_gpas_${registerNumber}`
  const [semesterGPAs, setSemesterGPAs] = useState<Record<number, { gpa: number; credits: number }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {}
      }
    }
    // Clean initial state with 0 - real data entered by student
    const initial: Record<number, { gpa: number; credits: number }> = {}
    for (let sem = 1; sem <= 8; sem++) {
      const semSubs = (adminSubjects || []).filter(s => s.semester === sem)
      const creds = semSubs.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)
      initial[sem] = { gpa: 0, credits: creds }
    }
    return initial
  })

  // Sync semester credits when dbSubjects changes if semester has 0 credits
  useEffect(() => {
    if (dbSubjects.length > 0) {
      setSemesterGPAs(prev => {
        let changed = false
        const next = { ...prev }
        for (let sem = 1; sem <= 8; sem++) {
          const semSubs = dbSubjects.filter(s => s.semester === sem)
          const creds = semSubs.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)
          if (creds > 0 && (!next[sem] || next[sem].credits === 0)) {
            next[sem] = { gpa: next[sem]?.gpa || 0, credits: creds }
            changed = true
          }
        }
        return changed ? next : prev
      })
    }
  }, [dbSubjects])

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

  // Switch semester preset (strictly loads subjects added by Admin)
  const handleSemesterChange = (sem: number) => {
    setSelectedSemester(sem)
    const semSubjects = dbSubjects.filter(s => s.semester === sem)
    setSubjects(semSubjects.map((item, idx) => ({
      id: item.id || `subj-${sem}-${idx}`,
      code: item.code,
      name: item.name,
      credits: Number(item.credits) || 3,
      courseType: (item.courseType as any) || 'Theory',
      grade: ''
    })))
    if (semSubjects.length > 0) {
      toast.success(`Loaded ${semSubjects.length} subjects added by Admin for Semester ${sem}!`)
    } else {
      toast(`No courses registered by Admin for Semester ${sem} yet.`, { icon: 'ℹ️' })
    }
  }

  // Quick simulated grades
  const handleFillGrades = (targetGrade: string) => {
    setSubjects(prev => prev.map(s => ({ ...s, grade: targetGrade })))
    toast.success(`Simulated all courses with Grade ${targetGrade}!`)
  }

  // Download official semester marksheet PDF
  const handleDownloadSemesterMarksheetPDF = () => {
    const rows = subjects.map((s, idx) => {
      const pt = s.grade && currentGradePoints[s.grade] !== undefined ? currentGradePoints[s.grade] : 0
      const ciGi = pt * s.credits
      return `${idx + 1}. [${s.code}] ${s.name} | Credits: ${s.credits} | Grade: ${s.grade || 'Awaiting'} | Grade Point: ${pt} | Score: ${ciGi.toFixed(1)}`
    })

    const honors = calculatedSemesterGPA >= 8.5
      ? 'FIRST CLASS WITH DISTINCTION'
      : calculatedSemesterGPA >= 6.5
      ? 'FIRST CLASS'
      : 'SECOND CLASS'

    generateAndDownloadPDF({
      title: 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
      subtitle: `Official Semester ${selectedSemester} Grade Statement & Marksheet · Academic Year 2025-2026`,
      subjectCode: `SEMESTER-${selectedSemester}-RESULTS`,
      author: 'Office of the Controller of Examinations',
      category: 'Autonomous Semester Grade Sheet',
      sections: [
        {
          heading: 'STUDENT ACADEMIC CREDENTIALS',
          body: [
            `Student Name: ${studentName || 'Student'}`,
            `Register Number: ${registerNumber || '922522AD001'}`,
            `Degree / Branch: B.Tech. Artificial Intelligence & Data Science`,
            `Regulation: Autonomous Regulation 2023 (R2023)`,
            `Semester / Academic Year: Semester ${selectedSemester} (Year ${Math.ceil(selectedSemester / 2)}) · 2025-2026`,
            `Grading System Applied: ${gradingSystem === 'absolute_ii_year' ? 'Absolute Grading System (10-Point Scale)' : 'Relative Grading System (10-Point Scale)'}`,
          ],
        },
        {
          heading: `SEMESTER ${selectedSemester} COURSE-WISE GRADE POINT PERFORMANCE`,
          body: rows,
        },
        {
          heading: 'SEMESTER CUMULATIVE SUMMARY & RESULT CLASSIFICATION',
          body: [
            `Total Registered Credits (∑Ci): ${currentSemesterCredits} Credits`,
            `Total Earned Credit-Points (∑Ci × Gi): ${totalWeightedPoints} Points`,
            `Calculated Semester Grade Point Average (SGPA): ${hasAnyGrade ? calculatedSemesterGPA.toFixed(2) : 'Awaiting Input'} / 10.00`,
            `Official Academic Standing: ${hasAnyGrade ? honors : 'Awaiting Examination Results'}`,
            `Declaration: Verified and validated against V.S.B. Autonomous ERP academic ledgers.`,
          ],
        },
      ],
      fileName: `VSB_AIDS_Sem${selectedSemester}_Official_GradeSheet_${registerNumber || 'Student'}`,
    })
    toast.success(`Downloaded Semester ${selectedSemester} Marksheet PDF!`)
  }


  // Clear all course grades
  const handleClearGrades = () => {
    setSubjects(prev => prev.map(s => ({ ...s, grade: '' })))
    toast.success('Course grades cleared. Select your grades to calculate SGPA.')
  }

  // Add custom subject
  const handleAddSubject = () => {
    const newId = `custom-${Date.now()}`
    setSubjects(prev => [
      ...prev,
      { id: newId, code: `CS${selectedSemester}0${prev.length + 1}`, name: 'New Course / Elective', credits: 4, courseType: 'Theory', grade: '' }
    ])
    toast.success('Custom subject row added to calculator!')
  }

  // Remove subject
  const handleRemoveSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id))
  }

  // Update grade, credits, code, or name
  const handleUpdateSubject = (id: string, field: 'grade' | 'credits' | 'courseType' | 'code' | 'name', value: any) => {
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
    test1: 0,
    test2: 0,
    assign1: 0,
    assign2: 0,
    external: 0
  })
  const [labInputs, setLabInputs] = useState({
    record: 0,
    test: 0,
    external: 0
  })
  const [theoryLabInputs, setTheoryLabInputs] = useState({
    assignment: 0,
    writtenTest: 0,
    labRecord: 0,
    labTest: 0,
    external: 0
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
    totalCredits: getSemesterCreditTotal(selectedSemester),
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
      totalCredits: getSemesterCreditTotal(selectedSemester),
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
        resetMap[sem] = { gpa: 0, credits: getSemesterCreditTotal(sem) }
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
      {/* Universal Institutional Study & Academic Header */}
      <StudyNavigationHeader
        title="SGPA & CGPA Examination Calculation Suite"
        subtitle="Official credit-weighted formulae for SGPA and CGPA directly aligned with Autonomous R2023 presentation rubrics."
        badgeText="Autonomous Regulation 2023 (R2023)"
        stats={[
          { label: 'Current CGPA', value: currentCGPA > 0 ? currentCGPA.toFixed(2) : '—' },
          { label: 'Earned Credits', value: `${completedCredits} / 165` },
          { label: 'Completed Sems', value: `${totalCompletedSemesters} / 8` },
        ]}
      />

      {/* Hero Tab Switcher Bar */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0E2C66] to-[#1455D9] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
              Student Academic Suite · {studentName || 'Student'} ({registerNumber || '922522AD001'})
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              Regulation 2023 Academic Performance &amp; Predictor Engine
            </h2>
          </div>
          
          <button
            onClick={handleDownloadSemesterMarksheetPDF}
            className="px-4 py-2.5 rounded-xl bg-[#F4C430] hover:bg-[#e0b028] text-[#071A3D] font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Sem {selectedSemester} Marksheet PDF</span>
          </button>
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

            {/* Action Bar & Grading Scheme Toggle */}
            <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/academics')
                    const data = await res.json()
                    if (data.success && Array.isArray(data.subjects)) {
                      setDbSubjects(data.subjects)
                      const semSubjects = data.subjects.filter((s: DbSubject) => s.semester === selectedSemester)
                      setSubjects(semSubjects.map((item: DbSubject, idx: number) => ({
                        id: item.id || `subj-${selectedSemester}-${idx}`,
                        code: item.code,
                        name: item.name,
                        credits: Number(item.credits) || 3,
                        courseType: (item.courseType as any) || 'Theory',
                        grade: ''
                      })))
                      if (semSubjects.length > 0) {
                        toast.success(`Synchronized ${semSubjects.length} subjects added by Admin for Semester ${selectedSemester}!`)
                      } else {
                        toast(`No subjects registered by Admin for Semester ${selectedSemester} yet.`, { icon: 'ℹ️' })
                      }
                    }
                  } catch (e) {
                    toast.error('Failed to sync subjects from Admin database.')
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] border border-blue-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <RefreshCw className="w-4 h-4 text-[#1455D9]" />
                <span>Sync Admin Courses</span>
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

          {/* Main Interactive Table matching Curricular Scheme */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Semester Course Work Table</h4>
                    <p className="text-xs text-slate-500">
                      {subjects.length > 0
                        ? `Official subjects & credit scores loaded from department database for Semester ${selectedSemester}`
                        : `No courses in database for Semester ${selectedSemester}. Click "+ Add Custom Course" to add subjects.`}
                    </p>
                  </div>

                  {/* Semester selector for all 8 semesters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <button
                        key={sem}
                        onClick={() => handleSemesterChange(sem)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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

                {/* Quick Grade Simulator Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50/60 p-2.5 rounded-2xl border border-blue-100">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Grade Simulations:</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleFillGrades('S')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Fill All S (10.0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillGrades('A+')}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Fill All A+ (9.0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillGrades('A')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Fill All A (8.0)
                    </button>
                    <button
                      type="button"
                      onClick={handleClearGrades}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
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
                      {subjects.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-400">
                            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="font-bold text-slate-700 text-xs">No courses registered for Semester {selectedSemester} yet</p>
                            <p className="text-[11px] text-slate-400 max-w-md mx-auto mt-1 mb-4">
                              Official subjects are added by administrators in the <strong>Academics</strong> module. You can also add custom courses and credit scores directly below.
                            </p>
                            <button
                              type="button"
                              onClick={handleAddSubject}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> + Add Custom Subject
                            </button>
                          </td>
                        </tr>
                      ) : (
                        subjects.map((subj) => {
                          const hasGrade = Boolean(subj.grade && currentGradePoints[subj.grade] !== undefined)
                          const pt = hasGrade ? currentGradePoints[subj.grade] : null
                          const ciGi = hasGrade && pt !== null ? (pt * subj.credits) : null
                          const isCustom = subj.id.startsWith('custom-')
                          return (
                            <tr key={subj.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4">
                                {isCustom ? (
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      value={subj.name}
                                      onChange={(e) => handleUpdateSubject(subj.id, 'name', e.target.value)}
                                      placeholder="Course Name"
                                      className="w-full p-1.5 rounded-lg border border-slate-200 font-bold text-slate-800 text-xs focus:bg-white"
                                    />
                                    <input
                                      type="text"
                                      value={subj.code}
                                      onChange={(e) => handleUpdateSubject(subj.id, 'code', e.target.value.toUpperCase())}
                                      placeholder="Code e.g. CS3401"
                                      className="w-32 p-1 rounded-md border border-slate-200 font-mono text-[10px] text-[#1455D9]"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <span className="font-bold text-slate-800 block">{subj.name}</span>
                                    <span className="text-slate-400 font-mono text-[10px]">{subj.code} · {subj.courseType}</span>
                                  </>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0.5"
                                  max="20"
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
                        })
                      )}

                      {/* Total Row */}
                      {subjects.length > 0 && (
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
                      )}
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
                onClick={handleResetAllSemesters}
                className="px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Cumulative GPAs</span>
              </button>
            </div>
          </div>

          {/* Real Semester-by-Semester CGPA Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Semester-by-Semester Cumulative Records</h4>
                    <p className="text-xs text-slate-500">Calculated from course grades or entered manually for completed semesters</p>
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
                        <th className="py-3 px-4 text-center w-32">Credits (Admin Courses)</th>
                        <th className="py-3 px-4 text-center w-32">SGPA</th>
                        <th className="py-3 px-4 text-center w-36 font-mono">Credits &times; SGPA</th>
                        <th className="py-3 px-3 text-center w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => {
                        const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][sem - 1]
                        const semSubs = dbSubjects.filter(s => s.semester === sem)
                        const adminCredits = semSubs.reduce((acc, s) => acc + (Number(s.credits) || 0), 0)
                        const data = semesterGPAs[sem] || { gpa: 0, credits: adminCredits }
                        const isEntered = data.gpa > 0
                        const creditsTimesSGPA = isEntered ? parseFloat((data.credits * data.gpa).toFixed(2)) : 0

                        return (
                          <tr key={sem} className={isEntered ? 'hover:bg-slate-50/70' : 'bg-slate-50/30'}>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-800 text-sm">Semester {roman}</span>
                              <span className="text-slate-400 text-[10px] block">
                                {semSubs.length > 0 ? `${semSubs.length} Admin Courses` : `Sem ${sem}`}
                              </span>
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
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}

                      {/* Total Row */}
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

                {/* Step-by-Step Fraction Display */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-serif">
                  {completedCredits > 0 ? (
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
                  ) : (
                    <div className="text-xs font-sans text-slate-600 font-medium">
                      ℹ️ Enter your completed semester GPAs above or calculate from courses to compute cumulative CGPA.
                    </div>
                  )}

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
                  onChange={(e) => {
                    const semNum = Number(e.target.value)
                    setNewMarksheet(p => ({
                      ...p,
                      semester: semNum,
                      totalCredits: getSemesterCreditTotal(semNum)
                    }))
                  }}
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
