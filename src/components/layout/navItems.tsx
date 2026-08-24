'use client'

import { Home, BookOpen, FileText, FolderOpen, Users, CalendarDays, Megaphone, Trophy, Database, Bot, Bell, User, Settings, GraduationCap, FileQuestion, Newspaper } from 'lucide-react'
import type { NavItem } from './PortalLayout'

export const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <Home className="h-4 w-4" /> },
  { label: 'Attendance', href: '/dashboard/attendance', icon: <CalendarDays className="h-4 w-4" /> },
  { label: 'Study Details', href: '/dashboard/study', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Subjects', href: '/dashboard/subjects', icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'Question Papers', href: '/dashboard/question-papers', icon: <FileQuestion className="h-4 w-4" /> },
  { label: 'Projects', href: '/dashboard/projects', icon: <FolderOpen className="h-4 w-4" /> },
  { label: 'Faculty', href: '/dashboard/faculty', icon: <Users className="h-4 w-4" /> },
  { label: 'Events', href: '/dashboard/events', icon: <CalendarDays className="h-4 w-4" /> },
  { label: 'Announcements', href: '/dashboard/announcements', icon: <Megaphone className="h-4 w-4" /> },
  { label: 'Achievements', href: '/dashboard/achievements', icon: <Trophy className="h-4 w-4" /> },
  { label: 'Resources', href: '/dashboard/resources', icon: <Database className="h-4 w-4" /> },
  { label: 'Notifications', href: '/dashboard/notifications', icon: <Bell className="h-4 w-4" /> },
  { label: 'Profile', href: '/dashboard/profile', icon: <User className="h-4 w-4" /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
]



export const facultyNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/faculty-dashboard', icon: <Home className="h-4 w-4" /> },
  { label: 'My Subjects', href: '/faculty-dashboard/subjects', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Students', href: '/faculty-dashboard/students', icon: <Users className="h-4 w-4" /> },
  { label: 'Attendance', href: '/faculty-dashboard/attendance', icon: <CalendarDays className="h-4 w-4" /> },
  { label: 'Resources', href: '/faculty-dashboard/resources', icon: <Database className="h-4 w-4" /> },
  { label: 'Question Papers', href: '/faculty-dashboard/question-papers', icon: <FileQuestion className="h-4 w-4" /> },
  { label: 'Projects', href: '/faculty-dashboard/projects', icon: <FolderOpen className="h-4 w-4" /> },
  { label: 'Events', href: '/faculty-dashboard/events', icon: <CalendarDays className="h-4 w-4" /> },
  { label: 'Announcements', href: '/faculty-dashboard/announcements', icon: <Megaphone className="h-4 w-4" /> },
  { label: 'Notifications', href: '/faculty-dashboard/notifications', icon: <Bell className="h-4 w-4" /> },
  { label: 'Profile', href: '/faculty-dashboard/profile', icon: <User className="h-4 w-4" /> },
  { label: 'Settings', href: '/faculty-dashboard/settings', icon: <Settings className="h-4 w-4" /> },
]

export const hodNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/hod-dashboard', icon: <Home className="h-4 w-4" /> },
  { label: 'Students', href: '/hod-dashboard/students', icon: <Users className="h-4 w-4" /> },
  { label: 'Faculty', href: '/hod-dashboard/faculty', icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'Academics', href: '/hod-dashboard/academics', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Study Resources', href: '/hod-dashboard/resources', icon: <Database className="h-4 w-4" /> },
  { label: 'Question Papers', href: '/hod-dashboard/question-papers', icon: <FileQuestion className="h-4 w-4" /> },
  { label: 'Projects', href: '/hod-dashboard/projects', icon: <FolderOpen className="h-4 w-4" /> },
  { label: 'Events', href: '/hod-dashboard/events', icon: <CalendarDays className="h-4 w-4" /> },
  { label: 'Announcements', href: '/hod-dashboard/announcements', icon: <Megaphone className="h-4 w-4" /> },
  { label: 'Achievements', href: '/hod-dashboard/achievements', icon: <Trophy className="h-4 w-4" /> },
  { label: 'Reports', href: '/hod-dashboard/reports', icon: <BarChart3 className="h-4 w-4" /> },
  { label: 'Notifications', href: '/hod-dashboard/notifications', icon: <Bell className="h-4 w-4" /> },
  { label: 'Profile', href: '/hod-dashboard/profile', icon: <User className="h-4 w-4" /> },
  { label: 'Settings', href: '/hod-dashboard/settings', icon: <Settings className="h-4 w-4" /> },
]

export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <Home className="h-4 w-4" /> },
  { label: 'Students', href: '/admin/students', icon: <Users className="h-4 w-4" /> },
  { label: 'Faculty', href: '/admin/faculty', icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'HOD', href: '/admin/hod', icon: <Users className="h-4 w-4" /> },
  { label: 'Admins', href: '/admin/admins', icon: <User className="h-4 w-4" /> },
  { label: 'Roles & Permissions', href: '/admin/roles', icon: <ShieldCheck className="h-4 w-4" /> },
  { label: 'Academics', href: '/admin/academics', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Study Resources', href: '/admin/resources', icon: <Database className="h-4 w-4" /> },
  { label: 'Question Papers', href: '/admin/question-papers', icon: <FileQuestion className="h-4 w-4" /> },
  { label: 'Projects', href: '/admin/projects', icon: <FolderOpen className="h-4 w-4" /> },
  { label: 'Events', href: '/admin/events', icon: <CalendarDays className="h-4 w-4" /> },
  { label: 'Announcements', href: '/admin/announcements', icon: <Megaphone className="h-4 w-4" /> },
  { label: 'Achievements', href: '/admin/achievements', icon: <Trophy className="h-4 w-4" /> },
  { label: 'Notifications', href: '/admin/notifications', icon: <Bell className="h-4 w-4" /> },
  { label: 'Reports', href: '/admin/reports', icon: <BarChart3 className="h-4 w-4" /> },
  { label: 'Activity Logs', href: '/admin/activity-logs', icon: <Newspaper className="h-4 w-4" /> },
  { label: 'File Management', href: '/admin/files', icon: <FileText className="h-4 w-4" /> },
  { label: 'System Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
  { label: 'Profile', href: '/admin/profile', icon: <User className="h-4 w-4" /> },
]

import { BarChart3, ShieldCheck } from 'lucide-react'