'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Bell, Calendar, User, CheckCircle2, Filter, Sparkles, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationItem {
  id: string
  title: string
  message: string
  createdByName?: string | null
  createdAt: Date
}

export function StudentNotificationsView({ notifications }: { notifications: NotificationItem[] }) {
  const [filter, setFilter] = useState('ALL')
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  const handleMarkAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  const handleToggleRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
              Notification Center
            </span>
            <span className="text-xs text-gray-300 font-medium">· Real-Time Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Department Notifications &amp; Circulars</h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Official announcements, examination schedules, attendance alerts &amp; timetable updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-[#22C7E8]" /> Mark all as read
            </button>
          )}
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
            <p className="text-[10px] text-gray-300 uppercase font-bold">Unread</p>
            <p className="text-base font-black text-[#F4C430]">{unreadCount} Alerts</p>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="rounded-3xl border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-[#1455D9] flex items-center justify-center mb-3">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-[#071A3D] text-base">No Notifications</h3>
            <p className="text-xs text-gray-500 mt-1">You are all caught up! New reminders will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const isRead = readIds.has(item.id)
            return (
              <Card
                key={item.id}
                onClick={() => handleToggleRead(item.id)}
                className={cn(
                  'rounded-3xl border-gray-200 hover:shadow-md transition-all cursor-pointer group',
                  !isRead ? 'bg-white border-l-4 border-l-[#1455D9]' : 'bg-gray-50/70 opacity-80'
                )}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-105',
                      !isRead ? 'bg-[#1455D9]/10 text-[#1455D9]' : 'bg-gray-200 text-gray-400'
                    )}
                  >
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#071A3D] group-hover:text-[#1455D9] transition-colors">
                          {item.title}
                        </h3>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#1455D9] animate-pulse shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{item.message}</p>

                    {item.createdByName && (
                      <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 pt-0.5">
                        <User className="w-3 h-3 text-[#1455D9]" /> Issued by {item.createdByName}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
