'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Bell, X, ExternalLink, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RealtimeToastData {
  id: string
  title: string
  message: string
  createdByName?: string | null
  type?: 'info' | 'warning' | 'alert' | 'success'
  link?: string
}

export function RealtimeNotificationToast({
  toast,
  onDismiss,
  onOpenDetail,
}: {
  toast: RealtimeToastData | null
  onDismiss: () => void
  onOpenDetail?: (toast: RealtimeToastData) => void
}) {
  const [visible, setVisible] = useState(false)
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  useEffect(() => {
    if (toast) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => {
          onDismissRef.current()
        }, 300)
      }, 8500)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [toast?.id, toast?.title])

  if (!toast || !visible) return null

  const handleTouch = () => {
    if (onOpenDetail && toast) {
      onOpenDetail(toast)
      setVisible(false)
      onDismissRef.current()
    }
  }

  return (
    <aside
      aria-label="Real-time Notification"
      className="fixed top-[max(14px,env(safe-area-inset-top))] left-3 right-3 sm:left-auto sm:right-6 z-[999999] max-w-md sm:w-[420px] transition-all duration-300 transform animate-in slide-in-from-top-6 fade-in pointer-events-auto select-none"
    >
      <div
        onClick={handleTouch}
        className={cn(
          'rounded-3xl bg-[#071A3D] text-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-[#22C7E8] backdrop-blur-2xl relative overflow-hidden flex items-start gap-3.5 group cursor-pointer transition-all duration-200 hover:border-[#F4C430] hover:scale-[1.01]'
        )}
      >
        {/* Glowing top line accent with animated gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#F4C430] animate-pulse" />

        {/* Animated College Emblem & Live Pulse Badge on Left */}
        <div className="relative shrink-0 mt-0.5">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border-2 border-white/80 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
            <Image
              src="/college-emblem.png"
              alt="VSB Emblem"
              width={42}
              height={42}
              className="object-contain"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C7E8] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#1455D9] border border-white items-center justify-center text-white text-[8px]">
              <Bell className="w-2.5 h-2.5 animate-bounce text-amber-300" />
            </span>
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[9px] font-black uppercase tracking-wider shadow-xs">
                Live Announcement
              </span>
              <span className="flex items-center gap-1 text-[10px] text-cyan-300 font-bold">
                <Volume2 className="w-3 h-3 text-cyan-300 animate-pulse" />
                <span>Alert</span>
              </span>
            </div>
            <span className="text-[10px] text-gray-300 font-medium">Just now</span>
          </div>

          <h4 className="text-sm font-black text-white leading-snug line-clamp-1 group-hover:text-[#F4C430] transition-colors">
            {toast.title}
          </h4>
          <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed">
            {toast.message}
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#22C7E8] font-bold truncate">
              {toast.createdByName ? `From: ${toast.createdByName}` : 'AI & DS Dept'}
            </span>

            <span className="text-[11px] font-black text-[#F4C430] group-hover:underline flex items-center gap-1 shrink-0 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/30">
              <span>Read Details</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setVisible(false)
            setTimeout(() => {
              onDismissRef.current()
            }, 200)
          }}
          className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}

