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
        'relative shrink-0 flex items-center justify-center select-none',
        config.container,
        className
      )}
    >
      {/* Institutional Crest Housing */}
      <div
        className={cn(
          'relative z-10 w-full h-full rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden',
          'border border-[#E5E7EB] shadow-xs',
          hoverLift && 'transition-transform duration-200 hover:scale-105'
        )}
      >
        <div className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden">
          <Image
            src="/college-emblem.png"
            alt="V.S.B. Engineering College Official Crest"
            width={config.imageSize}
            height={config.imageSize}
            className="w-full h-full object-contain rounded-full"
            priority={priority}
          />
        </div>
      </div>
    </div>
  )
}
export default VSBAnimatedEmblem
