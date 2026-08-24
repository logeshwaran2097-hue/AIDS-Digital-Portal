'use client'

import { useState } from 'react'
import { Download, Smartphone, Share2, QrCode, CheckCircle, ExternalLink, Globe } from 'lucide-react'
import Image from 'next/image'

export default function DownloadPage() {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071A3D] via-[#0F2A5E] to-[#1A3A7A] text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-12 pb-8 px-4">
        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center mb-6 shadow-2xl">
          <img src="/college-emblem.png" alt="VSB Logo" className="w-16 h-16 rounded-2xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
          VSB AI & DS Portal
        </h1>
        <p className="text-white/60 text-center text-sm md:text-base max-w-md">
          V.S.B. Engineering College — Department of Artificial Intelligence & Data Science
        </p>
        <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">v1.0.0</span>
          <span>•</span>
          <span>4.2 MB</span>
          <span>•</span>
          <span>Android 5.0+</span>
        </div>
      </div>

      {/* Install Options */}
      <div className="max-w-lg mx-auto px-4 space-y-4 pb-12">
        
        {/* Option 1: Add to Home Screen (PWA) */}
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
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-400">1</span>
              </div>
              <p className="text-sm text-white/70">Open this page in <strong className="text-white">Chrome</strong> on your Android phone</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-400">2</span>
              </div>
              <p className="text-sm text-white/70">Tap the <strong className="text-white">⋮ menu</strong> (top-right corner)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-400">3</span>
              </div>
              <p className="text-sm text-white/70">Select <strong className="text-white">&quot;Add to Home screen&quot;</strong> or <strong className="text-white">&quot;Install app&quot;</strong></p>
            </div>
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
            Open Portal & Install
          </a>
        </div>

        {/* Option 2: Share Link */}
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
              if (navigator.share) {
                navigator.share({
                  title: 'VSB AI & DS Portal',
                  text: 'Install the official VSB AI & DS Department Portal app',
                  url: window.location.origin + '/download',
                })
              } else {
                navigator.clipboard.writeText(window.location.origin + '/download')
                alert('Link copied to clipboard!')
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/10"
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
            © 2025 V.S.B. Engineering College, Karur, Tamil Nadu
          </p>
          <p className="text-white/20 text-xs mt-1">
            Department of Artificial Intelligence & Data Science
          </p>
        </div>
      </div>
    </div>
  )
}
