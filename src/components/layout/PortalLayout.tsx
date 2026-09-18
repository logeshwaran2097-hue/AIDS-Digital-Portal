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
  Target,
  Users,
  School,
  Bus,
  Sun,
  Moon,
} from 'lucide-react'
import { studentNavItems, facultyNavItems, hodNavItems, adminNavItems } from './navItems'
import { FloatingChatbot } from '@/components/ai/FloatingChatbot'
import { RealtimeAppDownloader } from '@/components/pwa/RealtimeAppDownloader'
import { RealtimeNotificationToast, RealtimeToastData } from '@/components/notifications/RealtimeNotificationToast'
import {
  playNotificationChime,
  triggerDeviceVibration,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  dispatchNativeNotification,
  subscribeUserToPush,
  isPushSubscribed,
} from '@/lib/notificationEngine'
import { categorizeNotification, getMenuCategoryKey } from '@/lib/notificationClassifier'
import { NotificationDetailModal, NotificationDetailData } from '@/components/notifications/NotificationDetailModal'
import { toast } from '@/components/ui/Toast'
import { VisionMissionModal } from '@/components/about/VisionMissionModal'
import { APP_VERSION, APP_VERSION_LABEL } from '@/lib/version'
import { triggerPortalUpdateCheck } from '@/components/pwa/VersionUpdateNotifier'

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
  residencyStatus?: string
  children: React.ReactNode
}

const navItemsMap: Record<string, NavItem[]> = {
  student: studentNavItems,
  faculty: facultyNavItems,
  hod: hodNavItems,
  admin: adminNavItems,
}

const roleBadgeMap: Record<string, { label: string; color: string }> = {
  student: {
    label: 'Student Scholar',
    color: 'bg-gradient-to-r from-blue-600/25 to-cyan-500/20 text-cyan-300 border-cyan-400/35 shadow-[0_0_12px_rgba(34,197,232,0.15)]',
  },
  faculty: {
    label: 'Faculty Member',
    color: 'bg-gradient-to-r from-emerald-600/25 to-teal-500/20 text-emerald-300 border-emerald-400/35 shadow-[0_0_12px_rgba(52,211,153,0.15)]',
  },
  hod: {
    label: 'Head of Department',
    color: 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_14px_rgba(244,196,48,0.25)]',
  },
  admin: {
    label: 'System Administrator',
    color: 'bg-gradient-to-r from-purple-600/30 to-indigo-500/20 text-purple-200 border-purple-400/35 shadow-[0_0_14px_rgba(168,85,247,0.2)]',
  },
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
  residencyStatus,
  children,
}: PortalLayoutProps) {
  const [studentResidency, setStudentResidency] = useState<string | null>(() => {
    if (residencyStatus) return residencyStatus
    if (typeof window === 'undefined') return null
    try {
      const direct = localStorage.getItem('vsb_student_residency')
      if (direct) return direct
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && (k.startsWith('vsb_student_profile_') || k.startsWith('portal_profile_'))) {
          const val = localStorage.getItem(k)
          if (val) {
            const parsed = JSON.parse(val)
            if (parsed?.residencyStatus) return parsed.residencyStatus
          }
        }
      }
    } catch {}
    return null
  })

  useEffect(() => {
    if (residencyStatus) {
      setStudentResidency(residencyStatus)
      try {
        localStorage.setItem('vsb_student_residency', residencyStatus)
      } catch {}
    }
  }, [residencyStatus])

  const [avatarImage, setAvatarImage] = useState<string | null>(userImage || profileImage || null)
  const [avatarError, setAvatarError] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false)
  const [showVisionModal, setShowVisionModal] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [activePath, setActivePath] = useState('')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [realtimeToast, setRealtimeToast] = useState<RealtimeToastData | null>(null)
  const [activeDetailNotification, setActiveDetailNotification] = useState<NotificationDetailData | null>(null)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')
  const [isTestingPush, setIsTestingPush] = useState(false)
  const [isPermissionBannerDismissed, setIsPermissionBannerDismissed] = useState(false)
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
    if (standalone || localStorage.getItem('pwa_installed') === 'true') {
      setIsAppInstalled(true)
      return
    }

    if ((window as any).__pwaInstallPrompt) {
      deferredInstallPrompt.current = (window as any).__pwaInstallPrompt
      setCanInstall(true)
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredInstallPrompt.current = e
      ;(window as any).__pwaInstallPrompt = e
      setCanInstall(true)
    }

    const handlePromptCaptured = () => {
      if ((window as any).__pwaInstallPrompt) {
        deferredInstallPrompt.current = (window as any).__pwaInstallPrompt
        setCanInstall(true)
      }
    }

    const handleAppInstalled = () => {
      deferredInstallPrompt.current = null
      ;(window as any).__pwaInstallPrompt = null
      setCanInstall(false)
      setIsAppInstalled(true)
      try {
        localStorage.setItem('pwa_installed', 'true')
      } catch {}
      playNotificationChime()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('pwa-prompt-captured', handlePromptCaptured)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('pwa-prompt-captured', handlePromptCaptured)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleDirectInstall = () => {
    if (typeof window !== 'undefined') {
      if ((window as any).__openAppSecurityInstallModal) {
        ;(window as any).__openAppSecurityInstallModal()
      } else if ((window as any).__triggerPwaInstall) {
        ;(window as any).__triggerPwaInstall()
      }
    }
  }

  // Register Service Worker and check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPerm = getNotificationPermissionStatus()
      setPushPermission(currentPerm)


      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          try { reg.update() } catch (e) {}
        }).catch((err) => {
          console.debug('ServiceWorker registration note:', err)
        })
      }
    }
  }, [])

  // Sync profile image from props, localStorage, and /api/auth/me
  useEffect(() => {
    const imgProp = userImage || profileImage
    if (imgProp && !imgProp.startsWith('blob:')) {
      setAvatarImage(imgProp)
      setAvatarError(false)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_profile_image', imgProp as string)
      }
    }
  }, [userImage, profileImage])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Initial check in localStorage if avatarImage is still empty
    if (!avatarImage) {
      const cached = localStorage.getItem('user_profile_image')
      if (cached && !cached.startsWith('blob:')) {
        setAvatarImage(cached)
      } else {
        if (cached?.startsWith('blob:')) {
          localStorage.removeItem('user_profile_image')
        }
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.startsWith('vsb_student_profile_') || key.startsWith('portal_profile_'))) {
              const item = localStorage.getItem(key)
              if (item) {
                const parsed = JSON.parse(item)
                if (parsed?.profileImage && !parsed.profileImage.startsWith('blob:')) {
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
        if (data?.success && data?.user) {
          if (data.user.profileImage && !data.user.profileImage.startsWith('blob:')) {
            setAvatarImage(data.user.profileImage)
            setAvatarError(false)
            localStorage.setItem('user_profile_image', data.user.profileImage)
          }
          if (data.user.residencyStatus || data.user.busNo || data.user.busDetails) {
            const res = data.user.residencyStatus || (data.user.busNo || data.user.busDetails ? 'Day Scholar' : 'Hostel')
            setStudentResidency(res)
            try {
              localStorage.setItem('vsb_student_residency', res)
            } catch {}
          }
        }
      })
      .catch(() => {})

    // 3. Listen to realtime profile image update events across the portal
    const handleProfileUpdate = (e: any) => {
      const newImg = e.detail || localStorage.getItem('user_profile_image')
      if (newImg && !newImg.startsWith('blob:')) {
        setAvatarImage(newImg)
        setAvatarError(false)
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_profile_image' && e.newValue && !e.newValue.startsWith('blob:')) {
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
            })

            const latest = newItems[0]

            // 1. Dispatch native system notification (Android status bar / lock screen)
            dispatchNativeNotification({
              id: latest.id,
              title: latest.title,
              message: latest.message,
              createdByName: latest.createdByName,
              link: notifLink,
            }).then((dispatched) => {
              // Always guarantee visual floating card banner on screen
              setRealtimeToast({
                id: latest.id,
                title: latest.title,
                message: latest.message,
                createdByName: latest.createdByName,
                link: notifLink,
              })

              // If native system dispatch failed (e.g. permission not yet allowed), play chime with visual card
              if (!dispatched) {
                playNotificationChime()
                triggerDeviceVibration([200, 100, 200])
              }
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

  // Auto-sync real mobile push subscription if permission already granted
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      isPushSubscribed().then((subscribed) => {
        if (!subscribed) {
          const derivedRegNo = userEmail ? userEmail.split('@')[0].toUpperCase() : undefined
          subscribeUserToPush(role, derivedRegNo).catch(() => {})
        }
      })
    }
  }, [role, userEmail])

  // Handle user requesting push permission
  const handleEnablePush = async () => {
    try {
      const derivedRegNo = userEmail ? userEmail.split('@')[0].toUpperCase() : undefined
      const res = await subscribeUserToPush(role, derivedRegNo)
      setPushPermission(res.permission)
      if (res.permission === 'granted') {
        setRealtimeToast({
          id: `perm-granted-${Date.now()}`,
          title: 'Notifications Activated!',
          message: 'Real App Notifications are now active in your phone status bar.',
          createdByName: 'VSB Notification Service',
          link: '/dashboard/notifications',
        })
        // Immediately fire a real system notification directly to Android status bar / lock screen
        await dispatchNativeNotification({
          id: `activated-${Date.now()}`,
          title: 'Digital Portal of AI&DS',
          message: '🔔 Real App Notifications are 100% active in your phone status bar!',
          createdByName: 'VSB Notification Service',
          link: '/dashboard/notifications',
        })
      }
    } catch {
      const perm = await requestNotificationPermission()
      setPushPermission(perm)
    }
  }

  // Instant interactive notification test for student / user
  const handleTestNotification = async () => {
    setIsTestingPush(true)

    // Ensure permission is requested
    let currentPerm = pushPermission
    if (currentPerm !== 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        currentPerm = await Notification.requestPermission()
        setPushPermission(currentPerm)
      } catch {}
    }

    const testItem: RealtimeToastData = {
      id: `test-${Date.now()}`,
      title: 'Digital Portal of AI&DS',
      message: '🔔 Real App Notification Verified! Audio chime & Android status bar alert active.',
      createdByName: 'Transport & Security Desk',
      link: role === 'admin' ? '/admin/notifications' : '/dashboard/notifications',
    }

    // 1. Immediately show floating card toast
    setRealtimeToast(testItem)

    // 2. Dispatch REAL native Android system notification
    const dispatched = await dispatchNativeNotification({
      id: testItem.id,
      title: testItem.title,
      message: testItem.message,
      createdByName: testItem.createdByName,
      link: testItem.link,
    })

    if (!dispatched) {
      playNotificationChime()
      triggerDeviceVibration([200, 100, 200])
      toast.info('Notifications are currently blocked in your phone settings. Tap "Allow Alerts" or check site settings.')
    } else {
      toast.success('Real Android notification dispatched to your status bar!')
    }

    setTimeout(() => setIsTestingPush(false), 1200)
  }

  // Listen for real-time mobile push broadcasts from Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.type === 'PUSH_NOTIFICATION_RECEIVED') {
          syncNotifications()
          if (event.data?.payload) {
            const p = event.data.payload
            setRealtimeToast({
              id: p.id || `toast-${Date.now()}`,
              title: p.title || 'Digital Portal of AI&DS',
              message: p.body || p.message || 'New announcement received',
              createdByName: p.createdByName || 'AI & DS Dept',
              link: p.data?.url || '/dashboard/notifications',
            })
            playNotificationChime()
            triggerDeviceVibration([200, 100, 200])
          }
        }
      }
      navigator.serviceWorker.addEventListener('message', handleSwMessage)
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage)
      }
    }
  }, [])

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

  // Auto-mark domain notifications as read when user navigates into that specific section,
  // or auto-mark all notifications as read when visiting the notifications page across all roles.
  useEffect(() => {
    if (!pathname) return
    const isNotifPage = pathname.includes('/notifications')
    const matchingKey = getMenuCategoryKey(pathname, '')

    if (isNotifPage || matchingKey === 'notifications') {
      const hasUnread = notifications.some((n) => n.unread)
      if (hasUnread) {
        fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markAllRead: true }),
        }).catch(() => {})

        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
        setApiMenuCounts({})
        window.dispatchEvent(new CustomEvent('portal-notifications-marked-read'))
      }
      return
    }

    if (matchingKey) {
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

  const [cachedAdvisor, setCachedAdvisor] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookieMatch = document.cookie.split('; ').find((row) => row.startsWith('portal_login_role='))
      const cookieRole = cookieMatch ? cookieMatch.split('=')[1] : null
      const localRole = localStorage.getItem('portal_login_role')
      const activeRole = cookieRole || localRole

      if (activeRole === 'faculty') {
        sessionStorage.setItem('vsb_faculty_is_advisor', 'false')
        setCachedAdvisor(false)
        return
      } else if (activeRole === 'advisor') {
        sessionStorage.setItem('vsb_faculty_is_advisor', 'true')
        setCachedAdvisor(true)
        return
      }

      const v = sessionStorage.getItem('vsb_faculty_is_advisor')
      if (v !== null) setCachedAdvisor(v === 'true')
    }
  }, [])

  const isFacultyAdvisor =
    typeof isAdvisor === 'boolean'
      ? isAdvisor
      : (cachedAdvisor !== null ? cachedAdvisor : (roleBadgeLabel ? roleBadgeLabel.toLowerCase().includes('advisor') : false))

  const roleBadge = roleBadgeMap[role] || roleBadgeMap.student
  const isLabHandler = roleBadgeLabel === 'Lab Handler' || roleBadgeLabel === 'Lab In-charge'

  const effectiveRoleBadgeColor = isLabHandler
    ? 'bg-gradient-to-r from-cyan-600/25 to-blue-500/20 text-cyan-200 border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
    : isFacultyAdvisor
    ? 'bg-gradient-to-r from-teal-600/25 to-emerald-500/20 text-teal-200 border-teal-400/40 shadow-[0_0_12px_rgba(45,212,191,0.2)]'
    : roleBadge.color

  const effectiveRoleBadgeLabel =
    roleBadgeLabel ||
    (role === 'faculty' ? (isFacultyAdvisor ? 'Class Advisor' : isLabHandler ? 'Lab Handler' : 'Faculty Member') : roleBadge.label)

  const studentPassItem = useMemo(() => {
    if (role !== 'student') return null
    const res = (studentResidency || '').toLowerCase().trim()
    const isHostel = res.includes('hostel') || res.includes('hosteller')
    return {
      label: isHostel ? 'Hostel Gate Pass' : 'College Bus Pass',
      icon: isHostel ? <Home className="h-4 w-4" /> : <Bus className="h-4 w-4" />,
    }
  }, [role, studentResidency])

  const rawNavItems = navItems || navItemsMap[role] || []
  const baseNavItems = rawNavItems
    .filter((item) => {
      // In faculty portal, strictly remove marked menus: OD & Leave, Proofs, Projects, and Events
      if (
        role === 'faculty' &&
        (item.href.includes('/faculty-dashboard/od-applications') ||
          item.href.includes('/faculty-dashboard/od-proofs') ||
          item.href.includes('/faculty-dashboard/projects') ||
          item.href.includes('/faculty-dashboard/events'))
      ) {
        return false
      }
      return true
    })
    .map((item) => {
      if (role === 'student' && item.href === '/dashboard/digital-pass' && studentPassItem) {
        return {
          ...item,
          label: studentPassItem.label,
          icon: studentPassItem.icon,
        }
      }
      return item
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

  const handleTouchNotification = (item: NotificationItem) => {
    markOneAsRead(item.id)
    setActiveDetailNotification({
      id: item.id,
      title: item.title,
      message: item.description,
      time: item.time,
      link: item.link,
      type: item.type,
    })
    setIsNotificationOpen(false)
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
    document.cookie = 'portal_login_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;'
    if (typeof window !== 'undefined') {
      localStorage.removeItem('portal_login_role')
      sessionStorage.removeItem('vsb_faculty_is_advisor')
      sessionStorage.clear()
    }
    window.location.href = '/login'
  }

  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('portal_theme') || localStorage.getItem('vsb-portal-theme')
      // Default to luxury midnight dark mode unless user explicitly selected 'light'
      const shouldDark = savedTheme !== 'light'
      if (shouldDark) {
        setIsDarkMode(true)
        document.documentElement.classList.add('midnight', 'dark')
      } else {
        setIsDarkMode(false)
        document.documentElement.classList.remove('midnight', 'dark')
      }
    }
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDarkMode
    setIsDarkMode(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('midnight', 'dark')
      localStorage.setItem('portal_theme', 'dark')
      localStorage.setItem('vsb-portal-theme', 'midnight')
    } else {
      document.documentElement.classList.remove('midnight', 'dark')
      localStorage.setItem('portal_theme', 'light')
      localStorage.setItem('vsb-portal-theme', 'light')
    }
  }

  const getNavCategory = (href: string, label: string): string => {
    const l = href.toLowerCase()
    if (
      l.endsWith('/dashboard') ||
      l === '/admin' ||
      l.includes('attendance') ||
      l.includes('gpa') ||
      l.includes('subject') ||
      l.includes('mark') ||
      l.includes('academic') ||
      l.includes('curriculum')
    ) {
      return 'ACADEMICS & CURRICULUM'
    }
    if (
      l.includes('od-') ||
      l.includes('proof') ||
      l.includes('pass') ||
      l.includes('leave') ||
      l.includes('student')
    ) {
      return 'STUDENT AFFAIRS & PASSES'
    }
    if (
      l.includes('ai') ||
      l.includes('study') ||
      l.includes('question') ||
      l.includes('project') ||
      l.includes('resource') ||
      l.includes('file') ||
      l.includes('laboratory') ||
      l.includes('/lab')
    ) {
      return 'LEARNING & RESEARCH'
    }
    if (
      l.includes('faculty') ||
      l.includes('event') ||
      l.includes('announcement') ||
      l.includes('achievement') ||
      l.includes('hod') ||
      l.includes('admins') ||
      l.includes('roles') ||
      l.includes('report') ||
      l.includes('log')
    ) {
      return 'INSTITUTION & DIRECTORY'
    }
    return 'ACCOUNT & PREFERENCES'
  }

  const handleNavClick = (href: string) => {
    setIsDrawerOpen(false)
    setActivePath(href)
  }

  return (
    <div className="min-h-screen lux-ambient-canvas text-[#071A3D] dark:text-slate-100 relative transition-colors duration-300">
      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-[#071A3D]/70 backdrop-blur-xs lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}
      {/* Slide-out Navigation Drawer / Sidebar (Executive Obsidian Crystal Panel) */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-[#030816] via-[#061226] to-[#02050E] text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-white/10 shadow-[10px_0_40px_rgba(0,0,0,0.65)] pb-safe select-none backdrop-blur-2xl overflow-hidden',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Ambient mesh background glows */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3" />

        {/* Drawer Header with Official Emblem */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl p-[2px] bg-gradient-to-tr from-[#F4C430] via-[#22C7E8] to-[#1455D9] shadow-[0_0_16px_rgba(244,196,48,0.35)] flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[14px] bg-white p-0.5 flex items-center justify-center overflow-hidden shadow-inner">
                <Image
                  src="/college-emblem.png"
                  alt="V.S.B. Engineering College Official Emblem"
                  width={38}
                  height={38}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-black text-white leading-tight tracking-tight drop-shadow-xs">AI &amp; DS Portal</p>
                <button
                  type="button"
                  onClick={triggerPortalUpdateCheck}
                  title="Check for real-time app updates"
                  className="px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold tracking-wide cursor-pointer transition-all border border-cyan-400/30 shadow-xs flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
                  <span>{APP_VERSION_LABEL}</span>
                </button>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium tracking-wide truncate mt-0.5 flex items-center gap-1">
                <span>V.S.B. Engineering College</span>
                <span className="text-[8.5px] px-1 py-0.2 rounded bg-white/10 text-slate-300 font-semibold uppercase">Autonomous</span>
              </p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User VIP Profile Card in Drawer */}
        <Link
          href={profileHref}
          onClick={() => handleNavClick(profileHref)}
          className={cn(
            'relative overflow-hidden p-3.5 mx-3 my-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 shrink-0 cursor-pointer shadow-md group z-10',
            (activePath || pathname) === profileHref
              ? 'bg-gradient-to-br from-blue-900/40 via-[#0B1A3B]/80 to-[#071328] border-cyan-400/40 shadow-[0_4px_20px_rgba(20,85,217,0.35)]'
              : 'bg-gradient-to-br from-white/[0.06] via-[#07142E]/70 to-white/[0.02] border-white/10 hover:border-amber-400/40 hover:bg-white/[0.08]'
          )}
        >
          <div className="relative w-10 h-10 rounded-xl p-[2px] bg-gradient-to-tr from-amber-400 via-cyan-400 to-blue-600 shadow-[0_0_12px_rgba(34,197,232,0.3)] shrink-0">
            <div className="w-full h-full rounded-[10px] overflow-hidden bg-slate-950 text-white flex items-center justify-center font-bold text-xs shadow-inner">
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
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#071328] shadow-[0_0_8px_rgba(52,211,153,0.9)] flex items-center justify-center" title="Online & Connected">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-[13px] font-black text-white group-hover:text-amber-200 transition-colors truncate leading-tight tracking-tight">
              {userName}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
              {role === 'hod' || (userEmail && userEmail.toLowerCase().startsWith('hod'))
                ? 'AI & DS Dept · Autonomous'
                : (userEmail && !userEmail.endsWith('@student.vsb.edu.in'))
                ? userEmail
                : 'AI & DS Dept · Student'}
            </p>
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md border mt-1.5 uppercase tracking-wider',
                effectiveRoleBadgeColor
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              <span>{effectiveRoleBadgeLabel}</span>
            </span>
          </div>
        </Link>

        {/* Navigation Link Items */}
        <nav
          ref={navContainerRef}
          className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 lux-sidebar-scroll relative z-10"
          aria-label="Main navigation"
        >
          {resolvedNavItems.map((item, index) => {
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

            const currentCategory = getNavCategory(item.href, displayLabel)
            const prevCategory = index > 0 ? getNavCategory(resolvedNavItems[index - 1].href, resolvedNavItems[index - 1].label) : null
            const showCategoryHeader = currentCategory !== prevCategory

            return (
              <React.Fragment key={item.href}>
                {showCategoryHeader && (
                  <div className={cn("pt-4 pb-1.5 px-3 flex items-center gap-2 select-none", index === 0 && "pt-1.5")}>
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 shadow-[0_0_8px_rgba(244,196,48,0.8)] shrink-0" />
                    <span className="text-[9.5px] font-black uppercase tracking-[0.18em] bg-gradient-to-r from-amber-200 via-amber-100 to-slate-200 bg-clip-text text-transparent">
                      {currentCategory}
                    </span>
                    <span className="flex-1 h-px bg-gradient-to-r from-amber-400/30 via-white/10 to-transparent" />
                  </div>
                )}
                <Link
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
                  className={cn(
                    'relative flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer group select-none overflow-hidden my-0.5',
                    isActive
                      ? 'bg-gradient-to-r from-[#1455D9] via-[#1A5CE5] to-[#0E3A9E] text-white font-bold shadow-[0_4px_20px_rgba(20,85,217,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] border border-cyan-400/30 pl-3.5'
                      : 'text-slate-300 hover:bg-gradient-to-r hover:from-white/[0.08] hover:via-white/[0.04] hover:to-transparent hover:text-white hover:border hover:border-white/10 hover:translate-x-1'
                  )}
                >
                  {/* Glowing active edge indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-amber-300 via-cyan-400 to-blue-400 shadow-[0_0_10px_rgba(34,197,232,0.9)]" />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base transition-all duration-200 relative',
                        isActive
                          ? 'bg-white/15 text-amber-300 border border-white/20 shadow-inner drop-shadow-[0_0_8px_rgba(244,196,48,0.5)]'
                          : 'bg-white/[0.03] text-slate-400 border border-white/5 group-hover:text-cyan-300 group-hover:bg-white/[0.08] group-hover:border-cyan-500/30 group-hover:scale-105'
                      )}
                    >
                      {item.icon}
                      {notifCount > 0 && !isActive && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#071328] animate-pulse" />
                      )}
                    </span>
                    <span className="truncate tracking-tight">{displayLabel}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {notifCount > 0 ? (
                      <span
                        className={cn(
                          'inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-black tracking-tight shadow-md transition-transform duration-200 group-hover:scale-105',
                          isActive
                            ? 'bg-gradient-to-r from-amber-300 to-[#F4C430] text-slate-950 shadow-[0_0_10px_rgba(244,196,48,0.6)]'
                            : 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_8px_rgba(244,63,94,0.5)] ring-1 ring-white/20'
                        )}
                        title={`${notifCount} notification${notifCount > 1 ? 's' : ''} for ${displayLabel}`}
                      >
                        {notifCount > 99 ? '99+' : notifCount}
                      </span>
                    ) : isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(34,197,232,0.9)] shrink-0" />
                    ) : null}
                  </div>
                </Link>
              </React.Fragment>
            )
          })}
        </nav>

        {/* Drawer Footer with Version & Logout */}
        <div className="p-3.5 border-t border-white/10 bg-gradient-to-t from-black/40 via-black/20 to-transparent space-y-2.5 relative z-10">
          <div className="px-2 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-slate-300 font-semibold tracking-wide">Live Portal</span>
            </div>
            <button
              type="button"
              onClick={triggerPortalUpdateCheck}
              title="Check for Portal Updates"
              className="font-mono font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30 cursor-pointer active:scale-95 transition-all text-[10px] flex items-center gap-1 shadow-xs"
            >
              <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
              <span>{APP_VERSION_LABEL}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-200 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Top Header */}
      <header className="sticky top-0 z-30 lux-glass-header lg:pl-72 shadow-[0_4px_24px_rgba(7,26,61,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all">
        {/* Real-time Push Notification Permission Banner for Mobile & Desktop */}
        {pushPermission === 'default' && !isPermissionBannerDismissed && (
          <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 shadow-xs flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded-md bg-blue-500/20 text-blue-400 shrink-0">
                <Bell className="w-3.5 h-3.5" />
              </span>
              <p className="truncate text-slate-200 font-medium text-[11px] sm:text-xs">
                <strong className="text-white font-semibold">Enable Alerts:</strong> Turn on notifications to receive instant institutional updates and passes.
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-colors cursor-pointer"
              >
                Turn On
              </button>
              <button
                type="button"
                onClick={() => setIsPermissionBannerDismissed(true)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Banner if user blocked notifications in phone/browser settings */}
        {pushPermission === 'denied' && !isPermissionBannerDismissed && (
          <div className="bg-amber-950/90 text-white px-4 py-2 border-b border-amber-900/60 shadow-xs flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-300 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              <p className="truncate text-amber-200 font-medium text-[11px] sm:text-xs">
                <strong className="text-white font-semibold">Notifications Blocked:</strong> Allow alerts in your browser settings to receive passes and reminders.
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsNotificationOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-[10px] transition-all shadow-xs cursor-pointer"
              >
                How to Fix
              </button>
              <button
                type="button"
                onClick={() => setIsPermissionBannerDismissed(true)}
                className="p-1 text-amber-200 hover:text-white transition-colors cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        <div className="portal-top-header w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Hamburger Menu & Brand on Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 rounded-xl text-slate-800 dark:text-slate-100 hover:bg-white/80 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10 lg:hidden transition-colors shadow-2xs"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
              {totalMenuNotifications > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#040A18] shadow-md animate-pulse">
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
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-[#1455D9] dark:hover:text-cyan-300 transition-all text-xs font-semibold group cursor-pointer shadow-xs"
                      title={`${m.count} updates in ${m.label}`}
                    >
                      <span className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                        {m.icon}
                      </span>
                      <span className="truncate max-w-[130px]">{m.label}</span>
                      <span className="min-w-[18px] h-[18px] px-1.5 bg-[#1455D9]/15 dark:bg-cyan-500/20 text-[#1455D9] dark:text-cyan-300 border border-blue-400/20 rounded-full text-[10px] font-bold flex items-center justify-center">
                        {m.count > 99 ? '99+' : m.count}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* 2. Interactive Menu Updates Pill Button (Luxury Royal Sapphire) */}
                <button
                  type="button"
                  onClick={() => setIsMenuNotifOpen((prev) => !prev)}
                  className={cn(
                    'flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs',
                    isMenuNotifOpen
                      ? 'bg-gradient-to-r from-[#071A3D] via-[#1455D9] to-[#071A3D] text-white border-amber-400/50 shadow-[0_0_16px_rgba(244,196,48,0.3)]'
                      : 'bg-white/90 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-white/15 hover:border-blue-400 dark:hover:border-cyan-400/40 shadow-xs hover:shadow-md'
                  )}
                  title="Click to view menus with unread updates"
                  aria-expanded={isMenuNotifOpen}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(34,197,232,0.8)] animate-pulse" />
                  <span className="tracking-tight">
                    {menusWithNotifications.length}{' '}
                    <span>Menu{menusWithNotifications.length > 1 ? 's' : ''}</span>
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-black',
                      isMenuNotifOpen ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-white/15 text-slate-800 dark:text-white'
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

                    <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 w-auto sm:w-80 rounded-3xl bg-white dark:bg-[#071328] border border-slate-200 dark:border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.45)] z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-left flex flex-col font-sans backdrop-blur-xl">
                      <div className="p-4 bg-gradient-to-r from-[#071A41] via-[#0D2E73] to-[#071A41] text-white flex items-center justify-between border-b border-white/10 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black tracking-wide text-white">Menu Notifications</h4>
                            <p className="text-[10px] text-cyan-200 font-medium">
                              {totalMenuNotifications} update{totalMenuNotifications > 1 ? 's' : ''} across {menusWithNotifications.length} section{menusWithNotifications.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-[#F4C430] text-slate-950 text-[10px] font-black shadow-xs">
                          Active
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 p-1.5 bg-white dark:bg-[#071328] lux-sidebar-scroll">
                        {menusWithNotifications.map((m) => (
                          <Link
                            key={m.href}
                            href={m.href}
                            onClick={() => {
                              handleNavClick(m.href)
                              setIsMenuNotifOpen(false)
                            }}
                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-white/5 text-[#1455D9] dark:text-cyan-300 group-hover:bg-[#1455D9] group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs border border-blue-100 dark:border-white/10">
                                {m.icon}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1455D9] dark:group-hover:text-cyan-300 truncate">
                                  {m.label}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  Click to navigate
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black shrink-0 shadow-xs">
                              {m.count} new
                            </span>
                          </Link>
                        ))}
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-black/30 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                        <Link
                          href={notificationsHref}
                          onClick={() => setIsMenuNotifOpen(false)}
                          className="text-[11px] font-bold text-[#1455D9] dark:text-cyan-300 hover:underline inline-flex items-center gap-1"
                        >
                          <span>All Notifications</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setIsMenuNotifOpen(false)}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <Link href={role === 'admin' ? '/admin/dashboard' : role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard'} className="flex items-center gap-2.5 lg:hidden">
              <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-[#00F5FF] via-[#8B5CF6] to-[#EC4899] shadow-[0_0_10px_rgba(0,245,255,0.4)] flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden border border-amber-300/80">
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
                    <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-blue-50/90 border-b border-blue-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn(
                            "w-2 h-2 rounded-full shrink-0 ring-2 animate-pulse",
                            pushPermission === 'granted' ? "bg-emerald-500 ring-emerald-200" : "bg-amber-500 ring-amber-200"
                          )} />
                          <span className="text-[11px] font-black text-[#071A41] truncate">
                            {pushPermission === 'granted'
                              ? 'Notifications Allowed & Active'
                              : pushPermission === 'denied'
                              ? 'Notifications Blocked by Browser'
                              : 'Real-Time Alerts Available'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {pushPermission === 'default' && (
                            <button
                              type="button"
                              onClick={handleEnablePush}
                              className="px-2.5 py-1 rounded-lg bg-[#1557C0] hover:bg-[#0e44b5] text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              <span>🔔</span>
                              <span>Allow Alerts</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleTestNotification}
                            disabled={isTestingPush}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                            title="Test notification audio chime and visual card"
                          >
                            <span>🔊</span>
                            <span>{isTestingPush ? 'Testing...' : 'Test Alert'}</span>
                          </button>
                        </div>
                      </div>

                      {pushPermission === 'denied' && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-normal space-y-1.5 font-sans">
                          <p className="font-bold text-amber-950 flex items-center gap-1">
                            <span>🔒</span>
                            <span>How to Trust &amp; Allow this Website:</span>
                          </p>
                          <ol className="list-decimal list-inside text-[10px] space-y-1 text-amber-900 font-medium">
                            <li>Click the <strong>Lock / Permissions icon (🔒)</strong> left of the URL in your browser address bar.</li>
                            <li>Change <strong>Notifications</strong> to <strong>Allow</strong>.</li>
                            <li>Reload the page to receive real-time updates.</li>
                          </ol>
                        </div>
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
                            onClick={() => handleTouchNotification(item)}
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

            {/* Official Version Badge */}
            <button
              type="button"
              onClick={triggerPortalUpdateCheck}
              title={`Release ${APP_VERSION_LABEL} · Click to check updates`}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-400/25 dark:border-white/10 bg-blue-50/80 dark:bg-white/5 hover:bg-blue-100/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-300" />
              <span className="font-mono font-bold text-[11px]">{APP_VERSION_LABEL}</span>
            </button>

            {/* Vision & Mission Quick Access */}
            <button
              type="button"
              onClick={() => setShowVisionModal(true)}
              title="View Department Vision & Mission"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
            >
              <Target className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Vision &amp; Mission</span>
            </button>

            {/* 1-Click Luxury Theme Switcher (Ivory Studio / Midnight Centurion) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Ivory Studio Mode' : 'Switch to Midnight Centurion Mode'}
              className="p-2 rounded-xl border border-amber-400/40 dark:border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-600 dark:text-amber-300 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-[#F4C430] animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Profile Avatar & Name */}
            <Link
              href={profileHref}
              className="flex items-center gap-2.5 p-1 pr-3.5 rounded-full lux-glass-card hover:border-amber-400/50 transition-all duration-300 shadow-xs hover:shadow-md group cursor-pointer"
            >
              <div className="relative w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(34,197,232,0.3)] shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 text-white flex items-center justify-center font-bold text-xs">
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
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#040A18] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-slate-800 dark:text-white max-w-[120px] truncate group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                  {userName}
                </span>
                <span className="text-[9.5px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                  {effectiveRoleBadgeLabel}
                </span>
              </div>
            </Link>

            {/* Top Header Direct Logout Action */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              disabled={isLoggingOut}
              title="Logout from portal"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline text-slate-600 dark:text-slate-300 hover:text-rose-400">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lg:pl-72 pb-28 lg:pb-8 min-h-[calc(100vh-64px)]">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">{children}</div>
      </main>

      {/* Mobile Bottom 5-Tab Navigation Bar (Obsidian Glass Floating Dock) */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-gradient-to-t from-[#020612] via-[#050D24]/95 to-[#071328]/90 backdrop-blur-2xl border-t border-white/10 grid grid-cols-5 py-2 px-1 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.6)] select-none"
        aria-label="Bottom mobile navigation"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Tab 1: Home */}
        <Link
          href={role === 'admin' ? '/admin/dashboard' : role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard'}
          prefetch={true}
          onMouseEnter={() => { try { router.prefetch(role === 'admin' ? '/admin/dashboard' : role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard') } catch {} }}
          onMouseDown={() => { try { router.prefetch(role === 'admin' ? '/admin/dashboard' : role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard') } catch {} }}
          onClick={() => handleNavClick(role === 'admin' ? '/admin/dashboard' : role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[10px] sm:text-[11px] font-medium transition-all rounded-xl relative',
            (activePath || pathname) === '/dashboard' || (activePath || pathname) === '/faculty-dashboard' || (activePath || pathname) === '/hod-dashboard' || (activePath || pathname) === '/admin/dashboard'
              ? 'text-cyan-300 font-bold bg-white/10 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Home className="h-5 w-5" />
          <span className="truncate max-w-[64px]">Home</span>
        </Link>

        {/* Tab 2: Role-Tailored Navigation (Students for Admin, Subjects for Faculty/Student, OD Proofs for HOD) */}
        <Link
          href={role === 'admin' ? '/admin/students' : role === 'hod' ? '/hod-dashboard/od-proofs' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects'}
          prefetch={true}
          onMouseEnter={() => { try { router.prefetch(role === 'admin' ? '/admin/students' : role === 'hod' ? '/hod-dashboard/od-proofs' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects') } catch {} }}
          onMouseDown={() => { try { router.prefetch(role === 'admin' ? '/admin/students' : role === 'hod' ? '/hod-dashboard/od-proofs' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects') } catch {} }}
          onClick={() => handleNavClick(role === 'admin' ? '/admin/students' : role === 'hod' ? '/hod-dashboard/od-proofs' : role === 'faculty' ? '/faculty-dashboard/subjects' : '/dashboard/subjects')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[10px] sm:text-[11px] font-medium transition-all rounded-xl relative',
            (activePath || pathname).includes('students') || (activePath || pathname).includes('subjects') || (activePath || pathname).includes('academics') || (activePath || pathname).includes('od-proofs')
              ? 'text-cyan-300 font-bold bg-white/10 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <div className="relative">
            {role === 'admin' ? <Users className="h-5 w-5" /> : role === 'hod' ? <ShieldCheck className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            {getMenuNotificationCount(role === 'admin' ? '/admin/students' : role === 'hod' ? '/hod-dashboard/od-proofs' : '/dashboard/subjects', role === 'admin' ? 'Students' : role === 'hod' ? 'OD Proofs' : 'Courses') > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-[#020612] shadow-xs">
                {getMenuNotificationCount(role === 'admin' ? '/admin/students' : role === 'hod' ? '/hod-dashboard/od-proofs' : '/dashboard/subjects', role === 'admin' ? 'Students' : role === 'hod' ? 'OD Proofs' : 'Courses') > 9 ? '9+' : getMenuNotificationCount(role === 'admin' ? '/admin/students' : role === 'hod' ? '/hod-dashboard/od-proofs' : '/dashboard/subjects', role === 'admin' ? 'Students' : role === 'hod' ? 'OD Proofs' : 'Courses')}
              </span>
            )}
          </div>
          <span className="truncate max-w-[64px]">{role === 'admin' ? 'Students' : role === 'hod' ? 'OD Proofs' : 'Courses'}</span>
        </Link>

        {/* Tab 3: Role-Tailored Navigation (Faculty for Admin, Students for Faculty, Projects for Student/HOD) */}
        <Link
          href={role === 'admin' ? '/admin/faculty' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/students' : '/dashboard/projects'}
          prefetch={true}
          onMouseEnter={() => { try { router.prefetch(role === 'admin' ? '/admin/faculty' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/students' : '/dashboard/projects') } catch {} }}
          onMouseDown={() => { try { router.prefetch(role === 'admin' ? '/admin/faculty' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/students' : '/dashboard/projects') } catch {} }}
          onClick={() => handleNavClick(role === 'admin' ? '/admin/faculty' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/students' : '/dashboard/projects')}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[10px] sm:text-[11px] font-medium transition-all rounded-xl relative',
            (activePath || pathname).includes('faculty') || (activePath || pathname).includes('projects') || ((activePath || pathname).includes('students') && role === 'faculty')
              ? 'text-cyan-300 font-bold bg-white/10 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <div className="relative">
            {role === 'admin' ? <School className="h-5 w-5" /> : role === 'faculty' ? <Users className="h-5 w-5" /> : <FolderOpen className="h-5 w-5" />}
            {getMenuNotificationCount(role === 'admin' ? '/admin/faculty' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/students' : '/dashboard/projects', role === 'admin' ? 'Faculty' : role === 'faculty' ? 'Students' : 'Projects') > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-[#020612] shadow-xs">
                {getMenuNotificationCount(role === 'admin' ? '/admin/faculty' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/students' : '/dashboard/projects', role === 'admin' ? 'Faculty' : role === 'faculty' ? 'Students' : 'Projects') > 9 ? '9+' : getMenuNotificationCount(role === 'admin' ? '/admin/faculty' : role === 'hod' ? '/hod-dashboard/projects' : role === 'faculty' ? '/faculty-dashboard/students' : '/dashboard/projects', role === 'admin' ? 'Faculty' : role === 'faculty' ? 'Students' : 'Projects')}
              </span>
            )}
          </div>
          <span className="truncate max-w-[64px]">{role === 'admin' ? 'Faculty' : role === 'faculty' ? 'Students' : 'Projects'}</span>
        </Link>

        {/* Tab 4: Alerts / Notifications */}
        <Link
          href={notificationsHref}
          prefetch={true}
          onClick={() => handleNavClick(notificationsHref)}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[10px] sm:text-[11px] font-medium transition-all rounded-xl relative',
            (activePath || pathname).includes('notifications')
              ? 'text-cyan-300 font-bold bg-white/10 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-[#020612] shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="truncate max-w-[64px]">Alerts</span>
        </Link>

        {/* Tab 5: Profile */}
        <Link
          href={profileHref}
          prefetch={true}
          onMouseEnter={() => { try { router.prefetch(profileHref) } catch {} }}
          onMouseDown={() => { try { router.prefetch(profileHref) } catch {} }}
          onClick={() => handleNavClick(profileHref)}
          className={cn(
            'flex flex-col items-center gap-1 py-1 text-[10px] sm:text-[11px] font-medium transition-all rounded-xl',
            (activePath || pathname).includes('profile')
              ? 'text-cyan-300 font-bold bg-white/10 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <UserIcon className="h-5 w-5" />
          <span className="truncate max-w-[64px]">Profile</span>
        </Link>
      </nav>

      {/* Real-time In-App Floating Toast Notification */}
      <RealtimeNotificationToast
        toast={realtimeToast}
        onDismiss={() => setRealtimeToast(null)}
        onOpenDetail={(toast) => {
          markOneAsRead(toast.id)
          setActiveDetailNotification({
            id: toast.id,
            title: toast.title,
            message: toast.message,
            createdByName: toast.createdByName,
            link: toast.link,
          })
        }}
      />

      {/* Touch-to-Open Notification Detail Modal */}
      <NotificationDetailModal
        notification={activeDetailNotification}
        onClose={() => setActiveDetailNotification(null)}
        onActionClick={(dest) => {
          handleNavClick(dest)
          router.push(dest)
        }}
      />

      {/* Floating AI Chatbot Bottom-Right Icon */}
      <FloatingChatbot />

      {/* Vision & Mission Modal */}
      <VisionMissionModal
        isOpen={showVisionModal}
        onClose={() => setShowVisionModal(false)}
      />

      {/* Real-Time App Downloader Modal */}
      <RealtimeAppDownloader
        isOpen={isDownloaderOpen}
        onClose={() => setIsDownloaderOpen(false)}
      />

      {/* Logout Confirmation Modal (Luxury Midnight Sapphire Glass) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#061226] via-[#091B3E] to-[#030919] text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/15 animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
            {/* Ambient aura glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(244,63,94,0.3)]">
              <LogOut className="w-8 h-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white mb-1.5 tracking-tight">
              Sign Out of Portal Session
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to end your current session for{' '}
              <strong className="text-amber-300 font-bold">{userName}</strong> ({role.toUpperCase()})?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="px-4 py-3 rounded-xl border border-white/10 text-slate-300 font-bold text-xs hover:bg-white/10 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs transition-all shadow-[0_4px_20px_rgba(244,63,94,0.4)] border border-rose-400/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Yes, Sign Out</span>
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
