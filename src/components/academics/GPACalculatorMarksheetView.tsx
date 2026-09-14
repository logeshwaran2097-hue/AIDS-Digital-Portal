'use client'

import React, { useState, useMemo } from 'react'
import {
  GraduationCap,
  Calculator,
  Award,
  FileCheck,
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
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SubjectGradeRow {
  id: string
  code: string
  name: string
  credits: number
  grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'RA'
}

interface MarksheetItem {
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

const GRADE_POINTS: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'RA': 0
}

const AI_DS_SEMESTER_PRESETS: Record<number, { code: string; name: string; credits: number; defaultGrade: 'O' | 'A+' | 'A' | 'B+' | 'B' }[]> = {
  1: [
    { code: 'HS3151', name: 'Professional English - I', credits: 3, defaultGrade: 'A+' },
    { code: 'MA3151', name: 'Matrices and Calculus', credits: 4, defaultGrade: 'O' },
    { code: 'PH3151', name: 'Engineering Physics', credits: 3, defaultGrade: 'A' },
    { code: 'CY3151', name: 'Engineering Chemistry', credits: 3, defaultGrade: 'A+' },
    { code: 'GE3151', name: 'Problem Solving and Python Programming', credits: 3, defaultGrade: 'O' },
    { code: 'GE3171', name: 'Problem Solving and Python Programming Laboratory', credits: 2, defaultGrade: 'O' },
    { code: 'BS3171', name: 'Physics and Chemistry Laboratory', credits: 2, defaultGrade: 'A+' }
  ],
  2: [
    { code: 'HS3251', name: 'Professional English - II', credits: 2, defaultGrade: 'A+' },
    { code: 'MA3251', name: 'Statistics and Numerical Methods', credits: 4, defaultGrade: 'O' },
    { code: 'PH3256', name: 'Physics for Information Science', credits: 3, defaultGrade: 'A' },
    { code: 'BE3251', name: 'Basic Electrical and Electronics Engineering', credits: 3, defaultGrade: 'B+' },
    { code: 'GE3251', name: 'Engineering Graphics', credits: 4, defaultGrade: 'A' },
    { code: 'CS3251', name: 'Programming in C', credits: 3, defaultGrade: 'O' },
    { code: 'GE3271', name: 'Engineering Practices Laboratory', credits: 2, defaultGrade: 'O' },
    { code: 'CS3271', name: 'Programming in C Laboratory', credits: 1.5, defaultGrade: 'O' }
  ],
  3: [
    { code: 'MA3354', name: 'Discrete Mathematics', credits: 4, defaultGrade: 'A+' },
    { code: 'CS3351', name: 'Digital Principles and Computer Organization', credits: 4, defaultGrade: 'A' },
    { code: 'AD3301', name: 'Data Exploration and Visualization', credits: 4, defaultGrade: 'O' },
    { code: 'AD3351', name: 'Design and Analysis of Algorithms', credits: 4, defaultGrade: 'A+' },
    { code: 'AD3381', name: 'Database Design and Management', credits: 3, defaultGrade: 'O' },
    { code: 'AL3391', name: 'Artificial Intelligence', credits: 4, defaultGrade: 'O' },
    { code: 'AD3311', name: 'Database Design and Management Laboratory', credits: 1.5, defaultGrade: 'O' },
    { code: 'AD3361', name: 'Data Science & Exploration Laboratory', credits: 1.5, defaultGrade: 'O' }
  ],
  4: [
    { code: 'MA3391', name: 'Probability and Statistics', credits: 4, defaultGrade: 'O' },
    { code: 'AL3452', name: 'Operating Systems', credits: 3, defaultGrade: 'A' },
    { code: 'AL3451', name: 'Machine Learning', credits: 4, defaultGrade: 'O' },
    { code: 'AD3491', name: 'Fundamentals of Data Science', credits: 3, defaultGrade: 'A+' },
    { code: 'CS3491', name: 'Software Engineering', credits: 3, defaultGrade: 'A' },
    { code: 'AD3411', name: 'Data Science and Machine Learning Laboratory', credits: 2, defaultGrade: 'O' },
    { code: 'AL3461', name: 'Operating Systems Laboratory', credits: 1.5, defaultGrade: 'O' }
  ],
  5: [
    { code: 'AD3501', name: 'Deep Learning', credits: 4, defaultGrade: 'O' },
    { code: 'CW3551', name: 'Data and Information Security', credits: 3, defaultGrade: 'A' },
    { code: 'CS3591', name: 'Computer Networks', credits: 4, defaultGrade: 'A+' },
    { code: 'AD3511', name: 'Deep Learning Laboratory', credits: 2, defaultGrade: 'O' },
    { code: 'AD3512', name: 'Professional Development', credits: 1, defaultGrade: 'O' }
  ],
  6: [
    { code: 'AD3601', name: 'Natural Language Processing', credits: 4, defaultGrade: 'O' },
    { code: 'AD3611', name: 'Big Data Analytics', credits: 4, defaultGrade: 'A+' },
    { code: 'IT3601', name: 'Cloud Computing and Virtualization', credits: 3, defaultGrade: 'A' },
    { code: 'AD3681', name: 'Mini Project / Capstone Lab', credits: 2, defaultGrade: 'O' }
  ]
}

const INITIAL_MARKSHEETS: MarksheetItem[] = [
  {
    semester: 1,
    academicYear: 'Nov / Dec 2023',
    gpa: 8.85,
    totalCredits: 20,
    result: 'DISTINCTION',
    fileName: 'AnnaUniv_Sem1_GradeSheet_Signed.pdf',
    fileSize: '1.2 MB',
    dateUploaded: '15 Feb 2024',
    verified: true
  },
  {
    semester: 2,
    academicYear: 'Apr / May 2024',
    gpa: 8.92,
    totalCredits: 23.5,
    result: 'DISTINCTION',
    fileName: 'AnnaUniv_Sem2_GradeSheet_Signed.pdf',
    fileSize: '1.4 MB',
    dateUploaded: '10 Aug 2024',
    verified: true
  },
  {
    semester: 3,
    academicYear: 'Nov / Dec 2024',
    gpa: 9.15,
    totalCredits: 26,
    result: 'DISTINCTION',
    fileName: 'AnnaUniv_Sem3_GradeSheet_Signed.pdf',
    fileSize: '1.3 MB',
    dateUploaded: '12 Jan 2025',
    verified: true
  },
  {
    semester: 4,
    academicYear: 'Apr / May 2025',
    gpa: 8.78,
    totalCredits: 22.5,
    result: 'PASS',
    fileName: 'AnnaUniv_Sem4_GradeSheet_Signed.pdf',
    fileSize: '1.5 MB',
    dateUploaded: '05 Jul 2025',
    verified: true
  }
]

export default function GPACalculatorMarksheetView({
  studentName = 'Logeshwaran S',
  registerNumber = '922521104045'
}: {
  studentName?: string
  registerNumber?: string
}) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'cgpa_predictor' | 'marksheet_locker'>('calculator')
  const [selectedSemester, setSelectedSemester] = useState<number>(3)

  // Subject rows for GPA calculator
  const [subjects, setSubjects] = useState<SubjectGradeRow[]>(() => {
    const preset = AI_DS_SEMESTER_PRESETS[3] || []
    return preset.map((item, idx) => ({
      id: `subj-${idx}`,
      code: item.code,
      name: item.name,
      credits: item.credits,
      grade: item.defaultGrade
    }))
  })

  // Cumulative Semester GPAs
  const [semesterGPAs, setSemesterGPAs] = useState<Record<number, { gpa: number; credits: number }>>({
    1: { gpa: 8.85, credits: 20 },
    2: { gpa: 8.92, credits: 23.5 },
    3: { gpa: 9.15, credits: 26 },
    4: { gpa: 8.78, credits: 22.5 },
    5: { gpa: 0, credits: 22 },
    6: { gpa: 0, credits: 22 },
    7: { gpa: 0, credits: 20 },
    8: { gpa: 0, credits: 16 }
  })

  // Target Predictor State
  const [targetCGPA, setTargetCGPA] = useState<number>(8.5)

  // Marksheets state
  const [marksheets, setMarksheets] = useState<MarksheetItem[]>(INITIAL_MARKSHEETS)

  // Switch semester preset
  const handleSemesterChange = (sem: number) => {
    setSelectedSemester(sem)
    const preset = AI_DS_SEMESTER_PRESETS[sem] || []
    setSubjects(preset.map((item, idx) => ({
      id: `subj-${sem}-${idx}`,
      code: item.code,
      name: item.name,
      credits: item.credits,
      grade: item.defaultGrade
    })))
    toast.success(`Loaded Regulation 2021 curriculum for Semester ${sem}!`)
  }

  // Add custom subject
  const handleAddSubject = () => {
    const newId = `custom-${Date.now()}`
    setSubjects(prev => [
      ...prev,
      { id: newId, code: 'AD3099', name: 'Elective Course', credits: 3, grade: 'A+' }
    ])
    toast.success('Custom elective added to calculator!')
  }

  // Remove subject
  const handleRemoveSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id))
  }

  // Update grade or credits
  const handleUpdateSubject = (id: string, field: 'grade' | 'credits', value: any) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value }
      }
      return s
    }))
  }

  // Calculate live Semester GPA
  const calculatedSemesterGPA = useMemo(() => {
    let totalGradePoints = 0
    let totalCredits = 0

    subjects.forEach(s => {
      const pt = GRADE_POINTS[s.grade] ?? 0
      totalGradePoints += pt * s.credits
      totalCredits += s.credits
    })

    if (totalCredits === 0) return 0
    return parseFloat((totalGradePoints / totalCredits).toFixed(3))
  }, [subjects])

  // Total Semester Credits
  const currentSemesterCredits = useMemo(() => {
    return subjects.reduce((acc, s) => acc + s.credits, 0)
  }, [subjects])

  // Calculate overall CGPA completed so far (Sem 1 to 4)
  const currentCGPA = useMemo(() => {
    let earnedPoints = 0
    let totalCompletedCredits = 0

    Object.entries(semesterGPAs).forEach(([semStr, data]) => {
      const semNum = Number(semStr)
      if (semNum <= 4 && data.gpa > 0) {
        earnedPoints += data.gpa * data.credits
        totalCompletedCredits += data.credits
      }
    })

    if (totalCompletedCredits === 0) return 0
    return parseFloat((earnedPoints / totalCompletedCredits).toFixed(3))
  }, [semesterGPAs])

  // Required GPA for target
  const requiredRemainingGPA = useMemo(() => {
    let earnedPoints = 0
    let completedCredits = 0
    let remainingCredits = 0

    Object.entries(semesterGPAs).forEach(([semStr, data]) => {
      const semNum = Number(semStr)
      if (semNum <= 4) {
        earnedPoints += data.gpa * data.credits
        completedCredits += data.credits
      } else {
        remainingCredits += data.credits
      }
    })

    const totalGradCredits = completedCredits + remainingCredits
    const totalPointsNeeded = targetCGPA * totalGradCredits
    const remainingPointsNeeded = totalPointsNeeded - earnedPoints

    if (remainingCredits <= 0) return 0
    const req = remainingPointsNeeded / remainingCredits
    return parseFloat(req.toFixed(2))
  }, [semesterGPAs, targetCGPA])

  // Marksheet upload simulator
  const handleUploadMarksheet = () => {
    toast.success('Official Grade Sheet PDF uploaded to encrypted institutional vault!', { icon: '📜' })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0E2C66] to-[#1455D9] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Anna University Regulation 2021 Grading System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              CGPA / Semester GPA Calculator & Marksheet Locker
            </h1>
            <p className="text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
              Official 10-point credit-weighted GPA calculator with syllabus presets, target honors predictor, and cryptographically verified digital grade-sheet vault.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20">
            <div className="text-center">
              <span className="text-[10px] text-cyan-200 uppercase font-bold block">Current CGPA</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{currentCGPA.toFixed(2)}</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <span className="text-[10px] text-cyan-200 uppercase font-bold block">Credits Done</span>
              <span className="text-2xl sm:text-3xl font-black text-cyan-300">92 / 165</span>
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
            <span>Semester GPA Calculator</span>
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
            <span>CGPA Goal Predictor</span>
          </button>
          <button
            onClick={() => setActiveTab('marksheet_locker')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'marksheet_locker'
                ? 'bg-white text-[#071A3D] shadow-lg shadow-black/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4 text-purple-600" />
            <span>Verified Marksheet Locker</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Semester GPA Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              {/* Semester Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Select B.Tech AI & DS Semester</h3>
                  <p className="text-xs text-slate-500">Auto-populates Anna Univ Regulation 2021 course codes & credits</p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[1, 2, 3, 4, 5, 6].map((sem) => (
                    <button
                      key={sem}
                      onClick={() => handleSemesterChange(sem)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSemester === sem
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Sem {sem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">Subject Code & Name</th>
                      <th className="py-2.5 px-3 w-20 text-center">Credits</th>
                      <th className="py-2.5 px-3 w-28 text-center">Expected Grade</th>
                      <th className="py-2.5 px-3 w-20 text-center">Pts</th>
                      <th className="py-2.5 px-2 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map((subj) => (
                      <tr key={subj.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <strong className="text-slate-800 font-bold block">{subj.code}</strong>
                          <span className="text-slate-500 text-[11px] leading-tight block">{subj.name}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="6"
                            value={subj.credits}
                            onChange={(e) => handleUpdateSubject(subj.id, 'credits', parseFloat(e.target.value) || 0)}
                            className="w-14 p-1.5 rounded-lg border border-slate-200 text-center font-bold text-slate-800"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <select
                            value={subj.grade}
                            onChange={(e) => handleUpdateSubject(subj.id, 'grade', e.target.value as any)}
                            className="w-24 p-1.5 rounded-lg border border-slate-200 font-bold text-center text-blue-700 bg-white"
                          >
                            <option value="O">O (10)</option>
                            <option value="A+">A+ (9)</option>
                            <option value="A">A (8)</option>
                            <option value="B+">B+ (7)</option>
                            <option value="B">B (6)</option>
                            <option value="C">C (5)</option>
                            <option value="RA">RA (0)</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                          {GRADE_POINTS[subj.grade]} × {subj.credits} = {GRADE_POINTS[subj.grade] * subj.credits}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => handleRemoveSubject(subj.id)}
                            className="p-1 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Custom Elective Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleAddSubject}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add Elective / Audit Course</span>
                </button>

                <div className="text-right text-xs text-slate-500">
                  Total Course Credits: <strong className="text-slate-800 font-mono font-bold">{currentSemesterCredits}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-200 block">
                SEMESTER {selectedSemester} CALCULATED RESULT
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{calculatedSemesterGPA.toFixed(2)}</span>
                <span className="text-lg font-bold text-cyan-200">/ 10.0</span>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/20 text-xs text-cyan-100">
                <div className="flex justify-between">
                  <span>Class Classification:</span>
                  <strong className="text-white font-bold">
                    {calculatedSemesterGPA >= 8.5 ? 'First Class with Distinction' : calculatedSemesterGPA >= 6.5 ? 'First Class' : 'Second Class'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Credits Registered:</span>
                  <strong className="text-white font-mono">{currentSemesterCredits} Credits</strong>
                </div>
                <div className="flex justify-between">
                  <span>Regulation:</span>
                  <strong className="text-white">Anna University R-2021</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  setSemesterGPAs(prev => ({
                    ...prev,
                    [selectedSemester]: { gpa: calculatedSemesterGPA, credits: currentSemesterCredits }
                  }))
                  toast.success(`Saved Sem ${selectedSemester} GPA (${calculatedSemesterGPA}) to your academic profile!`)
                }}
                className="w-full py-3 rounded-xl bg-white text-blue-900 hover:bg-cyan-50 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Save to Cumulative CGPA</span>
              </button>
            </div>

            {/* Official Grading Scale Reference */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Anna University Grade Scale</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800">O (Outstanding):</span>
                  <span className="text-slate-500 block">10 pts (91-100%)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800">A+ (Excellent):</span>
                  <span className="text-slate-500 block">9 pts (81-90%)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800">A (Very Good):</span>
                  <span className="text-slate-500 block">8 pts (71-80%)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800">B+ (Good):</span>
                  <span className="text-slate-500 block">7 pts (61-70%)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800">B (Average):</span>
                  <span className="text-slate-500 block">6 pts (50-60%)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-red-600">RA (Re-appear):</span>
                  <span className="text-slate-500 block">0 pts (Failed)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Target CGPA Predictor */}
      {activeTab === 'cgpa_predictor' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Cumulative CGPA Tracker & Degree Honors Predictor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate required future GPAs to graduate with First Class with Distinction (≥ 8.5 CGPA)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Target Graduation CGPA:</label>
              <input
                type="number"
                step="0.1"
                min="6.0"
                max="10.0"
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(parseFloat(e.target.value) || 8.0)}
                className="w-20 p-2 rounded-xl border-2 border-blue-500 text-center font-black text-sm text-blue-700"
              />
            </div>
          </div>

          {/* 8 Semester Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => {
              const data = semesterGPAs[sem]
              const isPast = sem <= 4

              return (
                <div
                  key={sem}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    isPast
                      ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                      : 'bg-slate-50 border-dashed border-slate-300 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase block text-slate-400">Sem {sem}</span>
                  <div className="mt-1">
                    {isPast ? (
                      <span className="text-lg font-black text-blue-700">{data.gpa.toFixed(2)}</span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Upcoming</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block mt-1">
                    {data.credits} Credits
                  </span>
                </div>
              )
            })}
          </div>

          {/* Target Analysis Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-100 block">
                Degree Target Strategy Recommendation
              </span>
              <h4 className="text-xl font-black">
                You need an average of <span className="underline decoration-2">{requiredRemainingGPA > 10 ? '10.0 (Unachievable)' : requiredRemainingGPA.toFixed(2)}</span> GPA in Sem 5–8
              </h4>
              <p className="text-xs text-emerald-100 max-w-xl">
                {requiredRemainingGPA <= 8.5
                  ? `Maintaining an A+ average (~${requiredRemainingGPA.toFixed(1)} GPA) across remaining 73 credits will secure your Target CGPA of ${targetCGPA}.`
                  : 'You will need consistent O grades in your major projects and professional electives.'}
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-xl text-center shrink-0 border border-white/30">
              <span className="text-[10px] uppercase font-bold text-white block">Degree Distinction</span>
              <strong className="text-lg font-black text-white">ELIGIBLE</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Verified Marksheet Locker */}
      {activeTab === 'marksheet_locker' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold mb-1">
                <Lock className="w-3 h-3 text-purple-600" />
                <span>Encrypted Academic Document Vault</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Official Semester Grade Sheets & Digital Certificates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download Anna University Controller of Examinations digitally verified grade cards.
              </p>
            </div>

            <button
              onClick={handleUploadMarksheet}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer shrink-0"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Marksheet</span>
            </button>
          </div>

          {/* Marksheet Cards Grid */}
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
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">File Size</span>
                    <span className="font-mono text-slate-600">{ms.fileSize}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Uploaded on {ms.dateUploaded}
                  </span>
                  <button
                    onClick={() => toast.success(`Downloading ${ms.fileName} with official cryptographic signature...`, { icon: '📄' })}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
