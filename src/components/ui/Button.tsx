'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-0.5 active:scale-[0.97] transform-gpu will-change-transform cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-[#1C4FA8] via-[#0E357E] to-[#071C48] text-white border border-[#D4AF37]/45 shadow-[0_8px_22px_-4px_rgba(7,26,61,0.7),inset_0_1.5px_1px_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 hover:border-[#F5CE62]/80 hover:shadow-[0_12px_28px_-4px_rgba(20,85,217,0.55),0_0_20px_rgba(212,175,55,0.35)] hover:brightness-110 text-shadow-sm',
        destructive:
          'bg-gradient-to-b from-[#E11D48] via-[#BE123C] to-[#881337] text-white border border-rose-300/40 shadow-[0_8px_22px_-4px_rgba(225,29,72,0.65),inset_0_1.5px_1px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(225,29,72,0.85)] hover:brightness-110',
        outline:
          'border border-white/20 bg-white/[0.06] backdrop-blur-md text-slate-100 shadow-[0_6px_18px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.22)] hover:bg-white/[0.12] hover:border-amber-400/60 hover:text-amber-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(212,175,55,0.25)]',
        secondary:
          'bg-gradient-to-b from-[#2D7BFF] via-[#165CE8] to-[#0B40BC] text-white border border-blue-300/50 shadow-[0_8px_24px_-4px_rgba(20,85,217,0.65),inset_0_1.5px_1px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_12px_32px_-4px_rgba(20,85,217,0.85),0_0_24px_rgba(56,189,248,0.45)] hover:brightness-110',
        gold:
          'bg-gradient-to-b from-[#FFF6D1] via-[#F5CE62] to-[#B38F14] text-[#050D1E] font-black border border-white/80 shadow-[0_8px_24px_-4px_rgba(212,175,55,0.65),0_0_16px_rgba(212,175,55,0.3),inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(115,87,6,0.5)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-4px_rgba(212,175,55,0.9),0_0_28px_rgba(245,206,98,0.55)] hover:border-white',
        ghost:
          'bg-transparent text-slate-200 hover:bg-white/10 hover:text-white hover:border hover:border-white/10 transition-colors',
        link:
          'bg-transparent text-[#22C7E8] underline-offset-4 hover:underline hover:text-amber-300 transition-colors p-0 h-auto font-semibold',
        cyan:
          'bg-gradient-to-b from-[#5CE6FF] via-[#00C2E8] to-[#007A99] text-[#021024] font-black border border-cyan-100/70 shadow-[0_8px_24px_-4px_rgba(6,182,212,0.6),inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-4px_rgba(6,182,212,0.8),0_0_24px_rgba(0,245,255,0.5)]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8.5 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-7 text-sm sm:text-base',
        xl: 'h-12.5 rounded-2xl px-9 text-base sm:text-lg',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }