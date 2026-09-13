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
  Zap,
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<LabActivityRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
    toolsUsed: 'Python 3.11, VS Code, Jupyter Notebook',
    status: 'completed',
    attendanceCount: '58',
    remarks: '',
  })

  // Synchronize Day from Date
  const handleDateChange = (newDate: string) => {
    let dayName = formData.day
    if (newDate) {
      try {
        const d = new Date(newDate + 'T00:00:00')
        dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
      } catch {}
    }
    setFormData((prev) => ({ ...prev, date: newDate, day: dayName }))
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingActivity(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      period: details.labPeriod || 'Period 5 - 8 (01:20 PM - 04:30 PM)',
      experimentNo: String((activities.length + 1) || 1),
      experimentName: '',
      topicsCovered: '',
      activityType: 'Lab Experiment',
      labTrainer: details.labTrainer || '',
      toolsUsed: 'Python 3.11, VS Code, Jupyter Notebook',
      status: 'completed',
      attendanceCount: '58',
      remarks: '',
    })
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (act: LabActivityRecord) => {
    setEditingActivity(act)
    setFormData({
      date: act.date,
      day: act.day,
      period: act.period || details.labPeriod || '',
      experimentNo: act.experimentNo ? String(act.experimentNo) : '',
      experimentName: act.experimentName,
      topicsCovered: act.topicsCovered,
      activityType: act.activityType || 'Lab Experiment',
      labTrainer: act.labTrainer || details.labTrainer || '',
      toolsUsed: act.toolsUsed || '',
      status: act.status || 'completed',
      attendanceCount: act.attendanceCount ? String(act.attendanceCount) : '',
      remarks: act.remarks || '',
    })
    setIsModalOpen(true)
  }

  // Quick Preset Selection
  const handleSelectPreset = (preset: LabPreset) => {
    setFormData((prev) => ({
      ...prev,
      experimentNo: String(preset.experimentNo),
      experimentName: preset.name,
      topicsCovered: preset.topics,
      activityType: preset.activityType,
      toolsUsed: preset.tools,
    }))
  }

  // Save Activity Form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.experimentName.trim() || !formData.topicsCovered.trim()) {
      setAlertMessage({ type: 'error', text: 'Experiment/Activity Name and Topics Covered are required.' })
      return
    }

    setSaving(true)
    try {
      if (editingActivity) {
        // PUT update
        const res = await fetch('/api/faculty/laboratory', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingActivity.id,
            ...formData,
            experimentNo: formData.experimentNo ? Number(formData.experimentNo) : null,
            attendanceCount: formData.attendanceCount ? Number(formData.attendanceCount) : null,
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
          body: JSON.stringify({
            labName: details.labName,
            labCode: details.labCode,
            year: details.year,
            semester: details.semester,
            section: details.section,
            batch: details.batch,
            ...formData,
            experimentNo: formData.experimentNo ? Number(formData.experimentNo) : null,
            attendanceCount: formData.attendanceCount ? Number(formData.attendanceCount) : null,
          }),
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
      const q = searchQuery.toLowerCase()
      const matchQuery =
        !q ||
        act.experimentName.toLowerCase().includes(q) ||
        act.topicsCovered.toLowerCase().includes(q) ||
        act.date.includes(q) ||
        act.day.toLowerCase().includes(q) ||
        (act.labTrainer && act.labTrainer.toLowerCase().includes(q)) ||
        (act.toolsUsed && act.toolsUsed.toLowerCase().includes(q))

      const matchCat = selectedCategory === 'all' || act.activityType === selectedCategory
      const matchStatus = selectedStatus === 'all' || act.status === selectedStatus

      return matchQuery && matchCat && matchStatus
    })
  }, [activities, searchQuery, selectedCategory, selectedStatus])

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

      {/* Hero Banner with Lab Identity */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#051330] via-[#071A3D] to-[#1455D9] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#22C7E8]/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#22C7E8] to-[#1455D9] text-white flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0 ring-4 ring-white/10">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase tracking-wider">
                  {details.labCode || 'LAB PRACTICAL'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                  {details.batch}
                </span>
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Department of AI &amp; DS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {details.labName}
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
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#22C7E8] to-[#0EA5E9] hover:brightness-105 text-[#071A3D] text-xs font-black flex items-center gap-2 transition-all shadow-[0_4px_16px_rgba(34,199,232,0.35)] cursor-pointer hover:scale-102"
            >
              <Plus className="w-4 h-4" /> Log Day&apos;s Lab Activity
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
              {activities.length} Days
            </p>
            <p className="text-[10px] text-slate-300">Conducted Practicals</p>
          </div>

          <div className="bg-white/[0.08] backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xs">
            <p className="text-[10px] text-slate-300 uppercase font-bold">Syllabus Experiments</p>
            <p className="text-xl font-black text-emerald-300 mt-0.5">
              {activities.filter((a) => a.activityType === 'Lab Experiment').length} / {presets.length}
            </p>
            <p className="text-[10px] text-slate-300">Prescribed AU Syllabus</p>
          </div>

          <div className="bg-white/[0.08] backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xs">
            <p className="text-[10px] text-slate-300 uppercase font-bold">Lab Trainer / Co-Incharge</p>
            <p className="text-sm font-black text-cyan-300 mt-1 truncate">
              {details.labTrainer || 'Designated Trainer'}
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

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by topic, experiment name, date, software tool, or trainer..."
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
            <option value="all">All Activity Types</option>
            <option value="Lab Experiment">Lab Experiments</option>
            <option value="Hands-on Activity">Hands-on Exercises</option>
            <option value="Model Practical">Model Practicals</option>
            <option value="Viva Voce">Viva Voce &amp; Code Review</option>
            <option value="Project Review">Project Reviews</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 focus:border-[#1455D9] focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Main Day-wise Activities List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#071A3D] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1455D9]" />
            <span>Day-wise Laboratory Topics &amp; Activities Conducted ({filteredActivities.length})</span>
          </h2>
          <span className="text-xs text-gray-500 font-mono">
            {details.batch} · AI &amp; DS Laboratory
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <Card className="rounded-3xl border-gray-200 bg-white shadow-xs">
            <CardContent className="p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto shadow-inner">
                <FlaskConical className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="font-black text-lg text-[#071A3D]">No Laboratory Day Activities Logged Yet</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Record each day&apos;s practical session topics, experiments conducted, trainer participation, and hands-on exercises for departmental compliance.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleOpenCreate}
                  className="px-5 py-2.5 bg-[#1455D9] hover:bg-[#0e44b5] text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Log Today&apos;s Session
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredActivities.map((act) => (
              <Card
                key={act.id}
                className="rounded-3xl border-gray-200 hover:shadow-md transition-all bg-white overflow-hidden group hover:border-[#1455D9]/40"
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {act.experimentNo && (
                        <span className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[#1455D9] font-mono text-xs font-black">
                          Ex. {act.experimentNo}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        {act.day}, {act.date}
                      </span>
                      {act.period && (
                        <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-medium text-xs flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          {act.period}
                        </span>
                      )}
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                          act.activityType === 'Lab Experiment' && 'bg-blue-100 text-blue-800',
                          act.activityType === 'Hands-on Activity' && 'bg-emerald-100 text-emerald-800',
                          act.activityType === 'Model Practical' && 'bg-purple-100 text-purple-800',
                          act.activityType === 'Viva Voce' && 'bg-amber-100 text-amber-800',
                          act.activityType === 'Project Review' && 'bg-rose-100 text-rose-800'
                        )}
                      >
                        {act.activityType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                          act.status === 'completed' && 'bg-emerald-500/15 text-emerald-700 border border-emerald-300',
                          act.status === 'in_progress' && 'bg-blue-500/15 text-blue-700 border border-blue-300 animate-pulse',
                          act.status === 'scheduled' && 'bg-amber-500/15 text-amber-700 border border-amber-300'
                        )}
                      >
                        {act.status}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(act)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#1455D9] hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Activity"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(act.id, act.experimentName)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Covered Topics */}
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-[#071A3D] group-hover:text-[#1455D9] transition-colors">
                      {act.experimentName}
                    </h3>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100">
                      <p className="text-[11px] font-bold text-gray-500 uppercase mb-1">Topics &amp; Practical Activity Held on the Day:</p>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                        {act.topicsCovered}
                      </p>
                    </div>
                  </div>

                  {/* Footer Meta: Tools, Trainer, Remarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    {act.toolsUsed && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Code2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="truncate"><strong>Tools:</strong> {act.toolsUsed}</span>
                      </div>
                    )}
                    {act.labTrainer && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <UserCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                        <span className="truncate"><strong>Trainer:</strong> {act.labTrainer}</span>
                      </div>
                    )}
                    {act.attendanceCount && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Attendance:</strong> {act.attendanceCount} Students Present</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center shadow-md">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#071A3D]">
                    {editingActivity ? 'Edit Lab Day Activity' : 'Log Day\'s Laboratory Practical & Topics'}
                  </h2>
                  <p className="text-xs text-gray-400 font-mono">
                    {details.labName} ({details.batch})
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
              {/* Quick Fill Preset Banner */}
              {!editingActivity && presets.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#071A3D] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Quick Pre-Fill Standard AI&amp;DS Syllabus Experiment:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                    {presets.map((p) => (
                      <button
                        key={p.experimentNo}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className="px-2.5 py-1 rounded-xl bg-white border border-blue-200 hover:border-[#1455D9] text-[11px] font-bold text-gray-700 hover:text-[#1455D9] transition-all cursor-pointer shadow-2xs text-left"
                      >
                        Ex. {p.experimentNo}: {p.name.split(':')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date, Day, Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Date of Session *
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Day of the Week
                  </label>
                  <input
                    type="text"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    placeholder="e.g. Wednesday"
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-bold text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Lab Period / Timings
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

              {/* Experiment Number and Title */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Experiment #
                  </label>
                  <input
                    type="number"
                    value={formData.experimentNo}
                    onChange={(e) => setFormData({ ...formData, experimentNo: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Experiment / Practical Activity Title *
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

              {/* Topics & Activities Conducted On the Day (Required) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Topics &amp; Practical Activity Held on the Day *</span>
                  <span className="text-[10px] text-gray-400 font-normal">Mention practical coverage &amp; code tasks</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.topicsCovered}
                  onChange={(e) => setFormData({ ...formData, topicsCovered: e.target.value })}
                  placeholder="Describe the exact syllabus topics taught, programming exercises implemented by students, problems solved, and viva questions covered during this session..."
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white font-medium text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Activity Type, Trainer & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none cursor-pointer"
                  >
                    <option value="Lab Experiment">Lab Experiment</option>
                    <option value="Hands-on Activity">Hands-on Activity</option>
                    <option value="Model Practical">Model Practical</option>
                    <option value="Viva Voce">Viva Voce &amp; Code Review</option>
                    <option value="Project Review">Project Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Laboratory Trainer Present
                  </label>
                  <input
                    type="text"
                    value={formData.labTrainer}
                    onChange={(e) => setFormData({ ...formData, labTrainer: e.target.value })}
                    placeholder="e.g. Dr. K. Saravanan (Trainer)"
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none cursor-pointer"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              {/* Tools Used, Attendance & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Software &amp; Tools Used
                  </label>
                  <input
                    type="text"
                    value={formData.toolsUsed}
                    onChange={(e) => setFormData({ ...formData, toolsUsed: e.target.value })}
                    placeholder="e.g. Python 3.11, Jupyter Lab, Scikit-Learn"
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Students Present / Attendance Count
                  </label>
                  <input
                    type="number"
                    value={formData.attendanceCount}
                    onChange={(e) => setFormData({ ...formData, attendanceCount: e.target.value })}
                    placeholder="e.g. 58"
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>
              </div>

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
                  {saving ? 'Saving Log...' : editingActivity ? 'Update Activity' : 'Save Day\'s Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
