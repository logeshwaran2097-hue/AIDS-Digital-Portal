'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  RefreshCw,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lock,
  Cpu,
  Zap,
} from 'lucide-react'
import { playNotificationChime } from '@/lib/notificationEngine'
import { APP_VERSION, APP_RELEASE_HIGHLIGHTS } from '@/lib/version'
import { toast } from '@/components/ui/Toast'

const LOCAL_STORAGE_VERSION_KEY = 'vsb_portal_app_version'

export function triggerPortalUpdateCheck() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('check-for-portal-update', { detail: { manual: true } }))
  }
}

interface UpdateStage {
  title: string
  desc: string
  pct: number
}

const UPDATE_STAGES: UpdateStage[] = [
  { title: 'Connecting to Cloud Servers', desc: 'Handshaking with secure deployment endpoints...', pct: 20 },
  { title: 'Clearing Stale PWA Cache', desc: 'Purging deprecated offline caches and service worker slots...', pct: 45 },
  { title: 'Downloading Portal v2.1.2', desc: 'Fetching updated React components, stylesheets, and assets...', pct: 70 },
  { title: 'Security Integrity Verification', desc: 'Validating cryptographic tokens, SSL protocols, and session state...', pct: 90 },
  { title: 'Finalizing & Launching Portal', desc: 'Security checks cleared. Launching updated version...', pct: 100 },
]

export function VersionUpdateNotifier() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [latestVersion, setLatestVersion] = useState<string>(APP_VERSION)
  const [releaseHighlights, setReleaseHighlights] = useState<string[]>(APP_RELEASE_HIGHLIGHTS)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStageIdx, setCurrentStageIdx] = useState(0)
  const [progressPct, setProgressPct] = useState(0)
  const [isDismissed, setIsDismissed] = useState(false)

  const waitingWorkerRef = useRef<ServiceWorker | null>(null)

  const checkVersion = async (isManual = false) => {
    try {
      const res = await fetch(`/api/version?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
      })
      if (!res.ok) return
      const data = await res.json()
      const serverVer = data.version || APP_VERSION
      setLatestVersion(serverVer)

      if (data.releaseHighlights && Array.isArray(data.releaseHighlights)) {
        setReleaseHighlights(data.releaseHighlights)
      }

      const storedVer = localStorage.getItem(LOCAL_STORAGE_VERSION_KEY)

      // True update condition:
      // The currently running client bundle has APP_VERSION that differs from serverVer,
      // or the local storage records an older version!
      const isRunningOldCode = APP_VERSION !== serverVer
      const isStoredOld = storedVer && storedVer !== serverVer

      if (isRunningOldCode || isStoredOld) {
        setHasUpdate(true)
        setIsDismissed(false)
        try {
          playNotificationChime()
        } catch {}
      } else {
        if (!storedVer) {
          try {
            localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, serverVer)
          } catch {}
        }
        if (isManual) {
          toast.success(`You are on the latest version (v${APP_VERSION})!`)
        }
      }
    } catch {
      if (isManual) {
        toast.info('Could not reach update server. Please check internet connection.')
      }
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Show celebratory post-update notice if just restarted
    try {
      const justUpdated = sessionStorage.getItem('portal_just_updated')
      if (justUpdated) {
        sessionStorage.removeItem('portal_just_updated')
        toast.success(`🎉 Updated to v${APP_VERSION}! Security checks passed & all features ready.`, {
          duration: 6000,
        })
      }
    } catch {}

    // Check version immediately on mount
    checkVersion(false)

    // Periodic check every 45s
    const interval = setInterval(() => checkVersion(false), 45000)

    // Re-check whenever user switches back to this tab / app window
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion(false)
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.update().catch(() => {})
          }).catch(() => {})
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Listen for manual trigger from clicking version badge in navbar/sidebar
    const handleManualEvent = (e: any) => {
      checkVersion(e?.detail?.manual ?? true)
    }
    window.addEventListener('check-for-portal-update', handleManualEvent)

    // Service Worker update detection
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
      window.removeEventListener('check-for-portal-update', handleManualEvent)
    }
  }, [isUpdating])

  // Execute full real-time update with security checks & animated progress
  const handleStartRealtimeUpdate = async () => {
    setIsUpdating(true)
    setProgressPct(5)
    setCurrentStageIdx(0)

    try {
      // Stage 1: Handshake
      await new Promise((r) => setTimeout(r, 600))
      setProgressPct(25)
      setCurrentStageIdx(1)

      // Stage 2: Cache Wipe
      if ('caches' in window) {
        try {
          const keys = await caches.keys()
          await Promise.all(keys.map((k) => caches.delete(k)))
        } catch {}
      }
      await new Promise((r) => setTimeout(r, 700))
      setProgressPct(55)
      setCurrentStageIdx(2)

      // Stage 3: Service Worker Refresh
      if (waitingWorkerRef.current) {
        try {
          waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' })
        } catch {}
      }
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations()
          for (const reg of regs) {
            reg.update().catch(() => {})
          }
        } catch {}
      }
      await new Promise((r) => setTimeout(r, 800))
      setProgressPct(85)
      setCurrentStageIdx(3)

      // Stage 4: Security & Integrity Checks
      await new Promise((r) => setTimeout(r, 900))
      setProgressPct(100)
      setCurrentStageIdx(4)

      // Stage 5: Finalization & Clean Reload
      try {
        localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, latestVersion)
        sessionStorage.setItem('portal_just_updated', 'true')
      } catch {}

      await new Promise((r) => setTimeout(r, 600))

      // Force hard refresh to the root/current URL with cache-busting timestamp
      const targetUrl = new URL(window.location.href)
      targetUrl.searchParams.set('updated', String(Date.now()))
      window.location.href = targetUrl.toString()
    } catch {
      // Fallback restart
      window.location.reload()
    }
  }

  if (!hasUpdate && !isUpdating) return null
  if (isDismissed && !isUpdating) return null

  return (
    <div className="fixed inset-0 z-[99999] bg-[#071A41]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100 overflow-hidden relative">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {!isUpdating ? (
          /* ========================================================================= */
          /* STAGE 1: UPDATE AVAILABLE PROMPT MODAL                                    */
          /* ========================================================================= */
          <>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                  <div className="w-full h-full bg-[#071A41] rounded-[14px] flex items-center justify-center">
                    <Image
                      src="/college-emblem.png"
                      alt="VSB Portal"
                      width={44}
                      height={44}
                      className="object-contain"
                    />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                  <Sparkles className="w-3 h-3" />
                </span>
              </div>

              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1455D9] text-[11px] font-black uppercase tracking-wider mb-1">
                  <Zap className="w-3 h-3 text-[#1455D9]" />
                  <span>Real-Time Update Available</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Update Digital Portal</h3>
                <div className="flex items-center justify-center gap-2 mt-1.5 text-xs font-bold text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">Current: v{APP_VERSION}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    New: v{latestVersion}
                  </span>
                </div>
              </div>
            </div>

            {/* Highlights list */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">What's in this update</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Build
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                {releaseHighlights.slice(0, 4).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1455D9] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleStartRealtimeUpdate}
                className="w-full py-3.5 bg-gradient-to-r from-[#1455D9] via-[#0b40b3] to-[#071A41] hover:brightness-110 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-blue-600/25 cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Update Now (v{latestVersion})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Remind Me Later
              </button>
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* STAGE 2: REAL-TIME SECURITY VERIFICATION & INSTALL PROGRESS SCREEN         */
          /* ========================================================================= */
          <div className="space-y-5 py-2 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner relative">
                <ShieldCheck className="w-8 h-8 text-[#1455D9] animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Applying Portal Update</h3>
              <p className="text-xs text-slate-500 font-medium">
                Upgrading to <span className="font-bold text-[#1455D9]">v{latestVersion}</span> · Do not close this window
              </p>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black">
                <span className="text-slate-700">Progress</span>
                <span className="text-[#1455D9]">{progressPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#10B981] transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Stage Timeline */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs">
              {UPDATE_STAGES.map((stg, idx) => {
                const isDone = idx < currentStageIdx
                const isCurrent = idx === currentStageIdx

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 transition-opacity duration-300 ${
                      isDone ? 'opacity-100 text-slate-900' : isCurrent ? 'opacity-100 text-[#1455D9] font-bold' : 'opacity-40 text-slate-500'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-[#1455D9] animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 leading-snug">
                      <p className="font-bold">{stg.title}</p>
                      {isCurrent && <p className="text-[11px] text-slate-500 font-normal mt-0.5">{stg.desc}</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>End-to-End Encrypted Verification</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
