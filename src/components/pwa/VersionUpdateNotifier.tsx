'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, RefreshCw, X, ArrowUpCircle } from 'lucide-react'
import { playNotificationChime } from '@/lib/notificationEngine'

export function VersionUpdateNotifier() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const initialVersionRef = useRef<string | null>(null)
  const waitingWorkerRef = useRef<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Initial version check
    const checkVersion = async () => {
      try {
        const res = await fetch(`/api/version?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
        })
        if (!res.ok) return
        const data = await res.json()
        const currentVer = data.version || '1.0.0'

        if (!initialVersionRef.current) {
          initialVersionRef.current = currentVer
        } else if (initialVersionRef.current !== currentVer) {
          setLatestVersion(currentVer)
          setHasUpdate(true)
          try {
            playNotificationChime()
          } catch {}
        }
      } catch {}
    }

    // Run initial check
    checkVersion()

    // Check periodically every 2 minutes
    const interval = setInterval(checkVersion, 120000)

    // Also check whenever user switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion()
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.update().catch(() => {})
          }).catch(() => {})
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 2. Service Worker Lifecycle detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        // If there's already a waiting worker, update is ready
        if (reg.waiting) {
          waitingWorkerRef.current = reg.waiting
          setHasUpdate(true)
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              waitingWorkerRef.current = newWorker
              setHasUpdate(true)
              try {
                playNotificationChime()
              } catch {}
            }
          })
        })
      }).catch(() => {})

      // When controller changes, reload automatically if update was requested
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleApplyUpdate = () => {
    setIsUpdating(true)
    try {
      if (waitingWorkerRef.current) {
        waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' })
      }
    } catch {}

    // Fallback reload
    setTimeout(() => {
      window.location.reload()
    }, 400)
  }

  if (!hasUpdate || isDismissed) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 sm:p-4.5 rounded-3xl bg-gradient-to-br from-[#071A3D] via-[#0A2558] to-[#1455D9] text-white shadow-2xl border border-blue-400/40 backdrop-blur-xl flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shadow-inner shrink-0 border border-white/20">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>New Portal Version Available!</span>
                {latestVersion && (
                  <span className="px-2 py-0.5 rounded-md bg-[#22C7E8] text-[#071A3D] font-extrabold text-[10px]">
                    v{latestVersion}
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-blue-100/90 leading-tight mt-0.5">
                An updated version of the Digital Portal is now ready to apply.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Later
          </button>
          <button
            type="button"
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Updating...' : 'Update & Refresh Now'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
