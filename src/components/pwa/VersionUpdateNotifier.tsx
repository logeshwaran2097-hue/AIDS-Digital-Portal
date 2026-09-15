'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { RefreshCw, Download } from 'lucide-react'
import { playNotificationChime } from '@/lib/notificationEngine'

const LOCAL_STORAGE_VERSION_KEY = 'vsb_portal_app_version'

export function VersionUpdateNotifier() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [latestVersion, setLatestVersion] = useState<string>('2.0.0')
  const [releaseHighlights, setReleaseHighlights] = useState<string[]>([
    'Performance improvements and bug fixes',
  ])
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  
  const waitingWorkerRef = useRef<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkVersion = async () => {
      try {
        const res = await fetch(`/api/version?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
        })
        if (!res.ok) return
        const data = await res.json()
        const serverVer = data.version || '2.0.0'
        setLatestVersion(serverVer)
        
        if (data.releaseHighlights && Array.isArray(data.releaseHighlights)) {
          setReleaseHighlights(data.releaseHighlights)
        }

        const storedVer = localStorage.getItem(LOCAL_STORAGE_VERSION_KEY)

        if (!storedVer) {
          try {
            localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, serverVer)
          } catch {}
        } else if (storedVer !== serverVer) {
          setHasUpdate(true)
          try {
            playNotificationChime()
          } catch {}
        }
      } catch {}
    }

    checkVersion()
    const interval = setInterval(checkVersion, 90000)

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

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
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

      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing && isUpdating) {
          refreshing = true
          window.location.reload()
        }
      })
    }

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isUpdating])

  const handleManualApplyUpdate = () => {
    setIsUpdating(true)
    try {
      localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, latestVersion)
    } catch {}

    if (waitingWorkerRef.current) {
      try {
        waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' })
      } catch {}
    }
    
    // Fallback if SW doesn't trigger reload
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  if (!hasUpdate || isDismissed) return null

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
            <Image
              src="/icon-192.png"
              alt="App Update"
              width={48}
              height={48}
              className="rounded-xl object-contain"
            />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Update Available</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Version {latestVersion}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">What's New</p>
          <ul className="space-y-2">
            {releaseHighlights.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleManualApplyUpdate}
            disabled={isUpdating}
            className="w-full py-3.5 bg-[#071A41] hover:bg-[#0a2558] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          >
            {isUpdating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isUpdating ? 'Updating...' : 'Update Now'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            disabled={isUpdating}
            className="w-full py-3.5 bg-transparent text-slate-500 hover:text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}
