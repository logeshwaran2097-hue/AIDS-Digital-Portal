'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
  Sparkles,
  Calendar,
  AlertCircle,
  Award,
  BookOpen,
  Filter,
  Check,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationSettingsUI } from '@/components/notifications/NotificationSettingsUI'

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  type: 'urgent' | 'academic' | 'event' | 'system'
  isRead: boolean
}

export function FacultyNotificationsView({
  initialNotifications = [],
}: {
  initialNotifications?: NotificationItem[]
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    )
  }

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Faculty Alert Center
            </span>
            <span className="text-xs text-gray-300 font-medium">· Real-time notifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Department Notifications</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Stay updated with student OD requests, examination circulars, and council meetings
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#22C7E8]" /> Mark All as Read
          </button>
        )}
      </div>

      <NotificationSettingsUI role="faculty" />

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              filter === 'all'
                ? 'bg-[#1455D9] text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              filter === 'unread'
                ? 'bg-[#1455D9] text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-[#071A3D] rounded-full text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-gray-200 text-gray-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="font-bold text-sm text-[#071A3D]">You're all caught up!</p>
            <p className="text-xs text-gray-400">No new alerts at this time.</p>
          </div>
        ) : (
          filteredNotifs.map((n) => {
            const isUnread = !n.isRead
            return (
              <Card
                key={n.id}
                className={cn(
                  'rounded-3xl border transition-all duration-200 overflow-hidden',
                  isUnread
                    ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                    : 'bg-white border-gray-200 opacity-80 hover:opacity-100'
                )}
              >
                <CardContent className="p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs',
                        n.type === 'urgent'
                          ? 'bg-red-100 text-red-600'
                          : n.type === 'academic'
                          ? 'bg-blue-100 text-[#1455D9]'
                          : n.type === 'event'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {n.type === 'urgent' ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : n.type === 'academic' ? (
                        <BookOpen className="w-5 h-5" />
                      ) : n.type === 'event' ? (
                        <Calendar className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#071A3D] leading-snug">{n.title}</h3>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#1455D9] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-gray-400 font-semibold">{n.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleRead(n.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#1455D9] hover:bg-blue-50 transition-colors"
                      title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => clearNotification(n.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
