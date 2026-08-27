'use client'

import React, { useEffect, useState } from 'react'
import { Bell, X, ExternalLink, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
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
}: {
  toast: RealtimeToastData | null
  onDismiss: () => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }, 7000)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [toast, onDismiss])

  if (!toast || !visible) return null

  return (
    <div className="fixed top-4 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 transition-all duration-300 transform animate-in slide-in-from-top-4 fade-in">
      <div className="rounded-3xl bg-[#071A3D] text-white p-4 shadow-2xl border border-[#22C7E8]/40 backdrop-blur-xl relative overflow-hidden flex items-start gap-3.5">
        {/* Glowing top line accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#F4C430] animate-pulse" />

        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center shrink-0 shadow-md mt-0.5">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className="px-2 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[9px] font-black uppercase tracking-wider">
              Live Alert
            </span>
            <span className="text-[10px] text-gray-300 font-medium">Just now</span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">{toast.title}</h4>
          <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{toast.message}</p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#22C7E8] font-semibold truncate">
              {toast.createdByName ? `From: ${toast.createdByName}` : 'AI & DS Dept'}
            </span>

            {toast.link && (
              <Link
                href={toast.link}
                onClick={() => {
                  setVisible(false)
                  onDismiss()
                }}
                className="text-[11px] font-bold text-[#F4C430] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View Alert</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setVisible(false)
            setTimeout(onDismiss, 200)
          }}
          className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
