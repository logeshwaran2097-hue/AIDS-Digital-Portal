'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Bell, Calendar, User, CheckCircle2, Filter, Sparkles, CheckCheck, Smartphone, Volume2, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  playNotificationChime,
  triggerDeviceVibration,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  dispatchNativeNotification,
} from '@/lib/notificationEngine'

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
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default')
  const [isSendingTest, setIsSendingTest] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPushStatus(getNotificationPermissionStatus())
    }
  }, [])

  const handleEnablePush = async () => {
    const perm = await requestNotificationPermission()
    setPushStatus(perm)
    if (perm === 'granted') {
      playNotificationChime()
      triggerDeviceVibration([200, 100, 200])
      dispatchNativeNotification({
        id: 'welcome_' + Date.now(),
        title: '🔔 Mobile Notifications Enabled!',
        message: 'You are all set to receive real-time class, attendance, and exam alerts.',
      })
    }
  }

  const handleTestAlert = async () => {
    setIsSendingTest(true)
    try {
      playNotificationChime()
      triggerDeviceVibration([200, 100, 200])

      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '📱 Real-Time Mobile Push Test',
          message: `Department alert delivered at ${new Date().toLocaleTimeString()} with sound & vibration!`,
          target: 'student',
        }),
      })

      dispatchNativeNotification({
        id: 'test_student_' + Date.now(),
        title: '📱 Real-Time Mobile Push Test',
        message: `Department alert delivered at ${new Date().toLocaleTimeString()} with sound & vibration!`,
      })
    } catch {} finally {
      setIsSendingTest(false)
    }
  }

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

      {/* Real-Time Mobile Push Configuration Banner */}
      <div className="bg-white rounded-3xl p-5 border border-blue-200/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center shrink-0 shadow-md">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#071A3D]">Real-Time Mobile Push &amp; Sound Alerts</h3>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-black uppercase',
                  pushStatus === 'granted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                )}
              >
                {pushStatus === 'granted' ? '● Connected' : '○ Permission Needed'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Receive native mobile push notifications, haptic vibrations, and audio chimes for immediate department updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {pushStatus !== 'granted' ? (
            <button
              onClick={handleEnablePush}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-102"
            >
              <Bell className="w-4 h-4" /> Enable Mobile Push
            </button>
          ) : (
            <button
              onClick={handleTestAlert}
              disabled={isSendingTest}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#22C7E8] hover:bg-[#1bb5d4] text-[#071A3D] text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-102 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" /> {isSendingTest ? 'Sending Alert...' : 'Test Mobile Notification'}
            </button>
          )}
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
