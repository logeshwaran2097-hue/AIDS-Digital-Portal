'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, Cpu, GraduationCap, ShieldCheck } from 'lucide-react'

export function MobileAppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [animationStep, setAnimationStep] = useState(0) // 0: Logo, 1: College Name, 2: Welcome Dept, 3: Complete
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Only show once per session
    const hasSeenSplash = sessionStorage.getItem('vsb_splash_shown')
    if (hasSeenSplash) {
      setIsVisible(false)
      return
    }

    setAnimationStep(0)

    const timer1 = setTimeout(() => {
      setAnimationStep(1)
    }, 450)

    const timer2 = setTimeout(() => {
      setAnimationStep(2)
    }, 950)

    // Smooth progress bar increment
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 4
      })
    }, 85)

    const timer3 = setTimeout(() => {
      setAnimationStep(3)
      setTimeout(() => {
        setIsVisible(false)
        sessionStorage.setItem('vsb_splash_shown', 'true')
      }, 500)
    }, 2400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearInterval(progressInterval)
    }
  }, [])

  if (!isVisible) return null

  const handleSkip = () => {
    setAnimationStep(3)
    setTimeout(() => {
      setIsVisible(false)
      sessionStorage.setItem('vsb_splash_shown', 'true')
    }, 300)
  }

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between p-6 bg-gradient-to-br from-[#EBF3FC] via-[#F4F8FD] to-[#FFFFFF] text-slate-800 transition-all duration-500 cursor-pointer select-none overflow-hidden ${
        animationStep === 3 ? 'opacity-0 pointer-events-none scale-105 transition-all duration-500' : 'opacity-100'
      }`}
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Aurora Ambient Lighting & Rotating Grid (Lighter & Subtle Colors) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft Pastel Blue & Gold Glow Spots */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1557C0]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#E7B93E]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1.5s' }} />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl" />
        
        {/* Soft Radial Grid in Light Blue */}
        <div 
          className="absolute inset-0 opacity-[0.06]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1557C0 1.5px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
        
        {/* Horizontal Moving Light Sweepers */}
        <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-[pulse_10s_infinite]" />
      </div>

      {/* Top Header Accreditation Tag (High Contrast Dark Slate Style) */}
      <div className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#071A41]/5 backdrop-blur-md border border-[#071A41]/10 text-[11px] font-black text-[#071A41] shadow-xs transition-all duration-700 transform ${
        animationStep >= 0 ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}>
        <ShieldCheck className="w-3.5 h-3.5 text-[#E7B93E]" />
        <span>Autonomous · NBA &amp; NAAC &apos;A&apos; Accredited</span>
      </div>

      {/* Center Cinematic Emblem & Animated Welcome Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm my-auto space-y-6">
        
        {/* Circular Emblem with Dynamic Glow Rings */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Outer Glow Rings */}
          <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-[#1557C0]/20 to-[#E7B93E]/20 opacity-40 blur-xl animate-pulse" />
          <div className="absolute w-32 h-32 rounded-full border border-[#1557C0]/20 animate-ping opacity-25" style={{ animationDuration: '2.5s' }} />
          
          {/* Circular Frame */}
          <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#E7B93E] via-white to-[#1557C0] shadow-[0_4px_25px_rgba(21,87,192,0.15)] transition-all duration-700 transform ${
            animationStep >= 0 ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-6 opacity-0'
          }`}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2.5 shadow-inner overflow-hidden">
              <Image
                src="/college-emblem.png"
                alt="V.S.B. Engineering College Emblem"
                width={120}
                height={120}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* College Name & Accreditation Status */}
        <div className={`space-y-2 transition-all duration-700 transform ${
          animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#071A41] drop-shadow-xs">
            V.S.B. ENGINEERING COLLEGE
          </h1>
          <p className="text-[10px] font-black text-[#1557C0] tracking-widest uppercase flex items-center justify-center gap-1.5 bg-[#1557C0]/5 px-3 py-1 rounded-full border border-[#1557C0]/10">
            <GraduationCap className="w-3.5 h-3.5 shrink-0 text-[#E7B93E]" />
            <span>Autonomous Institution · Karur</span>
          </p>
        </div>

        {/* Decorative Glowing Center Separator Line */}
        <div className={`w-32 h-[1.5px] bg-gradient-to-r from-transparent via-[#E7B93E] to-transparent transition-all duration-700 ${
          animationStep >= 2 ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
        }`} />

        {/* Welcome Section & AI & DS Portal details */}
        <div className={`space-y-3.5 transition-all duration-700 transform ${
          animationStep >= 2 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'
        }`}>
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#1557C0]/10 border border-[#1557C0]/20 text-[10px] font-black uppercase text-[#1557C0] tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 text-[#E7B93E] animate-spin" style={{ animationDuration: '3s' }} />
            <span>Welcome To</span>
          </div>

          <h2 className="text-base sm:text-lg font-black leading-snug drop-shadow-xs text-[#071A41]">
            <span className="block">DEPARTMENT OF</span>
            <span className="text-[#1557C0] block">
              ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
            </span>
          </h2>

          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
              <Cpu className="w-3.5 h-3.5 text-[#1557C0]" /> Digital Academic Portal
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Progress Bar & Loading Status */}
      <div className="relative z-10 w-full max-w-xs space-y-2 pb-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{progress < 100 ? 'Initializing Portal...' : 'Ready · Opening...'}</span>
          </span>
          <span className="font-mono text-slate-700">{progress}%</span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-1.5 bg-[#071A41]/10 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#1557C0] via-cyan-500 to-[#E7B93E] rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-center pt-1">
          <span className="text-[10px] text-slate-400 font-semibold animate-pulse">
            Tap anywhere to enter
          </span>
        </div>
      </div>
    </div>
  )
}
