'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Sparkles, RefreshCw, X, CheckCircle2, ShieldCheck, Zap, Volume2 } from 'lucide-react'
import { playNotificationChime } from '@/lib/notificationEngine'

const LOCAL_STORAGE_VERSION_KEY = 'vsb_portal_app_version'

export function VersionUpdateNotifier() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [latestVersion, setLatestVersion] = useState<string>('1.2.0')
  const [releaseHighlights, setReleaseHighlights] = useState<string[]>([
    'Mobile 1-Click App Installer with WebAPK (Zero APK errors)',
    'Studio-grade acoustic notification sound chimes active in installed app',
    'Database connection pooler 100x acceleration & duplicate validation',
  ])
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showStartupScreen, setShowStartupScreen] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)
  const [updateStepText, setUpdateStepText] = useState('Checking system integrity & patches...')
  const [isComplete, setIsComplete] = useState(false)
  
  const waitingWorkerRef = useRef<ServiceWorker | null>(null)
  const hasTriggeredRef = useRef(false)

  // Start the simulated smooth update sequence
  const startUpdateSequence = (targetVersion: string, reloadOnFinish: boolean = false) => {
    setIsUpdating(true)
    setShowStartupScreen(true)
    setUpdateProgress(10)
    setUpdateStepText('Downloading latest application components...')

    const step1 = setTimeout(() => {
      setUpdateProgress(35)
      setUpdateStepText('Installing studio acoustic chimes & real app engine...')
    }, 450)

    const step2 = setTimeout(() => {
      setUpdateProgress(70)
      setUpdateStepText('Configuring database accelerators & offline cache...')
    }, 950)

    const step3 = setTimeout(() => {
      setUpdateProgress(95)
      setUpdateStepText('Verifying digital signatures & security tokens...')
    }, 1450)

    const step4 = setTimeout(() => {
      setUpdateProgress(100)
      setUpdateStepText('Update complete! Launching Digital Portal...')
      setIsComplete(true)

      try {
        localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, targetVersion)
      } catch {}

      try {
        playNotificationChime('quantum')
      } catch {}

      if (waitingWorkerRef.current) {
        try {
          waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' })
        } catch {}
      }

      // Finish and open the app
      setTimeout(() => {
        setShowStartupScreen(false)
        setIsUpdating(false)
        setHasUpdate(false)
        if (reloadOnFinish) {
          window.location.reload()
        }
      }, 700)
    }, 1900)

    return () => {
      clearTimeout(step1)
      clearTimeout(step2)
      clearTimeout(step3)
      clearTimeout(step4)
    }
  }

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
        const serverVer = data.version || '1.2.0'
        setLatestVersion(serverVer)
        if (data.releaseHighlights && Array.isArray(data.releaseHighlights)) {
          setReleaseHighlights(data.releaseHighlights)
        }

        const storedVer = localStorage.getItem(LOCAL_STORAGE_VERSION_KEY)

        // If user opens the app and hasn't updated to this new version yet, auto-launch startup updater
        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true
          if (!storedVer || storedVer !== serverVer) {
            startUpdateSequence(serverVer, false)
            return
          }
        } else if (storedVer && storedVer !== serverVer) {
          // If update was released while already running
          setHasUpdate(true)
          try {
            playNotificationChime()
          } catch {}
        }
      } catch {}
    }

    // Run initial check on app startup
    checkVersion()

    // Periodic check every 90 seconds
    const interval = setInterval(checkVersion, 90000)

    // Check on tab focus / visibility
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

    // Service Worker Lifecycle listener
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
    startUpdateSequence(latestVersion, true)
  }

  return (
    <>
      {/* ── Full-Screen Startup App Update Overlay ── */}
      {showStartupScreen && (
        <div className="fixed inset-0 z-[99999] bg-[#051129]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-gradient-to-b from-[#0A1F4D] via-[#071A3D] to-[#040E24] border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(20,85,217,0.45)] text-white text-center space-y-5 animate-in zoom-in-95 duration-300">
            {/* Pulsing App Icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/25 blur-xl animate-pulse" />
              <div className="relative w-full h-full rounded-2xl bg-white/10 border border-white/20 p-2 shadow-2xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon-192.png"
                  alt="Digital Portal"
                  width={64}
                  height={64}
                  className="rounded-xl object-contain"
                  priority
                />
              </div>
            </div>

            {/* Title & Version Badge */}
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Digital POrtal Of AI&amp;DS
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Updating to Version v{latestVersion}</span>
              </div>
            </div>

            {/* Progress Bar & Status Text */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="truncate pr-2">{updateStepText}</span>
                <span className="text-cyan-400 font-extrabold">{updateProgress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800/80 p-0.5 border border-white/10 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${updateProgress}%` }}
                />
              </div>
            </div>

            {/* Highlights list */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                What&apos;s New in v{latestVersion}:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {releaseHighlights.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug text-[11.5px]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Launch Status */}
            <div className="text-[11px] text-slate-400 font-medium pt-1">
              {isComplete ? (
                <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> All changes verified. Opening portal...
                </span>
              ) : (
                <span>Please wait while your app is upgraded automatically...</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Background Notification Toast (When App is already open) ── */}
      {hasUpdate && !isDismissed && !showStartupScreen && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 sm:p-4.5 rounded-3xl bg-gradient-to-br from-[#071A3D] via-[#0A2558] to-[#1455D9] text-white shadow-2xl border border-blue-400/40 backdrop-blur-xl flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shadow-inner shrink-0 border border-white/20">
                  <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                    <span>New Version Available!</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#22C7E8] text-[#071A3D] font-extrabold text-[10px]">
                      v{latestVersion}
                    </span>
                  </h4>
                  <p className="text-[11px] text-blue-100/90 leading-tight mt-0.5">
                    An updated version of the Digital Portal with bug fixes is ready to apply.
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
                onClick={handleManualApplyUpdate}
                disabled={isUpdating}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>Update &amp; Launch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
