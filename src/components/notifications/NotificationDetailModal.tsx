'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  X,
  Bell,
  Calendar,
  User,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCheck,
  FileText,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { categorizeNotification, getMenuCategoryKey } from '@/lib/notificationClassifier'

export interface NotificationDetailData {
  id: string
  title: string
  message: string
  createdByName?: string | null
  createdAt?: string | Date | null
  time?: string
  link?: string
  category?: string
  type?: string
}

interface NotificationDetailModalProps {
  notification: NotificationDetailData | null
  onClose: () => void
  onActionClick?: (link: string) => void
}

export function NotificationDetailModal({
  notification,
  onClose,
  onActionClick,
}: NotificationDetailModalProps) {
  const router = useRouter()
  if (!notification) return null

  const domainKey =
    notification.category ||
    categorizeNotification(notification.title, notification.message) ||
    'announcements'

  // Map domain to user-friendly label
  const domainLabels: Record<string, string> = {
    'od-applications': 'OD & Leave Requests',
    'od-proofs': 'OD Proofs & Certificates',
    attendance: 'Attendance Notice',
    'question-papers': 'Examination & Papers',
    projects: 'Project & Capstone',
    events: 'Events & Workshops',
    achievements: 'Department Achievement',
    resources: 'Study Resources',
    subjects: 'Academic Curriculum',
    announcements: 'Official Announcement',
    students: 'Student Records',
    faculty: 'Faculty Directorate',
    reports: 'Audit & Reports',
  }

  const categoryLabel = domainLabels[domainKey] || 'Department Circular'

  // Format date display
  const displayTime =
    notification.time ||
    (notification.createdAt ? formatDate(new Date(notification.createdAt)) : 'Recently')

  // Resolve target link if not explicitly provided
  let destinationLink = notification.link
  if (!destinationLink || destinationLink.includes('/notifications')) {
    if (domainKey === 'od-applications') destinationLink = '/dashboard/od-applications'
    else if (domainKey === 'od-proofs') destinationLink = '/dashboard/od-proofs'
    else if (domainKey === 'attendance') destinationLink = '/dashboard/attendance'
    else if (domainKey === 'subjects') destinationLink = '/dashboard/subjects'
    else if (domainKey === 'events') destinationLink = '/dashboard/events'
    else if (domainKey === 'projects') destinationLink = '/dashboard/projects'
    else if (domainKey === 'question-papers') destinationLink = '/dashboard/question-papers'
    else if (domainKey === 'resources') destinationLink = '/dashboard/resources'
    else if (domainKey === 'achievements') destinationLink = '/dashboard/achievements'
  }

  const handleNavigate = () => {
    if (destinationLink) {
      if (onActionClick) {
        onActionClick(destinationLink)
      } else {
        router.push(destinationLink)
      }
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-[#071A3D]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider shadow-xs">
                {categoryLabel}
              </span>
              <span className="text-[11px] text-blue-200 font-medium">Official Dispatch</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white mt-3 leading-snug">
            {notification.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#22C7E8]" />
              {displayTime}
            </span>
            {notification.createdByName && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#F4C430]" />
                Issued by {notification.createdByName}
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin' }}>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1455D9] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Circular Message
                </p>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-2 font-medium">
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Marked as read — this alert is now cleared from your menu badge counter.</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Close
          </button>

          {destinationLink && (
            <button
              type="button"
              onClick={handleNavigate}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] hover:from-[#0F42A8] hover:to-[#071A3D] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer group"
            >
              <span>Go to {categoryLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-[#F4C430]" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
