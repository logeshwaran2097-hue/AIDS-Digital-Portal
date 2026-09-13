'use client'

import * as React from 'react'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  Download,
  Smartphone,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'
import { studentNavItems, facultyNavItems, hodNavItems, adminNavItems } from './navItems'
import { FloatingChatbot } from '@/components/FloatingChatbot'
import { RealtimeAppDownloader } from '@/components/RealtimeAppDownloader'
import { RealtimeNotificationToast, RealtimeToastData } from '@/components/notifications/RealtimeNotificationToast'
import {
  playNotificationChime,
  triggerDeviceVibration,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  dispatchNativeNotification,
} from '@/lib/notificationEngine'
import { categorizeNotification, getMenuCategoryKey } from '@/lib/notificationClassifier'

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface PortalLayoutProps {
  role: 'student' | 'faculty' | 'hod' | 'admin'
  userName: string
  userEmail?: string
  userImage?: string | null
  profileImage?: string | null
  navItems?: NavItem[]
  roleBadgeLabel?: string
  isAdvisor?: boolean
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
  faculty: { label: 'Faculty', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
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

const DEFAULT_NOTIFICATIONS: Record<string, NotificationItem[]> = {}

export function PortalLayout({
  role,
  userName,
  userEmail,
  userImage,
  profileImage,
  navItems,
  roleBadgeLabel,
  isAdvisor,
  children,
}: PortalLayoutProps) {
  const [avatarImage, setAvatarImage] = useState<string | null>(userImage || profileImage || null)
  const [avatarError, setAvatarError] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [activePath, setActivePath] = useState('')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [realtimeToast, setRealtimeToast] = useState<RealtimeToastData | null>(null)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')
  const [isTestingPush, setIsTestingPush] = useState(false)
  const knownNotificationIds = useRef<Set<string>>(new Set())
  const isInitialSyncDone = useRef<boolean>(false)

  const notificationRef = useRef<HTMLDivElement>(null)
  const menuNotifRef = useRef<HTMLDivElement>(null)
  const navContainerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const [accentColor, setAccentColor] = useState('#1455D9')
  const [visibleMenuMap, setVisibleMenuMap] = useState<Record<string, boolean>>({})
  const [menuMetaMap, setMenuMetaMap] = useState<Record<string, { label?: string; badgeText?: string; badgeColor?: string }>>({})
  const [apiMenuCounts, setApiMenuCounts] = useState<Record<string, number>>({})
  const [isMenuNotifOpen, setIsMenuNotifOpen] = useState(false)

  // Direct 1-Click PWA App Installation
  const deferredInstallPrompt = useRef<any>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isAppInstalled, setIsAppInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if already opened in standalone installed mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    if (standalone) {
      setIsAppInstalled(true)
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredInstallPrompt.current = e
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      deferredInstallPrompt.current = null
      setCanInstall(false)
      setIsAppInstalled(true)
      playNotificationChime()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleDirectInstall = async () => {
    if (typeof window !== 'undefined' && (window as any).__triggerPwaInstall) {
      ;(window as any).__triggerPwaInstall()
    }
  }

  // Register Service Worker and check notification permission
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

  // Sync profile image from props, localStorage, and /api/auth/me
  useEffect(() => {
    if (userImage || profileImage) {
      setAvatarImage(userImage || profileImage || null)
      setAvatarError(false)
      if (typeof window !== 'undefined' && (userImage || profileImage)) {
        localStorage.setItem('user_profile_image', (userImage || profileImage) as string)
      }
    }
  }, [userImage, profileImage])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Initial check in localStorage if avatarImage is still empty
    if (!avatarImage) {
      const cached = localStorage.getItem('user_profile_image')
      if (cached) {
        setAvatarImage(cached)
      } else {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.startsWith('vsb_student_profile_') || key.startsWith('portal_profile_'))) {
              const item = localStorage.getItem(key)
              if (item) {
                const parsed = JSON.parse(item)
                if (parsed?.profileImage) {
                  setAvatarImage(parsed.profileImage)
                  localStorage.setItem('user_profile_image', parsed.profileImage)
                  break
                }
              }
            }
          }
        } catch {}
      }
    }

    // 2. Fetch fresh user info from /api/auth/me
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success && data?.user?.profileImage) {
          setAvatarImage(data.user.profileImage)
          setAvatarError(false)
          localStorage.setItem('user_profile_image', data.user.profileImage)
        }
      })
      .catch(() => {})

    // 3. Listen to realtime profile image update events across the portal
    const handleProfileUpdate = (e: any) => {
      const newImg = e.detail || localStorage.getItem('user_profile_image')
      if (newImg) {
        setAvatarImage(newImg)
        setAvatarError(false)
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_profile_image' && e.newValue) {
        setAvatarImage(e.newValue)
        setAvatarError(false)
      }
    }

    window.addEventListener('portal-profile-image-updated', handleProfileUpdate)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('portal-profile-image-updated', handleProfileUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [avatarImage])

  // Sync real-time notifications from API
  const syncNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?role=${role}&limit=20`)
      if (!res.ok) return
      const data = await res.json()
      if (data.success && Array.isArray(data.notifications)) {
        if (data.menuCounts && typeof data.menuCounts === 'object') {
          setApiMenuCounts(data.menuCounts)
        }
        const fetchedList = data.notifications

        if (!isInitialSyncDone.current) {
          // Initial population
          fetchedList.forEach((n: any) => knownNotificationIds.current.add(n.id))

          const notifLink = role === 'admin' ? '/admin/notifications' : role === 'hod' ? '/hod-dashboard/notifications' : role === 'faculty' ? '/faculty-dashboard/notifications' : '/dashboard/notifications'

          const formatted: NotificationItem[] = fetchedList.map((n: any) => ({
            id: n.id,
            title: n.title,
            description: n.message,
            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            unread: typeof n.isRead === 'boolean' ? !n.isRead : true,
            type: 'info',
            link: notifLink,
          }))
          setNotifications(formatted)
          isInitialSyncDone.current = true
        } else {
          // Detect brand new real-time notifications
          const newItems = fetchedList.filter((n: any) => !knownNotificationIds.current.has(n.id))
          if (newItems.length > 0) {
            const notifLink = role === 'admin' ? '/admin/notifications' : role === 'hod' ? '/hod-dashboard/notifications' : role === 'faculty' ? '/faculty-dashboard/notifications' : '/dashboard/notifications'

            newItems.forEach((n: any) => {
              knownNotificationIds.current.add(n.id)
              // Trigger audio chime, vibration & mobile push notification
              dispatchNativeNotification({
                id: n.id,
                title: n.title,
                message: n.message,
                createdByName: n.createdByName,
                link: notifLink,
              })
              // Show in-app live toast
              setRealtimeToast({
                id: n.id,
                title: n.title,
                message: n.message,
                createdByName: n.createdByName,
                link: notifLink,
              })
            })

            const formattedNew: NotificationItem[] = newItems.map((n: any) => ({
              id: n.id,
              title: n.title,
              description: n.message,
              time: 'Just now',
              unread: typeof n.isRead === 'boolean' ? !n.isRead : true,
              type: 'info',
              link: notifLink,
            }))

            setNotifications((prev) => [...formattedNew, ...prev])
          }
        }
      }
    } catch {}
  }

  // Polling loop: gentle background check every 45s to avoid exhausting database connections
  useEffect(() => {
    syncNotifications()
    const interval = setInterval(syncNotifications, 45000)
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

  // Listen to cross-component mark-read events across portal
  useEffect(() => {
    const handleMarkedRead = (e: any) => {
      const specificId = e?.detail?.id
      if (specificId) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === specificId ? { ...n, unread: false } : n))
        )
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
        setApiMenuCounts({})
      }
      syncNotifications()
    }

    window.addEventListener('portal-notifications-marked-read', handleMarkedRead)
    return () => window.removeEventListener('portal-notifications-marked-read', handleMarkedRead)
  }, [])

  // Auto-mark domain notifications as read when user navigates into that specific section
  useEffect(() => {
    if (!pathname) return
    const matchingKey = getMenuCategoryKey(pathname, '')
    if (matchingKey && matchingKey !== 'notifications') {
      const unreadForDomain = notifications.filter(
        (n) => n.unread && categorizeNotification(n.title, n.description) === matchingKey
      )
      if (unreadForDomain.length > 0) {
        unreadForDomain.forEach((n) => {
          fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: n.id }),
          }).catch(() => {})
        })
        setNotifications((prev) =>
          prev.map((n) =>
            unreadForDomain.some((u) => u.id === n.id) ? { ...n, unread: false } : n
          )
        )
        setApiMenuCounts((prev) => {
          const next = { ...prev }
          delete next[matchingKey]
          return next
        })
      }
    }
  }, [pathname, notifications])

  // Cache and determine advisor status for faculty role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (typeof isAdvisor === 'boolean') {
        sessionStorage.setItem('vsb_faculty_is_advisor', String(isAdvisor))
      } else if (roleBadgeLabel) {
        sessionStorage.setItem('vsb_faculty_is_advisor', String(roleBadgeLabel.toLowerCase().includes('advisor')))
      }
    }
  }, [isAdvisor, roleBadgeLabel])

  const [cachedAdvisor] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      const v = sessionStorage.getItem('vsb_faculty_is_advisor')
      if (v !== null) return v === 'true'
    }
    return null
  })

  const isFacultyAdvisor =
    typeof isAdvisor === 'boolean'
      ? isAdvisor
      : roleBadgeLabel
      ? roleBadgeLabel.toLowerCase().includes('advisor')
      : (cachedAdvisor ?? false)

  const roleBadge = roleBadgeMap[role] || roleBadgeMap.student
  const isLabHandler = roleBadgeLabel === 'Lab Handler' || roleBadgeLabel === 'Lab In-charge'

  const effectiveRoleBadgeColor = isLabHandler
    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    : isFacultyAdvisor
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : roleBadge.color

  const effectiveRoleBadgeLabel =
    roleBadgeLabel ||
    (role === 'faculty' ? (isFacultyAdvisor ? 'Class Advisor' : isLabHandler ? 'Lab Handler' : 'Faculty Member') : roleBadge.label)

  const rawNavItems = navItems || navItemsMap[role] || []
  const baseNavItems = rawNavItems.filter((item) => {
    // If faculty is not a class advisor, hide the Class Students, Event Proofs, and OD & Leave Requests links
    if (role === 'faculty' && !isFacultyAdvisor && (
      item.href.includes('/faculty-dashboard/students') ||
      item.href.includes('/faculty-dashboard/od-proofs') ||
      item.href.includes('/faculty-dashboard/od-applications')
    )) {
      return false
    }
    // If faculty is a class advisor, they have no allocated teaching subjects:
    // Hide "My Subjects", "Resources", and "Question Papers"
    if (role === 'faculty' && isFacultyAdvisor) {
      if (
        item.href.includes('/faculty-dashboard/subjects') ||
        item.href.includes('/faculty-dashboard/resources') ||
        item.href.includes('/faculty-dashboard/question-papers')
      ) {
        return false
      }
    }
    return true
  })
  
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
    else if (lower.includes('od-applications')) key = 'od-applications'
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
  
  const unreadCount = notifications.filter((n) => n.unread).length

  // Calculate notification counts per menu item
  const getMenuNotificationCount = useCallback(
    (href: string, label: string): number => {
      // 1. Root dashboards NEVER show notification badges
      const isRootDashboard =
        href === '/dashboard' ||
        href === '/faculty-dashboard' ||
        href === '/hod-dashboard' ||
        href === '/admin' ||
        href === '/admin/dashboard'
      if (isRootDashboard) return 0

      const lowerHref = href.toLowerCase()
      const lowerLabel = label.toLowerCase()

      // 2. Main Notifications menu item returns total unread count
      if (lowerHref.includes('/notifications') || lowerLabel === 'notifications') {
        return unreadCount > 0 ? unreadCount : (apiMenuCounts['notifications'] || 0)
      }

      // 3. Resolve canonical domain key for this menu
      const menuKey = getMenuCategoryKey(href, label)
      if (!menuKey) return 0

      // 4. API pre-aggregated counts
      let count = apiMenuCounts[menuKey] || 0
      if (menuKey === 'subjects') {
        count = Math.max(count, apiMenuCounts['academics'] || 0)
      } else if (menuKey === 'resources') {
        count = Math.max(count, apiMenuCounts['study'] || 0)
      }

      // 5. In-memory unread notification objects matching this domain
      const unreadMatches = notifications.filter((n) => {
        if (!n.unread) return false
        const domain = categorizeNotification(n.title, n.description)
        return domain === menuKey
      }).length

      return Math.max(count, unreadMatches)
    },
    [notifications, unreadCount, apiMenuCounts]
  )

  const menusWithNotifications = useMemo(() => {
    return resolvedNavItems
      .filter((item) => {
        // Exclude generic notifications inbox from menu breakdown
        if (item.href.includes('/notifications') || item.label.toLowerCase() === 'notifications') {
          return false
        }
        // Exclude root dashboards from menu breakdown
        const isRootDashboard =
          item.href === '/dashboard' ||
          item.href === '/faculty-dashboard' ||
          item.href === '/hod-dashboard' ||
          item.href === '/admin' ||
          item.href === '/admin/dashboard'
        if (isRootDashboard) return false

        return getMenuNotificationCount(item.href, item.label) > 0
      })
      .map((item) => ({
        ...item,
        count: getMenuNotificationCount(item.href, item.label),
      }))
  }, [resolvedNavItems, getMenuNotificationCount])

  const totalMenuNotifications = useMemo(() => {
    return menusWithNotifications.reduce((acc, item) => acc + item.count, 0)
  }, [menusWithNotifications])

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
    setIsMenuNotifOpen(false)
    setIsNavigating(false)
    setActivePath(pathname)
  }, [pathname])

  // Click outside to close notification dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
      if (menuNotifRef.current && !menuNotifRef.current.contains(event.target as Node)) {
        setIsMenuNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markOneAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    }).catch(() => {})
    window.dispatchEvent(new CustomEvent('portal-notifications-marked-read', { detail: { id } }))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    setApiMenuCounts({})
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    }).catch(() => {})
    window.dispatchEvent(new CustomEvent('portal-notifications-marked-read'))
  }

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-[#051330] via-[#071A3D] to-[#040D21] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-blue-500/20 shadow-2xl',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Drawer Header with Official Emblem */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#E7B93E] via-[#FFF3B8] to-[#B8860B] shadow-[0_0_18px_rgba(231,185,62,0.5)] ring-2 ring-white/30 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(231,185,62,0.75)]">
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
              <p className="text-sm font-black text-white leading-tight tracking-wide">Digital Portal of AI&amp;DS</p>
              <p className="text-[11px] text-[#22C7E8] font-bold tracking-wider truncate">V.S.B. Engineering College</p>
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
            'p-3.5 mx-3 my-3 rounded-2xl border transition-all flex items-center gap-3 shrink-0 cursor-pointer',
            (activePath || pathname) === profileHref
              ? 'bg-white/15 border-white/30 shadow-md ring-1 ring-white/20'
              : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.12] hover:border-white/20'
          )}
        >
          <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center font-bold text-base shadow-md shrink-0 ring-2 ring-white/20">
            {avatarImage && !avatarError ? (
              <img
                src={avatarImage}
                alt={userName}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              userName.charAt(0) || 'U'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate leading-tight">{userName}</h4>
            <p className="text-[11px] text-gray-300 truncate mt-0.5">{userEmail || 'AI & DS Dept'}</p>
            <span
              className={cn(
                'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5',
                effectiveRoleBadgeColor
              )}
            >
              {effectiveRoleBadgeLabel}
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
            const notifCount = getMenuNotificationCount(item.href, displayLabel)

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
                style={isActive ? { backgroundColor: accentColor, boxShadow: `0 4px 18px ${accentColor}70` } : {}}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer group',
                  isActive
                    ? 'text-white shadow-md ring-1 ring-white/20'
                    : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn('shrink-0 text-base relative', isActive ? 'text-white' : 'text-[#22C7E8]')}>
                    {item.icon}
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#071A3D] animate-ping" />
                    )}
                  </span>
                  <span className="truncate">{displayLabel}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {notifCount > 0 && (
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black tracking-tight shadow-xs animate-pulse transition-all',
                        isActive
                          ? 'bg-white text-[#1455D9] ring-1 ring-white/60'
                          : 'bg-red-500 text-white ring-2 ring-red-400/40'
                      )}
                      title={`${notifCount} notification${notifCount > 1 ? 's' : ''} for ${displayLabel}`}
                    >
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  )}

                  {meta?.badgeText && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: meta.badgeColor || '#1455D9' }}
                    >
                      {meta.badgeText}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>



        {/* Drawer Footer with Logout */}
        <div className="p-3 border-t border-white/10 bg-white/5">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Top Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-xs lg:pl-72">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Hamburger Menu & Brand on Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-xl text-[#071A3D] hover:bg-gray-100 lg:hidden transition-colors"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-6 h-6" />
              {totalMenuNotifications > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  {totalMenuNotifications > 99 ? '99+' : totalMenuNotifications}
                </span>
              )}
            </button>

            {/* Top Menu Bar: Active Menu Notifications & Dropdown */}
            {menusWithNotifications.length > 0 && (
              <div className="relative flex items-center gap-2" ref={menuNotifRef}>
                {/* 1. Direct Quick Chips for top 2 active menus (visible on desktop) */}
                <div className="hidden xl:flex items-center gap-2">
                  {menusWithNotifications.slice(0, 2).map((m) => (
                    <Link
                      key={m.href}
                      href={m.href}
                      onClick={() => handleNavClick(m.href)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-[#071A3D] hover:text-[#1455D9] transition-all text-xs font-bold shadow-2xs group cursor-pointer"
                      title={`${m.count} new notification${m.count > 1 ? 's' : ''} in ${m.label}`}
                    >
                      <span className="text-blue-600 group-hover:scale-110 transition-transform">
                        {m.icon}
                      </span>
                      <span className="truncate max-w-[130px]">{m.label}</span>
                      <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                        {m.count > 99 ? '99+' : m.count}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* 2. Interactive Menu Updates Pill Button (visible across screen sizes) */}
                <button
                  type="button"
                  onClick={() => setIsMenuNotifOpen((prev) => !prev)}
                  className={cn(
                    'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer',
                    isMenuNotifOpen
                      ? 'bg-red-500 text-white border-red-600 ring-2 ring-red-300/50'
                      : 'bg-red-50 hover:bg-red-100/90 text-red-700 border-red-200 hover:border-red-300'
                  )}
                  title="Click to view all menus with notifications"
                  aria-expanded={isMenuNotifOpen}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="tracking-tight">
                    {menusWithNotifications.length}{' '}
                    <span className="hidden sm:inline">Menu{menusWithNotifications.length > 1 ? 's' : ''}</span>
                    <span className="sm:hidden">Menu{menusWithNotifications.length > 1 ? 's' : ''}</span>
                  </span>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded-full text-[10px] font-black',
                      isMenuNotifOpen ? 'bg-white text-red-600' : 'bg-red-500 text-white'
                    )}
                  >
                    {totalMenuNotifications}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      isMenuNotifOpen ? 'rotate-180' : ''
                    )}
                  />
                </button>

                {/* 3. Dropdown Popover showing all menus with their notification counts */}
                {isMenuNotifOpen && (
                  <>
                    {/* Mobile Backdrop */}
                    <div
                      onClick={() => setIsMenuNotifOpen(false)}
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:hidden"
                    />

                    <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 w-auto sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-left flex flex-col font-sans">
                      <div className="p-3.5 bg-[#071A41] text-white flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center text-red-300">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black tracking-wide text-white">Menu Notifications</h4>
                            <p className="text-[10px] text-blue-200">
                              {totalMenuNotifications} alert{totalMenuNotifications > 1 ? 's' : ''} across {menusWithNotifications.length} menu{menusWithNotifications.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black">
                          Active
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1.5 bg-white" style={{ scrollbarWidth: 'thin' }}>
                        {menusWithNotifications.map((m) => (
                          <Link
                            key={m.href}
                            href={m.href}
                            onClick={() => {
                              handleNavClick(m.href)
                              setIsMenuNotifOpen(false)
                            }}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1455D9] group-hover:bg-[#1455D9] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-2xs">
                                {m.icon}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 group-hover:text-[#1455D9] truncate">
                                  {m.label}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  Click to open this section
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-black shrink-0 shadow-2xs group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 transition-colors">
                              {m.count} new
                            </span>
                          </Link>
                        ))}
                      </div>

                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                        <Link
                          href={notificationsHref}
                          onClick={() => setIsMenuNotifOpen(false)}
                          className="text-[11px] font-bold text-[#1455D9] hover:underline inline-flex items-center gap-1"
                        >
                          <span>All Notifications</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setIsMenuNotifOpen(false)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

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
              <span className="text-sm font-black text-[#071A3D] tracking-tight">Digital Portal of AI&amp;DS</span>
            </Link>
          </div>

          {/* Desktop Right Profile & Notification Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 ml-auto relative" ref={notificationRef}>
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
                            onClick={() => markOneAsRead(item.id)}
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
              className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full hover:bg-slate-100/90 transition-all border border-slate-200/80 bg-white/80 backdrop-blur-xs shadow-2xs hover:shadow-xs group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-[#1455D9]/25 shrink-0">
                {avatarImage && !avatarError ? (
                  <img
                    src={avatarImage}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  userName.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-[#071A3D] max-w-[130px] truncate group-hover:text-[#1455D9] transition-colors">
                  {userName}
                </span>
                <span className={cn(
                  'text-[9px] font-extrabold mt-0.5',
                  isLabHandler ? 'text-cyan-600' : isFacultyAdvisor ? 'text-emerald-600' : 'text-slate-600'
                )}>
                  {effectiveRoleBadgeLabel.toUpperCase()}
                </span>
              </div>
            </Link>

            {/* Top Header Direct Logout Action */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              disabled={isLoggingOut}
              title="Logout from portal"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-rose-200/80 bg-rose-50/80 hover:bg-rose-100/90 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102 shadow-2xs disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Logout</span>
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
          href={role === 'admin' ? '/admin/academics' : role === 'hod' ? '/hod-dashboard/od-proofs' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects'}
          prefetch={true}
          onMouseEnter={() => { try { router.prefetch(role === 'admin' ? '/admin/academics' : role === 'hod' ? '/hod-dashboard/od-proofs' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects') } catch {} }}
          onMouseDown={() => { try { router.prefetch(role === 'admin' ? '/admin/academics' : role === 'hod' ? '/hod-dashboard/od-proofs' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects') } catch {} }}
          onClick={() => handleNavClick(role === 'admin' ? '/admin/academics' : role === 'hod' ? '/hod-dashboard/od-proofs' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-colors relative',
            (activePath || pathname).includes('subjects') || (activePath || pathname).includes('academics') || (activePath || pathname).includes('od-proofs')
              ? 'text-[#1455D9]'
              : 'text-gray-500 hover:text-[#071A3D]'
          )}
        >
          <div className="relative">
            {role === 'hod' ? <ShieldCheck className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            {getMenuNotificationCount(role === 'hod' ? '/hod-dashboard/od-proofs' : '/dashboard/subjects', role === 'hod' ? 'OD Proofs' : 'Courses') > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-1 ring-white shadow-xs animate-pulse">
                {getMenuNotificationCount(role === 'hod' ? '/hod-dashboard/od-proofs' : '/dashboard/subjects', role === 'hod' ? 'OD Proofs' : 'Courses') > 9 ? '9+' : getMenuNotificationCount(role === 'hod' ? '/hod-dashboard/od-proofs' : '/dashboard/subjects', role === 'hod' ? 'OD Proofs' : 'Courses')}
              </span>
            )}
          </div>
          <span>{role === 'hod' ? 'OD Proofs' : 'Courses'}</span>
        </Link>
        <Link
          href={role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects'}
          prefetch={true}
          onMouseEnter={() => { try { router.prefetch(role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects') } catch {} }}
          onMouseDown={() => { try { router.prefetch(role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects') } catch {} }}
          onClick={() => handleNavClick(role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-colors relative',
            (activePath || pathname).includes('projects') ? 'text-[#1455D9]' : 'text-gray-500 hover:text-[#071A3D]'
          )}
        >
          <div className="relative">
            <FolderOpen className="h-5 w-5" />
            {getMenuNotificationCount(role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects', 'Projects') > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-1 ring-white shadow-xs animate-pulse">
                {getMenuNotificationCount(role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects', 'Projects') > 9 ? '9+' : getMenuNotificationCount(role === 'admin' ? '/admin/projects' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/projects' : '/dashboard/projects', 'Projects')}
              </span>
            )}
          </div>
          <span>Projects</span>
        </Link>
        <Link
          href={notificationsHref}
          prefetch={true}
          onClick={() => handleNavClick(notificationsHref)}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-colors relative',
            (activePath || pathname).includes('notifications') ? 'text-[#1455D9]' : 'text-gray-500 hover:text-[#071A3D]'
          )}
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-1 ring-white shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span>Alerts</span>
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

      {/* Real-Time App Downloader Modal */}
      <RealtimeAppDownloader
        isOpen={isDownloaderOpen}
        onClose={() => setIsDownloaderOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A3D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-inner ring-8 ring-red-50">
              <LogOut className="w-8 h-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-[#071A3D] mb-1">
              Confirm Sign Out
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to end your current session for <strong className="text-[#071A3D] font-bold">{userName}</strong> ({role.toUpperCase()})?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="px-4 py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Yes, Sign Out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}