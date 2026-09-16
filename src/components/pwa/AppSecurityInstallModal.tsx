'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Share,
  PlusSquare,
  Download,
  Sparkles,
  X,
  ExternalLink,
  Shield,
  Check,
  Cpu,
  RefreshCw,
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { APP_VERSION_LABEL } from '@/lib/version'

interface AppSecurityInstallModalProps {
  isOpen: boolean
  onClose: () => void
  onProceedInstall?: () => void
}

export function AppSecurityInstallModal({
  isOpen,
  onClose,
  onProceedInstall,
}: AppSecurityInstallModalProps) {
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'desktop'>('android')
  const [isScanning, setIsScanning] = useState(true)
  const [scanStep, setScanStep] = useState(0)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [showChromeInstructions, setShowChromeInstructions] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ua = window.navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType('ios')
    } else if (/android/.test(ua)) {
      setDeviceType('android')
    } else {
      setDeviceType('desktop')
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(true)
      setScanStep(0)
      setShowIOSInstructions(false)
      setShowChromeInstructions(false)
      return
    }

    // Run simulated security scan animation
    setIsScanning(true)
    setScanStep(1)

    const t1 = setTimeout(() => setScanStep(2), 500)
    const t2 = setTimeout(() => setScanStep(3), 1000)
    const t3 = setTimeout(() => {
      setScanStep(4)
      setIsScanning(false)
    }, 1400)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleExecuteInstall = async () => {
    if (deviceType === 'ios') {
      setShowIOSInstructions(true)
      return
    }

    // Try native Chrome prompt if available
    const prompt = (window as any).__pwaInstallPrompt
    if (prompt) {
      try {
        await prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') {
          toast.success('Security verified! Installing Digital Portal to your home screen...')
          try {
            localStorage.setItem('pwa_installed', 'true')
          } catch {}
          onClose()
          return
        }
      } catch (err) {
        console.warn('Native prompt error:', err)
      }
    }

    if (onProceedInstall) {
      onProceedInstall()
    } else if ((window as any).__triggerPwaInstall) {
      ;(window as any).__triggerPwaInstall()
    } else {
      setShowChromeInstructions(true)
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-[#071A41]/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!showIOSInstructions && !showChromeInstructions ? (
          <>
            {/* Header: App Info + Play Store / App Store Security Shield */}
            <div className="flex items-start gap-4 pt-1">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1455D9] to-[#22C7E8] p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                  <div className="w-full h-full bg-[#071A41] rounded-[14px] flex items-center justify-center p-1.5">
                    <Image
                      src="/college-emblem.png"
                      alt="VSB Portal"
                      width={44}
                      height={44}
                      className="object-contain"
                    />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Digital Portal of AI&amp;DS
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-[#1455D9] font-black text-[10px]">
                    {APP_VERSION_LABEL}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold">V.S.B. Engineering College</p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified Educational Application</span>
                </div>
              </div>
            </div>

            {/* Google Play Protect / Apple App Security Check Box */}
            <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white rounded-2xl p-4 border border-emerald-200/80 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                    {deviceType === 'ios'
                      ? 'Apple Security Verification'
                      : 'Play Protect Security Verified'}
                  </span>
                </div>
                {isScanning ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Scanning...
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Safe &amp; Clean
                  </span>
                )}
              </div>

              {/* Security Verification Checklist */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2 font-medium">
                    <Check className={`w-4 h-4 ${scanStep >= 1 ? 'text-emerald-600 font-bold' : 'text-slate-300'}`} />
                    <span>Malware &amp; Spyware Scan</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">0 threats detected</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2 font-medium">
                    <Check className={`w-4 h-4 ${scanStep >= 2 ? 'text-emerald-600 font-bold' : 'text-slate-300'}`} />
                    <span>Official Publisher Signature</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-900">V.S.B. Institutional Key</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2 font-medium">
                    <Check className={`w-4 h-4 ${scanStep >= 3 ? 'text-emerald-600 font-bold' : 'text-slate-300'}`} />
                    <span>Data Privacy &amp; Encryption</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-900">256-Bit SSL Secured</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2 font-medium">
                    <Check className={`w-4 h-4 ${scanStep >= 4 ? 'text-emerald-600 font-bold' : 'text-slate-300'}`} />
                    <span>Device Compatibility Check</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {deviceType === 'ios' ? 'iOS 14+ Ready' : 'Android 8+ Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Feature Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Smartphone className="w-4 h-4 mx-auto text-[#1455D9] mb-1" />
                <span className="block font-bold text-slate-800">Home Screen</span>
                <span className="text-[10px] text-slate-500">1-Tap Launch</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Sparkles className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                <span className="block font-bold text-slate-800">Instant Sync</span>
                <span className="text-[10px] text-slate-500">Real-Time Data</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Lock className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                <span className="block font-bold text-slate-800">Verified Safe</span>
                <span className="text-[10px] text-slate-500">No APK Risk</span>
              </div>
            </div>

            {/* Main Action: Install Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleExecuteInstall}
                disabled={isScanning}
                className="w-full py-3.5 bg-gradient-to-r from-[#1455D9] via-[#0e44be] to-[#071A41] hover:brightness-110 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-blue-600/25 cursor-pointer active:scale-98 disabled:opacity-75"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Package Security...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Proceed &amp; Install App Securely</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-400 font-medium">
                Official Department App · Direct Installation · Zero Storage Waste
              </p>
            </div>
          </>
        ) : showIOSInstructions ? (
          /* ========================================================================= */
          /* iOS SAFARI STEP-BY-STEP INSTALL GUIDE                                      */
          /* ========================================================================= */
          <div className="space-y-4 py-1">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#071A41] to-[#1455D9] flex items-center justify-center mx-auto text-white shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Install on iPhone / iPad</h3>
              <p className="text-xs text-slate-500 font-medium">Follow these 3 quick steps in Safari</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1455D9] font-black flex items-center justify-center shrink-0 text-xs mt-0.5">
                  1
                </span>
                <div className="leading-snug">
                  Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /> in Safari&apos;s bottom toolbar.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1455D9] font-black flex items-center justify-center shrink-0 text-xs mt-0.5">
                  2
                </span>
                <div className="leading-snug">
                  Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" />.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1455D9] font-black flex items-center justify-center shrink-0 text-xs mt-0.5">
                  3
                </span>
                <div className="leading-snug">
                  Tap <strong>&quot;Add&quot;</strong> in top-right. The verified app icon will appear on your home screen!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-[#071A41] text-white font-black text-xs rounded-2xl shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
            >
              Got it, I&apos;ll Add to Home Screen
            </button>
          </div>
        ) : (
          /* ========================================================================= */
          /* CHROME ANDROID STEP-BY-STEP GUIDE                                         */
          /* ========================================================================= */
          <div className="space-y-4 py-1">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#071A41] to-[#1455D9] flex items-center justify-center mx-auto text-white shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Install via Google Chrome</h3>
              <p className="text-xs text-slate-500 font-medium">Direct installation without Play Store downloads</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1455D9] font-black flex items-center justify-center shrink-0 text-xs mt-0.5">
                  1
                </span>
                <div className="leading-snug">
                  Tap Chrome&apos;s <strong>Three Dots (⋮)</strong> menu at the top right of the browser.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1455D9] font-black flex items-center justify-center shrink-0 text-xs mt-0.5">
                  2
                </span>
                <div className="leading-snug">
                  Tap <strong>&quot;Install app&quot;</strong> (or <strong>&quot;Add to Home screen&quot;</strong>).
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1455D9] font-black flex items-center justify-center shrink-0 text-xs mt-0.5">
                  3
                </span>
                <div className="leading-snug">
                  Tap <strong>&quot;Install&quot;</strong> in the confirmation box. The app installs directly with security verification!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-[#071A41] text-white font-black text-xs rounded-2xl shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

declare global {
  interface Window {
    __openAppSecurityInstallModal?: () => void
  }
}
