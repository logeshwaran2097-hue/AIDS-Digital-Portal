'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, Cpu, GraduationCap, ShieldCheck } from 'lucide-react'

export function MobileAppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [animationStep, setAnimationStep] = useState(0) // 0: Logo, 1: College Name, 2: Welcome Dept, 3: Complete
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Only show once per session in session storage if preferred, or always on fresh app launch
    const hasSeenSplash = sessionStorage.getItem('vsb_splash_shown')
    if (hasSeenSplash) {
      setIsVisible(false)
      return
    }

    // Step 0: Logo reveals immediately
    setAnimationStep(0)

    // Step 1: College name emerges at 400ms
    const timer1 = setTimeout(() => {
      setAnimationStep(1)
    }, 450)

    // Step 2: Welcome to AI & DS Dept at 900ms
    const timer2 = setTimeout(() => {
      setAnimationStep(2)
    }, 950)

    // Smooth Progress Bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 4
      })
    }, 80)

    // Step 3: Fade out & dismiss at 2500ms
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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#030917] via-[#071A3D] to-[#040D24] text-white transition-opacity duration-500 cursor-pointer select-none overflow-hidden ${
        animationStep === 3 ? 'opacity-0 pointer-events-none scale-105 transition-all duration-500' : 'opacity-100'
      }`}
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Background Animated Neural Grid & Glowing Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#1455D9]/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#F4C430]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22C7E8]/10 rounded-full blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Top Header Accreditation Tag */}
      <div className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-gray-300 shadow-sm transition-all duration-700 ${
        animationStep >= 0 ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}>
        <ShieldCheck className="w-3.5 h-3.5 text-[#F4C430]" />
        <span>Autonomous · NBA &amp; NAAC &apos;A&apos; Accredited</span>
      </div>

      {/* Center Cinematic Emblem & Animated Welcome Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm my-auto space-y-6">
        
        {/* Glowing Animated Official Emblem */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Outer Glow Rings */}
          <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-[#1455D9] to-[#F4C430] opacity-30 blur-xl animate-pulse" />
          <div className="absolute w-32 h-32 rounded-full border-2 border-[#F4C430]/40 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          
          {/* Logo Frame */}
          <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-tr from-[#F4C430] via-white to-[#22C7E8] shadow-[0_0_40px_rgba(244,196,48,0.35)] transition-all duration-700 transform ${
            animationStep >= 0 ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-6 opacity-0'
          }`}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2 shadow-inner overflow-hidden">
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

        {/* College Name Animated Typography */}
        <div className={`space-y-1.5 transition-all duration-700 transform ${
          animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md">
            V.S.B. ENGINEERING COLLEGE
          </h1>
          <p className="text-[11px] font-semibold text-[#F4C430] tracking-widest uppercase flex items-center justify-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Autonomous Institution · Karur</span>
          </p>
        </div>

        {/* Glowing Decorative Divider */}
        <div className={`w-36 h-[2px] bg-gradient-to-r from-transparent via-[#F4C430] to-transparent transition-all duration-700 ${
          animationStep >= 2 ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
        }`} />

        {/* Department of AI & DS Welcome Title */}
        <div className={`space-y-2 transition-all duration-700 transform ${
          animationStep >= 2 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'
        }`}>
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#1455D9]/30 border border-[#22C7E8]/40 text-[10px] font-black uppercase text-[#22C7E8] tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 text-[#F4C430] animate-spin" style={{ animationDuration: '4s' }} />
            <span>Welcome To</span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#22C7E8] to-[#F4C430] leading-snug drop-shadow">
            DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
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
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {progress < 100 ? 'Initializing Portal...' : 'Ready · Opening...'}
          </span>
          <span className="font-mono text-gray-300">{progress}%</span>
        </div>

        {/* Animated Gradient Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-[#1455D9] via-[#22C7E8] to-[#F4C430] rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-center pt-1">
          <span className="text-[10px] text-gray-400 font-medium hover:text-white transition-colors">
            Tap anywhere to enter
          </span>
        </div>
      </div>
    </div>
  )
}
