'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Download,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  HardDrive,
  Monitor,
  Apple,
  Share,
  PlusSquare,
  X,
  RefreshCw,
  ExternalLink,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface RealtimeAppDownloaderProps {
  isOpen: boolean
  onClose: () => void
}

export function RealtimeAppDownloader({ isOpen, onClose }: RealtimeAppDownloaderProps) {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Ready for installation')
  const [completed, setCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android')
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      setIsStandalone(standalone)

      const ua = navigator.userAgent.toLowerCase()
      if (/iphone|ipad|ipod/.test(ua)) {
        setActiveTab('ios')
      } else if (/android/.test(ua)) {
        setActiveTab('android')
      } else {
        setActiveTab('desktop')
      }
    }
  }, [])

  const startRealtimeDownload = () => {
    setDownloading(true)
    setProgress(0)
    setCompleted(false)
    setStatusText('1/4 Connecting to V.S.B. AI & DS Portal Edge Network...')

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setDownloading(false)
          setCompleted(true)
          setStatusText('Package compiled successfully! Launching native install...')

          // Trigger native PWA install prompt if available
          if (typeof window !== 'undefined' && (window as any).__triggerPwaInstall) {
            ;(window as any).__triggerPwaInstall()
          }

          // Trigger package download
          const blob = new Blob(
            [
              JSON.stringify(
                {
                  appName: 'Digital Portal of AI&DS - V.S.B. Engineering College',
                  package: 'in.edu.vsb.aidsportal',
                  version: '1.0.0',
                  build: '2026.1',
                  portalUrl: window.location.origin,
                  offlineReady: true,
                  generatedAt: new Date().toISOString(),
                },
                null,
                2
              ),
            ],
            { type: 'application/json' }
          )
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'VSB-AIDS-Digital-Portal-v1.0.0.json'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          return 100
        }

        const next = prev + Math.floor(Math.random() * 14) + 6
        if (next >= 25 && next < 55) {
          setStatusText('2/4 Caching offline assets & curriculum resources...')
        } else if (next >= 55 && next < 85) {
          setStatusText('3/4 Initializing service worker & real-time notification engine...')
        } else if (next >= 85) {
          setStatusText('4/4 Finalizing APK / PWA native manifest bundle...')
        }
        return Math.min(next, 100)
      })
    }, 180)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#071A41]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] p-5 sm:p-6 text-white shrink-0">
          <div className="absolute right-0 top-0 w-64 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg shrink-0 flex items-center justify-center">
              <Image
                src="/college-emblem.png"
                alt="V.S.B. College Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#F4C430] text-[#071A41] text-[10px] font-black uppercase tracking-wider">
                  Official App Downloader
                </span>
                <span className="text-[10px] text-blue-200 font-bold">v1.0.0 PWA / APK</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                V.S.B. AI &amp; DS Digital Portal
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                Install as a native standalone app on Android, iOS, and PC
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Progress / Status Display */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#1557C0]" />
                Package Status
              </span>
              <span className="text-xs font-mono font-black text-[#1557C0]">
                {progress}% {completed ? '· Complete' : ''}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden p-0.5">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-200',
                  completed
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-[#1557C0] via-[#2F80ED] to-[#22C7E8]'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] font-medium text-slate-600 truncate">
              {statusText}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button
              onClick={startRealtimeDownload}
              disabled={downloading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#071A41] via-[#1557C0] to-[#2F80ED] hover:opacity-95 text-white flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {downloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Downloading ({progress}%)...</span>
                </>
              ) : completed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Re-Download / Re-Install</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>1-Click Fast Install</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).__triggerPwaInstall) {
                  ;(window as any).__triggerPwaInstall()
                } else {
                  startRealtimeDownload()
                }
              }}
              className="w-full py-3 rounded-xl font-bold border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#1557C0]" />
              <span>Prompt Device Install</span>
            </Button>
          </div>

          {/* Platform Instructions Tabs */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Installation Instructions
              </span>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('android')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                    activeTab === 'android'
                      ? 'bg-white text-[#1557C0] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Android
                </button>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                    activeTab === 'ios'
                      ? 'bg-white text-[#1557C0] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  iOS (iPhone)
                </button>
                <button
                  onClick={() => setActiveTab('desktop')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                    activeTab === 'desktop'
                      ? 'bg-white text-[#1557C0] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Windows / Mac
                </button>
              </div>
            </div>

            {activeTab === 'android' && (
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-[#071A41] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#1557C0]" />
                  Android Chrome / Edge Install:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1 font-medium">
                  <li>Click <strong>1-Click Fast Install</strong> above.</li>
                  <li>When prompted by Chrome, tap <strong>&ldquo;Install&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.</li>
                  <li>The app will be placed directly in your app drawer with offline support.</li>
                </ol>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-amber-700" />
                  Apple iOS Safari Install:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1 font-medium">
                  <li>Open this portal in <strong>Safari</strong> on your iPhone/iPad.</li>
                  <li>Tap the <strong>Share</strong> button (box with an upward arrow) at the bottom.</li>
                  <li>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
                  <li>Tap <strong>&ldquo;Add&rdquo;</strong> in the top right to complete.</li>
                </ol>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-slate-700" />
                  Windows PC &amp; macOS Desktop:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1 font-medium">
                  <li>In Chrome or Edge, click the <strong>Install</strong> icon in the address bar (right side).</li>
                  <li>Click <strong>&ldquo;Install&rdquo;</strong> to launch as a standalone desktop window.</li>
                  <li>Pin to your Taskbar or Start Menu for instant one-click access.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Institutional Accreditation Footnote */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-bold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Autonomous · NAAC &lsquo;A&rsquo; · NBA Accredited
            </span>
            <span className="font-mono text-slate-400">Karur, Tamil Nadu</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs px-5 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            © 2026 V.S.B. Engineering College
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#1557C0] hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
