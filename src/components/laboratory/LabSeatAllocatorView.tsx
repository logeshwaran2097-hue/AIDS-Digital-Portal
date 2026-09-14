'use client'

import React, { useState, useMemo } from 'react'
import {
  Monitor,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Printer,
  Download,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Shuffle,
  FileSpreadsheet,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Workstation {
  id: string
  pcNumber: number
  ipAddress: string
  status: 'active' | 'maintenance' | 'reserved'
  allocatedStudent?: {
    name: string
    registerNumber: string
    year: number
    section: string
    paperSet: 'A' | 'B'
  }
}

const LAB_ROOMS = [
  { id: 'CCL-01', name: 'Central Computing Lab 1 (CCL-01)', capacity: 60, incharge: 'Dr. M. Suresh Kumar', location: 'Main Academic Block, 2nd Floor' },
  { id: 'AD-LAB-02', name: 'AI & Data Science Research Lab (AD-02)', capacity: 60, incharge: 'Prof. K. Nithya', location: 'AI & DS Department Block, 1st Floor' },
  { id: 'DAC-03', name: 'Data Analytics & Cloud Lab (DAC-03)', capacity: 50, incharge: 'Prof. R. Vignesh', location: 'IT Park Annex, Ground Floor' }
]

const SUBJECTS = [
  { code: 'AD3311', name: 'Database Design and Management Laboratory', sem: 3 },
  { code: 'CS3361', name: 'Data Science & Exploration Laboratory', sem: 3 },
  { code: 'AD3411', name: 'Artificial Intelligence & Machine Learning Lab', sem: 4 },
  { code: 'AD3511', name: 'Deep Learning & Neural Architectures Laboratory', sem: 5 },
  { code: 'AD3611', name: 'Big Data & Cloud Analytics Laboratory', sem: 6 }
]

// Sample student dataset for allocation
const SAMPLE_STUDENTS = [
  { name: 'Logeshwaran G', registerNumber: '922525243103', year: 2, section: 'B' },
  { name: 'Logeshwaran S', registerNumber: '922521104045', year: 3, section: 'A' },
  { name: 'Abishek M', registerNumber: '922521104001', year: 3, section: 'A' },
  { name: 'Ananya R', registerNumber: '922521104006', year: 3, section: 'A' },
  { name: 'Bharath Kumar K', registerNumber: '922521104012', year: 3, section: 'A' },
  { name: 'Dhivya P', registerNumber: '922521104018', year: 3, section: 'A' },
  { name: 'Gokulnath T', registerNumber: '922521104024', year: 3, section: 'A' },
  { name: 'Harish V', registerNumber: '922521104029', year: 3, section: 'A' },
  { name: 'Janani S', registerNumber: '922521104033', year: 3, section: 'A' },
  { name: 'Karthikeyan N', registerNumber: '922521104038', year: 3, section: 'A' },
  { name: 'Kavya B', registerNumber: '922521104041', year: 3, section: 'A' },
  { name: 'Manikandan R', registerNumber: '922521104048', year: 3, section: 'A' },
  { name: 'Naveen Kumar C', registerNumber: '922521104055', year: 3, section: 'A' },
  { name: 'Pavithra G', registerNumber: '922521104060', year: 3, section: 'A' },
  { name: 'Prasanth S', registerNumber: '922521104066', year: 3, section: 'A' },
  { name: 'Pooja K', registerNumber: '922521104063', year: 3, section: 'A' },
  { name: 'Rahul Dravid M', registerNumber: '922521104071', year: 3, section: 'A' },
  { name: 'Rohit K', registerNumber: '922521104075', year: 3, section: 'A' },
  { name: 'Sanjay V', registerNumber: '922521104082', year: 3, section: 'A' },
  { name: 'Sneha R', registerNumber: '922521104089', year: 3, section: 'A' },
  { name: 'Subramanian E', registerNumber: '922521104094', year: 3, section: 'A' },
  { name: 'Swetha P', registerNumber: '922521104099', year: 3, section: 'A' },
  { name: 'Vigneshwaran K', registerNumber: '922521104106', year: 3, section: 'A' },
  { name: 'Vijay Anand R', registerNumber: '922521104110', year: 3, section: 'A' },
  { name: 'Yogesh M', registerNumber: '922521104118', year: 3, section: 'A' },
  { name: 'Aadhirai K', registerNumber: '922522104002', year: 2, section: 'B' },
  { name: 'Balaji S', registerNumber: '922522104008', year: 2, section: 'B' },
  { name: 'Deepak Raj V', registerNumber: '922522104015', year: 2, section: 'B' },
  { name: 'Dharani M', registerNumber: '922522104021', year: 2, section: 'B' },
  { name: 'Elango P', registerNumber: '922522104028', year: 2, section: 'B' },
  { name: 'Gayathri T', registerNumber: '922522104035', year: 2, section: 'B' },
  { name: 'Hariharan B', registerNumber: '922522104040', year: 2, section: 'B' },
  { name: 'Indhirani R', registerNumber: '922522104046', year: 2, section: 'B' },
  { name: 'Jeevanandham K', registerNumber: '922522104052', year: 2, section: 'B' },
  { name: 'Keerthana S', registerNumber: '922522104058', year: 2, section: 'B' },
  { name: 'Madhan Kumar M', registerNumber: '922522104064', year: 2, section: 'B' },
  { name: 'Nithish V', registerNumber: '922522104070', year: 2, section: 'B' },
  { name: 'Preetha J', registerNumber: '922522104077', year: 2, section: 'B' },
  { name: 'Raghavan T', registerNumber: '922522104083', year: 2, section: 'B' },
  { name: 'Saravanan D', registerNumber: '922522104090', year: 2, section: 'B' },
  { name: 'Thejaswini N', registerNumber: '922522104096', year: 2, section: 'B' }
]

export default function LabSeatAllocatorView({
  isFacultyMode = true,
  currentStudentReg = '922525243103'
}: {
  isFacultyMode?: boolean
  currentStudentReg?: string
}) {
  const [selectedLabId, setSelectedLabId] = useState('CCL-01')
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('AD3311')
  const [examSession, setExamSession] = useState<'FN' | 'AN'>('FN')
  const [examDate, setExamDate] = useState('2026-09-22')
  const [antiMalpracticeStrategy, setAntiMalpracticeStrategy] = useState<'checkerboard' | 'randomized' | 'year_mixed'>('checkerboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAllocated, setIsAllocated] = useState(true)

  // Generate 60 workstations for CCL-01
  const [workstations, setWorkstations] = useState<Workstation[]>(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const pcNumber = i + 1
      const isMaint = pcNumber === 17 || pcNumber === 43
      const student = !isMaint && i < SAMPLE_STUDENTS.length ? {
        ...SAMPLE_STUDENTS[i],
        paperSet: (i % 2 === 0 ? 'A' : 'B') as 'A' | 'B'
      } : undefined

      return {
        id: `PC-${pcNumber.toString().padStart(2, '0')}`,
        pcNumber,
        ipAddress: `192.168.10.${100 + pcNumber}`,
        status: isMaint ? 'maintenance' : 'active',
        allocatedStudent: student
      }
    })
  })

  const currentLab = LAB_ROOMS.find(l => l.id === selectedLabId) || LAB_ROOMS[0]
  const currentSubject = SUBJECTS.find(s => s.code === selectedSubjectCode) || SUBJECTS[0]

  // Run auto allocation algorithm
  const handleAutoAllocate = () => {
    let studentPool = [...SAMPLE_STUDENTS]

    if (antiMalpracticeStrategy === 'randomized') {
      studentPool.sort(() => Math.random() - 0.5)
    } else if (antiMalpracticeStrategy === 'year_mixed') {
      const y3 = studentPool.filter(s => s.year === 3)
      const y2 = studentPool.filter(s => s.year === 2)
      const mixed: typeof SAMPLE_STUDENTS = []
      const maxLen = Math.max(y3.length, y2.length)
      for (let i = 0; i < maxLen; i++) {
        if (y3[i]) mixed.push(y3[i])
        if (y2[i]) mixed.push(y2[i])
      }
      studentPool = mixed
    }

    let studentIdx = 0
    const newStations: Workstation[] = workstations.map((ws, i) => {
      if (ws.status === 'maintenance') {
        return ws
      }
      if (studentIdx < studentPool.length) {
        const student = studentPool[studentIdx++]
        return {
          ...ws,
          allocatedStudent: {
            ...student,
            paperSet: (i % 2 === 0 ? 'A' : 'B') as 'A' | 'B'
          }
        }
      }
      return {
        ...ws,
        allocatedStudent: undefined
      }
    })

    setWorkstations(newStations)
    setIsAllocated(true)
    toast.success('Workstation allocation executed with Anti-Malpractice alternating sets!', { icon: '⚡' })
  }

  const handleClearAllocation = () => {
    setWorkstations(prev => prev.map(ws => ({ ...ws, allocatedStudent: undefined })))
    setIsAllocated(false)
    toast.success('Seating chart cleared!')
  }

  // Student specific assigned workstation
  const studentAssignedWs = useMemo(() => {
    return workstations.find(ws => ws.allocatedStudent?.registerNumber === currentStudentReg)
  }, [workstations, currentStudentReg])

  // Print seating plan
  const handlePrint = () => {
    window.print()
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'PC Number,IP Address,Status,Student Name,Register Number,Year,Section,Paper Set\n'
    const rows = workstations.map(ws => {
      return `${ws.id},${ws.ipAddress},${ws.status},${ws.allocatedStudent?.name || 'N/A'},${ws.allocatedStudent?.registerNumber || 'N/A'},${ws.allocatedStudent?.year || 'N/A'},${ws.allocatedStudent?.section || 'N/A'},${ws.allocatedStudent?.paperSet || 'N/A'}`
    }).join('\n')
    
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Lab_Exam_Seating_${selectedLabId}_${selectedSubjectCode}.csv`
    a.click()
    toast.success('Seating CSV roster exported successfully!')
  }

  const totalAllocated = workstations.filter(ws => ws.allocatedStudent).length
  const totalMaintenance = workstations.filter(ws => ws.status === 'maintenance').length
  const totalAvailable = workstations.length - totalAllocated - totalMaintenance

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0E2C66] to-[#1455D9] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Anna University Practical Exam System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Automated Lab Exam Seat Allocator
            </h1>
            <p className="text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
              Anti-malpractice intelligent workstation allocation engine. Automatically segregates consecutive roll numbers and distributes Question Paper Sets (A/B) in a checkerboard layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Chart</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-4">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-cyan-200 block">Total Workstations</span>
            <strong className="text-xl font-black text-white">{workstations.length} PCs</strong>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-cyan-200 block">Allocated Candidates</span>
            <strong className="text-xl font-black text-emerald-300">{totalAllocated} Students</strong>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-cyan-200 block">Vacant Desks</span>
            <strong className="text-xl font-black text-cyan-300">{totalAvailable} PCs</strong>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-cyan-200 block">Under Maintenance</span>
            <strong className="text-xl font-black text-amber-300">{totalMaintenance} PCs</strong>
          </div>
        </div>
      </div>

      {/* Student Personal Seat Callout (Visible if student assigned) */}
      {studentAssignedWs && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl shrink-0 ring-4 ring-white/30">
              <Monitor className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-amber-100 block">
                YOUR ASSIGNED LAB EXAM WORKSTATION
              </span>
              <h3 className="text-xl font-black">
                {studentAssignedWs.id} • {currentLab.name}
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                IP: {studentAssignedWs.ipAddress} • Paper Set: <span className="font-black underline font-mono">{studentAssignedWs.allocatedStudent?.paperSet}</span> • Row {Math.ceil(studentAssignedWs.pcNumber / 10)}, Seat {(studentAssignedWs.pcNumber - 1) % 10 + 1}
              </p>
            </div>
          </div>
          <div className="bg-white text-slate-900 px-4 py-2 rounded-xl text-center shrink-0 shadow-md">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Reporting Time</span>
            <strong className="text-xs font-black text-amber-700">09:15 AM (Before Bell)</strong>
          </div>
        </div>
      )}

      {/* Configuration & Control Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Lab Room & Exam Parameters</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Reg No or Name..."
                className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none w-56"
              />
            </div>

            {/* Allocate Actions */}
            <button
              onClick={handleAutoAllocate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto Allocate Workstations</span>
            </button>

            <button
              onClick={handleClearAllocation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-500 font-semibold block mb-1">Laboratory Hall:</label>
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
            >
              {LAB_ROOMS.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-semibold block mb-1">Practical Subject:</label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
            >
              {SUBJECTS.map(s => (
                <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-semibold block mb-1">Exam Session & Date:</label>
            <div className="flex gap-2">
              <select
                value={examSession}
                onChange={(e) => setExamSession(e.target.value as any)}
                className="w-24 p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
              >
                <option value="FN">FN (09:30 AM)</option>
                <option value="AN">AN (01:30 PM)</option>
              </select>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="flex-1 p-2 rounded-xl border border-slate-200 font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 font-semibold block mb-1">Anti-Malpractice Strategy:</label>
            <select
              value={antiMalpracticeStrategy}
              onChange={(e) => setAntiMalpracticeStrategy(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
            >
              <option value="checkerboard">Checkerboard (Alternating A/B)</option>
              <option value="year_mixed">Year Mixed (Y3 + Y2 Interleaved)</option>
              <option value="randomized">Full Pseudo-Random Shuffle</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2D Interactive Workstation Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Floor Plan & Workstation Allocation Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentLab.name} • {currentLab.location} • Incharge: {currentLab.incharge}
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-blue-50 border border-blue-300 inline-block" />
              <span className="text-slate-600">Set A</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-purple-50 border border-purple-300 inline-block" />
              <span className="text-slate-600">Set B</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300 inline-block" />
              <span className="text-slate-400">Vacant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-red-100 border border-red-300 inline-block" />
              <span className="text-red-700">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Front Projector / Examiner Desk Display */}
        <div className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center font-bold text-xs text-slate-500 uppercase tracking-widest">
          ══════════════ [ FRONT TEACHER'S PODIUM & WHITEBOARD ] ══════════════
        </div>

        {/* Grid Container (6 rows of 10 columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
          {workstations.map((ws) => {
            const isMatch = searchQuery
              ? ws.allocatedStudent?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ws.allocatedStudent?.registerNumber.includes(searchQuery) ||
                ws.id.toLowerCase().includes(searchQuery.toLowerCase())
              : false

            const isCurrentStudent = ws.allocatedStudent?.registerNumber === currentStudentReg

            let cardStyle = 'bg-slate-50 border-slate-200 text-slate-400'
            if (ws.status === 'maintenance') {
              cardStyle = 'bg-red-50/70 border-red-200 text-red-700'
            } else if (ws.allocatedStudent) {
              if (ws.allocatedStudent.paperSet === 'A') {
                cardStyle = 'bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-400'
              } else {
                cardStyle = 'bg-purple-50 border-purple-200 text-purple-900 hover:border-purple-400'
              }
            }

            if (isCurrentStudent) {
              cardStyle = 'bg-amber-100 border-amber-500 ring-2 ring-amber-500 text-amber-950 font-bold shadow-lg scale-105 z-10'
            } else if (isMatch) {
              cardStyle = 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500 text-emerald-950 font-bold shadow-lg scale-105 z-10'
            }

            return (
              <div
                key={ws.id}
                className={`p-2.5 rounded-xl border text-xs transition-all relative group flex flex-col justify-between min-h-[96px] ${cardStyle}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[11px]">{ws.id}</span>
                  {ws.status === 'maintenance' ? (
                    <span className="text-[9px] px-1 rounded bg-red-200 text-red-800 font-bold">DOWN</span>
                  ) : ws.allocatedStudent ? (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono ${
                      ws.allocatedStudent.paperSet === 'A' ? 'bg-blue-200 text-blue-800' : 'bg-purple-200 text-purple-800'
                    }`}>
                      SET {ws.allocatedStudent.paperSet}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400 font-mono">VAC</span>
                  )}
                </div>

                {ws.allocatedStudent ? (
                  <div className="my-1">
                    <p className="font-bold text-[11px] truncate leading-tight" title={ws.allocatedStudent.name}>
                      {ws.allocatedStudent.name}
                    </p>
                    <p className="font-mono text-[9px] text-slate-500 truncate mt-0.5">
                      {ws.allocatedStudent.registerNumber.slice(-4)} • Y{ws.allocatedStudent.year}-{ws.allocatedStudent.section}
                    </p>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic text-center my-auto">
                    {ws.status === 'maintenance' ? 'Out of Order' : 'Available'}
                  </div>
                )}

                <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 border-t border-slate-200/50 pt-1">
                  <span>{ws.ipAddress.split('.').slice(-1)[0]}</span>
                  <span>LINUX</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Rear Exit Door Note */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-2">
          <span>← Emergency Exit (West)</span>
          <span className="font-mono text-[11px]">Central Server Rack & Switchboard (East) →</span>
        </div>
      </div>
    </div>
  )
}
