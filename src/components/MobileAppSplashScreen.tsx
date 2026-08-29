'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, GraduationCap, ShieldCheck, Cpu, ArrowRight } from 'lucide-react'

export function MobileAppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // 4.2-second ultra-luxury cinematic presentation, then smooth dissolve
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 4200)

    // Unmount from DOM at 4.8s
    const unmountTimer = setTimeout(() => {
      setIsVisible(false)
    }, 4800)

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
    }, 100)
  }

  return (
    <div
      onClick={handleInstantDismiss}
      className={`fixed inset-0 z-[99999] flex flex-col justify-between items-center text-slate-800 select-none overflow-hidden cursor-pointer transition-all duration-700 ${
        isFadingOut
          ? 'opacity-0 pointer-events-none scale-105 blur-xl'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #FFFFFF 0%, #F3F7FD 45%, #E5EDF9 80%, #D8E4F5 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style jsx>{`
        @keyframes fullScreenIntro {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
            filter: blur(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
            filter: blur(0px);
          }
        }
        @keyframes crestZoomIn {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(-20deg);
            filter: drop-shadow(0 0 0px rgba(231,185,62,0));
          }
          60% {
            transform: scale(1.1) rotate(3deg);
            filter: drop-shadow(0 0 50px rgba(231,185,62,0.8));
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 25px 50px rgba(7,26,65,0.22));
          }
        }
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(1deg);
          }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinSlowReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulseAura {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.18);
            opacity: 0.85;
          }
        }
        @keyframes goldShimmer {
          0% { background-position: -300% 0; }
          100% { background-position: 300% 0; }
        }
        @keyframes lightBeamSweep {
          0%, 100% {
            opacity: 0.4;
            transform: scaleX(0.7);
          }
          50% {
            opacity: 1;
            transform: scaleX(1.15);
            box-shadow: 0 0 35px rgba(231,185,62,0.9);
          }
        }
        @keyframes cosmicPulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.3); opacity: 0.55; }
        }

        .anim-crest-intro {
          animation: crestZoomIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .anim-crest-float {
          animation: gentleFloat 5s ease-in-out infinite 1.1s;
        }
        .anim-ring-spin {
          animation: spinSlow 12s linear infinite;
        }
        .anim-ring-spin-reverse {
          animation: spinSlowReverse 18s linear infinite;
        }
        .anim-gold-beam {
          animation: lightBeamSweep 2.8s ease-in-out infinite;
        }
        .anim-pulse-aura {
          animation: pulseAura 4s ease-in-out infinite;
        }
        .anim-cosmic-glow {
          animation: cosmicPulse 6s ease-in-out infinite;
        }

        /* Sequential Full Screen Staged Reveals */
        .stage-1 { animation: fullScreenIntro 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s backwards; }
        .stage-2 { animation: fullScreenIntro 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s backwards; }
        .stage-3 { animation: fullScreenIntro 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s backwards; }
        .stage-4 { animation: fullScreenIntro 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.5s backwards; }
        .stage-5 { animation: fullScreenIntro 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.9s backwards; }
        .stage-6 { animation: fullScreenIntro 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2.3s backwards; }

        .text-gold-navy-shimmer {
          background: linear-gradient(90deg, #071A41 0%, #1557C0 25%, #E7B93E 50%, #1557C0 75%, #071A41 100%);
          background-size: 300% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: goldShimmer 5s linear infinite;
        }

        .text-sapphire-cyan-shimmer {
          background: linear-gradient(90deg, #0D3E9E 0%, #06B6D4 30%, #3B82F6 50%, #0D3E9E 80%);
          background-size: 280% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: goldShimmer 4s linear infinite;
        }
      `}</style>

      {/* FULL SCREEN DYNAMIC BACKGROUND AMBIENT PARTICLES & NEBULA AURAS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Massive Ambient Radiant Glow Spheres */}
        <div className="absolute -top-32 -left-32 w-[55rem] h-[55rem] bg-gradient-to-br from-[#1557C0]/20 via-blue-200/25 to-transparent rounded-full blur-[100px] anim-cosmic-glow" />
        <div className="absolute -bottom-32 -right-32 w-[60rem] h-[60rem] bg-gradient-to-tl from-[#E7B93E]/20 via-amber-100/30 to-transparent rounded-full blur-[120px] anim-cosmic-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[45rem] bg-cyan-200/25 rounded-full blur-[90px] anim-pulse-aura" />
        
        {/* Full Viewport Geometric Tech Grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #1557C0 1.5px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Ambient Top Light Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[350px] bg-gradient-to-b from-[#1557C0]/10 via-cyan-100/10 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* TOP HEADER: ACCREDITATION & INSTITUTION BADGE (Seamless, No Box) */}
      <header className="relative z-10 w-full pt-8 sm:pt-12 px-6 flex flex-col items-center text-center">
        <div className="stage-1 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 backdrop-blur-md border border-[#1557C0]/15 text-xs sm:text-sm font-bold text-[#071A41] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#E7B93E] animate-pulse" />
          <span>Autonomous · NBA &amp; NAAC &apos;A&apos; Accredited Institution</span>
        </div>
      </header>

      {/* CENTER: MAJESTIC FULL-SCREEN HERO & CELESTIAL MEDALLION */}
      <main className="relative z-10 w-full max-w-5xl px-6 my-auto flex flex-col items-center text-center">
        
        {/* Celestial Master Emblem (Full Radiant Aura) */}
        <div className="relative flex items-center justify-center mb-6 sm:mb-8 anim-crest-intro anim-crest-float">
          {/* Layer 4: Outer Glowing Nebula Cloud */}
          <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-cyan-300/30 via-blue-400/20 to-amber-300/30 blur-2xl anim-pulse-aura" />

          {/* Layer 3: Tech Dashed Celestial Orbit Ring */}
          <div
            className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-[#06B6D4]/50 anim-ring-spin shadow-[0_0_30px_rgba(6,182,212,0.3)]"
          />

          {/* Layer 2: Middle Sapphire-Gold Glass Halo */}
          <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[2px] border-[#1557C0]/30 bg-gradient-to-tr from-white/60 via-blue-50/40 to-amber-50/50 backdrop-blur-md anim-ring-spin-reverse" />
          
          {/* Layer 1: Core Gold Medallion with College Emblem */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-2 bg-gradient-to-tr from-[#E7B93E] via-[#FFF3B8] to-[#B8860B] shadow-[0_25px_60px_rgba(7,26,65,0.25),0_0_40px_rgba(231,185,62,0.7)] ring-4 ring-white/90 overflow-hidden">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-3 shadow-inner overflow-hidden relative z-10">
              <Image
                src="/college-emblem.png"
                alt="V.S.B. Engineering College Logo"
                width={150}
                height={150}
                className="w-full h-full object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>

          {/* Sparkling Diamond Stars */}
          <div className="absolute -top-2 right-4 text-[#E7B93E] animate-bounce pointer-events-none">
            <Sparkles className="w-6 h-6 text-[#E7B93E] drop-shadow-[0_0_15px_rgba(231,185,62,1)]" />
          </div>
        </div>

        {/* FULL SCREEN SEAMLESS TYPOGRAPHY (NO CARD / NO BOX) */}
        <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto">
          
          {/* Main College Heading */}
          <div className="stage-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-gold-navy-shimmer drop-shadow-sm leading-tight">
              V.S.B. ENGINEERING COLLEGE
            </h1>
          </div>

          {/* Autonomous Institution Tag */}
          <div className="stage-3">
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#1557C0]/10 text-[#1557C0] text-xs sm:text-sm font-extrabold tracking-widest uppercase border border-[#1557C0]/20 shadow-xs">
              <GraduationCap className="w-4 h-4 text-[#E7B93E]" />
              <span>Autonomous Institution · Karur</span>
            </div>
          </div>

          {/* Golden Light Beam Separator */}
          <div className="w-64 sm:w-96 h-[2.5px] bg-gradient-to-r from-transparent via-[#E7B93E] to-transparent mx-auto anim-gold-beam rounded-full" />

          {/* "Welcome To" Pill */}
          <div className="stage-4 pt-1">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/80 border border-[#E7B93E]/50 text-xs sm:text-sm font-extrabold uppercase text-[#1557C0] tracking-wider shadow-xs backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-[#E7B93E] animate-spin" style={{ animationDuration: '3s' }} />
              <span>Welcome To</span>
            </div>
          </div>

          {/* Department Name */}
          <div className="stage-5 space-y-1">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-500">
              Department of
            </p>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-sapphire-cyan-shimmer tracking-tight">
              ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE
            </h2>
          </div>

        </div>

      </main>

      {/* BOTTOM FOOTER STATUS BAR (Wide Full-Bleed Elegant Indicator) */}
      <footer className="relative z-10 w-full max-w-xl pb-8 sm:pb-12 px-6 space-y-2 text-center stage-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-2">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-4.5" />
            <span className="font-extrabold text-[#071A41]">System Ready · Online</span>
          </span>
          <span className="font-mono font-black text-[#1557C0] bg-white/80 px-2.5 py-0.5 rounded-full border border-blue-100 text-xs shadow-xs">
            100%
          </span>
        </div>

        {/* Shimmering Full Status Progress Line */}
        <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
          <div
            className="h-full bg-gradient-to-r from-[#1557C0] via-cyan-400 to-[#E7B93E] rounded-full animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            style={{ width: '100%' }}
          />
        </div>

        <p className="text-[11px] text-slate-400 font-medium pt-1">
          Click anywhere to enter portal
        </p>
      </footer>
    </div>
  )
}
