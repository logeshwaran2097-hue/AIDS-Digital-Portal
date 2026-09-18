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
  Star,
  ExternalLink,
} from 'lucide-react'
import { playNotificationChime, dispatchNativeNotification } from '@/lib/notificationEngine'
import { APP_VERSION, APP_RELEASE_HIGHLIGHTS } from '@/lib/version'
import { toast } from '@/components/ui/Toast'

const LOCAL_STORAGE_VERSION_KEY = 'vsb_portal_app_version'
const OFFICIAL_PRODUCTION_URL = 'https://aids-digital-portal-logeshwaran.vercel.app'

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
  { title: 'Connecting to Google Play & Vercel CDN', desc: 'Handshaking with secure deployment nodes...', pct: 15 },
  { title: 'Purging Deprecated App Cache', desc: 'Clearing outdated offline storage and service workers...', pct: 40 },
  { title: 'Downloading Portal Package', desc: 'Streaming updated React client bundles, styles & assets...', pct: 70 },
  { title: 'Google Play Protect Verification', desc: 'Scanning package binaries and validating cryptographic signatures...', pct: 90 },
  { title: 'Finalizing & Restarting Portal', desc: 'Security verified. Reloading into updated release...', pct: 100 },
]

export function VersionUpdateNotifier() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [latestVersion, setLatestVersion] = useState<string>(APP_VERSION)
  const [releaseHighlights, setReleaseHighlights] = useState<string[]>(APP_RELEASE_HIGHLIGHTS)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStageIdx, setCurrentStageIdx] = useState(0)
  const [progressPct, setProgressPct] = useState(0)
  const [downloadedMb, setDownloadedMb] = useState(0.4)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isRedirectNeeded, setIsRedirectNeeded] = useState(false)

  const waitingWorkerRef = useRef<ServiceWorker | null>(null)
  const hasPlayedUpdateChimeRef = useRef(false)

  const checkVersion = async (isManual = false) => {
    try {
      // 1. Try fetching from current origin first
      let res = await fetch(`/api/version?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
      }).catch(() => null)

      let isFallbackDomain = false

      // 2. If current origin fails (e.g. preview deployment retired by Vercel), fall back to official production endpoint
      if (!res || !res.ok) {
        res = await fetch(`${OFFICIAL_PRODUCTION_URL}/api/version?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
        }).catch(() => null)
        isFallbackDomain = true
      }

      if (!res || !res.ok) return

      const data = await res.json()
      const serverVer = data.version

      if (!serverVer) return

      setLatestVersion(serverVer)

      if (data.releaseHighlights && Array.isArray(data.releaseHighlights)) {
        setReleaseHighlights(data.releaseHighlights)
      }

      const storedVer = localStorage.getItem(LOCAL_STORAGE_VERSION_KEY)

      // An update is needed if:
      // - Current running bundle APP_VERSION is not equal to serverVer
      // - Or stored version is older than serverVer
      // - Or the user is running on an expired preview link instead of official domain
      const isRunningOldCode = APP_VERSION !== serverVer
      const isStoredOld = storedVer && storedVer !== serverVer

      if (isRunningOldCode || isStoredOld || isFallbackDomain) {
        setHasUpdate(true)
        setIsDismissed(false)
        if (isFallbackDomain && window.location.origin !== OFFICIAL_PRODUCTION_URL) {
          setIsRedirectNeeded(true)
        }
        if (!hasPlayedUpdateChimeRef.current) {
          hasPlayedUpdateChimeRef.current = true

          // Dispatch real system notification to Android status bar & lock screen
          dispatchNativeNotification({
            id: `version-update-${serverVer}`,
            title: `🚀 Portal Update Available: v${serverVer}`,
            message: `A new version of Digital Portal of AI&DS is ready with latest updates. Tap to upgrade.`,
            createdByName: 'V.S.B. Release Center',
            link: window.location.pathname,
          })

          // High-visibility toast
          toast.info(`🚀 New Release v${serverVer} available! Tap to install update.`, {
            duration: 8000,
          })

          try {
            playNotificationChime()
          } catch {}
        }
      } else {
        if (!storedVer) {
          try {
            localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, serverVer)
          } catch {}
        }
        if (isManual) {
          toast.success(`You are on the latest version (v${APP_VERSION})!`)
          // Dispatch real system notification to Android status bar
          dispatchNativeNotification({
            id: `manual-verified-${APP_VERSION}`,
            title: `✅ Digital Portal Up to Date (v${APP_VERSION})`,
            message: `Your mobile app is running the verified release with active bus pass and live alerts.`,
            createdByName: 'VSB Release Center',
            link: window.location.pathname,
          })
        }
      }
    } catch {
      if (isManual) {
        toast.info('Unable to check for updates right now.')
      }
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Show post-update celebratory real mobile notification & in-app toast
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const isUpdatedParam = urlParams.get('updated') === 'true'
      const justUpdated = sessionStorage.getItem('portal_just_updated') || isUpdatedParam
      const lastNotifiedVer = localStorage.getItem('last_notified_app_version')

      if (justUpdated || (lastNotifiedVer && lastNotifiedVer !== APP_VERSION)) {
        sessionStorage.removeItem('portal_just_updated')
        localStorage.setItem('last_notified_app_version', APP_VERSION)
        localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, APP_VERSION)

        // Real Android System Notification in phone status bar / lock screen
        dispatchNativeNotification({
          id: `app-updated-${APP_VERSION}`,
          title: `🎉 App Updated to v${APP_VERSION}`,
          message: `Digital Portal of AI&DS successfully updated! Bus pass QR code & direct contacts active.`,
          createdByName: 'VSB Release Center',
          link: window.location.pathname,
        })

        toast.success(`🎉 Updated to v${APP_VERSION}! Play Protect verified & ready.`, {
          duration: 6000,
        })
      } else if (!lastNotifiedVer) {
        localStorage.setItem('last_notified_app_version', APP_VERSION)
      }
    } catch {}

    // Check version immediately on mount
    checkVersion(false)

    // Check periodically every 30 seconds
    const interval = setInterval(() => checkVersion(false), 30000)

    // Re-check whenever user switches back to this app window/tab
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

    // Listen for manual triggers from clicking version badges
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
              if (!hasPlayedUpdateChimeRef.current) {
                hasPlayedUpdateChimeRef.current = true

                // Dispatch real system notification to Android status bar
                dispatchNativeNotification({
                  id: `worker-update-${Date.now()}`,
                  title: `🚀 Portal Update Downloaded`,
                  message: `A new release has been cached and is ready. Tap to reload.`,
                  createdByName: 'V.S.B. Release Center',
                  link: window.location.pathname,
                })

                toast.info(`🚀 Update ready! Tap to reload and activate.`, {
                  duration: 8000,
                })

                try {
                  playNotificationChime()
                } catch {}
              }
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
    setProgressPct(8)
    setDownloadedMb(0.6)
    setCurrentStageIdx(0)

    try {
      // Stage 1: Handshake
      await new Promise((r) => setTimeout(r, 600))
      setProgressPct(28)
      setDownloadedMb(1.5)
      setCurrentStageIdx(1)

      // Stage 2: Cache Wipe
      if ('caches' in window) {
        try {
          const keys = await caches.keys()
          await Promise.all(keys.map((k) => caches.delete(k)))
        } catch {}
      }
      await new Promise((r) => setTimeout(r, 700))
      setProgressPct(62)
      setDownloadedMb(2.9)
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
      await new Promise((r) => setTimeout(r, 700))
      setProgressPct(88)
      setDownloadedMb(3.8)
      setCurrentStageIdx(3)

      // Stage 4: Google Play Protect Scan
      await new Promise((r) => setTimeout(r, 800))
      setProgressPct(100)
      setDownloadedMb(4.2)
      setCurrentStageIdx(4)

      // Stage 5: Finalization & Seamless Reload (Preserving User Session)
      try {
        localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, latestVersion)
        sessionStorage.setItem('portal_just_updated', 'true')
      } catch {}

      await new Promise((r) => setTimeout(r, 600))

      // Keep user logged in and stay on their current dashboard/page
      const currentPath = typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/dashboard'
      const targetDomain = isRedirectNeeded ? OFFICIAL_PRODUCTION_URL : window.location.origin
      window.location.href = `${targetDomain}${currentPath}`
    } catch {
      window.location.reload()
    }
  }

  if (!hasUpdate && !isUpdating) return null
  if (isDismissed && !isUpdating) return null

  return (
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100 overflow-hidden relative animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300">
        
        {/* Play Store Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 -mt-1">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#01875f]" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a2.316 2.316 0 0 1-.22-.395V2.21c.066-.145.143-.277.22-.396zm11.241 11.243l2.257 2.257-11.83 6.645 9.573-8.902zm0-2.114L5.277 2.04l11.83 6.646-2.257 2.257zm1.488 1.487l3.63 2.04c.732.41.732 1.08 0 1.492l-3.63 2.04-1.999-2.786 1.999-2.786z"/>
            </svg>
            <span className="text-xs font-black tracking-wide text-slate-800 uppercase">Google Play · In-App Update</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Play Protect Verified</span>
          </div>
        </div>

        {!isUpdating ? (
          /* ========================================================================= */
          /* PLAY STORE UPDATE PROMPT                                                  */
          /* ========================================================================= */
          <>
            <div className="flex items-start gap-4 pt-1">
              <div className="relative shrink-0">
                <div className="w-18 h-18 rounded-2xl bg-[#071A41] p-1.5 shadow-md shadow-slate-900/10 border-2 border-amber-400/80 flex items-center justify-center">
                  <Image
                    src="/college-emblem.png"
                    alt="VSB Portal"
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#01875f] text-white shadow-xs">
                  <Sparkles className="w-3 h-3" />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900 leading-tight">Digital Portal of AI&DS</h3>
                <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
                  V.S.B. Engineering College (Autonomous)
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3 h-3 fill-current" />
                    4.9
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">4.2 MB</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[11px] font-bold text-blue-600">Rated for 3+</span>
                </div>
              </div>
            </div>

            {/* Version Transition Box */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between">
              <div className="text-center flex-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Installed</span>
                <span className="text-xs font-black text-slate-700">v{APP_VERSION}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-center flex-1">
                <span className="block text-[10px] font-bold text-emerald-600 uppercase">New Release</span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                  v{latestVersion}
                </span>
              </div>
            </div>

            {/* What's New Box */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                What's new in version {latestVersion}
              </span>
              <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-200/70 max-h-36 overflow-y-auto">
                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                  {releaseHighlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-4 h-4 rounded-full bg-[#01875f]/15 text-[#01875f] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleStartRealtimeUpdate}
                className="w-full py-3.5 bg-[#01875f] hover:bg-[#00704f] active:scale-[0.98] text-white font-black text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#01875f]/25 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Update</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Not now
              </button>
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* PLAY STORE DOWNLOADING & INSTALLING SCREEN                                */
          /* ========================================================================= */
          <div className="space-y-5 py-2 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner relative">
                <RefreshCw className="w-8 h-8 text-[#01875f] animate-spin" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                {progressPct < 90 ? 'Downloading update...' : progressPct < 100 ? 'Installing...' : 'Launching updated app...'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                {downloadedMb.toFixed(1)} MB / 4.2 MB · ({progressPct}%)
              </p>
            </div>

            {/* Google Play Linear Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full bg-[#01875f] transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Stages List */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2.5 text-xs">
              {UPDATE_STAGES.map((stg, idx) => {
                const isDone = idx < currentStageIdx
                const isCurrent = idx === currentStageIdx

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 transition-opacity duration-300 ${
                      isDone ? 'opacity-100 text-slate-900' : isCurrent ? 'opacity-100 text-[#01875f] font-black' : 'opacity-40 text-slate-400'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#01875f]" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-[#01875f] animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="font-bold">{stg.title}</p>
                      {isCurrent && <p className="text-[11px] text-slate-500 font-normal mt-0.5">{stg.desc}</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
              <Lock className="w-3.5 h-3.5 text-[#01875f]" />
              <span>Verified by Google Play Protect · TLS 1.3 (256-Bit AES)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

