'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Download, X, Share, PlusSquare, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { RealtimeAppDownloader } from '@/components/RealtimeAppDownloader'
import { toast } from '@/components/ui/Toast'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent | null
    __triggerPwaInstall?: () => void
    __openAppDownloader?: () => void
  }
}

export function PWAInstall() {
  const pathname = usePathname()
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [showMobileApkPrompt, setShowMobileApkPrompt] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null)

  const triggerApkDownload = () => {
    try {
      const a = document.createElement('a')
      a.href = '/api/download-apk'
      a.download = 'Digital-Portal-of-AI-and-DS.apk'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      window.location.href = '/api/download-apk'
    }
  }

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream
    const isAndroidDevice = /android/i.test(ua)
    const isMobileDevice = isAndroidDevice || /webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua) || 
      (typeof window !== 'undefined' && window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0))

    setIsIOS(isIosDevice)
    setIsMobile(isMobileDevice)

    // Check if running as already installed standalone app
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // On mobile devices, ask to install the APK version
    let dismissed = false
    try {
      dismissed =
        localStorage.getItem('vsb_apk_prompt_dismissed') === 'true' ||
        sessionStorage.getItem('vsb_apk_prompt_dismissed') === 'true'
    } catch {}

    if (isMobileDevice && !dismissed) {
      // Delay slightly so the page smoothly loads first
      const timer = setTimeout(() => {
        setShowMobileApkPrompt(true)
      }, 700)
      return () => clearTimeout(timer)
    }

    // Global opener for the Real-Time App Downloader
    window.__openAppDownloader = () => {
      setIsDownloaderOpen(true)
    }

    // Expose a global trigger function any button can call
    window.__triggerPwaInstall = async () => {
      handleInstall()
    }

    const handleBeforeInstallPrompt = async (e: Event) => {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      promptRef.current = evt
      window.__pwaInstallPrompt = evt

      // Check if user previously chose "Not now" or dismissed the install prompt
      let isDismissed = false
      try {
        isDismissed =
          localStorage.getItem('pwa_install_dismissed') === 'true' ||
          localStorage.getItem('pwa_installed') === 'true'
      } catch {}

      if (isDismissed) {
        // User already opted out by choosing "Not now". Respect their choice and do NOT auto-prompt.
        return
      }

      // Automatically ask to download/install via native browser prompt (only on first visit, before dismissal)
      try {
        await evt.prompt()
        if (evt.userChoice) {
          evt.userChoice
            .then(({ outcome }) => {
              if (outcome === 'dismissed') {
                try {
                  localStorage.setItem('pwa_install_dismissed', 'true')
                } catch {}
              } else if (outcome === 'accepted') {
                try {
                  localStorage.setItem('pwa_installed', 'true')
                  setIsInstalled(true)
                } catch {}
              }
            })
            .catch(() => {})
        }
      } catch {
        const triggerNativePrompt = async () => {
          window.removeEventListener('click', triggerNativePrompt)
          window.removeEventListener('touchstart', triggerNativePrompt)

          let dismissedNow = false
          try {
            dismissedNow =
              localStorage.getItem('pwa_install_dismissed') === 'true' ||
              localStorage.getItem('pwa_installed') === 'true'
          } catch {}

          if (dismissedNow) return

          if (promptRef.current) {
            try {
              await promptRef.current.prompt()
              if (promptRef.current.userChoice) {
                promptRef.current.userChoice
                  .then(({ outcome }) => {
                    if (outcome === 'dismissed') {
                      try {
                        localStorage.setItem('pwa_install_dismissed', 'true')
                      } catch {}
                    } else if (outcome === 'accepted') {
                      try {
                        localStorage.setItem('pwa_installed', 'true')
                        setIsInstalled(true)
                      } catch {}
                    }
                  })
                  .catch(() => {})
              }
            } catch {}
          }
        }
        window.addEventListener('click', triggerNativePrompt, { once: true })
        window.addEventListener('touchstart', triggerNativePrompt, { once: true })
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsDownloaderOpen(false)
      promptRef.current = null
      window.__pwaInstallPrompt = null
      try {
        localStorage.setItem('pwa_installed', 'true')
      } catch {}
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.__triggerPwaInstall = undefined
      window.__openAppDownloader = undefined
    }
  }, [])

  const handleInstall = async () => {
    if (isIOS) { 
      setShowIOSGuide(true)
      return 
    }

    // If native PWA browser prompt is available, ask natively
    const prompt = promptRef.current || (typeof window !== 'undefined' ? window.__pwaInstallPrompt : null)
    if (prompt) {
      setInstalling(true)
      try {
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') {
          setIsInstalled(true)
          promptRef.current = null
          if (typeof window !== 'undefined') window.__pwaInstallPrompt = null
          try {
            localStorage.setItem('pwa_installed', 'true')
          } catch {}
          toast.success('App installed successfully!')
          setInstalling(false)
          return
        } else if (outcome === 'dismissed') {
          try {
            localStorage.setItem('pwa_install_dismissed', 'true')
          } catch {}
        }
      } catch (e) {
        console.warn(e)
      }
      setInstalling(false)
    }

    handleDirectDownload()
  }

  const handleDirectDownload = () => {
    setInstalling(true)
    triggerApkDownload()
    toast.success('Downloading Official VSB AI&DS App (3.92 MB)...')
    setTimeout(() => {
      setInstalling(false)
    }, 1500)
  }

  const handleInstallApk = () => {
    setShowMobileApkPrompt(false)
    try {
      sessionStorage.setItem('vsb_apk_prompt_dismissed', 'true')
    } catch {}

    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    handleDirectDownload()
  }

  const handleDismissMobileApkPrompt = () => {
    setShowMobileApkPrompt(false)
    try {
      localStorage.setItem('vsb_apk_prompt_dismissed', 'true')
      sessionStorage.setItem('vsb_apk_prompt_dismissed', 'true')
    } catch {}
  }

  if (isInstalled) return null

  return (
    <>
      {/* ── Official Mobile APK Installation Prompt ── */}
      {showMobileApkPrompt && !isInstalled && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#051329] via-[#1455D9] to-[#22C7E8] p-0.5 shadow-md shrink-0">
                  <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center p-1">
                    <Image
                      src="/college-emblem.png"
                      alt="VSB"
                      width={44}
                      height={44}
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-black text-[#071A41] leading-tight truncate">
                      Digital Portal of AI&amp;DS
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    Official Android APK · 3.92 MB
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified &amp; Safe to Install
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismissMobileApkPrompt}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt Message */}
            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-[#071A41] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1557C0]" />
                Install Mobile App
              </p>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                For the fastest performance, offline access, and instant notifications, install the official Android APK on your phone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDismissMobileApkPrompt}
                className="flex-1 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all cursor-pointer"
              >
                Continue in Browser
              </button>

              <button
                type="button"
                onClick={handleInstallApk}
                disabled={installing}
                className="flex-1 py-3 px-3 bg-gradient-to-r from-[#1455D9] via-[#1043aa] to-[#071A41] text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-75"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{installing ? 'Starting…' : 'Install APK'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── iOS Add-to-Home-Screen guide ── */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#071A41] to-[#1557C0] flex items-center justify-center shadow-md">
                  <Image src="/icon-192.png" alt="VSB" width={30} height={30} className="object-contain rounded-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#071A41]">Add to Home Screen</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">VSB AI&amp;DS Portal · iOS Safari</p>
                </div>
              </div>
              <button onClick={() => setShowIOSGuide(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3.5">
              <Step n={1} icon={<Share className="w-4 h-4 text-blue-500" />}>
                Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" /> in Safari's toolbar
              </Step>
              <Step n={2} icon={<PlusSquare className="w-4 h-4 text-blue-500" />}>
                Scroll and tap <strong>"Add to Home Screen"</strong>
              </Step>
              <Step n={3} icon={<Download className="w-4 h-4 text-emerald-500" />}>
                Tap <strong>Add</strong> — the app will appear on your home screen
              </Step>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 bg-gradient-to-r from-[#071A41] to-[#1557C0] text-white font-black text-sm rounded-2xl shadow-lg cursor-pointer hover:brightness-110 active:scale-95 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Real-Time App Downloader Modal */}
      <RealtimeAppDownloader
        isOpen={isDownloaderOpen}
        onClose={() => setIsDownloaderOpen(false)}
      />
    </>
  )
}

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-[#1557C0] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">{n}</div>
      <div className="flex items-start gap-2 flex-1 pt-0.5">
        <span className="shrink-0">{icon}</span>
        <p className="text-xs text-slate-700 font-semibold leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
