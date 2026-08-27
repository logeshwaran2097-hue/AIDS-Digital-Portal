'use client'

import { useEffect, useState } from 'react'
import { Download, X, Smartphone, Share, PlusSquare } from 'lucide-react'
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
      const dismissed = localStorage.getItem('pwa_prompt_dismissed')
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    // For iOS devices not in standalone mode, show banner after 2s
    if (isIosDevice && !(window.navigator as any).standalone) {
      const dismissed = localStorage.getItem('pwa_prompt_dismissed')
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 2000)
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

    if (!deferredPrompt) {
      alert('To install the app:\n• On Chrome/Android: Tap menu (⋮) ➔ "Add to Home screen" or "Install app".\n• On iOS/Safari: Tap Share ➔ "Add to Home Screen".')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  if (isInstalled) return null

  return (
    <>
      {/* Install Banner Prompt */}
      {showPrompt && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-[#071A41] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1 bg-white rounded-xl shrink-0 shadow-sm">
              <Image src="/college-emblem.png" alt="VSB Logo" width={34} height={34} className="rounded-lg object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight">Install V.S.B. Mobile App</p>
              <p className="text-[10px] text-blue-200 mt-0.5 truncate">Fast 1-tap access on home screen</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-[#E7B93E] text-[#071A41] text-xs font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-sm cursor-pointer"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#1557C0]" />
                <h3 className="text-sm font-bold text-[#071A41]">Install on iPhone / iPad</h3>
              </div>
              <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600">
              <p className="flex items-center gap-2 font-medium">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</span>
                <span>Tap the <Share className="w-4 h-4 inline text-blue-600 mx-1" /> <strong>Share</strong> icon in Safari bottom bar</span>
              </p>
              <p className="flex items-center gap-2 font-medium">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and tap <PlusSquare className="w-4 h-4 inline text-blue-600 mx-1" /> <strong>Add to Home Screen</strong></span>
              </p>
              <p className="flex items-center gap-2 font-medium">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>Add</strong> in the top right corner</span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-[#071A41] text-white font-bold text-xs rounded-xl shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
