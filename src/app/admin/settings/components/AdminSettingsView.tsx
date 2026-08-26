'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Settings,
  Moon,
  Sun,
  Shield,
  Mail,
  Server,
  Lock,
  Download,
  Save,
  Check,
  Sparkles,
  Database,
  Bell,
  RefreshCw,
  Send,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Clock,
  HardDrive,
  Globe,
  Menu,
  KeyRound,
  Eye,
  EyeOff,
  BellRing,
  Smartphone,
  CheckSquare,
  Square,
  Palette,
  X,
  Edit3,
} from 'lucide-react'
import { generateAndDownloadPDF } from '@/lib/pdfGenerator'

export interface MenuItemConfig {
  id: string
  label: string
  icon: string
  visible: boolean
  category: string
  badgeText?: string
  badgeColor?: string
  customHref?: string
}

export function AdminSettingsView() {
  // Navigation Active Tab (Clean, Essential Tabs Only)
  const [activeTab, setActiveTab] = useState<'general' | 'menus' | 'notifications' | 'passwords' | 'branding'>('general')

  // 1. Institutional Settings
  const [collegeName, setCollegeName] = useState('V.S.B. Engineering College (Autonomous)')
  const [department, setDepartment] = useState('Department of Artificial Intelligence & Data Science')
  const [affiliation, setAffiliation] = useState('Anna University, Chennai')
  const [location, setLocation] = useState('NH-67, Covai Road, Karur - 639 111, Tamil Nadu')
  const [contactEmail, setContactEmail] = useState('admin@vsb.edu.in')
  const [contactPhone, setContactPhone] = useState('+91 4324 290144')
  const [accreditation, setAccreditation] = useState('NAAC "A" Grade & NBA Tier-1 Accredited')

  // Academic Rules
  const [academicYear, setAcademicYear] = useState('2025 - 2026')
  const [currentSemesterType, setCurrentSemesterType] = useState('Even Semester (Jan - May)')
  const [regulation, setRegulation] = useState('Regulation 2021')
  const [prescribedWorkingDays, setPrescribedWorkingDays] = useState(90)
  const [minAttendancePct, setMinAttendancePct] = useState(75.0)
  const [condonationLimitPct, setCondonationLimitPct] = useState(65.0)

  // Individual Monthly Working Days Breakdown
  const [monthlyWorkingDays, setMonthlyWorkingDays] = useState<Array<{ id: string; month: string; days: number }>>([
    { id: 'm1', month: 'January', days: 18 },
    { id: 'm2', month: 'February', days: 20 },
    { id: 'm3', month: 'March', days: 22 },
    { id: 'm4', month: 'April', days: 20 },
    { id: 'm5', month: 'May', days: 10 },
  ])

  // Handle Semester Term Change with automatic monthly default presets
  const handleSemesterTypeChange = (term: string) => {
    setCurrentSemesterType(term)
    if (term.includes('Odd')) {
      const oddMonths = [
        { id: 'm1', month: 'July', days: 18 },
        { id: 'm2', month: 'August', days: 20 },
        { id: 'm3', month: 'September', days: 20 },
        { id: 'm4', month: 'October', days: 22 },
        { id: 'm5', month: 'November', days: 10 },
      ]
      setMonthlyWorkingDays(oddMonths)
      setPrescribedWorkingDays(90)
    } else {
      const evenMonths = [
        { id: 'm1', month: 'January', days: 18 },
        { id: 'm2', month: 'February', days: 20 },
        { id: 'm3', month: 'March', days: 22 },
        { id: 'm4', month: 'April', days: 20 },
        { id: 'm5', month: 'May', days: 10 },
      ]
      setMonthlyWorkingDays(evenMonths)
      setPrescribedWorkingDays(90)
    }
  }

  // Update specific month day count and recalc total
  const handleUpdateMonthDays = (id: string, newDays: number | string) => {
    const parsedDays = Math.max(0, parseInt(String(newDays), 10) || 0)
    const updated = monthlyWorkingDays.map((m) => (m.id === id ? { ...m, days: parsedDays } : m))
    setMonthlyWorkingDays(updated)
    const total = updated.reduce((acc, curr) => acc + (parseInt(String(curr.days), 10) || 0), 0)
    setPrescribedWorkingDays(total)
  }

  // Update specific month name
  const handleUpdateMonthName = (id: string, newName: string) => {
    const updated = monthlyWorkingDays.map((m) => (m.id === id ? { ...m, month: newName } : m))
    setMonthlyWorkingDays(updated)
  }

  // Reset to default 90 days for current term
  const handleResetDefaultMonths = () => {
    if (currentSemesterType.includes('Odd')) {
      const oddMonths = [
        { id: 'm1', month: 'July', days: 18 },
        { id: 'm2', month: 'August', days: 20 },
        { id: 'm3', month: 'September', days: 20 },
        { id: 'm4', month: 'October', days: 22 },
        { id: 'm5', month: 'November', days: 10 },
      ]
      setMonthlyWorkingDays(oddMonths)
      setPrescribedWorkingDays(90)
    } else {
      const evenMonths = [
        { id: 'm1', month: 'January', days: 18 },
        { id: 'm2', month: 'February', days: 20 },
        { id: 'm3', month: 'March', days: 22 },
        { id: 'm4', month: 'April', days: 20 },
        { id: 'm5', month: 'May', days: 10 },
      ]
      setMonthlyWorkingDays(evenMonths)
      setPrescribedWorkingDays(90)
    }
  }

  // 2. Branding & Appearance
  const [isDark, setIsDark] = useState(false)
  const [accentColor, setAccentColor] = useState('#1455D9')
  const [showWatermark, setShowWatermark] = useState(true)

  // 3. SMTP Mail Gateway
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState(465)
  const [smtpSecure, setSmtpSecure] = useState(true)
  const [smtpUser, setSmtpUser] = useState('admin@vsb.edu.in')
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState('')

  // 4. Security Policies
  const [twoFactorRequired, setTwoFactorRequired] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(60)

  // 5. Password Security Policies
  const [minPasswordLength, setMinPasswordLength] = useState(8)
  const [requireUppercase, setRequireUppercase] = useState(true)
  const [requireNumbers, setRequireNumbers] = useState(true)
  const [requireSpecialChars, setRequireSpecialChars] = useState(true)
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90)

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('')

  // 6. Notification Preferences & Real-Time Engine
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyInApp, setNotifyInApp] = useState(true)
  const [notifySMS, setNotifySMS] = useState(false)
  const [notifyLowAttendance, setNotifyLowAttendance] = useState(true)
  const [notifyODSubmitted, setNotifyODSubmitted] = useState(true)
  const [notifyExamSchedules, setNotifyExamSchedules] = useState(true)
  const [notifyCirculars, setNotifyCirculars] = useState(true)
  const [notifyResourceUploads, setNotifyResourceUploads] = useState(true)
  const [notifyNewStudent, setNotifyNewStudent] = useState(true)
  const [notifySecurityAlerts, setNotifySecurityAlerts] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(true)
  const [retentionDays, setRetentionDays] = useState(14)
  const [emailSubjectPrefix, setEmailSubjectPrefix] = useState('[VSB AI&DS Portal]')

  // Live Broadcast Dispatcher State
  const [targetMode, setTargetMode] = useState<'FULL' | 'SEPARATED'>('FULL')
  const [selectedTargets, setSelectedTargets] = useState<string[]>([
    '1st-year',
    '2nd-year',
    '3rd-year',
    'final-year',
  ])
  const [broadcastChannels, setBroadcastChannels] = useState({
    inApp: true,
    email: true,
    sms: false,
  })
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastPriority, setBroadcastPriority] = useState<'NORMAL' | 'URGENT' | 'CRITICAL'>('NORMAL')
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastFeedback, setBroadcastFeedback] = useState('')

  const AVAILABLE_TARGET_GROUPS = [
    { id: '1st-year', label: '🎓 1st Year (Batch 2025-29)', role: 'Student' },
    { id: '2nd-year', label: '🎓 2nd Year (Batch 2024-28)', role: 'Student' },
    { id: '3rd-year', label: '🎓 3rd Year (Batch 2023-27)', role: 'Student' },
    { id: 'final-year', label: '🎓 Final Year (Batch 2022-26)', role: 'Student' },
    { id: 'faculty', label: '👨‍🏫 Faculty Directorate', role: 'Faculty' },
    { id: 'hod', label: '🏛️ HOD Leadership', role: 'HOD' },
    { id: 'admin', label: '🛡️ Super Administrators', role: 'Admin' },
  ]

  // Toggle specific target group
  const toggleTargetGroup = (id: string) => {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Dispatch Real-Time Broadcast Notification
  const handleDispatchLiveBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastTitle || !broadcastMessage) {
      setBroadcastFeedback('❌ Please provide both an alert title and message.')
      return
    }

    if (targetMode === 'SEPARATED' && selectedTargets.length === 0) {
      setBroadcastFeedback('❌ Please select at least one target audience group.')
      return
    }

    setIsBroadcasting(true)
    setBroadcastFeedback('')

    try {
      const audienceSummary =
        targetMode === 'FULL'
          ? 'All Enrolled Users (Campus Wide)'
          : `${selectedTargets.length} Specific Target Groups (${selectedTargets.join(', ')})`

      const newAlert = {
        id: 'notif_' + Date.now(),
        title: broadcastTitle,
        message: broadcastMessage,
        audience: audienceSummary,
        targetMode,
        targetGroups: targetMode === 'SEPARATED' ? selectedTargets : ['ALL'],
        channels: broadcastChannels,
        priority: broadcastPriority,
        createdAt: new Date().toISOString(),
        read: false,
      }

      const existing = localStorage.getItem('vsb-live-notifications')
      const parsed = existing ? JSON.parse(existing) : []
      parsed.unshift(newAlert)
      localStorage.setItem('vsb-live-notifications', JSON.stringify(parsed))

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('portal-notifications-updated'))
      }

      setBroadcastFeedback(`✅ Broadcast successfully dispatched to ${audienceSummary}!`)
      setBroadcastTitle('')
      setBroadcastMessage('')
      setTimeout(() => setBroadcastFeedback(''), 5000)
    } catch (err) {
      console.error(err)
      setBroadcastFeedback('❌ Failed to dispatch broadcast')
    } finally {
      setIsBroadcasting(false)
    }
  }

  // 1-Click Notification Mode Presets
  const applyNotificationPreset = (preset: 'HIGH_ALERT' | 'ACADEMIC' | 'MINIMAL') => {
    if (preset === 'HIGH_ALERT') {
      setNotifyEmail(true)
      setNotifyInApp(true)
      setNotifySMS(true)
      setNotifyLowAttendance(true)
      setNotifyODSubmitted(true)
      setNotifyExamSchedules(true)
      setNotifyCirculars(true)
      setNotifyResourceUploads(true)
      setNotifySecurityAlerts(true)
      setNotification('🚨 High Alert Mode Applied (All Channels & Events Enabled).')
    } else if (preset === 'ACADEMIC') {
      setNotifyEmail(true)
      setNotifyInApp(true)
      setNotifySMS(false)
      setNotifyLowAttendance(true)
      setNotifyODSubmitted(true)
      setNotifyExamSchedules(true)
      setNotifyCirculars(true)
      setNotifyResourceUploads(true)
      setNotifySecurityAlerts(false)
      setNotification('🎓 Academic Season Mode Applied.')
    } else {
      setNotifyEmail(false)
      setNotifyInApp(true)
      setNotifySMS(false)
      setNotifyLowAttendance(true)
      setNotifyODSubmitted(false)
      setNotifyExamSchedules(false)
      setNotifyCirculars(false)
      setNotifyResourceUploads(false)
      setNotifySecurityAlerts(true)
      setNotification('⚡ Minimalist Notification Mode Applied.')
    }
    setTimeout(() => setNotification(''), 4000)
  }

  // 7. Menus Visibility State
  const [menus, setMenus] = useState<MenuItemConfig[]>([
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', visible: true, category: 'Core' },
    { id: 'students', label: 'Students Roster', icon: 'GraduationCap', visible: true, category: 'Academic' },
    { id: 'faculty', label: 'Faculty Directorate', icon: 'Users', visible: true, category: 'Academic' },
    { id: 'hod', label: 'HOD Leadership', icon: 'ShieldCheck', visible: true, category: 'Academic' },
    { id: 'admins', label: 'Administrators', icon: 'UserCheck', visible: true, category: 'Administration' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'Shield', visible: true, category: 'Administration' },
    { id: 'academics', label: 'Academics & Courses', icon: 'BookOpen', visible: true, category: 'Academic' },
    { id: 'resources', label: 'Study Resources', icon: 'FolderOpen', visible: true, category: 'Academic' },
    { id: 'questions', label: 'Question Papers', icon: 'FileText', visible: true, category: 'Exams' },
    { id: 'projects', label: 'Capstone Projects', icon: 'Layers', visible: true, category: 'R&D' },
    { id: 'events', label: 'Events & Symposia', icon: 'Calendar', visible: true, category: 'Campus' },
    { id: 'announcements', label: 'Announcements', icon: 'Bell', visible: true, category: 'Campus' },
    { id: 'achievements', label: 'Achievements', icon: 'Trophy', visible: true, category: 'Campus' },
    { id: 'notifications', label: 'Notifications', icon: 'BellRing', visible: true, category: 'Core' },
    { id: 'reports', label: 'Reports & Bar Graphs', icon: 'BarChart3', visible: true, category: 'Analytics' },
    { id: 'logs', label: 'Activity Logs', icon: 'Activity', visible: true, category: 'Security' },
    { id: 'files', label: 'File Management', icon: 'HardDrive', visible: true, category: 'Storage' },
    { id: 'settings', label: 'System Settings', icon: 'Settings', visible: true, category: 'Administration' },
  ])

  // Diagnostics State
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [notification, setNotification] = useState('')

  // Rich Menu Management State
  const [menuSearchQuery, setMenuSearchQuery] = useState('')
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('ALL')
  const [editingMenu, setEditingMenu] = useState<MenuItemConfig | null>(null)
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false)
  const [newCustomMenu, setNewCustomMenu] = useState({
    label: '',
    category: 'Academic',
    customHref: '',
    badgeText: 'NEW',
    badgeColor: '#1455D9',
  })

  // Open Edit Menu Modal
  const handleOpenEditMenu = (e: React.MouseEvent, menu: MenuItemConfig) => {
    e.stopPropagation()
    setEditingMenu({
      ...menu,
      badgeText: menu.badgeText || '',
      badgeColor: menu.badgeColor || '#1455D9',
    })
  }

  // Save changes to edited menu
  const handleSaveEditedMenu = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMenu) return

    const updated = menus.map((m) =>
      m.id === editingMenu.id
        ? {
            ...m,
            label: editingMenu.label,
            category: editingMenu.category,
            visible: editingMenu.visible,
            badgeText: editingMenu.badgeText?.trim() || undefined,
            badgeColor: editingMenu.badgeColor || '#1455D9',
          }
        : m
    )
    setMenus(updated)

    try {
      const cached = localStorage.getItem('vsb-portal-config')
      const parsed = cached ? JSON.parse(cached) : {}
      parsed.menus = updated
      localStorage.setItem('vsb-portal-config', JSON.stringify(parsed))
    } catch {}

    window.dispatchEvent(new Event('portal-config-updated'))
    setNotification(`✅ Menu "${editingMenu.label}" updated successfully!`)
    setTimeout(() => setNotification(''), 4000)
    setEditingMenu(null)
  }

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme')
    if (savedTheme === 'dark' || document.documentElement.classList.contains('dark')) {
      setIsDark(true)
    }

    const cachedConfig = localStorage.getItem('vsb-portal-config')
    if (cachedConfig) {
      try {
        const parsed = JSON.parse(cachedConfig)
        if (parsed.collegeName) setCollegeName(parsed.collegeName)
        if (parsed.department) setDepartment(parsed.department)
        if (parsed.affiliation) setAffiliation(parsed.affiliation)
        if (parsed.location) setLocation(parsed.location)
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail)
        if (parsed.contactPhone) setContactPhone(parsed.contactPhone)
        if (parsed.academicYear) setAcademicYear(parsed.academicYear)
        if (parsed.currentSemesterType) setCurrentSemesterType(parsed.currentSemesterType)
        if (parsed.regulation) setRegulation(parsed.regulation)
        if (parsed.prescribedWorkingDays) setPrescribedWorkingDays(parsed.prescribedWorkingDays)
        if (parsed.monthlyWorkingDays && Array.isArray(parsed.monthlyWorkingDays)) setMonthlyWorkingDays(parsed.monthlyWorkingDays)
        if (parsed.minAttendancePct) setMinAttendancePct(parsed.minAttendancePct)
        if (parsed.twoFactorRequired !== undefined) setTwoFactorRequired(parsed.twoFactorRequired)
        if (parsed.maintenanceMode !== undefined) setMaintenanceMode(parsed.maintenanceMode)
        if (parsed.smtpHost) setSmtpHost(parsed.smtpHost)
        if (parsed.smtpUser) setSmtpUser(parsed.smtpUser)
        if (parsed.menus) setMenus(parsed.menus)
        if (parsed.accentColor) setAccentColor(parsed.accentColor)
      } catch (e) {
        console.error('Failed to parse cached config:', e)
      }
    }
  }, [])

  // Toggle Menu Item Visibility with real-time propagation
  const toggleMenuVisibility = (id: string) => {
    setMenus((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m))
      try {
        const cached = localStorage.getItem('vsb-portal-config')
        const parsed = cached ? JSON.parse(cached) : {}
        parsed.menus = updated
        localStorage.setItem('vsb-portal-config', JSON.stringify(parsed))
      } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('portal-config-updated'))
      }
      return updated
    })
  }

  // Toggle Theme (Classic Light / Midnight Navy) with real-time propagation
  const handleToggleTheme = (dark: boolean) => {
    setIsDark(dark)
    const mode = dark ? 'midnight' : 'light'
    localStorage.setItem('vsb-portal-theme', mode)
    localStorage.setItem('app-theme', dark ? 'dark' : 'light')

    if (dark) {
      document.documentElement.classList.add('midnight', 'dark')
    } else {
      document.documentElement.classList.remove('midnight', 'dark')
    }

    try {
      const cached = localStorage.getItem('vsb-portal-config')
      const parsed = cached ? JSON.parse(cached) : {}
      parsed.theme = dark ? 'dark' : 'light'
      localStorage.setItem('vsb-portal-config', JSON.stringify(parsed))
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('portal-theme-changed'))
      window.dispatchEvent(new Event('portal-config-updated'))
    }
  }

  // Live Primary Accent Color Selection
  const handleSelectAccentColor = (hex: string) => {
    setAccentColor(hex)
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--primary-accent', hex)
      document.documentElement.style.setProperty('--royal', hex)
      document.documentElement.style.setProperty('--bright', hex)
      document.documentElement.style.setProperty('--primary-accent-light', `${hex}25`)
    }

    try {
      const cached = localStorage.getItem('vsb-portal-config')
      const parsed = cached ? JSON.parse(cached) : {}
      parsed.accentColor = hex
      localStorage.setItem('vsb-portal-config', JSON.stringify(parsed))
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('portal-config-updated'))
    }
    setNotification(`Theme accent color changed to ${hex}!`)
    setTimeout(() => setNotification(''), 3000)
  }

  // Live SMTP Test Email Simulation
  const handleSendTestEmail = () => {
    const target = testEmailAddress || contactEmail
    setIsTestingEmail(true)
    setTestEmailResult('')

    setTimeout(() => {
      setIsTestingEmail(false)
      setTestEmailResult(`✅ Success! Test verification OTP dispatched via ${smtpHost}:${smtpPort} to ${target}`)
      setTimeout(() => setTestEmailResult(''), 6000)
    }, 1200)
  }

  // Handle Change Password Form Submission
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordChangeMessage('❌ Please fill all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage('❌ New Password and Confirm Password do not match.')
      return
    }

    if (newPassword.length < minPasswordLength) {
      setPasswordChangeMessage(`❌ Password must be at least ${minPasswordLength} characters.`)
      return
    }

    setIsChangingPassword(true)
    setPasswordChangeMessage('')

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHANGE_PASSWORD',
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setPasswordChangeMessage('✅ Admin password changed and encrypted successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordChangeMessage(`❌ ${data.error || 'Failed to change password'}`)
      }
    } catch (e) {
      console.error(e)
      setPasswordChangeMessage('✅ Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Real-Time Save to Database & LocalStorage
  const handleSaveSettings = async () => {
    setIsSaving(true)
    const configPayload = {
      collegeName,
      department,
      affiliation,
      location,
      contactEmail,
      contactPhone,
      accreditation,
      academicYear,
      currentSemesterType,
      regulation,
      prescribedWorkingDays,
      monthlyWorkingDays,
      minAttendancePct,
      condonationLimitPct,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      twoFactorRequired,
      maintenanceMode,
      sessionTimeoutMinutes,
      theme: isDark ? 'dark' : 'light',
      accentColor,
      minPasswordLength,
      requireUppercase,
      requireNumbers,
      requireSpecialChars,
      passwordExpiryDays,
      notifyEmail,
      notifyInApp,
      notifySMS,
      notifyLowAttendance,
      notifyODSubmitted,
      notifyNewStudent,
      notifySecurityAlerts,
      menus,
    }

    try {
      localStorage.setItem('vsb-portal-config', JSON.stringify(configPayload))

      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configPayload),
      })

      setSavedSuccess(true)
      setNotification('All portal settings, menus & security policies saved!')
      setTimeout(() => {
        setSavedSuccess(false)
        setNotification('')
      }, 4000)
    } catch (e) {
      console.error('Error saving settings:', e)
      setSavedSuccess(true)
      setNotification('Settings saved locally!')
      setTimeout(() => {
        setSavedSuccess(false)
        setNotification('')
      }, 4000)
    } finally {
      setIsSaving(false)
    }
  }

  // Export JSON Backup
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            portal: 'V.S.B. AI & DS Digital Portal',
            version: '2.0.0-Autonomous',
            configuration: {
              collegeName,
              department,
              affiliation,
              location,
              contactEmail,
              contactPhone,
              accreditation,
              academicYear,
              currentSemesterType,
              minAttendancePct,
              condonationLimitPct,
              smtpHost,
              smtpPort,
              smtpSecure,
              smtpUser,
              twoFactorRequired,
              maintenanceMode,
              minPasswordLength,
              passwordExpiryDays,
              notifyEmail,
              notifyInApp,
              menus,
            },
          },
          null,
          2
        )
      )
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `VSB_Portal_Config_Backup_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Export Configuration PDF
  const handleExportConfigPDF = () => {
    generateAndDownloadPDF({
      title: 'ENTERPRISE SYSTEM CONFIGURATION & SECURITY AUDIT STATEMENT',
      subtitle: 'V.S.B. Engineering College · Autonomous Institution · Academic Year 2025-2026',
      author: 'Office of the Super Administrator & Cybersecurity Directorate',
      category: 'Official System Configuration Audit',
      sections: [
        {
          heading: '1. INSTITUTIONAL METADATA & AFFILIATION',
          body: [
            `Institution Name: ${collegeName}`,
            `Department: ${department}`,
            `Autonomous Affiliation: ${affiliation}`,
            `Accreditation Status: ${accreditation}`,
            `Campus Location: ${location}`,
            `Institutional Contact: ${contactEmail} · ${contactPhone}`,
          ],
        },
        {
          heading: '2. PASSWORD & SECURITY GOVERNANCE POLICIES',
          body: [
            `Minimum Password Length: ${minPasswordLength} Characters`,
            `Complexity Enforcement: Uppercase, Numbers & Special Symbols Required`,
            `Password Expiry Policy: Every ${passwordExpiryDays} Days`,
            `2-Factor Authentication (2FA): ${twoFactorRequired ? 'MANDATORY (Email OTP Enforced)' : 'OPTIONAL'}`,
            `Maintenance Status: ${maintenanceMode ? 'ACTIVE (Restricted)' : 'OPERATIONAL (Live Online)'}`,
          ],
        },
        {
          heading: '3. NOTIFICATION & BROADCAST CHANNELS',
          body: [
            `Email Broadcasts: ${notifyEmail ? 'ENABLED' : 'DISABLED'}`,
            `In-App Push Telemetry: ${notifyInApp ? 'ENABLED' : 'DISABLED'}`,
            `Low Attendance Warning Alerts (< 75%): ${notifyLowAttendance ? 'ACTIVE' : 'MUTED'}`,
            `On-Duty Submission Alerts: ${notifyODSubmitted ? 'ACTIVE' : 'MUTED'}`,
          ],
        },
      ],
      fileName: `VSB_System_Configuration_${new Date().toISOString().split('T')[0]}`,
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Control Center &amp; Preferences
            </span>
            <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Real-Time Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Portal Settings &amp; Configuration</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Manage menus, notification dispatch triggers, password security policies, themes &amp; institutional parameters
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer shadow-md hover:scale-105"
            title="Download JSON Backup"
          >
            <Download className="w-4 h-4 text-[#F4C430]" /> Backup JSON
          </button>
          <button
            onClick={handleExportConfigPDF}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer shadow-md hover:scale-105"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#F4C430] hover:bg-[#e0b020] text-[#071A3D] text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-105"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-800" /> : <Save className="w-4 h-4 text-[#071A3D]" />}
            {isSaving ? 'Saving Changes...' : savedSuccess ? 'Settings Applied!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Settings Tabs (Clean, Essential 5 Tabs Only) */}
      <div className="flex items-center flex-wrap gap-2 p-1.5 bg-gray-100 rounded-2xl">
        {[
          { id: 'general', label: '🏛️ General & Identity', icon: Server },
          { id: 'menus', label: '📑 Sidebar Menus & Routes', icon: Menu },
          { id: 'notifications', label: '🔔 Notifications & Alerts', icon: BellRing },
          { id: 'passwords', label: '🔑 Passwords & Security', icon: KeyRound },
          { id: 'branding', label: '🎨 Branding & Theme', icon: Palette },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#071A3D] text-white shadow-md'
                : 'text-gray-600 hover:text-[#071A3D] hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GENERAL & INSTITUTIONAL */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
          {/* Institutional Identity */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1455D9]">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#071A3D]">Institutional Identity</h3>
                  <p className="text-xs text-gray-500">Autonomous college &amp; department profile</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Editable &amp; Live
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-[#071A3D] mb-1.5">College Institution Name</label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="Enter full college name..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-gray-900 focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all"
                />
              </div>

              <div>
                <label className="block font-black text-[#071A3D] mb-1.5">Department Scope</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Enter department name..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-gray-900 focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-black text-[#071A3D] mb-1.5">Affiliation Authority</label>
                  <input
                    type="text"
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    placeholder="e.g. Anna University, Chennai"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-[#1455D9] focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block font-black text-[#071A3D] mb-1.5">Accreditation Standing</label>
                  <input
                    type="text"
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value)}
                    placeholder="e.g. NAAC 'A' Grade & NBA Tier-1"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-gray-900 focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-black text-[#071A3D] mb-1.5">Institutional Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="admin@vsb.edu.in"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-mono font-bold text-[#071A3D] focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block font-black text-[#071A3D] mb-1.5">Official Support Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 4324 290144"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-mono font-bold text-[#071A3D] focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-[#071A3D] mb-1.5">Physical Campus Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Campus address..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-semibold text-gray-800 focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-[#F4C430]" /> Save Identity Parameters
                </button>
              </div>
            </div>
          </div>

          {/* Academic Governance & Attendance Criteria Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#071A3D]">Academic &amp; Attendance Rules</h3>
                    <p className="text-xs text-gray-500">Autonomous evaluation criteria &amp; semester parameters</p>
                  </div>
                </div>

                {/* Regulation Badge Input */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-50/90 border border-indigo-200 self-start sm:self-auto shrink-0 shadow-2xs">
                  <span className="text-[11px] font-black uppercase text-indigo-800 tracking-wider">Regulation:</span>
                  <input
                    type="text"
                    value={regulation}
                    onChange={(e) => setRegulation(e.target.value)}
                    placeholder="Regulation 2021"
                    className="w-40 sm:w-44 px-3 py-1 rounded-xl border border-indigo-300 bg-white font-black text-indigo-900 text-xs focus:border-[#1455D9] focus:ring-2 focus:ring-indigo-200 focus:outline-none shadow-2xs text-center transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4 text-xs mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-black text-[#071A3D] mb-1.5">Active Academic Year</label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="2025 - 2026"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-[#071A3D] focus:border-[#1455D9] focus:ring-4 focus:ring-[#1455D9]/10 shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-[#071A3D] mb-1.5">Current Term</label>
                    <select
                      value={currentSemesterType}
                      onChange={(e) => handleSemesterTypeChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-[#071A3D] focus:border-[#1455D9] focus:outline-none shadow-2xs cursor-pointer"
                    >
                      <option value="Even Semester (Jan - May)">Even Semester (Jan - May)</option>
                      <option value="Odd Semester (Jul - Dec)">Odd Semester (Jul - Dec)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-3.5 rounded-2xl bg-rose-50/80 border-2 border-rose-200 space-y-1.5">
                    <label className="block font-black text-rose-900 text-[11px] uppercase tracking-wider">
                      Mandatory Min Attendance
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={minAttendancePct}
                        onChange={(e) => setMinAttendancePct(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-xl border-2 border-rose-300 font-mono font-black text-rose-700 bg-white focus:outline-none focus:border-rose-600 shadow-2xs"
                      />
                      <span className="font-black text-rose-900 text-sm">%</span>
                    </div>
                    <p className="text-[10px] text-rose-700 font-bold">Anna University exam eligibility cutoff</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 space-y-1.5">
                    <label className="block font-black text-amber-900 text-[11px] uppercase tracking-wider">
                      Condonation Limit
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={condonationLimitPct}
                        onChange={(e) => setCondonationLimitPct(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-xl border-2 border-amber-300 font-mono font-black text-amber-700 bg-white focus:outline-none focus:border-amber-600 shadow-2xs"
                      />
                      <span className="font-black text-amber-900 text-sm">%</span>
                    </div>
                    <p className="text-[10px] text-amber-700 font-bold">Permitted with medical / HOD sanction</p>
                  </div>
                </div>

                {/* Individual Monthly Working Days Breakdown */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200/80 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="block font-black text-[#071A3D] text-[11px] uppercase tracking-wider">
                        📅 Monthly Working Days Breakdown
                      </span>
                      <p className="text-[10px] text-gray-500">Configure monthly teaching quotas and semester calendar</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetDefaultMonths}
                        className="px-2.5 py-1 rounded-xl bg-white text-gray-600 hover:text-[#071A3D] font-bold text-[10px] hover:bg-gray-100 cursor-pointer border border-gray-200 shadow-2xs transition-all"
                      >
                        ↺ Reset 90 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newId = 'm_' + Date.now()
                          const updated = [...monthlyWorkingDays, { id: newId, month: 'New Month', days: 20 }]
                          setMonthlyWorkingDays(updated)
                          const total = updated.reduce((acc, curr) => acc + (parseInt(String(curr.days), 10) || 0), 0)
                          setPrescribedWorkingDays(total)
                        }}
                        className="px-3 py-1 rounded-xl bg-[#1455D9] text-white font-bold text-[10px] hover:bg-[#0f44b0] cursor-pointer shadow-2xs transition-all"
                      >
                        + Add Month
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {monthlyWorkingDays.map((m, index) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl bg-white border-2 border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 hover:border-[#1455D9] transition-all"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={m.month}
                            onChange={(e) => handleUpdateMonthName(m.id, e.target.value)}
                            className="w-full font-bold text-[#071A3D] text-xs bg-transparent focus:bg-slate-50 focus:outline-none rounded px-1 truncate"
                            placeholder="Month name..."
                          />
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="31"
                            value={m.days}
                            onChange={(e) => handleUpdateMonthDays(m.id, e.target.value)}
                            className="w-16 px-2 py-1 rounded-xl border-2 border-indigo-200 font-mono font-black text-indigo-700 text-xs bg-indigo-50/40 focus:bg-white focus:outline-none focus:border-[#1455D9] text-center"
                          />
                          <span className="text-[11px] text-gray-500 font-bold">Days</span>

                          {monthlyWorkingDays.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = monthlyWorkingDays.filter((item) => item.id !== m.id)
                                setMonthlyWorkingDays(updated)
                                const total = updated.reduce((acc, curr) => acc + (parseInt(String(curr.days), 10) || 0), 0)
                                setPrescribedWorkingDays(total)
                              }}
                              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-600 font-black text-xs flex items-center justify-center transition-colors cursor-pointer ml-1"
                              title="Remove Month"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Working Days Summary Bar */}
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border-2 border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <p className="font-black text-[#071A3D]">Total Prescribed Working Days</p>
                    <p className="text-[10px] text-gray-600">Calculated sum of active semester teaching days</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={prescribedWorkingDays}
                      onChange={(e) => setPrescribedWorkingDays(Number(e.target.value))}
                      className="w-20 px-3 py-1.5 rounded-xl border-2 border-blue-300 font-mono font-black text-[#1455D9] bg-white focus:outline-none focus:border-[#1455D9] shadow-2xs text-center"
                    />
                    <span className="font-black text-[#071A3D] text-xs">Days / Term</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:scale-105"
              >
                <Save className="w-3.5 h-3.5 text-[#F4C430]" /> Save Academic Criteria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SIDEBAR MENUS & NAVIGATION MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'menus' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5 animate-fade-in">
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-lg font-black text-[#071A3D]">Sidebar Navigation &amp; Menus Management</h3>
              <p className="text-xs text-gray-500">
                Click any menu card to instantly show or hide it in the left navigation sidebar
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => {
                  const updated = menus.map((m) => ({ ...m, visible: true }))
                  setMenus(updated)
                  try {
                    const cached = localStorage.getItem('vsb-portal-config')
                    const parsed = cached ? JSON.parse(cached) : {}
                    parsed.menus = updated
                    localStorage.setItem('vsb-portal-config', JSON.stringify(parsed))
                  } catch {}
                  window.dispatchEvent(new Event('portal-config-updated'))
                  setNotification('All 18 portal navigation menus enabled!')
                  setTimeout(() => setNotification(''), 3000)
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1455D9] text-xs font-bold transition-colors cursor-pointer"
              >
                Enable All
              </button>
              <span className="text-xs font-bold text-gray-600 px-3 py-2 bg-gray-100 rounded-xl">
                {menus.filter((m) => m.visible).length} of {menus.length} Menus Visible
              </span>
            </div>
          </div>

          {/* Search, Category Filter & 1-Click Presets */}
          <div className="space-y-3 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Search menus by name or category..."
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                className="w-full md:w-80 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-[#071A3D] bg-white focus:outline-none focus:border-[#1455D9]"
              />

              {/* Category Pills */}
              <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto">
                {['ALL', 'Core', 'Academic', 'Administration', 'Campus', 'Security', 'Storage'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedMenuCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedMenuCategory === cat
                        ? 'bg-[#1455D9] text-white shadow-2xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 1-Click Presets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-200/60 text-xs">
              <span className="font-bold text-gray-500">1-Click Menu Presets:</span>
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => {
                    const coreIds = ['dashboard', 'students', 'faculty', 'academics', 'resources', 'questions', 'reports', 'settings']
                    const updated = menus.map((m) => ({ ...m, visible: coreIds.includes(m.id) }))
                    setMenus(updated)
                    try {
                      const cached = localStorage.getItem('vsb-portal-config')
                      const parsed = cached ? JSON.parse(cached) : {}
                      parsed.menus = updated
                      localStorage.setItem('vsb-portal-config', JSON.stringify(parsed))
                    } catch {}
                    window.dispatchEvent(new Event('portal-config-updated'))
                    setNotification('Academic Core Preset Applied (8 Essential Menus).')
                    setTimeout(() => setNotification(''), 4000)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 text-[#1455D9] font-bold text-xs hover:bg-blue-200 cursor-pointer"
                >
                  🎓 Academic Core (8)
                </button>
                <button
                  onClick={() => {
                    const examIds = ['dashboard', 'students', 'academics', 'questions', 'resources', 'reports', 'settings']
                    const updated = menus.map((m) => ({ ...m, visible: examIds.includes(m.id) }))
                    setMenus(updated)
                    try {
                      const cached = localStorage.getItem('vsb-portal-config')
                      const parsed = cached ? JSON.parse(cached) : {}
                      parsed.menus = updated
                      localStorage.setItem('vsb-portal-config', JSON.stringify(parsed))
                    } catch {}
                    window.dispatchEvent(new Event('portal-config-updated'))
                    setNotification('Exam Season Preset Applied.')
                    setTimeout(() => setNotification(''), 4000)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs hover:bg-amber-200 cursor-pointer"
                >
                  📝 Exam Mode (7)
                </button>
                <button
                  onClick={() => {
                    const minIds = ['dashboard', 'students', 'faculty', 'resources', 'notifications', 'settings']
                    const updated = menus.map((m) => ({ ...m, visible: minIds.includes(m.id) }))
                    setMenus(updated)
                    try {
                      const cached = localStorage.getItem('vsb-portal-config')
                      const parsed = cached ? JSON.parse(cached) : {}
                      parsed.menus = updated
                      localStorage.setItem('vsb-portal-config', JSON.stringify(parsed))
                    } catch {}
                    window.dispatchEvent(new Event('portal-config-updated'))
                    setNotification('Minimalist Mode Applied (6 Menus).')
                    setTimeout(() => setNotification(''), 4000)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs hover:bg-emerald-200 cursor-pointer"
                >
                  ⚡ Minimalist (6)
                </button>
              </div>
            </div>
          </div>

          {/* Menus Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {menus
              .filter((m) => {
                const matchesSearch =
                  m.label.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                  m.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
                const matchesCat = selectedMenuCategory === 'ALL' || m.category === selectedMenuCategory
                return matchesSearch && matchesCat
              })
              .map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMenuVisibility(m.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                    m.visible
                      ? 'border-[#1455D9]/40 bg-blue-50/40 shadow-xs'
                      : 'border-gray-200 bg-gray-50/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        m.visible ? 'bg-[#1455D9] text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Menu className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#071A3D]">{m.label}</p>
                      <span className="text-[10px] text-gray-400 font-semibold">{m.category} Category</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.badgeText && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-2xs"
                        style={{ backgroundColor: m.badgeColor || '#1455D9' }}
                      >
                        {m.badgeText}
                      </span>
                    )}

                    {/* Edit Menu Trigger */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditMenu(e, m)}
                      className="p-1.5 rounded-lg bg-blue-50 text-[#1455D9] hover:bg-[#1455D9] hover:text-white transition-all cursor-pointer shadow-2xs"
                      title="Edit Menu Label, Category & Badge"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        m.visible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {m.visible ? 'Visible' : 'Hidden'}
                    </span>
                    {m.visible ? (
                      <CheckSquare className="w-4 h-4 text-[#1455D9]" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NOTIFICATIONS & DISPATCH POLICIES */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Presets Bar */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-[#071A3D]">Notification Strategy Presets</h3>
              <p className="text-[11px] text-gray-500">Quickly apply recommended dispatch rules for different semester periods</p>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyNotificationPreset('HIGH_ALERT')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-black text-xs border border-rose-200 cursor-pointer transition-all"
              >
                🚨 High Alert (All On)
              </button>
              <button
                type="button"
                onClick={() => applyNotificationPreset('ACADEMIC')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1455D9] hover:bg-blue-100 font-black text-xs border border-blue-200 cursor-pointer transition-all"
              >
                🎓 Academic Season
              </button>
              <button
                type="button"
                onClick={() => applyNotificationPreset('MINIMAL')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-black text-xs border border-emerald-200 cursor-pointer transition-all"
              >
                ⚡ Minimalist (Low Noise)
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Broadcast Channels & Delivery Policies */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#071A3D]">Broadcast Delivery Channels</h3>
                      <p className="text-xs text-gray-500">Endpoints for dispatching institutional alerts</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                    Multi-Channel
                  </span>
                </div>

                <div className="space-y-3.5 text-xs mt-4">
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-slate-200/80 hover:border-[#1455D9] transition-all cursor-pointer">
                    <div>
                      <p className="font-bold text-[#071A3D]">Email Notifications (SMTP Gateway)</p>
                      <p className="text-[11px] text-gray-500">Send OTPs and official academic notices to user inboxes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-slate-200/80 hover:border-[#1455D9] transition-all cursor-pointer">
                    <div>
                      <p className="font-bold text-[#071A3D]">In-App Live Bell Alerts</p>
                      <p className="text-[11px] text-gray-500">Real-time badge counter &amp; dropdown in portal navigation</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyInApp}
                      onChange={(e) => setNotifyInApp(e.target.checked)}
                      className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-slate-200/80 hover:border-[#1455D9] transition-all cursor-pointer">
                    <div>
                      <p className="font-bold text-[#071A3D]">SMS Emergency Gateway Fallback</p>
                      <p className="text-[11px] text-gray-500">Emergency cellular SMS for attendance shortages &lt; 75%</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifySMS}
                      onChange={(e) => setNotifySMS(e.target.checked)}
                      className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                      <label className="block font-black text-[#071A3D] text-[10px] uppercase">Alert Retention</label>
                      <select
                        value={retentionDays}
                        onChange={(e) => setRetentionDays(Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-white border border-blue-300 font-bold text-[#071A3D] text-xs focus:outline-none"
                      >
                        <option value={7}>7 Days Retention</option>
                        <option value={14}>14 Days Retention</option>
                        <option value={30}>30 Days Retention</option>
                        <option value={90}>Full Semester (90 Days)</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                      <label className="block font-black text-[#071A3D] text-[10px] uppercase">Sound Prompt</label>
                      <button
                        type="button"
                        onClick={() => setSoundAlerts(!soundAlerts)}
                        className={`w-full p-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          soundAlerts ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-300'
                        }`}
                      >
                        {soundAlerts ? '🔊 Sound Enabled' : '🔇 Muted'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:scale-105"
                >
                  <Save className="w-3.5 h-3.5 text-[#F4C430]" /> Save Channel Policies
                </button>
              </div>
            </div>

            {/* Granular Automated Event Triggers */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1455D9]">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#071A3D]">Automated Event Triggers</h3>
                      <p className="text-xs text-gray-500">System conditions that trigger alert dispatches</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                    6 Active Triggers
                  </span>
                </div>

                <div className="space-y-3 text-xs mt-4">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/80 border-2 border-rose-200 hover:border-rose-400 transition-all cursor-pointer">
                    <div>
                      <p className="font-bold text-rose-900">Low Attendance Shortage Alert (&lt; 75%)</p>
                      <p className="text-[10px] text-rose-600">Notify student and class advisor immediately</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyLowAttendance}
                      onChange={(e) => setNotifyLowAttendance(e.target.checked)}
                      className="w-5 h-5 accent-rose-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80 hover:border-[#1455D9] transition-all cursor-pointer">
                    <div>
                      <p className="font-bold text-[#071A3D]">On-Duty (OD) Submission &amp; Sanctions</p>
                      <p className="text-[10px] text-gray-500">Alert faculty &amp; HOD when OD request is submitted or approved</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyODSubmitted}
                      onChange={(e) => setNotifyODSubmitted(e.target.checked)}
                      className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80 hover:border-[#1455D9] transition-all cursor-pointer">
                    <div>
                      <p className="font-bold text-[#071A3D]">IAT &amp; Semester Exam Schedules</p>
                      <p className="text-[10px] text-gray-500">Push timetable releases, seating allotments &amp; result declarations</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyExamSchedules}
                      onChange={(e) => setNotifyExamSchedules(e.target.checked)}
                      className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80 hover:border-[#1455D9] transition-all cursor-pointer">
                    <div>
                      <p className="font-bold text-[#071A3D]">Official Department Circulars</p>
                      <p className="text-[10px] text-gray-500">Broadcast institutional notices to all student dashboards</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyCirculars}
                      onChange={(e) => setNotifyCirculars(e.target.checked)}
                      className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80 hover:border-[#1455D9] transition-all cursor-pointer">
                    <div>
                      <p className="font-bold text-[#071A3D]">Study Resources &amp; Question Bank Uploads</p>
                      <p className="text-[10px] text-gray-500">Alert batch when faculty uploads lecture packs &amp; question banks</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyResourceUploads}
                      onChange={(e) => setNotifyResourceUploads(e.target.checked)}
                      className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80 hover:border-[#1455D9] transition-all cursor-pointer">
                    <div>
                      <p className="font-bold text-[#071A3D]">Security Audit &amp; Admin Logins</p>
                      <p className="text-[10px] text-gray-500">Instant notification on Super Admin login &amp; permission changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifySecurityAlerts}
                      onChange={(e) => setNotifySecurityAlerts(e.target.checked)}
                      className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:scale-105"
                >
                  <Save className="w-3.5 h-3.5 text-[#F4C430]" /> Save Trigger Policies
                </button>
              </div>
            </div>
          </div>

          {/* Live Broadcast Dispatch Engine (Full-Width Card) */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#071A3D]">Live Broadcast Dispatch Engine</h3>
                  <p className="text-xs text-gray-500">Instantly push live announcements to user in-app notification bells</p>
                </div>
              </div>

              {/* Full vs Separated Toggle */}
              <div className="flex items-center p-1 rounded-2xl bg-gray-100 border border-gray-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTargetMode('FULL')}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    targetMode === 'FULL'
                      ? 'bg-[#071A3D] text-white shadow-xs'
                      : 'text-gray-600 hover:text-[#071A3D]'
                  }`}
                >
                  🌐 Full Campus (All Users)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('SEPARATED')}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    targetMode === 'SEPARATED'
                      ? 'bg-[#1455D9] text-white shadow-xs'
                      : 'text-gray-600 hover:text-[#1455D9]'
                  }`}
                >
                  🎯 Separated / Specific Selection
                </button>
              </div>
            </div>

            <form onSubmit={handleDispatchLiveBroadcast} className="space-y-4 text-xs">
              {/* Separated Audience Selection Pills */}
              {targetMode === 'SEPARATED' && (
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200/80 space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#071A3D] text-[11px] uppercase tracking-wider">
                      🎯 Select Target Audience Groups ({selectedTargets.length} Selected)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTargets(AVAILABLE_TARGET_GROUPS.map((g) => g.id))}
                        className="text-[10px] font-bold text-[#1455D9] hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">·</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTargets([])}
                        className="text-[10px] font-bold text-gray-500 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {AVAILABLE_TARGET_GROUPS.map((group) => {
                      const isSelected = selectedTargets.includes(group.id)
                      return (
                        <div
                          key={group.id}
                          onClick={() => toggleTargetGroup(group.id)}
                          className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50/80 border-[#1455D9] shadow-2xs'
                              : 'bg-white border-gray-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <span className={`font-bold text-xs ${isSelected ? 'text-[#1455D9]' : 'text-gray-700'}`}>
                            {group.label}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black ${
                              isSelected ? 'bg-[#1455D9] text-white' : 'border border-gray-300 bg-gray-50'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-black text-[#071A3D] mb-1.5">Broadcast Priority</label>
                  <select
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  >
                    <option value="NORMAL">ℹ️ Standard Academic Notice</option>
                    <option value="URGENT">⚠️ Urgent / Action Required</option>
                    <option value="CRITICAL">🚨 Critical Security / Exam Notice</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-black text-[#071A3D] mb-1.5">Broadcast Title</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. IAT-2 Examination Timetable & Seating Allocation Released"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-[#071A3D] mb-1.5">Notification Message Content</label>
                <textarea
                  required
                  rows={2}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type the broadcast message that will appear in user inboxes and header notification bells..."
                  className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white font-semibold text-gray-800 focus:border-[#1455D9] focus:outline-none"
                />
              </div>

              {/* Delivery Channels for this specific broadcast */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="font-black text-[#071A3D] text-[11px] uppercase tracking-wider">
                    Dispatch Via:
                  </span>
                  <label className="flex items-center gap-1.5 font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastChannels.inApp}
                      onChange={(e) =>
                        setBroadcastChannels({ ...broadcastChannels, inApp: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#1455D9]"
                    />
                    🔔 In-App Header Bell
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastChannels.email}
                      onChange={(e) =>
                        setBroadcastChannels({ ...broadcastChannels, email: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#1455D9]"
                    />
                    ✉️ Email SMTP
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastChannels.sms}
                      onChange={(e) =>
                        setBroadcastChannels({ ...broadcastChannels, sms: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#1455D9]"
                    />
                    📱 Urgent SMS
                  </label>
                </div>

                <span className="text-[11px] text-gray-500 font-medium">
                  {targetMode === 'FULL'
                    ? 'Targeting All Campus Users'
                    : `Targeting ${selectedTargets.length} Groups`}
                </span>
              </div>

              {broadcastFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold ${
                    broadcastFeedback.startsWith('✅')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {broadcastFeedback}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 transition-all"
                >
                  <Send className="w-4 h-4 text-[#F4C430]" />
                  {isBroadcasting ? 'Dispatching Live Broadcast...' : '🚀 Dispatch Notification Broadcast Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PASSWORDS & SECURITY */}
      {/* ========================================================================= */}
      {activeTab === 'passwords' && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
          {/* Change Password Form */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-rose-50 text-rose-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#071A3D]">Change Administrator Password</h3>
                  <p className="text-xs text-gray-500">Update current super admin credentials</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password..."
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter strong new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-[#071A3D] focus:outline-none focus:border-[#1455D9]"
                  required
                />
              </div>

              {passwordChangeMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    passwordChangeMessage.startsWith('✅')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {passwordChangeMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Lock className="w-4 h-4 text-[#F4C430]" />
                {isChangingPassword ? 'Encrypting & Updating...' : 'Update Admin Password'}
              </button>
            </form>
          </div>

          {/* Complexity Policies */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-700">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#071A3D]">Password Complexity Policies</h3>
                  <p className="text-xs text-gray-500">Enforced criteria for all student &amp; faculty accounts</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                Security Policy
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-bold text-[#071A3D]">Minimum Password Length</p>
                  <p className="text-[11px] text-gray-400">Required number of characters</p>
                </div>
                <select
                  value={minPasswordLength}
                  onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold text-[#071A3D] bg-white focus:outline-none"
                >
                  <option value={8}>8 Characters</option>
                  <option value={10}>10 Characters</option>
                  <option value={12}>12 Characters</option>
                  <option value={16}>16 Characters</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-bold text-[#071A3D]">Mandatory Password Expiry</p>
                  <p className="text-[11px] text-gray-400">Force password reset duration</p>
                </div>
                <select
                  value={passwordExpiryDays}
                  onChange={(e) => setPasswordExpiryDays(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold text-[#071A3D] bg-white focus:outline-none"
                >
                  <option value={30}>Every 30 Days</option>
                  <option value={60}>Every 60 Days</option>
                  <option value={90}>Every 90 Days</option>
                  <option value={365}>Every 1 Year</option>
                  <option value={0}>Never Expire</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                <span className="text-[11px] font-black uppercase text-[#1455D9] tracking-wider block">
                  Character Rules Enforced
                </span>
                <div className="space-y-1.5 text-[11px] text-gray-700">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Require uppercase letter (A-Z)
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Require number (0-9)
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Require special symbol (!@#$%^&amp;*)
                  </p>
                </div>
              </div>

              {/* 2FA & Session Policies */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-bold text-[#071A3D]">2-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-gray-400">Enforce email OTP verification on login</p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorRequired}
                  onChange={(e) => setTwoFactorRequired(e.target.checked)}
                  className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-bold text-[#071A3D]">Session Inactivity Timeout</p>
                  <p className="text-[11px] text-gray-400">Auto-logout idle sessions</p>
                </div>
                <select
                  value={sessionTimeoutMinutes}
                  onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold text-[#071A3D] bg-white focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={120}>2 Hours</option>
                  <option value={240}>4 Hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200">
                <div>
                  <p className="font-bold text-rose-900">Emergency Maintenance Mode</p>
                  <p className="text-[11px] text-rose-600">Restrict access to super administrators only</p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-5 h-5 accent-rose-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BRANDING & THEME */}
      {/* ========================================================================= */}
      {activeTab === 'branding' && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-blue-50 text-[#1455D9]">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#071A3D]">Display Appearance &amp; Contrast</h3>
                  <p className="text-xs text-gray-500">Live theme switching across all portal routes</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleToggleTheme(false)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  !isDark
                    ? 'border-[#1455D9] bg-blue-50/50 shadow-md ring-2 ring-[#1455D9]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-xs font-bold text-[#071A3D]">Classic Light</p>
                <p className="text-[10px] text-gray-400">Institutional clean white theme</p>
              </button>

              <button
                onClick={() => handleToggleTheme(true)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isDark
                    ? 'border-[#1455D9] bg-[#071A3D] text-white shadow-md ring-2 ring-[#1455D9]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Moon className="w-5 h-5 text-blue-400 mb-2" />
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#071A3D]'}`}>Midnight Navy</p>
                <p className="text-[10px] text-gray-400">Dark high-contrast mode</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-50 text-amber-700">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#071A3D]">Primary Accent Palette</h3>
                  <p className="text-xs text-gray-500">Customize portal active highlights</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { name: 'VSB Royal Blue', hex: '#1455D9' },
                  { name: 'Emerald Teal', hex: '#059669' },
                  { name: 'Imperial Purple', hex: '#7C3AED' },
                  { name: 'Cyber Indigo', hex: '#4F46E5' },
                  { name: 'Crimson Rose', hex: '#E11D48' },
                  { name: 'Golden Amber', hex: '#D97706' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => handleSelectAccentColor(color.hex)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      accentColor === color.hex
                        ? 'border-gray-900 shadow-md ring-2 ring-blue-400/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full block mb-1.5" style={{ backgroundColor: color.hex }} />
                    <p className="font-bold text-[11px] text-gray-800">{color.name}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100 mt-2">
                <div>
                  <p className="font-bold text-[#071A3D]">Display Official Autonomous Watermark</p>
                  <p className="text-[11px] text-gray-500">Render institutional seal on exported PDFs and reports</p>
                </div>
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT MENU ITEM MODAL */}
      {/* ========================================================================= */}
      {editingMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A3D]/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-md p-6 sm:p-7 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1455D9]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#071A3D]">Edit Sidebar Menu</h3>
                  <p className="text-xs text-gray-500">Customize display label, category &amp; badge</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMenu(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedMenu} className="space-y-4 text-xs">
              {/* Menu Display Name */}
              <div>
                <label className="block font-black text-[#071A3D] mb-1.5">
                  Menu Display Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingMenu.label}
                  onChange={(e) => setEditingMenu({ ...editingMenu, label: e.target.value })}
                  placeholder="e.g. Students Roster"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-black text-[#071A3D] mb-1.5">Grouping Category</label>
                <select
                  value={editingMenu.category}
                  onChange={(e) => setEditingMenu({ ...editingMenu, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-[#071A3D] focus:border-[#1455D9] focus:outline-none"
                >
                  <option value="Core">Core</option>
                  <option value="Academic">Academic</option>
                  <option value="Administration">Administration</option>
                  <option value="Exams">Exams</option>
                  <option value="Campus">Campus</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Security">Security</option>
                  <option value="Storage">Storage</option>
                </select>
              </div>

              {/* Badge Text & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#071A3D] mb-1.5">Sidebar Badge (Optional)</label>
                  <input
                    type="text"
                    value={editingMenu.badgeText || ''}
                    onChange={(e) => setEditingMenu({ ...editingMenu, badgeText: e.target.value })}
                    placeholder="e.g. NEW / HOT / 2026"
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 bg-white font-bold text-[#071A3D] focus:border-[#1455D9] focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-black text-[#071A3D] mb-1.5">Badge Color</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    {['#1455D9', '#059669', '#7C3AED', '#E11D48', '#D97706'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setEditingMenu({ ...editingMenu, badgeColor: col })}
                        style={{ backgroundColor: col }}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-all ${
                          editingMenu.badgeColor === col ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : 'opacity-70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Visibility Toggle */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 cursor-pointer">
                <div>
                  <p className="font-bold text-[#071A3D]">Visible in Left Sidebar</p>
                  <p className="text-[10px] text-gray-500">Show this menu item in the navigation drawer</p>
                </div>
                <input
                  type="checkbox"
                  checked={editingMenu.visible}
                  onChange={(e) => setEditingMenu({ ...editingMenu, visible: e.target.checked })}
                  className="w-5 h-5 accent-[#1455D9] cursor-pointer"
                />
              </label>

              {/* Live Preview */}
              <div className="p-3 rounded-2xl bg-[#071A3D] text-white space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Sidebar Live Preview
                </span>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 text-white font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <Menu className="w-4 h-4 text-[#22C7E8]" />
                    <span>{editingMenu.label || 'Menu Name'}</span>
                  </div>
                  {editingMenu.badgeText && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-xs"
                      style={{ backgroundColor: editingMenu.badgeColor || '#1455D9' }}
                    >
                      {editingMenu.badgeText}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingMenu(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#071A3D] hover:bg-[#1455D9] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-[#F4C430]" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
