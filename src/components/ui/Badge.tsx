'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { getStatusColor, getRoleColor } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'status' | 'role' | 'gold' | 'cyan'
  status?: string
  role?: string
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', status, role, children, ...props }, ref) => {
    let variantClass = ''
    
    if (variant === 'status' && status) {
      variantClass = getStatusColor(status)
    } else if (variant === 'role' && role) {
      variantClass = getRoleColor(role)
    } else {
      const variants: Record<string, string> = {
        default: 'bg-gradient-to-r from-[#071A3D] to-[#0A2248] text-white border border-white/15 dark:from-[#1748A8]/40 dark:to-[#0D2D6C]/60 dark:text-cyan-200 dark:border-cyan-400/30 shadow-xs',
        secondary: 'bg-gradient-to-r from-[#1455D9] to-[#2563EB] text-white shadow-xs',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30 shadow-xs',
        warning: 'bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30 shadow-xs',
        danger: 'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/30 shadow-xs',
        info: 'bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-500/15 dark:text-cyan-300 dark:border-blue-400/30 shadow-xs',
        gold: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border border-amber-300/80 dark:bg-gradient-to-r dark:from-[#D4AF37]/25 dark:to-[#AA820A]/20 dark:text-[#FDE68A] dark:border-[#D4AF37]/40 shadow-xs',
        cyan: 'bg-cyan-50 text-cyan-800 border border-cyan-200/80 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-400/30 shadow-xs',
      }
      variantClass = variants[variant] || variants.default
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide transition-all duration-200',
          variantClass,
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }