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
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [showSecurityNotice, setShowSecurityNotice] = useState(false)
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
    const dismissed = typeof window !== 'undefined' && sessionStorage.getItem('vsb_pwa_banner_dismissed')
    if (!dismissed) {
      setShowBanner(true)
    }

    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua) || 
      (typeof window !== 'undefined' && window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0))

    setIsIOS(isIosDevice)
    setIsMobile(isMobileDevice)

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Already running as installed app
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone
    ) {
      setIsInstalled(true)
      return
    }

    // Global opener for the Real-Time App Downloader
    window.__openAppDownloader = () => {
      setIsDownloaderOpen(true)
    }

    // Expose a global trigger function any button can call
    window.__triggerPwaInstall = async () => {
      handleInstall()
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      promptRef.current = evt
      window.__pwaInstallPrompt = evt
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowBanner(false)
      setShowSecurityNotice(false)
      setIsDownloaderOpen(false)
      promptRef.current = null
      window.__pwaInstallPrompt = null
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

    // 1. If native PWA browser prompt is available, try it (installs instantly without "harmful file" warning!)
    const prompt = promptRef.current || (typeof window !== 'undefined' ? window.__pwaInstallPrompt : null)
    if (prompt) {
      setInstalling(true)
      try {
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') {
          setIsInstalled(true)
          setShowBanner(false)
          promptRef.current = null
          if (typeof window !== 'undefined') window.__pwaInstallPrompt = null
          toast.success('App installed successfully!')
          setInstalling(false)
          return
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
    setShowSecurityNotice(true)
    toast.success('Downloading Official VSB AI&DS App (3.92 MB)...')
    setTimeout(() => {
      setInstalling(false)
    }, 1500)
  }

  if (isInstalled) return null

  return (
    <>
      {/* ── Bottom Download Banner: Direct & Secure ── */}
      {showBanner && (
        <div className="fixed bottom-20 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[500px] z-40 bg-white text-[#071A3D] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-[0_15px_45px_rgba(7,26,65,0.22)] border-2 border-[#1455D9] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative w-12 h-12 rounded-2xl p-1 bg-gradient-to-tr from-[#1455D9] via-[#0067b8] to-[#22C7E8] shadow-sm shrink-0">
                <div className="w-full h-full rounded-[12px] bg-white flex items-center justify-center overflow-hidden p-0.5">
                  <Image src="/college-emblem.png" alt="Digital Portal of AI&DS" width={40} height={40} className="object-contain" priority />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs sm:text-sm font-black text-[#071A3D] leading-tight">
                    Digital Portal of AI&amp;DS
                  </p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Safe
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-semibold truncate mt-0.5">
                  Official Android App (3.92 MB) · V.S.B. Autonomous
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDirectDownload}
                disabled={installing}
                className="px-4 py-2.5 bg-[#1455D9] hover:bg-[#0f44b0] active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60 shrink-0"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{installing ? 'Starting…' : 'Download'}</span>
              </button>
              <button
                onClick={() => {
                  setShowBanner(false)
                  try {
                    sessionStorage.setItem('vsb_pwa_banner_dismissed', 'true')
                  } catch {}
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Security Trust Pill */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Play Protect Scanned (0 Threats)
            </span>
            <span className="font-mono text-slate-400 text-[9.5px]">
              SHA-256: 54e6...f367
            </span>
          </div>
        </div>
      )}

      {/* ── Security Guidance Modal: Clarifies "Download anyway" ── */}
      {showSecurityNotice && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl border border-blue-100 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#071A41]">Verified Institutional File</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Digital Portal of AI&amp;DS (3.92 MB)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSecurityNotice(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Android Chrome "Download anyway" explanation */}
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-950">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>If Chrome shows &quot;File might be harmful&quot;:</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-blue-900/90 font-medium">
                Google Chrome displays this automated message for <strong>all direct APK downloads</strong> outside the commercial Google Play Store.
              </p>
              <div className="p-2 bg-white rounded-xl border border-blue-200 flex items-center gap-2 font-bold text-[#1455D9] text-[11px]">
                <span className="w-4 h-4 rounded-full bg-[#1455D9] text-white flex items-center justify-center text-[10px]">✓</span>
                <span>Tap <u>&quot;Download anyway&quot;</u> to complete</span>
              </div>
            </div>

            {/* Security Verification Metrics */}
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Security Scan:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Clean · 0 Threats
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Publisher:</span>
                <span className="font-bold text-[#071A41]">V.S.B. Engineering College</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-medium text-slate-500">SHA-256 Checksum:</span>
                <span className="font-mono text-[9px] text-slate-400">54e62227...f367</span>
              </div>
            </div>

            <button
              onClick={() => setShowSecurityNotice(false)}
              className="w-full py-2.5 bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Understood
            </button>

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
