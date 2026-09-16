'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Download, X, Share, PlusSquare, MoreVertical, Smartphone, ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { RealtimeAppDownloader } from './RealtimeAppDownloader'
import { AppSecurityInstallModal } from './AppSecurityInstallModal'
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
    __openAppSecurityInstallModal?: () => void
  }
}

export function PWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [showChromeGuide, setShowChromeGuide] = useState(false)
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null)

  // Primary install handler triggered by user clicking "Install App"
  const handleInstall = useCallback(async () => {
    // 1. Check if already running in standalone mode
    const isStandalone =
      typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      )

    if (isStandalone) {
      toast.success('Digital Portal is already running as an installed app!')
      return
    }

    // 2. iOS Safari handling
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    // 3. In-App Browser detection (Instagram, Facebook, WhatsApp webviews)
    if (isInAppBrowser) {
      setShowChromeGuide(true)
      return
    }

    // 4. Retrieve native Chrome beforeinstallprompt event
    const prompt = promptRef.current || (typeof window !== 'undefined' ? window.__pwaInstallPrompt : null)

    if (prompt) {
      try {
        // Trigger Chrome's native install dialog directly
        await prompt.prompt()

        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') {
          toast.success('Installing Digital Portal to your home screen...')
          promptRef.current = null
          if (typeof window !== 'undefined') {
            window.__pwaInstallPrompt = null
          }
          try {
            localStorage.setItem('pwa_installed', 'true')
          } catch {}
        } else {
          toast.info('Installation cancelled. Tap "Install App" anytime to install.')
        }
      } catch (err) {
        console.warn('[PWA] Prompt error, displaying Chrome install instructions:', err)
        setShowChromeGuide(true)
      }
    } else {
      // If prompt event hasn't fired yet or was already accepted/dismissed by browser
      setShowChromeGuide(true)
    }
  }, [isIOS, isInAppBrowser])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream
    const inApp = /fbav|instagram|fban|line|micromessenger|telegram|whatsapp|webview/i.test(ua)

    setIsIOS(isIosDevice)
    setIsInAppBrowser(inApp)

    // Check standalone state
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone || localStorage.getItem('pwa_installed') === 'true') {
      setIsInstalled(true)
      try {
        localStorage.setItem('pwa_installed', 'true')
        window.dispatchEvent(new Event('pwa-installed-event'))
      } catch {}
      return
    }

    if ('getInstalledRelatedApps' in navigator) {
      try {
        ;(navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
          if (apps && apps.length > 0) {
            setIsInstalled(true)
            try {
              localStorage.setItem('pwa_installed', 'true')
              window.dispatchEvent(new Event('pwa-installed-event'))
            } catch {}
          }
        }).catch(() => {})
      } catch {}
    }

    // Pick up prompt if already caught by layout's early script
    if (window.__pwaInstallPrompt) {
      promptRef.current = window.__pwaInstallPrompt
    }

    const onPromptCaptured = () => {
      if (window.__pwaInstallPrompt) {
        promptRef.current = window.__pwaInstallPrompt
      }
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      promptRef.current = evt
      window.__pwaInstallPrompt = evt
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      promptRef.current = null
      window.__pwaInstallPrompt = null
      setShowChromeGuide(false)
      setShowIOSGuide(false)
      try {
        localStorage.setItem('pwa_installed', 'true')
        window.dispatchEvent(new Event('pwa-installed-event'))
      } catch {}
      toast.success('Digital Portal of AI&DS installed successfully!')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('pwa-prompt-captured', onPromptCaptured)
    window.addEventListener('appinstalled', onAppInstalled)

    // Register global trigger function so the Login Page "Install App" button can invoke it directly
    window.__triggerPwaInstall = () => {
      handleInstall()
    }

    window.__openAppDownloader = () => {
      setIsDownloaderOpen(true)
    }

    window.__openAppSecurityInstallModal = () => {
      setIsSecurityModalOpen(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('pwa-prompt-captured', onPromptCaptured)
      window.removeEventListener('appinstalled', onAppInstalled)
      window.__triggerPwaInstall = undefined
      window.__openAppDownloader = undefined
      window.__openAppSecurityInstallModal = undefined
    }
  }, [handleInstall])

  const openInChromeAndroid = () => {
    try {
      const currentUrl = window.location.href.replace(/^https?:\/\//, '')
      window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`
    } catch {
      window.location.href = window.location.href
    }
  }

  if (isInstalled) return null

  return (
    <>
      {/* ── Chrome Android Step-by-Step Install Guide Modal (Shown only if browser prompt needs manual trigger) ── */}
      {showChromeGuide && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center relative pt-2">
              <button
                onClick={() => setShowChromeGuide(false)}
                className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#071A41] to-[#1557C0] flex items-center justify-center shadow-lg mb-3">
                <Image src="/icon-192.png" alt="Portal Icon" width={48} height={48} className="object-contain rounded-xl" />
              </div>

              <h3 className="text-base font-black text-[#071A41]">Digital Portal of AI&amp;DS</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">V.S.B. Engineering College</p>
            </div>

            <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-900 font-medium">
                Install directly from Google Chrome to your home screen.
              </p>
            </div>

            <div className="space-y-3">
              <Step n={1} icon={<MoreVertical className="w-4 h-4 text-blue-600" />}>
                Tap Chrome&apos;s <strong>menu (⋮)</strong> at top-right.
              </Step>
              <Step n={2} icon={<Download className="w-4 h-4 text-blue-600" />}>
                Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
              </Step>
              <Step n={3} icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}>
                Tap <strong>&quot;Install&quot;</strong> to add directly to your phone.
              </Step>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowChromeGuide(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              {isInAppBrowser ? (
                <button
                  onClick={openInChromeAndroid}
                  className="flex-1 py-3 bg-gradient-to-r from-[#071A41] to-[#1557C0] text-white font-bold text-sm rounded-2xl shadow-lg cursor-pointer hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Chrome</span>
                </button>
              ) : (
                <button
                  onClick={async () => {
                    setShowChromeGuide(false)
                    if (promptRef.current || (typeof window !== 'undefined' && window.__pwaInstallPrompt)) {
                      handleInstall()
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-[#1455D9] to-[#071A41] text-white font-bold text-sm rounded-2xl shadow-lg cursor-pointer hover:brightness-110 active:scale-95 transition-all text-center"
                >
                  Install App
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── iOS Add-to-Home-Screen guide ── */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
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
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3.5">
              <Step n={1} icon={<Share className="w-4 h-4 text-blue-500" />}>
                Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" /> in Safari&apos;s toolbar.
              </Step>
              <Step n={2} icon={<PlusSquare className="w-4 h-4 text-blue-500" />}>
                Scroll and tap <strong>&quot;Add to Home Screen&quot;</strong>.
              </Step>
              <Step n={3} icon={<Download className="w-4 h-4 text-emerald-500" />}>
                Tap <strong>Add</strong> — the app will appear on your home screen.
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

      {/* Real-Time App Downloader Modal (Available via explicit request) */}
      <RealtimeAppDownloader
        isOpen={isDownloaderOpen}
        onClose={() => setIsDownloaderOpen(false)}
      />

      {/* Play Store & Apple Security Verification Install Modal */}
      <AppSecurityInstallModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onProceedInstall={handleInstall}
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
        <div className="text-xs text-slate-700 font-semibold leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
