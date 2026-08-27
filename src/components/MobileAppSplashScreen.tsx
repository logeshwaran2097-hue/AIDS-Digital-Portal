'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, Cpu, GraduationCap, ShieldCheck, Stars, Zap } from 'lucide-react'

export function MobileAppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 1. Rapid 0.5s progress sweep to 100%
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

    // 2. Play full 5.0-second cinematic showcase, then smooth blur-dissolve
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 5000)

    // 3. Completely unmount from DOM at 5.5s
    const unmountTimer = setTimeout(() => {
      setIsVisible(false)
    }, 5500)

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
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#EEF4FD] via-[#F8FAFD] to-[#FFFFFF] text-slate-800 select-none overflow-hidden cursor-pointer transition-all duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105 blur-sm transition-all duration-500' : 'opacity-100'
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
        @keyframes premiumPopIn {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.92);
            filter: blur(6px);
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
        @keyframes emblemCinematic {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-12deg);
            filter: drop-shadow(0 0 0px rgba(231,185,62,0));
          }
          60% {
            transform: scale(1.1) rotate(3deg);
            filter: drop-shadow(0 0 35px rgba(231,185,62,0.6));
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 15px 30px rgba(7,26,65,0.15));
          }
        }
        @keyframes float3D {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-8px) rotate(1.5deg) scale(1.02);
          }
        }
        @keyframes ringSpinClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ringSpinCounter {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes liquidMetallicShimmer {
          0% { background-position: -250% 0; }
          100% { background-position: 250% 0; }
        }
        @keyframes goldBeamGlow {
          0%, 100% {
            opacity: 0.3;
            transform: scaleX(0.85);
          }
          50% {
            opacity: 1;
            transform: scaleX(1.15);
            box-shadow: 0 0 18px rgba(231,185,62,0.8);
          }
        }
        @keyframes orbDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -20px) scale(1.12); }
        }

        .animate-progress-bar {
          animation: fillProgressBar 0.5s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
        }
        .anim-emblem-intro {
          animation: emblemCinematic 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .anim-emblem-float {
          animation: float3D 4s ease-in-out infinite 0.9s;
        }
        .anim-ring-cw {
          animation: ringSpinClockwise 8s linear infinite;
        }
        .anim-ring-ccw {
          animation: ringSpinCounter 10s linear infinite;
        }
        .anim-gold-beam {
          animation: goldBeamGlow 2.5s ease-in-out infinite;
        }
        .anim-orb-1 {
          animation: orbDrift 8s ease-in-out infinite;
        }
        .anim-orb-2 {
          animation: orbDrift 10s ease-in-out infinite reverse;
        }

        /* Sequential Timed Text Reveals */
        .anim-stage-1 { animation: premiumPopIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s backwards; }
        .anim-stage-2 { animation: premiumPopIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s backwards; }
        .anim-stage-3 { animation: premiumPopIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 2.0s backwards; }
        .anim-stage-4 { animation: premiumPopIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 2.6s backwards; }
        .anim-stage-5 { animation: premiumPopIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 3.2s backwards; }
        .anim-stage-6 { animation: premiumPopIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 3.8s backwards; }

        .shimmer-liquid-navy {
          background: linear-gradient(90deg, #071A41 0%, #1557C0 30%, #E7B93E 50%, #1557C0 70%, #071A41 100%);
          background-size: 250% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: liquidMetallicShimmer 4s linear infinite;
        }
        .shimmer-liquid-royal {
          background: linear-gradient(90deg, #1557C0 0%, #06B6D4 35%, #60A5FA 55%, #1557C0 85%);
          background-size: 250% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: liquidMetallicShimmer 3.5s linear infinite;
        }
      `}</style>

      {/* Background Cinematic Aura Light Mesh & Radial Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-36 -left-36 w-[36rem] h-[36rem] bg-gradient-to-br from-[#1557C0]/25 via-blue-300/15 to-transparent rounded-full blur-3xl anim-orb-1" />
        <div className="absolute -bottom-36 -right-36 w-[36rem] h-[36rem] bg-gradient-to-tl from-[#E7B93E]/25 via-amber-200/15 to-transparent rounded-full blur-3xl anim-orb-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-cyan-100/40 rounded-full blur-3xl" />
        
        {/* Futuristic Subtle Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #1557C0 1.5px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* Main Glassmorphic Showcase Card with 3D Depth */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-5 p-6 sm:p-9 rounded-[2.5rem] bg-white/85 backdrop-blur-2xl border border-white/95 shadow-[0_30px_70px_-15px_rgba(7,26,65,0.18),0_0_0_1px_rgba(255,255,255,0.8)_inset]">
        
        {/* 1. STAGE 1: Top Accreditation Tag (0.8s) */}
        <div className="anim-stage-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#071A41]/10 text-xs font-black text-[#071A41] shadow-xs backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-[#E7B93E] animate-pulse" />
          <span>Autonomous · NBA &amp; NAAC &apos;A&apos; Accredited Institution</span>
        </div>

        {/* 0.0s: College Emblem with Dual High-Tech Rotating Aura Rings */}
        <div className="relative flex items-center justify-center my-1 anim-emblem-intro anim-emblem-float">
          {/* Outer Cyan Ring (Clockwise) */}
          <div className="absolute w-44 h-44 sm:w-50 sm:h-50 rounded-full border-2 border-dashed border-[#06B6D4]/40 anim-ring-cw" />
          
          {/* Inner Gold Ring (Counter-Clockwise) */}
          <div className="absolute w-40 h-40 sm:w-46 sm:h-46 rounded-full border-2 border-dotted border-[#E7B93E]/50 anim-ring-ccw" />
          
          {/* Pulsing Backlight Glow */}
          <div className="absolute w-36 h-36 sm:w-42 sm:h-42 rounded-full bg-gradient-to-tr from-[#1557C0]/35 via-[#06B6D4]/30 to-[#E7B93E]/35 blur-xl animate-pulse" />
          
          {/* Emblem Container with Gold Rim */}
          <div className="relative w-28 h-28 sm:w-34 sm:h-34 rounded-full p-1.5 bg-gradient-to-tr from-[#E7B93E] via-white to-[#1557C0] shadow-[0_15px_35px_rgba(7,26,65,0.2)] hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2.5 shadow-inner overflow-hidden">
              <Image
                src="/college-emblem.png"
                alt="V.S.B. Engineering College Logo"
                width={130}
                height={130}
                className="w-full h-full object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>
        </div>

        {/* 2. STAGE REVEAL: Text Elements Appear Sequentially */}
        <div className="space-y-2.5 w-full">
          
          {/* 2.1: College Name (1.4s) */}
          <div className="anim-stage-2 space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight drop-shadow-xs shimmer-liquid-navy">
              V.S.B. ENGINEERING COLLEGE
            </h1>
          </div>

          {/* 2.2: Autonomous Tag (2.0s) */}
          <div className="anim-stage-3">
            <p className="text-xs font-black text-[#1557C0] tracking-widest uppercase flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#1557C0]/10 via-[#1557C0]/15 to-[#1557C0]/10 px-4 py-1 rounded-full border border-[#1557C0]/20 mx-auto w-fit shadow-xs">
              <GraduationCap className="w-4 h-4 text-[#E7B93E]" />
              <span>Autonomous Institution · Karur</span>
            </p>
          </div>

          {/* Animated Glowing Gold Center Separator Line */}
          <div className="w-48 h-[2.5px] bg-gradient-to-r from-transparent via-[#E7B93E] to-transparent mx-auto anim-gold-beam rounded-full" />

          {/* 2.3: Welcome To (2.6s) */}
          <div className="anim-stage-4 pt-0.5">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white border border-[#E7B93E]/40 text-xs font-black uppercase text-[#1557C0] tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#E7B93E] animate-spin" style={{ animationDuration: '3s' }} />
              <span>Welcome To</span>
            </div>
          </div>

          {/* 2.4: Department Name (3.2s) */}
          <div className="anim-stage-5 space-y-0.5">
            <h2 className="text-base sm:text-lg font-black leading-snug">
              <span className="block text-slate-500 text-xs font-extrabold uppercase tracking-wider mb-0.5">Department of</span>
              <span className="block font-black shimmer-liquid-royal">
                ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
              </span>
            </h2>
          </div>

          {/* 2.5: Digital Academic Portal Badge (3.8s) */}
          <div className="anim-stage-6 pt-0.5">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-[#071A41] to-[#1557C0] text-white text-xs font-bold shadow-lg border border-cyan-500/30">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Digital Academic Portal</span>
                <Stars className="w-3 h-3 text-[#E7B93E]" />
              </span>
            </div>
          </div>

        </div>

        {/* Progress Bar with 100% Status Beacon */}
        <div className="w-full max-w-md pt-1.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold px-1">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span>{progress < 100 ? 'Initializing Digital Portal...' : 'System Ready · Online'}</span>
            </span>
            <span className="font-mono font-black text-[#1557C0] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 shadow-xs">
              {progress}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#071A41]/10 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#1557C0] via-[#06B6D4] to-[#E7B93E] rounded-full shadow-sm animate-progress-bar"
            />
          </div>
        </div>

      </div>
    </div>
  )
}
