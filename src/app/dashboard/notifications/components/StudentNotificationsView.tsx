'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Bell, Calendar, User, CheckCircle2, Filter, Sparkles, CheckCheck, Smartphone, Volume2, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationSettingsUI } from '@/components/notifications/NotificationSettingsUI'
import { NotificationDetailModal } from '@/components/notifications/NotificationDetailModal'

interface NotificationItem {
  id: string
  title: string
  message: string
  createdByName?: string | null
  createdAt: Date
  isRead?: boolean
}

export function StudentNotificationsView({ notifications: initialNotifications }: { notifications: NotificationItem[] }) {
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications)
  const [filter, setFilter] = useState('ALL')
  const [selectedDetailNotification, setSelectedDetailNotification] = useState<NotificationItem | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    return new Set(initialNotifications.filter((n) => n.isRead).map((n) => n.id))
  })

  // Real-time synchronization
  useEffect(() => {
    let isMounted = true
    const fetchLive = async () => {
      if (typeof document !== 'undefined' && document.hidden) return
      try {
        const res = await fetch('/api/notifications?role=student', { cache: 'no-store' })
        const data = await res.json()
        if (isMounted && data.success && Array.isArray(data.notifications)) {
          setItems(
            data.notifications.map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              createdByName: n.createdByName,
              createdAt: new Date(n.createdAt),
              isRead: n.isRead,
            }))
          )
          setReadIds((prev) => {
            const next = new Set(prev)
            data.notifications.forEach((n: any) => {
              if (n.isRead) next.add(n.id)
            })
            return next
          })
        }
      } catch {}
    }

    fetchLive()
    const timer = setInterval(fetchLive, 45000)
    const onVisibility = () => {
      if (!document.hidden) fetchLive()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      isMounted = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // Auto-mark all as read when seen on this page
  useEffect(() => {
    const hasUnread = items.some((n) => !readIds.has(n.id))
    if (hasUnread) {
      setReadIds(new Set(items.map((n) => n.id)))
      fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      }).catch(() => {})
      window.dispatchEvent(new CustomEvent('portal-notifications-marked-read'))
    }
  }, [items])

  // Cross-component sync for marked-read events
  useEffect(() => {
    const handleSync = (e: any) => {
      const specificId = e?.detail?.id
      if (specificId) {
        setReadIds((prev) => new Set(prev).add(specificId))
      } else {
        setReadIds(new Set(items.map((n) => n.id)))
      }
    }
    window.addEventListener('portal-notifications-marked-read', handleSync)
    return () => window.removeEventListener('portal-notifications-marked-read', handleSync)
  }, [items])

  const handleMarkAllRead = async () => {
    setReadIds(new Set(items.map((n) => n.id)))
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
    } catch {}
    window.dispatchEvent(new CustomEvent('portal-notifications-marked-read'))
  }

  const handleCardTouch = async (item: NotificationItem) => {
    if (!readIds.has(item.id)) {
      setReadIds((prev) => new Set(prev).add(item.id))
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: item.id }),
        })
      } catch {}
      window.dispatchEvent(new CustomEvent('portal-notifications-marked-read', { detail: { id: item.id } }))
    }
    setSelectedDetailNotification(item)
  }

  const handleToggleRead = async (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
    } catch {}
    window.dispatchEvent(new CustomEvent('portal-notifications-marked-read', { detail: { id } }))
  }

  const unreadCount = items.filter((n) => !readIds.has(n.id)).length

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-lg bg-[#002266] text-white p-5 sm:p-6 border border-[#001B4D] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-white/10 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider">
              Department Notices
            </span>
            <span className="text-xs text-blue-200 font-medium">· V.S.B. Engineering College</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Department Notifications &amp; Circulars</h1>
          <p className="text-xs text-blue-100/90 mt-1">
            Official announcements, examination schedules, attendance alerts &amp; timetable updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer uppercase tracking-wider"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#FFD700]" /> MARK ALL READ
            </button>
          )}
          <div className="px-3 py-1.5 bg-white/10 rounded-md border border-white/15 text-center">
            <p className="text-[10px] text-blue-200 uppercase font-semibold">Unread</p>
            <p className="text-sm font-bold text-[#FFD700]">{unreadCount} Notices</p>
          </div>
        </div>
      </div>

      {/* Reusable Notification Settings Component */}
      <NotificationSettingsUI role="student" />

      {/* Notifications List */}
      {items.length === 0 ? (
        <Card className="rounded-lg border border-[#E5E7EB] bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#003399] flex items-center justify-center mb-2.5">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#1F2937] text-sm">No Notifications at the moment</h3>
            <p className="text-xs text-gray-500 mt-0.5">New circulars and academic alerts will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const isRead = readIds.has(item.id)
            return (
              <Card
                key={item.id}
                onClick={() => handleCardTouch(item)}
                className={cn(
                  'rounded-lg border border-[#E5E7EB] hover:shadow-xs transition-colors cursor-pointer group',
                  !isRead ? 'bg-white border-l-4 border-l-[#003399]' : 'bg-gray-50/70 opacity-90'
                )}
              >
                <CardContent className="p-4 flex items-start gap-3.5">
                  <div
                    className={cn(
                      'p-2 rounded-md shrink-0 transition-colors',
                      !isRead ? 'bg-blue-50 text-[#003399]' : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xs sm:text-sm text-[#1F2937] group-hover:text-[#003399] transition-colors">
                          {item.title}
                        </h3>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#003399] shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 shrink-0 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{item.message}</p>

                    {item.createdByName && (
                      <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 pt-0.5">
                        <User className="w-3 h-3 text-[#003399]" /> Issued by {item.createdByName}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Touch-to-Open Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedDetailNotification}
        onClose={() => setSelectedDetailNotification(null)}
      />
    </div>
  )
}
