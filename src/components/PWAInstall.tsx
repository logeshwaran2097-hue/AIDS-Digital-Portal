'use client'

import { useEffect, useState } from 'react'
import { Download, X, Share, PlusSquare, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

// Global shared install prompt — so ANY button on the page can trigger the native dialog
declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent | null
  }
}

export function PWAInstall() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
    setIsIOS(isIosDevice)

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Already installed in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone
    ) {
      setIsInstalled(true)
      return
    }

    // Save the deferred prompt globally so any install button on any page can use it
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      window.__pwaInstallPrompt = e as BeforeInstallPromptEvent

      // Auto-show the native bottom banner on mobile after a short delay
      const isMobile = /android|iphone|ipad|ipod/i.test(userAgent)
      if (isMobile) {
        setTimeout(() => setShowPrompt(true), 2000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      window.__pwaInstallPrompt = null
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    const prompt = window.__pwaInstallPrompt
    if (prompt) {
      setInstalling(true)
      try {
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') {
          setIsInstalled(true)
          setShowPrompt(false)
          window.__pwaInstallPrompt = null
        }
      } catch (err) {
        console.error('Install error:', err)
      } finally {
        setInstalling(false)
      }
    } else {
      // Prompt not available: browser needs the user to use its own menu
      // Show iOS-style guide for Android too (since beforeinstallprompt wasn't caught)
      setShowIOSGuide(true)
    }
  }

  if (isInstalled) return null

  return (
    <>
      {/* Bottom install banner for mobile */}
      {showPrompt && !isInstalled && (
        <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[420px] z-[9999] bg-[#071A41]/95 backdrop-blur-2xl text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(7,26,65,0.6)] border border-cyan-400/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-400">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-xl p-0.5 bg-gradient-to-tr from-[#E7B93E] to-cyan-400 shadow-md shrink-0">
              <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center p-0.5 overflow-hidden">
                <Image src="/icon-192.png" alt="VSB AI&DS Portal" width={38} height={38} className="object-contain" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-black text-white leading-tight truncate">Install Digital Portal of AI&amp;DS</p>
                <Sparkles className="w-3 h-3 text-[#E7B93E] shrink-0" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-cyan-200 font-semibold truncate mt-0.5">
                V.S.B. Engineering College · 1-Tap Install
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="px-3.5 py-2 bg-gradient-to-r from-[#E7B93E] to-amber-400 text-[#071A41] text-xs font-black rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_15px_rgba(231,185,62,0.4)] cursor-pointer flex items-center gap-1.5 disabled:opacity-70"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{installing ? 'Installing…' : 'Install'}</span>
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS / Fallback "Add to Home Screen" Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#071A41] to-[#1557C0] flex items-center justify-center shadow-md">
                  <Image src="/icon-192.png" alt="VSB" width={28} height={28} className="object-contain rounded-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#071A41]">
                    {isIOS ? 'Add to Home Screen' : 'Install App'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold">VSB AI&amp;DS Portal</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {isIOS ? (
                <>
                  <Step n={1} icon={<Share className="w-4 h-4 text-[#1557C0]" />}>
                    Tap the <strong>Share</strong> button at the bottom of Safari
                  </Step>
                  <Step n={2} icon={<PlusSquare className="w-4 h-4 text-[#1557C0]" />}>
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </Step>
                  <Step n={3} icon={<Download className="w-4 h-4 text-[#1557C0]" />}>
                    Tap <strong>Add</strong> in the top right corner
                  </Step>
                </>
              ) : (
                <>
                  <Step n={1} icon={<span className="text-base">⋮</span>}>
                    Tap the <strong>three-dot menu (⋮)</strong> at the top right of Chrome
                  </Step>
                  <Step n={2} icon={<Download className="w-4 h-4 text-[#1557C0]" />}>
                    Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>
                  </Step>
                  <Step n={3} icon={<span className="text-base">✓</span>}>
                    Tap <strong>Install</strong> to confirm — that's it!
                  </Step>
                </>
              )}
            </div>

            {/* Action */}
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 bg-gradient-to-r from-[#071A41] to-[#1557C0] text-white font-black text-sm rounded-2xl shadow-lg cursor-pointer hover:brightness-110 active:scale-95 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-[#1557C0] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <div className="flex items-start gap-2 flex-1">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <p className="text-xs text-slate-700 font-semibold leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
