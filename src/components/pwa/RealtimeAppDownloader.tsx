'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, Download, ExternalLink, Sparkles, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

interface RealtimeAppDownloaderProps {
  isOpen: boolean
  onClose: () => void
}

export function RealtimeAppDownloader({ isOpen, onClose }: RealtimeAppDownloaderProps) {
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [originHost, setOriginHost] = useState('aids-digital-portal.vercel.app')
  const [showApkHelp, setShowApkHelp] = useState(false)
  const [showBrowserPromptHelp, setShowBrowserPromptHelp] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const host = window.location.host
        if (host) setOriginHost(host)
      } catch {}
    }
  }, [])

  if (!isOpen) return null

  const handleInstantInstall = async () => {
    setInstalling(true)

    // Try native browser prompt first
    if (typeof window !== 'undefined' && (window as any).__pwaInstallPrompt) {
      try {
        const prompt = (window as any).__pwaInstallPrompt
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') {
          setInstalled(true)
          setInstalling(false)
          setTimeout(() => {
            onClose()
          }, 1500)
          return
        }
      } catch (e) {
        console.warn('Native prompt error:', e)
      }
    } else {
      setShowBrowserPromptHelp(true)
    }

    setInstalling(false)
  }

  const handleApkDownload = () => {
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
    setShowApkHelp(true)
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-[430px] bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-13 h-13 rounded-xl border border-slate-200 p-1 bg-[#071A41] shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src="/icon-192.png"
              alt="Digital POrtal Of AI&DS"
              width={44}
              height={44}
              className="object-contain rounded-lg"
              priority
            />
          </div>

          <div className="space-y-0.5 min-w-0">
            <h2 className="text-base font-bold text-slate-900 leading-snug tracking-tight">
              Install Digital POrtal Of AI&amp;DS
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate">
              {originHost}
            </p>
          </div>
        </div>

        {/* Status indicator if completed */}
        {installed && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>App installed successfully on your device!</span>
          </div>
        )}

        {/* Option 1: 1-Click Instant App (PWA) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50/40 to-white border border-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">
              ⚡ Recommended · Real App
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">100% Works</span>
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Installs directly into Android App Drawer &amp; Home Screen. No APK warnings, zero errors.
          </p>
          <button
            type="button"
            onClick={handleInstantInstall}
            disabled={installing}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#1455D9] to-[#071A41] text-white text-xs font-bold rounded-lg shadow-sm hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{installing ? 'Installing...' : '1-Click Instant Install'}</span>
          </button>

          {showBrowserPromptHelp && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
              In Chrome, tap the <strong>3-dots menu (⋮)</strong> at top-right → tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
            </div>
          )}
        </div>

        {/* Option 2: Standalone APK */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              📦 Standalone Android APK (3.92 MB)
            </span>
          </div>
          <button
            type="button"
            onClick={handleApkDownload}
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download APK Package</span>
          </button>
        </div>

        {/* Troubleshoot "App not installed" */}
        <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-[11px] text-rose-900 space-y-1">
          <button
            type="button"
            onClick={() => setShowApkHelp(!showApkHelp)}
            className="w-full flex items-center justify-between font-bold text-rose-800 cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              Getting "App not installed" error?
            </span>
            <span className="text-xs font-black">{showApkHelp ? '▲' : '▼'}</span>
          </button>
          {showApkHelp && (
            <div className="pt-1 text-rose-800/90 space-y-1 border-t border-rose-200 leading-relaxed">
              <p>
                <strong>Uninstall previous version first:</strong> If any older test app is installed on your phone, Android rejects the new one. Go to <strong>Settings → Apps → Digital Portal → Uninstall</strong>, then install the APK.
              </p>
              <p>
                <strong>Or use 1-Click Install above</strong> to install without any APK errors.
              </p>
            </div>
          )}
        </div>

        {/* GitHub Direct Mirror link */}
        <div className="pt-1 text-center">
          <a
            href="https://github.com/logeshwaran2097-hue/AIDS-Digital-Portal/releases/tag/v1.0.0"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-slate-500 hover:text-[#0067b8] inline-flex items-center gap-1 transition-colors"
          >
            <span>GitHub Releases mirror</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

      </div>
    </div>
  )
}
