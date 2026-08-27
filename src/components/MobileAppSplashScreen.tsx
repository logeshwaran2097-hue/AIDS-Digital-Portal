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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between p-6 bg-gradient-to-br from-[#051128] via-[#071A41] to-[#0A255C] text-white transition-all duration-500 cursor-pointer select-none overflow-hidden ${
        animationStep === 3 ? 'opacity-0 pointer-events-none scale-105 transition-all duration-500' : 'opacity-100'
      }`}
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Aurora Ambient Lighting & Rotating Cyberpunk Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Neon Blur Spots */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1455D9]/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#F4C430]/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1.5s' }} />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#22C7E8]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        
        {/* Soft Radial Grid */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1.5px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
        
        {/* Horizontal Moving Light Sweepers */}
        <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-[#22C7E8]/5 to-transparent skew-x-12 animate-[pulse_10s_infinite]" />
      </div>

      {/* Top Header Accreditation Tag */}
      <div className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-[11px] font-black text-white shadow-[0_0_15px_rgba(255,255,255,0.08)] transition-all duration-700 transform ${
        animationStep >= 0 ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}>
        <ShieldCheck className="w-3.5 h-3.5 text-[#F4C430]" />
        <span>Autonomous · NBA &amp; NAAC &apos;A&apos; Accredited</span>
      </div>

      {/* Center Cinematic Emblem & Animated Welcome Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm my-auto space-y-6">
        
        {/* Circular Emblem with Dynamic Glow Rings */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Outer Neon Glow Rings */}
          <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-[#1455D9] to-[#F4C430] opacity-35 blur-xl animate-pulse" />
          <div className="absolute w-32 h-32 rounded-full border border-[#F4C430]/40 animate-ping opacity-25" style={{ animationDuration: '2.5s' }} />
          
          {/* Circular Frame */}
          <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#F4C430] via-white to-[#22C7E8] shadow-[0_0_35px_rgba(244,196,48,0.3)] transition-all duration-700 transform ${
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
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            V.S.B. ENGINEERING COLLEGE
          </h1>
          <p className="text-[10px] font-black text-[#F4C430] tracking-widest uppercase flex items-center justify-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span>Autonomous Institution · Karur</span>
          </p>
        </div>

        {/* Decorative Glowing Center Separator Line */}
        <div className={`w-32 h-[1.5px] bg-gradient-to-r from-transparent via-[#F4C430] to-transparent transition-all duration-700 ${
          animationStep >= 2 ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
        }`} />

        {/* Welcome Section & AI & DS Portal details */}
        <div className={`space-y-3.5 transition-all duration-700 transform ${
          animationStep >= 2 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'
        }`}>
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#1455D9]/25 border border-[#22C7E8]/30 text-[10px] font-black uppercase text-[#22C7E8] tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 text-[#F4C430] animate-spin" style={{ animationDuration: '3s' }} />
            <span>Welcome To</span>
          </div>

          <h2 className="text-base sm:text-lg font-black leading-snug drop-shadow">
            <span className="text-white block">DEPARTMENT OF</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C7E8] via-white to-[#F4C430] block">
              ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
            </span>
          </h2>

          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className="flex items-center gap-1 text-[11px] font-bold text-gray-300">
              <Cpu className="w-3.5 h-3.5 text-[#22C7E8]" /> Digital Academic Portal
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Progress Bar & Loading Status */}
      <div className="relative z-10 w-full max-w-xs space-y-2 pb-2">
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{progress < 100 ? 'Initializing Portal...' : 'Ready · Opening...'}</span>
          </span>
          <span className="font-mono text-gray-300">{progress}%</span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#F4C430] rounded-full transition-all duration-200"
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
