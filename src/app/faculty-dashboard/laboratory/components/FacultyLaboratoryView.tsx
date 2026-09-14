'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  FlaskConical,
  Plus,
  Search,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Filter,
  FileText,
  Printer,
  Edit2,
  Trash2,
  ChevronRight,
  ExternalLink,
  Tag,
  Code2,
  Check,
  AlertCircle,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export interface LabActivityRecord {
  id: string
  facultyId: string
  facultyName?: string | null
  labName: string
  labCode?: string | null
  year: number
  semester: number
  section: string
  batch?: string | null
  day: string
  date: string
  period?: string | null
  experimentNo?: number | null
  experimentName: string
  topicsCovered: string
  activityType: string
  labTrainer?: string | null
  toolsUsed?: string | null
  status: string
  attendanceCount?: number | null
  remarks?: string | null
  createdAt: string
}

export interface LabDetails {
  labName: string
  labCode: string
  labTimings: string
  labDay: string
  labPeriod: string
  labTrainer: string
  batch: string
  year: number
  semester: number
  section: string
}

export interface LabPreset {
  experimentNo: number
  name: string
  topics: string
  activityType: string
  tools: string
}

export const COMMUNICATION_LAB_ACTIVITIES = [
  {
    name: 'Listening & Phonetics',
    topics: 'Accent neutralisation, phonetic symbol drills, and comprehension audio tests.',
  },
  {
    name: 'JAM (Just-A-Minute)',
    topics: '1-minute impromptu speaking drills for spontaneity and fluency.',
  },
  {
    name: 'Oral & Technical Presentations',
    topics: 'Formal PPT presentations with visual aids and peer Q&A.',
  },
  {
    name: 'Group Discussions (GD)',
    topics: 'Formal GD rounds on contemporary tech and social issues.',
  },
  {
    name: 'Formal Writing & Etiquette',
    topics: 'Professional resumes, cover letters, and corporate email correspondence.',
  },
  {
    name: 'Mock Interviews & Viva',
    topics: 'One-on-one HR and technical interview simulations with behavioral scoring.',
  },
]

interface Props {
  initialDetails: LabDetails
  initialActivities: LabActivityRecord[]
  presets: LabPreset[]
  facultyName: string
}

export function FacultyLaboratoryView({
  initialDetails,
  initialActivities,
  presets,
  facultyName,
}: Props) {
  const [details, setDetails] = useState<LabDetails>(initialDetails)
  const [activities, setActivities] = useState<LabActivityRecord[]>(initialActivities)
  const [activeLabTab, setActiveLabTab] = useState<'aids' | 'communication'>('aids')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<LabActivityRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Communication Lab Student Tracking
  const [pendingCount, setPendingCount] = useState<string>('0')

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    period: initialDetails.labPeriod || 'Period 5 - 8 (01:20 PM - 04:30 PM)',
    experimentNo: '',
    experimentName: '',
    topicsCovered: '',
    activityType: 'Lab Experiment',
    labTrainer: initialDetails.labTrainer || '',
    toolsUsed: '',
    status: 'completed',
    attendanceCount: '',
    remarks: '',
  })

  // Synchronize Day from Date
  const handleDateChange = (newDate: string) => {
    let dayName = formData.day
    if (newDate) {
      try {
        const d = new Date(newDate + 'T00:00:00')
        dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
      } catch { }
    }
    setFormData((prev) => ({ ...prev, date: newDate, day: dayName }))
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingActivity(null)
    const isComm = activeLabTab === 'communication'
    const aidsCount = activities.filter(
      (a) => !a.labName?.toLowerCase().includes('communication') && a.labCode !== 'GE3271'
    ).length

    setPendingCount('0')

    setFormData({
      date: new Date().toISOString().split('T')[0],
      day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      period: details.labPeriod || 'Period 5 - 8 (01:20 PM - 04:30 PM)',
      experimentNo: isComm ? '' : String(aidsCount + 1 || 1),
      experimentName: '',
      topicsCovered: '',
      activityType: isComm ? 'Communication Activity' : 'Lab Experiment',
      labTrainer: details.labTrainer || '',
      toolsUsed: '',
      status: 'completed',
      attendanceCount: isComm ? '58' : '58',
      remarks: '',
    })
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (act: LabActivityRecord) => {
    setEditingActivity(act)
    const isCommAct = act.labName?.toLowerCase().includes('communication') || act.labCode === 'GE3271'
    setActiveLabTab(isCommAct ? 'communication' : 'aids')

    let pending = '0'
    if (act.remarks) {
      const match = act.remarks.match(/(\d+)/)
      if (match) pending = match[1]
      else pending = act.remarks
    }
    setPendingCount(pending)

    setFormData({
      date: act.date,
      day: act.day,
      period: act.period || details.labPeriod || '',
      experimentNo: act.experimentNo ? String(act.experimentNo) : '',
      experimentName: act.experimentName,
      topicsCovered: act.topicsCovered,
      activityType: act.activityType || (isCommAct ? 'Communication Activity' : 'Lab Experiment'),
      labTrainer: act.labTrainer || details.labTrainer || '',
      toolsUsed: act.toolsUsed || '',
      status: act.status || 'completed',
      attendanceCount: act.attendanceCount !== null && act.attendanceCount !== undefined ? String(act.attendanceCount) : '',
      remarks: act.remarks || '',
    })
    setIsModalOpen(true)
  }

  // Save Activity Form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.experimentName.trim() || !formData.topicsCovered.trim()) {
      setAlertMessage({
        type: 'error',
        text: activeLabTab === 'communication'
          ? 'Activity Name and Today\'s Topics are required.'
          : 'Experiment Title and Topics Covered are required.',
      })
      return
    }

    setSaving(true)
    const currentLabName = activeLabTab === 'communication'
      ? 'Communication Skills Laboratory'
      : (details.labName || 'Artificial Intelligence & Data Science Laboratory')
    const currentLabCode = activeLabTab === 'communication' ? 'GE3271' : (details.labCode || 'AD2311')

    const commAttendance = formData.attendanceCount !== '' ? Number(formData.attendanceCount) : null
    const commRemarks = pendingCount !== '' ? `${pendingCount} Pending Students` : (formData.remarks || null)

    const payload = {
      labName: currentLabName,
      labCode: currentLabCode,
      year: details.year,
      semester: details.semester,
      section: details.section,
      batch: details.batch,
      ...formData,
      experimentName: formData.experimentName.trim(),
      topicsCovered: formData.topicsCovered.trim(),
      toolsUsed: formData.toolsUsed ? formData.toolsUsed.trim() : null,
      activityType: activeLabTab === 'communication' ? 'Communication Activity' : formData.activityType,
      experimentNo: activeLabTab === 'communication' ? null : (formData.experimentNo ? Number(formData.experimentNo) : null),
      attendanceCount: activeLabTab === 'communication' ? commAttendance : (formData.attendanceCount ? Number(formData.attendanceCount) : null),
      remarks: activeLabTab === 'communication' ? commRemarks : (formData.remarks || null),
    }

    try {
      if (editingActivity) {
        // PUT update
        const res = await fetch('/api/faculty/laboratory', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingActivity.id,
            ...payload,
          }),
        })
        const resData = await res.json()
        if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to update')

        setActivities((prev) =>
          prev.map((a) => (a.id === editingActivity.id ? resData.activity : a))
        )
        setAlertMessage({ type: 'success', text: 'Lab day activity updated successfully!' })
      } else {
        // POST create
        const res = await fetch('/api/faculty/laboratory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const resData = await res.json()
        if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to save')

        setActivities((prev) => [resData.activity, ...prev])
        setAlertMessage({ type: 'success', text: 'Lab day activity logged successfully!' })
      }

      setIsModalOpen(false)
      setTimeout(() => setAlertMessage(null), 3000)
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Error occurred while saving.' })
    } finally {
      setSaving(false)
    }
  }

  // Delete Activity
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the log for "${name}"?`)) return
    try {
      const res = await fetch(`/api/faculty/laboratory?id=${id}`, { method: 'DELETE' })
      const resData = await res.json()
      if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to delete')

      setActivities((prev) => prev.filter((a) => a.id !== id))
      setAlertMessage({ type: 'success', text: `Deleted log for "${name}".` })
      setTimeout(() => setAlertMessage(null), 3000)
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Could not delete.' })
    }
  }

  // Filtered List
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const isCommAct = act.labName?.toLowerCase().includes('communication') || act.labCode === 'GE3271'
      if (activeLabTab === 'communication' && !isCommAct) return false
      if (activeLabTab === 'aids' && isCommAct) return false

      const q = searchQuery.toLowerCase()
      const matchQuery =
        !q ||
        act.experimentName.toLowerCase().includes(q) ||
        act.topicsCovered.toLowerCase().includes(q) ||
        act.date.includes(q) ||
        act.day.toLowerCase().includes(q) ||
        (act.labTrainer && act.labTrainer.toLowerCase().includes(q)) ||
        (act.toolsUsed && act.toolsUsed.toLowerCase().includes(q)) ||
        (act.remarks && act.remarks.toLowerCase().includes(q))

      const matchCat = selectedCategory === 'all' || act.activityType === selectedCategory
      const matchStatus = selectedStatus === 'all' || act.status === selectedStatus

      return matchQuery && matchCat && matchStatus
    })
  }, [activities, searchQuery, selectedCategory, selectedStatus, activeLabTab])

  // Print Register
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Toast Alert */}
      {alertMessage && (
        <div
          className={cn(
            'p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 border',
            alertMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          )}
        >
          <div className="flex items-center gap-2">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{alertMessage.text}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Laboratory Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveLabTab('aids')
              setDetails((prev) => ({
                ...prev,
                labName: 'Artificial Intelligence & Data Science Laboratory',
                labCode: 'AD2311',
              }))
            }}
            className={cn(
              'px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2',
              activeLabTab === 'aids'
                ? 'bg-[#1455D9] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <FlaskConical className="w-4 h-4" />
            <span>AI &amp; DS Laboratory (AD2311)</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                activeLabTab === 'aids' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              )}
            >
              {activities.filter((a) => !a.labName?.toLowerCase().includes('communication') && a.labCode !== 'GE3271').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveLabTab('communication')
              setDetails((prev) => ({
                ...prev,
                labName: 'Communication Skills Laboratory',
                labCode: 'GE3271',
              }))
            }}
            className={cn(
              'px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2',
              activeLabTab === 'communication'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>Communication Skills Laboratory (GE3271)</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                activeLabTab === 'communication' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              )}
            >
              {activities.filter((a) => a.labName?.toLowerCase().includes('communication') || a.labCode === 'GE3271').length}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-gray-500 font-medium px-2">
          Active Lab: <strong className="text-[#071A3D]">{activeLabTab === 'communication' ? 'Communication Skills' : 'AI & DS Practical'}</strong>
        </div>
      </div>

      {/* Hero Banner with Lab Identity */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/10 transition-all",
        activeLabTab === 'communication'
          ? "bg-gradient-to-r from-[#1e1b4b] via-[#31104b] to-[#7c3aed]"
          : "bg-gradient-to-r from-[#051330] via-[#071A3D] to-[#1455D9]"
      )}>
        <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0 ring-4 ring-white/10",
              activeLabTab === 'communication'
                ? "bg-gradient-to-tr from-[#9333EA] to-[#6366F1]"
                : "bg-gradient-to-tr from-[#22C7E8] to-[#1455D9]"
            )}>
              {activeLabTab === 'communication' ? (
                <Sparkles className="w-8 h-8 text-white" />
              ) : (
                <FlaskConical className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase tracking-wider">
                  {activeLabTab === 'communication' ? 'GE3271' : (details.labCode || 'AD2311')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                  {details.batch}
                </span>
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {activeLabTab === 'communication' ? 'Language & Communication Lab' : 'Department of AI & DS'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeLabTab === 'communication' ? 'Communication Skills Laboratory' : details.labName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono flex flex-wrap items-center gap-2 pt-0.5">
                <span>Faculty: <strong>{facultyName}</strong></span>
                {details.labTrainer && (
                  <span>· Trainer: <strong className="text-cyan-300">{details.labTrainer}</strong></span>
                )}
                <span>· Schedule: <strong className="text-amber-300">{details.labDay} ({details.labTimings})</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleOpenCreate}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer hover:scale-102",
                activeLabTab === 'communication'
                  ? "bg-white text-purple-900 hover:bg-purple-50 shadow-[0_4px_16px_rgba(168,85,247,0.35)]"
                  : "bg-gradient-to-r from-[#22C7E8] to-[#0EA5E9] hover:brightness-105 text-[#071A3D] shadow-[0_4px_16px_rgba(34,199,232,0.35)]"
              )}
            >
              <Plus className="w-4 h-4" /> {activeLabTab === 'communication' ? "Log Communication Activity" : "Log Day's Lab Activity"}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/15 cursor-pointer"
              title="Print Lab Logbook Register"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        {/* Lab KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/[0.08] backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xs">
            <p className="text-[10px] text-slate-300 uppercase font-bold">Sessions Logged</p>
            <p className="text-xl font-black text-[#F4C430] mt-0.5">
              {filteredActivities.length} Days
            </p>
            <p className="text-[10px] text-slate-300">Conducted Sessions</p>
          </div>

          <div className="bg-white/[0.08] backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xs">
            <p className="text-[10px] text-slate-300 uppercase font-bold">
              {activeLabTab === 'communication' ? 'Lab Course Code' : 'Syllabus Experiments'}
            </p>
            <p className="text-xl font-black text-emerald-300 mt-0.5">
              {activeLabTab === 'communication'
                ? 'GE3271'
                : `${filteredActivities.filter((a) => a.activityType === 'Lab Experiment' || a.experimentNo).length} / ${presets.length}`}
            </p>
            <p className="text-[10px] text-slate-300">
              {activeLabTab === 'communication' ? 'Anna University Syllabus' : 'Prescribed AU Syllabus'}
            </p>
          </div>

          <div className="bg-white/[0.08] backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xs">
            <p className="text-[10px] text-slate-300 uppercase font-bold">
              {activeLabTab === 'communication' ? 'Trainer / In-charge' : 'Lab Trainer / Co-Incharge'}
            </p>
            <p className="text-sm font-black text-cyan-300 mt-1 truncate">
              {details.labTrainer || (activeLabTab === 'communication' ? 'Language Trainer' : 'Designated Trainer')}
            </p>
            <p className="text-[10px] text-cyan-200">Practical Assistance</p>
          </div>

          <div className="bg-white/[0.08] backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xs">
            <p className="text-[10px] text-slate-300 uppercase font-bold">Class Schedule Slot</p>
            <p className="text-sm font-black text-purple-300 mt-1 truncate">
              {details.labPeriod || 'Periods 5 - 8'}
            </p>
            <p className="text-[10px] text-purple-200">{details.labTimings || '01:20 PM - 04:30 PM'}</p>
          </div>
        </div>
      </div>

      {/* Standard Anna University Curricular Topics Covered (Communication Laboratory) */}
      {activeLabTab === 'communication' && (
        <div className="bg-gradient-to-br from-purple-950/10 via-indigo-900/5 to-white p-6 rounded-3xl border border-purple-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black uppercase tracking-wider">
                  Anna University GE3271 Syllabus
                </span>
                <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Prescribed Practical Curricular Exercises
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#071A3D] mt-1.5">
                Standard Anna University Curricular Topics Covered
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                The Communication Laboratory is designed to support the following practical exercises:
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-2 cursor-pointer self-start sm:self-center"
            >
              <Plus className="w-4 h-4" /> Log Practical Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {COMMUNICATION_LAB_ACTIVITIES.map((act, idx) => {
              const count = activities.filter(
                (a) =>
                  (a.labName?.toLowerCase().includes('communication') || a.labCode === 'GE3271') &&
                  a.experimentName === act.name
              ).length

              return (
                <div
                  key={act.name}
                  className="p-4 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-black text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                        Exercise 0{idx + 1}
                      </span>
                      {count > 0 ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {count} {count === 1 ? 'Session' : 'Sessions'} Logged
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          Not Logged Yet
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-[#071A3D] group-hover:text-purple-700 transition-colors">
                        {act.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {act.topics}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingActivity(null)
                      setPendingCount('0')
                      setFormData({
                        date: new Date().toISOString().split('T')[0],
                        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                        period: details.labPeriod || 'Period 5 - 8 (01:20 PM - 04:30 PM)',
                        experimentNo: '',
                        experimentName: act.name,
                        topicsCovered: act.topics,
                        activityType: 'Communication Activity',
                        labTrainer: details.labTrainer || '',
                        toolsUsed: '',
                        status: 'completed',
                        attendanceCount: '58',
                        remarks: '',
                      })
                      setIsModalOpen(true)
                    }}
                    className="w-full mt-1 py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Log this Activity</span>
                    <span className="text-sm">&rarr;</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter and Action Bar with Emojis */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="🔍 Search history by experiment #, topic, trainer coverage, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:border-[#1455D9] focus:outline-none cursor-pointer"
          >
            <option value="all">📂 All Activity Types</option>
            <option value="Lab Experiment">🧪 Lab Experiments</option>
            <option value="Hands-on Activity">💻 Hands-on Exercises</option>
            <option value="Model Practical">📋 Model Practicals</option>
            <option value="Viva Voce">🗣️ Viva Voce</option>
            <option value="Project Review">🚀 Project Reviews</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:border-[#1455D9] focus:outline-none cursor-pointer"
          >
            <option value="all">📊 All Status</option>
            <option value="completed">✅ Completed</option>
            <option value="in_progress">⏳ In Progress</option>
            <option value="scheduled">📅 Scheduled</option>
          </select>
        </div>
      </div>

      {/* Main Day-wise Activities List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#071A3D] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1455D9]" />
            <span>
              📚{' '}
              {activeLabTab === 'communication'
                ? `Day-wise Communication Practical History (${filteredActivities.length})`
                : `Day-wise Laboratory Practical & Activity History (${filteredActivities.length})`}
            </span>
          </h2>
          <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
            <span>🏛️</span>
            <span>{details.batch} · {activeLabTab === 'communication' ? 'GE3271 Communication Skills Lab' : 'AD2311 AI & DS Laboratory'}</span>
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <Card className="rounded-3xl border-gray-200 bg-white shadow-xs">
            <CardContent className="p-8 sm:p-12 text-center space-y-4">
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner',
                  activeLabTab === 'communication' ? 'bg-purple-50 text-purple-600' : 'bg-cyan-50 text-cyan-600'
                )}
              >
                {activeLabTab === 'communication' ? <Sparkles className="w-8 h-8" /> : <FlaskConical className="w-8 h-8" />}
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="font-black text-lg text-[#071A3D]">
                  No {activeLabTab === 'communication' ? 'Communication Lab' : 'Laboratory Day'} Activities Logged Yet
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {activeLabTab === 'communication'
                    ? "Record each day's language practical session, communication exercises, student completions, and pending tasks."
                    : "Record each day's practical session topics, experiments conducted, trainer participation, and hands-on exercises for departmental compliance."}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleOpenCreate}
                  className={cn(
                    'px-5 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer',
                    activeLabTab === 'communication' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#1455D9] hover:bg-[#0e44b5]'
                  )}
                >
                  <Plus className="w-4 h-4" />{' '}
                  {activeLabTab === 'communication' ? "Log Today's Communication Session" : "Log Today's Session"}
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredActivities.map((act) => {
              const isCommAct = act.labName?.toLowerCase().includes('communication') || act.labCode === 'GE3271'
              return (
                <Card
                  key={act.id}
                  className="rounded-3xl border-gray-200 hover:shadow-lg transition-all bg-white overflow-hidden group hover:border-[#1455D9]/40"
                >
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* Top Meta Bar with Emojis */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {act.experimentNo && !isCommAct && (
                          <span className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[#1455D9] font-mono text-xs font-black flex items-center gap-1.5 shadow-2xs">
                            <span>🧪</span>
                            <span>Experiment #{act.experimentNo}</span>
                          </span>
                        )}
                        {isCommAct && (
                          <span className="px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-mono text-xs font-black flex items-center gap-1.5 shadow-2xs">
                            <span>🗣️</span>
                            <span>Communication Practical</span>
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs flex items-center gap-1.5">
                          <span>📅</span>
                          <span>{act.day}, {act.date}</span>
                        </span>
                        {act.period && (
                          <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-medium text-xs flex items-center gap-1.5">
                            <span>⏰</span>
                            <span>{act.period}</span>
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <span>✅</span>
                          <span>Completed</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenEdit(act)}
                          className="px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-[#1455D9] hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Edit Activity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(act.id, act.experimentName)}
                          className="px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Delete Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* 🎯 Topic of the Experiment */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-gray-500 uppercase tracking-wider">
                        <span>🎯</span>
                        <span>Topic of the Experiment:</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[#071A3D] group-hover:text-[#1455D9] transition-colors leading-snug flex items-center gap-2">
                        {act.experimentNo && !isCommAct && (
                          <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-[#1455D9] text-xs font-mono font-bold shrink-0">
                            Ex. {act.experimentNo}
                          </span>
                        )}
                        <span>{act.experimentName}</span>
                      </h3>
                    </div>

                    {/* 👨‍🏫 What Topics Covered by Trainer */}
                    {act.toolsUsed && (
                      <div className="bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-orange-50/20 p-3.5 rounded-2xl border border-amber-200/90 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                            <span>👨‍🏫</span>
                            <span>Topics Covered by Trainer:</span>
                          </p>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                            Instructor: {act.labTrainer || details.labTrainer || 'Designated Trainer'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-wrap">
                          {act.toolsUsed}
                        </p>
                      </div>
                    )}

                    {/* 📝 Topics & Practical Activity Held on the Day */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
                      <p className="text-[11px] font-black text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                        <span>📝</span>
                        <span>
                          {isCommAct
                            ? "Today's Practical Drills & Student Activities:"
                            : "Topics & Practical Activity Held on the Day:"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                        {act.topicsCovered}
                      </p>
                    </div>

                    {/* 👥 Student Attendance & Progress Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs text-gray-600">
                      <div className="flex flex-wrap items-center gap-3">
                        {isCommAct ? (
                          <>
                            {act.attendanceCount !== null && act.attendanceCount !== undefined && (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5">
                                <span>✅</span>
                                <span>
                                  No. of Students Completed: <strong>{act.attendanceCount} Students</strong>
                                </span>
                              </span>
                            )}
                            {act.remarks && (
                              <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 font-bold border border-amber-200 flex items-center gap-1.5">
                                <span>⏳</span>
                                <span>
                                  No. of Pending Students: <strong>{act.remarks}</strong>
                                </span>
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {act.attendanceCount !== null && act.attendanceCount !== undefined && (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5">
                                <span>👥</span>
                                <span>
                                  Lab Attendance: <strong>{act.attendanceCount} Students Present</strong>
                                </span>
                              </span>
                            )}
                          </>
                        )}
                        <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
                          <span>🏫</span>
                          <span>Year {act.year || details.year} · Sem {act.semester || details.semester} · Sec {act.section || details.section} · {act.batch || details.batch}</span>
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                        <span>🕒</span>
                        <span>Logged: {new Date(act.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md text-lg",
                  activeLabTab === 'communication'
                    ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                    : "bg-gradient-to-tr from-[#1455D9] to-cyan-500"
                )}>
                  {activeLabTab === 'communication' ? '🗣️' : '🧪'}
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#071A3D]">
                    {editingActivity
                      ? '✏️ Edit Laboratory Activity Log'
                      : activeLabTab === 'communication'
                        ? '🗣️ Log Communication Laboratory Practical & Topics'
                        : "🧪 Log Day's Laboratory Practical & Topics"}
                  </h2>
                  <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
                    <span>🏛️</span>
                    <span>
                      {activeLabTab === 'communication'
                        ? 'Communication Skills Laboratory (GE3271)'
                        : `${details.labName} (${details.labCode})`}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
              {/* Date, Day, Period with Emojis */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <span>📅</span>
                    <span>Date of Session *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <span>🗓️</span>
                    <span>Day of the Week</span>
                  </label>
                  <input
                    type="text"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    placeholder="e.g. Monday"
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-bold text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <span>⏰</span>
                    <span>Lab Period / Timings</span>
                  </label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="e.g. Period 5 - 8 (01:20 PM - 04:30 PM)"
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>
              </div>

              {/* Specific fields for Communication Lab vs AI & DS Lab */}
              {activeLabTab === 'communication' ? (
                <>
                  {/* Activity Name / Topic of Exercise */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <span>🎯</span>
                      <span>Activity Name / Practical Topic *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.experimentName}
                      onChange={(e) => setFormData({ ...formData, experimentName: e.target.value })}
                      placeholder="e.g. JAM (Just-A-Minute) / Mock Interviews & Viva / Accent Neutralisation"
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-xs text-[#071A3D] focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  {/* 👨‍🏫 What Topics Covered by Trainer */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <span>👨‍🏫</span>
                        <span>Topics Covered by Trainer / Instructor</span>
                      </label>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Language Trainer: {details.labTrainer || 'Designated Trainer'}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.toolsUsed}
                      onChange={(e) => setFormData({ ...formData, toolsUsed: e.target.value })}
                      placeholder="Describe the theoretical guidance, pronunciation rules, GD evaluation criteria, or interview etiquette delivered by the trainer..."
                      className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50/30 font-medium text-xs text-[#071A3D] focus:border-amber-500 focus:bg-white focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* 📝 Today's Topics (Typed textarea) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 flex items-center gap-1">
                        <span>📝</span>
                        <span>Today&apos;s Topics &amp; Student Practical Drills *</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Type practical tasks and exercises held today</span>
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={formData.topicsCovered}
                      onChange={(e) => setFormData({ ...formData, topicsCovered: e.target.value })}
                      placeholder="e.g. Accent neutralisation, phonetic symbol drills, audio tests, 1-minute impromptu speech by each student..."
                      className="w-full p-3 rounded-xl border border-gray-200 bg-white font-medium text-xs text-[#071A3D] focus:border-purple-600 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* 👥 Student Activity Performance: No. of Students Completed & Pending */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#071A3D] flex items-center gap-1">
                        <span>👥</span>
                        <span>Student Activity Performance</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                          <span>✅</span>
                          <span>No. of Students Completed *</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.attendanceCount}
                          onChange={(e) => {
                            const val = e.target.value
                            setFormData((prev) => ({ ...prev, attendanceCount: val }))
                            if (val !== '') {
                              const comp = Number(val)
                              setPendingCount(String(Math.max(0, 58 - comp)))
                            }
                          }}
                          placeholder="e.g. 52"
                          className="w-full p-2.5 rounded-xl border border-emerald-300 bg-white font-black text-xs text-emerald-900 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                          <span>⏳</span>
                          <span>No. of Pending Students</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={pendingCount}
                          onChange={(e) => setPendingCount(e.target.value)}
                          placeholder="e.g. 6"
                          className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-black text-xs text-amber-900 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* AI & DS Lab: Experiment Number and Topic of the Experiment */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                        <span>🧪</span>
                        <span>Experiment #</span>
                      </label>
                      <input
                        type="number"
                        value={formData.experimentNo}
                        onChange={(e) => setFormData({ ...formData, experimentNo: e.target.value })}
                        placeholder="e.g. 1"
                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-black text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                        <span>🎯</span>
                        <span>Topic of the Experiment (Title) *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.experimentName}
                        onChange={(e) => setFormData({ ...formData, experimentName: e.target.value })}
                        placeholder="e.g. Implementation of A* Heuristic Search Algorithm"
                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                      />
                    </div>
                  </div>


                  {/* 👨‍🏫 What Topics Covered by Trainer */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <span>👨‍🏫</span>
                        <span>Topics Covered by Trainer / Instructor</span>
                      </label>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Instructor: {details.labTrainer || 'Designated Lab Instructor'}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.toolsUsed}
                      onChange={(e) => setFormData({ ...formData, toolsUsed: e.target.value })}
                      placeholder="Describe the theoretical concepts, algorithms, state space graphs, or code walkthroughs delivered by the trainer..."
                      className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50/30 font-medium text-xs text-[#071A3D] focus:border-amber-500 focus:bg-white focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* 📝 Topics & Practical Activity Held on the Day */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>📝</span>
                        <span>Topics &amp; Practical Activity Held on the Day *</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">Mention practical coverage &amp; code tasks</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.topicsCovered}
                      onChange={(e) => setFormData({ ...formData, topicsCovered: e.target.value })}
                      placeholder="Describe the exact syllabus topics taught, programming exercises implemented by students, problems solved, and viva questions covered during this session..."
                      className="w-full p-3 rounded-xl border border-gray-200 bg-white font-medium text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* 👥 Lab Attendance */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <span>👥</span>
                      <span>Lab Attendance</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.attendanceCount}
                      onChange={(e) => setFormData({ ...formData, attendanceCount: e.target.value })}
                      placeholder="e.g. 58"
                      className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-black text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving Log...' : editingActivity ? 'Update Activity' : "Save Day's Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
