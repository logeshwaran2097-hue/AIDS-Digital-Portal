'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Bell,
  Moon,
  Sun,
  Shield,
  Smartphone,
  Download,
  CheckCircle2,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Users,
  BookOpen,
  Clock,
  FileText,
  Check,
  Award,
  Building,
  Phone,
  Sliders,
  Calendar,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'
import { toast } from '@/components/ui/Toast'

interface FacultySettingsViewProps {
  userName?: string
  userEmail?: string
  userPhone?: string
  facultyId?: string
  designation?: string
  qualification?: string
  experience?: number
  specialization?: string
  isAdvisor?: boolean
  advisorBatch?: string
  advisorYear?: number
  advisorSem?: number
  advisorSec?: string
  facultyType?: string
  studentCount?: number
  lastLogin?: string | null
}

export function FacultySettingsView({
  userName = 'Faculty Member',
  userEmail = '',
  userPhone = '',
  facultyId = 'FACULTY',
  designation = 'Faculty',
  qualification = '',
  experience = 0,
  specialization = '',
  isAdvisor = false,
  advisorBatch = 'Year II - Sem 3 - Sec A',
  advisorYear = 2,
  advisorSem = 3,
  advisorSec = 'A',
  facultyType = 'advisor',
  studentCount = 0,
  lastLogin = null,
}: FacultySettingsViewProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'advisory' | 'notifications' | 'security' | 'profile' | 'appearance'
  >(isAdvisor ? 'advisory' : 'security')

  // Theme & Appearance
  const [theme, setTheme] = useState<'light' | 'midnight'>('light')

  // 1. Advisor Cohort Policies State
  const [minAttendanceCutoff, setMinAttendanceCutoff] = useState('75')
  const [consecutiveAbsentDays, setConsecutiveAbsentDays] = useState('2')
  const [autoDefaulterAlert, setAutoDefaulterAlert] = useState(true)
  const [attendanceCutoffTime, setAttendanceCutoffTime] = useState('09:30 AM')

  // OD (On-Duty) & Leave Workflow
  const [requireOdProof, setRequireOdProof] = useState(true)
  const [maxOdDays, setMaxOdDays] = useState('3')
  const [instantOdPush, setInstantOdPush] = useState(true)
  const [parentSmsOnOd, setParentSmsOnOd] = useState(true)
  const [autoApproveInternalEvents, setAutoApproveInternalEvents] = useState(false)

  // Academic Health & Mentoring
  const [lowCgpaThreshold, setLowCgpaThreshold] = useState('7.00')
  const [autoRetestReminder, setAutoRetestReminder] = useState(true)
  const [parentMeetingPrompt, setParentMeetingPrompt] = useState(true)

  // Mentoring & Consultation Slots
  const [cabinLocation, setCabinLocation] = useState('AI & DS Dept · Staff Room 2, Desk #4')
  const [mentoringHours, setMentoringHours] = useState('Tuesday & Thursday · 03:30 PM - 04:30 PM')
  const [allowStudentBooking, setAllowStudentBooking] = useState(true)

  // 2. Notification Channels State
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [morningAttendanceReminder, setMorningAttendanceReminder] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [parentNoticeCopy, setParentNoticeCopy] = useState(true)

  // 3. Security & Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 4. Profile Details State
  const [phone, setPhone] = useState(userPhone)
  const [specialty, setSpecialty] = useState(specialization)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false)

  const [isSyncingRealtime, setIsSyncingRealtime] = useState(false)
  const isLoadedRef = React.useRef(false)

  // Real-time Auto-Save to Database & LocalStorage whenever any field changes
  const savePreferencesToBackend = React.useCallback(async (updatedPrefs: any) => {
    try {
      setIsSyncingRealtime(true)
      const storageKey = `advisor_pref_${facultyId}`
      localStorage.setItem(storageKey, JSON.stringify(updatedPrefs))

      await fetch('/api/faculty/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_PREFERENCES',
          preferences: updatedPrefs,
        }),
      })
    } catch (err) {
      console.error('Error auto-syncing settings in real time:', err)
    } finally {
      setTimeout(() => setIsSyncingRealtime(false), 600)
    }
  }, [facultyId])

  // Load from API (DB) first, fallback to localStorage
  useEffect(() => {
    const loadSettings = async () => {
      const savedTheme = localStorage.getItem('vsb-portal-theme')
      if (savedTheme === 'midnight') {
        setTheme('midnight')
      }

      let parsed: any = null
      try {
        const res = await fetch('/api/faculty/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.preferences && Object.keys(data.preferences).length > 0) {
            parsed = data.preferences
          }
        }
      } catch {}

      if (!parsed) {
        const storageKey = `advisor_pref_${facultyId}`
        const local = localStorage.getItem(storageKey)
        if (local) {
          try {
            parsed = JSON.parse(local)
          } catch {}
        }
      }

      if (parsed) {
        if (parsed.minAttendanceCutoff) setMinAttendanceCutoff(parsed.minAttendanceCutoff)
        if (parsed.consecutiveAbsentDays) setConsecutiveAbsentDays(parsed.consecutiveAbsentDays)
        if (parsed.autoDefaulterAlert !== undefined) setAutoDefaulterAlert(parsed.autoDefaulterAlert)
        if (parsed.attendanceCutoffTime) setAttendanceCutoffTime(parsed.attendanceCutoffTime)
        if (parsed.requireOdProof !== undefined) setRequireOdProof(parsed.requireOdProof)
        if (parsed.maxOdDays) setMaxOdDays(parsed.maxOdDays)
        if (parsed.instantOdPush !== undefined) setInstantOdPush(parsed.instantOdPush)
        if (parsed.parentSmsOnOd !== undefined) setParentSmsOnOd(parsed.parentSmsOnOd)
        if (parsed.autoApproveInternalEvents !== undefined) setAutoApproveInternalEvents(parsed.autoApproveInternalEvents)
        if (parsed.lowCgpaThreshold) setLowCgpaThreshold(parsed.lowCgpaThreshold)
        if (parsed.autoRetestReminder !== undefined) setAutoRetestReminder(parsed.autoRetestReminder)
        if (parsed.parentMeetingPrompt !== undefined) setParentMeetingPrompt(parsed.parentMeetingPrompt)
        if (parsed.cabinLocation) setCabinLocation(parsed.cabinLocation)
        if (parsed.mentoringHours) setMentoringHours(parsed.mentoringHours)
        if (parsed.allowStudentBooking !== undefined) setAllowStudentBooking(parsed.allowStudentBooking)
        if (parsed.emailAlerts !== undefined) setEmailAlerts(parsed.emailAlerts)
        if (parsed.smsAlerts !== undefined) setSmsAlerts(parsed.smsAlerts)
        if (parsed.morningAttendanceReminder !== undefined) setMorningAttendanceReminder(parsed.morningAttendanceReminder)
        if (parsed.weeklyDigest !== undefined) setWeeklyDigest(parsed.weeklyDigest)
        if (parsed.parentNoticeCopy !== undefined) setParentNoticeCopy(parsed.parentNoticeCopy)
      }
      isLoadedRef.current = true
    }

    loadSettings()
  }, [facultyId])

  // Trigger Real-Time Auto Save when state values change after initial load
  useEffect(() => {
    if (!isLoadedRef.current) return

    const payload = {
      minAttendanceCutoff,
      consecutiveAbsentDays,
      autoDefaulterAlert,
      attendanceCutoffTime,
      requireOdProof,
      maxOdDays,
      instantOdPush,
      parentSmsOnOd,
      autoApproveInternalEvents,
      lowCgpaThreshold,
      autoRetestReminder,
      parentMeetingPrompt,
      cabinLocation,
      mentoringHours,
      allowStudentBooking,
      emailAlerts,
      smsAlerts,
      morningAttendanceReminder,
      weeklyDigest,
      parentNoticeCopy,
    }

    const timer = setTimeout(() => {
      savePreferencesToBackend(payload)
    }, 400)

    return () => clearTimeout(timer)
  }, [
    minAttendanceCutoff,
    consecutiveAbsentDays,
    autoDefaulterAlert,
    attendanceCutoffTime,
    requireOdProof,
    maxOdDays,
    instantOdPush,
    parentSmsOnOd,
    autoApproveInternalEvents,
    lowCgpaThreshold,
    autoRetestReminder,
    parentMeetingPrompt,
    cabinLocation,
    mentoringHours,
    allowStudentBooking,
    emailAlerts,
    smsAlerts,
    morningAttendanceReminder,
    weeklyDigest,
    parentNoticeCopy,
    savePreferencesToBackend,
  ])

  // Toggle Theme
  const handleToggleTheme = (newTheme: 'light' | 'midnight') => {
    setTheme(newTheme)
    localStorage.setItem('vsb-portal-theme', newTheme)
    if (newTheme === 'midnight') {
      document.documentElement.classList.add('midnight')
    } else {
      document.documentElement.classList.remove('midnight')
    }
  }

  // Manual Save Advisor Preferences button
  const handleSaveAdvisorPreferences = async () => {
    const payload = {
      minAttendanceCutoff,
      consecutiveAbsentDays,
      autoDefaulterAlert,
      attendanceCutoffTime,
      requireOdProof,
      maxOdDays,
      instantOdPush,
      parentSmsOnOd,
      autoApproveInternalEvents,
      lowCgpaThreshold,
      autoRetestReminder,
      parentMeetingPrompt,
      cabinLocation,
      mentoringHours,
      allowStudentBooking,
      emailAlerts,
      smsAlerts,
      morningAttendanceReminder,
      weeklyDigest,
      parentNoticeCopy,
    }
    await savePreferencesToBackend(payload)
    setSaveSuccessBanner(true)
    toast.success('Advisor settings and policy thresholds saved in real time!')
    setTimeout(() => setSaveSuccessBanner(false), 3000)
  }

  // Handle Real-Time Password Update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all password fields.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const res = await fetch('/api/faculty/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHANGE_PASSWORD',
          currentPassword,
          newPassword,
        }),
      })

      const result = await res.json()
      if (res.ok && result.success) {
        setPasswordMessage({
          type: 'success',
          text: 'Password updated and encrypted successfully! Please use this password on your next login.',
        })
        toast.success('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMessage({ type: 'error', text: result.message || 'Failed to update password.' })
        toast.error(result.message || 'Failed to update password.')
      }
    } catch (err) {
      console.error(err)
      setPasswordMessage({ type: 'error', text: 'Network error updating password. Please try again.' })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      const res = await fetch('/api/faculty/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PROFILE',
          phone,
          specialization: specialty,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        handleSaveAdvisorPreferences()
        toast.success('Profile details and contact saved!')
      } else {
        toast.error(result.message || 'Failed to save profile.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error saving profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Generate Comprehensive PDF Dossier
  const handleDownloadAcademicPortfolio = () => {
    generateAndDownloadPDF({
      title: 'CLASS ADVISOR & FACULTY ADMINISTRATIVE DOSSIER',
      subtitle: `${userName} · Department of AI & DS · V.S.B. Engineering College`,
      author: `${userName} (${designation})`,
      category: 'Advisor Dossier & Cohort Policies',
      sections: [
        {
          heading: '1. FACULTY CREDENTIALS & APPOINTMENT PARTICULARS',
          body: [
            `Faculty Name: ${userName}`,
            `Faculty ID: ${facultyId}`,
            `Designation: ${designation}`,
            `Faculty Type: ${facultyType === 'advisor' ? 'Class Advisor & Faculty' : facultyType}`,
            `Department: Department of Artificial Intelligence & Data Science`,
            `Contact Phone: ${phone || 'Not Registered'} | Email: ${userEmail || 'Institutional'}`,
            `Cabin Location: ${cabinLocation}`,
          ],
        },
        {
          heading: '2. CLASS ADVISOR JURISDICTION & ASSIGNED COHORT',
          body: [
            `Assigned Cohort Batch: ${advisorBatch}`,
            `Year of Study: Year ${advisorYear} | Semester: Semester ${advisorSem} | Section: Section ${advisorSec}`,
            `Registered Students Under Mentorship: ${studentCount} Students`,
            `Mentoring Consultation Slot: ${mentoringHours}`,
          ],
        },
        {
          heading: '3. ADVISORY POLICY & CUTOFF THRESHOLDS',
          body: [
            `Attendance Defaulter Warning Cutoff: ${minAttendanceCutoff}% (Statutory threshold)`,
            `Consecutive Absence Alert Trigger: ${consecutiveAbsentDays} Days`,
            `Daily Morning Attendance Logging Cutoff: ${attendanceCutoffTime}`,
            `OD Document Proof Requirement: ${requireOdProof ? 'Mandatory (Brochure / Registration Upload)' : 'Optional'}`,
            `Maximum Continuous OD Allowed Before HOD Escalation: ${maxOdDays} Days`,
            `Parent SMS on OD Approval: ${parentSmsOnOd ? 'Enabled' : 'Disabled'}`,
          ],
        },
      ],
      fileName: `${userName.replace(/\s+/g, '_')}_Advisor_Dossier`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Award className="w-3 h-3 text-[#071A3D]" />
              {isAdvisor ? 'Class Advisor Directorate' : 'Faculty Preferences'}
            </span>
            {isAdvisor && (
              <span className="px-3 py-1 rounded-full bg-[#22C7E8]/20 border border-[#22C7E8]/40 text-[#22C7E8] text-[10px] font-bold">
                Batch: {advisorBatch}
              </span>
            )}
            <span className="text-xs text-gray-300 font-medium">· Department of AI &amp; DS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isAdvisor ? 'Class Advisor & Portal Settings' : 'Portal Settings & Preferences'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
            {userName} ({designation}) · Configure class advisory thresholds, student OD approval workflows, alert triggers, theme &amp; password credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          {/* Live Real-time Sync Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/20 backdrop-blur-xs border border-white/10 text-[11px] font-bold">
            <span
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                isSyncingRealtime
                  ? 'bg-amber-400 animate-ping ring-2 ring-amber-300'
                  : 'bg-emerald-400 ring-2 ring-emerald-300'
              )}
            />
            <span className={isSyncingRealtime ? 'text-amber-300' : 'text-emerald-300'}>
              {isSyncingRealtime ? 'Syncing...' : 'Real-time Sync Active'}
            </span>
          </div>

          <button
            onClick={handleDownloadAcademicPortfolio}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            title="Download complete PDF dossier"
          >
            <Download className="w-4 h-4 text-[#F4C430]" /> Export Dossier (PDF)
          </button>
          <button
            onClick={handleSaveAdvisorPreferences}
            className="px-5 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Class advisor policies, alert rules, and preferences saved successfully!</span>
          </div>
          <button onClick={() => setSaveSuccessBanner(false)} className="text-emerald-600 hover:underline text-[11px] font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        {isAdvisor && (
          <button
            onClick={() => setActiveTab('advisory')}
            className={cn(
              'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'advisory'
                ? 'bg-[#1455D9] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#071A3D] hover:bg-gray-50'
            )}
          >
            <Sliders className="w-4 h-4" />
            <span>Class Advisory Policies</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#071A3D] text-[9px] font-black">
              ADVISOR
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('notifications')}
          className={cn(
            'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'notifications'
              ? 'bg-[#1455D9] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#071A3D] hover:bg-gray-50'
          )}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts &amp; Channels</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'security'
              ? 'bg-[#1455D9] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#071A3D] hover:bg-gray-50'
          )}
        >
          <Lock className="w-4 h-4" />
          <span>Security &amp; Password</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'profile'
              ? 'bg-[#1455D9] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#071A3D] hover:bg-gray-50'
          )}
        >
          <Building className="w-4 h-4" />
          <span>Profile &amp; Office Hours</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={cn(
            'px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'appearance'
              ? 'bg-[#1455D9] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#071A3D] hover:bg-gray-50'
          )}
        >
          <Moon className="w-4 h-4" />
          <span>Appearance</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CLASS ADVISORY POLICIES (ADVISOR SPECIFIC) */}
      {/* ========================================================================= */}
      {activeTab === 'advisory' && (
        <div className="space-y-6 animate-fade-in">
          {/* Assigned Class Cohort Card */}
          <Card className="rounded-3xl border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-white shadow-xs overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1455D9] block mb-0.5">
                    Official Mentorship Jurisdiction
                  </span>
                  <h2 className="text-lg font-black text-[#071A3D]">
                    Assigned Cohort: {advisorBatch}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Year {advisorYear} · Semester {advisorSem} · Section {advisorSec} · AI &amp; DS Dept
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 rounded-2xl bg-white border border-blue-200 shadow-xs text-center">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Enrolled</span>
                    <span className="text-base font-black text-[#1455D9]">{studentCount || 'All'}</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-600 font-bold block uppercase">Status</span>
                    <span className="text-xs font-black text-emerald-700">Active Advisor</span>
                  </div>
                </div>
              </div>

              {/* Quick Policy Notice */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1455D9] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Attendance Cutoff</span>
                  </div>
                  <p className="text-gray-600 text-[11px]">
                    Warn students below <strong>{minAttendanceCutoff}%</strong> attendance.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>OD Escalation Limit</span>
                  </div>
                  <p className="text-gray-600 text-[11px]">
                    OD requests &gt; <strong>{maxOdDays} days</strong> escalate to HOD.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Attendance Defaulter Monitoring Settings */}
          <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
            <CardContent className="p-6 space-y-5">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#071A3D] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1455D9]" /> Attendance Defaulter Thresholds &amp; Cutoffs
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tune early warning alerts for students approaching Anna University condonation limits.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Minimum Attendance Threshold */}
                <div className="space-y-2">
                  <label className="block font-bold text-xs text-[#071A3D]">
                    Minimum Required Attendance Percentage:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: '75', label: '75% Mandatory', desc: 'Statutory minimum' },
                      { val: '80', label: '80% Warning', desc: 'Recommended cutoff' },
                      { val: '85', label: '85% Strict', desc: 'Distinction cohort' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setMinAttendanceCutoff(item.val)}
                        className={cn(
                          'p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                          minAttendanceCutoff === item.val
                            ? 'border-[#1455D9] bg-blue-50/70 text-[#071A3D] shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        )}
                      >
                        <span className="font-black text-xs">{item.label}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Students whose attendance falls under {minAttendanceCutoff}% will be highlighted with red badges in the Class Advisor Registry.
                  </p>
                </div>

                {/* Daily Attendance Cutoff Time */}
                <div className="space-y-2">
                  <label className="block font-bold text-xs text-[#071A3D]">
                    Daily Morning Attendance Submission Cutoff:
                  </label>
                  <select
                    value={attendanceCutoffTime}
                    onChange={(e) => setAttendanceCutoffTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono text-xs font-bold text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="09:15 AM">09:15 AM (Before Period 1 Ends)</option>
                    <option value="09:30 AM">09:30 AM (Standard Institutional)</option>
                    <option value="10:00 AM">10:00 AM (Extended Window)</option>
                  </select>
                  <p className="text-[11px] text-gray-500">
                    System sends a push alert to the advisor if morning session attendance has not been recorded by this time.
                  </p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div>
                    <p className="font-bold text-xs text-[#071A3D]">Auto-Alert Students &amp; Mentors</p>
                    <p className="text-[11px] text-gray-500">
                      Dispatches in-app warning notification whenever overall attendance drops below {minAttendanceCutoff}%.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoDefaulterAlert}
                    onChange={(e) => setAutoDefaulterAlert(e.target.checked)}
                    className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div>
                    <p className="font-bold text-xs text-[#071A3D]">Flag Consecutive Absentees for Direct Counseling</p>
                    <p className="text-[11px] text-gray-500">
                      Flag students absent for 2 or more consecutive days without approved leave or OD.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consecutiveAbsentDays === '2'}
                    onChange={(e) => setConsecutiveAbsentDays(e.target.checked ? '2' : '3')}
                    className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. On-Duty (OD) & Leave Application Workflow */}
          <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
            <CardContent className="p-6 space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-bold text-base text-[#071A3D] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1455D9]" /> On-Duty (OD) &amp; Leave Approval Workflow
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Define requirements for symposium, hackathon, sports, and medical OD requests.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block font-bold text-xs text-[#071A3D]">
                    Maximum OD Duration Approved Solely by Advisor:
                  </label>
                  <select
                    value={maxOdDays}
                    onChange={(e) => setMaxOdDays(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono text-xs font-bold text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                  >
                    <option value="2">2 Days (Standard Advisory Discretion)</option>
                    <option value="3">3 Days (Recommended for Hackathons)</option>
                    <option value="5">5 Days (Extended External Competition)</option>
                  </select>
                  <p className="text-[11px] text-gray-500">
                    Requests exceeding {maxOdDays} continuous days will automatically mandate HOD countersign before final approval.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-xs text-[#071A3D]">
                    Internal College Technical Events:
                  </label>
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-gray-50/50">
                    <span className="text-xs text-gray-700 font-medium">Fast-track internal club/department ODs</span>
                    <input
                      type="checkbox"
                      checked={autoApproveInternalEvents}
                      onChange={(e) => setAutoApproveInternalEvents(e.target.checked)}
                      className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Skip secondary document re-verification for officially approved intra-college symposiums.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div>
                    <p className="font-bold text-xs text-[#071A3D]">Require Event Brochure / Registration Proof</p>
                    <p className="text-[11px] text-gray-500">
                      Students must attach certificate or event acceptance letter before the OD application can be submitted.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireOdProof}
                    onChange={(e) => setRequireOdProof(e.target.checked)}
                    className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div>
                    <p className="font-bold text-xs text-[#071A3D]">Parent SMS Notification on OD Approval</p>
                    <p className="text-[11px] text-gray-500">
                      Dispatches an automated SMS alert to parents whenever the advisor grants an OD approval.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={parentSmsOnOd}
                    onChange={(e) => setParentSmsOnOd(e.target.checked)}
                    className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div>
                    <p className="font-bold text-xs text-[#071A3D]">Instant Push Alert on New OD Submission</p>
                    <p className="text-[11px] text-gray-500">
                      Notify advisor on portal dashboard as soon as a student from this class submits a new application.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={instantOdPush}
                    onChange={(e) => setInstantOdPush(e.target.checked)}
                    className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Academic Health & Mentorship Settings */}
          <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
            <CardContent className="p-6 space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-bold text-base text-[#071A3D] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1455D9]" /> Academic Health &amp; Mentorship Controls
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Establish CGPA thresholds, office counseling hours, and arrear follow-up alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="block font-bold text-xs text-[#071A3D]">
                    Student 1-on-1 Counseling Appointments:
                  </label>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50">
                    <div>
                      <p className="text-xs font-bold text-gray-700">Allow students to book mentoring slots</p>
                      <p className="text-[11px] text-gray-500">Students in your assigned cohort can request one-on-one academic consultation sessions.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowStudentBooking}
                      onChange={(e) => setAllowStudentBooking(e.target.checked)}
                      className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-xs text-[#071A3D] mb-1">
                    Advisor Office / Cabin Location:
                  </label>
                  <input
                    type="text"
                    value={cabinLocation}
                    onChange={(e) => setCabinLocation(e.target.value)}
                    placeholder="e.g. AI & DS Dept, Staff Room 2, Desk 4"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-xs text-[#071A3D] mb-1">
                    Weekly Mentoring Consultation Hours:
                  </label>
                  <input
                    type="text"
                    value={mentoringHours}
                    onChange={(e) => setMentoringHours(e.target.value)}
                    placeholder="e.g. Tuesday & Thursday, 03:30 PM - 04:30 PM"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1455D9] font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAdvisorPreferences}
                  className="px-6 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Advisory Policies
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NOTIFICATIONS & COMMUNICATION CHANNELS */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white animate-fade-in">
          <CardContent className="p-6 space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-[#071A3D] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1455D9]" /> Alert &amp; Communication Channels
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Control how and when you receive automated notifications</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div>
                  <p className="font-bold text-xs text-[#071A3D]">Student On-Duty (OD) Instant Push</p>
                  <p className="text-[11px] text-gray-500">Alerts when students in your assigned class submit OD forms</p>
                </div>
                <input
                  type="checkbox"
                  checked={instantOdPush}
                  onChange={(e) => setInstantOdPush(e.target.checked)}
                  className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div>
                  <p className="font-bold text-xs text-[#071A3D]">Daily Class Attendance Reminders</p>
                  <p className="text-[11px] text-gray-500">Receive morning notification at 09:15 AM if class attendance is pending</p>
                </div>
                <input
                  type="checkbox"
                  checked={morningAttendanceReminder}
                  onChange={(e) => setMorningAttendanceReminder(e.target.checked)}
                  className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div>
                  <p className="font-bold text-xs text-[#071A3D]">Email Notifications</p>
                  <p className="text-[11px] text-gray-500">Receive exam schedules, committee agendas, and HOD circulars via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div>
                  <p className="font-bold text-xs text-[#071A3D]">SMS Emergency Broadcasts</p>
                  <p className="text-[11px] text-gray-500">Urgent college holiday, government directives, and emergency council notices</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div>
                  <p className="font-bold text-xs text-[#071A3D]">Weekly Cohort Summary Digest</p>
                  <p className="text-[11px] text-gray-500">Automated Friday evening digest of class attendance averages and OD metrics</p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="w-4 h-4 accent-[#1455D9] cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveAdvisorPreferences}
                className="px-6 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Notification Preferences
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SECURITY & PASSWORD MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fade-in">
          {/* Change Password Card */}
          <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
            <CardContent className="p-6 space-y-5">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#071A3D] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#1455D9]" /> Change Advisor / Faculty Password
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Update your temporary password set by the admin to a permanent, secure personal password.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1455D9] text-[10px] font-bold border border-blue-200">
                  Bcrypt Secured
                </span>
              </div>

              {passwordMessage && (
                <div
                  className={cn(
                    'p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2',
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  )}
                >
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                {/* Current Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-xs text-[#071A3D]">Current / Temporary Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-[11px] text-[#1455D9] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current or temporary password"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono text-xs"
                  />
                </div>

                {/* New Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-xs text-[#071A3D]">New Permanent Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-[11px] text-[#1455D9] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono text-xs"
                  />
                  {newPassword && (
                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      <span className="text-gray-400">Strength:</span>
                      <span
                        className={cn(
                          'font-bold',
                          newPassword.length >= 8 ? 'text-emerald-600' : 'text-amber-600'
                        )}
                      >
                        {newPassword.length >= 8 ? 'Strong' : 'Moderate (8+ chars recommended)'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-xs text-[#071A3D]">Confirm New Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[11px] text-[#1455D9] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9] font-mono text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-6 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    {isUpdatingPassword ? (
                      'Securing...'
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Update &amp; Secure Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Security Overview */}
          <Card className="rounded-3xl border-gray-200 shadow-xs bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-base text-[#071A3D] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#1455D9]" /> Account &amp; Session Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Institutional ID</span>
                  <span className="font-mono font-bold text-[#071A3D] mt-0.5 block">{facultyId}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Registered Email</span>
                  <span className="font-bold text-[#071A3D] mt-0.5 block truncate">{userEmail}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Last Authenticated</span>
                  <span className="font-bold text-gray-700 mt-0.5 block truncate">
                    {lastLogin ? new Date(lastLogin).toLocaleDateString() : 'Active Session'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROFILE & OFFICE HOURS */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white animate-fade-in">
          <CardContent className="p-6 space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#071A3D] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#1455D9]" /> Advisor Profile &amp; Contact Particulars
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your contact phone, academic specialization, and student consultation cabin.
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={userName}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-bold"
                />
                <p className="text-[10px] text-gray-400 mt-1">Managed by Department Administrator.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Institutional Email</label>
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Phone / Mobile Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 98421 12345"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Used for emergency broadcasts and parent inquiries.</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A3D] mb-1">Academic Specialization / Domain</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Data Science, Deep Learning, NLP"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Advisor Office Cabin / Desk</label>
                  <input
                    type="text"
                    value={cabinLocation}
                    onChange={(e) => setCabinLocation(e.target.value)}
                    placeholder="e.g. AI & DS Staff Room 2, Desk #4"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#071A3D] mb-1">Weekly Mentoring Availability</label>
                  <input
                    type="text"
                    value={mentoringHours}
                    onChange={(e) => setMentoringHours(e.target.value)}
                    placeholder="e.g. Tuesday & Thursday · 03:30 PM - 04:30 PM"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1455D9]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0e44b5] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingProfile ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile &amp; Office Hours
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: THEME & VISUAL APPEARANCE */}
      {/* ========================================================================= */}
      {activeTab === 'appearance' && (
        <Card className="rounded-3xl border-gray-200 shadow-xs bg-white animate-fade-in">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base text-[#071A3D] flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#1455D9]" /> Theme &amp; Visual Appearance
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Choose your preferred workspace aesthetic</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleToggleTheme('light')}
                className={cn(
                  'p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3',
                  theme === 'light'
                    ? 'border-[#1455D9] bg-blue-50/50 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-amber-500 shadow-xs">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#071A3D]">Classic Light</p>
                  <p className="text-[10px] text-gray-400">Clean institutional theme</p>
                </div>
              </button>

              <button
                onClick={() => handleToggleTheme('midnight')}
                className={cn(
                  'p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3',
                  theme === 'midnight'
                    ? 'border-[#22C7E8] bg-[#071A3D] text-white shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[#071A3D] flex items-center justify-center text-[#22C7E8] shadow-xs">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className={cn('font-bold text-xs', theme === 'midnight' ? 'text-white' : 'text-[#071A3D]')}>
                    Midnight Navy
                  </p>
                  <p className="text-[10px] text-gray-400">Deep contrast night mode</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
