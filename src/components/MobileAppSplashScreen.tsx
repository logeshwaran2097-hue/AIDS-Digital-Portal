'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, Cpu, GraduationCap, ShieldCheck } from 'lucide-react'

export function MobileAppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 1. Quick progress fill from 0% -> 100% in exactly 0.5 seconds
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

    // 2. 5-Second Animated Showcase until 5.0s, then seamless transition
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 5000)

    // 3. Completely unmount from DOM at 5.4 seconds
    const unmountTimer = setTimeout(() => {
      setIsVisible(false)
    }, 5400)

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
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#EBF3FC] via-[#F4F8FD] to-[#FFFFFF] text-slate-800 select-none overflow-hidden cursor-pointer transition-all duration-400 ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105 transition-all duration-400' : 'opacity-100'
      }`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style jsx>{`
        @keyframes fillProgressBar {
          0% {
            width: 0%;
          }
          30% {
            width: 45%;
          }
          70% {
            width: 85%;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes floatGentle {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-6px) scale(1.02);
          }
        }
        @keyframes haloPulseRotate {
          0% {
            transform: rotate(0deg) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: rotate(180deg) scale(1.08);
            opacity: 0.9;
          }
          100% {
            transform: rotate(360deg) scale(1);
            opacity: 0.6;
          }
        }
        @keyframes textShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes beamGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scaleX(0.9);
          }
          50% {
            opacity: 1;
            transform: scaleX(1.1);
          }
        }
        .animate-progress-bar {
          animation: fillProgressBar 0.5s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
        }
        .animate-emblem-float {
          animation: floatGentle 3s ease-in-out infinite;
        }
        .animate-halo-rotate {
          animation: haloPulseRotate 6s linear infinite;
        }
        .animate-beam-glow {
          animation: beamGlow 2.5s ease-in-out infinite;
        }
        .shimmer-text-navy {
          background: linear-gradient(90deg, #071A41 0%, #1557C0 35%, #071A41 70%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: textShimmer 3.5s linear infinite;
        }
        .shimmer-text-royal {
          background: linear-gradient(90deg, #1557C0 0%, #22C7E8 35%, #1557C0 70%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: textShimmer 3s linear infinite;
        }
      `}</style>

      {/* Background Ambient Lighting & Glow Orbs */}
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

      {/* Main Centered Showcase Card with Animated Shadow & Micro-float */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-5 sm:space-y-6 p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(20,85,217,0.18)] animate-fade-in">
        
        {/* Top Accreditation Tag with Pulsing Gold Shield */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#071A41]/10 text-xs font-extrabold text-[#071A41] shadow-xs animate-bounce" style={{ animationDuration: '3s' }}>
          <ShieldCheck className="w-4 h-4 text-[#E7B93E] animate-pulse" />
          <span>Autonomous · NBA &amp; NAAC &apos;A&apos; Accredited Institution</span>
        </div>

        {/* Circular Emblem with Dynamic Multi-Layered Rotating Glow Halo */}
        <div className="relative flex items-center justify-center my-1 animate-emblem-float">
          {/* Rotating Color Halo */}
          <div className="absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-[#1557C0]/40 via-[#22C7E8]/30 to-[#E7B93E]/40 blur-xl animate-halo-rotate" />
          <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border-2 border-[#1557C0]/30 animate-ping opacity-30" style={{ animationDuration: '2.5s' }} />
          
          <div className="relative w-28 h-28 sm:w-34 sm:h-34 rounded-full p-1 bg-gradient-to-tr from-[#E7B93E] via-white to-[#1557C0] shadow-2xl transition-transform duration-700 hover:scale-105">
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

        {/* College & Department Branding Titles with Shimmering Metallic Gradients */}
        <div className="space-y-3 w-full">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight drop-shadow-xs shimmer-text-navy">
              V.S.B. ENGINEERING COLLEGE
            </h1>
            <p className="text-xs font-black text-[#1557C0] tracking-widest uppercase flex items-center justify-center gap-1.5 bg-[#1557C0]/10 px-4 py-1 rounded-full border border-[#1557C0]/15 mx-auto w-fit shadow-xs">
              <GraduationCap className="w-4 h-4 text-[#E7B93E]" />
              <span>Autonomous Institution · Karur</span>
            </p>
          </div>

          {/* Animated Glowing Gold Center Separator Line */}
          <div className="w-44 h-[2px] bg-gradient-to-r from-transparent via-[#E7B93E] to-transparent mx-auto animate-beam-glow" />

          {/* Department Name with Shimmer & Spinning Gold Sparkles */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#1557C0]/10 border border-[#1557C0]/20 text-xs font-black uppercase text-[#1557C0] tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E7B93E] animate-spin" style={{ animationDuration: '3s' }} />
              <span>Welcome To</span>
            </div>

            <h2 className="text-base sm:text-lg font-black leading-snug">
              <span className="block text-slate-500 text-xs font-extrabold uppercase tracking-wider mb-0.5">Department of</span>
              <span className="block font-black shimmer-text-royal">
                ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
              </span>
            </h2>

            <div className="flex items-center justify-center pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#071A41] text-white text-xs font-bold shadow-md hover:scale-105 transition-transform">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Digital Academic Portal</span>
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Directly Below with Green Status Beacon */}
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
