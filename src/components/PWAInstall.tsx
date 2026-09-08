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
  const [showTrustModal, setShowTrustModal] = useState(false)
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
      setShowTrustModal(false)
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

    // 2. Otherwise on mobile or desktop, open the official Institutional Trust Verification modal
    setShowTrustModal(true)
  }

  const handleProceedApkDownload = () => {
    triggerApkDownload()
    toast.success('Downloading Official Android APK (3.92 MB)...')
    setTimeout(() => {
      setShowTrustModal(false)
    }, 1500)
  }

  if (isInstalled) return null

  return (
    <>
      {/* ── Bottom install banner (Laptop Desktop & Mobile) ── */}
      {showBanner && !showTrustModal && (
        <div className="fixed bottom-22 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[490px] z-40 bg-white text-[#071A3D] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-[0_15px_45px_rgba(7,26,65,0.18)] border-2 border-[#1455D9] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 rounded-xl p-0.5 bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] shadow-sm shrink-0">
              <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden p-0.5">
                <Image src="/college-emblem.png" alt="Digital Portal of AI&DS" width={38} height={38} className="object-contain" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-black text-[#071A3D] leading-tight whitespace-nowrap">
                  {isMobile ? 'Install VSB AI&DS App' : 'Install Digital Portal of AI&DS'}
                </p>
                <Sparkles className="w-3.5 h-3.5 text-[#E7B93E] shrink-0" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-semibold truncate mt-0.5">
                {isMobile ? 'Verified Institutional Portal · Fast & Offline Ready' : 'V.S.B. Engineering College · Autonomous'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="px-3.5 py-2 bg-[#1455D9] hover:bg-[#0f44b0] text-white text-xs font-black rounded-xl active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-60 shrink-0"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{installing ? 'Installing…' : 'Install App'}</span>
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
      )}

      {/* ── Institutional Security & Trust Modal (Explaining Chrome's APK prompt) ── */}
      {showTrustModal && (
        <div className="fixed inset-0 z-[10000] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            
            {/* Header with College Emblem */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl border border-blue-100 bg-blue-50/50 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                  <Image src="/college-emblem.png" alt="VSB Emblem" width={46} height={46} className="object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-[#071A41]">Digital Portal of AI&amp;DS</h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">V.S.B. Engineering College (Autonomous)</p>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Official Institutional Application · 3.92 MB
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowTrustModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Why Chrome displays "File might be harmful" */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Why Android Chrome shows &quot;File might be harmful&quot;:</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-amber-900/90 font-medium">
                Google Chrome automatically displays this standard precaution for <strong>all direct APK downloads</strong> hosted on college or institutional servers outside the commercial Google Play Store.
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>This application is 100% verified, virus-free, and safe to install.</span>
              </div>
            </div>

            {/* Step by step install guide */}
            <div className="space-y-2.5 pt-1">
              <p className="text-xs font-bold text-slate-800">Quick Installation Steps:</p>
              
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-[#1455D9] text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span className="font-semibold">Tap <strong className="text-[#1455D9]">&quot;Download anyway&quot;</strong> on Chrome&apos;s prompt</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-[#1455D9] text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span className="font-semibold">Tap <strong className="text-slate-900">&quot;Open&quot;</strong> in your browser notifications</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-[#1455D9] text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <span className="font-semibold">Tap <strong className="text-emerald-700">&quot;Install&quot;</strong> to launch the app</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleProceedApkDownload}
                className="w-full py-3 bg-[#1455D9] hover:bg-[#0f44b0] active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Official APK (3.92 MB)</span>
              </button>

              <button
                onClick={() => setShowTrustModal(false)}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Continue in Browser
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
