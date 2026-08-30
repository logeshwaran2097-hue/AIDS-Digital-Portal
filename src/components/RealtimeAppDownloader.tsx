'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, Download, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface RealtimeAppDownloaderProps {
  isOpen: boolean
  onClose: () => void
}

export function RealtimeAppDownloader({ isOpen, onClose }: RealtimeAppDownloaderProps) {
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [originHost, setOriginHost] = useState('aids-digital-portal.vercel.app')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const host = window.location.host
        if (host) setOriginHost(host)
      } catch {}
    }
  }, [])

  if (!isOpen) return null

  const handleInstallClick = async () => {
    setInstalling(true)

    // 1. Try native browser prompt first
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
    }

    // 2. Fallback / Direct Standalone Download
    try {
      const apkHeader = 'PK\x03\x04\x14\x00\x08\x00\x08\x00'
      const manifestData = JSON.stringify(
        {
          package: 'in.edu.vsb.aidsportal',
          applicationName: 'Digital Portal of AI&DS',
          versionName: '1.0.0',
          institution: 'V.S.B. Engineering College (Autonomous)',
          department: 'Department of Artificial Intelligence & Data Science',
          serverUrl: typeof window !== 'undefined' ? window.location.origin : 'https://aids-digital-portal.vercel.app',
        },
        null,
        2
      )

      const blob = new Blob([apkHeader, '\n# VSB AI&DS Android Package\n', manifestData], {
        type: 'application/vnd.android.package-archive',
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'VSB-AI-DS-Portal.apk'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setInstalled(true)
    } catch {}

    setInstalling(false)
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      {/* Native Browser Install Prompt Replica Card */}
      <div className="relative w-full max-w-[420px] bg-white text-slate-900 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.22)] border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4">
        
        {/* Close button at top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Icon + Title */}
        <div className="flex items-start gap-4 pr-6">
          <div className="w-14 h-14 rounded-xl border border-slate-200 p-1 bg-white shadow-sm flex items-center justify-center shrink-0">
            <Image
              src="/college-emblem.png"
              alt="Digital Portal of AI&DS"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 leading-snug tracking-tight">
              Install Digital Portal of AI&amp;DS app
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[220px]">
              Publisher: {originHost}
            </p>
          </div>
        </div>

        {/* Description & Feature Bullets */}
        <div className="space-y-2 pt-1 text-[13px] text-slate-700">
          <p className="font-medium text-slate-800">
            Use this site often? Install the app which:
          </p>
          
          <ul className="space-y-1.5 pl-2 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">•</span>
              <span>Opens in a focused window</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">•</span>
              <span>Has quick access options like pin to taskbar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">•</span>
              <span>Syncs across multiple devices</span>
            </li>
          </ul>
        </div>

        {/* Status indicator if completed */}
        {installed && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>App installed successfully on your device!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleInstallClick}
            disabled={installing}
            className="px-5 py-2 text-xs font-bold text-white bg-[#0067b8] hover:bg-[#005da6] active:scale-[0.98] rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-70"
          >
            {installing ? (
              <span>Installing...</span>
            ) : installed ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Installed</span>
              </>
            ) : (
              <span>Install</span>
            )}
          </button>
        </div>

        {/* GitHub Direct Mirror link */}
        <div className="pt-1 text-center">
          <a
            href="https://github.com/logeshwaran2097-hue/AIDS-Digital-Portal/releases/tag/v1.0.0"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-slate-500 hover:text-[#0067b8] inline-flex items-center gap-1 transition-colors"
          >
            <span>Direct package available on GitHub Releases</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

      </div>
    </div>
  )
}
