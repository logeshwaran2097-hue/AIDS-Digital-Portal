'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Printer, ExternalLink, ShieldCheck, Loader2, Maximize2, Minimize2 } from 'lucide-react'

interface DossierPopupModalProps {
  isOpen: boolean
  onClose: () => void
  dossierUrl: string
  title?: string
  studentName?: string
  registerNumber?: string
}

export function DossierPopupModal({
  isOpen,
  onClose,
  dossierUrl,
  title = 'Official Verification Dossier',
  studentName,
  registerNumber,
}: DossierPopupModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Reset loading state when dossierUrl changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
    }
  }, [isOpen, dossierUrl])

  // Listen for message from iframe (e.g. user clicked Close/Back inside dossier toolbar)
  useEffect(() => {
    if (!isOpen) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CLOSE_DOSSIER_MODAL') {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('message', handleMessage)
    window.addEventListener('keydown', handleKeyDown)

    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !dossierUrl) return null

  const handlePrint = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.focus()
        iframeRef.current.contentWindow.print()
      } else {
        const w = window.open(dossierUrl, '_blank')
        if (w) {
          w.addEventListener('load', () => w.print())
        }
      }
    } catch {
      window.open(dossierUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#071126]/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className={`bg-white w-full h-full sm:h-[92vh] flex flex-col overflow-hidden border border-gray-200 shadow-2xl transition-all duration-200 ${
          isFullscreen
            ? 'sm:fixed sm:inset-0 sm:h-full sm:rounded-none'
            : 'sm:max-w-5xl sm:rounded-3xl'
        }`}
      >
        {/* Top Gradient Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#071A3D] via-[#1455D9] to-[#F4C430] shrink-0" />

        {/* Modal Header */}
        <header className="px-3 sm:px-5 py-2.5 sm:py-3 bg-[#071A3D] text-white flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F4C430] text-[#071A3D] flex items-center justify-center font-black shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#071A3D]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-md">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold border border-emerald-500/30">
                  ✓ Verified
                </span>
              </div>
              {(studentName || registerNumber) && (
                <p className="text-[10px] sm:text-[11px] text-blue-200/90 truncate mt-0.5">
                  {studentName} {registerNumber ? `(${registerNumber})` : ''} · Official Verification Dossier
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print official dossier"
            >
              <Printer className="w-3.5 h-3.5 text-[#F4C430]" />
              <span className="hidden md:inline">Print</span>
            </button>

            {/* Toggle Fullscreen (Desktop only) */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Open in New Tab (secondary option) */}
            <a
              href={dossierUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1 transition-colors"
              title="Open full page in new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">New Tab</span>
            </a>

            {/* Prominent Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1 transition-colors shadow-sm cursor-pointer ml-1"
              title="Close popup modal"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </header>

        {/* Modal Body with Embedded Dossier */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#071A3D] text-[#F4C430] flex items-center justify-center shadow-lg animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-[#F4C430]" />
              </div>
              <p className="text-xs font-bold text-white tracking-wide drop-shadow-md">
                Loading Official Digital Dossier...
              </p>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={dossierUrl}
            title={title}
            className="w-full h-full border-0 bg-white"
            onLoad={() => setIsLoading(false)}
            allow="fullscreen"
          />
        </div>

        {/* Mobile Quick Footer */}
        <footer className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex sm:hidden items-center justify-between text-[11px] text-gray-500 shrink-0">
          <span className="font-semibold text-emerald-700 truncate">
            ✓ Anna Univ R2021 Compliant
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 active:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  )
}
