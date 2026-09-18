'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-[0_4px_24px_-4px_rgba(7,26,61,0.05)] dark:bg-gradient-to-br dark:from-[#0E1F46]/80 dark:via-[#091636]/90 dark:to-[#040C22]/98 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(0,0,0,0.65)] transition-all duration-300 hover:shadow-[0_12px_32px_-6px_rgba(20,85,217,0.18)] dark:hover:border-cyan-400/40 dark:hover:shadow-[0_20px_50px_rgba(14,58,148,0.35)] hover:-translate-y-0.5',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg sm:text-xl font-extrabold text-[#071A3D] dark:text-white leading-tight tracking-tight', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0 text-slate-700 dark:text-slate-200', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }