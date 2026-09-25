'use client'

import React from 'react'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface VSBAnimatedEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showSparkle?: boolean
  priority?: boolean
  hoverLift?: boolean
}

const SIZE_MAP = {
  sm: {
    container: 'w-8 h-8',
    orbitPad: 'p-[1.5px]',
    imageSize: 28,
    sparklePos: '-top-1 -right-1',
    sparkleSize: 'w-2.5 h-2.5',
    halo: 'w-10 h-10',
  },
  md: {
    container: 'w-11 h-11',
    orbitPad: 'p-[2px]',
    imageSize: 40,
    sparklePos: '-top-1 -right-1',
    sparkleSize: 'w-3 h-3',
    halo: 'w-14 h-14',
  },
  lg: {
    container: 'w-16 h-16',
    orbitPad: 'p-[2.5px]',
    imageSize: 58,
    sparklePos: '-top-1 -right-1',
    sparkleSize: 'w-3.5 h-3.5',
    halo: 'w-20 h-20',
  },
  xl: {
    container: 'w-22 h-22 sm:w-26 sm:h-26',
    orbitPad: 'p-[3px]',
    imageSize: 92,
    sparklePos: 'top-0 right-1',
    sparkleSize: 'w-4 h-4',
    halo: 'w-28 h-28 sm:w-32 sm:h-32',
  },
}

export function VSBAnimatedEmblem({
  size = 'md',
  className,
  showSparkle = true,
  priority = false,
  hoverLift = true,
}: VSBAnimatedEmblemProps) {
  const config = SIZE_MAP[size]

  return (
    <div
      className={cn(
        'relative shrink-0 flex items-center justify-center select-none group',
        config.container,
        className
      )}
    >
      {/* 1. Pulsing Ambient Solar Aura */}
      <div
        className={cn(
          'absolute rounded-full bg-gradient-to-tr from-[#E7B93E]/30 via-[#22C7E8]/20 to-[#E7B93E]/35 blur-md pointer-events-none transition-opacity duration-300',
          config.halo,
          'anim-solar-corona'
        )}
      />

      {/* 2. Rotating Kinetic Radiant Gold Ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          config.orbitPad,
          'bg-[conic-gradient(from_0deg,#B8860B_0%,#FFF4BD_25%,#E7B93E_50%,#FFF4BD_75%,#B8860B_100%)]',
          'shadow-[0_0_14px_rgba(231,185,62,0.45)] ring-1.5 ring-white/40',
          'animate-[spin_7s_linear_infinite] group-hover:animate-[spin_3.5s_linear_infinite]',
          'transition-all duration-300'
        )}
      />

      {/* 3. Pure White Inner Housing with Gold Bezel */}
      <div
        className={cn(
          'relative z-10 w-full h-full rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden',
          'border border-amber-300/80 shadow-[inset_0_1px_4px_rgba(0,0,0,0.12)]',
          hoverLift && 'transition-transform duration-300 group-hover:scale-105'
        )}
      >
        {/* Specular Liquid Sheen Glint Sweep */}
        <div className="anim-gold-sheen rounded-full" />

        {/* 4. Authentic Round V.S.B. College Crest */}
        <div className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden">
          <Image
            src="/college-emblem.png"
            alt="V.S.B. Engineering College Official Crest"
            width={config.imageSize}
            height={config.imageSize}
            className="w-full h-full object-contain rounded-full drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        </div>
      </div>

      {/* 5. Sparkling Diamond Glint Accent */}
      {showSparkle && (
        <div
          className={cn(
            'absolute z-20 pointer-events-none text-[#FACC15] drop-shadow-[0_0_8px_rgba(250,204,21,0.9)] anim-diamond-twinkle',
            config.sparklePos
          )}
        >
          <Sparkles className={config.sparkleSize} />
        </div>
      )}
    </div>
  )
}
export default VSBAnimatedEmblem
