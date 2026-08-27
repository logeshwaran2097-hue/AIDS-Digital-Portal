'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, Cpu, GraduationCap, ShieldCheck, Stars, Award, Gem } from 'lucide-react'

export function MobileAppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // 5.0-second ultra-luxury cinematic presentation, then smooth dissolve
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 5000)

    // Unmount from DOM at 5.5s
    const unmountTimer = setTimeout(() => {
      setIsVisible(false)
    }, 5500)

    return () => {
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
        isFadingOut ? 'opacity-0 pointer-events-none scale-105 blur-md transition-all duration-500' : 'opacity-100'
      }`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style jsx>{`
        @keyframes luxuryEntrance {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(0.92);
            filter: blur(8px);
          }
          70% {
            transform: translateY(-3px) scale(1.02);
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
            filter: blur(0px);
          }
        }
        @keyframes crest3D {
          0% {
            opacity: 0;
            transform: scale(0.4) rotate(-15deg);
            filter: drop-shadow(0 0 0px rgba(231,185,62,0));
          }
          60% {
            transform: scale(1.12) rotate(3deg);
            filter: drop-shadow(0 0 40px rgba(231,185,62,0.7));
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 20px 35px rgba(7,26,65,0.18));
          }
        }
        @keyframes luxuryFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-10px) rotate(1.5deg) scale(1.03);
          }
        }
        @keyframes celestialSpinClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes celestialSpinCounter {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes liquidGoldNavy {
          0% { background-position: -250% 0; }
          100% { background-position: 250% 0; }
        }
        @keyframes sapphireBeam {
          0%, 100% {
            opacity: 0.35;
            transform: scaleX(0.85);
          }
          50% {
            opacity: 1;
            transform: scaleX(1.15);
            box-shadow: 0 0 20px rgba(231,185,62,0.85);
          }
        }
        @keyframes ambientNebula {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -25px) scale(1.15); }
        }
        @keyframes starGlint {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
        }

        .anim-crest-intro {
          animation: crest3D 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .anim-crest-float {
          animation: luxuryFloat 4.5s ease-in-out infinite 1s;
        }
        .anim-ring-primary {
          animation: celestialSpinClockwise 9s linear infinite;
        }
        .anim-ring-secondary {
          animation: celestialSpinCounter 12s linear infinite;
        }
        .anim-gold-beam {
          animation: sapphireBeam 2.5s ease-in-out infinite;
        }
        .anim-nebula-1 {
          animation: ambientNebula 9s ease-in-out infinite;
        }
        .anim-nebula-2 {
          animation: ambientNebula 11s ease-in-out infinite reverse;
        }
        .anim-star-glint {
          animation: starGlint 3s ease-in-out infinite;
        }

        /* Sequential Luxury Stage Reveals */
        .anim-stage-1 { animation: luxuryEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s backwards; }
        .anim-stage-2 { animation: luxuryEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s backwards; }
        .anim-stage-3 { animation: luxuryEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 2.0s backwards; }
        .anim-stage-4 { animation: luxuryEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 2.6s backwards; }
        .anim-stage-5 { animation: luxuryEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 3.2s backwards; }
        .anim-stage-6 { animation: luxuryEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 3.8s backwards; }

        .shimmer-liquid-gold {
          background: linear-gradient(90deg, #071A41 0%, #1557C0 25%, #E7B93E 50%, #1557C0 75%, #071A41 100%);
          background-size: 250% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: liquidGoldNavy 4s linear infinite;
        }
        .shimmer-sapphire-cyan {
          background: linear-gradient(90deg, #1557C0 0%, #06B6D4 30%, #60A5FA 50%, #1557C0 80%);
          background-size: 250% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: liquidGoldNavy 3.5s linear infinite;
        }
      `}</style>

      {/* Cinematic Ambient Glow & Golden Nebula Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-gradient-to-br from-[#1557C0]/25 via-blue-300/15 to-transparent rounded-full blur-3xl anim-nebula-1" />
        <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-gradient-to-tl from-[#E7B93E]/25 via-amber-200/15 to-transparent rounded-full blur-3xl anim-nebula-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-cyan-100/40 rounded-full blur-3xl" />
        
        {/* Soft Radial Grid Matrix */}
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #1557C0 1.5px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* Ultra-Luxury Master Showcase Card (Zero Loading Bar) */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-5 sm:space-y-6 p-7 sm:p-10 rounded-[2.75rem] bg-white/85 backdrop-blur-2xl border border-white/95 shadow-[0_35px_80px_-15px_rgba(7,26,65,0.2),0_0_0_1.5px_rgba(255,255,255,0.85)_inset]">
        
        {/* STAGE 1: Platinum & Gold Accreditation Shield (0.8s) */}
        <div className="anim-stage-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-[#071A41]/10 text-xs font-black text-[#071A41] shadow-xs backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-[#E7B93E] animate-pulse" />
          <span>Autonomous · NBA &amp; NAAC &apos;A&apos; Accredited Institution</span>
        </div>

        {/* 0.0s: 3-Layer Celestial Master Emblem */}
        <div className="relative flex items-center justify-center my-3 anim-crest-intro anim-medallion-levitate">
          {/* Layer 3: Outer Celestial Dashed Cyan Tech Ring */}
          <div 
            className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-dashed border-[#06B6D4]/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-spin" 
            style={{ animationDuration: '14s' }} 
          />

          {/* Layer 2: Middle Sapphire-Cyan Glass Orbit Halo */}
          <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border-[1.5px] border-[#1557C0]/35 bg-gradient-to-tr from-cyan-100/40 via-blue-100/25 to-amber-100/35 shadow-[0_0_25px_rgba(21,87,192,0.25)] anim-solar-corona" />
          
          {/* Layer 1: Inner Circular Gold Medallion with Specular Sheen */}
          <div className="relative w-26 h-26 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-tr from-[#E7B93E] via-[#FFF2B2] to-[#B8860B] shadow-[0_20px_45px_rgba(7,26,65,0.25),0_0_30px_rgba(231,185,62,0.6)] ring-3 ring-white/90 overflow-hidden hover:scale-105 transition-transform duration-500">
            {/* Specular Liquid Gold Sweep */}
            <div className="anim-gold-sheen" />

            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2 shadow-inner overflow-hidden relative z-10">
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

          {/* Sparkling Diamond Glint */}
          <div className="absolute top-0 right-1/2 translate-x-12 sm:translate-x-16 -translate-y-2 text-[#E7B93E] anim-diamond-twinkle pointer-events-none">
            <Sparkles className="w-5 h-5 text-[#E7B93E] drop-shadow-[0_0_12px_rgba(231,185,62,1)]" />
          </div>
        </div>

        {/* STAGE REVEALS: Pure Royal & Academic Branding */}
        <div className="space-y-3 w-full">
          
          {/* STAGE 2: College Master Name (1.4s) */}
          <div className="anim-stage-2 space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight drop-shadow-xs shimmer-liquid-gold">
              V.S.B. ENGINEERING COLLEGE
            </h1>
          </div>

          {/* STAGE 3: Autonomous Karur Tag (2.0s) */}
          <div className="anim-stage-3">
            <p className="text-xs font-black text-[#1557C0] tracking-widest uppercase flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#1557C0]/10 via-[#1557C0]/15 to-[#1557C0]/10 px-4 py-1 rounded-full border border-[#1557C0]/20 mx-auto w-fit shadow-xs">
              <GraduationCap className="w-4 h-4 text-[#E7B93E]" />
              <span>Autonomous Institution · Karur</span>
            </p>
          </div>

          {/* Glowing Golden Light Beam Separator */}
          <div className="w-52 h-[2.5px] bg-gradient-to-r from-transparent via-[#E7B93E] to-transparent mx-auto anim-gold-beam rounded-full" />

          {/* STAGE 4: Gold Star "Welcome To" Pill (2.6s) */}
          <div className="anim-stage-4 pt-0.5">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white border border-[#E7B93E]/40 text-xs font-black uppercase text-[#1557C0] tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#E7B93E] animate-spin" style={{ animationDuration: '3s' }} />
              <span>Welcome To</span>
            </div>
          </div>

          {/* STAGE 5: Department Title with Sapphire Cyan Holographic Glow (3.2s) */}
          <div className="anim-stage-5 space-y-0.5">
            <h2 className="text-base sm:text-lg font-black leading-snug">
              <span className="block text-slate-500 text-xs font-extrabold uppercase tracking-wider mb-0.5">Department of</span>
              <span className="block font-black shimmer-sapphire-cyan text-base sm:text-xl">
                ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
              </span>
            </h2>
          </div>

          {/* Bottom System Status Bar */}
          <div className="w-full pt-4 space-y-1.5 border-t border-slate-100/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-[#071A41]">System Ready · Online</span>
              </span>
              <span className="font-black text-[#1557C0] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[10px]">
                100%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden p-0.2">
              <div className="h-full bg-gradient-to-r from-[#1557C0] via-cyan-400 to-[#E7B93E] rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
