'use client'

import { useEffect, useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import Image from 'next/image'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
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

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Check if user dismissed prompt recently
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

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions for browsers without direct prompt
      alert('To install this app on your device:\n\n• On Chrome/Edge: Click the Install button in the address bar or menu.\n• On iOS/Safari: Tap Share ➔ "Add to Home Screen".\n• On Android: Tap menu (⋮) ➔ "Add to Home screen".')
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
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-[#071A3D] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-xl shrink-0">
              <Image src="/college-emblem.png" alt="VSB Logo" width={36} height={36} className="rounded-lg object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight">Install V.S.B. Portal App</p>
              <p className="text-[11px] text-gray-300 mt-0.5 truncate">Fast access &amp; offline support</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-[#F4C430] text-[#071A3D] text-xs font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-sm"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-white rounded-md transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
