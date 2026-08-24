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
  const notificationRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const resolvedNavItems = navItems || navItemsMap[role] || []
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

  const handleNavClick = (href: string) => {
    setIsDrawerOpen(false)
    if (pathname !== href) {
      setActivePath(href)
      setIsNavigating(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#071A3D] relative">
      {/* Top Instant Navigation Progress Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#F4C430] animate-pulse" />
      )}
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
            <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0">
              <Image
                src="/college-emblem.png"
                alt="V.S.B. Engineering College Official Emblem"
                width={36}
                height={36}
                className="w-full h-full object-contain rounded-full"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-tight truncate">V.S.B. Engineering</p>
              <p className="text-xs text-[#22C7E8] font-semibold truncate">AI &amp; DS Department</p>
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
        <div className="p-4 mx-3 my-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 shrink-0">
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
        </div>

        {/* Navigation Link Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1" aria-label="Main navigation" style={{ scrollbarWidth: 'thin' }}>
          {resolvedNavItems.map((item) => {
            const current = activePath || pathname
            const isRootDashboard =
              item.href === '/dashboard' ||
              item.href === '/faculty-dashboard' ||
              item.href === '/hod-dashboard' ||
              item.href === '/admin' ||
              item.href === '/admin/dashboard'
            const isActive = isRootDashboard
              ? current === item.href
              : current === item.href || current.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-[#1455D9] text-white shadow-md shadow-[#1455D9]/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <span className={cn('shrink-0 text-base', isActive ? 'text-white' : 'text-[#22C7E8]')}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Drawer Footer with Logout */}
        <div className="p-3 border-t border-white/10 bg-white/5">
          <Link
            href="/api/auth/logout"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Link>
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
              <Image
                src="/college-emblem.png"
                alt="V.S.B. Emblem"
                width={32}
                height={32}
                className="rounded-full object-contain"
              />
              <span className="text-sm font-bold text-[#071A3D]">VSB AI &amp; DS</span>
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

              {/* Notification Popover Modal / Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-gray-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                  {/* Dropdown Header */}
                  <div className="p-4 bg-[#071A3D] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#F4C430]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Department Alerts</h3>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-[#F4C430] text-[#071A3D] rounded-full text-[10px] font-black">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-gray-300 hover:text-white font-medium underline transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100" style={{ scrollbarWidth: 'thin' }}>
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                          )
                        }}
                        className={cn(
                          'p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-3',
                          item.unread ? 'bg-blue-50/40' : 'bg-white'
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {(item.type === 'alert' || item.type === 'warning') && (
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          )}
                          {item.type === 'approval' && (
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                              <FileQuestion className="w-4 h-4" />
                            </div>
                          )}
                          {item.type === 'success' && (
                            <div className="w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                          {item.type === 'info' && (
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1455D9] flex items-center justify-center">
                              <Sparkles className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-[#071A3D] truncate">{item.title}</h4>
                            {item.unread && (
                              <span className="w-2 h-2 rounded-full bg-[#1455D9] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <Link
                      href={notificationsHref}
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-xs font-bold text-[#1455D9] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View All Notifications</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
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
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lg:pl-72 pb-28 lg:pb-8 min-h-[calc(100vh-64px)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>

      {/* Mobile Bottom 4-Tab Navigation Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 grid grid-cols-4 py-2 px-1 shadow-lg"
        aria-label="Bottom mobile navigation"
      >
        <Link
          href={role === 'admin' ? '/admin/dashboard' : role === 'hod' ? '/hod-dashboard' : role === 'faculty' ? '/faculty-dashboard' : '/dashboard'}
          prefetch={true}
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

      {/* Floating AI Chatbot Bottom-Right Icon */}
      <FloatingChatbot />
    </div>
  )
}