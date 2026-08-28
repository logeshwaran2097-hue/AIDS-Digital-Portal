'use client'

import { useEffect, useState } from 'react'
import { Download, X, Smartphone, Share, PlusSquare, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [showDirectGuide, setShowDirectGuide] = useState(false)

  useEffect(() => {
    // Check if running on iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
    setIsIOS(isIosDevice)

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('Service Worker registration failed:', err)
        })
      })
    }

    // Check if already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true)
      return
    }

    // Listen for install prompt event on Chrome / Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Display prompt immediately on mobile
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    // Auto-prompt on mobile devices after 1.5s
    const isMobile = /android|iphone|ipad|ipod/i.test(userAgent)
    if (isMobile) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 1500)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
      return
    }

    // If browser didn't emit beforeinstallprompt, show friendly guide
    setShowDirectGuide(true)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (isInstalled) return null

  return (
    <>
      {/* High-Impact Luxury Mobile Install Bar */}
      {showPrompt && (
        <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[420px] z-[9999] bg-[#071A41]/95 backdrop-blur-2xl text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(7,26,65,0.6)] border border-cyan-400/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-400">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-xl p-0.5 bg-gradient-to-tr from-[#E7B93E] to-cyan-400 shadow-md shrink-0">
              <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center p-0.5 overflow-hidden">
                <Image src="/icon-192.png" alt="VSB AI&DS Logo" width={38} height={38} className="object-contain" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-black text-white leading-tight truncate">Install VSB AI&amp;DS App</p>
                <Sparkles className="w-3 h-3 text-[#E7B93E] shrink-0" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-cyan-200 font-semibold truncate mt-0.5">
                1-Tap Quick Access · Fast &amp; Offline Ready
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-gradient-to-r from-[#E7B93E] to-amber-400 text-[#071A41] text-xs font-black rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_15px_rgba(231,185,62,0.4)] cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Android Chrome Direct Manual Install Modal */}
      {showDirectGuide && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#1557C0]" />
                <h3 className="text-sm font-black text-[#071A41]">Install on Android / Chrome</h3>
              </div>
              <button onClick={() => setShowDirectGuide(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <p className="flex items-center gap-2.5 font-semibold">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1557C0] font-black flex items-center justify-center shrink-0">1</span>
                <span>Tap the <strong>three dots menu (⋮)</strong> at top right of Chrome</span>
              </p>
              <p className="flex items-center gap-2.5 font-semibold">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1557C0] font-black flex items-center justify-center shrink-0">2</span>
                <span>Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong></span>
              </p>
              <p className="flex items-center gap-2.5 font-semibold">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1557C0] font-black flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>Install</strong> to add VSB AI&amp;DS to your home screen</span>
              </p>
            </div>
            <button
              onClick={() => setShowDirectGuide(false)}
              className="w-full py-2.5 bg-[#071A41] text-white font-black text-xs rounded-xl shadow-md cursor-pointer hover:bg-[#1557C0] transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#1557C0]" />
                <h3 className="text-sm font-black text-[#071A41]">Install on iPhone / iPad</h3>
              </div>
              <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <p className="flex items-center gap-2.5 font-semibold">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1557C0] font-black flex items-center justify-center shrink-0">1</span>
                <span>Tap the <Share className="w-4 h-4 inline text-blue-600 mx-1" /> <strong>Share</strong> button in Safari toolbar</span>
              </p>
              <p className="flex items-center gap-2.5 font-semibold">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1557C0] font-black flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and tap <PlusSquare className="w-4 h-4 inline text-blue-600 mx-1" /> <strong>&ldquo;Add to Home Screen&rdquo;</strong></span>
              </p>
              <p className="flex items-center gap-2.5 font-semibold">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1557C0] font-black flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>Add</strong> in the top right corner</span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-[#071A41] text-white font-black text-xs rounded-xl shadow-md cursor-pointer hover:bg-[#1557C0] transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}

