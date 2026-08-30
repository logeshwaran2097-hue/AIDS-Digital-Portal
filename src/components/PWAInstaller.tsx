'use client'

import * as React from 'react'
import { Download, Smartphone, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { playNotificationChime } from '@/lib/notificationEngine'
import { toast } from '@/components/ui/Toast'

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)
  const [showPrompt, setShowPrompt] = React.useState(false)
  const [isIOS, setIsIOS] = React.useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false)

  React.useEffect(() => {
    const ua = navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
      setShowPrompt(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowPrompt(false)
      setDeferredPrompt(null)
      playNotificationChime()
      toast.success('VSB AI & DS Portal installed successfully!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true)
        return
      }
      toast.error('Install prompt not available. Please use browser menu to install.')
      return
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        playNotificationChime()
        toast.success('Installation started...')
      } else {
        toast.info('Installation cancelled')
      }
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (err) {
      console.error('Install failed:', err)
      toast.error('Installation failed. Please try again.')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    if (deferredPrompt) {
      deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === 'dismissed') {
          setDeferredPrompt(null)
        }
      })
    }
  }

  const handleIOSClose = () => {
    setShowIOSInstructions(false)
  }

  if (isInstalled) return null

  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-scale-up space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-lg font-black text-[#071A3D] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#1455D9]" />
                Install on iOS
              </h3>
              <p className="text-xs text-gray-500">Add to Home Screen via Safari</p>
            </div>
            <button onClick={handleIOSClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                <span className="font-bold text-[#071A3D]">Open in Safari</span>
              </div>
              <p className="text-gray-600 pl-10">Make sure you&apos;re using <strong>Safari</strong> browser (not Chrome or Firefox on iOS)</p>
            </div>

            <div className="p-4 rounded-2xl bg-green-50 border border-green-100 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                <span className="font-bold text-[#071A3D]">Tap Share Button</span>
              </div>
              <p className="text-gray-600 pl-10">Tap the <strong>Share icon</strong> (square with arrow up) at the bottom of Safari</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs font-bold">3</div>
                <span className="font-bold text-[#071A3D]">Add to Home Screen</span>
              </div>
              <p className="text-gray-600 pl-10">Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong></p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <p className="text-xs text-purple-800 font-medium">
                <strong>Tip:</strong> The app will work offline and send push notifications once installed!
              </p>
            </div>
          </div>

          <button
            onClick={handleIOSClose}
            className="w-full px-5 py-2.5 rounded-xl bg-[#1455D9] text-white font-bold cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all hover:scale-102"
          >
            <CheckCircle2 className="w-4 h-4" /> Got it, I'll Install Now
          </button>
        </div>
      </div>
    )
  }

  if (!isInstallable && !isIOS) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right md:hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-sm space-y-3 animate-slide-up">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] text-white flex items-center justify-center shadow-md shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-sm text-[#071A3D] truncate">Install VSB AI & DS Portal</h4>
              <p className="text-[11px] text-gray-500 truncate">Works offline • Push notifications • Fast access</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1455D9] hover:bg-[#0f44b0] text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-102"
        >
          <Smartphone className="w-4 h-4" />
          <span>Install App</span>
        </button>

        <p className="text-[10px] text-gray-400 text-center">
          Or use browser menu &rarr; "Add to Home screen"
        </p>
      </div>
    </div>
  )
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}