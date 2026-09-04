'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Download, X, Share, PlusSquare, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { RealtimeAppDownloader } from '@/components/RealtimeAppDownloader'

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
  const [installing, setInstalling] = useState(false)
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false)
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const dismissed = typeof window !== 'undefined' && sessionStorage.getItem('vsb_pwa_banner_dismissed')
    if (!dismissed) {
      setShowBanner(true)
    }

    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream
    setIsIOS(isIosDevice)

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

  const triggerApkDownload = () => {
    try {
      const a = document.createElement('a')
      a.href = '/Digital-Portal-of-AI-and-DS.apk'
      a.download = 'Digital-Portal-of-AI-and-DS.apk'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      window.location.href = '/Digital-Portal-of-AI-and-DS.apk'
    }
  }

  const handleInstall = async () => {
    if (isIOS) { 
      setShowIOSGuide(true)
      return 
    }

    setInstalling(true)

    // 1. Trigger Direct APK Download for mobile
    triggerApkDownload()

    // 2. Also trigger browser prompt if available
    const prompt = promptRef.current || window.__pwaInstallPrompt
    if (prompt) {
      try {
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') {
          setIsInstalled(true)
          setShowBanner(false)
          promptRef.current = null
          window.__pwaInstallPrompt = null
        }
      } catch (e) {
        console.warn(e)
      }
    }

    setTimeout(() => {
      setInstalling(false)
    }, 1000)
  }

  if (isInstalled) return null

  return (
    <>
      {/* ── Bottom install banner (Android Chrome & Desktop) ── */}
      {showBanner && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[490px] z-[99999] bg-white text-[#071A3D] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-[0_15px_45px_rgba(7,26,65,0.18)] border-2 border-[#1455D9] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 rounded-xl p-0.5 bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] shadow-sm shrink-0">
              <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden p-0.5">
                <Image src="/icon-192.png" alt="Digital Portal of AI&DS" width={38} height={38} className="object-contain" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-black text-[#071A3D] leading-tight whitespace-nowrap">
                  Install Digital Portal of AI&amp;DS
                </p>
                <Sparkles className="w-3.5 h-3.5 text-[#E7B93E] shrink-0" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-semibold truncate mt-0.5">
                V.S.B. Engineering College · Offline Ready
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
              <span>{installing ? 'Installing…' : 'Install'}</span>
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
