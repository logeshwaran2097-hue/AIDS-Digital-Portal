'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LogOut,
  Menu,
  X,
  Bell,
  User as UserIcon,
  Home,
  BookOpen,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { studentNavItems, facultyNavItems, hodNavItems, adminNavItems } from './navItems'
import { FloatingChatbot } from '@/components/FloatingChatbot'
import { RealtimeNotificationToast, RealtimeToastData } from '@/components/notifications/RealtimeNotificationToast'
import {
  playNotificationChime,
  triggerDeviceVibration,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  dispatchNativeNotification,
} from '@/lib/notificationEngine'

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface PortalLayoutProps {
  role: 'student' | 'faculty' | 'hod' | 'admin'
  userName: string
  userEmail?: string
  navItems?: NavItem[]
  children: React.ReactNode
}

const navItemsMap: Record<string, NavItem[]> = {
  student: studentNavItems,
  faculty: facultyNavItems,
  hod: hodNavItems,
  admin: adminNavItems,
}

const roleBadgeMap: Record<string, { label: string; color: string }> = {
  student: { label: 'Student', color: 'bg-[#2878E8]/20 text-[#2878E8] border-[#2878E8]/30' },
  faculty: { label: 'Faculty', color: 'bg-[#22C7E8]/20 text-[#22C7E8] border-[#22C7E8]/30' },
  hod: { label: 'HOD', color: 'bg-[#F4C430]/20 text-[#F4C430] border-[#F4C430]/30' },
  admin: { label: 'Admin', color: 'bg-red-400/20 text-red-300 border-red-400/30' },
}

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  unread: boolean
  type: 'info' | 'success' | 'warning' | 'alert' | 'approval'
  link?: string
}

const DEFAULT_NOTIFICATIONS: Record<string, NotificationItem[]> = {
  student: [
    {
      id: '1',
      title: 'Unit 3 Study Material Uploaded',
      description: 'Dr. S. Karthik uploaded Deep Learning Unit 3 notes and problem sets.',
      time: '10 mins ago',
      unread: true,
      type: 'info',
      link: '/dashboard/study',
    },
    {
      id: '2',
      title: 'CIA 1 Attendance Warning',
      description: 'Your overall attendance is 87.4%. Keep it above 75% for Anna University eligibility.',
      time: '1 hour ago',
      unread: true,
      type: 'warning',
      link: '/dashboard/attendance',
    },
    {
      id: '3',
      title: 'National AI Hackathon 2026',
      description: 'Registration opens for Smart India Hackathon internal round. Last date Feb 28.',
      time: '2 hours ago',
      unread: false,
      type: 'success',
      link: '/dashboard/events',
    },
  ],
  faculty: [
    {
      id: 'f1',
      title: 'Attendance Register Due',
      description: 'Submit today’s 4th hour Artificial Intelligence attendance before 4:30 PM.',
      time: '15 mins ago',
      unread: true,
      type: 'warning',
      link: '/faculty-dashboard/attendance',
    },
    {
      id: 'f2',
      title: 'Anna University Question Bank',
      description: 'Submit 2 sets of Nov/Dec 2025 question papers for Department review.',
      time: '3 hours ago',
      unread: false,
      type: 'info',
      link: '/faculty-dashboard/question-papers',
    },
  ],
  hod: [
    {
      id: 'h1',
      title: 'CIA-1 Moderation Pending',
      description: '3 faculty members submitted Question Papers awaiting HOD approval.',
      time: '20 mins ago',
      unread: true,
      type: 'warning',
      link: '/hod-dashboard/question-papers',
    },
    {
      id: 'h2',
      title: 'Department NIRF Data Audit',
      description: 'Quarterly academic and placement data ready for review.',
      time: '2 hours ago',
      unread: false,
      type: 'info',
      link: '/hod-dashboard/reports',
    },
  ],
  admin: [
    {
      id: 'a1',
      title: 'Database Backup Completed',
      description: 'Nightly SQLite cloud replica synchronized successfully.',
      time: '5 mins ago',
      unread: false,
      type: 'success',
      link: '/admin/activity-logs',
    },
  ],
}

export function PortalLayout({ role, userName, userEmail, navItems, children }: PortalLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [activePath, setActivePath] = useState('')
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    DEFAULT_NOTIFICATIONS[role] || DEFAULT_NOTIFICATIONS.student
  )
  const [realtimeToast, setRealtimeToast] = useState<RealtimeToastData | null>(null)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')
  const [isTestingPush, setIsTestingPush] = useState(false)
  const knownNotificationIds = useRef<Set<string>>(new Set())
  const isInitialSyncDone = useRef<boolean>(false)

  const notificationRef = useRef<HTMLDivElement>(null)
  const navContainerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const [accentColor, setAccentColor] = useState('#1455D9')
  const [visibleMenuMap, setVisibleMenuMap] = useState<Record<string, boolean>>({})
  const [menuMetaMap, setMenuMetaMap] = useState<Record<string, { label?: string; badgeText?: string; badgeColor?: string }>>({})

  // Register Service Worker and check notification permission
  // Handle native notification permission on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPerm = getNotificationPermissionStatus()
      setPushPermission(currentPerm)

      // Auto-request permission by default if undecided
      if (currentPerm === 'default' && 'Notification' in window) {
        requestNotificationPermission().then((perm) => {
          setPushPermission(perm)
        }).catch(() => {})
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.debug('ServiceWorker registration note:', err)
        })
      }
    }
  }, [])

  // Sync real-time notifications from API
  const syncNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?role=${role}&limit=20`)
      if (!res.ok) return
      const data = await res.json()
      if (data.success && Array.isArray(data.notifications)) {
        const fetchedList = data.notifications

        if (!isInitialSyncDone.current) {
          // Initial population
          fetchedList.forEach((n: any) => knownNotificationIds.current.add(n.id))
          DEFAULT_NOTIFICATIONS[role]?.forEach((n) => knownNotificationIds.current.add(n.id))

          if (fetchedList.length > 0) {
            const formatted: NotificationItem[] = fetchedList.map((n: any) => ({
              id: n.id,
              title: n.title,
              description: n.message,
              time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              unread: true,
              type: 'info',
              link: role === 'admin' ? '/admin/notifications' : '/dashboard/notifications',
            }))
            setNotifications(formatted)
          }
          isInitialSyncDone.current = true
        } else {
          // Detect brand new real-time notifications
          const newItems = fetchedList.filter((n: any) => !knownNotificationIds.current.has(n.id))
          if (newItems.length > 0) {
            newItems.forEach((n: any) => {
              knownNotificationIds.current.add(n.id)
              // Trigger audio chime, vibration & mobile push notification
              dispatchNativeNotification({
                id: n.id,
                title: n.title,
                message: n.message,
                createdByName: n.createdByName,
                link: role === 'admin' ? '/admin/notifications' : '/dashboard/notifications',
              })
              // Show in-app live toast
              setRealtimeToast({
                id: n.id,
                title: n.title,
                message: n.message,
                createdByName: n.createdByName,
                link: role === 'admin' ? '/admin/notifications' : '/dashboard/notifications',
              })
            })

            const formattedNew: NotificationItem[] = newItems.map((n: any) => ({
              id: n.id,
              title: n.title,
              description: n.message,
              time: 'Just now',
              unread: true,
              type: 'info',
              link: role === 'admin' ? '/admin/notifications' : '/dashboard/notifications',
            }))

            setNotifications((prev) => [...formattedNew, ...prev])
          }
        }
      }
    } catch {}
  }

  // Polling loop: checks every 15s for genuine newly posted events, announcements, or materials
  useEffect(() => {
    syncNotifications()
    const interval = setInterval(syncNotifications, 15000)
    return () => clearInterval(interval)
  }, [role])

  // Handle user requesting push permission
  const handleEnablePush = async () => {
    const perm = await requestNotificationPermission()
    setPushPermission(perm)
    if (perm === 'granted') {
      playNotificationChime()
      triggerDeviceVibration([200, 100, 200])
    }
  }

  const updatePortalState = () => {
    try {
      const cached = localStorage.getItem('vsb-portal-config')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.accentColor) setAccentColor(parsed.accentColor)
        if (parsed.menus && Array.isArray(parsed.menus)) {
          const map: Record<string, boolean> = {}
          const meta: Record<string, { label?: string; badgeText?: string; badgeColor?: string }> = {}
          parsed.menus.forEach((m: any) => {
            map[m.id] = m.visible
            meta[m.id] = {
              label: m.label,
              badgeText: m.badgeText,
              badgeColor: m.badgeColor,
            }
          })
          setVisibleMenuMap(map)
          setMenuMetaMap(meta)
        }
      }
    } catch {}
  }

  useEffect(() => {
    updatePortalState()
    const handleConfigChange = () => updatePortalState()
    window.addEventListener('portal-config-updated', handleConfigChange)
    return () => window.removeEventListener('portal-config-updated', handleConfigChange)
  }, [])

  const baseNavItems = navItems || navItemsMap[role] || []
  
  // Filter nav items based on admin menu preferences
  const resolvedNavItems = baseNavItems.filter((item) => {
    const lower = item.href.toLowerCase()
    let key = ''
    if (lower.includes('profile')) key = 'profile'
    else if (lower.includes('student')) key = 'students'
    else if (lower.includes('faculty')) key = 'faculty'
    else if (lower.includes('hod')) key = 'hod'
    else if (lower.includes('admins')) key = 'admins'
    else if (lower.includes('roles')) key = 'roles'
    else if (lower.includes('academic') || lower.includes('subject')) key = 'academics'
    else if (lower.includes('resource') || lower.includes('study')) key = 'resources'
    else if (lower.includes('question')) key = 'questions'
    else if (lower.includes('project')) key = 'projects'
    else if (lower.includes('event')) key = 'events'
    else if (lower.includes('announcement')) key = 'announcements'
    else if (lower.includes('achievement')) key = 'achievements'
    else if (lower.includes('notification')) key = 'notifications'
    else if (lower.includes('report')) key = 'reports'
    else if (lower.includes('log') || lower.includes('activity')) key = 'logs'
    else if (lower.includes('/files') || lower.endsWith('files')) key = 'files'
    else if (lower.includes('setting')) key = 'settings'

    if (key && visibleMenuMap[key] === false) {
      return false
    }
    return true
  })

  // Auto-scroll active menu item into view in sidebar
  useEffect(() => {
    if (navContainerRef.current) {
      const activeEl = navContainerRef.current.querySelector('[data-active="true"]') as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [pathname, activePath, resolvedNavItems])
  
  const roleBadge = roleBadgeMap[role] || roleBadgeMap.student

  const unreadCount = notifications.filter((n) => n.unread).length

  // Role-specific URLs
  const notificationsHref =
    role === 'hod'
      ? '/hod-dashboard/notifications'
      : role === 'faculty'
      ? '/faculty-dashboard/notifications'
      : role === 'admin'
      ? '/admin/notifications'
      : '/dashboard/notifications'

  const profileHref =
    role === 'hod'
      ? '/hod-dashboard/profile'
      : role === 'faculty'
      ? '/faculty-dashboard/profile'
      : role === 'admin'
      ? '/admin/profile'
      : '/dashboard/profile'

  // Eagerly prefetch all portal nav routes in parallel for instant 0ms switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      resolvedNavItems.forEach((item) => {
        try {
          router.prefetch(item.href)
        } catch {}
      })
    }
  }, [resolvedNavItems, router])

  // Close drawer and stop navigation progress on route change
  useEffect(() => {
    setIsDrawerOpen(false)
    setIsNotificationOpen(false)
    setIsNavigating(false)
    setActivePath(pathname)
  }, [pathname])

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    // Clear cookies on client side
    document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;'
    document.cookie = 'otp-challenge=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;'
    window.location.href = '/login'
  }

  const handleNavClick = (href: string) => {
    setIsDrawerOpen(false)
    setActivePath(href)
  }

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#071A3D] relative">
      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Navigation Drawer / Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#071A3D] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-[#1455D9]/20 shadow-2xl',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Drawer Header with Official Emblem */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#E7B93E] via-[#FFF3B8] to-[#B8860B] shadow-[0_0_16px_rgba(231,185,62,0.45)] ring-2 ring-white/30 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(231,185,62,0.7)]">
                <div className="w-full h-full rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/college-emblem.png"
                    alt="V.S.B. Engineering College Official Emblem"
                    width={42}
                    height={42}
                    className="w-full h-full object-contain rounded-full drop-shadow-xs"
                    priority
                  />
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white leading-tight tracking-wide truncate">V.S.B. ENGINEERING</p>
              <p className="text-xs text-[#22C7E8] font-bold tracking-wider truncate">AI &amp; DS DEPARTMENT</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Profile Card in Drawer */}
        <Link
          href={profileHref}
          onClick={() => handleNavClick(profileHref)}
          className={cn(
            'p-4 mx-3 my-3 rounded-2xl border transition-all flex items-center gap-3 shrink-0 cursor-pointer',
            (activePath || pathname) === profileHref
              ? 'bg-white/15 border-white/30 shadow-md'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          )}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
            {userName.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate leading-tight">{userName}</h4>
            <p className="text-[11px] text-gray-300 truncate mt-0.5">{userEmail || 'AI & DS Dept'}</p>
            <span
              className={cn(
                'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5',
                roleBadge.color
              )}
            >
              {roleBadge.label}
            </span>
          </div>
        </Link>

        {/* Navigation Link Items */}
        <nav
          ref={navContainerRef}
          className="flex-1 overflow-y-auto px-3 py-2 space-y-1"
          aria-label="Main navigation"
          style={{ scrollbarWidth: 'thin' }}
        >
          {resolvedNavItems.map((item) => {
            const current = activePath || pathname
            const exactMatchExists = resolvedNavItems.some((i) => i.href === current)
            const isRootDashboard =
              item.href === '/dashboard' ||
              item.href === '/faculty-dashboard' ||
              item.href === '/hod-dashboard' ||
              item.href === '/admin' ||
              item.href === '/admin/dashboard'
            const isActive = exactMatchExists
              ? current === item.href
              : isRootDashboard
              ? current === item.href
              : current === item.href || current.startsWith(item.href + '/')
            let key = ''
            const lower = item.href.toLowerCase()
            if (lower.includes('profile')) key = 'profile'
            else if (lower.includes('student')) key = 'students'
            else if (lower.includes('faculty')) key = 'faculty'
            else if (lower.includes('hod')) key = 'hod'
            else if (lower.includes('admins')) key = 'admins'
            else if (lower.includes('roles')) key = 'roles'
            else if (lower.includes('academic') || lower.includes('subject')) key = 'academics'
            else if (lower.includes('resource') || lower.includes('study')) key = 'resources'
            else if (lower.includes('question')) key = 'questions'
            else if (lower.includes('project')) key = 'projects'
            else if (lower.includes('event')) key = 'events'
            else if (lower.includes('announcement')) key = 'announcements'
            else if (lower.includes('achievement')) key = 'achievements'
            else if (lower.includes('notification')) key = 'notifications'
            else if (lower.includes('report')) key = 'reports'
            else if (lower.includes('log') || lower.includes('activity')) key = 'logs'
            else if (lower.includes('/files') || lower.endsWith('files')) key = 'files'
            else if (lower.includes('setting')) key = 'settings'

            const meta = key ? menuMetaMap[key] : null
            const displayLabel = meta?.label || item.label

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                data-active={isActive ? 'true' : 'false'}
                onMouseEnter={() => {
                  try {
                    router.prefetch(item.href)
                  } catch {}
                }}
                onMouseDown={() => {
                  try {
                    router.prefetch(item.href)
                  } catch {}
                }}
                onClick={() => handleNavClick(item.href)}
                style={isActive ? { backgroundColor: accentColor, boxShadow: `0 4px 14px ${accentColor}60` } : {}}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'text-white shadow-md'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn('shrink-0 text-base', isActive ? 'text-white' : 'text-[#22C7E8]')}>
                    {item.icon}
                  </span>
                  <span className="truncate">{displayLabel}</span>
                </div>

                {meta?.badgeText && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white shrink-0 ml-1.5 shadow-2xs"
                    style={{ backgroundColor: meta.badgeColor || '#1455D9' }}
                  >
                    {meta.badgeText}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Drawer Footer with Logout */}
        <div className="p-3 border-t border-white/10 bg-white/5">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs lg:pl-72">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Hamburger Menu & Brand on Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl text-[#071A3D] hover:bg-gray-100 lg:hidden transition-colors"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href={role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard'} className="flex items-center gap-2.5 lg:hidden">
              <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-[#E7B93E] via-[#FFF3B8] to-[#B8860B] shadow-[0_0_10px_rgba(231,185,62,0.4)] flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden">
                  <Image
                    src="/college-emblem.png"
                    alt="V.S.B. Emblem"
                    width={30}
                    height={30}
                    className="rounded-full object-contain"
                  />
                </div>
              </div>
              <span className="text-sm font-black text-[#071A3D] tracking-tight">VSB AI &amp; DS</span>
            </Link>
          </div>

          {/* Desktop Right Profile & Notification Actions */}
          <div className="flex items-center gap-3 ml-auto relative" ref={notificationRef}>
            {/* Interactive Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={cn(
                  'relative p-2.5 rounded-full transition-colors flex items-center justify-center',
                  isNotificationOpen ? 'bg-[#1455D9]/10 text-[#1455D9]' : 'hover:bg-gray-100 text-[#071A3D]'
                )}
                aria-label="Toggle notifications"
                aria-expanded={isNotificationOpen}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    onClick={() => setIsNotificationOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:hidden"
                  />

                  <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-[400px] max-w-[calc(100vw-24px)] rounded-3xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right flex flex-col font-sans">
                    {/* Dropdown Header */}
                    <div className="p-4 bg-[#071A41] text-white flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <Bell className="w-4 h-4 text-[#F4C430]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black tracking-wide text-white">Department Alerts</h3>
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-[#F4C430] text-[#071A41] rounded-full text-[10px] font-black">
                                {unreadCount} New
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-blue-200 font-medium">Real-time academic broadcast</p>
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs bg-white/10 hover:bg-white/20 text-white font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>

                    {/* Real-Time Live Notification Status Banner */}
                    <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-blue-50/90 border-b border-blue-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
                        <span className="text-[11px] font-black text-[#071A41] truncate">
                          Live Real-Time Alerts Active
                        </span>
                      </div>

                      {pushPermission !== 'granted' && (
                        <button
                          onClick={handleEnablePush}
                          className="px-2.5 py-1 rounded-lg bg-[#1557C0] hover:bg-[#0e44b5] text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                        >
                          Enable Browser Push
                        </button>
                      )}
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-slate-100 bg-white" style={{ scrollbarWidth: 'thin' }}>
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 font-medium">
                          No alerts at this moment
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                              )
                            }}
                            className={cn(
                              'p-3.5 sm:p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3',
                              item.unread ? 'bg-blue-50/50' : 'bg-white'
                            )}
                          >
                            <div className="mt-0.5 shrink-0">
                              {(item.type === 'alert' || item.type === 'warning') && (
                                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                              )}
                              {item.type === 'approval' && (
                                <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                                  <FileQuestion className="w-4 h-4" />
                                </div>
                              )}
                              {item.type === 'success' && (
                                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              )}
                              {item.type === 'info' && (
                                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-[#1557C0] flex items-center justify-center shadow-xs">
                                  <Sparkles className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-1.5">
                                <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-1">
                                  {item.title.replace(/^\?\?\s*/, '📢 ')}
                                </h4>
                                {item.unread && (
                                  <span className="w-2 h-2 rounded-full bg-[#1557C0] shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-slate-700 font-medium mt-1 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                              <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1.5 block">
                                {item.time}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Dropdown Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                      <Link
                        href={notificationsHref}
                        onClick={() => setIsNotificationOpen(false)}
                        className="text-xs font-black text-[#1557C0] hover:underline inline-flex items-center gap-1.5 p-1"
                      >
                        <span>View All Notifications</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar & Name */}
            <Link
              href={profileHref}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-[#1455D9] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {userName.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-[#071A3D] max-w-[120px] truncate">
                {userName}
              </span>
            </Link>

            {/* Top Header Direct Logout Action */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Logout from portal"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-red-200/80 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lg:pl-72 pb-28 lg:pb-8 min-h-[calc(100vh-64px)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>

      {/* Mobile Bottom 4-Tab Navigation Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 grid grid-cols-4 py-2 px-1 pb-safe shadow-lg"
        aria-label="Bottom mobile navigation"
      >
        <Link
          href={role === 'admin' ? '/admin/dashboard' : role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard'}
          prefetch={true}
          onMouseEnter={() => { try { router.prefetch(role === 'admin' ? '/admin/dashboard' : role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard') } catch {} }}
          onMouseDown={() => { try { router.prefetch(role === 'admin' ? '/admin/dashboard' : role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard') } catch {} }}
          onClick={() => handleNavClick(role === 'admin' ? '/admin/dashboard' : role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-colors',
            (activePath || pathname) === '/dashboard' || (activePath || pathname) === '/faculty-dashboard' || (activePath || pathname) === '/hod-dashboard' || (activePath || pathname) === '/admin/dashboard'
              ? 'text-[#1455D9]'
              : 'text-gray-500 hover:text-[#071A3D]'
          )}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link
          href={role === 'admin' ? '/admin/academics' : role === 'hod' ? '/hod-dashboard/academics' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects'}
          prefetch={true}
          onMouseEnter={() => { try { router.prefetch(role === 'admin' ? '/admin/academics' : role === 'hod' ? '/hod-dashboard/academics' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects') } catch {} }}
          onMouseDown={() => { try { router.prefetch(role === 'admin' ? '/admin/academics' : role === 'hod' ? '/hod-dashboard/academics' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects') } catch {} }}
          onClick={() => handleNavClick(role === 'admin' ? '/admin/academics' : role === 'hod' ? '/hod-dashboard/academics' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-colors',
            (activePath || pathname).includes('subjects') || (activePath || pathname).includes('academics') || (activePath || pathname).includes('courses')
              ? 'text-[#1455D9]'
              : 'text-gray-500 hover:text-[#071A3D]'
          )}
        >
          <BookOpen className="h-5 w-5" />
          <span>Courses</span>
        </Link>
        <Link
          href={role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects'}
          prefetch={true}
          onMouseEnter={() => { try { router.prefetch(role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects') } catch {} }}
          onMouseDown={() => { try { router.prefetch(role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects') } catch {} }}
          onClick={() => handleNavClick(role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-colors',
            (activePath || pathname).includes('projects') ? 'text-[#1455D9]' : 'text-gray-500 hover:text-[#071A3D]'
          )}
        >
          <FolderOpen className="h-5 w-5" />
          <span>Projects</span>
        </Link>
        <Link
          href={profileHref}
          prefetch={true}
          onMouseEnter={() => { try { router.prefetch(profileHref) } catch {} }}
          onMouseDown={() => { try { router.prefetch(profileHref) } catch {} }}
          onClick={() => handleNavClick(profileHref)}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-colors',
            (activePath || pathname).includes('profile') ? 'text-[#1455D9]' : 'text-gray-500 hover:text-[#071A3D]'
          )}
        >
          <UserIcon className="h-5 w-5" />
          <span>Profile</span>
        </Link>
      </nav>

      {/* Real-time In-App Floating Toast Notification */}
      <RealtimeNotificationToast
        toast={realtimeToast}
        onDismiss={() => setRealtimeToast(null)}
      />

      {/* Floating AI Chatbot Bottom-Right Icon */}
      <FloatingChatbot />
    </div>
  )
}