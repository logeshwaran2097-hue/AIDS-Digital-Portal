'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, Smartphone, Share2, CheckCircle, Globe, Zap } from 'lucide-react'

export default function DownloadPage() {
  const deferredPrompt = useRef<any>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Already running as installed PWA?
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    if (standalone) {
      setIsInstalled(true)
      return
    }

    // Register SW so install prompt can fire
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e
      setCanInstall(true)
    }

    const onInstalled = () => {
      deferredPrompt.current = null
      setCanInstall(false)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    setInstalling(true)
    try {
      deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setCanInstall(false)
      }
      deferredPrompt.current = null
    } catch {
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071A3D] via-[#0F2A5E] to-[#1A3A7A] text-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center pt-12 pb-8 px-4">
        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center mb-6 shadow-2xl">
          <img src="/college-emblem.png" alt="VSB Logo" className="w-16 h-16 rounded-2xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
          VSB AI &amp; DS Portal
        </h1>
        <p className="text-white/60 text-center text-sm md:text-base max-w-md">
          V.S.B. Engineering College — Department of Artificial Intelligence &amp; Data Science
        </p>
        <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">v1.0.0</span>
          <span>•</span>
          <span>4.2 MB</span>
          <span>•</span>
          <span>Android &amp; Desktop</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-4 pb-12">

        {/* ─── Already Installed Banner ─── */}
        {isInstalled && (
          <div className="bg-emerald-500/15 backdrop-blur-lg rounded-2xl border border-emerald-400/30 p-6 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-emerald-300">App Already Installed!</h3>
            <p className="text-white/60 text-sm mt-1">
              You&apos;re running VSB AI &amp; DS Portal as an app. Open it from your home screen.
            </p>
            <a
              href="/login"
              className="mt-4 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg"
            >
              <Globe className="w-5 h-5" />
              Open Portal
            </a>
          </div>
        )}

        {/* ─── Native Install Button (when browser supports it) ─── */}
        {canInstall && !isInstalled && (
          <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl border border-emerald-400/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                <Download className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Install Now</h3>
                <p className="text-white/50 text-xs">One tap — installs like a real app on your device</p>
              </div>
            </div>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/30 text-base cursor-pointer"
            >
              {installing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              {installing ? 'Installing...' : 'Install VSB AI & DS Portal'}
            </button>
            <p className="text-center text-white/40 text-[11px] mt-2">
              No Play Store needed • Works offline • Real push notifications
            </p>
          </div>
        )}

        {/* ─── Manual Instructions (when native prompt isn't available) ─── */}
        {!canInstall && !isInstalled && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Install as App</h3>
                <p className="text-white/50 text-xs">Works like a native app — no Play Store needed</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {[
                <>Open this page in <strong className="text-white">Chrome</strong> on your Android phone</>,
                <>Tap the <strong className="text-white">⋮ menu</strong> (top-right corner)</>,
                <>Select <strong className="text-white">&quot;Add to Home screen&quot;</strong> or <strong className="text-white">&quot;Install app&quot;</strong></>,
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-white/70">{text}</p>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                </div>
                <p className="text-sm text-white/70">App icon appears on your home screen — tap to open!</p>
              </div>
            </div>

            <a
              href="/login"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              <Globe className="w-5 h-5" />
              Open Portal &amp; Install
            </a>
          </div>
        )}

        {/* Share Link */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Share with Others</h3>
              <p className="text-white/50 text-xs">Send install link via WhatsApp, Telegram, or SMS</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({
                  title: 'VSB AI & DS Portal',
                  text: 'Install the official VSB AI & DS Department Portal app',
                  url: window.location.origin + '/download',
                })
              } else if (typeof navigator !== 'undefined') {
                navigator.clipboard.writeText(window.location.origin + '/download')
                alert('Link copied to clipboard!')
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/10 cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            Share Install Link
          </button>
        </div>

        {/* Features */}
        <div className="bg-white/5 rounded-2xl border border-white/5 p-6">
          <h3 className="font-semibold mb-4 text-white/80">✨ App Features</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Student Dashboard',
              'Live Attendance',
              'Question Papers',
              'Faculty Portal',
              'HOD Oversight',
              'Admin Console',
              'PDF Downloads',
              'Push Notifications',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-xs text-white/60">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-white/30 text-xs">
            © 2026 V.S.B. Engineering College, Karur, Tamil Nadu
          </p>
          <p className="text-white/20 text-xs mt-1">
            Department of Artificial Intelligence &amp; Data Science
          </p>
        </div>
      </div>
    </div>
  )
}
