'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, Cpu, GraduationCap, ShieldCheck } from 'lucide-react'

export function MobileAppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 1. Quick progress sweep from 0% -> 100% in 0.5s
    let current = 0
    const interval = setInterval(() => {
      current += 10
      if (current >= 100) {
        setProgress(100)
        clearInterval(interval)
      } else {
        setProgress(current)
      }
    }, 45)

    // 2. Play full 5.0-second showcase, then fade out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 5000)

    // 3. Completely unmount from DOM at 5.4s
    const unmountTimer = setTimeout(() => {
      setIsVisible(false)
    }, 5450)

    return () => {
      clearInterval(interval)
      clearTimeout(fadeTimer)
      clearTimeout(unmountTimer)
    }
  }, [])

  if (!isVisible) return null

  const handleInstantDismiss = () => {
    setIsFadingOut(true)
    setTimeout(() => {
      setIsVisible(false)
    }, 60)
  }

  return (
    <div
      onClick={handleInstantDismiss}
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#EBF3FC] via-[#F4F8FD] to-[#FFFFFF] text-slate-800 select-none overflow-hidden cursor-pointer transition-all duration-450 ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105 transition-all duration-450' : 'opacity-100'
      }`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style jsx>{`
        @keyframes fillProgressBar {
          0% { width: 0%; }
          30% { width: 45%; }
          70% { width: 85%; }
          100% { width: 100%; }
        }
        @keyframes elementPopIn {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.94);
            filter: blur(4px);
          }
          70% {
            transform: translateY(-2px) scale(1.02);
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
            filter: blur(0px);
          }
        }
        @keyframes emblemZoomBounce {
          0% {
            opacity: 0;
            transform: scale(0.6) rotate(-8deg);
          }
          65% {
            transform: scale(1.08) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes floatGentle {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(1deg);
          }
        }
        @keyframes haloRotate {
          0% {
            transform: rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: rotate(180deg);
            opacity: 0.9;
          }
          100% {
            transform: rotate(360deg);
            opacity: 0.6;
          }
        }
        @keyframes textShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes beamGlow {
          0%, 100% { opacity: 0.3; transform: scaleX(0.9); }
          50% { opacity: 1; transform: scaleX(1.1); }
        }

        .animate-progress-bar {
          animation: fillProgressBar 0.5s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
        }
        .anim-emblem {
          animation: emblemZoomBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .anim-emblem-float {
          animation: floatGentle 3.5s ease-in-out infinite 0.8s;
        }
        .anim-halo {
          animation: haloRotate 6s linear infinite;
        }
        .anim-beam {
          animation: beamGlow 2.5s ease-in-out infinite;
        }

        /* Sequential Text Appearances */
        .anim-step-1 { animation: elementPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s backwards; }
        .anim-step-2 { animation: elementPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.3s backwards; }
        .anim-step-3 { animation: elementPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.9s backwards; }
        .anim-step-4 { animation: elementPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 2.5s backwards; }
        .anim-step-5 { animation: elementPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 3.1s backwards; }
        .anim-step-6 { animation: elementPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 3.7s backwards; }

        .shimmer-text-navy {
          background: linear-gradient(90deg, #071A41 0%, #1557C0 40%, #071A41 80%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: textShimmer 3s linear infinite;
        }
        .shimmer-text-royal {
          background: linear-gradient(90deg, #1557C0 0%, #06B6D4 40%, #1557C0 80%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: textShimmer 3s linear infinite;
        }
      `}</style>

      {/* Ambient Lighting & Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-[#1557C0]/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-[#E7B93E]/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        
        {/* Soft Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1557C0 1.5px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Main Showcase Card */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-5 p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(20,85,217,0.2)]">
        
        {/* 1. FIRST: Top Accreditation Tag (0.8s) */}
        <div className="anim-step-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#071A41]/10 text-xs font-extrabold text-[#071A41] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#E7B93E] animate-pulse" />
          <span>Autonomous · NBA &amp; NAAC &apos;A&apos; Accredited Institution</span>
        </div>

        {/* FIRST: College Emblem zooms in first at 0.0s */}
        <div className="relative flex items-center justify-center my-1 anim-emblem anim-emblem-float">
          {/* Rotating Color Halo */}
          <div className="absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-[#1557C0]/40 via-[#22C7E8]/30 to-[#E7B93E]/40 blur-xl anim-halo" />
          <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border-2 border-[#1557C0]/30 animate-ping opacity-30" style={{ animationDuration: '2.5s' }} />
          
          <div className="relative w-28 h-28 sm:w-34 sm:h-34 rounded-full p-1 bg-gradient-to-tr from-[#E7B93E] via-white to-[#1557C0] shadow-2xl">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2.5 shadow-inner overflow-hidden">
              <Image
                src="/college-emblem.png"
                alt="V.S.B. Engineering College Logo"
                width={130}
                height={130}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* 2. THEN: Text Elements Appear One By One */}
        <div className="space-y-2.5 w-full">
          
          {/* 2.1: College Name (1.3s) */}
          <div className="anim-step-2 space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight drop-shadow-xs shimmer-text-navy">
              V.S.B. ENGINEERING COLLEGE
            </h1>
          </div>

          {/* 2.2: Autonomous Tag (1.9s) */}
          <div className="anim-step-3">
            <p className="text-xs font-black text-[#1557C0] tracking-widest uppercase flex items-center justify-center gap-1.5 bg-[#1557C0]/10 px-4 py-1 rounded-full border border-[#1557C0]/15 mx-auto w-fit shadow-xs">
              <GraduationCap className="w-4 h-4 text-[#E7B93E]" />
              <span>Autonomous Institution · Karur</span>
            </p>
          </div>

          {/* Animated Gold Center Line */}
          <div className="w-44 h-[2px] bg-gradient-to-r from-transparent via-[#E7B93E] to-transparent mx-auto anim-beam" />

          {/* 2.3: Welcome To (2.5s) */}
          <div className="anim-step-4 pt-0.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#1557C0]/10 border border-[#1557C0]/20 text-xs font-black uppercase text-[#1557C0] tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E7B93E] animate-spin" style={{ animationDuration: '3s' }} />
              <span>Welcome To</span>
            </div>
          </div>

          {/* 2.4: Department Name (3.1s) */}
          <div className="anim-step-5 space-y-0.5">
            <h2 className="text-base sm:text-lg font-black leading-snug">
              <span className="block text-slate-500 text-xs font-extrabold uppercase tracking-wider mb-0.5">Department of</span>
              <span className="block font-black shimmer-text-royal">
                ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
              </span>
            </h2>
          </div>

          {/* 2.5: Digital Academic Portal Badge (3.7s) */}
          <div className="anim-step-6 pt-0.5">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#071A41] text-white text-xs font-bold shadow-md">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Digital Academic Portal</span>
              </span>
            </div>
          </div>

        </div>

        {/* Progress Bar with 100% Status Indicator */}
        <div className="w-full max-w-md pt-1 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold px-1">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{progress < 100 ? 'Initializing Digital Portal...' : 'Ready · Online'}</span>
            </span>
            <span className="font-mono font-black text-[#1557C0] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 shadow-xs">
              {progress}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#071A41]/10 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#1557C0] via-cyan-500 to-[#E7B93E] rounded-full shadow-sm animate-progress-bar"
            />
          </div>
        </div>

      </div>
    </div>
  )
}
