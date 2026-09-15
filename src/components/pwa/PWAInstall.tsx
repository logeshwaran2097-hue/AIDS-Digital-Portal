'use client'

import { useEffect, useState, useRef } from 'react'
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { RealtimeAppDownloader } from './RealtimeAppDownloader'
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
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [showInstallOverlay, setShowInstallOverlay] = useState(false)
  const [installProgress, setInstallProgress] = useState(0)
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showHowToInstallHelper, setShowHowToInstallHelper] = useState(false)
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
      setShowInstallOverlay(true)
      setInstallProgress(0)
      // Simulate progress – real browsers don't expose install progress, so we fake it for UX
      const interval = setInterval(() => {
        setInstallProgress((prev) => {
          const next = Math.min(prev + Math.random() * 15 + 5, 100)
          if (next >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setShowInstallOverlay(false)
              setInstalling(false)
            }, 800)
          }
          return next
        })
      }, 300)

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
          toast.success('App installed successfully to your home screen!')
          return
        } else if (outcome === 'dismissed') {
          try {
            localStorage.setItem('pwa_install_dismissed', 'true')
          } catch {}
        }
      } catch (e) {
        console.warn(e)
      }
      // Ensure overlay is hidden if something went wrong
      setShowInstallOverlay(false)
      setInstalling(false)
    } else {
      setShowHowToInstallHelper(true)
    }
  }

  if (isInstalled) return null

  return (
    <>
      {/* Render full-screen install overlay when an install or download is in progress */}
      {showInstallOverlay && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-xl shadow-xl border border-gray-200">
            <Image src="/icon-192.png" alt="App Icon" width={64} height={64} className="rounded-lg" />
            <h3 className="text-lg font-semibold text-gray-800">Installing Digital Portal AI&amp;DS</h3>
            <p className="text-sm text-gray-600">Version <span className="font-medium">v2.0.0</span></p>
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${installProgress}%` }} />
            </div>
            {installProgress >= 100 && (
              <p className="mt-2 text-green-600 font-medium">Installation Complete ✅</p>
            )}
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
