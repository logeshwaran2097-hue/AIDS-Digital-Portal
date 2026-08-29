'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  X,
  Upload,
  Calendar,
  Users,
  Building,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Paperclip,
  Trash2,
  Plus,
  Trophy,
  Briefcase,
  Activity,
  HeartPulse,
  Send,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'

export type ApplicationType =
  | 'Technical Hackathon / Competition OD'
  | 'Paper Presentation / Conference OD'
  | 'Industry Internship / Project Work OD'
  | 'Sports / Cultural Event OD'
  | 'Medical Leave (ML)'
  | 'Personal / Emergency Leave'

interface ApplyODPermissionModalProps {
  isOpen: boolean
  onClose: () => void
  student: {
    registerNumber: string
    year: number
    semester: number
    section: string
  }
  userName: string
  onApplicationSuccess?: (appData: any) => void
}

interface TeamMember {
  name: string
  registerNumber: string
}

export function ApplyODPermissionModal({
  isOpen,
  onClose,
  student,
  userName,
  onApplicationSuccess,
}: ApplyODPermissionModalProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Primary Selection
  const [appType, setAppType] = useState<ApplicationType>('Technical Hackathon / Competition OD')

  // Date State
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Common Details
  const [eventName, setEventName] = useState('')
  const [organizer, setOrganizer] = useState('')
  const [eventMode, setEventMode] = useState<'In-Person' | 'Online / Virtual' | 'Hybrid'>('In-Person')
  const [reason, setReason] = useState('')

  // Team Details (For Hackathons / Presentations)
  const [isTeam, setIsTeam] = useState(true)
  const [teamName, setTeamName] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: userName, registerNumber: student.registerNumber },
  ])

  // Project / Internship Details
  const [projectTitle, setProjectTitle] = useState('')
  const [domain, setDomain] = useState('Artificial Intelligence & Machine Learning')
  const [companyGuide, setCompanyGuide] = useState('')

  // Medical / Personal Details
  const [doctorName, setDoctorName] = useState('')
  const [parentContact, setParentContact] = useState('')

  // File Proof States (Base64 + File Name)
  const [brochureFile, setBrochureFile] = useState<string | null>(null)
  const [brochureName, setBrochureName] = useState('')

  const [registrationProof, setRegistrationProof] = useState<string | null>(null)
  const [registrationProofName, setRegistrationProofName] = useState('')

  const [abstractOrLetter, setAbstractOrLetter] = useState<string | null>(null)
  const [abstractOrLetterName, setAbstractOrLetterName] = useState('')

  if (!isOpen) return null

  // Calculate Total Days
  const calculateDays = () => {
    if (!fromDate || !toDate) return 1
    const start = new Date(fromDate)
    const end = new Date(toDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays > 0 ? diffDays : 1
  }

  // Handle File Upload to Base64
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (data: string | null) => void,
    setName: (name: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.')
      return
    }

    setName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setFile(reader.result as string)
      toast.success(`Attached: ${file.name}`)
    }
    reader.readAsDataURL(file)
  }

  // Add / Remove Team Member
  const addTeamMember = () => {
    if (teamMembers.length >= 6) {
      toast.error('Maximum 6 members per team.')
      return
    }
    setTeamMembers([...teamMembers, { name: '', registerNumber: '' }])
  }

  const removeTeamMember = (index: number) => {
    if (teamMembers.length <= 1) return
    const updated = teamMembers.filter((_, i) => i !== index)
    setTeamMembers(updated)
  }

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  // Submit Application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fromDate || !toDate) {
      toast.error('Please select both From and To dates.')
      return
    }

    // Validation based on type
    if (appType === 'Technical Hackathon / Competition OD' || appType === 'Paper Presentation / Conference OD') {
      if (!eventName.trim() || !organizer.trim()) {
        toast.error('Please enter the event name and organizing college.')
        return
      }
      if (!brochureFile && !registrationProof) {
        toast.error('Please attach at least one proof (Brochure, Poster, or Registration Screenshot).')
        return
      }
    } else if (appType === 'Industry Internship / Project Work OD') {
      if (!organizer.trim() || !projectTitle.trim()) {
        toast.error('Please enter the company name and project title.')
        return
      }
    } else if (appType === 'Medical Leave (ML)') {
      if (!doctorName.trim() || !parentContact.trim()) {
        toast.error('Doctor/Hospital name and parent contact are required for Medical Leave.')
        return
      }
    }

    setLoading(true)
    try {
      const payload = {
        studentName: userName,
        registerNumber: student.registerNumber,
        year: student.year,
        semester: student.semester,
        section: student.section,
        applicationType: appType,
        fromDate,
        toDate,
        totalDays: calculateDays(),
        eventName: eventName.trim(),
        organizer: organizer.trim(),
        eventMode,
        teamName: isTeam ? teamName.trim() : '',
        teamMembers: isTeam ? teamMembers : [],
        projectTitle: projectTitle.trim(),
        domain,
        companyGuide: companyGuide.trim(),
        doctorName: doctorName.trim(),
        parentContact: parentContact.trim(),
        reason: reason.trim(),
        brochureFile,
        brochureName,
        registrationProof,
        registrationProofName,
        abstractOrLetter,
        abstractOrLetterName,
      }

      const res = await fetch('/api/od-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSubmitted(true)
        toast.success('Permission request submitted with all proofs!')
        if (onApplicationSuccess) onApplicationSuccess(data.application)
      } else {
        toast.error(data.message || 'Failed to submit application.')
      }
    } catch {
      toast.error('Network error submitting OD application.')
    } finally {
      setLoading(false)
    }
  }

  const resetAndClose = () => {
    setSubmitted(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#071126]/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Ambient background glows */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-[#1455D9]/30 to-[#E7B93E]/20 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[450px] h-[450px] bg-gradient-to-bl from-[#22C7E8]/20 to-[#1455D9]/25 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative bg-white/95 backdrop-blur-2xl rounded-[32px] max-w-2xl w-full shadow-[0_25px_80px_rgba(7,26,61,0.4)] border border-white/60 overflow-hidden my-auto animate-fade-in transition-all max-h-[92vh] flex flex-col">
        {/* Luxury Shimmer Bar */}
        <div className="h-2 bg-gradient-to-r from-[#1455D9] via-[#E7B93E] to-[#22C7E8] shrink-0" />

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-4 sm:px-8 border-b border-gray-100 bg-gradient-to-b from-slate-50/80 to-transparent flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-[#E7B93E] via-[#FFF3B8] to-[#B8860B] shadow-[0_0_15px_rgba(231,185,62,0.4)]">
              <div className="w-10 h-10 rounded-[14px] bg-[#071A3D] p-1 flex items-center justify-center overflow-hidden">
                <Image
                  src="/college-emblem.png"
                  alt="V.S.B. Crest"
                  width={34}
                  height={34}
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(231,185,62,0.8)]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-wider text-[#1455D9] uppercase">
                  INSTITUTIONAL PERMISSION SYSTEM
                </span>
                <span className="w-1 h-1 rounded-full bg-[#E7B93E]" />
                <span className="text-[10px] font-bold text-amber-600 uppercase">
                  AI &amp; DS
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#071A3D] tracking-tight">
                Apply for On-Duty (OD) / Leave with Proofs
              </h2>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
          {submitted ? (
            <div className="py-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25 border border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Request Dispatched with Proofs</span>
                </div>
                <h3 className="text-xl font-black text-[#071A3D]">Application Submitted Successfully</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Your <span className="font-bold text-[#1455D9]">{appType}</span> request has been routed to your Class Advisor and the Head of Department for digital review.
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-xs max-w-md mx-auto divide-y divide-gray-100 text-left">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Applicant:</span>
                  <span className="font-bold text-gray-900">{userName} ({student.registerNumber})</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-bold text-[#1455D9]">{fromDate} to {toDate} ({calculateDays()} Day/s)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Event / Organization:</span>
                  <span className="font-bold text-gray-900">{eventName || organizer || projectTitle || 'Academic'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Attached Proofs:</span>
                  <span className="font-bold text-emerald-700">
                    {[brochureName, registrationProofName, abstractOrLetterName].filter(Boolean).length} Document(s) Attached
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAndClose}
                className="px-8 py-3.5 bg-gradient-to-r from-[#1455D9] to-[#0E44B8] text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-600/25 transition-all active:scale-[0.98]"
              >
                Close &amp; View Attendance Log
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* STEP 1: Select Application Type */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#071A3D] mb-2 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#E7B93E]" />
                  <span>Select Application Type</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    [
                      {
                        type: 'Technical Hackathon / Competition OD',
                        label: '🏆 Hackathon / Competition OD',
                        desc: 'Hackathons, coding contests, technical challenges',
                      },
                      {
                        type: 'Paper Presentation / Conference OD',
                        label: '📄 Conference / Symposium OD',
                        desc: 'Research paper presentation, poster presentations',
                      },
                      {
                        type: 'Industry Internship / Project Work OD',
                        label: '💼 Internship / Project OD',
                        desc: 'Corporate internship, off-campus live project',
                      },
                      {
                        type: 'Sports / Cultural Event OD',
                        label: '🏅 Sports / Cultural OD',
                        desc: 'Zonal tournaments, state/national sports, fests',
                      },
                      {
                        type: 'Medical Leave (ML)',
                        label: '🏥 Medical Leave (ML)',
                        desc: 'Illness, hospitalization, recovery leave',
                      },
                      {
                        type: 'Personal / Emergency Leave',
                        label: '🏠 Personal / Family Leave',
                        desc: 'Emergency leave, family function permission',
                      },
                    ] as const
                  ).map((item) => {
                    const isSelected = appType === item.type
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setAppType(item.type)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 border-[#1455D9] shadow-md shadow-blue-500/10 ring-2 ring-[#1455D9]/20'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="font-extrabold text-xs text-[#071A3D]">{item.label}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* STEP 2: Date Range */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1455D9]" />
                    <span>Permission Date Duration</span>
                  </span>
                  {fromDate && toDate && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1455D9] text-[11px] font-black">
                      Total: {calculateDays()} Day(s)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">From Date *</label>
                    <input
                      type="date"
                      required
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#1455D9] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">To Date *</label>
                    <input
                      type="date"
                      required
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#1455D9] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: Contextual Dynamic Fields */}
              {/* === HACKATHONS / COMPETITIONS === */}
              {appType === 'Technical Hackathon / Competition OD' && (
                <div className="space-y-3 p-4 rounded-2xl border border-blue-100 bg-blue-50/30">
                  <div className="text-xs font-black text-[#1455D9] uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    <span>Hackathon / Competition Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Hackathon / Contest Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="e.g. Smart India Hackathon / Hack-AI 2026"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:border-[#1455D9] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Organizing College / University *
                      </label>
                      <input
                        type="text"
                        required
                        value={organizer}
                        onChange={(e) => setOrganizer(e.target.value)}
                        placeholder="e.g. IIT Madras / Anna University"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:border-[#1455D9] bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-gray-700">Participation Type</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsTeam(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          !isTeam ? 'bg-[#1455D9] text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Solo
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsTeam(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isTeam ? 'bg-[#1455D9] text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Team ({teamMembers.length})
                      </button>
                    </div>
                  </div>

                  {isTeam && (
                    <div className="space-y-2.5 pt-2 border-t border-blue-100">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Team Name</label>
                        <input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. Team Neural Hackers"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium bg-white focus:outline-none focus:border-[#1455D9]"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-600">Team Members</span>
                          <button
                            type="button"
                            onClick={addTeamMember}
                            className="text-[11px] font-extrabold text-[#1455D9] hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Member
                          </button>
                        </div>

                        {teamMembers.map((member, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              placeholder="Member Name"
                              value={member.name}
                              onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#1455D9]"
                            />
                            <input
                              type="text"
                              required
                              placeholder="Register No"
                              value={member.registerNumber}
                              onChange={(e) => updateTeamMember(idx, 'registerNumber', e.target.value)}
                              className="w-36 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono uppercase bg-white focus:outline-none focus:border-[#1455D9]"
                            />
                            {teamMembers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTeamMember(idx)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === CONFERENCE / PAPER PRESENTATION === */}
              {appType === 'Paper Presentation / Conference OD' && (
                <div className="space-y-3 p-4 rounded-2xl border border-purple-100 bg-purple-50/30">
                  <div className="text-xs font-black text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Conference / Research Paper Details</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Conference / Symposium Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="e.g. IEEE International Conference on AI Innovations"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Host Institution *
                      </label>
                      <input
                        type="text"
                        required
                        value={organizer}
                        onChange={(e) => setOrganizer(e.target.value)}
                        placeholder="e.g. NIT Trichy"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Research Paper Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="e.g. Deep Learning in Early Disease Diagnosis"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* === INTERNSHIP / PROJECT WORK === */}
              {appType === 'Industry Internship / Project Work OD' && (
                <div className="space-y-3 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30">
                  <div className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    <span>Company &amp; Project Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Company / Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={organizer}
                        onChange={(e) => setOrganizer(e.target.value)}
                        placeholder="e.g. Zoho Corp / Infosys / TCS"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Project / Role Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="e.g. AI Research Intern"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Company Supervisor / Mentor Contact
                    </label>
                    <input
                      type="text"
                      value={companyGuide}
                      onChange={(e) => setCompanyGuide(e.target.value)}
                      placeholder="Mentor Name & Contact Email/Phone"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* === MEDICAL LEAVE === */}
              {appType === 'Medical Leave (ML)' && (
                <div className="space-y-3 p-4 rounded-2xl border border-red-100 bg-red-50/30">
                  <div className="text-xs font-black text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4" />
                    <span>Medical Leave Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Doctor / Hospital Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        placeholder="e.g. Dr. K. Ramesh (City Hospital)"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Parent Emergency Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={parentContact}
                        onChange={(e) => setParentContact(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Proof Attachments (Brochure, Registration Screenshot, Letter) */}
              <div className="space-y-3 p-4 rounded-2xl border border-amber-200 bg-amber-50/40">
                <div className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-amber-700" />
                    <span>Attach Official Proofs &amp; Documents</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    Required for Approval
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Proof 1: Brochure / Event Poster */}
                  <div className="p-3 bg-white rounded-xl border border-dashed border-gray-300 hover:border-[#1455D9] transition-all">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      📄 College Brochure / Event Poster
                    </label>
                    {brochureFile ? (
                      <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg text-xs">
                        <span className="truncate font-bold text-[#1455D9] text-[11px]">{brochureName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setBrochureFile(null)
                            setBrochureName('')
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-600">Upload Brochure / Poster</span>
                        <span className="text-[9px] text-gray-400">PNG, JPG, PDF up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setBrochureFile, setBrochureName)}
                        />
                      </label>
                    )}
                  </div>

                  {/* Proof 2: Registration Screenshot / Acceptance */}
                  <div className="p-3 bg-white rounded-xl border border-dashed border-gray-300 hover:border-[#1455D9] transition-all">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      🎟️ Registration Screenshot / Ticket
                    </label>
                    {registrationProof ? (
                      <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg text-xs">
                        <span className="truncate font-bold text-[#1455D9] text-[11px]">{registrationProofName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRegistrationProof(null)
                            setRegistrationProofName('')
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-600">Upload Register Screenshot</span>
                        <span className="text-[9px] text-gray-400">PNG, JPG, PDF up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setRegistrationProof, setRegistrationProofName)}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Proof 3: Offer Letter / Medical Certificate / Abstract (Optional) */}
                <div className="p-3 bg-white rounded-xl border border-dashed border-gray-300 hover:border-[#1455D9] transition-all">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    📑 Additional Letter / Medical Certificate / Abstract (Optional)
                  </label>
                  {abstractOrLetter ? (
                    <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg text-xs">
                      <span className="truncate font-bold text-[#1455D9] text-[11px]">{abstractOrLetterName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAbstractOrLetter(null)
                          setAbstractOrLetterName('')
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-600">Attach Document / Letter</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setAbstractOrLetter, setAbstractOrLetterName)}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* STEP 5: Reason & Statement */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason &amp; Academic Explanation <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain event agenda, expected outcomes, or why leave is requested..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium bg-white focus:outline-none focus:border-[#1455D9] resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#1455D9] via-[#0E44B8] to-[#1455D9] hover:from-[#1044b5] hover:to-[#0c399c] active:scale-[0.99] disabled:opacity-60 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-blue-600/25 border border-blue-400/30 transition-all cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-[#F4C430]" />}
                  <span>Submit Permission Application</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
